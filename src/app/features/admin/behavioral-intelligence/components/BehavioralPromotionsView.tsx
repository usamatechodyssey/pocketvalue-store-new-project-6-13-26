// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralPromotionsView.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBehavioralPromotions } from "../actions/getBehavioralPromotions";
import {
  Megaphone,
  Ticket,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  Smartphone,
  Eye,
  Copy,
  Percent,
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
import { format, parseISO, addDays } from "date-fns";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ✅ WORKSPACE STANDARD TOASTS
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface BannerMetric {
  bannerId: string;
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface CouponMetric {
  code: string;
  applications: number;
  autoApplications: number;
  removals: number;
}

export interface PromotionTrendPoint {
  date: string;
  bannerClicks: number;
  couponApplications: number;
  autoCouponApplications: number;
  scarcityExposures: number;
  pwaPrompts: number;
}

export interface PromotionEvent {
  _id: string;
  eventType: string;
  sessionId: string;
  path: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BehavioralPromotionsResponse {
  summary: {
    totalBannerClicks: number;
    totalCouponApplications: number;
    totalAutoCouponApplications: number;
    totalCouponRemovals: number;
    totalScarcityExposures: number;
    totalPwaPrompts: number;
    topBanner: string;
  };
  topBanners: BannerMetric[];
  couponPerformance: CouponMetric[];
  trend: PromotionTrendPoint[];
  events: PromotionEvent[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  generatedAt: string;
}

// ================================================================
// 🎨 SOLID CYBER-HUD TOOLTIP (PKR Localized)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">{label}</p>
        <div className="space-y-1.5 text-xs">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between gap-8 text-xs font-medium py-0.5">
              <span style={{ color: entry.stroke || entry.color }}>{entry.name}:</span>
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
export default function BehavioralPromotionsView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<BehavioralPromotionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralPromotions(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  // ✅ Copy helper (Using workspace standard CustomToasts)
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toastSuccess(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toastError(`Failed to copy ${label}.`);
      });
  };

  // ✅ Quick filter by session ID
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

  if (!data || (data.summary.totalBannerClicks === 0 && data.summary.totalCouponApplications === 0)) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-850 text-zinc-400 rounded-2xl mb-3">
          <Megaphone size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Promotion Activity Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No banner clicks or coupon activity recorded in the selected audit range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const topBanners = data.topBanners;
  const couponPerformance = data.couponPerformance;
  const trend = data.trend;
  const events = data.events;
  const totalPages = data.totalPages;

  const formatEventType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      banner_click: "bg-blue-150 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
      coupon_applied: "bg-green-150 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20",
      coupon_auto_applied: "bg-emerald-150 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
      coupon_removed: "bg-red-150 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20",
      scarcity_exposure: "bg-amber-150 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
      pwa_prompt_metric: "bg-purple-150 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
    };
    return colors[type] || "bg-zinc-50 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800";
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (4 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Banner Clicks */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Megaphone size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Banner Clicks</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalBannerClicks.toLocaleString('en-PK')}</p>
        </div>

        {/* Coupons Applied */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Ticket size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Coupons Applied</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{(summary.totalCouponApplications + summary.totalAutoCouponApplications).toLocaleString('en-PK')}</p>
        </div>

        {/* Scarcity Exposures */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Eye size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Scarcity Alerts</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalScarcityExposures.toLocaleString('en-PK')}</p>
        </div>

        {/* PWA Prompts */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
              <Smartphone size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">PWA Install Prompts</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalPwaPrompts.toLocaleString('en-PK')}</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TOP BANNERS (With CTR) */}
      {/* ================================================================ */}
      {topBanners.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <BarChart3 size={18} className="text-brand-primary" /> TOP BANNERS BY CONVERSION (CTR)
          </h3>
          <div className="space-y-4">
            {topBanners.map((item: any, idx: number) => {
              const maxClicks = topBanners[0]?.clicks || 1;
              const percentage = (item.clicks / maxClicks) * 100;
              return (
                <div key={item.bannerId} className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate" title={item.title}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-50 w-10 text-right">{item.clicks.toLocaleString('en-PK')}</span>
                  </div>
                  {/* CTR Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Percent size={10} /> {item.ctr}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 3. COUPON PERFORMANCE */}
      {/* ================================================================ */}
      {couponPerformance.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <Ticket size={18} className="text-brand-primary" /> COUPON DISPATCH PERFORMANCE
          </h3>
          <div className="space-y-4 font-mono">
            {couponPerformance.map((item: any, idx: number) => (
              <div key={item.code} className="flex items-center gap-4">
                <span className="text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate">
                  {item.code}
                </span>
                <div className="flex items-center gap-3 text-[9px] font-bold shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                    {item.applications.toLocaleString('en-PK')} MANUAL
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {item.autoApplications.toLocaleString('en-PK')} AUTO
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                    {item.removals.toLocaleString('en-PK')} REMOVALS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 4. TREND CHART */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY PROMOTIONS ENGAGEMENT TRENDS
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="bannerClicks" stroke="#3b82f6" name="Banner Clicks" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="couponApplications" stroke="#10b981" name="Coupons Applied" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="scarcityExposures" stroke="#f59e0b" name="Scarcity Alerts" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 5. EVENTS TABLE (With Scroll Guard) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Megaphone size={16} className="text-brand-primary" />
            <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">Promotions Dispatch Events</h3>
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
              {(summary.totalBannerClicks + summary.totalCouponApplications + summary.totalAutoCouponApplications + summary.totalScarcityExposures + summary.totalPwaPrompts).toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Event Type</th>
                <th className="py-3 px-4 whitespace-nowrap">Path</th>
                <th className="py-3 px-4 whitespace-nowrap">Session</th>
                <th className="py-3 px-4 whitespace-nowrap">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {events.map((event: any) => {
                const colors = getEventColor(event.eventType);
                return (
                  <tr key={event._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {format(parseISO(event.createdAt), "MMM dd, hh:mm a")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${colors}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                        {formatEventType(event.eventType)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap max-w-xs truncate">
                      {event.path || "/"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
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
                    <td className="p-3.5 px-4 max-w-xs">
                      {event.metadata ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(event.metadata)
                            .filter(([key]) => !["visitorId", "timestamp"].includes(key))
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-850 rounded text-[8px] font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-24 border border-zinc-200/50 dark:border-zinc-800/50"
                                title={`${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`}
                              >
                                {key}: {typeof value === "object" ? JSON.stringify(value).slice(0, 10) : String(value).slice(0, 15)}
                              </span>
                            ))}
                          {Object.keys(event.metadata).filter(
                            (k) => !["visitorId", "timestamp"].includes(k)
                          ).length > 3 && (
                            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold font-mono">
                              +{Object.keys(event.metadata).length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic font-mono">—</span>
                      )}
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