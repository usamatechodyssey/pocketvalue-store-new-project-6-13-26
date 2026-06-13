// import { getPayload } from 'payload'
// import configPromise from '@payload-config'
// // ✅ ProductReview type direct import ho raha hai aur use bhi hoga
// import { ProductReview, SanityImageObject } from '../../types/product_types'

// // 🔥 NAYI INTERFACE: SanityImageObject ko extend karein sirf yahan ke liye
// interface PayloadCompatibleSanityImageObject extends SanityImageObject {
//   url?: string; // Payload se aane wala direct URL
// }

// // 🔥 NAYI INTERFACE: Review ko SanityProductReview type mein map karna
// interface PayloadCompatibleProductReview extends ProductReview {
//     reviewImage?: PayloadCompatibleSanityImageObject; // Ab ye 'url' ko accept karega
//     isApproved?: boolean; // ✅ FIX: isApproved field yahan add kiya
// }

// // Helper: Payload reviews ko Sanity ProductReview type mein map karna
// // ✅ FIX: mapPayloadReviewToSanityReview ki return type ko update karein
// const mapPayloadReviewToSanityReview = (payloadReview: any): PayloadCompatibleProductReview => {
//   return {
//     _id: payloadReview.id,
//     _createdAt: payloadReview.createdAt,
//     rating: payloadReview.rating,
//     comment: payloadReview.comment,
//     isApproved: payloadReview.isApproved,
//     // User object ko map karna
//     user: {
//       name: payloadReview.user.name || 'Anonymous', // Payload mein user object expand hoga
//       image: payloadReview.user.image?.url || undefined, // ✅ FIX: User image bhi url se len
//     },
//     // reviewImage ko map karna
//     reviewImage: payloadReview.reviewImage?.url ? {
//       _type: 'image',
//       url: payloadReview.reviewImage.url, // ✅ Ab 'url' ko accept karega
//       asset: { _ref: payloadReview.reviewImage.id, _type: 'reference' }
//     } : undefined,
//   }
// }

// // GET ALL REVIEWS FOR A PRODUCT (PRODUCT DETAIL PAGE KE LIYE)
// export const getPayloadReviewsForProduct = async (productId: string): Promise<ProductReview[]> => {
//   const payload = await getPayload({ config: configPromise })

//   const result = await payload.find({
//     collection: 'reviews',
//     where: {
//       product: {
//         equals: productId,
//       },
//       isApproved: {
//         equals: true, // Frontend par sirf approved reviews dikhenge
//       },
//     },
//     depth: 1, // User data ko expand karein
//     sort: '-createdAt', // Naye reviews pehle
//   })

//   // Data ko map karke ProductReview type mein convert karein
//   // ✅ FIX: mapPayloadReviewToSanityReview ki return ko ProductReview mein cast karein
//   return result.docs.map(mapPayloadReviewToSanityReview) as ProductReview[];
// }

// // TODO: Pagination ke liye future mein ye functions update honge
// export const getPayloadPaginatedReviews = async (productId: string, page: number, limit: number): Promise<{ reviews: ProductReview[], totalDocs: number }> => {
//   const payload = await getPayload({ config: configPromise })

//   const result = await payload.find({
//     collection: 'reviews',
//     where: {
//       product: { equals: productId },
//       isApproved: { equals: true },
//     },
//     depth: 1,
//     sort: '-createdAt',
//     page: page,
//     limit: limit,
//   });

//   return {
//     reviews: result.docs.map(mapPayloadReviewToSanityReview) as ProductReview[], // ✅ Cast here
//     totalDocs: result.totalDocs,
//   };
// };
// src/sanity/lib/payload/review.queries.ts

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ProductReview, SanityImageObject } from "../../types/product_types";

// 🔥 THE FIX: Faltu interfaces hata di hain. TypeScript seedha 'ProductReview' ko samajh jayega
// aur humne inline intersection '&' use kiya hai isApproved ke liye.

const mapPayloadReviewToSanityReview = (
  payloadReview: any,
): ProductReview & { isApproved?: boolean } => {
  return {
    _id: payloadReview.id,
    _createdAt: payloadReview.createdAt,
    rating: payloadReview.rating,
    comment: payloadReview.comment,
    isApproved: payloadReview.isApproved,

    // User object ko map karna (Safe Optional Chaining ke sath)
    user: {
      name: payloadReview.user?.name || "Anonymous",
      image: payloadReview.user?.image?.url || undefined,
    },

    // reviewImage ko map karna (url required hai, wo hum de rahe hain)
    reviewImage: payloadReview.reviewImage?.url
      ? {
          _type: "image" as const, // 🔥 Literal type casting taake TS khush rahe
          url: payloadReview.reviewImage.url,
          asset: { _ref: payloadReview.reviewImage.id, _type: "reference" },
        }
      : undefined,
  };
};

// GET ALL REVIEWS FOR A PRODUCT
export const getPayloadReviewsForProduct = async (
  productId: string,
): Promise<ProductReview[]> => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "reviews",
    where: {
      product: {
        equals: productId,
      },
      isApproved: {
        equals: true,
      },
    },
    depth: 1,
    sort: "-createdAt",
  });

  return result.docs.map(mapPayloadReviewToSanityReview) as ProductReview[];
};

// TODO: Pagination ke liye future mein ye functions update honge
export const getPayloadPaginatedReviews = async (
  productId: string,
  page: number,
  limit: number,
): Promise<{ reviews: ProductReview[]; totalDocs: number }> => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "reviews",
    where: {
      product: { equals: productId },
      isApproved: { equals: true },
    },
    depth: 1,
    sort: "-createdAt",
    page: page,
    limit: limit,
  });

  return {
    reviews: result.docs.map(mapPayloadReviewToSanityReview) as ProductReview[],
    totalDocs: result.totalDocs,
  };
};
