// import { Block } from 'payload'

// export const LayoutSection: Block = {
//   slug: 'layoutSection',
//   labels: {
//     singular: 'Layout Block (Trust/Newsletter/Grid)',
//     plural: 'Layout Blocks',
//   },
//   fields:[
//     {
//       name: 'type',
//       type: 'radio',
//       label: 'Section Type',
//       options:[
//         { label: 'Trust Bar (Icons)', value: 'trust' },
//         { label: 'Newsletter Signup', value: 'newsletter' },
//         { label: 'Infinite Product Grid', value: 'infiniteGrid' },
//       ],
//       defaultValue: 'trust',
//     },
//     {
//       name: 'gridTitle',
//       type: 'text',
//       label: 'Grid Title',
//       defaultValue: 'More to Explore',
//       admin: {
//         // 🔥 Sirf tab dikhega jab 'infiniteGrid' select ho
//         condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
//       },
//     },
//   ],
// }
import { Block } from 'payload'

export const LayoutSection: Block = {
  slug: 'layoutSection',
  labels: {
    singular: 'Layout Block (Trust/Newsletter/Grid)',
    plural: 'Layout Blocks',
  },
  fields: [
    // ================================================================
    // 1️⃣ SECTION TYPE (Trust / Newsletter / Infinite Grid)
    // ================================================================
    {
      name: 'type',
      type: 'radio',
      label: 'Section Type',
      options: [
        { label: 'Trust Bar (Icons)', value: 'trust' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Infinite Product Grid', value: 'infiniteGrid' },
      ],
      defaultValue: 'trust',
    },

    // ================================================================
    // 2️⃣ GRID TITLE (Only for Infinite Grid)
    // ================================================================
    {
      name: 'gridTitle',
      type: 'text',
      label: 'Grid Title',
      defaultValue: 'More to Explore',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },

    // ================================================================
    // 3️⃣ PRODUCT SOURCE (Only for Infinite Grid)
    // ================================================================
    {
      name: 'sourceType',
      type: 'select',
      label: 'Product Source',
      options: [
        { label: '🔥 Deals (On Sale)', value: 'deals' },
        { label: '📂 Category', value: 'category' },
        { label: '🔍 Search Results', value: 'search' },
        { label: '✋ Manual Selection', value: 'manual' },
      ],
      defaultValue: 'deals',
      admin: {
        description: 'Select where products should be fetched from.',
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },

    // ================================================================
    // 4️⃣ CATEGORY SLUG (Only when sourceType = category)
    // ================================================================
    {
      name: 'categorySlug',
      type: 'text',
      label: 'Category Slug',
      admin: {
        description: 'e.g., "health-accessories" or "mens-clothing"',
        condition: (_, siblingData) =>
          siblingData.type === 'infiniteGrid' && siblingData.sourceType === 'category',
      },
    },

    // ================================================================
    // 5️⃣ SEARCH TERM (Only when sourceType = search)
    // ================================================================
    {
      name: 'searchTerm',
      type: 'text',
      label: 'Search Term',
      admin: {
        description: 'e.g., "wireless headphones"',
        condition: (_, siblingData) =>
          siblingData.type === 'infiniteGrid' && siblingData.sourceType === 'search',
      },
    },

    // ================================================================
    // 6️⃣ MANUAL PRODUCTS (Only when sourceType = manual)
    // ================================================================
    {
      name: 'manualProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Select Products Manually',
      admin: {
        description: 'Pick specific products to show in this grid.',
        condition: (_, siblingData) =>
          siblingData.type === 'infiniteGrid' && siblingData.sourceType === 'manual',
      },
    },

    // ================================================================
    // 7️⃣ SORT ORDER (Only for Infinite Grid)
    // ================================================================
    {
      name: 'sortOrder',
      type: 'select',
      label: 'Sort Order',
      options: [
        { label: 'Best Selling (Most Popular)', value: 'best-selling' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Price: Low → High', value: 'price-low-to-high' },
        { label: 'Price: High → Low', value: 'price-high-to-low' },
        { label: 'Highest Rated', value: 'rating-high' },
      ],
      defaultValue: 'best-selling',
      admin: {
        description: 'How should products be sorted?',
        condition: (_, siblingData) =>
          siblingData.type === 'infiniteGrid' && siblingData.sourceType !== 'manual',
      },
    },

    // ================================================================
    // 8️⃣ LIMIT (Products per page) – Only for Infinite Grid
    // ================================================================
    {
      name: 'limit',
      type: 'number',
      label: 'Products Per Page',
      defaultValue: 40,
      min: 1,
      max: 100,
      admin: {
        description: 'How many products to show per page? (Max: 100)',
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },

    // ================================================================
    // 9️⃣ VIEW ALL LINK – Only for Infinite Grid
    // ================================================================
    {
      name: 'viewAllLink',
      type: 'text',
      label: '"View All" Button Link',
      defaultValue: '/search',
      admin: {
        description: 'Where should the "View All" button go? (e.g., /deals, /category/health-accessories)',
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },

    // ================================================================
    // 🔟 SHOW VIEW ALL BUTTON – Toggle
    // ================================================================
    {
      name: 'showViewAll',
      type: 'checkbox',
      label: 'Show "View All" Button',
      defaultValue: true,
      admin: {
        description: 'Toggle visibility of the "View All" button.',
        condition: (_, siblingData) => siblingData.type === 'infiniteGrid',
      },
    },
  ],
}