//// src/sanity/lib/payload/plp/querybuilder.ts
import { Where } from 'payload';

export const buildProductQuery = (options: any): Where => {
  // 🔥 FIX: 'brandIds' aur 'categoryIds' receive kar rahe hain
  const { searchTerm, categoryIds, filters, minPrice, maxPrice, campaignSlug, isDeal, brandIds } = options;
  
  const where: Where = {
    and: []
  };

  // 1. Search Term Logic (Smart Search)
  if (searchTerm) {
    const searchConditions: any[] = [
      { title: { contains: searchTerm } } // Title mein dhoondo
    ];

    // 🔥 FIX: Agar Brand IDs mile hain (yani user ne brand ka naam search kiya), to unhein bhi check karo
    if (brandIds && brandIds.length > 0) {
      searchConditions.push({ brand: { in: brandIds } });
    }

    where.and!.push({
      or: searchConditions
    });
  }

  // 2. Category Filter (Recursive)
  // 🔥 FIX: Ab hum single slug match nahi kar rahe, balkay poori family (IDs) check kar rahe hain
  if (categoryIds && categoryIds.length > 0) {
      where.and!.push({
          categories: { in: categoryIds }
      });
  }

  // 3. Campaign & Deals
  if (campaignSlug) {
      // Is logic ko hum index.ts mein handle kar chuke hain ID fetch karke
  }
  if (isDeal) {
      where.and!.push({
          isOnDeal: { equals: true }
      });
  }

  // 4. Price Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.greater_than_equal = minPrice;
    if (maxPrice !== undefined) priceCondition.less_than_equal = maxPrice;
    
    where.and!.push({
      'variants.price': priceCondition
    });
  }

  // 5. Dynamic Filters
  if (filters) {
    // Availability
    if (filters.availability?.includes('in-stock')) {
        where.and!.push({
            'variants.inStock': { equals: true }
        });
    }

    // On Sale
    if (filters.isOnSale) {
        where.and!.push({
             'variants.salePrice': { exists: true }
        });
    }

    // Attributes (Color, Size)
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0 && !['brands', 'categories', 'minRating', 'availability', 'isOnSale', 'isFeatured'].includes(key)) {
         where.and!.push({
            'variants.attributes.value': { in: values }
         });
      }
    });
  }

  return where;
};