// 📂 src/app/features/admin/marketing/actions/getRFMSegments.ts (FULLY CORRECTED RFM LOGIC & USER-JOINED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import User from "@/models/User"; // ✅ Imported User model for customer name & email joins
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface RFMUser {
  userId: string;
  email: string;      // ✅ Real Customer Email
  name: string;       // ✅ Real Customer Name
  recency: number;    // days since last order
  frequency: number;  // total orders
  monetary: number;   // total spend
  recencyScore: number;   // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number;  // 1-5
  segment: string;    // "Champions", "Loyal Customers", etc.
}

export interface RFMSegmentSummary {
  segment: string;
  count: number;
  percentage: number;
}

export interface RFMSegmentsResponse {
  segments: RFMSegmentSummary[];
  users: RFMUser[];
  totalUsers: number;
  generatedAt: string;
  cacheTTL: number; // remaining seconds
}

// ================================================================
// 🔧 HELPERS (RFM SEGMENTATION MATRIX)
// ================================================================

// Map RFM scores to segment names
function getSegmentName(r: number, f: number, m: number): string {
  // High value segments
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 3 && f >= 3 && m >= 3) return "Loyal Customers";
  if (r >= 4 && f <= 2 && m <= 2) return "Potential Loyalists";
  
  // At Risk / Churn
  if (r <= 2 && f >= 3 && m >= 3) return "At Risk";
  if (r <= 2 && f >= 2 && m >= 2) return "Hibernating";
  
  // Lost
  if (r <= 2 && f <= 2 && m <= 2) return "Lost";
  
  // New / Others
  if (r >= 4 && f === 1 && m <= 2) return "New Customers";
  
  return "Others";
}

// Assign scores for Frequency & Monetary (Higher = Better Score)
function assignScore(value: number, p20: number, p40: number, p60: number, p80: number): number {
  if (value <= p20) return 1;
  if (value <= p40) return 2;
  if (value <= p60) return 3;
  if (value <= p80) return 4;
  return 5;
}

// ✅ ENTERPRISE FIX: Assign scores for Recency (Lower Days = Better Score)
function assignRecencyScore(value: number, p20: number, p40: number, p60: number, p80: number): number {
  if (value <= p20) return 5; // Bought very recently = Best score (5)
  if (value <= p40) return 4;
  if (value <= p60) return 3;
  if (value <= p80) return 2;
  return 1;                   // Bought a long time ago = Worst score (1)
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getRFMSegments({
  segmentFilter,
  page = 1,
  limit = 20,
}: {
  segmentFilter?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  success: boolean;
  data?: RFMSegmentsResponse;
  error?: string;
}> {
  const cacheKey = "analytics_rfm_summary";

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Check Main Cache (Type-Safe with safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<RFMSegmentsResponse>(cachedData as string | null);
    if (parsed) {
      const ttl = await redis.ttl(cacheKey);
      console.log("⚡ Redis Cache Hit: RFM Segments");
      return {
        success: true,
        data: {
          ...parsed,
          cacheTTL: ttl > 0 ? ttl : 0,
        },
      };
    }

    // 2. Cache Miss → Run Heavy Aggregation
    await connectMongoose();

    // 2a. Aggregation Pipeline (Aligned with REVENUE_STATUSES)
    const rawUsers = await Order.aggregate([
      {
        $match: {
          status: { $in: REVENUE_STATUSES }, // ✅ Matches REVENUE_STATUSES Whitelist (includes active COD)
        },
      },
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
              $divide: [
                { $subtract: [new Date(), "$lastOrderDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          recency: 1,
          frequency: 1,
          monetary: 1,
        },
      },
    ]);

    if (rawUsers.length === 0) {
      return {
        success: true,
        data: {
          segments: [],
          users: [],
          totalUsers: 0,
          generatedAt: new Date().toISOString(),
          cacheTTL: 0,
        },
      };
    }

    // 3. Batch Fetch Customer Names & Emails (No Raw IDs)
    const userIds = rawUsers.map((u: any) => u._id).filter(Boolean);
    let userMap = new Map<string, { name: string; email: string }>();

    if (userIds.length > 0) {
      try {
        const users = (await User.find(
          { _id: { $in: userIds } },
          { name: 1, email: 1 }
        ).lean()) as any[] as { _id: any; name?: string; email?: string }[];

        userMap = new Map(
          users.map((u) => [
            u._id.toString(),
            { name: u.name || "Customer #" + u._id.toString().slice(-6), email: u.email || "No email" },
          ])
        );
      } catch (userError) {
        console.warn("⚠️ Failed to batch fetch user details for RFM:", userError);
      }
    }

    // 4. Calculate Percentiles (20, 40, 60, 80)
    const sortedRecency = rawUsers.map((u: any) => u.recency).sort((a: number, b: number) => a - b);
    const sortedFrequency = rawUsers.map((u: any) => u.frequency).sort((a: number, b: number) => a - b);
    const sortedMonetary = rawUsers.map((u: any) => u.monetary).sort((a: number, b: number) => a - b);

    const getPercentile = (arr: number[], p: number): number => {
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, Math.min(index, arr.length - 1))];
    };

    const p20Rec = getPercentile(sortedRecency, 20);
    const p40Rec = getPercentile(sortedRecency, 40);
    const p60Rec = getPercentile(sortedRecency, 60);
    const p80Rec = getPercentile(sortedRecency, 80);

    const p20Freq = getPercentile(sortedFrequency, 20);
    const p40Freq = getPercentile(sortedFrequency, 40);
    const p60Freq = getPercentile(sortedFrequency, 60);
    const p80Freq = getPercentile(sortedFrequency, 80);

    const p20Mon = getPercentile(sortedMonetary, 20);
    const p40Mon = getPercentile(sortedMonetary, 40);
    const p60Mon = getPercentile(sortedMonetary, 60);
    const p80Mon = getPercentile(sortedMonetary, 80);

    // 5. Score & Segment Each User
    const scoredUsers: RFMUser[] = rawUsers.map((user: any) => {
      const userIdStr = user._id ? user._id.toString() : "N/A";
      const userInfo = userMap.get(userIdStr);

      // ✅ ENTERPRISE FIX: Use inverted assignRecencyScore for recency
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

    // 6. Build Segment Summary
    const segmentCounts = new Map<string, number>();
    scoredUsers.forEach((u) => {
      segmentCounts.set(u.segment, (segmentCounts.get(u.segment) || 0) + 1);
    });

    const segments: RFMSegmentSummary[] = Array.from(segmentCounts.entries()).map(
      ([segment, count]) => ({
        segment,
        count,
        percentage: Number(((count / scoredUsers.length) * 100).toFixed(1)),
      })
    );

    const segmentOrder = [
      "Champions",
      "Loyal Customers",
      "Potential Loyalists",
      "At Risk",
      "Hibernating",
      "Lost",
      "New Customers",
      "Others",
    ];
    segments.sort((a, b) => {
      const idxA = segmentOrder.indexOf(a.segment);
      const idxB = segmentOrder.indexOf(b.segment);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    // 7. Filter users by segment (if provided)
    let filteredUsers = scoredUsers;
    if (segmentFilter) {
      filteredUsers = scoredUsers.filter((u) => u.segment === segmentFilter);
    }

    // 8. Paginate
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    const response: RFMSegmentsResponse = {
      segments,
      users: paginatedUsers,
      totalUsers,
      generatedAt: new Date().toISOString(),
      cacheTTL: 86400,
    };

    // 9. Cache Full Response safely with safeStringify
    try {
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 86400 });
      console.log("💾 RFM Data Cached (24h TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Failed to cache RFM data:", cacheError);
    }

    return {
      success: true,
      data: {
        ...response,
        cacheTTL: 86400,
      },
    };
  } catch (error: any) {
    console.error("❌ RFM Engine Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to generate RFM segments.",
    };
  }
}