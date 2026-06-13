// @/app/actions/analytics/getBehavioralIntelligence.ts
"use server";

import mongoose from "mongoose";
import connectMongoose from "@/app/lib/mongoose";
import User from "@/models/User";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getBehavioralIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    // 1. Fetch metadata in parallel
    const [settings, totalUsers, newUsers, categoriesRes] = await Promise.all([
      payload.findGlobal({ slug: "settings" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({
        role: "customer",
        createdAt: { $gte: range.from, $lte: range.to },
      }),
      payload.find({
        collection: "categories",
        limit: 100, // Fetch categories in one fast single hit
        depth: 0,
        select: { name: true }, // Select only name to minimize payload size
      }),
    ]);

    // 2. 🚀 ELITE N+1 FIX: Direct MongoDB Aggregation on raw 'products' collection
    // to group and count products per category in ONE database hit.
    const rawCategoryCounts = await mongoose.connection.db
      ?.collection("products")
      .aggregate([
        { $unwind: "$categories" },
        {
          $group: {
            _id: "$categories",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const countMap = new Map(
      rawCategoryCounts?.map((c) => [c._id.toString(), c.count]) || [],
    );

    const categoryPulse = categoriesRes.docs.map((cat: any) => {
      const count = countMap.get(cat.id.toString()) || 0;
      return { name: cat.name, count };
    });

    return {
      loyaltyIndex:
        totalUsers > 0
          ? Number((((totalUsers - newUsers) / totalUsers) * 100).toFixed(1))
          : 0,
      trendingKeywords:
        settings.searchSettings?.trendingKeywords?.map((k: any) => k.keyword) ||
        [],
      categoryPulse: categoryPulse
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      newCustomerRate:
        totalUsers > 0 ? Number(((newUsers / totalUsers) * 100).toFixed(1)) : 0,
    };
  } catch (error: any) {
    console.error("Behavioral Engine Error:", error.message);
    return null;
  }
}
