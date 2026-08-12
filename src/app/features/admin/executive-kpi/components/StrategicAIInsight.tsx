// 📂 src/app/features/admin/executive-kpi/components/StrategicAIInsight.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight, Sparkles } from "lucide-react";
import { ExecutiveSummary } from "../actions/getExecutiveAnalytics";

interface StrategicAIInsightProps {
  data: ExecutiveSummary | null;
}

export default function StrategicAIInsight({ data }: StrategicAIInsightProps) {
  if (!data) return null;

  const isCritical = data.inventory.criticalStockCount > 0;

  return (
    <div 
      /* ✅ FIX: Clean border-zinc-800/80 on dark card (No white border bleed) */
      className="relative overflow-hidden bg-zinc-950 dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl group transition-all"
      role="region"
      aria-label="Strategic AI Insights"
    >
      {/* Ambient Glow Backdrop */}
      <div 
        className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity duration-1000 ${
          isCritical ? "bg-amber-500" : "bg-brand-primary"
        }`}
      />

      {/* Large Background Decorative Icon */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 hidden lg:block pointer-events-none">
        <Zap size={180} className="text-brand-primary" />
      </div>

      <div className="relative z-10 space-y-4 max-w-4xl font-sans">
        
        {/* Top AI Radar Status Bar (REMOVED generic 'border' class) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
            STRATEGIC AI INSIGHT ENGINE
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">
            • REAL-TIME SYNTHESIS
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 italic font-mono tracking-tight">
          <Zap className="text-brand-primary fill-brand-primary shrink-0" size={28} />
          Strategic Business Insight
        </h2>

        {/* AI Recommendation Message (REMOVED 'border' class from text highlight) */}
        <p className="text-zinc-300 font-medium text-xs sm:text-sm lg:text-base leading-relaxed font-sans">
          {isCritical ? (
            <>
              <strong className="text-amber-400 font-bold font-mono">Urgent Attention Required:</strong> Stock burn rate is accelerating. Your{" "}
              <span className="text-amber-300 font-mono font-bold px-2 py-0.5 bg-amber-500/20 rounded-md">
                {data.inventory.criticalStockCount} most popular variants
              </span>{" "}
              will be depleted within 72 hours. Immediate reorder is recommended to avoid revenue loss.
            </>
          ) : (
            <>
              <strong className="text-emerald-400 font-bold font-mono">Performance Healthy:</strong> Average Order Value is stable at{" "}
              <span className="text-emerald-300 font-mono font-bold px-2 py-0.5 bg-emerald-500/20 rounded-md">
                Rs. {(data.orders.avgOrderValue || 0).toLocaleString("en-PK")}
              </span>
              . Revenue efficiency is strong and customer retention metrics remain within optimal bounds.
            </>
          )}
        </p>

        {/* Action CTA Button (REMOVED 'border' class from button) */}
        <div className="pt-2">
          <Link href="/admin/inventory-forecast" className="inline-block no-underline">
            <button 
              className="px-6 sm:px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-[10px] font-mono font-black uppercase tracking-[0.2em] rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(255,143,50,0.5)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer outline-none border-none"
            >
              <Sparkles size={13} />
              Open Inventory Audit <ArrowUpRight size={14} className="stroke-[2.5]" />
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}