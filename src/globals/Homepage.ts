import type { GlobalConfig } from "payload";

// ✅ Saare 8 Blocks yahan import karein
import { BannerSection } from ".././sanity/lib/payload/blocks/BannerSection";
import { DealSection } from ".././sanity/lib/payload/blocks/DealSection";
import { ProductShowcase } from ".././sanity/lib/payload/blocks/ProductShowcase";
import { CategoryShowcase } from ".././sanity/lib/payload/blocks/CategoryShowcase";
import { CategoryGrid } from ".././sanity/lib/payload/blocks/CategoryGrid";
import { CouponSection } from ".././sanity/lib/payload/blocks/CouponSection";
import { BrandSection } from ".././sanity/lib/payload/blocks/BrandSection";
import { LayoutSection } from ".././sanity/lib/payload/blocks/LayoutSection"; // Yeh block thoda alag folder mein hai, isliye path adjust kiya

import { SEO } from "../fields/SEO"; // ✅ SEO field import karein

export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: {
    group: "Content", // Admin panel mein Content group ke andar dikhega
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      defaultValue: "Homepage Configuration",
      admin: {
        readOnly: true,
      },
    },
    // 🔥 FIX: SEO Field yahan add karni hai taake ye Global mein save ho
    SEO,
    // 🔥 THE MAGIC HAPPENS HERE: Payload Blocks Field
    {
      name: "pageSections",
      type: "blocks",
      label: "Page Builder Sections",
      admin: {
        description: "Build your homepage by adding and dragging these blocks.",
      },
      minRows: 1,
      blocks: [
        BannerSection,
        DealSection,
        ProductShowcase,
        CategoryShowcase,
        CategoryGrid,
        CouponSection,
        BrandSection,
        LayoutSection,
      ],
    },

    // ============================================================
    // ⚠️ LEGACY FIELDS (Sanity Compatibility)
    // Agar aapka frontend abhi bhi in purani fields par depend karta hai
    // ============================================================
    {
      type: "collapsible",
      label: "Legacy / Old Settings",
      admin: {
        initCollapsed: true, // Shuru mein band rahega taake UI clean lage
      },
      fields: [
        {
          name: "featuredProductsTitle",
          type: "text",
          defaultValue: "Featured Products",
        },
        {
          name: "featuredProducts",
          type: "relationship",
          relationTo: "products",
          hasMany: true,
        },
        {
          name: "featuredCategoriesTitle",
          type: "text",
          defaultValue: "Shop By Category",
        },
        {
          name: "featuredCategories",
          type: "relationship",
          relationTo: "categories",
          hasMany: true,
        },
      ],
    },
  ],
};
