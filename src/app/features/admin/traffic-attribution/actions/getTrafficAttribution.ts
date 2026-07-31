// 📂 src/app/features/admin/traffic-attribution/actions/getTrafficAttribution.ts (FULLY ACCURATE UTM PATH FIXED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ ENTERPRISE FIX: Proper Type Interface
// ================================================================
export interface TrafficSource {
  name: string;
  value: number;
  orders: number;
  fill: string;
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
      console.log(`🔓 Traffic Lock released (${requestId}).`);
    }
  } catch (error) {
    console.error(`❌ Traffic Lock release error:`, error);
  }
};

// ================================================================
// 🎨 ENTERPRISE FIX: Dynamic Color Generator
// ================================================================
const getColor = (index: number): string => {
  const colors = [
    "#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#14b8a6", "#D11111", "#6366f1", "#84cc16",
  ];
  return colors[index % colors.length];
};

interface DateRange {
  from: Date;
  to: Date;
}

// ================================================================
// 🚀 MAIN FUNCTION
// ================================================================
export async function getTrafficAttributionPayload(range: DateRange): Promise<TrafficSource[]> {
  const cacheKey = `analytics_traffic_attribution:${format(range.from, "yyyy-MM-dd")}_${format(range.to, "yyyy-MM-dd")}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<TrafficSource[]>(cachedData);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Traffic Attribution");
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
      const retryParsed = safeParse<TrafficSource[]>(retryCache);
      if (retryParsed) {
        console.log(`⚡ Served stale traffic cache.`);
        return retryParsed;
      }
      return [];
    }

    try {
      console.log(`🔒 Traffic Lock acquired (${requestId}). Generating attribution...`);

      // ✅ 3. ENTERPRISE FIX: Query exact utmSource field path stored in MongoDB Order schema
      const attribution = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $in: REVENUE_STATUSES },
          },
        },
        {
          $project: {
            "trafficSource.utmSource": 1,
            "trafficSource.source": 1,
            totalPrice: 1,
          },
        },
        {
          $group: {
            _id: {
              $ifNull: [
                "$trafficSource.utmSource",
                { $ifNull: ["$trafficSource.source", "Direct"] }
              ]
            },
            revenue: { $sum: "$totalPrice" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // ✅ 4. Map to Response with Dynamic Colors
      const attributionData: TrafficSource[] = attribution.map((item, index) => ({
        name: item._id ? String(item._id).toUpperCase() : "DIRECT",
        value: item.revenue,
        orders: item.orderCount,
        fill: getColor(index),
      }));

      // ✅ 5. Cache for 10 Minutes (with safeStringify)
      const stringified = safeStringify(attributionData);
      await redis.set(cacheKey, stringified, { ex: 600 });
      console.log(`✅ Traffic Attribution Cached (${attributionData.length} sources).`);

      return attributionData;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("❌ Traffic Engine Failure:", error.message);
    return [];
  }
}