// 📂 src/app/features/admin/reports/actions/getAcquisitionReportData.ts (FULLY AGGREGATED & PRODUCTION HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import UserEvent from "@/models/UserEvent";
import UserSession from "@/models/UserSession";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format } from "date-fns";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface AcquisitionReportRow {
  campaign?: string;
  source?: string;
  visits?: number;
  orders?: number;
  revenue?: number;
  roas?: number;
  views?: number;
  addToCart?: number;
  checkout?: number;
  purchases?: number;
  dropOffRate?: number;
  bounceRate?: number;
}

export interface AcquisitionReportResponse {
  data: AcquisitionReportRow[];
  totals: {
    visits?: number;
    orders?: number;
    revenue?: number;
    roas?: number;
    views?: number;
    addToCart?: number;
    checkout?: number;
    purchases?: number;
    dropOffRate?: number;
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN REPORT COMPILER
// ================================================================
export async function getAcquisitionReportData(
  range: { startDate: Date; endDate: Date },
  slug: "utm-attribution" | "conversion-funnel"
): Promise<{ success: boolean; data?: AcquisitionReportResponse; error?: string }> {
  const cacheKey = `analytics_acquisition_v6_${slug}_${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<AcquisitionReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Acquisition Report (${slug})`);
      return { success: true, data: parsed };
    }

    await connectMongoose();

    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);

    let result: AcquisitionReportResponse;

    // ================================================================
    // 📊 A. UTM ATTRIBUTION (Campaign ROI — DB Aggregate Optimized)
    // ================================================================
    if (slug === "utm-attribution") {
      // ✅ DB Aggregate 1: Group visits & capture primary sources
      const sessionsAgg = await UserSession.aggregate([
        {
          $match: {
            utmCampaign: { $nin: [null, "", "None", "Direct"] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$utmCampaign",
            visits: { $sum: 1 },
            source: { $first: "$utmSource" }
          }
        }
      ]);

      // ✅ DB Aggregate 2: Group orders & revenue by UTM campaign (Excludes Cancelled/RTO)
      const ordersAgg = await Order.aggregate([
        {
          $match: {
            status: { $in: REVENUE_STATUSES },
            "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$trafficSource.utmCampaign",
            orders: { $sum: 1 },
            revenue: { $sum: "$totalPrice" }
          }
        }
      ]);

      if (sessionsAgg.length === 0 && ordersAgg.length === 0) {
        return {
          success: true,
          data: { data: [], totals: {}, generatedAt: new Date().toISOString() },
        };
      }

      // Merge aggregated map records
      const campaignMap = new Map<string, AcquisitionReportRow>();

      for (const s of sessionsAgg) {
        campaignMap.set(s._id, {
          campaign: s._id,
          source: s.source || "Unknown",
          visits: s.visits || 0,
          orders: 0,
          revenue: 0,
          roas: 0
        });
      }

      for (const o of ordersAgg) {
        if (campaignMap.has(o._id)) {
          const existing = campaignMap.get(o._id)!;
          existing.orders = o.orders || 0;
          existing.revenue = o.revenue || 0;
        } else {
          campaignMap.set(o._id, {
            campaign: o._id,
            source: "Unknown",
            visits: 0,
            orders: o.orders || 0,
            revenue: o.revenue || 0,
            roas: 0
          });
        }
      }

      const data: AcquisitionReportRow[] = [];
      let totalRevenue = 0;
      let totalOrders = 0;
      let totalVisits = 0;

      for (const [campaign, row] of campaignMap.entries()) {
        const visits = row.visits || 0;
        const orders = row.orders || 0;
        const revenue = row.revenue || 0;
        const roas = visits > 0 ? Number((revenue / visits).toFixed(2)) : 0;

        data.push({
          campaign,
          source: row.source,
          visits,
          orders,
          revenue,
          roas
        });

        totalRevenue += revenue;
        totalOrders += orders;
        totalVisits += visits;
      }

      data.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

      const totals = {
        visits: totalVisits,
        orders: totalOrders,
        revenue: totalRevenue,
        roas: totalVisits > 0 ? Number((totalRevenue / totalVisits).toFixed(2)) : 0,
      };

      result = {
        data,
        totals,
        generatedAt: new Date().toISOString(),
      };
    }

    // ================================================================
    // 📊 B. CONVERSION FUNNEL (Funnel Drops — DB Lookup Aggregate)
    // ================================================================
    else if (slug === "conversion-funnel") {
      // ✅ DB Aggregate 1: Group UserEvents joining with UserSessions
      const eventsAgg = await UserEvent.aggregate([
        {
          $match: {
            eventType: { $in: ["page_view", "add_to_cart", "checkout_start"] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $lookup: {
            from: "usersessions", // Maps to registered mongoose collection name
            localField: "sessionId",
            foreignField: "sessionId",
            as: "session"
          }
        },
        { $unwind: "$session" },
        {
          $match: {
            "session.utmCampaign": { $nin: [null, "", "None", "Direct"] }
          }
        },
        {
          $group: {
            _id: {
              campaign: "$session.utmCampaign",
              eventType: "$eventType"
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // ✅ DB Aggregate 2: Group purchases per UTM Campaign
      const purchasesAgg = await Order.aggregate([
        {
          $match: {
            status: { $in: REVENUE_STATUSES },
            "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$trafficSource.utmCampaign",
            purchases: { $sum: 1 }
          }
        }
      ]);

      if (eventsAgg.length === 0 && purchasesAgg.length === 0) {
        return {
          success: true,
          data: { data: [], totals: {}, generatedAt: new Date().toISOString() },
        };
      }

      // Map metrics safely
      const campaignData = new Map<
        string,
        { views: number; addToCart: number; checkout: number; purchases: number }
      >();

      for (const e of eventsAgg) {
        const campaign = e._id.campaign;
        const type = e._id.eventType;
        const count = e.count || 0;

        if (!campaignData.has(campaign)) {
          campaignData.set(campaign, { views: 0, addToCart: 0, checkout: 0, purchases: 0 });
        }
        const metrics = campaignData.get(campaign)!;

        if (type === "page_view") metrics.views += count;
        else if (type === "add_to_cart") metrics.addToCart += count;
        else if (type === "checkout_start") metrics.checkout += count;
      }

      for (const p of purchasesAgg) {
        const campaign = p._id;
        if (!campaignData.has(campaign)) {
          campaignData.set(campaign, { views: 0, addToCart: 0, checkout: 0, purchases: 0 });
        }
        campaignData.get(campaign)!.purchases += p.purchases || 0;
      }

      const data: AcquisitionReportRow[] = [];
      let totalVisits = 0;
      let totalAdds = 0;
      let totalCheckouts = 0;
      let totalPurchases = 0;

      for (const [campaign, metrics] of campaignData.entries()) {
        const { views, addToCart, checkout, purchases } = metrics;

        if (views === 0 && addToCart === 0 && checkout === 0 && purchases === 0) continue;

        const dropOffRate = views > 0 ? Number((((views - purchases) / views) * 100).toFixed(2)) : 0;

        data.push({
          campaign,
          views,
          addToCart,
          checkout,
          purchases,
          dropOffRate,
        });

        totalVisits += views;
        totalAdds += addToCart;
        totalCheckouts += checkout;
        totalPurchases += purchases;
      }

      data.sort((a, b) => (b.views || 0) - (a.views || 0));

      const totals = {
        views: totalVisits,
        addToCart: totalAdds,
        checkout: totalCheckouts,
        purchases: totalPurchases,
        dropOffRate: totalVisits > 0 ? Number((((totalVisits - totalPurchases) / totalVisits) * 100).toFixed(2)) : 0,
      };

      result = {
        data: data.slice(0, 50),
        totals,
        generatedAt: new Date().toISOString(),
      };
    } else {
      return { success: false, error: "Invalid acquisition report slug." };
    }

    // Save to Redis Cache (5 minutes TTL)
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`✅ Acquisition Report cached (5 min TTL): ${slug}`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache acquisition report:", cacheError);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error(`❌ Acquisition Report Error (${slug}):`, error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch acquisition report data.",
    };
  }
}