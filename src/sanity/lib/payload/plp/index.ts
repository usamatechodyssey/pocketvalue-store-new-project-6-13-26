
// // src/sanity/lib/payload/plp/index.ts

// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";
// import { mapPayloadProductToSanity } from "./productMapper";
// import { buildProductQuery, QueryOptions } from "./queryBuilder";
// import { unstable_cache } from "next/cache";
// import crypto from "crypto";
// import mongoose from "mongoose";

// interface SearchOptions {
//   searchTerm?: string;
//   categorySlug?: string;
//   campaignSlug?: string;
//   isDeal?: boolean;
//   filters?: QueryOptions['filters'];
//   minPrice?: number;
//   maxPrice?: number;
//   sortOrder?: string;
//   page?: number;
// }

// // ====================================================================
// // 🛠️ ENTERPRISE FIX: Deep conversion of ObjectId → string
// // ====================================================================
// function convertObjectIdsToStrings(obj: any): any {
//   if (!obj) return obj;
//   if (Array.isArray(obj)) {
//     return obj.map(item => convertObjectIdsToStrings(item));
//   }
//   if (obj && typeof obj === 'object') {
//     // Check if it's a MongoDB ObjectId
//     if (obj.constructor && obj.constructor.name === 'ObjectId') {
//       return obj.toString();
//     }
//     // Check if it's a Date (already serializable)
//     if (obj instanceof Date) {
//       return obj.toISOString();
//     }
//     // Recursively process plain objects
//     const newObj: any = {};
//     for (const [key, value] of Object.entries(obj)) {
//       newObj[key] = convertObjectIdsToStrings(value);
//     }
//     return newObj;
//   }
//   return obj;
// }

// // ====================================================================
// // 🛡️ DETAILED PROBE: Query Converter
// // ====================================================================
// function convertPayloadQueryToNativeMongo(val: any): any {
//   if (!val) return val;

//   if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
//     try {
//       return new mongoose.Types.ObjectId(val);
//     } catch {
//       return val;
//     }
//   }

//   if (Array.isArray(val)) {
//     return val.map(item => convertPayloadQueryToNativeMongo(item));
//   }

//   if (typeof val === 'object' && val !== null) {
//     const nativeQuery: any = {};
//     for (const [key, value] of Object.entries(val)) {
//       let mappedKey = key;
//       let mappedValue = value;

//       switch (key) {
//         case 'in':
//           mappedKey = '$in';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'equals':
//           mappedKey = '$eq';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'not_equals':
//           mappedKey = '$ne';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'greater_than_equal':
//           mappedKey = '$gte';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'less_than_equal':
//           mappedKey = '$lte';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'greater_than':
//           mappedKey = '$gt';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'less_than':
//           mappedKey = '$lt';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'exists':
//           mappedKey = '$exists';
//           break;
//         case 'contains':
//           mappedKey = '$regex';
//           nativeQuery['$options'] = 'i';
//           mappedValue = typeof value === 'string' ? value : String(value);
//           break;
//         case 'or':
//           mappedKey = '$or';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         case 'and':
//           mappedKey = '$and';
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//           break;
//         default:
//           mappedKey = key.startsWith('$') ? key : key;
//           mappedValue = convertPayloadQueryToNativeMongo(value);
//       }

//       nativeQuery[mappedKey] = mappedValue;
//     }
//     return nativeQuery;
//   }

//   return val;
// }

// // ====================================================================
// // 🔍 OPTIMIZED: Recursive Category Finder (Batched)
// // ====================================================================
// const getAllDescendantIds = async (payload: any, parentSlug: string) => {
//   const mongooseConnection = payload.db.connection;
//   if (!mongooseConnection) {
//     console.error("❌ Mongoose connection not available");
//     return [];
//   }

//   const CategoryModel = mongooseConnection.model('categories');

//   try {
//     const result = await CategoryModel.aggregate([
//       { $match: { slug: parentSlug } },
//       {
//         $graphLookup: {
//           from: "categories",
//           startWith: "$_id",
//           connectFromField: "_id",
//           connectToField: "parent",
//           as: "descendants",
//           maxDepth: 10,
//         },
//       },
//       { $project: { ids: { $concatArrays: [["$_id"], "$descendants._id"] } } },
//     ]);

//     if (result.length === 0) return [];
//     return result[0].ids.map((id: any) => id.toString());
//   } catch (error) {
//     console.error("❌ getAllDescendantIds aggregation failed:", error);
//     return [];
//   }
// };

// // ====================================================================
// // 📊 FILTER DATA: Aggregation Pipeline with Verbose Probes
// // ====================================================================
// const getFilterData = async (where: any) => {
//   console.log("🔍 [PROBE - getFilterData] INCOMING raw where clause:", JSON.stringify(where, null, 2));

//   const payload = await getSafePayload();
//   const mongooseConnection = payload.db.connection;

//   if (!mongooseConnection) {
//     console.error("❌ Mongoose connection not available in getFilterData");
//     return { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] };
//   }

//   const ProductModel = mongooseConnection.model('products');
//   const nativeWhere = convertPayloadQueryToNativeMongo(where);

//   console.log("🔍 [PROBE - getFilterData] CONVERTED nativeWhere clause:", JSON.stringify(nativeWhere, null, 2));

//   const aggregationPipeline = [
//     { $match: nativeWhere },
//     {
//       $facet: {
//         brands: [
//           { $group: { _id: "$brand" } },
//           { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brandInfo" } },
//           { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
//           { $project: { _id: "$brandInfo._id", name: "$brandInfo.name", slug: "$brandInfo.slug" } },
//           { $match: { _id: { $ne: null } } },
//         ],
//         priceRange: [
//           { $unwind: "$variants" },
//           {
//             $group: {
//               _id: null,
//               min: { $min: { $ifNull: ["$variants.salePrice", "$variants.price"] } },
//               max: { $max: { $ifNull: ["$variants.salePrice", "$variants.price"] } },
//             },
//           },
//         ],
//         attributes: [
//           { $unwind: "$variants" },
//           { $unwind: "$variants.attributes" },
//           {
//             $group: {
//               _id: { name: "$variants.attributes.name", value: "$variants.attributes.value" },
//             },
//           },
//           {
//             $group: {
//               _id: "$_id.name",
//               values: { $addToSet: "$_id.value" },
//             },
//           },
//           { $project: { name: "$_id", values: 1 } },
//         ],
//       },
//     },
//   ];

//   try {
//     const result = await ProductModel.aggregate(aggregationPipeline);
//     const data = result[0] || { brands: [], priceRange: [{ min: 0, max: 0 }], attributes: [] };

//     console.log("🔍 [PROBE - getFilterData] RAW MongoDB aggregation result facets:", JSON.stringify(data, null, 2));

//     // ✅ Convert ObjectId to string for brands
//     const brands = (data.brands || []).map((b: any) => {
//       if (b._id && typeof b._id.toString === 'function') {
//         b._id = b._id.toString();
//       }
//       return b;
//     });

//     const finalFilterPayload = {
//       brands,
//       priceRange: { min: data.priceRange[0]?.min || 0, max: data.priceRange[0]?.max || 0 },
//       attributes: data.attributes || [],
//     };

//     // ✅ Deep-convert any remaining ObjectId in filterData
//     const finalFilterPayloadSafe = convertObjectIdsToStrings(finalFilterPayload);

//     console.log("🔍 [PROBE - getFilterData] FINAL compiled filter payload:", JSON.stringify(finalFilterPayloadSafe, null, 2));
//     return finalFilterPayloadSafe;
//   } catch (error) {
//     console.error("❌ Aggregation pipeline failed:", error);
//     return { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] };
//   }
// };

// // ====================================================================
// // 🚀 CACHED FILTER DATA (Hashed Key)
// // ====================================================================
// const getCachedFilterData = async (where: any) => {
//   const hash = crypto.createHash('sha256').update(JSON.stringify(where)).digest('hex');
//   const cacheKey = `filter-data-${hash}`;

//   console.log(`🔍 [PROBE - Cache] Hash calculation: where-object-hash=${hash} | cacheKey=${cacheKey}`);

//   return unstable_cache(
//     async () => await getFilterData(where),
//     [cacheKey],
//     { revalidate: false, tags: ["filter-data"] }
//   )();
// };

// // ====================================================================
// // 🚀 MAIN EXPORT: getPayloadProducts (Enterprise Aggregation)
// // ====================================================================
// export const getPayloadProducts = async (options: SearchOptions) => {
//   console.log("📤 [PROBE - getPayloadProducts] INCOMING SearchOptions:", JSON.stringify(options, null, 2));
//   try {
//     const payload = await getSafePayload();
//     const settings = await getCachedSettings();
//     const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

//     const { page = 1, sortOrder, filters, campaignSlug, searchTerm, categorySlug } = options;

//     // 1️⃣ Get category IDs from the category slug (for category pages)
//     let targetCategoryIds: string[] = [];
//     if (categorySlug) {
//       targetCategoryIds = await getAllDescendantIds(payload, categorySlug);
//       console.log(`🔍 [PROBE - getPayloadProducts] Resolved targetCategoryIds for "${categorySlug}":`, targetCategoryIds);
//     }

//     // 2️⃣ Handle "Deal Categories" filter (filters.categories)
//     let dealCategoryIds: string[] = [];
//     if (filters?.categories && filters.categories.length > 0) {
//       const categorySlugs = filters.categories as string[];
//       const categoryResults = await payload.find({
//         collection: "categories",
//         where: { slug: { in: categorySlugs } },
//         limit: categorySlugs.length,
//       });
//       dealCategoryIds = categoryResults.docs.map((c: any) => c.id);
//       console.log(`🔍 [PROBE - getPayloadProducts] Resolved dealCategoryIds from filters:`, dealCategoryIds);
//     }

//     // 3️⃣ Merge both sets of category IDs
//     const mergedCategoryIds = [...new Set([...targetCategoryIds, ...dealCategoryIds])];
//     console.log(`🔍 [PROBE - getPayloadProducts] Merged categoryIds (target + deal):`, mergedCategoryIds);

//     // 4️⃣ Brand search (for search term)
//     let matchingBrandIds: string[] = [];
//     if (searchTerm) {
//       const brandResults = await payload.find({
//         collection: "brands",
//         where: { name: { contains: searchTerm } },
//         limit: 20,
//       });
//       matchingBrandIds = brandResults.docs.map((b: any) => b.id);
//     }

//     // 5️⃣ Build query options with merged category IDs
//     const queryOptions = { ...options, categoryIds: mergedCategoryIds, brandIds: matchingBrandIds };
//     const where = buildProductQuery(queryOptions);

//     // 6️⃣ Campaign filter (if campaignSlug is provided)
//     if (campaignSlug) {
//       const campaigns = await payload.find({
//         collection: "campaigns",
//         where: { slug: { equals: campaignSlug } },
//       });
//       if (campaigns.docs.length > 0) {
//         where.and?.push({ activeCampaigns: { in: [campaigns.docs[0].id] } });
//       }
//     }

//     console.log("🔍 [PROBE - getPayloadProducts] Compiled product query 'where' clause:", JSON.stringify(where, null, 2));

//     // 7️⃣ Fetch filter data (using cached aggregation)
//     const filterData = await getCachedFilterData(where);

//     // 8️⃣ Brand filters (if applied via sidebar) – add to where for final query
//     const brandSlugs = filters?.brands;
//     if (brandSlugs && brandSlugs.length > 0) {
//       const brands = await payload.find({
//         collection: "brands",
//         where: { slug: { in: brandSlugs } },
//       });
//       const brandIds = brands.docs.map((b: any) => b.id);
//       if (brandIds.length > 0) {
//         where.and?.push({ brand: { in: brandIds } });
//       }
//     }

//     // ================================================================
//     // 🚀 ENTERPRISE FIX: Use Native MongoDB Aggregation
//     // ================================================================
//     const mongooseConnection = payload.db.connection;
//     if (!mongooseConnection) {
//       throw new Error("Mongoose connection not available");
//     }
//     const ProductModel = mongooseConnection.model('products');

//     // Convert Payload where to native MongoDB match
//     const nativeMatch = convertPayloadQueryToNativeMongo(where);
//     console.log("🔍 [PROBE - getPayloadProducts] Native match stage:", JSON.stringify(nativeMatch, null, 2));

//     // Build aggregation pipeline
//     const pipeline: any[] = [];

//     // Stage 1: $match
//     pipeline.push({ $match: nativeMatch });

//     // Stage 2: Compute min/max price for sorting (if needed)
//     let sortField = "-createdAt";
//     if (sortOrder === "price-low-to-high") {
//       pipeline.push({
//         $addFields: {
//           minPrice: { $min: "$variants.price" }
//         }
//       });
//       sortField = "minPrice";
//     } else if (sortOrder === "price-high-to-low") {
//       pipeline.push({
//         $addFields: {
//           maxPrice: { $max: "$variants.price" }
//         }
//       });
//       sortField = "-maxPrice";
//     } else if (sortOrder === "best-selling" || sortOrder === "rating-high") {
//       sortField = "-rating";
//     } else if (sortOrder === "newest") {
//       sortField = "-createdAt";
//     } else {
//       sortField = "-createdAt";
//     }

//     // Stage 3: $sort
//     const sortObj: any = {};
//     if (sortField.startsWith("-")) {
//       sortObj[sortField.slice(1)] = -1;
//     } else {
//       sortObj[sortField] = 1;
//     }
//     pipeline.push({ $sort: sortObj });

//     // Stage 4: Pagination
//     const limit = 40;
//     const skip = (page - 1) * limit;
//     pipeline.push({ $skip: skip });
//     pipeline.push({ $limit: limit });

//     // Also need total count (without pagination)
//     const countPipeline = [
//       { $match: nativeMatch },
//       { $count: "total" }
//     ];

//     // Execute both pipelines in parallel
//     const [productsResult, countResult] = await Promise.all([
//       ProductModel.aggregate(pipeline),
//       ProductModel.aggregate(countPipeline)
//     ]);

//     const totalCount = countResult.length > 0 ? countResult[0].total : 0;

//     console.log(`🔍 [PROBE - getPayloadProducts] Aggregation returned ${productsResult.length} products. Total count: ${totalCount}`);

//     // ✅ ENTERPRISE FIX: Deep-convert all ObjectId → string in each product
//     const safeProducts = productsResult.map((doc: any) => convertObjectIdsToStrings(doc));

//     // Map documents to SanityProduct using existing mapper
//     const mappedProducts = safeProducts.map((doc: any) =>
//       mapPayloadProductToSanity({ ...doc, id: doc._id?.toString?.() || doc._id }, [], globalFetchMode)
//     );

//     // ✅ Also ensure filterData has no ObjectId (already converted in getFilterData, but double-check)
//     const safeFilterData = convertObjectIdsToStrings(filterData);

//     return {
//       products: mappedProducts,
//       totalCount,
//       filterData: safeFilterData,
//     };
//   } catch (error) {
//     console.error("❌ getPayloadProducts failed:", error);
//     return {
//       products: [],
//       totalCount: 0,
//       filterData: { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] },
//     };
//   }
// };
// 📂 src/sanity/lib/payload/plp/index.ts

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { mapPayloadProductToSanity } from "./productMapper";
import { buildProductQuery, QueryOptions } from "./queryBuilder";
import { unstable_cache } from "next/cache";
import crypto from "crypto";
import mongoose from "mongoose";

interface SearchOptions {
  searchTerm?: string;
  categorySlug?: string;
  campaignSlug?: string;
  isDeal?: boolean;
  filters?: QueryOptions['filters'];
  minPrice?: number;
  maxPrice?: number;
  sortOrder?: string;
  page?: number;
}

// ====================================================================
// 🛠️ ENTERPRISE FIX: Deep conversion of ObjectId → string
// ====================================================================
function convertObjectIdsToStrings(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectIdsToStrings(item));
  }
  if (obj && typeof obj === 'object') {
    if (obj.constructor && obj.constructor.name === 'ObjectId') {
      return obj.toString();
    }
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = convertObjectIdsToStrings(value);
    }
    return newObj;
  }
  return obj;
}

// ====================================================================
// 🛡️ DETAILED PROBE: Query Converter (Shielded Against Empty Arrays)
// ====================================================================
function convertPayloadQueryToNativeMongo(val: any): any {
  if (!val) return val;

  if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
    try {
      return new mongoose.Types.ObjectId(val);
    } catch {
      return val;
    }
  }

  if (Array.isArray(val)) {
    return val.map(item => convertPayloadQueryToNativeMongo(item));
  }

  if (typeof val === 'object' && val !== null) {
    const nativeQuery: any = {};
    for (const [key, value] of Object.entries(val)) {
      let mappedKey = key;
      let mappedValue = value;

      switch (key) {
        case 'in':
          mappedKey = '$in';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'equals':
          mappedKey = '$eq';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'not_equals':
          mappedKey = '$ne';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'greater_than_equal':
          mappedKey = '$gte';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'less_than_equal':
          mappedKey = '$lte';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'greater_than':
          mappedKey = '$gt';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'less_than':
          mappedKey = '$lt';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'exists':
          mappedKey = '$exists';
          break;
        case 'contains':
          mappedKey = '$regex';
          nativeQuery['$options'] = 'i';
          mappedValue = typeof value === 'string' ? value : String(value);
          break;
        case 'or':
          mappedKey = '$or';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        case 'and':
          mappedKey = '$and';
          mappedValue = convertPayloadQueryToNativeMongo(value);
          break;
        default:
          mappedKey = key.startsWith('$') ? key : key;
          mappedValue = convertPayloadQueryToNativeMongo(value);
      }

      // ✅ CRITICAL SHIELD: Ignore empty $and / $or arrays to prevent MongoServerError
      if ((mappedKey === '$and' || mappedKey === '$or') && Array.isArray(mappedValue) && mappedValue.length === 0) {
        continue;
      }

      nativeQuery[mappedKey] = mappedValue;
    }
    return nativeQuery;
  }

  return val;
}

// ====================================================================
// 🔍 OPTIMIZED: Recursive Category Finder (Batched)
// ====================================================================
const getAllDescendantIds = async (payload: any, parentSlug: string) => {
  const mongooseConnection = payload.db.connection;
  if (!mongooseConnection) {
    console.error("❌ Mongoose connection not available");
    return [];
  }

  const CategoryModel = mongooseConnection.model('categories');

  try {
    const result = await CategoryModel.aggregate([
      { $match: { slug: parentSlug } },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent",
          as: "descendants",
          maxDepth: 10,
        },
      },
      { $project: { ids: { $concatArrays: [["$_id"], "$descendants._id"] } } },
    ]);

    if (result.length === 0) return [];
    return result[0].ids.map((id: any) => id.toString());
  } catch (error) {
    console.error("❌ getAllDescendantIds aggregation failed:", error);
    return [];
  }
};

// ====================================================================
// 📊 FILTER DATA: Aggregation Pipeline
// ====================================================================
const getFilterData = async (where: any) => {
  const payload = await getSafePayload();
  const mongooseConnection = payload.db.connection;

  if (!mongooseConnection) {
    console.error("❌ Mongoose connection not available in getFilterData");
    return { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] };
  }

  const ProductModel = mongooseConnection.model('products');
  const nativeWhere = convertPayloadQueryToNativeMongo(where);

  const aggregationPipeline = [
    { $match: nativeWhere },
    {
      $facet: {
        brands: [
          { $group: { _id: "$brand" } },
          { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brandInfo" } },
          { $unwind: { path: "$brandInfo", preserveNullAndEmptyArrays: true } },
          { $project: { _id: "$brandInfo._id", name: "$brandInfo.name", slug: "$brandInfo.slug" } },
          { $match: { _id: { $ne: null } } },
        ],
        priceRange: [
          { $unwind: "$variants" },
          {
            $group: {
              _id: null,
              min: { $min: { $ifNull: ["$variants.salePrice", "$variants.price"] } },
              max: { $max: { $ifNull: ["$variants.salePrice", "$variants.price"] } },
            },
          },
        ],
        attributes: [
          { $unwind: "$variants" },
          { $unwind: "$variants.attributes" },
          {
            $group: {
              _id: { name: "$variants.attributes.name", value: "$variants.attributes.value" },
            },
          },
          {
            $group: {
              _id: "$_id.name",
              values: { $addToSet: "$_id.value" },
            },
          },
          { $project: { name: "$_id", values: 1 } },
        ],
      },
    },
  ];

  try {
    const result = await ProductModel.aggregate(aggregationPipeline);
    const data = result[0] || { brands: [], priceRange: [{ min: 0, max: 0 }], attributes: [] };

    const brands = (data.brands || []).map((b: any) => {
      if (b._id && typeof b._id.toString === 'function') {
        b._id = b._id.toString();
      }
      return b;
    });

    const finalFilterPayload = {
      brands,
      priceRange: { min: data.priceRange[0]?.min || 0, max: data.priceRange[0]?.max || 0 },
      attributes: data.attributes || [],
    };

    const finalFilterPayloadSafe = convertObjectIdsToStrings(finalFilterPayload);
    return finalFilterPayloadSafe;
  } catch (error) {
    console.error("❌ Aggregation pipeline failed:", error);
    return { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] };
  }
};

// ====================================================================
// 🚀 CACHED FILTER DATA (Hashed Key)
// ====================================================================
const getCachedFilterData = async (where: any) => {
  const hash = crypto.createHash('sha256').update(JSON.stringify(where)).digest('hex');
  const cacheKey = `filter-data-${hash}`;

  return unstable_cache(
    async () => await getFilterData(where),
    [cacheKey],
    { revalidate: false, tags: ["filter-data"] }
  )();
};

// ====================================================================
// 🚀 MAIN EXPORT: getPayloadProducts (Enterprise Aggregation)
// ====================================================================
export const getPayloadProducts = async (options: SearchOptions) => {
  try {
    const payload = await getSafePayload();
    const settings = await getCachedSettings();
    const globalFetchMode = settings?.mediaFetchMode || 'imgbb';

    const { page = 1, sortOrder, filters, campaignSlug, searchTerm, categorySlug } = options;

    // 1️⃣ Get category IDs
    let targetCategoryIds: string[] = [];
    if (categorySlug) {
      targetCategoryIds = await getAllDescendantIds(payload, categorySlug);
    }

    // 2️⃣ Handle "Deal Categories" filter
    let dealCategoryIds: string[] = [];
    if (filters?.categories && filters.categories.length > 0) {
      const categorySlugs = filters.categories as string[];
      const categoryResults = await payload.find({
        collection: "categories",
        where: { slug: { in: categorySlugs } },
        limit: categorySlugs.length,
      });
      dealCategoryIds = categoryResults.docs.map((c: any) => c.id);
    }

    // 3️⃣ Merge category IDs
    const mergedCategoryIds = [...new Set([...targetCategoryIds, ...dealCategoryIds])];

    // 4️⃣ Brand search
    let matchingBrandIds: string[] = [];
    if (searchTerm) {
      const brandResults = await payload.find({
        collection: "brands",
        where: { name: { contains: searchTerm } },
        limit: 20,
      });
      matchingBrandIds = brandResults.docs.map((b: any) => b.id);
    }

    // 5️⃣ Build query options
    const queryOptions = { ...options, categoryIds: mergedCategoryIds, brandIds: matchingBrandIds };
    const where = buildProductQuery(queryOptions);

    // 6️⃣ Campaign filter
    if (campaignSlug) {
      const campaigns = await payload.find({
        collection: "campaigns",
        where: { slug: { equals: campaignSlug } },
      });
      if (campaigns.docs.length > 0) {
        where.and?.push({ activeCampaigns: { in: [campaigns.docs[0].id] } });
      }
    }

    // 7️⃣ Fetch filter data
    const filterData = await getCachedFilterData(where);

    // 8️⃣ Brand filters
    const brandSlugs = filters?.brands;
    if (brandSlugs && brandSlugs.length > 0) {
      const brands = await payload.find({
        collection: "brands",
        where: { slug: { in: brandSlugs } },
      });
      const brandIds = brands.docs.map((b: any) => b.id);
      if (brandIds.length > 0) {
        where.and?.push({ brand: { in: brandIds } });
      }
    }

    // ================================================================
    // 🚀 ENTERPRISE FIX: Native MongoDB Aggregation
    // ================================================================
    const mongooseConnection = payload.db.connection;
    if (!mongooseConnection) {
      throw new Error("Mongoose connection not available");
    }
    const ProductModel = mongooseConnection.model('products');

    const nativeMatch = convertPayloadQueryToNativeMongo(where);
    const pipeline: any[] = [];

    // Stage 1: $match
    pipeline.push({ $match: nativeMatch });

    // Stage 2: Compute displayPrice based strictly on Index 0
    let sortField = "-createdAt";

    if (sortOrder === "price-low-to-high" || sortOrder === "price-high-to-low") {
      pipeline.push({
        $addFields: {
          firstVariant: { $arrayElemAt: ["$variants", 0] }
        }
      });
      pipeline.push({
        $addFields: {
          displayPrice: {
            $ifNull: ["$firstVariant.salePrice", "$firstVariant.price"]
          }
        }
      });
      sortField = sortOrder === "price-low-to-high" ? "displayPrice" : "-displayPrice";
    } else if (sortOrder === "rating-low") {
      sortField = "rating";
    } else if (sortOrder === "best-selling" || sortOrder === "rating-high") {
      sortField = "-rating";
    } else if (sortOrder === "newest") {
      sortField = "-createdAt";
    } else {
      sortField = "-createdAt";
    }

    // Stage 3: $sort
    const sortObj: any = {};
    if (sortField.startsWith("-")) {
      sortObj[sortField.slice(1)] = -1;
    } else {
      sortObj[sortField] = 1;
    }
    pipeline.push({ $sort: sortObj });

    // Stage 4: Pagination
    const limit = 40;
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Total count query
    const countPipeline = [
      { $match: nativeMatch },
      { $count: "total" }
    ];

    const [productsResult, countResult] = await Promise.all([
      ProductModel.aggregate(pipeline),
      ProductModel.aggregate(countPipeline)
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    const safeProducts = productsResult.map((doc: any) => convertObjectIdsToStrings(doc));

    const mappedProducts = safeProducts.map((doc: any) =>
      mapPayloadProductToSanity({ ...doc, id: doc._id?.toString?.() || doc._id }, [], globalFetchMode)
    );

    const safeFilterData = convertObjectIdsToStrings(filterData);

    return {
      products: mappedProducts,
      totalCount,
      filterData: safeFilterData,
    };
  } catch (error) {
    console.error("❌ getPayloadProducts failed:", error);
    return {
      products: [],
      totalCount: 0,
      filterData: { brands: [], priceRange: { min: 0, max: 0 }, attributes: [] },
    };
  }
};