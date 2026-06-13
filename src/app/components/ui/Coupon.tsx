
import React from "react";
import Link from "next/link";
// 🛑 OLD SANITY IMPORTS (Remove)
// import { client } from "@/sanity/lib/client";
// import { COUPON_BANNER_QUERY } from "@/sanity/lib/queries";
// import { CouponBannerType } from "@/sanity/types/couponBannerTypes";

// ✅ NAYA: Props interface define karein
interface CouponProps {
  bannerData: any; // Payload se jo data ayega
}

export default function Coupon({ bannerData }: CouponProps) {
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

  // Link handle karna
  const href = link?.slug ? `/${link._type === 'category' ? 'category' : 'product'}/${link.slug}` : "";

  const BannerContent = (
    <div
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
        <Link href={href} className="block w-full md:w-auto">
          {BannerContent}
        </Link>
      ) : (
        <div className="w-full md:w-auto">{BannerContent}</div>
      )}
    </section>
  );
}