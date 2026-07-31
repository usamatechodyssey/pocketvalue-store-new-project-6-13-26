
// src/sanity/lib/payload/product.queries.ts

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import SanityProduct, { ProductReview } from "../../../types";
import { getPayloadReviewsForProduct } from "./review.queries";
import { mapPayloadProductToSanity } from "./plp/productMapper";
import { unstable_cache } from "next/cache";

// ====================================================================
// 🛡️ STRICT COMPILER DATA TYPE LAYOUTS
// ====================================================================
interface PayloadProductDocument {
  id: string;
  createdAt: string;
  title: string;
  slug: string;
  videoUrl?: string;
  variants?: Array<{
    id?: string;
    sku?: string;
    name?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    inStock?: boolean;
    attributes?: Array<{ id?: string; name?: string; value?: string }>;
    images?: Array<{ id?: string; url?: string } | string>;
    // ✅ ENTERPRISE FIX: Added cdnImages typings definition to prevent TypeScript compile-time errors
    cdnImages?: Array<{ _key?: string; id?: string; url: string }>;
    weight?: number;
    dimensions?: { height?: number; width?: number; depth?: number };
  }>;
  description?: Record<string, unknown>;
  shippingAndReturns?: Record<string, unknown>;
  specifications?: Array<{ id?: string; label?: string; value?: string }>;
  brand?: string | Record<string, unknown>;
  categories?: (string | Record<string, unknown>)[];
  rating?: number;
  reviewCount?: number;
  seo?: Record<string, unknown>;
  storageProvider?: 'global' | 'imgbb' | 'r2' | 'both';
  primaryProvider?: 'imgbb' | 'r2';
}

// ====================================================================
// PRIVATE FETCH FUNCTIONS (Uncached - for internal use)
// ====================================================================

const _fetchPayloadSingleProduct = async (slug: string): Promise<SanityProduct | null> => {
  // ✅ ENTERPRISE FIX: Wrap entire function in try-catch
  try {
    const settings = await getCachedSettings();
    const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

    const payload = await getSafePayload();
    const result = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 2,
    });

    const doc = result.docs[0] as unknown as PayloadProductDocument | undefined;
    if (!doc) return null;

    let reviews: ProductReview[] = [];
    let totalReviews = doc.reviewCount || 0;
    let averageRating = doc.rating || 0;

    try {
      const fetchedReviews = await getPayloadReviewsForProduct(doc.id);
      if (Array.isArray(fetchedReviews)) {
        reviews = fetchedReviews as ProductReview[];
        totalReviews = reviews.length;
        const sumRatings = reviews.reduce(
          (acc: number, review: ProductReview) => acc + Number(review.rating || 0),
          0
        );
        averageRating = totalReviews > 0 ? sumRatings / totalReviews : doc.rating || 0;
      }
    } catch (reviewError: unknown) {
      const errorMsg = reviewError instanceof Error ? reviewError.message : String(reviewError);
      console.warn(
        `WARNING: Reviews lookup failed for product ${doc.id}. Falling back to pre-aggregated data:`,
        errorMsg
      );
    }

    return mapPayloadProductToSanity(doc, reviews, globalFetchMode);
  } catch (error) {
    console.error(`❌ Failed to fetch product with slug "${slug}":`, error);
    return null;
  }
};

// ====================================================================
// 🚀 EXPORTED CACHED FUNCTIONS (With Graceful Error Handling)
// ====================================================================

// ✅ PRODUCT DETAIL (PDP)
export const getPayloadSingleProduct = async (slug: string): Promise<SanityProduct | null> => {
  try {
    const cachedFn = unstable_cache(
      async () => _fetchPayloadSingleProduct(slug),
      [`product-${slug}`],
      {
        tags: [`product-${slug}`],
        revalidate: false,
      }
    );
    return await cachedFn();
  } catch (error) {
    console.error(`❌ Failed to get cached product "${slug}":`, error);
    return null;
  }
};

// =====================================================================
// STOCK STATUS FETCHING (OPTIMIZED FOR SECURE CHECKOUT)
// =====================================================================
export async function getPayloadProductsStockStatus(
  productIds: string[]
): Promise<Record<string, unknown>[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  try {
    const cacheKey = `stock-status-${productIds.sort().join('-')}`;

    const cachedFn = unstable_cache(
      async () => {
        try {
          const payload = await getSafePayload();

          const result = await payload.find({
            collection: "products",
            where: { id: { in: productIds } },
            depth: 0,
          });

          return result.docs.map((rawDoc: unknown) => {
            const doc = rawDoc as unknown as PayloadProductDocument;
            return {
              _id: doc.id,
              variants:
                doc.variants?.map((v, index: number) => ({
                  _key: v.id || v.sku || `variant-${index}`,
                  inStock: v.inStock || false,
                  stock: v.stock || 0,
                  price: v.price || 0,
                  salePrice: v.salePrice,
                })) || null,
            };
          });
        } catch (error) {
          console.error("❌ Failed to fetch stock status:", error);
          return [];
        }
      },
      [cacheKey],
      {
        tags: [`stock-status`],
        revalidate: 10,
      }
    );

    return await cachedFn();
  } catch (error) {
    console.error("❌ Failed to get cached stock status:", error);
    return [];
  }
}

// =====================================================================
// ⚡ LIVE PRODUCT DATA FOR CARDS (Wishlist / Cart / Recommendations)
// =====================================================================
export const getPayloadLiveProductDataForCards = async (
  productIds: string[]
): Promise<SanityProduct[]> => {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  try {
    const cachedFn = unstable_cache(
      async () => {
        try {
          const settings = await getCachedSettings();
          const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

          const payload = await getSafePayload();

          // ✅ ENTERPRISE UPGRADE: Restored query depth from 1 to 2.
          // This populates Level 2 media relations in variants, preventing raw string IDs and broken placeholder blackouts in Cart/Wishlist grids.
          const result = await payload.find({
            collection: "products",
            where: { id: { in: productIds } },
            depth: 2,
          });

          const emptyReviewsList: ProductReview[] = [];
          return result.docs.map((rawDoc: unknown) => {
            const doc = rawDoc as unknown as PayloadProductDocument;
            return mapPayloadProductToSanity(doc, emptyReviewsList, globalFetchMode);
          });
        } catch (error) {
          console.error("❌ Failed to fetch live product data for cards:", error);
          return [];
        }
      },
      [`wishlist-${productIds.sort().join('-')}`],
      {
        tags: [`wishlist-products`],
        revalidate: false,
      }
    );

    return await cachedFn();
  } catch (error) {
    console.error("❌ Failed to get cached live product data:", error);
    return [];
  }
};

// =====================================================================
// ⚡ HIGH-SPEED RELATED PRODUCTS
// =====================================================================
export const getPayloadRelatedProducts = async (
  currentProductId: string,
  categoryIds: string[]
): Promise<SanityProduct[]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  try {
    const cachedFn = unstable_cache(
      async () => {
        try {
          const settings = await getCachedSettings();
          const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

          const payload = await getSafePayload();

          const result = await payload.find({
            collection: "products",
            where: {
              and: [{ categories: { in: categoryIds } }, { id: { not_equals: currentProductId } }],
            },
            limit: 10,
            depth: 2,
            sort: "-createdAt",
          });

          const emptyReviewsList: ProductReview[] = [];
          return result.docs.map((rawDoc: unknown) => {
            const doc = rawDoc as unknown as PayloadProductDocument;
            return mapPayloadProductToSanity(doc, emptyReviewsList, globalFetchMode);
          });
        } catch (error) {
          console.error(`❌ Failed to fetch related products for ${currentProductId}:`, error);
          return [];
        }
      },
      [`related-${currentProductId}`],
      {
        tags: [`related-${currentProductId}`],
        revalidate: false,
      }
    );

    return await cachedFn();
  } catch (error) {
    console.error(`❌ Failed to get cached related products for ${currentProductId}:`, error);
    return [];
  }
};

// =====================================================================
// ✅ PRODUCTS BY SLUGS (For SEO / Sitemap / Batch Fetch)
// =====================================================================
export const getPayloadProductsBySlugs = async (
  slugs: string[]
): Promise<SanityProduct[]> => {
  if (!slugs || slugs.length === 0) return [];

  try {
    const cachedFn = unstable_cache(
      async () => {
        try {
          const settings = await getCachedSettings();
          const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

          const payload = await getSafePayload();

          // ✅ ENTERPRISE UPGRADE: Restored query depth from 1 to 2.
          // Populates nested images on variants so SEO crawlers/sitemap tools read valid absolute image URLs instead of raw database IDs.
          const result = await payload.find({
            collection: "products",
            where: { slug: { in: slugs } },
            depth: 2,
          });

          const emptyReviewsList: ProductReview[] = [];
          return result.docs.map((rawDoc: unknown) => {
            const doc = rawDoc as unknown as PayloadProductDocument;
            return mapPayloadProductToSanity(doc, emptyReviewsList, globalFetchMode);
          });
        } catch (error) {
          console.error("❌ Failed to fetch products by slugs:", error);
          return [];
        }
      },
      [`products-by-slugs-${slugs.sort().join('-')}`],
      {
        tags: [`products-by-slugs`],
        revalidate: false,
      }
    );

    return await cachedFn();
  } catch (error) {
    console.error("❌ Failed to get cached products by slugs:", error);
    return [];
  }
};