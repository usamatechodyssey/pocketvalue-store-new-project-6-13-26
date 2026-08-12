// 📂 src/app/features/admin/operational-intelligence/components/OperationalDashboardWidget.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import { Activity, Clock, ShieldAlert, ArrowUpRight, AlertCircle } from 'lucide-react';
import { OperationalIntelligenceResponse } from '../actions/getOperationalIntelligence';

// ================================================================
// ✅ TYPE DEFINITIONS
// ================================================================
interface OperationalDashboardWidgetProps {
  data: OperationalIntelligenceResponse | null;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function OperationalDashboardWidget({
  data,
}: OperationalDashboardWidgetProps) {
  // Empty State
  if (!data) {
    return (
      <div
        className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden"
        role="status"
        aria-label="Operational health monitor - no data available"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Activity size={20} className="text-brand-primary" /> Operational Audit
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Fulfillment Health & Limbo Metrics
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">
              Telemetry Disrupted
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans">
              No operational status telemetry recorded for the selected audit range.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/operational-intelligence"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            Full Report <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const { limboRevenue, pendingCount, fulfillmentRate, leakageRate } = data;

  const LIMBO_THRESHOLD = 1000000; // Rs. 10 Lakh Threshold
  const isLimboCritical = limboRevenue > LIMBO_THRESHOLD;

  const getFulfillmentColor = (rate: number) => {
    if (rate >= 90) return { text: 'text-emerald-500', bar: 'bg-emerald-500' };
    if (rate >= 70) return { text: 'text-amber-500', bar: 'bg-amber-500' };
    return { text: 'text-rose-500', bar: 'bg-rose-500' };
  };

  const getLeakageColor = (rate: number) => {
    if (rate < 5) return { text: 'text-emerald-500', bar: 'bg-emerald-500' };
    if (rate < 15) return { text: 'text-amber-500', bar: 'bg-amber-500' };
    return { text: 'text-rose-500', bar: 'bg-rose-500' };
  };

  const getLimboBarColor = (revenue: number) => {
    if (revenue > LIMBO_THRESHOLD) return 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse';
    if (revenue > LIMBO_THRESHOLD / 2) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
  };

  const fulfillmentStyle = getFulfillmentColor(fulfillmentRate);
  const leakageStyle = getLeakageColor(leakageRate);

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Operational Health Monitor"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Activity size={20} className="text-brand-primary" /> Operational Audit
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Fulfillment Health & Limbo Metrics
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          LIVE TELEMETRY
        </span>
      </div>

      {/* METRICS CARDS */}
      <div className="space-y-3 flex-1 min-w-0">
        
        {/* Metric 1: Revenue in Limbo */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-amber-500" /> Revenue in Limbo
            </p>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                Rs. {(limboRevenue || 0).toLocaleString('en-PK')}
              </span>
              {pendingCount > 0 && (
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                  {pendingCount} Stuck
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${getLimboBarColor(limboRevenue)}`}
              style={{
                width: `${Math.min(100, (limboRevenue / (LIMBO_THRESHOLD * 2)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Fulfillment Rate */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Fulfillment Rate
            </p>
            <p className={`text-xs font-mono font-black ${fulfillmentStyle.text}`}>
              {fulfillmentRate}%
            </p>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${fulfillmentStyle.bar}`}
              style={{ width: `${Math.min(100, fulfillmentRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Profit Leakage */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-rose-500" /> Profit Leakage
            </p>
            <p className={`text-xs font-mono font-black ${leakageStyle.text}`}>
              {leakageRate}%
            </p>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${leakageStyle.bar}`}
              style={{ width: `${Math.min(100, leakageRate * 2)}%` }}
            />
          </div>
        </div>

        {/* Critical Limbo Alert */}
        {isLimboCritical && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-rose-500 animate-pulse">
            <AlertCircle size={14} className="shrink-0" />
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider">
              ⚠️ Limbo Revenue Exceeded Rs. {LIMBO_THRESHOLD.toLocaleString('en-PK')}!
            </p>
          </div>
        )}
      </div>

      {/* FOOTER LINK (Matching Zone 2 Cards) */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/admin/operational-intelligence"
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Full Report <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}