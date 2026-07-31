// "use server";

// import { auth } from "@/app/auth";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter"; // ✅ Only redis
// import { ipAddress } from "@vercel/functions";
// import { NextRequest } from "next/server";
// import { headers } from "next/headers";
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { z } from "zod";
// import { VerifyCouponSchema } from "@/app/shared/lib/zodSchemas";

// // Payload Coupon Document Type Definition
// interface PayloadCouponDoc {
//   id: string; 
//   code: string;
//   description: string;
//   isActive?: boolean | null; 
//   discountType: "percentage" | "fixed" | "freeShipping";
//   discountValue?: number | null; 
//   maximumDiscount?: number | null; 
//   minimumPurchaseAmount?: number | null; 
//   startDate?: string | null; 
//   expiryDate?: string | null; 
//   totalUsageLimit?: number | null; 
//   usageLimitPerUser?: number | null; 
//   isStackable?: boolean | null; 
//   applicableTo?: "entireOrder" | "specificProducts" | "specificCategories" | null; 
//   applicableProducts?: (string | { id: string })[] | null; 
//   applicableCategories?: (string | { id: string })[] | null; 
// }

// interface SecureCartItem {
//   _id: string;
//   price: number;
//   quantity: number;
//   categoryIds?: string[];
//   variant?: {
//     _key: string;
//     name: string;
//   };
// }

// interface PayloadProductVariant {
//   id?: string;
//   _key?: string;
//   price: number;
//   salePrice?: number;
// }

// type Cart = z.infer<typeof VerifyCouponSchema>["cart"];

// interface CouponValidationResult {
//   success: boolean;
//   message: string;
//   finalDiscount?: {
//     code: string;
//     amount: number;
//     type: "percentage" | "fixed" | "freeShipping";
//     value?: number | null; 
//     maximumDiscount?: number | null; 
//   };
// }

// const mapPayloadCouponToSanity = (payloadCoupon: PayloadCouponDoc) => {
//   return {
//     _id: payloadCoupon.id, 
//     ...payloadCoupon,
//     applicableProductIds: payloadCoupon.applicableProducts?.map((p) => 
//       typeof p === "object" ? p.id : p
//     ) || [],
//     applicableCategoryIds: payloadCoupon.applicableCategories?.map((c) => 
//       typeof c === "object" ? c.id : c
//     ) || [],
//   };
// };

// export async function verifyAndApplyCoupon(
//   code: string, 
//   cart: Cart, 
//   req?: NextRequest
// ): Promise<CouponValidationResult> {
//   const session = await auth();
//   if (!session?.user?.id) {
//     return { success: false, message: "Please log in to apply a coupon." };
//   }

//   const validation = VerifyCouponSchema.safeParse({ code, cart });
//   if (!validation.success) {
//     return { success: false, message: validation.error.issues[0].message };
//   }
//   const { code: sanitizedCode, cart: validatedCart } = validation.data;

//   // ✅ FIX: Resilient IP recovery fallback for Server Action compliance
//   let ip = "127.0.0.1";
//   if (req) {
//     ip = ipAddress(req) || "127.0.0.1";
//   } else {
//     try {
//       const headerList = await headers();
//       ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
//     } catch {
//       ip = "127.0.0.1";
//     }
//   }

//   // ✅ REPLACED: Raw Redis Rate Limiter (5 requests per 10 seconds)
//   let rateLimitSuccess = true;
//   const key = `rate:coupon:${ip}`;
//   try {
//     const current = await redis.incr(key);
//     if (current === 1) await redis.expire(key, 10);
//     if (current > 5) rateLimitSuccess = false;
//   } catch {
//     // Redis down -> deny to be safe
//     rateLimitSuccess = false;
//   }

//   if (!rateLimitSuccess) {
//     return { success: false, message: "Too many requests. Please try again later." };
//   }
  
//   const payload = await getSafePayload();
//   const couponResult = await payload.find({
//     collection: "coupons",
//     where: { 
//       code: { equals: sanitizedCode },
//       isActive: { equals: true } 
//     },
//     depth: 1, 
//     limit: 1, 
//   });

//   const rawCoupon = couponResult.docs[0] as unknown as PayloadCouponDoc;
//   if (!rawCoupon) {
//     return { success: false, message: "Invalid or expired coupon code." };
//   }

//   const coupon = mapPayloadCouponToSanity(rawCoupon);

//   if (coupon.totalUsageLimit) {
//     const usageCount = await redis.get(`coupon:usage:${coupon.code}`);
//     if (usageCount !== null && Number(usageCount) >= coupon.totalUsageLimit) {
//       return { success: false, message: "This coupon has reached its maximum usage limit." };
//     }
//   }

//   if (coupon.usageLimitPerUser) {
//     await connectMongoose();
//     const userUsageCount = await Order.countDocuments({
//       userId: session.user.id,
//       "coupon.code": sanitizedCode
//     });
//     if (userUsageCount >= coupon.usageLimitPerUser) {
//       return { success: false, message: "You have already used this coupon the maximum number of times." };
//     }
//   }
  
//   const now = new Date();
//   if (coupon.startDate && new Date(coupon.startDate) > now) {
//     return { success: false, message: "This coupon is not active yet." };
//   }
//   if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
//     return { success: false, message: "This coupon has expired." };
//   }

//   // =================================================================
//   // 🛡️ CRITICAL SECURITY SHIELD: Live Price Re-Evaluation from DB B
//   // =================================================================
//   const productIds = validatedCart.items.map(item => item._id);
//   const liveDbProducts = await payload.find({
//     collection: "products",
//     where: { id: { in: productIds } },
//     depth: 1,
//     limit: 100
//   });

//   interface PayloadProduct {
//     id: string;
//     variants?: PayloadProductVariant[];
//   }

//   const dbProductMap = new Map<string, PayloadProduct>(
//     liveDbProducts.docs.map((doc: any) => [doc.id as string, doc as PayloadProduct])
//   );
  
//   const verifiedCartItems: SecureCartItem[] = [];
//   let calculatedServerSubtotal = 0;

//   for (const item of validatedCart.items as SecureCartItem[]) {
//     const dbProduct = dbProductMap.get(item._id);
//     if (!dbProduct) continue;

//     const variants = dbProduct.variants;
//     const matchingVariant = variants?.find(v => v._key === item.variant?._key || v.id === item.variant?._key);
    
//     if (matchingVariant) {
//       const actualPrice = matchingVariant.salePrice ?? matchingVariant.price;
//       const verifiedItem: SecureCartItem = {
//         ...item,
//         price: actualPrice 
//       };
//       verifiedCartItems.push(verifiedItem);
//       calculatedServerSubtotal += actualPrice * item.quantity;
//     }
//   }

//   if (coupon.minimumPurchaseAmount && calculatedServerSubtotal < coupon.minimumPurchaseAmount) {
//     return { success: false, message: `Minimum purchase of Rs. ${coupon.minimumPurchaseAmount} is required.` };
//   }

//   let applicableSubtotal = 0;
//   if (coupon.applicableTo === "entireOrder") {
//     applicableSubtotal = calculatedServerSubtotal;
//   } else if (coupon.applicableTo === "specificProducts") {
//     applicableSubtotal = verifiedCartItems
//       .filter((item) => coupon.applicableProductIds?.includes(item._id))
//       .reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
//   } else if (coupon.applicableTo === "specificCategories") {
//     applicableSubtotal = verifiedCartItems
//       .filter((item) => item.categoryIds?.some((catId: string) => coupon.applicableCategoryIds?.includes(catId)))
//       .reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
//   }

//   if (applicableSubtotal === 0 && coupon.applicableTo !== "entireOrder" && coupon.applicableTo !== undefined) {
//     return { success: false, message: "This coupon is not valid for the items in your cart." };
//   }

//   let discountAmount = 0;
//   if (coupon.discountType === "percentage") {
//     discountAmount = (applicableSubtotal * (coupon.discountValue || 0)) / 100; 
//     if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
//       discountAmount = coupon.maximumDiscount;
//     }
//   } else if (coupon.discountType === "fixed") {
//     discountAmount = (coupon.discountValue || 0); 
//     if (discountAmount > applicableSubtotal) {
//       discountAmount = applicableSubtotal;
//     }
//   } else if (coupon.discountType === "freeShipping") {
//     discountAmount = 0; 
//   }

//   if (discountAmount < 0) discountAmount = 0;
//   if (discountAmount === 0 && coupon.discountType !== "freeShipping") {
//     return { success: false, message: "This coupon resulted in no discount." };
//   }

//   return {
//     success: true,
//     message: `Coupon "${sanitizedCode}" applied successfully!`,
//     finalDiscount: {
//       code: sanitizedCode,
//       amount: Math.round(discountAmount),
//       type: coupon.discountType,
//       value: coupon.discountValue,
//       maximumDiscount: coupon.maximumDiscount,
//     }
//   };
// }
"use server";

import { auth } from "@/app/auth";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { ipAddress } from "@vercel/functions";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { z } from "zod";
import { VerifyCouponSchema } from "@/app/shared/lib/zodSchemas";

// ================================================================
// 🔧 STRICT TYPES (Eliminates 'any')
// ================================================================
interface PayloadCouponDoc {
  id: string;
  code: string;
  description: string;
  isActive?: boolean | null;
  discountType: "percentage" | "fixed" | "freeShipping";
  discountValue?: number | null;
  maximumDiscount?: number | null;
  minimumPurchaseAmount?: number | null;
  startDate?: string | null;
  expiryDate?: string | null;
  totalUsageLimit?: number | null;
  usageLimitPerUser?: number | null;
  isStackable?: boolean | null;
  applicableTo?: "entireOrder" | "specificProducts" | "specificCategories" | null;
  applicableProducts?: (string | { id: string })[] | null;
  applicableCategories?: (string | { id: string })[] | null;
  boundUserId?: string | null;
}

interface SecureCartItem {
  _id: string;
  price: number;
  quantity: number;
  categoryIds?: string[];
  variant?: {
    _key: string;
    name: string;
  };
}

interface PayloadProductVariant {
  id?: string;
  _key?: string;
  price: number;
  salePrice?: number;
}

type Cart = z.infer<typeof VerifyCouponSchema>["cart"];

interface CouponValidationResult {
  success: boolean;
  message: string;
  finalDiscount?: {
    code: string;
    amount: number;
    type: "percentage" | "fixed" | "freeShipping";
    value?: number | null;
    maximumDiscount?: number | null;
  };
}

// ================================================================
// 🔧 HELPER: Map Payload Coupon to Internal Structure
// ================================================================
const mapPayloadCouponToSanity = (payloadCoupon: PayloadCouponDoc) => {
  return {
    _id: payloadCoupon.id,
    ...payloadCoupon,
    applicableProductIds:
      payloadCoupon.applicableProducts?.map((p) =>
        typeof p === "object" ? p.id : p
      ) || [],
    applicableCategoryIds:
      payloadCoupon.applicableCategories?.map((c) =>
        typeof c === "object" ? c.id : c
      ) || [],
  };
};

// ================================================================
// 🎯 MAIN: Verify & Apply Coupon
// ================================================================
export async function verifyAndApplyCoupon(
  code: string,
  cart: Cart,
  req?: NextRequest
): Promise<CouponValidationResult> {
  // 1. AUTH Check
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Please log in to apply a coupon." };
  }

  // 2. Zod Validation
  const validation = VerifyCouponSchema.safeParse({ code, cart });
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }
  const { code: sanitizedCode, cart: validatedCart } = validation.data;

  // 3. IP Extraction (for rate limiting - soft enforcement)
  let ip = "127.0.0.1";
  if (req) {
    ip = ipAddress(req) || "127.0.0.1";
  } else {
    try {
      const headerList = await headers();
      ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    } catch {
      ip = "127.0.0.1";
    }
  }

  // 4. Rate Limiter (Soft Check - Redis down par allow)
  // ✅ ENTERPRISE FIX: Agar Redis down ho, toh allow karo (checkout block nahi hona chahiye)
  let rateLimitSuccess = true;
  const key = `rate:coupon:${ip}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, 10);
    if (current > 5) rateLimitSuccess = false;
  } catch {
    // Redis down -> allow (soft fail)
    rateLimitSuccess = true;
    console.warn("⚠️ [Coupon] Redis rate limiter down. Allowing request.");
  }

  if (!rateLimitSuccess) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  // 5. Fetch Coupon from Payload
  let rawCoupon: PayloadCouponDoc | null = null;
  try {
    const payload = await getSafePayload();
    const couponResult = await payload.find({
      collection: "coupons",
      where: {
        code: { equals: sanitizedCode },
        isActive: { equals: true },
      },
      depth: 1,
      limit: 1,
    });
    rawCoupon = couponResult.docs[0] as unknown as PayloadCouponDoc;
  } catch (payloadError) {
    console.error("⚠️ [Coupon] Payload fetch failed:", payloadError);
    return {
      success: false,
      message: "Unable to verify coupon at this time. Please try again.",
    };
  }

  if (!rawCoupon) {
    return { success: false, message: "Invalid or expired coupon code." };
  }

  const coupon = mapPayloadCouponToSanity(rawCoupon);

  // ================================================================
  // 🛡️ LOYALTY PORTAL ANTI-FRAUD SHIELD: Bound Coupon Verification
  // ================================================================
  // ✅ ENTERPRISE FIX: Strict check, case-sensitive (IDs are case-sensitive in MongoDB/Payload)
  if (coupon.boundUserId && coupon.boundUserId.trim() !== "") {
    if (coupon.boundUserId !== session.user.id) {
      console.warn(
        `[Anti-Fraud Alert] User ${session.user.email} attempted to hijack bound coupon: ${coupon.code}`
      );
      return {
        success: false,
        message: "This coupon is private and can only be used by the verified recipient.",
      };
    }
  }
  // ================================================================

  // 6. Usage Limits (Redis + MongoDB)
  // Total usage limit
  if (coupon.totalUsageLimit) {
    try {
      const usageCount = await redis.get(`coupon:usage:${coupon.code}`);
      if (usageCount !== null && Number(usageCount) >= coupon.totalUsageLimit) {
        return { success: false, message: "This coupon has reached its maximum usage limit." };
      }
    } catch (redisError) {
      console.warn(`⚠️ [Coupon] Redis usage check failed for ${coupon.code}. Falling back to DB.`);
      // Fallback to MongoDB count (slower but accurate)
      await connectMongoose();
      const dbUsageCount = await Order.countDocuments({
        "coupon.code": coupon.code,
      });
      if (dbUsageCount >= coupon.totalUsageLimit) {
        return { success: false, message: "This coupon has reached its maximum usage limit." };
      }
    }
  }

  // Per-user usage limit
  if (coupon.usageLimitPerUser) {
    try {
      await connectMongoose();
      const userUsageCount = await Order.countDocuments({
        userId: session.user.id,
        "coupon.code": sanitizedCode,
      });
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return {
          success: false,
          message: "You have already used this coupon the maximum number of times.",
        };
      }
    } catch (dbError) {
      console.warn(`⚠️ [Coupon] DB fallback for user usage failed:`, dbError);
      // If we can't check, block to be safe (or allow? We block to prevent abuse).
      return {
        success: false,
        message: "Unable to verify coupon usage. Please try again.",
      };
    }
  }

  // 7. Date Range Validation
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { success: false, message: "This coupon is not active yet." };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { success: false, message: "This coupon has expired." };
  }

  // ================================================================
  // 💰 SERVER-SIDE PRICE RE-EVALUATION (Anti-Tampering)
  // ================================================================
  const productIds = validatedCart.items.map((item) => item._id);
  let liveDbProducts: any[] = [];
  try {
    const payload = await getSafePayload();
    const result = await payload.find({
      collection: "products",
      where: { id: { in: productIds } },
      depth: 1,
      limit: 100,
    });
    liveDbProducts = result.docs;
  } catch (productError) {
    console.error("⚠️ [Coupon] Failed to fetch products for price re-evaluation:", productError);
    return {
      success: false,
      message: "Unable to verify product prices. Please refresh and try again.",
    };
  }

  const dbProductMap = new Map<string, any>(
    liveDbProducts.map((doc: any) => [doc.id as string, doc])
  );

  const verifiedCartItems: SecureCartItem[] = [];
  let calculatedServerSubtotal = 0;

  for (const item of validatedCart.items as SecureCartItem[]) {
    const dbProduct = dbProductMap.get(item._id);
    if (!dbProduct) {
      // Product no longer exists => skip or fail? We'll skip and log warning.
      console.warn(`⚠️ [Coupon] Product ${item._id} not found in DB. Skipping from coupon eligibility.`);
      continue;
    }

    const variants = dbProduct.variants;
    const matchingVariant = variants?.find(
      (v: any) => v._key === item.variant?._key || v.id === item.variant?._key
    );

    if (matchingVariant) {
      const actualPrice = matchingVariant.salePrice ?? matchingVariant.price;
      const verifiedItem: SecureCartItem = {
        ...item,
        price: actualPrice,
      };
      verifiedCartItems.push(verifiedItem);
      calculatedServerSubtotal += actualPrice * item.quantity;
    } else {
      console.warn(`⚠️ [Coupon] Variant not found for product ${item._id}. Skipping.`);
    }
  }

  if (verifiedCartItems.length === 0 && validatedCart.items.length > 0) {
    return {
      success: false,
      message: "Unable to validate cart items. Please refresh your cart.",
    };
  }

  // 8. Minimum Purchase Check
  if (coupon.minimumPurchaseAmount && calculatedServerSubtotal < coupon.minimumPurchaseAmount) {
    return {
      success: false,
      message: `Minimum purchase of Rs. ${coupon.minimumPurchaseAmount.toLocaleString()} is required.`,
    };
  }

  // 9. Applicable Items Filter
  let applicableSubtotal = 0;
  if (coupon.applicableTo === "entireOrder") {
    applicableSubtotal = calculatedServerSubtotal;
  } else if (coupon.applicableTo === "specificProducts") {
    applicableSubtotal = verifiedCartItems
      .filter((item) => coupon.applicableProductIds?.includes(item._id))
      .reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  } else if (coupon.applicableTo === "specificCategories") {
    applicableSubtotal = verifiedCartItems
      .filter((item) =>
        item.categoryIds?.some((catId: string) =>
          coupon.applicableCategoryIds?.includes(catId)
        )
      )
      .reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  }

  if (applicableSubtotal === 0 && coupon.applicableTo !== "entireOrder" && coupon.applicableTo !== undefined) {
    return {
      success: false,
      message: "This coupon is not valid for the items in your cart.",
    };
  }

  // 10. Calculate Discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (applicableSubtotal * (coupon.discountValue || 0)) / 100;
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue || 0;
    if (discountAmount > applicableSubtotal) {
      discountAmount = applicableSubtotal;
    }
  } else if (coupon.discountType === "freeShipping") {
    discountAmount = 0;
  }

  if (discountAmount < 0) discountAmount = 0;
  if (discountAmount === 0 && coupon.discountType !== "freeShipping") {
    return { success: false, message: "This coupon resulted in no discount." };
  }

  // 11. SUCCESS
  return {
    success: true,
    message: `Coupon "${sanitizedCode}" applied successfully!`,
    finalDiscount: {
      code: sanitizedCode,
      amount: Math.round(discountAmount),
      type: coupon.discountType,
      value: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount,
    },
  };
}