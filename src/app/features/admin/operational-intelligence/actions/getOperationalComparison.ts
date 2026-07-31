// 📂 src/app/features/admin/operational-intelligence/actions/getOperationalComparison.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { differenceInDays, subDays, format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ SINGLE SOURCE OF TRUTH
import { REVENUE_STATUSES, LIMBO_STATUSES } from "@/app/shared/constants/analytics";

// ✅ ENTERPRISE FIX: Safe cache utilities
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface ComparisonMetric {
  current: number;
  previous: number;
  change: number; // Percentage change (positive = growth)
  trend: "UP" | "DOWN" | "STABLE";
}

export interface OperationalComparisonResponse {
  range: {
    current: { from: Date; to: Date };
    previous: { from: Date; to: Date };
    days: number;
  };
  metrics: {
    totalOrders: ComparisonMetric;
    deliveredCount: ComparisonMetric;
    cancelledCount: ComparisonMetric;
    limboRevenue: ComparisonMetric;
    pendingCount: ComparisonMetric;
    fulfillmentRate: ComparisonMetric;
    leakageRate: ComparisonMetric;
  };
  generatedAt: string;
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
    if (result === 1) console.log(`🔓 Comparison Lock released (${requestId}).`);
  } catch (error) {
    console.error("Comparison Lock release error:", error);
  }
};

// ================================================================
// 🔨 HELPER: Fetch period metrics (Fixed Status Scope)
// ================================================================
async function fetchPeriodMetrics(from: Date, to: Date) {
  // ✅ FIX: Expand status query to include Cancelled and RTO orders for accurate comparison!
  const OPERATIONAL_STATUS_QUERY = Array.from(
    new Set([...REVENUE_STATUSES, ...LIMBO_STATUSES, "Cancelled", "Completed", "Rejected"])
  );

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
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
        limboRevenue: {
          $sum: {
            $cond: [{ $in: ["$status", LIMBO_STATUSES] }, "$totalPrice", 0],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $in: ["$status", LIMBO_STATUSES] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = stats[0] || {};
  const total = result.total || 0;
  const delivered = result.delivered || 0;
  const cancelled = result.cancelled || 0;

  return {
    totalOrders: total,
    deliveredCount: delivered,
    cancelledCount: cancelled,
    limboRevenue: result.limboRevenue || 0,
    pendingCount: result.pendingCount || 0,
    fulfillmentRate: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0,
    leakageRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
  };
}

// ================================================================
// 📊 MAIN FUNCTION
// ================================================================
export async function getOperationalComparisonPayload(
  range: { from: Date; to: Date }
): Promise<OperationalComparisonResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_operational_comparison_v3:${fromStr}_${toStr}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<OperationalComparisonResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Operational Comparison");
      return parsed;
    }

    // ✅ 2. Cache Stampede Protection (SETNX Lock)
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<OperationalComparisonResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale comparison cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Comparison Lock acquired (${requestId}). Generating comparison data...`);

      // ✅ 3. Calculate previous period (same length)
      const daysDiff = differenceInDays(range.to, range.from) + 1;
      const prevFrom = subDays(range.from, daysDiff);
      const prevTo = subDays(range.to, daysDiff);

      // ✅ 4. Fetch both periods in parallel
      const [currentMetrics, previousMetrics] = await Promise.all([
        fetchPeriodMetrics(range.from, range.to),
        fetchPeriodMetrics(prevFrom, prevTo),
      ]);

      // ✅ 5. Calculate percentage changes for each metric
      const calculateChange = (current: number, previous: number): ComparisonMetric => {
        const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
        const trend: "UP" | "DOWN" | "STABLE" =
          change > 5 ? "UP" : change < -5 ? "DOWN" : "STABLE";
        return {
          current,
          previous,
          change: Number(change.toFixed(1)),
          trend,
        };
      };

      // ✅ 6. Build Response
      const response: OperationalComparisonResponse = {
        range: {
          current: { from: range.from, to: range.to },
          previous: { from: prevFrom, to: prevTo },
          days: daysDiff,
        },
        metrics: {
          totalOrders: calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders),
          deliveredCount: calculateChange(currentMetrics.deliveredCount, previousMetrics.deliveredCount),
          cancelledCount: calculateChange(currentMetrics.cancelledCount, previousMetrics.cancelledCount),
          limboRevenue: calculateChange(currentMetrics.limboRevenue, previousMetrics.limboRevenue),
          pendingCount: calculateChange(currentMetrics.pendingCount, previousMetrics.pendingCount),
          fulfillmentRate: calculateChange(currentMetrics.fulfillmentRate, previousMetrics.fulfillmentRate),
          leakageRate: calculateChange(currentMetrics.leakageRate, previousMetrics.leakageRate),
        },
        generatedAt: new Date().toISOString(),
      };

      // ✅ 7. Cache for 10 minutes (using safeStringify)
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 600 });
      console.log("✅ Operational Comparison Cached.");

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Comparison Engine Error:", error.message);
    const emptyMetric = (): ComparisonMetric => ({ current: 0, previous: 0, change: 0, trend: "STABLE" });
    return {
      range: {
        current: { from: range.from, to: range.to },
        previous: { from: subDays(range.from, 1), to: subDays(range.to, 1) },
        days: 1,
      },
      metrics: {
        totalOrders: emptyMetric(),
        deliveredCount: emptyMetric(),
        cancelledCount: emptyMetric(),
        limboRevenue: emptyMetric(),
        pendingCount: emptyMetric(),
        fulfillmentRate: emptyMetric(),
        leakageRate: emptyMetric(),
      },
      generatedAt: new Date().toISOString(),
    };
  }
}