
"use client";

import { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { ProductReview } from "@/types";

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onReviewSubmit: (review: ProductReview) => void;
}

export default function ProductReviewModal({
  isOpen,
  onClose,
  productId,
  onReviewSubmit,
}: ProductReviewModalProps) {
  // This logic is perfect, it calls the parent and then closes the modal.
  const handleSuccessfulSubmit = (review: ProductReview) => {
    onReviewSubmit(review);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Added a subtle backdrop blur for a modern glassmorphism effect */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        {/* Full-screen scrollable container to center the panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* The modal panel */}
              <DialogPanel className="w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Share Your Experience
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form Container */}
                <div className="mt-2">
                  <ReviewForm
                    productId={productId}
                    onReviewSubmit={handleSuccessfulSubmit}
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
