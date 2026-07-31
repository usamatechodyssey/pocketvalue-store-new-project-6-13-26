// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralCartView.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBehavioralCart, BehavioralCartResponse } from "../actions/getBehavioralCart";
import {
  ShoppingCart,
  CreditCard,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  User,
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

// ✅ SHARED PAGINATION
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ================================================================
// 🎨 CUSTOM CYBERNETIC TOOLTIP (Solid non-transparent background)
// ================================================================
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-zinc-950 dark:bg-black border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-48 font-mono">
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
export default function BehavioralCartView({ range }: { range: { from: Date; to: Date } }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  
  const [data, setData] = useState<BehavioralCartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    getBehavioralCart(range, currentPage)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range, currentPage]);

  // Loading skeleton
  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center py-20 w-full">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  // Empty state
  if (!data || data.summary.totalAddToCarts === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <ShoppingCart size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Cart Activity Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No cart or checkout events recorded in the selected date range.
        </p>
      </div>
    );
  }

  const summary = data.summary;
  const funnel = data.funnelSteps;
  const trend = data.trend;
  const abandonedCarts = data.abandonedCarts;
  const totalPages = data.totalPages;

  // Recovery Rate Calculation
  const totalResolvedCarts = summary.recoveredCarts + summary.activeAbandonedCarts;
  const recoveryRate = totalResolvedCarts > 0 ? (summary.recoveredCarts / totalResolvedCarts) * 100 : 0;

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* ================================================================ */}
      {/* 📊 1. SUMMARY CARDS (5 Columns) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Add to Carts */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Add to Carts</p>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0 shadow-2xs">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalAddToCarts.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Baskets Created</p>
          </div>
        </div>

        {/* Checkout Starts */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Checkout Starts</p>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0 shadow-2xs">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalCheckoutStarts.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Fulfillment Initiated</p>
          </div>
        </div>

        {/* Purchases */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Purchases</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0 shadow-2xs">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.totalPurchases.toLocaleString('en-PK')}</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Converted Revenue</p>
          </div>
        </div>

        {/* Abandonment Rate */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Abandonment Rate</p>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0 shadow-2xs">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{summary.abandonmentRate}%</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Baskets Lost</p>
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Recovery Rate</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0 shadow-2xs">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">{recoveryRate.toFixed(1)}%</p>
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1">Saved Cart Revenue</p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 📊 2. FUNNEL CHART (Vertical) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 size={12} className="text-brand-primary" /> CHECKOUT CONVERSION FUNNEL
          </span>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnel}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              barSize={25}
            >
              <CartesianGrid horizontal={false} stroke="#27272a" opacity={0.4} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="step"
                width={150}
                tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0]?.payload;
                    return (
                      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl font-mono">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">{data.step}</p>
                        <p className="text-xs font-bold text-brand-primary">{(data.uniqueSessions || 0).toLocaleString('en-PK')} SessionsReached</p>
                        {data.dropOffCount > 0 && (
                          <p className="text-[10px] text-red-500 font-bold mt-1">
                            Drop-off: {data.dropOffCount.toLocaleString('en-PK')} ({data.dropOffPercentage}%)
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="uniqueSessions"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
                label={{
                  position: "right",
                  formatter: (value: any) => (typeof value === 'number' ? value.toLocaleString('en-PK') : String(value || 0)),
                  fill: "#a1a1aa",
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 📊 3. TREND CHART (Line) */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 mb-5">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" /> DAILY CART ENGAGEMENT TRENDS
          </span>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 9, fontFamily: "monospace" }} width={35} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="addToCarts" stroke="#8b5cf6" name="Add to Carts" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="checkoutStarts" stroke="#3b82f6" name="Checkout Starts" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Purchases" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 📄 4. ABANDONED CARDS TABLE */}
      {/* ================================================================ */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-500" />
            <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">Active Abandoned Carts</h3>
            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full">
              {summary.activeAbandonedCarts.toLocaleString('en-PK')}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">{summary.recoveredCarts.toLocaleString('en-PK')} recovered</span>
        </div>

        {/* Scrollable Table Wrapper */}
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Session / User</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Items</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Subtotal</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Last Updated</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Recovered</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {abandonedCarts.map((cart: any) => (
                <tr key={cart._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">
                        {cart.userId ? `User: ${cart.userId.slice(0, 8)}...` : `Session: ${cart.sessionId.slice(0, 12)}...`}
                      </span>
                      {cart.email && <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{cart.email}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{cart.itemCount}</td>
                  <td className="py-3 px-4 text-right text-xs font-bold text-brand-primary whitespace-nowrap">
                    Rs. {(cart.subtotal || 0).toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(cart.lastUpdated).toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        cart.isRecovered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20"
                      }`}
                    >
                      {cart.isRecovered ? "✅ Yes" : "❌ No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {cart.userId ? (
                      <Link
                        href={`/admin/users-explorer/${cart.userId}`} // ✅ Match exact userdetail custom view path
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary hover:underline transition-all no-underline"
                      >
                        <User size={12} /> View User
                      </Link>
                    ) : (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">—</span>
                    )}
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