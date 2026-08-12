// 📂 src/app/features/admin/order-fulfillment/components/orders/UpdatePaymentStatus.tsx (CYBER-HUD HARDENED)

"use client";

import { useTransition } from "react";
import { Loader2, CheckCircle2, CreditCard, RotateCcw } from "lucide-react";
import { updatePaymentStatusAction } from "../../actions/ordersActions";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface UpdatePaymentStatusProps {
  orderId: string;
  currentPaymentStatus: "Paid" | "Unpaid" | "Refunded";
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
    <div className="mt-4 pt-3 border-t border-zinc-150 dark:border-zinc-850">
      {isRefunded ? (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <RotateCcw size={14} className="stroke-[2.2px]" />
          <span>Payment Refunded</span>
        </div>
      ) : (
        <button
          onClick={handleTogglePaymentStatus}
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
            isPaid
              ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
              : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 shadow-emerald-600/10"
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