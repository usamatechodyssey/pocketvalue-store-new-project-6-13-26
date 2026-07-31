// "use client";

// import { useTransition } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import {
//   Search,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   UserCircle,
// } from "lucide-react";
// import { useDebouncedCallback } from "use-debounce";
// import { AdminUser } from "@/app/features/admin/staff-management/actions/payloadUserAdminActions";
// import Pagination from "@/app/shared/components/helpers/Pagination";

// export default function UsersClientPage({
//   initialUsers,
//   initialTotalPages,
// }: {
//   initialUsers: AdminUser[];
//   initialTotalPages: number;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();

//   const currentSearch = searchParams.get("search") || "";
//   const currentPage = Number(searchParams.get("page")) || 1;

//   const debouncedSearch = useDebouncedCallback((value: string) => {
//     const params = new URLSearchParams(searchParams);
//     params.set("page", "1");
//     if (value) params.set("search", value);
//     else params.delete("search");
//     startTransition(() => router.push(`${pathname}?${params.toString()}`));
//   }, 500);

//   return (
//     <div className="relative">
//       {isPending && (
//         <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
//           <Loader2 className="animate-spin text-brand-primary" size={48} />
//         </div>
//       )}

//       <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
//         {/* Search Bar */}
//         <div className="relative">
//           <Search
//             className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//             size={20}
//           />
//           <input
//             type="text"
//             defaultValue={currentSearch}
//             onChange={(e) => debouncedSearch(e.target.value)}
//             placeholder="Search by Name, Email or Phone..."
//             className="w-full p-2.5 pl-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-brand-primary"
//           />
//         </div>

//         {/* Desktop Table */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
//             <thead className="bg-gray-50 dark:bg-gray-900/50">
//               <tr className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">
//                 <th className="px-6 py-4 text-left">Customer Details</th>
//                 <th className="px-6 py-4 text-left">Joined</th>
//                 <th className="px-6 py-4 text-center">Verification</th>
//                 <th className="px-6 py-4 text-center">Orders</th>
//                 <th className="px-6 py-4 text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
//               {initialUsers.length > 0 ? (
//                 initialUsers.map((user) => (
//                   <tr
//                     key={user._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border dark:border-gray-700">
//                           <Image
//                             src={user.image || "/default-avatar.png"}
//                             alt=""
//                             fill
//                             className="object-cover"
//                           />
//                         </div>
//                         <div>
//                           <p className="font-bold text-gray-900 dark:text-white">
//                             {user.name}
//                           </p>
//                           <p className="text-xs text-gray-500">{user.email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-gray-500">
//                       {new Date(user.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <div className="flex justify-center gap-2">
//                         {/* Email Verification Icon */}
//                         <span
//                           title={
//                             user.emailVerified
//                               ? "Email Verified"
//                               : "Email Not Verified"
//                           }
//                         >
//                           {user.emailVerified ? (
//                             <CheckCircle size={16} className="text-green-500" />
//                           ) : (
//                             <XCircle size={16} className="text-gray-300" />
//                           )}
//                         </span>

//                         {/* Phone Verification Icon */}
//                         <span
//                           title={
//                             user.phoneVerified
//                               ? "Phone Verified"
//                               : "Phone Not Verified"
//                           }
//                         >
//                           {user.phoneVerified ? (
//                             <CheckCircle size={16} className="text-blue-500" />
//                           ) : (
//                             <XCircle size={16} className="text-gray-300" />
//                           )}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
//                       {user.orderCount}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       {/* ✅ FIX: Points to Payload Custom User View */}
//                       <Link
//                         href={`/admin/users-explorer/${user._id}`}
//                         className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-tighter"
//                       >
//                         View Profile
//                       </Link>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="py-20 text-center text-gray-400 italic"
//                   >
//                     No customers matched your search.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {initialTotalPages > 1 && (
//         <Pagination
//           totalPages={initialTotalPages}
//           currentPage={currentPage}
//           onPageChange={(p) => {
//             const params = new URLSearchParams(searchParams);
//             params.set("page", p.toString());
//             startTransition(() =>
//               router.push(`${pathname}?${params.toString()}`),
//             );
//           }}
//           isPending={isPending}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { AdminUser } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";
// ✅ UPDATED IMPORT
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

export default function UsersClientPage({
  initialUsers,
  initialTotalPages,
}: {
  initialUsers: AdminUser[];
  initialTotalPages: number;
}) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  // Helper inside users component for search debounce remains local
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("search", value);
    else params.delete("search");
    startTransition(() => {
      window.history.replaceState(null, "", `?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-50 rounded-xl">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search by Name, Email or Phone..."
            className="w-full p-2.5 pl-11 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-brand-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4 text-left">Customer Details</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-center">Verification</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {initialUsers.length > 0 ? (
                initialUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border dark:border-gray-700">
                          <Image
                            src={user.image || "/default-avatar.png"}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <span title={user.emailVerified ? "Email Verified" : "Email Not Verified"}>
                          {user.emailVerified ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-gray-300" />
                          )}
                        </span>
                        <span title={user.phoneVerified ? "Phone Verified" : "Phone Not Verified"}>
                          {user.phoneVerified ? (
                            <CheckCircle size={16} className="text-blue-500" />
                          ) : (
                            <XCircle size={16} className="text-gray-300" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
                      {user.orderCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/users-explorer/${user._id}`}
                        className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-tighter"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    No customers matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {initialTotalPages > 1 && (
        // ✅ RESOLVED: Complex callback logic cleaned and unified
        <PaginationControls totalPages={initialTotalPages} />
      )}
    </div>
  );
}