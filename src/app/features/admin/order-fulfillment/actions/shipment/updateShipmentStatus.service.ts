// // 📂 src/features/admin/order-fulfillment/actions/shipment/updateShipmentStatus.service.ts (DOUBLE-RESTOCK PROTECTED)

// "use server";

// import { revalidatePath } from "next/cache";
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// import { restoreVariantStock } from "./helpers";
// import { UpdateShipmentStatusSchema, type UpdateShipmentStatusInput } from "./types";

// // ================================================================
// // 🚀 SERVICE: UPDATE SHIPMENT STATUS
// // ================================================================

// /**
//  * Update the status of an existing shipment.
//  * 
//  * Enterprise Features:
//  * - Used by both Admin UI AND Courier Webhooks
//  * - Double-restock protected: Restores stock ONLY on initial RTO transition
//  * - Auto-updates order status to "Delivered" when all shipments are delivered
//  * - Real-time event-driven Redis executive cache purge
//  * - Full audit logging with old/new status tracking
//  * - RBAC protected
//  * 
//  * @param data - UpdateShipmentStatusInput with shipmentId, status, trackingId
//  * @returns Success/error response
//  */
// export async function updateShipmentStatus(
//   data: UpdateShipmentStatusInput
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     // 🛡️ 1. RBAC Check
//     await verifyStaff(["admin", "manager", "logistics"]);

//     // 🛡️ 2. Validate Input
//     const validation = UpdateShipmentStatusSchema.safeParse(data);
//     if (!validation.success) {
//       return { success: false, message: validation.error.issues[0].message };
//     }
//     const { shipmentId, status, trackingId } = validation.data;

//     // 🛡️ 3. Find Order Containing Shipment
//     await connectMongoose();
//     const order = await Order.findOne({ "shipments.id": shipmentId });
//     if (!order) {
//       return { success: false, message: "Shipment not found." };
//     }

//     // 🛡️ 4. Find Shipment in Order
//     const shipmentIndex = order.shipments.findIndex((s: any) => s.id === shipmentId);
//     if (shipmentIndex === -1) {
//       return { success: false, message: "Shipment not found in order." };
//     }

//     const shipment = order.shipments[shipmentIndex];
//     const oldStatus = shipment.status;

//     if (oldStatus === status && !trackingId) {
//       return { success: true, message: `Shipment status is already ${status}.` };
//     }

//     // 🛡️ 5. Update Shipment
//     shipment.status = status;
//     if (trackingId) shipment.trackingId = trackingId;
//     shipment.updatedAt = new Date().toISOString();

//     // 🛡️ 6. Handle RTO: Restore Stock (DOUBLE-RESTOCK GUARD ENFORCED)
//     // ✅ FIX 1: Restores stock ONLY on initial RTO transition (prevents double-restocking exploits)
//     if (status === "RTO" && oldStatus !== "RTO") {
//       for (const item of shipment.items) {
//         await restoreVariantStock(item.productId, item.variantKey, item.quantity);
//       }
      
//       await logUserEvent("crm_sync", "/admin/shipments/update", {
//         orderId: order._id,
//         orderNumber: order.orderId,
//         action: "shipment_rto",
//         trackingId: shipment.trackingId,
//         items_restocked: shipment.items.length,
//         old_status: oldStatus,
//         new_status: status,
//       });
//     }

//     // 🛡️ 7. Handle Delivered: Auto-Update Order Status
//     if (status === "Delivered") {
//       const allDelivered = order.shipments.every((s: any) => s.status === "Delivered");
//       if (allDelivered && order.status !== "Delivered") {
//         order.status = "Delivered";
//       }
//     }

//     // 🛡️ 8. Save Order
//     await order.save();

//     // ⚡ FIX 2: Real-time Executive Cache Purge on status changes
//     try {
//       const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
//       const execCacheKeys = await redis.keys("analytics_executive:*");
//       if (execCacheKeys.length > 0) {
//         await redis.del(...execCacheKeys);
//         console.log(`⚡ Event-Driven Shipment Sync: Cleared ${execCacheKeys.length} executive cache keys.`);
//       }
//     } catch (purgeError: any) {
//       console.warn("⚠️ Executive cache purge warning:", purgeError.message);
//     }

//     // 🛡️ 9. Revalidate Admin UI
//     revalidatePath(`/admin/orders/${order._id}`);
//     revalidatePath(`/admin/orders`);

//     // 🛡️ 10. Audit Log (Non-RTO cases)
//     if (status !== "RTO") {
//       await logUserEvent("crm_sync", "/admin/shipments/update", {
//         orderId: order._id,
//         orderNumber: order.orderId,
//         action: "shipment_status_updated",
//         trackingId: shipment.trackingId,
//         old_status: oldStatus,
//         new_status: status,
//       });
//     }

//     return {
//       success: true,
//       message: `Shipment status updated to ${status}.`,
//     };
//   } catch (error: any) {
//     console.error("Update Shipment Status Error:", error);
//     return { success: false, message: error.message || "Failed to update shipment status." };
//   }
// }
// 📂 src/app/features/admin/order-fulfillment/actions/shipment/updateShipmentStatus.service.ts

"use server";

import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { restoreVariantStock } from "./helpers";
import { UpdateShipmentStatusSchema, type UpdateShipmentStatusInput } from "./types";

// ================================================================
// 🚀 SERVICE: UPDATE SHIPMENT STATUS (Webhook & API Synced)
// ================================================================

/**
 * Update the status of an existing shipment.
 * 
 * Enterprise Features:
 * - Used by both Admin UI AND Courier Webhooks
 * - Double-restock protected: Restores stock ONLY on initial RTO transition
 * - Auto-updates order status to "Delivered" when all shipments are delivered
 * - Real-time event-driven Redis cache purge across 3 dashboards (Executive, Operational, Geospatial)
 * - Full audit logging with old/new status tracking
 * - RBAC protected
 */
export async function updateShipmentStatus(
  data: UpdateShipmentStatusInput
): Promise<{ success: boolean; message: string }> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 🛡️ 2. Validate Input
    const validation = UpdateShipmentStatusSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }
    const { shipmentId, status, trackingId } = validation.data;

    // 🛡️ 3. Find Order Containing Shipment
    await connectMongoose();
    const order = await Order.findOne({ "shipments.id": shipmentId });
    if (!order) {
      return { success: false, message: "Shipment not found." };
    }

    // 🛡️ 4. Find Shipment in Order
    const shipmentIndex = order.shipments.findIndex((s: any) => s.id === shipmentId);
    if (shipmentIndex === -1) {
      return { success: false, message: "Shipment not found in order." };
    }

    const shipment = order.shipments[shipmentIndex];
    const oldStatus = shipment.status;

    if (oldStatus === status && !trackingId) {
      return { success: true, message: `Shipment status is already ${status}.` };
    }

    // 🛡️ 5. Update Shipment
    shipment.status = status;
    if (trackingId) shipment.trackingId = trackingId;
    shipment.updatedAt = new Date().toISOString();

    // 🛡️ 6. Handle RTO: Restore Stock (DOUBLE-RESTOCK GUARD ENFORCED)
    if (status === "RTO" && oldStatus !== "RTO") {
      for (const item of shipment.items) {
        await restoreVariantStock(item.productId, item.variantKey, item.quantity);
      }
      
      await logUserEvent("crm_sync", "/admin/shipments/update", {
        orderId: order._id,
        orderNumber: order.orderId,
        action: "shipment_rto",
        trackingId: shipment.trackingId,
        items_restocked: shipment.items.length,
        old_status: oldStatus,
        new_status: status,
      });
    }

    // 🛡️ 7. Handle Delivered: Auto-Update Order Status
    if (status === "Delivered") {
      const allDelivered = order.shipments.every((s: any) => s.status === "Delivered");
      if (allDelivered && order.status !== "Delivered") {
        order.status = "Delivered";
      }
    }

    // 🛡️ 8. Save Order
    await order.save();

    // ⚡ FIX: Real-time Multi-View Cache Purge (Executive, Operational, Geospatial)
    try {
      const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
      const pipeline = redis.pipeline();

      // ✅ FIX 1: Fixed the ReferenceError. Uses 'execCacheKeys' instead of undefined 'cacheKeys'
      const execCacheKeys = await redis.keys("analytics_executive:*");
      if (execCacheKeys.length > 0) pipeline.del(...execCacheKeys);

      // ✅ FIX 2: Extends cache invalidation to Operational Intelligence dashboard
      const opCacheKeys = await redis.keys("analytics_operational:*");
      if (opCacheKeys.length > 0) pipeline.del(...opCacheKeys);

      // ✅ FIX 3: Extends cache invalidation to Geospatial/RTO dashboards
      const geoCacheKeys = await redis.keys("analytics_geospatial:*");
      if (geoCacheKeys.length > 0) pipeline.del(...geoCacheKeys);

      await pipeline.exec();
      console.log(`⚡ Shipment Webhook Sync: Purged Redis caches across Executive, Operational, and Geospatial views.`);
    } catch (purgeError: any) {
      console.warn("⚠️ Executive cache purge warning:", purgeError.message);
    }

    // 🛡️ 9. Revalidate Admin UI
    revalidatePath(`/admin/orders/${order._id}`);
    revalidatePath(`/admin/orders`);

    // 🛡️ 10. Audit Log (Non-RTO cases)
    if (status !== "RTO") {
      await logUserEvent("crm_sync", "/admin/shipments/update", {
        orderId: order._id,
        orderNumber: order.orderId,
        action: "shipment_status_updated",
        trackingId: shipment.trackingId,
        old_status: oldStatus,
        new_status: status,
      });
    }

    return {
      success: true,
      message: `Shipment status updated to ${status}.`,
    };
  } catch (error: any) {
    console.error("Update Shipment Status Error:", error);
    return { success: false, message: error.message || "Failed to update shipment status." };
  }
}