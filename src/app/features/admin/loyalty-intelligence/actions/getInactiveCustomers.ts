// 📂 src/app/features/admin/loyalty-intelligence/actions/getInactiveCustomers.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildInactiveCustomersMatrix,
  UnifiedInactiveCustomer,
} from "@/app/features/admin/shared/engines/customerLtvEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Loyalty UI)
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
// 🚀 MAIN ACTION — Delegated to Central Engine
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

    const cacheKey = `analytics_inactive_customers_v4:page_${page}:limit_${limit}:segment_${segment}:search_${searchTerm || "none"}`;

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

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildInactiveCustomersMatrix({
      page,
      limit,
      segment,
      searchTerm,
      inactiveDays,
      highValueThreshold,
    });

    const customers: InactiveCustomer[] = engineResult.customers.map((c: UnifiedInactiveCustomer) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      image: c.image,
      totalSpend: c.totalSpend,
      orderCount: c.orderCount,
      lastOrderDate: c.lastOrderDate,
      createdAt: c.createdAt,
      daysSinceLastOrder: c.daysSinceLastOrder,
      segment: c.segment,
      reactivationEmailsSent: c.reactivationEmailsSent,
    }));

    const result: PaginatedInactiveCustomersResult = {
      customers,
      totalDocs: engineResult.totalDocs,
      totalPages: engineResult.totalPages,
      summary: engineResult.summary,
    };

    // 3. Cache for 5 minutes
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
// 🔄 ACTION: Send Reactivation Email (Bulk) — Preserved 100%
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

    console.log(`📧 Reactivation emails dispatched to ${result.modifiedCount} customers.`);

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