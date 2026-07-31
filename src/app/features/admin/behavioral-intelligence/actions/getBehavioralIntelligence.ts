
// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralIntelligence.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import UserSession from "@/models/UserSession";
import AbandonedCart from "@/models/AbandonedCart";
import CustomerRequest from "@/models/CustomerRequest";
import { startOfDay, endOfDay, format, subDays } from "date-fns";
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ COMPLETE BEHAVIORAL METRICS
// ================================================================
export interface BehavioralMetrics {
  activeSessions: number;
  totalSessions: number;
  newSessions: number;
  uniqueVisitors: number;
  pageViews: number;
  totalPageViews: number;
  avgPageViewsPerSession: number;
  bounceRate: number;
  searchCount: number;
  searchResultClicks: number;
  trendingSearches: { term: string; count: number }[];
  productImpressions: number;
  productClicks: number;
  productShares: number;
  filterApplications: number;
  variantPriceCompares: number;
  pdpMediaInteractions: number;
  scarcityExposures: number;
  addToCartCount: number;
  removeFromCartCount: number;
  cartAbandonmentRate: number;
  cartRecoveries: number;
  cartMerges: number;
  cartRehydrations: number;
  cartDesyncErrors: number;
  abandonedCarts: number;
  checkoutStarts: number;
  checkoutStepViews: number;
  totalPurchases: number;
  checkoutConversionRate: number;
  checkoutErrors: number;
  wishlistAddCount: number;
  wishlistRemoveCount: number;
  couponApplications: number;
  couponRemovals: number;
  bannerClicks: number;
  rageClicks: number;
  exitIntents: number;
  oosAttempts: number;
  jsExceptions: number;
  paymentMethodSelections: number;
  gatewayRedirects: number;
  paymentSuccess: number;
  paymentFailures: number;
  authAttempts: number;
  loginPrompts: number;
  rtoRiskFlagged: number;
  shippingThresholdProximity: number;
  supportClicks: number;
  pwaPrompts: number;
  restockRequests: number;
  customVariantRequests: number;
  topDemandProducts: { productId?: string; productName: string; requests: number }[];
  topDemandVariants: { variantKey?: string; variantName: string; requests: number }[];
  webhookReceives: number;
  webhookErrors: number;
  eventBreakdown: Record<string, number>;
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
    if (result === 1) console.log(`🔓 Behavioral Lock released (${requestId}).`);
  } catch (error) {
    console.error("Behavioral Lock release error:", error);
  }
};

// ================================================================
// 📊 TYPES FOR AGGREGATION RESULTS
// ================================================================
interface EventCountResult {
  _id: string;
  count: number;
}

interface SearchTrendResult {
  _id: string;
  count: number;
}

interface DemandProductResult {
  _id: { productId: string | null; productName: string };
  count: number;
}

interface DemandVariantResult {
  _id: { key: string; value: string };
  count: number;
}

// ================================================================
// 🚀 MAIN FUNCTION (Enterprise Ready — 5 min TTL)
// ================================================================
export async function getBehavioralIntelligencePayload(
  range?: { from: Date; to: Date }
): Promise<BehavioralMetrics> {
  const today = new Date();
  const from = range?.from || startOfDay(subDays(today, 1));
  const to = range?.to || endOfDay(today);
  const cacheKey = `analytics_behavioral_full_v3:${format(from, "yyyy-MM-dd")}_${format(to, "yyyy-MM-dd")}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check (with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralMetrics>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Behavioral Intelligence");
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
      const retryParsed = safeParse<BehavioralMetrics>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale behavioral cache.");
        return retryParsed;
      }
      // Return empty fallback if no cache available
      return {
        activeSessions: 0,
        totalSessions: 0,
        newSessions: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        totalPageViews: 0,
        avgPageViewsPerSession: 0,
        bounceRate: 0,
        searchCount: 0,
        searchResultClicks: 0,
        trendingSearches: [],
        productImpressions: 0,
        productClicks: 0,
        productShares: 0,
        filterApplications: 0,
        variantPriceCompares: 0,
        pdpMediaInteractions: 0,
        scarcityExposures: 0,
        addToCartCount: 0,
        removeFromCartCount: 0,
        cartAbandonmentRate: 0,
        cartRecoveries: 0,
        cartMerges: 0,
        cartRehydrations: 0,
        cartDesyncErrors: 0,
        abandonedCarts: 0,
        checkoutStarts: 0,
        checkoutStepViews: 0,
        totalPurchases: 0,
        checkoutConversionRate: 0,
        checkoutErrors: 0,
        wishlistAddCount: 0,
        wishlistRemoveCount: 0,
        couponApplications: 0,
        couponRemovals: 0,
        bannerClicks: 0,
        rageClicks: 0,
        exitIntents: 0,
        oosAttempts: 0,
        jsExceptions: 0,
        paymentMethodSelections: 0,
        gatewayRedirects: 0,
        paymentSuccess: 0,
        paymentFailures: 0,
        authAttempts: 0,
        loginPrompts: 0,
        rtoRiskFlagged: 0,
        shippingThresholdProximity: 0,
        supportClicks: 0,
        pwaPrompts: 0,
        restockRequests: 0,
        customVariantRequests: 0,
        topDemandProducts: [],
        topDemandVariants: [],
        webhookReceives: 0,
        webhookErrors: 0,
        eventBreakdown: {},
        generatedAt: new Date().toISOString(),
      };
    }

    try {
      console.log(`🔒 Behavioral Lock acquired (${requestId}). Generating full intelligence...`);

      // ================================================================
      // 🔥 1. SINGLE AGGREGATION ($facet) — 1 DB Hit
      // ================================================================
      const stats = await UserEvent.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $facet: {
            eventCounts: [
              { $group: { _id: "$eventType", count: { $sum: 1 } } },
            ],
            customVariant: [
              {
                $match: {
                  eventType: "form_field_interaction",
                  "metadata.request_type": "missing_variant",
                },
              },
              { $count: "total" },
            ],
            searchTrends: [
              {
                $match: {
                  eventType: "search",
                  "metadata.search_term": { $exists: true, $ne: "" },
                },
              },
              { $group: { _id: "$metadata.search_term", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            bounceSessions: [
              {
                $match: { eventType: "page_view" },
              },
              {
                $group: {
                  _id: "$sessionId",
                  count: { $sum: 1 },
                },
              },
              {
                $match: { count: 1 },
              },
              { $count: "bounced" },
            ],
          },
        },
      ]);

      const eventCounts = (stats[0]?.eventCounts as EventCountResult[]) || [];
      const eventMap = new Map<string, number>(
        eventCounts.map((e) => [e._id, e.count])
      );
      const getCount = (event: string): number => eventMap.get(event) || 0;

      const customVariantRequests = (stats[0]?.customVariant as { total: number }[])?.[0]?.total || 0;
      const searchTrends = (stats[0]?.searchTrends as SearchTrendResult[]) || [];
      const bouncedSessions = (stats[0]?.bounceSessions as { bounced: number }[])?.[0]?.bounced || 0;

      // Event breakdown (top 20 only)
      const sortedEvents = Array.from(eventMap.entries()).sort(
        (a: [string, number], b: [string, number]) => b[1] - a[1]
      );
      const topEvents = sortedEvents.slice(0, 20);
      const eventBreakdown: Record<string, number> = Object.fromEntries(topEvents);

      // ================================================================
      // 🔥 2. DEMAND ANALYTICS (Aligned with CustomerRequest Schema)
      // ================================================================
      const demandStats = await CustomerRequest.aggregate([
        {
          $match: {
            status: { $in: ["pending", "notified"] },
            createdAt: { $gte: from, $lte: to },
          },
        },
        {
          $facet: {
            byProduct: [
              {
                $group: {
                  _id: {
                    productId: { $ifNull: ["$productId", null] },
                    productName: { $ifNull: ["$requestedProductName", "Unknown"] },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            byVariant: [
              { $match: { selectedAttributes: { $ne: null } } },
              {
                $project: {
                  attributesArray: { $objectToArray: "$selectedAttributes" },
                },
              },
              { $unwind: "$attributesArray" },
              {
                $group: {
                  _id: { key: "$attributesArray.k", value: "$attributesArray.v" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
          },
        },
      ]);

      const topDemandProducts: { productId?: string; productName: string; requests: number }[] =
        (demandStats[0]?.byProduct as DemandProductResult[])?.map((p) => ({
          productId: p._id.productId || undefined,
          productName: p._id.productName,
          requests: p.count,
        })) || [];

      const topDemandVariants: { variantKey?: string; variantName: string; requests: number }[] =
        (demandStats[0]?.byVariant as DemandVariantResult[])?.map((v) => ({
          variantKey: v._id.key,
          variantName: v._id.value,
          requests: v.count,
        })) || [];

      // ================================================================
      // 🔥 3. SESSION & CART METRICS (With Enterprise Grouping Count)
      // ================================================================
      const [activeSessions, totalSessions, uniqueVisitorsResult, abandonedCarts] = await Promise.all([
        UserSession.countDocuments({ isActive: true }),
        UserSession.countDocuments({ createdAt: { $gte: from, $lte: to } }),
        // ✅ FIX 2: Replaced high-memory .distinct().length with optimized DB-side aggregation count
        UserSession.aggregate([
          { $match: { createdAt: { $gte: from, $lte: to } } },
          { $group: { _id: "$visitorId" } },
          { $count: "count" }
        ]),
        AbandonedCart.countDocuments({ isRecovered: false, createdAt: { $gte: from, $lte: to } }),
      ]);

      const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

      // ================================================================
      // 📊 4. CALCULATIONS
      // ================================================================
      const pageViews = getCount("page_view");
      const addToCart = getCount("add_to_cart");
      const checkoutStarts = getCount("checkout_start");
      const totalPurchases = getCount("purchase");
      const cartRecoveries = getCount("recovered_cart_conversions");

      // ✅ FIX 1: Aligned Cart Abandonment Rate with standard retail metrics using total addToCart as baseline
      const cartAbandonmentRate = addToCart > 0
        ? ((addToCart - totalPurchases) / addToCart) * 100
        : 0;

      const conversionRate = checkoutStarts > 0 ? (totalPurchases / checkoutStarts) * 100 : 0;
      const avgPageViewsPerSession = totalSessions > 0 ? pageViews / totalSessions : 0;
      const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

      // ================================================================
      // 🚀 5. BUILD RESPONSE
      // ================================================================
      const metrics: BehavioralMetrics = {
        activeSessions,
        totalSessions,
        newSessions: getCount("session_start"),
        uniqueVisitors,
        pageViews,
        totalPageViews: pageViews,
        avgPageViewsPerSession,
        bounceRate,
        searchCount: getCount("search"),
        searchResultClicks: getCount("search_result_click"),
        trendingSearches: searchTrends.map((s) => ({ term: s._id, count: s.count })),
        productImpressions: getCount("product_impression"),
        productClicks: getCount("product_click"),
        productShares: getCount("product_shared"),
        filterApplications: getCount("filter_applied"),
        variantPriceCompares: getCount("variant_price_compared"),
        pdpMediaInteractions: getCount("pdp_media_interaction"),
        scarcityExposures: getCount("scarcity_exposure"),
        addToCartCount: addToCart,
        removeFromCartCount: getCount("remove_from_cart"),
        cartAbandonmentRate,
        cartRecoveries,
        cartMerges: getCount("cart_merged"),
        cartRehydrations: getCount("cart_rehydrated"),
        cartDesyncErrors: getCount("cart_desync_error"),
        abandonedCarts,
        checkoutStarts,
        checkoutStepViews: getCount("checkout_step_view"),
        totalPurchases,
        checkoutConversionRate: conversionRate,
        checkoutErrors: getCount("checkout_error"),
        wishlistAddCount: getCount("wishlist_add"),
        wishlistRemoveCount: getCount("wishlist_remove"),
        couponApplications: getCount("coupon_applied") + getCount("coupon_auto_applied"),
        couponRemovals: getCount("coupon_removed"),
        bannerClicks: getCount("banner_click"),
        rageClicks: getCount("rage_click_detected"),
        exitIntents: getCount("exit_intent_triggered"),
        oosAttempts: getCount("oos_attempt"),
        jsExceptions: getCount("js_exception"),
        paymentMethodSelections: getCount("payment_method_selected"),
        gatewayRedirects: getCount("gateway_redirect_initiated"),
        paymentSuccess: getCount("payment_success"),
        paymentFailures: getCount("payment_failed"),
        authAttempts: getCount("auth_attempt"),
        loginPrompts: getCount("login_prompt_triggered"),
        rtoRiskFlagged: getCount("rto_risk_flagged"),
        shippingThresholdProximity: getCount("shipping_threshold_proximity"),
        supportClicks: getCount("support_engagement_click"),
        pwaPrompts: getCount("pwa_prompt_metric"),
        restockRequests: getCount("back_in_stock_subscription"),
        customVariantRequests,
        topDemandProducts,
        topDemandVariants,
        webhookReceives: getCount("webhook_received"),
        webhookErrors: getCount("webhook_processing_error"),
        eventBreakdown,
        generatedAt: new Date().toISOString(),
      };

      await redis.set(cacheKey, safeStringify(metrics), { ex: 300 });
      console.log("✅ Behavioral Intelligence Cached.");

      return metrics;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Intelligence Engine Error:", error.message);
    return {
      activeSessions: 0,
      totalSessions: 0,
      newSessions: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      totalPageViews: 0,
      avgPageViewsPerSession: 0,
      bounceRate: 0,
      searchCount: 0,
      searchResultClicks: 0,
      trendingSearches: [],
      productImpressions: 0,
      productClicks: 0,
      productShares: 0,
      filterApplications: 0,
      variantPriceCompares: 0,
      pdpMediaInteractions: 0,
      scarcityExposures: 0,
      addToCartCount: 0,
      removeFromCartCount: 0,
      cartAbandonmentRate: 0,
      cartRecoveries: 0,
      cartMerges: 0,
      cartRehydrations: 0,
      cartDesyncErrors: 0,
      abandonedCarts: 0,
      checkoutStarts: 0,
      checkoutStepViews: 0,
      totalPurchases: 0,
      checkoutConversionRate: 0,
      checkoutErrors: 0,
      wishlistAddCount: 0,
      wishlistRemoveCount: 0,
      couponApplications: 0,
      couponRemovals: 0,
      bannerClicks: 0,
      rageClicks: 0,
      exitIntents: 0,
      oosAttempts: 0,
      jsExceptions: 0,
      paymentMethodSelections: 0,
      gatewayRedirects: 0,
      paymentSuccess: 0,
      paymentFailures: 0,
      authAttempts: 0,
      loginPrompts: 0,
      rtoRiskFlagged: 0,
      shippingThresholdProximity: 0,
      supportClicks: 0,
      pwaPrompts: 0,
      restockRequests: 0,
      customVariantRequests: 0,
      topDemandProducts: [],
      topDemandVariants: [],
      webhookReceives: 0,
      webhookErrors: 0,
      eventBreakdown: {},
      generatedAt: new Date().toISOString(),
    };
  }
}