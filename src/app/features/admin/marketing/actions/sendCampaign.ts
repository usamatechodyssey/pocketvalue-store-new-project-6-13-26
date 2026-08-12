
// // 📂 src/app/features/admin/marketing/actions/sendCampaign.ts (FULLY HARDENED & ATOMIC LOCK PROTECTED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import User from "@/models/User";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// import { CommunicationFactory } from "@/lib/adapters/communication/CommunicationFactory";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { Types } from "mongoose"; // ✅ BSON Shield

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface SendCampaignResult {
//   success: boolean;
//   sentCount: number;
//   failedCount: number;
//   errors: string[];
//   message: string;
// }

// // ================================================================
// // 🔧 HELPER: Send emails with throttling (Enterprise)
// // ================================================================
// async function sendEmailsWithThrottle(
//   recipients: { email: string; name?: string; userId?: string }[],
//   subject: string,
//   htmlContent: string,
//   senderName?: string
// ): Promise<{ sent: number; failed: number; errors: string[] }> {
//   const CONCURRENCY_LIMIT = 10;
//   const BATCH_DELAY_MS = 1000;
//   const sent: string[] = [];
//   const failed: string[] = [];
//   const errorLogs: string[] = [];

//   // Get the communication adapter for marketing emails
//   const adapter = await CommunicationFactory.getAdapter("marketing");

//   for (let i = 0; i < recipients.length; i += CONCURRENCY_LIMIT) {
//     const batch = recipients.slice(i, i + CONCURRENCY_LIMIT);

//     const batchPromises = batch.map(async (recipient) => {
//       try {
//         let personalizedContent = htmlContent;
//         if (recipient.name) {
//           personalizedContent = personalizedContent.replace(/{{name}}/g, recipient.name);
//         }
//         if (recipient.email) {
//           personalizedContent = personalizedContent.replace(/{{email}}/g, recipient.email);
//         }
//         if (senderName) {
//           personalizedContent = personalizedContent.replace(/{{senderName}}/g, senderName);
//         }

//         await adapter.sendCustomEmail({
//           to: recipient.email,
//           customerName: recipient.name || "Valued Customer",
//           subject: subject,
//           message: personalizedContent,
//         });

//         return { success: true, email: recipient.email };
//       } catch (error: any) {
//         console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
//         return { success: false, email: recipient.email, error: error.message };
//       }
//     });

//     const results = await Promise.all(batchPromises);

//     for (const result of results) {
//       if (result.success) {
//         sent.push(result.email);
//       } else {
//         failed.push(result.email);
//         errorLogs.push(`${result.email}: ${result.error}`);
//       }
//     }

//     // Throttle between batches
//     if (i + CONCURRENCY_LIMIT < recipients.length) {
//       await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
//     }
//   }

//   return {
//     sent: sent.length,
//     failed: failed.length,
//     errors: errorLogs,
//   };
// }

// // ================================================================
// // 🚀 MAIN ACTION
// // ================================================================
// export async function sendCampaign({
//   userIds,
//   emails,
//   subject,
//   htmlContent,
//   senderName = "PocketValue Team",
// }: {
//   userIds?: string[];
//   emails?: string[];
//   subject: string;
//   htmlContent: string;
//   senderName?: string;
// }): Promise<SendCampaignResult> {
//   // 1. Security: Only admin/manager can send campaigns
//   await verifyStaff(["admin", "manager"]);

//   // 2. Validate Input
//   if ((!userIds || userIds.length === 0) && (!emails || emails.length === 0)) {
//     return {
//       success: false,
//       sentCount: 0,
//       failedCount: 0,
//       errors: ["No recipients provided."],
//       message: "No recipients provided.",
//     };
//   }

//   if (!subject || subject.trim().length === 0) {
//     return {
//       success: false,
//       sentCount: 0,
//       failedCount: 0,
//       errors: ["Email subject is required."],
//       message: "Email subject is required.",
//     };
//   }

//   if (!htmlContent || htmlContent.trim().length === 0) {
//     return {
//       success: false,
//       sentCount: 0,
//       failedCount: 0,
//       errors: ["Email content is required."],
//       message: "Email content is required.",
//     };
//   }

//   // 3. Redis Lock: Prevent duplicate campaign runs
//   const lockKey = "campaign_lock:send_bulk";
//   const lockAcquired = await redis.set(lockKey, "locked", { nx: true, ex: 60 });

//   if (!lockAcquired) {
//     return {
//       success: false,
//       sentCount: 0,
//       failedCount: 0,
//       errors: ["Another campaign is currently in progress. Please wait."],
//       message: "Campaign already in progress.",
//     };
//   }

//   try {
//     await connectMongoose();

//     // 4. Build Recipient List
//     let recipientList: { email: string; name?: string; userId?: string }[] = [];

//     if (userIds && userIds.length > 0) {
//       // ✅ BSON SHIELD: Filter valid ObjectIds before querying User
//       const validUserObjectIds = userIds.filter((id) => Types.ObjectId.isValid(String(id)));

//       if (validUserObjectIds.length > 0) {
//         const users = (await User.find(
//           { _id: { $in: validUserObjectIds } },
//           { email: 1, name: 1 }
//         ).lean()) as unknown as { _id: string; email: string; name: string }[];

//         recipientList = users.map((user) => ({
//           email: user.email,
//           name: user.name || undefined,
//           userId: String(user._id),
//         }));
//       }
//     } else if (emails && emails.length > 0) {
//       recipientList = emails.map((email) => ({
//         email,
//         name: undefined,
//         userId: undefined,
//       }));
//     }

//     if (recipientList.length === 0) {
//       return {
//         success: false,
//         sentCount: 0,
//         failedCount: 0,
//         errors: ["No valid recipients found."],
//         message: "No valid recipients found.",
//       };
//     }

//     // 5. Send Emails with Throttling
//     const result = await sendEmailsWithThrottle(
//       recipientList,
//       subject,
//       htmlContent,
//       senderName
//     );

//     // 6. Telemetry: Log campaign send
//     await logUserEvent("campaign_sent", "/admin/marketing-hub", {
//       recipientCount: recipientList.length,
//       sentCount: result.sent,
//       failedCount: result.failed,
//       subject,
//       senderName,
//       timestamp: new Date().toISOString(),
//     });

//     return {
//       success: true,
//       sentCount: result.sent,
//       failedCount: result.failed,
//       errors: result.errors,
//       message: `Campaign sent to ${result.sent} recipients. ${result.failed} failed.`,
//     };
//   } catch (error: any) {
//     console.error("❌ Campaign Error:", error.message);
//     return {
//       success: false,
//       sentCount: 0,
//       failedCount: 0,
//       errors: [error.message || "Internal server error."],
//       message: "Failed to send campaign.",
//     };
//   } finally {
//     // ✅ ATOMIC LOCK RELEASE: Guaranteed execution in finally block
//     await redis.del(lockKey);
//   }
// }
// 📂 src/app/features/admin/marketing/actions/sendCampaign.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { Types } from "mongoose";

// ✅ NEW BROADCASTER CONVENIENCE EXPORT
import { sendCampaignBroadcastEmail } from "@/lib/adapters/communication/CommunicationFactory";

// ================================================================
// ✅ TYPES
// ================================================================
export interface SendCampaignResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: string[];
  message: string;
}

// ================================================================
// 🔧 HELPER: Send emails with throttling (Enterprise Broadcaster)
// ================================================================
async function sendEmailsWithThrottle(
  recipients: { email: string; name?: string; userId?: string }[],
  subject: string,
  htmlContent: string,
  senderName?: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const CONCURRENCY_LIMIT = 10;
  const BATCH_DELAY_MS = 1000;
  const sent: string[] = [];
  const failed: string[] = [];
  const errorLogs: string[] = [];

  for (let i = 0; i < recipients.length; i += CONCURRENCY_LIMIT) {
    const batch = recipients.slice(i, i + CONCURRENCY_LIMIT);

    const batchPromises = batch.map(async (recipient) => {
      try {
        let personalizedContent = htmlContent;
        if (recipient.name) {
          personalizedContent = personalizedContent.replace(/{{name}}/g, recipient.name);
        }
        if (recipient.email) {
          personalizedContent = personalizedContent.replace(/{{email}}/g, recipient.email);
        }
        if (senderName) {
          personalizedContent = personalizedContent.replace(/{{senderName}}/g, senderName);
        }

        // ✅ FIX: Calls sendCampaignBroadcastEmail directly to support parallel Multi-Platform dispatching (Email + WhatsApp)
        await sendCampaignBroadcastEmail({
          to: recipient.email,
          customerName: recipient.name || "Valued Customer",
          subject: subject,
          htmlContent: personalizedContent,
        });

        return { success: true, email: recipient.email };
      } catch (error: any) {
        console.error(`❌ Failed to send campaign to ${recipient.email}:`, error.message);
        return { success: false, email: recipient.email, error: error.message };
      }
    });

    const results = await Promise.all(batchPromises);

    for (const result of results) {
      if (result.success) {
        sent.push(result.email);
      } else {
        failed.push(result.email);
        errorLogs.push(`${result.email}: ${result.error}`);
      }
    }

    if (i + CONCURRENCY_LIMIT < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return {
    sent: sent.length,
    failed: failed.length,
    errors: errorLogs,
  };
}

// ================================================================
// 🚀 MAIN ACTION
// ================================================================
export async function sendCampaign({
  userIds,
  emails,
  subject,
  htmlContent,
  senderName = "PocketValue Team",
}: {
  userIds?: string[];
  emails?: string[];
  subject: string;
  htmlContent: string;
  senderName?: string;
}): Promise<SendCampaignResult> {
  // 1. Security check
  await verifyStaff(["admin", "manager"]);

  // 2. Validate Input
  if ((!userIds || userIds.length === 0) && (!emails || emails.length === 0)) {
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: ["No recipients provided."],
      message: "No recipients provided.",
    };
  }

  if (!subject || subject.trim().length === 0) {
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: ["Email subject is required."],
      message: "Email subject is required.",
    };
  }

  if (!htmlContent || htmlContent.trim().length === 0) {
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: ["Email content is required."],
      message: "Email content is required.",
    };
  }

  // 3. Redis Lock
  const lockKey = "campaign_lock:send_bulk";
  const lockAcquired = await redis.set(lockKey, "locked", { nx: true, ex: 60 });

  if (!lockAcquired) {
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: ["Another campaign is currently in progress. Please wait."],
      message: "Campaign already in progress.",
    };
  }

  try {
    await connectMongoose();

    // 4. Build Recipient List
    let recipientList: { email: string; name?: string; userId?: string }[] = [];

    if (userIds && userIds.length > 0) {
      const validUserObjectIds = userIds.filter((id) => Types.ObjectId.isValid(String(id)));

      if (validUserObjectIds.length > 0) {
        const users = (await User.find(
          { _id: { $in: validUserObjectIds } },
          { email: 1, name: 1 }
        ).lean()) as unknown as { _id: string; email: string; name: string }[];

        recipientList = users.map((user) => ({
          email: user.email,
          name: user.name || undefined,
          userId: String(user._id),
        }));
      }
    } else if (emails && emails.length > 0) {
      recipientList = emails.map((email) => ({
        email,
        name: undefined,
        userId: undefined,
      }));
    }

    if (recipientList.length === 0) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: ["No valid recipients found."],
        message: "No valid recipients found.",
      };
    }

    // 5. Send Emails with Throttling
    const result = await sendEmailsWithThrottle(
      recipientList,
      subject,
      htmlContent,
      senderName
    );

    // 6. Telemetry: Log campaign send
    await logUserEvent("campaign_sent", "/admin/marketing-hub", {
      recipientCount: recipientList.length,
      sentCount: result.sent,
      failedCount: result.failed,
      subject,
      senderName,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      sentCount: result.sent,
      failedCount: result.failed,
      errors: result.errors,
      message: `Campaign sent to ${result.sent} recipients. ${result.failed} failed.`,
    };
  } catch (error: any) {
    console.error("❌ Campaign Error:", error.message);
    return {
      success: false,
      sentCount: 0,
      failedCount: 0,
      errors: [error.message || "Internal server error."],
      message: "Failed to send campaign.",
    };
  } finally {
    await redis.del(lockKey);
  }
}