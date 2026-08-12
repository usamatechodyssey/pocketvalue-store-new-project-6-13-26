// // 📂 src/app/features/admin/loyalty-intelligence/actions/conversionTracker.ts (MASTER HARDENED)

// "use server";

// import mongoose from "mongoose";
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order, { IOrder } from "@/models/Order";
// import User, { IUser } from "@/models/User";
// import Referral from "@/models/Referral";
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";
// import { sendReferralEarningEmailNotification } from "@/lib/adapters/communication/CommunicationFactory";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import crypto from "crypto";

// // ✅ SINGLE SOURCE OF TRUTH (REVENUE WHITELIST)
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// // ================================================================
// // 🔧 HELPER: Generate Unique Coupon Code
// // ================================================================
// function generateCouponCode(prefix: string = "REF"): string {
//   const random = crypto.randomBytes(4).toString("hex").toUpperCase();
//   return `${prefix}-${random}`;
// }

// // ================================================================
// // 🎁 HELPER: Assign Milestone Reward (GRACEFUL FAILURE)
// // ================================================================
// async function assignMilestoneReward(
//   userId: string,
//   milestone: any,
//   type: "referral" | "vip",
//   settings: any
// ): Promise<{ success: boolean; couponCode?: string; message?: string }> {
//   try {
//     if (!milestone.discountType || !milestone.discountValue) {
//       console.warn(
//         `⚠️ [Reward Assignment] Skipping ${type} reward for user ${userId}: discountType or discountValue missing in milestone config.`
//       );
//       return {
//         success: false,
//         message: "Milestone configuration incomplete (discountType/discountValue missing).",
//       };
//     }

//     const expiryDays = settings?.couponDefaultExpiryDays || 365;
//     const usageLimit = settings?.couponDefaultUsageLimit || 1;
//     const isStackable = settings?.couponIsStackable || false;

//     let payload;
//     try {
//       payload = await getSafePayload();
//     } catch (payloadError) {
//       console.error(`⚠️ [Reward Assignment] Payload connection failed for user ${userId}:`, payloadError);
//       return { success: false, message: "Payload CMS is unavailable." };
//     }

//     try {
//       const existingCoupon = await payload.find({
//         collection: "coupons",
//         where: {
//           and: [
//             { boundUserId: { equals: userId } },
//             { description: { equals: `${type}_milestone_${milestone.rewardLabel}` } },
//             { isActive: { equals: true } },
//           ],
//         },
//         limit: 1,
//       });

//       if (existingCoupon.totalDocs > 0) {
//         console.log(`ℹ️ [Reward Assignment] ${type} milestone already assigned to user ${userId}. Skipping.`);
//         return { success: true, message: "Reward already assigned." };
//       }
//     } catch (findError) {
//       console.warn(`⚠️ [Reward Assignment] Failed to check existing coupons for user ${userId}:`, findError);
//     }

//     const prefix = type === "referral" ? "REF" : "VIP";
//     let couponCode = generateCouponCode(prefix);
//     let isUnique = false;
//     let attempts = 0;

//     while (!isUnique && attempts < 10) {
//       attempts++;
//       try {
//         const existing = await payload.find({
//           collection: "coupons",
//           where: { code: { equals: couponCode } },
//           limit: 1,
//         });
//         if (existing.totalDocs === 0) {
//           isUnique = true;
//         } else {
//           couponCode = generateCouponCode(prefix);
//         }
//       } catch (findCodeError) {
//         console.warn(`⚠️ [Reward Assignment] Error checking coupon code uniqueness:`, findCodeError);
//         isUnique = true;
//       }
//     }

//     if (!isUnique) {
//       return { success: false, message: "Failed to generate a unique coupon code after 10 attempts." };
//     }

//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() + expiryDays);

//     try {
//       await payload.create({
//         collection: "coupons",
//         data: {
//           code: couponCode,
//           description: `${type === "referral" ? "Referral" : "VIP Shopping"} Milestone: ${milestone.rewardLabel}`,
//           isActive: true,
//           discountType: milestone.discountType,
//           discountValue: milestone.discountValue,
//           maximumDiscount: milestone.maximumDiscount || null,
//           minimumPurchaseAmount: 0,
//           startDate: new Date().toISOString(),
//           expiryDate: expiryDate.toISOString(),
//           totalUsageLimit: usageLimit,
//           usageLimitPerUser: usageLimit,
//           isStackable: isStackable,
//           applicableTo: "entireOrder",
//           boundUserId: userId,
//         },
//       });

//       console.log(
//         `📡 [Reward Assignment] ${type.toUpperCase()} coupon "${couponCode}" assigned to user ${userId}`
//       );
//       return { success: true, couponCode };
//     } catch (createError) {
//       console.error(`⚠️ [Reward Assignment] Failed to create coupon in Payload for user ${userId}:`, createError);
//       return { success: false, message: "Failed to create coupon in Payload." };
//     }
//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : "Unknown reward assignment error.";
//     console.error(`⚠️ [Reward Assignment] CRITICAL: Unhandled error for user ${userId}:`, errorMsg);
//     return { success: false, message: errorMsg };
//   }
// }

// // ================================================================
// // 🚀 MAIN ENGINE: Track Order Referral Conversion
// // ================================================================
// export async function trackOrderReferralConversion(
//   orderId: string
// ): Promise<{ success: boolean; message?: string }> {
//   try {
//     await connectMongoose();

//     const order = await Order.findById(orderId).lean<IOrder>();
//     if (!order) {
//       return { success: false, message: "Order reference not found on Cluster A." };
//     }

//     if (order.paymentStatus !== "Paid") {
//       return { success: false, message: "Order is unpaid. Referral conversion bypassed." };
//     }

//     if (!order.userId || !mongoose.Types.ObjectId.isValid(order.userId)) {
//       return { success: true, message: "Order userId is not a valid User ObjectId. Conversion bypassed." };
//     }

//     const buyer = await User.findById(order.userId)
//       .select("name email referredBy")
//       .lean<IUser>();

//     if (!buyer || !buyer.referredBy) {
//       return { success: true, message: "Buyer was not referred. Conversion bypassed." };
//     }

//     if (!mongoose.Types.ObjectId.isValid(buyer.referredBy.toString())) {
//       return { success: true, message: "Buyer referredBy ID is not a valid User ObjectId. Conversion bypassed." };
//     }

//     // ANTI-CHEAT: First purchase only
//     const otherPaidOrdersCount = await Order.countDocuments({
//       userId: order.userId,
//       paymentStatus: "Paid",
//       _id: { $ne: order._id },
//     });

//     if (otherPaidOrdersCount > 0) {
//       console.warn(
//         `[Anti-Fraud Guard] Multi-order referral exploit blocked for buyer userId: ${order.userId}`
//       );
//       return { success: false, message: "Not the first successful purchase. Conversion blocked." };
//     }

//     const pendingReferral = await Referral.findOne({
//       referredUserId: buyer._id,
//       status: "pending",
//     });

//     if (!pendingReferral) {
//       return { success: true, message: "Referral is already converted or does not exist." };
//     }

//     const referrer = await User.findById(buyer.referredBy)
//       .select("name email")
//       .lean<IUser>();

//     if (!referrer) {
//       return { success: false, message: "Referrer profile no longer exists on Database." };
//     }

//     const existingConversions = await Referral.countDocuments({
//       referrerId: referrer._id,
//       status: { $in: ["converted", "paid"] },
//     });
//     const updatedConversionsTotal = existingConversions + 1;

//     let settings: any = {};
//     try {
//       settings = await getCachedSettings();
//     } catch (e) {
//       settings = {};
//     }

//     const milestones = settings?.referralMilestones || [];
//     const vipMilestones = settings?.vipShoppingMilestones || [];

//     const sortedMilestones = [...milestones].sort(
//       (a, b) => a.requiredConversions - b.requiredConversions
//     );

//     const nextMilestone = sortedMilestones.find(
//       (m) => updatedConversionsTotal < m.requiredConversions
//     );
//     const nextMilestoneLabel = nextMilestone
//       ? nextMilestone.rewardLabel
//       : "the ultimate loyalty tier";

//     // UPDATE REFERRAL LEDGER
//     try {
//       await Referral.updateOne(
//         { _id: pendingReferral._id },
//         {
//           $set: {
//             status: "converted",
//             orderId: order.orderId,
//             convertedAt: new Date(),
//           },
//         }
//       );
//       console.log(
//         `📡 [Referral Converted] Friend: ${buyer.email} -> Referrer: ${referrer.email}. Total conversions: ${updatedConversionsTotal}`
//       );
//     } catch (updateError) {
//       console.error("CRITICAL: Failed to update referral status:", updateError);
//       return { success: false, message: "Failed to update referral ledger." };
//     }

//     // ================================================================
//     // 🎁 REFERRAL MILESTONE REWARD
//     // ================================================================
//     try {
//       const previousConversions = existingConversions;
//       const currentConversions = updatedConversionsTotal;

//       const newlyUnlockedMilestone = sortedMilestones.find(
//         (m) => previousConversions < m.requiredConversions && currentConversions >= m.requiredConversions
//       );

//       if (newlyUnlockedMilestone) {
//         console.log(
//           `🏆 [Milestone Unlocked] Referrer ${referrer.email} reached ${newlyUnlockedMilestone.requiredConversions} conversions.`
//         );

//         const assignmentResult = await assignMilestoneReward(
//           referrer._id.toString(),
//           newlyUnlockedMilestone,
//           "referral",
//           settings
//         );

//         if (assignmentResult.success) {
//           console.log(
//             `✅ [Milestone Reward] Coupon ${assignmentResult.couponCode} assigned to ${referrer.email}`
//           );
//         } else {
//           console.warn(
//             `⚠️ [Milestone Reward] Failed for ${referrer.email}: ${assignmentResult.message}`
//           );
//         }
//       }
//     } catch (milestoneError) {
//       console.error("⚠️ [Milestone Processing] Unexpected error:", milestoneError);
//     }

//     // ================================================================
//     // 👑 VIP SHOPPING MILESTONE REWARD (REVENUE_STATUSES HARDENED)
//     // ================================================================
//     try {
//       if (vipMilestones.length > 0) {
//         // ✅ HARDENED FIX: Use REVENUE_STATUSES whitelist instead of loose 
//         const vipSpendStats = await Order.aggregate([
//           {
//             $match: {
//               userId: referrer._id.toString(),
//               paymentStatus: "Paid",
//               status: { $in: REVENUE_STATUSES },
//             },
//           },
//           {
//             $group: {
//               _id: "$userId",
//               totalSpend: { $sum: "$totalPrice" },
//             },
//           },
//         ]);

//         const referrerLifetimeSpend = vipSpendStats[0]?.totalSpend || 0;

//         const sortedVipMilestones = [...vipMilestones].sort(
//           (a, b) => a.requiredSpend - b.requiredSpend
//         );

//         for (const vipMilestone of sortedVipMilestones) {
//           if (referrerLifetimeSpend >= vipMilestone.requiredSpend) {
//             console.log(
//               `🏆 [VIP Milestone Check] Referrer ${referrer.email} lifetime spend: ${referrerLifetimeSpend} (Threshold: ${vipMilestone.requiredSpend})`
//             );

//             const vipAssignmentResult = await assignMilestoneReward(
//               referrer._id.toString(),
//               vipMilestone,
//               "vip",
//               settings
//             );

//             if (vipAssignmentResult.success) {
//               console.log(
//                 `✅ [VIP Reward] Coupon ${vipAssignmentResult.couponCode} assigned to ${referrer.email}`
//               );
//             } else {
//               console.warn(
//                 `⚠️ [VIP Reward] Failed for ${referrer.email}: ${vipAssignmentResult.message}`
//               );
//             }
//           }
//         }
//       }
//     } catch (vipError) {
//       console.error("⚠️ [VIP Processing] Unexpected error:", vipError);
//     }

//     // ================================================================
//     // ✉️ EMAIL NOTIFICATION
//     // ================================================================
//     try {
//       await sendReferralEarningEmailNotification({
//         to: referrer.email,
//         customerName: referrer.name,
//         friendName: buyer.name,
//         conversions: updatedConversionsTotal,
//         orderId: order.orderId,
//         nextMilestoneLabel,
//       });
//       console.log(`✉️ [Loyalty Mailer] Email sent to ${referrer.email}`);
//     } catch (emailError) {
//       console.error("⚠️ LOYALTY PORTAL WARNING: Failed to send referral earning email:", emailError);
//     }

//     return { success: true };

//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
//     console.error("CRITICAL CONVERSION ENGINE EXCEPTION:", errorMsg);
//     return { success: false, message: errorMsg };
//   }
// }
// 📂 src/app/features/admin/loyalty-intelligence/actions/conversionTracker.ts (UNIVERSAL LOYALTY ENGINE - TYPO FIXED)

"use server";

import mongoose from "mongoose";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder } from "@/models/Order";
import User, { IUser } from "@/models/User";
import Referral from "@/models/Referral";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { sendReferralEarningEmailNotification } from "@/lib/adapters/communication/CommunicationFactory";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import crypto from "crypto";

// ✅ SINGLE SOURCE OF TRUTH (REVENUE WHITELIST)
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// 🔧 HELPER: Generate Unique Coupon Code
// ================================================================
function generateCouponCode(prefix: string = "REF"): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

// ================================================================
// 🎁 HELPER: Assign Milestone Reward (GRACEFUL FAILURE & 100% DYNAMIC)
// ================================================================
async function assignMilestoneReward(
  userId: string,
  milestone: any,
  type: "referral" | "vip",
  settings: any
): Promise<{ success: boolean; couponCode?: string; message?: string }> {
  try {
    if (!milestone.discountType || !milestone.discountValue) {
      console.warn(
        `⚠️ [Reward Assignment] Skipping ${type} reward for user ${userId}: discountType or discountValue missing in milestone config.`
      );
      return {
        success: false,
        message: "Milestone configuration incomplete (discountType/discountValue missing).",
      };
    }

    const expiryDays = settings?.couponDefaultExpiryDays || 30;
    const usageLimit = settings?.couponDefaultUsageLimit || 1;
    const isStackable = settings?.couponIsStackable || false;

    let payload;
    try {
      payload = await getSafePayload();
    } catch (payloadError) {
      console.error(`⚠️ [Reward Assignment] Payload connection failed for user ${userId}:`, payloadError);
      return { success: false, message: "Payload CMS is unavailable." };
    }

    try {
      const existingCoupon = await payload.find({
        collection: "coupons",
        where: {
          and: [
            { boundUserId: { equals: userId } },
            { description: { equals: `${type === "referral" ? "Referral" : "VIP Shopping"} Milestone: ${milestone.rewardLabel}` } },
            { isActive: { equals: true } },
          ],
        },
        limit: 1,
      });

      if (existingCoupon.totalDocs > 0) {
        console.log(`ℹ️ [Reward Assignment] ${type} milestone already assigned to user ${userId}. Skipping.`);
        return { success: true, message: "Reward already assigned." };
      }
    } catch (findError) {
      console.warn(`⚠️ [Reward Assignment] Failed to check existing coupons for user ${userId}:`, findError);
    }

    const prefix = type === "referral" ? "REF" : "VIP";
    let couponCode = generateCouponCode(prefix);
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      try {
        const existing = await payload.find({
          collection: "coupons",
          where: { code: { equals: couponCode } },
          limit: 1,
        });
        if (existing.totalDocs === 0) {
          isUnique = true;
        } else {
          couponCode = generateCouponCode(prefix);
        }
      } catch (findCodeError) {
        console.warn(`⚠️ [Reward Assignment] Error checking coupon code uniqueness:`, findCodeError);
        isUnique = true;
      }
    }

    if (!isUnique) {
      return { success: false, message: "Failed to generate a unique coupon code after 10 attempts." };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    try {
      await payload.create({
        collection: "coupons",
        data: {
          code: couponCode,
          description: `${type === "referral" ? "Referral" : "VIP Shopping"} Milestone: ${milestone.rewardLabel}`,
          isActive: true,
          discountType: milestone.discountType,
          discountValue: milestone.discountValue,
          maximumDiscount: milestone.maximumDiscount || null,
          minimumPurchaseAmount: 0,
          startDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          totalUsageLimit: usageLimit,
          usageLimitPerUser: usageLimit,
          isStackable: isStackable,
          applicableTo: "entireOrder",
          boundUserId: userId,
        },
      });

      console.log(
        `📡 [Reward Assignment] ${type.toUpperCase()} coupon "${couponCode}" assigned to user ${userId}`
      );
      return { success: true, couponCode };
    } catch (createError) {
      console.error(`⚠️ [Reward Assignment] Failed to create coupon in Payload for user ${userId}:`, createError);
      return { success: false, message: "Failed to create coupon in Payload." };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown reward assignment error.";
    console.error(`⚠️ [Reward Assignment] CRITICAL: Unhandled error for user ${userId}:`, errorMsg);
    return { success: false, message: errorMsg };
  }
}

// ================================================================
// 👑 UNIVERSAL HELPER: Evaluate VIP Shopping Club Milestones (Organic + Referred)
// ================================================================
export async function evaluateVipShoppingMilestones(userId: string) {
  try {
    await connectMongoose();
    const settings = await getCachedSettings();
    const vipMilestones = settings?.vipShoppingMilestones || [];
    if (vipMilestones.length === 0) return;

    const user = await User.findById(userId).select("name email").lean<IUser>();
    if (!user || !user.email) return;

    // Calculate total spend on valid sales orders
    const vipSpendStats = await Order.aggregate([
      {
        $match: {
          userId: userId,
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

    const userLifetimeSpend = vipSpendStats[0]?.totalSpend || 0;
    const sortedVipMilestones = [...vipMilestones].sort((a: any, b: any) => a.requiredSpend - b.requiredSpend);

    for (const vipMilestone of sortedVipMilestones) {
      if (userLifetimeSpend >= vipMilestone.requiredSpend) {
        const vipAssignmentResult = await assignMilestoneReward(
          userId,
          vipMilestone,
          "vip",
          settings
        );

        if (vipAssignmentResult.success && vipAssignmentResult.couponCode) {
          console.log(`✅ [VIP Reward] Coupon ${vipAssignmentResult.couponCode} assigned to ${user.email}`);

          // Dispatch VIP Milestone Email
          try {
            await sendReferralEarningEmailNotification({
              to: user.email,
              customerName: user.name || "Valued VIP Customer",
              friendName: "Your Loyalty Rewards",
              conversions: 1,
              orderId: "VIP-MILESTONE",
              nextMilestoneLabel: `VIP Reward Coupon Code: ${vipAssignmentResult.couponCode}`,
            });
            console.log(`✉️ [VIP Mailer] VIP Milestone email dispatched to ${user.email}`);
          } catch (mailErr) {
            console.warn("⚠️ Failed to dispatch VIP Milestone email:", mailErr);
          }
        }
      }
    }
  } catch (vipError) {
    console.error("⚠️ [VIP Processing Engine] Unexpected error:", vipError);
  }
}

// ================================================================
// 🚀 MAIN ENGINE: Track Order Referral & VIP Conversions
// ================================================================
export async function trackOrderReferralConversion(
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await connectMongoose();

    const order = await Order.findById(orderId).lean<IOrder>();
    if (!order) {
      return { success: false, message: "Order reference not found on Cluster A." };
    }

    if (order.paymentStatus !== "Paid") {
      return { success: false, message: "Order is unpaid. Conversion bypassed." };
    }

    if (!order.userId || !mongoose.Types.ObjectId.isValid(order.userId)) {
      return { success: true, message: "Order userId is not a valid User ObjectId. Conversion bypassed." };
    }

    // 1. UNIVERSAL VIP MILESTONE CHECK (Runs for EVERY customer: Organic + Referred)
    await evaluateVipShoppingMilestones(order.userId.toString());

    // 2. REFERRAL CONVERSION CHECK
    const buyer = await User.findById(order.userId)
      .select("name email referredBy")
      .lean<IUser>();

    if (!buyer || !buyer.referredBy) {
      return { success: true, message: "Buyer was not referred. Organic VIP check completed." };
    }

    if (!mongoose.Types.ObjectId.isValid(buyer.referredBy.toString())) {
      return { success: true, message: "Buyer referredBy ID is not valid. Conversion bypassed." };
    }

    // ANTI-CHEAT: First purchase only for referral commission
    const otherPaidOrdersCount = await Order.countDocuments({
      userId: order.userId,
      paymentStatus: "Paid",
      _id: { $ne: order._id },
    });

    if (otherPaidOrdersCount > 0) {
      console.warn(`[Anti-Fraud Guard] Multi-order referral exploit blocked for buyer userId: ${order.userId}`);
      return { success: false, message: "Not the first successful purchase. Referral conversion blocked." };
    }

    const pendingReferral = await Referral.findOne({
      referredUserId: buyer._id,
      status: "pending",
    });

    if (!pendingReferral) {
      return { success: true, message: "Referral is already converted or does not exist." };
    }

    const referrer = await User.findById(buyer.referredBy)
      .select("name email")
      .lean<IUser>();

    if (!referrer) {
      // ✅ FIX: Changed typo 'false: false' to 'success: false' to resolve ts(2353) compiler error
      return { success: false, message: "Referrer profile no longer exists on Database." };
    }

    const existingConversions = await Referral.countDocuments({
      referrerId: referrer._id,
      status: { $in: ["converted", "paid"] },
    });
    const updatedConversionsTotal = existingConversions + 1;

    let settings: any = {};
    try {
      settings = await getCachedSettings();
    } catch (e) {
      settings = {};
    }

    const milestones = settings?.referralMilestones || [];
    const sortedMilestones = [...milestones].sort(
      (a: any, b: any) => a.requiredConversions - b.requiredConversions
    );

    const nextMilestone = sortedMilestones.find(
      (m: any) => updatedConversionsTotal < m.requiredConversions
    );
    const nextMilestoneLabel = nextMilestone
      ? nextMilestone.rewardLabel
      : "the ultimate loyalty tier";

    // UPDATE REFERRAL LEDGER
    try {
      await Referral.updateOne(
        { _id: pendingReferral._id },
        {
          $set: {
            status: "converted",
            orderId: order.orderId,
            convertedAt: new Date(),
          },
        }
      );
      console.log(
        `📡 [Referral Converted] Friend: ${buyer.email} -> Referrer: ${referrer.email}. Total conversions: ${updatedConversionsTotal}`
      );
    } catch (updateError) {
      console.error("CRITICAL: Failed to update referral status:", updateError);
      return { success: false, message: "Failed to update referral ledger." };
    }

    // 🎁 REFERRAL MILESTONE REWARD
    try {
      const previousConversions = existingConversions;
      const currentConversions = updatedConversionsTotal;

      const newlyUnlockedMilestone = sortedMilestones.find(
        (m: any) => previousConversions < m.requiredConversions && currentConversions >= m.requiredConversions
      );

      if (newlyUnlockedMilestone) {
        console.log(
          `🏆 [Milestone Unlocked] Referrer ${referrer.email} reached ${newlyUnlockedMilestone.requiredConversions} conversions.`
        );

        const assignmentResult = await assignMilestoneReward(
          referrer._id.toString(),
          newlyUnlockedMilestone,
          "referral",
          settings
        );

        if (assignmentResult.success) {
          console.log(
            `✅ [Milestone Reward] Coupon ${assignmentResult.couponCode} assigned to ${referrer.email}`
          );
        }
      }
    } catch (milestoneError) {
      console.error("⚠️ [Milestone Processing] Unexpected error:", milestoneError);
    }

    // ✉️ EMAIL NOTIFICATION TO REFERRER
    try {
      await sendReferralEarningEmailNotification({
        to: referrer.email,
        customerName: referrer.name,
        friendName: buyer.name,
        conversions: updatedConversionsTotal,
        orderId: order.orderId,
        nextMilestoneLabel,
      });
      console.log(`✉️ [Loyalty Mailer] Email sent to ${referrer.email}`);
    } catch (emailError) {
      console.error("⚠️ LOYALTY PORTAL WARNING: Failed to send referral earning email:", emailError);
    }

    return { success: true };

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("CRITICAL CONVERSION ENGINE EXCEPTION:", errorMsg);
    return { success: false, message: errorMsg };
  }
}