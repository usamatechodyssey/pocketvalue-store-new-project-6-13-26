// // 📂 src/app/features/admin/reports/actions/getAcquisitionReportData.ts (FULLY RECONCILED & FUNNEL SHIELDED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import UserEvent from "@/models/UserEvent";
// import UserSession from "@/models/UserSession";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { format } from "date-fns";

// // ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface AcquisitionReportRow {
//   campaign?: string;
//   source?: string;
//   visits?: number;
//   orders?: number;
//   revenue?: number;
//   adSpend?: number; // Snapshotted Campaign Ad Spend in PKR
//   profit?: number;  // Pure Net Profit in PKR
//   roas?: number;    // True Financial ROAS (Revenue / AdSpend)
//   views?: number;
//   addToCart?: number;
//   checkout?: number;
//   purchases?: number;
//   dropOffRate?: number;
//   bounceRate?: number;
// }

// export interface AcquisitionReportResponse {
//   data: AcquisitionReportRow[];
//   totals: {
//     visits?: number;
//     orders?: number;
//     revenue?: number;
//     adSpend?: number;
//     profit?: number;
//     roas?: number;
//     views?: number;
//     addToCart?: number;
//     checkout?: number;
//     purchases?: number;
//     dropOffRate?: number;
//   };
//   generatedAt: string;
// }

// // ================================================================
// // 🚀 MAIN REPORT COMPILER (100% Hardened & Funnel Shielded)
// // ================================================================
// export async function getAcquisitionReportData(
//   range: { startDate: Date; endDate: Date },
//   slug: "utm-attribution" | "conversion-funnel"
// ): Promise<{ success: boolean; data?: AcquisitionReportResponse; error?: string }> {
//   const cacheKey = `analytics_acquisition_v8_${slug}_${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}`;

//   try {
//     await verifyStaff(["admin", "manager", "editor"]);

//     // 1. Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<AcquisitionReportResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Acquisition Report (${slug})`);
//       return { success: true, data: parsed };
//     }

//     await connectMongoose();

//     const start = new Date(range.startDate);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(range.endDate);
//     end.setHours(23, 59, 59, 999);

//     let result: AcquisitionReportResponse;

//     // ================================================================
//     // 📊 A. UTM ATTRIBUTION (Campaign ROI — Full Unit Economics)
//     // ================================================================
//     if (slug === "utm-attribution") {
//       // ✅ DB Aggregate 1: Group visits & capture primary sources
//       const sessionsAgg = await UserSession.aggregate([
//         {
//           $match: {
//             utmCampaign: { $nin: [null, "", "None", "Direct"] },
//             createdAt: { $gte: start, $lte: end }
//           }
//         },
//         {
//           $group: {
//             _id: "$utmCampaign",
//             visits: { $sum: 1 },
//             source: { $first: "$utmSource" }
//           }
//         }
//       ]);

//       // ✅ DB Aggregate 2: Group orders, revenue, ad spend AND pure profit by UTM campaign
//       const ordersAgg = await Order.aggregate([
//         {
//           $match: {
//             status: { $in: REVENUE_STATUSES },
//             "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
//             createdAt: { $gte: start, $lte: end }
//           }
//         },
//         {
//           $group: {
//             _id: "$trafficSource.utmCampaign",
//             orders: { $sum: 1 },
//             revenue: { $sum: "$totalPrice" },
//             // ✅ Ad Spend Sum directly from Order Document Snapshots
//             adSpend: {
//               $sum: {
//                 $reduce: {
//                   input: "$products",
//                   initialValue: 0,
//                   in: {
//                     $add: [
//                       "$$value",
//                       {
//                         $multiply: [
//                           { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] },
//                           { $divide: [{ $ifNull: ["$$this.appliedAdSpendRate", 0] }, 100] }
//                         ]
//                       }
//                     ]
//                   }
//                 }
//               }
//             },
//             // ✅ Pure Net Profit Sum directly from Order Document Snapshots
//             profit: {
//               $sum: {
//                 $reduce: {
//                   input: "$products",
//                   initialValue: 0,
//                   in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] }
//                 }
//               }
//             }
//           }
//         }
//       ]);

//       if (sessionsAgg.length === 0 && ordersAgg.length === 0) {
//         return {
//           success: true,
//           data: { data: [], totals: {}, generatedAt: new Date().toISOString() },
//         };
//       }

//       // Merge aggregated map records
//       const campaignMap = new Map<string, AcquisitionReportRow>();

//       for (const s of sessionsAgg) {
//         campaignMap.set(s._id, {
//           campaign: s._id,
//           source: s.source || "Unknown",
//           visits: s.visits || 0,
//           orders: 0,
//           revenue: 0,
//           adSpend: 0,
//           profit: 0,
//           roas: 0
//         });
//       }

//       for (const o of ordersAgg) {
//         if (campaignMap.has(o._id)) {
//           const existing = campaignMap.get(o._id)!;
//           existing.orders = o.orders || 0;
//           existing.revenue = o.revenue || 0;
//           existing.adSpend = o.adSpend || 0;
//           existing.profit = o.profit || 0;
//         } else {
//           campaignMap.set(o._id, {
//             campaign: o._id,
//             source: "Unknown",
//             visits: 0,
//             orders: o.orders || 0,
//             revenue: o.revenue || 0,
//             adSpend: o.adSpend || 0,
//             profit: o.profit || 0,
//             roas: 0
//           });
//         }
//       }

//       const data: AcquisitionReportRow[] = [];
//       let totalRevenue = 0;
//       let totalAdSpend = 0;
//       let totalProfit = 0;
//       let totalOrders = 0;
//       let totalVisits = 0;

//       for (const [campaign, row] of campaignMap.entries()) {
//         const visits = row.visits || 0;
//         const orders = row.orders || 0;
//         const revenue = row.revenue || 0;
//         const adSpend = Math.round(row.adSpend || 0);
//         const profit = Math.round(row.profit || 0);

//         // ✅ TRUE FINANCIAL ROAS: Revenue / AdSpend (Fallback to visits if adSpend is 0)
//         const roas = adSpend > 0
//           ? Number((revenue / adSpend).toFixed(2))
//           : visits > 0
//             ? Number((revenue / visits).toFixed(2))
//             : 0;

//         data.push({
//           campaign,
//           source: row.source,
//           visits,
//           orders,
//           revenue,
//           adSpend,
//           profit,
//           roas
//         });

//         totalRevenue += revenue;
//         totalAdSpend += adSpend;
//         totalProfit += profit;
//         totalOrders += orders;
//         totalVisits += visits;
//       }

//       data.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

//       // Global ROAS Total
//       const overallRoas = totalAdSpend > 0
//         ? Number((totalRevenue / totalAdSpend).toFixed(2))
//         : totalVisits > 0
//           ? Number((totalRevenue / totalVisits).toFixed(2))
//           : 0;

//       const totals = {
//         visits: totalVisits,
//         orders: totalOrders,
//         revenue: totalRevenue,
//         adSpend: totalAdSpend,
//         profit: totalProfit,
//         roas: overallRoas,
//       };

//       result = {
//         data,
//         totals,
//         generatedAt: new Date().toISOString(),
//       };
//     }

//     // ================================================================
//     // 📊 B. CONVERSION FUNNEL (Funnel Drops — DB Lookup Aggregate)
//     // ================================================================
//     else if (slug === "conversion-funnel") {
//       const eventsAgg = await UserEvent.aggregate([
//         {
//           $match: {
//             eventType: { $in: ["page_view", "add_to_cart", "checkout_start"] },
//             createdAt: { $gte: start, $lte: end }
//           }
//         },
//         {
//           $lookup: {
//             from: "usersessions",
//             localField: "sessionId",
//             foreignField: "sessionId",
//             as: "session"
//           }
//         },
//         { $unwind: "$session" },
//         {
//           $match: {
//             "session.utmCampaign": { $nin: [null, "", "None", "Direct"] }
//           }
//         },
//         {
//           $group: {
//             _id: {
//               campaign: "$session.utmCampaign",
//               eventType: "$eventType"
//             },
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       const purchasesAgg = await Order.aggregate([
//         {
//           $match: {
//             status: { $in: REVENUE_STATUSES },
//             "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
//             createdAt: { $gte: start, $lte: end }
//           }
//         },
//         {
//           $group: {
//             _id: "$trafficSource.utmCampaign",
//             purchases: { $sum: 1 }
//           }
//         }
//       ]);

//       if (eventsAgg.length === 0 && purchasesAgg.length === 0) {
//         return {
//           success: true,
//           data: { data: [], totals: {}, generatedAt: new Date().toISOString() },
//         };
//       }

//       const campaignData = new Map<
//         string,
//         { views: number; addToCart: number; checkout: number; purchases: number }
//       >();

//       for (const e of eventsAgg) {
//         const campaign = e._id.campaign;
//         const type = e._id.eventType;
//         const count = e.count || 0;

//         if (!campaignData.has(campaign)) {
//           campaignData.set(campaign, { views: 0, addToCart: 0, checkout: 0, purchases: 0 });
//         }
//         const metrics = campaignData.get(campaign)!;

//         if (type === "page_view") metrics.views += count;
//         else if (type === "add_to_cart") metrics.addToCart += count;
//         else if (type === "checkout_start") metrics.checkout += count;
//       }

//       for (const p of purchasesAgg) {
//         const campaign = p._id;
//         if (!campaignData.has(campaign)) {
//           campaignData.set(campaign, { views: 0, addToCart: 0, checkout: 0, purchases: 0 });
//         }
//         campaignData.get(campaign)!.purchases += p.purchases || 0;
//       }

//       const data: AcquisitionReportRow[] = [];
//       let totalVisits = 0;
//       let totalAdds = 0;
//       let totalCheckouts = 0;
//       let totalPurchases = 0;

//       for (const [campaign, metrics] of campaignData.entries()) {
//         const { views, addToCart, checkout, purchases } = metrics;

//         if (views === 0 && addToCart === 0 && checkout === 0 && purchases === 0) continue;

//         // ✅ FIX 1: Capped zero-floor prevents negative drop-off rate anomalies on tracking leaks
//         const dropOffRate = views > 0 ? Number(Math.max(0, ((views - purchases) / views) * 100).toFixed(1)) : 0;

//         data.push({
//           campaign,
//           views,
//           addToCart,
//           checkout,
//           purchases,
//           dropOffRate,
//         });

//         totalVisits += views;
//         totalAdds += addToCart;
//         totalCheckouts += checkout;
//         totalPurchases += purchases;
//       }

//       data.sort((a, b) => (b.views || 0) - (a.views || 0));

//       const totals = {
//         views: totalVisits,
//         addToCart: totalAdds,
//         checkout: totalCheckouts,
//         purchases: totalPurchases,
//         // ✅ FIX 2: Capped zero-floor total drop-off rate
//         dropOffRate: totalVisits > 0 ? Number(Math.max(0, ((totalVisits - totalPurchases) / totalVisits) * 100).toFixed(1)) : 0,
//       };

//       result = {
//         data: data.slice(0, 50),
//         totals,
//         generatedAt: new Date().toISOString(),
//       };
//     } else {
//       return { success: false, error: "Invalid acquisition report slug." };
//     }

//     // Save to Redis Cache (5 minutes TTL)
//     try {
//       await redis.set(cacheKey, safeStringify(result), { ex: 300 });
//       console.log(`✅ Acquisition Report cached (Full Unit Economics & zero-floor active): ${slug}`);
//     } catch (cacheError) {
//       console.warn("⚠️ Failed to cache acquisition report:", cacheError);
//     }

//     return { success: true, data: result };
//   } catch (error: any) {
//     console.error(`❌ Acquisition Report Error (${slug}):`, error.message);
//     return {
//       success: false,
//       error: error.message || "Failed to fetch acquisition report data.",
//     };
//   }
// }
// 📂 src/app/features/admin/reports/actions/getAcquisitionReportData.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE (Option 1 Path)
import {
  buildCampaignAttributionMatrix,
  buildCampaignFunnelMatrix,
  UnifiedCampaignAttributionItem,
  UnifiedCampaignFunnelItem,
} from "@/app/features/admin/shared/engines/campaignAttributionEngine";

// ================================================================
// ✅ TYPES
// ================================================================
export interface AcquisitionReportRow {
  campaign?: string;
  source?: string;
  visits?: number;
  orders?: number;
  revenue?: number;
  adSpend?: number; // Snapshotted Campaign Ad Spend in PKR
  profit?: number;  // Pure Net Profit in PKR
  roas?: number;    // True Financial ROAS (Revenue / AdSpend)
  views?: number;
  addToCart?: number;
  checkout?: number;
  purchases?: number;
  dropOffRate?: number;
  bounceRate?: number;
}

export interface AcquisitionReportResponse {
  data: AcquisitionReportRow[];
  totals: {
    visits?: number;
    orders?: number;
    revenue?: number;
    adSpend?: number;
    profit?: number;
    roas?: number;
    views?: number;
    addToCart?: number;
    checkout?: number;
    purchases?: number;
    dropOffRate?: number;
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN REPORT COMPILER (Acquisition & Growth Reports)
// ================================================================
export async function getAcquisitionReportData(
  range: { startDate: Date; endDate: Date },
  slug: "utm-attribution" | "conversion-funnel"
): Promise<{ success: boolean; data?: AcquisitionReportResponse; error?: string }> {
  const cacheKey = `analytics_acquisition_v9_${slug}_${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<AcquisitionReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Acquisition Report (${slug})`);
      return { success: true, data: parsed };
    }

    await connectMongoose();
    const start = startOfDay(new Date(range.startDate));
    const end = endOfDay(new Date(range.endDate));

    let result: AcquisitionReportResponse;

    // ================================================================
    // 📊 A. UTM ATTRIBUTION (Campaign ROI — Central Engine)
    // ================================================================
    if (slug === "utm-attribution") {
      const engineResult = await buildCampaignAttributionMatrix({
        startDate: start,
        endDate: end,
      });

      const data: AcquisitionReportRow[] = engineResult.data.map((item: UnifiedCampaignAttributionItem) => ({
        campaign: item.campaign,
        source: item.source,
        visits: item.visits,
        orders: item.orders,
        revenue: item.revenue,
        adSpend: item.adSpend,
        profit: item.profit,
        roas: item.roas,
      }));

      const totals = {
        visits: engineResult.summary.totalVisits,
        orders: engineResult.summary.totalOrders,
        revenue: engineResult.summary.totalRevenue,
        adSpend: engineResult.summary.totalAdSpend,
        profit: engineResult.summary.totalProfit,
        roas: engineResult.summary.overallRoas,
      };

      result = {
        data,
        totals,
        generatedAt: engineResult.generatedAt,
      };
    }

    // ================================================================
    // 📊 B. CONVERSION FUNNEL (Funnel Drops — Central Engine)
    // ================================================================
    else if (slug === "conversion-funnel") {
      const engineResult = await buildCampaignFunnelMatrix({
        startDate: start,
        endDate: end,
      });

      const data: AcquisitionReportRow[] = engineResult.data.map((item: UnifiedCampaignFunnelItem) => ({
        campaign: item.campaign,
        views: item.views,
        addToCart: item.addToCarts,
        checkout: item.checkouts,
        purchases: item.purchases,
        dropOffRate: item.dropOffRate,
      }));

      const totalVisits = engineResult.data.reduce((s, i) => s + i.views, 0);
      const totalPurchases = engineResult.data.reduce((s, i) => s + i.purchases, 0);

      const totals = {
        views: totalVisits,
        addToCart: engineResult.data.reduce((s, i) => s + i.addToCarts, 0),
        checkout: engineResult.data.reduce((s, i) => s + i.checkouts, 0),
        purchases: totalPurchases,
        dropOffRate: totalVisits > 0 ? Number(Math.max(0, ((totalVisits - totalPurchases) / totalVisits) * 100).toFixed(1)) : 0,
      };

      result = {
        data: data.slice(0, 50),
        totals,
        generatedAt: engineResult.generatedAt,
      };
    } else {
      return { success: false, error: "Invalid acquisition report slug." };
    }

    // Save to Redis Cache (5 minutes TTL)
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`✅ Acquisition Report cached: ${slug}`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache acquisition report:", cacheError);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error(`❌ Acquisition Report Error (${slug}):`, error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch acquisition report data.",
    };
  }
}