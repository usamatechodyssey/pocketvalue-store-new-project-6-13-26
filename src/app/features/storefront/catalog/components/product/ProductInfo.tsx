
// /src/app/components/product/ProductInfo.tsx

"use client";

import { useMemo } from "react";
import SanityProduct, { ProductVariant } from "@/types";
import ProductHeader from "./pdp-sections/ProductHeader";
import ProductPricing from "./pdp-sections/ProductPricing";
import ProductVariantSelector from "./pdp-sections/ProductVariantSelector";
import ProductActions from "./pdp-sections/ProductActions"; // <-- Verify this import
import ProductMeta from "./pdp-sections/ProductMeta";

interface ProductInfoProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
  averageRating: number;
  totalReviews: number;
  lowStockThreshold: number; // ✅ NEW PROP
}

export default function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
  averageRating,
  totalReviews,
  lowStockThreshold, // ✅ NEW PROP
}: ProductInfoProps) {
  const isSelectionInStock = useMemo(() => {
    if (!selectedVariant) return false;
    if (selectedVariant.stock != null) return selectedVariant.stock > 0;
    return selectedVariant.inStock ?? false;
  }, [selectedVariant]);

  return (
    <div className="flex flex-col h-full">
      <ProductHeader
        product={product}
        selectedVariant={selectedVariant}
        averageRating={averageRating}
        totalReviews={totalReviews}
        isSelectionInStock={isSelectionInStock}
        lowStockThreshold={lowStockThreshold} // ✅ Prop pass ki
      />
      <ProductPricing selectedVariant={selectedVariant} />
      <ProductVariantSelector
        variants={product.variants}
        defaultVariant={product.defaultVariant}
        selectedVariant={selectedVariant}
        onVariantChange={onVariantChange}
      />

      {/* --- VERIFY THIS SECTION --- */}
      <ProductActions
        product={product}
        selectedVariant={selectedVariant}
        isSelectionInStock={isSelectionInStock}
      />
      {/* --------------------------- */}

      <ProductMeta />
    </div>
  );
}
