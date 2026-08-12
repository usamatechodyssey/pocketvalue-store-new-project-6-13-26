// 📂 src/app/features/admin/shared/engines/campaignAttributionEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================

// 1. Campaign ROI Item
export interface UnifiedCampaignAttributionItem {
  campaign: string;
  source: string;
  visits: number;
  orders: number;
  revenue: number;      // PKR
  adSpend: number;      // PKR
  profit: number;       // PKR
  aov: number;          // PKR
  conversionRate: number; // %
  roas: number;         // Ratio (Revenue / AdSpend)
}

export interface UnifiedCampaignAttributionSummary {
  totalRevenue: number;
  totalAdSpend: number;
  totalProfit: number;
  totalVisits: number;
  totalOrders: number;
  overallConversionRate: number;
  overallRoas: number;
  topCampaign: string;
}

export interface UnifiedCampaignAttributionResponse {
  data: UnifiedCampaignAttributionItem[];
  summary: UnifiedCampaignAttributionSummary;
  generatedAt: string;
}

// 2. Campaign Funnel Item
export interface UnifiedCampaignFunnelItem {
  campaign: string;
  views: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallConversionRate: number;
  dropOffRate: number;
}

export interface UnifiedCampaignFunnelResponse {
  data: UnifiedCampaignFunnelItem[];
  totalCampaigns: number;
  overallFunnelConversion: number;
  generatedAt: string;
}

// 3. Traffic Source Item (For Dashboard Donut Chart)
export interface UnifiedTrafficSourceItem {
  name: string;
  value: number;  // Revenue PKR
  orders: number;
  fill: string;
}

// Dynamic Color Palette Helper
const getColor = (index: number): string => {
  const colors = [
    "#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#14b8a6", "#D11111", "#6366f1", "#84cc16",
  ];
  return colors[index % colors.length];
};

// ================================================================
// 🚀 ENGINE 1: CAMPAIGN ROI & UNIT ECONOMICS
// ================================================================
export async function buildCampaignAttributionMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedCampaignAttributionResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  // 1. Group UserSessions for Visits
  const sessionsAgg = await UserSession.aggregate([
    {
      $match: {
        utmCampaign: { $nin: [null, "", "None", "Direct"] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$utmCampaign",
        visits: { $sum: 1 },
        source: { $first: "$utmSource" },
      },
    },
  ]);

  // 2. Group Orders for Revenue, Ad Spend, and Pure Profit
  const ordersAgg = await Order.aggregate([
    {
      $match: {
        status: { $in: REVENUE_STATUSES },
        "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$trafficSource.utmCampaign",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
        adSpend: {
          $sum: {
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $multiply: [
                      { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] },
                      { $divide: [{ $ifNull: ["$$this.appliedAdSpendRate", 0] }, 100] },
                    ],
                  },
                ],
              },
            },
          },
        },
        profit: {
          $sum: {
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
            },
          },
        },
      },
    },
  ]);

  // 3. Consolidated Data Merge
  const campaignMap = new Map<string, UnifiedCampaignAttributionItem>();

  for (const s of sessionsAgg) {
    campaignMap.set(s._id, {
      campaign: s._id,
      source: s.source || "Unknown",
      visits: s.visits || 0,
      orders: 0,
      revenue: 0,
      adSpend: 0,
      profit: 0,
      aov: 0,
      conversionRate: 0,
      roas: 0,
    });
  }

  for (const o of ordersAgg) {
    if (campaignMap.has(o._id)) {
      const existing = campaignMap.get(o._id)!;
      existing.orders = o.orders || 0;
      existing.revenue = Math.round(o.revenue || 0);
      existing.adSpend = Math.round(o.adSpend || 0);
      existing.profit = Math.round(o.profit || 0);
    } else {
      campaignMap.set(o._id, {
        campaign: o._id,
        source: "Unknown",
        visits: 0,
        orders: o.orders || 0,
        revenue: Math.round(o.revenue || 0),
        adSpend: Math.round(o.adSpend || 0),
        profit: Math.round(o.profit || 0),
        aov: 0,
        conversionRate: 0,
        roas: 0,
      });
    }
  }

  const data: UnifiedCampaignAttributionItem[] = [];
  let totalRevenue = 0;
  let totalAdSpend = 0;
  let totalProfit = 0;
  let totalOrders = 0;
  let totalVisits = 0;
  let topCampaign = "N/A";
  let topRevenue = 0;

  for (const [campaign, item] of campaignMap) {
    const { visits, orders, revenue, adSpend, profit } = item;

    const aov = orders > 0 ? Math.round(revenue / orders) : 0;
    const rawConv = visits > 0 ? (orders / visits) * 100 : orders > 0 ? 100 : 0;
    const conversionRate = Number(Math.min(100, rawConv).toFixed(1));

    const roas = adSpend > 0
      ? Number((revenue / adSpend).toFixed(2))
      : visits > 0
        ? Number((revenue / visits).toFixed(2))
        : 0;

    data.push({
      campaign,
      source: item.source,
      visits,
      orders,
      revenue,
      adSpend,
      profit,
      aov,
      conversionRate,
      roas,
    });

    totalRevenue += revenue;
    totalAdSpend += adSpend;
    totalProfit += profit;
    totalOrders += orders;
    totalVisits += visits;

    if (revenue > topRevenue) {
      topRevenue = revenue;
      topCampaign = campaign;
    }
  }

  data.sort((a, b) => b.revenue - a.revenue);

  const rawOverallConv = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : totalOrders > 0 ? 100 : 0;
  const overallConversionRate = Number(Math.min(100, rawOverallConv).toFixed(1));

  const overallRoas = totalAdSpend > 0
    ? Number((totalRevenue / totalAdSpend).toFixed(2))
    : totalVisits > 0
      ? Number((totalRevenue / totalVisits).toFixed(2))
      : 0;

  return {
    data,
    summary: {
      totalRevenue,
      totalAdSpend,
      totalProfit,
      totalVisits,
      totalOrders,
      overallConversionRate,
      overallRoas,
      topCampaign,
    },
    generatedAt: new Date().toISOString(),
  };
}

// ================================================================
// 🚀 ENGINE 2: CAMPAIGN FUNNEL DROPS
// ================================================================
export async function buildCampaignFunnelMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedCampaignFunnelResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  const eventsAgg = await UserEvent.aggregate([
    {
      $match: {
        eventType: { $in: ["page_view", "add_to_cart", "checkout_start"] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "usersessions",
        localField: "sessionId",
        foreignField: "sessionId",
        as: "session",
      },
    },
    { $unwind: "$session" },
    {
      $match: {
        "session.utmCampaign": { $nin: [null, "", "None", "Direct"] },
      },
    },
    {
      $group: {
        _id: {
          campaign: "$session.utmCampaign",
          eventType: "$eventType",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const ordersAgg = await Order.aggregate([
    {
      $match: {
        status: { $in: REVENUE_STATUSES },
        "trafficSource.utmCampaign": { $nin: [null, "", "None", "Direct"] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$trafficSource.utmCampaign",
        purchases: { $sum: 1 },
      },
    },
  ]);

  const funnelMap = new Map<
    string,
    { views: number; addToCarts: number; checkouts: number; purchases: number }
  >();

  for (const e of eventsAgg) {
    const campaign = e._id.campaign;
    const type = e._id.eventType;
    const count = e.count || 0;

    if (!funnelMap.has(campaign)) {
      funnelMap.set(campaign, { views: 0, addToCarts: 0, checkouts: 0, purchases: 0 });
    }
    const metrics = funnelMap.get(campaign)!;

    if (type === "page_view") metrics.views += count;
    else if (type === "add_to_cart") metrics.addToCarts += count;
    else if (type === "checkout_start") metrics.checkouts += count;
  }

  for (const o of ordersAgg) {
    const campaign = o._id;
    if (!funnelMap.has(campaign)) {
      funnelMap.set(campaign, { views: 0, addToCarts: 0, checkouts: 0, purchases: 0 });
    }
    funnelMap.get(campaign)!.purchases += o.purchases || 0;
  }

  const data: UnifiedCampaignFunnelItem[] = [];
  let totalViews = 0;
  let totalPurchases = 0;

  for (const [campaign, metrics] of funnelMap) {
    const { views, addToCarts, checkouts, purchases } = metrics;

    if (views === 0 && addToCarts === 0 && checkouts === 0 && purchases === 0) continue;

    const viewToCartRate = views > 0 ? Number(Math.min(100, (addToCarts / views) * 100).toFixed(1)) : 0;
    const cartToCheckoutRate = addToCarts > 0 ? Number(Math.min(100, (checkouts / addToCarts) * 100).toFixed(1)) : 0;
    const checkoutToPurchaseRate = checkouts > 0 ? Number(Math.min(100, (purchases / checkouts) * 100).toFixed(1)) : 0;
    const overallConversionRate = views > 0 ? Number(Math.min(100, (purchases / views) * 100).toFixed(1)) : 0;
    const dropOffRate = views > 0 ? Number(Math.max(0, ((views - purchases) / views) * 100).toFixed(1)) : 0;

    data.push({
      campaign,
      views,
      addToCarts,
      checkouts,
      purchases,
      viewToCartRate,
      cartToCheckoutRate,
      checkoutToPurchaseRate,
      overallConversionRate,
      dropOffRate,
    });

    totalViews += views;
    totalPurchases += purchases;
  }

  data.sort((a, b) => b.views - a.views);

  const overallFunnelConversion = totalViews > 0
    ? Number(Math.min(100, (totalPurchases / totalViews) * 100).toFixed(2))
    : 0;

  return {
    data,
    totalCampaigns: data.length,
    overallFunnelConversion,
    generatedAt: new Date().toISOString(),
  };
}

// ================================================================
// 🚀 ENGINE 3: TRAFFIC SOURCES (DASHBOARD DONUT CHART)
// ================================================================
export async function buildTrafficSourceMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedTrafficSourceItem[]> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  const attribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: REVENUE_STATUSES },
      },
    },
    {
      $group: {
        _id: {
          $toUpper: { // ✅ FIXED: Case-insensitive upper-case group merges "facebook", "Facebook", "FACEBOOK"
            $ifNull: [
              "$trafficSource.utmSource",
              { $ifNull: ["$trafficSource.source", "Direct"] },
            ],
          },
        },
        revenue: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return attribution.map((item, index) => ({
    name: item._id ? String(item._id).toUpperCase() : "DIRECT",
    value: Math.round(item.revenue || 0),
    orders: item.orderCount || 0,
    fill: getColor(index),
  }));
}