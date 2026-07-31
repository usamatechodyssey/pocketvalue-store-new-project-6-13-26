// "use client";

// import React, { useState, useMemo, useCallback } from "react";
// import {
//   Users,
//   ShoppingCart,
//   DollarSign,
//   Copy,
//   Check,
//   Award,
//   Ticket,
// } from "lucide-react";
// import { ReferralPerformanceStats } from "../actions/getReferralPerformance";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// interface ReferralPerformanceWidgetProps {
//   stats: ReferralPerformanceStats;
// }

// // ✅ Enterprise Helper: Safe number formatting
// const formatNumber = (value: number | undefined | null): string => {
//   const num = Number(value) || 0;
//   return num.toLocaleString();
// };

// // ✅ Enterprise Helper: Format currency for PKR
// const formatCurrency = (value: number | undefined | null): string => {
//   const num = Number(value) || 0;
//   return `Rs. ${num.toLocaleString()}`;
// };

// export default function ReferralPerformanceWidget({ stats }: ReferralPerformanceWidgetProps) {
//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   // ✅ Memoize clipboard handler to prevent re-renders
//   const handleCopyId = useCallback((userId: string) => {
//     navigator.clipboard
//       .writeText(userId)
//       .then(() => {
//         setCopiedId(userId);
//         toastSuccess("User ID copied successfully!");
//         setTimeout(() => setCopiedId(null), 2000);
//       })
//       .catch(() => {
//         toastError("Failed to copy User ID.");
//       });
//   }, []);

//   // ✅ Memoize top referrers list for performance
//   const topReferrers = useMemo(() => stats?.topReferrers || [], [stats?.topReferrers]);

//   // ✅ Conditional render: If no data, show empty state
//   if (!stats || stats.totalReferrals === 0) {
//     return (
//       <div className="space-y-6 w-full animate-in fade-in duration-300">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4 opacity-60">
//               <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-12 h-12" />
//               <div className="space-y-2">
//                 <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
//                 <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs p-12 text-center">
//           <div className="flex flex-col items-center gap-3">
//             <Users size={48} className="text-gray-300 dark:text-gray-600" />
//             <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">No Referral Activity Yet</h3>
//             <p className="text-sm text-gray-400 max-w-md">
//               Once customers start sharing their referral links and generating signups, 
//               you'll see real-time performance metrics and leaderboard data here.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 w-full animate-in fade-in duration-300">
      
//       {/* 📊 1. HIGH-LEVEL KPI ROW */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
//         {/* KPI 1: Total Referrals */}
//         <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
//           <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
//             <Users size={20} />
//           </div>
//           <div>
//             <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Signups</span>
//             <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 block mt-0.5">{formatNumber(stats.totalReferrals)}</span>
//             <span className="text-[10px] text-zinc-500 font-medium">Referred users joined</span>
//           </div>
//         </div>

//         {/* KPI 2: Conversions */}
//         <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
//           <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
//             <ShoppingCart size={20} />
//           </div>
//           <div>
//             <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Verified Conversions</span>
//             <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 block mt-0.5">{formatNumber(stats.conversions)}</span>
//             <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
//               Rate: {stats.conversionRate}%
//             </span>
//           </div>
//         </div>

//         {/* KPI 3: Loyalty Revenue */}
//         <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
//           <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
//             <DollarSign size={20} />
//           </div>
//           <div>
//             <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Loyalty Revenue</span>
//             <span className="text-xl font-bold text-purple-600 block mt-0.5">{formatCurrency(stats.totalRevenue)}</span>
//             <span className="text-[10px] text-zinc-500 font-medium">{formatNumber(stats.activeReferrers)} active referrers</span>
//           </div>
//         </div>

//         {/* KPI 4: Unsettled & Settled Vouchers Ledger */}
//         <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
//           <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
//             <Ticket size={20} />
//           </div>
//           <div>
//             <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Reward Clearances</span>
//             <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 block mt-0.5">
//               Unsettled: <strong className="text-amber-600">{formatNumber(stats.unsettledConversions)}</strong>
//             </span>
//             <span className="text-[10px] text-zinc-500 block font-medium mt-0.5">
//               Vouchers Issued: <strong className="text-emerald-600">{formatNumber(stats.settledConversions)}</strong>
//             </span>
//           </div>
//         </div>

//       </div>

//       {/* 🏆 2. TOP REFERRERS LEADERBOARD */}
//       <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
        
//         {/* Table Header Strip */}
//         <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
//             <Award size={16} className="text-brand-primary" />
//             Top Performing Referrers
//           </h3>
//           <span className="text-[10px] font-mono text-zinc-400">Showing top {topReferrers.length} nodes</span>
//         </div>

//         {/* Responsive Table Grid */}
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-left text-xs">
//             <thead>
//               <tr className="bg-zinc-50/30 dark:bg-zinc-900/10 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
//                 <th className="py-2.5 px-4">Referrer Customer</th>
//                 <th className="py-2.5 px-4 text-center">Invites</th>
//                 <th className="py-2.5 px-4 text-center">Conversions</th>
//                 <th className="py-2.5 px-4 text-center">Success Rate</th>
//                 <th className="py-2.5 px-4 text-center">Unsettled</th>
//                 <th className="py-2.5 px-4 text-center">Settled</th>
//                 <th className="py-2.5 px-4 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
//               {topReferrers.length > 0 ? (
//                 topReferrers.map((row, idx) => (
//                   <tr key={row.referrerId} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                    
//                     {/* User profile with copy option */}
//                     <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono font-bold text-zinc-400 w-4">#{idx + 1}</span>
//                         <div>
//                           <p className="font-bold">{row.name}</p>
//                           <p className="text-[10px] text-zinc-400 mt-0.5">{row.email}</p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="py-3 px-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">{formatNumber(row.totalSignups)}</td>
//                     <td className="py-3 px-4 text-center font-bold text-zinc-900 dark:text-zinc-50">{formatNumber(row.conversions)}</td>
                    
//                     <td className="py-3 px-4 text-center">
//                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
//                         row.conversionRate > 30 
//                           ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15" 
//                           : row.conversionRate > 10
//                             ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/15"
//                             : "bg-red-500/10 text-red-600 border-red-500/15"
//                       }`}>
//                         {row.conversionRate}%
//                       </span>
//                     </td>

//                     <td className="py-3 px-4 text-center font-bold text-amber-600">{formatNumber(row.unsettledConversions)}</td>
//                     <td className="py-3 px-4 text-center font-bold text-emerald-600">{formatNumber(row.settledConversions)}</td>
                    
//                     {/* Quick Action Button */}
//                     <td className="py-3 px-4 text-center">
//                       <button
//                         onClick={() => handleCopyId(row.referrerId)}
//                         className={`p-1.5 rounded transition-all hover:scale-105 active:scale-95 ${
//                           copiedId === row.referrerId 
//                             ? "bg-emerald-500/10 text-emerald-600" 
//                             : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-brand-primary"
//                         }`}
//                         title="Copy User ID for Coupon binding"
//                         aria-label={`Copy User ID for ${row.name}`}
//                       >
//                         {copiedId === row.referrerId ? <Check size={11} className="stroke-[2.5]" /> : <Copy size={11} />}
//                       </button>
//                     </td>

//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
//                     No active referrer milestones recorded yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//       </div>

//     </div>
//   );
// }
// 📂 src/app/features/admin/loyalty-intelligence/components/ReferralPerformanceWidget.tsx

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Users,
  ShoppingCart,
  Banknote,
  Copy,
  Check,
  Award,
  Ticket,
} from "lucide-react";
import { ReferralPerformanceStats } from "../actions/getReferralPerformance";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface ReferralPerformanceWidgetProps {
  stats: ReferralPerformanceStats | null;
}

// ✅ Enterprise Helper: Safe number formatting
const formatNumber = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-PK');
};

// ✅ Enterprise Helper: Format currency for PKR
const formatCurrency = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return `Rs. ${num.toLocaleString('en-PK')}`;
};

export default function ReferralPerformanceWidget({ stats }: ReferralPerformanceWidgetProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Memoize clipboard handler
  const handleCopyId = useCallback((userId: string) => {
    navigator.clipboard
      .writeText(userId)
      .then(() => {
        setCopiedId(userId);
        toastSuccess("User ID copied successfully!");
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toastError("Failed to copy User ID.");
      });
  }, []);

  const topReferrers = useMemo(() => stats?.topReferrers || [], [stats?.topReferrers]);

  // ✅ DESTROYED GHOST SKELETONS: Clean Cyber-HUD Empty State
  if (!stats || stats.totalReferrals === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center h-full min-h-62.5 w-full animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Users size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Referral Activity Yet
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Once customers start sharing their referral links and generating signups, real-time performance metrics and leaderboard data will stream here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full h-full flex flex-col justify-between min-w-0 animate-in fade-in duration-300">
      
      {/* 📊 1. HIGH-LEVEL KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Total Referrals */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block">Total Signups</span>
            <span className="text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight block mt-0.5">{formatNumber(stats.totalReferrals)}</span>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block truncate">Referred Users Joined</span>
          </div>
        </div>

        {/* KPI 2: Conversions */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <ShoppingCart size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block">Conversions</span>
            <span className="text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight block mt-0.5">{formatNumber(stats.conversions)}</span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold block truncate">
              Rate: {stats.conversionRate}%
            </span>
          </div>
        </div>

        {/* KPI 3: Loyalty Revenue */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0">
            <Banknote size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block">Loyalty Revenue</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight block mt-0.5">{formatCurrency(stats.totalRevenue)}</span>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block truncate">{formatNumber(stats.activeReferrers)} Active Referrers</span>
          </div>
        </div>

        {/* KPI 4: Reward Clearances */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
            <Ticket size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block">Clearances</span>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5 truncate">
              Pending: <strong className="text-amber-500">{formatNumber(stats.unsettledConversions)}</strong>
            </span>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block truncate">
              Issued: <strong className="text-emerald-500">{formatNumber(stats.settledConversions)}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* 🏆 2. TOP REFERRERS LEADERBOARD TABLE */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex-1 flex flex-col justify-between">
        
        {/* Table Header Toolbar */}
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 bg-white/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-brand-primary" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Top Performing Referrers
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
            SHOWING TOP {topReferrers.length} NODES
          </span>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto max-h-87.5 custom-scrollbar">
          <table className="w-full min-w-162.5 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Referrer Customer</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Invites</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Conversions</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Success Rate</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Unsettled</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Settled</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {topReferrers.length > 0 ? (
                topReferrers.map((row, idx) => (
                  <tr key={row.referrerId} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    
                    {/* User Profile */}
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-400 text-[10px]">#{idx + 1}</span>
                        <div>
                          <p className="font-bold">{row.name}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{row.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{formatNumber(row.totalSignups)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{formatNumber(row.conversions)}</td>
                    
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                        row.conversionRate > 30 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                          : row.conversionRate > 10
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {row.conversionRate}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-500 whitespace-nowrap">{formatNumber(row.unsettledConversions)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-500 whitespace-nowrap">{formatNumber(row.settledConversions)}</td>
                    
                    {/* Quick Action Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleCopyId(row.referrerId)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          copiedId === row.referrerId 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-brand-primary border border-zinc-200 dark:border-zinc-700"
                        }`}
                        title="Copy User ID for coupon binding"
                        aria-label={`Copy User ID for ${row.name}`}
                      >
                        {copiedId === row.referrerId ? <Check size={12} className="stroke-[2.5]" /> : <Copy size={12} />}
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 font-mono text-xs italic">
                    No active referrer milestones recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}