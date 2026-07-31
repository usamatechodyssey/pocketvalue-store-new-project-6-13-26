// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralSearch.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import { format, addDays } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface SearchTermMetric {
  term: string;
  searches: number;
  clicks: number;
  ctr: number;
  zeroResults: boolean;
}

export interface SearchTrendPoint {
  date: string;
  searches: number;
  clicks: number;
}

export interface BehavioralSearchResponse {
  summary: {
    totalSearches: number;
    totalClicks: number;
    overallCtr: number;
    zeroResultSearches: number;
    topTrendingTerm: string;
  };
  trendingTerms: { term: string; count: number }[];
  trend: SearchTrendPoint[];
  searchTerms: SearchTermMetric[];
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
    if (result === 1) console.log(`🔓 Search Lock released (${requestId}).`);
  } catch (error) { console.error("Search Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralSearch(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralSearchResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_search_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralSearchResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Search (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralSearchResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale search cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Search Lock acquired (${requestId}). Generating search intelligence...`);

      // ================================================================
      // 🔥 1. SEARCH AGGREGATIONS
      // ================================================================
      const [searchStats, clickStats, trendingTerms, dailyTrend, paginatedTerms] = await Promise.all([
        // Total Searches
        UserEvent.aggregate([
          { $match: { eventType: "search", createdAt: { $gte: range.from, $lte: range.to } } },
          { $count: "total" },
        ]),
        // Total Clicks
        UserEvent.aggregate([
          { $match: { eventType: "search_result_click", createdAt: { $gte: range.from, $lte: range.to } } },
          { $count: "total" },
        ]),
        // Trending Terms (Top 10)
        UserEvent.aggregate([
          { $match: { eventType: "search", createdAt: { $gte: range.from, $lte: range.to } } },
          { $match: { "metadata.search_term": { $exists: true, $ne: "" } } },
          { $group: { _id: "$metadata.search_term", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        // Daily Trend
        UserEvent.aggregate([
          { $match: { eventType: "search", createdAt: { $gte: range.from, $lte: range.to } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              searches: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Paginated Search Terms
        UserEvent.aggregate([
          { $match: { eventType: "search", createdAt: { $gte: range.from, $lte: range.to } } },
          { $match: { "metadata.search_term": { $exists: true, $ne: "" } } },
          {
            $group: {
              _id: "$metadata.search_term",
              searches: { $sum: 1 },
              zeroResults: {
                $sum: {
                  $cond: [{ $eq: [{ $ifNull: ["$metadata.result_count", 1] }, 0] }, 1, 0],
                },
              },
            },
          },
          { $sort: { searches: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ]),
      ]);

      // ================================================================
      // 🔥 2. COMPUTE CLICKS PER SEARCH TERM
      // ================================================================
      const termClicks = await UserEvent.aggregate([
        {
          $match: {
            eventType: "search_result_click",
            createdAt: { $gte: range.from, $lte: range.to },
            "metadata.query": { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$metadata.query",
            clicks: { $sum: 1 },
          },
        },
      ]);

      const clickMap = new Map(termClicks.map((c: any) => [c._id, c.clicks]));

      // ================================================================
      // 🔥 3. ENRICH SEARCH TERMS
      // ================================================================
      const totalSearches = searchStats[0]?.total || 0;
      const totalClicks = clickStats[0]?.total || 0;
      const overallCtr = totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0;

      const enrichedTerms: SearchTermMetric[] = paginatedTerms.map((t: any) => {
        const clicks = clickMap.get(t._id) || 0;
        return {
          term: t._id,
          searches: t.searches,
          clicks,
          ctr: t.searches > 0 ? Number(((clicks / t.searches) * 100).toFixed(1)) : 0,
          zeroResults: t.zeroResults > 0,
        };
      });

      // ================================================================
      // 🔥 4. ZERO RESULT SEARCHES COUNT
      // ================================================================
      const zeroResultCount = enrichedTerms.filter((t) => t.zeroResults).length;

      // ================================================================
      // 🔥 5. TRENDING TERMS
      // ================================================================
      const trending = trendingTerms.map((t: any) => ({ term: t._id, count: t.count }));

      // ================================================================
      // 🔥 6. DAILY TREND WITH CLICKS (Gap-Filled for smooth Recharts)
      // ================================================================
      const dailyClickTrend = await UserEvent.aggregate([
        {
          $match: {
            eventType: "search_result_click",
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const clickTrendMap = new Map(dailyClickTrend.map((d: any) => [d._id, d.clicks]));
      const trendMap = new Map<string, any>(dailyTrend.map((d: any) => [d._id, d]));

      // ✅ FIX: Dynamic Continuous Date Gap-Filling (Ensures 100% smooth trendlines)
      const fullTrend: SearchTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        fullTrend.push({
          date: dateStr,
          searches: existing?.searches || 0,
          clicks: clickTrendMap.get(dateStr) || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 7. SUMMARY
      // ================================================================
      const topTrendingTerm = trending.length > 0 ? trending[0].term : "N/A";

      const summary = {
        totalSearches,
        totalClicks,
        overallCtr: Number(overallCtr.toFixed(1)),
        zeroResultSearches: zeroResultCount,
        topTrendingTerm,
      };

      // ================================================================
      // 🔥 8. TOTAL PAGES
      // ================================================================
      const totalDocs = await UserEvent.countDocuments({
        eventType: "search",
        createdAt: { $gte: range.from, $lte: range.to },
        "metadata.search_term": { $exists: true, $ne: "" },
      });
      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralSearchResponse = {
        summary,
        trendingTerms: trending,
        trend: fullTrend,
        searchTerms: enrichedTerms.slice(0, limit),
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 9. Cache for 5 minutes — USING safeStringify
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Search Cached (Page ${page}) — ${fullTrend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Search Engine Error:", error.message);
    return {
      summary: { totalSearches: 0, totalClicks: 0, overallCtr: 0, zeroResultSearches: 0, topTrendingTerm: "" },
      trendingTerms: [],
      trend: [],
      searchTerms: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}