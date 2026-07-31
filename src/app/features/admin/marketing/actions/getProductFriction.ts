// 📂 src/app/features/admin/marketing/actions/getProductFriction.ts (FULLY ACCURATE & PRODUCT TITLE JOINED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserEvent from "@/models/UserEvent";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { getSafePayload } from "@/app/shared/lib/payloadInstance"; // ✅ Imported Payload for product title joins

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface ProductFrictionMetric {
  productId: string;
  productName: string;           // ✅ Real Product Title (from Payload CMS)
  views: number;
  addToCarts: number;
  purchasedQty: number;
  viewToCartRate: number;        // %
  cartToOrderRate: number;       // %
  potentialLostRevenue: number;  // ✅ NEW: Lost Sales in PKR
  frictionType: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";
}

export interface ProductFrictionResponse {
  data: ProductFrictionMetric[];
  totalFrictionCount: number;
  generatedAt: string;
}

// ================================================================
// 📊 THRESHOLDS (Enterprise Configurable)
// ================================================================
const VIEW_THRESHOLD = 5;       // ✅ Adjusted threshold to render test data immediately
const ADD_THRESHOLD = 2;        // ✅ Adjusted threshold to render test data immediately
const LOW_INTEREST_THRESHOLD = 0.1;   // 10% view-to-cart rate
const PRICE_BARRIER_THRESHOLD = 0.2;  // 20% cart-to-order rate

// ================================================================
// 🚀 MAIN ACTION (WITH REDIS CACHE & SAFE SERIALIZATION)
// ================================================================
export async function getProductFriction(): Promise<{
  success: boolean;
  data?: ProductFrictionResponse;
  error?: string;
}> {
  const cacheKey = "analytics_product_friction";

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check (Type-Safe with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ProductFrictionResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Product Friction");
      return { success: true, data: parsed };
    }

    await connectMongoose();

    // ================================================================
    // 2. FETCH USER EVENTS (Views & Add-to-Carts)
    // ================================================================

    // 2a. Fetch Page Views per product
    const viewsAggregation = await UserEvent.aggregate([
      {
        $match: {
          eventType: "page_view",
          "metadata.productId": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$metadata.productId",
          views: { $sum: 1 },
        },
      },
    ]);

    // 2b. Fetch Add-to-Carts per product
    const addsAggregation = await UserEvent.aggregate([
      {
        $match: {
          eventType: "add_to_cart",
          "metadata.productId": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$metadata.productId",
          addToCarts: { $sum: 1 },
        },
      },
    ]);

    // ================================================================
    // 3. FETCH PURCHASES FROM ORDERS (Aligned with REVENUE_STATUSES)
    // ================================================================
    const orderAggregation = await Order.aggregate([
      {
        $match: {
          status: { $in: REVENUE_STATUSES }, // ✅ Matches REVENUE_STATUSES Whitelist
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          purchasedQty: { $sum: "$products.quantity" },
          unitPrice: { $first: "$products.price" }, // Store price for lost sales math
        },
      },
    ]);

    // ================================================================
    // 4. MERGE DATA INTO MAP
    // ================================================================
    const productMap = new Map<
      string,
      {
        views: number;
        addToCarts: number;
        purchasedQty: number;
        unitPrice: number;
      }
    >();

    // Add Views
    for (const item of viewsAggregation) {
      if (!item._id) continue;
      productMap.set(String(item._id), {
        views: item.views || 0,
        addToCarts: 0,
        purchasedQty: 0,
        unitPrice: 0,
      });
    }

    // Merge Add-to-Carts
    for (const item of addsAggregation) {
      if (!item._id) continue;
      const key = String(item._id);
      if (productMap.has(key)) {
        productMap.get(key)!.addToCarts = item.addToCarts || 0;
      } else {
        productMap.set(key, {
          views: 0,
          addToCarts: item.addToCarts || 0,
          purchasedQty: 0,
          unitPrice: 0,
        });
      }
    }

    // Merge Purchases
    for (const item of orderAggregation) {
      if (!item._id) continue;
      const key = String(item._id);
      if (productMap.has(key)) {
        const existing = productMap.get(key)!;
        existing.purchasedQty = item.purchasedQty || 0;
        existing.unitPrice = item.unitPrice || 0;
      } else {
        productMap.set(key, {
          views: 0,
          addToCarts: 0,
          purchasedQty: item.purchasedQty || 0,
          unitPrice: item.unitPrice || 0,
        });
      }
    }

    // ================================================================
    // 5. ✅ BATCH FETCH PRODUCT TITLES FROM PAYLOAD CMS (No Raw IDs)
    // ================================================================
    const productIds = Array.from(productMap.keys());
    const productTitleMap = new Map<string, { title: string; price: number }>();

    if (productIds.length > 0) {
      try {
        const payload = await getSafePayload();
        const productDocs = await payload.find({
          collection: "products",
          where: { id: { in: productIds } },
          limit: productIds.length,
          depth: 0,
          select: { id: true, title: true, variants: true },
        });

        for (const doc of productDocs.docs) {
          const firstVariantPrice = doc.variants?.[0]?.price || 0;
          productTitleMap.set(doc.id, {
            title: doc.title || "Untitled Product",
            price: firstVariantPrice,
          });
        }
      } catch (payloadError) {
        console.warn("⚠️ Failed to batch fetch product titles:", payloadError);
      }
    }

    // ================================================================
    // 6. CALCULATE FRICTION METRICS & LOST REVENUE
    // ================================================================
    const finalData: ProductFrictionMetric[] = [];

    for (const [productId, metrics] of productMap) {
      const { views, addToCarts, purchasedQty, unitPrice } = metrics;

      // Skip products with virtually zero activity
      if (views < VIEW_THRESHOLD && addToCarts < ADD_THRESHOLD && purchasedQty === 0) {
        continue;
      }

      // Calculate Rates
      const viewToCartRate =
        views > 0 ? Number(((addToCarts / views) * 100).toFixed(1)) : 0;
      const cartToOrderRate =
        addToCarts > 0 ? Number(((purchasedQty / addToCarts) * 100).toFixed(1)) : 0;

      // Product Title & Price Resolution
      const productInfo = productTitleMap.get(productId);
      const productName = productInfo?.title || "Product #" + productId.slice(-6);
      const effectivePrice = unitPrice || productInfo?.price || 0;

      // Lost Sales Calculation (Unpurchased Carts * Effective Price)
      const unpurchasedCarts = Math.max(0, addToCarts - purchasedQty);
      const potentialLostRevenue = Math.round(unpurchasedCarts * effectivePrice);

      // Determine Friction Category
      let frictionType: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY" = "HEALTHY";

      // 1. CRITICAL DROPOFF: Cart additions but ZERO purchases!
      if (addToCarts >= 2 && purchasedQty === 0) {
        frictionType = "CRITICAL_DROPOFF";
      } 
      // 2. PRICE BARRIER: High cart adds, but < 20% conversion
      else if (addToCarts >= ADD_THRESHOLD && cartToOrderRate < PRICE_BARRIER_THRESHOLD * 100) {
        frictionType = "PRICE_BARRIER";
      } 
      // 3. LOW INTEREST: High views, but < 10% view-to-cart
      else if (views >= VIEW_THRESHOLD && viewToCartRate < LOW_INTEREST_THRESHOLD * 100) {
        frictionType = "LOW_INTEREST";
      }

      if (frictionType === "HEALTHY") continue;

      finalData.push({
        productId,
        productName,
        views,
        addToCarts,
        purchasedQty,
        viewToCartRate,
        cartToOrderRate,
        potentialLostRevenue,
        frictionType,
      });
    }

    // Sort Priority: CRITICAL_DROPOFF (0), PRICE_BARRIER (1), LOW_INTEREST (2), then highest lost sales
    finalData.sort((a, b) => {
      const priority = { CRITICAL_DROPOFF: 0, PRICE_BARRIER: 1, LOW_INTEREST: 2, HEALTHY: 3 };
      if (priority[a.frictionType] !== priority[b.frictionType]) {
        return priority[a.frictionType] - priority[b.frictionType];
      }
      return b.potentialLostRevenue - a.potentialLostRevenue;
    });

    const limitedData = finalData.slice(0, 50);

    const response: ProductFrictionResponse = {
      data: limitedData,
      totalFrictionCount: finalData.length,
      generatedAt: new Date().toISOString(),
    };

    // 7. Cache for 5 Minutes with safeStringify
    try {
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log("💾 Product Friction cached (5 min TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Failed to write product friction to Redis:", cacheError);
    }

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Product Friction Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch product friction data.",
    };
  }
}