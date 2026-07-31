// src/app/features/admin/product-intelligence/actions/getTopProducts.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ SINGLE SOURCE OF TRUTH: Shared Analytics Constants
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ✅ ENTERPRISE FIX: Safe cache utilities
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ ENTERPRISE FIX: Proper Type Interface
// ================================================================
export interface TopProductItem {
  _id: string;
  name: string;
  variantName: string;
  totalSold: number;
  revenue: number;
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
      console.log(`🔓 Top Products Lock released (${requestId}).`);
    }
  } catch (error) {
    console.error(`❌ Top Products Lock release error:`, error);
  }
};

interface DateRange {
  from: Date;
  to: Date;
}

// ================================================================
// 🚀 MAIN FUNCTION — Dashboard Widget (Top 5)
// ================================================================
export async function getTopProductsPayload(range: DateRange): Promise<TopProductItem[]> {
  const cacheKey = `analytics_top_products:${format(range.from, "yyyy-MM-dd")}_${format(range.to, "yyyy-MM-dd")}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<TopProductItem[]>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Top Products");
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
      const retryParsed = safeParse<TopProductItem[]>(retryCache as string | null);
      if (retryParsed) {
        console.log(`⚡ Served stale top products cache.`);
        return retryParsed;
      }
      return [];
    }

    try {
      console.log(`🔒 Top Products Lock acquired (${requestId}). Generating top products...`);

      // ✅ 3. Aggregation with Shared Whitelist Statuses
      const topProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $in: REVENUE_STATUSES }, // ✅ SHARED WHITELIST
          },
        },
        {
          $project: {
            products: 1,
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            name: { $first: "$products.name" },
            variantName: {
              $first: {
                $ifNull: ["$products.variant.name", "$products.variantName"],
              },
            },
            totalSold: { $sum: { $ifNull: ["$products.quantity", 0] } },
            revenue: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$products.price", 0] },
                  { $ifNull: ["$products.quantity", 0] },
                ],
              },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]);

      // ✅ 4. Format Response
      const response: TopProductItem[] = topProducts.map((item) => ({
        _id: item._id,
        name: item.name || "Unknown Product",
        variantName: item.variantName || "Default",
        totalSold: item.totalSold || 0,
        revenue: item.revenue || 0,
      }));

      // ✅ 5. Cache for 10 Minutes (using safeStringify)
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 600 });
      console.log(`✅ Top Products Cached.`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Top Products Engine Error:", error.message);
    return [];
  }
}