
"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, ListTree } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
// ✅ UPDATED IMPORT
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import CategoryExplorerTable from "./CategoryExplorerTable";

export default function CategoryExplorerClientPage({ initialCategories, initialTotalPages }: any) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("search", value);
    else params.delete("search");
    startTransition(() => {
      window.history.replaceState(null, "", `?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search by category name or slug..."
            className="w-full p-2.5 pl-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-brand-primary"
          />
        </div>

        {initialCategories.length > 0 ? (
          <CategoryExplorerTable categories={initialCategories} />
        ) : (
          <div className="text-center py-20 text-gray-400 italic">
            <ListTree size={40} className="mx-auto mb-3 opacity-20"/>
            No categories found.
          </div>
        )}
      </div>

      {initialTotalPages > 1 && (
        // ✅ RESOLVED: Callback logic replaced with URL-driven controls
        <PaginationControls totalPages={initialTotalPages} />
      )}
    </div>
  );
}