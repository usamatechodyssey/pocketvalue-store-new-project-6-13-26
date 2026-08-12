// 📂 src/app/features/admin/inventory-cms/components/payload-users/UsersClientPage.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { AdminUser } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

export default function UsersClientPage({
  initialUsers,
  initialTotalPages,
}: {
  initialUsers: AdminUser[];
  initialTotalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  // SSR Hydration safeguard registration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search (500ms prevents query request flooding)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Bumps back to page 1 to prevent empty index bounds
    if (value) params.set("search", value);
    else params.delete("search");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  return (
    <div className="relative font-sans">
      {/* GLASSMORPHISM LOADING OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex justify-center items-center z-50 rounded-2xl backdrop-blur-xs animate-in fade-in duration-200">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      )}

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-40" : "opacity-100"} space-y-6`}>
        {/* MAIN HUD CONTAINER */}
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]"
              size={16}
            />
            <input
              type="text"
              defaultValue={currentSearch}
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search by Name, Email or Phone..."
              className="appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850 text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/40">
                <tr className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-3.5 text-left">Customer Details</th>
                  <th className="px-6 py-3.5 text-left">Joined</th>
                  <th className="px-6 py-3.5 text-center">Verification</th>
                  <th className="px-6 py-3.5 text-center">Orders</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-850">
                {initialUsers.length > 0 ? (
                  initialUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                            <Image
                              src={user.image || "/default-avatar.png"}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {mounted
                          ? new Date(user.createdAt).toLocaleDateString("en-PK", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : String(user.createdAt).split("T")[0]}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex justify-center gap-2.5">
                          <span title={user.emailVerified ? "Email Verified" : "Email Not Verified"}>
                            {user.emailVerified ? (
                              <CheckCircle size={14} className="text-emerald-500 stroke-[2.5px]" />
                            ) : (
                              <XCircle size={14} className="text-zinc-300 dark:text-zinc-700 stroke-[2.5px]" />
                            )}
                          </span>
                          <span title={user.phoneVerified ? "Phone Verified" : "Phone Not Verified"}>
                            {user.phoneVerified ? (
                              <CheckCircle size={14} className="text-blue-500 stroke-[2.5px]" />
                            ) : (
                              <XCircle size={14} className="text-zinc-300 dark:text-zinc-700 stroke-[2.5px]" />
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                        {user.orderCount}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/users-explorer/${user._id}`}
                          className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-wider no-underline hover:no-underline"
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
                      className="py-20 text-center text-zinc-500 dark:text-zinc-400 italic text-xs font-mono"
                    >
                      No customers matched your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {initialTotalPages > 1 && (
          <div className="mt-4">
            <PaginationControls totalPages={initialTotalPages} />
          </div>
        )}
      </div>
    </div>
  );
}