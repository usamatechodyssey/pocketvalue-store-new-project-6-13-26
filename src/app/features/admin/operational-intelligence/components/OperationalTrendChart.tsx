// 📂 src/app/features/admin/operational-intelligence/components/OperationalTrendChart.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Loader2 } from "lucide-react";
import { OperationalTrendPoint } from "../actions/getOperationalTrends";

// ================================================================
// ✅ TYPES
// ================================================================
interface OperationalTrendChartProps {
  data: {
    data: OperationalTrendPoint[];
    days: number;
    generatedAt: string;
  } | null;
}

// ================================================================
// 🎨 SOLID CYBER-HUD TOOLTIP (PKR Localized)
// ================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0]?.payload || {};
    const limboRev = data.limboRevenue || 0;

    return (
      <div
        className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl min-w-56 backdrop-blur-md z-50 font-mono"
        role="tooltip"
        aria-label={`Trend data for ${label}`}
      >
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
          Audit Point: {label}
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-6">
            <span className="text-zinc-500 font-bold">Total Orders</span>
            <span className="font-bold text-white">{(data.totalOrders || 0).toLocaleString('en-PK')}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-emerald-500 font-bold">Delivered</span>
            <span className="font-bold text-emerald-500">{(data.deliveredCount || 0).toLocaleString('en-PK')}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-red-500 font-bold">Cancelled</span>
            <span className="font-bold text-red-500">{(data.cancelledCount || 0).toLocaleString('en-PK')}</span>
          </div>
          
          <div className="border-t border-zinc-800 pt-2.5 mt-1 space-y-2">
            <div className="flex justify-between gap-6">
              <span className="text-amber-500 font-bold">Fulfillment Rate</span>
              <span className="font-bold text-amber-500">{data.fulfillmentRate || 0}%</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-zinc-400 font-bold">Limbo Cash</span>
              <span className="font-bold text-zinc-300">Rs. {limboRev.toLocaleString('en-PK')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function OperationalTrendChart({
  data,
}: OperationalTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading Skeleton
  if (!mounted) {
    return (
      <div
        className="w-full h-64 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse flex items-center justify-center"
        role="status"
        aria-label="Loading operational trends chart"
      >
        <Loader2 size={28} className="text-zinc-400 animate-spin" />
      </div>
    );
  }

  // Empty State
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 text-center"
        role="status"
        aria-label="No trend data available"
      >
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <TrendingDown size={28} />
        </div>
        <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Trend Data Available
        </p>
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          Start generating operational data to see historical trends.
        </p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.data.map((point) => ({
    date: point.date,
    totalOrders: point.totalOrders,
    deliveredCount: point.deliveredCount,
    cancelledCount: point.cancelledCount,
    pendingCount: point.pendingCount,
    limboRevenue: point.limboRevenue,
    fulfillmentRate: point.fulfillmentRate,
    leakageRate: point.leakageRate,
  }));

  return (
    <div
      className="w-full h-64 min-w-0"
      role="img"
      aria-label="Operational trend chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fulfillmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="leakageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
          
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}
            // ✅ FIX: Safe string splitting prevents NaN/NaN date ticks on Safari & older browsers
            tickFormatter={(val) => {
              if (!val) return "";
              const parts = val.split("-");
              return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
            }}
            interval="preserveStartEnd"
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: 600, fontFamily: "monospace" }}
            width={35}
            tickFormatter={(value) => {
              if (value >= 1000) return `${value / 1000}k`;
              return value;
            }}
          />
          
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#ffffff08", strokeWidth: 1.5, strokeDasharray: "4 4" }}
          />
          
          <Area
            type="monotone"
            dataKey="fulfillmentRate"
            stroke="#10b981"
            strokeWidth={3.5}
            fill="url(#fulfillmentGradient)"
            name="Fulfillment Rate"
            animationDuration={1200}
          />
          <Area
            type="monotone"
            dataKey="leakageRate"
            stroke="#ef4444"
            strokeWidth={3}
            fill="url(#leakageGradient)"
            name="Leakage Rate"
            animationDuration={1200}
          />
          <Area
            type="monotone"
            dataKey="pendingCount"
            stroke="#f59e0b"
            strokeWidth={3}
            fill="url(#pendingGradient)"
            name="Pending Orders"
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}