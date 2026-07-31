// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralDemand.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import CustomerRequest from "@/models/CustomerRequest";
import { format, addDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface DemandProductMetric {
  productId: string | null;
  productName: string;
  requests: number;
}

export interface DemandVariantMetric {
  variantKey: string;
  variantName: string;
  requests: number;
}

export interface DemandTrendPoint {
  date: string;
  restockRequests: number;
  customVariantRequests: number;
}

export interface DemandEvent {
  _id: string;
  requestType: string;
  productId: string | null;
  requestedProductName: string | null;
  selectedAttributes: Record<string, string> | null;
  urgencyLevel: string;
  status: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface BehavioralDemandResponse {
  summary: {
    totalRestockRequests: number;
    totalCustomVariantRequests: number;
    totalUrgentRequests: number;
    totalPendingRequests: number;
    topProduct: string;
  };
  topProducts: DemandProductMetric[];
  topVariants: DemandVariantMetric[];
  trend: DemandTrendPoint[];
  requests: DemandEvent[];
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
    if (result === 1) console.log(`🔓 Demand Lock released (${requestId}).`);
  } catch (error) { console.error("Demand Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralDemand(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralDemandResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_demand_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralDemandResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Demand (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralDemandResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale demand cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Demand Lock acquired (${requestId}). Generating demand intelligence...`);

      // ================================================================
      // 🔥 1. SUMMARY AGGREGATIONS
      // ================================================================
      const [
        restockCount,
        customVariantCount,
        urgentCount,
        pendingCount,
        productStats,
        variantStats,
        dailyTrend,
        paginatedRequests,
        totalDocs,
      ] = await Promise.all([
        // Restock requests
        CustomerRequest.countDocuments({
          requestType: "restock",
          createdAt: { $gte: range.from, $lte: range.to },
        }),
        // Custom variant requests (missing_variant + missing_product)
        CustomerRequest.countDocuments({
          requestType: { $in: ["missing_variant", "missing_product"] },
          createdAt: { $gte: range.from, $lte: range.to },
        }),
        // Urgent requests
        CustomerRequest.countDocuments({
          urgencyLevel: "urgent",
          createdAt: { $gte: range.from, $lte: range.to },
        }),
        // Pending requests
        CustomerRequest.countDocuments({
          status: "pending",
          createdAt: { $gte: range.from, $lte: range.to },
        }),
        // Top demanded products
        CustomerRequest.aggregate([
          {
            $match: {
              createdAt: { $gte: range.from, $lte: range.to },
              $or: [
                { productId: { $ne: null } },
                { requestedProductName: { $ne: null } },
              ],
            },
          },
          {
            $group: {
              _id: {
                productId: { $ifNull: ["$productId", null] },
                productName: { $ifNull: ["$requestedProductName", "Unknown Product"] },
              },
              requests: { $sum: 1 },
            },
          },
          {
            $project: {
              productId: "$_id.productId",
              productName: "$_id.productName",
              requests: 1,
            },
          },
          { $sort: { requests: -1 } },
          { $limit: 10 },
        ]),
        // Top demanded variants (from selectedAttributes)
        CustomerRequest.aggregate([
          // ✅ FIX: Added a strict BSON type check and empty-object verification to prevent $objectToArray from crashing on unexpected non-document values!
          {
            $match: {
              createdAt: { $gte: range.from, $lte: range.to },
              selectedAttributes: { $type: "object", $ne: {} },
            },
          },
          {
            $project: {
              attributesArray: { $objectToArray: "$selectedAttributes" },
            },
          },
          { $unwind: "$attributesArray" },
          {
            $group: {
              _id: {
                key: "$attributesArray.k",
                value: "$attributesArray.v",
              },
              requests: { $sum: 1 },
            },
          },
          {
            $project: {
              variantKey: "$_id.key",
              variantName: "$_id.value",
              requests: 1,
            },
          },
          { $sort: { requests: -1 } },
          { $limit: 10 },
        ]),
        // Daily trend
        CustomerRequest.aggregate([
          {
            $match: {
              createdAt: { $gte: range.from, $lte: range.to },
            },
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                requestType: "$requestType",
              },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.date",
              restockRequests: {
                $sum: { $cond: [{ $eq: ["$_id.requestType", "restock"] }, "$count", 0] },
              },
              customVariantRequests: {
                $sum: {
                  $cond: [{ $in: ["$_id.requestType", ["missing_variant", "missing_product"]] }, "$count", 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Paginated requests
        CustomerRequest.find({
          createdAt: { $gte: range.from, $lte: range.to },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("_id requestType productId requestedProductName selectedAttributes urgencyLevel status email phone createdAt")
          .lean(),
        // Total count
        CustomerRequest.countDocuments({
          createdAt: { $gte: range.from, $lte: range.to },
        }),
      ]);

      // ================================================================
      // 🔥 2. FORMAT RESPONSE
      // ================================================================
      const topProductName = productStats.length > 0 ? productStats[0].productName : "N/A";

      const summary = {
        totalRestockRequests: restockCount,
        totalCustomVariantRequests: customVariantCount,
        totalUrgentRequests: urgentCount,
        totalPendingRequests: pendingCount,
        topProduct: topProductName,
      };

      const topProducts: DemandProductMetric[] = productStats.map((p: any) => ({
        productId: p.productId,
        productName: p.productName,
        requests: p.requests,
      }));

      const topVariants: DemandVariantMetric[] = variantStats.map((v: any) => ({
        variantKey: v.variantKey || "Unknown",
        variantName: v.variantName || "Unknown",
        requests: v.requests,
      }));

      // ================================================================
      // 🔥 3. CONTINUOUS DATE GAP FILLING (Smooth Recharts graphs)
      // ================================================================
      const trendMap = new Map<string, any>(
        dailyTrend.map((d: any) => [d._id, d])
      );

      const trend: DemandTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        trend.push({
          date: dateStr,
          restockRequests: existing?.restockRequests || 0,
          customVariantRequests: existing?.customVariantRequests || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 4. PAGINATED EVENTS
      // ================================================================
      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      const requests: DemandEvent[] = paginatedRequests.map((doc: any) => ({
        _id: doc._id.toString(),
        requestType: doc.requestType,
        productId: doc.productId || null,
        requestedProductName: doc.requestedProductName || null,
        selectedAttributes: doc.selectedAttributes || null,
        urgencyLevel: doc.urgencyLevel,
        status: doc.status,
        email: doc.email,
        phone: doc.phone || null,
        createdAt: doc.createdAt.toISOString(),
      }));

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralDemandResponse = {
        summary,
        topProducts,
        topVariants,
        trend,
        requests,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ Cache for 5 minutes — USING safeStringify
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Demand Cached (Page ${page}) — ${trend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Demand Engine Error:", error.message);
    return {
      summary: { totalRestockRequests: 0, totalCustomVariantRequests: 0, totalUrgentRequests: 0, totalPendingRequests: 0, topProduct: "" },
      topProducts: [],
      topVariants: [],
      trend: [],
      requests: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}