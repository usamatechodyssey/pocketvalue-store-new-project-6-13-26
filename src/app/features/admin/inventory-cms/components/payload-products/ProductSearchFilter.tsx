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
    params.set("page", "1");
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      {isPending && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={20} />}
      <input
        type="text"
        defaultValue={currentSearch}
        onChange={(e) => debouncedUpdateUrl(e.target.value)}
        placeholder="Search by Product, SKU or Variant ID..."
        className="w-full p-2.5 pl-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-brand-primary focus:border-brand-primary"
      />
    </div>
  );
}