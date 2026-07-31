

// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation"; // 🚀 Hook import
// import Link from "next/link";
// import Image from "next/image";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { HeroCarouselSlide } from "@/types"; // ✅ Types definition synced
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

// export default function HeroCarousel({
//   banners,
// }: {
//   banners: HeroCarouselSlide[];
// }) {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loaded, setLoaded] = useState(false);
//   const pathname = usePathname();

//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
//     {
//       loop: true,
//       initial: 0,
//       drag: true,
//       created: () => setLoaded(true),
//       slideChanged: (s) => setCurrentSlide(s.track.details.rel),
//     },
//     [
//       (slider) => {
//         let timeout: ReturnType<typeof setTimeout>;
//         let mouseOver = false;
//         function clearNextTimeout() { clearTimeout(timeout); }
//         function nextTimeout() {
//           clearTimeout(timeout);
//           if (mouseOver) return;
//           timeout = setTimeout(() => { slider.next(); }, 6000);
//         }
//         slider.on("created", () => {
//           slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
//           slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
//           nextTimeout();
//         });
//         slider.on("dragStarted", clearNextTimeout);
//         slider.on("animationEnded", nextTimeout);
//         slider.on("updated", nextTimeout);
//       },
//     ]
//   );

//   if (!banners || banners.length === 0) return null;

//   // =================================================================
//   // 🚀 GAP #6: TRACK HERO BANNER CLICK CTR (banner_click)
//   // =================================================================
//   const handleHeroClick = (banner: HeroCarouselSlide, index: number) => {
//     logUserEvent('banner_click', pathname, {
//       banner_id: banner._id,
//       banner_type: 'homepage_hero_slideshow',
//       banner_title: banner.title,
//       target_url: banner.link || "#",
//       position_index: index + 1 // Dynamic rank calculation
//     });
//   };
//   // =================================================================

//   return (
//     <section className="w-full bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
//       <div className="relative w-full aspect-4/5 md:aspect-3/1">
        
//         <div ref={sliderRef} className="keen-slider h-full w-full absolute inset-0">
//           {banners.map((banner, idx) => (
//             <div 
//               key={banner._id} 
//               className="keen-slider__slide relative w-full h-full min-w-full"
//             >
//               <Link
//                 href={banner.link || "#"}
//                 onClick={() => handleHeroClick(banner, idx)} // ✅ Click telemetry bound
//                 className="block w-full h-full relative cursor-pointer"
//                 aria-label={`View Offer: ${banner.title}`}
//               >
//                 {/* DESKTOP IMAGE */}
//                 <div className="hidden md:block w-full h-full relative">
//                   <Image
//                     src={banner.desktopImage}
//                     alt={banner.title || "Hero Banner"}
//                     fill
//                     priority={idx === 0}
//                     sizes="90vw"
//                     quality={95}
//                     className="object-cover"
//                   />
//                 </div>

//                 {/* MOBILE IMAGE */}
//                 <div className="block md:hidden w-full h-full relative">
//                   <Image
//                     src={banner.mobileImage}
//                     alt={banner.title || "Hero Banner"}
//                     fill
//                     priority={idx === 0}
//                     sizes="90vw"
//                     quality={90}
//                     className="object-cover"
//                   />
//                 </div>

//                 <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
//               </Link>
//             </div>
//           ))}
//         </div>

//         {loaded && banners.length > 1 && (
//           <>
//             <button
//               onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
//               aria-label="Previous Slide"
//               className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
//             >
//               <ChevronLeft size={24} strokeWidth={2.5} className="mr-0.5" />
//             </button>

//             <button
//               onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
//               aria-label="Next Slide"
//               className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
//             >
//               <ChevronRight size={24} strokeWidth={2.5} className="ml-0.5" />
//             </button>

//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
//               {banners.map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => instanceRef.current?.moveToIdx(idx)}
//                   aria-label={`Go to slide ${idx + 1}`}
//                   className={`transition-all duration-500 rounded-full ${
//                     currentSlide === idx
//                       ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
//                       : "w-2 h-2 bg-white/50 hover:bg-white/80"
//                   }`}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCarouselSlide } from "@/types";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

export default function HeroCarousel({
  banners,
}: {
  banners: HeroCarouselSlide[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  const sliderRef = useRef<HTMLDivElement>(null);
  const hasLoggedImpression = useRef<Set<string>>(new Set());
  const impressionTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const [sliderRefCallback, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      initial: 0,
      drag: true,
      created: () => setLoaded(true),
      slideChanged: (s) => setCurrentSlide(s.track.details.rel),
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;
        function clearNextTimeout() { clearTimeout(timeout); }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => { slider.next(); }, 6000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => { mouseOver = true; clearNextTimeout(); });
          slider.container.addEventListener("mouseout", () => { mouseOver = false; nextTimeout(); });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  useEffect(() => {
    if (!loaded || !banners || banners.length === 0) return;

    const element = sliderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          banners.forEach((banner, index) => {
            const impressionKey = `pv_banner_imp_${banner._id}`;

            if (typeof window !== "undefined" && sessionStorage.getItem(impressionKey)) {
              hasLoggedImpression.current.add(banner._id);
              return;
            }
            if (hasLoggedImpression.current.has(banner._id)) return;

            const timer = setTimeout(() => {
              if (!hasLoggedImpression.current.has(banner._id)) {
                hasLoggedImpression.current.add(banner._id);
                sessionStorage.setItem(impressionKey, "true");

                logUserEvent("banner_impression", pathname, {
                  banner_id: banner._id,
                  banner_type: "homepage_hero_slideshow",
                  banner_title: banner.title,
                  target_url: banner.link || "#",
                  position_index: index + 1,
                });
              }
            }, 1000);

            impressionTimers.current.set(banner._id, timer);
          });
        } else {
          for (const [, timer] of impressionTimers.current) {
            clearTimeout(timer);
          }
          impressionTimers.current.clear();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      for (const [, timer] of impressionTimers.current) {
        clearTimeout(timer);
      }
      impressionTimers.current.clear();
    };
  }, [loaded, banners, pathname]);

  if (!banners || banners.length === 0) return null;

  const handleHeroClick = (banner: HeroCarouselSlide, index: number) => {
    logUserEvent("banner_click", pathname, {
      banner_id: banner._id,
      banner_type: "homepage_hero_slideshow",
      banner_title: banner.title,
      target_url: banner.link || "#",
      position_index: index + 1,
    });
  };

  return (
    <section
      className="w-full bg-gray-100 dark:bg-gray-900 overflow-hidden relative"
      role="region"
      aria-label="Hero Carousel"
    >
      <div className="relative w-full aspect-4/5 md:aspect-3/1">
        <div ref={sliderRefCallback} className="keen-slider h-full w-full absolute inset-0" role="list">
          {banners.map((banner, idx) => (
            <div
              key={banner._id}
              className="keen-slider__slide relative w-full h-full min-w-full"
              role="listitem"
            >
              <Link
                href={banner.link || "#"}
                onClick={() => handleHeroClick(banner, idx)}
                className="block w-full h-full relative cursor-pointer"
                aria-label={`View Offer: ${banner.title}`}
              >
                {/* DESKTOP IMAGE */}
                <div className="hidden md:block w-full h-full relative">
                  <Image
                    src={banner.desktopImage}
                    alt={banner.title || "Hero Banner"}
                    fill
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    // ✅ FIX: Accurate sizes for actual rendered width
                    sizes="(max-width: 768px) 100vw, 90vw"
                    quality={95}
                    className="object-cover"
                  />
                </div>

                {/* MOBILE IMAGE */}
                <div className="block md:hidden w-full h-full relative">
                  <Image
                    src={banner.mobileImage}
                    alt={banner.title || "Hero Banner"}
                    fill
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    // ✅ FIX: Mobile takes full width
                    sizes="100vw"
                    quality={90}
                    className="object-cover"
                  />
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
              </Link>
            </div>
          ))}
        </div>

        {loaded && banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                instanceRef.current?.prev();
              }}
              aria-label="Previous Slide"
              className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="mr-0.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                instanceRef.current?.next();
              }}
              aria-label="Next Slide"
              className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/90 backdrop-blur-md rounded-full items-center justify-center text-white hover:text-black z-20 transition-all duration-300 ease-out border border-white/20 hover:scale-110 shadow-lg"
            >
              <ChevronRight size={24} strokeWidth={2.5} className="ml-0.5" />
            </button>

            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
              role="tablist"
              aria-label="Carousel navigation"
            >
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={currentSlide === idx ? "step" : undefined}
                  role="tab"
                  className={`transition-all duration-500 rounded-full ${
                    currentSlide === idx
                      ? "w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}