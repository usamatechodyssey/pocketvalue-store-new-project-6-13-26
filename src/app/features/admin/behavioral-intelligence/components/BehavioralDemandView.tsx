// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralDemandView.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getBehavioralDemand } from "../actions/getBehavioralDemand";
import {
  PackageSearch,
  ShoppingBag,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  Zap,
  CheckCircle,
  Mail,
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

// ✅ SHARED PAGINATION
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

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
            <div key={entry.dataKey} className="flex justify-between items-center gap-6">
              <span className="font-bold" style={{ color: entry.stroke || entry.color }}>{entry.name}:</span>
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
export default function BehavioralDemandView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralDemand(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data || (data.summary.totalRestockRequests === 0 && data.summary.totalCustomVariantRequests === 0)) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <PackageSearch size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Demand Data Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No restock or custom variant requests recorded in the selected audit range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const topProducts = data.topProducts;
  const topVariants = data.topVariants;
  const trend = data.trend;
  const requests = data.requests;
  const totalPages = data.totalPages;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "notified": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "ignored": return "bg-zinc-800 text-zinc-400 border border-zinc-700";
      default: return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const formatRequestType = (type: string) => {
    switch (type) {
      case "restock": return "Restock";
      case "missing_variant": return "Missing Variant";
      case "missing_product": return "Missing Product";
      default: return type;
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (4 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Restock */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Restock Requests</p>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0 shadow-2xs">
              <PackageSearch size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalRestockRequests.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Back-in-Stock Alerts</p>
          </div>
        </div>

        {/* Custom Variants */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Custom Variants</p>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0 shadow-2xs">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalCustomVariantRequests.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Sizing/Attributes Requests</p>
          </div>
        </div>

        {/* Urgent */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Urgent Requests</p>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0 shadow-2xs">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalUrgentRequests.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">High Intensity Pulse</p>
          </div>
        </div>

        {/* Pending */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Pending Status</p>
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20 shrink-0 shadow-2xs">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalPendingRequests.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Awaiting Notification</p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TOP PRODUCTS (Horizontal Bar) */}
      {/* ================================================================ */}
      {topProducts.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <BarChart3 size={16} className="text-brand-primary" /> TOP DEMANDED PRODUCTS
          </h3>
          <div className="space-y-4">
            {topProducts.map((item: any, idx: number) => {
              const maxRequests = topProducts[0]?.requests || 1;
              const percentage = (item.requests / maxRequests) * 100;
              return (
                <div key={item.productId || item.productName} className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate" title={item.productName}>
                    {item.productName}
                    {item.productId && (
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 ml-2 font-mono">({item.productId.slice(0, 8)}...)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-50 w-10 text-right">{item.requests}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 3. TOP VARIANTS (Horizontal Bar) */}
      {/* ================================================================ */}
      {topVariants.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <BarChart3 size={16} className="text-brand-primary" /> TOP DEMANDED VARIANTS
          </h3>
          <div className="space-y-4">
            {topVariants.map((item: any, idx: number) => {
              const maxRequests = topVariants[0]?.requests || 1;
              const percentage = (item.requests / maxRequests) * 100;
              return (
                <div key={item.variantKey} className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate" title={item.variantName}>
                    {item.variantName}
                    {/* ✅ FIXED: Changed invalid 'text-zinc-505' class to standard 'text-zinc-500' */}
                    <span className="text-[8px] text-zinc-400 dark:text-zinc-500 ml-2 font-mono">({item.variantKey})</span>
                  </span>
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-50 w-10 text-right">{item.requests}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 4. TREND CHART */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY CUSTOMER DEMAND TELEMETRY
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="restockRequests" stroke="#3b82f6" name="Restock Alert" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="customVariantRequests" stroke="#8b5cf6" name="Sizing/Custom Requests" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 5. REQUESTS TABLE (With Action) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <PackageSearch size={16} className="text-brand-primary" />
            <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">Demand Requests Pipeline</h3>
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
              {(summary.totalRestockRequests + summary.totalCustomVariantRequests).toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Request Type</th>
                <th className="py-3 px-4 whitespace-nowrap">Product / Variant</th>
                <th className="py-3 px-4 whitespace-nowrap">Contact</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Urgent</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {requests.map((req: any) => (
                <tr key={req._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
                      {formatRequestType(req.requestType)}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                        {req.requestedProductName || req.productId || "N/A"}
                      </span>
                      {req.selectedAttributes && (
                        // ✅ FIXED: Changed invalid 'text-zinc-505' class to standard 'text-zinc-500'
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {Object.entries(req.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <a
                        href={`mailto:${req.email}`}
                        className="text-[10px] font-bold text-brand-primary flex items-center gap-1 no-underline hover:no-underline"
                      >
                        <Mail size={10} /> {req.email}
                      </a>
                      {req.phone && (
                        // ✅ FIXED: Changed invalid 'text-zinc-505' class to standard 'text-zinc-500'
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{req.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {req.urgencyLevel === "urgent" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-bold uppercase">
                        <Zap size={10} /> Urgent
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Normal</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusColor(req.status)}`}
                    >
                      {req.status === "pending" && <Clock size={10} />}
                      {req.status === "notified" && <CheckCircle size={10} />}
                      {req.status === "ignored" && <AlertCircle size={10} />}
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                    {format(parseISO(req.createdAt), "MMM dd, yyyy")}
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