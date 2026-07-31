// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralProductView.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getBehavioralProduct } from "../actions/getBehavioralProduct";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  Package,
  Copy,
  ExternalLink,
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
// 🎨 SOLID CYBER-HUD TOOLTIP (PKR Localized)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between gap-8 text-xs font-medium py-0.5">
            <span style={{ color: entry.stroke || entry.color }}>{entry.name}</span>
            <span className="font-bold text-white">{(entry.value || 0).toLocaleString('en-PK')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function BehavioralProductView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBehavioralProduct(range, currentPage)
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

  if (!data || data.summary.totalImpressions === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <Package size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Product Activity Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No product impressions or clicks recorded in the selected audit range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const topProducts = data.topProducts;
  const trend = data.trend;
  const productList = data.productList;
  const totalPages = data.totalPages;

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (4 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Impressions */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Eye size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Impressions</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalImpressions.toLocaleString('en-PK')}</p>
        </div>

        {/* Clicks */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
              <MousePointerClick size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Clicks</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalClicks.toLocaleString('en-PK')}</p>
        </div>

        {/* CTR */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">CTR</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.overallCtr}%</p>
        </div>

        {/* Variant Compares */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <TrendingDown size={18} />
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Variant Compares</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalVariantCompares.toLocaleString('en-PK')}</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 2. TOP PRODUCTS (Horizontal Bar) */}
      {/* ================================================================ */}
      {topProducts.length > 0 && (
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <BarChart3 size={16} className="text-brand-primary" /> TOP PRODUCTS BY IMPRESSIONS
          </h3>
          <div className="space-y-4">
            {topProducts.map((item: any, idx: number) => {
              const maxImpressions = topProducts[0]?.impressions || 1;
              const percentage = (item.impressions / maxImpressions) * 100;
              return (
                <div key={item.productId} className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black text-zinc-400 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 flex-1 truncate" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-50 w-10 text-right">{item.impressions.toLocaleString('en-PK')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🔥 3. TREND CHART */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY PRODUCT ENGAGEMENT TRENDS
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="impressions" stroke="#8b5cf6" name="Impressions" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Clicks" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 🔥 4. PRODUCT LIST TABLE (With Scroll Guard) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Product</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Impressions</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Clicks</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">CTR</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Variant Compares</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {productList.map((item: any) => (
                <tr key={item.productId} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-40" title={item.name}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.productId, "Product ID")}
                        className="p-1 text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer shrink-0"
                        title="Copy product ID"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {item.impressions.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {item.clicks.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                        item.ctr > 5
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : item.ctr > 2
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20"
                      }`}
                    >
                      {item.ctr}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    {item.variantCompares.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <Link
                      href={`/admin/collections/products/${item.productId}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary transition-all no-underline hover:no-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={12} /> View
                    </Link>
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