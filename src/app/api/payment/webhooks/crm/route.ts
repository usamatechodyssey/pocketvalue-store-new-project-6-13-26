// src/app/api/webhooks/crm/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// ✅ REMOVED: ratelimiter and ipAddress (webhooks should NOT be rate limited)

// ✅ Define webhook payload type
interface CRMWebhookPayload {
  orderId: string;
  action: "cancellation_sync" | "fraud_detection" | string;
  previousStatus?: string;
  newStatus?: string;
  fraudRiskScore?: number;
}

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. SECURE HANDSHAKE
    const authHeader = req.headers.get("Authorization");
    const secureToken = process.env.CRM_WEBHOOK_SECRET;
    if (process.env.NODE_ENV === "production" && (!authHeader || authHeader !== `Bearer ${secureToken}`)) {
      return NextResponse.json({ error: "Unauthorized: Invalid CRM Webhook Handshake" }, { status: 401 });
    }

    // ✅ REMOVED: Rate Limiting (webhooks should NOT be rate limited)

    const body = await req.json() as CRMWebhookPayload;
    const { orderId, action, previousStatus, newStatus, fraudRiskScore } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing required fields: orderId and action are mandatory." }, { status: 400 });
    }

    await connectMongoose();

    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId }] });
    if (!order) {
      return NextResponse.json({ error: `Order ${orderId} not found in database.` }, { status: 404 });
    }

    if (action === "cancellation_sync") {
      order.status = "Cancelled";
      await order.save();

      await logUserEvent('crm_sync', '/api/webhooks/crm', {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: 'crm_external_cancellation',
        previous_status: previousStatus || 'unknown',
        new_status: 'Cancelled',
        amount: order.totalPrice
      });

      console.log(`📡 [CRM Webhook] Order ${order.orderId} cancelled via CRM sync.`);
      return NextResponse.json({ success: true, message: "Order cancellation synced." });
    }

    if (action === "fraud_detection") {
      order.trafficSource = {
        ...order.trafficSource,
        fraud_flag: true,
        fraud_risk_score: fraudRiskScore || 99
      };
      await order.save();

      await logUserEvent('crm_sync', '/api/webhooks/crm', {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: 'fraud_detected',
        fraud_risk_score: fraudRiskScore || 99,
        action_taken: 'flagged_in_system'
      });

      console.warn(`⚠️ [CRM Webhook] High Fraud Risk flagged for Order ${order.orderId}.`);
      return NextResponse.json({ success: true, message: "Fraud metrics logged successfully." });
    }

    return NextResponse.json({ success: false, message: "Unhandled CRM action type." }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown webhook error";
    console.error("CRM Webhook Processing Error:", errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}