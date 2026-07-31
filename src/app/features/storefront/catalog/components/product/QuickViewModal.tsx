// src/app/components/product/QuickViewModal.tsx

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
  lowStockThreshold: number; // ✅ NEW PROP
}

export default function QuickViewModal({
  isOpen,
  onClose,
  product,
  lowStockThreshold, // ✅ RECEIVE
}: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

 
  useEffect(() => {
    if (isOpen && product) {
      setSelectedVariant(product.defaultVariant || product.variants[0] || null);
    }
  }, [isOpen, product?._id]);

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
      <Dialog as="div" className="relative z-60" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end md:items-center justify-center p-0 md:p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-100 translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
            >
              <DialogPanel className="w-full transform text-left align-middle transition-all shadow-2xl bg-white dark:bg-gray-900 rounded-t-4xl md:rounded-2xl md:w-[90vw] lg:w-full lg:max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Mobile Handle Bar */}
                <div
                  className="w-full flex justify-center pt-3 pb-1 md:hidden shrink-0 cursor-pointer bg-white dark:bg-gray-900 z-10"
                  onClick={onClose}
                >
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-0 grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-10 flex items-center justify-center">
                      <ProductGallery
                        images={imagesToShow}
                        productTitle={product.title}
                        videoUrl={product.videoUrl}
                      />
                    </div>

                    <div className="p-5 md:p-8 lg:p-10">
                      {/* ✅ THE BUILD FIX: Passing required lowStockThreshold */}
                      <ProductInfo
              key={product._id}
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
              averageRating={product.rating || 0}
              totalReviews={product.reviewCount || 0}
              lowStockThreshold={lowStockThreshold} // ✅ PASS DIRECTLY
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
