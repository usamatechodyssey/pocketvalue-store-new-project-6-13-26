
// src/app/api/payment/verify/[gateway]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, extractUntrustedOrderId } from '@/app/features/storefront/cart-checkout/gateways/paymentAdapter';
// ✅ Import Factory function instead of nodemailer (as configured)
import { sendOrderConfirmationEmail } from "@/lib/adapters/communication";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import UserSession from "@/models/UserSession";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// ✅ NEW: Import our decoupled loyalty background tracker
import { trackOrderReferralConversion } from "@/app/features/admin/loyalty-intelligence/actions/conversionTracker";

async function parseRequestData(req: NextRequest): Promise<Record<string, string>> {
  if (req.method === "POST") {
    try {
      return await req.json();
    } catch {
      const formData = await req.formData();
      const data: Record<string, string> = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
      return data;
    }
  } else {
    const data: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }
}

async function handler(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ gateway: string }> },
) {
  const { gateway: gatewayKey } = await paramsPromise;
  let verificationResult;
  let finalOrderId = "";

  try {
    await connectMongoose();
    console.log(`[Verify API] Received callback for gateway: ${gatewayKey}`);
    const requestData = await parseRequestData(req);

    await logUserEvent('webhook_received', `/api/payment/verify/${gatewayKey}`, {
      gateway: gatewayKey,
      timestamp: new Date().toISOString()
    });

    const untrustedOrderId = extractUntrustedOrderId(gatewayKey, requestData);
    if (!untrustedOrderId) {
      throw new Error("Could not extract Order ID from the incoming request payload.");
    }

    const orderObj = (await Order.findOne({ _id: untrustedOrderId }).lean()) as { totalPrice: number } | null;
    if (!orderObj) {
      throw new Error(`Order ${untrustedOrderId} does not exist inside our Database.`);
    }

    verificationResult = await verifyPayment(gatewayKey as any, requestData, orderObj.totalPrice);

    if (!verificationResult || !verificationResult.orderId) {
      throw new Error("Verification failed: Invalid response from payment adapter.");
    }

    finalOrderId = verificationResult.orderId;
    console.log(`[Verify API] Verification result for Order ${finalOrderId}:`, verificationResult);

    if (verificationResult.success) {
      const order = await Order.findOne({
        _id: finalOrderId,
        status: { $in: ["Pending", "On Hold"] }
      });

      if (order) {
        order.status = verificationResult.orderStatus;
        order.paymentStatus = verificationResult.paymentStatus;
        order.paymentMethod = gatewayKey;
        order.transactionId = verificationResult.transactionId;
        await order.save();

        // =================================================================
        // 🚀 NEW: LOYALTY PORTAL CONVERSION TRIGGER
        // =================================================================
        try {
          await trackOrderReferralConversion(order._id);
          console.log(`📡 [Verify API] Referral conversion processed for order ${finalOrderId}`);
        } catch (referralErr) {
          // Bypassed gracefully: Main payment flow must never crash due to loyalty logs
          console.error("⚠️ REFERRAL ERROR (Verify API): Conversion background trigger failed:", referralErr);
        }
        // =================================================================

        await logUserEvent('payment_success', `/api/payment/verify/${gatewayKey}`, {
          orderId: finalOrderId,
          gateway: gatewayKey,
          amount: order.totalPrice,
          transactionId: verificationResult.transactionId
        });

        let s2sSessionId = `s2s_${gatewayKey}_${finalOrderId}`;
        try {
          const userSessionDoc = await UserSession.findOne({ userId: order.userId }).sort({ lastPulse: -1 });
          if (userSessionDoc) {
            s2sSessionId = userSessionDoc.sessionId;
          }
        } catch (sessionErr) {
          console.warn("[Verify API] Session retrieval failed, fallback used.");
        }

        try {
          await logUserEvent('s2s_purchase', `/api/payment/verify/${gatewayKey}`, {
            orderId: finalOrderId,
            transactionId: verificationResult.transactionId,
            gateway: gatewayKey,
            amount: order.totalPrice,
            items_count: order.products.length,
            currency: 'PKR',
            sessionId: s2sSessionId
          });
        } catch (s2sError: any) {
          console.error(`[S2S Telemetry Error] Webhook telemetry failed:`, s2sError.message);
        }

        // Send email using the factory
        try {
          await sendOrderConfirmationEmail({
            to: order.shippingAddress.email,
            orderId: order.orderId,
            customerName: order.shippingAddress.fullName,
            products: order.products,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            coupon: order.coupon,
            totalPrice: order.totalPrice,
            shippingAddress: order.shippingAddress,
          });
          console.log(`[Verify API] Confirmation email sent for order ${finalOrderId}`);
        } catch (emailError) {
          console.error(`CRITICAL: Order ${finalOrderId} paid, but email failed:`, emailError);
        }
      } else {
        console.warn(`[Verify API] Order ${finalOrderId} not found or already processed.`);
      }
    } else {
      await logUserEvent('payment_failed', `/api/payment/verify/${gatewayKey}`, {
        orderId: finalOrderId,
        gateway: gatewayKey,
        reason: verificationResult.message || "Payment unsuccessful."
      });
    }
  } catch (error: any) {
    console.error("[Verify API] CRITICAL ERROR:", error);

    try {
      await logUserEvent('webhook_processing_error', `/api/payment/verify/${gatewayKey}`, {
        gateway: gatewayKey,
        error_message: error.message || "Unknown error."
      });
    } catch (telemetryErr) {
      console.error("[Verify API] Failed to log processing error telemetry:", telemetryErr);
    }

    verificationResult = {
      success: false,
      message: error.message || "Unknown error.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (verificationResult && verificationResult.success) {
    const successUrl = new URL(`/order-success/${finalOrderId}`, baseUrl);
    return NextResponse.json({
      success: true,
      message: "Payment verified",
      redirectUrl: successUrl.toString(),
    });
  } else {
    const failureUrl = new URL(`/order-failure`, baseUrl);
    failureUrl.searchParams.set("orderId", finalOrderId);
    failureUrl.searchParams.set("reason", verificationResult?.message || "Payment unsuccessful.");
    return NextResponse.json({
      success: false,
      message: verificationResult?.message || "Payment unsuccessful.",
      redirectUrl: failureUrl.toString(),
    });
  }
}

export { handler as GET, handler as POST };