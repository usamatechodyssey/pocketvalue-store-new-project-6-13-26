// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialProvinceList.tsx

"use client";

import { GeospatialProvinceData } from '../actions/getGeospatialIntelligence';
import { TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';

interface Props {
  provinces: GeospatialProvinceData[];
}

export default function GeospatialProvinceList({ provinces }: Props) {
  // ✅ Empty State
  if (!provinces || provinces.length === 0) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full"
        role="status"
        aria-label="No province data available"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Building2 size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Province Data Available
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No orders with verified provincial addresses found in the selected audit period.
          </p>
        </div>
      </div>
    );
  }

  // Growth Color Helper
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-emerald-500 font-mono font-bold';
    if (growth < 0) return 'text-red-500 font-mono font-bold';
    return 'text-zinc-400 font-mono font-bold';
  };

  // Growth Icon Helper
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp size={12} className="inline shrink-0" />;
    if (growth < 0) return <TrendingDown size={12} className="inline shrink-0" />;
    return <Minus size={12} className="inline shrink-0" />;
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch w-full min-w-0 animate-in fade-in duration-300"
      role="list"
      aria-label="Province-wise revenue breakdown list"
    >
      {provinces.map((p) => {
        const growthColor = getGrowthColor(p.growth);
        const growthIcon = getGrowthIcon(p.growth);

        return (
          <div
            key={p.province}
            className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between h-full min-w-0"
            role="listitem"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2.5 mb-2.5">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase text-xs flex items-center gap-1.5">
                  <Building2 size={14} className="text-brand-primary shrink-0" />
                  {p.province}
                </span>
                <span className="text-xs font-mono font-bold text-brand-primary">
                  Rs. {(p.revenue || 0).toLocaleString('en-PK')}
                </span>
              </div>

              {/* Stats Bar */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                <span>{p.cities} Active Cities</span>
                <span className={p.rtoRate > 15 ? 'text-red-500 font-bold' : p.rtoRate > 8 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                  RTO: {p.rtoRate}%
                </span>
                <span className={`flex items-center gap-1 ${growthColor}`}>
                  {p.growth}% {growthIcon}
                </span>
              </div>
            </div>

            {/* Top Cities Chips */}
            <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[8px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 block mb-1.5">
                Top Regional Hubs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {p.topCities.map((c) => (
                  <span
                    key={c}
                    className="text-[9px] font-mono font-bold bg-white dark:bg-zinc-950 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}