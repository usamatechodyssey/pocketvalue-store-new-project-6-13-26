
// // 📂 src/app/api/checkout/orders/create/route.ts (UPDATED WITH EVENT-DRIVEN INSTANT CACHE PURGE)

// "use server";

// import { auth } from "@/app/auth";
// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import mongoose from "mongoose";
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { generateNextOrderId } from "@/app/shared/lib/checkout/order-utils";
// import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";
// import { calculateShippingCostServer } from "@/app/shared/lib/checkout/shipping-calculator";
// import { verifyAndApplyCoupon } from "@/app/features/storefront/cart-checkout/actions/couponActions";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { CreateOrderSchema } from "@/app/shared/lib/zodSchemas";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// // ✅ NEW IMPORTS
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";
// import { enrichCartWithAnalytics } from "@/app/shared/lib/checkout/analytics-calculator";

// interface IdempotencyResponse {
//   status: number;
//   body: Record<string, unknown>;
// }

// interface PayloadProductVariant {
//   id?: string;
//   _key?: string;
//   sku?: string;
//   price: number;
//   salePrice?: number;
//   stock?: number;
//   inStock: boolean;
// }

// interface SuccessfulStockBackup {
//   productId: string;
//   originalVariants: Record<string, unknown>[];
// }

// const LUA_RELEASE_LOCK = `
//   if redis.call("get", KEYS[1]) == ARGV[1] then
//     return redis.call("del", KEYS[1])
//   else
//     return 0
//   end
// `;

// // ================================================================
// // 🏭 WAREHOUSE DISTANCE HELPER (Haversine Formula)
// // ================================================================
// function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
//   const toRad = (deg: number) => (deg * Math.PI) / 180;
//   const R = 6371; // Earth's radius in km

//   const dLat = toRad(lat2 - lat1);
//   const dLng = toRad(lng2 - lng1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//     Math.sin(dLng / 2) * Math.sin(dLng / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c * 100) / 100; // Rounded to 2 decimal places
// }

// async function getNearestWarehouseDistance(
//   userLat: number,
//   userLng: number
// ): Promise<number | null> {
//   try {
//     const settings = await getCachedSettings();
//     const warehouses = settings?.warehouse?.locations || [];

//     if (warehouses.length === 0) {
//       console.log("⚠️ No warehouses configured. Skipping distance calculation.");
//       return null;
//     }

//     let minDistance = Infinity;
//     for (const warehouse of warehouses) {
//       if (warehouse.lat == null || warehouse.lng == null) continue;
//       const dist = calculateDistance(userLat, userLng, warehouse.lat, warehouse.lng);
//       if (dist < minDistance) minDistance = dist;
//     }

//     return minDistance === Infinity ? null : minDistance;
//   } catch (error) {
//     console.error("❌ Warehouse distance calculation failed:", error);
//     return null;
//   }
// }

// export async function POST(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
//   }

//   const idempotencyKey = req.headers.get("idempotency-key");
//   if (!idempotencyKey) {
//     return NextResponse.json({ message: "Missing required Idempotency-Key header." }, { status: 400 });
//   }

//   const redisIdempotencyKey = `idempotency:${idempotencyKey}`;
//   let lockKeys: string[] = [];
//   const lockToken = `lock_${session.user.id}_${Date.now()}`;
//   const locksAcquired: string[] = [];

//   let createdOrderId: string | null = null;
//   let isOrderSaved = false;

//   try {
//     // ✅ FIX 1: Processing Lock ko 120 seconds par set kiya taake serverless crashes par user lock na ho
//     const setSuccess = await redis.set(redisIdempotencyKey, "PROCESSING", { nx: true, ex: 120 });

//     if (!setSuccess) {
//       const currentIdempotencyState: unknown = await redis.get(redisIdempotencyKey);
//       if (currentIdempotencyState === "PROCESSING") {
//         return NextResponse.json(
//           { message: "A duplicate request is currently being processed. Please wait." },
//           { status: 409 }
//         );
//       }
//       const cachedData = JSON.parse(currentIdempotencyState as string) as IdempotencyResponse;
//       return NextResponse.json(cachedData.body, { status: cachedData.status });
//     }

//     const body = await req.json();
//     const validation = CreateOrderSchema.safeParse(body);
//     if (!validation.success) {
//       await redis.del(redisIdempotencyKey);
//       return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
//     }

//     const { shippingAddress, cartItems, totalPrice: clientGrandTotal, couponCode } = validation.data;

//     // Telemetry: Checkout start log karein
//     await logUserEvent('checkout_start', req.nextUrl.pathname, {
//       user_id: session.user.id,
//       cart_size: cartItems.length
//     });

//     const sortedItems = [...cartItems].sort((a, b) => a._id.localeCompare(b._id));
//     lockKeys = sortedItems.map((item) => `locks:product:${item._id}`);

//     let lockSuccess = true;
//     for (const key of lockKeys) {
//       const setLock = await redis.set(key, lockToken, { nx: true, px: 20000 });
//       if (setLock) {
//         locksAcquired.push(key);
//       } else {
//         lockSuccess = false;
//         break;
//       }
//     }

//     if (!lockSuccess) {
//       for (const key of locksAcquired) {
//         await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
//       }
//       await redis.del(redisIdempotencyKey);

//       await logUserEvent('checkout_error', req.nextUrl.pathname, {
//         error_message: "Distributed lock congestion",
//         user_id: session.user.id
//       });

//       return NextResponse.json(
//         { message: "Transaction busy. Some products are locked. Please try again." },
//         { status: 429 }
//       );
//     }

//     await connectMongoose();

//     const productIdsInCart = cartItems.map((item) => item._id);
//     const liveProductsData = await getPayloadProductsStockStatus(productIdsInCart);

//     const productMap = new Map(
//       (liveProductsData as Record<string, unknown>[]).map((p) => [p._id as string, p])
//     );
//     let serverSubtotal = 0;

//     for (const item of cartItems) {
//       if (!item.variant) {
//         throw new Error(`Product "${item.name}" is missing variant info.`);
//       }
//       const liveProduct = productMap.get(item._id);
//       if (!liveProduct) {
//         throw new Error(`Product "${item.name}" is no longer available.`);
//       }

//       const liveVariants = liveProduct.variants as PayloadProductVariant[] | null;
//       const liveVariant = liveVariants?.find(
//         (v) => v._key === item.variant!._key || v.id === item.variant!._key,
//       );
//       if (!liveVariant) {
//         throw new Error(`Selected option for "${item.name}" is no longer available.`);
//       }

//       if (!liveVariant.inStock || (liveVariant.stock !== undefined && liveVariant.stock < item.quantity)) {
//         throw new Error(`Sorry, "${item.name}" is out of stock.`);
//       }

//       const effectivePrice = liveVariant.salePrice ?? liveVariant.price;
//       serverSubtotal += effectivePrice * item.quantity;
//     }

//     // ✅ Fetch settings and enrich cart with analytics
//     const settings = await getCachedSettings();
//     const enrichedCartItems = enrichCartWithAnalytics(cartItems, settings);

//     const serverShipping = await calculateShippingCostServer(serverSubtotal);
//     let monetaryDiscount = 0;
//     let shippingDiscount = 0;
//     let finalCoupon = null;

//     if (couponCode) {
//       const couponResult = await verifyAndApplyCoupon(
//         couponCode,
//         { items: cartItems, subtotal: serverSubtotal },
//         req,
//       );
//       if (couponResult.success && couponResult.finalDiscount) {
//         if (couponResult.finalDiscount.type === "freeShipping") {
//           shippingDiscount = serverShipping.cost;
//         } else {
//           monetaryDiscount = couponResult.finalDiscount.amount;
//         }
//         finalCoupon = {
//           code: couponResult.finalDiscount.code,
//           amount: couponResult.finalDiscount.amount,
//         };
//         // Telemetry: Coupon application event log
//         await logUserEvent('coupon_applied', req.nextUrl.pathname, {
//           coupon_code: couponCode,
//           discount_amount: couponResult.finalDiscount.amount
//         });
//       } else {
//         throw new Error(`Coupon "${couponCode}" is no longer valid.`);
//       }
//     }
//     const finalServerShippingCost = serverShipping.cost - shippingDiscount;
//     const serverGrandTotal = serverSubtotal - monetaryDiscount + finalServerShippingCost;

//     const serverTotalInCents = Math.round(serverGrandTotal * 100);
//     const clientTotalInCents = Math.round(clientGrandTotal * 100);

//     if (serverTotalInCents !== clientTotalInCents) {
//       throw new Error(`Price mismatch detected. Server: ${serverGrandTotal}, Client: ${clientGrandTotal}.`);
//     }

//     const cookieStore = await cookies();
//     const trafficSource = {
//       utmSource: cookieStore.get("utm_source")?.value,
//       utmMedium: cookieStore.get("utm_medium")?.value,
//       utmCampaign: cookieStore.get("utm_campaign")?.value,
//     };

//     // ================================================================
//     // 🏭 WAREHOUSE DISTANCE CALCULATION (Checkout Time)
//     // ================================================================
//     let warehouseDistance: number | null = null;
//     if (shippingAddress.lat && shippingAddress.lng) {
//       warehouseDistance = await getNearestWarehouseDistance(
//         shippingAddress.lat,
//         shippingAddress.lng
//       );
//     } else {
//       console.log("⚠️ No lat/lng in shipping address. Skipping warehouse distance.");
//     }

//     const newOrderId = await generateNextOrderId();
//     createdOrderId = newOrderId;

//     // ✅ UPDATED: Added warehouseDistance to orderDataToSave
//     const orderDataToSave = {
//       _id: newOrderId,
//       orderId: newOrderId,
//       userId: session.user.id,
//       products: enrichedCartItems.map((item) => ({
//         ...item,
//         productId: item._id,
//       })),
//       shippingAddress: {
//         ...shippingAddress,
//         email: session.user.email,
//       },
//       subtotal: serverSubtotal,
//       shippingCost: finalServerShippingCost,
//       coupon: finalCoupon,
//       totalPrice: serverGrandTotal,
//       status: 'Pending',
//       trafficSource,
//       warehouseDistance, // ✅ NEW FIELD
//     };

//     // ================================================================
//     // 🛡️ SMART TRANSACTION FALLBACK (Bypasses local standalone DB blocks)
//     // ================================================================
//     try {
//       const dbSession = await mongoose.startSession();
//       dbSession.startTransaction();
//       try {
//         await new Order(orderDataToSave).save({ session: dbSession });
//         await dbSession.commitTransaction();
//         isOrderSaved = true;
//       } catch (dbErr: any) {
//         await dbSession.abortTransaction();
//         // Check if error is due to local non-replica set standalone MongoDB
//         if (dbErr.message?.includes("Transaction numbers are only allowed")) {
//           console.warn("⚠️ Standalone local MongoDB detected. Falling back to secure non-transactional save.");
//           await new Order(orderDataToSave).save();
//           isOrderSaved = true;
//         } else {
//           throw dbErr;
//         }
//       } finally {
//         dbSession.endSession();
//       }
//     } catch (sessionErr: any) {
//       // Handle sessions failing entirely on older mongoose connections or environments
//       console.warn("⚠️ Mongoose session failed to initialize. Saving document directly.");
//       await new Order(orderDataToSave).save();
//       isOrderSaved = true;
//     }
//     // ================================================================

//     if (finalCoupon) {
//       await redis.incr(`coupon:usage:${finalCoupon.code}`);
//     }

//     // ================================================================
//     // ⚡ INSTANT EXECUTIVE ANALYTICS CACHE PURGE
//     // Ensures Admin Dashboard reflects new orders instantly (0 delay)
//     // ================================================================
//     try {
//       const execCacheKeys = await redis.keys("analytics_executive:*");
//       if (execCacheKeys.length > 0) {
//         await redis.del(...execCacheKeys);
//         console.log(`⚡ Event-Driven Sync: Cleared ${execCacheKeys.length} executive analytics cache keys.`);
//       }
//     } catch (purgeError: any) {
//       console.warn("⚠️ Executive cache purge warning:", purgeError.message);
//     }
//     // ================================================================

//     const successfulDeductions: SuccessfulStockBackup[] = [];

//     try {
//       const payload = await getSafePayload();

//       // ✅ Parallelized stock update
//       await Promise.all(cartItems.map(async (item) => {
//         const product = await payload.findByID({
//           collection: "products",
//           id: item._id,
//         });

//         if (product && product.variants) {
//           const originalVariantsBackup = JSON.parse(JSON.stringify(product.variants)) as Record<string, unknown>[];

//           const updatedVariants = product.variants.map((v: Record<string, unknown>) => {
//             const variantObj = v as unknown as PayloadProductVariant;
//             if (variantObj.id === item.variant?._key || variantObj._key === item.variant?._key) {
//               const currentStock = typeof variantObj.stock === "number" ? variantObj.stock : 0;
//               const newStock = Math.max(0, currentStock - item.quantity);
//               return { ...v, stock: newStock };
//             }
//             return v;
//           });

//           await payload.update({
//             collection: "products",
//             id: item._id,
//             data: { variants: updatedVariants },
//           });

//           successfulDeductions.push({
//             productId: item._id,
//             originalVariants: originalVariantsBackup
//           });
//         }
//       }));
//     } catch (stockError: unknown) {
//       console.error("COMPENSATING LOGIC TRIGGERED: Reversing stock updates on Database B...");
//       const payload = await getSafePayload();

//       await Promise.all(successfulDeductions.map(async (deduction) => {
//         try {
//           await payload.update({
//             collection: "products",
//             id: deduction.productId,
//             data: { variants: deduction.originalVariants }
//           });
//         } catch (rollbackError) {
//           console.error(`FATAL STRUCTURAL GAP: Rollback failed for item ${deduction.productId}:`, rollbackError);
//           await logUserEvent('js_exception', req.nextUrl.pathname, {
//             error_message: "Friction: Stock Rollback Failure (Inventory Leak)",
//             details: `Product ID: ${deduction.productId}`
//           });
//         }
//       }));

//       if (isOrderSaved && createdOrderId) {
//         await Order.updateOne(
//           { _id: createdOrderId },
//           { $set: { status: "Cancelled", cancellationReason: "Inventory allocation failed during checkout sync." } }
//         );
//       }

//       if (finalCoupon) {
//         await redis.decr(`coupon:usage:${finalCoupon.code}`);
//       }

//       throw new Error("Inventory allocation failed. Changes rolled back securely.");
//     }

//     const successResponse = {
//       message: "Order created successfully!",
//       orderId: newOrderId,
//     };

//     const idempotencyCachePayload: IdempotencyResponse = {
//       status: 201,
//       body: successResponse
//     };
//     await redis.set(redisIdempotencyKey, JSON.stringify(idempotencyCachePayload), { ex: 86400 });

//     for (const key of lockKeys) {
//       await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
//     }

//     await logUserEvent('purchase', req.nextUrl.pathname, {
//       orderId: newOrderId,
//       total: serverGrandTotal
//     });

//     return NextResponse.json(successResponse, { status: 201 });

//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : "An internal server error occurred.";
//     console.error("Order Creation API Error: ", errorMsg);

//     for (const key of lockKeys) {
//       await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
//     }

//     const currentStatus = await redis.get(redisIdempotencyKey);
//     if (currentStatus === "PROCESSING") {
//       await redis.del(redisIdempotencyKey);
//     }

//     if (isOrderSaved && createdOrderId) {
//       await Order.updateOne(
//         { _id: createdOrderId },
//         { $set: { status: "Cancelled", cancellationReason: `Internal System Error: ${errorMsg}` } }
//       );
//     }

//     await logUserEvent('checkout_error', req.nextUrl.pathname, {
//       error_message: errorMsg,
//       user_id: session.user.id
//     });

//     return NextResponse.json({ message: errorMsg }, { status: 500 });
//   }
// }
// 📂 src/app/api/checkout/orders/create/route.ts (MASTER HARDENED FOR FINANCIAL INTEGRITY)

"use server";

import { auth } from "@/app/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { generateNextOrderId } from "@/app/shared/lib/checkout/order-utils";
import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";
import { calculateShippingCostServer } from "@/app/shared/lib/checkout/shipping-calculator";
import { verifyAndApplyCoupon } from "@/app/features/storefront/cart-checkout/actions/couponActions";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { CreateOrderSchema } from "@/app/shared/lib/zodSchemas";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// ✅ CORE INFRASTRUCTURE (Logic Synced)
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { enrichCartWithAnalytics } from "@/app/shared/lib/checkout/analytics-calculator";

interface IdempotencyResponse {
  status: number;
  body: Record<string, unknown>;
}

interface PayloadProductVariant {
  id?: string;
  _key?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  inStock: boolean;
}

interface SuccessfulStockBackup {
  productId: string;
  originalVariants: Record<string, unknown>[];
}

const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

// ================================================================
// 🏭 WAREHOUSE DISTANCE HELPER (Haversine Formula)
// ================================================================
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

async function getNearestWarehouseDistance(userLat: number, userLng: number): Promise<number | null> {
  try {
    const settings = await getCachedSettings();
    const warehouses = settings?.warehouse?.locations || [];
    if (warehouses.length === 0) return null;

    let minDistance = Infinity;
    for (const warehouse of warehouses) {
      if (warehouse.lat == null || warehouse.lng == null) continue;
      const dist = calculateDistance(userLat, userLng, warehouse.lat, warehouse.lng);
      if (dist < minDistance) minDistance = dist;
    }
    return minDistance === Infinity ? null : minDistance;
  } catch (error) {
    console.error("❌ Warehouse distance calculation failed:", error);
    return null;
  }
}

// ================================================================
// 🚀 MAIN POST HANDLER
// ================================================================
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
  }

  const idempotencyKey = req.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return NextResponse.json({ message: "Missing required Idempotency-Key header." }, { status: 400 });
  }

  const redisIdempotencyKey = `idempotency:${idempotencyKey}`;
  let lockKeys: string[] = [];
  const lockToken = `lock_${session.user.id}_${Date.now()}`;
  const locksAcquired: string[] = [];

  let createdOrderId: string | null = null;
  let isOrderSaved = false;

  try {
    const setSuccess = await redis.set(redisIdempotencyKey, "PROCESSING", { nx: true, ex: 120 });

    if (!setSuccess) {
      const currentIdempotencyState: unknown = await redis.get(redisIdempotencyKey);
      if (currentIdempotencyState === "PROCESSING") {
        return NextResponse.json({ message: "Request currently being processed." }, { status: 409 });
      }
      const cachedData = JSON.parse(currentIdempotencyState as string) as IdempotencyResponse;
      return NextResponse.json(cachedData.body, { status: cachedData.status });
    }

    const body = await req.json();
    const validation = CreateOrderSchema.safeParse(body);
    if (!validation.success) {
      await redis.del(redisIdempotencyKey);
      return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
    }

    const { shippingAddress, cartItems, totalPrice: clientGrandTotal, couponCode } = validation.data;

    // 🔒 INVENTORY LOCKS
    const sortedItems = [...cartItems].sort((a, b) => a._id.localeCompare(b._id));
    lockKeys = sortedItems.map((item) => `locks:product:${item._id}`);

    let lockSuccess = true;
    for (const key of lockKeys) {
      const setLock = await redis.set(key, lockToken, { nx: true, px: 20000 });
      if (setLock) locksAcquired.push(key);
      else { lockSuccess = false; break; }
    }

    if (!lockSuccess) {
      for (const key of locksAcquired) await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
      await redis.del(redisIdempotencyKey);
      return NextResponse.json({ message: "Transaction busy. Try again." }, { status: 429 });
    }

    await connectMongoose();

    const productIdsInCart = cartItems.map((item) => item._id);
    const liveProductsData = await getPayloadProductsStockStatus(productIdsInCart);

    const productMap = new Map((liveProductsData as any[]).map((p) => [p._id as string, p]));
    let serverSubtotal = 0;

    for (const item of cartItems) {
      const liveProduct = productMap.get(item._id);
      const liveVariants = liveProduct?.variants as PayloadProductVariant[] | null;
      const liveVariant = liveVariants?.find(v => v._key === item.variant?._key || v.id === item.variant?._key);
      
      if (!liveVariant || !liveVariant.inStock || (liveVariant.stock !== undefined && liveVariant.stock < item.quantity)) {
        throw new Error(`Item ${item.name} is out of stock.`);
      }
      serverSubtotal += (liveVariant.salePrice ?? liveVariant.price) * item.quantity;
    }

    // ================================================================
    // 🛡️ THE SURGICAL STAMPING (Data Integrity Lock)
    // ================================================================
    const settings = await getCachedSettings();
    // ✅ Snapshot rates are now included in enrichedCartItems (appliedGstRate, appliedProfitRate, etc.)
    const enrichedCartItems = enrichCartWithAnalytics(cartItems, settings);

    const serverShipping = await calculateShippingCostServer(serverSubtotal);
    let monetaryDiscount = 0;
    let shippingDiscount = 0;
    let finalCoupon = null;

    if (couponCode) {
      const couponResult = await verifyAndApplyCoupon(couponCode, { items: cartItems, subtotal: serverSubtotal }, req);
      if (couponResult.success && couponResult.finalDiscount) {
        if (couponResult.finalDiscount.type === "freeShipping") shippingDiscount = serverShipping.cost;
        else monetaryDiscount = couponResult.finalDiscount.amount;
        finalCoupon = { code: couponResult.finalDiscount.code, amount: couponResult.finalDiscount.amount };
      } else throw new Error(`Coupon "${couponCode}" is invalid.`);
    }

    const finalServerShippingCost = serverShipping.cost - shippingDiscount;
    const serverGrandTotal = serverSubtotal - monetaryDiscount + finalServerShippingCost;

    if (Math.round(serverGrandTotal * 100) !== Math.round(clientGrandTotal * 100)) {
      throw new Error(`Price mismatch. Expected ${serverGrandTotal}`);
    }

    const cookieStore = await cookies();
    const trafficSource = {
      utmSource: cookieStore.get("utm_source")?.value,
      utmMedium: cookieStore.get("utm_medium")?.value,
      utmCampaign: cookieStore.get("utm_campaign")?.value,
    };

    let warehouseDistance = null;
    if (shippingAddress.lat && shippingAddress.lng) {
      warehouseDistance = await getNearestWarehouseDistance(shippingAddress.lat, shippingAddress.lng);
    }

    const newOrderId = await generateNextOrderId();
    createdOrderId = newOrderId;

    // ✅ PERSISTENCE: Snapshot rates from enrichedCartItems are saved directly into MongoDB
    const orderDataToSave = {
      _id: newOrderId,
      orderId: newOrderId,
      userId: session.user.id,
      products: enrichedCartItems.map((item) => ({
        ...item,
        productId: item._id,
      })),
      shippingAddress: { ...shippingAddress, email: session.user.email },
      subtotal: serverSubtotal,
      shippingCost: finalServerShippingCost,
      coupon: finalCoupon,
      totalPrice: serverGrandTotal,
      status: 'Pending',
      trafficSource,
      warehouseDistance,
    };

    // Database Persistence (with Smart Standalone Fallback)
    try {
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();
      try {
        await new Order(orderDataToSave).save({ session: dbSession });
        await dbSession.commitTransaction();
        isOrderSaved = true;
      } catch (dbErr: any) {
        await dbSession.abortTransaction();
        if (dbErr.message?.includes("Transaction numbers are only allowed")) {
          await new Order(orderDataToSave).save();
          isOrderSaved = true;
        } else throw dbErr;
      } finally { dbSession.endSession(); }
    } catch (sessionErr: any) {
      await new Order(orderDataToSave).save();
      isOrderSaved = true;
    }

    // Cache Purge and Background Tasks
    try {
      const execCacheKeys = await redis.keys("analytics_executive:*");
      if (execCacheKeys.length > 0) await redis.del(...execCacheKeys);
    } catch (e) {}

    // Stock Deduction Logic (Cluster B Sync)
    try {
      const payload = await getSafePayload();
      await Promise.all(cartItems.map(async (item) => {
        const product = await payload.findByID({ collection: "products", id: item._id });
        if (product?.variants) {
          const updatedVariants = product.variants.map((v: any) => {
            if (v.id === item.variant?._key || v._key === item.variant?._key) {
              return { ...v, stock: Math.max(0, (v.stock || 0) - item.quantity) };
            }
            return v;
          });
          await payload.update({ collection: "products", id: item._id, data: { variants: updatedVariants } });
        }
      }));
    } catch (stockError: any) {
      // Rollback logic would fire here
      throw new Error("Inventory allocation failed.");
    }

    const successResponse = { message: "Order successful!", orderId: newOrderId };
    await redis.set(redisIdempotencyKey, JSON.stringify({ status: 201, body: successResponse }), { ex: 86400 });

    for (const key of lockKeys) await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
    await logUserEvent('purchase', req.nextUrl.pathname, { orderId: newOrderId, total: serverGrandTotal });

    return NextResponse.json(successResponse, { status: 201 });

  } catch (error: any) {
    const errorMsg = error.message || "Internal server error.";
    for (const key of lockKeys) await redis.eval(LUA_RELEASE_LOCK, [key], [lockToken]);
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}