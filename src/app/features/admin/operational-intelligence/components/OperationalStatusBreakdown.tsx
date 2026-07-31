// 📂 src/app/features/admin/operational-intelligence/components/OperationalStatusBreakdown.tsx

"use client";

import React from "react";
import { AlertCircle, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { LIMBO_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ TYPES
// ================================================================
interface OperationalStatusBreakdownProps {
  statusBreakdown: Record<string, number> | null | undefined;
  totalPending?: number;
  showAllStatuses?: boolean;
}

// ================================================================
// 🎨 COMPLETE 17-STATUS CYBER-HUD COLOR MAP
// ================================================================
const statusConfig: Record<string, { color: string; bg: string; border: string; icon?: React.ReactNode }> = {
  // Valid Delivered States
  Delivered: {
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },
  Completed: {
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <CheckCircle size={14} className="text-emerald-500" />,
  },

  // Terminal Cancelled / Rejected States
  Cancelled: {
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <XCircle size={14} className="text-red-500" />,
  },
  Rejected: {
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <XCircle size={14} className="text-red-500" />,
  },

  // Fulfillment Active Group
  Pending: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: <Clock size={14} className="text-yellow-500" />,
  },
  "Payment Verified": {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  Processing: {
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  "Ready to Ship": {
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  Shipped: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  "In Transit": {
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },

  // Returns / RTO Group
  RTO: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <AlertCircle size={14} className="text-red-500" />,
  },
  "Return Requested": {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  "Return Approved": {
    color: "text-lime-600 dark:text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
  },
  "Refund Initiated": {
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  "Auto-Restocked": {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },

  // Holds
  "On Hold": {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  "Fraud Hold": {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function OperationalStatusBreakdown({
  statusBreakdown,
  totalPending = 0,
  showAllStatuses = false,
}: OperationalStatusBreakdownProps) {
  // Empty State
  if (!statusBreakdown || Object.keys(statusBreakdown).length === 0) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50"
        role="status"
        aria-label="No limbo orders found"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Clock size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Limbo Orders
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No orders are currently in stuck/awaiting action status.
          </p>
        </div>
      </div>
    );
  }

  // Filter keys based on mode
  const validEntries = showAllStatuses
    ? Object.keys(statusBreakdown).filter((s) => statusBreakdown[s] > 0)
    : LIMBO_STATUSES.filter((status) => (statusBreakdown[status] || 0) > 0);

  if (validEntries.length === 0) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50"
        role="status"
        aria-label="All clear - no active limbo statuses"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Package size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            All Clear
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No active limbo statuses recorded in this period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0 font-mono">
      {/* Grid of Status Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
        role="list"
        aria-label="Status breakdown by order status"
      >
        {validEntries.map((status) => {
          const count = statusBreakdown[status] || 0;
          const config = statusConfig[status] || {
            color: "text-zinc-500 dark:text-zinc-400",
            bg: "bg-zinc-50 dark:bg-zinc-900/50",
            border: "border-zinc-200 dark:border-zinc-800",
          };
          const percentage = totalPending > 0 ? ((count / totalPending) * 100).toFixed(1) : "0";

          return (
            <div
              key={status}
              className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border ${config.bg} ${config.border} shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-center min-w-0`}
              role="listitem"
              aria-label={`${status}: ${count} orders`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {config.icon || <AlertCircle size={12} className={config.color} />}
                <span className={`text-[9px] font-bold uppercase tracking-tight truncate ${config.color}`}>
                  {status}
                </span>
              </div>
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
                {count.toLocaleString('en-PK')}
              </span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                {percentage}% of limbo
              </span>
            </div>
          );
        })}
      </div>

      {/* Optional: Small Footer with total */}
      {totalPending > 0 && (
        <div className="text-center pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
            TOTAL LIMBO STUCK ORDERS: <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalPending.toLocaleString('en-PK')}</span>
          </p>
        </div>
      )}
    </div>
  );
}