// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralFrictionView.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBehavioralFriction } from "../actions/getBehavioralFriction";
import {
  AlertTriangle,
  AlertCircle,
  PackageX,
  Bug,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Copy,
} from "lucide-react";
import {
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
// 🎨 EVENT TYPE COLORS
// ================================================================
const EVENT_COLORS: Record<string, string> = {
  rage_click_detected: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/20",
  exit_intent_triggered: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  oos_attempt: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  js_exception: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
  checkout_error: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 border-pink-200 dark:border-pink-500/20",
};

const getEventColor = (eventType: string) => {
  return EVENT_COLORS[eventType] || "bg-zinc-50 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300";
};

const formatEventType = (type: string) => {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

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

// ================================================================
// 🎨 CUSTOM TOOLTIP (Enterprise Grade)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between gap-8 text-xs font-medium py-0.5">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-bold text-white">{entry.value.toLocaleString('en-PK')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ================================================================
// 🧩 METADATA PREVIEW (With Expand)
// ================================================================
const MetadataPreview = ({ metadata }: { metadata: Record<string, unknown> | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata) return <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic font-mono">—</span>;

  const entries = Object.entries(metadata).filter(([key]) => !["visitorId", "timestamp"].includes(key));
  const totalEntries = entries.length;
  const shownEntries = isExpanded ? entries : entries.slice(0, 3);

  if (totalEntries === 0) return <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic font-mono">—</span>;

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono">
      {shownEntries.map(([key, value]) => {
        let displayValue = String(value);
        if (typeof value === "object") {
          displayValue = JSON.stringify(value).slice(0, 30);
        }
        return (
          <span
            key={key}
            className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-850 rounded text-[8px] font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-28 border border-zinc-200/50 dark:border-zinc-800/50"
            title={`${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`}
          >
            {key}: {displayValue}
          </span>
        );
      })}
      {totalEntries > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[8px] font-mono font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          {isExpanded ? "Show less" : `+${totalEntries - 3} more`}
        </button>
      )}
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function BehavioralFrictionView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralFriction(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  // ✅ Quick filter by session ID
  const filterBySession = useCallback((sessionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionId", sessionId);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data || data.summary.totalFrictionEvents === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-850 text-zinc-400 rounded-2xl mb-3">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Friction Events
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No user friction events recorded in the selected audit timeframe.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const trend = data.trend;
  const events = data.events;
  const totalPages = data.totalPages;

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 🔥 1. SUMMARY CARDS (5 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Rage Clicks */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Rage Clicks</p>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0 shadow-2xs">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalRageClicks.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Frustrated Users</p>
          </div>
        </div>

        {/* Exit Intents */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Exit Intents</p>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0 shadow-2xs">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalExitIntents.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Bounce Trajectory</p>
          </div>
        </div>

        {/* OOS Attempts */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">OOS Attempts</p>
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20 shrink-0 shadow-2xs">
              <PackageX size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalOosAttempts.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Depleted Stock Alerts</p>
          </div>
        </div>

        {/* JS Exceptions */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">JS Exceptions</p>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0 shadow-2xs">
              <Bug size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalJsExceptions.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Client Script Crashes</p>
          </div>
        </div>

        {/* Checkout Errors */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Checkout Errors</p>
            <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl border border-pink-500/20 shrink-0 shadow-2xs">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalCheckoutErrors.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Gateway Blockers</p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TREND CHART (Line) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY USER FRICTION TRAJECTORY
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="rageClicks" stroke="#ef4444" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="exitIntents" stroke="#f59e0b" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="oosAttempts" stroke="#f97316" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="jsExceptions" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="checkoutErrors" stroke="#ec4899" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 3. EVENTS LOG TABLE (With Session Actions) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-brand-primary" />
            <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">Active User Friction Events</h3>
            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
              {summary.totalFrictionEvents.toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        {/* Table scroll guard */}
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Event Type</th>
                <th className="py-3 px-4 whitespace-nowrap">Path</th>
                <th className="py-3 px-4 whitespace-nowrap">Session ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {events.map((event: any) => {
                const colors = getEventColor(event.eventType);
                return (
                  <tr key={event._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {format(parseISO(event.createdAt), "MMM dd, hh:mm a")}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${colors}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                        {formatEventType(event.eventType)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap max-w-xs truncate">
                      {event.path || "/"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                          {event.sessionId.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(event.sessionId, "Session ID")}
                          className="p-1 text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer shrink-0"
                          title="Copy session ID"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => filterBySession(event.sessionId)}
                          className="text-[8px] font-bold text-brand-primary hover:underline cursor-pointer shrink-0"
                          title="Filter by this session"
                        >
                          Filter
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <MetadataPreview metadata={event.metadata} />
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