// 📂 src/app/features/admin/marketing/actions/getWelcomeCandidates.ts

"use server";

import { verifyStaff } from "@/lib/payloadAuth";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildWelcomeCandidatesMatrix,
  UnifiedWelcomeCandidateItem,
} from "@/app/features/admin/shared/engines/marketingPipelinesEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface WelcomeCandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  hoursSinceSignup: number;
  hasOrder: boolean;
}

export interface PaginatedWelcomeCandidatesResult {
  candidates: WelcomeCandidate[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    pendingConversions: number; // New signups with 0 orders (Leads)
    alreadyConverted: number;   // New signups who already ordered
    hasEmail: number;
    hasPhone: number;
  };
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getWelcomeCandidates({
  page = 1,
  limit = 20,
  searchTerm = "",
  minAgeHours = 0,
  maxAgeHours = 48,
  range,
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minAgeHours?: number;
  maxAgeHours?: number;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<PaginatedWelcomeCandidatesResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    const dateRangeStr = range?.startDate && range?.endDate 
      ? `:${format(new Date(range.startDate), "yyyy-MM-dd")}_${format(new Date(range.endDate), "yyyy-MM-dd")}`
      : `:hours_${maxAgeHours}`;

    const cacheKey = `analytics_welcome_candidates_v2:page_${page}:limit_${limit}:search_${searchTerm || "none"}${dateRangeStr}`;

    // 1. Check Cache
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedWelcomeCandidatesResult>(cached as string | null);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Welcome Candidates (${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Welcome candidates cache read failed:", cacheError);
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildWelcomeCandidatesMatrix({
      page,
      limit,
      searchTerm,
      minAgeHours,
      maxAgeHours,
      range,
    });

    const candidates: WelcomeCandidate[] = engineResult.candidates.map((c: UnifiedWelcomeCandidateItem) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      hoursSinceSignup: c.hoursSinceSignup,
      hasOrder: c.hasOrder,
    }));

    const result: PaginatedWelcomeCandidatesResult = {
      candidates,
      totalDocs: engineResult.totalDocs,
      totalPages: engineResult.totalPages,
      summary: engineResult.summary,
    };

    // 3. Cache safely for 1 min
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 60 });
    } catch (cacheError) {
      console.warn("⚠️ Welcome candidates cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch welcome candidates:", error.message);
    return {
      candidates: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, pendingConversions: 0, alreadyConverted: 0, hasEmail: 0, hasPhone: 0 },
    };
  }
}