// 📂 src/sanity/lib/payload/types/GlobalSettings.ts

export interface GlobalSettings {
  // ================================================================
  // 📦 GENERAL INFO
  // ================================================================
  siteName?: string;
  siteLogo?: any;
  storeContactEmail?: string;
  storePhoneNumber?: string;
  storeAddress?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };

  // ================================================================
  // 📢 PROMOTIONS & BANNERS
  // ================================================================
  topBarAnnouncements?: string[];

  // ================================================================
  // 🧭 NAVIGATION & MENUS
  // ================================================================
  secondaryNavLinks?: {
    label: string;
    url: string;
    position: "left" | "right";
    isHighlight: boolean;
  }[];

  // ================================================================
  // 📦 SHIPPING
  // ================================================================
  shippingRules?: {
    name: string;
    minAmount: number;
    cost: number;
    isOnCall?: boolean;
  }[];
  shippingCost?: number;

  // ================================================================
  // 📦 INVENTORY
  // ================================================================
  inventorySettings?: {
    lowStockThreshold?: number;
    alertRecipientEmail?: string;
  };

  // ================================================================
  // 🔍 SEARCH SUGGESTIONS
  // ================================================================
  searchSettings?: {
    trendingKeywords?: string[];
    popularCategories?: {
      _id: string;
      name: string;
      slug: string;
      image?: string;
      parent?: { _id: string } | null;
    }[];
  };

  // ================================================================
  // 🧮 DYNAMIC PRICING LOGIC
  // ================================================================
  globalFixedFees?: {
    label: string;
    percentage: number;
  }[];
  pricingLogicTiers?: {
    minCost: number;
    maxCost: number;
    profitPercent: number;
    adSpendPercent: number;
    visualDiscount?: number;
  }[];
  taxSettings?: {
    standardGstPercent: number;
  };
  returnsSettings?: {
    estimatedReturnRatePercent: number;
  };
  pricingSettings?: {
    estimatedDutiesPercent: number;
  };

  // ================================================================
  // 🔮 SEO
  // ================================================================
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
 // ================================================================
// 🎨 MEDIA SETTINGS
// ================================================================
mediaProvider?: 'imgbb' | 'cloudflare-r2';
mediaDualUpload?: boolean;
mediaFetchMode?: 'imgbb' | 'r2' | 'both';
// ✅ ✅ ✅ NEW FIELD ADDED HERE ✅ ✅ ✅
cdnMode?: boolean; // If true, system stores direct URLs instead of uploading

  // ================================================================
  // 📊 FORECASTING
  // ================================================================
  forecasting?: {
    windowDays?: number;
    criticalThreshold?: number;
    highThreshold?: number;
    topLimit?: number;
  };

  // ================================================================
  // 🌍 GEOSPATIAL INTELLIGENCE
  // ================================================================
  geospatial?: {
    highPotentialRevenue: number;
    highPotentialRto: number;
    topCityLimit: number;
  };

  // ================================================================
  // ⚙️ OPERATIONAL INTELLIGENCE
  // ================================================================
  operational?: {
    limboRevenueThreshold: number;
    autoRefreshInterval: number;
  };

  // ================================================================
  // 🏭 WAREHOUSE LOGISTICS
  // ================================================================
  warehouse?: {
    locations?: {
      name: string;
      lat: number;
      lng: number;
      address?: string;
    }[];
  };

  // ================================================================
  // 📧 COMMUNICATION
  // ================================================================
  communication?: {
    mailjet?: {
      enabled: boolean;
      roles: string[];
    };
    resend?: {
      enabled: boolean;
      roles: string[];
    };
    whatsapp?: {
      enabled: boolean;
      roles: string[];
    };
  };

  // ================================================================
  // 🤝 LOYALTY, REFERRALS & VIP (UPGRADED)
  // ================================================================
  loyaltyEnabled?: boolean;
  referralLimitPerUser?: number;
  referralGoalTarget?: number;

  // Referral Milestones
  referralMilestones?: {
    requiredConversions: number;
    rewardLabel: string;
    discountType: "percentage" | "fixed" | "freeShipping";
    discountValue: number;
    maximumDiscount?: number;
  }[];

  // VIP Shopping Milestones
  vipShoppingMilestones?: {
    requiredSpend: number;
    rewardLabel: string;
    discountType: "percentage" | "fixed" | "freeShipping";
    discountValue: number;
    maximumDiscount?: number;
  }[];

  // Default Coupon Settings
  couponDefaultExpiryDays?: number;
  couponDefaultUsageLimit?: number;
  couponIsStackable?: boolean;

  // ================================================================
  // 🆕 PHASE 2.2: INACTIVE CUSTOMER REACTIVATION
  // ================================================================
  inactiveDaysThreshold?: number;
  highValueInactiveThreshold?: number;
  reactivationEmailTemplate?: string;

  // ================================================================
  // 🆕 PHASE 2.3: SEGMENT BUILDER
  // ================================================================
  segmentBuilderEnabled?: boolean;

  
}