"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import CartSummary from "./CartSummary";
import { useStateContext } from "@/app/context/StateContext";

interface CartSummarySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSummarySheet({ isOpen, onClose }: CartSummarySheetProps) {
    
    // Fetch Total Items for Header
    const { totalQuantities } = useStateContext();

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        aria-hidden="true"
                    />

                    {/* 2. Sheet Container (BOTTOM-UP SLIDE) */}
                    <motion.div
                        // 🔥 BOTTOM-UP ANIMATION
                        initial={{ y: "100%" }} 
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                        
                        // 🔥 PLACEMENT (Bottom of screen)
                        className="fixed bottom-0 left-0 right-0 w-full max-h-[90vh] bg-white dark:bg-gray-900 z-50 lg:hidden flex flex-col shadow-2xl rounded-t-3xl"
                        
                    >
                        {/* === HANDLE BAR (The "Product Sheet" Touch) === */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>
                        
                        {/* Header (Handle Bar + Close) */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white">
                                Your Cart ({totalQuantities} Items)
                            </h2>
                            <button 
                                onClick={onClose} 
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Content (CartSummary component) */}
                        <div className="grow overflow-y-auto custom-scrollbar">
                            {/* 🔥 CART SUMMARY IS RENDERED HERE */}
                            <CartSummary /> 
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}