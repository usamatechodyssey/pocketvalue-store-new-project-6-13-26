// // src/app/features/admin/operational-intelligence/components/OperationalDashboardWidget.tsx

// "use client";

// import React from 'react';
// import Link from 'next/link';
// import { Activity, Clock, ShieldAlert, ArrowUpRight, AlertCircle } from 'lucide-react';
// import { OperationalIntelligenceResponse } from '../actions/getOperationalIntelligence';

// // ================================================================
// // ✅ ENTERPRISE FIX: Type Definitions
// // ================================================================
// interface OperationalDashboardWidgetProps {
//   data: OperationalIntelligenceResponse | null;
// }

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function OperationalDashboardWidget({
//   data,
// }: OperationalDashboardWidgetProps) {
//   // ✅ Empty State
//   if (!data) {
//     return (
//       <div
//         className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-xl"
//         role="status"
//         aria-label="Operational health monitor - no data available"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
//             <Activity className="text-brand-primary" size={20} aria-hidden="true" />
//             Health Monitor
//           </h3>
//         </div>
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
//               <Activity size={24} className="text-gray-400" aria-hidden="true" />
//             </div>
//             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
//               No Data Available
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const { limboRevenue, pendingCount, fulfillmentRate, leakageRate } = data;

//   // ✅ ENTERPRISE FIX: Dynamic threshold check (can be moved to settings later)
//   const LIMBO_THRESHOLD = 1000000; // Rs. 10 Lakh (configurable in future)
//   const isLimboCritical = limboRevenue > LIMBO_THRESHOLD;

//   // ✅ Color helpers
//   const getFulfillmentColor = (rate: number) => {
//     if (rate >= 90) return 'text-green-500 bg-green-500';
//     if (rate >= 70) return 'text-yellow-500 bg-yellow-500';
//     return 'text-red-500 bg-red-500';
//   };

//   const getLeakageColor = (rate: number) => {
//     if (rate < 5) return 'text-green-500 bg-green-500';
//     if (rate < 15) return 'text-yellow-500 bg-yellow-500';
//     return 'text-red-500 bg-red-500';
//   };

//   const getLimboBarColor = (revenue: number) => {
//     if (revenue > LIMBO_THRESHOLD) return 'bg-red-500 animate-pulse';
//     if (revenue > LIMBO_THRESHOLD / 2) return 'bg-yellow-500';
//     return 'bg-blue-500';
//   };

//   return (
//     <div
//       className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-xl"
//       role="region"
//       aria-label="Operational Health Monitor"
//     >
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
//           <Activity className="text-brand-primary" size={20} aria-hidden="true" />
//           Health Monitor
//         </h3>
//         <Link
//           href="/admin/operational-intelligence"
//           className="text-[9px] font-black text-brand-primary hover:underline flex items-center gap-1 uppercase tracking-widest transition-all"
//           aria-label="View full operational intelligence report"
//         >
//           Full Report <ArrowUpRight size={12} aria-hidden="true" />
//         </Link>
//       </div>

//       {/* METRICS */}
//       <div className="space-y-5 flex-1">
//         {/* Metric 1: Revenue in Limbo */}
//         <div className="space-y-1.5">
//           <div className="flex justify-between items-end">
//             <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
//               <Clock size={12} aria-hidden="true" /> Revenue in Limbo
//             </p>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-black dark:text-white">
//                 Rs. {limboRevenue.toLocaleString()}
//               </span>
//               {pendingCount > 0 && (
//                 <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
//                   {pendingCount} stuck
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//             <div
//               className={`h-full transition-all duration-1000 ${getLimboBarColor(limboRevenue)}`}
//               style={{
//                 width: `${Math.min(100, (limboRevenue / (LIMBO_THRESHOLD * 2)) * 100)}%`,
//               }}
//               role="progressbar"
//               aria-valuenow={Math.min(100, (limboRevenue / (LIMBO_THRESHOLD * 2)) * 100)}
//               aria-valuemin={0}
//               aria-valuemax={100}
//               aria-label={`Limbo revenue: Rs. ${limboRevenue.toLocaleString()}`}
//             />
//           </div>
//         </div>

//         {/* Metric 2: Fulfillment Rate */}
//         <div className="space-y-1.5">
//           <div className="flex justify-between items-end">
//             <p className="text-[10px] font-black text-gray-500 uppercase">Fulfillment Rate</p>
//             <p className={`text-sm font-black ${getFulfillmentColor(fulfillmentRate)}`}>
//               {fulfillmentRate}%
//             </p>
//           </div>
//           <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//             <div
//               className={`h-full transition-all duration-1000 ${getFulfillmentColor(fulfillmentRate).replace('text-', 'bg-')}`}
//               style={{ width: `${Math.min(100, fulfillmentRate)}%` }}
//               role="progressbar"
//               aria-valuenow={fulfillmentRate}
//               aria-valuemin={0}
//               aria-valuemax={100}
//               aria-label={`Fulfillment rate: ${fulfillmentRate}%`}
//             />
//           </div>
//         </div>

//         {/* Metric 3: Profit Leakage */}
//         <div className="space-y-1.5">
//           <div className="flex justify-between items-end">
//             <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
//               <ShieldAlert size={12} aria-hidden="true" /> Profit Leakage
//             </p>
//             <p className={`text-sm font-black ${getLeakageColor(leakageRate)}`}>
//               {leakageRate}%
//             </p>
//           </div>
//           <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//             <div
//               className={`h-full transition-all duration-1000 ${getLeakageColor(leakageRate).replace('text-', 'bg-')}`}
//               style={{ width: `${Math.min(100, leakageRate * 2)}%` }}
//               role="progressbar"
//               aria-valuenow={leakageRate}
//               aria-valuemin={0}
//               aria-valuemax={100}
//               aria-label={`Profit leakage rate: ${leakageRate}%`}
//             />
//           </div>
//         </div>

//         {/* Alert Banner (if threshold crossed) */}
//         {isLimboCritical && (
//           <div
//             className="mt-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-pulse"
//             role="alert"
//             aria-live="polite"
//           >
//             <AlertCircle size={14} className="text-red-500 shrink-0" aria-hidden="true" />
//             <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">
//               ⚠️ Limbo Revenue Exceeded Rs. {LIMBO_THRESHOLD.toLocaleString()}!
//             </p>
//           </div>
//         )}
//       </div>

//       {/* FOOTER */}
//       <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
//         <p className="text-[8px] text-gray-400 font-medium text-center">
//           Operational Metrics · Near Real-Time
//         </p>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/operational-intelligence/components/OperationalDashboardWidget.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import { Activity, Clock, ShieldAlert, ArrowUpRight, AlertCircle, Radio } from 'lucide-react';
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
  // ✅ Empty State
  if (!data) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center h-full min-h-55"
        role="status"
        aria-label="Operational health monitor - no data available"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Activity size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            Operational Telemetry Disrupted
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No operational status telemetry recorded for the selected audit range.
          </p>
        </div>
      </div>
    );
  }

  const { limboRevenue, pendingCount, fulfillmentRate, leakageRate } = data;

  const LIMBO_THRESHOLD = 1000000; // Rs. 10 Lakh Threshold
  const isLimboCritical = limboRevenue > LIMBO_THRESHOLD;

  // ✅ Color Helpers
  const getFulfillmentColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-500 bg-emerald-500';
    if (rate >= 70) return 'text-amber-500 bg-amber-500';
    return 'text-red-500 bg-red-500';
  };

  const getLeakageColor = (rate: number) => {
    if (rate < 5) return 'text-emerald-500 bg-emerald-500';
    if (rate < 15) return 'text-amber-500 bg-amber-500';
    return 'text-red-500 bg-red-500';
  };

  const getLimboBarColor = (revenue: number) => {
    if (revenue > LIMBO_THRESHOLD) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse';
    if (revenue > LIMBO_THRESHOLD / 2) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
  };

  return (
    <div
      className="space-y-4 w-full h-full flex flex-col justify-between min-w-0 animate-in fade-in duration-300"
      role="region"
      aria-label="Operational Health Monitor"
    >
      {/* Top Action Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          OPERATIONAL HEALTH MONITOR
        </span>
        <Link
          href="/admin/operational-intelligence"
          className="text-[10px] font-mono font-bold text-brand-primary hover:underline flex items-center gap-1 uppercase tracking-wider transition-all no-underline"
          aria-label="View full operational intelligence report"
        >
          Full Report <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* METRICS CARDS */}
      <div className="space-y-3 flex-1 min-w-0">
        
        {/* Metric 1: Revenue in Limbo */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-amber-500" /> Revenue in Limbo
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                Rs. {(limboRevenue || 0).toLocaleString('en-PK')}
              </span>
              {pendingCount > 0 && (
                <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
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
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Fulfillment Rate
            </p>
            <p className={`text-xs font-mono font-bold ${getFulfillmentColor(fulfillmentRate).split(' ')[0]}`}>
              {fulfillmentRate}%
            </p>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${getFulfillmentColor(fulfillmentRate).split(' ')[1]}`}
              style={{ width: `${Math.min(100, fulfillmentRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Profit Leakage */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-2 shadow-2xs">
          <div className="flex justify-between items-center gap-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-red-500" /> Profit Leakage
            </p>
            <p className={`text-xs font-mono font-bold ${getLeakageColor(leakageRate).split(' ')[0]}`}>
              {leakageRate}%
            </p>
          </div>
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${getLeakageColor(leakageRate).split(' ')[1]}`}
              style={{ width: `${Math.min(100, leakageRate * 2)}%` }}
            />
          </div>
        </div>

        {/* Critical Limbo Alert */}
        {isLimboCritical && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-500 animate-pulse">
            <AlertCircle size={14} className="shrink-0" />
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider">
              ⚠️ Limbo Revenue Exceeded Rs. {LIMBO_THRESHOLD.toLocaleString('en-PK')}!
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
        <span className="flex items-center gap-1">
          <Radio size={10} className="text-emerald-500" /> Operational Metrics
        </span>
        <span>Near Real-Time</span>
      </div>
    </div>
  );
}