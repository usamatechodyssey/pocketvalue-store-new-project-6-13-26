// // 📂 src/app/features/admin/marketing/actions/getCampaignMetrics.ts (FULLY HARDENED & CAPPED METRICS)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import UserSession from "@/models/UserSession";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { format, startOfDay, endOfDay } from "date-fns";

// // ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface CampaignMetric {
//   campaign: string;
//   visits: number;
//   orders: number;
//   revenue: number;
//   averageOrderValue: number;
//   conversionRate: number;
//   roi: number; // Revenue per visit or per order
// }

// export interface CampaignMetricsResponse {
//   data: CampaignMetric[];
//   totalRevenue: number;
//   totalVisits: number;       
//   totalOrders: number;       
//   avgConversionRate: number; 
//   topCampaign: string;
//   generatedAt: string;
// }

// // ================================================================
// // 🚀 MAIN ACTION (With Capped Conversion Rate & Date Filter)
// // ================================================================
// export async function getCampaignMetrics(range?: {
//   startDate: Date;
//   endDate: Date;
// }): Promise<{
//   success: boolean;
//   data?: CampaignMetricsResponse;
//   error?: string;
// }> {
//   const fromStr = range?.startDate ? format(new Date(range.startDate), "yyyy-MM-dd") : "all";
//   const toStr = range?.endDate ? format(new Date(range.endDate), "yyyy-MM-dd") : "all";
//   const cacheKey = `analytics_campaign_metrics_v3_${fromStr}_${toStr}`;

//   try {
//     await verifyStaff(["admin", "manager"]);

//     // 1. Redis Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<CampaignMetricsResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log("⚡ Redis Cache Hit: Campaign Metrics");
//       return { success: true, data: parsed };
//     }

//     await connectMongoose();

//     const dateMatch: any = {};
//     if (range?.startDate && range?.endDate) {
//       dateMatch.createdAt = {
//         $gte: startOfDay(new Date(range.startDate)),
//         $lte: endOfDay(new Date(range.endDate)),
//       };
//     }

//     // ================================================================
//     // 4. FETCH DATA FROM BOTH COLLECTIONS
//     // ================================================================

//     // 4a. Group UserSessions by utmCampaign to get Visits
//     const sessionAggregation = await UserSession.aggregate([
//       {
//         $match: {
//           utmCampaign: { $nin: [null, "None", ""] },
//           ...dateMatch,
//         },
//       },
//       {
//         $group: {
//           _id: "$utmCampaign",
//           visits: { $sum: 1 },
//           uniqueUsers: { $addToSet: "$userId" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           visits: 1,
//           uniqueVisitors: { $size: "$uniqueUsers" },
//         },
//       },
//     ]);

//     // 4b. Group Orders by trafficSource.utmCampaign
//     const orderAggregation = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: REVENUE_STATUSES },
//           "trafficSource.utmCampaign": { $nin: [null, "None", ""] },
//           ...dateMatch,
//         },
//       },
//       {
//         $group: {
//           _id: "$trafficSource.utmCampaign",
//           orders: { $sum: 1 },
//           revenue: { $sum: "$totalPrice" },
//         },
//       },
//     ]);

//     // ================================================================
//     // 5. MERGE DATA
//     // ================================================================

//     const campaignMap = new Map<string, CampaignMetric>();

//     for (const item of sessionAggregation) {
//       const campaign = item._id;
//       campaignMap.set(campaign, {
//         campaign,
//         visits: item.visits || 0,
//         orders: 0,
//         revenue: 0,
//         averageOrderValue: 0,
//         conversionRate: 0,
//         roi: 0,
//       });
//     }

//     for (const item of orderAggregation) {
//       const campaign = item._id;
//       if (campaignMap.has(campaign)) {
//         const existing = campaignMap.get(campaign)!;
//         existing.orders = item.orders || 0;
//         existing.revenue = item.revenue || 0;
//       } else {
//         campaignMap.set(campaign, {
//           campaign,
//           visits: 0,
//           orders: item.orders || 0,
//           revenue: item.revenue || 0,
//           averageOrderValue: 0,
//           conversionRate: 0,
//           roi: 0,
//         });
//       }
//     }

//     // 6. Calculate derived metrics & global totals
//     const finalData: CampaignMetric[] = [];
//     let totalRevenue = 0;
//     let totalVisits = 0;
//     let totalOrders = 0;
//     let topCampaign = "";
//     let topRevenue = 0;

//     for (const [campaign, metric] of campaignMap) {
//       const { visits, orders, revenue } = metric;

//       const aov = orders > 0 ? Number((revenue / orders).toFixed(2)) : 0;
      
//       // ✅ FIX 1: Conversion Rate Capped at 100.0% Max (100% if orders > 0 & visits = 0)
//       const rawConvRate = visits > 0 ? (orders / visits) * 100 : orders > 0 ? 100 : 0;
//       const convRate = Number(Math.min(100, rawConvRate).toFixed(1));

//       // ✅ FIX 2: Revenue per Visit (Falls back to Revenue / Orders if visits = 0)
//       const revPerVisit = visits > 0
//         ? Number((revenue / visits).toFixed(2))
//         : orders > 0
//           ? Number((revenue / orders).toFixed(2))
//           : 0;

//       finalData.push({
//         campaign,
//         visits,
//         orders,
//         revenue,
//         averageOrderValue: aov,
//         conversionRate: convRate,
//         roi: revPerVisit,
//       });

//       totalRevenue += revenue;
//       totalVisits += visits;
//       totalOrders += orders;

//       if (revenue > topRevenue) {
//         topRevenue = revenue;
//         topCampaign = campaign;
//       }
//     }

//     // 7. Sort by Revenue (Highest first)
//     finalData.sort((a, b) => b.revenue - a.revenue);

//     // ✅ FIX 3: Overall Conversion Rate Capped at 100.0% Max
//     const rawOverallConvRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : totalOrders > 0 ? 100 : 0;
//     const avgConversionRate = Number(Math.min(100, rawOverallConvRate).toFixed(1));

//     const response: CampaignMetricsResponse = {
//       data: finalData,
//       totalRevenue,
//       totalVisits,
//       totalOrders,
//       avgConversionRate,
//       topCampaign: topCampaign || "N/A",
//       generatedAt: new Date().toISOString(),
//     };

//     // 8. Cache safely with safeStringify
//     try {
//       const stringified = safeStringify(response);
//       await redis.set(cacheKey, stringified, { ex: 300 });
//       console.log(`💾 Campaign Metrics cached (5 min TTL): ${cacheKey}`);
//     } catch (cacheError) {
//       console.warn("⚠️ Failed to write campaign metrics to Redis:", cacheError);
//     }

//     return { success: true, data: response };
//   } catch (error: any) {
//     console.error("❌ Campaign Metrics Error:", error.message);
//     return {
//       success: false,
//       error: error.message || "Failed to fetch campaign metrics.",
//     };
//   }
// }
// 📂 src/app/features/admin/marketing/actions/getCampaignMetrics.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildCampaignAttributionMatrix,
  UnifiedCampaignAttributionItem,
} from "@/app/features/admin/shared/engines/campaignAttributionEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface CampaignMetric {
  campaign: string;
  visits: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  roi: number; // True Financial ROAS (or Revenue per Visit fallback)
}

export interface CampaignMetricsResponse {
  data: CampaignMetric[];
  totalRevenue: number;
  totalVisits: number;       
  totalOrders: number;       
  avgConversionRate: number; 
  topCampaign: string;
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getCampaignMetrics(range?: {
  startDate: Date;
  endDate: Date;
}): Promise<{
  success: boolean;
  data?: CampaignMetricsResponse;
  error?: string;
}> {
  const today = new Date();
  const start = range?.startDate ? startOfDay(new Date(range.startDate)) : startOfDay(subDays(today, 30));
  const end = range?.endDate ? endOfDay(new Date(range.endDate)) : endOfDay(today);

  const fromStr = format(start, "yyyy-MM-dd");
  const toStr = format(end, "yyyy-MM-dd");
  const cacheKey = `analytics_campaign_metrics_v4_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CampaignMetricsResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Campaign Metrics (Central Engine)");
      return { success: true, data: parsed };
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildCampaignAttributionMatrix({
      startDate: start,
      endDate: end,
    });

    // 3. Map Engine Response to Marketing Hub Expected Interface
    const mappedData: CampaignMetric[] = engineResult.data.map((item: UnifiedCampaignAttributionItem) => ({
      campaign: item.campaign,
      visits: item.visits,
      orders: item.orders,
      revenue: item.revenue,
      averageOrderValue: item.aov,
      conversionRate: item.conversionRate,
      roi: item.roas, // Uses True Financial ROAS (Revenue / AdSpend)
    }));

    const response: CampaignMetricsResponse = {
      data: mappedData,
      totalRevenue: engineResult.summary.totalRevenue,
      totalVisits: engineResult.summary.totalVisits,
      totalOrders: engineResult.summary.totalOrders,
      avgConversionRate: engineResult.summary.overallConversionRate,
      topCampaign: engineResult.summary.topCampaign,
      generatedAt: engineResult.generatedAt,
    };

    // 4. Cache for 5 Minutes
    try {
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`💾 Campaign Metrics cached (5 min TTL): ${cacheKey}`);
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