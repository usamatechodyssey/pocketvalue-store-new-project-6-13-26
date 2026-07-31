

// "use client";

// import { usePathname } from "next/navigation"; // 🚀 Hook import
// import Link from "next/link";
// import Image from "next/image";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

// interface BannerItem {
//   desktopImage: string;
//   mobileImage?: string;
//   altText?: string;
//   link?: string;
//   heading?: string;
//   subheading?: string;
//   buttonText?: string;
//   contentPosition?: "center" | "bottom-left" | "bottom-center" | "top-left";
//   textColor?: string;
// }

// interface MasterBannerGridProps {
//   desktopLayout: "grid" | "mosaic-left" | "mosaic-right" | "hero-stack";
//   gridColumns?: 1 | 2 | 3 | 4;
//   heightMode: "auto" | "aspect" | "fixed" | "custom";
//   aspectRatio?: string;
//   fixedHeight?: string;
//   customHeightPx?: number;
//   mobileBehavior: "stack" | "scroll" | "grid-2";
//   containerSettings: {
//     fullWidth: boolean;
//     gap: "2" | "4" | "6" | "8";
//     roundedCorners: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
//   };
//   banners: BannerItem[];
// }

// const gapMap = { "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
// const colMap = {
//   1: "md:grid-cols-1",
//   2: "md:grid-cols-2",
//   3: "md:grid-cols-3",
//   4: "md:grid-cols-4",
// };
// const radiusMap = {
//   none: "rounded-none",
//   sm: "rounded-sm",
//   md: "rounded-md",
//   lg: "rounded-lg",
//   xl: "rounded-xl",
//   "2xl": "rounded-2xl",
//   "3xl": "rounded-3xl",
// };

// export default function MasterBannerGrid({
//   desktopLayout = "grid",
//   gridColumns = 1,
//   heightMode = "aspect",
//   aspectRatio = "aspect-video",
//   fixedHeight = "h-[400px]",
//   customHeightPx,
//   mobileBehavior = "stack",
//   containerSettings,
//   banners,
// }: MasterBannerGridProps) {
//   const pathname = usePathname();

//   if (!banners || banners.length === 0) return null;

//   // 1. Class Resolution
//   const gapClass = gapMap[containerSettings?.gap] || "gap-4";
//   const radiusClass =
//     radiusMap[containerSettings?.roundedCorners] || "rounded-xl";

//   // Layout Logic
//   let gridColsClass = colMap[gridColumns] || "md:grid-cols-1";
//   if (desktopLayout.includes("mosaic")) gridColsClass = "md:grid-cols-3";
//   if (desktopLayout === "hero-stack") gridColsClass = "md:grid-cols-3";

//   // Mobile Logic
//   const mobileWrapperClass =
//     mobileBehavior === "scroll"
//       ? "flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 md:grid"
//       : mobileBehavior === "grid-2"
//         ? "grid grid-cols-2"
//         : "grid grid-cols-1";

//   const getHeightStyle = () =>
//     heightMode === "custom" && customHeightPx
//       ? { height: `${customHeightPx}px` }
//       : {};

//   // =================================================================
//   // 🚀 GAP #6: TRACK PROMOTIONAL BANNER GRID CLICKS (banner_click)
//   // =================================================================
//   const handleGridBannerClick = (banner: BannerItem, index: number) => {
//     logUserEvent('banner_click', pathname, {
//       banner_id: banner.desktopImage || `banner-grid-${index}`,
//       banner_type: `homepage_master_grid_${desktopLayout}`,
//       banner_title: banner.heading || banner.altText || `Promo Grid Item ${index + 1}`,
//       target_url: banner.link || "#",
//       position_index: index + 1 // Dynamic rank calculation
//     });
//   };
//   // =================================================================

//   return (
//     <section
//       className={`w-full py-6 ${containerSettings?.fullWidth ? "" : "max-w-480 mx-auto px-4 md:px-8"}`}
//     >
//       <div className={`${mobileWrapperClass} ${gridColsClass} ${gapClass}`}>
//         {banners.map((banner, index) => {
//           // Layout Spans
//           let spanClass = "col-span-1";
//           if (desktopLayout === "mosaic-left" && index === 0)
//             spanClass = "md:col-span-2 md:row-span-2";
//           if (desktopLayout === "mosaic-right" && index === banners.length - 1)
//             spanClass = "md:col-span-2 md:row-span-2";
//           if (desktopLayout === "hero-stack" && index === 0)
//             spanClass = "md:col-span-3";

//           const mobileItemClass =
//             mobileBehavior === "scroll"
//               ? "min-w-[85vw] snap-center shrink-0"
//               : "";

//           const textPosClass = {
//             center: "justify-center items-center text-center",
//             "bottom-left": "justify-end items-start text-left",
//             "bottom-center": "justify-end items-center text-center",
//             "top-left": "justify-start items-start text-left",
//           }[banner.contentPosition || "center"];

//           return (
//             <div
//               key={index}
//               style={getHeightStyle()}
//               className={`relative group overflow-hidden ${spanClass} ${mobileItemClass} ${radiusClass} 
//               ${heightMode === "aspect" ? aspectRatio : heightMode === "fixed" ? fixedHeight : "h-auto"}`}
//             >
//               <Link
//                 href={banner.link || "#"}
//                 onClick={() => handleGridBannerClick(banner, index)} // ✅ Click telemetry bound
//                 className="block w-full h-full relative"
//                 aria-label={banner.heading || "Promotion"}
//               >
//                 {/* Desktop Image */}
//                 <Image
//                   src={banner.desktopImage}
//                   alt={banner.altText || "Promotion"}
//                   fill
//                   priority={index === 0}
//                   className="hidden md:block object-cover transition-transform duration-700 group-hover:scale-105"
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                 />

//                 {/* Mobile Image */}
//                 <Image
//                   src={banner.mobileImage || banner.desktopImage}
//                   alt={banner.altText || "Promotion"}
//                   fill
//                   className="block md:hidden object-cover"
//                   sizes="100vw"
//                 />

//                 {/* Overlay Content */}
//                 {(banner.heading || banner.buttonText) && (
//                   <div
//                     className={`absolute inset-0 p-6 md:p-10 flex flex-col bg-black/10 group-hover:bg-black/20 transition-all ${textPosClass}`}
//                   >
//                     <div className="max-w-xl transition-transform duration-500 group-hover:-translate-y-2">
//                       {banner.heading && (
//                         <h3
//                           className={`text-2xl md:text-4xl font-black uppercase tracking-tighter drop-shadow-lg mb-2 ${banner.textColor || "text-white"}`}
//                         >
//                           {banner.heading}
//                         </h3>
//                       )}
//                       {banner.subheading && (
//                         <p
//                           className={`text-sm md:text-lg font-medium drop-shadow-md mb-6 ${banner.textColor || "text-white"} opacity-90`}
//                         >
//                           {banner.subheading}
//                         </p>
//                       )}
//                       {banner.buttonText && (
//                         <span className="inline-block px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full shadow-2xl hover:bg-brand-primary hover:text-white transition-all">
//                           {banner.buttonText}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
// src/app/features/storefront/catalog/components/home/builder/MasterBannerGrid.tsx

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface BannerItem {
  desktopImage: string;
  mobileImage?: string;
  altText?: string;
  link?: string;
  heading?: string;
  subheading?: string;
  buttonText?: string;
  contentPosition?: "center" | "bottom-left" | "bottom-center" | "top-left";
  textColor?: string;
}

interface MasterBannerGridProps {
  desktopLayout: "grid" | "mosaic-left" | "mosaic-right" | "hero-stack";
  gridColumns?: 1 | 2 | 3 | 4;
  heightMode: "auto" | "aspect" | "fixed" | "custom";
  aspectRatio?: string;
  fixedHeight?: string;
  customHeightPx?: number;
  mobileBehavior: "stack" | "scroll" | "grid-2";
  containerSettings: {
    fullWidth: boolean;
    gap: "2" | "4" | "6" | "8";
    roundedCorners: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  };
  banners: BannerItem[];
}

const gapMap = { "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
const colMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};
const radiusMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

export default function MasterBannerGrid({
  desktopLayout = "grid",
  gridColumns = 1,
  heightMode = "aspect",
  aspectRatio = "aspect-video",
  fixedHeight = "h-[400px]",
  customHeightPx,
  mobileBehavior = "stack",
  containerSettings,
  banners,
}: MasterBannerGridProps) {
  const pathname = usePathname();

  if (!banners || banners.length === 0) return null;

  const gapClass = gapMap[containerSettings?.gap] || "gap-4";
  const radiusClass = radiusMap[containerSettings?.roundedCorners] || "rounded-xl";

  let gridColsClass = colMap[gridColumns] || "md:grid-cols-1";
  if (desktopLayout.includes("mosaic")) gridColsClass = "md:grid-cols-3";
  if (desktopLayout === "hero-stack") gridColsClass = "md:grid-cols-3";

  const mobileWrapperClass =
    mobileBehavior === "scroll"
      ? "flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 md:grid"
      : mobileBehavior === "grid-2"
        ? "grid grid-cols-2"
        : "grid grid-cols-1";

  const getHeightStyle = () =>
    heightMode === "custom" && customHeightPx
      ? { height: `${customHeightPx}px` }
      : {};

  // ================================================================
  // 🚀 ENTERPRISE FIX: BANNER IMPRESSION TRACKING (Intersection Observer)
  // ================================================================
  const bannerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasLoggedImpression = useRef<Map<number, boolean>>(new Map());
  const visibilityTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-banner-index"));
          if (isNaN(index)) continue;

          const banner = banners[index];
          if (!banner) continue;

          const bannerId = banner.desktopImage || `banner-grid-${index}`;
          const impressionKey = `pv_banner_imp_${bannerId}`;

          // ✅ Deduplication: Already logged this session?
          if (typeof window !== "undefined" && sessionStorage.getItem(impressionKey)) {
            hasLoggedImpression.current.set(index, true);
            continue;
          }

          if (entry.isIntersecting) {
            // ✅ Google Standard: 50% visibility for 1 second
            const timer = setTimeout(() => {
              if (!hasLoggedImpression.current.get(index)) {
                hasLoggedImpression.current.set(index, true);
                sessionStorage.setItem(impressionKey, "true");

                logUserEvent("banner_impression", pathname, {
                  banner_id: bannerId,
                  banner_type: `homepage_master_grid_${desktopLayout}`,
                  banner_title: banner.heading || banner.altText || `Promo Grid Item ${index + 1}`,
                  target_url: banner.link || "#",
                  position_index: index + 1,
                });
              }
            }, 1000);
            visibilityTimers.current.set(index, timer);
          } else {
            // ✅ Cancel timer if user scrolls away before 1 second
            const existingTimer = visibilityTimers.current.get(index);
            if (existingTimer) {
              clearTimeout(existingTimer);
              visibilityTimers.current.delete(index);
            }
          }
        }
      },
      { threshold: 0.5 } // ✅ Google Standard: 50% visibility
    );

    // Observe each banner element
    for (const [index, ref] of bannerRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => {
      observer.disconnect();
      for (const [, timer] of visibilityTimers.current) {
        clearTimeout(timer);
      }
      visibilityTimers.current.clear();
    };
  }, [banners, desktopLayout, pathname]);

  // ================================================================
  // 🚀 BANNER CLICK TRACKING
  // ================================================================
  const handleGridBannerClick = (banner: BannerItem, index: number) => {
    logUserEvent("banner_click", pathname, {
      banner_id: banner.desktopImage || `banner-grid-${index}`,
      banner_type: `homepage_master_grid_${desktopLayout}`,
      banner_title: banner.heading || banner.altText || `Promo Grid Item ${index + 1}`,
      target_url: banner.link || "#",
      position_index: index + 1,
    });
  };

  const setBannerRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      bannerRefs.current.set(index, el);
    } else {
      bannerRefs.current.delete(index);
    }
  };

  return (
    <section
      className={`w-full py-6 ${containerSettings?.fullWidth ? "" : "max-w-480 mx-auto px-4 md:px-8"}`}
    >
      <div className={`${mobileWrapperClass} ${gridColsClass} ${gapClass}`}>
        {banners.map((banner, index) => {
          let spanClass = "col-span-1";
          if (desktopLayout === "mosaic-left" && index === 0)
            spanClass = "md:col-span-2 md:row-span-2";
          if (desktopLayout === "mosaic-right" && index === banners.length - 1)
            spanClass = "md:col-span-2 md:row-span-2";
          if (desktopLayout === "hero-stack" && index === 0)
            spanClass = "md:col-span-3";

          const mobileItemClass =
            mobileBehavior === "scroll"
              ? "min-w-[85vw] snap-center shrink-0"
              : "";

          const textPosClass = {
            center: "justify-center items-center text-center",
            "bottom-left": "justify-end items-start text-left",
            "bottom-center": "justify-end items-center text-center",
            "top-left": "justify-start items-start text-left",
          }[banner.contentPosition || "center"];

          return (
            <div
              key={index}
              ref={setBannerRef(index)}
              data-banner-index={index}
              style={getHeightStyle()}
              className={`relative group overflow-hidden ${spanClass} ${mobileItemClass} ${radiusClass} 
              ${heightMode === "aspect" ? aspectRatio : heightMode === "fixed" ? fixedHeight : "h-auto"}`}
            >
              <Link
                href={banner.link || "#"}
                onClick={() => handleGridBannerClick(banner, index)}
                className="block w-full h-full relative"
                aria-label={banner.heading || "Promotion"}
              >
                <Image
                  src={banner.desktopImage}
                  alt={banner.altText || "Promotion"}
                  fill
                  priority={index === 0}
                  className="hidden md:block object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <Image
                  src={banner.mobileImage || banner.desktopImage}
                  alt={banner.altText || "Promotion"}
                  fill
                  className="block md:hidden object-cover"
                  sizes="100vw"
                />

                {(banner.heading || banner.buttonText) && (
                  <div
                    className={`absolute inset-0 p-6 md:p-10 flex flex-col bg-black/10 group-hover:bg-black/20 transition-all ${textPosClass}`}
                  >
                    <div className="max-w-xl transition-transform duration-500 group-hover:-translate-y-2">
                      {banner.heading && (
                        <h3
                          className={`text-2xl md:text-4xl font-black uppercase tracking-tighter drop-shadow-lg mb-2 ${banner.textColor || "text-white"}`}
                        >
                          {banner.heading}
                        </h3>
                      )}
                      {banner.subheading && (
                        <p
                          className={`text-sm md:text-lg font-medium drop-shadow-md mb-6 ${banner.textColor || "text-white"} opacity-90`}
                        >
                          {banner.subheading}
                        </p>
                      )}
                      {banner.buttonText && (
                        <span className="inline-block px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full shadow-2xl hover:bg-brand-primary hover:text-white transition-all">
                          {banner.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}