// 📂 src/app/features/admin/inventory-cms/components/categories/CategoryExplorerClientPage.tsx (CYBER-HUD HARDENED)

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Loader2, ListTree } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import CategoryExplorerTable from "./CategoryExplorerTable";

// ✅ TYPE SAFE IMPORT
import { Category } from "./CategoryExplorerTable";

interface CategoryExplorerClientPageProps {
  initialCategories: Category[];
  initialTotalPages: number;
}

export default function CategoryExplorerClientPage({ 
  initialCategories, 
  initialTotalPages 
}: CategoryExplorerClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  // Debounced search handler (500ms prevents query request flooding)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Bumps back to page 1 to prevent empty index bounds
    if (value) params.set("search", value);
    else params.delete("search");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative font-sans">
      {/* GLASSMORPHISM LOADING OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex justify-center items-center z-20 rounded-2xl backdrop-blur-xs animate-in fade-in duration-200">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      )}
      
      {/* MAIN HUD CONTAINER */}
      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]" size={16} />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search by category name or slug..."
            className="appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
          />
        </div>

        {initialCategories.length > 0 ? (
          <CategoryExplorerTable categories={initialCategories} />
        ) : (
          /* Dashed Empty State */
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
            <ListTree size={44} className="mx-auto mb-3 text-zinc-400 dark:text-zinc-600 stroke-[1.8px]"/>
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono">
              No categories found.
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
              Try adjusting your search query or create a new category in CMS first.
            </p>
          </div>
        )}
      </div>

      {initialTotalPages > 1 && (
        <div className="mt-4">
          <PaginationControls totalPages={initialTotalPages} />
        </div>
      )}
    </div>
  );
}