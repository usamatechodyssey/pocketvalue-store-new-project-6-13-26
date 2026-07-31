// 📂 src/app/features/admin/behavioral-events/actions/getBehavioralEvents.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";

// ✅ SINGLE SOURCE OF TRUTH (Imported directly from verified types file)
import { SECURE_TELEMETRY_EVENTS } from "@/types";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface RawEvent {
  _id: string;
  eventType: string;
  sessionId: string;
  path: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BehavioralEventsResponse {
  events: RawEvent[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  eventTypes: string[];
  generatedAt: string;
}

export interface EventsFilter {
  from?: string | Date;
  to?: string | Date;
  eventType?: string;
  sessionId?: string;
  search?: string;
}

// ================================================================
// 🔧 HELPER: Safe Date Parsing Coercion
// ================================================================
const safeParseDate = (val: unknown): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    try {
      return parseISO(val);
    } catch {
      return null;
    }
  }
  return null;
};

// ================================================================
// 🔍 HELPER: Build MongoDB Query (Optimized to prevent COLLSCANs)
// ================================================================
function buildEventsQuery(filters: EventsFilter) {
  const query: Record<string, any> = {};

  if (filters.from || filters.to) {
    query.createdAt = {};
    const fromDate = safeParseDate(filters.from);
    const toDate = safeParseDate(filters.to);

    if (fromDate) query.createdAt.$gte = startOfDay(fromDate);
    if (toDate) query.createdAt.$lte = endOfDay(toDate);

    if (Object.keys(query.createdAt).length === 0) {
      delete query.createdAt;
    }
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  if (filters.sessionId) {
    query.sessionId = filters.sessionId;
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim();

    // ✅ FIX: Detect if term is an exact key/identifier to bypass heavy $regex COLLSCANs!
    const isSessionOrId = /^[a-fA-F0-9-]{20,36}$/.test(term) || term.startsWith("lock_");

    if (isSessionOrId) {
      // Exact fast indexed scan (Karachi/Lahore speed index match)
      query.$or = [
        { sessionId: term },
        { "metadata.productId": term },
        { "metadata.orderId": term },
      ];
    } else {
      // Regex search restricted ONLY to string paths and search terms
      query.$or = [
        { path: { $regex: term, $options: "i" } },
        { "metadata.search_term": { $regex: term, $options: "i" } },
      ];
    }
  }

  return query;
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
    if (result === 1) console.log(`🔓 Events Lock released (${requestId}).`);
  } catch (error) { console.error("Events Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralEvents(
  filters: EventsFilter = {},
  page: number = 1,
  limit: number = 25
): Promise<BehavioralEventsResponse> {
  const fromStr = filters.from ? (filters.from instanceof Date ? format(filters.from, "yyyy-MM-dd") : filters.from) : "any";
  const toStr = filters.to ? (filters.to instanceof Date ? format(filters.to, "yyyy-MM-dd") : filters.to) : "any";
  const eventFilter = filters.eventType || "all";
  const sessionFilter = filters.sessionId || "all";
  const searchTerm = filters.search || "none";
  const cacheKey = `analytics_behavioral_events_v3:page_${page}:limit_${limit}:from_${fromStr}:to_${toStr}:event_${eventFilter}:session_${sessionFilter}:search_${searchTerm}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralEventsResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Events (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralEventsResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale events cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Events Lock acquired (${requestId}). Generating events list (Page ${page})...`);

      const query = buildEventsQuery(filters);

      // ✅ 3. OPTIMIZATION: Read directly from static types array to bypass heavy distinct db hits
      const eventTypes = Array.from(SECURE_TELEMETRY_EVENTS).sort();

      // ✅ 4. Parallel count + data fetch (Optimized index matching)
      const [totalDocs, events] = await Promise.all([
        UserEvent.countDocuments(query),
        UserEvent.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("_id eventType sessionId path metadata createdAt")
          .lean(),
      ]);

      const totalPages = Math.ceil(totalDocs / limit) || 1;
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      const formattedEvents: RawEvent[] = events.map((e: any) => ({
        _id: e._id.toString(),
        eventType: e.eventType,
        sessionId: e.sessionId,
        path: e.path || "/",
        metadata: e.metadata || null,
        createdAt: e.createdAt.toISOString(),
      }));

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralEventsResponse = {
        events: formattedEvents,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        eventTypes,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 5. Cache for 3 minutes — USING safeStringify
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 180 });
      console.log(`✅ Behavioral Events Cached (Page ${page})`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Events Engine Error:", error.message);
    return {
      events: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      eventTypes: [],
      generatedAt: new Date().toISOString(),
    };
  }
}