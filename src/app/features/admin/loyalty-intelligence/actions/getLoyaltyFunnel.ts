// 📂 src/app/features/admin/loyalty-intelligence/actions/getLoyaltyFunnel.ts (STATUS WHITELIST HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import Referral from "@/models/Referral";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface FunnelStep {
  name: string;
  count: number;
  dropOff: number;
  dropOffRate: number;
}

export interface LoyaltyFunnelResponse {
  steps: FunnelStep[];
  avgConversionDays: number | null;
  generatedAt: string;
}

// ================================================================
// 🛡️ CACHE STAMPEDE PROTECTION (Lua Script)
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
    if (result === 1) console.log(`🔓 Funnel Lock released (${requestId}).`);
  } catch (error) {
    console.error("Funnel Lock release error:", error);
  }
};

// ================================================================
// 🔨 HELPER: Sum all raw clicks from Redis
// ================================================================
async function getTotalReferralClicks(): Promise<number> {
  try {
    let cursor = '0';
    let totalClicks = 0;

    do {
      const result = await redis.scan(cursor, { match: 'raw_clicks:*', count: 100 });
      
      const nextCursor = result[0];
      const keys = result[1] as string[];

      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.get(key));
        const values = await pipeline.exec();

        for (const val of values) {
          totalClicks += Number(val) || 0;
        }
      }

      cursor = nextCursor;
    } while (cursor !== '0');

    return totalClicks;
  } catch (error) {
    console.warn("⚠️ [Funnel] Redis click scan failed:", error);
    return 0;
  }
}

// ================================================================
// 🚀 MAIN SERVER ACTION — Status Whitelisted
// ================================================================
export async function getLoyaltyFunnel(): Promise<{
  success: boolean;
  data?: LoyaltyFunnelResponse;
  error?: string;
}> {
  const cacheKey = "analytics_loyalty_funnel_v4";

  try {
    // 1. RBAC
    await verifyAdminAccess();

    // 2. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<LoyaltyFunnelResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Loyalty Funnel");
      return { success: true, data: parsed };
    }

    // 3. Lock for Cache Stampede
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<LoyaltyFunnelResponse>(retryCache as string | null);
      if (retryParsed) {
        return { success: true, data: retryParsed };
      }
    }

    try {
      console.log(`🔒 Funnel Lock acquired (${requestId}). Generating funnel intelligence...`);

      await connectMongoose();

      // ================================================================
      // 🔥 1. FETCH REFERRAL COUNTS & REPEAT PURCHASES
      // ================================================================
      const [totalSignups, totalConverted, totalPaid, repeatPurchaseCount, conversionTimestamps] =
        await Promise.all([
          // Total Signups
          Referral.countDocuments(),
          // Converted AND Paid
          Referral.countDocuments({ status: { $in: ["converted", "paid"] } }),
          // Paid (Voucher Cleared)
          Referral.countDocuments({ status: "paid" }),
          // ✅ CRITICAL FIX: Match ONLY valid sales orders in REVENUE_STATUSES
          Order.aggregate([
            {
              $match: {
                paymentStatus: "Paid",
                status: { $in: REVENUE_STATUSES },
              },
            },
            {
              $addFields: {
                userObjId: {
                  $convert: {
                    input: "$userId",
                    to: "objectId",
                    onError: null,
                    onNull: null,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userObjId",
                foreignField: "_id",
                as: "userData",
              },
            },
            { $unwind: "$userData" },
            {
              $match: {
                "userData.referredBy": { $ne: null },
              },
            },
            {
              $group: {
                _id: "$userId",
                orderCount: { $sum: 1 },
              },
            },
            {
              $match: {
                orderCount: { $gt: 1 },
              },
            },
            { $count: "total" },
          ]),
          // Average conversion velocity (days)
          Referral.aggregate([
            {
              $match: {
                status: { $in: ["converted", "paid"] },
                convertedAt: { $ne: null },
              },
            },
            {
              $project: {
                daysDiff: {
                  $divide: [
                    { $subtract: ["$convertedAt", "$createdAt"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgDays: { $avg: "$daysDiff" },
              },
            },
          ]),
        ]);

      // 2. Parse results
      const signups = totalSignups || 0;
      const conversions = totalConverted || 0;
      const vouchersCleared = totalPaid || 0;
      const repeatPurchases = (repeatPurchaseCount[0]?.total) || 0;

      // 3. Get Total Unique Clicks from Redis
      const clicks = await getTotalReferralClicks();

      // 4. Average Conversion Velocity (Days)
      const avgConversionDays = conversionTimestamps.length > 0 && conversionTimestamps[0].avgDays
        ? Number(conversionTimestamps[0].avgDays.toFixed(1))
        : null;

      // ================================================================
      // 🔥 5. BUILD FUNNEL STEPS
      // ================================================================
      const steps: FunnelStep[] = [
        {
          name: "Clicks (Unique)",
          count: clicks,
          dropOff: 0,
          dropOffRate: 0,
        },
        {
          name: "Signups (Referred)",
          count: signups,
          dropOff: Math.max(0, clicks - signups),
          dropOffRate: clicks > 0 ? Number(((Math.max(0, clicks - signups) / clicks) * 100).toFixed(1)) : 0,
        },
        {
          name: "Converted (1st Purchase)",
          count: conversions,
          dropOff: Math.max(0, signups - conversions),
          dropOffRate: signups > 0 ? Number(((Math.max(0, signups - conversions) / signups) * 100).toFixed(1)) : 0,
        },
        {
          name: "Repeat Purchases",
          count: repeatPurchases,
          dropOff: Math.max(0, conversions - repeatPurchases),
          dropOffRate: conversions > 0 ? Number(((Math.max(0, conversions - repeatPurchases) / conversions) * 100).toFixed(1)) : 0,
        },
        {
          name: "Vouchers Cleared",
          count: vouchersCleared,
          dropOff: Math.max(0, repeatPurchases - vouchersCleared),
          dropOffRate: repeatPurchases > 0 ? Number(((Math.max(0, repeatPurchases - vouchersCleared) / repeatPurchases) * 100).toFixed(1)) : 0,
        },
      ];

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: LoyaltyFunnelResponse = {
        steps,
        avgConversionDays,
        generatedAt: new Date().toISOString(),
      };

      // 6. Cache for 5 Minutes
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log("✅ Loyalty Funnel Cached.");

      return { success: true, data: response };
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Loyalty Funnel Engine Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch loyalty funnel.",
    };
  }
}