"use client";

import { useState, useTransition } from "react";
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
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBulkPending, startBulkTransition] = useTransition();

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

      // Download the merged PDF
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
  // 🏗️ RENDER
  // ================================================================

  return (
    <>
      <div className="lg:hidden space-y-3">
        {/* Header with Select All */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-gray-500 hover:text-brand-primary transition-colors"
              title={allSelected ? "Deselect all" : "Select all"}
            >
              {allSelected ? (
                <CheckSquare size={18} className="text-brand-primary" />
              ) : someSelected ? (
                <Square size={18} className="text-brand-primary opacity-50" />
              ) : (
                <Square size={18} />
              )}
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {hasSelected ? `${selectedOrders.size} selected` : "Select orders"}
            </span>
          </div>
        </div>

        {/* Order Cards */}
        {orders.map((order) => (
          <div
            key={order._id}
            className={`p-4 rounded-lg border shadow-sm transition-colors ${
              selectedOrders.has(order._id)
                ? "bg-blue-50 dark:bg-blue-900/20 border-brand-primary"
                : "bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedOrders.has(order._id)}
                onChange={() => toggleSelectOrder(order._id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-mono text-sm text-gray-800 dark:text-gray-100 font-bold">
                      {order.orderId}
                      <CopyButton textToCopy={order.orderId} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1 truncate">
                      {order.shippingAddress.fullName}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${getAdminStatusColor(order.status)} ml-2 shrink-0`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white mt-0.5">
                      Rs. {order.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-bold text-brand-primary hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    View Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ BULK ACTIONS BAR (Mobile - Floating Bottom) */}
      {hasSelected && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 flex items-center justify-between">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>

          {/* Right: Action Buttons (2 buttons, stacked or inline) */}
          <div className="flex gap-2">
            {/* ✅ Print Labels Button */}
            <button
              onClick={handlePrintLabels}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
            >
              {isBulkPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Printer size={16} />
              )}
              {isBulkPending ? "..." : `Print ${selectedOrders.size}`}
            </button>

            {/* ✅ Ship Orders Button */}
            <button
              onClick={handleBulkShipment}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400 transition-colors text-sm"
            >
              {isBulkPending && <Loader2 className="animate-spin" size={16} />}
              <Package size={16} />
              {isBulkPending ? "Processing..." : `Ship ${selectedOrders.size}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}