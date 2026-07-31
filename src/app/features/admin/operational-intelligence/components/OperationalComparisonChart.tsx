// 📂 src/app/features/admin/operational-intelligence/components/OperationalComparisonChart.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Minus, Loader2 } from "lucide-react";
import { OperationalComparisonResponse } from "../actions/getOperationalComparison";

// ================================================================
// ✅ TYPES
// ================================================================
interface OperationalComparisonChartProps {
  data: OperationalComparisonResponse | null;
}

// ================================================================
// ✅ COLOR CONSTANTS (Brand Neon + Zinc)
// ================================================================
const COLORS = {
  current: "#f97316",  // Brand Primary Neon Orange
  previous: "#71717a", // Zinc-500
};

// ================================================================
// 🔨 HELPER: Transform & Scale data for chart (Prevents 2.5M Squeezing)
// ================================================================
const transformChartData = (data: OperationalComparisonResponse) => {
  const metrics = data.metrics;

  return [
    {
      name: "Total Orders",
      current: metrics.totalOrders.current,
      previous: metrics.totalOrders.previous,
      rawCurrent: metrics.totalOrders.current,
      rawPrevious: metrics.totalOrders.previous,
      unit: "count",
      change: metrics.totalOrders.change,
      trend: metrics.totalOrders.trend,
    },
    {
      name: "Delivered",
      current: metrics.deliveredCount.current,
      previous: metrics.deliveredCount.previous,
      rawCurrent: metrics.deliveredCount.current,
      rawPrevious: metrics.deliveredCount.previous,
      unit: "count",
      change: metrics.deliveredCount.change,
      trend: metrics.deliveredCount.trend,
    },
    {
      name: "Cancelled",
      current: metrics.cancelledCount.current,
      previous: metrics.cancelledCount.previous,
      rawCurrent: metrics.cancelledCount.current,
      rawPrevious: metrics.cancelledCount.previous,
      unit: "count",
      change: metrics.cancelledCount.change,
      trend: metrics.cancelledCount.trend,
    },
    {
      name: "Limbo Rev (kPKR)",
      // ✅ Scale Revenue to Thousands in chart bars so orders don't collapse to 0px!
      current: Number((metrics.limboRevenue.current / 1000).toFixed(1)),
      previous: Number((metrics.limboRevenue.previous / 1000).toFixed(1)),
      rawCurrent: metrics.limboRevenue.current,
      rawPrevious: metrics.limboRevenue.previous,
      unit: "pkr",
      change: metrics.limboRevenue.change,
      trend: metrics.limboRevenue.trend,
    },
    {
      name: "Pending Orders",
      current: metrics.pendingCount.current,
      previous: metrics.pendingCount.previous,
      rawCurrent: metrics.pendingCount.current,
      rawPrevious: metrics.pendingCount.previous,
      unit: "count",
      change: metrics.pendingCount.change,
      trend: metrics.pendingCount.trend,
    },
    {
      name: "Fulfillment %",
      current: metrics.fulfillmentRate.current,
      previous: metrics.fulfillmentRate.previous,
      rawCurrent: metrics.fulfillmentRate.current,
      rawPrevious: metrics.fulfillmentRate.previous,
      unit: "percent",
      change: metrics.fulfillmentRate.change,
      trend: metrics.fulfillmentRate.trend,
    },
    {
      name: "Leakage %",
      current: metrics.leakageRate.current,
      previous: metrics.leakageRate.previous,
      rawCurrent: metrics.leakageRate.current,
      rawPrevious: metrics.leakageRate.previous,
      unit: "percent",
      change: metrics.leakageRate.change,
      trend: metrics.leakageRate.trend,
    },
  ];
};

// ================================================================
// 🎨 SOLID CYBER-HUD TOOLTIP (Unit-Aware PKR Formatting)
// ================================================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0]?.payload;
    if (!item) return null;

    const rawCurrent = item.rawCurrent || 0;
    const rawPrevious = item.rawPrevious || 0;
    const change = item.change || 0;
    const trend = item.trend || "STABLE";

    // Format based on unit type
    const formatValue = (val: number) => {
      if (item.unit === "pkr") return `Rs. ${val.toLocaleString('en-PK')}`;
      if (item.unit === "percent") return `${val}%`;
      return `${val.toLocaleString('en-PK')} Orders`;
    };

    return (
      <div
        className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl min-w-60 backdrop-blur-md z-50 font-mono"
        role="tooltip"
        aria-label={`Comparison data for ${label}`}
      >
        <p className="text-xs font-bold uppercase text-zinc-300 mb-3 border-b border-zinc-800 pb-2 tracking-wider">
          {label}
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
              <span className="text-zinc-400 uppercase text-[10px]">Current</span>
            </span>
            <span className="font-bold text-white">
              {formatValue(rawCurrent)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 border border-dashed" />
              <span className="text-zinc-400 uppercase text-[10px]">Previous</span>
            </span>
            <span className="font-bold text-zinc-400">
              {formatValue(rawPrevious)}
            </span>
          </div>
          <div className="border-t border-zinc-800 pt-2 mt-1 flex justify-between items-center text-[10px]">
            <span className="font-bold text-zinc-500 uppercase tracking-widest">Growth Delta</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full border ${
                trend === "UP"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : trend === "DOWN"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {trend === "UP" ? "▲ +" : trend === "DOWN" ? "▼ " : "— "}
              {change}%
            </span>
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
export default function OperationalComparisonChart({
  data,
}: OperationalComparisonChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading Skeleton
  if (!mounted) {
    return (
      <div
        className="w-full h-80 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse flex items-center justify-center"
        role="status"
        aria-label="Loading operational comparison chart"
      >
        <Loader2 size={28} className="text-zinc-400 animate-spin" />
      </div>
    );
  }

  // Empty State
  if (!data || !data.metrics) {
    return (
      <div
        className="flex flex-col items-center justify-center h-80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 text-center"
        role="status"
        aria-label="No comparison data available"
      >
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <TrendingDown size={28} />
        </div>
        <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Comparison Data Available
        </p>
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          Select a date range to see period-over-period comparison.
        </p>
      </div>
    );
  }

  const chartData = transformChartData(data);

  // Check if any metric has data
  const hasData = chartData.some((item) => item.rawCurrent > 0 || item.rawPrevious > 0);
  if (!hasData) {
    return (
      <div
        className="flex flex-col items-center justify-center h-80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 text-center"
        role="status"
        aria-label="No data available for comparison"
      >
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <Minus size={28} />
        </div>
        <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          Zero Operational Activity
        </p>
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          No operational activity recorded in the selected comparison period.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-80 min-w-0"
      role="region"
      aria-label="Operational Period-over-Period Comparison Chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
          barGap={6}
          barSize={18}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#27272a"
            opacity={0.4}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#a1a1aa",
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
            interval={0}
            angle={-10}
            textAnchor="end"
            height={40}
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
            cursor={{ fill: "#ffffff08" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest ml-1">
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="current"
            name="Current Period"
            fill={COLORS.current}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="previous"
            name="Previous Period"
            fill={COLORS.previous}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}