// 📂 src/sanity/lib/payload/review.queries.ts

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { ProductReview } from "../../../types";
import { unstable_cache } from "next/cache";

// ================================================================
// 🔧 HELPER: Map Payload Review to Sanity Review
// ================================================================
const mapPayloadReviewToSanityReview = (
  payloadReview: any,
): ProductReview & { isApproved?: boolean } => {
  // ✅ Safe user extraction with proper fallback
  const user = payloadReview.user;
  const userName = user?.name || "Anonymous";
  const userImage = user?.image?.url || user?.image || undefined;

  return {
    _id: payloadReview.id,
    _createdAt: payloadReview.createdAt,
    rating: payloadReview.rating,
    comment: payloadReview.comment,
    isApproved: payloadReview.isApproved,
    isVerifiedPurchase: payloadReview.isVerifiedPurchase || false,

    user: {
      name: userName,
      image: userImage,
    },

    reviewImage: payloadReview.reviewImage?.url
      ? {
          _type: "image" as const,
          url: payloadReview.reviewImage.url,
          asset: { _ref: payloadReview.reviewImage.id, _type: "reference" },
        }
      : undefined,
  };
};

// ================================================================
// 🚀 CACHED REVIEWS FETCHER (Edge Cache + On-Demand Revalidation)
// ================================================================
const getCachedReviewsForProduct = async (productId: string) => {
  const cacheKey = `reviews-product-${productId}`;

  return unstable_cache(
    async () => {
      try {
        const payload = await getSafePayload();

        const result = await payload.find({
          collection: "reviews",
          where: {
            product: { equals: productId },
            isApproved: { equals: true },
          },
          depth: 1,
          sort: "-createdAt",
        });

        return result.docs.map(mapPayloadReviewToSanityReview) as ProductReview[];
      } catch (error) {
        // ✅ ENTERPRISE FIX: Graceful failure — return empty array if reviews fail
        console.error(`⚠️ Failed to fetch reviews for product ${productId}:`, error);
        return [];
      }
    },
    [cacheKey],
    {
      tags: [`reviews-product-${productId}`],
      revalidate: false, // ✅ Only on-demand via revalidateTag
    }
  )();
};

// ================================================================
// 🚀 MAIN EXPORT (with caching + graceful failure)
// ================================================================
export const getPayloadReviewsForProduct = async (
  productId: string,
): Promise<ProductReview[]> => {
  try {
    return await getCachedReviewsForProduct(productId);
  } catch (error) {
    // ✅ ULTIMATE SAFETY NET: Agar kuch bhi fail ho, toh empty array return karo
    console.error(`⚠️ CRITICAL: Failed to get reviews for product ${productId}:`, error);
    return [];
  }
};