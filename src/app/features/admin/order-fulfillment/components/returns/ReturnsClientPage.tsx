// "use client";

// import { useTransition } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import { Loader2, Inbox } from "lucide-react";
// import Pagination from "@/app/shared/components/helpers/Pagination";
// import { AdminReturnRequest } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
// import ReturnFilters from "./ReturnFilters";
// import ReturnList from "./ReturnList";

// export default function ReturnsClientPage({ initialRequests, initialTotalPages }: { initialRequests: AdminReturnRequest[], initialTotalPages: number }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const currentPage = Number(searchParams.get("page")) || 1;

//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     startTransition(() => router.push(`${pathname}?${params.toString()}`));
//   };

//   return (
//     <div className="relative">
//       {isPending && (
//         <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
//           <Loader2 className="animate-spin text-brand-primary" size={48} />
//         </div>
//       )}
//       <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
//         <ReturnFilters />
//         {initialRequests.length > 0 ? (
//           <ReturnList requests={initialRequests} />
//         ) : (
//           <div className="text-center py-20 text-gray-400">
//             <Inbox size={48} className="mx-auto mb-4 opacity-10" />
//             <p className="font-bold tracking-tight">No return requests found.</p>
//           </div>
//         )}
//       </div>
//       {initialTotalPages > 1 && (
//         <Pagination totalPages={initialTotalPages} currentPage={currentPage} onPageChange={handlePageChange} isPending={isPending} />
//       )}
//     </div>
//   );
// }
"use client";

import { useTransition } from "react";
import { Loader2, Inbox } from "lucide-react";
// ✅ UPDATED IMPORT
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { AdminReturnRequest } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import ReturnFilters from "./ReturnFilters";
import ReturnList from "./ReturnList";

export default function ReturnsClientPage({ initialRequests, initialTotalPages }: { initialRequests: AdminReturnRequest[], initialTotalPages: number }) {
  const [isPending] = useTransition(); // Cleaned up router & params

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
        <ReturnFilters />
        {initialRequests.length > 0 ? (
          <ReturnList requests={initialRequests} />
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Inbox size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold tracking-tight">No return requests found.</p>
          </div>
        )}
      </div>
      {initialTotalPages > 1 && (
        // ✅ RESOLVED: Clean URL-driven pagination controls
        <PaginationControls totalPages={initialTotalPages} />
      )}
    </div>
  );
}