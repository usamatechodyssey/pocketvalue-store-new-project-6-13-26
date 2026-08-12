// 📂 src/app/features/admin/shared/engines/operationalEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import ReturnRequest from "@/models/ReturnRequest";
import { OperationalTrend } from "@/models/OperationalTrend";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { REVENUE_STATUSES, LIMBO_STATUSES } from "@/app/shared/constants/analytics";
import { differenceInDays, format, startOfDay, endOfDay } from "date-fns";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================

export interface UnifiedOperationalIntelligenceResponse {
  totalOrders: number;
  deliveredCount: number;
  cancelledCount: number;
  limboRevenue: number;
  pendingCount: number;
  fulfillmentRate: number;
  leakageRate: number;
  statusBreakdown: Record<string, number>;
  limboOrders: any[];
  totalLimboCount: number;
  totalLimboPages: number;
  currentLimboPage: number;
  generatedAt: string;
  thresholdAlert?: {
    triggered: boolean;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  };
}

export interface UnifiedFulfillmentHealthRow {
  date: string;
  totalOrders: number;
  delivered: number;
  pending: number;
  cancelled: number;
  fulfillmentRate: number;
  leakageRate: number;
}

export interface UnifiedCourierPerformanceRow {
  courier: string;
  totalShipments: number;
  delivered: number;
  rto: number;
  deliveryRate: number;
  avgDeliveryDays: number;
}

export interface UnifiedReturnRequestSummaryRow {
  status: string;
  count: number;
}

// ================================================================
// 🔨 HELPERS
// ================================================================
async function upsertOperationalTrend(
  trendDate: Date,
  data: {
    totalOrders: number;
    deliveredCount: number;
    cancelledCount: number;
    limboRevenue: number;
    pendingCount: number;
    fulfillmentRate: number;
    leakageRate: number;
  }
) {
  try {
    const dateKey = format(trendDate, "yyyy-MM-dd");
    await OperationalTrend.findOneAndUpdate(
      { _id: dateKey },
      {
        date: dateKey,
        totalOrders: data.totalOrders,
        deliveredCount: data.deliveredCount,
        cancelledCount: data.cancelledCount,
        limboRevenue: data.limboRevenue,
        pendingCount: data.pendingCount,
        fulfillmentRate: data.fulfillmentRate,
        leakageRate: data.leakageRate,
        generatedAt: new Date(),
      },
      { upsert: true }
    );
  } catch (error) {
    console.warn("⚠️ Failed to upsert operational trend:", error);
  }
}

function getDateGrouping(startDate: Date, endDate: Date): {
  format: string;
  groupByString: any;
} {
  const diffDays = differenceInDays(endDate, startDate) + 1;
  const timezone = "+05:00"; // Pakistan PST

  if (diffDays <= 1) {
    return {
      format: "yyyy-MM-dd HH:00",
      groupByString: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt", timezone } },
    };
  } else if (diffDays <= 31) {
    return {
      format: "yyyy-MM-dd",
      groupByString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } },
    };
  } else {
    return {
      format: "yyyy-MM",
      groupByString: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone } },
    };
  }
}

// ================================================================
// 🚀 ENGINE 1: MAIN OPERATIONAL INTELLIGENCE MATRIX
// ================================================================
export async function buildOperationalIntelligenceMatrix(
  range: { startDate: Date; endDate: Date },
  page: number = 1,
  limit: number = 15
): Promise<UnifiedOperationalIntelligenceResponse> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);

  let settings: any = {};
  try {
    settings = await getCachedSettings();
  } catch (e) {
    settings = {};
  }
  const threshold = settings?.operational?.limboRevenueThreshold ?? 1000000;

  const OPERATIONAL_STATUS_QUERY = Array.from(
    new Set([...REVENUE_STATUSES, ...LIMBO_STATUSES, "Cancelled", "Completed", "Rejected"])
  );

  const statsResult = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: OPERATIONAL_STATUS_QUERY },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        delivered: {
          $sum: {
            $cond: [{ $in: ["$status", ["Delivered", "Completed"]] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [{ $in: ["$status", ["Cancelled", "Rejected"]] }, 1, 0],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $in: ["$status", LIMBO_STATUSES] }, 1, 0],
          },
        },
        limboRevenue: {
          $sum: {
            $cond: [{ $in: ["$status", LIMBO_STATUSES] }, "$totalPrice", 0],
          },
        },
        breakdown: { $push: "$status" },
      },
    },
  ]);

  const stats = statsResult[0] || {};
  const totalOrders = stats.total || 0;
  const deliveredCount = stats.delivered || 0;
  const cancelledCount = stats.cancelled || 0;
  const pendingCount = stats.pendingCount || 0;
  const limboRevenue = Math.round(stats.limboRevenue || 0);

  const statusBreakdown: Record<string, number> = {};
  if (stats.breakdown && Array.isArray(stats.breakdown)) {
    for (const status of stats.breakdown) {
      if (status) {
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      }
    }
  }

  const fulfillmentRate = totalOrders > 0 ? Number(((deliveredCount / totalOrders) * 100).toFixed(1)) : 0;
  const leakageRate = totalOrders > 0 ? Number(((cancelledCount / totalOrders) * 100).toFixed(1)) : 0;

  const [limboOrders, totalLimboCount] = await Promise.all([
    Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: LIMBO_STATUSES },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("orderId shippingAddress.fullName status totalPrice createdAt")
      .lean(),
    Order.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: { $in: LIMBO_STATUSES },
    }),
  ]);

  const totalLimboPages = Math.ceil(totalLimboCount / limit) || 1;

  let thresholdAlert: UnifiedOperationalIntelligenceResponse["thresholdAlert"] = {
    triggered: false,
    message: "",
    severity: "LOW",
  };

  if (limboRevenue > threshold) {
    thresholdAlert = {
      triggered: true,
      message: `🚨 Limbo Revenue has exceeded threshold of Rs. ${threshold.toLocaleString('en-PK')}. Current: Rs. ${limboRevenue.toLocaleString('en-PK')}.`,
      severity: limboRevenue > threshold * 2 ? "HIGH" : "MEDIUM",
    };
  }

  await upsertOperationalTrend(end, {
    totalOrders,
    deliveredCount,
    cancelledCount,
    limboRevenue,
    pendingCount,
    fulfillmentRate,
    leakageRate,
  });

  return {
    totalOrders,
    deliveredCount,
    cancelledCount,
    limboRevenue,
    pendingCount,
    fulfillmentRate,
    leakageRate,
    statusBreakdown,
    limboOrders,
    totalLimboCount,
    totalLimboPages,
    currentLimboPage: page,
    generatedAt: new Date().toISOString(),
    thresholdAlert,
  };
}

// ================================================================
// 🚀 ENGINE 2: FULFILLMENT HEALTH REPORT MATRIX
// ================================================================
export async function buildFulfillmentHealthReportMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedFulfillmentHealthRow[]> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);
  const grouping = getDateGrouping(start, end);

  const OPERATIONAL_STATUS_QUERY = Array.from(
    new Set([...REVENUE_STATUSES, ...LIMBO_STATUSES, "Cancelled", "Completed", "Rejected", "RTO"])
  );
  const PENDING_LIMBO_STATUSES = LIMBO_STATUSES.filter((s) => s !== "RTO");

  const aggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: OPERATIONAL_STATUS_QUERY },
      },
    },
    {
      $group: {
        _id: grouping.groupByString,
        totalOrders: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $in: ["$status", ["Delivered", "Completed"]] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $in: ["$status", ["Cancelled", "Rejected", "RTO"]] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $in: ["$status", PENDING_LIMBO_STATUSES] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return aggregation.map((item: any) => {
    const total = item.totalOrders || 0;
    const delivered = item.delivered || 0;
    const cancelled = item.cancelled || 0;
    const pending = item.pending || 0;

    return {
      date: item._id,
      totalOrders: total,
      delivered,
      pending,
      cancelled,
      fulfillmentRate: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0,
      leakageRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
    };
  });
}

// ================================================================
// 🚀 ENGINE 3: COURIER PERFORMANCE REPORT MATRIX
// ================================================================
export async function buildCourierPerformanceReportMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedCourierPerformanceRow[]> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);

  const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO", "Cancelled"]));

  const aggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: STATUS_QUERY },
        "shipments.0": { $exists: true },
      },
    },
    { $unwind: "$shipments" },
    {
      $group: {
        _id: "$shipments.courier",
        totalShipments: { $sum: 1 },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ["$shipments.status", "Delivered"] }, 1, 0] },
        },
        rtoCount: {
          $sum: { $cond: [{ $eq: ["$shipments.status", "RTO"] }, 1, 0] },
        },
        totalDeliveryTimeMs: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$shipments.status", "Delivered"] },
                  { $ne: ["$shipments.deliveredAt", null] },
                  { $ne: ["$shipments.createdAt", null] },
                ],
              },
              {
                $subtract: [
                  { $toDate: "$shipments.deliveredAt" },
                  { $toDate: "$shipments.createdAt" },
                ],
              },
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalShipments: -1 } },
  ]);

  return aggregation.map((item: any) => {
    const total = item.totalShipments || 0;
    const delivered = item.deliveredCount || 0;
    const rto = item.rtoCount || 0;
    const rawDays = delivered > 0 ? item.totalDeliveryTimeMs / delivered / (1000 * 60 * 60 * 24) : 0;

    return {
      courier: item._id ? String(item._id).toUpperCase() : "Manual/Self-Pickup",
      totalShipments: total,
      delivered,
      rto,
      deliveryRate: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0,
      avgDeliveryDays: delivered > 0 ? Number(Math.max(0.1, rawDays).toFixed(1)) : 0,
    };
  });
}

// ================================================================
// 🚀 ENGINE 4: RETURN REQUESTS SUMMARY MATRIX
// ================================================================
export async function buildReturnRequestsSummaryMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedReturnRequestSummaryRow[]> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);

  const aggregation = await ReturnRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return aggregation.map((item: any) => ({
    status: item._id || "Unknown",
    count: item.count || 0,
  }));
}