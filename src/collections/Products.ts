// import type { CollectionConfig } from "payload";
// import { SEO } from "../fields/SEO";
// import { revalidatePath } from "next/cache"; // ✅ Next.js Cache invalidation ke liye

// export const Products: CollectionConfig = {
//   slug: "products",
//   admin: {
//     useAsTitle: "title",
//     defaultColumns: ["title", "brand", "price", "stock"],
//   },
//   access: {
//     read: () => true,
//   },
//   // =================================================================
//   // 🔥 ENTERPRISE SEO HOOKS: Real-time Data Sync
//   // =================================================================
//   hooks: {
//     afterChange: [
//       ({ doc, req }) => {
//         // 1. Product Detail Page ko refresh karo
//         revalidatePath(`/product/${doc.slug}`);

//         // 2. Homepage refresh karo (Naya product ya price change dikhane ke liye)
//         revalidatePath("/");

//         // 3. Sitemap refresh karo taake Google ko nayi update mile
//         revalidatePath("/sitemap.xml");

//         // 4. Google Shopping Feed refresh karo
//         revalidatePath("/api/google-shopping");

//         // 5. Agar product 'Deals' mein hai, to deals page bhi refresh karo
//         if (doc.isOnDeal) {
//           revalidatePath("/deals");
//         }

//         console.log(
//           `🚀 SEO Sync: Revalidated all paths for product: ${doc.title}`,
//         );
//       },
//     ],
//     afterDelete: [
//       ({ doc }) => {
//         // Product delete hote hi sitemap aur pages se hata do taake 404 error na aaye Google par
//         revalidatePath(`/product/${doc.slug}`);
//         revalidatePath("/sitemap.xml");
//         revalidatePath("/api/google-shopping");
//       },
//     ],
//   },
//   // =================================================================

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
//               index: true, // ✅ Database Index for Speed
//               admin: { description: "Unique URL part (e.g. usama-ali-shirts)" },
//             },
//             {
//               name: "videoUrl",
//               type: "text",
//               label: "Product Video URL (Optional)",
//             },

//             // --- THE VARIANTS ARRAY ---
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
//                       index: true, // ✅ SKU per search fast hogi
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
//               index: true, // ✅ Index for Category filtering
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
//             { name: "rating", type: "number", min: 1, max: 5 },
//             {
//               name: "activeCampaigns",
//               type: "relationship",
//               relationTo: "campaigns",
//               hasMany: true,
//               index: true, // ✅ Index for Sales/Campaigns
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
//             SEO, // Reusable SEO Object
//           ],
//         },
//       ],
//     },
//   ],
// };

// src/payload/collections/Products.ts

import type { CollectionConfig } from "payload";
import { SEO } from "../fields/SEO";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "brand", "price", "stock"],
  },
  access: {
    read: () => true,
  },
  // =================================================================
  // 🔥 ENTERPRISE SEO HOOKS: Real-time Data Sync (Optimized for Build)
  // =================================================================
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          // ✅ FIX: Dynamic import to prevent Server-only leak in Next.js Build
          const { revalidatePath } = await import("next/cache");

          revalidatePath(`/product/${doc.slug}`);
          revalidatePath("/");
          revalidatePath("/sitemap.xml");
          revalidatePath("/api/google-shopping");

          if (doc.isOnDeal) {
            revalidatePath("/deals");
          }

          console.log(`🚀 SEO Sync: Revalidated paths for: ${doc.title}`);
        } catch (error) {
          console.error("Revalidation failed:", error);
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        try {
          // ✅ FIX: Dynamic import for delete hook
          const { revalidatePath } = await import("next/cache");

          revalidatePath(`/product/${doc.slug}`);
          revalidatePath("/sitemap.xml");
          revalidatePath("/api/google-shopping");
        } catch (error) {
          console.error("Delete revalidation failed:", error);
        }
      },
    ],
  },
  // =================================================================
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
                {
                  name: "images",
                  type: "upload",
                  relationTo: "media",
                  hasMany: true,
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
      ],
    },
  ],
};
