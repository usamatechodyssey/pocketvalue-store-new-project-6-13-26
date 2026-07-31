"use server";

import { auth } from "@/app/auth";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { revalidatePath } from "next/cache";
import { ProductReview } from "@/types";
import { SubmitReviewSchema } from "@/app/shared/lib/zodSchemas";
import { z } from "zod";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
// ✅ FIX: Only redis (ratelimiter removed)
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { headers } from "next/headers";

type ReviewData = z.infer<typeof SubmitReviewSchema>;

export async function submitReview(data: ReviewData): Promise<{
  success: boolean;
  message: string;
  review?: ProductReview;
}> {
  const session = await auth();
  
  if (!session?.user?.id || !session.user.name) {
    return { success: false, message: "You must be logged in to post a review." };
  }

  const validatedFields = SubmitReviewSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues[0].message,
    };
  }
  
  const { productId, rating, comment, reviewImageUrl } = validatedFields.data;

  try {
    // ================================================================
    // 🛡️ RATE LIMITING: 5 reviews per 10 seconds per user (Raw Redis)
    // ================================================================
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || 
               headerList.get("x-real-ip") || 
               "127.0.0.1";
    const rateKey = `rate:review:${session.user.id}:${ip}`;
    
    // ✅ REPLACED: Raw Redis Rate Limiter (5 requests per 10 seconds)
    let rateLimitOk = true;
    try {
      const current = await redis.incr(rateKey);
      if (current === 1) await redis.expire(rateKey, 10);
      if (current > 5) rateLimitOk = false;
    } catch {
      // Redis down -> deny to be safe
      rateLimitOk = false;
    }

    if (!rateLimitOk) {
      return { 
        success: false, 
        message: "Too many review submissions. Please try again later." 
      };
    }
    // ================================================================

    const payload = await getSafePayload();

    // ================================================================
    // 🛡️ PURCHASE VERIFICATION
    // ================================================================
    await connectMongoose();
    const hasPurchased = await Order.exists({
      userId: session.user.id,
      "products.productId": productId,
      status: { $in: ["Delivered", "Shipped", "Processing"] }
    });
    const isVerifiedPurchase = !!hasPurchased;
    // ================================================================

    let mediaId = undefined;

    // ================================================================
    // 🛡️ MIME TYPE VALIDATION
    // ================================================================
    if (reviewImageUrl && reviewImageUrl.startsWith("data:")) {
      const matches = reviewImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return { success: false, message: "Invalid image data format." };
      }
      
      const mimeType = matches[1];
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimes.includes(mimeType)) {
        return { 
          success: false, 
          message: "Only JPEG, PNG, and WEBP images are allowed." 
        };
      }
      
      const base64Data = matches[2];
      const fileBuffer = Buffer.from(base64Data, "base64");
      const extension = mimeType.split("/")[1] || "jpg";
      const fileName = `review-${Date.now()}.${extension}`;

      const mediaDoc = await payload.create({
        collection: "media",
        data: {
          alt: `Review by ${session.user.name}`,
          assetCategory: "general",
        },
        file: {
          data: fileBuffer,
          name: fileName,
          mimetype: mimeType,
          size: fileBuffer.byteLength,
        }
      });
      mediaId = mediaDoc.id;
    }
    // ================================================================

    // Create Review in Payload
    const newReview = await payload.create({
      collection: "reviews",
      data: {
        product: productId,
        user: session.user.id,
        rating: rating,
        comment: comment,
        isApproved: true,
        reviewImage: mediaId,
        isVerifiedPurchase: isVerifiedPurchase,
      },
    });

    // Revalidate PDP
    const product = await payload.findByID({
      collection: "products",
      id: productId,
    });
    if (product && product.slug) {
      revalidatePath(`/product/${product.slug}`);
    }

    const formattedReview: ProductReview = {
      _id: newReview.id,
      _createdAt: newReview.createdAt,
      rating: newReview.rating,
      comment: newReview.comment,
      user: {
        name: session.user.name,
        image: session.user.image || undefined
      },
      reviewImage: mediaId ? {
        _type: "image",
        asset: { _ref: String(mediaId), _type: "reference" },
        url: reviewImageUrl || ""
      } : undefined,
      isVerifiedPurchase: isVerifiedPurchase
    };

    return {
      success: true,
      message: "Thank you! Your review has been submitted.",
      review: formattedReview,
    };

  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, message: "Failed to submit review. Please try again." };
  }
}