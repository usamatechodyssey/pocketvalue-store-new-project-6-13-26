// 📂 src/app/features/admin/reports/actions/getReturnRequestsSummaryData.ts (FULLY DECOUPLED & HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import ReturnRequest from "@/models/ReturnRequest";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// ================================================================
export interface ReturnStatusSummaryRow {
  status: string;
  count: number;
}

export interface ReturnRequestsSummaryResponse {
  data: ReturnStatusSummaryRow[];
  totals: {
    count: number; // ✅ Aligned totals key with table column config
    totalRequests: number;
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getReturnRequestsSummaryData(
  range: { startDate: Date; endDate: Date }
): Promise<{ success: boolean; data?: ReturnRequestsSummaryResponse; error?: string }> {
  const cacheKey = `analytics_return_summary_v4:${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<ReturnRequestsSummaryResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Return Requests Summary`);
      return { success: true, data: parsed };
    }

    await connectMongoose();

    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);

    // ================================================================
    // GROUP BY STATUS
    // ================================================================
    const aggregation = await ReturnRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ================================================================
    // BUILD RESPONSE
    // ================================================================
    const data: ReturnStatusSummaryRow[] = aggregation.map((item: any) => ({
      status: item._id || "Unknown",
      count: item.count || 0,
    }));

    const totalRequests = data.reduce((sum, row) => sum + row.count, 0);

    const result: ReturnRequestsSummaryResponse = {
      data,
      totals: {
        count: totalRequests,
        totalRequests,
      },
      generatedAt: new Date().toISOString(),
    };

    // 2. Cache Write (using safeStringify)
    try {
      const stringified = safeStringify(result);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log(`💾 Return Requests Summary cached (5 min TTL).`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache return requests summary:", cacheError);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error(`❌ Return Requests Summary Error:`, error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch return requests summary data.",
    };
  }
}