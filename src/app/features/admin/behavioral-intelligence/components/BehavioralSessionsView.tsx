// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralSessionsView.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBehavioralSessions } from "../actions/getBehavioralSessions";
import {
  Users,
  Clock,
  Activity,
  Loader2,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  MapPin,
  Globe,
  Copy,
  UserCheck,
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
// 🎨 CUSTOM TOOLTIP (Enterprise Grade)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between gap-8 text-xs font-medium py-0.5">
            <span style={{ color: entry.stroke || entry.color }}>{entry.name}:</span>
            <span className="font-bold text-white">{(entry.value || 0).toLocaleString('en-PK')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ================================================================
// 🔧 HELPER: User Display Formatter (Fixes Raw BSON ObjectId Bug)
// ================================================================
const formatUserDisplay = (userVal?: string): string => {
  if (!userVal || userVal.trim() === "" || userVal === "Guest") return "Guest";
  // ✅ FIX: Converts raw 24-character Mongo ObjectIds like "668fa2b10a..." into "User #001234"
  if (/^[a-fA-F0-9]{24}$/.test(userVal.trim())) {
    return `User #${userVal.trim().slice(-6).toUpperCase()}`;
  }
  return userVal;
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function BehavioralSessionsView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralSessions(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toastSuccess(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toastError(`Failed to copy ${label}.`);
      });
  };

  // Quick filter by session ID
  const filterBySession = useCallback((sessionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionId", sessionId);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data || data.summary.totalSessions === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-850 text-zinc-400 rounded-2xl mb-3">
          <Activity size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Session Data Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No active user sessions recorded in the selected date range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const breakdown = data.breakdown;
  const trend = data.trend;
  const sessions = data.sessions;
  const totalPages = data.totalPages;

  const ICON_MAP: Record<string, any> = {
    mobile: Smartphone,
    desktop: Monitor,
    tablet: Tablet,
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (5 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active Now */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Active Now</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">{summary.activeSessions.toLocaleString('en-PK')}</p>
        </div>

        {/* Total Sessions */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
              <Activity size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Total Sessions</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">{summary.totalSessions.toLocaleString('en-PK')}</p>
        </div>

        {/* New Visitors */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <UserCheck size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">New Visitors</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">{summary.newSessions.toLocaleString('en-PK')}</p>
        </div>

        {/* Unique Visitors */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Unique Visitors</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">{summary.uniqueVisitors.toLocaleString('en-PK')}</p>
        </div>

        {/* Avg Session Duration */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-500">
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Avg Duration</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">
            {summary.avgSessionDuration > 0 ? `${Math.round(summary.avgSessionDuration)}s` : "N/A"}
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TREND CHART */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <Activity size={16} className="text-brand-primary" /> DAILY SESSION ACTIVITY TRENDS
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" name="Total Sessions" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="activeSessions" stroke="#3b82f6" name="Active Sessions" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 3. BREAKDOWNS (5 Cards) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Device */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-2 shrink-0">
            <Laptop size={14} /> Device
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {breakdown.device && breakdown.device.length > 0 ? (
              breakdown.device.map((item: any) => {
                const Icon = ICON_MAP[item.label.toLowerCase()] || Laptop;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <Icon size={12} className="text-zinc-400 shrink-0" />
                    <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 flex-1 capitalize truncate">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-brand-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold dark:text-zinc-50 w-8 text-right shrink-0">{item.percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">No device data available</p>
            )}
          </div>
        </div>

        {/* OS */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-2 shrink-0">
            <Monitor size={14} /> OS
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {breakdown.os && breakdown.os.length > 0 ? (
              breakdown.os.map((item: any) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold dark:text-zinc-50 w-8 text-right shrink-0">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">No OS data available</p>
            )}
          </div>
        </div>

        {/* Browser */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-2 shrink-0">
            <Globe size={14} /> Browser
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {breakdown.browser && breakdown.browser.length > 0 ? (
              breakdown.browser.map((item: any) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold dark:text-zinc-50 w-8 text-right shrink-0">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">No browser data available</p>
            )}
          </div>
        </div>

        {/* City (✅ FIX 4: Added empty state fallback so box is never blank) */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-2 shrink-0">
            <MapPin size={14} /> City
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {breakdown.city && breakdown.city.length > 0 ? (
              breakdown.city.map((item: any) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold dark:text-zinc-50 w-8 text-right shrink-0">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">No city data available</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-850 pb-2 shrink-0">
            <Globe size={14} /> Country
          </h4>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {breakdown.country && breakdown.country.length > 0 ? (
              breakdown.country.map((item: any) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 flex-1 truncate">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold dark:text-zinc-50 w-8 text-right shrink-0">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic">No country data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 4. SESSIONS TABLE */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Session ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Visitor</th>
                <th className="py-3 px-4 whitespace-nowrap">User</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Device</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">OS</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Last Pulse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {sessions.map((session: any) => (
                <tr key={session._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold dark:text-white">
                        {session.sessionId.slice(0, 12)}...
                      </span>
                      <button
                        onClick={() => copyToClipboard(session.sessionId, "Session ID")}
                        className="p-1 text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer shrink-0"
                        title="Copy session ID"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => filterBySession(session.sessionId)}
                        className="text-[8px] font-bold text-brand-primary hover:underline cursor-pointer shrink-0"
                        title="Filter by this session"
                      >
                        Filter
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {session.visitorId.slice(0, 8)}...
                  </td>
                  {/* ✅ FIX 3: Formats raw ObjectIds ("668fa2...") as "User #001234" instead of raw BSON string */}
                  <td className="py-3 px-4 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {formatUserDisplay(session.userId)}
                  </td>
                  <td className="py-3 px-4 text-center text-[10px] font-bold capitalize whitespace-nowrap">
                    {session.device}
                  </td>
                  <td className="py-3 px-4 text-center text-[10px] font-bold whitespace-nowrap">
                    {session.os}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        session.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          session.isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                        }`}
                      />
                      {session.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[10px] text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                    {format(parseISO(session.lastPulse), "MMM dd, hh:mm a")}
                  </td>
                </tr>
              ))}
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