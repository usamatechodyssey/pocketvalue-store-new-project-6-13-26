// "use client";

// import { useTransition } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Loader2, Package } from "lucide-react";
// import { ClientOrder } from "@/models/Order";
// import Pagination from "@/app/shared/components/helpers/Pagination"; // Pagination wahi reuse kar sakte hain
// import AdminOrderFilters from "./AdminOrderFilters"; // Payload version
// import AdminOrdersTable from "./AdminOrdersTable"; // Payload version
// import AdminOrdersMobileList from "./AdminOrdersMobileList"; // Payload version

// interface OrdersClientPageProps {
//   initialOrders: ClientOrder[];
//   initialTotalPages: number;
// }

// export default function OrdersClientPage({
//   initialOrders,
//   initialTotalPages,
// }: OrdersClientPageProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const currentPage = Number(searchParams.get("page")) || 1;

//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     startTransition(() => {
//       // ✅ FIX: Path changed to Payload collections
//       router.push(`/admin/orders?${params.toString()}`);
//     });
//   };

//   const hasOrders = initialOrders.length > 0;

//   return (
//     <div className="relative">
//       {isPending && (
//         <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-10 rounded-lg">
//           <Loader2 className="animate-spin text-brand-primary" size={48} />
//         </div>
//       )}
//       <div
//         className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
//       >
//         <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6">
//           <AdminOrderFilters />
//           {hasOrders ? (
//             <>
//               <AdminOrdersTable orders={initialOrders} />
//               <AdminOrdersMobileList orders={initialOrders} />
//             </>
//           ) : (
//             <div className="text-center py-16 text-gray-500">
//               <Package size={48} className="mx-auto text-gray-400" />
//               <p className="font-semibold mt-4">No orders found</p>
//             </div>
//           )}
//         </div>
//         {initialTotalPages > 1 && (
//           <Pagination
//             totalPages={initialTotalPages}
//             currentPage={currentPage}
//             onPageChange={handlePageChange}
//             isPending={isPending}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useTransition } from "react";
import { Loader2, Package } from "lucide-react";
import { ClientOrder } from "@/models/Order";
// ✅ UPDATED IMPORT
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrdersTable from "./AdminOrdersTable";
import AdminOrdersMobileList from "./AdminOrdersMobileList";

interface OrdersClientPageProps {
  initialOrders: ClientOrder[];
  initialTotalPages: number;
}

export default function OrdersClientPage({
  initialOrders,
  initialTotalPages,
}: OrdersClientPageProps) {
  const [isPending] = useTransition(); // Cleaned router/params boilerplate
  const hasOrders = initialOrders.length > 0;

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      <div
        className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6">
          <AdminOrderFilters />
          {hasOrders ? (
            <>
              <AdminOrdersTable orders={initialOrders} />
              <AdminOrdersMobileList orders={initialOrders} />
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto text-gray-400" />
              <p className="font-semibold mt-4">No orders found</p>
            </div>
          )}
        </div>
        {initialTotalPages > 1 && (
          // ✅ RESOLVED: Now uses consolidated PaginationControls
          <PaginationControls totalPages={initialTotalPages} />
        )}
      </div>
    </div>
  );
}