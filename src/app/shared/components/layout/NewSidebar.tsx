// 📂 src/app/shared/components/layout/NewSidebar.tsx

"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { SanityCategory } from "@/types";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // Hardware-accelerated transitions
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiGrid,
  FiDroplet,
  FiCpu,
  FiArchive,
  FiTruck,
  FiBook,
  FiGift,
} from "react-icons/fi";

// === ICON HELPER ===
const getIconForCategory = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();

  if (lowerCaseName.startsWith("men")) return <FiUser size={20} />;
  if (lowerCaseName.startsWith("women")) return <FiHeart size={20} />;
  if (lowerCaseName.startsWith("kid") || lowerCaseName.startsWith("baby"))
    return <FiShoppingBag size={20} />;
  if (lowerCaseName.startsWith("home")) return <FiHome size={20} />;
  if (lowerCaseName.startsWith("beauty") || lowerCaseName.startsWith("health"))
    return <FiDroplet size={20} />;
  if (lowerCaseName.startsWith("electronics")) return <FiCpu size={20} />;
  if (
    lowerCaseName.startsWith("grocery") ||
    lowerCaseName.startsWith("food") ||
    lowerCaseName.startsWith("pet")
  )
    return <FiArchive size={20} />;

  if (lowerCaseName.includes("auto") || lowerCaseName.includes("car"))
    return <FiTruck size={20} />;
  if (lowerCaseName.includes("book") || lowerCaseName.includes("stationery"))
    return <FiBook size={20} />;
  if (lowerCaseName.includes("gift") || lowerCaseName.includes("event"))
    return <FiGift size={20} />;

  return <FiGrid size={20} />;
};

interface NewSidebarProps {
  categories: SanityCategory[];
  onCategoryHover: (category: SanityCategory | null) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  sidebarWidthClass?: string;
}

export default function NewSidebar({
  categories,
  onCategoryHover,
  isExpanded = false,
  onToggleExpand,
}: NewSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainCategories = categories.filter((cat) => !cat.parent);

  const desiredOrder = [
    "HOME",
    "BEAUTY",
    "MEN",
    "WOMEN",
    "KIDS",
    "FOOD & GROCERY",
    "ELECTRONICS",
  ];

  const sortedCategories = [...mainCategories].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.name.toUpperCase());
    const indexB = desiredOrder.indexOf(b.name.toUpperCase());

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  const isCategoryActive = (category: SanityCategory) => {
    return typeof window !== "undefined" && window.location.pathname === `/category/${category.slug}`;
  };

  if (!mounted) {
    return <aside className="h-full bg-zinc-50 dark:bg-gray-900 border-r border-zinc-200 dark:border-gray-800 w-16" />;
  }

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ✅ MASTER SECURITY UPGRADE: Width is animated using exact relative rem strings ("14rem" = w-56, "4rem" = w-16) */}
      <motion.aside
        animate={{ width: isExpanded ? "14rem" : "4rem" }} 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 z-35 flex flex-col items-center shadow-[2px_0_15px_rgba(0,0,0,0.01)]"
      >
        <nav
          // ✅ ZERO JITTER: Nav padding remains 100% locked to prevent any horizontal shifts
          className="flex flex-col items-center gap-2.5 w-full overflow-y-auto no-scrollbar py-6 px-0 pb-20"
          aria-label="Main navigation"
          role="navigation"
        >
          {sortedCategories.map((category) => {
            const isActive = isCategoryActive(category);

            return (
              <div
                key={category._id}
                onMouseEnter={() => onCategoryHover(category)}
                className="w-full relative group shrink-0"
              >
                {/* Glowing Active Indicator */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 bg-brand-primary rounded-r-full transition-all duration-300 ${
                    isActive 
                      ? "opacity-100 scale-y-100 shadow-[0_0_12px_#FF8F32]" 
                      : "opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100 group-hover:shadow-[0_0_12px_#FF8F32]"
                  }`}
                  aria-hidden="true"
                />

                <Link
                  href={`/category/${category.slug}`}
                  title={category.name}
                  aria-current={isActive ? "page" : undefined}
                  // ✅ ZERO JITTER: Link layout uses absolute left-alignment with no dynamic padding shifts
                  className="flex flex-row items-center justify-start w-full h-12 rounded-xl transition-all duration-300 group-hover:bg-brand-primary/5 dark:group-hover:bg-brand-primary/10 select-none"
                >
                  {/* ✅ THE COORDINATE LOCK: This container is ALWAYS exactly 64px (w-16) wide. 
                      Whether expanded or collapsed, the icon is perfectly centered in this static block and NEVER moves! */}
                  <div className="w-16 h-12 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <div
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "text-brand-primary"
                          : "text-zinc-400 dark:text-zinc-500 group-hover:text-brand-primary"
                      }`}
                    >
                      {getIconForCategory(category.name)}
                    </div>
                  </div>

                  {/* BUTTER-SMOOTH TEXT EXPANSION (Fades in right next to the locked 64px block) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-xs font-black truncate text-zinc-700 dark:text-zinc-300 group-hover:text-brand-primary font-mono leading-none select-none pointer-events-none pr-4"
                      >
                        {category.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Expand Toggle Panel */}
        {/* ✅ FIXED BOTTOM PANEL: Aligned with the locked 64px (w-16) icon block for seamless toggling */}
        <div className="shrink-0 w-full pb-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md flex items-center justify-start h-14 select-none">
          <div className="w-16 flex items-center justify-center shrink-0">
            <button
              onClick={onToggleExpand}
              className="p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-brand-primary/20 text-zinc-500 hover:text-brand-primary transition-all duration-300 shadow-2xs"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}