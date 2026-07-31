// 📂 src/app/features/admin/marketing/actions/getCampaignMetrics.ts (FULLY ALIGNED & DYNAMIC CAMPAIGN METRICS)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserSession from "@/models/UserSession";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface CampaignMetric {
  campaign: string;
  visits: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  roi: number;
}

export interface CampaignMetricsResponse {
  data: CampaignMetric[];
  totalRevenue: number;
  totalVisits: number;       // ✅ NEW: Global campaign visits sum
  totalOrders: number;       // ✅ NEW: Global campaign orders sum
  avgConversionRate: number; // ✅ NEW: Overall marketing conversion %
  topCampaign: string;
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN ACTION (WITH REDIS CACHE & SAFE PARSING)
// ================================================================
export async function getCampaignMetrics(): Promise<{
  success: boolean;
  data?: CampaignMetricsResponse;
  error?: string;
}> {
  const cacheKey = "analytics_campaign_metrics";

  try {
    await verifyStaff(["admin", "manager"]);

    // 2. Redis Cache Check (Type-Safe with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CampaignMetricsResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Campaign Metrics");
      return { success: true, data: parsed };
    }

    await connectMongoose();

    // ================================================================
    // 4. FETCH DATA FROM BOTH COLLECTIONS (WITH INDEXES)
    // ================================================================

    // 4a. Group UserSessions by utmCampaign to get Visits
    const sessionAggregation = await UserSession.aggregate([
      {
        $match: {
          utmCampaign: { $nin: [null, "None", ""] },
        },
      },
      {
        $group: {
          _id: "$utmCampaign",
          visits: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 1,
          visits: 1,
          uniqueVisitors: { $size: "$uniqueUsers" },
        },
      },
    ]);

    // 4b. Group Orders by trafficSource.utmCampaign
    // ✅ ENTERPRISE FIX: Aligned status match with REVENUE_STATUSES whitelist
    const orderAggregation = await Order.aggregate([
      {
        $match: {
          status: { $in: REVENUE_STATUSES }, // ✅ Matches valid active orders (includes Unpaid COD)
          "trafficSource.utmCampaign": { $nin: [null, "None", ""] }, // ✅ Excludes None
        },
      },
      {
        $group: {
          _id: "$trafficSource.utmCampaign",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // ================================================================
    // 5. MERGE DATA
    // ================================================================

    const campaignMap = new Map<string, CampaignMetric>();

    // Add sessions data
    for (const item of sessionAggregation) {
      const campaign = item._id;
      campaignMap.set(campaign, {
        campaign,
        visits: item.visits || 0,
        orders: 0,
        revenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        roi: 0,
      });
    }

    // Merge orders data
    for (const item of orderAggregation) {
      const campaign = item._id;
      if (campaignMap.has(campaign)) {
        const existing = campaignMap.get(campaign)!;
        existing.orders = item.orders || 0;
        existing.revenue = item.revenue || 0;
      } else {
        campaignMap.set(campaign, {
          campaign,
          visits: 0,
          orders: item.orders || 0,
          revenue: item.revenue || 0,
          averageOrderValue: 0,
          conversionRate: 0,
          roi: 0,
        });
      }
    }

    // 6. Calculate derived metrics & global totals
    const finalData: CampaignMetric[] = [];
    let totalRevenue = 0;
    let totalVisits = 0;
    let totalOrders = 0;
    let topCampaign = "";
    let topRevenue = 0;

    for (const [campaign, metric] of campaignMap) {
      const { visits, orders, revenue } = metric;

      const aov = orders > 0 ? Number((revenue / orders).toFixed(2)) : 0;
      const convRate = visits > 0 ? Number(((orders / visits) * 100).toFixed(2)) : 0;
      const roi = visits > 0 ? Number((revenue / visits).toFixed(2)) : 0;

      finalData.push({
        campaign,
        visits,
        orders,
        revenue,
        averageOrderValue: aov,
        conversionRate: convRate,
        roi,
      });

      totalRevenue += revenue;
      totalVisits += visits;
      totalOrders += orders;

      if (revenue > topRevenue) {
        topRevenue = revenue;
        topCampaign = campaign;
      }
    }

    // 7. Sort by Revenue (Highest first)
    finalData.sort((a, b) => b.revenue - a.revenue);

    const avgConversionRate = totalVisits > 0 ? Number(((totalOrders / totalVisits) * 100).toFixed(2)) : 0;

    const response: CampaignMetricsResponse = {
      data: finalData,
      totalRevenue,
      totalVisits,
      totalOrders,
      avgConversionRate,
      topCampaign: topCampaign || "N/A",
      generatedAt: new Date().toISOString(),
    };

    // 8. Cache safely with safeStringify
    try {
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log("💾 Campaign Metrics cached (5 min TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Failed to write campaign metrics to Redis:", cacheError);
    }

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Campaign Metrics Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch campaign metrics.",
    };
  }
}