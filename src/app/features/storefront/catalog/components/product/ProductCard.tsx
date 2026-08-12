
// 📂 src/app/features/storefront/catalog/components/product/ProductCard.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiEye,
  FiTrash2,
  FiShare2,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { ProductVariant } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

interface ProductCardProps {
  product: SanityProduct;
  onQuickView?: (product: SanityProduct) => void;
  className?: string;
  isWishlistPage?: boolean;
  onRemoveFromWishlist?: () => void;
  rank?: number;
  isRecommendation?: boolean;
}

type ProductImage = {
  _key?: string;
  url?: string;
  asset?: {
    _ref?: string;
    _type?: "reference";
  };
};

export default function ProductCard({
  product,
  onQuickView,
  className = "",
  isWishlistPage = false,
  onRemoveFromWishlist,
  rank,
  isRecommendation = false,
}: ProductCardProps) {
  const { onAdd, handleAddToWishlist } = useStateContext();
  const defaultVariant: ProductVariant | undefined = product.defaultVariant;

  const swiperRef = useRef<SwiperType | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTriggeredImpression = useRef(false);
  const visibilityTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => {
      window.removeEventListener("resize", checkScreen);
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, []);

  // Viewport visibility guard
  useEffect(() => {
    const impressionKey = `pv_imp_logged_${product._id}`;

    if (
      !defaultVariant ||
      hasTriggeredImpression.current ||
      (typeof window !== "undefined" && sessionStorage.getItem(impressionKey))
    ) {
      return;
    }

    const price = defaultVariant.salePrice ?? defaultVariant.price;
    const sku = defaultVariant.sku || "N/A";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visibilityTimer.current = setTimeout(() => {
            const key = `pv_imp_logged_${product._id}`;
            if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "true");
              logUserEvent("product_impression", pathname, {
                productId: product._id,
                sku: sku,
                name: product.title,
                price: price,
                rank: rank || null,
                is_recommendation: isRecommendation,
              });
            }
            hasTriggeredImpression.current = true;
            observer.disconnect();
          }, 1500);
        } else {
          if (visibilityTimer.current) {
            clearTimeout(visibilityTimer.current);
            visibilityTimer.current = null;
          }
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
    };
  }, [pathname, product._id, defaultVariant, rank, isRecommendation]);

  if (!defaultVariant) return null;

  const originalPrice = defaultVariant.price;
  const salePrice = defaultVariant.salePrice;
  const displayPrice = salePrice ?? originalPrice;
  const isOnSale = !!(salePrice && salePrice < originalPrice);
  const discount = isOnSale
    ? Math.round(((originalPrice - salePrice!) / originalPrice) * 100)
    : 0;
  const isAvailable =
    defaultVariant.stock !== undefined
      ? defaultVariant.stock > 0
      : defaultVariant.inStock;

  const images = defaultVariant.images?.length
    ? defaultVariant.images
    : [{ _key: "placeholder", asset: { _ref: "/placeholder.svg" } }];

  const getImageUrl = (image: ProductImage | null | undefined): string => {
    if (!image) return "/placeholder.svg";
    if (image.url) return image.url;
    if (image.asset?._ref) {
      if (image.asset._ref === "/placeholder.svg") return "/placeholder.svg";
      try {
        return urlFor(image as any).width(600).height(750).url();
      } catch {
        return "/placeholder.svg";
      }
    }
    return "/placeholder.svg";
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleCardClick = () => {
    const isSearchPage = pathname.startsWith("/search");

    if (isSearchPage) {
      logUserEvent("search_result_click", pathname, {
        query: searchParams.get("q") || "unknown",
        clicked_product_id: product._id,
        rank_position: rank || 1,
      });
    } else {
      logUserEvent("product_click", pathname, {
        productId: product._id,
        sku: defaultVariant.sku || "N/A",
        name: product.title,
        price: displayPrice,
        rank: rank || null,
        is_recommendation: isRecommendation,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: product.title,
      text: `Check this out on PocketValue: ${product.title}`,
      url: `${window.location.origin}/product/${product.slug}`,
    };

    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        logUserEvent("product_shared", pathname, {
          method: "native_share",
          productId: product._id,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/product/${product.slug}`
    );
    setCopied(true);

    logUserEvent("product_shared", pathname, {
      method: "copy_link",
      productId: product._id,
    });

    setTimeout(() => {
      setCopied(false);
      setShowShareOptions(false);
    }, 2000);
  };

  const handleMouseEnter = () => {
    if (isDesktop && swiperRef.current && images.length > 1) {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);

      if (cardRef.current) {
        cardRef.current.style.setProperty("will-change", "transform");
      }

      swiperRef.current.slideNext(600);

      autoplayTimer.current = setInterval(() => {
        if (swiperRef.current && !swiperRef.current.animating) {
          swiperRef.current.slideNext(600);
        }
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    setShowShareOptions(false);

    if (cardRef.current) {
      cardRef.current.style.setProperty("will-change", "auto");
    }

    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }

    if (isDesktop && swiperRef.current) {
      swiperRef.current.slideTo(0, 0, false);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className={`h-auto min-h-0 group relative flex flex-col bg-white dark:bg-gray-900 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 shadow-2xs hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden rounded-2xl ${className} cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #ccc;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background-color: #ff8f32 !important;
          width: 12px;
          border-radius: 4px;
        }
        .product-card-swiper .swiper-slide {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
        }
        .product-card-swiper .swiper-slide-duplicate-active,
        .product-card-swiper .swiper-slide-duplicate-next,
        .product-card-swiper .swiper-slide-duplicate-prev {
          transition: none !important;
          -webkit-transition: none !important;
        }
        .product-card-swiper {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }
        .product-card-swiper .swiper-slide > div {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>

      {/* ============================================================
          TOP SECTION – Image Carousel
          ============================================================ */}
      <div className="relative w-full aspect-4/5 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block w-full h-full z-10"
        >
          <Swiper
            modules={[Pagination]}
            slidesPerView={1}
            loop={images.length > 1}
            speed={600}
            allowTouchMove={!isDesktop}
            pagination={{ clickable: true, dynamicBullets: true }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full h-full transform-3d translate-z-0 backface-hidden product-card-swiper"
          >
            {images.map((image: any, index) => (
              <SwiperSlide
                key={image._key || index}
                className="w-full h-full translate-z-0 backface-hidden"
              >
                <div className="relative w-full h-full aspect-4/5 overflow-hidden translate-z-0 backface-hidden">
                  <Image
                    src={getImageUrl(image)}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={index === 0}
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 origin-center backface-hidden translate-z-0"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Link>

        {/* ✅ LUXURIOUS TRANSLUCENT BADGES: Custom frosted glass labels sync nicely with HUD aesthetic */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 pointer-events-none select-none">
          {isOnSale && (
            <span className="bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide backdrop-blur-xs shadow-2xs">
              - {discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide backdrop-blur-xs shadow-2xs">
              New
            </span>
          )}
        </div>

        {/* GLASSMORPHIC ACTION BUTTONS */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-30 lg:translate-x-16 lg:group-hover:translate-x-0 transition-all duration-500">
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white rounded-xl shadow-2xs transition-all"
              aria-label="Share product"
            >
              <FiShare2 size={16} />
            </button>

            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: -10 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute right-full top-0 mr-2 flex items-center gap-2 p-2 bg-white/95 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl shadow-2xl z-50"
                >
                  <a
                    href={`https://wa.me/?text=Check this out: ${product.title} - ${window.location.origin}/product/${product.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-green-500 text-white rounded-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      logUserEvent("product_shared", pathname, {
                        method: "whatsapp_card_share",
                        productId: product._id,
                      });
                    }}
                    aria-label="Share on WhatsApp"
                  >
                    <FaWhatsapp size={14} />
                  </a>
                  <button
                    onClick={copyLink}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg hover:scale-110 transition-transform"
                    aria-label="Copy product link"
                  >
                    {copied ? (
                      <FiCheck className="text-emerald-500" size={14} />
                    ) : (
                      <FiCopy size={14} />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {onQuickView && (
            <button
              onClick={(e) => handleActionClick(e, () => onQuickView(product))}
              className="p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white rounded-xl shadow-2xs transition-all"
              aria-label="Quick view"
            >
              <FiEye size={16} />
            </button>
          )}

          <button
            onClick={(e) => {
              if (isWishlistPage && onRemoveFromWishlist) {
                handleActionClick(e, onRemoveFromWishlist);
              } else {
                handleActionClick(e, () => handleAddToWishlist(product));
              }
            }}
            className={`p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-2xs transition-all ${
              isWishlistPage
                ? "text-rose-500 hover:bg-rose-500 hover:text-white border-rose-500/20"
                : "text-zinc-700 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-500"
            }`}
            aria-label={
              isWishlistPage ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlistPage ? <FiTrash2 size={16} /> : <FiHeart size={16} />}
          </button>
        </div>

        {/* MOBILE ADD TO CART */}
        <button
          onClick={(e) =>
            isAvailable &&
            handleActionClick(e, () => onAdd(product, defaultVariant, 1))
          }
          disabled={!isAvailable}
          className={`lg:hidden absolute bottom-3 right-3 p-3 rounded-xl shadow-2xl z-30 active:scale-95 transition-all ${
            isAvailable ? "bg-brand-primary text-white" : "bg-zinc-400 dark:bg-zinc-800 text-zinc-500"
          }`}
          aria-label={isAvailable ? "Add to Cart" : "Out of Stock"}
        >
          <FiShoppingCart size={18} />
        </button>

        {/* DESKTOP ADD TO CART */}
        <button
          onClick={(e) =>
            isAvailable &&
            handleActionClick(e, () => onAdd(product, defaultVariant, 1))
          }
          disabled={!isAvailable}
          className={`hidden lg:flex absolute bottom-0 left-0 w-full py-4 items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white z-30 transition-all duration-500 translate-y-full group-hover:translate-y-0 ${
            isAvailable ? "bg-brand-primary hover:bg-zinc-950 dark:hover:bg-black" : "bg-zinc-500 dark:bg-zinc-800"
          }`}
          aria-label={isAvailable ? "Add to Cart" : "Out of Stock"}
        >
          <FiShoppingCart size={14} />
          {isAvailable ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      {/* ============================================================
          BOTTOM SECTION – Product Info
          ============================================================ */}
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col grow p-5 gap-1.5 bg-white dark:bg-gray-900"
      >
        <div className="flex items-center gap-1.5 select-none">
          {product.rating ? (
            <>
              <FiStar size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-zinc-500 font-bold font-mono">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                ({product.reviewCount})
              </span>
            </>
          ) : (
            <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              No Reviews Yet
            </span>
          )}
        </div>

        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-relaxed group-hover:text-brand-primary transition-colors min-h-9">
          {product.title}
        </h3>

        {/* ✅ DUAL CONTRAST PRICING: High-end monospaced pricing figures to match analytics typography */}
        <div className="mt-auto pt-2 flex items-center gap-2.5 select-none">
          <span className="text-base font-black text-brand-primary font-mono tracking-tight">
            Rs. {displayPrice.toLocaleString('en-PK')}
          </span>
          {isOnSale && (
            <span className="text-[10px] text-zinc-400 line-through font-mono">
              Rs. {originalPrice.toLocaleString('en-PK')}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}