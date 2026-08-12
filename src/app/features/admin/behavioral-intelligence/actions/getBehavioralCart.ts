
// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralCart.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserEvent from "@/models/UserEvent";
import AbandonedCart from "@/models/AbandonedCart";
import { format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface FunnelStepData {
  step: string;
  eventType: string;
  uniqueSessions: number;
  dropOffCount: number;
  dropOffPercentage: number;
}

export interface CartTrendPoint {
  date: string;
  addToCarts: number;
  checkoutStarts: number;
  purchases: number;
  abandonmentRate: number;
}

export interface AbandonedCartItem {
  _id: string;
  sessionId: string;
  userId?: string;
  email?: string;
  phone?: string;
  itemCount: number;
  subtotal: number;
  lastUpdated: string;
  isRecovered: boolean;
}

export interface BehavioralCartResponse {
  summary: {
    totalAddToCarts: number;
    totalCheckoutStarts: number;
    totalPurchases: number;
    conversionRate: number;
    abandonmentRate: number;
    recoveredCarts: number;
    activeAbandonedCarts: number;
  };
  funnelSteps: FunnelStepData[];
  trend: CartTrendPoint[];
  abandonedCarts: AbandonedCartItem[];
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
    if (result === 1) console.log(`🔓 Cart Lock released (${requestId}).`);
  } catch (error) {
    console.error("Cart Lock release error:", error);
  }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralCart(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralCartResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_cart_v3:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // ✅ 1. Cache Check — USING safeParse
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralCartResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Cart (Page ${page})`);
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
      const retryParsed = safeParse<BehavioralCartResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale cart cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Cart Lock acquired (${requestId}). Generating cart & funnel intelligence...`);

      // ================================================================
      // 🔥 1. FUNNEL STEP COUNTS (Unique Sessions per step)
      // ================================================================
      const funnelSteps = await Promise.all([
        // Checkout Start
        UserEvent.aggregate([
          { $match: { eventType: "checkout_start", createdAt: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: "$sessionId" } },
          { $count: "uniqueSessions" },
        ]),
        // Payment Method Selected
        UserEvent.aggregate([
          { $match: { eventType: "payment_method_selected", createdAt: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: "$sessionId" } },
          { $count: "uniqueSessions" },
        ]),
        // Gateway Redirected
        UserEvent.aggregate([
          { $match: { eventType: "gateway_redirect_initiated", createdAt: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: "$sessionId" } },
          { $count: "uniqueSessions" },
        ]),
        // Purchase
        UserEvent.aggregate([
          { $match: { eventType: "purchase", createdAt: { $gte: range.from, $lte: range.to } } },
          { $group: { _id: "$sessionId" } },
          { $count: "uniqueSessions" },
        ]),
      ]);

      const stepCounts = funnelSteps.map((s) => s[0]?.uniqueSessions || 0);

      // ================================================================
      // 🔥 2. ADD TO CART & CHECKOUT AGGREGATIONS
      // ================================================================
      const [addToCartCount, checkoutStartCount, purchaseCount, recoveredCarts, activeAbandonedCarts] =
        await Promise.all([
          UserEvent.countDocuments({ eventType: "add_to_cart", createdAt: { $gte: range.from, $lte: range.to } }),
          UserEvent.countDocuments({ eventType: "checkout_start", createdAt: { $gte: range.from, $lte: range.to } }),
          UserEvent.countDocuments({ eventType: "purchase", createdAt: { $gte: range.from, $lte: range.to } }),
          UserEvent.countDocuments({ eventType: "recovered_cart_conversions", createdAt: { $gte: range.from, $lte: range.to } }),
          AbandonedCart.countDocuments({
            isRecovered: false,
            lastUpdated: { $gte: range.from, $lte: range.to },
          }),
        ]);

      // ================================================================
      // 🔥 3. DAILY TREND
      // ================================================================
      const dailyTrend = await UserEvent.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            eventType: { $in: ["add_to_cart", "checkout_start", "purchase"] },
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
            addToCarts: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "add_to_cart"] }, "$count", 0] },
            },
            checkoutStarts: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "checkout_start"] }, "$count", 0] },
            },
            purchases: {
              $sum: { $cond: [{ $eq: ["$_id.eventType", "purchase"] }, "$count", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Calculate daily abandonment rate
      const dailyTrendWithAbandonment = dailyTrend.map((d: any) => ({
        date: d._id,
        addToCarts: d.addToCarts,
        checkoutStarts: d.checkoutStarts,
        purchases: d.purchases,
        abandonmentRate: d.addToCarts > 0 ? Number(((d.addToCarts - d.purchases) / d.addToCarts) * 100) : 0,
      }));

      // ================================================================
      // 🔥 4. PAGINATED ABANDONED CARTS (Enabled Recovery Audits)
      // ================================================================
      const [abandonedCartDocs, totalDocs] = await Promise.all([
        // ✅ FIX: Removed `isRecovered: false` hardcoding. Now displays both recovered and active carts in the timeline so status badges render accurately!
        AbandonedCart.find({
          lastUpdated: { $gte: range.from, $lte: range.to },
        })
          .sort({ lastUpdated: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("sessionId userId email phone items subtotal lastUpdated isRecovered")
          .lean(),
        AbandonedCart.countDocuments({
          lastUpdated: { $gte: range.from, $lte: range.to },
        }),
      ]);

      const abandonedCartsList: AbandonedCartItem[] = abandonedCartDocs.map((doc: any) => ({
        _id: doc._id.toString(),
        sessionId: doc.sessionId,
        userId: doc.userId || undefined,
        email: doc.email || undefined,
        phone: doc.phone || undefined,
        itemCount: doc.items?.length || 0,
        subtotal: doc.subtotal || 0,
        lastUpdated: doc.lastUpdated.toISOString(),
        isRecovered: doc.isRecovered,
      }));

      // ================================================================
      // 🔥 5. FUNNEL STEPS (with drop-off)
      // ================================================================
      const funnelStepNames = ["Checkout Start", "Payment Method Selected", "Gateway Redirect", "Purchase"];
      const funnelEventTypes = ["checkout_start", "payment_method_selected", "gateway_redirect_initiated", "purchase"];

      const funnelData: FunnelStepData[] = funnelStepNames.map((name, idx) => {
        const current = stepCounts[idx] || 0;
        const prev = idx > 0 ? stepCounts[idx - 1] || 0 : 0;
        const dropOffCount = Math.max(0, prev - current);
        const dropOffPercentage = prev > 0 ? Number(((dropOffCount / prev) * 100).toFixed(1)) : 0;
        return {
          step: name,
          eventType: funnelEventTypes[idx],
          uniqueSessions: current,
          dropOffCount,
          dropOffPercentage,
        };
      });

      // ================================================================
      // 🔥 6. SUMMARY
      // ================================================================
      const conversionRate = checkoutStartCount > 0 ? (purchaseCount / checkoutStartCount) * 100 : 0;
      const abandonmentRate = addToCartCount > 0 ? ((addToCartCount - purchaseCount) / addToCartCount) * 100 : 0;

      const summary = {
        totalAddToCarts: addToCartCount,
        totalCheckoutStarts: checkoutStartCount,
        totalPurchases: purchaseCount,
        conversionRate: Number(conversionRate.toFixed(1)),
        abandonmentRate: Number(abandonmentRate.toFixed(1)),
        recoveredCarts,
        activeAbandonedCarts,
      };

      const totalPages = Math.ceil(totalDocs / limit);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));

      // ================================================================
      // 🚀 RESPONSE
      // ================================================================
      const response: BehavioralCartResponse = {
        summary,
        funnelSteps: funnelData,
        trend: dailyTrendWithAbandonment,
        abandonedCarts: abandonedCartsList,
        totalDocs,
        totalPages,
        currentPage: safePage,
        limit,
        generatedAt: new Date().toISOString(),
      };

      // ✅ 7. Cache for 5 minutes (using safeStringify)
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Cart Cached (Page ${page})`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Cart Engine Error:", error.message);
    return {
      summary: { totalAddToCarts: 0, totalCheckoutStarts: 0, totalPurchases: 0, conversionRate: 0, abandonmentRate: 0, recoveredCarts: 0, activeAbandonedCarts: 0 },
      funnelSteps: [],
      trend: [],
      abandonedCarts: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}