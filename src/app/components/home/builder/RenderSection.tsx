// //RenderSection.tsx
// // === RENDER SECTION COMPONENT ===
// import dynamic from "next/dynamic";

// // 🔥 PERFORMANCE FIX 1: MasterBannerGrid ko Direct Import karein (For LCP Speed)
// import MasterBannerGrid from "./MasterBannerGrid";

// // Baaki sections lazy load hi rahenge (Performance Bachane ke liye)
// const UniversalDealSection = dynamic(() => import("./UniversalDealSection"));
// const ProductCarousel = dynamic(() => import("../ProductCarousel"));
// const CategoryCarousel = dynamic(() => import("../CategoryCarousel"));
// const MobileCategoryList = dynamic(() => import("../MobileCategoryList"));
// const FeaturedCategoryGrid = dynamic(() => import("../FeaturedCategoryGrid"));
// const BrandShowcase = dynamic(() => import("../BrandShowcase"));
// const Coupon = dynamic(() => import("../../ui/Coupon"));
// const TrustBar = dynamic(() => import("../TrustBar"));
// const FeaturesSection = dynamic(() => import("../FeaturesSection"));
// const InfiniteProductGrid = dynamic(() => import("../InfiniteProductGrid"));

// interface RenderSectionProps {
//   section: any;
// }

// export default function RenderSection({ section }: RenderSectionProps) {
//   if (!section || !section._type) return null;

//   switch (section._type) {
//     // === 1. BANNER GRID ===
//     case "bannerSection":
//       // Yeh ab foran render hoga bina delay ke
//       return <MasterBannerGrid {...section} />;

//     // === 2. DEAL SECTION (SMART SWITCH) ===
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

//     // === 3. PRODUCT SHOWCASE (SMART SWITCH) ===
//     case "productShowcase":
//       if (section.showSideBanner) {
//         return (
//           <ProductCarousel
//             title={section.title}
//             products={section.products || section.manualProducts}
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
//             products: section.products || section.manualProducts,
//           }}
//         />
//       );

//     case "categoryShowcase":
//       return (
//         <section className="w-full">
//           <div className="hidden md:block text-center mb-8 px-8 max-w-480 mx-auto">
//               <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
//                 {section.title || "SHOP BY CATEGORY"}
//               </h2>
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
//       // 🔥 FIX YAHAN HAI: section.couponReference (jo Payload se aya) usay Coupon component ko prop mein diya
//       return (
//         <div
//           className={
//             section.fullWidth
//               ? "w-full"
//               : "px-4 md:px-8 pt-8 w-full max-w-480 mx-auto"
//           }
//         >
//            {/* ✅ Pass data as props */}
//            <Coupon bannerData={section.couponReference} />
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
const Coupon = dynamic(() => import("../../ui/Coupon"));
const TrustBar = dynamic(() => import("../TrustBar"));
const FeaturesSection = dynamic(() => import("../FeaturesSection"));
const InfiniteProductGrid = dynamic(() => import("../InfiniteProductGrid"));

interface RenderSectionProps {
  section: any;
}

export default function RenderSection({ section }: RenderSectionProps) {
  // 🔥 FIX: Payload uses 'blockType' instead of '_type'
  const type = section.blockType || section._type;
  if (!section || !type) return null;

  switch (type) {
    case "bannerSection":
      return <MasterBannerGrid {...section} />;

    case "dealSection":
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
          />
        );
      }
      return <UniversalDealSection data={section} />;

    case "productShowcase":
      const displayProducts = section.products || section.manualProducts;
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
        />
      );

    case "categoryShowcase":
      return (
        <section className="w-full">
          <div className="hidden md:block text-center mb-8 px-8 max-w-480 mx-auto">
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

    case "categoryGrid":
      return (
        <FeaturedCategoryGrid
          title={section.title}
          categories={section.items}
        />
      );

    case "couponSection":
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

    case "brandSection":
      return <BrandShowcase brands={section.manualBrands} />;

    case "layoutSection":
      if (section.type === "trust") return <TrustBar />;
      if (section.type === "newsletter") return <FeaturesSection />;
      if (section.type === "infiniteGrid") {
        return (
          <div className="px-0 md:px-8 w-full max-w-480 mx-auto pb-20">
            <InfiniteProductGrid
              initialProducts={section.initialProducts || []}
            />
          </div>
        );
      }
      return null;

    default:
      return null;
  }
}
