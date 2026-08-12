// // 📂 src/app/features/admin/marketing/actions/getCampaignFunnel.ts (100% COMPILER WARNING-FREE & TIMEFRAME HARDENED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import UserEvent from "@/models/UserEvent";
// import UserSession from "@/models/UserSession";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { format, startOfDay, endOfDay, subDays } from "date-fns";

// // ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface CampaignFunnelStep {
//   campaign: string;
//   views: number;
//   addToCarts: number;
//   checkouts: number;
//   purchases: number;
//   accountCreated: number;
//   viewToCartRate: number;
//   cartToCheckoutRate: number;
//   checkoutToPurchaseRate: number;
//   overallConversionRate: number;
// }

// export interface CampaignFunnelResponse {
//   data: CampaignFunnelStep[];
//   totalCampaigns: number;          
//   overallFunnelConversion: number; 
//   generatedAt: string;
// }

// // ================================================================
// // 🚀 MAIN ACTION
// // ================================================================
// export async function getCampaignFunnel(
//   range?: { startDate: Date; endDate: Date }
// ): Promise<{
//   success: boolean;
//   data?: CampaignFunnelResponse;
//   error?: string;
// }> {
//   // Default to Last 30 Days if no range provided
//   const today = new Date();
//   const start = range?.startDate ? startOfDay(new Date(range.startDate)) : startOfDay(subDays(today, 30));
//   const end = range?.endDate ? endOfDay(new Date(range.endDate)) : endOfDay(today);

//   const fromStr = format(start, "yyyy-MM-dd");
//   const toStr = format(end, "yyyy-MM-dd");
//   const cacheKey = `analytics_campaign_funnel_v7_${fromStr}_${toStr}`;

//   try {
//     await verifyStaff(["admin", "manager", "editor"]);

//     // 1. Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<CampaignFunnelResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Campaign Funnel (${fromStr} to ${toStr})`);
//       return { success: true, data: parsed };
//     }

//     await connectMongoose();

//     // ================================================================
//     // 2. AGGREGATE SESSIONS WITH UTM CAMPAIGN WITHIN TIMEFRAME
//     // ================================================================
//     const sessionsAgg = await UserSession.aggregate([
//       {
//         $match: {
//           utmCampaign: { $nin: [null, "", "None", "Direct"] },
//           createdAt: { $gte: start, $lte: end }
//         }
//       },
//       {
//         $group: {
//           _id: "$utmCampaign",
//           visits: { $sum: 1 },
//           sessionIds: { $push: "$sessionId" },
//           userIds: { $addToSet: "$userId" }
//         }
//       }
//     ]);

//     if (sessionsAgg.length === 0) {
//       return {
//         success: true,
//         data: {
//           data: [],
//           totalCampaigns: 0,
//           overallFunnelConversion: 0,
//           generatedAt: new Date().toISOString(),
//         },
//       };
//     }

//     // ================================================================
//     // 3. AGGREGATE EVENTS WITHIN TIMEFRAME
//     // ================================================================
//     const eventsAgg = await UserEvent.aggregate([
//       {
//         $match: {
//           eventType: { $in: ["page_view", "add_to_cart", "checkout_start"] },
//           createdAt: { $gte: start, $lte: end }
//         }
//       },
//       {
//         $lookup: {
//           from: "usersessions",
//           localField: "sessionId",
//           foreignField: "sessionId",
//           as: "session"
//         }
//       },
//       { $unwind: "$session" },
//       {
//         $match: {
//           "session.utmCampaign": { $nin: [null, "", "None", "Direct"] }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             campaign: "$session.utmCampaign",
//             eventType: "$eventType"
//           },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // ================================================================
//     // 4. AGGREGATE PURCHASES FROM ORDERS WITHIN TIMEFRAME
//     // ================================================================
//     const ordersAgg = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: REVENUE_STATUSES },
//           "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
//           createdAt: { $gte: start, $lte: end }
//         }
//       },
//       {
//         $group: {
//           _id: "$trafficSource.utmCampaign",
//           purchases: { $sum: 1 }
//         }
//       }
//     ]);

//     // ================================================================
//     // 5. MERGE DATA INTO MAP
//     // ================================================================
//     const campaignMap = new Map<
//       string,
//       {
//         views: number;
//         addToCarts: number;
//         checkouts: number;
//         purchases: number;
//         accountCreated: number;
//       }
//     >();

//     for (const s of sessionsAgg) {
//       campaignMap.set(s._id, {
//         views: s.visits || 0,
//         addToCarts: 0,
//         checkouts: 0,
//         purchases: 0,
//         accountCreated: 0,
//       });
//     }

//     for (const e of eventsAgg) {
//       const campaign = e._id.campaign;
//       const type = e._id.eventType;
//       const count = e.count || 0;

//       if (!campaignMap.has(campaign)) {
//         campaignMap.set(campaign, { views: 0, addToCarts: 0, checkouts: 0, purchases: 0, accountCreated: 0 });
//       }
//       const metrics = campaignMap.get(campaign)!;

//       if (type === "page_view") metrics.views = Math.max(metrics.views, count);
//       else if (type === "add_to_cart") metrics.addToCarts = count;
//       else if (type === "checkout_start") metrics.checkouts = count;
//     }

//     for (const o of ordersAgg) {
//       const campaign = o._id;
//       if (!campaignMap.has(campaign)) {
//         campaignMap.set(campaign, { views: 0, addToCarts: 0, checkouts: 0, purchases: 0, accountCreated: 0 });
//       }
//       campaignMap.get(campaign)!.purchases = o.purchases || 0;
//     }

//     // ================================================================
//     // 6. CALCULATE CAPPED RATES & BUILD RESPONSE
//     // ================================================================
//     const funnelData: CampaignFunnelStep[] = [];
//     let globalTotalViews = 0;
//     let globalTotalPurchases = 0;

//     for (const [campaign, metrics] of campaignMap) {
//       const { views, addToCarts, checkouts, purchases, accountCreated } = metrics;

//       if (views === 0 && addToCarts === 0 && checkouts === 0 && purchases === 0 && accountCreated === 0) {
//         continue;
//       }

//       const viewToCartRate = views > 0 ? Number(Math.min(100, (addToCarts / views) * 100).toFixed(1)) : 0;
//       const cartToCheckoutRate = addToCarts > 0 ? Number(Math.min(100, (checkouts / addToCarts) * 100).toFixed(1)) : 0;
//       const checkoutToPurchaseRate = checkouts > 0 ? Number(Math.min(100, (purchases / checkouts) * 100).toFixed(1)) : 0;
//       const overallConversionRate = views > 0 ? Number(Math.min(100, (purchases / views) * 100).toFixed(1)) : 0;

//       funnelData.push({
//         campaign,
//         views,
//         addToCarts,
//         checkouts,
//         purchases,
//         accountCreated,
//         viewToCartRate,
//         cartToCheckoutRate,
//         checkoutToPurchaseRate,
//         overallConversionRate,
//       });

//       globalTotalViews += views;
//       globalTotalPurchases += purchases;
//     }

//     funnelData.sort((a, b) => b.views - a.views);

//     const overallFunnelConversion = globalTotalViews > 0 
//       ? Number(Math.min(100, (globalTotalPurchases / globalTotalViews) * 100).toFixed(2)) 
//       : 0;

//     const response: CampaignFunnelResponse = {
//       data: funnelData,
//       totalCampaigns: funnelData.length,
//       overallFunnelConversion,
//       generatedAt: new Date().toISOString(),
//     };

//     // 7. Cache safely
//     try {
//       const stringified = safeStringify(response);
//       await redis.set(cacheKey, stringified, { ex: 300 });
//       console.log(`💾 Campaign Funnel cached successfully (${fromStr} to ${toStr}).`);
//     } catch (cacheError) {
//       console.warn("⚠️ Failed to cache campaign funnel:", cacheError);
//     }

//     return { success: true, data: response };
//   } catch (error: any) {
//     console.error("❌ Campaign Funnel Error:", error.message);
//     return {
//       success: false,
//       error: error.message || "Failed to fetch campaign funnel data.",
//     };
//   }
// }
// 📂 src/app/features/admin/marketing/actions/getCampaignFunnel.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildCampaignFunnelMatrix,
  UnifiedCampaignFunnelItem,
} from "@/app/features/admin/shared/engines/campaignAttributionEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface CampaignFunnelStep {
  campaign: string;
  views: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
  accountCreated: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallConversionRate: number;
}

export interface CampaignFunnelResponse {
  data: CampaignFunnelStep[];
  totalCampaigns: number;          
  overallFunnelConversion: number; 
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getCampaignFunnel(
  range?: { startDate: Date; endDate: Date }
): Promise<{
  success: boolean;
  data?: CampaignFunnelResponse;
  error?: string;
}> {
  const today = new Date();
  const start = range?.startDate ? startOfDay(new Date(range.startDate)) : startOfDay(subDays(today, 30));
  const end = range?.endDate ? endOfDay(new Date(range.endDate)) : endOfDay(today);

  const fromStr = format(start, "yyyy-MM-dd");
  const toStr = format(end, "yyyy-MM-dd");
  const cacheKey = `analytics_campaign_funnel_v8_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CampaignFunnelResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Campaign Funnel (${fromStr} to ${toStr})`);
      return { success: true, data: parsed };
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildCampaignFunnelMatrix({
      startDate: start,
      endDate: end,
    });

    // 3. Map Engine Response to Expected Interface
    const mappedData: CampaignFunnelStep[] = engineResult.data.map((item: UnifiedCampaignFunnelItem) => ({
      campaign: item.campaign,
      views: item.views,
      addToCarts: item.addToCarts,
      checkouts: item.checkouts,
      purchases: item.purchases,
      accountCreated: 0,
      viewToCartRate: item.viewToCartRate,
      cartToCheckoutRate: item.cartToCheckoutRate,
      checkoutToPurchaseRate: item.checkoutToPurchaseRate,
      overallConversionRate: item.overallConversionRate,
    }));

    const response: CampaignFunnelResponse = {
      data: mappedData,
      totalCampaigns: engineResult.totalCampaigns,
      overallFunnelConversion: engineResult.overallFunnelConversion,
      generatedAt: engineResult.generatedAt,
    };

    // 4. Cache for 5 Minutes
    try {
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`💾 Campaign Funnel cached (${fromStr} to ${toStr}).`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache campaign funnel:", cacheError);
    }

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Campaign Funnel Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch campaign funnel data.",
    };
  }
}