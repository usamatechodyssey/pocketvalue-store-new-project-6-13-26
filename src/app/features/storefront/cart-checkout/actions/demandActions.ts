// src/features/storefront/cart-checkout/actions/demandActions.ts

"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import CustomerRequest from "@/models/CustomerRequest";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// ✅ FIX: Only redis (ratelimiter removed)
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

const RequestSchema = z.object({
  productId: z.string().optional(),
  requestedProductName: z.string().optional(),
  requestType: z.enum(['restock', 'missing_variant', 'missing_product']),
  email: z.email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  selectedAttributes: z.record(z.string(), z.string()).optional(),
  customDetails: z.string().optional(),
  urgencyLevel: z.enum(['normal', 'urgent']),
  sourcePath: z.string().optional(),
});

export async function submitDemandRequest(formData: z.infer<typeof RequestSchema>) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || 
               headerList.get("x-real-ip") || 
               headerList.get("cf-connecting-ip") ||
               "127.0.0.1";

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("pv_session_id")?.value || "no-session";
    
    const rateLimitKey = `rate:demand:${sessionId}:${ip}`;
    
    // ✅ REPLACED: Raw Redis Rate Limiter (5 requests per 10 seconds)
    let rateLimitSuccess = true;
    try {
      const current = await redis.incr(rateLimitKey);
      if (current === 1) await redis.expire(rateLimitKey, 10);
      if (current > 5) rateLimitSuccess = false;
    } catch {
      // Redis down -> deny to be safe
      rateLimitSuccess = false;
    }

    if (!rateLimitSuccess) {
      return { success: false, message: "Too many requests. Please try again later." };
    }

    const validation = RequestSchema.safeParse(formData);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    const { 
      productId, requestedProductName, requestType, email, phone, 
      selectedAttributes, customDetails, urgencyLevel, sourcePath 
    } = validation.data;

    await connectMongoose();

    // Spam check (Duplicate pending)
    const existing = await CustomerRequest.findOne({
      email,
      requestType,
      productId: productId || undefined,
      requestedProductName: requestedProductName || undefined,
      status: 'pending'
    });

    if (existing) {
      return { 
        success: true, 
        message: "You have already submitted a sourcing request for this item! Our team is already looking for it." 
      };
    }

    await CustomerRequest.create({
      productId,
      requestedProductName,
      requestType,
      email,
      phone,
      selectedAttributes,
      customDetails,
      urgencyLevel,
    });

    await logUserEvent(
      requestType === 'restock' ? 'back_in_stock_subscription' : 'form_field_interaction', 
      sourcePath || '/product/demand-capture',
      {
        productId,
        requested_product_name: requestedProductName,
        request_type: requestType,
        is_urgent: urgencyLevel === 'urgent',
        source: sourcePath || 'unknown'
      }
    );

    return { 
      success: true, 
      message: urgencyLevel === 'urgent' 
        ? "Priority Request Logged! Sourcing parameters dispatched to procurement managers."
        : "Sourcing request submitted! We will email you once we launch this item."
    };

  } catch (error: any) {
    console.error("Demand Sourcing Error:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}