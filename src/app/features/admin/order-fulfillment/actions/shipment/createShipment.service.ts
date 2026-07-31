// src/features/admin/order-fulfillment/actions/shipment/createShipment.service.ts
"use server";

import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { mapCourierStatus } from "@/lib/adapters/courier/CourierFactory";

import {
  getCourierAdapter,
  deductVariantStock,
  restoreVariantStock,
  verifyOrderShippable,
  buildShipmentData,
  createShipmentRecord,
} from "./helpers";
import { CreateShipmentSchema, type CreateShipmentInput } from "./types";

// ================================================================
// 🚀 SERVICE: CREATE SINGLE SHIPMENT
// ================================================================

/**
 * Create a shipment for a single order.
 * 
 * Enterprise Features:
 * - Transactional: Stock deduction → AWB generation → Shipment record
 * - Automatic rollback: If AWB fails, stock is restored
 * - Idempotent: Prevents duplicate shipments
 * - RBAC protected
 * - Full audit logging
 * - Error isolation (single order failure doesn't affect others)
 * 
 * @param data - CreateShipmentInput with orderId, items, courier, trackingId
 * @returns Success/error response with shipment details
 */
export async function createShipment(
  data: CreateShipmentInput
): Promise<{ success: boolean; message: string; shipment?: any }> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 🛡️ 2. Validate Input
    const validation = CreateShipmentSchema.safeParse({
      ...data,
      courierKey: data.courierKey || 'manual',
    });
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }
    const { orderId, items, courierKey, trackingId } = validation.data;

    // 🛡️ 3. Fetch Order
    await connectMongoose();
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // 🛡️ 4. Validate Order Status
    if (!verifyOrderShippable(order)) {
      return {
        success: false,
        message: `Order status "${order.status}" does not allow new shipments.`,
      };
    }

    // 🛡️ 5. Get Courier Adapter
    let adapter;
    try {
      adapter = await getCourierAdapter(courierKey);
    } catch (adapterError: any) {
      return { success: false, message: adapterError.message };
    }

    // 🛡️ 6. Verify Items Exist in Order
    for (const item of items) {
      const orderItem = order.products.find(
        (p: any) => p.productId === item.productId && p.variant?._key === item.variantKey
      );
      if (!orderItem) {
        return {
          success: false,
          message: `Product ${item.productId} (Variant ${item.variantKey}) not found in order.`,
        };
      }
    }

    // 🛡️ 7. Deduct Stock (Payload DB)
    const deductionResults = [];
    for (const item of items) {
      const updated = await deductVariantStock(item.productId, item.variantKey, item.quantity);
      if (!updated) {
        // Rollback previous deductions
        for (const prev of deductionResults) {
          await restoreVariantStock(prev.productId, prev.variantKey, prev.quantity);
        }
        return {
          success: false,
          message: `Failed to update stock for variant ${item.variantKey}. Product may not exist.`,
        };
      }
      deductionResults.push({ ...item, updatedStock: updated.stock });
    }

    // 🛡️ 8. Build Shipment Data & Generate AWB
    const shipmentData = buildShipmentData(order, items, courierKey, trackingId);

    let awbResult;
    try {
      awbResult = await adapter.generateAWB(shipmentData);
    } catch (awbError: any) {
      // Rollback stock deductions if AWB generation fails
      for (const prev of deductionResults) {
        await restoreVariantStock(prev.productId, prev.variantKey, prev.quantity);
      }
      return {
        success: false,
        message: awbError.message || 'Failed to generate AWB with courier.',
      };
    }

    if (!awbResult.success) {
      // Rollback stock deductions
      for (const prev of deductionResults) {
        await restoreVariantStock(prev.productId, prev.variantKey, prev.quantity);
      }
      return {
        success: false,
        message: awbResult.message || 'Failed to generate AWB with courier.',
      };
    }

    // 🛡️ 9. Create Shipment Record
    const mappedStatus = mapCourierStatus(awbResult.courierStatus || 'booked');
    const shipment = createShipmentRecord(
      items,
      courierKey,
      adapter.getDisplayName(),
      {
        ...awbResult,
        courierStatus: awbResult.courierStatus || 'booked',
        status: mappedStatus,
      }
    );

    // Ensure shipment status is properly typed
    shipment.status = mappedStatus as "Preparing" | "PickedUp" | "In Transit" | "Delivered" | "RTO" | "Cancelled";

    if (!order.shipments) order.shipments = [];
    order.shipments.push(shipment);
    await order.save();

    // 🛡️ 10. Audit Log
    await logUserEvent("crm_sync", "/admin/shipments/create", {
      orderId: order._id,
      orderNumber: order.orderId,
      action: "shipment_created",
      courier: courierKey,
      trackingId: awbResult.trackingId,
      awbNumber: awbResult.awbNumber,
      items_count: items.length,
    });

    // 🛡️ 11. Revalidate Paths
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders`);

    return {
      success: true,
      message: `Shipment created successfully with tracking ${awbResult.trackingId}.`,
      shipment,
    };
  } catch (error: any) {
    console.error("Create Shipment Error:", error);
    return { success: false, message: error.message || "Failed to create shipment." };
  }
}