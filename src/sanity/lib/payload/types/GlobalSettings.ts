export interface GlobalSettings {
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
  topBarAnnouncements?: string[];
  secondaryNavLinks?: {
    label: string;
    url: string;
    position: "left" | "right";
    isHighlight: boolean;
  }[];
  inventorySettings?: {
    lowStockThreshold?: number;
    alertRecipientEmail?: string;
  };
  searchSettings?: {
    trendingKeywords?: string[];
    popularCategories?: {
      _id: string;
      name: string;
      slug: string;
      image?: string;
      parent?: any;
      subCategories?: any[];
    }[];
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}
