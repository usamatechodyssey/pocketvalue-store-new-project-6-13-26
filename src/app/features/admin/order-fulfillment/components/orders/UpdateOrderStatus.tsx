"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
// ✅ FIX: ABSOLUTE IMPORT
import { updateOrderStatus } from "@/app/features/admin/order-fulfillment/actions/ordersActions";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { ADMIN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: string;
}

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to update.");
        setNewStatus(currentStatus);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
      <h2 className="text-xl font-bold dark:text-white mb-2">Update Order Status</h2>
      <p className="text-sm text-gray-500 mb-4">Email notification will be sent to the customer automatically.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={newStatus} 
          onChange={(e) => setNewStatus(e.target.value)} 
          disabled={isPending}
          className="grow p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-brand-primary"
        >
          {ADMIN_STATUSES.filter(s => s !== 'All').map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button 
          onClick={handleUpdate} 
          disabled={isPending || newStatus === currentStatus}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white font-bold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:bg-gray-400"
        >
          {isPending && <Loader2 className="animate-spin" size={18} />}
          Update Request
        </button>
      </div>
    </div>
  );
}