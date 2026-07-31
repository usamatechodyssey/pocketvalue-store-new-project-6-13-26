// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralProduct.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import { format, addDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface ProductMetric {
  productId: string;
  name: string;
  impressions: number;
  clicks: number;
  ctr: number;
  variantCompares: number;
}

export interface ProductTrendPoint {
  date: string;
  impressions: number;
  clicks: number;
}

export interface BehavioralProductResponse {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    overallCtr: number;
    totalVariantCompares: number;
    topProduct: string;
  };
  topProducts: ProductMetric[];
  trend: ProductTrendPoint[];
  productList: ProductMetric[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  generatedAt: string;
}

// ================================================================
// 🛡️ CACHE STAMPEDE PROTECTION
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
    if (result === 1) console.log(`🔓 Product Lock released (${requestId}).`);
  } catch (error) { console.error("Product Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralProduct(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralProductResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_product_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralProductResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Product (Page ${page})`);
      return parsed;
    }

    // ✅ 2. Cache Stampede Protection (SETNX Lock)
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<BehavioralProductResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale product cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Product Lock acquired (${requestId}). Generating product engagement intelligence...`);

      // ================================================================
      // 🔥 1. PRODUCT AGGREGATION
      // ================================================================
      const productStats = await UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ["product_impression", "product_click", "variant_price_compared"] },
            createdAt: { $gte: range.from, $lte: range.to },
            "metadata.productId": { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: {
              productId: "$metadata.productId",
              eventType: "$eventType",
            },
            count: { $sum: 1 },
            name: { $first: { $ifNull: ["$metadata.name", "$metadata.productId"] } },
          },
        },
        {
          $group: {
            _id: "$_id.productId",
            name: { $first: "$name" },
            impressions: {
              $sum: { $cond: [{ $eq: ["$eventType", "product_impression"] }, "$count", 0] },
            },
            clicks: {
              $sum: { $cond: [{ $eq: ["$eventType", "product_click"] }, "$count", 0] },
            },
            variantCompares: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "variant_price_compared"] }, "$count", 0] },
            },
          },
        },
        { $sort: { impressions: -1 } },
      ]);

      // ================================================================
      // 🔥 2. DAILY TREND
      // ================================================================
      const dailyTrend = await UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ["product_impression", "product_click"] },
            createdAt: { $gte: range.from, $lte: range.to },
            "metadata.productId": { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              eventType: "$eventType",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            impressions: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "product_impression"] }, "$count", 0] },
            },
            clicks: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "product_click"] }, "$count", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // ================================================================
      // 🔥 3. ENRICH PRODUCTS WITH CTR
      // ================================================================
      const enrichedProducts: ProductMetric[] = productStats.map((p: any) => {
        const impressions = p.impressions || 0;
        const clicks = p.clicks || 0;
        const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(1)) : 0;
        return {
          productId: p._id,
          name: p.name || p._id,
          impressions,
          clicks,
          ctr,
          variantCompares: p.variantCompares || 0,
        };
      });

      // ================================================================
      // 🔥 4. SUMMARY
      // ================================================================
      const totalImpressions = enrichedProducts.reduce((sum, p) => sum + p.impressions, 0);
      const totalClicks = enrichedProducts.reduce((sum, p) => sum + p.clicks, 0);
      const totalVariantCompares = enrichedProducts.reduce((sum, p) => sum + p.variantCompares, 0);
      const overallCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0;
      const topProduct = enrichedProducts.length > 0 ? enrichedProducts[0].name : "N/A";

      // ================================================================
      // 🔥 5. CONTINUOUS DATE GAP FILLING (Smooth Recharts graphs)
      // ================================================================
      const trendMap = new Map<string, any>(
        dailyTrend.map((d: any) => [d._id, d])
      );

      const trend: ProductTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        trend.push({
          date: dateStr,
          impressions: existing?.impressions || 0,
          clicks: existing?.clicks || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 6. TOP PRODUCTS & PAGINATION
      // ================================================================
      const topProducts = enrichedProducts.slice(0, 10);
      const totalDocs = enrichedProducts.length;
      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));
      const start = (safePage - 1) * limit;
      const paginatedProducts = enrichedProducts.slice(start, start + limit);

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralProductResponse = {
        summary: {
          totalImpressions,
          totalClicks,
          overallCtr,
          totalVariantCompares,
          topProduct,
        },
        topProducts,
        trend,
        productList: paginatedProducts,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 7. Cache for 5 minutes — USING safeStringify
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Product Cached (Page ${page}) — ${trend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Product Engine Error:", error.message);
    return {
      summary: { totalImpressions: 0, totalClicks: 0, overallCtr: 0, totalVariantCompares: 0, topProduct: "" },
      topProducts: [],
      trend: [],
      productList: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}