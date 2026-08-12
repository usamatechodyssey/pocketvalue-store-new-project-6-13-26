// 📂 src/features/admin/order-fulfillment/actions/shipment/trackShipment.service.ts (FULLY HARDENED FOR PRODUCTION)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { getCourierAdapter } from "./helpers";

import {
  mapCourierStatus,
  type CourierKey,
} from "@/lib/adapters/courier/CourierFactory";

import type { TrackShipmentResult } from "./types";

// ================================================================
// 🚀 SERVICE: TRACK SHIPMENT VIA COURIER
// ================================================================

/**
 * Track a shipment in real-time via the courier's API.
 * 
 * Enterprise Features:
 * - RBAC protected (admin, manager, logistics can track)
 * - Auto-updates shipment status if tracking shows a change
 * - Event-Driven Executive Cache Purge on status changes
 * - Full audit logging
 * - Graceful error handling
 * 
 * @param trackingId - The AWB/tracking number
 * @param courierKey - The courier identifier (tcs, leopards, postex, trax, manual)
 * @returns TrackShipmentResult with tracking data and status
 */
export async function trackShipment(
  trackingId: string,
  courierKey: CourierKey
): Promise<TrackShipmentResult> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 🛡️ 2. Validate Input
    if (!trackingId || !courierKey) {
      return {
        success: false,
        message: "Tracking ID and courier are required.",
      };
    }

    // 🛡️ 3. Get Courier Adapter
    let adapter;
    try {
      adapter = await getCourierAdapter(courierKey);
    } catch (adapterError: any) {
      return {
        success: false,
        message: adapterError.message,
      };
    }

    // 🛡️ 4. Fetch Tracking Data
    const result = await adapter.trackAWB(trackingId);

    // 🛡️ 5. Process Tracking Result
    if (result.success) {
      // 🛡️ 6. Auto-Update Shipment Status if Changed
      await connectMongoose();
      
      const order = await Order.findOne({ "shipments.trackingId": trackingId });
      
      if (order) {
        const shipment = order.shipments.find(
          (s: any) => s.trackingId === trackingId
        );
        
        if (shipment) {
          const mappedStatus = mapCourierStatus(result.status);
          
          if (mappedStatus !== shipment.status) {
            // ✅ Status changed — update database
            const oldStatus = shipment.status;
            shipment.status = mappedStatus;
            shipment.courierStatus = result.status;
            shipment.updatedAt = new Date().toISOString();
            
            if (result.deliveredAt) {
              shipment.deliveredAt = result.deliveredAt;
            }
            
            await order.save();

            // ⚡ EVENT-DRIVEN EXECUTIVE CACHE PURGE
            try {
              const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
              const execCacheKeys = await redis.keys("analytics_executive:*");
              if (execCacheKeys.length > 0) {
                await redis.del(...execCacheKeys);
                console.log(`⚡ Event-Driven Tracking Sync: Cleared ${execCacheKeys.length} executive cache keys.`);
              }
            } catch (purgeError: any) {
              console.warn("⚠️ Executive cache purge warning:", purgeError.message);
            }

            // 🛡️ 7. Audit Log for Auto-Update
            await logUserEvent("crm_sync", "/admin/shipments/track", {
              orderId: order._id,
              orderNumber: order.orderId,
              trackingId: trackingId,
              action: "shipment_auto_updated_via_track",
              old_status: oldStatus,
              new_status: mappedStatus,
              source: "tracking_api",
              courier: courierKey,
            });

            console.log(
              `📡 [Tracking] Auto-updated shipment ${trackingId}: ${oldStatus} → ${mappedStatus}`
            );
          }
        }
      }

      return {
        success: true,
        tracking: result,
        message: "Tracking retrieved successfully.",
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to track shipment.",
      };
    }
  } catch (error: any) {
    console.error("Track Shipment Error:", error);
    return {
      success: false,
      message: error.message || "Failed to track shipment.",
    };
  }
}