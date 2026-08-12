// 📂 src/app/shared/components/ui/MobileFilterButton.tsx

"use client";

import { SlidersHorizontal } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function MobileFilterButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      /* ✅ EXPLICIT FIX: Removed 'focus:ring-offset-2' & 'focus:ring-2' which created the ugly double orange-white ring! 
          Applied 'outline-none focus:outline-none active:scale-95' for a clean 1-layer tactile touch effect. */
      className="flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 hover:text-brand-primary transition-all active:scale-95 cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none shadow-2xs"
      aria-label="Open filters"
    >
      <SlidersHorizontal size={14} className="text-brand-primary shrink-0" aria-hidden="true" />
      <span>Filters</span>
    </button>
  );
}