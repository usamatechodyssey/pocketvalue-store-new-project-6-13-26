
// src/app/features/storefront/catalog/components/product/pdp-sections/ProductActions.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { toastError, toastSuccess } from "@/app/shared/components/helpers/CustomToasts";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { ProductVariant } from "@/types";
import QuantitySelector from "@/app/shared/components/ui/QuantitySelector"; 
import { ShoppingCart, Heart, Zap, ChevronsUp, Share2 } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import ProductActionSheet from "./ProductActionSheet"; 
import DemandRequestForm from "./DemandRequestForm";
import { usePathname } from "next/navigation";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface ProductActionsProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  isSelectionInStock: boolean;
}

export default function ProductActions({
  product,
  selectedVariant,
  isSelectionInStock,
}: ProductActionsProps) {
  const { onAdd, buyNow, handleAddToWishlist } = useStateContext();
  const pathname = usePathname();
  
  const [quantity, setQuantity] = useState(1); 
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const maxQuantity = selectedVariant?.stock != null ? selectedVariant.stock : (isSelectionInStock ? 9999 : 0);

  // ✅ Reset quantity to 1 when variant changes (to avoid quantity > maxQuantity)
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?._key]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined' && window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
        setIsSheetOpen(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Custom button disable/OOS checking
  const isBtnOos = !isSelectionInStock || quantity > maxQuantity;

  const handleAddToCart = () => {
    if (!selectedVariant) return toastError("Please select options.");
    
    if (isBtnOos) {
      logUserEvent('oos_attempt', pathname, {
        productId: product._id,
        variant_sku: selectedVariant.sku || "N/A",
        variant_key: selectedVariant._key || "N/A",
        attempt_type: 'add_to_cart_click',
        current_subtotal: effectivePrice
      });
      return toastError("This option is currently out of stock.");
    }

    onAdd(product, selectedVariant, quantity);
    setIsSheetOpen(false);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return toastError("Please select options.");
    
    if (isBtnOos) {
      logUserEvent('oos_attempt', pathname, {
        productId: product._id,
        variant_sku: selectedVariant.sku || "N/A",
        variant_key: selectedVariant._key || "N/A",
        attempt_type: 'buy_now_click',
        current_subtotal: effectivePrice
      });
      return toastError("This option is currently out of stock.");
    }

    buyNow(product, selectedVariant, quantity);
    setIsSheetOpen(false);
  };

  const handlePdpShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check this out on PocketValue: ${product.title}`,
      url: typeof window !== "undefined" ? window.location.href : ""
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        logUserEvent('product_shared', pathname, {
          method: 'native_share',
          productId: product._id
        });
      } catch (err) {
        console.log("Web Share API cancelled or failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toastSuccess("Product link copied to clipboard!");
        logUserEvent('product_shared', pathname, {
          method: 'copy_link',
          productId: product._id
        });
      } catch (err) {
        toastError("Failed to copy link.");
      }
    }
  };

  const effectivePrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? 0;

  return (
    <>
      {/* Standard Desktop Actions */}
      <div className="flex flex-col gap-6 mt-8 pb-4 border-b border-gray-100 dark:border-gray-800 md:border-none">
        
        {/* Quantity, Wishlist & Share buttons Row */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</span>
             <QuantitySelector 
                quantity={quantity} 
                onQuantityChange={setQuantity} 
                max={maxQuantity} 
             />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddToWishlist(product)}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-brand-danger hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all font-medium text-sm"
            >
              <Heart size={20} />
              <span>Add to Wishlist</span>
            </button>

            <button
              onClick={handlePdpShare}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-brand-primary hover:bg-orange-50 dark:hover:bg-gray-800 border border-transparent hover:border-orange-100 dark:hover:border-gray-800 transition-all font-medium text-sm"
            >
              <Share2 size={20} />
              <span>Share Product</span>
            </button>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl transition-all shadow-md
              ${isBtnOos 
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70" 
                : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
              }`}
          >
            <ShoppingCart size={20} /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className={`flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl transition-all shadow-lg
              ${isBtnOos 
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70" 
                : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/30"
              }`}
          >
            <Zap size={20} fill="currentColor" /> Buy Now
          </button>
        </div>

        {/* ================================================================= */}
        {/* 🔥 DYNAMIC SOURCING DEMAND FORM (OUT OF STOCK ENGAGEMENT) */}
        {/* ================================================================= */}
        <DemandRequestForm 
          productId={product._id}
          selectedAttributes={selectedVariant ? selectedVariant.attributes.reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {} as Record<string, string>) : null}
          isOutOfStock={!isSelectionInStock}
        />

      </div>

      {/* MOBILE STICKY BUTTON */}
      <AnimatePresence>
        {showStickyBar && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-14.5 left-0 right-0 p-4 z-40 md:hidden pointer-events-none"
            >
                <button
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full pointer-events-auto flex items-center justify-between px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(255,143,50,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                    <span className="flex items-center gap-2 text-lg font-clash">
                        <ChevronsUp size={20} className="animate-bounce" />
                        Add to Cart
                    </span>
                    <span className="text-xl font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                        Rs. {effectivePrice.toLocaleString()}
                    </span>
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      <ProductActionSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isSelectionInStock={isSelectionInStock}
        maxQuantity={maxQuantity} 
      />
    </>
  );
}