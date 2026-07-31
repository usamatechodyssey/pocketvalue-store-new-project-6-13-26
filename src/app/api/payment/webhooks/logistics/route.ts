import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { updateShipmentStatus } from "@/app/features/admin/order-fulfillment/actions/shipmentActions";
import { mapCourierStatus, type CourierKey } from "@/lib/adapters/courier/CourierFactory";

// ================================================================
// 📦 ENTERPRISE WEBHOOK PAYLOAD TYPES
// ================================================================

interface LogisticsWebhookPayload {
  orderId?: string;
  trackingId?: string;
  awbNumber?: string;
  courierPartner?: string;
  courierKey?: string;
  trackingStatus: string;
  status?: string; // Alternative field name
  delayReason?: string;
  estimatedDaysDelay?: number;
  timestamp?: string;
  location?: string;
  recipientName?: string;
  signature?: string;
}

// ================================================================
// 🛡️ IDEMPOTENCY CACHE (Prevents duplicate processing)
// ================================================================

const processedWebhooks = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isWebhookProcessed(webhookId: string): boolean {
  const timestamp = processedWebhooks.get(webhookId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > IDEMPOTENCY_TTL_MS) {
    processedWebhooks.delete(webhookId);
    return false;
  }
  return true;
}

function markWebhookProcessed(webhookId: string): void {
  processedWebhooks.set(webhookId, Date.now());
}

// ================================================================
// 🚀 ENTERPRISE WEBHOOK HANDLER
// ================================================================

export async function POST(req: NextRequest) {
  try {
    // ================================================================
    // 🛡️ 1. SECURE HANDSHAKE (Environment-based)
    // ================================================================
    const token = req.headers.get("x-pv-courier-handshake");
    const secret = process.env.COURIER_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === "production" && (!secret || token !== secret)) {
      console.warn(
        `🔐 [Webhook] Unauthorized attempt from ${req.headers.get("x-forwarded-for") || "unknown IP"}`
      );
      return NextResponse.json(
        { error: "Unauthorized: Invalid Logistics Token." },
        { status: 401 }
      );
    }

    // ================================================================
    // 📦 2. PARSE PAYLOAD (Flexible field names)
    // ================================================================
    const body = (await req.json()) as LogisticsWebhookPayload;

    // Extract tracking ID (supports multiple field names)
    const trackingId = body.trackingId || body.awbNumber || body.orderId;
    const courierKey = (body.courierKey || body.courierPartner || "unknown").toLowerCase() as CourierKey;
    const rawStatus = body.trackingStatus || body.status || "";
    const status = rawStatus.toLowerCase().trim();

    // Generate webhook ID for idempotency
    const webhookId = `${trackingId}-${status}-${Date.now().toString().slice(0, -3)}`;

    // ================================================================
    // 🛡️ 3. IDEMPOTENCY CHECK (Prevent duplicate processing)
    // ================================================================
    if (isWebhookProcessed(webhookId)) {
      console.log(`🔄 [Webhook] Duplicate webhook ignored: ${webhookId}`);
      return NextResponse.json(
        { success: true, message: "Duplicate webhook ignored." },
        { status: 200 }
      );
    }

    // ================================================================
    // ✅ 4. VALIDATE REQUIRED FIELDS
    // ================================================================
    if (!trackingId) {
      console.error("❌ [Webhook] Missing tracking ID in payload:", body);
      return NextResponse.json(
        { error: "Missing trackingId or awbNumber in payload." },
        { status: 400 }
      );
    }

    if (!rawStatus) {
      console.error("❌ [Webhook] Missing status in payload:", body);
      return NextResponse.json(
        { error: "Missing trackingStatus in payload." },
        { status: 400 }
      );
    }

    // ================================================================
    // 🔍 5. FIND ORDER BY TRACKING ID
    // ================================================================
    await connectMongoose();

    const order = await Order.findOne({
      "shipments.trackingId": trackingId,
    });

    if (!order) {
      console.warn(`⚠️ [Webhook] Order not found for tracking: ${trackingId}`);
      await logUserEvent("webhook_processing_error", "/api/webhooks/logistics", {
        trackingId,
        rawStatus,
        courier: courierKey,
        error: "Order not found",
      });
      return NextResponse.json(
        { error: `Order not found for tracking ID: ${trackingId}` },
        { status: 404 }
      );
    }

    // ================================================================
    // 🔍 6. FIND SHIPMENT IN ORDER
    // ================================================================
    const shipment = order.shipments?.find((s: any) => s.trackingId === trackingId);

    if (!shipment) {
      console.warn(
        `⚠️ [Webhook] Shipment not found in order ${order.orderId} for tracking: ${trackingId}`
      );
      await logUserEvent("webhook_processing_error", "/api/webhooks/logistics", {
        orderId: order._id,
        orderNumber: order.orderId,
        trackingId,
        rawStatus,
        error: "Shipment not found",
      });
      return NextResponse.json(
        { error: `Shipment not found for tracking ID: ${trackingId}` },
        { status: 404 }
      );
    }

    // ================================================================
    // 📊 7. MAP COURIER STATUS TO SYSTEM STATUS
    // ================================================================
    const mappedStatus = mapCourierStatus(rawStatus);
    const currentShipmentStatus = shipment.status || "Preparing";

    // ================================================================
    // 📊 8. CHECK FOR DELAY STATUS
    // ================================================================
    const delayKeywords = ["delayed", "held", "customs_hold", "attempt_failed", "delay", "pending"];
    const isDelayed = delayKeywords.some((keyword) => status.includes(keyword));

    if (isDelayed) {
      await logUserEvent("logistics_delay", "/api/webhooks/logistics", {
        orderId: order._id,
        orderNumber: order.orderId,
        trackingId: trackingId || "N/A",
        courier_partner: courierKey || "Unknown",
        raw_status: rawStatus,
        delay_reason: body.delayReason || "Unknown delay reason",
        estimated_delay_days: body.estimatedDaysDelay || 3,
        shipping_city: order.shippingAddress?.city || "N/A",
        webhook_id: webhookId,
      });

      console.warn(
        `🚛 [Logistics Alert] Delay recorded for order ${order.orderId} (${trackingId}) via ${courierKey}`
      );
      markWebhookProcessed(webhookId);
      return NextResponse.json({
        success: true,
        message: "Logistics delay logged.",
        status: mappedStatus,
      });
    }

    // ================================================================
    // 🚀 9. AUTO-UPDATE SHIPMENT STATUS (IF CHANGED)
    // ================================================================
    if (mappedStatus !== currentShipmentStatus) {
      console.log(
        `📡 [Webhook] Updating shipment ${trackingId} status: ${currentShipmentStatus} → ${mappedStatus}`
      );

      try {
        // Extract shipment ID
        const shipmentId = shipment.id;

        // Call the existing updateShipmentStatus action
        const result = await updateShipmentStatus({
          shipmentId: shipmentId,
          status: mappedStatus as any,
          trackingId: trackingId,
        });

        if (result.success) {
          console.log(`✅ [Webhook] Shipment ${trackingId} updated to ${mappedStatus}`);

          // =================================================================
          // 🚀 ENTERPRISE FIX: LOYALTY PORTAL CONVERSION FOR DELIVERED ORDERS
          // =================================================================
          if (mappedStatus === "Delivered") {
            // ✅ CRITICAL FIX: Mark COD orders as paid so referral conversion triggers
            if (order.paymentMethod === "COD") {
              await Order.updateOne(
                { _id: order._id },
                { $set: { paymentStatus: "Paid" } }
              );
              console.log(`📡 [Webhook] COD order ${order.orderId} marked as Paid.`);
            }

            try {
              // Dynamic import to strictly prevent circular dependency compile errors
              const { trackOrderReferralConversion } = await import(
                "@/app/features/admin/loyalty-intelligence/actions/conversionTracker"
              );
              await trackOrderReferralConversion(order._id);
              console.log(
                `📡 [Webhook] Referral conversion triggered for delivered order ${order.orderId}`
              );
            } catch (referralErr) {
              console.error(
                "⚠️ REFERRAL ERROR (Logistics Webhook): Conversion trigger failed:",
                referralErr
              );
            }
          }
          // =================================================================

          // Log successful update
          await logUserEvent("crm_sync", "/api/webhooks/logistics", {
            orderId: order._id,
            orderNumber: order.orderId,
            trackingId: trackingId,
            action: "shipment_auto_update",
            old_status: currentShipmentStatus,
            new_status: mappedStatus,
            source: "courier_webhook",
            courier: courierKey,
            webhook_id: webhookId,
          });

          markWebhookProcessed(webhookId);
          return NextResponse.json({
            success: true,
            message: `Shipment status updated to ${mappedStatus}`,
            orderNumber: order.orderId,
            trackingId,
            oldStatus: currentShipmentStatus,
            newStatus: mappedStatus,
          });
        } else {
          console.error(`❌ [Webhook] Failed to update shipment: ${result.message}`);
          return NextResponse.json(
            { success: false, error: result.message },
            { status: 500 }
          );
        }
      } catch (updateError: any) {
        console.error(`❌ [Webhook] Error updating shipment:`, updateError);
        await logUserEvent("webhook_processing_error", "/api/webhooks/logistics", {
          orderId: order._id,
          orderNumber: order.orderId,
          trackingId,
          error: updateError.message,
          webhook_id: webhookId,
        });
        return NextResponse.json(
          { error: updateError.message || "Failed to update shipment" },
          { status: 500 }
        );
      }
    } else {
      // Status hasn't changed, but still log the webhook
      console.log(`🔄 [Webhook] Shipment ${trackingId} status unchanged: ${mappedStatus}`);

      await logUserEvent("webhook_processing_error", "/api/webhooks/logistics", {
        orderId: order._id,
        orderNumber: order.orderId,
        trackingId: trackingId,
        action: "webhook_received",
        current_status: mappedStatus,
        courier: courierKey,
        webhook_id: webhookId,
        message: "Status unchanged",
      });

      markWebhookProcessed(webhookId);
      return NextResponse.json({
        success: true,
        message: "Status unchanged",
        currentStatus: mappedStatus,
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown logistics webhook error";
    console.error("❌ [Webhook] Critical Error:", errorMessage);

    try {
      await logUserEvent("webhook_processing_error", "/api/webhooks/logistics", {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}