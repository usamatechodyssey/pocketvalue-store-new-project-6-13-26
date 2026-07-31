// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialFilters.tsx

"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, Search, XCircle, MapPin } from 'lucide-react';

// ================================================================
// ✅ DEFAULT PAKISTAN PROVINCES (Fallback if prop is omitted)
// ================================================================
const PAKISTAN_PROVINCES = [
  "SINDH",
  "PUNJAB",
  "ICT",
  "KPK",
  "BALOCHISTAN",
  "GILGIT-BALTISTAN",
  "AJK",
];

interface GeospatialFiltersProps {
  provinces?: string[];
}

export default function GeospatialFilters({ provinces }: GeospatialFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentProvince = searchParams.get('province') || '';
  const currentSearch = searchParams.get('search') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => router.push(pathname);

  const hasFilters = Boolean(currentProvince || currentSearch);

  // ✅ Safe provinces list with default fallback
  const safeProvinces = provinces && provinces.length > 0 ? provinces : PAKISTAN_PROVINCES;

  return (
    <div
      className="flex flex-wrap items-center gap-2.5 p-1.5 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
      role="search"
      aria-label="Geospatial filters: province and city search"
    >
      <div className="p-1.5 text-brand-primary shrink-0 pl-2">
        <Filter size={14} aria-hidden="true" />
      </div>

      {/* Province Dropdown */}
      <div className="flex items-center gap-1.5">
        <MapPin size={13} className="text-zinc-400 shrink-0 hidden sm:inline" aria-hidden="true" />
        <select
          value={currentProvince}
          onChange={(e) => updateFilter('province', e.target.value)}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 focus:border-brand-primary outline-hidden transition-all cursor-pointer"
          aria-label="Filter by province"
        >
          <option value="">All Provinces</option>
          {safeProvinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1 bg-white dark:bg-zinc-950 focus-within:border-brand-primary transition-all">
        <Search size={13} className="text-zinc-400 mr-2 shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search City..."
          value={currentSearch}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="bg-transparent border-none text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 w-28 sm:w-36 outline-hidden placeholder:text-zinc-400"
          aria-label="Search by city name"
        />
        {currentSearch && (
          <button
            onClick={() => updateFilter('search', '')}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            <XCircle size={13} />
          </button>
        )}
      </div>

      {/* Clear All Button */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-[10px] font-mono font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer px-2.5 py-1 bg-red-500/10 rounded-lg border border-red-500/20"
          aria-label="Clear all filters"
        >
          <XCircle size={12} /> Clear Filters
        </button>
      )}
    </div>
  );
}