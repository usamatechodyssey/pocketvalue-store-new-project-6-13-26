// @/app/actions/analytics/getTrafficAttribution.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getTrafficAttributionPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    // Pocket Value Standard UI Color Palette
    const COLORS = ["#D11111", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

    const attribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      // 🚀 OPTIMIZATION: Project only required fields to avoid buffering heavy metadata
      {
        $project: {
          "trafficSource.source": 1,
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$trafficSource.source", "Direct/Organic"] },
          revenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return attribution.map((item, index) => ({
      name: item._id.toUpperCase(),
      value: item.revenue,
      orders: item.orderCount,
      fill: COLORS[index % COLORS.length], // Color data ke andar shamil hai
    }));
  } catch (error: any) {
    console.error("Traffic Engine Failure:", error.message);
    return [];
  }
}
