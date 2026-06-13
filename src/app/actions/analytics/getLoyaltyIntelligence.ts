// @/app/actions/analytics/getLoyaltyIntelligence.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { subDays } from "date-fns";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getLoyaltyIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    const thirtyDaysAgo = subDays(new Date(), 30);

    // 🔥 MEMORY OPTIMIZATION: Projecting only required fields to run 100% inside MongoDB Cache memory.
    const customerStats = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $project: {
          userId: 1,
          totalPrice: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    let champions = 0,
      atRisk = 0,
      newbies = 0;

    customerStats.forEach((c) => {
      const isDormant = new Date(c.lastOrderDate) < thirtyDaysAgo;
      if (c.orderCount >= 3 && c.totalSpent > 5000) champions++;
      if (isDormant) atRisk++;
      if (c.orderCount === 1 && !isDormant) newbies++;
    });

    const total = customerStats.length;

    return {
      retentionRate:
        total > 0 ? Number((((total - atRisk) / total) * 100).toFixed(1)) : 0,
      churnRate: total > 0 ? Number(((atRisk / total) * 100).toFixed(1)) : 0,
      segments: { champions, atRisk, newbies },
      totalActiveBase: total,
    };
  } catch (error: any) {
    console.error("Loyalty Engine Error:", error.message);
    return null;
  }
}