

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import { motion, useInView, AnimatePresence } from "framer-motion";
// import SanityProduct from "@/types";
// import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
// import CountdownTimer from "../CountdownTimer";
// import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
// import { urlFor } from "@/sanity/lib/image";
// import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// interface DealSectionData {
//   title: string;
//   subtitle?: string;
//   fetchStrategy: string;
//   viewType: "slider" | "grid";
//   backgroundStyle: "white" | "gradient" | "gray";
//   enableTimer?: boolean;
//   endTime?: string;
//   products: SanityProduct[];
//   campaignSlug?: string;
//   categorySlug?: string;
//   tagType?: string;
//   showSideBanner?: boolean;
//   sideBanner?: { image: any; link?: string };
// }

// interface UniversalDealSectionProps {
//   data: DealSectionData;
//   lowStockThreshold: number; // ✅ NEW PROP
// }

// const AnimationPlugin = (slider: any) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   let mouseOver = false;
//   function clearNextTimeout() {
//     clearTimeout(timeout);
//   }
//   function nextTimeout() {
//     clearTimeout(timeout);
//     if (mouseOver) return;
//     timeout = setTimeout(() => {
//       slider.next();
//     }, 4000);
//   }
//   slider.on("created", nextTimeout);
//   slider.on("dragStarted", clearNextTimeout);
//   slider.on("animationEnded", nextTimeout);
//   slider.on("updated", nextTimeout);
//   slider.container.addEventListener("mouseover", () => {
//     mouseOver = true;
//     clearNextTimeout();
//   });
//   slider.container.addEventListener("mouseout", () => {
//     mouseOver = false;
//     nextTimeout();
//   });
// };

// export default function UniversalDealSection({
//   data,
//   lowStockThreshold, // ✅ RECEIVE
// }: UniversalDealSectionProps) {
//   const {
//     title,
//     subtitle,
//     backgroundStyle,
//     enableTimer,
//     endTime,
//     products,
//     fetchStrategy,
//     campaignSlug,
//     categorySlug,
//     tagType,
//     showSideBanner,
//     sideBanner,
//   } = data;

//   const [loaded, setLoaded] = useState(false);
//   const [quickViewProduct, setQuickViewProduct] =
//     useState<SanityProduct | null>(null);
//   const safeProducts = products || [];

//   const sectionRef = useRef(null);
//   const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
//   const pathname = usePathname();

//   const showTimer = enableTimer && endTime;

//   // Timer Scarcity Exposure Tracking
//   useEffect(() => {
//     if (showTimer && isInView) {
//       const scarcityKey = `pv_deal_scarcity_${title.replace(/\s+/g, "_").toLowerCase()}`;
//       if (typeof window !== "undefined" && !sessionStorage.getItem(scarcityKey)) {
//         sessionStorage.setItem(scarcityKey, "true");
//         logUserEvent("scarcity_exposure", pathname, {
//           exposure_type: "homepage_countdown_campaign_timer",
//           campaign_title: title,
//           end_time: endTime,
//         });
//       }
//     }
//   }, [showTimer, isInView, title, endTime, pathname]);

//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
//     {
//       loop: safeProducts.length > 4,
//       mode: "free-snap",
//       slides: { perView: 2, spacing: 12 },
//       breakpoints: {
//         "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } },
//         "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
//         "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } },
//       },
//       created: () => setLoaded(true),
//     },
//     [AnimationPlugin],
//   );

//   if (safeProducts.length === 0) return null;

//   const handleSideBannerClick = () => {
//     if (!sideBanner) return;
//     logUserEvent("banner_click", pathname, {
//       banner_id:
//         typeof sideBanner.image === "string"
//           ? sideBanner.image
//           : "deal-side-banner",
//       banner_type: "universal_deal_section_side_banner",
//       banner_title: title || "Deals Campaign Side Banner",
//       target_url: sideBanner.link || "#",
//     });
//   };

//   // View All Link Engine
//   let viewAllLink = "/search";
//   if (fetchStrategy === "campaign" && campaignSlug)
//     viewAllLink = `/deals/${campaignSlug}`;
//   else if (fetchStrategy === "category" && categorySlug)
//     viewAllLink = `/category/${categorySlug}`;
//   else if (fetchStrategy === "tag" && tagType)
//     viewAllLink = `/search?sort=${tagType === "newArrivals" ? "newest" : "best-selling"}`;

//   const isGradient = backgroundStyle === "gradient";
//   const isGray = backgroundStyle === "gray";
//   const sectionClass = isGradient
//     ? "bg-gradient-to-r from-brand-secondary to-brand-primary text-white"
//     : isGray
//       ? "bg-gray-50 dark:bg-gray-900"
//       : "bg-white dark:bg-gray-950";

//   return (
//     <section
//       ref={sectionRef}
//       className={`w-full py-12 relative group/section overflow-hidden z-0 ${sectionClass}`}
//     >
//       <AnimatePresence>
//         {showTimer && isInView && (
//           <motion.div
//             initial={{ y: -250, opacity: 0 }}
//             animate={{ y: [-250, 0, -10, 0], opacity: 1 }}
//             exit={{ y: -250, opacity: 0 }}
//             transition={{ duration: 1.5, ease: "easeOut" }}
//             className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center scale-75 md:scale-100 origin-top"
//           >
//             <div
//               className={`w-0.5 h-20 -mt-10 ${isGradient ? "bg-white/40" : "bg-brand-primary/30"}`}
//             ></div>

//             <div
//               className={`
//                 px-4 py-3 rounded-2xl border shadow-2xl bg-white dark:bg-gray-900
//                 ${isGradient ? "border-white/20" : "border-gray-100 dark:border-gray-800"}
//             `}
//             >
//               <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary text-center mb-1">
//                 Ending In
//               </p>
//               <CountdownTimer endDate={endTime!} />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="max-w-480 mx-auto px-4 md:px-8">
//         <div
//           className={`flex items-end justify-between mb-10 gap-4 ${showTimer ? "mt-24 md:mt-0" : ""}`}
//         >
//           <div className="flex flex-col gap-2">
//             <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
//               {title}
//             </h2>
//             {subtitle && (
//               <p className="text-sm opacity-80 max-w-xl">{subtitle}</p>
//             )}
//           </div>

//           <Link
//             href={viewAllLink}
//             className="group flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-all"
//           >
//             View All{" "}
//             <ArrowRight
//               size={14}
//               className="group-hover:translate-x-1 transition-transform"
//             />
//           </Link>
//         </div>

//         <div className="flex flex-col xl:flex-row gap-6 items-stretch">
//           {showSideBanner && sideBanner?.image && (
//             <div className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden shadow-xl group animate-in fade-in duration-300">
//               <Link
//                 href={sideBanner.link || "#"}
//                 onClick={handleSideBannerClick}
//                 className="block w-full h-full"
//               >
//                 <Image
//                   src={
//                     typeof sideBanner.image === "string"
//                       ? sideBanner.image
//                       : urlFor(sideBanner.image).url()
//                   }
//                   alt="Promo Banner"
//                   fill
//                   className="object-cover transition-transform duration-700 group-hover:scale-110"
//                   sizes="320px"
//                 />
//               </Link>
//             </div>
//           )}

//           <div className="flex-1 min-w-0 relative group/slider">
//             <div ref={sliderRef} className="keen-slider h-full">
//               {safeProducts.map((product) => (
//                 <div key={product._id} className="keen-slider__slide">
//                   {!loaded ? (
//                     <ProductCardSkeleton />
//                   ) : (
//                     <ProductCard
//                       product={product}
//                       onQuickView={setQuickViewProduct}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {loaded && safeProducts.length > 2 && (
//               <>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     instanceRef.current?.prev();
//                   }}
//                   className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-2xl items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 hover:bg-brand-primary hover:text-white"
//                   aria-label="Previous Slide"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     instanceRef.current?.next();
//                   }}
//                   className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-2xl items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
//                   aria-label="Next Slide"
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
// src/app/features/storefront/catalog/components/home/builder/UniversalDealSection.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SanityProduct from "@/types";
import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
import CountdownTimer from "../CountdownTimer";
import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
import { urlFor } from "@/sanity/lib/image";
import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface DealSectionData {
  title: string;
  subtitle?: string;
  fetchStrategy: string;
  viewType: "slider" | "grid";
  backgroundStyle: "white" | "gradient" | "gray";
  enableTimer?: boolean;
  endTime?: string;
  products: SanityProduct[];
  campaignSlug?: string;
  categorySlug?: string;
  tagType?: string;
  showSideBanner?: boolean;
  sideBanner?: { image: any; link?: string };
}

interface UniversalDealSectionProps {
  data: DealSectionData;
  lowStockThreshold: number;
}

const AnimationPlugin = (slider: any) => {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;
  function clearNextTimeout() {
    clearTimeout(timeout);
  }
  function nextTimeout() {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => {
      slider.next();
    }, 4000);
  }
  slider.on("created", nextTimeout);
  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
  slider.container.addEventListener("mouseover", () => {
    mouseOver = true;
    clearNextTimeout();
  });
  slider.container.addEventListener("mouseout", () => {
    mouseOver = false;
    nextTimeout();
  });
};

export default function UniversalDealSection({
  data,
  lowStockThreshold,
}: UniversalDealSectionProps) {
  const {
    title,
    subtitle,
    backgroundStyle,
    enableTimer,
    endTime,
    products,
    fetchStrategy,
    campaignSlug,
    categorySlug,
    tagType,
    showSideBanner,
    sideBanner,
  } = data;

  const [loaded, setLoaded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
  const safeProducts = products || [];

  const sectionRef = useRef(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const pathname = usePathname();

  // ✅ Side Banner Impression Tracking Ref
  const hasLoggedImpression = useRef(false);
  const impressionTimer = useRef<NodeJS.Timeout | null>(null);

  const showTimer = enableTimer && endTime;
  const bannerId = sideBanner?.image
    ? typeof sideBanner.image === "string"
      ? sideBanner.image
      : "universal-deal-side-banner"
    : "universal-deal-side-banner";

  // Timer Scarcity Exposure Tracking
  useEffect(() => {
    if (showTimer && isInView) {
      const scarcityKey = `pv_deal_scarcity_${title.replace(/\s+/g, "_").toLowerCase()}`;
      if (typeof window !== "undefined" && !sessionStorage.getItem(scarcityKey)) {
        sessionStorage.setItem(scarcityKey, "true");
        logUserEvent("scarcity_exposure", pathname, {
          exposure_type: "homepage_countdown_campaign_timer",
          campaign_title: title,
          end_time: endTime,
        });
      }
    }
  }, [showTimer, isInView, title, endTime, pathname]);

  // ================================================================
  // 🚀 ENTERPRISE FIX: SIDE BANNER IMPRESSION TRACKING
  // ================================================================
  useEffect(() => {
    if (!showSideBanner || !sideBanner?.image) return;

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
                banner_type: "universal_deal_section_side_banner",
                banner_title: title || "Deals Campaign Side Banner",
                target_url: sideBanner.link || "#",
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
  }, [showSideBanner, sideBanner, bannerId, title, pathname]);

  // ================================================================
  // 🚀 SIDE BANNER CLICK TRACKING
  // ================================================================
  const handleSideBannerClick = () => {
    if (!sideBanner) return;
    logUserEvent("banner_click", pathname, {
      banner_id: bannerId,
      banner_type: "universal_deal_section_side_banner",
      banner_title: title || "Deals Campaign Side Banner",
      target_url: sideBanner.link || "#",
    });
  };

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: safeProducts.length > 4,
      mode: "free-snap",
      slides: { perView: 2, spacing: 12 },
      breakpoints: {
        "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } },
        "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
        "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } },
      },
      created: () => setLoaded(true),
    },
    [AnimationPlugin],
  );

  if (safeProducts.length === 0) return null;

  // View All Link Engine
  let viewAllLink = "/search";
  if (fetchStrategy === "campaign" && campaignSlug)
    viewAllLink = `/deals/${campaignSlug}`;
  else if (fetchStrategy === "category" && categorySlug)
    viewAllLink = `/category/${categorySlug}`;
  else if (fetchStrategy === "tag" && tagType)
    viewAllLink = `/search?sort=${tagType === "newArrivals" ? "newest" : "best-selling"}`;

  const isGradient = backgroundStyle === "gradient";
  const isGray = backgroundStyle === "gray";
  const sectionClass = isGradient
    ? "bg-gradient-to-r from-brand-secondary to-brand-primary text-white"
    : isGray
      ? "bg-gray-50 dark:bg-gray-900"
      : "bg-white dark:bg-gray-950";

  return (
    <section
      ref={sectionRef}
      className={`w-full py-12 relative group/section overflow-hidden z-0 ${sectionClass}`}
    >
      <AnimatePresence>
        {showTimer && isInView && (
          <motion.div
            initial={{ y: -250, opacity: 0 }}
            animate={{ y: [-250, 0, -10, 0], opacity: 1 }}
            exit={{ y: -250, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center scale-75 md:scale-100 origin-top"
          >
            <div
              className={`w-0.5 h-20 -mt-10 ${isGradient ? "bg-white/40" : "bg-brand-primary/30"}`}
            />
            <div
              className={`
                px-4 py-3 rounded-2xl border shadow-2xl bg-white dark:bg-gray-900
                ${isGradient ? "border-white/20" : "border-gray-100 dark:border-gray-800"}
              `}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary text-center mb-1">
                Ending In
              </p>
              <CountdownTimer endDate={endTime!} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-480 mx-auto px-4 md:px-8">
        <div
          className={`flex items-end justify-between mb-10 gap-4 ${showTimer ? "mt-24 md:mt-0" : ""}`}
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm opacity-80 max-w-xl">{subtitle}</p>
            )}
          </div>

          <Link
            href={viewAllLink}
            className="group flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-all"
          >
            View All{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          {showSideBanner && sideBanner?.image && (
            <div
              ref={bannerRef}
              className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden shadow-xl group animate-in fade-in duration-300"
            >
              <Link
                href={sideBanner.link || "#"}
                onClick={handleSideBannerClick}
                className="block w-full h-full"
              >
                <Image
                  src={
                    typeof sideBanner.image === "string"
                      ? sideBanner.image
                      : urlFor(sideBanner.image).url()
                  }
                  alt="Promo Banner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="320px"
                />
              </Link>
            </div>
          )}

          <div className="flex-1 min-w-0 relative group/slider">
            <div ref={sliderRef} className="keen-slider h-full">
              {safeProducts.map((product) => (
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

            {loaded && safeProducts.length > 2 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    instanceRef.current?.prev();
                  }}
                  className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-2xl items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 hover:bg-brand-primary hover:text-white"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    instanceRef.current?.next();
                  }}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-2xl items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 hover:bg-brand-primary hover:text-white"
                  aria-label="Next Slide"
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