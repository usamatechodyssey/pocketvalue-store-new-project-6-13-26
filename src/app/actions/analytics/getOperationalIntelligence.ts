// @/app/actions/analytics/getOperationalIntelligence.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getOperationalIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    // 🚀 ENTERPRISE FACET REPLACEMENT: Fetching everything in one single conditional grouping database hit
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
          pendingCount: {
            $sum: { $cond: [{ $in: ["$status", ["Pending", "On Hold"]] }, 1, 0] },
          },
          limboRevenue: {
            $sum: {
              $cond: [{ $in: ["$status", ["Pending", "On Hold"]] }, "$totalPrice", 0],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      delivered: 0,
      cancelled: 0,
      pendingCount: 0,
      limboRevenue: 0,
    };

    const total = result.total;

    return {
      limboRevenue: result.limboRevenue,
      fulfillmentRate:
        total > 0 ? Number(((result.delivered / total) * 100).toFixed(1)) : 0,
      leakageRate:
        total > 0 ? Number(((result.cancelled / total) * 100).toFixed(1)) : 0,
      pendingCount: result.pendingCount,
    };
  } catch (error: any) {
    console.error("Operational Engine Error:", error.message);
    return null;
  }
}