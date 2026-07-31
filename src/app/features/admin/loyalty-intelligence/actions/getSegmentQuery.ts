// 📂 src/app/features/admin/loyalty-intelligence/actions/getSegmentQuery.ts (HARDENED & NOSQL SANITIZED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { verifyStaff } from "@/lib/payloadAuth";
import { FilterCondition, SegmentGroup } from "@/models/SegmentDefinition";
import SegmentDefinition from "@/models/SegmentDefinition";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface SegmentResult {
  userIds: string[];
  totalCount: number;
  users?: any[];
}

export interface PaginatedSegmentResult {
  users: any[];
  totalDocs: number;
  totalPages: number;
  totalSegmentSpend?: number; // Total Lifetime PKR Spend of Segment
  segmentName?: string;
  lastRunAt?: Date;
}

// ================================================================
// 🔧 HELPER: Sanitize field name against NoSQL Injection
// ================================================================
function sanitizeFieldName(field: string): string {
  if (!field || typeof field !== "string") return "unknown";
  const clean = field.trim();
  // Reject MongoDB operators or prototype pollution keys
  if (clean.startsWith("$") || clean.includes("__proto__") || clean.includes("constructor")) {
    console.warn(`🛡️ Security Warning: Blocked potentially malicious field name: ${field}`);
    return "invalid_field";
  }
  return clean;
}

// ================================================================
// 🔧 HELPER: Build MongoDB query from a single condition
// ================================================================
function buildConditionQuery(condition: FilterCondition): Record<string, any> {
  const { field, operator, value } = condition;
  const safeField = sanitizeFieldName(field);

  if (safeField === "invalid_field") {
    return {};
  }

  switch (operator) {
    case "equals":
      return { [safeField]: value };
    case "not_equals":
      return { [safeField]: { $ne: value } };
    case "greater_than":
      return { [safeField]: { $gt: value } };
    case "less_than":
      return { [safeField]: { $lt: value } };
    case "greater_than_equal":
      return { [safeField]: { $gte: value } };
    case "less_than_equal":
      return { [safeField]: { $lte: value } };
    case "contains":
      return { [safeField]: { $regex: value as string, $options: "i" } };
    case "not_contains":
      return { [safeField]: { $not: { $regex: value as string, $options: "i" } } };
    case "in":
      return { [safeField]: { $in: value as any[] } };
    case "not_in":
      return { [safeField]: { $nin: value as any[] } };
    case "exists":
      return { [safeField]: { $exists: value as boolean } };
    default:
      return {};
  }
}

// ================================================================
// 🔧 HELPER: Recursively build query from SegmentGroup
// ================================================================
function buildMongoQuery(group: SegmentGroup): Record<string, any> {
  const conditions: Record<string, any>[] = [];

  for (const condition of group.conditions) {
    conditions.push(buildConditionQuery(condition));
  }

  if (group.groups) {
    for (const nestedGroup of group.groups) {
      conditions.push(buildMongoQuery(nestedGroup as SegmentGroup));
    }
  }

  if (conditions.length === 0) {
    return {};
  }

  if (group.logic === "AND") {
    return { $and: conditions };
  } else {
    return { $or: conditions };
  }
}

// ================================================================
// 🔧 HELPER: Build aggregation pipeline with user metadata
// ================================================================
function buildSegmentPipeline(
  query: Record<string, any>,
  page: number,
  limit: number,
  includeUserData: boolean = false
): any[] {
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    // Match customer role
    { $match: { role: "customer" } },

    // Convert _id (ObjectId) to String to join with Order.userId (String)
    {
      $addFields: {
        userIdStr: { $toString: "$_id" },
      },
    },

    // ✅ CRITICAL FIX: Lookup ONLY valid sales orders matching REVENUE_STATUSES
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

    // Compute order stats from valid sales orders only
    {
      $addFields: {
        totalSpend: { $sum: "$orders.totalPrice" },
        orderCount: { $size: "$orders" },
        lastOrderDate: { $max: "$orders.createdAt" },
      },
    },

    // Post-Pipeline $match applies segment rules (totalSpend, orderCount, etc.)
    ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),

    // Project needed fields
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
        referralCode: 1,
        referredBy: 1,
        ...(includeUserData ? { addresses: 1 } : {}),
      },
    },

    // Sorting: high-value first
    { $sort: { totalSpend: -1 } },

    // Pagination
    { $skip: skip },
    { $limit: limit },
  ];

  return pipeline;
}

// ================================================================
// 🚀 MAIN ACTION: Execute segment query (WITH CACHE)
// ================================================================
export async function getSegmentQuery(
  segmentGroup: SegmentGroup,
  page: number = 1,
  limit: number = 20,
  includeUserData: boolean = false
): Promise<PaginatedSegmentResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    const cacheKey = `segment_query:${JSON.stringify(segmentGroup)}:page_${page}:limit_${limit}`;

    // 1. CHECK CACHE
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedSegmentResult>(cached);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Segment Query (Page ${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Segment Query cache read failed:", cacheError);
    }

    await connectMongoose();

    const query = buildMongoQuery(segmentGroup);
    const pipeline = buildSegmentPipeline(query, page, limit, includeUserData);
    
    // Count & Total Segment Spend Pipeline (Whitelisted orders)
    const countPipeline = [
      { $match: { role: "customer" } },
      {
        $addFields: {
          userIdStr: { $toString: "$_id" },
        },
      },
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
        },
      },
      ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSegmentSpend: { $sum: "$totalSpend" },
        },
      },
    ];

    // Execute in parallel
    const [usersResult, countResult] = await Promise.all([
      User.aggregate(pipeline),
      User.aggregate(countPipeline),
    ]);

    const totalDocs = countResult[0]?.total || 0;
    const totalSegmentSpend = Math.round(countResult[0]?.totalSegmentSpend || 0);
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    // Map result
    const users = usersResult.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name || "Customer #" + user._id.toString().slice(-6),
      email: user.email || "No email",
      phone: user.phone || undefined,
      image: user.image || undefined,
      totalSpend: Math.round(user.totalSpend || 0),
      orderCount: user.orderCount || 0,
      lastOrderDate: user.lastOrderDate
        ? new Date(user.lastOrderDate).toISOString()
        : null,
      createdAt: new Date(user.createdAt).toISOString(),
      referralCode: user.referralCode || null,
      ...(includeUserData && { addresses: user.addresses || [] }),
    }));

    const result: PaginatedSegmentResult = {
      users,
      totalDocs,
      totalPages,
      totalSegmentSpend,
    };

    // 2. WRITE CACHE
    try {
      const stringified = safeStringify(result);
      await redis.set(cacheKey, stringified, { ex: 300 });
    } catch (cacheError) {
      console.warn("⚠️ Segment Query cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("Failed to execute segment query:", error.message);
    return {
      users: [],
      totalDocs: 0,
      totalPages: 0,
      totalSegmentSpend: 0,
    };
  }
}

// ================================================================
// 🔄 ACTION: Get segment by ID and execute it
// ================================================================
export async function getSegmentByIdAndExecute(
  segmentId: string,
  page: number = 1,
  limit: number = 20,
  includeUserData: boolean = false
): Promise<PaginatedSegmentResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    await connectMongoose();

    const segment = await SegmentDefinition.findById(segmentId);
    if (!segment) {
      return { users: [], totalDocs: 0, totalPages: 0, totalSegmentSpend: 0 };
    }

    const result = await getSegmentQuery(
      segment.filters,
      page,
      limit,
      includeUserData
    );

    segment.lastRunAt = new Date();
    segment.lastRunCount = result.totalDocs;
    await segment.save();

    return {
      ...result,
      segmentName: segment.name,
      lastRunAt: segment.lastRunAt,
    };
  } catch (error: any) {
    console.error("Failed to execute segment by ID:", error.message);
    return {
      users: [],
      totalDocs: 0,
      totalPages: 0,
      totalSegmentSpend: 0,
    };
  }
}