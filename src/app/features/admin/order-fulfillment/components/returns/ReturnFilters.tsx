"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { RETURN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

// ✅ FIX: Consistent input styling (matches AdminOrderFilters.tsx)
const inputStyles = "appearance-none block w-full rounded-md border-0 py-2 px-3.5 pl-11 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

export default function ReturnFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "All";
  const currentSearchTerm = searchParams.get("search") || "";

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "All") params.set(key, value);
      else params.delete(key);
    });
    if (newParams.page === "1") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateUrl({ page: "1", search: value });
  }, 500);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="grow relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          defaultValue={currentSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          placeholder="Search by Order # or Customer..."
          className={inputStyles}
        />
      </div>
      
      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {RETURN_STATUSES.map((tab) => (
          <button
            key={tab}
            onClick={() => updateUrl({ page: "1", status: tab })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              currentStatus === tab
                ? "bg-brand-primary text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}