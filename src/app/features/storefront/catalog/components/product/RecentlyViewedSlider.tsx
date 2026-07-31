// "use client";

// import { useEffect, useState } from "react";
// import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
// import ProductCardSkeleton from "./ProductCardSkeleton";
// import ProductCard from "./ProductCard"; // ✅ Aapka official ProductCard Import ho gaya
// import { History } from "lucide-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
// import SanityProduct from "@/types";
// import "swiper/css";
// import "swiper/css/pagination";

// interface RecentlyViewedSliderProps {
//   history: SimplifiedRecentProduct[];
//   currentProductSlug: string;
//   isLoaded: boolean;
// }

// export default function RecentlyViewedSlider({
//   history,
//   currentProductSlug,
//   isLoaded,
// }: RecentlyViewedSliderProps) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Filter out the product currently being viewed
//   const displayHistory = history.filter((item) => item.slug !== currentProductSlug);

//   if (!mounted || !isLoaded) {
//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
//         {[...Array(5)].map((_, i) => (
//           <ProductCardSkeleton key={i} />
//         ))}
//       </div>
//     );
//   }

//   if (displayHistory.length === 0) return null;

//   return (
//     <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
//       <div className="flex justify-between items-end mb-6">
//         <div>
//           <h3 className="text-xl md:text-2xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
//             <History className="text-brand-primary" size={20} /> Recently Viewed Items
//           </h3>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Items you have previously browsed.
//           </p>
//         </div>
//       </div>

//       <Swiper
//         modules={[Pagination]}
//         spaceBetween={16}
//         slidesPerView={2}
//         pagination={{ clickable: true, dynamicBullets: true }}
//         breakpoints={{
//           640: { slidesPerView: 3 },
//           768: { slidesPerView: 4 },
//           1024: { slidesPerView: 5 },
//         }}
//         className="w-full pb-8"
//       >
//         {displayHistory.map((item) => {
//           // 🔥 THE MAGIC: Structuring local storage data as a valid lightweight SanityProduct
//           const mockProductForCard: SanityProduct = {
//             _id: item._id,
//             _createdAt: new Date().toISOString(),
//             title: item.title,
//             slug: item.slug,
//             variants: [],
//             defaultVariant: {
//               _key: "default-recent",
//               name: "Default",
//               price: item.price,
//               salePrice: item.salePrice,
//               inStock: true,
//               images: item.image ? [item.image] : [],
//               attributes: [],
//             },
//           } as unknown as SanityProduct;

//           return (
//             <SwiperSlide key={item._id} className="h-auto">
//               {/* ✅ Standard unified card view everywhere */}
//               <ProductCard product={mockProductForCard} className="h-full" />
//             </SwiperSlide>
//           );
//         })}
//       </Swiper>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductCard from "./ProductCard";
import { History } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import SanityProduct from "@/types";
import "swiper/css";
import "swiper/css/pagination";

interface RecentlyViewedSliderProps {
  history: SimplifiedRecentProduct[];
  currentProductSlug: string;
  isLoaded: boolean;
}

export default function RecentlyViewedSlider({
  history,
  currentProductSlug,
  isLoaded,
}: RecentlyViewedSliderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out the product currently being viewed
  const displayHistory = history.filter((item) => item.slug !== currentProductSlug);

  if (!mounted || !isLoaded) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {[...Array(5)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (displayHistory.length === 0) return null;

  return (
    <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="text-brand-primary" size={20} /> Recently Viewed Items
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Items you have previously browsed.
          </p>
        </div>
      </div>

      {/* ✅ FIX: Added aria-label + role for accessibility */}
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={2}
        pagination={{ clickable: true, dynamicBullets: true }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="w-full pb-8"
        aria-label="Recently viewed products"
        role="region"
      >
        {displayHistory.map((item) => {
          // 🔥 Structuring local storage data as a valid lightweight SanityProduct
          const mockProductForCard: SanityProduct = {
            _id: item._id,
            _createdAt: new Date().toISOString(),
            title: item.title,
            slug: item.slug,
            variants: [],
            defaultVariant: {
              _key: "default-recent",
              name: "Default",
              price: item.price,
              salePrice: item.salePrice,
              inStock: true,
              images: item.image ? [item.image] : [],
              attributes: [],
            },
          } as unknown as SanityProduct;

          return (
            <SwiperSlide key={item._id} className="h-auto">
              <ProductCard product={mockProductForCard} className="h-full" />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}