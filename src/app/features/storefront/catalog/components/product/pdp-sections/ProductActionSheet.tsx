
// // src/app/components/product/pdp-sections/ProductActionSheet.tsx
// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { X, ShoppingCart, Zap, Minus, Plus } from "lucide-react";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import SanityProduct, { ProductVariant } from "@/types";
// import { toastError } from "@/app/shared/components/helpers/CustomToasts";

// interface ProductActionSheetProps {
//   isOpen: boolean;
//   onClose: () => void;
//   product: SanityProduct;
//   selectedVariant: ProductVariant | null;
//   quantity: number;
//   setQuantity: (q: number) => void;
//   onAddToCart: () => void;
//   onBuyNow: () => void;
//   isSelectionInStock: boolean;
//   maxQuantity: number; 
// }

// export default function ProductActionSheet({
//   isOpen,
//   onClose,
//   product,
//   selectedVariant,
//   quantity,
//   setQuantity,
//   onAddToCart,
//   onBuyNow,
//   isSelectionInStock,
//   maxQuantity, 
// }: ProductActionSheetProps) {
  
//   const effectivePrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? 0;
//   const image = selectedVariant?.images?.[0] || product.defaultVariant?.images?.[0];

//   const handleInc = () => {
//     if (quantity < maxQuantity) {
//         setQuantity(quantity + 1);
//     } else {
//         toastError(`Only ${maxQuantity} in stock.`);
//     }
//   };
//   const handleDec = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

//   // Dynamic OOS Button Class Mapping (Gap #17)
//   const isBtnOos = !isSelectionInStock || quantity > maxQuantity;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* 1. Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
//             aria-hidden="true"
//           />

//           {/* 2. Sheet Container */}
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", stiffness: 350, damping: 35 }}
//             className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 z-50 lg:hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl overflow-hidden"
//           >
            
//             {/* Header / Handle */}
//             <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
//                 <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
//             </div>

//             <div className="p-5 pb-8 space-y-6">
                
//                 {/* Product Summary Row */}
//                 <div className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 pb-4">
//                     <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
//                         {image && (
//                             <Image 
//                                 src={urlFor(image).url()} 
//                                 alt={product.title} 
//                                 fill 
//                                 className="object-contain p-1" 
//                             />
//                         )}
//                     </div>
//                     <div className="grow">
//                         <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">
//                             {product.title}
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                             {selectedVariant?.attributes.map(a => a.value).join(" / ")}
//                         </p>
//                         <p className="text-lg font-black text-brand-primary mt-1">
//                             Rs. {effectivePrice.toLocaleString()}
//                         </p>
//                     </div>
//                     <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
//                         <X size={20} />
//                     </button>
//                 </div>

//                 {/* Quantity Control */}
//                 <div className="flex items-center justify-between">
//                     <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quantity</span>
                    
//                     {/* Container */}
//                     <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-full p-1.5">
                        
//                         {/* Decrease Button */}
//                         <button 
//                             onClick={handleDec}
//                             className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-800 dark:text-white active:scale-90 transition-transform"
//                         >
//                             <Minus size={18} />
//                         </button>
                        
//                         {/* Number */}
//                         <span className="w-8 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                        
//                         {/* Increase Button */}
//                         <button 
//                             onClick={handleInc}
//                             className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-800 dark:text-white active:scale-90 transition-transform"
//                         >
//                             <Plus size={18} />
//                         </button>
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="grid grid-cols-2 gap-3">
//                     <button
//                         onClick={() => { onAddToCart(); onClose(); }}
//                         // Removed native disabled attribute to allow onClick tracking triggers (Gap #17)
//                         className={`flex items-center justify-center gap-2 py-4 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform
//                           ${isBtnOos 
//                             ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75" 
//                             : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
//                           }`}
//                     >
//                         <ShoppingCart size={20} />
//                         Add to Cart
//                     </button>
//                     <button
//                         onClick={onBuyNow}
//                         className={`flex items-center justify-center gap-2 py-4 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform
//                           ${isBtnOos 
//                             ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75" 
//                             : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/25"
//                           }`}
//                     >
//                         <Zap size={20} fill="currentColor" />
//                         Buy Now
//                     </button>
//                 </div>

//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
// src/app/components/product/pdp-sections/ProductActionSheet.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Zap, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import SanityProduct, { ProductVariant } from "@/types";
import { toastError } from "@/app/shared/components/helpers/CustomToasts";

interface ProductActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isSelectionInStock: boolean;
  maxQuantity: number; 
}

export default function ProductActionSheet({
  isOpen,
  onClose,
  product,
  selectedVariant,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  isSelectionInStock,
  maxQuantity, 
}: ProductActionSheetProps) {
  
  const effectivePrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? 0;
  const image = selectedVariant?.images?.[0] || product.defaultVariant?.images?.[0];

  const handleInc = () => {
    if (quantity < maxQuantity) {
        setQuantity(quantity + 1);
    } else {
        toastError(`Only ${maxQuantity} in stock.`);
    }
  };
  const handleDec = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  const isBtnOos = !isSelectionInStock || quantity > maxQuantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            aria-hidden="true"
          />

          {/* 2. Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            // ✅ FIX: Added accessibility attributes
            role="dialog"
            aria-modal="true"
            aria-labelledby="action-sheet-title"
            className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 z-50 lg:hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl overflow-hidden"
          >
            
            {/* Header / Handle */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            <div className="p-5 pb-8 space-y-6">
                
                {/* Product Summary Row */}
                <div className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                        {image && (
                            <Image 
                                src={urlFor(image).url()} 
                                alt={product.title} 
                                fill 
                                className="object-contain p-1" 
                            />
                        )}
                    </div>
                    <div className="grow">
                        {/* ✅ FIX: Added ID for aria-labelledby */}
                        <h3 id="action-sheet-title" className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm">
                            {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {selectedVariant?.attributes.map(a => a.value).join(" / ")}
                        </p>
                        <p className="text-lg font-black text-brand-primary mt-1">
                            Rs. {effectivePrice.toLocaleString()}
                        </p>
                    </div>
                    {/* ✅ FIX: Added aria-label */}
                    <button 
                      onClick={onClose} 
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
                      aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quantity</span>
                    
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-full p-1.5">
                        <button 
                            onClick={handleDec}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-800 dark:text-white active:scale-90 transition-transform"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={18} />
                        </button>
                        
                        <span className="w-8 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                        
                        <button 
                            onClick={handleInc}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-sm text-gray-800 dark:text-white active:scale-90 transition-transform"
                            aria-label="Increase quantity"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { onAddToCart(); onClose(); }}
                        className={`flex items-center justify-center gap-2 py-4 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform
                          ${isBtnOos 
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75" 
                            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                          }`}
                    >
                        <ShoppingCart size={20} />
                        Add to Cart
                    </button>
                    <button
                        onClick={onBuyNow}
                        className={`flex items-center justify-center gap-2 py-4 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform
                          ${isBtnOos 
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-75" 
                            : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/25"
                          }`}
                    >
                        <Zap size={20} fill="currentColor" />
                        Buy Now
                    </button>
                </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}