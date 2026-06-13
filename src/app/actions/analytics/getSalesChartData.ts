// @/app/actions/analytics/getSalesChartData.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { eachDayOfInterval, format } from "date-fns";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getSalesChartDataPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    // High-performance aggregation leveraging index on createdAt
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+05:00", // Aligned with PKT (Pakistan Standard Time)
            },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing gap dates to prevent charts from breaking on empty days
    const allDays = eachDayOfInterval({ start: range.from, end: range.to });
    const dataMap = new Map(result.map((i) => [i._id, i]));

    return allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayData = dataMap.get(dateStr);
      return {
        date: format(day, "MMM dd"),
        revenue: dayData ? dayData.revenue : 0,
        orders: dayData ? dayData.orders : 0,
      };
    });
  } catch (error: any) {
    console.error("Chart Engine Error:", error.message);
    return [];
  }
}