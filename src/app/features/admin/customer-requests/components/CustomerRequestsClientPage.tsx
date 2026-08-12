// 📂 src/app/features/admin/customer-requests/components/CustomerRequestsClientPage.tsx

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Loader2, CheckCircle, XCircle, Clock, Zap, Mail, Phone } from "lucide-react";
import { ClientCustomerRequest } from "../actions/getCustomerRequests";
import { updateCustomerRequestStatus } from "../actions/updateCustomerRequestStatus";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ✅ WORKSPACE STANDARD TOASTS
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

export default function CustomerRequestsClientPage({
  initialRequests,
  initialTotalPages,
}: {
  initialRequests: ClientCustomerRequest[];
  initialTotalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";

  // Hydration safeguard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search handler (500ms)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) params.set("search", value);
    else params.delete("search");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 500);

  // Status Filter Change handler
  const handleStatusFilterChange = (statusVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (statusVal && statusVal !== "all") params.set("status", statusVal);
    else params.delete("status");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // ✅ Manual Approval handler (Surgical database update & broadcaster email dispatch!)
  const handleApproveRequest = async (requestId: string) => {
    startTransition(async () => {
      try {
        const res = await updateCustomerRequestStatus(requestId, "notified");
        if (res.success) {
          toastSuccess(res.message || "Customer successfully notified!");
          router.refresh(); // Refreshes the server-component data layer
        } else {
          toastError(res.message || "Failed to notify customer.");
        }
      } catch (err: any) {
        toastError(err.message || "An unexpected error occurred.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "notified":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "ignored":
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const formatRequestType = (type: string) => {
    switch (type) {
      case "restock": return "Restock";
      case "missing_variant": return "Missing Variant";
      case "missing_product": return "Missing Product";
      default: return type;
    }
  };

  return (
    <div className="relative font-sans w-full min-w-0">
      
      {/* GLASSMORPHISM LOADER OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 flex justify-center items-center z-50 rounded-2xl backdrop-blur-xs animate-in fade-in duration-200">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      )}

      <div className={`transition-opacity duration-200 ${isPending ? "opacity-40" : "opacity-100"} space-y-6 w-full min-w-0`}>
        
        {/* HUD FILTERS CONTROLS PANEL */}
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]"
              size={16}
            />
            <input
              type="text"
              defaultValue={currentSearch}
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search by Email, Phone or Product name..."
              className="appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2.5 print:hidden shrink-0">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-brand-primary transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <option value="all">🔍 ALL</option>
              <option value="pending">⏳ PENDING</option>
              <option value="notified">🔔 NOTIFIED</option>
              <option value="ignored">🚫 IGNORED</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-850">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850 text-xs relative">
              <thead className="bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left whitespace-nowrap">Request Type</th>
                  <th className="px-6 py-3.5 text-left whitespace-nowrap">Product / Sizing Attributes</th>
                  <th className="px-6 py-3.5 text-left whitespace-nowrap">Contact</th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap">Urgency</th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap">Submitted</th>
                  <th className="px-6 py-3.5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 bg-white/40 dark:bg-zinc-950/40">
                {initialRequests.length > 0 ? (
                  initialRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
                          {formatRequestType(req.requestType)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                            {req.requestedProductName || req.productId || "N/A"}
                          </span>
                          {req.selectedAttributes && (
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                              {Object.entries(req.selectedAttributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" · ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <a
                            href={`mailto:${req.email}`}
                            className="text-[10px] font-bold text-brand-primary flex items-center gap-1 no-underline hover:no-underline"
                          >
                            <Mail size={10} /> {req.email}
                          </a>
                          {req.phone && (
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                              <Phone size={9} /> {req.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        {req.urgencyLevel === "urgent" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-bold uppercase">
                            <Zap size={10} /> Urgent
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Normal</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(
                            req.status
                          )}`}
                        >
                          {req.status === "pending" && <Clock size={10} />}
                          {req.status === "notified" && <CheckCircle size={10} />}
                          {req.status === "ignored" && <XCircle size={10} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-zinc-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {mounted
                          ? new Date(req.createdAt).toLocaleDateString("en-PK", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : req.createdAt.split("T")[0]}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        {req.status === "pending" ? (
                          <button
                            onClick={() => handleApproveRequest(req._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold uppercase rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Approve and notify customer immediately"
                          >
                            Approve & Notify
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono italic">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center text-zinc-500 dark:text-zinc-400 italic text-xs font-mono"
                    >
                      No customer requests found matching the active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION CONTROLS */}
        {initialTotalPages > 1 && (
          <div className="mt-4">
            <PaginationControls totalPages={initialTotalPages} />
          </div>
        )}

      </div>
    </div>
  );
}