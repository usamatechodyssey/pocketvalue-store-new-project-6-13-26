// 📂 src/app/features/admin/loyalty-intelligence/components/ReferralPerformanceWidget.tsx

"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingCart,
  Banknote,
  Copy,
  Check,
  Award,
  Ticket,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { ReferralPerformanceStats } from "../actions/getReferralPerformance";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface ReferralPerformanceWidgetProps {
  stats: ReferralPerformanceStats | null;
}

// Enterprise Helper: Safe number formatting
const formatNumber = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-PK');
};

// Enterprise Helper: Format currency for PKR
const formatCurrency = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return `Rs. ${num.toLocaleString('en-PK')}`;
};

export default function ReferralPerformanceWidget({ stats }: ReferralPerformanceWidgetProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Empty State
  if (!stats || stats.totalReferrals === 0) {
    return (
      <div
        className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden"
        role="status"
        aria-label="No referral data available"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Heart size={20} className="text-brand-primary" /> Loyalty Intelligence
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Referral Conversions & Member Performance
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">
              No Referral Activity Yet
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans max-w-sm mx-auto">
              Once customers start sharing referral links and generating signups, real-time leaderboard metrics will appear here.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/loyalty-intelligence"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            Open Loyalty Hub <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Referral Performance & Leaderboard"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Heart size={20} className="text-brand-primary" /> Loyalty Intelligence
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Referral Conversions & Member Performance
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          REFERRAL REAL-TIME
        </span>
      </div>

      {/* 📊 1. HIGH-LEVEL KPI ROW */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        
        {/* KPI 1: Total Referrals */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
            <Users size={16} />
          </div>
          <div className="min-w-0 font-mono">
            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block leading-none">Signups</span>
            <span className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight block mt-1">{formatNumber(stats.totalReferrals)}</span>
          </div>
        </div>

        {/* KPI 2: Conversions */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <ShoppingCart size={16} />
          </div>
          <div className="min-w-0 font-mono">
            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block leading-none">Buyers</span>
            <span className="text-base font-black text-emerald-500 tracking-tight block mt-1">{formatNumber(stats.conversions)} <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">({stats.conversionRate}%)</span></span>
          </div>
        </div>

        {/* KPI 3: Loyalty Revenue */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0">
            <Banknote size={16} />
          </div>
          <div className="min-w-0 font-mono">
            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block leading-none">Revenue</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400 tracking-tight block mt-1 truncate">{formatCurrency(stats.totalRevenue)}</span>
          </div>
        </div>

        {/* KPI 4: Reward Clearances */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
            <Ticket size={16} />
          </div>
          <div className="min-w-0 font-mono">
            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider block leading-none">Rewards</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mt-1 truncate">
              Unpaid: <strong className="text-amber-500">{formatNumber(stats.unsettledConversions)}</strong>
            </span>
          </div>
        </div>

      </div>

      {/* 🏆 2. TOP REFERRERS LEADERBOARD TABLE */}
      {/* ✅ CRITICAL FIX: Changed 'justify-between' to 'justify-start' to eliminate giant empty space! */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex-1 flex flex-col justify-start mb-6">
        
        {/* Table Header Toolbar */}
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 bg-white/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-brand-primary" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Top Performing Referrers
            </h4>
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
            TOP {topReferrers.length} NODES
          </span>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto max-h-75 custom-scrollbar">
          <table className="w-full min-w-150 border-collapse text-left text-xs relative font-mono">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-2.5 px-3.5 whitespace-nowrap">Referrer Customer</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Invites</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Buyers</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Conv. %</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Settled</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {topReferrers.length > 0 ? (
                topReferrers.map((row, idx) => {
                  const getRankBadge = (rank: number) => {
                    if (rank === 0) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
                    if (rank === 1) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
                    if (rank === 2) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
                    return "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800";
                  };

                  return (
                    <tr key={row.referrerId} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                      
                      {/* User Profile */}
                      <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${getRankBadge(idx)}`}>
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{row.name}</p>
                            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 truncate">{row.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{formatNumber(row.totalSignups)}</td>
                      <td className="py-2.5 px-3.5 text-center font-black text-emerald-500 whitespace-nowrap">{formatNumber(row.conversions)}</td>
                      
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          row.conversionRate > 30 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : row.conversionRate > 10
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          {row.conversionRate}%
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 text-center font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{formatNumber(row.settledConversions)}</td>
                      
                      {/* Quick Action Button */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleCopyId(row.referrerId)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            copiedId === row.referrerId 
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-brand-primary border border-zinc-200 dark:border-zinc-800"
                          }`}
                          title="Copy User ID"
                          aria-label={`Copy User ID for ${row.name}`}
                        >
                          {copiedId === row.referrerId ? <Check size={12} className="stroke-[2.5]" /> : <Copy size={12} />}
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 font-mono text-xs italic">
                    No active referrer milestones recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/admin/loyalty-intelligence"
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Open Loyalty Hub <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}