// 📂 src/app/shared/components/layout/FooterColumn.tsx

"use client";

import { useState, useId } from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable Contact Item ---
export const ContactItem = ({
  icon: Icon,
  href,
  text,
}: {
  icon: React.ElementType;
  href?: string;
  text: string;
}) => (
  <li className="flex items-start gap-3 group">
    <Icon
      className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-primary group-hover:scale-110 transition-transform"
      aria-hidden="true"
    />
    {href ? (
      <a
        href={href}
        className="text-zinc-700 hover:text-brand-primary dark:text-zinc-300 dark:hover:text-brand-primary transition-colors text-sm font-semibold break-all leading-relaxed"
      >
        {text}
      </a>
    ) : (
      <span className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold leading-relaxed">{text}</span>
    )}
  </li>
);

// --- Footer Column Wrapper (Balanced Grid Alignment) ---
const FooterColumn = ({
  title,
  children,
  isMobile = false,
}: {
  title: string;
  children: React.ReactNode;
  isMobile?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  // Desktop View
  if (!isMobile) {
    return (
      <div className="flex flex-col space-y-4">
        <h3 className="font-extrabold text-zinc-950 dark:text-white text-sm uppercase tracking-[0.25em] border-l-2 border-brand-primary pl-3 font-mono leading-none">
          {title}
        </h3>
        <ul className="space-y-3 flex flex-col">{children}</ul>
      </div>
    );
  }

  // Mobile Accordion View
  return (
    <div className="border-b border-zinc-200/50 dark:border-zinc-900">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        /* ✅ OUTLINE FIX: Removed 'focus:ring-2 focus:ring-brand-primary focus:ring-offset-2' which caused the ugly orange outline box on mobile tap! */
        className="w-full flex justify-between items-center py-5 focus:outline-none outline-none focus-visible:outline-none ring-0 select-none cursor-pointer rounded-lg"
      >
        <h3 className="font-bold text-zinc-950 dark:text-zinc-100 text-sm uppercase tracking-wider font-mono">
          {title}
        </h3>
        <FiChevronDown
          className={`w-4 h-4 text-brand-primary transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 pb-6 px-1 flex flex-col">{children}</ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FooterColumn;