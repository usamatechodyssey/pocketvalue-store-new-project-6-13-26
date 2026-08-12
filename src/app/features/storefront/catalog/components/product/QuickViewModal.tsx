// // src/app/components/product/QuickViewModal.tsx

// "use client";

// import { Fragment, useState, useEffect, useMemo } from "react";
// import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
// import { X } from "lucide-react";
// import SanityProduct, { ProductVariant } from "@/types";
// import ProductGallery from "./ProductGallery";
// import ProductInfo from "./ProductInfo";


// interface QuickViewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   product: SanityProduct | null;
//   lowStockThreshold: number; // ✅ NEW PROP
// }

// export default function QuickViewModal({
//   isOpen,
//   onClose,
//   product,
//   lowStockThreshold, // ✅ RECEIVE
// }: QuickViewModalProps) {
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

 
//   useEffect(() => {
//     if (isOpen && product) {
//       setSelectedVariant(product.defaultVariant || product.variants[0] || null);
//     }
//   }, [isOpen, product?._id]);

//   const handleVariantChange = (variant: ProductVariant | null) => {
//     setSelectedVariant(variant);
//   };

//   const imagesToShow = useMemo(() => {
//     if (selectedVariant?.images && selectedVariant.images.length > 0) {
//       return selectedVariant.images;
//     }
//     return product?.defaultVariant?.images || [];
//   }, [selectedVariant, product]);

//   if (!product) return null;


//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-60" onClose={onClose}>
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
//         </TransitionChild>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-end md:items-center justify-center p-0 md:p-4 text-center">
//             <TransitionChild
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
//               enterTo="opacity-100 translate-y-0 md:scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0 md:scale-100"
//               leaveTo="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
//             >
//               <DialogPanel className="w-full transform text-left align-middle transition-all shadow-2xl bg-white dark:bg-gray-900 rounded-t-4xl md:rounded-2xl md:w-[90vw] lg:w-full lg:max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
//                 {/* Mobile Handle Bar */}
//                 <div
//                   className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 cursor-pointer bg-white dark:bg-gray-900 z-10"
//                   onClick={onClose}
//                 >
//                   <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
//                 </div>

//                 <div className="absolute top-4 right-4 z-50">
//                   <button
//                     onClick={onClose}
//                     className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
//                   >
//                     <X size={24} />
//                   </button>
//                 </div>

//                 <div className="overflow-y-auto custom-scrollbar p-0 grow">
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
//                     <div className="bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-10 flex items-center justify-center">
//                       <ProductGallery
//                         images={imagesToShow}
//                         productTitle={product.title}
//                         videoUrl={product.videoUrl}
//                       />
//                     </div>

//                     <div className="p-5 md:p-8 lg:p-10">
//                       {/* ✅ THE BUILD FIX: Passing required lowStockThreshold */}
//                       <ProductInfo
//               key={product._id}
//               product={product}
//               selectedVariant={selectedVariant}
//               onVariantChange={handleVariantChange}
//               averageRating={product.rating || 0}
//               totalReviews={product.reviewCount || 0}
//               lowStockThreshold={lowStockThreshold} // ✅ PASS DIRECTLY
//             />
//                     </div>
//                   </div>
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

// 📂 src/app/shared/components/catalog/components/product/QuickViewModal.tsx

"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";
import SanityProduct, { ProductVariant } from "@/types";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SanityProduct | null;
  lowStockThreshold: number;
}

export default function QuickViewModal({
  isOpen,
  onClose,
  product,
  lowStockThreshold,
}: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedVariant(product.defaultVariant || product.variants?.[0] || null);
    }
  }, [isOpen, product]);

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  };

  const imagesToShow = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product?.defaultVariant?.images || [];
  }, [selectedVariant, product]);

  if (!product) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-60 font-sans" onClose={onClose}>
        {/* Backdrop overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end md:items-center justify-center p-0 md:p-6 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
            >
              <DialogPanel className="w-full transform text-left align-middle transition-all shadow-2xl bg-white dark:bg-gray-950 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/80 rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[90vw] lg:w-full lg:max-w-7xl max-h-[90vh] flex flex-col overflow-hidden relative">
                
                {/* Mobile Handle Bar */}
                <div
                  className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 cursor-pointer bg-white/50 dark:bg-gray-950/50 z-10 select-none"
                  onClick={onClose}
                >
                  <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                </div>

                {/* Close Button */}
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-all border border-zinc-200/50 dark:border-zinc-800/80 shadow-2xs cursor-pointer select-none"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Inner Content Area */}
                <div className="overflow-y-auto custom-scrollbar p-0 grow">
                  {/* ✅ items-start enables sticky behavior inside modal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-start">
                    
                    {/* ✅ STICKY + SEAMLESS: 'lg:sticky lg:top-0 self-start' pins gallery at top-0 of modal without any dark box! */}
                    <div className="p-4 lg:p-6 flex flex-col items-center justify-start border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/80 lg:sticky lg:top-0 self-start z-10">
                      <ProductGallery
                        images={imagesToShow}
                        productTitle={product.title}
                        videoUrl={product.videoUrl}
                        isModal={true}
                      />
                    </div>

                    {/* Right Product Info Container */}
                    <div className="p-5 md:p-6 lg:p-8">
                      <ProductInfo
                        key={product._id}
                        product={product}
                        selectedVariant={selectedVariant}
                        onVariantChange={handleVariantChange}
                        averageRating={product.rating || 0}
                        totalReviews={product.reviewCount || 0}
                        lowStockThreshold={lowStockThreshold}
                      />
                    </div>

                  </div>
                </div>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}