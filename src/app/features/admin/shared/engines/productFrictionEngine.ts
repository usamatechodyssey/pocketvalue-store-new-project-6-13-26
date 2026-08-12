// 📂 src/app/shared/lib/analytics/engines/productFrictionEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserEvent from "@/models/UserEvent";
import Order from "@/models/Order";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { Types } from "mongoose";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ TYPES
// ================================================================
export type FrictionCategory = "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";

export interface UnifiedFrictionProduct {
  productId: string;
  sku: string;
  productName: string;
  views: number;
  addToCarts: number;       // Represents effectiveAdds [Math.max(adds, purchases)]
  purchases: number;
  viewToCartRate: number;    // % (0 - 100)
  cartToOrderRate: number;   // % (0 - 100)
  potentialLostRevenue: number; // Est. Lost Sales in PKR
  frictionType: FrictionCategory;
}

export interface UnifiedFrictionSummary {
  totalFrictionCount: number;
  criticalDropoffsCount: number;
  priceBarriersCount: number;
  lowInterestCount: number;
  healthyCount: number;
  totalLostSales: number;
}

export interface UnifiedFrictionEngineResponse {
  data: UnifiedFrictionProduct[];
  summary: UnifiedFrictionSummary;
  generatedAt: string;
}

// ================================================================
// 📊 SENSITIVITY THRESHOLDS (Enterprise Single Source of Truth)
// ================================================================
export const FRICTION_THRESHOLDS = {
  VIEW_THRESHOLD: 1,
  ADD_THRESHOLD: 1,
  LOW_INTEREST_V2C: 10,   // < 10% view-to-cart rate triggers LOW_INTEREST
  PRICE_BARRIER_C2O: 35,  // < 35% cart-to-order rate triggers PRICE_BARRIER
};

// ================================================================
// 🚀 MAIN CENTRAL ENGINE
// ================================================================
export async function buildProductFrictionMatrix(
  range: { startDate: Date; endDate: Date },
  options: { includeHealthy?: boolean; limit?: number } = { includeHealthy: true }
): Promise<UnifiedFrictionEngineResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  // 1. Fetch Page Views per product in timeframe
  const viewsAggregation = await UserEvent.aggregate([
    {
      $match: {
        eventType: "page_view",
        "metadata.productId": { $exists: true, $nin: [null, ""] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: "$metadata.productId", views: { $sum: 1 } } },
  ]);

  // 2. Fetch Add-To-Carts per product in timeframe
  const addsAggregation = await UserEvent.aggregate([
    {
      $match: {
        eventType: "add_to_cart",
        "metadata.productId": { $exists: true, $nin: [null, ""] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: "$metadata.productId", addToCarts: { $sum: 1 } } },
  ]);

  // 3. Fetch Purchases from Orders in timeframe (Valid Sales Only)
  const orderAggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: REVENUE_STATUSES },
      },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        purchases: { $sum: { $ifNull: ["$products.quantity", 0] } },
        sku: { $first: "$products.sku" },
        unitPrice: { $first: "$products.price" },
      },
    },
  ]);

  // 4. Merge all product IDs into a consolidated Map
  const productMap = new Map<
    string,
    {
      views: number;
      addToCarts: number;
      purchases: number;
      sku: string;
      unitPrice: number;
    }
  >();

  for (const item of viewsAggregation) {
    if (!item._id) continue;
    productMap.set(String(item._id), {
      views: item.views || 0,
      addToCarts: 0,
      purchases: 0,
      sku: "",
      unitPrice: 0,
    });
  }

  for (const item of addsAggregation) {
    if (!item._id) continue;
    const key = String(item._id);
    const existing = productMap.get(key);
    if (existing) {
      existing.addToCarts = item.addToCarts || 0;
    } else {
      productMap.set(key, {
        views: 0,
        addToCarts: item.addToCarts || 0,
        purchases: 0,
        sku: "",
        unitPrice: 0,
      });
    }
  }

  for (const item of orderAggregation) {
    if (!item._id) continue;
    const key = String(item._id);
    const existing = productMap.get(key);
    if (existing) {
      existing.purchases = item.purchases || 0;
      existing.sku = item.sku || "";
      existing.unitPrice = item.unitPrice || 0;
    } else {
      productMap.set(key, {
        views: 0,
        addToCarts: 0,
        purchases: item.purchases || 0,
        sku: item.sku || "",
        unitPrice: item.unitPrice || 0,
      });
    }
  }

  // 5. Batch fetch Product titles & SKU fallbacks from Payload CMS
  const rawProductIds = Array.from(productMap.keys());
  const validObjectIds = rawProductIds.filter((id) => Types.ObjectId.isValid(String(id)));
  const cmsProductInfoMap = new Map<string, { title: string; sku: string; price: number }>();

  if (validObjectIds.length > 0) {
    try {
      const payload = await getSafePayload();
      let payloadPage = 1;
      const payloadLimit = 100;
      let hasMore = true;

      while (hasMore && payloadPage <= 500) {
        const productDocs = await payload.find({
          collection: "products",
          where: { id: { in: validObjectIds } },
          limit: payloadLimit,
          page: payloadPage,
          depth: 0,
          select: { id: true, title: true, variants: true },
        });

        for (const doc of productDocs.docs) {
          const firstVariant = doc.variants?.[0];
          const info = {
            title: doc.title || "Untitled Product",
            sku: firstVariant?.sku || `SKU-${String(doc.id).slice(-6).toUpperCase()}`,
            price: firstVariant?.price || 0,
          };
          if (doc.id) cmsProductInfoMap.set(String(doc.id), info);
          if ((doc as any)._id) cmsProductInfoMap.set(String((doc as any)._id), info);
        }

        hasMore = productDocs.hasNextPage ?? false;
        payloadPage++;
      }
    } catch (cmsError) {
      console.warn("⚠️ Engine CMS fetch warning:", cmsError);
    }
  }

  // 6. Process calculations with 100% unified logic
  const allCalculatedProducts: UnifiedFrictionProduct[] = [];

  for (const [productId, metrics] of productMap) {
    const { views, addToCarts, purchases, sku: orderSku, unitPrice: orderPrice } = metrics;

    // ✅ Rule 1: Effective Adds prevents tracking drop anomalies (Purchases > Adds)
    const effectiveAdds = Math.max(addToCarts, purchases);

    // Skip zero activity items
    if (views < FRICTION_THRESHOLDS.VIEW_THRESHOLD && effectiveAdds < FRICTION_THRESHOLDS.ADD_THRESHOLD && purchases === 0) {
      continue;
    }

    // ✅ Rule 2: Standard Conversion Rate Formulas
    const viewToCartRate = views > 0 ? Number(Math.min(100, (effectiveAdds / views) * 100).toFixed(1)) : 0;
    const cartToOrderRate = effectiveAdds > 0 ? Number(Math.min(100, (purchases / effectiveAdds) * 100).toFixed(1)) : 0;

    // Resolve Product Meta
    const cmsInfo = cmsProductInfoMap.get(String(productId));
    const productName = cmsInfo?.title || `Product #${String(productId).slice(-6)}`;
    const finalSku = orderSku || cmsInfo?.sku || `SKU-${String(productId).slice(-6).toUpperCase()}`;
    const effectivePrice = orderPrice || cmsInfo?.price || 0;

    // ✅ Rule 3: Potential Lost Revenue Formula
    const unpurchasedCarts = Math.max(0, effectiveAdds - purchases);
    const potentialLostRevenue = Math.round(unpurchasedCarts * effectivePrice);

    // ✅ Rule 4: Single Source of Truth Friction Classification
    let frictionType: FrictionCategory = "HEALTHY";

    if (effectiveAdds >= 1 && purchases === 0) {
      frictionType = "CRITICAL_DROPOFF";
    } else if (effectiveAdds >= FRICTION_THRESHOLDS.ADD_THRESHOLD && cartToOrderRate < FRICTION_THRESHOLDS.PRICE_BARRIER_C2O) {
      frictionType = "PRICE_BARRIER"; // Threshold locked at < 35%
    } else if (views >= FRICTION_THRESHOLDS.VIEW_THRESHOLD && effectiveAdds === 0 && viewToCartRate < FRICTION_THRESHOLDS.LOW_INTEREST_V2C) {
      frictionType = "LOW_INTEREST";
    }

    allCalculatedProducts.push({
      productId: String(productId),
      sku: finalSku,
      productName,
      views,
      addToCarts: effectiveAdds,
      purchases,
      viewToCartRate,
      cartToOrderRate,
      potentialLostRevenue,
      frictionType,
    });
  }

  // 7. Sort Priority: CRITICAL_DROPOFF -> PRICE_BARRIER -> LOW_INTEREST -> HEALTHY -> Highest Lost Revenue
  allCalculatedProducts.sort((a, b) => {
    const priority: Record<FrictionCategory, number> = {
      CRITICAL_DROPOFF: 0,
      PRICE_BARRIER: 1,
      LOW_INTEREST: 2,
      HEALTHY: 3,
    };
    if (priority[a.frictionType] !== priority[b.frictionType]) {
      return priority[a.frictionType] - priority[b.frictionType];
    }
    return b.potentialLostRevenue - a.potentialLostRevenue;
  });

  // Calculate Summary Metrics
  const criticalDropoffsCount = allCalculatedProducts.filter((p) => p.frictionType === "CRITICAL_DROPOFF").length;
  const priceBarriersCount = allCalculatedProducts.filter((p) => p.frictionType === "PRICE_BARRIER").length;
  const lowInterestCount = allCalculatedProducts.filter((p) => p.frictionType === "LOW_INTEREST").length;
  const healthyCount = allCalculatedProducts.filter((p) => p.frictionType === "HEALTHY").length;
  const totalFrictionCount = criticalDropoffsCount + priceBarriersCount + lowInterestCount;
  const totalLostSales = allCalculatedProducts.reduce((sum, p) => sum + p.potentialLostRevenue, 0);

  // Filter out HEALTHY items if caller explicitly requests friction only
  const filteredData = options.includeHealthy !== false
    ? allCalculatedProducts
    : allCalculatedProducts.filter((p) => p.frictionType !== "HEALTHY");

  const finalData = options.limit ? filteredData.slice(0, options.limit) : filteredData;

  return {
    data: finalData,
    summary: {
      totalFrictionCount,
      criticalDropoffsCount,
      priceBarriersCount,
      lowInterestCount,
      healthyCount,
      totalLostSales,
    },
    generatedAt: new Date().toISOString(),
  };
}