// // // //// src/sanity/lib/payload/plp/querybuilder.ts

// // import { Where } from 'payload';

// // // ✅ Strict Whitelist: Known attribute keys allowed for filtering
// // const KNOWN_ATTRIBUTE_KEYS = new Set([
// //   'color',
// //   'size',
// //   'material',
// //   'style',
// //   'fit',
// //   'length',
// //   'pattern',
// //   'brand',
// //   // Add more as per your product attributes
// // ]);

// // // ✅ FIX 3: Strictly typed QueryOptions
// // export interface QueryOptions {
// //   searchTerm?: string;
// //   categoryIds?: string[];
// //   filters?: {
// //     brands?: string[];
// //     categories?: string[];
// //     availability?: string[];
// //     isOnSale?: boolean;
// //     isFeatured?: boolean;
// //     minRating?: number;
// //     [key: string]: string[] | boolean | number | undefined;
// //   };
// //   minPrice?: number;
// //   maxPrice?: number;
// //   campaignSlug?: string;
// //   isDeal?: boolean;
// //   brandIds?: string[];
// // }

// // // ✅ FIX 1: Search term sanitizer
// // const sanitizeSearchTerm = (term: string): string => {
// //   // Remove special regex characters, keep alphanumeric + spaces
// //   return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
// // };

// // export const buildProductQuery = (options: QueryOptions): Where => {
// //   const { 
// //     searchTerm, 
// //     categoryIds, 
// //     filters, 
// //     minPrice, 
// //     maxPrice, 
// //     campaignSlug, 
// //     isDeal, 
// //     brandIds 
// //   } = options;
  
// //   const where: Where = {
// //     and: []
// //   };

// //   // =================================================================
// //   // 1. SEARCH TERM LOGIC (Sanitized + Brand removed)
// //   // =================================================================
// //   if (searchTerm) {
// //     const sanitizedTerm = sanitizeSearchTerm(searchTerm);
// //     if (sanitizedTerm) {
// //       where.and!.push({
// //         title: { contains: sanitizedTerm }
// //       });
// //     }
// //   }

// //   // =================================================================
// //   // 2. CATEGORY FILTER
// //   // =================================================================
// //   if (categoryIds && categoryIds.length > 0) {
// //     where.and!.push({
// //       categories: { in: categoryIds }
// //     });
// //   }

// //   // =================================================================
// //   // 3. BRAND FILTER (Single source of truth)
// //   // =================================================================
// //   const brandFilterValues = filters?.brands?.length 
// //     ? filters.brands 
// //     : (brandIds && brandIds.length > 0 ? brandIds : undefined);

// //   if (brandFilterValues && brandFilterValues.length > 0) {
// //     where.and!.push({
// //       brand: { in: brandFilterValues }
// //     });
// //   }

// //   // =================================================================
// //   // 4. CAMPAIGN & DEALS
// //   // =================================================================
// //   if (campaignSlug) {
// //     // Already handled in index.ts
// //   }
// //   if (isDeal) {
// //     where.and!.push({
// //       isOnDeal: { equals: true }
// //     });
// //   }

// //   // =================================================================
// //   // 5. PRICE FILTER (Includes Sale Price)
// //   // =================================================================
// //   if (minPrice !== undefined || maxPrice !== undefined) {
// //     const priceCondition: any = {};
// //     if (minPrice !== undefined) priceCondition.greater_than_equal = minPrice;
// //     if (maxPrice !== undefined) priceCondition.less_than_equal = maxPrice;

// //     where.and!.push({
// //       or: [
// //         { 'variants.price': priceCondition },
// //         { 'variants.salePrice': priceCondition }
// //       ]
// //     });
// //   }

// //   // =================================================================
// //   // 6. DYNAMIC FILTERS (Attributes, Availability, etc.)
// //   // =================================================================
// //   if (filters) {
// //     // --- Availability Filter ---
// //     if (filters.availability?.includes('in-stock')) {
// //       where.and!.push({
// //         'variants.inStock': { equals: true }
// //       });
// //     }

// //     // --- On Sale Filter ---
// //     if (filters.isOnSale) {
// //       where.and!.push({
// //         'variants.salePrice': { exists: true }
// //       });
// //     }

// //     // --- Attribute Filters (AND Logic with ElemMatch) ---
// //     const attributeFilters: { name: string; values: string[] }[] = [];

// //     Object.entries(filters).forEach(([key, values]) => {
// //       // Skip system fields
// //       const isSystemField = ['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'].includes(key);
// //       if (isSystemField) return;

// //       if (Array.isArray(values) && values.length > 0) {
// //         // ✅ FIX 4: Strict whitelist enforcement (ignore unknown attributes)
// //         if (KNOWN_ATTRIBUTE_KEYS.has(key.toLowerCase())) {
// //           attributeFilters.push({ name: key, values: values as string[] });
// //         }
// //         // Unknown attributes are silently ignored (security best practice)
// //       }
// //     });

// //     // Apply attribute filters
// //     if (attributeFilters.length > 0) {
// //       const variantElemMatch: any = {};
// //       const attributeConditions: any[] = attributeFilters.map(attr => ({
// //         attributes: {
// //           $elemMatch: {
// //             name: { equals: attr.name },
// //             value: { in: attr.values }
// //           }
// //         }
// //       }));

// //       if (attributeConditions.length === 1) {
// //         variantElemMatch.$elemMatch = attributeConditions[0];
// //       } else {
// //         variantElemMatch.$elemMatch = {
// //           $and: attributeConditions
// //         };
// //       }

// //       where.and!.push({
// //         variants: variantElemMatch
// //       });
// //     }
// //   }

// //   return where;
// // };
// // 📂 src/sanity/lib/payload/plp/queryBuilder.ts

// import { Where } from 'payload';

// // ✅ STRICT WHITELIST: Known attribute keys for security
// const KNOWN_ATTRIBUTE_KEYS = new Set([
//   'color', 'size', 'material', 'style', 'fit', 'length', 'pattern', 'brand',
// ]);

// // ================================================================
// // ✅ EXPORTED INTERFACE (Must be exported)
// // ================================================================
// export interface QueryOptions {
//   searchTerm?: string;
//   categoryIds?: string[];
//   filters?: {
//     brands?: string[];
//     categories?: string[];
//     availability?: string[];
//     isOnSale?: boolean;
//     isFeatured?: boolean;
//     minRating?: number;
//     [key: string]: string[] | boolean | number | undefined;
//   };
//   minPrice?: number;
//   maxPrice?: number;
//   campaignSlug?: string;
//   isDeal?: boolean;
//   brandIds?: string[];
// }

// // ================================================================
// // 🔧 HELPER: Sanitize search term
// // ================================================================
// const sanitizeSearchTerm = (term: string): string => {
//   return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
// };

// // ================================================================
// // ✅ EXPORTED FUNCTION (Must be exported)
// // ================================================================
// export const buildProductQuery = (options: QueryOptions): Where => {
//   const { searchTerm, categoryIds, filters, minPrice, maxPrice, campaignSlug, isDeal, brandIds } = options;
//   const where: Where = { and: [] };

//   // --- Search ---
//   if (searchTerm) {
//     const sanitizedTerm = sanitizeSearchTerm(searchTerm);
//     if (sanitizedTerm) {
//       where.and!.push({ title: { contains: sanitizedTerm } });
//     }
//   }

//   // --- Categories ---
//   if (categoryIds && categoryIds.length > 0) {
//     where.and!.push({ categories: { in: categoryIds } });
//   }

//   // --- Brands ---
//   const brandFilterValues = filters?.brands?.length ? filters.brands : (brandIds && brandIds.length > 0 ? brandIds : undefined);
//   if (brandFilterValues && brandFilterValues.length > 0) {
//     where.and!.push({ brand: { in: brandFilterValues } });
//   }

//   // --- Deals ---
//   if (isDeal) {
//     where.and!.push({ isOnDeal: { equals: true } });
//   }

//   // --- Price ---
//   if (minPrice !== undefined || maxPrice !== undefined) {
//     const priceCondition: any = {};
//     if (minPrice !== undefined) priceCondition.greater_than_equal = minPrice;
//     if (maxPrice !== undefined) priceCondition.less_than_equal = maxPrice;

//     where.and!.push({
//       or: [
//         { 'variants.price': priceCondition },
//         { 'variants.salePrice': priceCondition }
//       ]
//     });
//   }

//   // --- Dynamic Filters (Attributes, Availability, etc.) ---
//   if (filters) {
//     if (filters.availability?.includes('in-stock')) {
//       where.and!.push({ 'variants.inStock': { equals: true } });
//     }
//     if (filters.isOnSale) {
//       where.and!.push({ 'variants.salePrice': { exists: true } });
//     }

//     // Attribute filters
//     const attributeFilters: { name: string; values: string[] }[] = [];

//     Object.entries(filters).forEach(([key, values]) => {
//       const isSystemField = ['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'].includes(key);
//       if (isSystemField) return;
//       if (Array.isArray(values) && values.length > 0) {
//         if (KNOWN_ATTRIBUTE_KEYS.has(key.toLowerCase())) {
//           attributeFilters.push({ name: key, values: values as string[] });
//         }
//         // Unknown attributes are silently ignored (security)
//       }
//     });

//     if (attributeFilters.length > 0) {
//       const variantElemMatch: any = {};
//       const attributeConditions = attributeFilters.map(attr => ({
//         attributes: {
//           $elemMatch: {
//             name: { equals: attr.name },
//             value: { in: attr.values }
//           }
//         }
//       }));

//       if (attributeConditions.length === 1) {
//         variantElemMatch.$elemMatch = attributeConditions[0];
//       } else {
//         variantElemMatch.$elemMatch = { $and: attributeConditions };
//       }

//       where.and!.push({ variants: variantElemMatch });
//     }
//   }

//   return where;
// };
// src/sanity/lib/payload/plp/queryBuilder.ts

import { Where } from 'payload';

export interface QueryOptions {
  searchTerm?: string;
  categoryIds?: string[];
  filters?: {
    brands?: string[];
    categories?: string[];
    availability?: string[];
    isOnSale?: boolean;
    isFeatured?: boolean;
    minRating?: number;
    [key: string]: string[] | boolean | number | undefined;
  };
  minPrice?: number;
  maxPrice?: number;
  campaignSlug?: string;
  isDeal?: boolean;
  brandIds?: string[];
}

const sanitizeSearchTerm = (term: string): string => {
  return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
};

export const buildProductQuery = (options: QueryOptions): Where => {
  const { searchTerm, categoryIds, filters, minPrice, maxPrice, campaignSlug, isDeal, brandIds } = options;
  const where: Where = { and: [] };

  // Search
  if (searchTerm) {
    const sanitizedTerm = sanitizeSearchTerm(searchTerm);
    if (sanitizedTerm) {
      where.and!.push({ title: { contains: sanitizedTerm } });
    }
  }

  // Categories
  if (categoryIds && categoryIds.length > 0) {
    where.and!.push({ categories: { in: categoryIds } });
  }

  // Brands
  const brandFilterValues = filters?.brands?.length ? filters.brands : (brandIds && brandIds.length > 0 ? brandIds : undefined);
  if (brandFilterValues && brandFilterValues.length > 0) {
    where.and!.push({ brand: { in: brandFilterValues } });
  }

  // Deals
  if (isDeal) {
    where.and!.push({ isOnDeal: { equals: true } });
  }

  // Price
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.greater_than_equal = minPrice;
    if (maxPrice !== undefined) priceCondition.less_than_equal = maxPrice;

    where.and!.push({
      or: [
        { 'variants.price': priceCondition },
        { 'variants.salePrice': priceCondition }
      ]
    });
  }

  // Filters
  if (filters) {
    // Availability
    if (filters.availability?.includes('in-stock')) {
      where.and!.push({ 'variants.inStock': { equals: true } });
    }
    // On Sale
    if (filters.isOnSale) {
      where.and!.push({ 'variants.salePrice': { exists: true } });
    }
    // Min Rating
    if (filters.minRating !== undefined && filters.minRating !== null) {
      where.and!.push({ rating: { greater_than_equal: filters.minRating } });
    }
    // Featured
    if (filters.isFeatured) {
      where.and!.push({ isFeatured: { equals: true } });
    }

    // Attribute filters
    const systemFields = ['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'];

    // Group attribute filters by normalized name
    const attributeGroups: Record<string, { name: string; values: string[] }> = {};

    Object.entries(filters).forEach(([key, values]) => {
      if (systemFields.includes(key)) return;
      if (!Array.isArray(values) || values.length === 0) return;

      const normalizedKey = key.toLowerCase();
      if (!attributeGroups[normalizedKey]) {
        attributeGroups[normalizedKey] = { name: key, values: [] };
      }
      values.forEach((v: string) => {
        if (!attributeGroups[normalizedKey].values.includes(v)) {
          attributeGroups[normalizedKey].values.push(v);
        }
      });
    });

    const attributeFiltersList = Object.values(attributeGroups);

    if (attributeFiltersList.length > 0) {
      // ✅ FIX: Use nested $elemMatch for attributes
      const attributeConditions = attributeFiltersList.map(attr => ({
        attributes: {
          $elemMatch: {
            name: { $regex: `^${attr.name}$`, $options: 'i' },
            value: { in: attr.values }
          }
        }
      }));

      const variantElemMatch: any = {};
      if (attributeConditions.length === 1) {
        variantElemMatch.$elemMatch = attributeConditions[0];
      } else {
        variantElemMatch.$elemMatch = { $and: attributeConditions };
      }

      where.and!.push({ variants: variantElemMatch });
    }
  }

  return where;
};
// // src/sanity/lib/payload/plp/queryBuilder.ts

// import { Where } from 'payload';

// // ================================================================
// // ✅ EXPORTED INTERFACE
// // ================================================================
// export interface QueryOptions {
//   searchTerm?: string;
//   categoryIds?: string[];
//   filters?: {
//     brands?: string[];
//     categories?: string[];
//     availability?: string[];
//     isOnSale?: boolean;
//     isFeatured?: boolean;
//     minRating?: number;
//     [key: string]: string[] | boolean | number | undefined;
//   };
//   minPrice?: number;
//   maxPrice?: number;
//   campaignSlug?: string;
//   isDeal?: boolean;
//   brandIds?: string[];
// }

// // ================================================================
// // 🔧 HELPER: Sanitize search term
// // ================================================================
// const sanitizeSearchTerm = (term: string): string => {
//   return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
// };

// // ================================================================
// // ✅ EXPORTED FUNCTION (UPDATED)
// // ================================================================
// export const buildProductQuery = (options: QueryOptions): Where => {
//   const { searchTerm, categoryIds, filters, minPrice, maxPrice, campaignSlug, isDeal, brandIds } = options;
//   const where: Where = { and: [] };

//   // --- Search ---
//   if (searchTerm) {
//     const sanitizedTerm = sanitizeSearchTerm(searchTerm);
//     if (sanitizedTerm) {
//       where.and!.push({ title: { contains: sanitizedTerm } });
//     }
//   }

//   // --- Categories ---
//   if (categoryIds && categoryIds.length > 0) {
//     where.and!.push({ categories: { in: categoryIds } });
//   }

//   // --- Brands ---
//   const brandFilterValues = filters?.brands?.length ? filters.brands : (brandIds && brandIds.length > 0 ? brandIds : undefined);
//   if (brandFilterValues && brandFilterValues.length > 0) {
//     where.and!.push({ brand: { in: brandFilterValues } });
//   }

//   // --- Deals ---
//   if (isDeal) {
//     where.and!.push({ isOnDeal: { equals: true } });
//   }

//   // --- Price ---
//   if (minPrice !== undefined || maxPrice !== undefined) {
//     const priceCondition: any = {};
//     if (minPrice !== undefined) priceCondition.greater_than_equal = minPrice;
//     if (maxPrice !== undefined) priceCondition.less_than_equal = maxPrice;

//     where.and!.push({
//       or: [
//         { 'variants.price': priceCondition },
//         { 'variants.salePrice': priceCondition }
//       ]
//     });
//   }

//   // --- Dynamic Filters (Attributes, Availability, etc.) ---
//   if (filters) {
//     // Availability
//     if (filters.availability?.includes('in-stock')) {
//       where.and!.push({ 'variants.inStock': { equals: true } });
//     }
//     // On Sale
//     if (filters.isOnSale) {
//       where.and!.push({ 'variants.salePrice': { exists: true } });
//     }
//     // ✅ NEW: Min Rating
//     if (filters.minRating !== undefined && filters.minRating !== null) {
//       where.and!.push({ rating: { greater_than_equal: filters.minRating } });
//     }
//     // ✅ NEW: Featured
//     if (filters.isFeatured) {
//       where.and!.push({ isFeatured: { equals: true } });
//     }

//     // --- Attribute filters (all keys except system fields) ---
//     const systemFields = ['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'];
//     const attributeFilters: { name: string; values: string[] }[] = [];

//     Object.entries(filters).forEach(([key, values]) => {
//       if (systemFields.includes(key)) return;
//       if (Array.isArray(values) && values.length > 0) {
//         // ✅ No whitelist – all attribute keys are accepted (they come from the product data)
//         attributeFilters.push({ name: key, values: values as string[] });
//       }
//     });

//     if (attributeFilters.length > 0) {
//       const variantElemMatch: any = {};
//       const attributeConditions = attributeFilters.map(attr => ({
//         attributes: {
//           $elemMatch: {
//             name: { equals: attr.name },
//             value: { in: attr.values }
//           }
//         }
//       }));

//       if (attributeConditions.length === 1) {
//         variantElemMatch.$elemMatch = attributeConditions[0];
//       } else {
//         variantElemMatch.$elemMatch = { $and: attributeConditions };
//       }

//       where.and!.push({ variants: variantElemMatch });
//     }
//   }

//   return where;
// };