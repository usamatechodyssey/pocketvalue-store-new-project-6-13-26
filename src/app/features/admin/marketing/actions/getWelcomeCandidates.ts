// 📂 src/app/features/admin/marketing/actions/getWelcomeCandidates.ts (INVERTED DATE FIX & ONBOARDING CONVERSION SYNCED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subHours } from "date-fns";

// ✅ ENTERPRISE FIX: Import shared constants & safe utilities
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface WelcomeCandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  hoursSinceSignup: number;
  hasOrder: boolean;
}

export interface PaginatedWelcomeCandidatesResult {
  candidates: WelcomeCandidate[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    pendingConversions: number; // ✅ NEW: New signups with 0 orders (Leads)
    alreadyConverted: number;   // ✅ NEW: New signups who already ordered
    hasEmail: number;
    hasPhone: number;
  };
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function getWelcomeCandidates({
  page = 1,
  limit = 20,
  searchTerm = "",
  minAgeHours = 0,
  maxAgeHours = 48, // Default: Users registered in the LAST 48 hours
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  minAgeHours?: number;
  maxAgeHours?: number;
} = {}): Promise<PaginatedWelcomeCandidatesResult> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    const cacheKey = `analytics_welcome_candidates:page_${page}:limit_${limit}:search_${searchTerm || "none"}`;

    // 1. Check Cache (Type-Safe with safeParse)
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedWelcomeCandidatesResult>(cached as string | null);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Welcome Candidates (Page ${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Welcome candidates cache read failed:", cacheError);
    }

    await connectMongoose();

    const cutoffDate = subHours(new Date(), maxAgeHours);
    const minCutoffDate = minAgeHours > 0 ? subHours(new Date(), minAgeHours) : new Date();
    const skip = (page - 1) * limit;

    // ================================================================
    // 2. BUILD QUERY (INVERTED DATE CUTOFF FIXED)
    // ================================================================
    // ✅ ENTERPRISE FIX: Query users created AFTER cutoffDate ($gte) to capture ACTUAL NEW SIGNUPS (last 48 hours)
    const query: any = {
      role: "customer",
      createdAt: { $gte: cutoffDate },
    };

    if (minAgeHours > 0) {
      query.createdAt.$lte = minCutoffDate;
    }

    // Search filter (Name, Email, or Phone)
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // 3. Fetch Users (Paginated & All Unpaginated for Global Summary)
    const [users, totalDocs, allNewUsers] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<{ _id: string; name: string; email: string; phone?: string; createdAt: Date }[]>(),
      User.countDocuments(query),
      User.find(query, { _id: 1, email: 1, phone: 1 }).lean<{ _id: any; email?: string; phone?: string }[]>(),
    ]);

    // 4. If no users found
    if (users.length === 0) {
      const emptyResult: PaginatedWelcomeCandidatesResult = {
        candidates: [],
        totalDocs: 0,
        totalPages: 0,
        summary: { total: 0, pendingConversions: 0, alreadyConverted: 0, hasEmail: 0, hasPhone: 0 },
      };
      await redis.set(cacheKey, safeStringify(emptyResult), { ex: 60 });
      return emptyResult;
    }

    // 5. Check which users already have valid orders (Aligned with REVENUE_STATUSES)
    const userIds = users.map((u) => u._id);
    const allUserIds = allNewUsers.map((u) => u._id);

    const usersWithOrders = await Order.distinct("userId", {
      userId: { $in: userIds.map((id) => id.toString()) },
      status: { $in: REVENUE_STATUSES }, // ✅ Aligned with REVENUE_STATUSES Whitelist
    });

    const allUsersWithOrders = await Order.distinct("userId", {
      userId: { $in: allUserIds.map((id) => id.toString()) },
      status: { $in: REVENUE_STATUSES },
    });

    const usersWithOrdersSet = new Set(usersWithOrders.map((id) => id.toString()));
    const allUsersWithOrdersSet = new Set(allUsersWithOrders.map((id) => id.toString()));

    // 6. Map Paginated Candidates
    const now = new Date();
    const candidates: WelcomeCandidate[] = users.map((user) => {
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

    // 7. ✅ ENTERPRISE FIX: Compute True Global Summary Onboarding Metrics
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

    const result: PaginatedWelcomeCandidatesResult = {
      candidates,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        total: totalDocs,
        pendingConversions: globalPendingConversions, // ✅ Unconverted new leads
        alreadyConverted: globalAlreadyConverted,   // ✅ Converted new buyers
        hasEmail: globalHasEmail,
        hasPhone: globalHasPhone,
      },
    };

    // 8. Cache for 1 minute (Safe Stringify)
    try {
      const stringified = safeStringify(result);
      await redis.set(cacheKey, stringified, { ex: 60 });
      console.log(`💾 Welcome candidates cached (${candidates.length} signups).`);
    } catch (cacheError) {
      console.warn("⚠️ Welcome candidates cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch welcome candidates:", error.message);
    return {
      candidates: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, pendingConversions: 0, alreadyConverted: 0, hasEmail: 0, hasPhone: 0 },
    };
  }
}