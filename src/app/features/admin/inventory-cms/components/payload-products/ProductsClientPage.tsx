// "use client";

// import { useTransition } from "react";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import { Loader2, PackageSearch } from "lucide-react";
// import Pagination from "@/app/shared/components/helpers/Pagination";
// import ProductSearchFilter from "./ProductSearchFilter";
// import ProductsTable, { AdminProductListItem } from "./ProductsTable";
// import ProductsMobileList from "./ProductsMobileList";

// export default function ProductsClientPage({
//   initialProducts,
//   initialTotalPages,
// }: {
//   initialProducts: AdminProductListItem[];
//   initialTotalPages: number;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const currentPage = Number(searchParams.get("page")) || 1;

//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     startTransition(() => {
//       // ✅ FIX: Stays in Explorer
//       router.push(`${pathname}?${params.toString()}`);
//     });
//   };

//   return (
//     <div className="relative">
//       {isPending && (
//         <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
//           <Loader2 className="animate-spin text-brand-primary" size={48} />
//         </div>
//       )}
//       <div className="space-y-6">
//         <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
//           <ProductSearchFilter />
//           {initialProducts.length > 0 ? (
//             <>
//               <ProductsTable products={initialProducts} />
//               <ProductsMobileList products={initialProducts} />
//             </>
//           ) : (
//             <div className="text-center py-20 text-gray-500">
//               <PackageSearch size={48} className="mx-auto opacity-20 mb-4" />
//               <p className="font-bold">No products or variants found.</p>
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
import { Loader2, PackageSearch } from "lucide-react";
// ✅ UPDATED IMPORT
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import ProductSearchFilter from "./ProductSearchFilter";
import ProductsTable, { AdminProductListItem } from "./ProductsTable";
import ProductsMobileList from "./ProductsMobileList";

export default function ProductsClientPage({
  initialProducts,
  initialTotalPages,
}: {
  initialProducts: AdminProductListItem[];
  initialTotalPages: number;
}) {
  const [isPending] = useTransition(); // Cleaned up router boilerplate

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
          <ProductSearchFilter />
          {initialProducts.length > 0 ? (
            <>
              <ProductsTable products={initialProducts} />
              <ProductsMobileList products={initialProducts} />
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <PackageSearch size={48} className="mx-auto opacity-20 mb-4" />
              <p className="font-bold">No products or variants found.</p>
            </div>
          )}
        </div>
        {initialTotalPages > 1 && (
          // ✅ RESOLVED: Replaced with PaginationControls
          <PaginationControls totalPages={initialTotalPages} />
        )}
      </div>
    </div>
  );
}
