
// src/sanity/lib/payload/plp/productMapper.ts

import SanityProduct, {
  ProductVariant,
  SanityBrand,
} from "../../../../types";
import { lexicalToPortableText } from "../types/lexicalHelper";

// ====================================================================
// ✅ ENTERPRISE FIX: Raw URL (imageUrl) prioritized for CDN Mode
// ====================================================================
const getImageUrl = (
  img: any,
  globalFetchMode: 'imgbb' | 'r2' | 'both',
  productPrimaryProvider: 'imgbb' | 'r2' | undefined
): string => {
  if (!img) return '/placeholder.svg';
  if (typeof img === 'string') return img;

  let selectedUrl: string | null = null;

  // ✅ 1. PRIORITY 1: Raw URL (cdnMode enabled)
  if (img.imageUrl) {
    selectedUrl = img.imageUrl;
  }
  // ✅ 2. PRIORITY 2: Provider-based selection (imgbb/r2)
  else if (globalFetchMode === 'imgbb') {
    selectedUrl = img.imgbbUrl || img.url || null;
  } else if (globalFetchMode === 'r2') {
    selectedUrl = img.r2Url || img.url || null;
  } else if (globalFetchMode === 'both') {
    if (productPrimaryProvider === 'r2') {
      selectedUrl = img.r2Url || img.imgbbUrl || img.url || null;
    } else {
      selectedUrl = img.imgbbUrl || img.r2Url || img.url || null;
    }
  }

  // ✅ 3. FINAL FALLBACK: Check all possible fields
  if (!selectedUrl) {
    selectedUrl = img.imageUrl || img.imgbbUrl || img.r2Url || img.url || null;
  }

  return selectedUrl || '/placeholder.svg';
};

export const mapPayloadProductToSanity = (
  doc: any,
  reviews: any[] = [],
  globalFetchMode: 'imgbb' | 'r2' | 'both' = 'imgbb'
): SanityProduct => {
  const totalReviews = doc.reviewCount || 0;
  const averageRating = doc.rating || 0;
  const productPrimaryProvider = doc.primaryProvider || 'imgbb';

  const variants: ProductVariant[] =
    doc.variants?.map((v: any, index: number) => {
      const mappedImages: any[] = [];
      const seenUrls = new Set<string>();

      /**
       * Safely handles and pushes image object to final mapper list without duplicates
       */
      const addImage = (url: string, rawImg: any, isCdn: boolean, idx: number) => {
        if (!url || url === '/placeholder.svg') return;
        if (seenUrls.has(url)) return;
        seenUrls.add(url);

        mappedImages.push({
          _type: "image" as const,
          url: url,
          _imgbbUrl: isCdn ? null : (rawImg?.imgbbUrl || null),
          _r2Url: isCdn ? null : (rawImg?.r2Url || null),
          asset: {
            _ref: typeof rawImg === 'string' ? rawImg : (rawImg?.id || `${isCdn ? 'cdn-' : ''}img-${index}-${idx}`),
            _type: "reference",
          },
        });
      };

      // 1. Process cdnImages first if present (Prioritizes direct text URLs for CDN Mode)
      if (Array.isArray(v.cdnImages)) {
        v.cdnImages.forEach((img: any, iIndex: number) => {
          if (!img) return;
          const url = typeof img === 'string' ? img : (img.url || '');
          addImage(url, img, true, iIndex);
        });
      }

      // 2. Process regular images relation (Upload Mode fallback)
      if (Array.isArray(v.images)) {
        v.images.forEach((img: any, iIndex: number) => {
          if (!img) return;
          const url = getImageUrl(img, globalFetchMode, productPrimaryProvider);
          addImage(url, img, false, iIndex);
        });
      }

      // 3. Solid placeholder fallback if no valid images are rendered at all
      if (mappedImages.length === 0) {
        mappedImages.push({
          _type: "image" as const,
          url: '/placeholder.svg',
          _imgbbUrl: null,
          _r2Url: null,
          asset: {
            _ref: `placeholder-${index}`,
            _type: "reference",
          },
        });
      }

      return {
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
        images: mappedImages,
      };
    }) || [];

  const brand: SanityBrand | undefined =
    doc.brand && typeof doc.brand === "object"
      ? {
          _id: doc.brand.id,
          name: doc.brand.name,
          slug: doc.brand.slug,
          logo: doc.brand.logo
            ? {
                _type: "image" as const,
                url:
                  typeof doc.brand.logo === "object" && doc.brand.logo !== null
                    ? doc.brand.logo.url || ""
                    : (typeof doc.brand.logo === "string" ? doc.brand.logo : ""),
                asset: {
                  _ref: typeof doc.brand.logo === "object" && doc.brand.logo !== null
                    ? doc.brand.logo.id || "brand-logo"
                    : (typeof doc.brand.logo === "string" ? doc.brand.logo : "brand-logo"),
                  _type: "reference",
                },
              }
            : {
                _type: "image" as const,
                url: "",
                asset: { _ref: "no-logo", _type: "reference" },
              },
        }
      : undefined;

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

    categoryIds: Array.isArray(doc.categories)
      ? doc.categories.map((c: any) => (typeof c === "object" ? c.id : c))
      : [],

    rating: averageRating,
    reviewCount: totalReviews,
    reviews: reviews,
    seo: doc.seo,
  } as SanityProduct;
};