
// 📂 src/payload/globals/Settings.ts

import type { GlobalConfig, GlobalAfterChangeHook } from "payload";
import { SEO } from "../fields/SEO";

/**
 * 🚀 ENTERPRISE CACHE INVALIDATOR HOOK (Redis Purge)
 * ✅ FIXED: Ab redis.keys fail honey par bhi pipeline execute hogi
 */
const invalidateAnalyticsCache: GlobalAfterChangeHook = async ({ doc }) => {
  try {
    const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
    const pipeline = redis.pipeline();

    // ✅ FIX: keys() ko try-catch mein lapet diya
    // Agar yeh fail bhi ho, toh baqi cache clear hona chahiye
    try {
      const keys = await redis.keys("analytics_*");
      if (keys.length > 0) {
        pipeline.del(...keys);
      }
    } catch (keysError) {
      console.warn("⚠️ Failed to fetch analytics keys, continuing with main cache purge.");
    }

    // ✅ YE LINES HUMESHA CHALENGI (ab rukengi nahi)
    pipeline.del("global_settings_cache");
    pipeline.del("analytics_marketing_hub_summary");
    pipeline.del("analytics_audience_vault");

    await pipeline.exec();
    console.log(`🚀 Cache Invalidator Hook: Successfully purged settings cache.`);
  } catch (error: any) {
    console.error("❌ Cache Invalidation Hook Failed:", error.message);
  }
  return doc;
};

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [invalidateAnalyticsCache],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        // --- TAB 1: GENERAL INFO ---
        {
          label: "General Info",
          fields: [
            { name: "siteName", type: "text", required: true },
            { name: "siteLogo", type: "upload", relationTo: "media" },
            { name: "storeContactEmail", type: "email" },
            { name: "storePhoneNumber", type: "text" },
            { name: "storeAddress", type: "text" },
            {
              name: "socialLinks",
              type: "group",
              fields: [
                { name: "facebook", type: "text" }, 
                { name: "instagram", type: "text" },
                { name: "twitter", type: "text" },
              ],
            },
          ],
        },
        // --- TAB 2: PROMOTIONS ---
        {
          label: "Promotions & Banners",
          fields: [
            {
              name: "topBarAnnouncements",
              type: "array", 
              fields: [{ name: "message", type: "text" }],
            },
          ],
        },
        // --- TAB 3: NAVIGATION ---
        {
          label: "Navigation & Menus",
          fields: [
            {
              name: "secondaryNavLinks",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "url", type: "text", required: true, defaultValue: "/" },
                { name: "position", type: "radio", options: [{ label: "Left Side", value: "left" }, { label: "Right Side", value: "right" }], defaultValue: "left" },
                { name: "isHighlight", type: "checkbox", defaultValue: false },
              ],
            },
          ],
        },
        // --- TAB 4: SHIPPING ---
        {
          label: "Shipping",
          fields: [
            {
              name: "shippingRules",
              type: "array",
              label: "Shipping Rules (Dynamic)",
              fields: [
                { name: "name", type: "text", required: true },
                { name: "minAmount", type: "number", required: true, defaultValue: 0, min: 0 },
                {
                  name: "cost",
                  type: "number",
                  min: 0,
                  // ✅ Dynamic validation with explicit TypeScript types for parameters
                  validate: (
                    value: number | null | undefined | string, 
                    { siblingData }: { siblingData?: any }
                  ) => {
                    if (siblingData?.isOnCall) {
                      return true; 
                    }
                    if (value === undefined || value === null || value === "") {
                      return "Cost is required when 'Shipping on Call?' is disabled.";
                    }
                    const numValue = typeof value === "string" ? parseFloat(value) : value;
                    if (typeof numValue === "number" && numValue < 0) {
                      return "Cost must be at least 0.";
                    }
                    return true;
                  },
                },
                { name: "isOnCall", type: "checkbox", defaultValue: false, label: "Shipping on Call?" },
              ],
            },
            {
              name: "shippingCost",
              type: "number",
              label: "Default Shipping Cost (PKR)",
              required: true,
              defaultValue: 350,
              min: 0,
              admin: {
                description: "This is used as the base shipping cost for Google Shopping feed and general fallback calculations.",
              },
            },
          ],
        },
        // --- TAB 5: INVENTORY ---
        {
          label: "Inventory",
          fields: [
            {
              name: "inventorySettings",
              type: "group",
              fields: [
                { name: "lowStockThreshold", type: "number", defaultValue: 5 },
                { name: "alertRecipientEmail", type: "email", defaultValue: "admin@example.com" },
              ],
            },
          ],
        },
        // --- TAB 6: SEARCH ---
        {
          label: "Search Suggestions",
          fields: [
            {
              name: "searchSettings",
              type: "group",
              fields: [
                { name: "trendingKeywords", type: "array", fields: [{ name: "keyword", type: "text" }] },
                { name: "popularCategories", type: "relationship", relationTo: "categories", hasMany: true },
              ],
            },
          ],
        },
        // --- TAB 7: DYNAMIC PRICING LOGIC ---
        {
          label: 'Dynamic Pricing Logic',
          fields: [
            {
              name: 'globalFixedFees',
              type: 'array',
              label: 'Fixed Platform Fees',
              fields: [
                { type: 'row', fields: [ { name: 'label', type: 'text', required: true }, { name: 'percentage', type: 'number', required: true } ] }
              ]
            },
            {
              name: 'pricingLogicTiers',
              type: 'array',
              label: 'Tiered Pricing Brackets (Excel Logic)',
              fields: [
                { type: 'row', fields: [ { name: 'minCost', type: 'number', required: true }, { name: 'maxCost', type: 'number', required: true } ] },
                { type: 'row', fields: [ { name: 'profitPercent', type: 'number', required: true }, { name: 'adSpendPercent', type: 'number', required: true }, { name: 'visualDiscount', type: 'number' } ] }
              ]
            },
            {
              name: 'taxSettings',
              type: 'group',
              fields: [ { name: 'standardGstPercent', type: 'number', required: true, defaultValue: 0 } ]
            },
            {
              name: 'returnsSettings',
              type: 'group',
              fields: [ { name: 'estimatedReturnRatePercent', type: 'number', required: true, defaultValue: 0 } ]
            },
            {
              name: 'pricingSettings',
              type: 'group',
              fields: [ { name: 'estimatedDutiesPercent', type: 'number', required: true, defaultValue: 0 } ]
            }
          ]
        },

        // --- TAB 8: LOYALTY & REFERRALS ---
        {
          label: "Loyalty & Referrals",
          fields: [
            {
              name: "loyaltyEnabled",
              type: "checkbox",
              label: "Enable Referral System",
              defaultValue: true,
            },
            {
              name: "referralLimitPerUser",
              type: "number",
              label: "Maximum Referrals Allowed Per User",
              defaultValue: 50,
              required: true,
              min: 1,
            },
            {
              name: "referralGoalTarget",
              type: "number",
              label: "Monthly Referral Goal (Conversions)",
              defaultValue: 0,
              min: 0,
              admin: {
                description: "Target number of converted referrals per month. Dashboard will show progress.",
                placeholder: "e.g., 100",
              },
            },
            {
              name: "referralMilestones",
              type: "array",
              label: "Dynamic Referral Milestones (Tiers)",
              admin: {
                description: "Define rewards based on verified successful referrals.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "requiredConversions",
                      type: "number",
                      label: "Required Friends Purchased",
                      required: true,
                      min: 1,
                    },
                    {
                      name: "rewardLabel",
                      type: "text",
                      label: "Reward Description (e.g. Gold Tier - 15% Off)",
                      required: true,
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "discountType",
                      type: "select",
                      label: "Coupon Discount Type",
                      required: true,
                      defaultValue: "percentage",
                      options: [
                        { label: "Percentage (%)", value: "percentage" },
                        { label: "Fixed Amount (Rs.)", value: "fixed" },
                        { label: "Free Shipping", value: "freeShipping" },
                      ],
                    },
                    {
                      name: "discountValue",
                      type: "number",
                      label: "Discount Value",
                      required: true,
                      min: 0,
                      admin: {
                        description: "e.g., 15 for 15%, or 500 for Rs. 500",
                      },
                    },
                  ],
                },
                {
                  name: "maximumDiscount",
                  type: "number",
                  label: "Maximum Discount Cap (Rs.)",
                  min: 0,
                  admin: {
                    description: "Optional: Only applies to percentage coupons.",
                  },
                },
              ],
            },
            {
              name: "vipShoppingMilestones",
              type: "array",
              label: "VIP Shopping Club Milestones (Lifetime Spend Tiers)",
              admin: {
                description: "Define loyalty rewards based on customer's own total verified spending (Lifetime Spend in PKR).",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "requiredSpend",
                      type: "number",
                      label: "Required Lifetime Spend (PKR)",
                      required: true,
                      min: 1,
                    },
                    {
                      name: "rewardLabel",
                      type: "text",
                      label: "Reward Description (e.g. Platinum VIP - Rs. 1000 Voucher)",
                      required: true,
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "discountType",
                      type: "select",
                      label: "Coupon Discount Type",
                      required: true,
                      defaultValue: "fixed",
                      options: [
                        { label: "Percentage (%)", value: "percentage" },
                        { label: "Fixed Amount (Rs.)", value: "fixed" },
                        { label: "Free Shipping", value: "freeShipping" },
                      ],
                    },
                    {
                      name: "discountValue",
                      type: "number",
                      label: "Discount Value",
                      required: true,
                      min: 0,
                      admin: {
                        description: "e.g., 10 for 10%, or 1000 for Rs. 1000 voucher",
                      },
                    },
                  ],
                },
                {
                  name: "maximumDiscount",
                  type: "number",
                  label: "Maximum Discount Cap (Rs.)",
                  min: 0,
                  admin: {
                    description: "Optional: Only applies to percentage coupons.",
                  },
                },
              ],
            },
            {
              type: "collapsible",
              label: "Default Coupon Settings (Auto-Rewards)",
              admin: {
                description: "These settings apply to all auto-generated referral & VIP milestone coupons.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "couponDefaultExpiryDays",
                      type: "number",
                      label: "Default Expiry (Days)",
                      defaultValue: 30,
                      required: true,
                      min: 1,
                      admin: {
                        description: "How many days until auto-generated coupons expire.",
                      },
                    },
                    {
                      name: "couponDefaultUsageLimit",
                      type: "number",
                      label: "Default Usage Limit (Per User)",
                      defaultValue: 1,
                      required: true,
                      min: 1,
                      admin: {
                        description: "How many times a customer can use their reward coupon.",
                      },
                    },
                  ],
                },
                {
                  name: "couponIsStackable",
                  type: "checkbox",
                  label: "Allow Stacking with Other Discounts?",
                  defaultValue: false,
                  admin: {
                    description: "If enabled, customers can use this coupon with other promotions.",
                  },
                },
              ],
            },
            {
              type: "collapsible",
              label: "Inactive Customer Reactivation",
              admin: {
                description: "Configure thresholds to identify inactive customers for re-engagement campaigns.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "inactiveDaysThreshold",
                      type: "number",
                      label: "Inactive Days Threshold",
                      defaultValue: 60,
                      required: true,
                      min: 7,
                      admin: {
                        description: "Customers with no orders after this many days are considered inactive.",
                        placeholder: "e.g., 60",
                      },
                    },
                    {
                      name: "highValueInactiveThreshold",
                      type: "number",
                      label: "High Value Spend Threshold (PKR)",
                      defaultValue: 5000,
                      required: true,
                      min: 0,
                      admin: {
                        description: "Minimum lifetime spend to be considered a high-value inactive customer.",
                        placeholder: "e.g., 5000",
                      },
                    },
                  ],
                },
                {
                  name: "reactivationEmailTemplate",
                  type: "textarea",
                  label: "Reactivation Email Template",
                  admin: {
                    description:
                      'Optional custom email template. Use {{name}}, {{coupon}}, {{link}} as placeholders. Leave empty to use default.',
                    rows: 4,
                    placeholder:
                      "Hi {{name}}, we miss you! Here's a special {{coupon}} off your next order. Click {{link}} to shop now.",
                  },
                },
              ],
            },
            {
              name: "segmentBuilderEnabled",
              type: "checkbox",
              label: "Enable Segment Builder",
              defaultValue: true,
              admin: {
                description: "Allow marketing team to create and save custom customer segments.",
              },
            },
          ],
        },
        // --- TAB 9: DEFAULT SEO ---
        {
          label: "Default SEO",
          fields: [SEO], 
        },
        // --- TAB 10: OPERATIONAL INTELLIGENCE ---
        {
          label: "Operational Intelligence",
          fields: [
            {
              type: "group",
              name: "operational",
              fields: [
                { name: "limboRevenueThreshold", type: "number", defaultValue: 1000000 },
                { name: "autoRefreshInterval", type: "number", defaultValue: 60 },
              ],
            },
          ],
        },
        
        // --- TAB 11: MEDIA SETTINGS --- ✅ ENTERPRISE DEBUG LOGS ADDED
        {
          label: "Media Settings",
          fields: [
            {
              name: "mediaProvider",
              type: "select",
              options: [
                { label: "ImgBB (Free, Unlimited)", value: "imgbb" },
                { label: "Cloudflare R2 (Enterprise, 10GB Free)", value: "cloudflare-r2" },
              ],
              defaultValue: "imgbb",
              required: true,
              admin: {
                description: "✅ DEBUG: Current value will be logged in console.",
              },
            },
            { 
              name: "mediaDualUpload", 
              type: "checkbox", 
              defaultValue: false,
              admin: {
                description: "✅ DEBUG: Current value will be logged in console.",
              },
            },
            {
              name: "mediaFetchMode",
              type: "select",
              options: [
                { label: "ImgBB (Primary)", value: "imgbb" },
                { label: "Cloudflare R2 (Backup)", value: "r2" },
                { label: "Both (Distributed / Fallback)", value: "both" },
              ],
              defaultValue: "imgbb",
              required: true,
              admin: {
                description: "✅ DEBUG: Current value will be logged in console.",
              },
            },
            {
              name: "cdnMode",
              type: "checkbox",
              label: "Enable CDN Mode (Direct URLs)",
              defaultValue: true,
              admin: {
                description:
                  "⚠️ CRITICAL: If enabled, the system will NOT upload images. It will store image URLs directly. Disable to use ImgBB/R2 uploads.",
              },
            },
          ],
        },
        // --- TAB 12: WAREHOUSE LOGISTICS ---
        {
          label: "Warehouse Logistics",
          fields: [
            {
              type: "group",
              name: "warehouse",
              fields: [
                {
                  name: "locations",
                  type: "array",
                  fields: [
                    { type: "row", fields: [ { name: "name", type: "text", required: true }, { name: "address", type: "text" } ] },
                    { type: "row", fields: [ { name: "lat", type: "number", required: true }, { name: "lng", type: "number", required: true } ] },
                  ],
                },
              ],
            },
          ],
        },
        // --- TAB 13: GEOSPATIAL INTELLIGENCE ---
        {
          label: "Geospatial Intelligence",
          fields: [
            {
              type: "group",
              name: "geospatial",
              fields: [
                { name: "highPotentialRevenue", type: "number", defaultValue: 50000 },
                { name: "highPotentialRto", type: "number", defaultValue: 10 },
                { name: "topCityLimit", type: "number", defaultValue: 10 },
              ],
            },
          ],
        },
        // --- TAB 14: FORECASTING ---
        {
          label: "Forecasting",
          fields: [
            {
              name: "forecasting",
              type: "group",
              fields: [
                { name: "windowDays", type: "number", defaultValue: 15 },
                { name: "criticalThreshold", type: "number", defaultValue: 3 },
                { name: "highThreshold", type: "number", defaultValue: 7 },
                { name: "topLimit", type: "number", defaultValue: 20 },
              ],
            },
          ],
        },
        // --- TAB 15: COMMUNICATION ---
        {
          label: "Communication",
          fields: [
            {
              name: "communication",
              type: "group",
              fields: [
                {
                  name: "mailjet",
                  type: "group",
                  fields: [
                    { name: "enabled", type: "checkbox", defaultValue: true },
                    {
                      name: "roles",
                      type: "select",
                      hasMany: true,
                      options: [
                        { label: "Order Confirmation", value: "order_confirmation" },
                        { label: "Password Reset", value: "password_reset" },
                        { label: "Marketing", value: "marketing" },
                        { label: "COD OTP", value: "cod_otp" },
                        { label: "Tracking Updates", value: "tracking_update" },
                        { label: "Invoice Delivery", value: "invoice_delivery" },
                        { label: "Abandoned Cart", value: "abandoned_cart" },
                      ],
                      defaultValue: ["order_confirmation", "password_reset", "cod_otp", "tracking_update", "invoice_delivery"],
                    },
                  ],
                },
                {
                  name: "resend",
                  type: "group",
                  fields: [
                    { name: "enabled", type: "checkbox", defaultValue: false },
                    {
                      name: "roles",
                      type: "select",
                      hasMany: true,
                      options: [
                        { label: "Order Confirmation", value: "order_confirmation" },
                        { label: "Password Reset", value: "password_reset" },
                        { label: "Marketing", value: "marketing" },
                        { label: "COD OTP", value: "cod_otp" },
                        { label: "Tracking Updates", value: "tracking_update" },
                        { label: "Invoice Delivery", value: "invoice_delivery" },
                        { label: "Abandoned Cart", value: "abandoned_cart" },
                      ],
                      defaultValue: [],
                    },
                  ],
                },
                {
                  name: "whatsapp",
                  type: "group",
                  fields: [
                    { name: "enabled", type: "checkbox", defaultValue: false },
                    {
                      name: "roles",
                      type: "select",
                      hasMany: true,
                      options: [
                        { label: "Order Confirmation", value: "order_confirmation" },
                        { label: "Password Reset", value: "password_reset" },
                        { label: "Marketing", value: "marketing" },
                        { label: "COD OTP", value: "cod_otp" },
                        { label: "Tracking Updates", value: "tracking_update" },
                        { label: "Invoice Delivery", value: "invoice_delivery" },
                        { label: "Abandoned Cart", value: "abandoned_cart" },
                      ],
                      defaultValue: ["cod_otp", "tracking_update"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ✅ ENTERPRISE DEBUG: Log settings when loaded
console.log("🔍 [Settings] Media Provider will be loaded from database.");
console.log("🔍 [Settings] Available options: imgbb, cloudflare-r2");