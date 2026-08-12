// 📂 src/app/features/storefront/catalog/components/product/InterestRecommendations.tsx

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { SimplifiedRecentProduct } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
import SanityProduct from "@/types";
import ProductCarousel from "@/app/features/storefront/catalog/components/home/ProductCarousel";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface InterestRecommendationsProps {
  history: SimplifiedRecentProduct[];
  currentProductId: string;
  isLoaded?: boolean; // ✅ Optional in interface to keep caller compatibility safe
  lowStockThreshold?: number;
  fallbackCategorySlugs?: string[];
}

// Client-side cache
const recommendationCache = new Map<string, SanityProduct[]>();

export default function InterestRecommendations({
  history,
  currentProductId,
  lowStockThreshold = 5,
  fallbackCategorySlugs = [],
}: InterestRecommendationsProps) {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cacheKeyRef = useRef<string>("");

  // FAST-PATH CATEGORY SLUGS RESOLVER
  const categorySlugs = useMemo(() => {
    const slugsSet = new Set<string>();
    history.forEach((product) => {
      product.categorySlugs?.forEach((slug) => slugsSet.add(slug));
    });
    
    if (slugsSet.size === 0 && fallbackCategorySlugs.length > 0) {
      fallbackCategorySlugs.forEach((s) => slugsSet.add(s));
    }

    return Array.from(slugsSet);
  }, [history, fallbackCategorySlugs]);

  // Fetch Personalized Recommendations
  useEffect(() => {
    if (categorySlugs.length === 0) {
      setProducts([]);
      return;
    }

    const cacheKey = [...categorySlugs].sort().join(",");
    cacheKeyRef.current = cacheKey;

    if (recommendationCache.has(cacheKey)) {
      const cached = recommendationCache.get(cacheKey) || [];
      setProducts(cached.filter((p) => p._id !== currentProductId).slice(0, 10));
      return;
    }

    async function fetchPersonalized() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { type: "interest" },
            filters: {
              categories: categorySlugs,
            },
            page: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedProducts = (data.products as SanityProduct[]) || [];
          recommendationCache.set(cacheKey, fetchedProducts);
          const filtered = fetchedProducts.filter(
            (p) => p._id !== currentProductId
          );
          setProducts(filtered.slice(0, 10));
        }
      } catch (err) {
        console.error("Personalized recommendation failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonalized();
  }, [categorySlugs, currentProductId]);

  if (categorySlugs.length === 0) return null;

  // SINGLE-ROW MOBILE SKELETON FIX
  if (isLoading) {
    return (
      <div className="w-full py-12 bg-white dark:bg-gray-950 border-t border-zinc-200/60 dark:border-zinc-800/80">
        <div className="max-w-480 mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="w-12 h-1 bg-brand-primary mt-1.5 rounded-full" />
            </div>
          </div>
          <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[calc(50%-6px)] sm:w-auto shrink-0">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <ProductCarousel
      title="Recommended For You"
      products={products}
      lowStockThreshold={lowStockThreshold}
      viewAllLink="/search?sort=best-selling"
    />
  );
}