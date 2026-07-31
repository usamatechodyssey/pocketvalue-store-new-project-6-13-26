// 📂 src/app/features/admin/loyalty-intelligence/components/LoyaltyGoalProgress.tsx

"use client";

import React from "react";
import { Target, CheckCircle, Clock } from "lucide-react";
import { LoyaltyGoalData } from "../actions/getLoyaltyGoals";

// ================================================================
// ✅ TYPES
// ================================================================
interface LoyaltyGoalProgressProps {
  data: LoyaltyGoalData | null;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function LoyaltyGoalProgress({ data }: LoyaltyGoalProgressProps) {
  // ✅ Loading Skeleton
  if (!data) {
    return (
      <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs animate-pulse font-mono w-full">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-3" />
        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-3" />
      </div>
    );
  }

  const { target, current, month, percentage, isOverachieved, remaining } = data;

  // ✅ Empty / No Goal Configured State
  if (target === 0) {
    return (
      <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 text-center font-mono w-full">
        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-1">
            <Target size={28} />
          </div>
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Monthly Referral Goal Configured
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Go to <strong className="text-brand-primary">Payload CMS Settings (Tab 8)</strong> to configure a monthly referral target.
          </p>
        </div>
      </div>
    );
  }

  const isComplete = current >= target;

  return (
    <div className="p-5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 font-mono w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border shrink-0 ${isComplete ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"}`}>
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Monthly Referral Goal
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{month}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm sm:text-base font-black tracking-tight ${isComplete ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-50"}`}>
            {current.toLocaleString('en-PK')} / {target.toLocaleString('en-PK')}
          </span>
          {isComplete && <CheckCircle size={16} className="text-emerald-500" />}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            isComplete
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : percentage > 75
              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : "bg-brand-primary shadow-[0_0_8px_var(--brand-primary)]"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Status & Remaining */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          {isOverachieved ? (
            <>
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                🎉 Monthly Target Achieved!
              </span>
            </>
          ) : (
            <>
              <Clock size={12} className="text-zinc-400" />
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                {remaining.toLocaleString('en-PK')} Conversions Remaining
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-zinc-900 dark:text-zinc-50">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 uppercase">Complete</span>
          {isComplete && current > target && (
            <span className="ml-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded-full border border-emerald-500/20">
              +{(current - target).toLocaleString('en-PK')} Extra
            </span>
          )}
        </div>
      </div>
    </div>
  );
}