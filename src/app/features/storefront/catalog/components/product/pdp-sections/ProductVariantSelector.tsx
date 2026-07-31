
// src/app/components/product/pdp-sections/ProductVariantSelector.tsx (FIXED & COMPILE-SAFE)

"use client";

import { useMemo, useCallback } from "react";
import { ProductVariant } from "@/types";
import { RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; 
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; 

type SelectedOptions = Record<string, string>;

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  defaultVariant: ProductVariant;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function ProductVariantSelector({
  variants,
  defaultVariant,
  selectedVariant,
  onVariantChange,
}: ProductVariantSelectorProps) {

  const pathname = usePathname();

  // 1. Calculate Selected Options
  const selectedOptions: SelectedOptions = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.attributes.reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as SelectedOptions);
    }
    return {};
  }, [selectedVariant]);

  // 2. Extract Unique Options
  const options = useMemo(() => {
    const opts: Record<string, Set<string>> = {};
    variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        if (!opts[attr.name]) opts[attr.name] = new Set();
        opts[attr.name].add(attr.value);
      });
    });
    return Object.fromEntries(
      Object.entries(opts).map(([key, valueSet]) => [
        key,
        Array.from(valueSet).sort(),
      ])
    );
  }, [variants]);

  // 3. Handle User Selection
  const handleOptionSelect = (optionName: string, optionValue: string) => {
    const currentSelection = { ...selectedOptions, [optionName]: optionValue };
    
    // Find Exact Match
    let bestMatch = variants.find((v) =>
      Object.entries(currentSelection).every(([key, value]) =>
        v.attributes.some((attr) => attr.name === key && attr.value === value)
      )
    );

    // Fallback
    if (!bestMatch) {
      bestMatch = variants.find(
        (v) =>
          (v.stock ? v.stock > 0 : v.inStock) &&
          v.attributes.some(
            (a) => a.name === optionName && a.value === optionValue
          )
      );
    }

    // =================================================================
    // 🚀 TELEMETRY EVENT: Fixed compilation using bestMatch._key instead of ._id (Gap #38)
    // =================================================================
    if (bestMatch && selectedVariant) {
      const previousPrice = selectedVariant.salePrice ?? selectedVariant.price;
      const newPrice = bestMatch.salePrice ?? bestMatch.price;

      logUserEvent('variant_price_compared', pathname, {
        productId: bestMatch._key || "unknown", // ✅ FIXED: Using verified '_key' parameter
        variant_sku: bestMatch.sku || "N/A",
        option_name: optionName,
        option_value: optionValue,
        previous_price: previousPrice,
        new_price: newPrice,
        price_difference: newPrice - previousPrice
      });
    }
    // =================================================================

    onVariantChange(bestMatch || null);
  };

  // 4. Check Availability Logic
  const isOptionAvailable = useCallback(
    (optionName: string, optionValue: string): boolean => {
      const otherSelectedOptions = Object.entries(selectedOptions).filter(
        ([key]) => key !== optionName
      );
      return variants.some((variant) => {
        const matchesThisOption = variant.attributes.some(
          (attr) => attr.name === optionName && attr.value === optionValue
        );
        if (!matchesThisOption) return false;

        const matchesOthers = otherSelectedOptions.every(([key, value]) =>
          variant.attributes.some(
            (attr) => attr.name === key && attr.value === value
          )
        );

        const isInStock = variant.stock ? variant.stock > 0 : variant.inStock;
        
        return matchesOthers && isInStock;
      });
    },
    [variants, selectedOptions]
  );

  const handleClearSelection = () => onVariantChange(defaultVariant);
  const hasOptions = Object.keys(options).length > 0;

  if (!hasOptions) return null;

  return (
    <div className="space-y-6 mb-8">
      {Object.entries(options).map(([name, values]) => {
        const isColor = name.toLowerCase() === "color" || name.toLowerCase() === "colour";

        return (
          <div key={name}>
            {/* Label Header */}
            <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                    {name}: <span className="text-brand-primary ml-1">{selectedOptions[name]}</span>
                </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                const isSelected = selectedOptions[name] === value;
                const isAvailable = isOptionAvailable(name, value);

                if (isColor) {
                    const isLightColor = ['white', 'ivory', 'cream', 'yellow', 'beige', 'silver'].includes(value.toLowerCase());
                    
                    return (
                        <button
                            key={value}
                            onClick={() => handleOptionSelect(name, value)}
                            title={!isAvailable ? `${value} (Out of Stock)` : value}
                            className={`
                                relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                                ${isSelected 
                                    ? "ring-2 ring-offset-2 ring-brand-primary dark:ring-offset-gray-900 scale-110" 
                                    : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-gray-400 dark:hover:ring-gray-500 hover:scale-105"
                                }
                                ${!isAvailable ? "opacity-40 cursor-not-allowed grayscale-[0.5]" : ""}
                            `}
                            style={{ backgroundColor: value.toLowerCase() }}
                        >
                            {!isAvailable && (
                                <div className="absolute w-[120%] h-px bg-gray-500/80 -rotate-45" />
                            )}
                            
                            {isSelected && (
                                <Check 
                                    size={16} 
                                    strokeWidth={3}
                                    className={`drop-shadow-sm ${isLightColor ? 'text-gray-900' : 'text-white'}`} 
                                />
                            )}
                        </button>
                    );
                }

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionSelect(name, value)}
                    disabled={!isAvailable && !isSelected} 
                    className={`
                      relative px-5 py-2.5 text-sm font-bold rounded-xl border transition-all duration-200 min-w-14
                      active:scale-95
                      ${
                        isSelected
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg shadow-gray-900/20"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-primary"
                      }
                      ${!isAvailable ? "opacity-40 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 decoration-gray-400 line-through cursor-not-allowed border-dashed" : ""}
                    `}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Clear Selection Button */}
      <AnimatePresence>
        {selectedVariant && selectedVariant._key !== defaultVariant._key && (
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
            >
                <button
                onClick={handleClearSelection}
                className="group flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors mt-1"
                >
                    <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                        <RotateCcw size={12} />
                    </div>
                    Reset Options
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}