
// 📂 src/app/features/storefront/customer-account/actions/referralActions.ts (STATUS WHITELIST HARDENED)

"use server";

import crypto from "crypto";
import { auth } from "@/app/auth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import Referral from "@/models/Referral";
import Order from "@/models/Order";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// ✅ SINGLE SOURCE OF TRUTH
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

/**
 * @description Generates a cryptographically secure, unique 8-character referral code
 * and saves it to the logged-in user's document in Database Cluster A.
 */
export async function generateReferralCode(): Promise<{
  success: boolean;
  code?: string;
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in to generate a referral code." };
    }

    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, message: "User account not found." };
    }

    // If user already has a referral code, return it directly
    if (user.referralCode) {
      return { success: true, code: user.referralCode };
    }

    let code = "";
    let isUnique = false;
    let attempts = 0;

    // Loop to ensure absolute uniqueness (prevents hash collisions)
    while (!isUnique && attempts < 10) {
      attempts++;
      code = crypto.randomBytes(4).toString("hex").toUpperCase();

      const duplicateCodeUser = await User.findOne({ referralCode: code })
        .select("_id")
        .lean();
      if (!duplicateCodeUser) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      return {
        success: false,
        message: "Failed to generate a unique code. Please try again.",
      };
    }

    user.referralCode = code;
    await user.save();

    return { success: true, code };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to generate referral code:", errorMsg);
    return { success: false, message: "Internal server error occurred." };
  }
}

/**
 * @description Retrieves high-fidelity referral metrics, customer lifetime spend (LTV),
 * active milestones configurations (referrals + spending), and assigned coupons for
 * the currently authenticated storefront user.
 */
export async function getCustomerReferralStats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthenticated request." };
    }

    await connectMongoose();

    // 1. Fetch user referral metadata from Cluster A
    const user = await User.findById(session.user.id)
      .select("referralCode referralClicks")
      .lean<{ referralCode?: string; referralClicks?: number }>();

    const referralCode = user?.referralCode || null;

    // =================================================================
    // 🚀 REAL-TIME CLICKS FROM REDIS (Edge-tracked)
    // =================================================================
    let clicks = 0;
    if (referralCode) {
      try {
        clicks = await redis.pfcount(`clicks:${referralCode}`);
      } catch (redisError) {
        console.warn(
          `⚠️ Redis pfcount failed for ${referralCode}, falling back to MongoDB.`,
          redisError
        );
        clicks = user?.referralClicks || 0;
      }
    }

    // 2. Fetch all referrals from Cluster A to count conversions
    const referrals = await Referral.find({ referrerId: session.user.id }).lean();
    const totalSignups = referrals.length;

    const conversions = referrals.filter(
      (ref) => ref.status === "converted" || ref.status === "paid"
    ).length;

    // =================================================================
    // 🚀 DYNAMIC CUSTOMER LIFETIME SPEND (LTV) AGGREGATION
    // =================================================================
    // ✅ CRITICAL FIX: Match ONLY valid sales orders in REVENUE_STATUSES
    const spendStats = await Order.aggregate([
      {
        $match: {
          userId: session.user.id,
          paymentStatus: "Paid",
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSpend: { $sum: "$totalPrice" },
        },
      },
    ]);

    const lifetimeSpend = spendStats[0]?.totalSpend || 0;

    // 3. Fetch dynamic Milestones settings from Cache (Cluster B)
    let settings: any = {};
    try {
      settings = await getCachedSettings();
    } catch (e) {
      settings = {};
    }
    const milestones = settings?.referralMilestones || [];
    const vipMilestones = settings?.vipShoppingMilestones || [];

    // 4. Fetch assigned dynamic coupons from Payload CMS (Cluster B)
    let assignedCoupons = [];
    try {
      const payload = await getSafePayload();
      const couponResult = await payload.find({
        collection: "coupons",
        where: {
          boundUserId: { equals: session.user.id },
          isActive: { equals: true },
        },
        limit: 100,
      });

      assignedCoupons = couponResult.docs.map((doc: any) => ({
        code: doc.code,
        discountType: doc.discountType,
        discountValue: doc.discountValue,
        rewardLabel: doc.description || "Referral Reward",
      }));
    } catch (payloadError) {
      console.error(
        "⚠️ REFERRAL WARNING: Payload coupon lookup failed (Database B is offline):",
        payloadError
      );
    }

    return {
      success: true,
      stats: {
        referralCode,
        clicks,
        totalSignups,
        conversions,
        milestones,
        assignedCoupons,
        lifetimeSpend,
        vipMilestones,
      },
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to fetch customer referral stats:", errorMsg);
    return { success: false, message: "Internal server error occurred." };
  }
}