
"use server";

import { auth } from "@/app/auth";
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from "next/cache";
import { ProductReview } from "@/sanity/types/product_types";
import { SubmitReviewSchema } from "@/app/lib/zodSchemas";
import { z } from "zod";

// Note: Hum yahan Cloudinary import nahi kar rahe, 
// kyunke Media Collection ka Hook khud upload handle karega.

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
    const payload = await getPayload({ config: configPromise });

    let mediaId = undefined;

    // 🔥 FIX: Base64 String ko Buffer mein convert karke Payload ko pass karein
    if (reviewImageUrl && reviewImageUrl.startsWith('data:')) {
       // 1. Base64 string se Data aur MimeType alag karein
       const matches = reviewImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
       
       if (matches && matches.length === 3) {
          const mimeType = matches[1]; // e.g., image/jpeg
          const base64Data = matches[2];
          const fileBuffer = Buffer.from(base64Data, 'base64');
          const extension = mimeType.split('/')[1] || 'jpg';
          const fileName = `review-${Date.now()}.${extension}`;

          // 2. Payload ko 'file' property ke sath create call karein
          const mediaDoc = await payload.create({
             collection: 'media',
             data: {
                alt: `Review by ${session.user.name}`,
                assetCategory: 'general',
             },
             // ✅ YE HAI ASLI FIX: File Buffer yahan pass ho raha hai
             file: {
                data: fileBuffer,
                name: fileName,
                mimetype: mimeType,
                size: fileBuffer.byteLength,
             }
          });
          
          mediaId = mediaDoc.id;
       }
    }

    // 3. Create Review
    const newReview = await payload.create({
      collection: 'reviews',
      data: {
        product: productId,
        user: session.user.id,
        rating: rating,
        comment: comment,
        isApproved: true,
        reviewImage: mediaId,
      },
    });

    // 4. Revalidate
    const product = await payload.findByID({
        collection: 'products',
        id: productId,
    });

    if (product && product.slug) {
        revalidatePath(`/product/${product.slug}`);
    }

    // 5. Return Data
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
            _type: 'image',
            asset: { _ref: String(mediaId), _type: 'reference' },
            // @ts-ignore
            url: reviewImageUrl // Optimistic update ke liye base64 wapas bhej rahe hain
        } : undefined
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