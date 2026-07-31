// import type { CollectionConfig } from 'payload'

// export const Coupons: CollectionConfig = {
//   slug: 'coupons',
//   admin: {
//     useAsTitle: 'code', // Admin panel mein coupon code title ke taur par dikhega
//     defaultColumns: ['code', 'discountType', 'isActive', 'expiryDate'],
//   },
//   access: {
//     read: () => true, // Frontend ko coupons dekhne ki ijazat
//     // Create, Update, Delete ke rules hum baad mein set karenge (e.g. sirf Super Admin)
//   },
//   fields: [
//     {
//       type: 'tabs', // ✅ Sanity ke "groups" ka behtareen replacement
//       tabs: [
//         // ==========================================
//         // TAB 1: MAIN DETAILS
//         // ==========================================
//         {
//           label: 'Main Details',
//           fields: [
//             {
//               name: 'code',
//               type: 'text',
//               label: 'Coupon Code',
//               required: true,
//               unique: true, // Coupon code hamesha unique hona chahiye
//               // Sanity ka uppercase/regex validation yahan bhi apply hoga
//               validate: (val: any) => {
//                 if (val && /^[A-Z0-9_-]+$/.test(val) && val.toUpperCase() === val) return true
//                 return 'Code must be uppercase, no spaces (e.g., WELCOME10).'
//               },
//               admin: {
//                 description: 'Unique code customers enter (e.g., WELCOME10).',
//               },
//             },
//             {
//               name: 'description',
//               type: 'textarea', // Sanity 'string' with rows ki jagah Payload 'textarea'
//               label: 'Description (Internal Use)',
//               required: true,
//               admin: {
//                 description: 'A short note for what this coupon is for.',
//               },
//             },
//             {
//               name: 'isActive',
//               type: 'checkbox', // Sanity 'boolean' ki jagah Payload 'checkbox'
//               label: 'Is Active?',
//               defaultValue: true,
//               admin: {
//                 description: 'Turn this coupon on or off for all customers.',
//               },
//             },
//           ],
//         },

//         // ==========================================
//         // TAB 2: USAGE RULES & CONDITIONS
//         // ==========================================
//         {
//           label: 'Usage Rules & Conditions',
//           fields: [
//             {
//               name: 'discountType',
//               type: 'radio', // Sanity 'string' options layout 'radio' ki jagah Payload 'radio'
//               label: 'Discount Type',
//               options: [
//                 { label: 'Percentage (%)', value: 'percentage' },
//                 { label: 'Fixed Amount (Rs.)', value: 'fixed' },
//                 { label: 'Free Shipping', value: 'freeShipping' },
//               ],
//               defaultValue: 'percentage',
//               required: true,
//             },
//             {
//               name: 'discountValue',
//               type: 'number',
//               label: 'Discount Value',
//               min: 0,
//               // Conditional field based on discountType
//               admin: {
//                 description: 'Enter value (e.g., 15 for 15%, or 500 for Rs. 500).',
//                 condition: (data) => data.discountType !== 'freeShipping',
//               },
//             },
//             {
//               name: 'maximumDiscount',
//               type: 'number',
//               label: 'Maximum Discount (Rs.)',
//               min: 0,
//               admin: {
//                 description: 'Optional: Cap the percentage discount at this amount.',
//                 condition: (data) => data.discountType === 'percentage', // Sirf percentage ke liye
//               },
//             },
//             {
//               name: 'minimumPurchaseAmount',
//               type: 'number',
//               label: 'Minimum Purchase Amount (Rs.)',
//               min: 0,
//               admin: {
//                 description: 'Optional: Coupon applies if cart total is above this amount.',
//               },
//             },
//             {
//               name: 'startDate',
//               type: 'date', // Sanity 'datetime' ki jagah Payload 'date' (time bhi include karega)
//               label: 'Start Date',
//               admin: {
//                 description: 'Coupon becomes active from this date and time.',
//                 date: {
//                   pickerAppearance: 'dayAndTime',
//                 },
//               },
//             },
//             {
//               name: 'expiryDate',
//               type: 'date', // Sanity 'datetime' ki jagah Payload 'date'
//               label: 'Expiry Date',
//               admin: {
//                 description: 'Coupon will not be valid after this date and time.',
//                 date: {
//                   pickerAppearance: 'dayAndTime',
//                 },
//               },
//             },
//             {
//               name: 'totalUsageLimit',
//               type: 'number',
//               label: 'Total Usage Limit (for all customers)',
//               min: 1,
//               admin: {
//                 description: 'Total number of times this coupon can be used across all customers.',
//               },
//             },
//             {
//               name: 'usageLimitPerUser',
//               type: 'number',
//               label: 'Usage Limit Per Customer',
//               min: 1,
//               defaultValue: 1,
//               admin: {
//                 description: 'How many times a single customer can use this coupon.',
//               },
//             },
//           ],
//         },

//         // ==========================================
//         // TAB 3: APPLICABILITY
//         // ==========================================
//         {
//           label: 'Applicability',
//           fields: [
//             {
//               name: 'isStackable',
//               type: 'checkbox',
//               label: 'Stackable Discount',
//               defaultValue: false,
//               admin: {
//                 description: 'If ON, this coupon can be used even if a product is already on sale.',
//               },
//             },
//             {
//               name: 'applicableTo',
//               type: 'radio',
//               label: 'Applicable To',
//               options: [
//                 { label: 'Entire Order', value: 'entireOrder' },
//                 { label: 'Specific Products', value: 'specificProducts' },
//                 { label: 'Specific Categories', value: 'specificCategories' },
//               ],
//               defaultValue: 'entireOrder',
//             },
//             {
//               name: 'applicableProducts',
//               type: 'relationship',
//               relationTo: 'products', // Products collection se link karein
//               hasMany: true, // Multiple products select ho sakte hain
//               admin: {
//                 description: 'The coupon will ONLY apply to these selected products.',
//                 condition: (data) => data.applicableTo === 'specificProducts',
//               },
//             },
//             {
//               name: 'applicableCategories',
//               type: 'relationship',
//               relationTo: 'categories', // Categories collection se link karein
//               hasMany: true, // Multiple categories select ho sakte hain
//               admin: {
//                 description: 'The coupon will ONLY apply to products within these selected categories.',
//                 condition: (data) => data.applicableTo === 'specificCategories',
//               },
//             },
//           ],
//         },
//       ],
//     },
//   ],
// }
// src/collections/Coupons.ts

import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code', // Admin panel mein coupon code title ke taur par dikhega
    defaultColumns: ['code', 'discountType', 'isActive', 'expiryDate'],
  },
  access: {
    read: () => true, // Frontend ko coupons dekhne ki ijazat
    // Create, Update, Delete ke rules hum baad mein set karenge (e.g. sirf Super Admin)
  },
  fields: [
    {
      type: 'tabs', // ✅ Sanity ke "groups" ka behtareen replacement
      tabs: [
        // ==========================================
        // TAB 1: MAIN DETAILS
        // ==========================================
        {
          label: 'Main Details',
          fields: [
            {
              name: 'code',
              type: 'text',
              label: 'Coupon Code',
              required: true,
              unique: true, // Coupon code hamesha unique hona chahiye
              // Sanity ka uppercase/regex validation yahan bhi apply hoga
              validate: (val: any) => {
                if (val && /^[A-Z0-9_-]+$/.test(val) && val.toUpperCase() === val) return true
                return 'Code must be uppercase, no spaces (e.g., WELCOME10).'
              },
              admin: {
                description: 'Unique code customers enter (e.g., WELCOME10).',
              },
            },
            {
              name: 'description',
              type: 'textarea', // Sanity 'string' with rows ki jagah Payload 'textarea'
              label: 'Description (Internal Use)',
              required: true,
              admin: {
                description: 'A short note for what this coupon is for.',
              },
            },
            {
              name: 'isActive',
              type: 'checkbox', // Sanity 'boolean' ki jagah Payload 'checkbox'
              label: 'Is Active?',
              defaultValue: true,
              admin: {
                description: 'Turn this coupon on or off for all customers.',
              },
            },
          ],
        },

        // ==========================================
        // TAB 2: USAGE RULES & CONDITIONS
        // ==========================================
        {
          label: 'Usage Rules & Conditions',
          fields: [
            {
              name: 'discountType',
              type: 'radio', // Sanity 'string' options layout 'radio' ki jagah Payload 'radio'
              label: 'Discount Type',
              options: [
                { label: 'Percentage (%)', value: 'percentage' },
                { label: 'Fixed Amount (Rs.)', value: 'fixed' },
                { label: 'Free Shipping', value: 'freeShipping' },
              ],
              defaultValue: 'percentage',
              required: true,
            },
            {
              name: 'discountValue',
              type: 'number',
              label: 'Discount Value',
              min: 0,
              // Conditional field based on discountType
              admin: {
                description: 'Enter value (e.g., 15 for 15%, or 500 for Rs. 500).',
                condition: (data) => data.discountType !== 'freeShipping',
              },
            },
            {
              name: 'maximumDiscount',
              type: 'number',
              label: 'Maximum Discount (Rs.)',
              min: 0,
              admin: {
                description: 'Optional: Cap the percentage discount at this amount.',
                condition: (data) => data.discountType === 'percentage', // Sirf percentage ke liye
              },
            },
            {
              name: 'minimumPurchaseAmount',
              type: 'number',
              label: 'Minimum Purchase Amount (Rs.)',
              min: 0,
              admin: {
                description: 'Optional: Coupon applies if cart total is above this amount.',
              },
            },
            {
              name: 'startDate',
              type: 'date', // Sanity 'datetime' ki jagah Payload 'date' (time bhi include karega)
              label: 'Start Date',
              admin: {
                description: 'Coupon becomes active from this date and time.',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'expiryDate',
              type: 'date', // Sanity 'datetime' ki jagah Payload 'date'
              label: 'Expiry Date',
              admin: {
                description: 'Coupon will not be valid after this date and time.',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'totalUsageLimit',
              type: 'number',
              label: 'Total Usage Limit (for all customers)',
              min: 1,
              admin: {
                description: 'Total number of times this coupon can be used across all customers.',
              },
            },
            {
              name: 'usageLimitPerUser',
              type: 'number',
              label: 'Usage Limit Per Customer',
              min: 1,
              defaultValue: 1,
              admin: {
                description: 'How many times a single customer can use this coupon.',
              },
            },
            // =================================================================
            // 🚀 NEW: ENTERPRISE REFERRAL BOUND USER ID (ANTI-FRAUD GUARD)
            // =================================================================
            {
              name: 'boundUserId',
              type: 'text',
              label: 'Bound Customer ID (Referral)',
              index: true, // High-performance lookup index
              admin: {
                description: 'Optional: Bind this coupon to a specific storefront Customer ID. Only this user will be able to apply this coupon at checkout, completely blocking WhatsApp/social sharing leaks.',
              },
            },
            // =================================================================
          ],
        },

        // ==========================================
        // TAB 3: APPLICABILITY
        // ==========================================
        {
          label: 'Applicability',
          fields: [
            {
              name: 'isStackable',
              type: 'checkbox',
              label: 'Stackable Discount',
              defaultValue: false,
              admin: {
                description: 'If ON, this coupon can be used even if a product is already on sale.',
              },
            },
            {
              name: 'applicableTo',
              type: 'radio',
              label: 'Applicable To',
              options: [
                { label: 'Entire Order', value: 'entireOrder' },
                { label: 'Specific Products', value: 'specificProducts' },
                { label: 'Specific Categories', value: 'specificCategories' },
              ],
              defaultValue: 'entireOrder',
            },
            {
              name: 'applicableProducts',
              type: 'relationship',
              relationTo: 'products', // Products collection se link karein
              hasMany: true, // Multiple products select ho sakte hain
              admin: {
                description: 'The coupon will ONLY apply to these selected products.',
                condition: (data) => data.applicableTo === 'specificProducts',
              },
            },
            {
              name: 'applicableCategories',
              type: 'relationship',
              relationTo: 'categories', // Categories collection se link karein
              hasMany: true, // Multiple categories select ho sakte hain
              admin: {
                description: 'The coupon will ONLY apply to products within these selected categories.',
                condition: (data) => data.applicableTo === 'specificCategories',
              },
            },
          ],
        },
      ],
    },
  ],
}