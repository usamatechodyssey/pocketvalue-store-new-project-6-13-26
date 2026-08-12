// 📂 src/app/features/admin/loyalty-intelligence/actions/usersActions.tsOR  payloadCustomerActions.ts(FULLY HARDENED & REDOS SECURED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User, { IUser, IAddress } from "@/models/User";
import Referral from "@/models/Referral";
import Order from "@/models/Order";
import { Types } from "mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// --- TYPES (DTOs for Frontend Compatibility) ---
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  orderCount: number;
}

type PlainUser = Omit<IUser, "_id" | "createdAt" | "updatedAt" | "emailVerified" | "phoneVerified" | "addresses" | "toObject" | "save"> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date | null;
  phoneVerified?: Date | null;
  addresses: (Omit<IAddress, "_id"> & { _id: Types.ObjectId })[];
  referralCode?: string | null;
  referredBy?: Types.ObjectId | any | null;
  referralClicks?: number;
};

// ================================================================
// 🧹 HELPER: Invalidate User Profile Cache
// ================================================================
async function invalidateUserCache(userId: string): Promise<void> {
  try {
    const cacheKey = `user_profile:${userId}`;
    await redis.del(cacheKey);
    console.log(`🧹 [Cache] Invalidated user profile cache for: ${userId}`);
  } catch (error) {
    console.warn(`⚠️ [Cache] Failed to invalidate cache for ${userId}:`, error);
  }
}

// ================================================================
// 📋 1. GET PAGINATED CUSTOMERS (ReDoS Protected)
// ================================================================
export async function getPaginatedUsersPayload({
  page = 1,
  limit = 15,
  searchTerm = "",
}) {
  const cacheKey = `analytics_users_list:page_${page}:search_${searchTerm || "none"}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<any>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Paginated Customers List (Page: ${page})`);
      return parsed;
    }

    await connectMongoose();
    const skip = (page - 1) * limit;

    const matchQuery: any = {};
    if (searchTerm) {
      // ✅ FIX: Escape special regex characters to prevent SyntaxError ReDoS crashes/hangs
      const escapedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      
      matchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [usersFromDb, totalUsers] = await Promise.all([
      User.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainUser[]>(),
      User.countDocuments(matchQuery),
    ]);

    const userIds = usersFromDb.map((u: any) => u._id.toString());

    // Match only valid sales orders in REVENUE_STATUSES (Excludes Cancelled/Rejected)
    const orderCounts = await Order.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          status: { $in: REVENUE_STATUSES }
        }
      },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const orderCountMap = new Map(orderCounts.map((item: any) => [item._id, item.count]));

    const users: AdminUser[] = usersFromDb.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.phoneVerified,
      orderCount: orderCountMap.get(user._id.toString()) || 0,
    }));

    const finalPayload = {
      users,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      totalDocs: totalUsers,
    };

    // Cache write (5 min TTL)
    await redis.set(cacheKey, safeStringify(finalPayload), { ex: 300 });

    return finalPayload;
  } catch (error: any) {
    console.error("Payload Fetch Users Error:", error.message);
    return { users: [], totalPages: 0, totalDocs: 0 };
  }
}

// ================================================================
// 👤 2. GET SINGLE CUSTOMER DETAILS (Whitelisted CRM Stats)
// ================================================================
export async function getSingleUserPayload(userId: string) {
  const cacheKey = `user_profile:${userId}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    if (!Types.ObjectId.isValid(userId)) return null;

    // 1. Cache Check
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<any>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Single Customer CRM Profile (ID: ${userId})`);
      return parsed;
    }

    await connectMongoose();

    const user = await User.findById(userId)
      .populate("referredBy", "name email")
      .lean<PlainUser>();

    if (!user) return null;

    // Calculate Lifetime Spend & Order Count strictly from REVENUE_STATUSES orders
    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: userId,
          status: { $in: REVENUE_STATUSES }
        }
      },
      {
        $group: {
          _id: "$userId",
          totalSpend: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const statsResult = orderStats[0] || {};

    // Fetch recent orders 
    const recentOrders = await Order.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ================================================================
    // 🚀 LOYALTY PORTAL METRICS (DYNAMIC CALCULATION)
    // ================================================================

    // 4a. Referral Stats
    const [totalSignups, conversions] = await Promise.all([
      Referral.countDocuments({ referrerId: userId }),
      Referral.countDocuments({
        referrerId: userId,
        status: { $in: ["converted", "paid"] },
      }),
    ]);

    // 4b. Assigned Coupons Count 
    let assignedCouponsCount = 0;
    try {
      const payload = await getSafePayload();
      const couponResult = await payload.find({
        collection: "coupons",
        where: {
          boundUserId: { equals: userId },
          isActive: { equals: true },
        },
        limit: 1,
      });
      assignedCouponsCount = couponResult.totalDocs || 0;
    } catch (payloadError) {
      console.error(
        `⚠️ CRM WARNING: Failed to count bound coupons for user ${userId}. Payload may be offline.`,
        payloadError
      );
    }

    // 4c. Fetch Real-time clicks from Redis
    let referralClicks = 0;
    if (user.referralCode) {
      try {
        referralClicks = await redis.pfcount(`clicks:${user.referralCode}`);
        console.log(`📡 [CRM] Clicks fetched from Redis for user ${userId}: ${referralClicks}`);
      } catch (redisError) {
        console.warn(
          `⚠️ CRM: Redis pfcount failed for ${userId}, falling back to MongoDB.`,
          redisError
        );
        referralClicks = user.referralClicks || 0;
      }
    } else {
      referralClicks = user.referralClicks || 0;
    }

    // 5. Build Result
    const userDetailResult = {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        addresses: user.addresses.map((addr: any) => ({
          ...addr,
          _id: addr._id.toString(),
        })),
        referralCode: user.referralCode || null,
        referredBy: user.referredBy
          ? {
              _id: (user.referredBy as any)._id.toString(),
              name: (user.referredBy as any).name,
              email: (user.referredBy as any).email,
            }
          : null,
      },
      stats: {
        totalSpend: Math.round(statsResult.totalSpend || 0), 
        totalOrders: statsResult.totalOrders || 0,
        referralClicks,
        totalSignups,
        conversions,
        assignedCouponsCount,
      },
      recentOrders: recentOrders.map((order: any) => ({
        _id: order._id.toString(),
        orderDate: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        status: order.status,
        totalPrice: order.totalPrice,
      })),
    };

    // Cache write (5 min TTL)
    await redis.set(cacheKey, safeStringify(userDetailResult), { ex: 300 });

    return userDetailResult;
  } catch (error: any) {
    console.error("Payload Single User Fetch Error:", error.message);
    return null;
  }
}

// ================================================================
// 🔄 3. REFRESH USER CACHE (EXTERNAL TRIGGER)
// ================================================================
export async function refreshUserCache(userId: string): Promise<{ success: boolean }> {
  try {
    await verifyStaff(["admin", "manager", "editor", "logistics"]);
    await invalidateUserCache(userId);
    return { success: true };
  } catch (error: any) {
    console.error(`⚠️ Failed to refresh user cache for ${userId}:`, error.message);
    return { success: false };
  }
}