// // 📂 src/app/features/admin/loyalty-intelligence/components/AdminPayoutActionButton.tsx

// "use client";

// import React, { useTransition } from "react";
// import { Loader2, Ticket } from "lucide-react"; 
// import { clearReferralRewardAction } from "@/app/features/admin/loyalty-intelligence/actions/payoutActions";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// interface AdminRewardActionButtonProps {
//   referralId: string;
// }

// export default function AdminPayoutActionButton({ referralId }: AdminRewardActionButtonProps) {
//   const [isPending, startTransition] = useTransition();

//   const handleClearReward = () => {
//     // ✅ Prevent double clicks while processing
//     if (isPending) return;

//     startTransition(async () => {
//       try {
//         const result = await clearReferralRewardAction(referralId);
        
//         if (result.success) {
//           toastSuccess(result.message);
//         } else {
//           toastError(result.message || "Failed to process reward clearance.");
//         }
//       } catch (err: unknown) {
//         const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
//         toastError(errMsg);
//       }
//     });
//   };

//   return (
//     <button
//       onClick={handleClearReward}
//       disabled={isPending}
//       title={isPending ? "Processing..." : "Mark reward as issued to this referrer"}
//       aria-label={isPending ? "Processing reward clearance" : "Mark reward as issued"}
//       className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 text-white rounded-xl shadow-2xs active:scale-95 transition-all duration-150 cursor-pointer min-w-25"
//     >
//       {isPending ? (
//         <>
//           <Loader2 size={12} className="animate-spin" aria-hidden="true" />
//           <span>Clearing...</span>
//         </>
//       ) : (
//         <>
//           <Ticket size={11} aria-hidden="true" />
//           <span>Voucher Sent</span>
//         </>
//       )}
//     </button>
//   );
// }
// 📂 src/app/features/admin/loyalty-intelligence/components/AdminPayoutActionButton.tsx

"use client";

import React, { useTransition } from "react";
import { Loader2, Ticket } from "lucide-react"; 
import { clearReferralRewardAction } from "@/app/features/admin/loyalty-intelligence/actions/payoutActions";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface AdminRewardActionButtonProps {
  referralId: string;
}

export default function AdminPayoutActionButton({ referralId }: AdminRewardActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClearReward = () => {
    // Prevent double clicks while processing
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await clearReferralRewardAction(referralId);
        
        if (result.success) {
          toastSuccess(result.message);
        } else {
          toastError(result.message || "Failed to process reward clearance.");
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
        toastError(errMsg);
      }
    });
  };

  return (
    <button
      onClick={handleClearReward}
      disabled={isPending}
      title={isPending ? "Processing..." : "Mark reward as issued to this referrer"}
      aria-label={isPending ? "Processing reward clearance" : "Mark reward as issued"}
      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 text-white rounded-xl shadow-2xs active:scale-95 transition-all duration-150 cursor-pointer min-w-28"
    >
      {isPending ? (
        <>
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          <span>Clearing...</span>
        </>
      ) : (
        <>
          <Ticket size={11} aria-hidden="true" />
          <span>Clear Voucher</span> {/* ✅ FIX: Changed confusing label from 'Voucher Sent' to 'Clear Voucher' */}
        </>
      )}
    </button>
  );
}