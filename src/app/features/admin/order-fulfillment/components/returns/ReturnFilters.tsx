// 📂 src/app/features/admin/order-fulfillment/components/returns/ReturnFilters.tsx (CYBER-HUD HARDENED)

"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { RETURN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

// Consistent Cyber-HUD Input Styling
const inputStyles = "appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200";

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
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      {/* Search Input */}
      <div className="grow relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]" size={16} />
        <input
          type="text"
          defaultValue={currentSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          placeholder="Search by Order # or Customer name..."
          className={inputStyles}
        />
      </div>
      
      {/* Status Filter Tabs (High-Density Monospaced) */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto pb-1 md:pb-0 font-mono">
        {RETURN_STATUSES.map((tab) => (
          <button
            key={tab}
            onClick={() => updateUrl({ page: "1", status: tab })}
            className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              currentStatus === tab
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}