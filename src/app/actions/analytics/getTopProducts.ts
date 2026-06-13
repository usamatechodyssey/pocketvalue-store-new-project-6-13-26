// @/app/actions/analytics/getTopProducts.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getTopProductsPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      // 🚀 CPU MEMORY SAVER: Project only products array to minimize unwind overhead
      {
        $project: {
          products: 1,
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$products.name" },
          variantName: { $first: { $ifNull: ["$products.variant.name", "$products.variantName"] } }, // Fallback logic
          totalSold: { $sum: { $ifNull: ["$products.quantity", 0] } },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$products.price", 0] },
                { $ifNull: ["$products.quantity", 0] },
              ],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
  } catch (error: any) {
    console.error("Top Products Engine Error:", error.message);
    return [];
  }
}