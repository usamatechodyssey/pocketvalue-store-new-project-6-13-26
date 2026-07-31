// 📂 src/app/features/admin/operational-intelligence/actions/getOperationalTrends.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { OperationalTrend } from "@/models/OperationalTrend";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subDays, addDays, format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ ENTERPRISE FIX: Safe cache utilities
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ ENTERPRISE FIX: Type Definitions
// ================================================================
export interface OperationalTrendPoint {
  date: string;
  totalOrders: number;
  deliveredCount: number;
  cancelledCount: number;
  limboRevenue: number;
  pendingCount: number;
  fulfillmentRate: number;
  leakageRate: number;
}

export interface OperationalTrendResponse {
  data: OperationalTrendPoint[];
  days: number;
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN FUNCTION
// ================================================================
export async function getOperationalTrends({
  days = 30,
}: {
  days?: number;
} = {}): Promise<OperationalTrendResponse> {
  const cacheKey = `analytics_operational_trends_v3:${days}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<OperationalTrendResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Operational Trends (${days} days)`);
      return parsed;
    }

    console.log(`🔄 Redis Cache Miss: Generating Operational Trends (${days} days)...`);

    // ✅ 2. Fetch last N days of trends from MongoDB
    const today = new Date();
    const startDate = subDays(today, days - 1);
    const startStr = format(startDate, "yyyy-MM-dd");

    const trends = await OperationalTrend.find({
      date: { $gte: startStr },
    })
      .sort({ date: 1 })
      .lean();

    // ✅ 3. Build a fast lookup map for existing DB records
    const trendMap = new Map<string, any>(
      trends.map((item: any) => [item.date, item])
    );

    // ✅ 4. CONTINUOUS DATE GAP FILLING (Guarantees smooth, unbroken Recharts graph)
    const formattedData: OperationalTrendPoint[] = [];
    let currentDate = startDate;

    while (currentDate <= today) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const existing = trendMap.get(dateStr);

      formattedData.push({
        date: dateStr,
        totalOrders: existing?.totalOrders || 0,
        deliveredCount: existing?.deliveredCount || 0,
        cancelledCount: existing?.cancelledCount || 0,
        limboRevenue: existing?.limboRevenue || 0,
        pendingCount: existing?.pendingCount || 0,
        fulfillmentRate: existing?.fulfillmentRate || 0,
        leakageRate: existing?.leakageRate || 0,
      });

      currentDate = addDays(currentDate, 1);
    }

    const response: OperationalTrendResponse = {
      data: formattedData,
      days,
      generatedAt: new Date().toISOString(),
    };

    // ✅ 5. Cache for 10 minutes (using safeStringify)
    const stringified = safeStringify(response);
    await redis.set(cacheKey, stringified, { ex: 600 });
    console.log(`✅ Operational Trends Cached (${days} days) — ${formattedData.length} points`);

    return response;
  } catch (error: any) {
    console.error("Operational Trends Error:", error.message);
    return {
      data: [],
      days,
      generatedAt: new Date().toISOString(),
    };
  }
}