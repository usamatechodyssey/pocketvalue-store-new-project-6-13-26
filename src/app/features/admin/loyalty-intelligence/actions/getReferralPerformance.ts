// 📂 src/app/features/admin/loyalty-intelligence/actions/getReferralPerformance.ts (STATUS WHITELIST HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Referral from "@/models/Referral";
import User from "@/models/User";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

const CACHE_KEY = "analytics_referral_performance_v3";
const CACHE_TTL_SECONDS = 300;

export interface ReferrerLeaderboardRow {
  referrerId: string;
  name: string;
  email: string;
  totalSignups: number;
  conversions: number;
  conversionRate: number;
  unsettledConversions: number;
  settledConversions: number;
}

export interface ReferralPerformanceStats {
  totalReferrals: number;
  conversions: number;
  conversionRate: number;
  activeReferrers: number;
  unsettledConversions: number;
  settledConversions: number;
  totalRevenue: number;
  topReferrers: ReferrerLeaderboardRow[];
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getReferralPerformance(): Promise<{
  success: boolean;
  data?: ReferralPerformanceStats;
  error?: string;
}> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check
    try {
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        console.log("⚡ Redis Cache Hit: Referral Performance");
        const parsed = safeParse<ReferralPerformanceStats>(cachedData as string | null);
        if (parsed) {
          return { success: true, data: parsed };
        } else {
          console.warn("⚠️ Referral Performance cache corrupted. Recomputing...");
        }
      }
    } catch (redisCacheError) {
      console.warn("⚠️ Redis cache offline. Falling back to DB query.");
    }

    await connectMongoose();

    // ================================================================
    // 🔥 1. AGGREGATE REFERRALS (GROUP BY REFERRER)
    // ================================================================
    const referralAggregation = await Referral.aggregate([
      {
        $group: {
          _id: "$referrerId",
          totalSignups: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [{ $in: ["$status", ["converted", "paid"]] }, 1, 0],
            },
          },
          unsettled: {
            $sum: {
              $cond: [{ $eq: ["$status", "converted"] }, 1, 0],
            },
          },
          settled: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, 1, 0],
            },
          },
          orderIds: {
            $addToSet: {
              $cond: [
                { $in: ["$status", ["converted", "paid"]] },
                "$orderId",
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalSignups: 1,
          converted: 1,
          unsettled: 1,
          settled: 1,
          orderIds: {
            $filter: {
              input: "$orderIds",
              as: "id",
              cond: { $ne: ["$$id", null] },
            },
          },
        },
      },
    ]);

    // ================================================================
    // 🔥 2. FETCH REVENUE FOR REFERRED ORDERS (Filtered by REVENUE_STATUSES)
    // ================================================================
    const allOrderIds = referralAggregation
      .flatMap((r) => r.orderIds || [])
      .filter(Boolean);

    const orderRevenueMap = new Map<string, number>();
    if (allOrderIds.length > 0) {
      // ✅ CRITICAL FIX: Only sum revenue for orders in REVENUE_STATUSES (Excludes Cancelled/Fraud)
      const orderDocs = await Order.find(
        {
          orderId: { $in: allOrderIds },
          status: { $in: REVENUE_STATUSES },
        },
        { orderId: 1, totalPrice: 1 }
      ).lean();

      for (const doc of orderDocs) {
        orderRevenueMap.set(doc.orderId, doc.totalPrice);
      }
    }

    // ================================================================
    // 🔥 3. BUILD REFERRER MAP
    // ================================================================
    const referrersMap = new Map<
      string,
      {
        signups: number;
        conversions: number;
        unsettled: number;
        settled: number;
        revenue: number;
      }
    >();

    let totalReferrals = 0;
    let totalConversions = 0;
    let totalUnsettled = 0;
    let totalSettled = 0;
    let totalRevenue = 0;

    for (const ref of referralAggregation) {
      const refId = ref._id.toString();
      const revenue = ref.orderIds.reduce(
        (sum: number, id: string) => sum + (orderRevenueMap.get(id) || 0),
        0
      );

      referrersMap.set(refId, {
        signups: ref.totalSignups,
        conversions: ref.converted,
        unsettled: ref.unsettled,
        settled: ref.settled,
        revenue,
      });

      totalReferrals += ref.totalSignups;
      totalConversions += ref.converted;
      totalUnsettled += ref.unsettled;
      totalSettled += ref.settled;
      totalRevenue += revenue;
    }

    // ================================================================
    // 🔥 4. FETCH USER PROFILES FOR LEADERBOARD (Top 15 Sorted)
    // ================================================================
    const sortedReferrerIds = Array.from(referrersMap.entries())
      .sort((a, b) => b[1].conversions - a[1].conversions)
      .slice(0, 15)
      .map(([id]) => id);

    const userProfiles = await User.find(
      { _id: { $in: sortedReferrerIds } },
      { _id: 1, name: 1, email: 1 }
    ).lean();

    const profileMap = new Map(
      userProfiles.map((u) => [String(u._id), u])
    );

    // ================================================================
    // 🔥 5. BUILD LEADERBOARD (Strict Rank Preservation)
    // ================================================================
    const topReferrers: ReferrerLeaderboardRow[] = [];
    for (const refId of sortedReferrerIds) {
      const metrics = referrersMap.get(refId);
      if (!metrics) continue;

      const profile = profileMap.get(refId);
      const rate =
        metrics.signups > 0
          ? Number(((metrics.conversions / metrics.signups) * 100).toFixed(1))
          : 0;

      topReferrers.push({
        referrerId: refId,
        name: profile?.name || "Customer #" + refId.slice(-6),
        email: profile?.email || "N/A",
        totalSignups: metrics.signups,
        conversions: metrics.conversions,
        conversionRate: rate,
        unsettledConversions: metrics.unsettled,
        settledConversions: metrics.settled,
      });
    }

    // ================================================================
    // 🔥 6. FINAL RESPONSE ASSEMBLY
    // ================================================================
    const conversionRate =
      totalReferrals > 0
        ? Number(((totalConversions / totalReferrals) * 100).toFixed(1))
        : 0;

    const compiledStats: ReferralPerformanceStats = {
      totalReferrals,
      conversions: totalConversions,
      conversionRate,
      activeReferrers: referrersMap.size,
      unsettledConversions: totalUnsettled,
      settledConversions: totalSettled,
      totalRevenue,
      topReferrers,
    };

    // 7. Write to Redis Cache
    try {
      await redis.set(CACHE_KEY, safeStringify(compiledStats), {
        ex: CACHE_TTL_SECONDS,
      });
      console.log("✅ Referral Performance cached successfully.");
    } catch (redisWriteError) {
      console.error("⚠️ Failed to write performance cache:", redisWriteError);
    }

    return { success: true, data: compiledStats };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to compile admin referral performance stats:", errorMsg);
    return { success: false, error: errorMsg };
  }
}