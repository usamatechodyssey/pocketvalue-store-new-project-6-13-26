
// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialDashboardWidget.tsx (FULLY PKR-LOCALIZED & LOCKED)

"use client";

import Link from 'next/link';
import { MapPin, ArrowRight, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { GeospatialCityData } from '../actions/getGeospatialIntelligence';

interface Props {
  cities: GeospatialCityData[];
}

export default function GeospatialDashboardWidget({ cities }: Props) {
  // ✅ ENTERPRISE FIX: Enhanced Empty State
  if (!cities || cities.length === 0) {
    return (
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col items-center justify-center gap-3 text-center"
        role="status"
        aria-label="No geospatial data available"
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <AlertCircle size={24} className="text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          No Geospatial Data
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          No orders with valid city data found in this period.
        </p>
      </div>
    );
  }

  // ✅ Slices only the top 5 performing cities for widget display
  const top5 = cities.slice(0, 5);

  return (
    <div
      className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col transition-all hover:shadow-xl"
      role="region"
      aria-label="Top 5 performing cities by revenue"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <MapPin className="text-brand-primary" size={20} aria-hidden="true" />
          Territory Pulse
        </h3>
        <Link
          href="/admin/geospatial-intelligence" // ✅ Matches Payload CMS Custom View Path exactly
          className="text-[10px] font-black text-brand-primary hover:underline flex items-center gap-1 transition-all hover:gap-2"
          aria-label="View full geospatial intelligence map"
        >
          Full Map <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {/* LIST */}
      <div className="space-y-3 flex-1" role="list">
        {top5.map((item) => {
          // Trend Icon Helper based on growth data
          const renderTrendIcon = () => {
            if (item.trend === 'STAR') {
              return <TrendingUp size={12} className="text-green-500" aria-label="Trending up" />;
            }
            if (item.trend === 'FALLING') {
              return <TrendingDown size={12} className="text-red-500" aria-label="Trending down" />;
            }
            return <Minus size={12} className="text-gray-400" aria-label="Stable trend" />;
          };

          return (
            <div
              key={item.city}
              className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              role="listitem"
              aria-label={`${item.city}: Revenue ${item.revenue.toLocaleString('en-PK')}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold dark:text-white uppercase">{item.city}</span>
                {renderTrendIcon()}
              </div>
              <span className="text-xs font-black text-brand-primary font-mono">
                Rs. {item.revenue.toLocaleString('en-PK')} {/* ✅ Localized en-PK formatting */}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}