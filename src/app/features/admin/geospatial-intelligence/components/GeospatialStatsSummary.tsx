// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialStatsSummary.tsx

"use client";


import { Banknote, MapPin, ShoppingBag, Award, Building2 } from 'lucide-react';

// ================================================================
// ✅ FLEXIBLE PROPS INTERFACE (Supports both object & flat props)
// ================================================================
interface GeospatialStatsSummaryProps {
  summary?: {
    totalRevenue: number;
    totalOrders: number;
    totalCities: number;
    totalProvinces?: number;
    topCity: string;
    topProvince: string;
  };
  totalRevenue?: number;
  totalOrders?: number;
  totalCities?: number;
  topCity?: string;
  topProvince?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function GeospatialStatsSummary(props: GeospatialStatsSummaryProps) {
  // ✅ Safe extraction with fallback defaults
  const totalRevenue = props.summary?.totalRevenue ?? props.totalRevenue ?? 0;
  const totalOrders = props.summary?.totalOrders ?? props.totalOrders ?? 0;
  const totalCities = props.summary?.totalCities ?? props.totalCities ?? 0;
  const topCity = props.summary?.topCity ?? props.topCity ?? 'N/A';
  const topProvince = props.summary?.topProvince ?? props.topProvince ?? 'N/A';

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full min-w-0"
      role="region"
      aria-label="Geospatial summary statistics: total revenue, orders, cities, top city, and top province"
    >
      {/* 1. Revenue Card */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
            Total Revenue
          </p>
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <Banknote size={16} />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none truncate">
            Rs. {totalRevenue.toLocaleString('en-PK')}
          </p>
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            Valid Sales Volume
          </p>
        </div>
      </div>

      {/* 2. Orders Card */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
            Total Orders
          </p>
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
            <ShoppingBag size={16} />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none truncate">
            {totalOrders.toLocaleString('en-PK')}
          </p>
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            Regional Orders
          </p>
        </div>
      </div>

      {/* 3. Cities Card */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
            Active Cities
          </p>
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
            <MapPin size={16} />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none truncate">
            {totalCities.toLocaleString('en-PK')}
          </p>
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 truncate">
            Demand Nodes
          </p>
        </div>
      </div>

      {/* 4. Top City Card */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
            Top City
          </p>
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0">
            <Award size={16} />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <p className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight truncate" title={topCity}>
            {topCity || 'N/A'}
          </p>
          <p className="text-[9px] font-mono text-purple-500 font-bold mt-1 truncate">
            Revenue Leader
          </p>
        </div>
      </div>

      {/* 5. Top Province Card */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
            Top Province
          </p>
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 shrink-0">
            <Building2 size={16} />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <p className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight truncate" title={topProvince}>
            {topProvince || 'N/A'}
          </p>
          <p className="text-[9px] font-mono text-indigo-500 font-bold mt-1 truncate">
            Primary Hub
          </p>
        </div>
      </div>
    </div>
  );
}