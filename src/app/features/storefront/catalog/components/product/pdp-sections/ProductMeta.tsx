// src/app/components/product/pdp-sections/ProductMeta.tsx

"use client";

import { ShieldCheck, Truck, RotateCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const BENEFITS = [
    { 
        icon: ShieldCheck, 
        title: "100% Authentic", 
        desc: "Original verified", 
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    { 
        icon: Truck, 
        title: "Fast Delivery", 
        desc: "Shipping across PK", 
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    { 
        icon: RotateCw, 
        title: "Easy Returns", 
        desc: "7-day replacement", 
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/20"
    },
    { 
        icon: Headphones, 
        title: "24/7 Support", 
        desc: "Friendly assistance", 
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-900/20"
    },
];

export default function ProductMeta() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BENEFITS.map((benefit, idx) => (
            <motion.div 
                key={idx}
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
            >
                <div className={`shrink-0 p-2.5 rounded-full ${benefit.bg} ${benefit.color}`}>
                    {/* ✅ FIX: Add aria-hidden="true" to decorative icons */}
                    <benefit.icon size={20} strokeWidth={2.5} aria-hidden="true" />
                </div>

                <div className="flex flex-col">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        {benefit.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                        {benefit.desc}
                    </p>
                </div>
            </motion.div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold opacity-60">
        <ShieldCheck size={12} aria-hidden="true" />
        Guaranteed Safe Checkout
      </div>

    </div>
  );
}