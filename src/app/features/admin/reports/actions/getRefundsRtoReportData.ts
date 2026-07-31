// 📂 src/app/features/admin/reports/actions/getRefundsRtoReportData.ts (FULLY SNAPSHOT-ALIGNED & NULL-SAFE)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import ReturnRequest from "@/models/ReturnRequest";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts "refunds-rto")
// ================================================================
export interface RefundsRtoReportRow {
  date: string;
  refundOrders: number;
  refundAmount: number;
  rtoOrders: number;
  appliedRtoRate: number; // Snapshotted RTO Risk Budget %
  rtoLoss: number;        // Double Shipping Penalty
  totalLoss: number;      // Refund Amount + RTO Loss
}

export interface RefundsRtoReportResponse {
  data: RefundsRtoReportRow[];
  totals: {
    refundOrders: number;
    refundAmount: number;
    rtoOrders: number;
    appliedRtoRate: number;
    rtoLoss: number;
    totalLoss: number;
  };
  generatedAt: string;
}

// ================================================================
// 🔧 HELPERS
// ================================================================
function getDateGrouping(startDate: Date, endDate: Date): {
  format: string;
  groupBy: any;
} {
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return {
      format: "yyyy-MM-dd HH:00",
      groupBy: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        hour: { $hour: "$createdAt" },
      },
    };
  } else if (diffDays <= 7) {
    return {
      format: "yyyy-MM-dd",
      groupBy: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      },
    };
  } else {
    return {
      format: "yyyy-MM",
      groupBy: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
    };
  }
}

// ================================================================
// 🚀 MAIN REPORT SERVER ACTION (100% Snapshot Driven)
// ================================================================
export async function getRefundsRtoReportData(
  range: { startDate: Date; endDate: Date }
): Promise<{ success: boolean; data?: RefundsRtoReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_refunds_rto_v5_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "finance"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<RefundsRtoReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Refunds & RTO Report (Hardened)`);
      return { success: true, data: parsed };
    }

    await connectMongoose();

    const start = startOfDay(new Date(range.startDate));
    const end = endOfDay(new Date(range.endDate));
    const grouping = getDateGrouping(start, end);

    // ================================================================
    // A. FETCH APPROVED REFUNDS FROM RETURNS (NULL-SAFE JOINED)
    // ================================================================
    const refundAggregation = await ReturnRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ["Approved", "Completed"] },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderData",
        },
      },
      { $unwind: { path: "$orderData", preserveNullAndEmptyArrays: true } },
      { $unwind: "$items" },
      { $unwind: { path: "$orderData.products", preserveNullAndEmptyArrays: true } },
      // ✅ CRITICAL FIX: Safe properties checking prevents evaluation exceptions on orphaned docs
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ["$orderData", null] }, // 🛡️ Null-safety shield
              { $eq: ["$items.productId", { $ifNull: ["$orderData.products.productId", ""] }] },
              { $eq: ["$items.variantKey", { $ifNull: ["$orderData.products.variant._key", ""] }] },
            ],
          },
        },
      },
      {
        $addFields: {
          itemRefundAmount: {
            $multiply: ["$orderData.products.price", "$items.quantity"],
          },
        },
      },
      {
        $group: {
          _id: {
            returnId: "$_id",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            hour: { $hour: "$createdAt" },
            resolution: "$resolution",
          },
          refundAmount: { $sum: "$itemRefundAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
            hour: "$_id.hour",
            resolution: "$_id.resolution",
          },
          totalRefundAmount: { $sum: "$refundAmount" },
          count: { $sum: "$count" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    // ================================================================
    // B. FETCH RTO ORDERS (100% Snapshot Driven)
    // ================================================================
    const rtoAggregation = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: "RTO",
        },
      },
      {
        $group: {
          _id: grouping.groupBy,
          rtoOrders: { $sum: 1 },
          rtoLoss: { $sum: { $multiply: ["$shippingCost", 2] } }, // RTO Shipping Penalty
          avgRtoRate: {
            $avg: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.appliedRtoRate", 0] }] }
              }
            }
          }
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    const rtoMap = new Map<string, { rtoOrders: number; rtoLoss: number; avgRtoRate: number }>();
    for (const item of rtoAggregation) {
      const date = new Date(
        item._id.year,
        (item._id.month || 1) - 1,
        item._id.day || 1,
        item._id.hour || 0
      );
      const key = format(date, grouping.format);
      rtoMap.set(key, {
        rtoOrders: item.rtoOrders || 0,
        rtoLoss: item.rtoLoss || 0,
        avgRtoRate: item.avgRtoRate || 0,
      });
    }

    const refundMap = new Map<
      string,
      {
        refundOrders: number;
        refundAmount: number;
        storeCreditOrders: number;
        storeCreditAmount: number;
      }
    >();

    for (const item of refundAggregation) {
      const date = new Date(
        item._id.year,
        (item._id.month || 1) - 1,
        item._id.day || 1,
        item._id.hour || 0
      );
      const key = format(date, grouping.format);

      if (!refundMap.has(key)) {
        refundMap.set(key, {
          refundOrders: 0,
          refundAmount: 0,
          storeCreditOrders: 0,
          storeCreditAmount: 0,
        });
      }
      const dataObj = refundMap.get(key)!;

      if (item._id.resolution === "Refund") {
        dataObj.refundOrders += item.count || 0;
        dataObj.refundAmount += item.totalRefundAmount || 0;
      } else if (item._id.resolution === "StoreCredit") {
        dataObj.storeCreditOrders += item.count || 0;
        dataObj.storeCreditAmount += item.totalRefundAmount || 0;
      }
    }

    // ================================================================
    // C. MERGE TIME SERIES & CALCULATE TOTALS
    // ================================================================
    const allDates = new Set([...rtoMap.keys(), ...refundMap.keys()]);

    if (allDates.size === 0) {
      return {
        success: true,
        data: {
          data: [],
          totals: {
            refundOrders: 0,
            refundAmount: 0,
            rtoOrders: 0,
            appliedRtoRate: 0,
            rtoLoss: 0,
            totalLoss: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };
    }

    const sortedDates = Array.from(allDates).sort();
    const data: RefundsRtoReportRow[] = [];

    let totalRefundOrders = 0;
    let totalRefundAmount = 0;
    let totalRtoOrders = 0;
    let totalRtoLoss = 0;
    let sumRtoRates = 0;
    let rtoRateCount = 0;

    for (const dateKey of sortedDates) {
      const rto = rtoMap.get(dateKey) || { rtoOrders: 0, rtoLoss: 0, avgRtoRate: 0 };
      const refund = refundMap.get(dateKey) || {
        refundOrders: 0,
        refundAmount: 0,
        storeCreditOrders: 0,
        storeCreditAmount: 0,
      };

      const refundLoss = refund.refundAmount || 0;
      const storeCreditLoss = refund.storeCreditAmount || 0;
      const rtoLoss = rto.rtoLoss || 0;
      
      const totalLoss = refundLoss + storeCreditLoss + rtoLoss;

      data.push({
        date: dateKey,
        refundOrders: refund.refundOrders || 0,
        refundAmount: refundLoss + storeCreditLoss, 
        rtoOrders: rto.rtoOrders || 0,
        appliedRtoRate: Number(rto.avgRtoRate.toFixed(1)),
        rtoLoss: Math.round(rtoLoss),
        totalLoss,
      });

      totalRefundOrders += (refund.refundOrders || 0) + (refund.storeCreditOrders || 0);
      totalRefundAmount += refundLoss + storeCreditLoss;
      totalRtoOrders += rto.rtoOrders || 0;
      totalRtoLoss += rtoLoss;
      
      if (rto.avgRtoRate > 0) {
        sumRtoRates += rto.avgRtoRate;
        rtoRateCount++;
      }
    }

    const response: RefundsRtoReportResponse = {
      data,
      totals: {
        refundOrders: totalRefundOrders,
        refundAmount: totalRefundAmount,
        rtoOrders: totalRtoOrders,
        appliedRtoRate: rtoRateCount > 0 ? Number((sumRtoRates / rtoRateCount).toFixed(1)) : 0,
        rtoLoss: totalRtoLoss,
        totalLoss: totalRefundAmount + totalRtoLoss,
      },
      generatedAt: new Date().toISOString(),
    };

    // Cache response for 5 minutes
    const stringified = safeStringify(response);
    await redis.set(cacheKey, stringified, { ex: 300 });
    console.log(`✅ Loss Analysis (Refunds & RTO) Report compiled and cached.`);

    return { success: true, data: response };
  } catch (error: any) {
    console.error("❌ Refunds & RTO Report Engine Error:", error.message);
    return { success: false, error: error.message };
  }
}