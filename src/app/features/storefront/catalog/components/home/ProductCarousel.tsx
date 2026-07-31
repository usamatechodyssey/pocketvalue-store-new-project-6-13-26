

// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation"; // 🚀 Hook import
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import SanityProduct from "@/types";
// import { urlFor } from "@/sanity/lib/image";
// import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
// import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
// import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton"; 
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

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
//   lowStockThreshold: number; // ✅ NEW
// }

// const AnimationPlugin = (slider: any) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   let mouseOver = false;
//   function clearNextTimeout() { clearTimeout(timeout); }
//   function nextTimeout() {
//     clearTimeout(timeout);
//     if (mouseOver) return;
//     timeout = setTimeout(() => { slider.next(); }, 5000); 
//   }
//   slider.on("created", nextTimeout);
//   slider.on("dragStarted", clearNextTimeout);
//   slider.on("animationEnded", nextTimeout);
//   slider.on("updated", nextTimeout);
//   slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
//   slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
// };

// export default function ProductCarousel({
//   title,
//   products,
//   banner,
//   viewAllLink = "/search",
//   hideHeader = false,
//   lowStockThreshold
// }: ProductCarouselProps) {
//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
//   const [loaded, setLoaded] = useState(false);
//   const pathname = usePathname();

//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
//     {
//       created: () => setLoaded(true),
//       loop: products.length > 4,
//       mode: "free-snap",
//       slides: { perView: 2, spacing: 12 }, 
//       breakpoints: {
//         "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } }, 
//         "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } }, 
//         "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } }, 
//       },
//     },
//     [AnimationPlugin]
//   );

//   if (!products || products.length === 0) return null;

//   // View All Link Logic
//   let finalViewAllLink = viewAllLink;
//   if (title && viewAllLink === "/search") {
//     const lowerTitle = title.toLowerCase();
//     if (lowerTitle.includes("new")) finalViewAllLink = "/search?sort=newest";
//     else if (lowerTitle.includes("best")) finalViewAllLink = "/search?sort=best-selling";
//   }

//   // =================================================================
//   // 🚀 GAP #6: TRACK PRODUCT CAROUSEL SIDE BANNER CLICK (banner_click)
//   // =================================================================
//   const handleSideBannerClick = () => {
//     if (!banner) return;
//     logUserEvent('banner_click', pathname, {
//       banner_id: typeof banner.bannerImage === 'string' ? banner.bannerImage : 'carousel-side-banner',
//       banner_type: 'product_carousel_side_banner',
//       banner_title: title || 'Product Carousel Side Banner',
//       target_url: banner.link || "#"
//     });
//   };
//   // =================================================================

//   return (
//     <section className="w-full py-12 bg-white dark:bg-gray-950">
//       <div className="max-w-480 mx-auto px-4 md:px-8">
        
//         {!hideHeader && title && (
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex flex-col">
//               <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
//                 {title}
//               </h2>
//               <div className="w-12 h-1 bg-brand-primary mt-1 rounded-full" />
//             </div>
//             <Link href={finalViewAllLink} className="group flex items-center gap-1 text-xs font-black uppercase tracking-widest text-brand-primary hover:text-gray-900 dark:hover:text-white transition-all">
//               View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
//         )}

//         <div className="flex flex-col xl:flex-row gap-6">
//           {/* BANNER SECTION */}
//           {banner && banner.bannerImage && (
//             <div className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden group shadow-lg">
//               <Link 
//                 href={banner.link || "#"} 
//                 onClick={handleSideBannerClick} // ✅ Dynamic click telemetry bound
//                 className="block w-full h-full relative"
//                 aria-label={title || "Promo Banner"}
//               >
//                 <Image 
//                   src={typeof banner.bannerImage === 'string' ? banner.bannerImage : urlFor(banner.bannerImage).url()} 
//                   alt={title || "Promo Banner"} 
//                   fill 
//                   className="object-cover transition-transform duration-700 group-hover:scale-110"
//                   sizes="320px" 
//                 />
//                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
//               </Link>
//             </div>
//           )}

//           {/* SLIDER SECTION */}
//           <div className="relative flex-1 min-w-0 group/slider">
//             <div ref={sliderRef} className="keen-slider">
//               {products.map((product) => (
//                 <div key={product._id} className="keen-slider__slide">
//                   {!loaded ? (
//                     <ProductCardSkeleton />
//                   ) : (
//                     <ProductCard product={product} onQuickView={setQuickViewProduct} />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* NAVIGATION BUTTONS */}
//             {loaded && products.length > 2 && (
//               <>
//                 <button
//                   onClick={() => instanceRef.current?.prev()}
//                   className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white items-center justify-center shadow-2xl z-30 transition-all opacity-0 group-hover/slider:opacity-100 border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <button
//                   onClick={() => instanceRef.current?.next()}
//                   className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white items-center justify-center shadow-2xl z-30 transition-all opacity-0 group-hover/slider:opacity-100 border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
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
//         lowStockThreshold={lowStockThreshold} // ✅ PASS
//       />
//     </section>
//   );
// }
// src/app/features/storefront/catalog/components/home/builder/ProductCarousel.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SanityProduct from "@/types";
import { urlFor } from "@/sanity/lib/image";
import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

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
  lowStockThreshold: number;
}

const AnimationPlugin = (slider: any) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;
  function clearNextTimeout() { clearTimeout(timeout); }
  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => { slider.next(); }, 5000);
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
  lowStockThreshold,
}: ProductCarouselProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // ✅ Side Banner Impression Tracking Ref
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasLoggedImpression = useRef(false);
  const impressionTimer = useRef<NodeJS.Timeout | null>(null);

  const bannerId = banner?.bannerImage
    ? typeof banner.bannerImage === "string"
      ? banner.bannerImage
      : "carousel-side-banner"
    : "carousel-side-banner";

  // ================================================================
  // 🚀 ENTERPRISE FIX: SIDE BANNER IMPRESSION TRACKING
  // ================================================================
  useEffect(() => {
    if (!banner?.bannerImage) return;

    const impressionKey = `pv_banner_imp_${bannerId}`;

    // ✅ Deduplication: Already logged this session?
    if (typeof window !== "undefined" && sessionStorage.getItem(impressionKey)) {
      hasLoggedImpression.current = true;
      return;
    }

    const element = bannerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // ✅ Google Standard: 50% visibility for 1 second
          impressionTimer.current = setTimeout(() => {
            if (!hasLoggedImpression.current) {
              hasLoggedImpression.current = true;
              sessionStorage.setItem(impressionKey, "true");

              logUserEvent("banner_impression", pathname, {
                banner_id: bannerId,
                banner_type: "product_carousel_side_banner",
                banner_title: title || "Product Carousel Side Banner",
                target_url: banner.link || "#",
              });
            }
          }, 1000);
        } else {
          // ✅ Cancel timer if user scrolls away before 1 second
          if (impressionTimer.current) {
            clearTimeout(impressionTimer.current);
            impressionTimer.current = null;
          }
        }
      },
      { threshold: 0.5 } // ✅ Google Standard: 50% visibility
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (impressionTimer.current) {
        clearTimeout(impressionTimer.current);
        impressionTimer.current = null;
      }
    };
  }, [banner, bannerId, title, pathname]);

  // ================================================================
  // 🚀 SIDE BANNER CLICK TRACKING
  // ================================================================
  const handleSideBannerClick = () => {
    if (!banner) return;
    logUserEvent("banner_click", pathname, {
      banner_id: bannerId,
      banner_type: "product_carousel_side_banner",
      banner_title: title || "Product Carousel Side Banner",
      target_url: banner.link || "#",
    });
  };

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      created: () => setLoaded(true),
      loop: products.length > 4,
      mode: "free-snap",
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
            <div
              ref={bannerRef}
              className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden group shadow-lg"
            >
              <Link
                href={banner.link || "#"}
                onClick={handleSideBannerClick}
                className="block w-full h-full relative"
                aria-label={title || "Promo Banner"}
              >
                <Image
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
                    <ProductCard
                      product={product}
                      onQuickView={setQuickViewProduct}
                    />
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
        lowStockThreshold={lowStockThreshold}
      />
    </section>
  );
}