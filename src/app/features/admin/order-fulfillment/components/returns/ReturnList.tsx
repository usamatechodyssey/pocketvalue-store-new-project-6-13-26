// 📂 src/app/features/admin/order-fulfillment/components/returns/ReturnList.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminReturnRequest } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { getReturnStatusColor } from "@/app/shared/utils/adminOrderDisplayUtils";

interface ReturnListProps {
  requests: AdminReturnRequest[];
}

export default function ReturnList({ requests }: ReturnListProps) {
  const [mounted, setMounted] = useState(false);

  // SSR Hydration safeguard registration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {requests.map((req) => (
          <div 
            key={req._id} 
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{req.customerName}</p>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  Order: {req.orderNumber}
                  <CopyButton textToCopy={req.orderNumber} />
                </p>
              </div>
              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${getReturnStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-end">
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                {mounted
                  ? new Date(req.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : String(req.createdAt).split("T")[0]}
              </p>
              <Link 
                href={`/admin/returns/${req._id}`} 
                className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Cyber-HUD Spec) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-850 text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/40">
            <tr>
              <th className="px-6 py-3 text-left font-mono font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Order #</th>
              <th className="px-6 py-3 text-left font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                <td className="px-6 py-3.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    {req.orderNumber}
                    <CopyButton textToCopy={req.orderNumber} />
                  </div>
                </td>
                <td className="px-6 py-3.5 font-medium text-zinc-800 dark:text-zinc-200">{req.customerName}</td>
                <td className="px-6 py-3.5 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                  {mounted
                    ? new Date(req.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : String(req.createdAt).split("T")[0]}
                </td>
                <td className="px-6 py-3.5 text-center font-mono font-bold text-zinc-800 dark:text-zinc-200">{req.itemCount}</td>
                <td className="px-6 py-3.5 text-center">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getReturnStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-center">
                  <Link 
                    href={`/admin/returns/${req._id}`} 
                    className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline text-xs"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}