// 📂 src/app/features/admin/marketing/actions/getWinbackCandidates.ts

"use server";

import { verifyStaff } from "@/lib/payloadAuth";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildWinbackCandidatesMatrix,
  UnifiedWinbackCandidateItem,
} from "@/app/features/admin/shared/engines/marketingPipelinesEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface WinbackCandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  segment: "high-value" | "medium-value" | "low-value";
}

export interface PaginatedWinbackCandidatesResult {
  candidates: WinbackCandidate[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    totalWinbackPotentialRevenue: number; // Global Lost Customer Spend in PKR
    highValue: number;
    mediumValue: number;
    lowValue: number;
    hasEmail: number;
  };
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getWinbackCandidates({
  page = 1,
  limit = 20,
  searchTerm = "",
  minInactiveDays,
  maxInactiveDays = 365,
  range,
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minInactiveDays?: number;
  maxInactiveDays?: number;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<PaginatedWinbackCandidatesResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Fetch Dynamic Settings
    const settings = await getCachedSettings();
    const defaultInactiveDays = settings?.inactiveDaysThreshold ?? 60;
    const highValueThreshold = settings?.highValueInactiveThreshold ?? 5000;

    const effectiveMinDays = minInactiveDays ?? defaultInactiveDays;

    const dateRangeStr = range?.startDate && range?.endDate 
      ? `:${format(new Date(range.startDate), "yyyy-MM-dd")}_${format(new Date(range.endDate), "yyyy-MM-dd")}`
      : `:min_${effectiveMinDays}`;

    const cacheKey = `analytics_winback_candidates_v2:page_${page}:limit_${limit}:search_${searchTerm || "none"}${dateRangeStr}`;

    // 2. Check Cache
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedWinbackCandidatesResult>(cached as string | null);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Winback Candidates (Page ${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Winback candidates cache read failed:", cacheError);
    }

    // 3. Delegate Calculation to Central Shared Engine
    const engineResult = await buildWinbackCandidatesMatrix({
      page,
      limit,
      searchTerm,
      effectiveMinDays,
      highValueThreshold,
      range,
    });

    const candidates: WinbackCandidate[] = engineResult.candidates.map((c: UnifiedWinbackCandidateItem) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalOrders: c.totalOrders,
      totalSpend: c.totalSpend,
      lastOrderDate: c.lastOrderDate,
      daysSinceLastOrder: c.daysSinceLastOrder,
      segment: c.segment,
    }));

    const result: PaginatedWinbackCandidatesResult = {
      candidates,
      totalDocs: engineResult.totalDocs,
      totalPages: engineResult.totalPages,
      summary: engineResult.summary,
    };

    // 4. Cache safely for 5 minutes
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log("💾 Winback candidates cached successfully.");
    } catch (cacheError) {
      console.warn("⚠️ Winback candidates cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch winback candidates:", error.message);
    return {
      candidates: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, totalWinbackPotentialRevenue: 0, highValue: 0, mediumValue: 0, lowValue: 0, hasEmail: 0 },
    };
  }
}