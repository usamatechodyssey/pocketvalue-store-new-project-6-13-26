// 📂 src/app/features/admin/order-fulfillment/components/orders/AdminOrdersMobileList.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClientOrder } from "@/models/Order";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { getAdminStatusColor } from "@/app/shared/utils/adminOrderDisplayUtils";
import { bulkCreateShipments } from "../../actions/shipmentActions";
import { toast } from "react-hot-toast";
import { Loader2, Package, CheckSquare, Square, Printer } from "lucide-react";

// ================================================================
// 📦 PROPS INTERFACE
// ================================================================

interface AdminOrdersMobileListProps {
  orders: ClientOrder[];
}

// ================================================================
// 🏠 MAIN COMPONENT
// ================================================================

export default function AdminOrdersMobileList({ orders }: AdminOrdersMobileListProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBulkPending, startBulkTransition] = useTransition();

  // SSR Hydration safeguard registration
  useEffect(() => {
    setMounted(true);
  }, []);

  // ================================================================
  // 📦 HANDLERS
  // ================================================================

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o._id)));
    }
  };

  // ✅ BULK SHIPMENT
  const handleBulkShipment = () => {
    if (selectedOrders.size === 0) {
      toast.error("Please select at least one order.");
      return;
    }

    startBulkTransition(async () => {
      const toastId = toast.loading(
        `Processing ${selectedOrders.size} orders...`
      );

      try {
        const orderIds = Array.from(selectedOrders);
        const result = await bulkCreateShipments(orderIds);

        toast.dismiss(toastId);
        router.refresh();

        if (result.success) {
          toast.success(
            `✅ ${result.processed} shipments created successfully!`
          );
          setSelectedOrders(new Set());
        } else if (result.processed > 0) {
          toast.success(
            `⚠️ ${result.processed} created, ${result.failed} failed. Check logs for details.`
          );
          setSelectedOrders(new Set());
        } else {
          toast.error(`❌ All ${result.total} orders failed.`);
        }
      } catch (error: any) {
        toast.dismiss(toastId);
        router.refresh();
        toast.error(error.message || "Bulk shipment failed.");
      }
    });
  };

  // ✅ BULK LABEL PRINTING
  const handlePrintLabels = async () => {
    if (selectedOrders.size === 0) {
      toast.error("Please select at least one order to print labels.");
      return;
    }

    const orderIds = Array.from(selectedOrders);
    const toastId = toast.loading(`Preparing labels for ${orderIds.length} orders...`);

    try {
      const response = await fetch("/api/orders/shipments/bulk-print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
      });

      toast.dismiss(toastId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate labels");
      }

      // Download merged PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulk-labels-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`✅ Labels downloaded successfully!`);
      setSelectedOrders(new Set());
      router.refresh();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to print labels.");
      router.refresh();
    }
  };

  // ================================================================
  // 🎨 UI STATE HELPERS
  // ================================================================

  const allSelected = orders.length > 0 && selectedOrders.size === orders.length;
  const someSelected = selectedOrders.size > 0 && selectedOrders.size < orders.length;
  const hasSelected = selectedOrders.size > 0;

  // ================================================================
  // 🏗️ RENDER (Cyber-HUD Spec)
  // ================================================================

  return (
    <>
      <div className="lg:hidden space-y-3">
        {/* Header with Select All */}
        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-zinc-500 hover:text-brand-primary transition-colors cursor-pointer"
              title={allSelected ? "Deselect all" : "Select all"}
            >
              {allSelected ? (
                <CheckSquare size={16} className="text-brand-primary" />
              ) : someSelected ? (
                <Square size={16} className="text-brand-primary opacity-50" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
              {hasSelected ? `${selectedOrders.size} selected` : "Select orders"}
            </span>
          </div>
        </div>

        {/* Order Cards */}
        {orders.map((order) => (
          <div
            key={order._id}
            className={`p-4 rounded-2xl border shadow-xs transition-colors ${
              selectedOrders.has(order._id)
                ? "bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary"
                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedOrders.has(order._id)}
                onChange={() => toggleSelectOrder(order._id)}
                className="mt-1 h-3.5 w-3.5 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 font-bold">
                      {order.orderId}
                      <CopyButton textToCopy={order.orderId} />
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-1 truncate">
                      {order.shippingAddress.fullName}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${getAdminStatusColor(order.status)} ml-2 shrink-0`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="mt-4 flex justify-between items-end border-t border-zinc-100 dark:border-zinc-850 pt-3">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                      {mounted
                        ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : String(order.createdAt).split("T")[0]}
                    </p>
                    <p className="font-mono font-black text-base text-zinc-900 dark:text-zinc-100 mt-0.5">
                      Rs. {order.totalPrice.toLocaleString("en-PK")}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors shadow-2xs no-underline hover:no-underline"
                  >
                    View Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ BULK ACTIONS BAR (Mobile Floating HUD) */}
      {hasSelected && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-zinc-900/95 dark:bg-black/95 backdrop-blur-md border border-zinc-800 shadow-2xl p-3.5 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white">
              {selectedOrders.size} selected
            </span>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono underline"
            >
              Clear
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Print Labels Button */}
            <button
              onClick={handlePrintLabels}
              disabled={isBulkPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-[10px] uppercase tracking-wider cursor-pointer shadow-xs shadow-blue-500/10"
            >
              {isBulkPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Printer size={14} />
              )}
              {isBulkPending ? "..." : `Print ${selectedOrders.size}`}
            </button>

            {/* Ship Orders Button */}
            <button
              onClick={handleBulkShipment}
              disabled={isBulkPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl transition-colors text-[10px] uppercase tracking-wider cursor-pointer shadow-xs shadow-brand-primary/10"
            >
              {isBulkPending && <Loader2 className="animate-spin" size={14} />}
              <Package size={14} />
              {isBulkPending ? "..." : `Ship ${selectedOrders.size}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}