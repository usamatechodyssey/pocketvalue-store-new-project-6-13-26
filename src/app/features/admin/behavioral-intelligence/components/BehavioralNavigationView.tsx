// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralNavigationView.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBehavioralNavigation } from "../actions/getBehavioralNavigation";
import {
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  Clock,
  Copy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { format, parseISO } from "date-fns";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ✅ WORKSPACE STANDARD TOASTS
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// ================================================================
// 🎨 SOLID CYBER-HUD TOOLTIP (PKR Localized)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
          Audit Point: {label}
        </p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between gap-8 text-xs font-medium py-0.5">
              <span style={{ color: entry.stroke || entry.color }}>{entry.name}</span>
              <span className="font-bold text-white">{(entry.value || 0).toLocaleString('en-PK')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function BehavioralNavigationView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralNavigation(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  // ✅ Copy helper (Using custom success/error toasts)
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toastSuccess(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toastError(`Failed to copy ${label}.`);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data || data.summary.totalPageViews === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <Eye size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Page View Data
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No page views recorded in the selected date range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const topPages = data.topPages;
  const trend = data.trend;
  const pagesList = data.pagesList;
  const totalPages = data.totalPages;

  // Calculate overall average time on page
  const overallAvgTime = pagesList.reduce((acc: number, p: any) => acc + p.avgTimeOnPage, 0) / (pagesList.length || 1);

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (5 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Page Views */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Page Views</p>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0 shadow-2xs">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalPageViews.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Audit Views Total</p>
          </div>
        </div>

        {/* Sessions */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Sessions</p>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0 shadow-2xs">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.uniqueSessions.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Unique Sessions</p>
          </div>
        </div>

        {/* Avg Views / Session */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Avg Views/Sess</p>
            <div className="p-2 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 shrink-0 shadow-2xs">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.avgPageViewsPerSession}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Session Density</p>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Bounce Rate</p>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0 shadow-2xs">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.bounceRate}%</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Single-Page Bounces</p>
          </div>
        </div>

        {/* Avg Time on Page */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Avg Time/Page</p>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0 shadow-2xs">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{Math.round(overallAvgTime)}s</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Duration Benchmark</p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TOP PAGES (Horizontal Bar) */}
      {/* ================================================================ */}
      {topPages.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <BarChart3 size={16} className="text-brand-primary" /> TOP PAGES BY VIEWS
          </h3>
          <div className="space-y-4">
            {topPages.map((page: any, idx: number) => {
              const maxViews = topPages[0]?.views || 1;
              const percentage = (page.views / maxViews) * 100;
              return (
                <div key={page.path} className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate" title={page.path}>
                    {page.path || "/"}
                  </span>
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-50 w-10 text-right">{page.views.toLocaleString('en-PK')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 3. DAILY TREND (Line) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY PAGE VIEWS & SESSIONS TRENDS
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="pageViews" stroke="#8b5cf6" name="Page Views" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="uniqueSessions" stroke="#3b82f6" name="Unique Sessions" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 4. PAGES TABLE (With Scroll Guard) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Page</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Views</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Sessions</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Bounce Rate</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Avg Time</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Entry (%)</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Exit (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {pagesList.map((page: any) => {
                const entryPercent = summary.uniqueSessions > 0 ? ((page.entryCount / summary.uniqueSessions) * 100).toFixed(1) : 0;
                const exitPercent = summary.uniqueSessions > 0 ? ((page.exitCount / summary.uniqueSessions) * 100).toFixed(1) : 0;

                return (
                  <tr key={page.path} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold dark:text-white truncate max-w-40" title={page.path}>
                          {page.path || "/"}
                        </span>
                        <button
                          onClick={() => copyToClipboard(page.path, "Path")}
                          className="p-1 text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer shrink-0"
                          title="Copy path"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold dark:text-white whitespace-nowrap">
                      {page.views.toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {page.uniqueSessions.toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                          page.bounceRate > 60
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : page.bounceRate > 30
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}
                      >
                        {page.bounceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {Math.round(page.avgTimeOnPage)}s
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {page.entryCount} <span className="text-[8px] text-zinc-400 dark:text-zinc-500">({entryPercent}%)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {page.exitCount} <span className="text-[8px] text-zinc-400 dark:text-zinc-500">({exitPercent}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50">
            <PaginationControls totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}