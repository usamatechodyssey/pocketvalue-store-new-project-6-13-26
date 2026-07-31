// 📂 src/app/features/admin/order-fulfillment/components/orders/UpdatePaymentStatus.tsx (STRICT TYPE-SAFE & REFUND SUPPORTED)

"use client";

import { useTransition } from "react";
import { Loader2, CheckCircle2, CreditCard, RotateCcw } from "lucide-react";
import { updatePaymentStatusAction } from "../../actions/ordersActions";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface UpdatePaymentStatusProps {
  orderId: string;
  currentPaymentStatus: "Paid" | "Unpaid" | "Refunded"; // ✅ FIXED: Fully aligned with IOrder interface
}

export default function UpdatePaymentStatus({
  orderId,
  currentPaymentStatus,
}: UpdatePaymentStatusProps) {
  const [isPending, startTransition] = useTransition();

  const handleTogglePaymentStatus = () => {
    const nextStatus = currentPaymentStatus === "Paid" ? "Unpaid" : "Paid";

    startTransition(async () => {
      const res = await updatePaymentStatusAction(orderId, nextStatus);

      if (res.success) {
        toastSuccess(res.message);
      } else {
        toastError(res.message, "Payment Settlement Failed");
      }
    });
  };

  const isPaid = currentPaymentStatus === "Paid";
  const isRefunded = currentPaymentStatus === "Refunded";

  return (
    <div className="mt-4 pt-3 border-t dark:border-gray-700">
      {isRefunded ? (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <RotateCcw size={14} />
          <span>Payment Refunded</span>
        </div>
      ) : (
        <button
          onClick={handleTogglePaymentStatus}
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
            isPaid
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              : "bg-green-600 hover:bg-green-700 text-white border border-green-700 hover:shadow-md"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Updating Ledger...</span>
            </>
          ) : isPaid ? (
            <>
              <CreditCard size={14} />
              <span>Revert to Unpaid</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              <span>Mark Payment as Paid (Settle)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}