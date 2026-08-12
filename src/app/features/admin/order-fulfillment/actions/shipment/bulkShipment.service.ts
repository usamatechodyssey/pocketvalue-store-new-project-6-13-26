// 📂 src/features/admin/order-fulfillment/actions/shipment/bulkShipment.service.ts (FULLY HARDENED & DUAL RESOLVED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import {
  getDefaultCourier,
  isCourierEnabled,
  type CourierKey,
} from "@/lib/adapters/courier/CourierFactory";
import { createShipment } from "./createShipment.service";
import type { BulkShipmentResult } from "./types";

// ================================================================
// ⚙️ CONFIGURATION
// ================================================================

const CONCURRENCY_LIMIT = 5; // Process 5 orders at a time to avoid rate limits & memory spikes
const MAX_BATCH_SIZE = 50;  // Maximum orders per batch

// ================================================================
// 🚀 SERVICE: BULK CREATE SHIPMENTS
// ================================================================

/**
 * Bulk create shipments for multiple orders.
 * 
 * Enterprise Features:
 * - Concurrent processing (5 orders at a time)
 * - Single DB connection (optimized)
 * - Error isolation (partial failures don't stop the batch)
 * - Idempotency check (skip already shipped orders)
 * - Dual order resolution (_id or orderId)
 * - Dual variant key matching (_key or id)
 * - Batch size limit (max 50 orders)
 * - Full audit logging
 * - RBAC protected
 * 
 * @param orderIds - Array of order IDs or order numbers to process
 * @param courierKey - Optional courier key (defaults to system default)
 * @returns BulkShipmentResult with detailed success/failure breakdown
 */
export async function bulkCreateShipments(
  orderIds: string[],
  courierKey?: CourierKey
): Promise<BulkShipmentResult> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 🛡️ 2. Validate Input
    if (!orderIds || orderIds.length === 0) {
      return {
        success: false,
        total: 0,
        processed: 0,
        failed: 0,
        results: [],
        message: "No orders selected.",
      };
    }

    if (orderIds.length > MAX_BATCH_SIZE) {
      return {
        success: false,
        total: orderIds.length,
        processed: 0,
        failed: 0,
        results: [],
        message: `Batch size exceeds maximum of ${MAX_BATCH_SIZE} orders. Please select fewer orders.`,
      };
    }

    // 🛡️ 3. Single DB Connection
    await connectMongoose();

    // 🛡️ 4. Get Default Courier (if not specified)
    let selectedCourier = courierKey;
    if (!selectedCourier) {
      const defaultCourier = await getDefaultCourier();
      selectedCourier = (defaultCourier?.key as CourierKey) || 'manual';
    }

    // 🛡️ 5. Validate Courier is Enabled
    const isEnabled = await isCourierEnabled(selectedCourier);
    if (!isEnabled && selectedCourier !== 'manual') {
      return {
        success: false,
        total: orderIds.length,
        processed: 0,
        failed: 0,
        results: [],
        message: `Courier "${selectedCourier}" is not enabled. Please enable it in Settings.`,
      };
    }

    // ================================================================
    // 🚀 6. PROCESS ORDERS CONCURRENTLY (Chunked)
    // ================================================================

    const results: BulkShipmentResult['results'] = [];
    let processedCount = 0;
    let failedCount = 0;

    /**
     * Process a single order.
     * All errors are caught and returned, never thrown.
     */
    const processOrder = async (orderId: string) => {
      try {
        // ✅ FIX 1: Dual order resolution matches either _id or orderId string
        const order = await Order.findOne({
          $or: [{ _id: orderId }, { orderId: orderId }],
        });

        if (!order) {
          return { orderId, orderNumber: 'N/A', success: false, error: 'Order not found' };
        }

        // 🛡️ 7. Idempotency Check: Skip if all items already shipped
        const totalItems = order.products.length;
        const shippedItems = order.shipments?.reduce((acc: number, s: any) => {
          return acc + (s.items?.length || 0);
        }, 0) || 0;

        if (shippedItems >= totalItems) {
          return {
            orderId: order._id.toString(),
            orderNumber: order.orderId,
            success: false,
            error: 'All items already shipped',
          };
        }

        // 🛡️ 8. Identify Unshipped Items (Dual Variant Resolution)
        const shippedProductKeys = new Set();
        order.shipments?.forEach((s: any) => {
          s.items?.forEach((item: any) => {
            shippedProductKeys.add(`${item.productId}-${item.variantKey}`);
          });
        });

        // ✅ FIX 2: Dual variant key resolution checks both _key and id properties
        const itemsToShip = order.products
          .filter((p: any) => {
            const vKey = p.variant?._key || p.variant?.id || 'default';
            const key = `${p.productId || p._id}-${vKey}`;
            return !shippedProductKeys.has(key);
          })
          .map((p: any) => ({
            productId: p.productId || p._id,
            variantKey: p.variant?._key || p.variant?.id || 'default',
            quantity: p.quantity,
          }));

        if (itemsToShip.length === 0) {
          return {
            orderId: order._id.toString(),
            orderNumber: order.orderId,
            success: false,
            error: 'No items left to ship',
          };
        }

        // 🛡️ 9. Create Shipment
        const shipmentResult = await createShipment({
          orderId: order._id.toString(),
          items: itemsToShip,
          courierKey: selectedCourier,
        });

        if (shipmentResult.success) {
          return {
            orderId: order._id.toString(),
            orderNumber: order.orderId,
            success: true,
            trackingId: shipmentResult.shipment?.trackingId,
            shipmentId: shipmentResult.shipment?.id,
          };
        } else {
          return {
            orderId: order._id.toString(),
            orderNumber: order.orderId,
            success: false,
            error: shipmentResult.message,
          };
        }
      } catch (error: any) {
        return {
          orderId,
          orderNumber: 'N/A',
          success: false,
          error: error.message || 'Unknown error',
        };
      }
    };

    // 🚀 10. Process in Concurrent Batches
    for (let i = 0; i < orderIds.length; i += CONCURRENCY_LIMIT) {
      const chunk = orderIds.slice(i, i + CONCURRENCY_LIMIT);
      
      const chunkResults = await Promise.allSettled(
        chunk.map((orderId) => processOrder(orderId))
      );

      for (const settledResult of chunkResults) {
        if (settledResult.status === 'fulfilled') {
          const result = settledResult.value;
          results.push(result);
          if (result.success) {
            processedCount++;
          } else {
            failedCount++;
          }
        } else {
          failedCount++;
          results.push({
            orderId: 'unknown',
            orderNumber: 'N/A',
            success: false,
            error: 'Unexpected promise rejection',
          });
        }
      }
    }

    // ================================================================
    // 📊 11. LOG BULK OPERATION
    // ================================================================

    await logUserEvent("crm_sync", "/admin/shipments/bulk", {
      action: "bulk_shipment_created",
      total: orderIds.length,
      processed: processedCount,
      failed: failedCount,
      courier: selectedCourier,
      timestamp: new Date().toISOString(),
    });

    return {
      success: failedCount === 0,
      total: orderIds.length,
      processed: processedCount,
      failed: failedCount,
      results,
      message: failedCount === 0
        ? `Successfully created ${processedCount} shipments.`
        : `Created ${processedCount} shipments, ${failedCount} failed.`,
    };

  } catch (error: any) {
    console.error("Bulk Create Shipments Error:", error);
    return {
      success: false,
      total: 0,
      processed: 0,
      failed: 0,
      results: [],
      message: error.message || "Failed to process bulk shipment.",
    };
  }
}