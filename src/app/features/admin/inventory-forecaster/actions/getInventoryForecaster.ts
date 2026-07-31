// 📂 src/app/features/admin/inventory-forecaster/actions/getInventoryForecaster.ts (HARDENED FOR PRODUCTION)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subDays } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ ENTERPRISE CONSTANTS & SERIALIZATION
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ INTERFACES
// ================================================================
export interface ForecastItem {
  name: string;
  variant: string;
  stock: number;
  velocity: string;
  daysLeft: number | "Stable";
  priority: "CRITICAL" | "HIGH" | "LOW" | "SAFE";
}

export interface ForecasterResponse {
  items: ForecastItem[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  windowDays: number;
  criticalThreshold: number;
  highThreshold: number;
}

// ================================================================
// 🧠 HELPER: Priority Sorting Weight
// ================================================================
const priorityWeight = { CRITICAL: 0, HIGH: 1, LOW: 2, SAFE: 3 };

function getPriorityWeight(item: ForecastItem): number {
  const base = priorityWeight[item.priority] ?? 99;
  const days = item.daysLeft === "Stable" ? Infinity : item.daysLeft;
  return base * 1000000 + days;
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getInventoryForecasterPayload({
  page = 1,
  limit = 15,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<ForecasterResponse> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const cacheKey = `analytics_inventory_forecaster:page_${safePage}:limit_${safeLimit}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Check Cache
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ForecasterResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Forecaster (Page ${safePage})`);
      return parsed;
    }

    console.log(`🔄 Redis Cache Miss: Generating Forecast (Page ${safePage})...`);

    // ✅ 2. Fetch Settings (With Zero-Division Guard)
    let settings: any = {};
    try {
      settings = await getCachedSettings();
    } catch (e) {
      settings = {};
    }

    const windowDays = settings?.forecasting?.windowDays ?? 15;
    const safeWindowDays = Math.max(1, windowDays); // 🛡️ Zero-division protection
    const criticalThreshold = settings?.forecasting?.criticalThreshold ?? 3;
    const highThreshold = settings?.forecasting?.highThreshold ?? 7;

    const cutoffDate = subDays(new Date(), safeWindowDays);

    // ✅ 3. Aggregate Sales by Variant
    const salesAggregation = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: cutoffDate },
          status: { $in: REVENUE_STATUSES },
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            productId: "$products.productId",
            variantKey: "$products.variant._key",
          },
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ]);

    // ✅ 4. Build Sales Map
    const salesMap = new Map<string, number>();
    const variantKeysWithSales: string[] = [];
    for (const entry of salesAggregation) {
      const key = entry._id.variantKey || entry._id.productId;
      if (key) {
        salesMap.set(key, (salesMap.get(key) || 0) + entry.totalSold);
        variantKeysWithSales.push(key);
      }
    }

    const lowStockThreshold = highThreshold * 2;

    const queryCondition: any = {
      or: [
        { "variants.stock": { less_than_equal: lowStockThreshold } }
      ]
    };

    if (variantKeysWithSales.length > 0) {
      queryCondition.or.push({
        "variants.id": { in: variantKeysWithSales } 
      });
    }

    // ✅ 5. Fetch Products
    const payload = await getSafePayload();
    let dbPage = 1;
    const dbLimit = 100;
    let hasMore = true;
    const allPredictions: ForecastItem[] = [];
    const MAX_PAGES = 500;

    while (hasMore && dbPage <= MAX_PAGES) {
      const result = await payload.find({
        collection: "products",
        where: queryCondition,
        page: dbPage,
        limit: dbLimit,
        depth: 0,
        select: { title: true, variants: true },
      });

      for (const product of result.docs) {
        const productTitle = product.title || "Untitled Product";
        for (const variant of product.variants || []) {
          const variantId = variant.id || variant._key;
          const sold = salesMap.get(variantId) || 0;

          const stock = variant.stock ?? 0;
          const velocity = sold / safeWindowDays;

          if (sold === 0 && stock > lowStockThreshold) {
            continue;
          }

          const daysLeft = velocity > 0 ? Math.floor(stock / velocity) : Infinity;

          let priority: "CRITICAL" | "HIGH" | "LOW" | "SAFE" = "SAFE";
          if (daysLeft !== Infinity && daysLeft <= criticalThreshold) {
            priority = "CRITICAL";
          } else if (daysLeft !== Infinity && daysLeft <= highThreshold) {
            priority = "HIGH";
          } else if (sold > 0) {
            priority = "LOW";
          }

          allPredictions.push({
            name: productTitle,
            variant: variant.name || "Default",
            stock,
            velocity: velocity.toFixed(2),
            daysLeft: daysLeft === Infinity ? "Stable" : daysLeft,
            priority,
          });
        }
      }

      hasMore = result.hasNextPage ?? false;
      dbPage++;
    }

    // ✅ 6. Sort Predictions
    allPredictions.sort((a, b) => getPriorityWeight(a) - getPriorityWeight(b));

    // ✅ 7. Paginate
    const totalDocs = allPredictions.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / safeLimit));
    const safeCurrentPage = Math.min(safePage, totalPages);
    const startIndex = (safeCurrentPage - 1) * safeLimit;
    const paginatedItems = allPredictions.slice(startIndex, startIndex + safeLimit);

    const response: ForecasterResponse = {
      items: paginatedItems,
      totalDocs,
      totalPages,
      currentPage: safeCurrentPage,
      limit: safeLimit,
      windowDays: safeWindowDays,
      criticalThreshold,
      highThreshold,
    };

    // ✅ 8. Cache Response
    const stringified = safeStringify(response);
    await redis.set(cacheKey, stringified, { ex: 3600 });
    console.log(`✅ Forecaster Hardened: Processed ${allPredictions.length} risky variants.`);

    return response;
  } catch (error: any) {
    console.error("Forecaster Engine Error:", error.message);
    return {
      items: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: safePage,
      limit: safeLimit,
      windowDays: 15,
      criticalThreshold: 3,
      highThreshold: 7,
    };
  }
}