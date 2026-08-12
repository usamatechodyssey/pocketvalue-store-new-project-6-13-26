// // 📂 src/app/features/admin/reports/actions/getSalesReportData.ts (TITLE MAP SHIELDED & RATIO CAPPED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import UserEvent from "@/models/UserEvent";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { format, startOfDay, endOfDay } from "date-fns";
// import { Types } from "mongoose"; // ✅ BSON Shield

// // ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface SalesReportRow {
//   productId?: string;
//   sku?: string;
//   productName?: string;
//   unitsSold?: number;
//   revenue?: number;
//   profit?: number;    
//   margin?: number;
//   roiPercent?: number; 
//   stockLeft?: number;
//   returnRate?: number;

//   // Product Friction
//   views?: number;
//   addToCarts?: number;
//   purchases?: number;
//   viewToCart?: number;
//   cartToOrder?: number;
//   frictionType?: "LOW_INTEREST" | "PRICE_BARRIER" | "HEALTHY";

//   // Coupons
//   code?: string;
//   redemptions?: number;
//   totalDiscount?: number;
//   roi?: number;
//   date?: string;
// }

// export interface SalesReportResponse {
//   data: SalesReportRow[];
//   totals: {
//     totalRevenue: number;
//     totalUnits?: number;
//     totalDiscounts?: number;
//     totalProfit?: number; 
//     redemptions?: number;
//   };
//   generatedAt: string;
// }

// // ================================================================
// // 🛡️ ATOMIC LOCK RELEASE
// // ================================================================
// const LUA_RELEASE_LOCK = `
//   if redis.call("get", KEYS[1]) == ARGV[1] then
//     return redis.call("del", KEYS[1])
//   else
//     return 0
//   end
// `;

// const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
//   try {
//     const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
//     if (result === 1) console.log(`🔓 Sales Report Lock released (${requestId}).`);
//   } catch (error) {
//     console.error("Sales Report Lock release error:", error);
//   }
// };

// // ================================================================
// // 🧠 RETAIL FUNNEL CLASSIFICATION LOGIC
// // ================================================================
// const getFrictionType = (
//   views: number,
//   addToCarts: number,
//   purchases: number
// ): "LOW_INTEREST" | "PRICE_BARRIER" | "HEALTHY" => {
//   const cartToOrderRate = addToCarts > 0 ? (purchases / addToCarts) * 100 : 0;
//   const viewToCartRate = views > 0 ? (addToCarts / views) * 100 : 0;

//   // 1. PRICE BARRIER: Customer added to cart (showed interest!), but dropped out before buying
//   if (addToCarts > 0 && cartToOrderRate < 20) {
//     return "PRICE_BARRIER"; // High Cart Drop-off (Price/Shipping/Checkout Friction)
//   }

//   // 2. LOW INTEREST: Customer visited page, but didn't even add to cart
//   if (views > 0 && addToCarts === 0 && viewToCartRate < 10) {
//     return "LOW_INTEREST"; // Page viewed, but zero intent to buy
//   }

//   // 3. HEALTHY: Normal conversion flow
//   return "HEALTHY";
// };

// // ================================================================
// // 🚀 MAIN REPORT COMPILER (3 Reports Engine)
// // ================================================================
// export async function getSalesReportData(
//   range: { startDate: Date; endDate: Date },
//   slug: "best-sellers-sku" | "product-friction" | "coupons-performance"
// ): Promise<{ success: boolean; data?: SalesReportResponse; error?: string }> {
//   const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
//   const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
//   const cacheKey = `analytics_sales_v10_${slug}_${fromStr}_${toStr}`;

//   try {
//     await verifyStaff(["admin", "manager", "editor"]);

//     // 1. Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<SalesReportResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Sales Report (${slug})`);
//       return { success: true, data: parsed };
//     }

//     // 2. Lock Cache Stampede
//     const LOCK_TTL = 30;
//     const lockKey = `lock:${cacheKey}`;
//     const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

//     if (!lockAcquired) {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const retryCache = await redis.get(cacheKey);
//       const retryParsed = safeParse<SalesReportResponse>(retryCache as string | null);
//       if (retryParsed) return { success: true, data: retryParsed };
//       return { success: false, error: "Report generation in progress." };
//     }

//     try {
//       await connectMongoose();
//       const start = startOfDay(new Date(range.startDate));
//       const end = endOfDay(new Date(range.endDate));

//       let result: SalesReportResponse;

//       // ================================================================
//       // 📊 REPORT 1: BEST SELLERS (SKU PERFORMANCE)
//       // ================================================================
//       if (slug === "best-sellers-sku") {
//         const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "Cancelled", "RTO", "Rejected"]));
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: STATUS_QUERY } } },
//           { $unwind: "$products" },
//           {
//             $group: {
//               _id: "$products.sku",
//               productId: { $first: "$products.productId" },
//               productName: { $first: "$products.name" },
//               sku: { $first: "$products.sku" },
//               unitsSold: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.quantity", 0] }, 0] } },
//               revenue: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] }, 0] } },
//               profit: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.profit", 0] }, 0] } },
//               capital: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.capital", 0] }, 0] } },
//               fees: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.fees", 0] }, 0] } },
//               tax: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.tax", 0] }, 0] } },
//               totalDuties: {
//                 $sum: {
//                   $cond: [
//                     { $in: ["$status", REVENUE_STATUSES] },
//                     { $multiply: [{ $ifNull: ["$products.capital", 0] }, { $divide: [{ $ifNull: ["$products.appliedDutiesRate", 0] }, 100] }] },
//                     0
//                   ]
//                 }
//               },
//               totalAdSpend: {
//                 $sum: {
//                   $cond: [
//                     { $in: ["$status", REVENUE_STATUSES] },
//                     { $multiply: [{ $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] }, { $divide: [{ $ifNull: ["$products.appliedAdSpendRate", 0] }, 100] }] },
//                     0
//                   ]
//                 }
//               },
//               returnedUnits: { $sum: { $cond: [{ $in: ["$status", ["Cancelled", "RTO", "Rejected"]] }, { $ifNull: ["$products.quantity", 0] }, 0] } }
//             }
//           },
//           { $sort: { revenue: -1 } }
//         ]);

//         const rawProductIds = aggregation.map((p) => p.productId).filter(Boolean);
//         const validObjectIds = rawProductIds.filter((id) => Types.ObjectId.isValid(String(id)));

//         const stockMap = new Map<string, number>();

//         if (validObjectIds.length > 0) {
//             const payload = await getSafePayload();
//             let payloadPage = 1;
//             const payloadLimit = 100;
//             let hasMore = true;

//             while (hasMore && payloadPage <= 500) {
//               const productsResult = await payload.find({ 
//                 collection: "products", 
//                 where: { id: { in: validObjectIds } }, 
//                 depth: 0, 
//                 page: payloadPage,
//                 limit: payloadLimit 
//               });

//               for (const prod of productsResult.docs) {
//                 for (const variant of prod.variants || []) {
//                   if (variant.sku) {
//                     stockMap.set(variant.sku, variant.stock || 0);
//                   }
//                 }
//               }

//               hasMore = productsResult.hasNextPage ?? false;
//               payloadPage++;
//             }
//         }

//         const data: SalesReportRow[] = aggregation.map((item: any) => {
//           const cogs = item.capital || 0;
//           const profit = item.profit || 0;
//           const fees = item.fees || 0;
//           const tax = item.tax || 0;
//           const duties = Math.round(item.totalDuties || 0);
//           const adSpend = Math.round(item.totalAdSpend || 0);

//           const netProductRevenue = cogs + fees + tax + duties + adSpend + profit;

//           const margin = netProductRevenue > 0 ? (profit / netProductRevenue) * 100 : 0;
//           const roi = cogs > 0 ? (profit / cogs) * 100 : 0;
          
//           const totalUnits = item.unitsSold + item.returnedUnits;
//           const returnRate = totalUnits > 0 ? (item.returnedUnits / totalUnits) * 100 : 0;

//           return {
//             sku: item.sku || "N/A",
//             productName: item.productName || "Unknown",
//             unitsSold: item.unitsSold || 0,
//             revenue: netProductRevenue,
//             profit,
//             margin: Number(margin.toFixed(1)),
//             roiPercent: Number(roi.toFixed(1)),
//             stockLeft: stockMap.get(item.sku) || 0,
//             returnRate: Number(returnRate.toFixed(1))
//           };
//         });

//         result = { 
//           data, 
//           totals: { 
//             totalRevenue: data.reduce((s, r) => s + (r.revenue || 0), 0), 
//             totalUnits: data.reduce((s, r) => s + (r.unitsSold || 0), 0), 
//             totalProfit: data.reduce((s, r) => s + (r.profit || 0), 0) 
//           }, 
//           generatedAt: new Date().toISOString() 
//         };
//       }

//        // ================================================================
//       // 📊 REPORT 2: PRODUCT FRICTION (SKU MAPPED & FULL TRANSPARENCY)
//       // ================================================================
//       else if (slug === "product-friction") {
//         const [viewsAgg, addsAgg, purchasesAgg] = await Promise.all([
//           UserEvent.aggregate([
//             {
//               $match: {
//                 eventType: "page_view",
//                 "metadata.productId": { $exists: true, $nin: [null, ""] },
//                 createdAt: { $gte: start, $lte: end },
//               },
//             },
//             { $group: { _id: "$metadata.productId", views: { $sum: 1 } } },
//             { $match: { views: { $gte: 1 } } },
//           ]),
//           UserEvent.aggregate([
//             {
//               $match: {
//                 eventType: "add_to_cart",
//                 "metadata.productId": { $exists: true, $nin: [null, ""] },
//                 createdAt: { $gte: start, $lte: end },
//               },
//             },
//             { $group: { _id: "$metadata.productId", adds: { $sum: 1 } } },
//           ]),
//           Order.aggregate([
//             { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
//             { $unwind: "$products" },
//             { $group: { _id: "$products.productId", buys: { $sum: { $ifNull: ["$products.quantity", 0] } }, sku: { $first: "$products.sku" } } },
//           ]),
//         ]);

//         const viewMap = new Map(viewsAgg.map((v) => [String(v._id), v.views]));
//         const addMap = new Map(addsAgg.map((a) => [String(a._id), a.adds]));
//         const buyMap = new Map(purchasesAgg.map((p) => [String(p._id), p.buys]));
//         const skuMap = new Map(purchasesAgg.map((p) => [String(p._id), p.sku]));

//         const rawIds = Array.from(new Set([...viewMap.keys(), ...addMap.keys(), ...buyMap.keys()]));
//         const allIds = rawIds.filter(
//           (id) => id && id !== "null" && id !== "undefined" && id.trim().length > 0
//         );

//         const validObjectIds = allIds.filter((id) => Types.ObjectId.isValid(String(id)));
//         const titleMap = new Map<string, string>();

//         if (validObjectIds.length > 0) {
//           const payload = await getSafePayload();
//           let payloadPage = 1;
//           const payloadLimit = 100;
//           let hasMore = true;

//           while (hasMore && payloadPage <= 500) {
//             const cmsProducts = await payload.find({
//               collection: "products",
//               where: { id: { in: validObjectIds } },
//               depth: 0,
//               page: payloadPage,
//               limit: payloadLimit,
//             });

//             for (const p of cmsProducts.docs) {
//               if (p.id) titleMap.set(String(p.id), String(p.title || ""));
//               if ((p as any)._id) titleMap.set(String((p as any)._id), String(p.title || ""));
//             }

//             hasMore = cmsProducts.hasNextPage ?? false;
//             payloadPage++;
//           }
//         }

//         const data: SalesReportRow[] = allIds
//           .map((id) => {
//             const v = viewMap.get(id) || 0;
//             const a = addMap.get(id) || 0;
//             const b = buyMap.get(id) || 0;
            
//             const rawV2C = v > 0 ? (a / v) * 100 : 0;
//             const rawC2O = a > 0 ? (b / a) * 100 : 0;

//             const v2c = Math.min(100, rawV2C);
//             const c2o = Math.min(100, rawC2O);

//             const type = getFrictionType(v, a, b);

//             const name = titleMap.get(id) || `Product #${id.slice(-6)}`;
//             const sku = skuMap.get(id) || `SKU-${id.slice(-6).toUpperCase()}`; // ✅ SKU Mapped!

//             return {
//               sku, // ✅ SKU Column Value
//               productName: name,
//               views: v,
//               addToCarts: a,
//               purchases: b,
//               viewToCart: Number(v2c.toFixed(1)),
//               cartToOrder: Number(c2o.toFixed(1)),
//               frictionType: type,
//             };
//           })
//           .sort((a, b) => (b.views || 0) - (a.views || 0));

//         result = { data, totals: { totalRevenue: 0 }, generatedAt: new Date().toISOString() };
//       }


//       // ================================================================
//       // 📊 REPORT 3: COUPONS PERFORMANCE (COUPON ROI)
//       // ================================================================
//       else if (slug === "coupons-performance") {
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES }, "coupon.code": { $exists: true, $ne: null } } },
//           { $group: { _id: "$coupon.code", count: { $sum: 1 }, discount: { $sum: { $ifNull: ["$coupon.amount", 0] } }, revenue: { $sum: "$totalPrice" } } }
//         ]);

//         const data: SalesReportRow[] = aggregation.map(item => ({
//           code: item._id,
//           redemptions: item.count,
//           totalDiscount: item.discount,
//           revenue: item.revenue,
//           roi: item.discount > 0 ? Number(((item.revenue / item.discount) * 100).toFixed(1)) : 0
//         }));

//         result = { 
//           data, 
//           totals: { 
//             totalRevenue: data.reduce((s, r) => s + (r.revenue || 0), 0), 
//             redemptions: data.reduce((s, r) => s + (r.redemptions || 0), 0) 
//           }, 
//           generatedAt: new Date().toISOString() 
//         };
//       } else {
//         return { success: false, error: "Invalid report slug specified." };
//       }

//       await redis.set(cacheKey, safeStringify(result), { ex: 300 });
//       console.log(`✅ Sales Report "${slug}" compiled and cached successfully.`);

//       return { success: true, data: result };
//     } finally {
//       await releaseLock(lockKey, requestId);
//     }
//   } catch (error: any) {
//     console.error("❌ Sales Report Engine Exception:", error.message);
//     return { success: false, error: error.message };
//   }
// }
// 📂 src/app/features/admin/reports/actions/getSalesReportData.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ SHARED CENTRAL ENGINES (Option 1 Path)
import {
  buildProductFrictionMatrix,
  UnifiedFrictionProduct,
} from "@/app/features/admin/shared/engines/productFrictionEngine";
import {
  buildSkuPerformanceMatrix,
  UnifiedSkuPerformanceItem,
} from "@/app/features/admin/shared/engines/skuPerformanceEngine";
import {
  buildCouponPerformanceMatrix,
  UnifiedCouponPerformanceItem,
} from "@/app/features/admin/shared/engines/couponPerformanceEngine";

// ================================================================
// ✅ TYPES
// ================================================================
export interface SalesReportRow {
  productId?: string;
  sku?: string;
  productName?: string;
  unitsSold?: number;
  revenue?: number;
  profit?: number;    
  margin?: number;
  roiPercent?: number; 
  stockLeft?: number;
  returnRate?: number;

  // Product Friction
  views?: number;
  addToCarts?: number;
  purchases?: number;
  viewToCart?: number;
  cartToOrder?: number;
  potentialLostRevenue?: number; // Est. Lost Sales in PKR
  frictionType?: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";

  // Coupons
  code?: string;
  redemptions?: number;
  totalDiscount?: number;
  roi?: number;
  date?: string;
}

export interface SalesReportResponse {
  data: SalesReportRow[];
  totals: {
    totalRevenue: number;
    totalUnits?: number;
    totalDiscounts?: number;
    totalProfit?: number; 
    redemptions?: number;
  };
  generatedAt: string;
}

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE
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
    if (result === 1) console.log(`🔓 Sales Report Lock released (${requestId}).`);
  } catch (error) {
    console.error("Sales Report Lock release error:", error);
  }
};

// ================================================================
// 🚀 MAIN REPORT COMPILER (3 Reports Engine)
// ================================================================
export async function getSalesReportData(
  range: { startDate: Date; endDate: Date },
  slug: "best-sellers-sku" | "product-friction" | "coupons-performance"
): Promise<{ success: boolean; data?: SalesReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_sales_v13_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<SalesReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Sales Report (${slug})`);
      return { success: true, data: parsed };
    }

    // 2. Lock Cache Stampede
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<SalesReportResponse>(retryCache as string | null);
      if (retryParsed) return { success: true, data: retryParsed };
      return { success: false, error: "Report generation in progress." };
    }

    try {
      await connectMongoose();
      const start = startOfDay(new Date(range.startDate));
      const end = endOfDay(new Date(range.endDate));

      let result: SalesReportResponse;

      // ================================================================
      // 📊 REPORT 1: BEST SELLERS (SKU PERFORMANCE - CENTRAL ENGINE)
      // ================================================================
      if (slug === "best-sellers-sku") {
        const engineResult = await buildSkuPerformanceMatrix({
          startDate: start,
          endDate: end,
        });

        const data: SalesReportRow[] = engineResult.data.map((item: UnifiedSkuPerformanceItem) => ({
          sku: item.sku,
          productName: item.variantName && item.variantName !== "Default Variant"
            ? `${item.productName} (${item.variantName})`
            : item.productName,
          unitsSold: item.unitsSold,
          revenue: item.grossRevenue,
          profit: item.profit,
          margin: item.marginPercent,
          roiPercent: item.roiPercent,
          stockLeft: item.stockLeft,
          returnRate: item.returnRate,
        }));

        result = {
          data,
          totals: {
            totalRevenue: engineResult.summary.totalRevenue,
            totalUnits: engineResult.summary.totalUnitsSold,
            totalProfit: engineResult.summary.totalProfit,
          },
          generatedAt: engineResult.generatedAt,
        };
      }

      // ================================================================
      // 📊 REPORT 2: PRODUCT FRICTION (CENTRAL ENGINE)
      // ================================================================
      else if (slug === "product-friction") {
        const engineResult = await buildProductFrictionMatrix(
          { startDate: start, endDate: end },
          { includeHealthy: true }
        );

        const data: SalesReportRow[] = engineResult.data.map((item: UnifiedFrictionProduct) => ({
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          views: item.views,
          addToCarts: item.addToCarts,
          purchases: item.purchases,
          viewToCart: item.viewToCartRate,
          cartToOrder: item.cartToOrderRate,
          potentialLostRevenue: item.potentialLostRevenue,
          frictionType: item.frictionType,
        }));

        result = {
          data,
          totals: {
            totalRevenue: engineResult.summary.totalLostSales,
          },
          generatedAt: engineResult.generatedAt,
        };
      }

      // ================================================================
      // 📊 REPORT 3: COUPONS PERFORMANCE (COUPON ROI - CENTRAL ENGINE)
      // ================================================================
      else if (slug === "coupons-performance") {
        const engineResult = await buildCouponPerformanceMatrix({
          startDate: start,
          endDate: end,
        });

        const data: SalesReportRow[] = engineResult.data.map((item: UnifiedCouponPerformanceItem) => ({
          code: item.code,
          redemptions: item.redemptions,
          totalDiscount: item.totalDiscount,
          revenue: item.revenue,
          roi: item.roi,
        }));

        result = {
          data,
          totals: {
            totalRevenue: engineResult.summary.totalAttributedRevenue,
            redemptions: engineResult.summary.totalRedemptions,
            totalDiscounts: engineResult.summary.totalDiscountAmount,
          },
          generatedAt: engineResult.generatedAt,
        };
      } else {
        return { success: false, error: "Invalid report slug specified." };
      }

      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`✅ Sales Report "${slug}" compiled and cached successfully.`);

      return { success: true, data: result };
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("❌ Sales Report Engine Exception:", error.message);
    return { success: false, error: error.message };
  }
}