// 📂 src/app/features/admin/marketing/actions/getWinbackCandidates.ts (FULLY STRING-JOINED, GLOBAL SUMMARY & PHASE 2.2 SYNCED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { verifyStaff } from "@/lib/payloadAuth";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subDays } from "date-fns";
import { getCachedSettings } from "@/app/shared/lib/cache/settings"; // ✅ Phase 2.2 Global Settings Sync

// ✅ ENTERPRISE FIX: Safe serialization utilities imported
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface WinbackCandidate {
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

export interface PaginatedWinbackCandidatesResult {
  candidates: WinbackCandidate[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    totalWinbackPotentialRevenue: number; // ✅ Global Lost Customer Spend in PKR
    highValue: number;
    mediumValue: number;
    lowValue: number;
    hasEmail: number;
  };
}

// ================================================================
// 🔧 HELPERS (Dynamic Segment Calculator)
// ================================================================
function getSegment(
  totalSpend: number,
  highValueThreshold: number = 5000
): "high-value" | "medium-value" | "low-value" {
  if (totalSpend >= highValueThreshold) return "high-value";
  if (totalSpend >= highValueThreshold / 4) return "medium-value";
  return "low-value";
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getWinbackCandidates({
  page = 1,
  limit = 20,
  searchTerm = "",
  minInactiveDays,
  maxInactiveDays = 365,
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minInactiveDays?: number;
  maxInactiveDays?: number;
} = {}): Promise<PaginatedWinbackCandidatesResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // ✅ 1. Fetch Dynamic Settings for Phase 2.2 Thresholds
    const settings = await getCachedSettings();
    const defaultInactiveDays = settings?.inactiveDaysThreshold ?? 60;
    const highValueThreshold = settings?.highValueInactiveThreshold ?? 5000;

    const effectiveMinDays = minInactiveDays ?? defaultInactiveDays;

    const cacheKey = `analytics_winback_candidates:page_${page}:limit_${limit}:search_${searchTerm || "none"}:min_${effectiveMinDays}`;

    // 2. Check Cache (Type-Safe with safeParse)
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedWinbackCandidatesResult>(cached);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Winback Candidates (Page ${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Winback candidates cache read failed:", cacheError);
    }

    await connectMongoose();

    const cutoffDate = subDays(new Date(), effectiveMinDays);
    const skip = (page - 1) * limit;

    // ================================================================
    // 3. AGGREGATION PIPELINE (WITH $toString STRING ID JOIN FIX)
    // ================================================================
    const pipeline: any[] = [
      // Match only customers
      { $match: { role: "customer" } },

      // ✅ ENTERPRISE FIX: Convert _id (ObjectId) to String to safely join with Order.userId (String)
      {
        $addFields: {
          userIdStr: { $toString: "$_id" },
        },
      },

      // Lookup orders (Using converted string ID)
      {
        $lookup: {
          from: "orders",
          localField: "userIdStr", // ✅ FIXED: Uses string ID
          foreignField: "userId",
          as: "orders",
        },
      },

      // Filter: must have at least one order
      {
        $match: {
          "orders.0": { $exists: true },
        },
      },

      // Calculate order stats
      {
        $addFields: {
          totalSpend: { $sum: "$orders.totalPrice" },
          totalOrders: { $size: "$orders" },
          lastOrderDate: { $max: "$orders.createdAt" },
        },
      },

      // Filter: last order < cutoff date (inactive)
      {
        $match: {
          lastOrderDate: { $lt: cutoffDate },
        },
      },

      // Calculate days since last order
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

    // 4. Execute Queries (Paginated & All Unpaginated for True Global Summary)
    const [totalResult, candidatesData, allCandidatesData] = await Promise.all([
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
            totalSpend: 1,
            totalOrders: 1,
            lastOrderDate: 1,
            daysSinceLastOrder: 1,
          },
        },
      ]),
      // Fetch summary light projection for all matching winback candidates
      User.aggregate([
        ...pipeline,
        {
          $project: {
            _id: 1,
            email: 1,
            totalSpend: 1,
          },
        },
      ]),
    ]);

    const totalDocs = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    // 5. Map Paginated Candidates to DTO
    const candidates: WinbackCandidate[] = candidatesData.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name || "Valued Customer",
      email: user.email || "No email",
      phone: user.phone || undefined,
      totalOrders: user.totalOrders || 0,
      totalSpend: Math.round(user.totalSpend || 0),
      lastOrderDate: new Date(user.lastOrderDate).toISOString(),
      daysSinceLastOrder: user.daysSinceLastOrder || 0,
      segment: getSegment(user.totalSpend || 0, highValueThreshold), // ✅ Dynamic Threshold
    }));

    // 6. ✅ ENTERPRISE FIX: True Global Summary Stats Computation
    let globalTotalLostRevenue = 0;
    let globalHighValue = 0;
    let globalMediumValue = 0;
    let globalLowValue = 0;
    let globalHasEmail = 0;

    for (const c of allCandidatesData) {
      const spend = c.totalSpend || 0;
      globalTotalLostRevenue += spend;

      if (c.email) globalHasEmail++;

      const seg = getSegment(spend, highValueThreshold);
      if (seg === "high-value") globalHighValue++;
      else if (seg === "medium-value") globalMediumValue++;
      else globalLowValue++;
    }

    const result: PaginatedWinbackCandidatesResult = {
      candidates,
      totalDocs,
      totalPages,
      summary: {
        total: totalDocs,
        totalWinbackPotentialRevenue: Math.round(globalTotalLostRevenue), // ✅ Global Potential Revenue
        highValue: globalHighValue,
        mediumValue: globalMediumValue,
        lowValue: globalLowValue,
        hasEmail: globalHasEmail,
      },
    };

    // 7. Cache safely with safeStringify
    try {
      const stringified = safeStringify(result);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log("💾 Winback candidates cached (5 min TTL).");
    } catch (cacheError) {
      console.warn("⚠️ Winback candidates cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch winback candidates:", error.message);
    return {
      candidates: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, totalWinbackPotentialRevenue: 0, highValue: 0, mediumValue: 0, lowValue: 0, hasEmail: 0 },
    };
  }
}