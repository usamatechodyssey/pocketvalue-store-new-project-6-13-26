// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialDashboardWidget.tsx

"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { GeospatialCityData } from '../actions/getGeospatialIntelligence';

interface Props {
  cities: GeospatialCityData[];
}

export default function GeospatialDashboardWidget({ cities }: Props) {
  // Max revenue calculation for progress fill bars
  const maxRevenue = useMemo(() => {
    if (!cities || cities.length === 0) return 1;
    return Math.max(...cities.map((c) => c.revenue || 0), 1);
  }, [cities]);

  // Top 5 performing cities slice
  const top5 = useMemo(() => {
    if (!cities || cities.length === 0) return [];
    return cities.slice(0, 5);
  }, [cities]);

  // Empty State
  if (!cities || cities.length === 0) {
    return (
      <div
        className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden"
        role="region"
        aria-label="No geospatial data available"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <MapPin className="text-brand-primary" size={20} /> Territory Pulse
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time Regional Order Performance
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">
              No Territory Data
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans">
              No orders with valid location data found in this timeframe.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/geospatial-intelligence"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            Open Full Map <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Top 5 performing cities by revenue"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <MapPin className="text-brand-primary" size={20} /> Territory Pulse
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time Regional Order Performance
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          TOP 5 CITIES
        </span>
      </div>

      {/* HIGH-DENSITY CITY BREAKDOWN LIST WITH PROGRESS BARS */}
      <div className="space-y-2.5 my-2 flex-1" role="list">
        {top5.map((item) => {
          const shareOfTop = maxRevenue > 0 ? Number(((item.revenue / maxRevenue) * 100).toFixed(0)) : 0;

          const renderTrendIcon = () => {
            if (item.trend === 'STAR') {
              return <TrendingUp size={11} className="text-emerald-500 shrink-0" aria-label="Trending up" />;
            }
            if (item.trend === 'FALLING') {
              return <TrendingDown size={11} className="text-rose-500 shrink-0" aria-label="Trending down" />;
            }
            return <Minus size={11} className="text-zinc-400 shrink-0" aria-label="Stable trend" />;
          };

          return (
            <div
              key={item.city}
              className="relative overflow-hidden p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs group/row hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              role="listitem"
            >
              {/* Subtle Progress Fill Background */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-brand-primary/10 dark:bg-brand-primary/15 opacity-80 pointer-events-none transition-all duration-500 rounded-2xl" 
                style={{ width: `${shareOfTop}%` }} 
              />

              {/* City Name & Badges */}
              <div className="flex items-center gap-2 min-w-0 relative z-10 flex-wrap">
                <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs truncate">
                  {item.city}
                </span>
                <span className="text-[8px] font-mono font-bold text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300/40 dark:border-zinc-700/50">
                  {item.province}
                </span>
                {renderTrendIcon()}
                {item.isHighPotential && (
                  <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    🔥 HIGH POTENTIAL
                  </span>
                )}
              </div>

              {/* Revenue & Orders */}
              <div className="flex items-center gap-3 shrink-0 relative z-10 font-mono">
                <span className="text-[9px] text-zinc-400 font-bold">{item.orders} Orders</span>
                <span className="font-mono font-black text-brand-primary text-xs">
                  Rs. {item.revenue.toLocaleString('en-PK')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER LINK (Matching Zone 2 Cards) */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/admin/geospatial-intelligence"
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Open Full Map <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}