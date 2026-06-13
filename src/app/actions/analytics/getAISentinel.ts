// @/app/actions/analytics/getAISentinel.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { subDays } from "date-fns";
import { verifyAdminAccess } from "./verifyAdminAccess";

export async function getAISentinelPayload() {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    const now = new Date();
    const oneDayAgo = subDays(now, 1);

    // Fetching only required fields via Mongoose projection to save memory
    const [recent, highValue, hourly] = await Promise.all([
      Order.find({ createdAt: { $gte: oneDayAgo } }, { createdAt: 1 }).lean(),
      Order.find(
        { totalPrice: { $gt: 10000 }, status: "Pending" },
        { orderId: 1, createdAt: 1 }
      ).limit(3).lean(),
      Order.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    ]);

    const alerts: any[] = [];
    if (recent.length === 0) {
      alerts.push({
        type: "CRITICAL",
        title: "Zero Activity",
        message: "No orders recently. Check checkout flows.",
        timestamp: now.toISOString(),
      });
    }

    highValue.forEach((o: any) =>
      alerts.push({
        type: "WARNING",
        title: "High Value Order",
        message: `Order #${o.orderId} is large. Manual verification recommended.`,
        timestamp: o.createdAt.toISOString(),
      })
    );

    return {
      status: alerts.length > 0 ? "ATTENTION" : "SECURE",
      alerts: alerts.slice(0, 4),
      lastScan: now.toISOString(),
    };
  } catch (error: any) {
    console.error("AI Sentinel Error:", error.message);
    return { status: "ERROR", alerts: [], lastScan: new Date().toISOString() };
  }
}