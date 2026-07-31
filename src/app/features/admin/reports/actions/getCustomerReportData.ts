// 📂 src/app/features/admin/reports/actions/getCustomerReportData.ts (FULLY SNAPSHOT-ALIGNED & HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import User from "@/models/User"; // ✅ FIX 1: Explicitly imported to ensure cold-start collection registration
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts "customer-ltv")
// ================================================================
export interface CustomerReportRow {
  cohort: string; // e.g., "2024-07"
  newUsers: number;
  repeatUsers: number;
  repeatRate: number; // %
  avgLTV: number; // Rs.
  day30Retention: number; // %
}

export interface CustomerReportResponse {
  data: CustomerReportRow[];
  totals: {
    newUsers: number;
    repeatUsers: number;
    repeatRate: number;
    avgLTV: number;
    day30Retention: number;
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getCustomerReportData(
  range: { startDate: Date; endDate: Date },
  slug: "customer-ltv"
): Promise<{ success: boolean; data?: CustomerReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_customer_v5_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "finance"]);

    // 1. Cache Read (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<CustomerReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Customer Report (${slug})`);
      return { success: true, data: parsed };
    }

    await connectMongoose();

    const start = startOfDay(new Date(range.startDate));
    const end = endOfDay(new Date(range.endDate));

    // ================================================================
    // 🔥 COHORT ANALYSIS AGGREGATION
    // ================================================================
    const userCohortStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: "$userId",
          orders: { $push: "$$ROOT" },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          firstOrderDate: { $min: "$createdAt" },
        },
      },
      // ✅ FIX 2: Converts string ID to Mongoose ObjectId to join with Users._id safely (Prevents silent join drops!)
      {
        $addFields: {
          userIdObj: {
            $convert: {
              input: "$_id",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userIdObj", // ✅ Join ObjectIds with ObjectIds
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $match: {
          "userData.role": "customer",
        },
      },
      {
        $addFields: {
          cohortMonth: {
            $dateToString: { format: "%Y-%m", date: "$userData.createdAt" },
          },
          isRepeat: { $gt: ["$orderCount", 1] },
          repeatWithin30Days: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$orders",
                    as: "o",
                    cond: {
                      $and: [
                        { $gt: ["$$o.createdAt", "$firstOrderDate"] },
                        {
                          $lte: [
                            { $subtract: ["$$o.createdAt", "$firstOrderDate"] },
                            30 * 24 * 60 * 60 * 1000,
                          ],
                        },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          userId: "$_id",
          cohortMonth: 1,
          orderCount: 1,
          totalRevenue: 1,
          isRepeat: 1,
          repeatWithin30Days: 1,
          signupDate: "$userData.createdAt",
        },
      },
    ]);

    if (userCohortStats.length === 0) {
      return {
        success: true,
        data: {
          data: [],
          totals: {
            newUsers: 0,
            repeatUsers: 0,
            repeatRate: 0,
            avgLTV: 0,
            day30Retention: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };
    }

    const cohortMap = new Map<
      string,
      {
        users: number;
        repeatUsers: number;
        day30Retained: number;
        totalRevenue: number;
        orderCount: number;
      }
    >();

    for (const stat of userCohortStats) {
      const cohort = stat.cohortMonth || "Unknown";
      if (!cohortMap.has(cohort)) {
        cohortMap.set(cohort, {
          users: 0,
          repeatUsers: 0,
          day30Retained: 0,
          totalRevenue: 0,
          orderCount: 0,
        });
      }
      const dataObj = cohortMap.get(cohort)!;
      dataObj.users += 1;
      dataObj.totalRevenue += stat.totalRevenue || 0;
      dataObj.orderCount += stat.orderCount || 0;
      if (stat.isRepeat) dataObj.repeatUsers += 1;
      if (stat.repeatWithin30Days) dataObj.day30Retained += 1;
    }

    const data: CustomerReportRow[] = [];
    let totalUsers = 0;
    let totalRepeatUsers = 0;
    let totalDay30Retained = 0; 
    let totalRevenue = 0;
    let totalOrders = 0;

    for (const [cohort, metrics] of cohortMap) {
      const { users, repeatUsers, day30Retained, totalRevenue: rev, orderCount: ord } = metrics;

      totalUsers += users;
      totalRepeatUsers += repeatUsers;
      totalDay30Retained += day30Retained; 
      totalRevenue += rev;
      totalOrders += ord;

      const repeatRate = users > 0 ? Number(((repeatUsers / users) * 100).toFixed(2)) : 0;
      const avgLTV = users > 0 ? Number((rev / users).toFixed(2)) : 0;
      const day30Retention = users > 0 ? Number(((day30Retained / users) * 100).toFixed(2)) : 0;

      data.push({
        cohort,
        newUsers: users,
        repeatUsers,
        repeatRate,
        avgLTV,
        day30Retention,
      });
    }

    data.sort((a, b) => b.cohort.localeCompare(a.cohort));

    const overallRepeatRate =
      totalUsers > 0 ? Number(((totalRepeatUsers / totalUsers) * 100).toFixed(2)) : 0;
    const overallAvgLTV = totalUsers > 0 ? Number((totalRevenue / totalUsers).toFixed(2)) : 0;
    const overallDay30Retention = 
      totalUsers > 0 ? Number(((totalDay30Retained / totalUsers) * 100).toFixed(2)) : 0; 

    const result: CustomerReportResponse = {
      data,
      totals: {
        newUsers: totalUsers,
        repeatUsers: totalRepeatUsers,
        repeatRate: overallRepeatRate,
        avgLTV: overallAvgLTV,
        day30Retention: overallDay30Retention,
      },
      generatedAt: new Date().toISOString(),
    };

    // ✅ FIX 3: Safe caching using safeStringify
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`💾 Customer Report cached (5 min TTL): ${slug}`);
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache customer report:", cacheError);
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error(`❌ Customer Report Error (${slug}):`, error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch customer report data.",
    };
  }
}