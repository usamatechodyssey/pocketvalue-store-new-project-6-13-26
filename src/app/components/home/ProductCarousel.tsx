
// // /src/app/components/home/ProductCarousel.tsx (FIXED)

// "use client";

// import { useState, useEffect } from "react";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import SanityProduct from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";
// import ProductCard from "@/app/components/product/ProductCard";
// import QuickViewModal from "@/app/components/product/QuickViewModal";
// import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton"; 

// // --- Interfaces ---
// interface Banner {
//   tag?: string;
//   bannerImage: any;
//   link?: string;
// }

// interface ProductCarouselProps {
//   title?: string;
//   products: SanityProduct[];
//   banner?: Banner;
//   viewAllLink?: string;
//   hideHeader?: boolean;
// }

// // --- Animation Plugin ---
// const AnimationPlugin = (slider: any) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   let mouseOver = false;
//   function clearNextTimeout() { clearTimeout(timeout); }
//   function nextTimeout() {
//     clearTimeout(timeout);
//     if (mouseOver) return;
//     timeout = setTimeout(() => { slider.next(); }, 3000);
//   }
//   slider.on("created", nextTimeout);
//   slider.on("dragStarted", clearNextTimeout);
//   slider.on("animationEnded", nextTimeout);
//   slider.on("updated", nextTimeout);
//   slider.on("destroyed", clearNextTimeout);
//   slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
//   slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
// };

// // --- Main Component ---
// export default function ProductCarousel({
//   title,
//   products,
//   banner,
//   viewAllLink = "/search",
//   hideHeader = false,
// }: ProductCarouselProps) {
//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
//   const [loaded, setLoaded] = useState(false);

//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
//     {
//       created: () => setLoaded(true),
//       loop: products.length > 3,
//       mode: "snap",
//       slides: { perView: 2, spacing: 0 }, 
//       breakpoints: {
//         "(min-width: 768px)": { slides: { perView: 3, spacing: 0 } }, 
//         "(min-width: 1024px)": { slides: { perView: "auto", spacing: 0 } }, 
//       },
//     },
//     [AnimationPlugin]
//   );

//   useEffect(() => {
//     if (loaded && instanceRef.current) {
//       instanceRef.current.update();
//     }
//   }, [loaded, instanceRef, products]);

//   if (!products || products.length === 0) return null;

//   // Link Logic
//   let finalViewAllLink = viewAllLink;
//   if (title && viewAllLink === "/search") {
//     const lowerTitle = title.toLowerCase();
//     if (lowerTitle.includes("new")) finalViewAllLink = "/search?sort=newest";
//     else if (lowerTitle.includes("best")) finalViewAllLink = "/search?sort=best-selling";
//     else if (lowerTitle.includes("featured")) finalViewAllLink = "/search?filter=isFeatured";
//   }

//   return (
//     <section className="w-full py-10 md:py-12 bg-white dark:bg-gray-950">
//       <div className="max-w-480 mx-auto">
//         <div className="px-4 md:px-8">
//           {!hideHeader && title && (
//             <div className="flex items-end justify-between mb-8 gap-4">
//               <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
//                 {title}
//               </h2>
//               <Link
//                 href={finalViewAllLink}
//                 className="group flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-brand-primary hover:text-brand-secondary transition-all"
//               >
//                 View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col xl:flex-row items-stretch">
//           {banner && banner.bannerImage && (
//             <div className="hidden xl:block shrink-0 w-70 relative group overflow-hidden z-20">
//               <Link href={banner.link || "#"} className="block w-full h-full relative">
//                 <Image 
//                   src={urlFor(banner.bannerImage).url()} 
//                   alt={title || "Banner"} 
//                   fill 
//                   className="object-cover transition-transform duration-700 group-hover:scale-105"
//                   sizes="(max-width: 1280px) 100vw, 280px" 
//                 />
//                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
//               </Link>
//             </div>
//           )}

//           <div className="relative flex-1 min-w-0 group/slider z-10">
//             <div ref={sliderRef} className="keen-slider h-full flex">
//               {products.map((product, index) => (
//                 <div
//                   key={product._id || index}
//                   className={`
//                     keen-slider__slide h-full px-1
//                     min-w-[50%] max-w-[50%]                 
//                     md:min-w-[33.333%] md:max-w-[33.333%]   
//                     lg:min-w-55 lg:max-w-70       
//                   `}
//                 >
//                   {!loaded ? (
//                     <ProductCardSkeleton />
//                   ) : (
//                     <ProductCard product={product} onQuickView={setQuickViewProduct} />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* 
//                 --- FIX HERE ---
//                 Ref accessed during render removed.
//                 Using 'loaded' is sufficient.
//             */}
//             {loaded && products.length > 2 && (
//               <>
//                 <button
//                   onClick={() => instanceRef.current?.prev()}
//                   className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/90 dark:bg-black/50 hover:bg-white text-black items-center justify-center shadow-xl z-30 rounded-r-xl transition-all duration-300 opacity-0 -translate-x-full group-hover/slider:translate-x-0 group-hover/slider:opacity-100 border-y border-r border-gray-200 dark:border-gray-700"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <button
//                   onClick={() => instanceRef.current?.next()}
//                   className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-white/90 dark:bg-black/50 hover:bg-white text-black items-center justify-center shadow-xl z-30 rounded-l-xl transition-all duration-300 opacity-0 translate-x-full group-hover/slider:translate-x-0 group-hover/slider:opacity-100 border-y border-l border-gray-200 dark:border-gray-700"
//                 >
//                   <ChevronRight size={24} />
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={() => setQuickViewProduct(null)}
//       />
//     </section>
//   );
// }
// /src/app/components/home/ProductCarousel.tsx

"use client";

import { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SanityProduct from "@/sanity/types/product_types";
import { urlFor } from "@/sanity/lib/image";
import ProductCard from "@/app/components/product/ProductCard";
import QuickViewModal from "@/app/components/product/QuickViewModal";
import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton"; 

interface Banner {
  tag?: string;
  bannerImage: any;
  link?: string;
}

interface ProductCarouselProps {
  title?: string;
  products: SanityProduct[];
  banner?: Banner;
  viewAllLink?: string;
  hideHeader?: boolean;
}

const AnimationPlugin = (slider: any) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;
  function clearNextTimeout() { clearTimeout(timeout); }
  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => { slider.next(); }, 5000); // 5s is better for UX
  }
  slider.on("created", nextTimeout);
  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
  slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
  slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
};

export default function ProductCarousel({
  title,
  products,
  banner,
  viewAllLink = "/search",
  hideHeader = false,
}: ProductCarouselProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      created: () => setLoaded(true),
      loop: products.length > 4,
      mode: "free-snap",
      // 🔥 FIX: Added spacing for better UI
      slides: { perView: 2, spacing: 12 }, 
      breakpoints: {
        "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } }, 
        "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } }, 
        "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } }, 
      },
    },
    [AnimationPlugin]
  );

  if (!products || products.length === 0) return null;

  // View All Link Logic
  let finalViewAllLink = viewAllLink;
  if (title && viewAllLink === "/search") {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("new")) finalViewAllLink = "/search?sort=newest";
    else if (lowerTitle.includes("best")) finalViewAllLink = "/search?sort=best-selling";
  }

  return (
    <section className="w-full py-12 bg-white dark:bg-gray-950">
      <div className="max-w-480 mx-auto px-4 md:px-8">
        
        {!hideHeader && title && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {title}
              </h2>
              <div className="w-12 h-1 bg-brand-primary mt-1 rounded-full" />
            </div>
            <Link href={finalViewAllLink} className="group flex items-center gap-1 text-xs font-black uppercase tracking-widest text-brand-primary hover:text-gray-900 dark:hover:text-white transition-all">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-6">
          {/* BANNER SECTION */}
          {banner && banner.bannerImage && (
            <div className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden group shadow-lg">
              <Link href={banner.link || "#"} className="block w-full h-full relative">
                <Image 
                  // 🔥 FIX: Safe Image logic for Banner
                  src={typeof banner.bannerImage === 'string' ? banner.bannerImage : urlFor(banner.bannerImage).url()} 
                  alt={title || "Promo Banner"} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="320px" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </Link>
            </div>
          )}

          {/* SLIDER SECTION */}
          <div className="relative flex-1 min-w-0 group/slider">
            <div ref={sliderRef} className="keen-slider">
              {products.map((product) => (
                <div key={product._id} className="keen-slider__slide">
                  {!loaded ? (
                    <ProductCardSkeleton />
                  ) : (
                    <ProductCard product={product} onQuickView={setQuickViewProduct} />
                  )}
                </div>
              ))}
            </div>

            {/* NAVIGATION BUTTONS */}
            {loaded && products.length > 2 && (
              <>
                <button
                  onClick={() => instanceRef.current?.prev()}
                  className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white items-center justify-center shadow-2xl z-30 transition-all opacity-0 group-hover/slider:opacity-100 border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => instanceRef.current?.next()}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white items-center justify-center shadow-2xl z-30 transition-all opacity-0 group-hover/slider:opacity-100 border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}