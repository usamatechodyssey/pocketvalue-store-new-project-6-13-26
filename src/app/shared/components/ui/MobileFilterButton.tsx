"use client";

import { SlidersHorizontal } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function MobileFilterButton({ onClick }: Props) {
  return (
    <button
      type="button" // ✅ FIX 2: Prevent form submission
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 font-semibold text-sm text-text-primary dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
      aria-label="Open filters"
    >
      <SlidersHorizontal size={18} aria-hidden="true" /> {/* ✅ FIX 1 */}
      <span>Filters</span>
    </button>
  );
}