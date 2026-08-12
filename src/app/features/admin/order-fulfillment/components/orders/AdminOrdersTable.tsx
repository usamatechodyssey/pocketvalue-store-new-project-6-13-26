// 📂 src/app/features/admin/order-fulfillment/components/orders/AdminOrdersTable.tsx (CYBER-HUD HARDENED)

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

interface AdminOrdersTableProps {
  orders: ClientOrder[];
}

// ================================================================
// 🏠 MAIN COMPONENT
// ================================================================

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
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

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o._id)));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
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
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {/* TABLE */}
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850 text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/40">
            <tr>
              <th className="px-4 py-3 text-center">
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
              </th>
              <th className="px-6 py-3 text-left font-mono font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-right font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {orders.map((order) => (
              <tr
                key={order._id}
                className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors ${
                  selectedOrders.has(order._id)
                    ? "bg-brand-primary/5 dark:bg-brand-primary/10"
                    : ""
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => toggleSelectOrder(order._id)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </td>
                {/* Order ID */}
                <td className="px-6 py-3.5 font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                  <div className="flex items-center gap-2">
                    {order.orderId}
                    <CopyButton textToCopy={order.orderId} />
                  </div>
                </td>
                {/* Customer */}
                <td className="px-6 py-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                  {order.shippingAddress.fullName}
                </td>
                {/* Date */}
                <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                  {mounted
                    ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : String(order.createdAt).split("T")[0]}
                </td>
                {/* Items Count */}
                <td className="px-6 py-3.5 text-center font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                  {order.products.length}
                </td>
                {/* Total */}
                <td className="px-6 py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  Rs. {order.totalPrice.toLocaleString("en-PK")}
                </td>
                {/* Status */}
                <td className="px-6 py-3.5 text-center">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getAdminStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-6 py-3.5 text-center">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline text-xs"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ BULK ACTIONS BAR (Desktop HUD) */}
      {hasSelected && (
        <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 dark:bg-black/95 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-4 items-center gap-6 animate-in slide-in-from-bottom-6 duration-300">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white">
              {selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono underline"
            >
              Clear
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Print Labels Button */}
            <button
              onClick={handlePrintLabels}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-blue-500/10"
            >
              {isBulkPending ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Printer size={15} />
              )}
              {isBulkPending ? "Loading..." : `Print ${selectedOrders.size} Labels`}
            </button>

            {/* Ship Orders Button */}
            <button
              onClick={handleBulkShipment}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10"
            >
              {isBulkPending ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Package size={15} />
              )}
              {isBulkPending ? "Processing..." : `Ship ${selectedOrders.size} Orders`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}