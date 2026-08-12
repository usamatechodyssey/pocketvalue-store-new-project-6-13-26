// 📂 src/app/features/admin/reports/components/ReportFilters.tsx (COMPACT SINGLE-ROW HUD FILTER BAR)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

// ================================================================
// ✅ TYPES
// ================================================================
export interface FilterOption {
  value: string;
  label: string;
}

interface ReportFiltersProps {
  categories?: FilterOption[];
  statuses?: FilterOption[];
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  showSearch?: boolean;
  exportExcel?: () => Promise<void>;
  exportPdf?: () => Promise<void>;
  isLoading?: boolean;
  searchPlaceholder?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT (Compact Single-Row Layout)
// ================================================================
export default function ReportFilters({
  categories = [],
  statuses = [],
  showCategoryFilter = false,
  showStatusFilter = false,
  showSearch = true,
  exportExcel,
  exportPdf,
  isLoading = false,
  searchPlaceholder = "Search data entries...",
}: ReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL values
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";

  // Local state for search
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Debounced search handler (400ms prevents server-request flood)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1"); // Bumps back to page 1 to prevent empty index bounds
    router.push(`${pathname}?${params.toString()}`);
  }, 400);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname);
    setSearchValue("");
  };

  // Sync search value with URL
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const hasActiveFilters = currentCategory || currentStatus || currentSearch;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs">
      
      {/* COMPACT SINGLE ROW: Dropdowns + Search + Reset + Export Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* --- Category Filter --- */}
        {showCategoryFilter && categories.length > 0 && (
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 appearance-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200 font-mono"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none stroke-[2.5px]" />
          </div>
        )}

        {/* --- Status Filter --- */}
        {showStatusFilter && statuses.length > 0 && (
          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 appearance-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200 font-mono"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none stroke-[2.5px]" />
          </div>
        )}

        {/* --- Search --- */}
        {showSearch && (
          <div className="relative flex-1 min-w-44">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
            />
          </div>
        )}

        {/* --- Clear Filters --- */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer font-mono"
          >
            <X size={13} className="stroke-[2.5px]" />
            Reset
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* --- Export Buttons --- */}
        <div className="flex items-center gap-2">
          {exportExcel && (
            <button
              onClick={exportExcel}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs shadow-emerald-500/10 hover:scale-102 active:scale-98 font-mono"
            >
              <FileSpreadsheet size={13} />
              Excel
            </button>
          )}
          {exportPdf && (
            <button
              onClick={exportPdf}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-[10px] uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-xs shadow-red-500/10 hover:scale-102 active:scale-98 font-mono"
            >
              <FileText size={13} />
              PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}