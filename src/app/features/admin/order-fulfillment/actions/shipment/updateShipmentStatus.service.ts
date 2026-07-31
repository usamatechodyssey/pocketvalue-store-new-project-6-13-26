// src/features/admin/order-fulfillment/actions/shipment/updateShipmentStatus.service.ts
"use server";

import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { restoreVariantStock } from "./helpers";
import { UpdateShipmentStatusSchema, type UpdateShipmentStatusInput } from "./types";

// ================================================================
// 🚀 SERVICE: UPDATE SHIPMENT STATUS
// ================================================================

/**
 * Update the status of an existing shipment.
 * 
 * Enterprise Features:
 * - Used by both Admin UI AND Courier Webhooks
 * - Auto-restores stock on RTO
 * - Auto-updates order status to "Delivered" when all shipments are delivered
 * - Full audit logging with old/new status tracking
 * - RBAC protected
 * 
 * @param data - UpdateShipmentStatusInput with shipmentId, status, trackingId
 * @returns Success/error response
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

    // 🛡️ 5. Update Shipment
    shipment.status = status;
    if (trackingId) shipment.trackingId = trackingId;
    shipment.updatedAt = new Date().toISOString();

    // 🛡️ 6. Handle RTO: Restore Stock
    if (status === "RTO") {
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
        await order.save();
      }
    }

    // 🛡️ 8. Save Order
    await order.save();

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
    return { success: false, message: error.message };
  }
}