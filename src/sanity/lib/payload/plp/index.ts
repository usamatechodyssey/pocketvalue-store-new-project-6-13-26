// import { getPayload } from 'payload';
// import configPromise from '@payload-config';
// import { mapPayloadProductToSanity } from './productMapper';
// import { buildProductQuery } from './queryBuilder';
// import { getPayloadReviewsForProduct } from '../review.queries';

// interface SearchOptions {
//     searchTerm?: string;
//     categorySlug?: string;
//     campaignSlug?: string;
//     isDeal?: boolean;
//     filters?: any;
//     minPrice?: number;
//     maxPrice?: number;
//     sortOrder?: string;
//     page?: number;
// }

// // 🔥 HELPER: Recursive Category Finder
// // Ye function kisi bhi category ke saare bachon (descendants) ki IDs nikal kar layega
// const getAllDescendantIds = async (payload: any, parentSlug: string) => {
//     // 1. Parent Category dhundo
//     const parent = await payload.find({
//         collection: 'categories',
//         where: { slug: { equals: parentSlug } },
//     });

//     if (parent.docs.length === 0) return [];

//     const parentId = parent.docs[0].id;
//     let allIds = [parentId];

//     // 2. Is parent ke direct children dhoondo
//     let children = await payload.find({
//         collection: 'categories',
//         where: { parent: { equals: parentId } },
//         limit: 100,
//     });

//     // 3. Har child ke bhi children dhoondo (Loop)
//     while (children.docs.length > 0) {
//         const childIds = children.docs.map((c: any) => c.id);
//         allIds = [...allIds, ...childIds];

//         // Next level fetch karo
//         children = await payload.find({
//             collection: 'categories',
//             where: { parent: { in: childIds } },
//             limit: 100,
//         });
//     }

//     return allIds;
// };

// export const getPayloadProducts = async (options: SearchOptions) => {
//     const payload = await getPayload({ config: configPromise });
//     const { page = 1, sortOrder, filters, campaignSlug, searchTerm, categorySlug } = options;

//     // --- PRE-FETCHING LOGIC ---

//     // 1. Recursive Categories IDs
//     let targetCategoryIds: string[] = [];
//     if (categorySlug) {
//         targetCategoryIds = await getAllDescendantIds(payload, categorySlug);
//     }

//     // 2. Brand Search IDs (Agar user ne brand search kiya hai)
//     let matchingBrandIds: string[] = [];
//     if (searchTerm) {
//         const brandResults = await payload.find({
//             collection: 'brands',
//             where: { name: { contains: searchTerm } }, // Brand name match karo
//             limit: 20
//         });
//         matchingBrandIds = brandResults.docs.map((b: any) => b.id);
//     }

//     // 3. Campaign Logic
//     const queryOptions = {
//         ...options,
//         categoryIds: targetCategoryIds, // Pass the full tree
//         brandIds: matchingBrandIds // Pass matching brands
//     };

//     // Campaign specific filter add karna
//     const where = buildProductQuery(queryOptions);

//     if (campaignSlug) {
//         const campaigns = await payload.find({
//             collection: 'campaigns',
//             where: { slug: { equals: campaignSlug } }
//         });
//         if (campaigns.docs.length > 0) {
//              where.and?.push({ activeCampaigns: { in: [campaigns.docs[0].id] } });
//         }
//     }

//     // Brand Filters (Checkbox wale)
//     if (filters?.brands?.length > 0) {
//         const brands = await payload.find({
//             collection: 'brands',
//             where: { slug: { in: filters.brands } }
//         });
//         const brandIds = brands.docs.map((b: any) => b.id);
//         if (brandIds.length > 0) {
//             where.and?.push({ brand: { in: brandIds } });
//         }
//     }

//     // --- SORTING ---
//     let sort = '-createdAt';
//     if (sortOrder === 'price-low-to-high') sort = 'variants.price';
//     if (sortOrder === 'price-high-to-low') sort = '-variants.price';
//     if (sortOrder === 'best-selling') sort = '-rating';

//     // --- FINAL QUERY ---
//     const result = await payload.find({
//         collection: 'products',
//         where,
//         sort,
//         page,
//         limit: 40,
//         depth: 2
//     });

//     const productsWithRatings = await Promise.all(result.docs.map(async (doc) => {
//         const reviews = await getPayloadReviewsForProduct(doc.id);
//         return mapPayloadProductToSanity(doc, reviews);
//     }));

//     return {
//         products: productsWithRatings,
//         totalCount: result.totalDocs
//     };
// };
// src/sanity/lib/payload/plp/index.ts

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { mapPayloadProductToSanity } from "./productMapper";
import { buildProductQuery } from "./queryBuilder";
// 🔥 FIX: getPayloadReviewsForProduct ka import hata diya kyunke ab uski zaroorat nahi!

interface SearchOptions {
  searchTerm?: string;
  categorySlug?: string;
  campaignSlug?: string;
  isDeal?: boolean;
  filters?: any;
  minPrice?: number;
  maxPrice?: number;
  sortOrder?: string;
  page?: number;
}

// 🔥 HELPER: Recursive Category Finder
const getAllDescendantIds = async (payload: any, parentSlug: string) => {
  const parent = await payload.find({
    collection: "categories",
    where: { slug: { equals: parentSlug } },
  });
  if (parent.docs.length === 0) return [];

  const parentId = parent.docs[0].id;
  let allIds = [parentId];

  let children = await payload.find({
    collection: "categories",
    where: { parent: { equals: parentId } },
    limit: 100,
  });

  while (children.docs.length > 0) {
    const childIds = children.docs.map((c: any) => c.id);
    allIds = [...allIds, ...childIds];

    children = await payload.find({
      collection: "categories",
      where: { parent: { in: childIds } },
      limit: 100,
    });
  }
  return allIds;
};

export const getPayloadProducts = async (options: SearchOptions) => {
  const payload = await getPayload({ config: configPromise });
  const {
    page = 1,
    sortOrder,
    filters,
    campaignSlug,
    searchTerm,
    categorySlug,
  } = options;

  // --- 1. PRE-FETCHING LOGIC (Categories & Search) ---
  let targetCategoryIds: string[] = [];
  if (categorySlug) {
    targetCategoryIds = await getAllDescendantIds(payload, categorySlug);
  }

  let matchingBrandIds: string[] = [];
  if (searchTerm) {
    const brandResults = await payload.find({
      collection: "brands",
      where: { name: { contains: searchTerm } },
      limit: 20,
    });
    matchingBrandIds = brandResults.docs.map((b: any) => b.id);
  }

  // --- 2. QUERY BUILDING ---
  const queryOptions = {
    ...options,
    categoryIds: targetCategoryIds,
    brandIds: matchingBrandIds,
  };
  const where = buildProductQuery(queryOptions);

  if (campaignSlug) {
    const campaigns = await payload.find({
      collection: "campaigns",
      where: { slug: { equals: campaignSlug } },
    });
    if (campaigns.docs.length > 0) {
      where.and?.push({ activeCampaigns: { in: [campaigns.docs[0].id] } });
    }
  }

  // ============================================================
  // 🔥 GLOBAL FILTER AGGREGATION
  // ============================================================
  const filterDiscovery = await payload.find({
    collection: "products",
    where,
    limit: 500,
    depth: 1,
    select: {
      brand: true,
      "variants.price": true,
      "variants.salePrice": true,
      "variants.attributes": true,
    },
  });

  const globalBrands = new Map();
  const globalAttributes: any[] = [];
  let globalMinPrice = Infinity;
  let globalMaxPrice = 0;

  filterDiscovery.docs.forEach((p: any) => {
    if (p.brand && typeof p.brand === "object") {
      globalBrands.set(p.brand.id, {
        _id: p.brand.id,
        name: p.brand.name,
        slug: p.brand.slug,
      });
    }

    p.variants?.forEach((v: any) => {
      const currentPrice = v.salePrice || v.price;
      if (currentPrice < globalMinPrice) globalMinPrice = currentPrice;
      if (currentPrice > globalMaxPrice) globalMaxPrice = currentPrice;

      v.attributes?.forEach((attr: any) => {
        globalAttributes.push({ name: attr.name, value: attr.value });
      });
    });
  });

  const filterData = {
    brands: Array.from(globalBrands.values()),
    attributes: globalAttributes,
    priceRange: {
      min: globalMinPrice === Infinity ? 0 : globalMinPrice,
      max: globalMaxPrice,
    },
  };

  // ============================================================
  // --- 3. FINAL PAGINATED PRODUCT QUERY ---
  // ============================================================
  if (filters?.brands?.length > 0) {
    const brands = await payload.find({
      collection: "brands",
      where: { slug: { in: filters.brands } },
    });
    const brandIds = brands.docs.map((b: any) => b.id);
    if (brandIds.length > 0) {
      where.and?.push({ brand: { in: brandIds } });
    }
  }

  let sort = "-createdAt";
  if (sortOrder === "price-low-to-high") sort = "variants.price";
  if (sortOrder === "price-high-to-low") sort = "-variants.price";
  if (sortOrder === "best-selling") sort = "-rating";

  const result = await payload.find({
    collection: "products",
    where,
    sort,
    page,
    limit: 40,
    depth: 2,
  });

  // 🔥 THE MASTER FIX: No more Promise.all! No more 40 database queries!
  // Ab hum sirf seedha map kar rahe hain kyunke rating aur count pehle se document mein mojood hain.
  const mappedProducts = result.docs.map((doc) =>
    mapPayloadProductToSanity(doc, []),
  );

  return {
    products: mappedProducts,
    totalCount: result.totalDocs,
    filterData,
  };
};
