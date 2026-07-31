
// // src/collections/Products.ts

// import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
// import { SEO } from "../fields/SEO";

// // ====================================================================
// // 🛡️ STRICT COMPILER TYPE DEFINITIONS (ELIMINATES 'ANY')
// // ====================================================================
// interface VariantPayload {
//   price?: number;
//   salePrice?: number;
//   name?: string;
//   sku?: string;
//   inStock?: boolean;
//   stock?: number;
// }

// interface ProductPayloadDoc {
//   _id: string;
//   title?: string;
//   slug?: string;
//   videoUrl?: string;
//   isOnDeal?: boolean;
//   isBestSeller?: boolean;
//   isNewArrival?: boolean;
//   isFeatured?: boolean;
//   categories?: (string | { id: string })[];
//   brand?: string | { id: string };
//   specifications?: { label: string; value: string }[];
//   seo?: { title?: string; description?: string };
//   variants?: VariantPayload[];
//   storageProvider?: 'global' | 'imgbb' | 'r2' | 'both';
//   primaryProvider?: 'imgbb' | 'r2';
// }

// // ====================================================================
// // ⚡ HIGH-SPEED DIRTY-CHECKING UTILITY
// // ====================================================================
// const isSignificantChange = (
//   doc: ProductPayloadDoc,
//   prev: ProductPayloadDoc | undefined
// ): boolean => {
//   if (!prev) return true;

//   if (doc.title !== prev.title) return true;
//   if (doc.slug !== prev.slug) return true;
//   if (doc.videoUrl !== prev.videoUrl) return true;
//   if (doc.isOnDeal !== prev.isOnDeal) return true;
//   if (doc.isBestSeller !== prev.isBestSeller) return true;
//   if (doc.isNewArrival !== prev.isNewArrival) return true;
//   if (doc.isFeatured !== prev.isFeatured) return true;

//   if (JSON.stringify(doc.categories) !== JSON.stringify(prev.categories)) return true;
//   if (JSON.stringify(doc.brand) !== JSON.stringify(prev.brand)) return true;
//   if (JSON.stringify(doc.specifications) !== JSON.stringify(prev.specifications)) return true;
//   if (JSON.stringify(doc.seo) !== JSON.stringify(prev.seo)) return true;

//   if (doc.storageProvider !== prev.storageProvider) return true;
//   if (doc.primaryProvider !== prev.primaryProvider) return true;

//   const docVariants = doc.variants || [];
//   const prevVariants = prev.variants || [];

//   if (docVariants.length !== prevVariants.length) return true;

//   for (let i = 0; i < docVariants.length; i++) {
//     const dv = docVariants[i];
//     const pv = prevVariants[i];
//     if (!pv) return true;

//     if (dv.price !== pv.price) return true;
//     if (dv.salePrice !== pv.salePrice) return true;
//     if (dv.name !== pv.name) return true;
//     if (dv.sku !== pv.sku) return true;
//     if (dv.inStock !== pv.inStock) return true;
//   }

//   return false;
// };

// // ====================================================================
// // ✅ ENTERPRISE FIX: Cache Invalidation on Product Change
// // ====================================================================
// const invalidateInventoryCache = async () => {
//   try {
//     const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
    
//     // Delete all inventory risk cache keys
//     const keys = await redis.keys('analytics_inventory_risk:*');
//     if (keys.length > 0) {
//       await redis.del(...keys);
//       console.log(`🧹 Cleared ${keys.length} inventory risk cache keys`);
//     }
//   } catch (error) {
//     console.warn('⚠️ Failed to invalidate inventory cache:', error);
//   }
// };

// // ====================================================================
// // HOOKS
// // ====================================================================
// const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
//   try {
//     const newDoc = doc as unknown as ProductPayloadDoc;
//     const oldDoc = previousDoc as unknown as ProductPayloadDoc | undefined;

//     // 🚀 1. Invalidate inventory cache on ANY change (stock, price, etc.)
//     await invalidateInventoryCache();

//     // 🔥 2. Only revalidate SEO paths if significant change
//     if (!isSignificantChange(newDoc, oldDoc)) {
//       console.log(`⚡ Speed Optimization: Stock quantity update only. Skipped static path rebuilds for: ${newDoc.title}`);
//       return;
//     }

//     const { revalidatePath, revalidateTag } = await import("next/cache");

//     revalidatePath(`/product/${newDoc.slug}`);
//     revalidatePath("/");
//     revalidatePath("/sitemap.xml");
//     revalidatePath("/api/google-shopping");

//     if (newDoc.isOnDeal) {
//       revalidatePath("/deals");
//     }

//     // ✅ FIX: Added mandatory second argument "max" (Next.js 16+ requirement)
//     revalidateTag("filter-data", "max");
//     revalidateTag(`product-${newDoc.slug}`, "max");
//     revalidateTag(`related-${newDoc._id}`, "max");

//     console.log(`🚀 SEO Sync: Revalidated paths and filter cache for: ${newDoc.title}`);
//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : String(error);
//     console.error("Revalidation failed:", errorMsg);
//   }
// };

// const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
//   try {
//     const targetDoc = doc as unknown as ProductPayloadDoc;

//     // 🧹 Invalidate inventory cache on product deletion
//     await invalidateInventoryCache();

//     const { revalidatePath, revalidateTag } = await import("next/cache");

//     revalidatePath(`/product/${targetDoc.slug}`);
//     revalidatePath("/");
//     revalidatePath("/sitemap.xml");
//     revalidatePath("/api/google-shopping");

//     // ✅ FIX: Added mandatory second argument "max"
//     revalidateTag("filter-data", "max");
//     revalidateTag(`product-${targetDoc.slug}`, "max");
//     revalidateTag(`related-${targetDoc._id}`, "max");

//     console.log(`🗑️ Delete Sync: Revalidated paths and filter cache for: ${targetDoc.slug}`);
//   } catch (error: unknown) {
//     const errorMsg = error instanceof Error ? error.message : String(error);
//     console.error("Delete revalidation failed:", errorMsg);
//   }
// };

// export const Products: CollectionConfig = {
//   slug: "products",
//   admin: {
//     useAsTitle: "title",
//     defaultColumns: ["title", "brand", "price", "stock"],
//   },
//   access: {
//     read: () => true,
//   },
//   hooks: {
//     afterChange: [afterChangeHook],
//     afterDelete: [afterDeleteHook],
//   },
//   // ====================================================================
//   // 🚀 ENTERPRISE FIX: Compound Indexes for Rocket Speed
//   // ====================================================================
//   indexes: [
//     { fields: ["categories", "isOnDeal"] },
//     { fields: ["categories", "isBestSeller"] },
//     { fields: ["brand", "isNewArrival"] },
//     { fields: ["categories", "isFeatured"] },
//   ],
//   fields: [
//     {
//       type: "tabs",
//       tabs: [
//         // --- TAB 1: MAIN INFORMATION ---
//         {
//           label: "Main Information",
//           fields: [
//             { name: "title", type: "text", required: true, index: true },
//             {
//               name: "slug",
//               type: "text",
//               required: true,
//               unique: true,
//               index: true,
//               admin: { description: "Unique URL part (e.g. usama-ali-shirts)" },
//             },
//             {
//               name: "videoUrl",
//               type: "text",
//               label: "Product Video URL (Optional)",
//             },
//             {
//               name: "variants",
//               type: "array",
//               required: true,
//               minRows: 1,
//               fields: [
//                 {
//                   type: "row",
//                   fields: [
//                     {
//                       name: "name",
//                       type: "text",
//                       required: true,
//                       admin: { width: "50%" },
//                     },
//                     {
//                       name: "sku",
//                       type: "text",
//                       required: true,
//                       index: true,
//                       admin: { width: "50%" },
//                     },
//                   ],
//                 },
//                 {
//                   type: "row",
//                   fields: [
//                     {
//                       name: "price",
//                       type: "number",
//                       required: true,
//                       admin: { width: "33%" },
//                     },
//                     {
//                       name: "salePrice",
//                       type: "number",
//                       admin: { width: "33%" },
//                     },
//                     { name: "stock", type: "number", admin: { width: "33%" } },
//                   ],
//                 },
//                 { name: "inStock", type: "checkbox", defaultValue: true },
//                 {
//                   name: "images",
//                   type: "upload",
//                   relationTo: "media",
//                   hasMany: true,
//                 },
//                 {
//                   name: "attributes",
//                   type: "array",
//                   fields: [
//                     {
//                       type: "row",
//                       fields: [
//                         {
//                           name: "name",
//                           type: "text",
//                           label: "Name (e.g. Size)",
//                         },
//                         {
//                           name: "value",
//                           type: "text",
//                           label: "Value (e.g. XL)",
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 { name: "weight", type: "number", label: "Weight (kg)" },
//                 {
//                   name: "dimensions",
//                   type: "group",
//                   fields: [
//                     {
//                       type: "row",
//                       fields: [
//                         {
//                           name: "height",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                         {
//                           name: "width",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                         {
//                           name: "depth",
//                           type: "number",
//                           admin: { width: "33%" },
//                         },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },

//         // --- TAB 2: DETAILS & SPECIFICATIONS ---
//         {
//           label: "Details & Specifications",
//           fields: [
//             { name: "description", type: "richText" },
//             {
//               name: "categories",
//               type: "relationship",
//               relationTo: "categories",
//               hasMany: true,
//               required: true,
//               index: true,
//             },
//             {
//               name: "brand",
//               type: "relationship",
//               relationTo: "brands",
//               index: true,
//             },
//             {
//               name: "specifications",
//               type: "array",
//               fields: [
//                 {
//                   type: "row",
//                   fields: [
//                     { name: "label", type: "text", admin: { width: "50%" } },
//                     { name: "value", type: "text", admin: { width: "50%" } },
//                   ],
//                 },
//               ],
//             },
//             { name: "shippingAndReturns", type: "richText" },
//           ],
//         },

//         // --- TAB 3: MARKETING & SEO ---
//         {
//           label: "Marketing & SEO",
//           fields: [
//             {
//               type: "row",
//               fields: [
//                 {
//                   name: "rating",
//                   type: "number",
//                   min: 0,
//                   max: 5,
//                   defaultValue: 0,
//                   admin: {
//                     width: "50%",
//                     readOnly: true,
//                     description: "Auto-calculated based on approved reviews.",
//                   },
//                 },
//                 {
//                   name: "reviewCount",
//                   type: "number",
//                   defaultValue: 0,
//                   admin: {
//                     width: "50%",
//                     readOnly: true,
//                     description: "Total number of approved reviews.",
//                   },
//                 },
//               ],
//             },
//             {
//               name: "activeCampaigns",
//               type: "relationship",
//               relationTo: "campaigns",
//               hasMany: true,
//               index: true,
//             },
//             {
//               type: "row",
//               fields: [
//                 {
//                   name: "isBestSeller",
//                   type: "checkbox",
//                   defaultValue: false,
//                   index: true,
//                 },
//                 {
//                   name: "isNewArrival",
//                   type: "checkbox",
//                   defaultValue: false,
//                   index: true,
//                 },
//                 {
//                   name: "isFeatured",
//                   type: "checkbox",
//                   defaultValue: false,
//                   index: true,
//                 },
//                 {
//                   name: "isOnDeal",
//                   type: "checkbox",
//                   defaultValue: false,
//                   index: true,
//                 },
//               ],
//             },
//             SEO,
//           ],
//         },

//         // ================================================================
//         // ✅ NEW TAB 4: MEDIA SETTINGS (Per-Product Override)
//         // ================================================================
//         {
//           label: "Media Settings",
//           fields: [
//             {
//               name: "storageProvider",
//               type: "select",
//               label: "Upload Provider",
//               options: [
//                 { label: "🌐 Use Global Default", value: "global" },
//                 { label: "📸 ImgBB Only", value: "imgbb" },
//                 { label: "☁️ Cloudflare R2 Only", value: "r2" },
//                 { label: "🔄 Both (Dual Upload)", value: "both" },
//               ],
//               defaultValue: "global",
//               admin: {
//                 description: "Override the global upload provider for THIS product only.",
//               },
//             },
//             {
//               name: "primaryProvider",
//               type: "select",
//               label: "Primary URL Provider",
//               options: [
//                 { label: "📸 ImgBB (Default)", value: "imgbb" },
//                 { label: "☁️ Cloudflare R2", value: "r2" },
//               ],
//               defaultValue: "imgbb",
//               admin: {
//                 description: "If 'Both' is selected, which URL should be served as the primary image?",
//                 condition: (data, siblingData) => {
//                   const provider = data?.storageProvider || siblingData?.storageProvider || "global";
//                   return provider === "both" || provider === "global";
//                 },
//               },
//             },
//           ],
//         },
//       ],
//     },
//   ],
// };
// src/collections/Products.ts

import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { SEO } from "../fields/SEO";

// ====================================================================
// 🛡️ STRICT COMPILER TYPE DEFINITIONS (ELIMINATES 'ANY')
// ====================================================================
interface VariantPayload {
  price?: number;
  salePrice?: number;
  name?: string;
  sku?: string;
  inStock?: boolean;
  stock?: number;
  // ✅ ENTERPRISE FIX: Aligned TypeScript interface structure with actual database schema (Array of objects)
  cdnImages?: Array<{ id?: string; url: string }>;
}

interface ProductPayloadDoc {
  id: string;
  _id?: string;
  title?: string;
  slug?: string;
  videoUrl?: string;
  isOnDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  categories?: (string | { id: string })[];
  brand?: string | { id: string };
  specifications?: { label: string; value: string }[];
  seo?: { title?: string; description?: string };
  variants?: VariantPayload[];
  storageProvider?: 'global' | 'imgbb' | 'r2' | 'both';
  primaryProvider?: 'imgbb' | 'r2';
}

// ====================================================================
// ⚡ HIGH-SPEED DIRTY-CHECKING UTILITY
// ====================================================================
const isSignificantChange = (
  doc: ProductPayloadDoc,
  prev: ProductPayloadDoc | undefined
): boolean => {
  if (!prev) return true;

  if (doc.title !== prev.title) return true;
  if (doc.slug !== prev.slug) return true;
  if (doc.videoUrl !== prev.videoUrl) return true;
  if (doc.isOnDeal !== prev.isOnDeal) return true;
  if (doc.isBestSeller !== prev.isBestSeller) return true;
  if (doc.isNewArrival !== prev.isNewArrival) return true;
  if (doc.isFeatured !== prev.isFeatured) return true;

  if (JSON.stringify(doc.categories) !== JSON.stringify(prev.categories)) return true;
  if (JSON.stringify(doc.brand) !== JSON.stringify(prev.brand)) return true;
  if (JSON.stringify(doc.specifications) !== JSON.stringify(prev.specifications)) return true;
  if (JSON.stringify(doc.seo) !== JSON.stringify(prev.seo)) return true;

  if (doc.storageProvider !== prev.storageProvider) return true;
  if (doc.primaryProvider !== prev.primaryProvider) return true;

  const docVariants = doc.variants || [];
  const prevVariants = prev.variants || [];

  if (docVariants.length !== prevVariants.length) return true;

  for (let i = 0; i < docVariants.length; i++) {
    const dv = docVariants[i];
    const pv = prevVariants[i];
    if (!pv) return true;

    if (dv.price !== pv.price) return true;
    if (dv.salePrice !== pv.salePrice) return true;
    if (dv.name !== pv.name) return true;
    if (dv.sku !== pv.sku) return true;
    if (dv.inStock !== pv.inStock) return true;
    // ✅ ENTERPRISE FIX: Corrected comparison logic to check cdnImages database array of objects instead of cdnUrls
    if (JSON.stringify(dv.cdnImages) !== JSON.stringify(pv.cdnImages)) return true;
  }

  return false;
};

// ====================================================================
// ✅ ENTERPRISE FIX: Cache Invalidation on Product Change
// ====================================================================
const invalidateInventoryCache = async () => {
  try {
    const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
    
    const keys = await redis.keys('analytics_inventory_risk:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Cleared ${keys.length} inventory risk cache keys`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to invalidate inventory cache:', error);
  }
};

// ====================================================================
// HOOKS
// ====================================================================
const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  try {
    const newDoc = doc as unknown as ProductPayloadDoc;
    const oldDoc = previousDoc as unknown as ProductPayloadDoc | undefined;

    await invalidateInventoryCache();

    if (!isSignificantChange(newDoc, oldDoc)) {
      console.log(`⚡ Speed Optimization: Stock quantity update only. Skipped static path rebuilds for: ${newDoc.title}`);
      return;
    }

    const { revalidatePath, revalidateTag } = await import("next/cache");

    revalidatePath(`/product/${newDoc.slug}`);
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/google-shopping");

    if (newDoc.isOnDeal) {
      revalidatePath("/deals");
    }

    revalidateTag("filter-data", "max");
    revalidateTag(`product-${newDoc.slug}`, "max");
    // Safe evaluation of the target document identifier
    const targetId = newDoc.id || newDoc._id || "";
    if (targetId) {
      revalidateTag(`related-${targetId}`, "max");
    }

    console.log(`🚀 SEO Sync: Revalidated paths and filter cache for: ${newDoc.title}`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Revalidation failed:", errorMsg);
  }
};

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  try {
    const targetDoc = doc as unknown as ProductPayloadDoc;

    await invalidateInventoryCache();

    const { revalidatePath, revalidateTag } = await import("next/cache");

    revalidatePath(`/product/${targetDoc.slug}`);
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/google-shopping");

    revalidateTag("filter-data", "max");
    revalidateTag(`product-${targetDoc.slug}`, "max");
    const targetId = targetDoc.id || targetDoc._id || "";
    if (targetId) {
      revalidateTag(`related-${targetId}`, "max");
    }

    console.log(`🗑️ Delete Sync: Revalidated paths and filter cache for: ${targetDoc.slug}`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Delete revalidation failed:", errorMsg);
  }
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "brand", "price", "stock"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
  },
  indexes: [
    { fields: ["categories", "isOnDeal"] },
    { fields: ["categories", "isBestSeller"] },
    { fields: ["brand", "isNewArrival"] },
    { fields: ["categories", "isFeatured"] },
  ],
  fields: [
    {
      type: "tabs",
      tabs: [
        // --- TAB 1: MAIN INFORMATION ---
        {
          label: "Main Information",
          fields: [
            { name: "title", type: "text", required: true, index: true },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              admin: { description: "Unique URL part (e.g. usama-ali-shirts)" },
            },
            {
              name: "videoUrl",
              type: "text",
              label: "Product Video URL (Optional)",
            },
            {
              name: "variants",
              type: "array",
              required: true,
              minRows: 1,
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      required: true,
                      admin: { width: "50%" },
                    },
                    {
                      name: "sku",
                      type: "text",
                      required: true,
                      index: true,
                      admin: { width: "50%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "price",
                      type: "number",
                      required: true,
                      admin: { width: "33%" },
                    },
                    {
                      name: "salePrice",
                      type: "number",
                      admin: { width: "33%" },
                    },
                    { name: "stock", type: "number", admin: { width: "33%" } },
                  ],
                },
                { name: "inStock", type: "checkbox", defaultValue: true },
                // ✅ EXISTING: Upload images via Media collection
                {
                  name: "images",
                  type: "upload",
                  relationTo: "media",
                  hasMany: true,
                  admin: {
                    description: "Upload images (ImgBB/R2 based on settings).",
                  },
                },
                // ✅ ✅ ✅ NEW: CDN Images (Manual URLs)
                {
                  name: "cdnImages",
                  type: "array",
                  label: "CDN Image URLs",
                  admin: {
                    description: "Paste direct image URLs (e.g., from Cloudinary, ImgBB, or custom CDN). Works when CDN Mode is enabled.",
                  },
                  fields: [
                    {
                      name: "url",
                      type: "text",
                      label: "Image URL",
                      required: true,
                      admin: {
                        placeholder: "https://cdn.example.com/image.jpg",
                      },
                    },
                  ],
                },
                {
                  name: "attributes",
                  type: "array",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "name",
                          type: "text",
                          label: "Name (e.g. Size)",
                        },
                        {
                          name: "value",
                          type: "text",
                          label: "Value (e.g. XL)",
                        },
                      ],
                    },
                  ],
                },
                { name: "weight", type: "number", label: "Weight (kg)" },
                {
                  name: "dimensions",
                  type: "group",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "height",
                          type: "number",
                          admin: { width: "33%" },
                        },
                        {
                          name: "width",
                          type: "number",
                          admin: { width: "33%" },
                        },
                        {
                          name: "depth",
                          type: "number",
                          admin: { width: "33%" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- TAB 2: DETAILS & SPECIFICATIONS ---
        {
          label: "Details & Specifications",
          fields: [
            { name: "description", type: "richText" },
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              hasMany: true,
              required: true,
              index: true,
            },
            {
              name: "brand",
              type: "relationship",
              relationTo: "brands",
              index: true,
            },
            {
              name: "specifications",
              type: "array",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", admin: { width: "50%" } },
                    { name: "value", type: "text", admin: { width: "50%" } },
                  ],
                },
              ],
            },
            { name: "shippingAndReturns", type: "richText" },
          ],
        },

        // --- TAB 3: MARKETING & SEO ---
        {
          label: "Marketing & SEO",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "rating",
                  type: "number",
                  min: 0,
                  max: 5,
                  defaultValue: 0,
                  admin: {
                    width: "50%",
                    readOnly: true,
                    description: "Auto-calculated based on approved reviews.",
                  },
                },
                {
                  name: "reviewCount",
                  type: "number",
                  defaultValue: 0,
                  admin: {
                    width: "50%",
                    readOnly: true,
                    description: "Total number of approved reviews.",
                  },
                },
              ],
            },
            {
              name: "activeCampaigns",
              type: "relationship",
              relationTo: "campaigns",
              hasMany: true,
              index: true,
            },
            {
              type: "row",
              fields: [
                {
                  name: "isBestSeller",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isNewArrival",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isFeatured",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
                {
                  name: "isOnDeal",
                  type: "checkbox",
                  defaultValue: false,
                  index: true,
                },
              ],
            },
            SEO,
          ],
        },

        // --- TAB 4: MEDIA SETTINGS (Per-Product Override) ---
        {
          label: "Media Settings",
          fields: [
            {
              name: "storageProvider",
              type: "select",
              label: "Upload Provider",
              options: [
                { label: "🌐 Use Global Default", value: "global" },
                { label: "📸 ImgBB Only", value: "imgbb" },
                { label: "☁️ Cloudflare R2 Only", value: "r2" },
                { label: "🔄 Both (Dual Upload)", value: "both" },
              ],
              defaultValue: "global",
              admin: {
                description: "Override the global upload provider for THIS product only.",
              },
            },
            {
              name: "primaryProvider",
              type: "select",
              label: "Primary URL Provider",
              options: [
                { label: "📸 ImgBB (Default)", value: "imgbb" },
                { label: "☁️ Cloudflare R2", value: "r2" },
              ],
              defaultValue: "imgbb",
              admin: {
                description: "If 'Both' is selected, which URL should be served as the primary image?",
                condition: (data, siblingData) => {
                  const provider = data?.storageProvider || siblingData?.storageProvider || "global";
                  return provider === "both" || provider === "global";
                },
              },
            },
          ],
        },
      ],
    },
  ],
};