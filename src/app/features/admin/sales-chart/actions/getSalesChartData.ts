// src/app/features/admin/analytics-telemetry/action/getSalesChartData.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { eachDayOfInterval, format, differenceInDays } from "date-fns";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "../../analytics-telemetry/action/verifyAdminAccess";

// ✅ ENTERPRISE FIX: Import shared constants
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ✅ ENTERPRISE FIX: Safe cache utilities
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

interface DateRange {
  from: Date;
  to: Date;
  startDate: Date;
  endDate: Date;
  compareStartDate: Date;
  compareEndDate: Date;
  compare: boolean;
}

export interface ComparativeChartPoint {
  dayIndex: number;
  currentLabel: string;
  revenue: number;
  orders: number;
  compareLabel: string;
  compareRevenue: number;
  compareOrders: number;
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
      console.log(`🔓 Chart Lock released (${requestId}).`);
    } else {
      console.warn(`⚠️ Chart Lock not released. Value mismatch or expired.`);
    }
  } catch (error) {
    console.error(`❌ Chart Lock release error:`, error);
  }
};

// 🧮 Helper to convert 24h format to 12-hour AM/PM format
const formatHourLabel = (h: number) => {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
};

// ✅ ENTERPRISE FIX: Dynamic Timezone (from environment, fallback +05:00)
const getTimezone = (): string => {
  return process.env.PKT_TIMEZONE || '+05:00';
};

// ================================================================
// 🚀 MAIN FUNCTION
// ================================================================
export async function getSalesChartDataPayload(range: DateRange): Promise<ComparativeChartPoint[]> {
  const fromStr = format(range.startDate, "yyyy-MM-dd");
  const toStr = format(range.endDate, "yyyy-MM-dd");
  const cacheKey = `analytics_sales_chart_compare:${fromStr}_${toStr}:compare_${range.compare}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ================================================================
    // 1. CACHE CHECK (With safeParse)
    // ================================================================
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ComparativeChartPoint[]>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Sales Performance Chart Data");
      return parsed;
    }

    // ================================================================
    // 2. CACHE STAMPEDE PROTECTION (SETNX Lock)
    // ================================================================
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log(`⏳ Cache Stampede Detected. Waiting 500ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<ComparativeChartPoint[]>(retryCache as string | null);
      if (retryParsed) {
        console.log(`⚡ Served stale chart cache.`);
        return retryParsed;
      }
      console.warn(`⚠️ No stale chart cache available. Returning empty array.`);
      return [];
    }

    try {
      console.log(`🔒 Chart Lock acquired (${requestId}). Generating chart data...`);

      const isSingleDay = differenceInDays(range.endDate, range.startDate) === 0;
      const timezone = getTimezone();

      let chartData: ComparativeChartPoint[] = [];

      if (isSingleDay) {
        // ========================================================
        // 🔥 ENGINE A: HOURLY GROUPING (Single Day View)
        // ========================================================
        const [currentHourly, compareHourly] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: range.startDate, $lte: range.endDate },
                status: { $in: REVENUE_STATUSES },
              },
            },
            {
              $group: {
                _id: { $hour: { date: "$createdAt", timezone: timezone } },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          range.compare
            ? Order.aggregate([
                {
                  $match: {
                    createdAt: { $gte: range.compareStartDate, $lte: range.compareEndDate },
                    status: { $in: REVENUE_STATUSES },
                  },
                },
                {
                  $group: {
                    _id: { $hour: { date: "$createdAt", timezone: timezone } },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
              ])
            : Promise.resolve([]),
        ]);

        const currentMap = new Map(currentHourly.map((i) => [i._id, i]));
        const compareMap = new Map(compareHourly.map((i) => [i._id, i]));

        for (let h = 0; h < 24; h++) {
          const currentMetrics = currentMap.get(h);
          const compareMetrics = compareMap.get(h);
          const hourLabel = formatHourLabel(h);

          chartData.push({
            dayIndex: h,
            currentLabel: hourLabel,
            revenue: currentMetrics ? currentMetrics.revenue : 0,
            orders: currentMetrics ? currentMetrics.orders : 0,
            compareLabel: hourLabel,
            compareRevenue: compareMetrics ? compareMetrics.revenue : 0,
            compareOrders: compareMetrics ? compareMetrics.orders : 0,
          });
        }
      } else {
        // ========================================================
        // 📊 ENGINE B: DAILY GROUPING (Multi-Day View)
        // ========================================================
        const [currentResult, compareResult] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: range.startDate, $lte: range.endDate },
                status: { $in: REVENUE_STATUSES },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: timezone,
                  },
                },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          range.compare
            ? Order.aggregate([
                {
                  $match: {
                    createdAt: { $gte: range.compareStartDate, $lte: range.compareEndDate },
                    status: { $in: REVENUE_STATUSES },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: timezone,
                      },
                    },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
              ])
            : Promise.resolve([]),
        ]);

        const currentDataMap = new Map(currentResult.map((i) => [i._id, i]));
        const compareDataMap = new Map(compareResult.map((i) => [i._id, i]));

        const currentDays = eachDayOfInterval({ start: range.startDate, end: range.endDate });
        const compareDays = eachDayOfInterval({ start: range.compareStartDate, end: range.compareEndDate });

        const daysCount = currentDays.length;

        for (let i = 0; i < daysCount; i++) {
          const currentDay = currentDays[i];
          const compareDay = compareDays[i];

          const currentStr = format(currentDay, "yyyy-MM-dd");
          const compareStr = compareDay ? format(compareDay, "yyyy-MM-dd") : "";

          const currentMetrics = currentDataMap.get(currentStr);
          const compareMetrics = compareStr ? compareDataMap.get(compareStr) : null;

          chartData.push({
            dayIndex: i,
            currentLabel: format(currentDay, "MMM dd"),
            revenue: currentMetrics ? currentMetrics.revenue : 0,
            orders: currentMetrics ? currentMetrics.orders : 0,
            compareLabel: compareDay ? format(compareDay, "MMM dd") : "",
            compareRevenue: compareMetrics ? compareMetrics.revenue : 0,
            compareOrders: compareMetrics ? compareMetrics.orders : 0,
          });
        }
      }

      // 💾 3. WRITE CACHE (10 minutes) — using safeStringify
      const stringified = safeStringify(chartData);
      await redis.set(cacheKey, stringified, { ex: 600 });

      return chartData;
    } finally {
      // ✅ ENTERPRISE FIX: Atomic Lock Release
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Sales Chart Comparative Engine Error:", error.message);
    return [];
  }
}