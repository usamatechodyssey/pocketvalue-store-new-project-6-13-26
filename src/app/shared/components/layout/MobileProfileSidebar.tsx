"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle } from "lucide-react";
import AccountSidebar from "@/app/features/storefront/customer-account/components/AccountSidebar";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileProfileSidebar({
  isOpen,
  onClose,
}: ProfileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
          />

          {/* 2. SIDEBAR DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Profile menu"
            className="fixed top-0 right-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-40 flex flex-col lg:hidden shadow-2xl overflow-hidden h-dvh pb-20 md:pb-0"
          >
            {/* HEADER */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">
                  <UserCircle size={24} aria-hidden="true" />
                </div>
                <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white">
                  Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close profile menu"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="grow overflow-y-auto custom-scrollbar">
              <AccountSidebar onLinkClick={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}