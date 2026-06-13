"use client";

import React from "react";
import Link from "next/link";
import { SanityCategory } from "@/sanity/types/product_types";
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiGrid,
  FiDroplet,
  FiCpu,
  FiArchive,
  FiTruck, // Added for Automotive example
  FiBook, // Added for Books example
  FiGift, // Added for Gifting example
} from "react-icons/fi";

// === ICON HELPER (Expanded for Future Categories) ===
const getIconForCategory = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();

  if (lowerCaseName.startsWith("men")) return <FiUser size={24} />;
  if (lowerCaseName.startsWith("women")) return <FiHeart size={24} />;
  if (lowerCaseName.startsWith("kid") || lowerCaseName.startsWith("baby"))
    return <FiShoppingBag size={24} />;
  if (lowerCaseName.startsWith("home")) return <FiHome size={24} />;
  if (lowerCaseName.startsWith("beauty") || lowerCaseName.startsWith("health"))
    return <FiDroplet size={24} />;
  if (lowerCaseName.startsWith("electronics")) return <FiCpu size={24} />;
  if (
    lowerCaseName.startsWith("grocery") ||
    lowerCaseName.startsWith("food") ||
    lowerCaseName.startsWith("pet")
  )
    return <FiArchive size={24} />;

  // Future Proofing Icons
  if (lowerCaseName.includes("auto") || lowerCaseName.includes("car"))
    return <FiTruck size={24} />;
  if (lowerCaseName.includes("book") || lowerCaseName.includes("stationery"))
    return <FiBook size={24} />;
  if (lowerCaseName.includes("gift") || lowerCaseName.includes("event"))
    return <FiGift size={24} />;

  return <FiGrid size={24} />; // Default fallback
};

interface NewSidebarProps {
  categories: SanityCategory[];
  onCategoryHover: (category: SanityCategory | null) => void;
}

export default function NewSidebar({
  categories,
  onCategoryHover,
}: NewSidebarProps) {
  const mainCategories = categories.filter((cat) => !cat.parent);

  // Business Logic Order
  // Jo categories yahan nahi hongi, wo list ke end mein ayengi automatically.
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

    // Logic: If both exist in list, sort by index.
    // If one doesn't exist, push it to the bottom.
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither exist in desiredOrder, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      {/* CSS to Hide Scrollbar but keep functionality */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <aside className="h-full w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col items-center shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
        {/* Scrollable Container */}
        <nav className="flex flex-col items-center gap-2 w-full overflow-y-auto no-scrollbar py-6 pb-24">
          {sortedCategories.map((category) => (
            <div
              key={category._id}
              onMouseEnter={() => onCategoryHover(category)}
              className="w-full relative group px-2 shrink-0" // shrink-0 ensures items don't get squished
            >
              {/* === HOVER INDICATOR === */}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-primary rounded-r-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <Link
                href={`/category/${category.slug}`}
                title={category.name}
                className="flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 group-hover:bg-orange-50 dark:group-hover:bg-white/5"
              >
                {/* Icon Animation */}
                <div className="text-gray-400 dark:text-gray-500 transition-all duration-300 group-hover:text-brand-primary group-hover:scale-110">
                  {getIconForCategory(category.name)}
                </div>

                {/* Text Styling */}
                <span className="text-[9px] font-bold mt-1.5 w-full text-center truncate px-0.5 text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-brand-primary leading-tight">
                  {category.name.toUpperCase().split(" ")[0]}{" "}
                  {/* Sırf First word dikhaye ga agar bara naam ho (Clean look) */}
                </span>
              </Link>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
