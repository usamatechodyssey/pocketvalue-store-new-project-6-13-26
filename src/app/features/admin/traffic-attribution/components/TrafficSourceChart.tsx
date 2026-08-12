// 📂 src/app/features/admin/traffic-attribution/components/TrafficSourceChart.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, BarChart3, Share2 } from 'lucide-react';

export interface TrafficData {
  name: string;
  value: number;
  orders: number;
  fill: string;
}

interface TrafficSourceChartProps {
  data: TrafficData[] | null | undefined;
}

// --- CUSTOM CYBERNETIC TOOLTIP ---
const CustomTooltip = ({ active, payload, totalRevenue }: any) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload as TrafficData;
    const sharePercent = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : "0";

    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-50 min-w-56 animate-in fade-in duration-100">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
            {item.name}
          </span>
          <span className="text-[9px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
            {sharePercent}% Share
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-bold">Attributed Revenue:</span>
            <span className="font-black text-white">Rs. {item.value.toLocaleString('en-PK')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-bold">Total Orders:</span>
            <span className="font-bold text-zinc-300">{item.orders} Orders</span>
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
export default function TrafficSourceChart({ data }: TrafficSourceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return sortedData.reduce((sum, item) => sum + item.value, 0);
  }, [sortedData]);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full min-h-100 animate-pulse">
        <div className="mb-4 space-y-2">
          <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-900 rounded" />
        </div>
        <div className="w-48 h-48 mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-full my-6" />
        <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Share2 size={20} className="text-brand-primary" /> Attribution Audit
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Revenue Share by Traffic Channel
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <BarChart3 size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">No Traffic Data</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans">No attributed orders found for this timeframe.</p>
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/marketing-hub"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm no-underline hover:no-underline"
          >
            Open Marketing Hub <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Revenue Attribution by Traffic Channel"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Share2 size={20} className="text-brand-primary" /> Attribution Audit
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Revenue Share by Traffic Channel
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          UTM REAL-TIME
        </span>
      </div>

      {/* DONUT CHART CONTAINER */}
      <div className="w-full h-56 relative my-2 min-h-56" style={{ height: '224px', width: '100%' }}>
        {/* Central Donut Overlay (Background Layer) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center z-0">
          <span className="text-[8px] font-black font-mono text-zinc-400 uppercase tracking-widest">Total Sales</span>
          <span className="text-base font-black text-zinc-900 dark:text-white font-mono tracking-tight">
            Rs. {totalRevenue.toLocaleString('en-PK')}
          </span>
        </div>

        {/* ResponsiveContainer (Foreground Layer) */}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={82}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1200}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip totalRevenue={totalRevenue} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* HIGH-DENSITY CHANNEL BREAKDOWN LIST WITH PROGRESS BARS */}
      <div className="space-y-2.5 my-4 flex-1">
        {sortedData.slice(0, 4).map((item, idx) => {
          const share = totalRevenue > 0 ? Number(((item.value / totalRevenue) * 100).toFixed(0)) : 0;
          return (
            <div
              key={idx}
              className="relative overflow-hidden p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs"
            >
              {/* Subtle Progress Fill Background */}
              <div 
                className="absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none transition-all duration-500 rounded-2xl" 
                style={{ width: `${share}%`, backgroundColor: item.fill }} 
              />

              <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.fill }} />
                <span className="font-mono font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px] truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 relative z-10 font-mono">
                <span className="text-[9px] text-zinc-400 font-bold">{item.orders} Orders</span>
                <span className="font-black text-zinc-900 dark:text-white text-xs">
                  Rs. {item.value.toLocaleString('en-PK')} <span className="text-[9px] text-zinc-500">({share}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/admin/marketing-hub"
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Open Marketing Hub <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}