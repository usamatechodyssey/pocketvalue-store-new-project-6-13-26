
// 📂 src/app/features/admin/operational-intelligence/actions/getOperationalIntelligence.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ SINGLE SOURCE OF TRUTH (Verified from analytics.ts)
import { REVENUE_STATUSES, LIMBO_STATUSES } from "@/app/shared/constants/analytics";

// ✅ ENTERPRISE FIX: Trend Model
import { OperationalTrend } from "@/models/OperationalTrend";

// ✅ ENTERPRISE FIX: Safe cache utilities
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ ENTERPRISE FIX: Proper Type Interfaces
// ================================================================
export interface OperationalIntelligenceResponse {
  totalOrders: number;
  deliveredCount: number;
  cancelledCount: number;
  limboRevenue: number;
  pendingCount: number;
  fulfillmentRate: number;
  leakageRate: number;
  statusBreakdown: Record<string, number>;
  limboOrders: any[];
  totalLimboCount: number;
  totalLimboPages: number;
  currentLimboPage: number;
  generatedAt: string;
  thresholdAlert?: {
    triggered: boolean;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  };
}

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE (Lua Script — for Cache Stampede)
// ================================================================
const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
  try {
    const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
    if (result === 1) console.log(`🔓 Operational Lock released (${requestId}).`);
  } catch (error) {
    console.error("Operational Lock release error:", error);
  }
};

// ================================================================
// 🔨 HELPER: Upsert Daily Trend (Bound to audit date range)
// ================================================================
async function upsertOperationalTrend(
  trendDate: Date,
  data: {
    totalOrders: number;
    deliveredCount: number;
    cancelledCount: number;
    limboRevenue: number;
    pendingCount: number;
    fulfillmentRate: number;
    leakageRate: number;
  }
) {
  try {
    const dateKey = format(trendDate, "yyyy-MM-dd");
    await OperationalTrend.findOneAndUpdate(
      { _id: dateKey },
      {
        date: dateKey,
        totalOrders: data.totalOrders,
        deliveredCount: data.deliveredCount,
        cancelledCount: data.cancelledCount,
        limboRevenue: data.limboRevenue,
        pendingCount: data.pendingCount,
        fulfillmentRate: data.fulfillmentRate,
        leakageRate: data.leakageRate,
        generatedAt: new Date(),
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("⚠️ Failed to upsert operational trend:", error);
  }
}

interface DateRange {
  from: Date;
  to: Date;
}

// ================================================================
// 🚀 MAIN FUNCTION (Enterprise Ready — 60 sec TTL)
// ================================================================
export async function getOperationalIntelligencePayload(
  range: DateRange,
  page: number = 1,
  limit: number = 15
): Promise<OperationalIntelligenceResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_operational_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<OperationalIntelligenceResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Operational Intelligence (Page ${page})`);
      return parsed;
    }

    // ✅ 2. Cache Stampede Protection (SETNX Lock)
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log(`⏳ Cache Stampede Detected. Waiting 500ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<OperationalIntelligenceResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log(`⚡ Served stale operational cache.`);
        return retryParsed;
      }
      // Return empty fallback if no cache available
      return {
        totalOrders: 0,
        deliveredCount: 0,
        cancelledCount: 0,
        limboRevenue: 0,
        pendingCount: 0,
        fulfillmentRate: 0,
        leakageRate: 0,
        statusBreakdown: {},
        limboOrders: [],
        totalLimboCount: 0,
        totalLimboPages: 0,
        currentLimboPage: page,
        generatedAt: new Date().toISOString(),
        thresholdAlert: { triggered: false, message: "No data available", severity: "LOW" },
      };
    }

    try {
      console.log(`🔒 Operational Lock acquired (${requestId}). Generating intelligence...`);

      const settings = await getCachedSettings();
      const threshold = settings?.operational?.limboRevenueThreshold ?? 1000000;

      // ✅ FIX 1: Expand status query to include Cancelled and RTO orders so leakage rate works!
      const OPERATIONAL_STATUS_QUERY = Array.from(
        new Set([...REVENUE_STATUSES, ...LIMBO_STATUSES, "Cancelled", "Completed", "Rejected"])
      );

      // ================================================================
      // 📊 1. TOTAL AGGREGATION (Stats + Full Status Breakdown)
      // ================================================================
      const statsResult = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $in: OPERATIONAL_STATUS_QUERY },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [{ $in: ["$status", ["Delivered", "Completed"]] }, 1, 0],
              },
            },
            cancelled: {
              $sum: {
                $cond: [{ $in: ["$status", ["Cancelled", "Rejected"]] }, 1, 0],
              },
            },
            pendingCount: {
              $sum: {
                $cond: [{ $in: ["$status", LIMBO_STATUSES] }, 1, 0],
              },
            },
            limboRevenue: {
              $sum: {
                $cond: [{ $in: ["$status", LIMBO_STATUSES] }, "$totalPrice", 0],
              },
            },
            // ✅ FIX 2: Push all statuses to build full breakdown
            breakdown: { $push: "$status" },
          },
        },
      ]);

      const stats = statsResult[0] || {};
      const totalOrders = stats.total || 0;
      const deliveredCount = stats.delivered || 0;
      const cancelledCount = stats.cancelled || 0;
      const pendingCount = stats.pendingCount || 0;
      const limboRevenue = stats.limboRevenue || 0;

      // ✅ Build Complete Status Breakdown Map
      const statusBreakdown: Record<string, number> = {};
      if (stats.breakdown && Array.isArray(stats.breakdown)) {
        for (const status of stats.breakdown) {
          if (status) {
            statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
          }
        }
      }

      // ✅ Accurately calculate fulfillment and leakage rates
      const fulfillmentRate = totalOrders > 0 ? Number(((deliveredCount / totalOrders) * 100).toFixed(1)) : 0;
      const leakageRate = totalOrders > 0 ? Number(((cancelledCount / totalOrders) * 100).toFixed(1)) : 0;

      // ================================================================
      // 📊 2. PAGINATED LIMBO ORDERS
      // ================================================================
      const [limboOrders, totalLimboCount] = await Promise.all([
        Order.find({
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $in: LIMBO_STATUSES },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("orderId shippingAddress.fullName status totalPrice createdAt")
          .lean(),
        Order.countDocuments({
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $in: LIMBO_STATUSES },
        }),
      ]);

      const totalLimboPages = Math.ceil(totalLimboCount / limit) || 1;

      // ================================================================
      // 📊 3. ALERTING / THRESHOLD CHECK
      // ================================================================
      let thresholdAlert: OperationalIntelligenceResponse["thresholdAlert"] = {
        triggered: false,
        message: "",
        severity: "LOW",
      };

      if (limboRevenue > threshold) {
        thresholdAlert = {
          triggered: true,
          message: `🚨 Limbo Revenue has exceeded the threshold of Rs. ${threshold.toLocaleString('en-PK')}. Current: Rs. ${limboRevenue.toLocaleString('en-PK')}. Immediate action required!`,
          severity: limboRevenue > threshold * 2 ? "HIGH" : "MEDIUM",
        };
        console.warn(thresholdAlert.message);
      }

      // ================================================================
      // 📊 4. TREND UPSERT (Bound to range.to date)
      // ================================================================
      await upsertOperationalTrend(range.to, {
        totalOrders,
        deliveredCount,
        cancelledCount,
        limboRevenue,
        pendingCount,
        fulfillmentRate,
        leakageRate,
      });

      // ================================================================
      // 📊 5. FINAL RESPONSE
      // ================================================================
      const response: OperationalIntelligenceResponse = {
        totalOrders,
        deliveredCount,
        cancelledCount,
        limboRevenue,
        pendingCount,
        fulfillmentRate,
        leakageRate,
        statusBreakdown,
        limboOrders,
        totalLimboCount,
        totalLimboPages,
        currentLimboPage: page,
        generatedAt: new Date().toISOString(),
        thresholdAlert,
      };

      // ✅ 6. Cache for 60 Seconds (using safeStringify)
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 60 });
      console.log(`✅ Operational Intelligence Cached (Page ${page}) — TTL: 60s`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Operational Engine Error:", error.message);
    return {
      totalOrders: 0,
      deliveredCount: 0,
      cancelledCount: 0,
      limboRevenue: 0,
      pendingCount: 0,
      fulfillmentRate: 0,
      leakageRate: 0,
      statusBreakdown: {},
      limboOrders: [],
      totalLimboCount: 0,
      totalLimboPages: 0,
      currentLimboPage: page,
      generatedAt: new Date().toISOString(),
      thresholdAlert: { triggered: false, message: "Error fetching data", severity: "LOW" },
    };
  }
}