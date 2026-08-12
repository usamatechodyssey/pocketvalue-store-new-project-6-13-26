// 📂 src/app/features/storefront/catalog/components/product/RecentlyViewedSlider.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
import ProductCarousel from "@/app/features/storefront/catalog/components/home/ProductCarousel";
import ProductCardSkeleton from "./ProductCardSkeleton";
import SanityProduct from "@/types";

interface RecentlyViewedSliderProps {
  history: SimplifiedRecentProduct[];
  currentProductSlug: string;
  isLoaded: boolean;
  lowStockThreshold?: number;
}

export default function RecentlyViewedSlider({
  history,
  currentProductSlug,
  isLoaded,
  lowStockThreshold = 5,
}: RecentlyViewedSliderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter out current product and map lightweight objects to SanityProduct
  const recentProducts = useMemo(() => {
    return history
      .filter((item) => item.slug !== currentProductSlug)
      .map((item) => ({
        _id: item._id,
        _createdAt: new Date().toISOString(),
        title: item.title,
        slug: item.slug,
        variants: [],
        defaultVariant: {
          _key: "default-recent",
          name: "Default",
          price: item.price,
          salePrice: item.salePrice,
          inStock: true,
          images: item.image ? [item.image] : [],
          attributes: [],
        },
      })) as unknown as SanityProduct[];
  }, [history, currentProductSlug]);

  if (!mounted || !isLoaded) {
    return (
      <div className="w-full mt-12 md:mt-16 max-w-480 mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (recentProducts.length === 0) return null;

  // ✅ DIRECT REUSE: Renders your primary ProductCarousel.tsx component directly!
  return (
    <ProductCarousel
      title="Recently Viewed"
      products={recentProducts}
      lowStockThreshold={lowStockThreshold}
      viewAllLink=""
    />
  );
}