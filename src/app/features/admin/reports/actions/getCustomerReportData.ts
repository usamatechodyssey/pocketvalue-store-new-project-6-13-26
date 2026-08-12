// 📂 src/app/features/admin/reports/actions/getCustomerReportData.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildCohortLtvMatrix,
  UnifiedCohortLtvItem,
} from "@/app/features/admin/shared/engines/customerLtvEngine";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts "customer-ltv")
// ================================================================
export interface CustomerReportRow {
  cohort: string; // e.g., "2024-07"
  newUsers: number;
  repeatUsers: number;
  repeatRate: number; // %
  avgLTV: number; // Rs.
  day30Retention: number; // %
}

export interface CustomerReportResponse {
  data: CustomerReportRow[];
  totals: {
    newUsers: number;
    repeatUsers: number;
    repeatRate: number;
    avgLTV: number;
    day30Retention: number;
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN REPORT SERVER ACTION (Delegated to Central Engine)
// ================================================================
export async function getCustomerReportData(
  range: { startDate: Date; endDate: Date },
  slug: "customer-ltv"
): Promise<{ success: boolean; data?: CustomerReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_customer_v7_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "finance"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CustomerReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Customer Report (${slug})`);
      return { success: true, data: parsed };
    }

    await connectMongoose();
    const start = startOfDay(new Date(range.startDate));
    const end = endOfDay(new Date(range.endDate));

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildCohortLtvMatrix({
      startDate: start,
      endDate: end,
    });

    const data: CustomerReportRow[] = engineResult.data.map((item: UnifiedCohortLtvItem) => ({
      cohort: item.cohort,
      newUsers: item.newUsers,
      repeatUsers: item.repeatUsers,
      repeatRate: item.repeatRate,
      avgLTV: item.avgLTV,
      day30Retention: item.day30Retention,
    }));

    const result: CustomerReportResponse = {
      data,
      totals: engineResult.totals,
      generatedAt: engineResult.generatedAt,
    };

    // 3. Cache for 5 Minutes
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`💾 Customer Report cached successfully: ${slug}`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache customer report:", cacheError);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error(`❌ Customer Report Error (${slug}):`, error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch customer report data.",
    };
  }
}