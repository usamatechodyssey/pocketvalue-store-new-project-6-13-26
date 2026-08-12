// 📂 src/app/features/admin/inventory-cms/components/payload-products/ProductsClientPage.tsx (CYBER-HUD HARDENED)

"use client";

import { useTransition } from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { AdminProductListItem } from "./ProductsTable";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import ProductSearchFilter from "./ProductSearchFilter";
import ProductsTable from "./ProductsTable";
import ProductsMobileList from "./ProductsMobileList";

export default function ProductsClientPage({
  initialProducts,
  initialTotalPages,
}: {
  initialProducts: AdminProductListItem[];
  initialTotalPages: number;
}) {
  const [isPending] = useTransition();

  return (
    <div className="relative">
      {/* GLASSMORPHISM LOADING OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex justify-center items-center z-20 rounded-2xl backdrop-blur-xs animate-in fade-in duration-200">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      )}

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-40" : "opacity-100"}`}>
        {/* MAIN HUD CONTAINER */}
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-6">
          <ProductSearchFilter />
          {initialProducts.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ProductsTable products={initialProducts} />
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden">
                <ProductsMobileList products={initialProducts} />
              </div>
            </>
          ) : (
            /* Dashed Empty State */
            <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
              <PackageSearch size={44} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-600 stroke-[1.8px]" />
              <p className="font-bold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono">
                No products or variants found.
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                Try adjusting your search criteria or filter parameters.
              </p>
            </div>
          )}
        </div>

        {/* CONSOLIDATED PAGINATION */}
        {initialTotalPages > 1 && (
          <div className="mt-4">
            <PaginationControls totalPages={initialTotalPages} />
          </div>
        )}
      </div>
    </div>
  );
}