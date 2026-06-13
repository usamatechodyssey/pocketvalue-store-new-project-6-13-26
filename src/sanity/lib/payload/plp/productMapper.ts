// // src/sanity/lib/payload/plp/productMapper.ts
// import SanityProduct, { ProductVariant, SanityBrand} from '../../../types/product_types';
// import { lexicalToPortableText } from '../types/lexicalHelper';

// export const mapPayloadProductToSanity = (doc: any, reviews: any[] = []): SanityProduct => {
//   const totalReviews = reviews.length;
//   const sumRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
//   const averageRating = totalReviews > 0 ? sumRatings / totalReviews : (doc.rating || 0);

//   // 1. Variants Mapping
//   const variants: ProductVariant[] = doc.variants?.map((v: any, index: number) => ({
//     _key: v.id || v.sku || `variant-${index}`,
//     name: v.name || 'Default',
//     sku: v.sku || undefined,
//     price: v.price || 0,
//     salePrice: v.salePrice || undefined,
//     stock: v.stock || 0,
//     inStock: v.inStock || false,
//     attributes: v.attributes?.map((attr: any, aIndex: number) => ({
//       _key: attr.id || `attr-${index}-${aIndex}`,
//       name: attr.name,
//       value: attr.value
//     })) || [],
//     images: v.images?.map((img: any, iIndex: number) => ({
//       _type: 'image' as const,
//       url: (typeof img === 'object' && img !== null) ? img.url : '',
//       asset: { _ref: img.id || `img-${index}-${iIndex}`, _type: 'reference' }
//     })) || []
//   })) || [];

//   // 2. Brand Mapping
//   const brand: SanityBrand | undefined = (doc.brand && typeof doc.brand === 'object') ? {
//     _id: doc.brand.id,
//     name: doc.brand.name,
//     slug: doc.brand.slug,
//     logo: {
//         _type: 'image' as const,
//         asset: { _ref: doc.brand.logo?.id || 'brand-logo', _type: 'reference' }
//     }
//   } : undefined;

//   return {
//     _id: doc.id,
//     _createdAt: doc.createdAt,
//     title: doc.title,
//     slug: doc.slug,
//     videoUrl: doc.videoUrl || undefined,
//     variants: variants,

//     // Default Variant Logic
//     defaultVariant: (variants[0] || {
//         _key: 'default', name: 'Default', price: 0, inStock: false, attributes: [], images: []
//     }) as ProductVariant,

//     description: lexicalToPortableText(doc.description),
//     shippingAndReturns: lexicalToPortableText(doc.shippingAndReturns),

//     specifications: doc.specifications?.map((spec: any, index: number) => ({
//         _key: spec.id || `spec-${index}`,
//         label: spec.label,
//         value: spec.value
//     })) || [],

//     brand: brand,

//     categories: Array.isArray(doc.categories)
//       ? doc.categories.map((c: any) => (typeof c === 'object' ? {
//         _id: c.id,
//         name: c.name,
//         slug: c.slug
//       } : { _id: c }))
//       : [],

//     rating: averageRating,
//     reviewCount: totalReviews,
//     reviews: reviews,
//     seo: doc.seo,
//   } as SanityProduct;
// }
// src/sanity/lib/payload/plp/productMapper.ts

import SanityProduct, {
  ProductVariant,
  SanityBrand,
} from "../../../types/product_types";
import { lexicalToPortableText } from "../types/lexicalHelper";

export const mapPayloadProductToSanity = (
  doc: any,
  reviews: any[] = [],
): SanityProduct => {
  const totalReviews = doc.reviewCount || 0;
  const averageRating = doc.rating || 0;

  // 1. Variants Mapping
  const variants: ProductVariant[] =
    doc.variants?.map((v: any, index: number) => ({
      _key: v.id || v.sku || `variant-${index}`,
      name: v.name || "Default",
      sku: v.sku || undefined,
      price: v.price || 0,
      salePrice: v.salePrice || undefined,
      stock: v.stock || 0,
      inStock: v.inStock || false,
      attributes:
        v.attributes?.map((attr: any, aIndex: number) => ({
          _key: attr.id || `attr-${index}-${aIndex}`,
          name: attr.name,
          value: attr.value,
        })) || [],
      images:
        v.images?.map((img: any, iIndex: number) => ({
          _type: "image" as const,
          url: typeof img === "object" && img !== null ? img.url : "",
          asset: {
            _ref: img.id || `img-${index}-${iIndex}`,
            _type: "reference",
          },
        })) || [],
    })) || [];

  // ==============================================================
  // 🔥 THE FIX: 'undefined' ki jagah Khali (Empty) Image Object fallback de diya
  // ==============================================================
  const brand: SanityBrand | undefined =
    doc.brand && typeof doc.brand === "object"
      ? {
          _id: doc.brand.id,
          name: doc.brand.name,
          slug: doc.brand.slug,
          // Agar logo hai to wo do, warna ek default empty object do (TS khush rahega)
          logo: doc.brand.logo
            ? {
                _type: "image" as const,
                url:
                  typeof doc.brand.logo === "object" && doc.brand.logo !== null
                    ? doc.brand.logo.url || ""
                    : "",
                asset: {
                  _ref: doc.brand.logo?.id || "brand-logo",
                  _type: "reference",
                },
              }
            : {
                // Fallback taake Type mismatch na aaye
                _type: "image" as const,
                url: "",
                asset: { _ref: "no-logo", _type: "reference" },
              },
        }
      : undefined;
  // ==============================================================

  return {
    _id: doc.id,
    _createdAt: doc.createdAt,
    title: doc.title,
    slug: doc.slug,
    videoUrl: doc.videoUrl || undefined,
    variants: variants,

    defaultVariant: (variants[0] || {
      _key: "default",
      name: "Default",
      price: 0,
      inStock: false,
      attributes: [],
      images: [],
    }) as ProductVariant,

    description: lexicalToPortableText(doc.description),
    shippingAndReturns: lexicalToPortableText(doc.shippingAndReturns),

    specifications:
      doc.specifications?.map((spec: any, index: number) => ({
        _key: spec.id || `spec-${index}`,
        label: spec.label,
        value: spec.value,
      })) || [],

    brand: brand,

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
  } as SanityProduct;
};
