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

interface AdminOrdersTableProps {
  orders: ClientOrder[];
}

// ================================================================
// 🏠 MAIN COMPONENT
// ================================================================

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBulkPending, startBulkTransition] = useTransition();

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
      <div className="hidden lg:block overflow-x-auto">
        {/* TABLE */}
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-center">
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
              </th>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">Items</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr
                key={order._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  selectedOrders.has(order._id)
                    ? "bg-blue-50 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => toggleSelectOrder(order._id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </td>
                {/* Order ID */}
                <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {order.orderId}
                    <CopyButton textToCopy={order.orderId} />
                  </div>
                </td>
                {/* Customer */}
                <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">
                  {order.shippingAddress.fullName}
                </td>
                {/* Date */}
                <td className="px-6 py-4 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                {/* Items Count */}
                <td className="px-6 py-4 text-center">
                  {order.products.length}
                </td>
                {/* Total */}
                <td className="px-6 py-4 text-right font-semibold">
                  Rs. {order.totalPrice.toLocaleString()}
                </td>
                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getAdminStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ BULK ACTIONS BAR (Desktop) */}
      {hasSelected && (
        <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 items-center justify-between">
          {/* Left: Selection info */}
          <div className="flex items-center gap-4">
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

          {/* Right: Action Buttons */}
          <div className="flex gap-3">
            {/* ✅ Print Labels Button */}
            <button
              onClick={handlePrintLabels}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isBulkPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Printer size={18} />
              )}
              {isBulkPending ? "Loading..." : `Print ${selectedOrders.size} Labels`}
            </button>

            {/* ✅ Ship Orders Button */}
            <button
              onClick={handleBulkShipment}
              disabled={isBulkPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400 transition-colors"
            >
              {isBulkPending && <Loader2 className="animate-spin" size={18} />}
              <Package size={18} />
              {isBulkPending ? "Processing..." : `Ship ${selectedOrders.size} Orders`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}