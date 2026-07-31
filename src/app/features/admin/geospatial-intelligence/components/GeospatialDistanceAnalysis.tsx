// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialDistanceAnalysis.tsx

"use client";

import React from 'react';
import { DistanceBucket } from "../actions/getGeospatialIntelligence";
import { TrendingDown, MapPin, Banknote, Compass } from "lucide-react";

// ================================================================
// ✅ FLEXIBLE PROPS INTERFACE (Supports both analysis & data props)
// ================================================================
interface GeospatialDistanceAnalysisProps {
  analysis?: DistanceBucket[];
  data?: DistanceBucket[];
}

export default function GeospatialDistanceAnalysis(props: GeospatialDistanceAnalysisProps) {
  // ✅ Safe extraction with fallback defaults
  const distanceList = props.analysis ?? props.data ?? [];

  // Empty State
  if (!distanceList || distanceList.length === 0) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full"
        role="status"
        aria-label="No distance data available"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Compass size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Distance Telemetry
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No warehouse distance radius data recorded in the selected audit range.
          </p>
        </div>
      </div>
    );
  }

  // Find max values for scaling
  const maxRto = Math.max(...distanceList.map((d) => d.rtoRate || 0), 1);
  const totalOrders = distanceList.reduce((sum, d) => sum + (d.totalOrders || 0), 0);

  // Helper for RTO bar color
  const getRtoBarColor = (rate: number) => {
    if (rate <= 5) return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    if (rate <= 15) return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
    return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  };

  const getRtoTextColor = (rate: number) => {
    if (rate <= 5) return "text-emerald-500";
    if (rate <= 15) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div
      className="space-y-4 w-full min-w-0 animate-in fade-in duration-300"
      role="region"
      aria-label="Distance vs RTO Analysis"
    >
      {/* Top Action Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
          <TrendingDown size={12} className="text-brand-primary" /> WAREHOUSE PROXIMITY VS RTO ANALYSIS
        </span>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
          {distanceList.length} DISTANCE RADIUS BUCKETS
        </span>
      </div>

      {/* BUCKETS LIST */}
      <div className="space-y-3 min-w-0">
        {distanceList.map((bucket) => {
          const rtoPercent = maxRto > 0 ? (bucket.rtoRate / maxRto) * 100 : 0;

          return (
            <div
              key={bucket.bucketLabel}
              className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs space-y-2.5 min-w-0"
            >
              <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase text-xs flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-primary shrink-0" />
                  {bucket.bucketLabel}
                </span>
                
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <span className="text-brand-primary font-bold flex items-center gap-1">
                    <Banknote size={14} />
                    Rs. {(bucket.totalRevenue || 0).toLocaleString('en-PK')}
                  </span>
                  <span className={`font-bold ${getRtoTextColor(bucket.rtoRate)}`}>
                    RTO: {bucket.rtoRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar & Avg Distance */}
              <div className="flex gap-3 items-center">
                <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getRtoBarColor(bucket.rtoRate)}`}
                    style={{ width: `${Math.min(rtoPercent, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono font-bold shrink-0 whitespace-nowrap">
                  ~{bucket.avgDistance} km avg
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
        <span>📍 {totalOrders.toLocaleString('en-PK')} Total Orders Analyzed</span>
        <span>📊 {distanceList.length} Proximity Tiers</span>
      </div>
    </div>
  );
}