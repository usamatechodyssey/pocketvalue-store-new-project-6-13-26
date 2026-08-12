// // 📂 src/app/features/admin/marketing/actions/getProductFriction.ts (SENSITIVITY THRESHOLD HARDENED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import UserEvent from "@/models/UserEvent";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { Types } from "mongoose";
// import { format, startOfDay, endOfDay, subDays } from "date-fns";

// // ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface ProductFrictionMetric {
//   productId: string;
//   productName: string;           
//   views: number;
//   addToCarts: number;
//   purchasedQty: number;
//   viewToCartRate: number;        // %
//   cartToOrderRate: number;       // %
//   potentialLostRevenue: number;  // Lost Sales in PKR
//   frictionType: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";
// }

// export interface ProductFrictionResponse {
//   data: ProductFrictionMetric[];
//   totalFrictionCount: number;
//   generatedAt: string;
// }

// // ================================================================
// // 📊 SENSITIVITY THRESHOLDS (Enterprise Calibrated)
// // ================================================================
// const VIEW_THRESHOLD = 1;              // Flags activity starting at 1+ view
// const ADD_THRESHOLD = 1;               // Flags activity starting at 1+ cart add
// const LOW_INTEREST_THRESHOLD = 0.3;    // 30% view-to-cart sensitivity threshold
// const PRICE_BARRIER_THRESHOLD = 0.6;   // ✅ 60% cart-to-order sensitivity threshold

// // ================================================================
// // 🚀 MAIN ACTION
// // ================================================================
// export async function getProductFriction(
//   range?: { startDate: Date; endDate: Date }
// ): Promise<{
//   success: boolean;
//   data?: ProductFrictionResponse;
//   error?: string;
// }> {
//   // Default to Last 30 Days if no range provided
//   const today = new Date();
//   const start = range?.startDate ? startOfDay(new Date(range.startDate)) : startOfDay(subDays(today, 30));
//   const end = range?.endDate ? endOfDay(new Date(range.endDate)) : endOfDay(today);

//   const fromStr = format(start, "yyyy-MM-dd");
//   const toStr = format(end, "yyyy-MM-dd");
//   const cacheKey = `analytics_product_friction_v7_${fromStr}_${toStr}`;

//   try {
//     await verifyStaff(["admin", "manager", "editor"]);

//     // 1. Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<ProductFrictionResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Product Friction (${fromStr} to ${toStr})`);
//       return { success: true, data: parsed };
//     }

//     await connectMongoose();

//     // ================================================================
//     // 2. FETCH USER EVENTS WITHIN TIMEFRAME
//     // ================================================================

//     // 2a. Fetch Page Views per product within date range
//     const viewsAggregation = await UserEvent.aggregate([
//       {
//         $match: {
//           eventType: "page_view",
//           "metadata.productId": { $exists: true, $nin: [null, ""] },
//           createdAt: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: "$metadata.productId",
//           views: { $sum: 1 },
//         },
//       },
//     ]);

//     // 2b. Fetch Add-to-Carts per product within date range
//     const addsAggregation = await UserEvent.aggregate([
//       {
//         $match: {
//           eventType: "add_to_cart",
//           "metadata.productId": { $exists: true, $nin: [null, ""] },
//           createdAt: { $gte: start, $lte: end },
//         },
//       },
//       {
//         $group: {
//           _id: "$metadata.productId",
//           addToCarts: { $sum: 1 },
//         },
//       },
//     ]);

//     // ================================================================
//     // 3. FETCH PURCHASES FROM ORDERS WITHIN TIMEFRAME
//     // ================================================================
//     const orderAggregation = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start, $lte: end },
//           status: { $in: REVENUE_STATUSES },
//         },
//       },
//       { $unwind: "$products" },
//       {
//         $group: {
//           _id: "$products.productId",
//           purchasedQty: { $sum: { $ifNull: ["$products.quantity", 0] } },
//           unitPrice: { $first: "$products.price" },
//         },
//       },
//     ]);

//     // ================================================================
//     // 4. MERGE DATA INTO MAP
//     // ================================================================
//     const productMap = new Map<
//       string,
//       {
//         views: number;
//         addToCarts: number;
//         purchasedQty: number;
//         unitPrice: number;
//       }
//     >();

//     for (const item of viewsAggregation) {
//       if (!item._id) continue;
//       productMap.set(String(item._id), {
//         views: item.views || 0,
//         addToCarts: 0,
//         purchasedQty: 0,
//         unitPrice: 0,
//       });
//     }

//     for (const item of addsAggregation) {
//       if (!item._id) continue;
//       const key = String(item._id);
//       if (productMap.has(key)) {
//         productMap.get(key)!.addToCarts = item.addToCarts || 0;
//       } else {
//         productMap.set(key, {
//           views: 0,
//           addToCarts: item.addToCarts || 0,
//           purchasedQty: 0,
//           unitPrice: 0,
//         });
//       }
//     }

//     for (const item of orderAggregation) {
//       if (!item._id) continue;
//       const key = String(item._id);
//       if (productMap.has(key)) {
//         const existing = productMap.get(key)!;
//         existing.purchasedQty = item.purchasedQty || 0;
//         existing.unitPrice = item.unitPrice || 0;
//       } else {
//         productMap.set(key, {
//           views: 0,
//           addToCarts: 0,
//           purchasedQty: item.purchasedQty || 0,
//           unitPrice: item.unitPrice || 0,
//         });
//       }
//     }

//     // ================================================================
//     // 5. BATCH FETCH PRODUCT TITLES FROM PAYLOAD CMS (Dual BSON Map Shield)
//     // ================================================================
//     const rawProductIds = Array.from(productMap.keys());
//     const validObjectIds = rawProductIds.filter((id) => Types.ObjectId.isValid(String(id)));
//     const productTitleMap = new Map<string, { title: string; price: number }>();

//     if (validObjectIds.length > 0) {
//       try {
//         const payload = await getSafePayload();
//         let payloadPage = 1;
//         const payloadLimit = 100;
//         let hasMore = true;

//         while (hasMore && payloadPage <= 500) {
//           const productDocs = await payload.find({
//             collection: "products",
//             where: { id: { in: validObjectIds } },
//             limit: payloadLimit,
//             page: payloadPage,
//             depth: 0,
//             select: { id: true, title: true, variants: true },
//           });

//           for (const doc of productDocs.docs) {
//             const firstVariantPrice = doc.variants?.[0]?.price || 0;
//             const info = {
//               title: doc.title || "Untitled Product",
//               price: firstVariantPrice,
//             };
//             if (doc.id) productTitleMap.set(String(doc.id), info);
//             if ((doc as any)._id) productTitleMap.set(String((doc as any)._id), info);
//           }

//           hasMore = productDocs.hasNextPage ?? false;
//           payloadPage++;
//         }
//       } catch (payloadError) {
//         console.warn("⚠️ Failed to batch fetch product titles:", payloadError);
//       }
//     }

//     // ================================================================
//     // 6. CALCULATE FRICTION METRICS & LOST REVENUE
//     // ================================================================
//     const finalData: ProductFrictionMetric[] = [];

//     for (const [productId, metrics] of productMap) {
//       const { views, addToCarts, purchasedQty, unitPrice } = metrics;

//       // Implied Cart Additions
//       const effectiveAdds = Math.max(addToCarts, purchasedQty);

//       if (views < VIEW_THRESHOLD && effectiveAdds < ADD_THRESHOLD && purchasedQty === 0) {
//         continue;
//       }

//       // Calculate Rates
//       const viewToCartRate = views > 0 ? Number(Math.min(100, (effectiveAdds / views) * 100).toFixed(1)) : 0;
//       const cartToOrderRate = effectiveAdds > 0 ? Number(Math.min(100, (purchasedQty / effectiveAdds) * 100).toFixed(1)) : 0;

//       // Product Title & Price Resolution
//       const productInfo = productTitleMap.get(String(productId));
//       const productName = productInfo?.title || "Product #" + String(productId).slice(-6);
//       const effectivePrice = unitPrice || productInfo?.price || 0;

//       // Lost Sales Calculation (Unpurchased Carts * Effective Price)
//       const unpurchasedCarts = Math.max(0, effectiveAdds - purchasedQty);
//       const potentialLostRevenue = Math.round(unpurchasedCarts * effectivePrice);

//       // Determine Friction Category
//       let frictionType: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY" = "HEALTHY";

//       // 1. CRITICAL DROPOFF: Cart additions but ZERO purchases!
//       if (effectiveAdds >= 1 && purchasedQty === 0) {
//         frictionType = "CRITICAL_DROPOFF";
//       } 
//       // 2. PRICE BARRIER: Cart adds exist, but conversion < 60%
//       else if (effectiveAdds >= ADD_THRESHOLD && cartToOrderRate < PRICE_BARRIER_THRESHOLD * 100) {
//         frictionType = "PRICE_BARRIER"; // ✅ Flags 50% conversion rate as PRICE_BARRIER
//       } 
//       // 3. LOW INTEREST: High views, but < 30% view-to-cart
//       else if (views >= VIEW_THRESHOLD && viewToCartRate < LOW_INTEREST_THRESHOLD * 100) {
//         frictionType = "LOW_INTEREST";
//       }

//       if (frictionType === "HEALTHY") continue;

//       finalData.push({
//         productId: String(productId),
//         productName,
//         views,
//         addToCarts: effectiveAdds,
//         purchasedQty,
//         viewToCartRate,
//         cartToOrderRate,
//         potentialLostRevenue,
//         frictionType,
//       });
//     }

//     // Sort Priority: CRITICAL_DROPOFF (0), PRICE_BARRIER (1), LOW_INTEREST (2), then highest lost sales
//     finalData.sort((a, b) => {
//       const priority = { CRITICAL_DROPOFF: 0, PRICE_BARRIER: 1, LOW_INTEREST: 2, HEALTHY: 3 };
//       if (priority[a.frictionType] !== priority[b.frictionType]) {
//         return priority[a.frictionType] - priority[b.frictionType];
//       }
//       return b.potentialLostRevenue - a.potentialLostRevenue;
//     });

//     const limitedData = finalData.slice(0, 50);

//     const response: ProductFrictionResponse = {
//       data: limitedData,
//       totalFrictionCount: finalData.length,
//       generatedAt: new Date().toISOString(),
//     };

//     // Cache safely for 5 minutes
//     try {
//       const stringified = safeStringify(response);
//       await redis.set(cacheKey, stringified, { ex: 300 });
//       console.log(`💾 Product Friction cached (${fromStr} to ${toStr}).`);
//     } catch (cacheError) {
//       console.warn("⚠️ Failed to write product friction to Redis:", cacheError);
//     }

//     return { success: true, data: response };
//   } catch (error: any) {
//     console.error("❌ Product Friction Error:", error.message);
//     return {
//       success: false,
//       error: error.message || "Failed to fetch product friction data.",
//     };
//   }
// }
// 📂 src/app/features/admin/marketing/actions/getProductFriction.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED FRICTION ENGINE (Option 1 Path)
import {
  buildProductFrictionMatrix,
  UnifiedFrictionProduct,
} from "@/app/features/admin/shared/engines/productFrictionEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface ProductFrictionMetric {
  productId: string;
  productName: string;
  views: number;
  addToCarts: number;
  purchasedQty: number;
  viewToCartRate: number;        // %
  cartToOrderRate: number;       // %
  potentialLostRevenue: number;  // PKR
  frictionType: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";
}

export interface ProductFrictionResponse {
  data: ProductFrictionMetric[];
  totalFrictionCount: number;
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getProductFriction(
  range?: { startDate: Date; endDate: Date }
): Promise<{
  success: boolean;
  data?: ProductFrictionResponse;
  error?: string;
}> {
  const today = new Date();
  const start = range?.startDate ? startOfDay(new Date(range.startDate)) : startOfDay(subDays(today, 30));
  const end = range?.endDate ? endOfDay(new Date(range.endDate)) : endOfDay(today);

  const fromStr = format(start, "yyyy-MM-dd");
  const toStr = format(end, "yyyy-MM-dd");
  const cacheKey = `analytics_product_friction_v8_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ProductFrictionResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Marketing Product Friction (${fromStr} to ${toStr})`);
      return { success: true, data: parsed };
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildProductFrictionMatrix(
      { startDate: start, endDate: end },
      { includeHealthy: true, limit: 50 }
    );

    // 3. Map Engine Response to Marketing Hub Expected Interface
    const mappedData: ProductFrictionMetric[] = engineResult.data.map((item: UnifiedFrictionProduct) => ({
      productId: item.productId,
      productName: item.productName,
      views: item.views,
      addToCarts: item.addToCarts,
      purchasedQty: item.purchases,
      viewToCartRate: item.viewToCartRate,
      cartToOrderRate: item.cartToOrderRate,
      potentialLostRevenue: item.potentialLostRevenue,
      frictionType: item.frictionType,
    }));

    const response: ProductFrictionResponse = {
      data: mappedData,
      totalFrictionCount: engineResult.summary.totalFrictionCount,
      generatedAt: engineResult.generatedAt,
    };

    // 4. Cache Result for 5 minutes
    try {
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`💾 Marketing Product Friction cached (${fromStr} to ${toStr}).`);
    } catch (cacheError) {
      console.warn("⚠️ Redis cache write warning:", cacheError);
    }

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Marketing Product Friction Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch product friction data.",
    };
  }
}