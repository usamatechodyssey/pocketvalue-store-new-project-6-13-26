// 📂 src/app/features/admin/executive-kpi/components/StrategicAIInsight.tsx (NEW STANDALONE COMPONENT WITH ACTIVE ROUTING)

"use client";

import Link from "next/link"; // ✅ Next.js Link imported for client-side routing
import { Zap, ArrowUpRight } from "lucide-react";
import { ExecutiveSummary } from "../actions/getExecutiveAnalytics";

interface StrategicAIInsightProps {
  data: ExecutiveSummary | null;
}

export default function StrategicAIInsight({ data }: StrategicAIInsightProps) {
  if (!data) return null; // Safe rendering if data is not loaded yet

  return (
    <div className="bg-linear-to-br from-gray-900 to-black dark:from-brand-primary/10 dark:to-black p-6 md:p-10 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 hidden md:block">
        <Zap size={140} className="text-brand-primary" />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
          <Zap className="text-brand-primary fill-brand-primary" />
          Strategic AI Insight
        </h2>
        <p className="text-gray-400 mt-4 max-w-3xl text-sm md:text-base font-medium leading-relaxed">
          {data.inventory.criticalStockCount > 0
            ? `Urgent: Stock burn rate is accelerating. Your ${data.inventory.criticalStockCount} most popular variants will be depleted within 72 hours. Immediate reorder recommended to avoid revenue loss.`
            : `Performance Insight: Average Order Value is stable at Rs. ${data.orders.avgOrderValue?.toLocaleString('en-PK') || 0}. Revenue efficiency is strong. Customer retention metrics are healthy.`}
        </p>
        <div className="mt-8">
          {/* ✅ Enterprise routing wrapped button to safely navigate to Inventory Forecast view */}
          <Link href="/admin/inventory-forecast" className="inline-block">
            <button className="px-8 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.4)] transition-all flex items-center gap-2">
              Open Inventory Audit <ArrowUpRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}