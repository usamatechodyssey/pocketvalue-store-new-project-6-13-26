// import { Field } from 'payload'

// export const SEO: Field = {
//   name: 'seo',
//   type: 'group', // Sanity mein ye 'object' hota hai, Payload mein 'group'
//   label: 'SEO Settings',
//   fields: [
//     {
//       name: 'metaTitle',
//       type: 'text',
//       label: 'Meta Title',
//       admin: {
//         description: 'Browser tab aur search results mein nazar aane wala title (50-60 chars).',
//       },
//     },
//     {
//       name: 'metaDescription',
//       type: 'textarea',
//       label: 'Meta Description',
//       admin: {
//         description: 'Search results ke liye summary (150-160 chars).',
//       },
//     },
//     {
//       name: 'ogImage',
//       type: 'upload',
//       relationTo: 'media',
//       label: 'Social Share Image (Open Graph)',
//       admin: {
//         description: 'Jab ye page Facebook ya WhatsApp par share hoga, to ye image dikhegi.',
//       },
//     },
//   ],
// }
// src/fields/SEO.ts
// ================================================================
// 🚀 ENTERPRISE SEO FIELD GROUP (UPGRADED)
// ================================================================
// This is a reusable Payload CMS field group used across:
// - Products, Categories, Pages, Settings, Homepage, FAQ, etc.
// 
// 🆕 UPGRADED FEATURES (2026 SEO Points):
// ✅ Added Material & Pattern fields (#125)
// ✅ Added Merchant Category override (#88)
// ✅ Added ProductGroup Schema toggle (#38)
// ✅ All fields are optional to maintain backward compatibility
// ================================================================

import { Field } from "payload";

export const SEO: Field = {
  name: "seo",
  type: "group",
  label: "SEO Settings",
  fields: [
    // ============================================================
    // 📋 STANDARD SEO FIELDS (Already present)
    // ============================================================
    {
      name: "metaTitle",
      type: "text",
      label: "Meta Title",
      admin: {
        description: "Browser tab aur search results mein nazar aane wala title (50-60 chars).",
      },
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta Description",
      admin: {
        description: "Search results ke liye summary (150-160 chars).",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "Social Share Image (Open Graph)",
      admin: {
        description: "Jab ye page Facebook ya WhatsApp par share hoga, to ye image dikhegi.",
      },
    },

    // ============================================================
    // 🆕 2026 PRODUCT SCHEMA ADVANCED FIELDS
    // ============================================================
    {
      type: "collapsible",
      label: "Advanced Product Schema (2026)",
      admin: {
        description: "Google AI aur Merchant Listing ke liye product attributes. Sirf products ke liye relevant.",
        initCollapsed: true, // Default collapsed to keep admin clean
      },
      fields: [
        // --- #125: Material & Pattern ---
        {
          type: "row",
          fields: [
            {
              name: "material",
              type: "text",
              label: "Material",
              admin: {
                width: "50%",
                description: "e.g., Cotton, Leather, Plastic, Steel",
              },
            },
            {
              name: "pattern",
              type: "text",
              label: "Pattern",
              admin: {
                width: "50%",
                description: "e.g., Striped, Floral, Solid, Checkered",
              },
            },
          ],
        },

        // --- #88: Merchant Listing Override ---
        {
          name: "merchantCategory",
          type: "text",
          label: "Google Merchant Category Override",
          admin: {
            description:
              "Google Shopping feed mein default category override karein. Leave empty to use default.",
          },
        },

        // --- #38: ProductGroup Schema Toggle ---
        {
          name: "enableProductGroup",
          type: "checkbox",
          label: "Enable ProductGroup Schema (Variants)",
          defaultValue: true,
          admin: {
            description:
              "Variants ko Google ProductGroup schema mein group karein. Sirf products par apply hota hai.",
          },
        },

        // --- #134: Video Key Moment (Optional enhancement) ---
        {
          name: "videoKeyMoment",
          type: "text",
          label: "Video Key Moment Timestamp",
          admin: {
            description:
              'e.g., "00:45" for a specific highlight in product video. Google uses this for Video Key Moments (#134).',
          },
        },
      ],
    },

    // ============================================================
    // 🔧 CONTENT STRATEGY FIELDS (AI Atomic Answers)
    // ============================================================
    {
      type: "collapsible",
      label: "AI Content Strategy (2026)",
      admin: {
        description: "Fields for Google AI Overviews & Atomic Answers.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "atomicAnswer",
          type: "textarea",
          label: "Atomic Answer (40-60 words)",
          admin: {
            description:
              "Google AI Overviews ke liye direct answer. 40-60 words mein concise jawab (#13).",
            rows: 2,
          },
        },
        {
          name: "faqQuestions",
          type: "array",
          label: "FAQ Questions (AI Extraction)",
          admin: {
            description:
              "AI models ke liye additional Q&A pairs. Inhe FAQPage schema mein include karein (#72).",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "question",
                  type: "text",
                  label: "Question",
                  admin: { width: "50%" },
                },
                {
                  name: "answer",
                  type: "textarea",
                  label: "Answer",
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};