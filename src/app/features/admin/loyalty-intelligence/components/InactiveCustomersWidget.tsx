// 📂 src/app/features/admin/loyalty-intelligence/components/InactiveCustomersWidget.tsx

"use client";


import Link from "next/link";
import { UserX, Crown, Users, User, ArrowRight } from "lucide-react";

// ================================================================
// ✅ TYPES
// ================================================================
interface InactiveSummary {
  totalInactive: number;
  highValue: number;
  mediumValue: number;
  lowValue: number;
}

interface InactiveCustomersWidgetProps {
  summary: InactiveSummary | null;
  href?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function InactiveCustomersWidget({
  summary,
  href = "/admin/loyalty-intelligence",
}: InactiveCustomersWidgetProps) {
  // Empty State
  if (!summary || summary.totalInactive === 0) {
    return (
      <Link
        href={href}
        className="block p-5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 font-mono no-underline hover:no-underline group w-full min-w-0"
      >
        <div className="flex items-center justify-between mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0">
              <UserX size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Inactive Customers
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">0 Customers Need Re-engagement</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-zinc-400 group-hover:text-brand-primary transition-colors shrink-0" />
        </div>
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight">
          🎉 All customers are actively shopping!
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="block p-5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 font-mono no-underline hover:no-underline group w-full min-w-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0">
            <UserX size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Inactive Customers
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {summary.totalInactive.toLocaleString('en-PK')} Customers Need Re-engagement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-brand-primary shrink-0">
          <span>View All</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total */}
        <div className="text-center p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Total</p>
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
            {summary.totalInactive.toLocaleString('en-PK')}
          </p>
        </div>

        {/* High Value */}
        <div className="text-center p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <div className="flex items-center justify-center gap-1">
            <Crown size={12} className="text-amber-500 shrink-0" />
            <p className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">High VIP</p>
          </div>
          <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {summary.highValue.toLocaleString('en-PK')}
          </p>
        </div>

        {/* Medium Value */}
        <div className="text-center p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-center gap-1">
            <Users size={12} className="text-blue-500 shrink-0" />
            <p className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Medium</p>
          </div>
          <p className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {summary.mediumValue.toLocaleString('en-PK')}
          </p>
        </div>

        {/* Low Value */}
        <div className="text-center p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-center gap-1">
            <User size={12} className="text-zinc-500 shrink-0" />
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Standard</p>
          </div>
          <p className="text-base sm:text-lg font-black text-zinc-700 dark:text-zinc-300 mt-0.5">
            {summary.lowValue.toLocaleString('en-PK')}
          </p>
        </div>
      </div>
    </Link>
  );
}