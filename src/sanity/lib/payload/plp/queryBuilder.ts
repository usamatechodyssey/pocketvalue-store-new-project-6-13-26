
// // src/sanity/lib/payload/plp/queryBuilder.ts

// import { Where } from 'payload';

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

// const sanitizeSearchTerm = (term: string): string => {
//   return term.replace(/[^a-zA-Z0-9\s]/g, '').trim();
// };

// export const buildProductQuery = (options: QueryOptions): Where => {
//   const { searchTerm, categoryIds, filters, minPrice, maxPrice, campaignSlug, isDeal, brandIds } = options;
//   const where: Where = { and: [] };

//   // Search
//   if (searchTerm) {
//     const sanitizedTerm = sanitizeSearchTerm(searchTerm);
//     if (sanitizedTerm) {
//       where.and!.push({ title: { contains: sanitizedTerm } });
//     }
//   }

//   // Categories
//   if (categoryIds && categoryIds.length > 0) {
//     where.and!.push({ categories: { in: categoryIds } });
//   }

//   // Brands
//   const brandFilterValues = filters?.brands?.length ? filters.brands : (brandIds && brandIds.length > 0 ? brandIds : undefined);
//   if (brandFilterValues && brandFilterValues.length > 0) {
//     where.and!.push({ brand: { in: brandFilterValues } });
//   }

//   // Deals
//   if (isDeal) {
//     where.and!.push({ isOnDeal: { equals: true } });
//   }

//   // Price
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

//   // Filters
//   if (filters) {
//     // Availability
//     if (filters.availability?.includes('in-stock')) {
//       where.and!.push({ 'variants.inStock': { equals: true } });
//     }
//     // On Sale
//     if (filters.isOnSale) {
//       where.and!.push({ 'variants.salePrice': { exists: true } });
//     }
//     // Min Rating
//     if (filters.minRating !== undefined && filters.minRating !== null) {
//       where.and!.push({ rating: { greater_than_equal: filters.minRating } });
//     }
//     // Featured
//     if (filters.isFeatured) {
//       where.and!.push({ isFeatured: { equals: true } });
//     }

//     // Attribute filters
//     const systemFields = ['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'];

//     // Group attribute filters by normalized name
//     const attributeGroups: Record<string, { name: string; values: string[] }> = {};

//     Object.entries(filters).forEach(([key, values]) => {
//       if (systemFields.includes(key)) return;
//       if (!Array.isArray(values) || values.length === 0) return;

//       const normalizedKey = key.toLowerCase();
//       if (!attributeGroups[normalizedKey]) {
//         attributeGroups[normalizedKey] = { name: key, values: [] };
//       }
//       values.forEach((v: string) => {
//         if (!attributeGroups[normalizedKey].values.includes(v)) {
//           attributeGroups[normalizedKey].values.push(v);
//         }
//       });
//     });

//     const attributeFiltersList = Object.values(attributeGroups);

//     if (attributeFiltersList.length > 0) {
//       // ✅ FIX: Use nested $elemMatch for attributes
//       const attributeConditions = attributeFiltersList.map(attr => ({
//         attributes: {
//           $elemMatch: {
//             name: { $regex: `^${attr.name}$`, $options: 'i' },
//             value: { in: attr.values }
//           }
//         }
//       }));

//       const variantElemMatch: any = {};
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
// 📂 src/sanity/lib/payload/plp/queryBuilder.ts

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
        { 'variants.0.price': priceCondition },
        { 'variants.0.salePrice': priceCondition }
      ]
    });
  }

  // Filters
  if (filters) {
    // Availability
    if (filters.availability?.includes('in-stock')) {
      where.and!.push({ 'variants.inStock': { equals: true } });
      where.and!.push({ 'variants.stock': { greater_than: 0 } });
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

  // ✅ CRITICAL FIX: If no 'and' conditions were added, delete 'and' key to prevent MongoDB '$and/$or must be a nonempty array' crash!
  if (where.and && where.and.length === 0) {
    delete where.and;
  }

  return where;
};