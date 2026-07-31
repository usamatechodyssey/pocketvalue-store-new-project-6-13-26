// src/app/components/ui/Coupon.tsx

"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface CouponProps {
  bannerData: any; // Payload data object
}

export default function Coupon({ bannerData }: CouponProps) {
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasLoggedImpression = useRef(false);
  const visibilityTimer = useRef<NodeJS.Timeout | null>(null);

  // Agar data na aaye to kuch render mat karo
  if (!bannerData || !bannerData.mediaUrls) return null;

  const { mediaUrls, width, height, objectFit, altText, link } = bannerData;

  const dynamicStyles = {
    "--width-mobile": width?.mobile ? width.mobile : "100%",
    "--width-tablet": width?.tablet ? width.tablet : "100%",
    "--width-desktop": width?.desktop ? width.desktop : "100%",
    "--height-mobile": height?.mobile ? height.mobile : "auto",
    "--height-tablet": height?.tablet ? height.tablet : "auto",
    "--height-desktop": height?.desktop ? height.desktop : "auto",
  } as React.CSSProperties;

  const href = link?.slug ? `/${link._type === 'category' ? 'category' : 'product'}/${link.slug}` : "";

  // ================================================================
  // 🚀 ENTERPRISE FIX: BANNER IMPRESSION TRACKING (Intersection Observer)
  // ================================================================
  useEffect(() => {
    const bannerId = bannerData.id || bannerData._id || "coupon-banner";
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
          visibilityTimer.current = setTimeout(() => {
            if (!hasLoggedImpression.current) {
              hasLoggedImpression.current = true;
              sessionStorage.setItem(impressionKey, "true");
              
              logUserEvent("banner_impression", pathname, {
                banner_id: bannerId,
                banner_type: "coupon_promotion_banner",
                banner_title: altText || "Promotional Coupon",
                target_url: href || undefined,
              });
            }
          }, 1000);
        } else {
          // ✅ Cancel timer if user scrolls away before 1 second
          if (visibilityTimer.current) {
            clearTimeout(visibilityTimer.current);
            visibilityTimer.current = null;
          }
        }
      },
      { threshold: 0.5 } // ✅ Google Standard: 50% visibility
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
        visibilityTimer.current = null;
      }
    };
  }, [bannerData.id, bannerData._id, altText, href, pathname]);

  // ================================================================
  // 🚀 BANNER CLICK TRACKING
  // ================================================================
  const handleBannerClick = () => {
    logUserEvent("banner_click", pathname, {
      banner_id: bannerData.id || bannerData._id || "coupon-banner",
      banner_type: "coupon_promotion_banner",
      target_url: href,
      alt_text: altText || "Promotional Coupon",
    });
  };

  const BannerContent = (
    <div
      ref={bannerRef}
      className="relative overflow-hidden mx-auto w-full h-(--height-mobile) md:w-(--width-tablet) md:h-(--height-tablet) lg:w-(--width-desktop) lg:h-(--height-desktop)"
      style={dynamicStyles}
    >
      <picture className="block w-full h-full">
        {mediaUrls.desktop?.asset?.url && (
          <source media="(min-width: 1024px)" srcSet={mediaUrls.desktop.asset.url} />
        )}
        {mediaUrls.tablet?.asset?.url && (
          <source media="(min-width: 768px)" srcSet={mediaUrls.tablet.asset.url} />
        )}
        {(mediaUrls.mobile?.asset?.url || mediaUrls.desktop?.asset?.url) && (
          <img
            src={mediaUrls.mobile?.asset?.url || mediaUrls.desktop?.asset?.url || ""}
            alt={altText || "Promotional Coupon"}
            className={`w-full h-full object-${objectFit || "cover"}`}
            loading="eager"
          />
        )}
      </picture>
    </div>
  );

  return (
    <section className="w-full flex justify-center my-4 md:my-8 mb-6 md:mb-10">
      {href ? (
        <Link
          href={href}
          className="block w-full md:w-auto"
          onClick={handleBannerClick}
        >
          {BannerContent}
        </Link>
      ) : (
        <div className="w-full md:w-auto">{BannerContent}</div>
      )}
    </section>
  );
}