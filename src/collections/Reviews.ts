
// // // src/payload/collections/Reviews.ts

import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { Payload } from "payload";

// ====================================================================
// 🛡️ REVIEWS COMPILER TYPE MODEL (ELIMINATES 'ANY')
// ====================================================================
interface RawReviewDoc {
  rating: number;
  product: string | { id: string };
  comment?: string;
  isApproved?: boolean;
  isVerifiedPurchase?: boolean;
}

// Helper Function: Safe dynamic rating calculation on product schema updates
const updateProductRating = async (
  payload: Payload,
  productId: string | number,
): Promise<void> => {
  try {
    const reviews = await payload.find({
      collection: "reviews",
      where: {
        product: { equals: productId },
        isApproved: { equals: true },
      },
      limit: 5000, 
      depth: 0, 
    });

    const reviewCount = reviews.totalDocs;

    // ✅ FIXED TYPE: Cast docs array to strictly typed RawReviewDoc array to avoid 'any'
    const totalRating = (reviews.docs as unknown as RawReviewDoc[]).reduce(
      (acc: number, review: RawReviewDoc) => acc + (review.rating || 0),
      0,
    );
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    await payload.update({
      collection: "products",
      id: productId,
      data: {
        rating: Number(averageRating.toFixed(1)), 
        reviewCount: reviewCount,
      },
    });

    console.log(
      `✅ Rating updated for Product ${productId}: ${averageRating.toFixed(1)} Stars (${reviewCount} Reviews)`,
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to update product rating:", errorMsg);
  }
};

const afterChangeReviewHook: CollectionAfterChangeHook = async ({ doc, req }) => {
  const targetDoc = doc as unknown as RawReviewDoc;
  const productId =
    typeof targetDoc.product === "object" ? targetDoc.product.id : targetDoc.product;
  if (productId) {
    await updateProductRating(req.payload, productId);
  }
};

const afterDeleteReviewHook: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const targetDoc = doc as unknown as RawReviewDoc;
  const productId =
    typeof targetDoc.product === "object" ? targetDoc.product.id : targetDoc.product;
  if (productId) {
    await updateProductRating(req.payload, productId);
  }
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "comment",
    defaultColumns: ["product", "user", "rating", "isApproved", "isVerifiedPurchase"],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        isApproved: {
          equals: true,
        },
      };
    },
  },
  hooks: {
    afterChange: [afterChangeReviewHook],
    afterDelete: [afterDeleteReviewHook],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        position: "sidebar",
        description: "Jis user ne review diya hai.",
      },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      admin: {
        position: "sidebar",
        description: "Jis product ke liye review hai.",
      },
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: "comment",
      type: "textarea",
      required: true,
      minLength: 10,
      maxLength: 1000,
    },
    {
      name: "reviewImage",
      type: "upload",
      relationTo: "media",
      label: "Review Image (Optional)",
    },
    {
      name: "isApproved",
      type: "checkbox",
      label: "Approved for Display?",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Frontend par show karne ke liye approval zaroori hai.",
      },
    },
    {
      name: "isVerifiedPurchase",
      type: "checkbox",
      label: "Verified Purchase?",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Kya is user ne yeh product sach mein khareeda hai?",
      },
    },
  ],
};