// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralNavigation.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import { format, differenceInSeconds, addDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface PageMetric {
  path: string;
  views: number;
  uniqueSessions: number;
  bounceRate: number;
  avgTimeOnPage: number;
  entryCount: number;
  exitCount: number;
}

export interface NavigationTrendPoint {
  date: string;
  pageViews: number;
  uniqueSessions: number;
  bounceRate: number;
}

export interface BehavioralNavigationResponse {
  summary: {
    totalPageViews: number;
    uniqueSessions: number;
    bounceRate: number;
    avgPageViewsPerSession: number;
    topEntryPage: string;
    topExitPage: string;
  };
  topPages: PageMetric[];
  trend: NavigationTrendPoint[];
  pagesList: PageMetric[];
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
    if (result === 1) console.log(`🔓 Navigation Lock released (${requestId}).`);
  } catch (error) { console.error("Navigation Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralNavigation(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralNavigationResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_navigation_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralNavigationResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Navigation (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralNavigationResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale navigation cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Navigation Lock acquired (${requestId}). Generating navigation intelligence...`);

      // ================================================================
      // 🔥 1. PAGE-LEVEL AGGREGATION
      // ================================================================
      const pageStats = await UserEvent.aggregate([
        {
          $match: {
            eventType: "page_view",
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
            uniqueSessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            path: "$_id",
            views: 1,
            uniqueSessions: { $size: "$uniqueSessions" },
          },
        },
        { $sort: { views: -1 } },
      ]);

      // ================================================================
      // 🔥 2. SESSION-LEVEL STATS (Un-sorted aggregation)
      // ================================================================
      const sessionData = await UserEvent.aggregate([
        {
          $match: {
            eventType: "page_view",
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $group: {
            _id: "$sessionId",
            firstPage: { $first: "$path" },
            lastPage: { $last: "$path" },
            pageCount: { $sum: 1 },
            firstTime: { $first: "$createdAt" },
            lastTime: { $last: "$createdAt" },
            pages: { $push: "$path" },
            times: { $push: "$createdAt" },
          },
        },
      ]);

      // ================================================================
      // 🔥 3. COMPUTE METRICS WITH CHRONOLOGICAL SORTING
      // ================================================================
      const totalSessions = sessionData.length;
      const bounceSessions = sessionData.filter((s) => s.pageCount === 1).length;
      const overallBounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;
      let totalPageViews = 0;

      const entryMap = new Map<string, number>();
      const exitMap = new Map<string, number>();
      const pageDurationMap = new Map<string, { totalDuration: number; count: number }>();

      for (const sess of sessionData) {
        entryMap.set(sess.firstPage, (entryMap.get(sess.firstPage) || 0) + 1);
        exitMap.set(sess.lastPage, (exitMap.get(sess.lastPage) || 0) + 1);

        // ✅ FIX 1: Zip and sort pages & times chronologically to prevent negative duration & NaN average bugs!
        const zipped = (sess.pages as string[]).map((p, idx) => ({
          path: p,
          time: new Date(sess.times[idx]),
        })).sort((a, b) => a.time.getTime() - b.time.getTime());

        for (let i = 0; i < zipped.length - 1; i++) {
          const duration = differenceInSeconds(zipped[i + 1].time, zipped[i].time);
          const pagePath = zipped[i].path;
          
          if (pagePath && duration >= 0) {
            const existing = pageDurationMap.get(pagePath) || { totalDuration: 0, count: 0 };
            existing.totalDuration += duration;
            existing.count += 1;
            pageDurationMap.set(pagePath, existing);
          }
        }
      }

      const avgTimeMap = new Map<string, number>();
      for (const [path, data] of pageDurationMap) {
        avgTimeMap.set(path, data.count > 0 ? data.totalDuration / data.count : 0);
      }

      totalPageViews = pageStats.reduce((sum, p) => sum + p.views, 0);

      // ================================================================
      // 🔥 4. ENRICH PAGE STATS (No-gap sorting)
      // ================================================================
      const enrichedPages = pageStats.map((p) => {
        const sessions = p.uniqueSessions || 0;
        const bounceCount = sessionData.filter(
          (s) => s.pageCount === 1 && s.firstPage === p.path
        ).length;
        const bounceRate = sessions > 0 ? (bounceCount / sessions) * 100 : 0;
        const entryCount = entryMap.get(p.path) || 0;
        const exitCount = exitMap.get(p.path) || 0;
        const avgTimeOnPage = avgTimeMap.get(p.path) || 0;

        return {
          path: p.path,
          views: p.views,
          uniqueSessions: sessions,
          bounceRate: Number(bounceRate.toFixed(1)),
          avgTimeOnPage: Number(avgTimeOnPage.toFixed(1)),
          entryCount,
          exitCount,
        };
      });

      // ================================================================
      // 🔥 5. DAILY TREND (Zero gap aggregation)
      // ================================================================
      const dailyTrendAgg = await UserEvent.aggregate([
        {
          $match: {
            eventType: "page_view",
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              sessionId: "$sessionId",
            },
            pageCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: {
              date: "$_id.date",
            },
            sessions: { $sum: 1 },
            bounceSessions: {
              $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] },
            },
            pageViews: { $sum: "$pageCount" },
          },
        },
        {
          $project: {
            date: "$_id.date",
            pageViews: 1,
            uniqueSessions: "$sessions",
            bounceRate: {
              $multiply: [{ $divide: ["$bounceSessions", "$sessions"] }, 100],
            },
          },
        },
        { $sort: { date: 1 } },
      ]);

      const trendMap = new Map<string, any>(
        dailyTrendAgg.map((t: any) => [t.date, t])
      );

      // Continuous date gap filling
      const trend: NavigationTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        trend.push({
          date: dateStr,
          pageViews: existing?.pageViews || 0,
          uniqueSessions: existing?.uniqueSessions || 0,
          bounceRate: existing?.bounceRate ? Number(existing.bounceRate.toFixed(1)) : 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 6. TOP PAGES & PAGINATION
      // ================================================================
      const topPages = enrichedPages.slice(0, 10);
      const totalDocs = enrichedPages.length;
      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));
      const start = (safePage - 1) * limit;
      const paginatedPages = enrichedPages.slice(start, start + limit);

      // ================================================================
      // 🔥 7. SUMMARY
      // ================================================================
      const summary = {
        totalPageViews,
        uniqueSessions: totalSessions,
        bounceRate: Number(overallBounceRate.toFixed(1)),
        avgPageViewsPerSession: totalSessions > 0 ? Number((totalPageViews / totalSessions).toFixed(1)) : 0,
        topEntryPage: enrichedPages.sort((a, b) => b.entryCount - a.entryCount)[0]?.path || "N/A",
        topExitPage: enrichedPages.sort((a, b) => b.exitCount - a.exitCount)[0]?.path || "N/A",
      };

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralNavigationResponse = {
        summary,
        topPages,
        trend,
        pagesList: paginatedPages,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 8. Cache for 5 minutes — USING safeStringify
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Navigation Cached (Page ${page}) — ${trend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Navigation Error:", error.message);
    return {
      summary: { totalPageViews: 0, uniqueSessions: 0, bounceRate: 0, avgPageViewsPerSession: 0, topEntryPage: "", topExitPage: "" },
      topPages: [],
      trend: [],
      pagesList: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}