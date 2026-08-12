// "use server";

// import { revalidatePath } from "next/cache";
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Referral from "@/models/Referral";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { refreshUserCache } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions"; // ✅ NEW IMPORT

// /**
//  * @description Transitions a converted referral ledger status to 'paid' (meaning Reward Cleared),
//  * indicating the admin has manually assigned a custom voucher for this milestone.
//  * Force-purges ALL analytics caches AND the specific user CRM cache to update the dashboard instantly.
//  */
// export async function clearReferralRewardAction(
//   referralId: string
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     // 1. Security Staff Guard Check
//     await verifyStaff(["admin", "manager"]);
//     await connectMongoose();

//     const referral = await Referral.findById(referralId);
//     if (!referral) {
//       return { success: false, message: "Referral transaction log not found." };
//     }

//     if (referral.status !== "converted") {
//       return {
//         success: false,
//         message: "Only converted, pending referrals can be marked as Reward Cleared.",
//       };
//     }

//     // 2. Perform atomic ledger update in Cluster A
//     referral.status = "paid";
//     referral.paidAt = new Date();
//     await referral.save();

//     // 3. 🚀 ENTERPRISE FIX: Force-purge ALL analytics caches in Redis
//     try {
//       const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");

//       // Fetch all analytics cache keys (wildcard pattern)
//       const keys = await redis.keys("analytics_*");
//       const pipeline = redis.pipeline();

//       if (keys.length > 0) {
//         pipeline.del(...keys);
//       }

//       // Also clear the specific performance cache (redundant but safe)
//       pipeline.del("analytics_referral_performance");

//       await pipeline.exec();
//       console.log(
//         `🚀 Cache Invalidator: Flushed ${keys.length + 1} analytics cache keys on reward clear.`
//       );
//     } catch (cacheError) {
//       console.warn(
//         "⚠️ LOYALTY CACHE WARNING: Failed to invalidate analytics cache on reward clear:",
//         cacheError
//       );
//     }

//     // 4. 🆕 ENTERPRISE CRM SYNC: Invalidate Admin User Profile Cache
//     try {
//       const referrerId = referral.referrerId.toString();
//       await refreshUserCache(referrerId);
//       console.log(`🔄 CRM Cache: Admin profile cache invalidated for referrer: ${referrerId}`);
//     } catch (crmError) {
//       console.warn(
//         "⚠️ CRM CACHE WARNING: Failed to invalidate user profile cache:",
//         crmError
//       );
//     }

//     // 5. Revalidate Admin UI
//     revalidatePath("/admin/loyalty-intelligence");
//     revalidatePath(`/admin/users-explorer/${referral.referrerId}`);

//     return { success: true, message: "Referral milestone marked as Reward Cleared." };
//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : "Failed to clear reward status.";
//     console.error("Reward Clearance Action Error:", errorMsg);
//     return { success: false, message: errorMsg };
//   }
// }
// 📂 src/app/features/admin/loyalty-intelligence/actions/payoutActions.ts

"use server";

import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Referral from "@/models/Referral";
import { verifyStaff } from "@/lib/payloadAuth";
import { refreshUserCache } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";

/**
 * @description Transitions a converted referral ledger status to 'paid' (Internal Ledger Settlement),
 * indicating the admin has officially audited and settled this payout entry.
 * Pure internal accounting clearance action with 0 customer email overhead.
 */
export async function clearReferralRewardAction(
  referralId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Security Staff Guard Check
    await verifyStaff(["admin", "manager"]);
    await connectMongoose();

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return { success: false, message: "Referral transaction log not found." };
    }

    if (referral.status !== "converted") {
      return {
        success: false,
        message: "Only converted referrals can be marked as Settled/Paid.",
      };
    }

    // 2. Perform atomic ledger update in Cluster A
    referral.status = "paid";
    referral.paidAt = new Date();
    await referral.save();

    // 3. Force-purge ALL analytics caches in Redis for real-time dashboard sync
    try {
      const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");

      const keys = await redis.keys("analytics_*");
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        pipeline.del(...keys);
        await pipeline.exec();
        console.log(`🚀 Ledger Invalidator: Flushed ${keys.length} analytics cache keys on settlement.`);
      }
    } catch (cacheError) {
      console.warn("⚠️ LOYALTY CACHE WARNING: Failed to invalidate analytics cache on payout clear:", cacheError);
    }

    // 4. CRM User Profile Cache Invalidation
    try {
      const referrerId = referral.referrerId.toString();
      await refreshUserCache(referrerId);
      console.log(`🔄 CRM Cache: Admin profile cache invalidated for referrer: ${referrerId}`);
    } catch (crmError) {
      console.warn("⚠️ CRM CACHE WARNING: Failed to invalidate user profile cache:", crmError);
    }

    // 5. Revalidate Admin UI
    revalidatePath("/admin/loyalty-intelligence");
    revalidatePath(`/admin/users-explorer/${referral.referrerId}`);

    return { success: true, message: "Referral milestone ledger marked as Settled/Paid." };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to clear reward status.";
    console.error("Reward Clearance Action Error:", errorMsg);
    return { success: false, message: errorMsg };
  }
}