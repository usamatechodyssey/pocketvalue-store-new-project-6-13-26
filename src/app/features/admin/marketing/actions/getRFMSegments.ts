// 📂 src/app/features/admin/marketing/actions/getRFMSegments.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildRfmSegmentsMatrix,
  UnifiedRfmSegmentSummary,
  UnifiedRfmUser,
} from "@/app/features/admin/shared/engines/customerLtvEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface RFMUser {
  userId: string;
  email: string;      
  name: string;       
  recency: number;    // days since last order
  frequency: number;  // total orders
  monetary: number;   // total spend
  recencyScore: number;   // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number;  // 1-5
  segment: string;    // "Champions", "Loyal Customers", etc.
}

export interface RFMSegmentSummary {
  segment: string;
  count: number;
  percentage: number;
}

export interface RFMSegmentsResponse {
  segments: RFMSegmentSummary[];
  users: RFMUser[];
  totalUsers: number;
  generatedAt: string;
  cacheTTL: number; // remaining seconds
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getRFMSegments({
  segmentFilter,
  page = 1,
  limit = 20,
  range,
}: {
  segmentFilter?: string;
  page?: number;
  limit?: number;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<{
  success: boolean;
  data?: RFMSegmentsResponse;
  error?: string;
}> {
  const dateRangeStr = range?.startDate && range?.endDate 
    ? `:${format(new Date(range.startDate), "yyyy-MM-dd")}_${format(new Date(range.endDate), "yyyy-MM-dd")}`
    : ":all_time";

  const cacheKey = `analytics_rfm_summary_v7${dateRangeStr}:page_${page}:seg_${segmentFilter || "all"}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<RFMSegmentsResponse>(cachedData as string | null);
    if (parsed) {
      const ttl = await redis.ttl(cacheKey);
      console.log("⚡ Redis Cache Hit: RFM Segments (Central Engine)");
      return {
        success: true,
        data: {
          ...parsed,
          cacheTTL: ttl > 0 ? ttl : 0,
        },
      };
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildRfmSegmentsMatrix({
      segmentFilter,
      page,
      limit,
      range,
    });

    const mappedSegments: RFMSegmentSummary[] = engineResult.segments.map((s: UnifiedRfmSegmentSummary) => ({
      segment: s.segment,
      count: s.count,
      percentage: s.percentage,
    }));

    const mappedUsers: RFMUser[] = engineResult.users.map((u: UnifiedRfmUser) => ({
      userId: u.userId,
      email: u.email,
      name: u.name,
      recency: u.recency,
      frequency: u.frequency,
      monetary: u.monetary,
      recencyScore: u.recencyScore,
      frequencyScore: u.frequencyScore,
      monetaryScore: u.monetaryScore,
      segment: u.segment,
    }));

    const response: RFMSegmentsResponse = {
      segments: mappedSegments,
      users: mappedUsers,
      totalUsers: engineResult.totalUsers,
      generatedAt: engineResult.generatedAt,
      cacheTTL: 86400,
    };

    // 3. Cache safely for 24h
    try {
      await redis.set(cacheKey, safeStringify(response), { ex: 86400 });
      console.log("💾 RFM Data Cached (24h TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache RFM data:", cacheError);
    }

    return {
      success: true,
      data: {
        ...response,
        cacheTTL: 86400,
      },
    };
  } catch (error: any) {
    console.error("❌ RFM Engine Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to generate RFM segments.",
    };
  }
}