// 📂 src/app/features/admin/inventory-forecaster/components/InventoryForecaster.tsx

"use client";


import { CalendarClock, CheckCircle2, TrendingDown, ArrowUpRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ForecastItem, ForecasterResponse } from '../actions/getInventoryForecaster';

interface InventoryForecasterProps {
  response: ForecasterResponse | null;
  isWidget?: boolean;
  viewAllLink?: string;
  widgetLimit?: number;
}

const SkeletonItem = () => (
  <div className="p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-900/30 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="grow space-y-2">
        <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>
    </div>
    <div className="mt-3 h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
  </div>
);

export default function InventoryForecaster({
  response,
  isWidget = true,
  viewAllLink = "/admin/inventory-forecast",
  widgetLimit = 5,
}: InventoryForecasterProps) {
  if (!response || !response.items) {
    return (
      <div
        className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden animate-pulse"
        role="status"
        aria-label="Loading inventory risks"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <CalendarClock size={20} className="text-amber-500" /> Depletion Risks
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time Stockout Forecaster
          </p>
        </div>
        <div className="space-y-3 flex-1">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      </div>
    );
  }

  const displayItems = isWidget ? response.items.slice(0, widgetLimit) : response.items;
  const { windowDays, criticalThreshold, totalDocs } = response;

  const getProgressWidth = (stock: number): number => {
    const maxStock = criticalThreshold * 5;
    return Math.min(100, (stock / maxStock) * 100);
  };

  // ✅ FIXED TS(2339): Added 'text' property to all priority return cases
  const getPriorityConfig = (priority: ForecastItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20',
          text: 'text-rose-500',
          bar: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-500',
          bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        };
      case 'LOW':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20',
          text: 'text-blue-500',
          bar: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-500', // ✅ Fixed missing property
          bar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        };
    }
  };

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Inventory Stock Forecaster"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <CalendarClock size={20} className="text-amber-500" /> Depletion Risks
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time Stockout Forecaster
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
          <AlertTriangle size={10} />
          {isWidget ? `TOP ${Math.min(displayItems.length, widgetLimit)} RISKS` : `${totalDocs} RISKS`}
        </span>
      </div>

      {/* LIST */}
      {displayItems.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center flex-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-3 border border-emerald-500/20">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Stock Levels Stable
          </p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-sans">
            No stockout risks detected based on current sales velocity.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 my-2 flex-1 min-w-0" role="list">
          {displayItems.map((item, index) => {
            const isStable = item.daysLeft === 'Stable';
            const config = getPriorityConfig(item.priority);

            return (
              <div
                key={`${item.name}-${item.variant}-${index}`}
                className={`p-3.5 rounded-2xl border transition-all ${config.bg} flex flex-col justify-between shadow-2xs`}
                role="listitem"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="grow min-w-0">
                    <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase truncate">
                      VARIANT: {item.variant}
                    </p>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ${config.text}`}>
                      {!isStable && <TrendingDown size={10} className="animate-bounce" />}
                      {isStable ? 'STABLE STOCK' : `${item.daysLeft} DAYS LEFT`}
                    </div>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                      {item.stock} Units Remaining
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 relative h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${config.bar}`}
                    style={{ width: `${getProgressWidth(item.stock)}%` }}
                    role="progressbar"
                    aria-valuenow={Math.min(100, getProgressWidth(item.stock))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                {/* Velocity Tag */}
                {!isStable && (
                  <p className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
                    Velocity: {item.velocity} items / day
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        {isWidget && (
          <Link
            href={viewAllLink}
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            View All {totalDocs} Risky Items <ArrowUpRight size={14} />
          </Link>
        )}

        <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 text-center tracking-tight">
          * Predictions based on avg daily sales velocity of last {windowDays} days.
        </p>
      </div>
    </div>
  );
}