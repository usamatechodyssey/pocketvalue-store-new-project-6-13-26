// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralFriction.ts (FIXED DIRECTIVE & HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import { format, addDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface FrictionEvent {
  _id: string;
  eventType: string;
  sessionId: string;
  path: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface FrictionTrendPoint {
  date: string;
  rageClicks: number;
  exitIntents: number;
  oosAttempts: number;
  jsExceptions: number;
  checkoutErrors: number;
}

export interface BehavioralFrictionResponse {
  summary: {
    totalRageClicks: number;
    totalExitIntents: number;
    totalOosAttempts: number;
    totalJsExceptions: number;
    totalCheckoutErrors: number;
    totalFrictionEvents: number;
  };
  trend: FrictionTrendPoint[];
  events: FrictionEvent[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  generatedAt: string;
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
    if (result === 1) console.log(`🔓 Friction Lock released (${requestId}).`);
  } catch (error) { console.error("Friction Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getBehavioralFriction(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralFrictionResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_friction_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralFrictionResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Friction (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralFrictionResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale friction cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Friction Lock acquired (${requestId}). Generating friction intelligence...`);

      // ================================================================
      // 🔥 1. AGGREGATION FOR TOTALS AND TREND
      // ================================================================
      const frictionEvents = [
        "rage_click_detected",
        "exit_intent_triggered",
        "oos_attempt",
        "js_exception",
        "checkout_error",
      ];

      const [eventCounts, dailyTrend, paginatedEvents] = await Promise.all([
        // Count per event type
        UserEvent.aggregate([
          {
            $match: {
              eventType: { $in: frictionEvents },
              createdAt: { $gte: range.from, $lte: range.to },
            },
          },
          {
            $group: {
              _id: "$eventType",
              count: { $sum: 1 },
            },
          },
        ]),
        // Daily trend
        UserEvent.aggregate([
          {
            $match: {
              eventType: { $in: frictionEvents },
              createdAt: { $gte: range.from, $lte: range.to },
            },
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                eventType: "$eventType",
              },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.date",
              rageClicks: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "rage_click_detected"] }, "$count", 0] },
              },
              exitIntents: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "exit_intent_triggered"] }, "$count", 0] },
              },
              oosAttempts: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "oos_attempt"] }, "$count", 0] },
              },
              jsExceptions: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "js_exception"] }, "$count", 0] },
              },
              checkoutErrors: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "checkout_error"] }, "$count", 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Paginated events (details)
        UserEvent.find({
          eventType: { $in: frictionEvents },
          createdAt: { $gte: range.from, $lte: range.to },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("_id eventType sessionId path metadata createdAt")
          .lean(),
      ]);

      // ================================================================
      // 🔥 2. BUILD SUMMARY
      // ================================================================
      const countMap = new Map(eventCounts.map((e: any) => [e._id, e.count]));
      const totalFrictionEvents = eventCounts.reduce((sum, e) => sum + e.count, 0);

      const summary = {
        totalRageClicks: countMap.get("rage_click_detected") || 0,
        totalExitIntents: countMap.get("exit_intent_triggered") || 0,
        totalOosAttempts: countMap.get("oos_attempt") || 0,
        totalJsExceptions: countMap.get("js_exception") || 0,
        totalCheckoutErrors: countMap.get("checkout_error") || 0,
        totalFrictionEvents,
      };

      // ================================================================
      // 🔥 3. CONTINUOUS DATE GAP FILLING
      // ================================================================
      const trendMap = new Map<string, any>(
        dailyTrend.map((d: any) => [d._id, d])
      );

      const trend: FrictionTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        trend.push({
          date: dateStr,
          rageClicks: existing?.rageClicks || 0,
          exitIntents: existing?.exitIntents || 0,
          oosAttempts: existing?.oosAttempts || 0,
          jsExceptions: existing?.jsExceptions || 0,
          checkoutErrors: existing?.checkoutErrors || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 4. PAGINATED EVENTS & TOTAL COUNT
      // ================================================================
      const totalDocs = await UserEvent.countDocuments({
        eventType: { $in: frictionEvents },
        createdAt: { $gte: range.from, $lte: range.to },
      });
      const totalPages = Math.ceil(totalDocs / limit) || 1;
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      const events: FrictionEvent[] = paginatedEvents.map((e: any) => ({
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
      const response: BehavioralFrictionResponse = {
        summary,
        trend,
        events,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 5. Cache for 5 minutes
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Friction Cached (Page ${page}) — ${trend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Friction Engine Error:", error.message);
    return {
      summary: { totalRageClicks: 0, totalExitIntents: 0, totalOosAttempts: 0, totalJsExceptions: 0, totalCheckoutErrors: 0, totalFrictionEvents: 0 },
      trend: [],
      events: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}