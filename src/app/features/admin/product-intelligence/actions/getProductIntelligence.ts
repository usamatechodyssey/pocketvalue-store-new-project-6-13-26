// 📂 src/app/features/admin/product-intelligence/actions/getProductIntelligence.ts

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subDays, differenceInDays, format } from "date-fns";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ SINGLE SOURCE OF TRUTH
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface ProductIntelItem {
  id: string;
  name: string;
  image: string | null;
  category: string;
  currentUnitsSold: number;
  previousUnitsSold: number;
  growth: number;
  revenue: number;
  revenueContribution: number;
  returnRate: number;
  currentStock: number;
  trend: "STAR" | "FALLING" | "STABLE";
}

export interface ProductIntelResponse {
  data: ProductIntelItem[];
  totalDocs: number;
  totalPages: number;
}

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE (Lua Script — for Cache Stampede)
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
    if (result === 1) {
      console.log(`🔓 Product Intel Lock released (${requestId}).`);
    }
  } catch (error) {
    console.error(`❌ Product Intel Lock release error:`, error);
  }
};

// ================================================================
// 🎨 IMAGE RESOLVER (Aligned with Products.ts cdnImages & media)
// ================================================================
const resolveProductImage = (pDoc: any): string | null => {
  if (!pDoc) return null;
  const firstVariant = pDoc?.variants?.[0];

  // 1. CDN Images Manual URL (from Products.ts cdnImages array)
  if (firstVariant?.cdnImages?.[0]?.url) {
    return firstVariant.cdnImages[0].url;
  }

  // 2. Uploaded Media Relationship URL
  if (firstVariant?.images?.[0]?.url) {
    return firstVariant.images[0].url;
  }

  // 3. Fallback to product-level image
  if (pDoc?.image?.url) {
    return pDoc.image.url;
  }

  return null;
};

// ================================================================
// 🚀 MAIN FUNCTION — DEDICATED PAGE (OPTIMIZED FOR 1M PRODUCTS)
// ================================================================
export async function getProductIntelligencePayload(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 50,
  filters: { categoryId?: string; trend?: string } = {}
): Promise<ProductIntelResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const catFilter = filters.categoryId || "all";
  const trendFilter = filters.trend || "all";
  const cacheKey = `analytics_product_intel_v3:${fromStr}_${toStr}:page_${page}:cat_${catFilter}:trend_${trendFilter}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);
    await connectMongoose();

    // ✅ 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ProductIntelResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Product Intelligence (Page ${page})`);
      return parsed;
    }

    // ✅ 2. Cache Stampede Protection (SETNX Lock)
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log(`⏳ Cache Stampede Detected. Waiting 500ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<ProductIntelResponse>(retryCache as string | null);
      if (retryParsed) return retryParsed;
      return { data: [], totalDocs: 0, totalPages: 0 };
    }

    try {
      console.log(`🔒 Product Intel Lock acquired (${requestId}). Generating intelligence...`);

      const payload = await getSafePayload();

      const daysDiff = differenceInDays(range.to, range.from) + 1;
      const prevFrom = subDays(range.from, daysDiff);
      const prevTo = subDays(range.to, daysDiff);

      // ✅ 3. Total Store Revenue (Valid Sales Only)
      const totalRevRes = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $in: REVENUE_STATUSES },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const totalStoreRevenue = totalRevRes[0]?.total || 1;

      // ✅ FIX 1: Include Cancelled and RTO orders in query so returnRate calculates accurately!
      const PRODUCT_STATUS_QUERY = Array.from(
        new Set([...REVENUE_STATUSES, "Cancelled", "RTO", "Rejected"])
      );

      // ✅ 4. Current Period Aggregation (Units, Revenue, and Returned/Cancelled Units)
      const currentStats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $in: PRODUCT_STATUS_QUERY },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            name: { $first: "$products.name" },
            // ✅ Sums revenue ONLY for valid sales statuses
            revenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", REVENUE_STATUSES] },
                  { $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] },
                  0,
                ],
              },
            },
            units: {
              $sum: {
                $cond: [
                  { $in: ["$status", REVENUE_STATUSES] },
                  { $ifNull: ["$products.quantity", 0] },
                  0,
                ],
              },
            },
            // ✅ Sums returned/cancelled units where status is Cancelled or RTO
            cancelledUnits: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["Cancelled", "RTO", "Rejected"]] },
                  { $ifNull: ["$products.quantity", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]);

      // ✅ 5. Previous Period Aggregation
      const prevStats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevFrom, $lte: prevTo },
            status: { $in: REVENUE_STATUSES },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            units: { $sum: { $ifNull: ["$products.quantity", 0] } },
          },
        },
      ]);
      const prevMap = new Map(prevStats.map((i: any) => [i._id, i.units]));

      // ✅ Fetch Payload CMS Document details for sold products
      const productIdsWithSales = currentStats.map((item: any) => item._id).filter(Boolean);
      if (productIdsWithSales.length === 0) {
        return { data: [], totalDocs: 0, totalPages: 0 };
      }

      console.log(`🔍 Fetching only ${productIdsWithSales.length} products with sales...`);

      const payloadMap = new Map<string, any>();
      let payloadPage = 1;
      const payloadLimit = 100;
      let hasMore = true;

      while (hasMore && payloadPage <= 500) {
        const result = await payload.find({
          collection: "products",
          where: { id: { in: productIdsWithSales } },
          page: payloadPage,
          limit: payloadLimit,
          depth: 1,
          select: { title: true, variants: true, categories: true },
        });

        for (const doc of result.docs) {
          payloadMap.set(doc.id, doc);
        }

        hasMore = result.hasNextPage ?? false;
        payloadPage++;
      }

      // ✅ 7. Data Mapping & Trend Logic
      let finalIntel: ProductIntelItem[] = currentStats.map((item: any) => {
        const pDoc = payloadMap.get(item._id);
        const pUnits = prevMap.get(item._id) || 0;
        const cUnits = item.units || 0;
        const cancelled = item.cancelledUnits || 0;

        const growth = pUnits > 0 ? ((cUnits - pUnits) / pUnits) * 100 : cUnits > 0 ? 100 : 0;

        let trend: "STAR" | "FALLING" | "STABLE" = "STABLE";
        if (growth > 15) trend = "STAR";
        else if (growth < -15) trend = "FALLING";

        // ✅ Total units handled (sold + returned) for returnRate calculation
        const totalHandledUnits = cUnits + cancelled;
        const returnRate = totalHandledUnits > 0 ? Number(((cancelled / totalHandledUnits) * 100).toFixed(1)) : 0;

        return {
          id: item._id,
          name: item.name || pDoc?.title || "Unknown Product",
          // ✅ FIX 2: Resolves image using cdnImages and media upload fallbacks
          image: resolveProductImage(pDoc),
          category: pDoc?.categories?.[0]?.name || "No Category",
          currentUnitsSold: cUnits,
          previousUnitsSold: pUnits,
          growth: Number(growth.toFixed(1)),
          revenue: item.revenue || 0,
          revenueContribution: Number(((item.revenue / totalStoreRevenue) * 100).toFixed(1)),
          returnRate,
          currentStock:
            pDoc?.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
          trend,
        };
      });

      // ✅ 8. Apply Category & Trend Filters
      if (filters.categoryId) {
        finalIntel = finalIntel.filter((item) => {
          const doc = payloadMap.get(item.id);
          return doc?.categories?.some(
            (c: any) => (typeof c === "string" ? c : c.id) === filters.categoryId
          );
        });
      }

      if (filters.trend) {
        if (filters.trend === "STAR") finalIntel = finalIntel.filter((i) => i.trend === "STAR");
        else if (filters.trend === "FALLING") finalIntel = finalIntel.filter((i) => i.trend === "FALLING");
        else if (filters.trend === "OOS") finalIntel = finalIntel.filter((i) => i.currentStock <= 0);
      }

      finalIntel.sort((a, b) => b.revenue - a.revenue);

      const totalDocs = finalIntel.length;
      const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
      const safePage = Math.max(1, Math.min(page, totalPages || 1));
      const startIndex = (safePage - 1) * limit;
      const paginatedData = finalIntel.slice(startIndex, startIndex + limit);

      const response: ProductIntelResponse = {
        data: paginatedData,
        totalDocs,
        totalPages,
      };

      // ✅ Cache for 10 minutes (using safeStringify)
      await redis.set(cacheKey, safeStringify(response), { ex: 600 });
      console.log(`✅ Product Intelligence Cached. ${totalDocs} products analyzed.`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Product Intelligence Engine Error:", error.message);
    return { data: [], totalDocs: 0, totalPages: 0 };
  }
}

// ================================================================
// 🔍 DRILL-DOWN: Get Single Product Detail (Modal Data)
// ================================================================
export async function getProductDrillDownPayload(productId: string) {
  const cacheKey = `product_drill_down_v3:${productId}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);
    await connectMongoose();

    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<any>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Product Drill-down Modal (ID: ${productId})`);
      return parsed;
    }

    const payload = await getSafePayload();

    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 1,
    });

    const recentOrders = await Order.find({
      "products.productId": productId,
      status: { $in: REVENUE_STATUSES },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId shippingAddress.fullName totalPrice status createdAt")
      .lean();

    const drillDownResult = {
      product: safeParse(safeStringify(product)),
      recentOrders: safeParse(safeStringify(recentOrders)),
    };

    await redis.set(cacheKey, safeStringify(drillDownResult), { ex: 600 });

    return drillDownResult;
  } catch (error: any) {
    console.error("Payload Product Drill-down Error:", error.message);
    return null;
  }
}