// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralPromotions.ts

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
export interface BannerMetric {
  bannerId: string;
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface CouponMetric {
  code: string;
  applications: number;
  autoApplications: number;
  removals: number;
}

export interface PromotionTrendPoint {
  date: string;
  bannerClicks: number;
  couponApplications: number;
  autoCouponApplications: number;
  scarcityExposures: number;
  pwaPrompts: number;
}

export interface PromotionEvent {
  _id: string;
  eventType: string;
  sessionId: string;
  path: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BehavioralPromotionsResponse {
  summary: {
    totalBannerClicks: number;
    totalCouponApplications: number;
    totalAutoCouponApplications: number;
    totalCouponRemovals: number;
    totalScarcityExposures: number;
    totalPwaPrompts: number;
    topBanner: string;
  };
  topBanners: BannerMetric[];
  couponPerformance: CouponMetric[];
  trend: PromotionTrendPoint[];
  events: PromotionEvent[];
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
    if (result === 1) console.log(`🔓 Promotions Lock released (${requestId}).`);
  } catch (error) { console.error("Promotions Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready (With Continuous Date Gap Filling)
// ================================================================
export async function getBehavioralPromotions(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralPromotionsResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_promotions_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralPromotionsResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Promotions (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralPromotionsResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale promotions cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Promotions Lock acquired (${requestId}). Generating promotions intelligence...`);

      // ================================================================
      // 🔥 1. BANNER STATS (Clicks + Impressions + CTR)
      // ================================================================
      const bannerStats = await UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ["banner_click", "banner_impression"] },
            createdAt: { $gte: range.from, $lte: range.to },
            "metadata.banner_id": { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$metadata.banner_id",
            title: { $first: { $ifNull: ["$metadata.banner_title", "$metadata.banner_id"] } },
            clicks: {
              $sum: { $cond: [{ $eq: ["$eventType", "banner_click"] }, 1, 0] },
            },
            impressions: {
              $sum: { $cond: [{ $eq: ["$eventType", "banner_impression"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            clicks: 1,
            impressions: 1,
            ctr: {
              $cond: [
                { $eq: ["$impressions", 0] },
                0,
                { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] },
              ],
            },
          },
        },
        { $sort: { clicks: -1 } },
        { $limit: 10 },
      ]);

      // ================================================================
      // 🔥 2. COUPON PERFORMANCE
      // ================================================================
      const couponStats = await UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ["coupon_applied", "coupon_auto_applied", "coupon_removed"] },
            createdAt: { $gte: range.from, $lte: range.to },
            "metadata.code": { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$metadata.code",
            applications: {
              $sum: { $cond: [{ $eq: ["$eventType", "coupon_applied"] }, 1, 0] },
            },
            autoApplications: {
              $sum: { $cond: [{ $eq: ["$eventType", "coupon_auto_applied"] }, 1, 0] },
            },
            removals: {
              $sum: { $cond: [{ $eq: ["$eventType", "coupon_removed"] }, 1, 0] },
            },
          },
        },
        { $sort: { applications: -1 } },
        { $limit: 10 },
      ]);

      // ================================================================
      // 🔥 3. SUMMARY AND TREND AGGREGATIONS
      // ================================================================
      const [eventCounts, dailyTrend, paginatedEvents] = await Promise.all([
        // Counts per event type
        UserEvent.aggregate([
          {
            $match: {
              eventType: {
                $in: ["banner_click", "coupon_applied", "coupon_auto_applied", "coupon_removed", "scarcity_exposure", "pwa_prompt_metric"],
              },
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
              eventType: {
                $in: ["banner_click", "coupon_applied", "coupon_auto_applied", "scarcity_exposure", "pwa_prompt_metric"],
              },
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
              bannerClicks: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "banner_click"] }, "$count", 0] },
              },
              couponApplications: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "coupon_applied"] }, "$count", 0] },
              },
              autoCouponApplications: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "coupon_auto_applied"] }, "$count", 0] },
              },
              scarcityExposures: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "scarcity_exposure"] }, "$count", 0] },
              },
              pwaPrompts: {
                $sum: { $cond: [{ $eq: ["$_id.eventType", "pwa_prompt_metric"] }, "$count", 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Paginated events
        UserEvent.find({
          eventType: {
            $in: ["banner_click", "coupon_applied", "coupon_auto_applied", "coupon_removed", "scarcity_exposure", "pwa_prompt_metric"],
          },
          createdAt: { $gte: range.from, $lte: range.to },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("_id eventType sessionId path metadata createdAt")
          .lean(),
      ]);

      // ================================================================
      // 🔥 4. BUILD SUMMARY
      // ================================================================
      const countMap = new Map(eventCounts.map((e: any) => [e._id, e.count]));

      const topBannerData = bannerStats.length > 0 ? bannerStats[0] : null;

      const summary = {
        totalBannerClicks: countMap.get("banner_click") || 0,
        totalCouponApplications: countMap.get("coupon_applied") || 0,
        totalAutoCouponApplications: countMap.get("coupon_auto_applied") || 0,
        totalCouponRemovals: countMap.get("coupon_removed") || 0,
        totalScarcityExposures: countMap.get("scarcity_exposure") || 0,
        totalPwaPrompts: countMap.get("pwa_prompt_metric") || 0,
        topBanner: topBannerData?.title || "N/A",
      };

      // ================================================================
      // 🔥 5. TOP BANNERS (WITH CTR)
      // ================================================================
      const topBanners: BannerMetric[] = bannerStats.map((b: any) => ({
        bannerId: b._id,
        title: b.title || b._id,
        clicks: b.clicks || 0,
        impressions: b.impressions || 0,
        ctr: Number(b.ctr.toFixed(2)),
      }));

      // ================================================================
      // 🔥 6. COUPON PERFORMANCE
      // ================================================================
      const couponPerformance: CouponMetric[] = couponStats.map((c: any) => ({
        code: c._id,
        applications: c.applications || 0,
        autoApplications: c.autoApplications || 0,
        removals: c.removals || 0,
      }));

      // ================================================================
      // 🔥 7. CONTINUOUS DATE GAP FILLING (Smooth Recharts graphs)
      // ================================================================
      const trendMap = new Map<string, any>(
        dailyTrend.map((d: any) => [d._id, d])
      );

      const trend: PromotionTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        trend.push({
          date: dateStr,
          bannerClicks: existing?.bannerClicks || 0,
          couponApplications: existing?.couponApplications || 0,
          autoCouponApplications: existing?.autoCouponApplications || 0,
          scarcityExposures: existing?.scarcityExposures || 0,
          pwaPrompts: existing?.pwaPrompts || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // ================================================================
      // 🔥 8. PAGINATED EVENTS
      // ================================================================
      const totalDocs = await UserEvent.countDocuments({
        eventType: {
          $in: ["banner_click", "coupon_applied", "coupon_auto_applied", "coupon_removed", "scarcity_exposure", "pwa_prompt_metric"],
        },
        createdAt: { $gte: range.from, $lte: range.to },
      });
      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      const events: PromotionEvent[] = paginatedEvents.map((e: any) => ({
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
      const response: BehavioralPromotionsResponse = {
        summary,
        topBanners,
        couponPerformance,
        trend,
        events,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 9. Cache for 5 minutes (using safeStringify)
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Promotions Cached (Page ${page}) — ${trend.length} points`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Promotions Engine Error:", error.message);
    return {
      summary: { totalBannerClicks: 0, totalCouponApplications: 0, totalAutoCouponApplications: 0, totalCouponRemovals: 0, totalScarcityExposures: 0, totalPwaPrompts: 0, topBanner: "" },
      topBanners: [],
      couponPerformance: [],
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