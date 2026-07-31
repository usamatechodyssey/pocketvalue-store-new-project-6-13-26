
// // src/app/components/home/builder/RenderSection.tsx
// import dynamic from "next/dynamic";
// import MasterBannerGrid from "./MasterBannerGrid"; // 🔥 Direct Import for LCP Speed

// // Lazy loaded components for better Performance
// const UniversalDealSection = dynamic(() => import("./UniversalDealSection"));
// const ProductCarousel = dynamic(() => import("../ProductCarousel"));
// const CategoryCarousel = dynamic(() => import("../CategoryCarousel"));
// const MobileCategoryList = dynamic(() => import("../MobileCategoryList"));
// const FeaturedCategoryGrid = dynamic(() => import("../FeaturedCategoryGrid"));
// const BrandShowcase = dynamic(() => import("../BrandShowcase"));
// const Coupon = dynamic(() => import("../../../../../../shared/components/ui/Coupon"));
// const TrustBar = dynamic(() => import("../TrustBar"));
// const FeaturesSection = dynamic(() => import("../FeaturesSection"));
// const InfiniteProductGrid = dynamic(() => import("../InfiniteProductGrid"));

// interface RenderSectionProps {
//   section: any;
// }

// export default function RenderSection({ section }: RenderSectionProps) {
//   // 🔥 FIX: Payload uses 'blockType' instead of '_type'
//   const type = section.blockType || section._type;
//   if (!section || !type) return null;

//   switch (type) {
//     case "bannerSection":
//       return <MasterBannerGrid {...section} />;

//     case "dealSection":
//       if (section.showSideBanner) {
//         return (
//           <ProductCarousel
//             title={section.title}
//             products={section.products}
//             banner={{
//               tag: "custom",
//               bannerImage: section.sideBanner?.image,
//               link: section.sideBanner?.link,
//             }}
//           />
//         );
//       }
//       return <UniversalDealSection data={section} />;

//     case "productShowcase":
//       const displayProducts = section.products || section.manualProducts;
//       if (section.showSideBanner) {
//         return (
//           <ProductCarousel
//             title={section.title}
//             products={displayProducts}
//             banner={{
//               tag: "custom",
//               bannerImage: section.sideBanner?.image,
//               link: section.sideBanner?.link,
//             }}
//           />
//         );
//       }
//       return (
//         <UniversalDealSection
//           data={{
//             ...section,
//             fetchStrategy: "manual",
//             viewType: "slider",
//             backgroundStyle: "white",
//             products: displayProducts,
//           }}
//         />
//       );

//     case "categoryShowcase":
//       return (
//         <section className="w-full">
//           <div className="hidden md:block text-center mb-8 px-8 max-w-480 mx-auto">
//             <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
//               {section.title || "SHOP BY CATEGORY"}
//             </h2>
//           </div>
//           <div className="md:hidden">
//             <MobileCategoryList categories={section.categories} />
//           </div>
//           <div className="hidden md:block">
//             <CategoryCarousel categories={section.categories} title="" />
//           </div>
//         </section>
//       );

//     case "categoryGrid":
//       return (
//         <FeaturedCategoryGrid
//           title={section.title}
//           categories={section.items}
//         />
//       );

//     case "couponSection":
//       return (
//         <div
//           className={
//             section.fullWidth
//               ? "w-full"
//               : "px-4 md:px-8 pt-8 w-full max-w-480 mx-auto"
//           }
//         >
//           <Coupon bannerData={section.couponReference} />
//         </div>
//       );

//     case "brandSection":
//       return <BrandShowcase brands={section.manualBrands} />;

//     case "layoutSection":
//       if (section.type === "trust") return <TrustBar />;
//       if (section.type === "newsletter") return <FeaturesSection />;
//       if (section.type === "infiniteGrid") {
//         return (
//           <div className="px-0 md:px-8 w-full max-w-480 mx-auto pb-20">
//             <InfiniteProductGrid
//               initialProducts={section.initialProducts || []}
//             />
//           </div>
//         );
//       }
//       return null;

//     default:
//       return null;
//   }
// }
// // src/app/components/home/builder/RenderSection.tsx

// import dynamic from "next/dynamic";
// import MasterBannerGrid from "./MasterBannerGrid"; // 🔥 Direct Import for LCP Speed

// // Lazy loaded components for better Performance
// const UniversalDealSection = dynamic(() => import("./UniversalDealSection"));
// const ProductCarousel = dynamic(() => import("../ProductCarousel"));
// const CategoryCarousel = dynamic(() => import("../CategoryCarousel"));
// const MobileCategoryList = dynamic(() => import("../MobileCategoryList"));
// const FeaturedCategoryGrid = dynamic(() => import("../FeaturedCategoryGrid"));
// const BrandShowcase = dynamic(() => import("../BrandShowcase"));
// const Coupon = dynamic(() => import("../../../../../../shared/components/ui/Coupon"));
// const TrustBar = dynamic(() => import("../TrustBar"));
// const FeaturesSection = dynamic(() => import("../FeaturesSection"));
// const InfiniteProductGrid = dynamic(() => import("../InfiniteProductGrid"));

// interface RenderSectionProps {
//   section: any;
//   lowStockThreshold: number; // ✅ NEW PROP (passed from homepage)
// }

// export default function RenderSection({ section, lowStockThreshold }: RenderSectionProps) {
//   // 🔥 FIX: Payload uses 'blockType' instead of '_type'
//   const type = section.blockType || section._type;
//   if (!section || !type) return null;

//   switch (type) {
//     case "bannerSection":
//       return <MasterBannerGrid {...section} />;

//     case "dealSection":
//       if (section.showSideBanner) {
//         return (
//           <ProductCarousel
//             title={section.title}
//             products={section.products}
//             banner={{
//               tag: "custom",
//               bannerImage: section.sideBanner?.image,
//               link: section.sideBanner?.link,
//             }}
//             lowStockThreshold={lowStockThreshold} // ✅ PASS
//           />
//         );
//       }
//       return (
//         <UniversalDealSection
//           data={section}
//           lowStockThreshold={lowStockThreshold} // ✅ PASS
//         />
//       );

//     case "productShowcase":
//       const displayProducts = section.products || section.manualProducts;
//       if (section.showSideBanner) {
//         return (
//           <ProductCarousel
//             title={section.title}
//             products={displayProducts}
//             banner={{
//               tag: "custom",
//               bannerImage: section.sideBanner?.image,
//               link: section.sideBanner?.link,
//             }}
//             lowStockThreshold={lowStockThreshold} // ✅ PASS
//           />
//         );
//       }
//       return (
//         <UniversalDealSection
//           data={{
//             ...section,
//             fetchStrategy: "manual",
//             viewType: "slider",
//             backgroundStyle: "white",
//             products: displayProducts,
//           }}
//           lowStockThreshold={lowStockThreshold} // ✅ PASS
//         />
//       );

//     case "categoryShowcase":
//       return (
//         <section className="w-full">
//           <div className="hidden md:block text-center mb-8 px-8 max-w-480 mx-auto">
//             <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
//               {section.title || "SHOP BY CATEGORY"}
//             </h2>
//           </div>
//           <div className="md:hidden">
//             <MobileCategoryList categories={section.categories} />
//           </div>
//           <div className="hidden md:block">
//             <CategoryCarousel categories={section.categories} title="" />
//           </div>
//         </section>
//       );

//     case "categoryGrid":
//       return (
//         <FeaturedCategoryGrid
//           title={section.title}
//           categories={section.items}
//         />
//       );

//     case "couponSection":
//       return (
//         <div
//           className={
//             section.fullWidth
//               ? "w-full"
//               : "px-4 md:px-8 pt-8 w-full max-w-480 mx-auto"
//           }
//         >
//           <Coupon bannerData={section.couponReference} />
//         </div>
//       );

//     case "brandSection":
//       return <BrandShowcase brands={section.manualBrands} />;

//     case "layoutSection":
//       if (section.type === "trust") return <TrustBar />;
//       if (section.type === "newsletter") return <FeaturesSection />;
//       if (section.type === "infiniteGrid") {
//         return (
//           <div className="px-0 md:px-8 w-full max-w-480 mx-auto pb-20">
//             <InfiniteProductGrid
//               initialProducts={section.initialProducts || []}
//               lowStockThreshold={lowStockThreshold} // ✅ PASS
//             />
//           </div>
//         );
//       }
//       return null;

//     default:
//       return null;
//   }
// }
// src/app/components/home/builder/RenderSection.tsx

import dynamic from "next/dynamic";
import MasterBannerGrid from "./MasterBannerGrid"; // 🔥 Direct Import for LCP Speed

// Lazy loaded components for better Performance
const UniversalDealSection = dynamic(() => import("./UniversalDealSection"));
const ProductCarousel = dynamic(() => import("../ProductCarousel"));
const CategoryCarousel = dynamic(() => import("../CategoryCarousel"));
const MobileCategoryList = dynamic(() => import("../MobileCategoryList"));
const FeaturedCategoryGrid = dynamic(() => import("../FeaturedCategoryGrid"));
const BrandShowcase = dynamic(() => import("../BrandShowcase"));
const Coupon = dynamic(() => import("../../../../../../shared/components/ui/Coupon"));
const TrustBar = dynamic(() => import("../TrustBar"));
const FeaturesSection = dynamic(() => import("../FeaturesSection"));
const InfiniteProductGrid = dynamic(() => import("../InfiniteProductGrid"));

interface RenderSectionProps {
  section: any;
  lowStockThreshold: number;
}

export default function RenderSection({ section, lowStockThreshold }: RenderSectionProps) {
  // 🔥 FIX: Payload uses 'blockType' instead of '_type'
  const type = section.blockType || section._type;

  // ✅ Debug: Log incoming section
  console.log("🔍 [RenderSection] Received section:", {
    type,
    sectionKeys: Object.keys(section),
    lowStockThreshold,
  });

  if (!section || !type) {
    console.warn("🔍 [RenderSection] No section or type found, returning null");
    return null;
  }

  switch (type) {
    case "bannerSection": {
      console.log("🔍 [RenderSection] Rendering bannerSection");
      return <MasterBannerGrid {...section} />;
    }

    case "dealSection": {
      console.log("🔍 [RenderSection] Rendering dealSection:", section.title);
      if (section.showSideBanner) {
        return (
          <ProductCarousel
            title={section.title}
            products={section.products}
            banner={{
              tag: "custom",
              bannerImage: section.sideBanner?.image,
              link: section.sideBanner?.link,
            }}
            lowStockThreshold={lowStockThreshold}
          />
        );
      }
      return (
        <UniversalDealSection
          data={section}
          lowStockThreshold={lowStockThreshold}
        />
      );
    }

    case "productShowcase": {
      console.log("🔍 [RenderSection] Rendering productShowcase:", section.title);
      const displayProducts = section.products || section.manualProducts;
      console.log(`🔍 [RenderSection] Product count: ${displayProducts?.length || 0}`);
      if (section.showSideBanner) {
        return (
          <ProductCarousel
            title={section.title}
            products={displayProducts}
            banner={{
              tag: "custom",
              bannerImage: section.sideBanner?.image,
              link: section.sideBanner?.link,
            }}
            lowStockThreshold={lowStockThreshold}
          />
        );
      }
      return (
        <UniversalDealSection
          data={{
            ...section,
            fetchStrategy: "manual",
            viewType: "slider",
            backgroundStyle: "white",
            products: displayProducts,
          }}
          lowStockThreshold={lowStockThreshold}
        />
      );
    }

    case "categoryShowcase": {
      console.log("🔍 [RenderSection] Rendering categoryShowcase:", section.title);
      console.log(`🔍 [RenderSection] Categories count: ${section.categories?.length || 0}`);
      return (
        <section className="w-full">
          <div className="hidden md:block text-center m-8 px-8 max-w-480 mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {section.title || "SHOP BY CATEGORY"}
            </h2>
          </div>
          <div className="md:hidden">
            <MobileCategoryList categories={section.categories} />
          </div>
          <div className="hidden md:block">
            <CategoryCarousel categories={section.categories} title="" />
          </div>
        </section>
      );
    }

    case "categoryGrid": {
      console.log("🔍 [RenderSection] Rendering categoryGrid:", section.title);
      console.log(`🔍 [RenderSection] Items count: ${section.items?.length || 0}`);
      return (
        <FeaturedCategoryGrid
          title={section.title}
          categories={section.items}
        />
      );
    }

    case "couponSection": {
      console.log("🔍 [RenderSection] Rendering couponSection");
      return (
        <div
          className={
            section.fullWidth
              ? "w-full"
              : "px-4 md:px-8 pt-8 w-full max-w-480 mx-auto"
          }
        >
          <Coupon bannerData={section.couponReference} />
        </div>
      );
    }

    case "brandSection": {
      console.log("🔍 [RenderSection] Rendering brandSection");
      console.log(`🔍 [RenderSection] Brands count: ${section.manualBrands?.length || 0}`);
      return <BrandShowcase brands={section.manualBrands} />;
    }

    // ================================================================
    // ✅ ENTERPRISE UPGRADE: LAYOUT SECTION (Infinite Grid)
    // ================================================================
    case "layoutSection": {
      console.log("🔍 [RenderSection] Rendering layoutSection:", section.type);

      if (section.type === "trust") {
        console.log("🔍 [RenderSection] Rendering TrustBar");
        return <TrustBar />;
      }

      if (section.type === "newsletter") {
        console.log("🔍 [RenderSection] Rendering FeaturesSection");
        return <FeaturesSection />;
      }

      if (section.type === "infiniteGrid") {
        console.log("🔍 [RenderSection] Rendering InfiniteProductGrid");

        // ✅ Read admin fields from section (populated by homepage.queries.ts)
        const {
          sourceType = "deals",
          categorySlug,
          searchTerm,
          sortOrder = "best-selling",
          limit = 40,
          viewAllLink = "/search",
          showViewAll = true,
          initialProducts = [],
          totalCount = 0,
        } = section;

        console.log(`🔍 [RenderSection] InfiniteGrid Config:`, {
          sourceType,
          categorySlug,
          searchTerm,
          sortOrder,
          limit,
          viewAllLink,
          showViewAll,
          initialProductsCount: initialProducts.length,
          totalCount,
        });

        // ✅ Build context object for API calls
        let context: {
          type: "category" | "search" | "deals";
          value?: string;
          sort?: string;
          filter?: string;
        } = {
          type: "deals",
          sort: sortOrder,
        };

        if (sourceType === "category" && categorySlug) {
          context = { type: "category", value: categorySlug, sort: sortOrder };
        } else if (sourceType === "search" && searchTerm) {
          context = { type: "search", value: searchTerm, sort: sortOrder };
        } else if (sourceType === "deals") {
          context = { type: "deals", sort: sortOrder };
        } else if (sourceType === "manual") {
          // Manual products: use search context but they are already fetched
          context = { type: "search", sort: sortOrder };
        }

        // ✅ Pass all props to InfiniteProductGrid
        return (
          <InfiniteProductGrid
            initialProducts={initialProducts}
            totalCount={totalCount}
            lowStockThreshold={lowStockThreshold}
            context={context}
            filters={{}}
            priceRange={undefined}
            limit={limit}
            viewAllLink={viewAllLink}
            showViewAll={showViewAll}
          />
        );
      }

      console.warn("🔍 [RenderSection] Unknown layoutSection type:", section.type);
      return null;
    }

    default: {
      console.warn("🔍 [RenderSection] Unknown block type:", type);
      return null;
    }
  }
}