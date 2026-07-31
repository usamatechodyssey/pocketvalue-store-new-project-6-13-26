// src/app/features/storefront/catalog/components/FaqAccordion.tsx

"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";
import { Minus, Plus } from "lucide-react";
import type { FaqItem, PortableTextBlock } from "@/types"; // ✅ Import PortableTextBlock
import { motion, AnimatePresence } from "framer-motion";

// =========================================================================
// 🔥 PORTABLE TEXT CUSTOM COMPONENTS (for lists)
// =========================================================================
const ptComponents = {
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside pl-5 space-y-2">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside pl-5 space-y-2">{children}</ol>
    ),
  },
};

const AccordionItem = ({ item }: { item: FaqItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  // ✅ Unique ID for each accordion item (using _key)
  const id = `faq-${item._key}`;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // ✅ Accessibility: aria-expanded, aria-controls
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        className="w-full flex justify-between items-start text-left py-5 px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary"
      >
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 pr-4">
          {item.question}
        </span>
        <div className="shrink-0 mt-1">
          {isOpen ? (
            <Minus size={20} className="text-brand-primary" />
          ) : (
            <Plus size={20} className="text-gray-500" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            // ✅ Panel ID for aria-controls association
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
          >
            <div className="px-6 pb-6 prose prose-md max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert">
              {/* ✅ Type-safe casting: item.answer is PortableTextBlock[] */}
              <PortableText
                value={item.answer as PortableTextBlock[]}
                components={ptComponents}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {items.map((item) => (
        <AccordionItem key={item._key} item={item} />
      ))}
    </div>
  );
}