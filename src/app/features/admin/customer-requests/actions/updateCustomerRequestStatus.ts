// 📂 src/app/features/admin/customer-requests/actions/updateCustomerRequestStatus.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import CustomerRequest from "@/models/CustomerRequest";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { revalidatePath } from "next/cache";

// ✅ CENTRAL MULTI-PLATFORM BROADCASTER
import { sendCustomerRequestNotificationEmail } from "@/lib/adapters/communication/CommunicationFactory";

// ================================================================
// 🚀 MAIN SERVER ACTION: UPDATE CUSTOMER REQUEST STATUS (Mongoose DB)
// ================================================================
export async function updateCustomerRequestStatus(
  requestId: string,
  newStatus: "pending" | "notified" | "ignored"
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Gating & Security Check
    await verifyStaff(["admin", "manager"]);

    if (!requestId) {
      return { success: false, message: "Missing required request identifier." };
    }

    await connectMongoose();

    // 2. Fetch active Customer Request from Transactions DB (Cluster A)
    const requestDoc = await CustomerRequest.findById(requestId);
    if (!requestDoc) {
      return { success: false, message: "Customer request not found." };
    }

    const oldStatus = requestDoc.status;
    if (oldStatus === newStatus) {
      return { success: true, message: "Status is already the same." };
    }

    // 3. Database Update
    requestDoc.status = newStatus;
    await requestDoc.save();

    // 4. Trigger Event-Driven Multi-Platform Broadcaster if approved (Notified)
    if (newStatus === "notified" && oldStatus === "pending") {
      try {
        const productName = requestDoc.requestedProductName || "Requested Product";
        const buyLink = requestDoc.productId 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/product/${requestDoc.productId}` 
          : `${process.env.NEXT_PUBLIC_BASE_URL}/`;

        // Format selected attributes nicely (e.g. Size: XL, Color: Red)
        let variantDetails = "";
        if (requestDoc.requestType === "missing_variant" && requestDoc.selectedAttributes) {
          variantDetails = Object.entries(requestDoc.selectedAttributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }

        // Dispatch parallel notification (Email + WhatsApp) via central factory
        await sendCustomerRequestNotificationEmail({
          to: requestDoc.email,
          customerName: requestDoc.email.split("@")[0], // Fallback name
          requestType: requestDoc.requestType as any,
          productName,
          variantDetails,
          buyLink,
        });

        console.log(`📡 [Broadcaster Alert] Restock notification dispatched to ${requestDoc.email}`);
      } catch (broadcastError: any) {
        console.error("❌ Failed to broadcast restock notification:", broadcastError.message);
      }
    }

    // 5. ✅ FIX: Invalidate both analytics widgets AND customer request list cache keys!
    try {
      const demandKeys = await redis.keys("analytics_behavioral_demand:*");
      if (demandKeys.length > 0) await redis.del(...demandKeys);

      const requestListKeys = await redis.keys("analytics_customer_requests_v1:*");
      if (requestListKeys.length > 0) {
        await redis.del(...requestListKeys);
        console.log(`🧹 [Cache] Purged ${requestListKeys.length} customer request list cache keys.`);
      }
    } catch (e) {}

    // 6. Next.js Cache Revalidation
    revalidatePath("/admin/customer-requests");

    return { success: true, message: "Request status updated successfully and customer notified!" };
  } catch (error: any) {
    console.error("❌ Failed to update customer request status:", error.message);
    return { success: false, message: error.message || "Failed to update status." };
  }
}