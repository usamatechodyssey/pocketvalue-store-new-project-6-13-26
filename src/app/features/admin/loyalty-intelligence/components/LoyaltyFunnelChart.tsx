// 📂 src/app/features/admin/loyalty-intelligence/components/LoyaltyFunnelChart.tsx

"use client";

import React from "react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingDown, AlertCircle, Filter } from "lucide-react";
import { LoyaltyFunnelResponse } from "../actions/getLoyaltyFunnel";

// ================================================================
// ✅ TYPES
// ================================================================
interface LoyaltyFunnelChartProps {
  data: LoyaltyFunnelResponse | null;
}

// ================================================================
// 🎨 COLOR PALETTE (Brand Neon + Emerald)
// ================================================================
const COLOR_MAP = [
  "#f97316", // Step 1: Brand Orange
  "#fb923c", // Step 2: Light Orange
  "#f59e0b", // Step 3: Amber
  "#3b82f6", // Step 4: Metric Blue
  "#10b981", // Step 5: Emerald Green
];

// ================================================================
// 🎨 CUSTOM TOOLTIP (Aligned with ReportChartSection Standard)
// ================================================================
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 min-w-52 font-mono">
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-3">
          {data.name}
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center gap-6">
            <span className="text-zinc-400 font-bold">Step Volume:</span>
            <span className="font-bold text-white font-mono">
              {(data.count || 0).toLocaleString("en-PK")}
            </span>
          </div>
          {data.dropOffRate > 0 && (
            <div className="flex justify-between items-center gap-6">
              <span className="text-red-500 font-bold">Stage Drop-off:</span>
              <span className="font-bold text-red-500 font-mono">
                {data.dropOffRate}% ({(data.dropOff || 0).toLocaleString("en-PK")})
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function LoyaltyFunnelChart({ data }: LoyaltyFunnelChartProps) {
  // Empty State
  if (!data || !data.steps || data.steps.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">No Funnel Data</h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
            No referral activity recorded yet. Once users click and sign up, the funnel will populate.
          </p>
        </div>
      </div>
    );
  }

  const { steps, avgConversionDays } = data;

  // Filter out steps with zero count to prevent NaN issues in Recharts
  const chartData = steps
    .filter((step) => step.count > 0)
    .map((step, index) => ({
      ...step,
      value: step.count,
      fill: COLOR_MAP[index % COLOR_MAP.length],
    }));

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Filter size={32} />
          </div>
          <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">No Positive Funnel Activity</h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
            All funnel steps currently have zero count. Once referrals start converting, the chart will appear.
          </p>
        </div>
      </div>
    );
  }

  // Determine velocity status
  const velocityStatus =
    avgConversionDays !== null
      ? avgConversionDays <= 3
        ? "Excellent 🔥"
        : avgConversionDays <= 7
        ? "Good 👍"
        : avgConversionDays <= 14
        ? "Average ⏳"
        : "Slow 🐢"
      : "N/A";

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <TrendingDown size={12} className="rotate-90 text-brand-primary" /> REFERRAL CONVERSION FUNNEL
          </span>
        </div>

        {/* Velocity Badge */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-full px-3.5 py-1 border border-zinc-200 dark:border-zinc-800 font-mono">
          <Clock size={12} className="text-brand-primary" />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Velocity:
          </span>
          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            {avgConversionDays !== null ? `${avgConversionDays} Days` : "—"}
          </span>
          <span className="text-[9px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
            {velocityStatus}
          </span>
        </div>
      </div>

      {/* Chart Canvas Box (RESTRUCTURED FUNNEL SHAPE) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="w-full h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
                animationDuration={1000}
              >
                <LabelList
                  position="right"
                  fill="#a1a1aa"
                  stroke="none"
                  dataKey="name"
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight="bold"
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend with Drop-off Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        {chartData.map((step, index) => {
          const isLast = index === chartData.length - 1;
          return (
            <div
              key={step.name}
              className={`flex flex-col p-3.5 rounded-2xl border shadow-2xs justify-between min-w-0 ${
                index === 0
                  ? "border-brand-primary/30 bg-brand-primary/10"
                  : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                  {step.name.split(" ")[0]}
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {step.count.toLocaleString("en-PK")}
                </span>
              </div>
              {!isLast && step.dropOffRate > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-red-500 font-bold">
                  <span>▼ {step.dropOffRate}% drop</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                    ({step.dropOff.toLocaleString("en-PK")})
                  </span>
                </div>
              )}
              {isLast && step.count > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-emerald-500 font-bold">
                  <span>✅ {step.count.toLocaleString("en-PK")} Cleared</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}