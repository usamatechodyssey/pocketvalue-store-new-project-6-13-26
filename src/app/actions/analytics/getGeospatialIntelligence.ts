// @/app/actions/analytics/getGeospatialIntelligence.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getGeospatialIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    const cityData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $toUpper: "$shippingAddress.city" },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    return cityData.map((item) => ({
      city: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));
  } catch (error: any) {
    console.error("Geospatial Engine Error:", error.message);
    return [];
  }
}
