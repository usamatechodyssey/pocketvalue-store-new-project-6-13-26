// 📂 src/app/features/admin/product-intelligence/components/ProductIntelligenceFilters.tsx

"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, Tags, Activity, XCircle } from "lucide-react";

// ✅ SINGLE SOURCE OF TRUTH: Centralized Analytics Constants
import { TREND_FILTERS } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ PROPS INTERFACE
// ================================================================
interface ProductIntelligenceFiltersProps {
  categories: { id: string; name: string }[] | null | undefined;
}

export default function ProductIntelligenceFilters({
  categories,
}: ProductIntelligenceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCat = searchParams.get("category") || "";
  const currentTrend = searchParams.get("trend") || "";

  // ✅ Safe categories fallback
  const safeCategories = categories || [];

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const inputStyles =
    "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 focus:border-brand-primary outline-hidden transition-all cursor-pointer";

  const hasActiveFilters = Boolean(currentCat || currentTrend);

  return (
    <div
      className="flex flex-wrap items-center gap-2.5 p-1.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
      role="search"
      aria-label="Product Intelligence Filters"
    >
      {/* Filter Label */}
      <div className="p-1.5 text-brand-primary shrink-0 pl-2">
        <Filter size={14} aria-hidden="true" />
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-1.5">
        <Tags size={13} className="text-zinc-400 shrink-0 hidden sm:inline" aria-hidden="true" />
        <select
          value={currentCat}
          onChange={(e) => updateUrl("category", e.target.value)}
          className={inputStyles}
          aria-label="Filter by Category"
        >
          <option value="">All Categories</option>
          {safeCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Trend Dropdown */}
      <div className="flex items-center gap-1.5">
        <Activity size={13} className="text-zinc-400 shrink-0 hidden sm:inline" aria-hidden="true" />
        <select
          value={currentTrend}
          onChange={(e) => updateUrl("trend", e.target.value)}
          className={inputStyles}
          aria-label="Filter by Trend"
        >
          {TREND_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-[10px] font-mono font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1 bg-red-500/10 rounded-lg border border-red-500/20"
          aria-label="Clear all filters"
        >
          <XCircle size={12} /> Clear Filters
        </button>
      )}
    </div>
  );
}