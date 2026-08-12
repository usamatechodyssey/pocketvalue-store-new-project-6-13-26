// 📂 src/app/features/admin/inventory-cms/components/payload-products/ProductSearchFilter.tsx (CYBER-HUD HARDENED)

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export default function ProductSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  const debouncedUpdateUrl = useDebouncedCallback((searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Bumps back to page 1 to prevent empty index bounds
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]" size={16} />
      
      {/* Dynamic Inline Pending Loader */}
      {isPending && (
        <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" size={16} />
      )}
      
      <input
        type="text"
        defaultValue={currentSearch}
        onChange={(e) => debouncedUpdateUrl(e.target.value)}
        placeholder="Search by Product name, SKU or Variant ID..."
        className="appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
      />
    </div>
  );
}