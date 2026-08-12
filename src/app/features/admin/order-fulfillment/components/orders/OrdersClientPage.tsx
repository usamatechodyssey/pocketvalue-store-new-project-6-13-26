// 📂 src/app/features/admin/order-fulfillment/components/orders/OrdersClientPage.tsx (CYBER-HUD HARDENED)

"use client";

import { useTransition } from "react";
import { Loader2, Package } from "lucide-react";
import { ClientOrder } from "@/models/Order";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrdersTable from "./AdminOrdersTable";
import AdminOrdersMobileList from "./AdminOrdersMobileList";

interface OrdersClientPageProps {
  initialOrders: ClientOrder[];
  initialTotalPages: number;
}

export default function OrdersClientPage({
  initialOrders,
  initialTotalPages,
}: OrdersClientPageProps) {
  const [isPending] = useTransition();
  const hasOrders = initialOrders.length > 0;

  return (
    <div className="relative">
      {/* GLASSMORPHISM LOADING OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex justify-center items-center z-20 rounded-2xl backdrop-blur-xs animate-in fade-in duration-200">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      )}

      <div
        className={`transition-opacity duration-200 ${isPending ? "opacity-40" : "opacity-100"}`}
      >
        {/* MAIN HUD CONTAINER */}
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-6">
          <AdminOrderFilters />

          {hasOrders ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <AdminOrdersTable orders={initialOrders} />
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden">
                <AdminOrdersMobileList orders={initialOrders} />
              </div>
            </>
          ) : (
            /* Dashed Empty State */
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
              <Package size={44} className="mx-auto text-zinc-400 dark:text-zinc-600 stroke-[1.8px]" />
              <p className="font-semibold mt-4 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono">
                No orders found
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                Try adjusting your search criteria or order status filters.
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