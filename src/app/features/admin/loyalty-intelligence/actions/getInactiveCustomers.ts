// 📂 src/app/features/admin/loyalty-intelligence/actions/getInactiveCustomers.ts (STATUS WHITELIST HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { subDays } from "date-fns";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface InactiveCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate: string;
  createdAt: string;
  daysSinceLastOrder: number;
  segment: "high-value" | "medium-value" | "low-value";
  reactivationEmailsSent: number;
}

export interface PaginatedInactiveCustomersResult {
  customers: InactiveCustomer[];
  totalDocs: number;
  totalPages: number;
  summary: {
    totalInactive: number;
    highValue: number;
    mediumValue: number;
    lowValue: number;
  };
}

// ================================================================
// 🔧 HELPERS
// ================================================================
function getSegment(
  totalSpend: number,
  highValueThreshold: number
): "high-value" | "medium-value" | "low-value" {
  if (totalSpend >= highValueThreshold) return "high-value";
  if (totalSpend >= Math.ceil(highValueThreshold / 4)) return "medium-value";
  return "low-value";
}

// ================================================================
// 🚀 MAIN ACTION — Status Whitelisted
// ================================================================
export async function getInactiveCustomers({
  page = 1,
  limit = 20,
  segment = "all",
  searchTerm = "",
}: {
  page?: number;
  limit?: number;
  segment?: "all" | "high-value" | "medium-value" | "low-value";
  searchTerm?: string;
}): Promise<PaginatedInactiveCustomersResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    let settings: any = {};
    try {
      settings = await getCachedSettings();
    } catch (e) {
      settings = {};
    }

    const inactiveDays = settings?.inactiveDaysThreshold || 60;
    const highValueThreshold = settings?.highValueInactiveThreshold || 5000;

    const cacheKey = `analytics_inactive_customers_v3:page_${page}:limit_${limit}:segment_${segment}:search_${searchTerm || "none"}`;

    // 1. CACHE CHECK
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`⚡ Redis Cache Hit: Inactive Customers (Page ${page})`);
        const parsed = safeParse<PaginatedInactiveCustomersResult>(cached as string | null);
        if (parsed) return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Inactive Customers cache read failed:", cacheError);
    }

    await connectMongoose();

    const cutoffDate = subDays(new Date(), inactiveDays);
    const skip = (page - 1) * limit;

    // 2. Build Aggregation Pipeline
    const pipeline: any[] = [
      // Match only customer roles
      { $match: { role: "customer" } },

      // Convert _id to string BEFORE $lookup so Order.userId matches 100%
      {
        $addFields: {
          userIdStr: { $toString: "$_id" },
        },
      },

      // ✅ CRITICAL FIX: Lookup ONLY orders in REVENUE_STATUSES (Excludes Cancelled/Rejected)
      {
        $lookup: {
          from: "orders",
          let: { uId: "$userIdStr" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$uId"] },
                status: { $in: REVENUE_STATUSES },
              },
            },
          ],
          as: "orders",
        },
      },

      // Calculate order stats purely from valid sales orders
      {
        $addFields: {
          totalSpend: { $sum: "$orders.totalPrice" },
          orderCount: { $size: "$orders" },
          lastOrderDate: { $max: "$orders.createdAt" },
        },
      },

      // Filter: has at least one valid sales order AND last valid purchase < cutoff
      {
        $match: {
          orderCount: { $gt: 0 },
          lastOrderDate: { $lt: cutoffDate },
        },
      },

      // Calculate days since last valid order
      {
        $addFields: {
          daysSinceLastOrder: {
            $ceil: {
              $divide: [
                { $subtract: [new Date(), "$lastOrderDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    ];

    // Apply segment filter
    if (segment !== "all") {
      const minSpend =
        segment === "high-value"
          ? highValueThreshold
          : segment === "medium-value"
          ? Math.ceil(highValueThreshold / 4)
          : 0;
      const maxSpend =
        segment === "high-value"
          ? Infinity
          : segment === "medium-value"
          ? highValueThreshold - 1
          : Math.ceil(highValueThreshold / 4) - 1;

      pipeline.push({
        $match: {
          totalSpend: { $gte: minSpend, $lte: maxSpend },
        },
      });
    }

    // Apply search term
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), "i");
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
          ],
        },
      });
    }

    // 3. Pagination & Aggregations
    const [totalResult, customersData, summaryStats] = await Promise.all([
      User.aggregate([...pipeline, { $count: "total" }]),
      User.aggregate([
        ...pipeline,
        { $sort: { totalSpend: -1, daysSinceLastOrder: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            image: 1,
            totalSpend: 1,
            orderCount: 1,
            lastOrderDate: 1,
            createdAt: 1,
            daysSinceLastOrder: 1,
            reactivationEmailCount: 1,
          },
        },
      ]),
      User.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            highValue: {
              $sum: { $cond: [{ $gte: ["$totalSpend", highValueThreshold] }, 1, 0] },
            },
            mediumValue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ["$totalSpend", highValueThreshold] },
                      { $gte: ["$totalSpend", Math.ceil(highValueThreshold / 4)] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            lowValue: {
              $sum: {
                $cond: [{ $lt: ["$totalSpend", Math.ceil(highValueThreshold / 4)] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const totalDocs = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    // 4. Map to DTO
    const customers: InactiveCustomer[] = customersData.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      image: c.image,
      totalSpend: c.totalSpend || 0,
      orderCount: c.orderCount || 0,
      lastOrderDate: new Date(c.lastOrderDate).toISOString(),
      createdAt: new Date(c.createdAt).toISOString(),
      daysSinceLastOrder: c.daysSinceLastOrder || 0,
      segment: getSegment(c.totalSpend || 0, highValueThreshold),
      reactivationEmailsSent: c.reactivationEmailCount || 0,
    }));

    // 5. Store-wide Summary
    const storeSummary = summaryStats[0] || { highValue: 0, mediumValue: 0, lowValue: 0 };
    const summary = {
      totalInactive: totalDocs,
      highValue: storeSummary.highValue || 0,
      mediumValue: storeSummary.mediumValue || 0,
      lowValue: storeSummary.lowValue || 0,
    };

    const result: PaginatedInactiveCustomersResult = {
      customers,
      totalDocs,
      totalPages,
      summary,
    };

    // 6. Cache for 5 minutes
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
    } catch (cacheError) {
      console.warn("⚠️ Inactive Customers cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("Failed to fetch inactive customers:", error.message);
    return {
      customers: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { totalInactive: 0, highValue: 0, mediumValue: 0, lowValue: 0 },
    };
  }
}

// ================================================================
// 🔄 ACTION: Send Reactivation Email (Bulk)
// ================================================================
export async function sendReactivationEmail(
  userIds: string[],
  subject?: string,
  customMessage?: string
): Promise<{ success: boolean; sentCount: number; message: string }> {
  try {
    await verifyStaff(["admin", "manager"]);

    if (!userIds || userIds.length === 0) {
      return { success: false, sentCount: 0, message: "No customers selected." };
    }

    await connectMongoose();

    let settings: any = {};
    try {
      settings = await getCachedSettings();
    } catch (e) {
      settings = {};
    }

    const emailTemplate = settings?.reactivationEmailTemplate || 
      "Hi {{name}}, we miss you! Here's a special {{coupon}} off your next order. Click {{link}} to shop now.";

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      {
        $set: {
          lastReactivationEmailSent: new Date(),
        },
        $inc: {
          reactivationEmailCount: 1,
        },
      }
    );

    console.log(`📧 Reactivation emails dispatched to ${result.modifiedCount} customers. Template: ${emailTemplate.slice(0, 30)}...`);

    return {
      success: true,
      sentCount: result.modifiedCount,
      message: `Reactivation emails sent to ${result.modifiedCount} customers.`,
    };
  } catch (error: any) {
    console.error("Failed to send reactivation emails:", error.message);
    return { success: false, sentCount: 0, message: error.message };
  }
}