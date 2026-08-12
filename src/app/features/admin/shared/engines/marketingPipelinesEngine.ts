// 📂 src/app/features/admin/shared/engines/marketingPipelinesEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import AbandonedCart from "@/models/AbandonedCart";
import User from "@/models/User";
import Order from "@/models/Order";
import { Types } from "mongoose";
import { subHours, subDays, startOfDay, endOfDay } from "date-fns";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================

// 1. Abandoned Cart Types
export interface UnifiedAbandonedCartItem {
  _id: string;
  sessionId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  itemsCount: number;
  subtotal: number;
  lastUpdated: string;
  isRecovered: boolean;
  createdAt: string;
  customerName?: string;
}

export interface UnifiedAbandonedCartResponse {
  carts: UnifiedAbandonedCartItem[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    totalAbandonedRevenue: number;
    olderThan24h: number;
    olderThan48h: number;
    hasEmail: number;
  };
}

// 2. Welcome Candidate Types
export interface UnifiedWelcomeCandidateItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  hoursSinceSignup: number;
  hasOrder: boolean;
}

export interface UnifiedWelcomeCandidateResponse {
  candidates: UnifiedWelcomeCandidateItem[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    pendingConversions: number;
    alreadyConverted: number;
    hasEmail: number;
    hasPhone: number;
  };
}

// 3. Winback Candidate Types
export interface UnifiedWinbackCandidateItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  segment: "high-value" | "medium-value" | "low-value";
}

export interface UnifiedWinbackCandidateResponse {
  candidates: UnifiedWinbackCandidateItem[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    totalWinbackPotentialRevenue: number;
    highValue: number;
    mediumValue: number;
    lowValue: number;
    hasEmail: number;
  };
}

// Segment Value Helper
function getWinbackSegment(
  totalSpend: number,
  highValueThreshold: number = 5000
): "high-value" | "medium-value" | "low-value" {
  if (totalSpend >= highValueThreshold) return "high-value";
  if (totalSpend >= highValueThreshold / 4) return "medium-value";
  return "low-value";
}

// ================================================================
// 🚀 ENGINE 1: ABANDONED CARTS MATRIX
// ================================================================
export async function buildAbandonedCartsMatrix(params: {
  page?: number;
  limit?: number;
  minAgeHours?: number;
  searchTerm?: string;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<UnifiedAbandonedCartResponse> {
  await connectMongoose();

  // ✅ FIX: Strict Fallbacks to satisfy TypeScript compiler
  const page = params.page ?? 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const minAgeHours = params.minAgeHours ?? 2;
  const searchTerm = params.searchTerm ?? "";
  const range = params.range;

  const cutoffDate = subHours(new Date(), minAgeHours);
  const start = range?.startDate ? startOfDay(new Date(range.startDate)) : null;
  const end = range?.endDate ? endOfDay(new Date(range.endDate)) : cutoffDate;

  const skip = (page - 1) * limit;

  const query: any = {
    isRecovered: false,
    lastUpdated: start ? { $gte: start, $lte: end } : { $lt: cutoffDate },
  };

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    query.$or = [
      { email: searchRegex },
      { phone: searchRegex },
      { sessionId: searchRegex },
      { userId: searchTerm },
    ];
  }

  const [carts, totalDocs] = await Promise.all([
    AbandonedCart.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AbandonedCart.countDocuments(query),
  ]);

  const rawUserIds = carts.map((c) => c.userId).filter(Boolean);
  const validUserObjectIds = rawUserIds.filter((id) => Types.ObjectId.isValid(String(id)));

  let userMap = new Map<string, { name: string; email: string; phone?: string }>();

  if (validUserObjectIds.length > 0) {
    try {
      const users = (await User.find(
        { _id: { $in: validUserObjectIds } },
        { name: 1, email: 1, phone: 1 }
      ).lean()) as any[];

      userMap = new Map(users.map((u) => [u._id.toString(), u]));
    } catch (e) {
      console.warn("⚠️ Failed to batch fetch user details for abandoned carts:", e);
    }
  }

  const cartSummaries: UnifiedAbandonedCartItem[] = carts.map((cart: any) => {
    const user = cart.userId ? userMap.get(cart.userId.toString()) : null;

    return {
      _id: cart._id.toString(),
      sessionId: cart.sessionId,
      userId: cart.userId ? cart.userId.toString() : null,
      email: user?.email || cart.email || null,
      phone: user?.phone || cart.phone || null,
      customerName: user?.name || undefined,
      itemsCount: cart.items?.length || 0,
      subtotal: Math.round(cart.subtotal || 0),
      lastUpdated: new Date(cart.lastUpdated).toISOString(),
      isRecovered: cart.isRecovered || false,
      createdAt: new Date(cart.createdAt).toISOString(),
    };
  });

  const now = new Date();
  const date24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const date48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const { lastUpdated: _ignored, ...baseQuery } = query;

  const [olderThan24h, olderThan48h, hasEmail, revenueAgg] = await Promise.all([
    AbandonedCart.countDocuments({ ...baseQuery, lastUpdated: { $lt: date24h } }),
    AbandonedCart.countDocuments({ ...baseQuery, lastUpdated: { $lt: date48h } }),
    AbandonedCart.countDocuments({ ...query, email: { $exists: true, $nin: [null, ""] } }),
    AbandonedCart.aggregate([
      { $match: query },
      { $group: { _id: null, totalLost: { $sum: "$subtotal" } } },
    ]),
  ]);

  const totalAbandonedRevenue = Math.round(revenueAgg[0]?.totalLost || 0);

  return {
    carts: cartSummaries,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit) || 1,
    summary: {
      total: totalDocs,
      totalAbandonedRevenue,
      olderThan24h,
      olderThan48h,
      hasEmail,
    },
  };
}

// ================================================================
// 🚀 ENGINE 2: WELCOME CANDIDATES MATRIX
// ================================================================
export async function buildWelcomeCandidatesMatrix(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minAgeHours?: number;
  maxAgeHours?: number;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<UnifiedWelcomeCandidateResponse> {
  await connectMongoose();

  // ✅ FIX: Strict Fallbacks
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const searchTerm = params.searchTerm ?? "";
  const minAgeHours = params.minAgeHours ?? 0;
  const maxAgeHours = params.maxAgeHours ?? 48;
  const range = params.range;

  const skip = (page - 1) * limit;

  const query: any = { role: "customer" };

  if (range?.startDate && range?.endDate) {
    const start = startOfDay(new Date(range.startDate));
    const end = endOfDay(new Date(range.endDate));
    query.createdAt = { $gte: start, $lte: end };
  } else {
    const cutoffDate = subHours(new Date(), maxAgeHours);
    const minCutoffDate = minAgeHours > 0 ? subHours(new Date(), minAgeHours) : new Date();
    query.createdAt = { $gte: cutoffDate };
    if (minAgeHours > 0) {
      query.createdAt.$lte = minCutoffDate;
    }
  }

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  // ✅ FIX: Explicitly cast generic return of lean() to avoid 'unknown' compiler error
  const [users, totalDocs, allNewUsers] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as Promise<any[]>,
    User.countDocuments(query),
    User.find(query, { _id: 1, email: 1, phone: 1 }).lean() as Promise<any[]>,
  ]);

  if (users.length === 0) {
    return {
      candidates: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, pendingConversions: 0, alreadyConverted: 0, hasEmail: 0, hasPhone: 0 },
    };
  }

  const userIds = users.map((u: any) => u._id);
  const allUserIds = allNewUsers.map((u: any) => u._id);

  const [usersWithOrders, allUsersWithOrders] = await Promise.all([
    Order.distinct("userId", {
      userId: { $in: userIds.map((id: any) => id.toString()) },
      status: { $in: REVENUE_STATUSES },
    }),
    Order.distinct("userId", {
      userId: { $in: allUserIds.map((id: any) => id.toString()) },
      status: { $in: REVENUE_STATUSES },
    }),
  ]);

  const usersWithOrdersSet = new Set(usersWithOrders.map((id) => id.toString()));
  const allUsersWithOrdersSet = new Set(allUsersWithOrders.map((id) => id.toString()));

  const now = new Date();
  const candidates: UnifiedWelcomeCandidateItem[] = users.map((user: any) => {
    const userIdStr = user._id.toString();
    const hoursSinceSignup = Math.floor(
      (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60)
    );
    return {
      _id: userIdStr,
      name: user.name || "New Customer",
      email: user.email || "No email",
      phone: user.phone || undefined,
      createdAt: new Date(user.createdAt).toISOString(),
      hoursSinceSignup,
      hasOrder: usersWithOrdersSet.has(userIdStr),
    };
  });

  let globalHasEmail = 0;
  let globalHasPhone = 0;
  let globalAlreadyConverted = 0;
  let globalPendingConversions = 0;

  for (const u of allNewUsers) {
    const uIdStr = u._id.toString();
    if (u.email) globalHasEmail++;
    if (u.phone) globalHasPhone++;

    if (allUsersWithOrdersSet.has(uIdStr)) {
      globalAlreadyConverted++;
    } else {
      globalPendingConversions++;
    }
  }

  return {
    candidates,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit) || 1,
    summary: {
      total: totalDocs,
      pendingConversions: globalPendingConversions,
      alreadyConverted: globalAlreadyConverted,
      hasEmail: globalHasEmail,
      hasPhone: globalHasPhone,
    },
  };
}

// ================================================================
// 🚀 ENGINE 3: WINBACK CANDIDATES MATRIX
// ================================================================
export async function buildWinbackCandidatesMatrix(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  effectiveMinDays?: number;
  highValueThreshold?: number;
  range?: { startDate: Date; endDate: Date };
}): Promise<UnifiedWinbackCandidateResponse> {
  await connectMongoose();

  // ✅ FIX: Strict Fallbacks
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const searchTerm = params.searchTerm ?? "";
  const effectiveMinDays = params.effectiveMinDays ?? 60;
  const highValueThreshold = params.highValueThreshold ?? 5000;
  const range = params.range;

  const cutoffDate = range?.endDate
    ? endOfDay(new Date(range.endDate))
    : subDays(new Date(), effectiveMinDays);

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
    { $match: { "orders.0": { $exists: true } } },
    {
      $addFields: {
        totalSpend: { $sum: "$orders.totalPrice" },
        totalOrders: { $size: "$orders" },
        lastOrderDate: { $max: "$orders.createdAt" },
      },
    },
    { $match: { lastOrderDate: { $lt: cutoffDate } } },
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

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm.trim(), "i");
    pipeline.push({
      $match: {
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      },
    });
  }

  const [totalResult, candidatesData, allCandidatesData] = await Promise.all([
    User.aggregate([...pipeline, { $count: "total" }]),
    User.aggregate([
      ...pipeline,
      { $sort: { totalSpend: -1, daysSinceLastOrder: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    User.aggregate([
      ...pipeline,
      { $project: { _id: 1, email: 1, totalSpend: 1 } },
    ]),
  ]);

  const totalDocs = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(totalDocs / limit) || 1;

  const candidates: UnifiedWinbackCandidateItem[] = candidatesData.map((user: any) => ({
    _id: user._id.toString(),
    name: user.name || "Valued Customer",
    email: user.email || "No email",
    phone: user.phone || undefined,
    totalOrders: user.totalOrders || 0,
    totalSpend: Math.round(user.totalSpend || 0),
    lastOrderDate: new Date(user.lastOrderDate).toISOString(),
    daysSinceLastOrder: user.daysSinceLastOrder || 0,
    segment: getWinbackSegment(user.totalSpend || 0, highValueThreshold),
  }));

  let globalTotalLostRevenue = 0;
  let globalHighValue = 0;
  let globalMediumValue = 0;
  let globalLowValue = 0;
  let globalHasEmail = 0;

  for (const c of allCandidatesData) {
    const spend = c.totalSpend || 0;
    globalTotalLostRevenue += spend;
    if (c.email) globalHasEmail++;

    const seg = getWinbackSegment(spend, highValueThreshold);
    if (seg === "high-value") globalHighValue++;
    else if (seg === "medium-value") globalMediumValue++;
    else globalLowValue++;
  }

  return {
    candidates,
    totalDocs,
    totalPages,
    summary: {
      total: totalDocs,
      totalWinbackPotentialRevenue: Math.round(globalTotalLostRevenue),
      highValue: globalHighValue,
      mediumValue: globalMediumValue,
      lowValue: globalLowValue,
      hasEmail: globalHasEmail,
    },
  };
}