// // 📂 src/app/features/admin/marketing/actions/getAbandonedCarts.ts (STRICT TS1117 & MONGODB NIN FIXED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import AbandonedCart from "@/models/AbandonedCart";
// import User from "@/models/User";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { subHours } from "date-fns";

// // ✅ ENTERPRISE FIX: Safe serialization utilities imported
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface AbandonedCartSummary {
//   _id: string;
//   sessionId: string;
//   userId: string | null;
//   email: string | null;
//   phone: string | null;
//   itemsCount: number;
//   subtotal: number;
//   lastUpdated: string;
//   isRecovered: boolean;
//   createdAt: string;
//   customerName?: string;
// }

// export interface PaginatedAbandonedCartsResult {
//   carts: AbandonedCartSummary[];
//   totalDocs: number;
//   totalPages: number;
//   summary: {
//     total: number;
//     totalAbandonedRevenue: number; // ✅ Global Lost Sales Value in PKR
//     olderThan24h: number;
//     olderThan48h: number;
//     hasEmail: number;
//   };
// }

// // ================================================================
// // 🚀 MAIN ACTION
// // ================================================================
// export async function getAbandonedCarts({
//   page = 1,
//   limit = 20,
//   minAgeHours = 2,
//   searchTerm = "",
// }: {
//   page?: number;
//   limit?: number;
//   minAgeHours?: number;
//   searchTerm?: string;
// } = {}): Promise<PaginatedAbandonedCartsResult> {
//   try {
//     await verifyStaff(["admin", "manager", "editor"]);

//     const cacheKey = `analytics_abandoned_carts:page_${page}:limit_${limit}:age_${minAgeHours}:search_${searchTerm || "none"}`;

//     // 1. Check Cache (Type-Safe with safeParse)
//     try {
//       const cached = await redis.get(cacheKey);
//       const parsed = safeParse<PaginatedAbandonedCartsResult>(cached);
//       if (parsed) {
//         console.log(`⚡ Redis Cache Hit: Abandoned Carts (Page ${page})`);
//         return parsed;
//       }
//     } catch (cacheError) {
//       console.warn("⚠️ Abandoned carts cache read failed:", cacheError);
//     }

//     await connectMongoose();

//     const cutoffDate = subHours(new Date(), minAgeHours);
//     const skip = (page - 1) * limit;

//     // 2. Build Query
//     const query: any = {
//       isRecovered: false,
//       lastUpdated: { $lt: cutoffDate },
//     };

//     // ✅ ENTERPRISE FIX: Multi-Field Search (Phone & SessionId included to fix search loopholes)
//     if (searchTerm) {
//       const searchRegex = new RegExp(searchTerm.trim(), "i");
//       query.$or = [
//         { email: searchRegex },
//         { phone: searchRegex },        // ✅ Search by Pakistani Mobile Numbers
//         { sessionId: searchRegex },    // ✅ Search by Session ID
//         { userId: searchTerm },
//       ];
//     }

//     // 3. Fetch Carts
//     const [carts, totalDocs] = await Promise.all([
//       AbandonedCart.find(query)
//         .sort({ lastUpdated: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       AbandonedCart.countDocuments(query),
//     ]);

//     // 4. Fetch User Details
//     const userIds = carts.map((c) => c.userId).filter(Boolean);
//     let userMap = new Map<string, { name: string; email: string; phone?: string }>();

//     if (userIds.length > 0) {
//       const users = (await User.find(
//         { _id: { $in: userIds } },
//         { name: 1, email: 1, phone: 1 }
//       ).lean()) as any[] as { _id: string; name: string; email: string; phone?: string }[];

//       userMap = new Map(users.map((u) => [u._id.toString(), u]));
//     }

//     // 5. Map to DTO
//     const cartSummaries: AbandonedCartSummary[] = carts.map((cart: any) => {
//       const user = cart.userId ? userMap.get(cart.userId.toString()) : null;

//       return {
//         _id: cart._id.toString(),
//         sessionId: cart.sessionId,
//         userId: cart.userId ? cart.userId.toString() : null,
//         email: user?.email || cart.email || null,
//         phone: user?.phone || cart.phone || null,
//         customerName: user?.name || undefined,
//         itemsCount: cart.items?.length || 0,
//         subtotal: cart.subtotal || 0,
//         lastUpdated: new Date(cart.lastUpdated).toISOString(),
//         isRecovered: cart.isRecovered || false,
//         createdAt: new Date(cart.createdAt).toISOString(),
//       };
//     });

//     // 6. ✅ ENTERPRISE FIX: High-Speed Indexed Global Summary & Revenue Calculation
//     const now = new Date();
//     const date24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//     const date48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

//     // ✅ TS(1117) FIX: Destructure lastUpdated out to prevent duplicate property collision in spread operator
//     const { lastUpdated: _ignored, ...baseQuery } = query;

//     const [olderThan24h, olderThan48h, hasEmail, revenueAgg] = await Promise.all([
//       AbandonedCart.countDocuments({ ...baseQuery, lastUpdated: { $lt: date24h } }),
//       AbandonedCart.countDocuments({ ...baseQuery, lastUpdated: { $lt: date48h } }),
//       // ✅ FIXED: Used $nin: [null, ""] instead of duplicate $ne keys
//       AbandonedCart.countDocuments({ ...query, email: { $exists: true, $nin: [null, ""] } }),
//       AbandonedCart.aggregate([
//         { $match: query },
//         { $group: { _id: null, totalLost: { $sum: "$subtotal" } } },
//       ]),
//     ]);

//     const totalAbandonedRevenue = revenueAgg[0]?.totalLost || 0;

//     const result: PaginatedAbandonedCartsResult = {
//       carts: cartSummaries,
//       totalDocs,
//       totalPages: Math.ceil(totalDocs / limit),
//       summary: {
//         total: totalDocs,
//         totalAbandonedRevenue: Math.round(totalAbandonedRevenue), // ✅ Global Lost PKR Sales Sum
//         olderThan24h,
//         olderThan48h,
//         hasEmail,
//       },
//     };

//     // 7. Cache for 1 minute (Safe Stringify)
//     try {
//       const stringified = safeStringify(result);
//       await redis.set(cacheKey, stringified, { ex: 60 });
//     } catch (cacheError) {
//       console.warn("⚠️ Abandoned carts cache write failed:", cacheError);
//     }

//     return result;
//   } catch (error: any) {
//     console.error("❌ Failed to fetch abandoned carts:", error.message);
//     return {
//       carts: [],
//       totalDocs: 0,
//       totalPages: 0,
//       summary: { total: 0, totalAbandonedRevenue: 0, olderThan24h: 0, olderThan48h: 0, hasEmail: 0 },
//     };
//   }
// }
// 📂 src/app/features/admin/marketing/actions/getAbandonedCarts.ts

"use server";

import { verifyStaff } from "@/lib/payloadAuth";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { subHours, startOfDay, endOfDay, format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildAbandonedCartsMatrix,
  UnifiedAbandonedCartItem,
} from "@/app/features/admin/shared/engines/marketingPipelinesEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Marketing Hub & Widgets)
// ================================================================
export interface AbandonedCartSummary {
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

export interface PaginatedAbandonedCartsResult {
  carts: AbandonedCartSummary[];
  totalDocs: number;
  totalPages: number;
  summary: {
    total: number;
    totalAbandonedRevenue: number; // Global Lost Sales Value in PKR
    olderThan24h: number;
    olderThan48h: number;
    hasEmail: number;
  };
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getAbandonedCarts({
  page = 1,
  limit = 20,
  minAgeHours = 2,
  searchTerm = "",
  range,
}: {
  page?: number;
  limit?: number;
  minAgeHours?: number;
  searchTerm?: string;
  range?: { startDate: Date; endDate: Date };
} = {}): Promise<PaginatedAbandonedCartsResult> {
  const safeLimit = limit > 0 ? limit : 20;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    const cutoffDate = subHours(new Date(), minAgeHours);
    const start = range?.startDate ? startOfDay(new Date(range.startDate)) : null;
    const end = range?.endDate ? endOfDay(new Date(range.endDate)) : cutoffDate;

    const fromStr = start ? format(start, "yyyy-MM-dd") : "all";
    const toStr = format(end, "yyyy-MM-dd");

    const cacheKey = `analytics_abandoned_carts_v7:page_${page}:limit_${safeLimit}:age_${minAgeHours}:from_${fromStr}:to_${toStr}:search_${searchTerm || "none"}`;

    // 1. Check Cache
    try {
      const cached = await redis.get(cacheKey);
      const parsed = safeParse<PaginatedAbandonedCartsResult>(cached as string | null);
      if (parsed) {
        console.log(`⚡ Redis Cache Hit: Abandoned Carts (${page})`);
        return parsed;
      }
    } catch (cacheError) {
      console.warn("⚠️ Abandoned carts cache read failed:", cacheError);
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildAbandonedCartsMatrix({
      page,
      limit: safeLimit,
      minAgeHours,
      searchTerm,
      range,
    });

    const cartSummaries: AbandonedCartSummary[] = engineResult.carts.map((c: UnifiedAbandonedCartItem) => ({
      _id: c._id,
      sessionId: c.sessionId,
      userId: c.userId,
      email: c.email,
      phone: c.phone,
      customerName: c.customerName,
      itemsCount: c.itemsCount,
      subtotal: c.subtotal,
      lastUpdated: c.lastUpdated,
      isRecovered: c.isRecovered,
      createdAt: c.createdAt,
    }));

    const result: PaginatedAbandonedCartsResult = {
      carts: cartSummaries,
      totalDocs: engineResult.totalDocs,
      totalPages: engineResult.totalPages,
      summary: engineResult.summary,
    };

    // 3. Cache for 1 minute
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 60 });
    } catch (cacheError) {
      console.warn("⚠️ Abandoned carts cache write failed:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch abandoned carts:", error.message);
    return {
      carts: [],
      totalDocs: 0,
      totalPages: 0,
      summary: { total: 0, totalAbandonedRevenue: 0, olderThan24h: 0, olderThan48h: 0, hasEmail: 0 },
    };
  }
}