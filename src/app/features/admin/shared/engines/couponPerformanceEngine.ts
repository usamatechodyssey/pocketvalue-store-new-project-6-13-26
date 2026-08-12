// 📂 src/app/features/admin/shared/engines/couponPerformanceEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================
export interface UnifiedCouponPerformanceItem {
  code: string;
  redemptions: number;
  totalDiscount: number; // Total discount given in PKR
  revenue: number;       // Attributed revenue in PKR
  avgOrderValue: number; // AOV for orders using this coupon
  roi: number;           // Coupon ROI % [(Revenue / Discount) * 100]
}

export interface UnifiedCouponPerformanceSummary {
  totalRedemptions: number;
  totalDiscountAmount: number;
  totalAttributedRevenue: number;
  overallRoi: number;
}

export interface UnifiedCouponPerformanceResponse {
  data: UnifiedCouponPerformanceItem[];
  summary: UnifiedCouponPerformanceSummary;
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN CENTRAL COUPON PERFORMANCE ENGINE
// ================================================================
export async function buildCouponPerformanceMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedCouponPerformanceResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  // Aggregate Orders with valid sales statuses & active coupon code
  const aggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: REVENUE_STATUSES },
        "coupon.code": { $exists: true, $ne: null, $nin: ["", "null", "undefined"] },
      },
    },
    {
      $group: {
        _id: "$coupon.code",
        redemptions: { $sum: 1 },
        totalDiscount: { $sum: { $ifNull: ["$coupon.amount", 0] } },
        revenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
        avgOrderValue: { $avg: { $ifNull: ["$totalPrice", 0] } },
      },
    },
    { $sort: { redemptions: -1 } },
  ]);

  const items: UnifiedCouponPerformanceItem[] = aggregation.map((item: any) => {
    const code = String(item._id || "UNKNOWN").toUpperCase();
    const redemptions = item.redemptions || 0;
    const totalDiscount = Math.round(item.totalDiscount || 0);
    const revenue = Math.round(item.revenue || 0);
    const avgOrderValue = Math.round(item.avgOrderValue || 0);

    const roi = totalDiscount > 0 ? Number(((revenue / totalDiscount) * 100).toFixed(1)) : 0;

    return {
      code,
      redemptions,
      totalDiscount,
      revenue,
      avgOrderValue,
      roi,
    };
  });

  const totalRedemptions = items.reduce((s, i) => s + i.redemptions, 0);
  const totalDiscountAmount = items.reduce((s, i) => s + i.totalDiscount, 0);
  const totalAttributedRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const overallRoi = totalDiscountAmount > 0
    ? Number(((totalAttributedRevenue / totalDiscountAmount) * 100).toFixed(1))
    : 0;

  return {
    data: items,
    summary: {
      totalRedemptions,
      totalDiscountAmount,
      totalAttributedRevenue,
      overallRoi,
    },
    generatedAt: new Date().toISOString(),
  };
}