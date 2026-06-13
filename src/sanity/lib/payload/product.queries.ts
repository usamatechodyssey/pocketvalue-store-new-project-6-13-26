// src/sanity/lib/payload/product.queries.ts
import { getPayload } from "payload";
import configPromise from "@payload-config";
import SanityProduct from "../../types/product_types";
import { getPayloadReviewsForProduct } from "./review.queries";
import { mapPayloadProductToSanity } from "./plp/productMapper";
import { lexicalToPortableText } from "./types/lexicalHelper";
import { cache } from "react";

// GET SINGLE PRODUCT (PDP)
export const getPayloadSingleProduct = cache(
  async (slug: string): Promise<SanityProduct | null> => {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 2,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    const reviews = await getPayloadReviewsForProduct(doc.id);
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating =
      totalReviews > 0 ? sumRatings / totalReviews : doc.rating || 0;

    return {
      _id: doc.id,
      _createdAt: doc.createdAt,
      title: doc.title,
      slug: doc.slug,
      videoUrl: doc.videoUrl || undefined,

      // 🔥 THE FIX: 'id' ya 'sku' ko as a _key use karein (No more Math.random)
      variants:
        doc.variants?.map((v: any, index: number) => ({
          _key: v.id || v.sku || `variant-${index}`, // ✅ STABLE KEY (Payload 'id' deta hai arrays ko)
          name: v.name,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
          inStock: v.inStock,
          attributes:
            v.attributes?.map((attr: any, aIndex: number) => ({
              _key: attr.id || `attr-${index}-${aIndex}`, // ✅ STABLE KEY
              name: attr.name,
              value: attr.value,
            })) || [],
          images:
            v.images?.map((img: any, iIndex: number) => {
              const imgUrl =
                typeof img === "object" && img !== null ? img.url : "";
              return {
                _type: "image",
                url: imgUrl,
                asset: {
                  _ref: img.id || `img-${index}-${iIndex}`,
                  _type: "reference",
                }, // ✅ STABLE KEY
              };
            }) || [],
          weight: v.weight || undefined,
          dimensions: v.dimensions || undefined,
        })) || [],

      defaultVariant: doc.variants?.[0]
        ? {
            _key: doc.variants[0].id || doc.variants[0].sku || "variant-0", // Match with variant key
            name: doc.variants[0].name,
            sku: doc.variants[0].sku,
            price: doc.variants[0].price,
            salePrice: doc.variants[0].salePrice,
            stock: doc.variants[0].stock,
            inStock: doc.variants[0].inStock,
            attributes:
              doc.variants[0].attributes?.map((attr: any, aIndex: number) => ({
                _key: attr.id || `attr-0-${aIndex}`,
                name: attr.name,
                value: attr.value,
              })) || [],
            images:
              doc.variants[0].images?.map((img: any, iIndex: number) => ({
                _type: "image",
                url: typeof img === "object" && img !== null ? img.url : "",
                asset: {
                  _ref: img.id || `img-0-${iIndex}`,
                  _type: "reference",
                },
              })) || [],
          }
        : undefined,

      description: lexicalToPortableText(doc.description),
      shippingAndReturns: lexicalToPortableText(doc.shippingAndReturns),

      specifications:
        doc.specifications?.map((spec: any, index: number) => ({
          _key: spec.id || `spec-${index}`, // ✅ STABLE KEY
          label: spec.label,
          value: spec.value,
        })) || [],

      brand:
        doc.brand && typeof doc.brand === "object"
          ? {
              _id: doc.brand.id,
              name: doc.brand.name,
              slug: doc.brand.slug,
            }
          : undefined,
      // 🔥 FIX: Ye line add karni hai taake related products ko IDs mil saken!
      categoryIds: Array.isArray(doc.categories)
        ? doc.categories.map((c: any) => (typeof c === "object" ? c.id : c))
        : [],

      categories: Array.isArray(doc.categories)
        ? doc.categories.map((c: any) =>
            typeof c === "object"
              ? {
                  _id: c.id,
                  name: c.name,
                  slug: c.slug,
                }
              : { _id: c },
          )
        : [],

      rating: averageRating,
      reviewCount: totalReviews,
      reviews: reviews,

      seo: doc.seo,
    } as unknown as SanityProduct;
  },
);
// =====================================================================
// 🔥 THE CHECKOUT FIX: STOCK STATUS FETCHING FROM PAYLOAD
// =====================================================================
export async function getPayloadProductsStockStatus(
  productIds: string[],
): Promise<any[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  try {
    const payload = await getPayload({ config: configPromise });

    // Payload mein 'in' query use karne ka tareeqa
    const result = await payload.find({
      collection: "products",
      where: {
        id: { in: productIds }, // Find all products whose ID is in the cart
      },
      depth: 0, // We only need basic variant info, no deep relationships
    });

    // Sanity format mein wapas bhejna hai taake route.ts na toote
    return result.docs.map((doc) => ({
      _id: doc.id,
      variants:
        doc.variants?.map((v: any, index: number) => ({
          _key: v.id || v.sku || `variant-${index}`, // ✅ MATCH THE STABLE KEY
          inStock: v.inStock,
          stock: v.stock,
          price: v.price,
          salePrice: v.salePrice,
        })) || null,
    }));
  } catch (error) {
    console.error("Failed to fetch product stock status from Payload:", error);
    return [];
  }
}

// === 🔥 NEW FUNCTION: WishlistLiveData Fetcher ===
export const getPayloadLiveProductDataForCards = async (
  productIds: string[],
): Promise<SanityProduct[]> => {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "products",
    where: {
      id: { in: productIds }, // Products jin ki ID wishlist mein hain
    },
    depth: 1, // DefaultVariant images aur brand ke liye
  });

  // Data ko SanityProduct type mein map karein
  return result.docs.map((doc) => {
    // Mock reviews for card view
    const reviews: any[] = []; // Yahan reviews fetch nahi kar rahe ProductCard ke liye
    return mapPayloadProductToSanity(doc, reviews);
  });
};

// 🔥 NEW & FIXED: ASLI RELATED PRODUCTS LOGIC
export const getPayloadRelatedProducts = async (
  currentProductId: string,
  categoryIds: string[],
): Promise<SanityProduct[]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: "products",
      where: {
        and: [
          { categories: { in: categoryIds } },
          { id: { not_equals: currentProductId } },
        ],
      },
      limit: 10,
      depth: 2,
      sort: "-createdAt",
    });

    // 🔥 FIX YAHAN HAI: Promise.all use karke har related product ke asli reviews fetch kiye hain
    const relatedProducts = await Promise.all(
      result.docs.map(async (doc) => {
        // Asli reviews fetch karo
        const reviews = await getPayloadReviewsForProduct(doc.id);
        // Data aur reviews ko map mein pass karo
        return mapPayloadProductToSanity(doc, reviews);
      }),
    );

    return relatedProducts;
  } catch (error) {
    console.error("Failed to fetch related products from Payload:", error);
    return [];
  }
};

export const getPayloadProductsBySlugs = async (
  slugs: string[],
): Promise<SanityProduct[]> => {
  if (!slugs || slugs.length === 0) return [];

  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "products",
    where: {
      slug: {
        in: slugs, // MongoDB 'IN' query
      },
    },
    depth: 1, // Basic details aur images ke liye
  });

  // Hum apna wahi standard mapper use karenge taake frontend na toote
  return result.docs.map((doc) => mapPayloadProductToSanity(doc, []));
};
