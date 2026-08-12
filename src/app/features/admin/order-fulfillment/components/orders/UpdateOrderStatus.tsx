
// // 📂 src/app/features/admin/order-fulfillment/components/orders/UpdateOrderStatus.tsx

// "use client";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";
// import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
// import { updateOrderStatus } from "@/app/features/admin/order-fulfillment/actions/ordersActions";
// import { ADMIN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

// interface UpdateOrderStatusProps {
//   orderId: string;
//   currentStatus: string;
// }

// export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
//   const [newStatus, setNewStatus] = useState(currentStatus);
//   const [bypass, setBypass] = useState(false); // ✅ ADMIN OVERRIDE TOGGLE
//   const [isPending, startTransition] = useTransition();
//   const router = useRouter();

//   const handleUpdate = () => {
//     if (newStatus === currentStatus) return;
//     startTransition(async () => {
//       // ✅ Passes bypass boolean parameter so admin can force update directly to 'Delivered'
//       const result = await updateOrderStatus(orderId, newStatus, bypass);
//       if (result?.success) {
//         toast.success(result.message);
//         router.refresh();
//       } else {
//         toast.error(result?.message || "Failed to update order status.");
//         setNewStatus(currentStatus);
//       }
//     });
//   };

//   return (
//     <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-4 font-mono">
//       <div className="space-y-1">
//         <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-2">
//           <RefreshCw size={16} className="text-brand-primary" /> Update Order Status
//         </h2>
//         <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
//           State-machine protected transition. Email notification will be sent to customer automatically.
//         </p>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-3 pt-2">
//         <select 
//           value={newStatus} 
//           onChange={(e) => setNewStatus(e.target.value)} 
//           disabled={isPending}
//           className="grow p-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all cursor-pointer"
//         >
//           {ADMIN_STATUSES.filter(s => s !== 'All').map((status) => (
//             <option key={status} value={status}>{status}</option>
//           ))}
//         </select>
//         <button 
//           onClick={handleUpdate} 
//           disabled={isPending || newStatus === currentStatus}
//           className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10 active:scale-95"
//         >
//           {isPending && <Loader2 className="animate-spin" size={16} />}
//           Update Request
//         </button>
//       </div>

//       {/* ✅ ADMIN OVERRIDE CHECKBOX (BYPASS STATE MACHINE) */}
//       <div className="pt-2 flex items-center gap-2">
//         <label className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
//           <input
//             type="checkbox"
//             checked={bypass}
//             onChange={(e) => setBypass(e.target.checked)}
//             className="rounded border-zinc-300 text-brand-primary focus:ring-brand-primary h-3.5 w-3.5 cursor-pointer"
//           />
//           <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
//             <ShieldAlert size={12} /> Admin Override (Bypass State Machine Guard)
//           </span>
//         </label>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/order-fulfillment/components/orders/UpdateOrderStatus.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { updateOrderStatus } from "@/app/features/admin/order-fulfillment/actions/ordersActions";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: string;
}

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [bypass, setBypass] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus, bypass);
      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to update order status.");
        setNewStatus(currentStatus);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-4 font-mono">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw size={16} className="text-brand-primary" /> Update Order Status
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          State-machine protected transition. Email notification will be sent to customer automatically.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* ✅ CATEGORIZED OPTGROUP DROPDOWN */}
        <select 
          value={newStatus} 
          onChange={(e) => setNewStatus(e.target.value)} 
          disabled={isPending}
          className="grow p-2.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all cursor-pointer"
        >
          <optgroup label="🚀 Initial State" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="Pending">Pending</option>
          </optgroup>

          <optgroup label="💳 Payment & Verification" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="Payment Verified">Payment Verified</option>
            <option value="Fraud Hold">Fraud Hold</option>
          </optgroup>

          <optgroup label="🚚 Fulfillment Pipeline" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="Processing">Processing</option>
            <option value="Ready to Ship">Ready to Ship</option>
            <option value="Shipped">Shipped</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </optgroup>

          <optgroup label="📦 Returns & RMA" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="Return Requested">Return Requested</option>
            <option value="Return Approved">Return Approved</option>
            <option value="Refund Initiated">Refund Initiated</option>
          </optgroup>

          <optgroup label="🔄 RTO Pipeline" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="RTO">RTO</option>
            <option value="Auto-Restocked">Auto-Restocked</option>
          </optgroup>

          <optgroup label="⏸️ Admin Hold" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="On Hold">On Hold</option>
          </optgroup>

          <optgroup label="🏁 Terminal States" className="font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </optgroup>
        </select>

        <button 
          onClick={handleUpdate} 
          disabled={isPending || newStatus === currentStatus}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10 active:scale-95"
        >
          {isPending && <Loader2 className="animate-spin" size={16} />}
          Update Request
        </button>
      </div>

      {/* ADMIN OVERRIDE CHECKBOX */}
      <div className="pt-2 flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bypass}
            onChange={(e) => setBypass(e.target.checked)}
            className="rounded border-zinc-300 text-brand-primary focus:ring-brand-primary h-3.5 w-3.5 cursor-pointer"
          />
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
            <ShieldAlert size={12} /> Admin Override (Bypass State Machine Guard)
          </span>
        </label>
      </div>
    </div>
  );
}