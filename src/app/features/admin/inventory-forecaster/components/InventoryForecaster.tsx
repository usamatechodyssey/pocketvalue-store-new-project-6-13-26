// // src/app/features/admin/inventory-forecaster/components/InventoryForecaster.tsx

// "use client";

// import { CalendarClock, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';
// import Link from 'next/link';
// import { ForecastItem, ForecasterResponse } from '../actions/getInventoryForecaster';

// // ================================================================
// // ✅ ENTERPRISE FIX: Component Props (Now accepts full response)
// // ================================================================
// interface InventoryForecasterProps {
//   /** Full paginated response from action */
//   response: ForecasterResponse | null;
//   /** Dashboard widget mode: sirf top items dikhao, "View All" button do */
//   isWidget?: boolean;
//   /** Dedicated page URL for full list */
//   viewAllLink?: string;
//   /** Widget mode mein kitne items dikhane hain (default: 5) */
//   widgetLimit?: number;
// }

// // ================================================================
// // ✅ ENTERPRISE FIX: Loading Skeleton Component
// // ================================================================
// const SkeletonItem = () => (
//   <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
//     <div className="flex justify-between items-start gap-4">
//       <div className="grow space-y-2">
//         <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
//         <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
//       </div>
//       <div className="text-right space-y-2">
//         <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
//         <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
//       </div>
//     </div>
//     <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
//   </div>
// );

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function InventoryForecaster({
//   response,
//   isWidget = true,
//   viewAllLink = "/admin/inventory-forecast",
//   widgetLimit = 5,
// }: InventoryForecasterProps) {
//   // ✅ ENTERPRISE FIX: Null/Undefined + Loading State Handling
//   if (!response || !response.items) {
//     return (
//       <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
//             <CalendarClock className="text-orange-500" size={22} /> Stock Forecaster
//           </h3>
//           <div className="px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
//             <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Loading...</span>
//           </div>
//         </div>
//         <div className="space-y-4 flex-1">
//           <SkeletonItem />
//           <SkeletonItem />
//           <SkeletonItem />
//           <SkeletonItem />
//         </div>
//       </div>
//     );
//   }

//   // ✅ ENTERPRISE FIX: Widget mode — sirf widgetLimit items
//   const displayItems = isWidget ? response.items.slice(0, widgetLimit) : response.items;
//   const { windowDays, criticalThreshold, totalDocs } = response;
//   const hasMore = isWidget && response.items.length > widgetLimit;

//   // ✅ ENTERPRISE FIX: Dynamic Progress Bar Scaling
//   const getProgressWidth = (stock: number): number => {
//     const maxStock = criticalThreshold * 5;
//     return Math.min(100, (stock / maxStock) * 100);
//   };

//   // ✅ ENTERPRISE FIX: Dynamic Priority Color
//   const getPriorityConfig = (priority: ForecastItem['priority']) => {
//     switch (priority) {
//       case 'CRITICAL':
//         return {
//           bg: 'bg-red-500/5 border-red-500/10 hover:border-red-500/30',
//           text: 'text-red-500',
//           bar: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
//         };
//       case 'HIGH':
//         return {
//           bg: 'bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30',
//           text: 'text-orange-500',
//           bar: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
//         };
//       case 'LOW':
//         return {
//           bg: 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30',
//           text: 'text-blue-500',
//           bar: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
//         };
//       case 'SAFE':
//       default:
//         return {
//           bg: 'bg-green-500/5 border-green-500/10 hover:border-green-500/30',
//           text: 'text-green-500',
//           bar: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
//         };
//     }
//   };

//   return (
//     <div
//       className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl"
//       role="region"
//       aria-label="Inventory Stock Forecaster"
//     >
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
//           <CalendarClock className="text-orange-500" size={22} /> Stock Forecaster
//         </h3>
//         <div className="px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
//           <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
//             {isWidget
//               ? `Top ${Math.min(displayItems.length, widgetLimit)} Risks`
//               : `${totalDocs} Risks Total`}
//           </span>
//         </div>
//       </div>

//       {/* LIST */}
//       {displayItems.length === 0 ? (
//         // ✅ ENTERPRISE FIX: Empty State
//         <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
//           <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
//             <CheckCircle2 size={32} className="text-green-500" />
//           </div>
//           <p className="text-sm font-black dark:text-white uppercase tracking-widest">All Clear</p>
//           <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase">
//             No inventory risks detected based on current sales velocity.
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-4 flex-1" role="list">
//           {displayItems.map((item, index) => {
//             const isStable = item.daysLeft === 'Stable';
//             const config = getPriorityConfig(item.priority);

//             return (
//               <div
//                 key={`${item.name}-${item.variant}-${index}`}
//                 className={`p-4 rounded-2xl border transition-all duration-300 ${config.bg}`}
//                 role="listitem"
//                 aria-label={`${item.name} - ${item.variant}`}
//               >
//                 <div className="flex justify-between items-start gap-4">
//                   <div className="grow">
//                     <p className="text-[11px] font-black dark:text-white line-clamp-1 leading-tight uppercase tracking-tight">
//                       {item.name}
//                     </p>
//                     <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase opacity-60">
//                       Variant: {item.variant}
//                     </p>
//                   </div>

//                   <div className="text-right shrink-0">
//                     <div className={`text-[10px] font-black tracking-widest uppercase flex items-center justify-end gap-1 ${config.text}`}>
//                       {!isStable && <TrendingDown size={10} className="animate-bounce" />}
//                       {isStable ? 'STABLE STOCK' : `${item.daysLeft} DAYS LEFT`}
//                     </div>
//                     <p className="text-[9px] text-gray-400 font-black mt-0.5 uppercase tracking-tighter">
//                       {item.stock} Units
//                     </p>
//                   </div>
//                 </div>

//                 {/* ✅ ENTERPRISE FIX: Dynamic Progress Bar */}
//                 <div className="mt-4 relative h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
//                   <div
//                     className={`h-full transition-all duration-1000 ease-out rounded-full ${config.bar}`}
//                     style={{ width: `${getProgressWidth(item.stock)}%` }}
//                     role="progressbar"
//                     aria-valuenow={Math.min(100, getProgressWidth(item.stock))}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   />
//                 </div>

//                 {/* Bottom Velocity Tag */}
//                 {!isStable && (
//                   <div className="mt-2 flex items-center gap-1.5 opacity-40">
//                     <div className="w-1 h-1 rounded-full bg-gray-400" />
//                     <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
//                       Velocity: {item.velocity} items / day
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ✅ ENTERPRISE FIX: VIEW ALL BUTTON + DYNAMIC FOOTER */}
//       <div className="mt-6 pt-4 border-t dark:border-gray-800 space-y-3">
//         {/* View All Button (Only in Widget Mode) */}
//         {isWidget && hasMore && (
//           <Link
//             href={viewAllLink}
//             className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-brand-primary/20 hover:border-brand-primary/40"
//           >
//             View All {totalDocs} Risky Items <ArrowRight size={14} />
//           </Link>
//         )}

//         {/* Dynamic Footer */}
//         <p className="text-[9px] text-gray-500 font-bold leading-relaxed italic uppercase tracking-tighter text-center">
//           * Predictions based on avg daily sales velocity of last {windowDays} days.
//           {!isWidget && response.totalPages > 1 && ` Page ${response.currentPage} of ${response.totalPages}`}
//         </p>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/inventory-forecaster/components/InventoryForecaster.tsx

"use client";

import React from 'react';
import { CalendarClock, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ForecastItem, ForecasterResponse } from '../actions/getInventoryForecaster';

// ================================================================
// ✅ ENTERPRISE FIX: Component Props
// ================================================================
interface InventoryForecasterProps {
  /** Full paginated response from action */
  response: ForecasterResponse | null;
  /** Dashboard widget mode: show top items with "View All" button */
  isWidget?: boolean;
  /** Dedicated page URL for full list */
  viewAllLink?: string;
  /** Widget mode limit (default: 5) */
  widgetLimit?: number;
}

// ================================================================
// ✅ CYBER-HUD SKELETON ITEM
// ================================================================
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

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function InventoryForecaster({
  response,
  isWidget = true,
  viewAllLink = "/admin/inventory-forecast",
  widgetLimit = 5,
}: InventoryForecasterProps) {
  // ✅ Loading State
  if (!response || !response.items) {
    return (
      <div className="space-y-4 w-full h-full flex flex-col justify-between animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            LOADING RISKS...
          </span>
        </div>
        <div className="space-y-3 flex-1">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      </div>
    );
  }

  const displayItems = isWidget ? response.items.slice(0, widgetLimit) : response.items;
  const { windowDays, criticalThreshold, totalDocs } = response;
  const hasMore = isWidget && response.items.length > widgetLimit;

  // ✅ Progress Width Calculation
  const getProgressWidth = (stock: number): number => {
    const maxStock = criticalThreshold * 5;
    return Math.min(100, (stock / maxStock) * 100);
  };

  // ✅ Cyber-HUD Priority Configuration
  const getPriorityConfig = (priority: ForecastItem['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-500',
          bar: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-500',
          bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        };
      case 'LOW':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20',
          text: 'text-blue-500',
          bar: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-500',
          bar: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        };
    }
  };

  return (
    <div
      className="space-y-4 w-full h-full flex flex-col justify-between min-w-0 animate-in fade-in duration-300"
      role="region"
      aria-label="Inventory Stock Forecaster"
    >
      {/* Top Toolbar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
          {isWidget
            ? `TOP ${Math.min(displayItems.length, widgetLimit)} DEPLETION RISKS`
            : `${totalDocs} TOTAL RISKS`}
        </span>
      </div>

      {/* ITEMS LIST */}
      {displayItems.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center flex-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-3 border border-emerald-500/20">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-xs font-mono font-bold dark:text-zinc-200 uppercase tracking-wider">Stock Levels Stable</p>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            No stockout risks detected based on current sales velocity.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 min-w-0" role="list">
          {displayItems.map((item, index) => {
            const isStable = item.daysLeft === 'Stable';
            const config = getPriorityConfig(item.priority);

            return (
              <div
                key={`${item.name}-${item.variant}-${index}`}
                className={`p-3.5 rounded-2xl border transition-all duration-200 ${config.bg} flex flex-col justify-between`}
                role="listitem"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="grow min-w-0">
                    <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 uppercase tracking-tight">
                      {item.name}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                      VARIANT: {item.variant}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-end gap-1 ${config.text}`}>
                      {!isStable && <TrendingDown size={10} className="animate-bounce" />}
                      {isStable ? 'STABLE STOCK' : `${item.daysLeft} DAYS LEFT`}
                    </div>
                    <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                      {item.stock} Units Remaining
                    </p>
                  </div>
                </div>

                {/* Cyber-HUD Progress Bar */}
                <div className="mt-3 relative h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
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
                  <p className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 mt-1.5 uppercase tracking-wider">
                    Velocity: {item.velocity} items / day
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER & VIEW ALL LINK */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
        {isWidget && hasMore && (
          <Link
            href={viewAllLink}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all border border-brand-primary/20 cursor-pointer no-underline hover:no-underline"
          >
            View All {totalDocs} Risky Items <ArrowRight size={12} />
          </Link>
        )}

        <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 text-center tracking-tight">
          * Predictions based on avg daily sales velocity of last {windowDays} days.
        </p>
      </div>
    </div>
  );
}