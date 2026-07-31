// 📂 src/app/features/admin/marketing/actions/getCampaignFunnel.ts (FULLY ALIGNED, GUEST-INCLUSIVE & END-TO-END CONVERSION FIXED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserEvent from "@/models/UserEvent";
import UserSession from "@/models/UserSession";
import User from "@/models/User";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface CampaignFunnelStep {
  campaign: string;
  views: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
  accountCreated: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallConversionRate: number; // ✅ NEW: End-to-End View-to-Purchase %
}

export interface CampaignFunnelResponse {
  data: CampaignFunnelStep[];
  totalCampaigns: number;          // ✅ NEW: Total campaigns count
  overallFunnelConversion: number; // ✅ NEW: Global marketing funnel conversion %
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN ACTION (WITH REDIS CACHE)
// ================================================================
export async function getCampaignFunnel(): Promise<{
  success: boolean;
  data?: CampaignFunnelResponse;
  error?: string;
}> {
  const cacheKey = "analytics_campaign_funnel";

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check (Type-Safe with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CampaignFunnelResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Campaign Funnel");
      return { success: true, data: parsed };
    }

    await connectMongoose();

    // ================================================================
    // 2. FETCH SESSIONS WITH UTM CAMPAIGN (GUEST TRAFFIC INCLUDED)
    // ================================================================
    // ✅ ENTERPRISE FIX: Removed 'userId: { $ne: null }' to include anonymous guest ad traffic!
    const sessions = await UserSession.find(
      {
        utmCampaign: { $nin: [null, "", "None", "Direct"] },
      },
      { sessionId: 1, utmCampaign: 1, userId: 1, createdAt: 1 }
    ).lean();

    if (sessions.length === 0) {
      return {
        success: true,
        data: {
          data: [],
          totalCampaigns: 0,
          overallFunnelConversion: 0,
          generatedAt: new Date().toISOString(),
        },
      };
    }

    // Build maps
    const sessionCampaignMap = new Map<string, string>();
    const userCampaignMap = new Map<string, string>();
    const userFirstVisitMap = new Map<string, Date>();
    const userIds = new Set<string>();

    for (const s of sessions) {
      if (s.sessionId) sessionCampaignMap.set(s.sessionId, s.utmCampaign);
      if (s.userId) {
        const userIdStr = s.userId.toString();
        userCampaignMap.set(userIdStr, s.utmCampaign);
        userIds.add(userIdStr);

        const visitDate = new Date(s.createdAt);
        if (!userFirstVisitMap.has(userIdStr)) {
          userFirstVisitMap.set(userIdStr, visitDate);
        } else {
          const existing = userFirstVisitMap.get(userIdStr)!;
          if (visitDate < existing) {
            userFirstVisitMap.set(userIdStr, visitDate);
          }
        }
      }
    }

    // ================================================================
    // 3. FETCH USER CREATION DATES (For Account Attribution)
    // ================================================================
    const userCreationMap = new Map<string, Date>();
    if (userIds.size > 0) {
      const users = (await User.find(
        { _id: { $in: Array.from(userIds) } },
        { _id: 1, createdAt: 1 }
      ).lean()) as unknown as { _id: string; createdAt: Date }[];

      for (const user of users) {
        userCreationMap.set(user._id.toString(), new Date(user.createdAt));
      }
    }

    const allCampaigns = Array.from(new Set(sessionCampaignMap.values()));

    if (allCampaigns.length === 0) {
      return {
        success: true,
        data: {
          data: [],
          totalCampaigns: 0,
          overallFunnelConversion: 0,
          generatedAt: new Date().toISOString(),
        },
      };
    }

    // ================================================================
    // 4. FETCH EVENTS (Views, Add-to-Cart, Checkout)
    // ================================================================
    const eventTypes = ["page_view", "add_to_cart", "checkout_start"];
    const events = await UserEvent.find(
      {
        sessionId: { $in: Array.from(sessionCampaignMap.keys()) },
        eventType: { $in: eventTypes },
      },
      { sessionId: 1, eventType: 1 }
    ).lean();

    // ================================================================
    // 5. FETCH PURCHASES (from Order aligned with REVENUE_STATUSES)
    // ================================================================
    // ✅ ENTERPRISE FIX: Aligned with REVENUE_STATUSES to include active COD orders
    const orders = await Order.find(
      {
        status: { $in: REVENUE_STATUSES },
        "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
      },
      { userId: 1, "trafficSource.utmCampaign": 1 }
    ).lean();

    // ================================================================
    // 6. AGGREGATE FUNNEL DATA
    // ================================================================
    const campaignMap = new Map<
      string,
      {
        views: number;
        addToCarts: number;
        checkouts: number;
        purchases: number;
        accountCreated: number;
        trackedUsers: Set<string>;
      }
    >();

    for (const campaign of allCampaigns) {
      campaignMap.set(campaign, {
        views: 0,
        addToCarts: 0,
        checkouts: 0,
        purchases: 0,
        accountCreated: 0,
        trackedUsers: new Set(),
      });
    }

    // Count events per campaign
    for (const event of events) {
      const campaign = sessionCampaignMap.get(event.sessionId);
      if (!campaign) continue;

      const data = campaignMap.get(campaign);
      if (!data) continue;

      if (event.eventType === "page_view") data.views++;
      else if (event.eventType === "add_to_cart") data.addToCarts++;
      else if (event.eventType === "checkout_start") data.checkouts++;
    }

    // Count purchases per campaign (Directly from order's trafficSource)
    for (const order of orders) {
      const campaign = order.trafficSource?.utmCampaign;
      if (campaign && campaignMap.has(campaign)) {
        const data = campaignMap.get(campaign)!;
        data.purchases++;
      }
    }

    // ================================================================
    // 7. ACCOUNT CREATION ATTRIBUTION
    // ================================================================
    for (const [userIdStr, firstVisit] of userFirstVisitMap) {
      const campaign = userCampaignMap.get(userIdStr);
      if (!campaign) continue;

      const userCreatedAt = userCreationMap.get(userIdStr);
      if (!userCreatedAt) continue;

      const diffHours = (userCreatedAt.getTime() - firstVisit.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 0 && diffHours <= 48) {
        const data = campaignMap.get(campaign);
        if (data && !data.trackedUsers.has(userIdStr)) {
          data.accountCreated++;
          data.trackedUsers.add(userIdStr);
        }
      }
    }

    // ================================================================
    // 8. CALCULATE RATES & BUILD RESPONSE
    // ================================================================
    const funnelData: CampaignFunnelStep[] = [];
    let globalTotalViews = 0;
    let globalTotalPurchases = 0;

    for (const [campaign, metrics] of campaignMap) {
      const { views, addToCarts, checkouts, purchases, accountCreated } = metrics;

      if (views === 0 && addToCarts === 0 && checkouts === 0 && purchases === 0 && accountCreated === 0) {
        continue;
      }

      const viewToCartRate = views > 0 ? Number(((addToCarts / views) * 100).toFixed(1)) : 0;
      const cartToCheckoutRate = addToCarts > 0 ? Number(((checkouts / addToCarts) * 100).toFixed(1)) : 0;
      const checkoutToPurchaseRate = checkouts > 0 ? Number(((purchases / checkouts) * 100).toFixed(1)) : 0;
      const overallConversionRate = views > 0 ? Number(((purchases / views) * 100).toFixed(1)) : 0;

      funnelData.push({
        campaign,
        views,
        addToCarts,
        checkouts,
        purchases,
        accountCreated,
        viewToCartRate,
        cartToCheckoutRate,
        checkoutToPurchaseRate,
        overallConversionRate,
      });

      globalTotalViews += views;
      globalTotalPurchases += purchases;
    }

    funnelData.sort((a, b) => b.views - a.views);

    const overallFunnelConversion = globalTotalViews > 0 
      ? Number(((globalTotalPurchases / globalTotalViews) * 100).toFixed(2)) 
      : 0;

    const response: CampaignFunnelResponse = {
      data: funnelData,
      totalCampaigns: funnelData.length,
      overallFunnelConversion,
      generatedAt: new Date().toISOString(),
    };

    // 9. Cache safely with safeStringify
    try {
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log("💾 Campaign Funnel cached (5 min TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache campaign funnel:", cacheError);
    }

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Campaign Funnel Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch campaign funnel data.",
    };
  }
}