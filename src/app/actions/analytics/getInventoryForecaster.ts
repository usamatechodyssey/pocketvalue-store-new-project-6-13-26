// @/app/actions/analytics/getInventoryForecaster.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { subDays } from "date-fns";
import { verifyAdminAccess } from "./verifyAdminAccess";

export async function getInventoryForecasterPayload() {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    const fifteenDaysAgo = subDays(new Date(), 15);

    // Fetch orders and lightweight products (only title and variants field)
    const [orders, productsRes] = await Promise.all([
      Order.find(
        {
          createdAt: { $gte: fifteenDaysAgo },
          status: { $nin: ["Cancelled"] },
        },
        { products: 1 },
      ).lean(), // Select only products array in Order query
      payload.find({
        collection: "products",
        limit: 5000,
        depth: 0,
        select: { title: true, variants: true }, // 🔥 Lightweight selection
      }),
    ]);

    const salesMap = new Map<string, number>();
    orders.forEach((o: any) =>
      o.products?.forEach((p: any) => {
        const vId = p.variant?._key || p.variant?.id;
        if (vId) {
          salesMap.set(vId, (salesMap.get(vId) || 0) + (p.quantity || 0));
        }
      }),
    );

    const predictions: any[] = [];
    productsRes.docs.forEach((p: any) =>
      p.variants?.forEach((v: any) => {
        const sold = salesMap.get(v.id) || salesMap.get(v._key) || 0;
        const velocity = sold / 15;
        const stock = v.stock ?? 0;
        const daysLeft = velocity > 0 ? Math.floor(stock / velocity) : Infinity;

        if (sold > 0 || stock < 10) {
          predictions.push({
            name: p.title,
            variant: v.name,
            stock,
            velocity: velocity.toFixed(2),
            daysLeft: daysLeft === Infinity ? "Stable" : daysLeft,
            priority: daysLeft < 3 ? "CRITICAL" : daysLeft < 7 ? "HIGH" : "LOW",
          });
        }
      }),
    );

    return predictions
      .sort((a, b) =>
        typeof a.daysLeft === "string"
          ? 1
          : typeof b.daysLeft === "string"
            ? -1
            : a.daysLeft - b.daysLeft,
      )
      .slice(0, 6);
  } catch (error: any) {
    console.error("Forecaster Engine Error:", error.message);
    return [];
  }
}
