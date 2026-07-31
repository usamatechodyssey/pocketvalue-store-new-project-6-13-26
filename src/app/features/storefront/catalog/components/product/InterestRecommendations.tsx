// "use client";

// import { useEffect, useState, useMemo, useRef } from "react";
// import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
// import SanityProduct from "@/types";
// import ProductCardSkeleton from "./ProductCardSkeleton";
// import ProductCard from "./ProductCard";
// import { Sparkles, ArrowRight } from "lucide-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";

// interface InterestRecommendationsProps {
//   history: SimplifiedRecentProduct[];
//   currentProductId: string;
//   isLoaded: boolean;
// }

// // Simple client-side cache to prevent duplicate API calls
// const recommendationCache = new Map<string, SanityProduct[]>();

// export default function InterestRecommendations({
//   history,
//   currentProductId,
//   isLoaded,
// }: InterestRecommendationsProps) {
//   const [products, setProducts] = useState<SanityProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const cacheKeyRef = useRef<string>("");

//   // Extract category slugs from history (Unique elements)
//   const categorySlugs = useMemo(() => {
//     const slugsSet = new Set<string>();
//     history.forEach((product) => {
//       product.categorySlugs.forEach((slug) => slugsSet.add(slug));
//     });
//     return Array.from(slugsSet);
//   }, [history]);

//   // Fetch Personalized Recommendations based on category slugs
//   useEffect(() => {
//     if (!isLoaded || categorySlugs.length === 0) {
//       setProducts([]);
//       return;
//     }

//     const cacheKey = categorySlugs.sort().join(",");
//     cacheKeyRef.current = cacheKey;

//     // Check cache first
//     if (recommendationCache.has(cacheKey)) {
//       const cached = recommendationCache.get(cacheKey) || [];
//       setProducts(cached.filter((p) => p._id !== currentProductId).slice(0, 10));
//       return;
//     }

//     async function fetchPersonalized() {
//       setIsLoading(true);
//       try {
//         const response = await fetch("/api/filter", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             context: { type: "interest" },
//             filters: {
//               categories: categorySlugs,
//             },
//             page: 1,
//           }),
//         });

//         if (response.ok) {
//           const data = await response.json();
//           const fetchedProducts = data.products as SanityProduct[] || [];
//           recommendationCache.set(cacheKey, fetchedProducts);
//           const filtered = fetchedProducts.filter(
//             (p) => p._id !== currentProductId
//           );
//           setProducts(filtered.slice(0, 10));
//         }
//       } catch (err) {
//         console.error("Personalized recommendation failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchPersonalized();
//   }, [categorySlugs, currentProductId, isLoaded]);

//   if (!isLoaded || categorySlugs.length === 0) return null;

//   if (isLoading) {
//     return (
//       <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
//         <div className="h-6 w-56 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//           {[...Array(5)].map((_, i) => (
//             <ProductCardSkeleton key={i} />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (products.length === 0) return null;

//   return (
//     <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
//       <div className="flex justify-between items-end mb-6">
//         <div>
//           <h3 className="text-xl md:text-2xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
//             <Sparkles className="text-brand-primary" size={20} /> Recommended For You
//           </h3>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Personalized styles tailored specifically to your browsing interests.
//           </p>
//         </div>
//       </div>

//       {/* ✅ FIX: Added accessibility attributes */}
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
//         aria-label="Recommended products for you"
//         role="region"
//       >
//         {products.map((product, index) => (
//           <SwiperSlide key={product._id} className="h-auto">
//             <ProductCard 
//               product={product} 
//               className="h-full"
//               rank={index + 1}
//               isRecommendation={true}
//             />
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
import SanityProduct from "@/types";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductCard from "./ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface InterestRecommendationsProps {
  history: SimplifiedRecentProduct[];
  currentProductId: string;
  isLoaded: boolean;
}

// Simple client-side cache to prevent duplicate API calls
const recommendationCache = new Map<string, SanityProduct[]>();

export default function InterestRecommendations({
  history,
  currentProductId,
  isLoaded,
}: InterestRecommendationsProps) {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheKeyRef = useRef<string>("");

  // Extract category slugs from history (Unique elements)
  const categorySlugs = useMemo(() => {
    const slugsSet = new Set<string>();
    history.forEach((product) => {
      product.categorySlugs.forEach((slug) => slugsSet.add(slug));
    });
    return Array.from(slugsSet);
  }, [history]);

  // Fetch Personalized Recommendations based on category slugs
  useEffect(() => {
    if (!isLoaded || categorySlugs.length === 0) {
      setProducts([]);
      return;
    }

    // ✅ FIX: Use spread operator to avoid mutating the original array
    const cacheKey = [...categorySlugs].sort().join(",");
    cacheKeyRef.current = cacheKey;

    // Check cache first
    if (recommendationCache.has(cacheKey)) {
      const cached = recommendationCache.get(cacheKey) || [];
      setProducts(cached.filter((p) => p._id !== currentProductId).slice(0, 10));
      return;
    }

    async function fetchPersonalized() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { type: "interest" },
            filters: {
              categories: categorySlugs,
            },
            page: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedProducts = data.products as SanityProduct[] || [];
          recommendationCache.set(cacheKey, fetchedProducts);
          const filtered = fetchedProducts.filter(
            (p) => p._id !== currentProductId
          );
          setProducts(filtered.slice(0, 10));
        }
      } catch (err) {
        console.error("Personalized recommendation failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonalized();
  }, [categorySlugs, currentProductId, isLoaded]);

  if (!isLoaded || categorySlugs.length === 0) return null;

  if (isLoading) {
    return (
      <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
        <div className="h-6 w-56 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-brand-primary" size={20} /> Recommended For You
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Personalized styles tailored specifically to your browsing interests.
          </p>
        </div>
      </div>

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
        aria-label="Recommended products for you"
        role="region"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product._id} className="h-auto">
            <ProductCard 
              product={product} 
              className="h-full"
              rank={index + 1}
              isRecommendation={true}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}