// 📂 src/app/features/admin/order-fulfillment/components/returns/UpdateReturnStatus.tsx (CYBER-HUD HARDENED)

"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { updateReturnRequestStatusPayload } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import { Loader2, RotateCcw } from "lucide-react";
import { 
  RETURN_STATUSES_FILTER, 
  RETURN_RESOLUTIONS_WITH_PLACEHOLDER 
} from "@/app/shared/utils/adminOrderDisplayUtils";

interface UpdateReturnStatusProps {
  returnId: string;
  currentStatus: string;
}

export default function UpdateReturnStatus({ returnId, currentStatus }: UpdateReturnStatusProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateReturnRequestStatusPayload(returnId, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const inputStyles = "w-full p-2.5 text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all";

  return (
    <form action={handleSubmit} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="space-y-1 pb-2 border-b border-zinc-150 dark:border-zinc-850">
        <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider font-mono flex items-center gap-2">
          <RotateCcw size={16} className="text-brand-primary" /> Manage RMA Request
        </h2>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
          Update customer return resolution state. Status emails are dispatched automatically.
        </p>
      </div>
      
      {/* Status Dropdown */}
      <div>
        <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          Update Return Status
        </label>
        <select 
          name="status" 
          defaultValue={currentStatus} 
          disabled={isPending} 
          className={inputStyles}
        >
          {RETURN_STATUSES_FILTER.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Resolution Dropdown */}
      <div>
        <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          Resolution Type
        </label>
        <select 
          name="resolution" 
          disabled={isPending} 
          className={inputStyles}
        >
          {RETURN_RESOLUTIONS_WITH_PLACEHOLDER.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Admin Comments */}
      <div>
        <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          Internal Admin Notes (Sent in Email)
        </label>
        <textarea 
          name="adminComments" 
          rows={3} 
          disabled={isPending} 
          className={inputStyles} 
          placeholder="Add notes or store credit voucher details for the customer..."
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isPending} 
        className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 shadow-xs shadow-brand-primary/10"
      >
        {isPending && <Loader2 className="animate-spin" size={16} />} 
        Update Request
      </button>
    </form>
  );
}