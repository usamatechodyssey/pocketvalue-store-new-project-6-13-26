// //UniversalDealSection.tsx
// "use client";

// import { useState, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import { motion, useInView, AnimatePresence } from "framer-motion";
// import SanityProduct from "@/sanity/types/product_types";
// import ProductCard from "@/app/components/product/ProductCard";
// import CountdownTimer from "../CountdownTimer";
// import QuickViewModal from "@/app/components/product/QuickViewModal";
// import { urlFor } from "@/sanity/lib/image";
// import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton";

// interface DealSectionProps {
//   data: {
//     title: string;
//     subtitle?: string;
//     fetchStrategy: string;
//     viewType: "slider" | "grid";
//     backgroundStyle: "white" | "gradient" | "gray";
//     enableTimer?: boolean;
//     endTime?: string;
//     products: SanityProduct[];
//     campaignSlug?: string;
//     categorySlug?: string;
//     tagType?: string;
//     showSideBanner?: boolean;
//     sideBanner?: { image: any; link?: string };
//   };
// }

// const AnimationPlugin = (slider: any) => {
//   let timeout: ReturnType<typeof setTimeout>;
//   let mouseOver = false;
//   function clearNextTimeout() { clearTimeout(timeout); }
//   function nextTimeout() {
//     clearTimeout(timeout);
//     if (mouseOver) return;
//     timeout = setTimeout(() => { slider.next(); }, 3000);
//   }
//   slider.on("created", () => {
//     slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
//     slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
//     nextTimeout();
//   });
//   slider.on("dragStarted", clearNextTimeout);
//   slider.on("animationEnded", nextTimeout);
//   slider.on("updated", nextTimeout);
// };

// export default function UniversalDealSection({ data }: DealSectionProps) {
//   const {
//     title, subtitle, backgroundStyle, enableTimer, endTime, products,
//     fetchStrategy, campaignSlug, categorySlug, tagType, showSideBanner, sideBanner,
//   } = data;

//   const [loaded, setLoaded] = useState(false);
//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
//   const safeProducts = products || [];

//   const sectionRef = useRef(null);
//   const isInView = useInView(sectionRef, { once: false, amount: 0.25 });

//   const showTimer = enableTimer && endTime;

//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
//     loop: safeProducts.length > 3,
//     mode: "snap",
//     slides: { perView: 2, spacing: 0 },
//     breakpoints: {
//       "(min-width: 768px)": { slides: { perView: 3, spacing: 0 } },
//       "(min-width: 1024px)": { slides: { perView: "auto", spacing: 0 } },
//     },
//     created: () => setLoaded(true),
//   }, [AnimationPlugin]);

//   if (safeProducts.length === 0) return null;

//   let viewAllLink = "/search";
//   if (fetchStrategy === "campaign" && campaignSlug) viewAllLink = `/deals/${campaignSlug}`;
//   else if (fetchStrategy === "category" && categorySlug) viewAllLink = `/category/${categorySlug}`;
//   else if (fetchStrategy === "tag" && tagType) viewAllLink = `/search?sort=${tagType === "newArrivals" ? "newest" : "best-selling"}`;

//   const isGradient = backgroundStyle === "gradient";
//   const isGray = backgroundStyle === "gray";
//   const sectionClass = isGradient
//     ? "bg-gradient-to-r from-brand-secondary to-brand-primary text-white"
//     : isGray ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-950";

//   const textClass = isGradient ? "text-white" : "text-gray-900 dark:text-white";
//   const subTextClass = isGradient ? "text-white/80" : "text-gray-500 dark:text-gray-400";

//   return (
//     <section
//       ref={sectionRef}
//       className={`w-full py-10 md:py-12 relative group/section overflow-hidden z-0 ${sectionClass}`}
//     >
//       <AnimatePresence>
//         {showTimer && isInView && (
//           <motion.div
//             initial={{ y: -250, opacity: 0 }}
//             animate={{ y: [ -250, 250, -10, 10 ], opacity: 1 }}
//             exit={{ y: -250, opacity: 0 }}
//             transition={{ duration: 2.5, times: [0, 0.5, 0.8, 1], ease: "easeInOut" }}
//             /*
//                🔥 FIX APPLIED HERE:
//                1. -top-5 (Mobile): Timer ko thora upar kheench liya taake Title ke sath chipke nahi.
//                2. scale-75 (Mobile): Timer ka size thora chota kiya taake heavy na lage.
//                3. md:top-0 & md:scale-100: Desktop par normal rahega.
//             */
//             className="absolute -top-0.5 md:top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none scale-70 md:scale-100 origin-top"
//           >
//             <div className={`w-0.5 h-100 -mt-100 ${isGradient ? "bg-white/60" : "bg-brand-primary/50"}`}></div>
//             <div className={`w-4 h-3 rounded-b-sm shadow-sm z-10 -mt-0.5 ${isGradient ? "bg-white" : "bg-brand-primary"}`}></div>

//             <div className="flex flex-col items-center pointer-events-auto filter drop-shadow-xl  -mt-0.5">
//                <div className={`
//                   px-3 py-1 rounded-t-lg z-10 border-x border-t mx-auto
//                   bg-white dark:bg-gray-900 shadow-sm
//                   ${isGradient ? "text-brand-primary border-white" : "text-brand-primary dark:text-brand-primary border-gray-200 dark:border-white/10"}
//                `}>
//                  <p className="text-[9px] md:text-[10px] uppercase font-extrabold tracking-widest leading-none">
//                    Ending Soon
//                  </p>
//                </div>

//                <div className={`
//                   px-4 py-3 rounded-2xl rounded-t-none border-b border-x shadow-lg
//                   bg-white dark:bg-gray-900 relative
//                   ${isGradient
//                     ? "border-white/40 dark:border-white/10"
//                     : "border-gray-200 dark:border-white/10"
//                   }
//                `}>
//                  <CountdownTimer endDate={endTime!} />
//                  <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl rounded-t-none pointer-events-none"></div>
//                </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="max-w-480 mx-auto">
//         <div className="px-4 md:px-8">

//           <div className={`flex items-end justify-between mb-8 md:mb-10 gap-4 relative ${showTimer ? "mt-14 md:mt-0" : "mt-0"}`}>

//             <div className="flex flex-col gap-2">
//               <div className="flex items-center gap-3">
//                 <h2 className={`text-2xl md:text-4xl font-sans font-bold ${textClass}`}>{title}</h2>
//               </div>
//               {subtitle && <p className={`text-sm md:text-base max-w-2xl ${subTextClass}`}>{subtitle}</p>}
//             </div>

//             <Link href={viewAllLink} className={`group flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-all ${isGradient ? "text-white hover:opacity-80" : "text-brand-primary hover:text-brand-secondary"}`}>
//               View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
//         </div>

//         <div className="flex flex-col xl:flex-row items-stretch">
//           {showSideBanner && sideBanner?.image && (
//             <div className="hidden xl:block shrink-0 w-75 relative border-r border-gray-200 dark:border-gray-800 group overflow-hidden z-20">
//               <Link href={sideBanner.link || "#"} className="block w-full h-full relative">
//                 <Image
//                   src={urlFor(sideBanner.image).url()}
//                   alt="Special Offer"
//                   fill
//                   className="object-cover transition-transform duration-500 group-hover:scale-105"
//                   sizes="(max-width: 1280px) 100vw, 300px"
//                 />
//                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
//               </Link>
//             </div>
//           )}

//           <div className="flex-1 min-w-0 relative group/slider z-10">
//             <div ref={sliderRef} className="keen-slider h-full flex">
//               {safeProducts.map((product) => (
//                 <div key={product._id} className={`keen-slider__slide h-full px-1 min-w-[50%] max-w-[50%] md:min-w-[33.333%] md:max-w-[33.333%] lg:min-w-55 lg:max-w-70`}>
//                   {!loaded ? <ProductCardSkeleton /> : <ProductCard product={product} onQuickView={setQuickViewProduct} />}
//                 </div>
//               ))}
//             </div>

//             {loaded && safeProducts.length > 2 && (
//               <>
//                 <button onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev() }} className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 items-center justify-center shadow-xl z-30 rounded-r-xl transition-all duration-300 opacity-0 -translate-x-full group-hover/slider:translate-x-0 group-hover/slider:opacity-100 ${isGradient ? "bg-white/20 text-white backdrop-blur-md" : "bg-white/90 text-black border-y border-r border-gray-200"}`}>
//                   <ChevronLeft size={24} />
//                 </button>
//                 <button onClick={(e) => { e.stopPropagation(); instanceRef.current?.next() }} className={`hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 items-center justify-center shadow-xl z-30 rounded-l-xl transition-all duration-300 opacity-0 translate-x-full group-hover/slider:translate-x-0 group-hover/slider:opacity-100 ${isGradient ? "bg-white/20 text-white backdrop-blur-md" : "bg-white/90 text-black border-y border-l border-gray-200"}`}>
//                   <ChevronRight size={24} />
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
//     </section>
//   );
// }
// src/app/components/home/UniversalDealSection.tsx

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SanityProduct from "@/sanity/types/product_types";
import ProductCard from "@/app/components/product/ProductCard";
import CountdownTimer from "../CountdownTimer";
import QuickViewModal from "@/app/components/product/QuickViewModal";
import { urlFor } from "@/sanity/lib/image";
import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton";

interface DealSectionProps {
  data: {
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
  };
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
    }, 4000); // 4s is sweet spot
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

export default function UniversalDealSection({ data }: DealSectionProps) {
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
  const [quickViewProduct, setQuickViewProduct] =
    useState<SanityProduct | null>(null);
  const safeProducts = products || [];

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  const showTimer = enableTimer && endTime;

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: safeProducts.length > 4,
      mode: "free-snap",
      slides: { perView: 2, spacing: 12 }, // 🔥 Spacing Added
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
            {/* Pendulum Rope */}
            <div
              className={`w-0.5 h-20 -mt-10 ${isGradient ? "bg-white/40" : "bg-brand-primary/30"}`}
            ></div>

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
            <div className="hidden xl:block shrink-0 w-80 relative rounded-3xl overflow-hidden shadow-xl group">
              <Link
                href={sideBanner.link || "#"}
                className="block w-full h-full"
              >
                <Image
                  // 🔥 FIX: Safe image check
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
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    instanceRef.current?.next();
                  }}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-2xl items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 hover:bg-brand-primary hover:text-white"
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
