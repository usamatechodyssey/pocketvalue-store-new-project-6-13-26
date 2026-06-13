// import type { CollectionConfig } from 'payload'

// export const Reviews: CollectionConfig = {
//   slug: 'reviews',
//   admin: {
//     useAsTitle: 'comment',
//     defaultColumns: ['product', 'user', 'rating', 'isApproved'],
//   },
//   access: {
//     read: ({ req: { user } }) => {
//       if (user) return true;
//       return {
//         isApproved: {
//           equals: true,
//         },
//       };
//     },
//   },
//   fields: [
//     {
//       name: 'user',
//       type: 'relationship',
//       relationTo: 'users',
//       required: true,
//       // 🛑 YAHAN SE 'admin: { readOnly: true, position: 'sidebar' },' HATA DO
//       admin: {
//         position: 'sidebar', // Sirf position rehne den
//         description: 'Jis user ne review diya hai.',
//       },
//     },
//     {
//       name: 'product',
//       type: 'relationship',
//       relationTo: 'products',
//       required: true,
//       // 🛑 YAHAN SE 'admin: { readOnly: true, position: 'sidebar' },' HATA DO
//       admin: {
//         position: 'sidebar', // Sirf position rehne den
//         description: 'Jis product ke liye review hai.',
//       },
//     },
//     {
//       name: 'rating',
//       type: 'number',
//       required: true,
//       min: 1,
//       max: 5,
//     },
//     {
//       name: 'comment',
//       type: 'textarea',
//       required: true,
//       minLength: 10,
//       maxLength: 1000,
//     },
//     {
//       name: 'reviewImage',
//       type: 'upload',
//       relationTo: 'media',
//       label: 'Review Image (Optional)',
//     },
//     {
//       name: 'isApproved',
//       type: 'checkbox',
//       label: 'Approved for Display?',
//       defaultValue: true,
//       admin: {
//         position: 'sidebar',
//         description: 'Frontend par show karne ke liye approval zaroori hai.',
//       },
//     },
//   ],
// }
// src/payload/collections/Reviews.ts

import type { CollectionConfig } from "payload";

// 🔥 HELPER FUNCTION: Rating aur Count calculate karne ke liye
const updateProductRating = async (
  payload: any,
  productId: string | number,
) => {
  try {
    // 1. Us product ke saare "Approved" reviews nikal lo
    const reviews = await payload.find({
      collection: "reviews",
      where: {
        product: { equals: productId },
        isApproved: { equals: true },
      },
      limit: 5000, // Safe limit
      depth: 0, // Relational data expand karne ki zaroorat nahi
    });

    const reviewCount = reviews.totalDocs;

    // 2. Average Rating calculate karo
    const totalRating = reviews.docs.reduce(
      (acc: number, review: any) => acc + review.rating,
      0,
    );
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // 3. Product collection mein ja kar is naye data ko save kar do
    await payload.update({
      collection: "products",
      id: productId,
      data: {
        rating: Number(averageRating.toFixed(1)), // Decimal ko 1 point tak mehdood kiya (e.g. 4.5)
        reviewCount: reviewCount,
      },
    });

    console.log(
      `✅ Rating updated for Product ${productId}: ${averageRating.toFixed(1)} Stars (${reviewCount} Reviews)`,
    );
  } catch (error) {
    console.error("❌ Failed to update product rating:", error);
  }
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "comment",
    defaultColumns: ["product", "user", "rating", "isApproved"],
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
  // =================================================================
  // 🔥 ENTERPRISE HOOKS: Auto-calculate Ratings on Write
  // =================================================================
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Create ya Update hone par hook chalega
        const productId =
          typeof doc.product === "object" ? doc.product.id : doc.product;
        if (productId) {
          await updateProductRating(req.payload, productId);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Review Delete hone par hook chalega
        const productId =
          typeof doc.product === "object" ? doc.product.id : doc.product;
        if (productId) {
          await updateProductRating(req.payload, productId);
        }
      },
    ],
  },
  // =================================================================
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
  ],
};
