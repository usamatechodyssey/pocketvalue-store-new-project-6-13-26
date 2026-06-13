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
    <Icon className="mt-1 h-4 w-4 shrink-0 text-brand-primary group-hover:scale-110 transition-transform" />
    {href ? (
      <a
        href={href}
        className="text-gray-400 hover:text-brand-primary transition-colors text-sm break-all"
      >
        {text}
      </a>
    ) : (
      <span className="text-gray-400 text-sm">{text}</span>
    )}
  </li>
);

// --- Footer Column Wrapper ---
const FooterColumn = ({
  title,
  children,
  isMobile,
}: {
  title: string;
  children: React.ReactNode;
  isMobile: boolean | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId(); // 🔥 Unique ID for A11y

  // Desktop View / Server Side Logic
  if (isMobile === false || isMobile === null) {
    return (
      <div className="flex flex-col space-y-5">
        <h3 className="font-black text-white text-sm uppercase tracking-[0.2em] border-l-2 border-brand-primary pl-3">
          {title}
        </h3>
        <ul className="space-y-3 flex flex-col">{children}</ul>
      </div>
    );
  }

  // Mobile Accordion View
  return (
    <div className="border-b border-gray-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex justify-between items-center py-5 focus:outline-none"
      >
        <h3 className="font-bold text-gray-100 text-base uppercase tracking-wider">
          {title}
        </h3>
        <FiChevronDown
          className={`w-5 h-5 text-brand-primary transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
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
            <ul className="space-y-4 pb-6 px-1">{children}</ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FooterColumn;
