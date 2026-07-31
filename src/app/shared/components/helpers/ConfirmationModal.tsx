// /src/app/_components/shared/ConfirmationModal.tsx
"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Loader2, ShieldAlert, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: "red" | "blue";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "red",
}: ConfirmationModalProps) {
  const colorClasses = {
    red: {
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconText: "text-red-600 dark:text-red-400",
      buttonBg: "bg-red-600 hover:bg-red-700 disabled:bg-red-400",
    },
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconText: "text-blue-600 dark:text-blue-400",
      buttonBg: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
    },
  };

  const selectedColor = colorClasses[confirmColor];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${selectedColor.iconBg} sm:mx-0`}
                  >
                    <ShieldAlert
                      className={`h-6 w-6 ${selectedColor.iconText}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-0 text-left">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {title}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white ${selectedColor.buttonBg} rounded-md`}
                    onClick={onConfirm}
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    {isPending ? "Processing..." : confirmText}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
