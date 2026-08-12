
// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import { SanityImageObject } from "@/types";
// import { PlayCircle, ZoomIn, ChevronUp, ChevronDown } from "lucide-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { type Swiper as SwiperType } from "swiper"; 
// import { usePathname } from "next/navigation";

// import {
//   FreeMode,
//   Navigation,
//   Thumbs,
//   Mousewheel,
//   Pagination,
// } from "swiper/modules";

// import Lightbox from "yet-another-react-lightbox";
// import Zoom from "yet-another-react-lightbox/plugins/zoom";
// import "yet-another-react-lightbox/styles.css";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// // ================================================================
// // 🎥 ENTERPRISE FIX: YouTube Detection + Embed URL Generator
// // ================================================================
// const YOUTUBE_DOMAINS = ["youtube.com", "youtu.be", "www.youtube.com"];

// function detectVideoType(url: string): "youtube" | "direct" {
//   if (!url) return "direct";
//   const lower = url.toLowerCase();
//   for (const domain of YOUTUBE_DOMAINS) {
//     if (lower.includes(domain)) {
//       return "youtube";
//     }
//   }
//   return "direct";
// }

// function getYouTubeEmbedUrl(url: string): string {
//   let videoId = "";
  
//   // Extract video ID from various YouTube URL formats
//   if (url.includes("watch?v=")) {
//     try {
//       const urlObj = new URL(url);
//       videoId = urlObj.searchParams.get("v") || "";
//     } catch {
//       // Fallback: split manually
//       const parts = url.split("watch?v=");
//       if (parts.length > 1) {
//         videoId = parts[1].split("&")[0];
//       }
//     }
//   } else if (url.includes("youtu.be/")) {
//     const parts = url.split("youtu.be/");
//     if (parts.length > 1) {
//       videoId = parts[1].split("?")[0];
//     }
//   } else {
//     // Assume it's already just the ID
//     videoId = url;
//   }

//   // ✅ Privacy-enhanced domain + performance params
//   return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;
// }

// interface GalleryItem {
//   type: "image" | "video";
//   image?: SanityImageObject;
//   videoUrl?: string;
//   altText: string;
// }

// interface ProductGalleryProps {
//   images: SanityImageObject[];
//   videoUrl?: string;
//   productTitle: string;
// }

// export default function ProductGallery({
//   images,
//   videoUrl,
//   productTitle,
// }: ProductGalleryProps) {
//   const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [activeSlideIndex, setActiveSlideIndex] = useState(0);
//   const [isBeginning, setIsBeginning] = useState(true);
//   const [isEnd, setIsEnd] = useState(false);
  
//   const pathname = usePathname();

//   const galleryItems = useMemo(() => {
//     const items: GalleryItem[] = [];
//     if (videoUrl) {
//       const videoType = detectVideoType(videoUrl);
//       items.push({
//         type: "video",
//         videoUrl,
//         image: images?.[0],
//         altText: `${productTitle} video`,
//         // ✅ Store video type for rendering logic
//         _videoType: videoType,
//       } as any);
//     }
//     if (images) {
//       images.forEach((img, i) =>
//         items.push({
//           type: "image",
//           image: img,
//           altText: `${productTitle} image ${i + 1}`,
//         }),
//       );
//     }
//     return items;
//   }, [images, videoUrl, productTitle]);

//   const lightboxSlides = galleryItems
//     .filter((item) => item.type === "image" && item.image)
//     .map((item) => ({ src: urlFor(item.image!).url() }));

//   useEffect(() => {
//     if (thumbsSwiper && !thumbsSwiper.destroyed) {
//       const updateArrowState = () => {
//         setIsBeginning(thumbsSwiper.isBeginning);
//         setIsEnd(thumbsSwiper.isEnd);
//       };
//       thumbsSwiper.on("fromEdge", updateArrowState);
//       thumbsSwiper.on("toEdge", updateArrowState);
//       thumbsSwiper.on("slideChange", updateArrowState);
//       updateArrowState();
//       return () => {
//         thumbsSwiper.off("fromEdge", updateArrowState);
//         thumbsSwiper.off("toEdge", updateArrowState);
//         thumbsSwiper.off("slideChange", updateArrowState);
//       };
//     }
//   }, [thumbsSwiper]);

//   if (galleryItems.length === 0) {
//     return (
//       <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
//         <p className="text-gray-500">No media found</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <style jsx global>{`
//         .product-gallery-thumbs.swiper-vertical .swiper-wrapper {
//           height: auto;
//           justify-content: flex-start;
//         }
//         .product-gallery-thumbs .swiper-slide {
//           opacity: 0.6;
//           transition: opacity 0.3s ease;
//         }
//         .product-gallery-thumbs .swiper-slide-thumb-active {
//           opacity: 1;
//         }
//         .product-gallery-thumbs .swiper-slide-thumb-active .thumb-border {
//           border-color: #f97316; 
//         }
//         .thumb-arrow {
//           position: absolute;
//           left: 50%;
//           transform: translateX(-50%);
//           z-index: 10;
//           width: 32px;
//           height: 32px;
//           background-color: white;
//           border: 1px solid #e5e7eb;
//           border-radius: 50%;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//           cursor: pointer;
//           color: #333;
//           transition: all 0.2s ease;
//         }
//         .thumb-arrow:hover {
//           background-color: #f97316;
//           color: white;
//         }
//         .thumb-arrow.disabled {
//           opacity: 0.3;
//           pointer-events: none;
//         }
//         .swiper-pagination-bullet {
//           background: #9ca3af;
//           opacity: 0.5;
//         }
//         .swiper-pagination-bullet-active {
//           background: #f97316;
//           opacity: 1;
//         }
//       `}</style>

//       <div className="relative w-full aspect-4/5 md:aspect-auto md:h-125 lg:h-137.5">
//         <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
//           {/* Thumbnails Sidebar */}
//           <div className="hidden md:block w-24 shrink-0 relative">
//             <Swiper
//               onSwiper={setThumbsSwiper}
//               direction="vertical"
//               spaceBetween={12}
//               slidesPerView="auto"
//               freeMode={true}
//               watchSlidesProgress={true}
//               modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
//               mousewheel={true}
//               navigation={{
//                 nextEl: ".thumb-arrow-next",
//                 prevEl: ".thumb-arrow-prev",
//               }}
//               className="product-gallery-thumbs h-full"
//               aria-label="Product thumbnail navigation"
//               role="navigation"
//             >
//               {galleryItems.map((item, index) => (
//                 <SwiperSlide 
//                   key={index} 
//                   className="cursor-pointer h-24!"
//                   aria-label={`Thumbnail ${index + 1} of ${galleryItems.length}`}
//                 >
//                   <div className="thumb-border relative w-full aspect-square bg-white dark:bg-gray-700 rounded-md border-2 border-transparent overflow-hidden">
//                     {item.image && (
//                       <Image
//                         src={urlFor(item.image).width(150).height(150).url()}
//                         alt={item.altText}
//                         fill
//                         sizes="10vw" 
//                         className="object-contain p-1"
//                       />
//                     )}
//                     {item.type === "video" && (
//                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                         <PlayCircle className="text-white w-6 h-6" />
//                       </div>
//                     )}
//                   </div>
//                 </SwiperSlide>
//               ))}
//             </Swiper>

//             {/* Navigation Arrows for Thumbs */}
//             {galleryItems.length > 5 && (
//               <>
//                 <button
//                   onClick={() => thumbsSwiper?.slidePrev()}
//                   className={`thumb-arrow thumb-arrow-prev hidden md:flex items-center justify-center ${isBeginning ? "disabled" : ""}`}
//                   style={{ top: "-10px" }}
//                   aria-label="Previous thumbnail"
//                 >
//                   <ChevronUp size={20} />
//                 </button>
//                 <button
//                   onClick={() => thumbsSwiper?.slideNext()}
//                   className={`thumb-arrow thumb-arrow-next hidden md:flex items-center justify-center ${isEnd ? "disabled" : ""}`}
//                   style={{ bottom: "-10px" }}
//                   aria-label="Next thumbnail"
//                 >
//                   <ChevronDown size={20} />
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Main Slider */}
//           <div className="relative w-full h-full md:flex-1 overflow-hidden group rounded-none md:rounded-2xl border-0 md:border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
//             <Swiper
//               modules={[Thumbs, Pagination]}
//               thumbs={{
//                 swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
//               }}
//               pagination={{ clickable: true }}
//               className="w-full h-full"
//               aria-label="Product image gallery"
//               role="region"
//               onSlideChange={(swiper) => {
//                 setActiveSlideIndex(swiper.activeIndex);
//                 logUserEvent('pdp_media_interaction', pathname, {
//                   action: 'gallery_slide_change',
//                   slide_index: swiper.activeIndex,
//                   total_slides: galleryItems.length
//                 });
//               }}
//             >
//               {galleryItems.map((item, index) => {
//                 const isVideo = item.type === "video";
//                 const videoType = (item as any)._videoType || "direct";

//                 return (
//                   <SwiperSlide key={index}>
//                     <div
//                       className={`relative w-full h-full ${
//                         item.type === "image" ? "cursor-zoom-in" : ""
//                       }`}
//                       onClick={() => {
//                         if (item.type === "image") {
//                           setLightboxOpen(true);
//                           logUserEvent('pdp_media_interaction', pathname, {
//                             action: 'image_lightbox_open',
//                             asset_index: index
//                           });
//                         }
//                       }}
//                     >
//                       {item.type === "image" && item.image ? (
//                         <Image
//                           src={urlFor(item.image).url()}
//                           alt={item.altText}
//                           fill
//                           sizes="(max-width: 768px) 100vw, 50vw"
//                           priority={index === 0} 
//                           className="object-contain p-0 md:p-4"
//                         />
//                       ) : isVideo && videoUrl ? (
//                         // ================================================================
//                         // 🎥 ENTERPRISE FIX: YouTube vs Direct Video Rendering
//                         // ================================================================
//                         videoType === "youtube" ? (
//                           // ✅ YouTube: Iframe Embed (Privacy-enhanced, lazy load)
//                           <div className="w-full h-full flex items-center justify-center bg-black">
//                             <iframe
//                               src={getYouTubeEmbedUrl(videoUrl)}
//                               className="w-full h-full"
//                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                               allowFullScreen
//                               loading="lazy"
//                               title={productTitle}
//                               sandbox="allow-scripts allow-same-origin allow-presentation"
//                             />
//                           </div>
//                         ) : (
//                           // ✅ Direct Video: Native HTML5 tag (MP4, WEBM, etc.)
//                           <div className="w-full h-full flex items-center justify-center bg-black">
//                             <video
//                               src={videoUrl}
//                               className="w-full h-full object-contain"
//                               controls
//                               autoPlay={false}
//                               muted
//                               onContextMenu={(e) => e.preventDefault()}
//                               controlsList="nodownload"
//                               playsInline
//                               aria-label={`Video for ${productTitle}`}
//                               onPlay={() => {
//                                 logUserEvent('pdp_media_interaction', pathname, {
//                                   action: 'video_play_start',
//                                   video_url: videoUrl,
//                                   video_type: 'direct'
//                                 });
//                               }}
//                             />
//                           </div>
//                         )
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-black">
//                           <p className="text-gray-400 text-sm">Video unavailable</p>
//                         </div>
//                       )}
//                     </div>
//                   </SwiperSlide>
//                 );
//               })}
//             </Swiper>

//             {/* Floating Magnifier Icon */}
//             {galleryItems[activeSlideIndex]?.type === "image" && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setLightboxOpen(true);
//                   logUserEvent('pdp_media_interaction', pathname, {
//                     action: 'image_lightbox_zoom_button_click',
//                     asset_index: activeSlideIndex
//                   });
//                 }}
//                 className="hidden md:flex absolute top-4 right-4 z-10 p-2.5 bg-white/70 backdrop-blur-sm rounded-full shadow-lg text-gray-700 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
//                 aria-label="Zoom in on image"
//               >
//                 <ZoomIn size={20} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Fullscreen Lightbox */}
//         <Lightbox
//           open={lightboxOpen}
//           close={() => setLightboxOpen(false)}
//           slides={lightboxSlides}
//           plugins={[Zoom]}
//           zoom={{ maxZoomPixelRatio: 3 }}
//           index={Math.max(0, activeSlideIndex - (videoUrl ? 1 : 0))}
//         />
//       </div>
//     </>
//   );
// }
// 📂 src/app/features/storefront/catalog/components/product/ProductGallery.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageObject } from "@/types";
import { PlayCircle, ZoomIn, ChevronUp, ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { type Swiper as SwiperType } from "swiper"; 
import { usePathname } from "next/navigation";

import {
  FreeMode,
  Navigation,
  Thumbs,
  Mousewheel,
  Pagination,
} from "swiper/modules";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

const YOUTUBE_DOMAINS = ["youtube.com", "youtu.be", "www.youtube.com"];

function detectVideoType(url: string): "youtube" | "direct" {
  if (!url) return "direct";
  const lower = url.toLowerCase();
  for (const domain of YOUTUBE_DOMAINS) {
    if (lower.includes(domain)) {
      return "youtube";
    }
  }
  return "direct";
}

function getYouTubeEmbedUrl(url: string): string {
  let videoId = "";
  
  if (url.includes("watch?v=")) {
    try {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } catch {
      const parts = url.split("watch?v=");
      if (parts.length > 1) {
        videoId = parts[1].split("&")[0];
      }
    }
  } else if (url.includes("youtu.be/")) {
    const parts = url.split("youtu.be/");
    if (parts.length > 1) {
      videoId = parts[1].split("?")[0];
    }
  } else {
    videoId = url;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
}

interface GalleryItem {
  type: "image" | "video";
  image?: SanityImageObject;
  videoUrl?: string;
  altText: string;
}

interface ProductGalleryProps {
  images: SanityImageObject[];
  videoUrl?: string;
  productTitle: string;
  isModal?: boolean; // ✅ NEW PROP: Disables top offset inside QuickView Modal
}

export default function ProductGallery({
  images,
  videoUrl,
  productTitle,
  isModal = false,
}: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  
  const pathname = usePathname();

  const galleryItems = useMemo(() => {
    const items: GalleryItem[] = [];
    if (videoUrl) {
      const videoType = detectVideoType(videoUrl);
      items.push({
        type: "video",
        videoUrl,
        image: images?.[0],
        altText: `${productTitle} video`,
        _videoType: videoType,
      } as any);
    }
    if (images) {
      images.forEach((img, i) =>
        items.push({
          type: "image",
          image: img,
          altText: `${productTitle} image ${i + 1}`,
        }),
      );
    }
    return items;
  }, [images, videoUrl, productTitle]);

  const lightboxSlides = galleryItems
    .filter((item) => item.type === "image" && item.image)
    .map((item) => ({ src: urlFor(item.image!).url() }));

  useEffect(() => {
    if (thumbsSwiper && !thumbsSwiper.destroyed) {
      const updateArrowState = () => {
        setIsBeginning(thumbsSwiper.isBeginning);
        setIsEnd(thumbsSwiper.isEnd);
      };
      thumbsSwiper.on("fromEdge", updateArrowState);
      thumbsSwiper.on("toEdge", updateArrowState);
      thumbsSwiper.on("slideChange", updateArrowState);
      updateArrowState();
      return () => {
        thumbsSwiper.off("fromEdge", updateArrowState);
        thumbsSwiper.off("toEdge", updateArrowState);
        thumbsSwiper.off("slideChange", updateArrowState);
      };
    }
  }, [thumbsSwiper]);

  if (galleryItems.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No media found</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .product-gallery-thumbs.swiper-vertical .swiper-wrapper {
          height: auto;
          justify-content: flex-start;
        }
        .product-gallery-thumbs .swiper-slide {
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        .product-gallery-thumbs .swiper-slide-thumb-active {
          opacity: 1;
        }
        .product-gallery-thumbs .swiper-slide-thumb-active .thumb-border {
          border-color: #ff8f32; 
        }
        .thumb-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 32px;
          height: 32px;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          color: #333;
          transition: all 0.2s ease;
        }
        .thumb-arrow:hover {
          background-color: #ff8f32;
          color: white;
        }
        .thumb-arrow.disabled {
          opacity: 0.3;
          pointer-events: none;
        }
        .swiper-pagination-bullet {
          background: #9ca3af;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #ff8f32;
          opacity: 1;
        }
      `}</style>

      {/* ✅ MODAL OFFSET FIX: When isModal=true, top-[120px] and sticky are disabled to remove top empty gap! */}
      <div
        className={`relative w-full aspect-4/5 md:aspect-auto md:h-125 lg:h-137.5 ${
          isModal
            ? "h-full top-0"
            : "lg:sticky lg:top-30 self-start"
        } transition-all duration-300 z-10`}
      >
        <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
          {/* Thumbnails Sidebar */}
          <div className="hidden md:block w-20 lg:w-24 shrink-0 relative">
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
              mousewheel={true}
              navigation={{
                nextEl: ".thumb-arrow-next",
                prevEl: ".thumb-arrow-prev",
              }}
              className="product-gallery-thumbs h-full"
              aria-label="Product thumbnail navigation"
              role="navigation"
            >
              {galleryItems.map((item, index) => (
                <SwiperSlide 
                  key={index} 
                  className="cursor-pointer h-20! lg:h-24!"
                  aria-label={`Thumbnail ${index + 1} of ${galleryItems.length}`}
                >
                  <div className="thumb-border relative w-full aspect-square bg-white dark:bg-gray-800 rounded-xl border-2 border-transparent overflow-hidden shadow-2xs">
                    {item.image && (
                      <Image
                        src={urlFor(item.image).width(150).height(150).url()}
                        alt={item.altText}
                        fill
                        sizes="10vw" 
                        className="object-contain p-1"
                      />
                    )}
                    {item.type === "video" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <PlayCircle className="text-white w-6 h-6" />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Arrows for Thumbs */}
            {galleryItems.length > 5 && (
              <>
                <button
                  onClick={() => thumbsSwiper?.slidePrev()}
                  className={`thumb-arrow thumb-arrow-prev hidden md:flex items-center justify-center ${isBeginning ? "disabled" : ""}`}
                  style={{ top: "-10px" }}
                  aria-label="Previous thumbnail"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => thumbsSwiper?.slideNext()}
                  className={`thumb-arrow thumb-arrow-next hidden md:flex items-center justify-center ${isEnd ? "disabled" : ""}`}
                  style={{ bottom: "-10px" }}
                  aria-label="Next thumbnail"
                >
                  <ChevronDown size={20} />
                </button>
              </>
            )}
          </div>

          {/* Main Slider */}
          <div className="relative w-full h-full md:flex-1 overflow-hidden group rounded-none md:rounded-2xl border-0 md:border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-gray-900 shadow-2xs">
            <Swiper
              modules={[Thumbs, Pagination]}
              thumbs={{
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              pagination={{ clickable: true }}
              className="w-full h-full"
              aria-label="Product image gallery"
              role="region"
              onSlideChange={(swiper) => {
                setActiveSlideIndex(swiper.activeIndex);
                logUserEvent('pdp_media_interaction', pathname, {
                  action: 'gallery_slide_change',
                  slide_index: swiper.activeIndex,
                  total_slides: galleryItems.length
                });
              }}
            >
              {galleryItems.map((item, index) => {
                const isVideo = item.type === "video";
                const videoType = (item as any)._videoType || "direct";

                return (
                  <SwiperSlide key={index}>
                    <div
                      className={`relative w-full h-full ${
                        item.type === "image" ? "cursor-zoom-in" : ""
                      }`}
                      onClick={() => {
                        if (item.type === "image") {
                          setLightboxOpen(true);
                          logUserEvent('pdp_media_interaction', pathname, {
                            action: 'image_lightbox_open',
                            asset_index: index
                          });
                        }
                      }}
                    >
                      {item.type === "image" && item.image ? (
                        <Image
                          src={urlFor(item.image).url()}
                          alt={item.altText}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0} 
                          className="object-contain p-0 md:p-2"
                        />
                      ) : isVideo && videoUrl ? (
                        videoType === "youtube" ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <iframe
                              src={getYouTubeEmbedUrl(videoUrl)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              title={productTitle}
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <video
                              src={videoUrl}
                              className="w-full h-full object-contain"
                              controls
                              autoPlay={false}
                              muted
                              onContextMenu={(e) => e.preventDefault()}
                              controlsList="nodownload"
                              playsInline
                              aria-label={`Video for ${productTitle}`}
                              onPlay={() => {
                                logUserEvent('pdp_media_interaction', pathname, {
                                  action: 'video_play_start',
                                  video_url: videoUrl,
                                  video_type: 'direct'
                                });
                              }}
                            />
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <p className="text-gray-400 text-sm">Video unavailable</p>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Floating Magnifier Icon */}
            {galleryItems[activeSlideIndex]?.type === "image" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                  logUserEvent('pdp_media_interaction', pathname, {
                    action: 'image_lightbox_zoom_button_click',
                    asset_index: activeSlideIndex
                  });
                }}
                className="hidden md:flex absolute top-4 right-4 z-10 p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full shadow-lg text-zinc-700 dark:text-zinc-200 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 border border-zinc-200/50 dark:border-zinc-800/50"
                aria-label="Zoom in on image"
              >
                <ZoomIn size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          plugins={[Zoom]}
          zoom={{ maxZoomPixelRatio: 3 }}
          index={Math.max(0, activeSlideIndex - (videoUrl ? 1 : 0))}
        />
      </div>
    </>
  );
}