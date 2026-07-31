
"use client";

import { useState, useEffect } from "react";
import { useStateContext } from "@/app/context/StateContext";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderSummary from "./OrderSummary";

export default function CheckoutMobileSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const { grandTotal } = useStateContext();
  const [mounted, setMounted] = useState(false);

  // ✅ FIX: Force rendering only on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe Total (Server will render 0, Client will render real total)
  const displayTotal = mounted ? grandTotal.toLocaleString() : "0";

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* === TOGGLE HEADER === */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between py-5 text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2 text-brand-primary">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">
              <ShoppingCart size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-brand-primary" />
              {isOpen ? "Hide order summary" : "Show order summary"}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </div>
          
          <div className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
             {/* Use the safe 'displayTotal' variable */}
             Rs. {displayTotal}
          </div>
        </button>

        {/* === EXPANDABLE CONTENT === */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 border-dashed mt-2">
                 <OrderSummary isMobileView={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}