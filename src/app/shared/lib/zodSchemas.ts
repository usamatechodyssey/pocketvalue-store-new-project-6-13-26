
// // src/app/shared/lib/zodSchemas.ts

// import { z } from "zod";

// // ====================================================================
// // 🛡️ SERVER-SAFE SANITIZER (Replaces isomorphic-dompurify)
// // ====================================================================

// const sanitizeText = (text: string): string => {
//   return text
//     .trim()
//     // Remove any HTML tags completely
//     .replace(/<[^>]*>/g, '')
//     // Escape dangerous characters to prevent XSS
//     .replace(/&/g, '&amp;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#39;')
//     .replace(/`/g, '&#96;')
//     .replace(/\//g, '&#47;');
// };

// // ====================================================================
// // 🛡️ REUSABLE SECURE SCHEMAS & SANITIZATION HELPERS
// // ====================================================================

// /**
//  * @description Safe string validator that trims white spaces, enforces min/max length,
//  * and sanitizes any HTML/script injections using server-safe sanitizer.
//  */
// const secureString = (
//   minLen = 1,
//   requiredMessage?: string,
//   maxLen?: number,
//   maxMessage?: string
// ) => {
//   let schema = z.string().min(minLen, { message: requiredMessage });
//   if (maxLen) {
//     schema = schema.max(maxLen, { message: maxMessage });
//   }
//   // ✅ Server-safe: custom sanitizer (no DOMPurify)
//   return schema.transform(val => sanitizeText(val));
// };

// // Whitelist for email domains to ensure registrations are from reliable providers.
// const ALLOWED_EMAIL_DOMAINS = [
//   'gmail.com', 'outlook.com', 'hotmail.com', 'live.com',
//   'yahoo.com', 'icloud.com', 'protonmail.com',
// ];

// // ====================================================================
// // SECTION 1: USER & AUTHENTICATION SCHEMAS
// // ====================================================================

// export const RegisterSchema = z.object({
//   name: secureString(2, "Name must be at least 2 characters."),
//   email: z.email({ message: "Please use a valid email address." })
//     .transform(val => val.trim().toLowerCase())
//     .refine(email => {
//         const domain = email.split('@')[1];
//         return ALLOWED_EMAIL_DOMAINS.includes(domain.toLowerCase());
//     }, { message: "Please use a valid email provider (e.g., Gmail, Outlook)." }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }),
// });

// export const UpdateNameSchema = z.object({
//   name: secureString(3, "Name must be at least 3 characters long."),
// });

// export const UpdatePasswordSchema = z.object({
//   currentPassword: z.string().min(1, { message: "Current password is required." }),
//   newPassword: z.string().min(6, { message: "New password must be at least 6 characters long." }),
// })
// .refine(data => data.currentPassword !== data.newPassword, {
//   message: "New password cannot be the same as the current one.",
//   path: ["newPassword"],
// });

// export const RequestPasswordResetSchema = z.object({
//   email: z.email({ message: "Please enter a valid email address." })
//     .transform(val => val.trim().toLowerCase()),
// });

// export const ResetPasswordSchema = z.object({
//   token: z.string().min(1, { message: "Reset token is missing." }),
//   newPassword: z.string().min(6, { message: "Password must be at least 6 characters long." }),
// });

// export const VerifyEmailSchema = z.object({
//   email: z.email({ message: "Please enter a valid email address." })
//     .transform(val => val.trim().toLowerCase()),
//   otp: z.string().regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits." }),
// });

// export const UpdatePhoneSchema = z.object({
//   email: z.email({ message: "Please enter a valid email address." })
//     .transform(val => val.trim().toLowerCase()),
//   phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code." }),
// });

// export const UpdateUserRoleSchema = z.object({
//   userId: z.string().min(1, { message: "User ID is required." }),
//   newRole: z.enum(['Store Manager', 'Content Editor', 'customer']),
// });

// export const InviteAdminSchema = z.object({
//   email: z.email({ message: "A valid email is required." })
//     .transform(val => val.trim().toLowerCase()),
//   role: z.enum(['Store Manager', 'Content Editor']),
// });

// // ====================================================================
// // SECTION 2: E-COMMERCE & GENERAL FORM SCHEMAS
// // ====================================================================

// export const AddressSchema = z.object({
//   fullName: secureString(2, "Full name is required."),
//   phone: z.string().regex(/^((\+92)|(0))3\d{2}-?\d{7}$/, {
//     message: "Please enter a valid Pakistani mobile number (e.g., 03001234567).",
//   }),
//   province: secureString(1, "Province is required."),
//   city: secureString(1, "City is required."),
//   area: secureString(3, "Area or locality is required."),
//   address: secureString(5, "Street address is required."),
//   lat: z.number().nullable().optional(),
//   lng: z.number().nullable().optional(),
// });

// export const CartItemValidationSchema = z.object({
//   _id: z.string().min(1, { message: "Product ID is missing." }),
//   cartItemId: z.string().min(1, { message: "Cart Item ID is missing." }),
//   name: secureString(1, "Product name is required."),
//   price: z.number().positive({ message: "Item price must be positive." }),
//   quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
//   sku: z.string().optional(),
//   categoryIds: z.array(z.string()).optional(),
//   variant: z.object({
//     _key: z.string().min(1, { message: "Variant key is missing." }),
//     name: secureString(1, "Variant name is required.")
//   }).optional()
// });

// export const CreateOrderSchema = z.object({
//   shippingAddress: AddressSchema,
//   cartItems: z.array(CartItemValidationSchema).min(1, { message: "Cart cannot be empty." }),
//   totalPrice: z.number().positive({ message: "Total price must be a positive value." }),
//   couponCode: z.string().optional().transform(val => val?.trim()),
// });

// export const InitiatePaymentSchema = z.object({
//   orderId: z.string().min(1, { message: "Order ID is required." }),
//   gatewayKey: z.string().min(1, { message: "Payment Gateway is required." }),
// });

// export const ContactFormSchema = z.object({
//   name: secureString(2, "Name must be at least 2 characters."),
//   email: z.email({ message: "Please enter a valid email address." })
//     .transform(val => val.trim().toLowerCase()),
//   subject: secureString(5, "Subject must be at least 5 characters."),
//   message: secureString(10, "Message must be at least 10 characters."),
// });

// export const VerifyCouponSchema = z.object({
//   code: z.string().min(1, { message: "Please enter a coupon code." }).transform(val => val.trim().toUpperCase()),
//   cart: z.object({
//     items: z.array(z.object({
//       _id: z.string().min(1),
//       price: z.number().positive(),
//       quantity: z.number().int().positive(),
//       categoryIds: z.array(z.string()).optional()
//     })),
//     subtotal: z.number().min(0),
//   }),
// });

// export const SubmitReviewSchema = z.object({
//   productId: z.string().min(1, { message: "Product ID is missing." }),
//   rating: z.number().min(1).max(5),
//   comment: secureString(10, "Comment must be at least 10 characters.", 1000, "Comment cannot be more than 1000 characters."),
//   reviewImageUrl: z.url({ message: "Please provide a valid image URL." }).optional().or(z.literal('')),
// });

// // ====================================================================
// // SECTION 3: ADMIN PANEL & DATA MANAGEMENT SCHEMAS
// // ====================================================================

// export const UpdateOrderStatusSchema = z.object({
//   orderId: z.string().min(1, { message: "Order ID is required." }),
//   newStatus: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'On Hold']),
// });

// export const SendCustomEmailSchema = z.object({
//   customerId: z.string().min(1, { message: "Customer ID is required." }),
//   subject: secureString(3, "Subject must be at least 3 characters."),
//   message: secureString(10, "Message must be at least 10 characters."),
// });

// export const CancelOrderSchema = z.object({
//   orderId: z.string().min(1, { message: "Order ID is required." }),
// });

// const ReturnItemSchema = z.object({
//   productId: z.string().min(1),
//   variantKey: z.string().min(1),
//   quantity: z.number().int().min(1, { message: "Quantity must be at least 1." }),
//   reason: secureString(3, "A reason for return is required."),
// });

// export const CreateReturnRequestSchema = z.object({
//   orderId: z.string().min(1, { message: "Order ID is missing." }),
//   orderNumber: z.string().min(1, { message: "Order Number is missing." }),
//   items: z.string().transform((str, ctx) => {
//     try {
//         const parsed = JSON.parse(str);
//         const itemsArray = z.array(ReturnItemSchema).min(1, { message: "You must select at least one item to return." });
//         return itemsArray.parse(parsed);
//     } catch (e) {
//         ctx.addIssue({ code: "custom", message: "Invalid items format." });
//         return z.NEVER;
//     }
//   }),
//   customerComments: secureString(0).optional(),
// });

// export const UpdateReturnStatusSchema = z.object({
//   returnId: z.string().min(1, { message: "Return ID is required." }),
//   status: z.enum(['Pending', 'Approved', 'Processing', 'Completed', 'Rejected']),
//   resolution: z.enum(['Refund', 'StoreCredit', 'Replacement']).optional(),
//   adminComments: secureString(0).optional(),
// });

// // ====================================================================
// // SECTION 4: CMS (SANITY) & BULK UPLOAD SCHEMAS
// // ====================================================================

// export const UpsertCategorySchema = z.object({
//   id: z.string().optional().nullable(),
//   name: secureString(2, "Category name must be at least 2 characters."),
//   slug: z.string().min(2).regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens." }),
//   parentId: z.string().optional().nullable(),
// });

// export const DeleteCategorySchema = z.object({
//   categoryId: z.string().min(1, { message: "Category ID is required." }),
// });

// export const CategoryCsvRowSchema = z.object({
//   name: secureString(1, "CSV row missing 'name'."),
//   slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
//   parent_slug: z.string().optional(),
//   image_url: z.url({ message: "Invalid 'image_url' in CSV." }).optional().or(z.literal('')),
// });

// const ProductVariantSchema = z.object({
//   _key: z.string().min(1),
//   name: secureString(1, "Variant name is required."),
//   sku: z.string().optional(),
//   price: z.number().positive(),
//   salePrice: z.number().positive().optional().nullable(),
//   stock: z.number().int().min(0).optional().nullable(),
//   inStock: z.boolean(),
//   images: z.array(z.record(z.string(), z.unknown())).optional(),
//   // ✅ ENTERPRISE FIX: Added cdnImages schema definitions to securely prevent Zod payload stripping
//   cdnImages: z.array(
//     z.object({
//       _key: z.string().optional(),
//       id: z.string().optional(),
//       url: z.string().min(1, "CDN Image URL is required."),
//     })
//   ).optional(),
//   weight: z.number().min(0).optional().nullable(),
//   dimensions: z.object({
//     height: z.number().min(0).optional().nullable(),
//     width: z.number().min(0).optional().nullable(),
//     depth: z.number().min(0).optional().nullable()
//   }).optional(),
//   attributes: z.array(z.object({
//     _key: z.string().min(1),
//     name: secureString(1),
//     value: secureString(1)
//   })),
// });

// export const ProductPayloadSchema = z.object({
//   title: secureString(3, "Title is too short."),
//   slug: z.string().regex(/^[a-z0-9-]+$/),
//   description: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
//   specifications: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
//   videoUrl: z.url().optional().or(z.literal('')),
//   brandId: z.string().optional(),
//   categoryIds: z.array(z.string()).optional(),
//   isBestSeller: z.boolean().optional(),
//   isNewArrival: z.boolean().optional(),
//   isFeatured: z.boolean().optional(),
//   isOnDeal: z.boolean().optional(),
//   rating: z.number().min(0).max(5).optional(),
//   variants: z.array(ProductVariantSchema).min(1),
// });

// export const DeleteProductSchema = z.object({
//   productId: z.string().min(1),
// });

// export const CsvParentRowSchema = z.object({
//   title: secureString(1, "Parent row must have a 'title'."),
//   slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
//   description: secureString(0).optional(),
//   specifications: secureString(0).optional(),
//   brand: secureString(0).optional(),
//   categories: secureString(0).optional(),
//   videoUrl: z.url().optional().or(z.literal('')),
//   isBestSeller: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
//   isNewArrival: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
//   isFeatured: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
//   isOnDeal: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
//   rating: z.coerce.number().min(0).max(5).optional(),
// });

// export const CsvVariantRowSchema = z.object({
//   variant_name: secureString(1, "Variant row must have a 'variant_name'."),
//   variant_price: z.coerce.number().positive(),
//   variant_salePrice: z.coerce.number().positive().optional(),
//   variant_sku: z.string().optional(),
//   variant_stock: z.coerce.number().int().min(0).optional(),
//   variant_inStock: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
//   variant_images: z.string().optional(),
//   variant_weight: z.coerce.number().min(0).optional(),
//   variant_height: z.coerce.number().min(0).optional(),
//   variant_width: z.coerce.number().min(0).optional(),
//   variant_depth: z.coerce.number().min(0).optional(),
//   variant_attributes: z.string().optional(),
//   attribute1_name: secureString(0).optional(),
//   attribute1_value: secureString(0).optional(),
//   attribute2_name: secureString(0).optional(),
//   attribute2_value: secureString(0).optional(),
//   attribute3_name: secureString(0).optional(),
//   attribute3_value: secureString(0).optional(),
// });

// export const ProductCsvRowSchema = z.union([
//   CsvParentRowSchema.partial().extend(CsvVariantRowSchema.shape),
//   CsvParentRowSchema,
// ]);

// type ProductCsvRow = z.infer<typeof ProductCsvRowSchema>;

// export const ProductGroupSchema = z.array(ProductCsvRowSchema)
//   .min(1, { message: "Invalid group." })
//   .refine((group): group is [ProductCsvRow, ...ProductCsvRow[]] => {
//     return typeof group[0]?.title === 'string' && typeof group[0]?.slug === 'string';
//   }, { 
//     message: "Invalid group: The first row must be a parent row with a 'title' and 'slug'." 
//   });

// // ====================================================================
// // SECTION 5: DYNAMIC SETTINGS SCHEMAS
// // ====================================================================

// const ShippingRuleSchema = z.object({
//   _id: z.string().optional(),
//   _key: z.string().optional(), 
//   name: secureString(1, "Rule name is required."),
//   minAmount: z.number().min(0),
//   cost: z.number().min(0),
//   isOnCall: z.boolean().optional(),
// });

// export const SanitySettingsSchema = z.object({
//   shippingRules: z.array(ShippingRuleSchema).optional().or(z.literal('')),
//   storeContactEmail: z.email().optional().or(z.literal('')),
//   storePhoneNumber: z.string().optional().or(z.literal('')),
//   storeAddress: secureString(0).optional().or(z.literal('')),
//   socialLinks: z.object({
//     facebook: z.url().optional().or(z.literal('')),
//     instagram: z.url().optional().or(z.literal('')),
//     twitter: z.url().optional().or(z.literal('')),
//   }).optional(),
// });

// const GatewayCredentialsSchema = z.object({
//   bankName: secureString(0).optional(),
//   accountTitle: secureString(0).optional(),
//   accountNumber: z.string().optional(),
//   iban: z.string().optional(),
//   storeId: z.string().optional(),
//   hashKey: z.string().optional(),
//   merchantId: z.string().optional(),
//   password: z.string().optional(),
//   integritySalt: z.string().optional(),
// }).loose();

// const GatewaySchema = z.object({
//   key: z.string().min(1),
//   name: secureString(1),
//   enabled: z.boolean(),
//   credentials: GatewayCredentialsSchema.optional(),
// });

// export const UpdatePaymentGatewaysSchema = z.array(GatewaySchema);

// // ====================================================================
// // SECTION 6: API & FILTER SCHEMAS
// // ====================================================================

// export const FilterRequestSchema = z.object({
//   page: z.coerce.number().int().min(1).max(100).default(1).optional(),
//   sortOrder: z.enum([
//     "best-match",
//     "price-low-to-high",
//     "price-high-to-low",
//     "newest",
//     "best-selling",
//     "rating-high"   // ✅ ENTERPRISE FIX: Added missing sort options
//   ]).optional(),
//   filters: z.object({
//     brands: z.array(z.string()).optional(),
//     categories: z.array(z.string()).optional(),
//     isFeatured: z.boolean().optional(),
//     availability: z.array(z.enum(["in-stock", "out-of-stock"])).optional(),
//     isOnSale: z.boolean().optional(),
//     minRating: z.coerce.number().min(1).max(5).optional(),
//   })
//   .passthrough()
//   .optional(),
//   priceRange: z.object({
//     min: z.coerce.number().min(0).optional(),
//     max: z.coerce.number().min(0).optional(),
//   }).optional(),
//   context: z.object({
//     // ✅ ENTERPRISE UPGRADE: Replaced rigid enum with a dynamic trim-sanitized string validator
//     // This fully prevents API 400 Bad Request crashes when navigating brand indexes, sitemaps, campaigns, or any newly deployed layouts
//     type: z.string().trim().min(1, "Context type is required."),
//     value: z.string().optional(),
//     sort: z.string().optional(),
//     filter: z.string().optional(),
//   }),
// });

// export const PulsePayloadSchema = z.object({
//   utmSource: z.string().max(100).optional().default("Direct"),
//   utmMedium: z.string().max(100).optional().default("None"),
//   utmCampaign: z.string().max(100).optional().default("None"),
//   os: z.string().max(50).optional().default("Other"),
//   device: z.enum(["mobile", "desktop", "tablet", "Other"]).optional().default("Other")
// }).strict();
// 📂 src/app/shared/lib/zodSchemas.ts

import { z } from "zod";

// ====================================================================
// 🛡️ SERVER-SAFE SANITIZER (Replaces isomorphic-dompurify)
// ====================================================================

const sanitizeText = (text: string): string => {
  return text
    .trim()
    // Remove any HTML tags completely
    .replace(/<[^>]*>/g, '')
    // Escape dangerous characters to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#47;');
};

// ====================================================================
// 🛡️ REUSABLE SECURE SCHEMAS & SANITIZATION HELPERS
// ====================================================================

/**
 * @description Safe string validator that trims white spaces, enforces min/max length,
 * and sanitizes any HTML/script injections using server-safe sanitizer.
 */
const secureString = (
  minLen = 1,
  requiredMessage?: string,
  maxLen?: number,
  maxMessage?: string
) => {
  let schema = z.string().min(minLen, { message: requiredMessage });
  if (maxLen) {
    schema = schema.max(maxLen, { message: maxMessage });
  }
  // ✅ Server-safe: custom sanitizer (no DOMPurify)
  return schema.transform(val => sanitizeText(val));
};

// Whitelist for email domains to ensure registrations are from reliable providers.
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'live.com',
  'yahoo.com', 'icloud.com', 'protonmail.com',
];

// ====================================================================
// SECTION 1: USER & AUTHENTICATION SCHEMAS
// ====================================================================

export const RegisterSchema = z.object({
  name: secureString(2, "Name must be at least 2 characters."),
  email: z.email({ message: "Please use a valid email address." })
    .transform(val => val.trim().toLowerCase())
    .refine(email => {
        const domain = email.split('@')[1];
        return ALLOWED_EMAIL_DOMAINS.includes(domain.toLowerCase());
    }, { message: "Please use a valid email provider (e.g., Gmail, Outlook)." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const UpdateNameSchema = z.object({
  name: secureString(3, "Name must be at least 3 characters long."),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long." }),
})
.refine(data => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as the current one.",
  path: ["newPassword"],
});

export const RequestPasswordResetSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." })
    .transform(val => val.trim().toLowerCase()),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is missing." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export const VerifyEmailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." })
    .transform(val => val.trim().toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits." }),
});

export const UpdatePhoneSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." })
    .transform(val => val.trim().toLowerCase()),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code." }),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  newRole: z.enum(['Store Manager', 'Content Editor', 'customer']),
});

export const InviteAdminSchema = z.object({
  email: z.email({ message: "A valid email is required." })
    .transform(val => val.trim().toLowerCase()),
  role: z.enum(['Store Manager', 'Content Editor']),
});

// ====================================================================
// SECTION 2: E-COMMERCE & GENERAL FORM SCHEMAS
// ====================================================================

export const AddressSchema = z.object({
  fullName: secureString(2, "Full name is required."),
  phone: z.string().regex(/^((\+92)|(0))3\d{2}-?\d{7}$/, {
    message: "Please enter a valid Pakistani mobile number (e.g., 03001234567).",
  }),
  province: secureString(1, "Province is required."),
  city: secureString(1, "City is required."),
  area: secureString(3, "Area or locality is required."),
  address: secureString(5, "Street address is required."),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const CartItemValidationSchema = z.object({
  _id: z.string().min(1, { message: "Product ID is missing." }),
  cartItemId: z.string().min(1, { message: "Cart Item ID is missing." }),
  name: secureString(1, "Product name is required."),
  price: z.number().positive({ message: "Item price must be positive." }),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
  sku: z.string().optional(),
   slug: z.string().min(1, { message: "Slug is required." }), // ✅ FIXED: Added missing slug field validation
   image: z.unknown().optional().nullable(), // ✅ FIXED: Allow image object to pass through Zod without getting stripped!
  categoryIds: z.array(z.string()).optional(),
  variant: z.object({
    _key: z.string().min(1, { message: "Variant key is missing." }),
    name: secureString(1, "Variant name is required.")
  }).optional()
});

export const CreateOrderSchema = z.object({
  shippingAddress: AddressSchema,
  cartItems: z.array(CartItemValidationSchema).min(1, { message: "Cart cannot be empty." }),
  totalPrice: z.number().positive({ message: "Total price must be a positive value." }),
  couponCode: z.string().optional().transform(val => val?.trim()),
});

export const InitiatePaymentSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
  gatewayKey: z.string().min(1, { message: "Payment Gateway is required." }),
});

export const ContactFormSchema = z.object({
  name: secureString(2, "Name must be at least 2 characters."),
  email: z.email({ message: "Please enter a valid email address." })
    .transform(val => val.trim().toLowerCase()),
  subject: secureString(5, "Subject must be at least 5 characters."),
  message: secureString(10, "Message must be at least 10 characters."),
});

export const VerifyCouponSchema = z.object({
  code: z.string().min(1, { message: "Please enter a coupon code." }).transform(val => val.trim().toUpperCase()),
  cart: z.object({
    items: z.array(z.object({
      _id: z.string().min(1),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      categoryIds: z.array(z.string()).optional()
    })),
    subtotal: z.number().min(0),
  }),
});

export const SubmitReviewSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is missing." }),
  rating: z.number().min(1).max(5),
  comment: secureString(10, "Comment must be at least 10 characters.", 1000, "Comment cannot be more than 1000 characters."),
  reviewImageUrl: z.url({ message: "Please provide a valid image URL." }).optional().or(z.literal('')),
});

// ====================================================================
// SECTION 3: ADMIN PANEL & DATA MANAGEMENT SCHEMAS
// ====================================================================

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
  newStatus: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'On Hold']),
});

export const SendCustomEmailSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required." }),
  subject: secureString(3, "Subject must be at least 3 characters."),
  message: secureString(10, "Message must be at least 10 characters."),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
});

const ReturnItemSchema = z.object({
  productId: z.string().min(1),
  variantKey: z.string().min(1),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1." }),
  reason: secureString(3, "A reason for return is required."),
});

export const CreateReturnRequestSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is missing." }),
  orderNumber: z.string().min(1, { message: "Order Number is missing." }),
  items: z.string().transform((str, ctx) => {
    try {
        const parsed = JSON.parse(str);
        const itemsArray = z.array(ReturnItemSchema).min(1, { message: "You must select at least one item to return." });
        return itemsArray.parse(parsed);
    } catch (e) {
        ctx.addIssue({ code: "custom", message: "Invalid items format." });
        return z.NEVER;
    }
  }),
  customerComments: secureString(0).optional(),
});

export const UpdateReturnStatusSchema = z.object({
  returnId: z.string().min(1, { message: "Return ID is required." }),
  status: z.enum(['Pending', 'Approved', 'Processing', 'Completed', 'Rejected']),
  resolution: z.enum(['Refund', 'StoreCredit', 'Replacement']).optional(),
  adminComments: secureString(0).optional(),
});

// ====================================================================
// SECTION 4: CMS (SANITY) & BULK UPLOAD SCHEMAS
// ====================================================================

export const UpsertCategorySchema = z.object({
  id: z.string().optional().nullable(),
  name: secureString(2, "Category name must be at least 2 characters."),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  parentId: z.string().optional().nullable(),
});

export const DeleteCategorySchema = z.object({
  categoryId: z.string().min(1, { message: "Category ID is required." }),
});

export const CategoryCsvRowSchema = z.object({
  name: secureString(1, "CSV row missing 'name'."),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  parent_slug: z.string().optional(),
  image_url: z.url({ message: "Invalid 'image_url' in CSV." }).optional().or(z.literal('')),
});

const ProductVariantSchema = z.object({
  _key: z.string().min(1),
  name: secureString(1, "Variant name is required."),
  sku: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional().nullable(),
  inStock: z.boolean(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
  // ✅ ENTERPRISE FIX: Added cdnImages schema definitions to securely prevent Zod payload stripping
  cdnImages: z.array(
    z.object({
      _key: z.string().optional(),
      id: z.string().optional(),
      url: z.string().min(1, "CDN Image URL is required."),
    })
  ).optional(),
  weight: z.number().min(0).optional().nullable(),
  dimensions: z.object({
    height: z.number().min(0).optional().nullable(),
    width: z.number().min(0).optional().nullable(),
    depth: z.number().min(0).optional().nullable()
  }).optional(),
  attributes: z.array(z.object({
    _key: z.string().min(1),
    name: secureString(1),
    value: secureString(1)
  })),
});

export const ProductPayloadSchema = z.object({
  title: secureString(3, "Title is too short."),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
  specifications: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
  videoUrl: z.url().optional().or(z.literal('')),
  brandId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOnDeal: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  variants: z.array(ProductVariantSchema).min(1),
});

export const DeleteProductSchema = z.object({
  productId: z.string().min(1),
});

export const CsvParentRowSchema = z.object({
  title: secureString(1, "Parent row must have a 'title'."),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: secureString(0).optional(),
  specifications: secureString(0).optional(),
  brand: secureString(0).optional(),
  categories: secureString(0).optional(),
  videoUrl: z.url().optional().or(z.literal('')),
  isBestSeller: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isNewArrival: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isFeatured: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isOnDeal: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export const CsvVariantRowSchema = z.object({
  variant_name: secureString(1, "Variant row must have a 'variant_name'."),
  variant_price: z.coerce.number().positive(),
  variant_salePrice: z.coerce.number().positive().optional(),
  variant_sku: z.string().optional(),
  variant_stock: z.coerce.number().int().min(0).optional(),
  variant_inStock: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  variant_images: z.string().optional(),
  variant_weight: z.coerce.number().min(0).optional(),
  variant_height: z.coerce.number().min(0).optional(),
  variant_width: z.coerce.number().min(0).optional(),
  variant_depth: z.coerce.number().min(0).optional(),
  variant_attributes: z.string().optional(),
  attribute1_name: secureString(0).optional(),
  attribute1_value: secureString(0).optional(),
  attribute2_name: secureString(0).optional(),
  attribute2_value: secureString(0).optional(),
  attribute3_name: secureString(0).optional(),
  attribute3_value: secureString(0).optional(),
});

export const ProductCsvRowSchema = z.union([
  CsvParentRowSchema.partial().extend(CsvVariantRowSchema.shape),
  CsvParentRowSchema,
]);

type ProductCsvRow = z.infer<typeof ProductCsvRowSchema>;

export const ProductGroupSchema = z.array(ProductCsvRowSchema)
  .min(1, { message: "Invalid group." })
  .refine((group): group is [ProductCsvRow, ...ProductCsvRow[]] => {
    return typeof group[0]?.title === 'string' && typeof group[0]?.slug === 'string';
  }, { 
    message: "Invalid group: The first row must be a parent row with a 'title' and 'slug'." 
  });

// ====================================================================
// SECTION 5: DYNAMIC SETTINGS SCHEMAS
// ====================================================================

// ✅ MODIFIED: Dynamic ShippingRuleSchema (Uses non-deprecated raw string literals "custom")
const ShippingRuleSchema = z.object({
  _id: z.string().optional(),
  _key: z.string().optional(), 
  name: secureString(1, "Rule name is required."),
  minAmount: z.number().min(0),
  cost: z.number().min(0).optional().nullable(), // Cost made optional/nullable initially
  isOnCall: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // If 'isOnCall' is NOT checked, we dynamically enforce that cost must be defined and at least 0.
  if (!data.isOnCall) {
    if (data.cost === undefined || data.cost === null) {
      ctx.addIssue({
        code: "custom", // ✅ FIXED: Replaced deprecated z.ZodIssueCode.custom
        message: "Cost is required when 'Shipping on Call?' is disabled.",
        path: ["cost"],
      });
    } else if (typeof data.cost === "number" && data.cost < 0) {
      ctx.addIssue({
        code: "custom", // ✅ FIXED: Replaced deprecated z.ZodIssueCode.custom
        message: "Cost must be at least 0.",
        path: ["cost"],
      });
    }
  }
});

export const SanitySettingsSchema = z.object({
  shippingRules: z.array(ShippingRuleSchema).optional().or(z.literal('')),
  storeContactEmail: z.email().optional().or(z.literal('')),
  storePhoneNumber: z.string().optional().or(z.literal('')),
  storeAddress: secureString(0).optional().or(z.literal('')),
  socialLinks: z.object({
    facebook: z.url().optional().or(z.literal('')),
    instagram: z.url().optional().or(z.literal('')),
    twitter: z.url().optional().or(z.literal('')),
  }).optional(),
});

const GatewayCredentialsSchema = z.object({
  bankName: secureString(0).optional(),
  accountTitle: secureString(0).optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  storeId: z.string().optional(),
  hashKey: z.string().optional(),
  merchantId: z.string().optional(),
  password: z.string().optional(),
  integritySalt: z.string().optional(),
}).loose();

const GatewaySchema = z.object({
  key: z.string().min(1),
  name: secureString(1),
  enabled: z.boolean(),
  credentials: GatewayCredentialsSchema.optional(),
});

export const UpdatePaymentGatewaysSchema = z.array(GatewaySchema);

// ====================================================================
// SECTION 6: API & FILTER SCHEMAS
// ====================================================================

export const FilterRequestSchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1).optional(),
  sortOrder: z.enum([
    "best-match",
    "price-low-to-high",
    "price-high-to-low",
    "newest",
    "best-selling",
    "rating-high"   // ✅ ENTERPRISE FIX: Added missing sort options
  ]).optional(),
  filters: z.object({
    brands: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    availability: z.array(z.enum(["in-stock", "out-of-stock"])).optional(),
    isOnSale: z.boolean().optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
  })
  .loose() // ✅ FIXED: Replaced deprecated .passthrough() with .loose()
  .optional(),
  priceRange: z.object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
  }).optional(),
  context: z.object({
    // ✅ ENTERPRISE UPGRADE: Replaced rigid enum with a dynamic trim-sanitized string validator
    // This fully prevents API 400 Bad Request crashes when navigating brand indexes, sitemaps, campaigns, or any newly deployed layouts
    type: z.string().trim().min(1, "Context type is required."),
    value: z.string().optional(),
    sort: z.string().optional(),
    filter: z.string().optional(),
  }),
});

export const PulsePayloadSchema = z.object({
  utmSource: z.string().max(100).optional().default("Direct"),
  utmMedium: z.string().max(100).optional().default("None"),
  utmCampaign: z.string().max(100).optional().default("None"),
  os: z.string().max(50).optional().default("Other"),
  device: z.enum(["mobile", "desktop", "tablet", "Other"]).optional().default("Other")
}).strict();