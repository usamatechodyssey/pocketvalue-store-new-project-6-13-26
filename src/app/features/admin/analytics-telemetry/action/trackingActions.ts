"use server";

import { cookies } from "next/headers";
import connectMongoose from "@/app/shared/lib/checkout/mongoose"; 
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import AbandonedCart from "@/models/AbandonedCart";
import { auth } from "@/app/auth";
import { CleanCartItem } from "@/types";
// ✅ FIX: Only redis (ratelimiter removed)
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";
import { 
  SecureTrackingIds, 
  LiveProduct, 
  LiveProductVariant, 
  SecureTelemetryEvent 
} from "@/types"; 

async function getSecureTrackingIds(): Promise<SecureTrackingIds> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("pv_session_id")?.value;
  const visitorId = cookieStore.get("pv_visitor_id")?.value;
  return { sessionId, visitorId };
}

export async function trackSessionPulse(sessionData: {
  device?: string;
  os?: string;
  browser?: string;
  city?: string | null;
  country?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { sessionId, visitorId } = await getSecureTrackingIds();
    if (!sessionId || !visitorId) {
      return { success: false, error: "Missing active session parameters." };
    }

    const authSession = await auth();

    const updateData: Record<string, string> = {
      visitorId,
      device: sessionData.device || "desktop",
      os: sessionData.os || "Other",
      browser: sessionData.browser || "Other",
      lastPulse: new Date().toISOString(),
      isActive: "true", 
      userId: authSession?.user?.id || ""
    };

    if (sessionData.city) updateData.city = sessionData.city;
    if (sessionData.country) updateData.country = sessionData.country;

    try {
      const bufferKey = `active_sessions_buffer:${sessionId}`;
      await redis.hset(bufferKey, updateData);
      await redis.expire(bufferKey, 7200); 
      await redis.sadd("sessions_to_flush", sessionId); 
    } catch (redisWriteError: unknown) {
      console.warn("TELEMETRY WARNING: Redis pulse buffering offline. Falling back to synchronous MongoDB write.", redisWriteError);
      
      await connectMongoose();
      await UserSession.findOneAndUpdate(
        { sessionId },
        { 
          $set: { 
            visitorId,
            device: updateData.device,
            os: updateData.os,
            browser: updateData.browser,
            city: sessionData.city || null,
            country: sessionData.country || null,
            lastPulse: new Date(updateData.lastPulse),
            isActive: true,
            userId: authSession?.user?.id || null
          } 
        },
        { upsert: true, new: true }
      );
    }

    return { success: true };
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Pulse Error (Server Action):", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function trackDisconnect(): Promise<{ success: boolean }> {
  try {
    const { sessionId } = await getSecureTrackingIds();
    if (!sessionId) return { success: false };

    try {
      await redis.hset(`active_sessions_buffer:${sessionId}`, { isActive: "false", lastPulse: new Date().toISOString() });
      await redis.sadd("sessions_to_flush", sessionId);
    } catch {
      await connectMongoose();
      await UserSession.findOneAndUpdate(
        { sessionId },
        { $set: { isActive: false, lastPulse: new Date() } }
      );
    }
    return { success: true };
  } catch (e: unknown) {
    console.error("Tracking Disconnect Failure:", e instanceof Error ? e.message : String(e));
    return { success: false };
  }
}

export async function logUserEvent(
  eventType: SecureTelemetryEvent, 
  path: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { sessionId, visitorId } = await getSecureTrackingIds();
    if (!sessionId) {
      return { success: false, error: "Tracking action rejected due to invalid session." };
    }

    // ✅ REPLACED: Raw Redis Rate Limiter (5 requests per 10 seconds per session)
    let rateCheck = { success: true };
    const rateKey = `rate:event:${sessionId}`;
    try {
      const current = await redis.incr(rateKey);
      if (current === 1) await redis.expire(rateKey, 10);
      if (current > 5) rateCheck = { success: false };
    } catch {
      // Redis down -> bypass
    }

    if (!rateCheck.success) {
      return { success: false, error: "Event tracking rate limit reached." };
    }

    if (eventType === 'purchase' && metadata?.orderId) {
      const orderIdStr = String(metadata.orderId);
      const idempotencyKey = `idempotency:purchase_log:${orderIdStr}`;
      
      try {
        const isUniqueLog = await redis.set(idempotencyKey, "logged", { nx: true, ex: 86400 });
        if (!isUniqueLog) {
          console.log(`📡 [Idempotency Guard] Duplicate 'purchase' event bypassed for Order ID: ${orderIdStr}`);
          return { success: true, message: "Purchase already logged. Skipping duplicate." };
        }
      } catch (redisIdempError: unknown) {
        console.warn("Idempotency cache lock failed. Falling back to unindexed MongoDB search.", redisIdempError);
        await connectMongoose();
        const existingEvent = await UserEvent.findOne({
          eventType: 'purchase',
          'metadata.orderId': orderIdStr
        });

        if (existingEvent) {
          return { success: true, message: "Purchase already logged. Skipping duplicate." };
        }
      }
    }

    await connectMongoose();
    
    const enrichedMetadata = {
      ...metadata,
      visitorId,
      timestamp: new Date().toISOString()
    };

    await UserEvent.create({
      sessionId,
      eventType,
      path,
      metadata: enrichedMetadata,
    });
    
    return { success: true };
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Event Log Error (Server Action):", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function syncAbandonedCart(
  cartItems: CleanCartItem[],
  subtotal: number,
  contactInfo?: { email?: string; phone?: string }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("pv_session_id")?.value;
    const visitorId = cookieStore.get("pv_visitor_id")?.value;

    if (!sessionId || !visitorId) {
      return { success: false, error: "Missing session tracking parameters." };
    }

    const authSession = await auth();
    const userId = authSession?.user?.id || null;
    const userEmail = authSession?.user?.email || contactInfo?.email || null;
    const userPhone = contactInfo?.phone || null;

    await connectMongoose();

    if (!cartItems || cartItems.length === 0 || subtotal <= 0) {
      await AbandonedCart.findOneAndDelete({ sessionId });
      return { success: true, message: "Abandoned cart cleared." };
    }

    const productIds = cartItems.map(item => item._id);
    const liveProductsData = await getPayloadProductsStockStatus(productIds);
    
    const typedProducts = liveProductsData as unknown as LiveProduct[];
    const productMap = new Map(typedProducts.map(p => [p._id.toString(), p]));

    let verifiedSubtotal = 0;
    const formattedItems = [];

    for (const item of cartItems) {
      const liveProduct = productMap.get(item._id);
      if (!liveProduct) {
        console.warn(`[CartSync] Product ${item.name} not found in Payload, skipping.`);
        continue;
      }

      const activeVariant = liveProduct.variants?.find(
        (v: LiveProductVariant) => v._key === item.variant?._key || v.id === item.variant?._key
      );
      if (!activeVariant) {
        console.warn(`[CartSync] Variant not found for ${item.name}, skipping.`);
        continue;
      }

      const verifiedPrice = activeVariant.salePrice ?? activeVariant.price;
      verifiedSubtotal += verifiedPrice * item.quantity;

      formattedItems.push({
        productId: item._id,
        cartItemId: item.cartItemId,
        name: item.name,
        price: verifiedPrice,
        image: item.image || null,
        slug: item.slug,
        quantity: item.quantity,
        sku: item.sku,
        categoryIds: item.categoryIds,
        variant: item.variant ? { _key: item.variant._key, name: item.variant.name } : undefined
      });
    }

    if (formattedItems.length === 0) {
      await AbandonedCart.findOneAndDelete({ sessionId });
      return { success: true, message: "Cart contained invalid items, cleared." };
    }

    if (Math.round(verifiedSubtotal * 100) !== Math.round(subtotal * 100)) {
      console.warn(`[CartSync] Subtotal mismatch: client=${subtotal}, server=${verifiedSubtotal}. Using server value.`);
    }

    const updateFields = {
      _id: sessionId,
      sessionId,
      visitorId,
      userId: userId,
      items: formattedItems,
      subtotal: verifiedSubtotal,
      contactCaptured: !!(userEmail || userPhone),
      email: userEmail,
      phone: userPhone,
      isRecovered: false,
      lastUpdated: new Date()
    };

    await AbandonedCart.findOneAndUpdate(
      { sessionId },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    return { success: true, message: "Cart synchronized successfully." };
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Cart Sync Error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}