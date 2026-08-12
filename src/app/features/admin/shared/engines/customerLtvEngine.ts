// 📂 src/app/features/admin/shared/engines/customerLtvEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import { Types } from "mongoose";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================

// 1. RFM User & Segment Types
export interface UnifiedRfmUser {
  userId: string;
  email: string;
  name: string;
  recency: number;
  frequency: number;
  monetary: number;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  segment: string;
}

export interface UnifiedRfmSegmentSummary {
  segment: string;
  count: number;
  percentage: number;
}

export interface UnifiedRfmResponse {
  segments: UnifiedRfmSegmentSummary[];
  users: UnifiedRfmUser[];
  totalUsers: number;
  generatedAt: string;
}

// 2. Inactive Customer Types
export interface UnifiedInactiveCustomer {
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

export interface UnifiedInactiveResponse {
  customers: UnifiedInactiveCustomer[];
  totalDocs: number;
  totalPages: number;
  summary: {
    totalInactive: number;
    highValue: number;
    mediumValue: number;
    lowValue: number;
  };
}

// 3. Cohort LTV Types
export interface UnifiedCohortLtvItem {
  cohort: string;
  newUsers: number;
  repeatUsers: number;
  repeatRate: number;
  avgLTV: number;
  day30Retention: number;
}

export interface UnifiedCohortLtvResponse {
  data: UnifiedCohortLtvItem[];
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
// 🔧 HELPERS (RFM MATRIX)
// ================================================================
function getSegmentName(r: number, f: number, m: number): string {
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 3 && f >= 3 && m >= 3) return "Loyal Customers";
  if (r >= 4 && f <= 2 && m <= 2) return "Potential Loyalists";
  if (r <= 2 && f >= 3 && m >= 3) return "At Risk";
  if (r <= 2 && f >= 2 && m >= 2) return "Hibernating";
  if (r <= 2 && f <= 2 && m <= 2) return "Lost";
  if (r >= 4 && f === 1 && m <= 2) return "New Customers";
  return "Others";
}

function assignScore(value: number, p20: number, p40: number, p60: number, p80: number): number {
  if (value <= p20) return 1;
  if (value <= p40) return 2;
  if (value <= p60) return 3;
  if (value <= p80) return 4;
  return 5;
}

function assignRecencyScore(value: number, p20: number, p40: number, p60: number, p80: number): number {
  if (value <= p20) return 5;
  if (value <= p40) return 4;
  if (value <= p60) return 3;
  if (value <= p80) return 2;
  return 1;
}

// ================================================================
// 🚀 ENGINE 1: RFM CUSTOMER SEGMENTATION
// ================================================================
export async function buildRfmSegmentsMatrix(params: {
  segmentFilter?: string;
  page?: number;
  limit?: number;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<UnifiedRfmResponse> {
  await connectMongoose();

  const { segmentFilter, page = 1, limit = 20, range } = params;

  const matchQuery: any = { status: { $in: REVENUE_STATUSES } };
  if (range?.startDate && range?.endDate) {
    matchQuery.createdAt = { $gte: range.startDate, $lte: range.endDate };
  }

  const rawUsers = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$userId",
        lastOrderDate: { $max: "$createdAt" },
        frequency: { $sum: 1 },
        monetary: { $sum: "$totalPrice" },
      },
    },
    {
      $addFields: {
        recency: {
          $ceil: {
            $divide: [{ $subtract: [new Date(), "$lastOrderDate"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
  ]);

  if (rawUsers.length === 0) {
    return {
      segments: [],
      users: [],
      totalUsers: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const rawUserIds = rawUsers.map((u: any) => u._id).filter(Boolean);
  const validUserObjectIds = rawUserIds.filter((id) => Types.ObjectId.isValid(String(id)));

  let userMap = new Map<string, { name: string; email: string }>();

  if (validUserObjectIds.length > 0) {
    try {
      const users = (await User.find(
        { _id: { $in: validUserObjectIds } },
        { name: 1, email: 1 }
      ).lean()) as any[];

      userMap = new Map(
        users.map((u) => [
          u._id.toString(),
          { name: u.name || "Customer #" + u._id.toString().slice(-6), email: u.email || "No email" },
        ])
      );
    } catch (e) {
      console.warn("⚠️ Failed to batch fetch user details for RFM:", e);
    }
  }

  const sortedRec = rawUsers.map((u: any) => u.recency).sort((a: number, b: number) => a - b);
  const sortedFreq = rawUsers.map((u: any) => u.frequency).sort((a: number, b: number) => a - b);
  const sortedMon = rawUsers.map((u: any) => u.monetary).sort((a: number, b: number) => a - b);

  const getPercentile = (arr: number[], p: number): number => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, Math.min(index, arr.length - 1))];
  };

  const p20Rec = getPercentile(sortedRec, 20);
  const p40Rec = getPercentile(sortedRec, 40);
  const p60Rec = getPercentile(sortedRec, 60);
  const p80Rec = getPercentile(sortedRec, 80);

  const p20Freq = getPercentile(sortedFreq, 20);
  const p40Freq = getPercentile(sortedFreq, 40);
  const p60Freq = getPercentile(sortedFreq, 60);
  const p80Freq = getPercentile(sortedFreq, 80);

  const p20Mon = getPercentile(sortedMon, 20);
  const p40Mon = getPercentile(sortedMon, 40);
  const p60Mon = getPercentile(sortedMon, 60);
  const p80Mon = getPercentile(sortedMon, 80);

  const scoredUsers: UnifiedRfmUser[] = rawUsers.map((user: any) => {
    const userIdStr = user._id ? user._id.toString() : "N/A";
    const userInfo = userMap.get(userIdStr);

    const rScore = assignRecencyScore(user.recency, p20Rec, p40Rec, p60Rec, p80Rec);
    const fScore = assignScore(user.frequency, p20Freq, p40Freq, p60Freq, p80Freq);
    const mScore = assignScore(user.monetary, p20Mon, p40Mon, p60Mon, p80Mon);

    return {
      userId: userIdStr,
      email: userInfo?.email || "No email",
      name: userInfo?.name || "Customer #" + userIdStr.slice(-6),
      recency: user.recency,
      frequency: user.frequency,
      monetary: Math.round(user.monetary),
      recencyScore: rScore,
      frequencyScore: fScore,
      monetaryScore: mScore,
      segment: getSegmentName(rScore, fScore, mScore),
    };
  });

  const segmentCounts = new Map<string, number>();
  scoredUsers.forEach((u) => {
    segmentCounts.set(u.segment, (segmentCounts.get(u.segment) || 0) + 1);
  });

  const segments: UnifiedRfmSegmentSummary[] = Array.from(segmentCounts.entries()).map(
    ([segment, count]) => ({
      segment,
      count,
      percentage: Number(((count / scoredUsers.length) * 100).toFixed(1)),
    })
  );

  let filteredUsers = scoredUsers;
  if (segmentFilter) {
    filteredUsers = scoredUsers.filter((u) => u.segment === segmentFilter);
  }

  const totalUsers = filteredUsers.length;
  const skip = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(skip, skip + limit);

  return {
    segments,
    users: paginatedUsers,
    totalUsers,
    generatedAt: new Date().toISOString(),
  };
}

// ================================================================
// 🚀 ENGINE 2: INACTIVE / DORMANT CUSTOMERS
// ================================================================
export async function buildInactiveCustomersMatrix(params: {
  page?: number;
  limit?: number;
  segment?: "all" | "high-value" | "medium-value" | "low-value";
  searchTerm?: string;
  inactiveDays?: number;
  highValueThreshold?: number;
}): Promise<UnifiedInactiveResponse> {
  await connectMongoose();

  const page = params.page || 1;
  const limit = params.limit || 20;
  const segment = params.segment || "all";
  const searchTerm = params.searchTerm || "";
  const inactiveDays = params.inactiveDays || 60;
  const highValueThreshold = params.highValueThreshold || 5000;

  const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: { role: "customer" } },
    { $addFields: { userIdStr: { $toString: "$_id" } } },
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
    {
      $addFields: {
        totalSpend: { $sum: "$orders.totalPrice" },
        orderCount: { $size: "$orders" },
        lastOrderDate: { $max: "$orders.createdAt" },
      },
    },
    {
      $match: {
        orderCount: { $gt: 0 },
        lastOrderDate: { $lt: cutoffDate },
      },
    },
    {
      $addFields: {
        daysSinceLastOrder: {
          $ceil: {
            $divide: [{ $subtract: [new Date(), "$lastOrderDate"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
  ];

  if (segment !== "all") {
    const minSpend = segment === "high-value" ? highValueThreshold : segment === "medium-value" ? Math.ceil(highValueThreshold / 4) : 0;
    const maxSpend = segment === "high-value" ? Infinity : segment === "medium-value" ? highValueThreshold - 1 : Math.ceil(highValueThreshold / 4) - 1;
    pipeline.push({ $match: { totalSpend: { $gte: minSpend, $lte: maxSpend } } });
  }

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    pipeline.push({
      $match: {
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      },
    });
  }

  const [totalResult, customersData, summaryStats] = await Promise.all([
    User.aggregate([...pipeline, { $count: "total" }]),
    User.aggregate([
      ...pipeline,
      { $sort: { totalSpend: -1, daysSinceLastOrder: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    User.aggregate([
      ...pipeline,
      {
        $group: {
          _id: null,
          highValue: { $sum: { $cond: [{ $gte: ["$totalSpend", highValueThreshold] }, 1, 0] } },
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
          lowValue: { $sum: { $cond: [{ $lt: ["$totalSpend", Math.ceil(highValueThreshold / 4)] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const totalDocs = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(totalDocs / limit) || 1;

  const customers: UnifiedInactiveCustomer[] = customersData.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name || "Customer",
    email: c.email || "",
    phone: c.phone,
    image: c.image,
    totalSpend: Math.round(c.totalSpend || 0),
    orderCount: c.orderCount || 0,
    lastOrderDate: new Date(c.lastOrderDate).toISOString(),
    createdAt: new Date(c.createdAt).toISOString(),
    daysSinceLastOrder: c.daysSinceLastOrder || 0,
    segment: c.totalSpend >= highValueThreshold ? "high-value" : c.totalSpend >= Math.ceil(highValueThreshold / 4) ? "medium-value" : "low-value",
    reactivationEmailsSent: c.reactivationEmailCount || 0,
  }));

  const storeSummary = summaryStats[0] || { highValue: 0, mediumValue: 0, lowValue: 0 };

  return {
    customers,
    totalDocs,
    totalPages,
    summary: {
      totalInactive: totalDocs,
      highValue: storeSummary.highValue || 0,
      mediumValue: storeSummary.mediumValue || 0,
      lowValue: storeSummary.lowValue || 0,
    },
  };
}

// ================================================================
// 🚀 ENGINE 3: COHORT LTV MATRIX
// ================================================================
export async function buildCohortLtvMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedCohortLtvResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  const userCohortStats = await User.aggregate([
    { $match: { role: "customer", createdAt: { $gte: start, $lte: end } } },
    { $addFields: { userIdStr: { $toString: "$_id" } } },
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
    {
      $addFields: {
        cohortMonth: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        orderCount: { $size: "$orders" },
        totalRevenue: { $sum: "$orders.totalPrice" },
        isRepeat: { $gt: [{ $size: "$orders" }, 1] },
        repeatWithin30Days: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$orders",
                  as: "o",
                  cond: {
                    $and: [
                      { $gt: ["$$o.createdAt", { $min: "$orders.createdAt" }] },
                      { $lte: [{ $subtract: ["$$o.createdAt", { $min: "$orders.createdAt" }] }, 30 * 24 * 60 * 60 * 1000] },
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
  ]);

  const cohortMap = new Map<string, { users: number; repeatUsers: number; day30Retained: number; totalRevenue: number }>();

  for (const stat of userCohortStats) {
    const cohort = stat.cohortMonth || "Unknown";
    if (!cohortMap.has(cohort)) {
      cohortMap.set(cohort, { users: 0, repeatUsers: 0, day30Retained: 0, totalRevenue: 0 });
    }
    const dataObj = cohortMap.get(cohort)!;
    dataObj.users += 1;
    dataObj.totalRevenue += stat.totalRevenue || 0;
    if (stat.isRepeat) dataObj.repeatUsers += 1;
    if (stat.repeatWithin30Days) dataObj.day30Retained += 1;
  }

  const data: UnifiedCohortLtvItem[] = [];
  let totalUsers = 0;
  let totalRepeatUsers = 0;
  let totalDay30Retained = 0;
  let totalRevenue = 0;

  for (const [cohort, metrics] of cohortMap) {
    const { users, repeatUsers, day30Retained, totalRevenue: rev } = metrics;
    totalUsers += users;
    totalRepeatUsers += repeatUsers;
    totalDay30Retained += day30Retained;
    totalRevenue += rev;

    data.push({
      cohort,
      newUsers: users,
      repeatUsers,
      repeatRate: users > 0 ? Number(((repeatUsers / users) * 100).toFixed(1)) : 0,
      avgLTV: users > 0 ? Math.round(rev / users) : 0,
      day30Retention: users > 0 ? Number(((day30Retained / users) * 100).toFixed(1)) : 0,
    });
  }

  data.sort((a, b) => b.cohort.localeCompare(a.cohort));

  return {
    data,
    totals: {
      newUsers: totalUsers,
      repeatUsers: totalRepeatUsers,
      repeatRate: totalUsers > 0 ? Number(((totalRepeatUsers / totalUsers) * 100).toFixed(1)) : 0,
      avgLTV: totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0,
      day30Retention: totalUsers > 0 ? Number(((totalDay30Retained / totalUsers) * 100).toFixed(1)) : 0,
    },
    generatedAt: new Date().toISOString(),
  };
}