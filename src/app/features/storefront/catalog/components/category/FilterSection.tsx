

"use client";

import { useState, useId } from "react";
import { ChevronDown } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId(); // ✅ Unique ID for each section

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // ✅ FIX: Added accessibility attributes
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex justify-between items-center py-4 text-left group"
      >
        <h3 
          id={`${panelId}-label`} 
          className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 group-hover:text-brand-primary transition-colors"
        >
          {title}
        </h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          aria-hidden="true" // ✅ Decorative icon, hidden from screen readers
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            id={panelId}
            // ✅ FIX: Added semantic role and label association
            role="region"
            aria-labelledby={`${panelId}-label`}
          >
            <div className="pb-5 pt-1 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}