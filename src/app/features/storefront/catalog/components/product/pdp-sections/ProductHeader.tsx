// src/app/components/product/pdp-sections/ProductHeader.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, ChevronDown, CheckCircle, XCircle, AlertTriangle, Hash } from 'lucide-react';
import SanityProduct, { ProductVariant } from '@/types';
import { logUserEvent } from '@/app/features/admin/analytics-telemetry/action/trackingActions';

interface ProductHeaderProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  averageRating: number;
  totalReviews: number;
  isSelectionInStock: boolean;
  lowStockThreshold: number; 
}

export default function ProductHeader({
  product,
  selectedVariant,
  averageRating,
  totalReviews,
  isSelectionInStock,
  lowStockThreshold, 
}: ProductHeaderProps) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const pathname = usePathname();

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stockCount = selectedVariant?.stock;
  const isLowStock = isSelectionInStock && stockCount !== undefined && stockCount > 0 && stockCount <= lowStockThreshold;

  // Scarcity Telemetry (Gap #28)
  useEffect(() => {
    if (isLowStock && selectedVariant) {
      const trackingKey = `pv_scarcity_exposed_${product._id}_${selectedVariant._key}`;
      
      if (typeof window !== "undefined" && !sessionStorage.getItem(trackingKey)) {
        sessionStorage.setItem(trackingKey, "true");
        logUserEvent('scarcity_exposure', pathname, {
          productId: product._id,
          variant_sku: selectedVariant.sku || "N/A",
          variant_key: selectedVariant._key,
          remaining_stock: stockCount,
          low_stock_threshold: lowStockThreshold
        });
      }
    }
  }, [isLowStock, selectedVariant, product._id, stockCount, lowStockThreshold, pathname]);

  return (
    <div className="flex flex-col gap-3 mb-6">
      
      {/* 1. TOP META ROW: Brand & SKU */}
      <div className="flex items-center justify-between">
         {product.brand && (
            <Link 
                href={`/search?brand=${product.brand.slug}`}
                className="text-xs font-bold text-brand-primary uppercase tracking-wider hover:underline hover:text-brand-primary-hover transition-colors"
            >
                {product.brand.name}
            </Link>
         )}
         
         {selectedVariant?.sku && (
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Hash size={10} />
                {selectedVariant.sku}
            </span>
         )}
      </div>

      {/* 2. TITLE SECTION */}
      <div>
        <h1
          className={`text-2xl md:text-3xl lg:text-4xl font-clash font-bold text-gray-900 dark:text-white leading-tight transition-all duration-300 ${isTitleExpanded ? "" : "line-clamp-2"}`}
          title={product.title}
        >
          {product.title}
        </h1>
        
        {product.title.length > 80 && (
          <button
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
            className="text-xs font-bold text-gray-500 hover:text-brand-primary mt-1.5 flex items-center gap-1 transition-colors"
          >
            {isTitleExpanded ? "Show Less" : "Read Full Title"}
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTitleExpanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* 3. BADGES ROW (Ratings & Stock) */}
      <div className="flex flex-wrap items-center gap-3 mt-1">
        
        {/* Rating Badge */}
        {averageRating > 0 ? (
          <button 
            onClick={scrollToReviews}
            // ✅ FIX: Added aria-label for screen readers
            aria-label="Scroll to product reviews"
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/10 rounded-full border border-yellow-100 dark:border-yellow-800/50 transition-all hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <Star size={14} className="text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-yellow-200 dark:border-yellow-800 pl-2 ml-1 group-hover:text-gray-700 dark:group-hover:text-gray-300">
              {totalReviews} Reviews
            </span>
          </button>
        ) : (
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <Star size={12} className="text-gray-300" /> No Reviews Yet
            </div>
        )}

        {/* Stock Badge (With Low Stock Logic) */}
        {selectedVariant && (
            <div
              // ✅ FIX: Added role="status" and aria-live="polite" so screen readers announce stock changes
              role="status"
              aria-live="polite"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm
              ${
                !isSelectionInStock
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  : isLowStock
                  ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 animate-pulse"
                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              }`}
            >
              {!isSelectionInStock ? (
                 <XCircle size={14} />
              ) : isLowStock ? (
                 <AlertTriangle size={14} />
              ) : (
                 <CheckCircle size={14} />
              )}

              <span>
                  {!isSelectionInStock 
                    ? "Out of Stock" 
                    : isLowStock 
                    ? `Hurry! Only ${stockCount} left` 
                    : "In Stock"
                  }
              </span>
            </div>
        )}
      </div>
    </div>
  );
}