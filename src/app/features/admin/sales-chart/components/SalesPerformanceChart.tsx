
// // 📂 src/app/features/admin/analytics-telemetry/components/SalesPerformanceChart.tsx (PERMANENTLY WARNING-FREE RECHARTS FIX)

// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
// import { ComparativeChartPoint } from "@/app/features/admin/sales-chart/actions/getSalesChartData";

// // ✅ ENTERPRISE FIX: Strict Tooltip Payload Type
// interface TooltipPayloadItem {
//   payload: ComparativeChartPoint;
//   value: number;
//   dataKey: string;
// }

// interface CustomTooltipProps {
//   active?: boolean;
//   payload?: TooltipPayloadItem[];
//   label?: string;
//   activeMetric: 'revenue' | 'orders';
//   isCompareActive: boolean;
// }

// // --- ENTERPRISE TOOLTIP (with null safety & PKR formatting) ---
// const CustomTooltip = ({ active, payload, activeMetric, isCompareActive }: CustomTooltipProps) => {
//   if (active && payload && payload.length > 0) {
//     const dataPoint = payload[0]?.payload;
//     if (!dataPoint) return null;

//     const currentVal = activeMetric === 'revenue' ? dataPoint.revenue : dataPoint.orders;
//     const compareVal = activeMetric === 'revenue' ? dataPoint.compareRevenue : dataPoint.compareOrders;

//     // ✅ PKR en-PK Localized Currency Formatting
//     const formattedCurrent = activeMetric === 'revenue' 
//       ? `Rs. ${currentVal.toLocaleString('en-PK')}` 
//       : `${currentVal} Orders`;

//     const formattedCompare = activeMetric === 'revenue' 
//       ? `Rs. ${compareVal.toLocaleString('en-PK')}` 
//       : `${compareVal} Orders`;

//     const delta = compareVal > 0 ? ((currentVal - compareVal) / compareVal) * 100 : 0;

//     return (
//       <div 
//         className="bg-black/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-2xl backdrop-blur-md z-50 min-w-64 animate-in fade-in zoom-in-95 duration-100"
//         role="tooltip"
//         aria-label={`Tooltip: ${dataPoint.currentLabel}`}
//       >
//         <p className="text-zinc-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em] border-b border-zinc-200 dark:border-zinc-800 pb-2">
//           {dataPoint.currentLabel} {isCompareActive && `vs ${dataPoint.compareLabel}`}
//         </p>
        
//         <div className="space-y-4">
//           <div className="flex justify-between items-center gap-6">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_#f97316]"></div>
//               <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Period</span>
//             </div>
//             <span className="text-zinc-900 dark:text-white font-black text-base tracking-tight">{formattedCurrent}</span>
//           </div>

//           {isCompareActive && (
//             <>
//               <div className="flex justify-between items-center gap-6">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border border-dashed"></div>
//                   <span className="text-[10px] font-bold text-zinc-500 uppercase">Previous Period</span>
//                 </div>
//                 <span className="text-zinc-600 dark:text-zinc-400 font-black text-sm tracking-tight">{formattedCompare}</span>
//               </div>

//               <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between items-center">
//                 <span className="text-[10px] font-bold text-zinc-500 uppercase">Growth Delta</span>
//                 <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${
//                   delta > 0 
//                     ? 'bg-green-500/10 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.1)]' 
//                     : delta < 0 
//                       ? 'bg-red-500/10 text-red-500' 
//                       : 'bg-zinc-100 text-zinc-400'
//                 }`}>
//                   {delta > 0 ? <TrendingUp size={10}/> : delta < 0 ? <TrendingDown size={10}/> : <Minus size={10}/>}
//                   {Math.abs(delta).toFixed(1)}%
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }
//   return null;
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function SalesPerformanceChart({ data }: { data: ComparativeChartPoint[] }) {
//   const searchParams = useSearchParams();
//   const [mounted, setMounted] = useState(false);
//   const [containerReady, setContainerReady] = useState(false);
//   const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
//   const containerRef = useRef<HTMLDivElement>(null);

//   const isCompareActive = searchParams.get('compare') === 'true';

//   // ✅ ENTERPRISE FIX: Ensure DOM container size is fully calculated before rendering Recharts
//   useEffect(() => {
//     setMounted(true);
//     const checkContainerSize = () => {
//       if (containerRef.current && containerRef.current.clientWidth > 0) {
//         setContainerReady(true);
//       } else {
//         requestAnimationFrame(checkContainerSize);
//       }
//     };
//     checkContainerSize();
//   }, []);

//   // ✅ ENTERPRISE FIX: Empty Data Fallback
//   if (!mounted) {
//     return <div className="h-112.5 w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl animate-pulse border dark:border-white/5" />;
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="bg-white dark:bg-[#050505] p-6 md:p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-2xl h-full min-h-112.5 flex flex-col items-center justify-center">
//         <BarChart3 size={48} className="text-zinc-400 opacity-20 mb-4" />
//         <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No sales data available for this period.</p>
//         <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Try adjusting your date range.</p>
//       </div>
//     );
//   }

//   // ✅ ENTERPRISE FIX: Robust Hourly Detection (check if labels contain AM/PM)
//   const isHourlyView = data.some(point => point.currentLabel.includes('AM') || point.currentLabel.includes('PM'));

//   return (
//     <div 
//       className="bg-white dark:bg-[#050505] p-6 md:p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-2xl h-full min-h-112.5 flex flex-col group overflow-hidden"
//       role="img"
//       aria-label="Sales performance chart showing revenue and order volume trends"
//     >
      
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
//         <div>
//           <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none italic">
//             Sales Velocity Engine
//           </h3>
//           <p className="text-xs text-zinc-400 font-bold mt-2 uppercase tracking-widest opacity-60">Real-time Performance Monitoring</p>
//         </div>

//         <div className="flex bg-zinc-50 dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/10" role="group" aria-label="Metric toggle">
//           <button
//             onClick={() => setActiveMetric('revenue')}
//             className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
//               activeMetric === 'revenue' 
//                 ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-primary' 
//                 : 'text-zinc-400 hover:text-zinc-600'
//             }`}
//             aria-pressed={activeMetric === 'revenue'}
//             aria-label="Show revenue data"
//           >
//             Revenue
//           </button>
//           <button
//             onClick={() => setActiveMetric('orders')}
//             className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
//               activeMetric === 'orders' 
//                 ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-500' 
//                 : 'text-zinc-400 hover:text-zinc-600'
//             }`}
//             aria-pressed={activeMetric === 'orders'}
//             aria-label="Show order volume data"
//           >
//             Volume
//           </button>
//         </div>
//       </div>

//       {/* ✅ ENTERPRISE FIX: Container Ref + Explicit numeric height eliminates Recharts width(-1)/height(-1) warnings permanently */}
//       <div ref={containerRef} className="flex-1 w-full min-w-0 h-80 relative pr-4">
//         {containerReady && (
//           <ResponsiveContainer width="100%" height={320}>
//             <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="glowRev" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor={activeMetric === 'revenue' ? "var(--brand-primary)" : "#3b82f6"} stopOpacity={0.25}/>
//                   <stop offset="95%" stopColor={activeMetric === 'revenue' ? "var(--brand-primary)" : "#3b82f6"} stopOpacity={0}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#1f2937" opacity={0.15} />
              
//               <XAxis 
//                 dataKey="dayIndex" 
//                 axisLine={false} 
//                 tickLine={false} 
//                 tick={{ fill: '#71717a', fontSize: 10, fontWeight: '900' }} 
//                 dy={15}
//                 tickFormatter={(index) => {
//                   const point = data[index];
//                   if (!point) return '';
//                   if (isHourlyView) {
//                     return index % 4 === 0 ? point.currentLabel : '';
//                   }
//                   return point.currentLabel;
//                 }}
//               />
//               <YAxis hide domain={['auto', 'dataMax + 100']} />
              
//               <Tooltip 
//                 content={<CustomTooltip activeMetric={activeMetric} isCompareActive={isCompareActive} />} 
//                 cursor={{ stroke: '#ffffff15', strokeWidth: 2 }}
//               />

//               <Area 
//                 type="monotone" 
//                 dataKey={activeMetric} 
//                 stroke={activeMetric === 'revenue' ? "var(--brand-primary)" : "#3b82f6"} 
//                 strokeWidth={4.5} 
//                 fillOpacity={1} 
//                 fill="url(#glowRev)" 
//                 animationDuration={1500}
//                 activeDot={{ r: 7, strokeWidth: 0, fill: activeMetric === 'revenue' ? "var(--brand-primary)" : "#3b82f6" }}
//               />

//               {isCompareActive && (
//                 <Area 
//                   type="monotone" 
//                   dataKey={activeMetric === 'revenue' ? 'compareRevenue' : 'compareOrders'} 
//                   stroke="#71717a" 
//                   strokeWidth={3} 
//                   strokeDasharray="6 6" 
//                   fillOpacity={0} 
//                   animationDuration={2000}
//                   activeDot={{ r: 5, strokeWidth: 0, fill: "#71717a" }}
//                 />
//               )}
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/analytics-telemetry/components/SalesPerformanceChart.tsx (PERMANENTLY WARNING-FREE RECHARTS FIX)

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { ComparativeChartPoint } from "@/app/features/admin/sales-chart/actions/getSalesChartData";

// ✅ ENTERPRISE FIX: Strict Tooltip Payload Type
interface TooltipPayloadItem {
  payload: ComparativeChartPoint;
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  activeMetric: 'revenue' | 'orders';
  isCompareActive: boolean;
}

// --- ENTERPRISE TOOLTIP (With null safety & PKR formatting) ---
const CustomTooltip = ({ active, payload, activeMetric, isCompareActive }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const currentVal = activeMetric === 'revenue' ? (dataPoint.revenue || 0) : (dataPoint.orders || 0);
    const compareVal = activeMetric === 'revenue' ? (dataPoint.compareRevenue || 0) : (dataPoint.compareOrders || 0);

    // ✅ PKR en-PK Localized Currency Formatting
    const formattedCurrent = activeMetric === 'revenue' 
      ? `Rs. ${currentVal.toLocaleString('en-PK')}` 
      : `${currentVal.toLocaleString('en-PK')} Orders`;

    const formattedCompare = activeMetric === 'revenue' 
      ? `Rs. ${compareVal.toLocaleString('en-PK')}` 
      : `${compareVal.toLocaleString('en-PK')} Orders`;

    const delta = compareVal > 0 ? ((currentVal - compareVal) / compareVal) * 100 : 0;

    return (
      <div 
        className="bg-zinc-950/95 dark:bg-black/95 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-50 min-w-60 animate-in fade-in zoom-in-95 duration-100"
        role="tooltip"
        aria-label={`Tooltip: ${dataPoint.currentLabel}`}
      >
        <p className="text-zinc-400 text-[10px] font-mono font-bold uppercase mb-3 tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {dataPoint.currentLabel} {isCompareActive && `vs ${dataPoint.compareLabel}`}
        </p>
        
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]"></div>
              <span className="text-[10px] text-zinc-400 uppercase">Current Period</span>
            </div>
            <span className="text-zinc-900 dark:text-white font-bold">{formattedCurrent}</span>
          </div>

          {isCompareActive && (
            <>
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 border border-dashed"></div>
                  <span className="text-[10px] text-zinc-400 uppercase">Previous Period</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">{formattedCompare}</span>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2.5 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase">Growth Delta</span>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  delta > 0 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : delta < 0 
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {delta > 0 ? <TrendingUp size={10}/> : delta < 0 ? <TrendingDown size={10}/> : <Minus size={10}/>}
                  {Math.abs(delta).toFixed(1)}%
                </div>
              </div>
            </>
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
export default function SalesPerformanceChart({ data }: { data: ComparativeChartPoint[] }) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const containerRef = useRef<HTMLDivElement>(null);

  const isCompareActive = searchParams.get('compare') === 'true';

  // ✅ ENSURE DOM CONTAINER CALCULATION
  useEffect(() => {
    setMounted(true);
    const checkContainerSize = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerReady(true);
      } else {
        requestAnimationFrame(checkContainerSize);
      }
    };
    checkContainerSize();
  }, []);

  if (!mounted) {
    return <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75">
        <BarChart3 size={36} className="text-zinc-400 opacity-40 mb-3" />
        <p className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">No Sales Data Available</p>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">Try selecting a different date range or period.</p>
      </div>
    );
  }

  const isHourlyView = data.some(point => point.currentLabel?.includes('AM') || point.currentLabel?.includes('PM'));

  // ✅ EXPLICIT NEON HEX COLORS (Fixes SVG CSS Variable Dark Mode Failure)
  const strokeColor = activeMetric === 'revenue' ? "#f97316" : "#3b82f6";

  return (
    <div 
      className="space-y-6 w-full min-w-0 flex flex-col justify-between animate-in fade-in duration-300"
      role="img"
      aria-label="Sales performance chart showing revenue and order volume trends"
    >
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
            REAL-TIME VELOCITY TRAJECTORY
          </span>
        </div>

        {/* Metric Toggle Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800" role="group">
          <button
            onClick={() => setActiveMetric('revenue')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMetric === 'revenue' 
                ? 'bg-white dark:bg-zinc-800 shadow-xs text-[#f97316]' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            aria-pressed={activeMetric === 'revenue'}
          >
            Revenue (PKR)
          </button>
          <button
            onClick={() => setActiveMetric('orders')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMetric === 'orders' 
                ? 'bg-white dark:bg-zinc-800 shadow-xs text-blue-500' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            aria-pressed={activeMetric === 'orders'}
          >
            Volume (Orders)
          </button>
        </div>
      </div>

      {/* Chart Canvas Wrapper */}
      <div ref={containerRef} className="w-full min-w-0 h-80 relative pr-2">
        {containerReady && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="glowRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              
              <XAxis 
                dataKey="dayIndex" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: '700', fontFamily: 'monospace' }} 
                dy={10}
                tickFormatter={(index) => {
                  const point = data[index];
                  if (!point) return '';
                  if (isHourlyView) {
                    return index % 4 === 0 ? point.currentLabel : '';
                  }
                  return point.currentLabel;
                }}
              />
              
              {/* ✅ Dynamic YAxis Scaling (Fixes Flat Bottom Scale Bug) */}
              <YAxis 
                hide 
                domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.2) : 10)]} 
              />
              
              <Tooltip 
                content={<CustomTooltip activeMetric={activeMetric} isCompareActive={isCompareActive} />} 
                cursor={{ stroke: '#f9731640', strokeWidth: 2, strokeDasharray: '4 4' }}
              />

              {/* ✅ Bright High-Visibility Neon Stroke */}
              <Area 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={strokeColor} 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#glowRev)" 
                animationDuration={1200}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff', fill: strokeColor }}
              />

              {isCompareActive && (
                <Area 
                  type="monotone" 
                  dataKey={activeMetric === 'revenue' ? 'compareRevenue' : 'compareOrders'} 
                  stroke="#71717a" 
                  strokeWidth={2.5} 
                  strokeDasharray="6 6" 
                  fillOpacity={0} 
                  animationDuration={1500}
                  activeDot={{ r: 5, strokeWidth: 1, stroke: '#ffffff', fill: "#71717a" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}