// // 📂 src/app/features/admin/analytics-telemetry/components/SalesPerformanceChart.tsx (FULLY LOCALIZED & HIGH-CONTRAST TOOLTIP FIX)

// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
// import { ComparativeChartPoint } from "@/app/features/admin/sales-chart/actions/getSalesChartData";

// // ================================================================
// // ✅ TYPES
// // ================================================================
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

// // ================================================================
// // 🎨 HIGH-CONTRAST TOOLTIP (Text Locked to Pure White)
// // ================================================================
// const CustomTooltip = ({ active, payload, activeMetric, isCompareActive }: CustomTooltipProps) => {
//   if (active && payload && payload.length > 0) {
//     const dataPoint = payload[0]?.payload;
//     if (!dataPoint) return null;

//     const currentVal = activeMetric === 'revenue' ? (dataPoint.revenue || 0) : (dataPoint.orders || 0);
//     const compareVal = activeMetric === 'revenue' ? (dataPoint.compareRevenue || 0) : (dataPoint.compareOrders || 0);

//     // ✅ Localized PKR Formatting
//     const formattedCurrent = activeMetric === 'revenue' 
//       ? `Rs. ${currentVal.toLocaleString('en-PK')}` 
//       : `${currentVal.toLocaleString('en-PK')} Orders`;

//     const formattedCompare = activeMetric === 'revenue' 
//       ? `Rs. ${compareVal.toLocaleString('en-PK')}` 
//       : `${compareVal.toLocaleString('en-PK')} Orders`;

//     const delta = compareVal > 0 ? ((currentVal - compareVal) / compareVal) * 100 : 0;

//     return (
//       <div 
//         className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-50 min-w-60 animate-in fade-in zoom-in-95 duration-100"
//         role="tooltip"
//         aria-label={`Tooltip: ${dataPoint.currentLabel}`}
//       >
//         <p className="text-zinc-400 text-[10px] font-mono font-bold uppercase mb-3 tracking-widest border-b border-zinc-800 pb-2">
//           {dataPoint.currentLabel} {isCompareActive && `vs ${dataPoint.compareLabel}`}
//         </p>
        
//         <div className="space-y-3 font-mono text-xs">
//           {/* Current Period Row */}
//           <div className="flex justify-between items-center gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_10px_#f97316]"></div>
//               <span className="text-[10px] text-zinc-400 uppercase">Current Period</span>
//             </div>
//             {/* ✅ HIGH CONTRAST FIX: Text is locked to pure white (text-white) */}
//             <span className="text-white font-bold text-sm tracking-tight">{formattedCurrent}</span>
//           </div>

//           {/* Previous Period Comparison Row */}
//           {isCompareActive && (
//             <>
//               <div className="flex justify-between items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 border border-dashed"></div>
//                   <span className="text-[10px] text-zinc-400 uppercase">Previous Period</span>
//                 </div>
//                 <span className="text-zinc-400 font-bold text-xs tracking-tight">{formattedCompare}</span>
//               </div>

//               <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center">
//                 <span className="text-[10px] text-zinc-400 uppercase">Growth Delta</span>
//                 <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
//                   delta > 0 
//                     ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
//                     : delta < 0 
//                       ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
//                       : 'bg-zinc-800 text-zinc-400'
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
// // 🚀 MAIN CHART COMPONENT
// // ================================================================
// export default function SalesPerformanceChart({ data }: { data: ComparativeChartPoint[] }) {
//   const searchParams = useSearchParams();
//   const [mounted, setMounted] = useState(false);
//   const [containerReady, setContainerReady] = useState(false);
//   const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
//   const containerRef = useRef<HTMLDivElement>(null);

//   const isCompareActive = searchParams.get('compare') === 'true';

//   // Ensure DOM container size calculation
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

//   if (!mounted) {
//     return <div className="h-80 w-full bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse" />;
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75">
//         <BarChart3 size={36} className="text-zinc-400 opacity-40 mb-3" />
//         <p className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">No Sales Data Available</p>
//         <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">Try selecting a different date range or period.</p>
//       </div>
//     );
//   }

//   const isHourlyView = data.some(point => point.currentLabel?.includes('AM') || point.currentLabel?.includes('PM'));

//   // ✅ EXPLICIT NEON HEX COLORS (Fixes SVG CSS Variable Failures)
//   const strokeColor = activeMetric === 'revenue' ? "#f97316" : "#3b82f6";

//   return (
//     <div 
//       className="space-y-6 w-full min-w-0 flex flex-col justify-between animate-in fade-in duration-300"
//       role="img"
//       aria-label="Sales performance chart showing revenue and order volume trends"
//     >
//       {/* Top Controls Bar */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
//         <div>
//           <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//             REAL-TIME VELOCITY TRAJECTORY
//           </span>
//         </div>

//         {/* Metric Toggle Tabs */}
//         <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800" role="group">
//           <button
//             onClick={() => setActiveMetric('revenue')}
//             className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
//               activeMetric === 'revenue' 
//                 ? 'bg-white dark:bg-zinc-800 shadow-xs text-brand-primary' 
//                 : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
//             }`}
//             aria-pressed={activeMetric === 'revenue'}
//           >
//             Revenue (PKR)
//           </button>
//           <button
//             onClick={() => setActiveMetric('orders')}
//             className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
//               activeMetric === 'orders' 
//                 ? 'bg-white dark:bg-zinc-800 shadow-xs text-blue-500' 
//                 : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
//             }`}
//             aria-pressed={activeMetric === 'orders'}
//           >
//             Volume (Orders)
//           </button>
//         </div>
//       </div>

//       {/* Chart Canvas Wrapper */}
//       <div ref={containerRef} className="w-full min-w-0 h-80 relative pr-2">
//         {containerReady && (
//           <ResponsiveContainer width="100%" height={320}>
//             <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
//               <defs>
//                 <linearGradient id="glowRev" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
//                   <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0}/>
//                 </linearGradient>
//               </defs>
              
//               <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" opacity={0.4} />
              
//               <XAxis 
//                 dataKey="dayIndex" 
//                 axisLine={false} 
//                 tickLine={false} 
//                 tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: '700', fontFamily: 'monospace' }} 
//                 dy={10}
//                 tickFormatter={(index) => {
//                   const point = data[index];
//                   if (!point) return '';
//                   if (isHourlyView) {
//                     return index % 4 === 0 ? point.currentLabel : '';
//                   }
//                   return point.currentLabel;
//                 }}
//               />
              
//               <YAxis 
//                 hide 
//                 domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.25) : 10)]} 
//               />
              
//               <Tooltip 
//                 content={<CustomTooltip activeMetric={activeMetric} isCompareActive={isCompareActive} />} 
//                 cursor={{ stroke: '#f9731640', strokeWidth: 2, strokeDasharray: '4 4' }}
//               />

//               {/* Neon Glow Area Curve */}
//               <Area 
//                 type="monotone" 
//                 dataKey={activeMetric} 
//                 stroke={strokeColor} 
//                 strokeWidth={4} 
//                 fillOpacity={1} 
//                 fill="url(#glowRev)" 
//                 animationDuration={1200}
//                 activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff', fill: strokeColor }}
//               />

//               {isCompareActive && (
//                 <Area 
//                   type="monotone" 
//                   dataKey={activeMetric === 'revenue' ? 'compareRevenue' : 'compareOrders'} 
//                   stroke="#71717a" 
//                   strokeWidth={2.5} 
//                   strokeDasharray="6 6" 
//                   fillOpacity={0} 
//                   animationDuration={1500}
//                   activeDot={{ r: 5, strokeWidth: 1, stroke: '#ffffff', fill: "#71717a" }}
//                 />
//               )}
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/analytics-telemetry/components/SalesPerformanceChart.tsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, HelpCircle } from 'lucide-react';
import { ComparativeChartPoint } from "@/app/features/admin/sales-chart/actions/getSalesChartData";

// ================================================================
// ✅ TYPES
// ================================================================
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

// ================================================================
// 🎨 HIGH-CONTRAST TOOLTIP (Cyberpunk Inspired Glassmorphic Box)
// ================================================================
const CustomTooltip = ({ active, payload, activeMetric, isCompareActive }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const currentVal = activeMetric === 'revenue' ? (dataPoint.revenue || 0) : (dataPoint.orders || 0);
    const compareVal = activeMetric === 'revenue' ? (dataPoint.compareRevenue || 0) : (dataPoint.compareOrders || 0);

    const formattedCurrent = activeMetric === 'revenue' 
      ? `Rs. ${currentVal.toLocaleString('en-PK')}` 
      : `${currentVal.toLocaleString('en-PK')} Orders`;

    const formattedCompare = activeMetric === 'revenue' 
      ? `Rs. ${compareVal.toLocaleString('en-PK')}` 
      : `${compareVal.toLocaleString('en-PK')} Orders`;

    const delta = compareVal > 0 ? ((currentVal - compareVal) / compareVal) * 100 : 0;

    return (
      <div 
        className="bg-zinc-950/95 border border-zinc-800/80 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 min-w-64 animate-in fade-in zoom-in-95 duration-100"
        role="tooltip"
      >
        <p className="text-zinc-500 text-[10px] font-mono font-black uppercase mb-3 tracking-widest border-b border-zinc-800 pb-2">
          {dataPoint.currentLabel} {isCompareActive && `vs ${dataPoint.compareLabel}`}
        </p>
        
        <div className="space-y-3 font-mono text-xs">
          {/* Current Period Row */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_#f97316]"></div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Current</span>
            </div>
            <span className="text-white font-black text-sm tracking-tight">{formattedCurrent}</span>
          </div>

          {/* Previous Period Comparison Row */}
          {isCompareActive && (
            <>
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-600 border border-dashed"></div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Previous</span>
                </div>
                <span className="text-zinc-400 font-bold text-xs tracking-tight">{formattedCompare}</span>
              </div>

              <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Growth Delta</span>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  delta > 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : delta < 0 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-zinc-800 text-zinc-400'
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
// 🚀 MAIN CHART COMPONENT (Spectacular HUD Redesign)
// ================================================================
export default function SalesPerformanceChart({ data }: { data: ComparativeChartPoint[] }) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');
  const containerRef = useRef<HTMLDivElement>(null);

  const isCompareActive = searchParams.get('compare') === 'true';

  useEffect(() => {
    setMounted(true);
    const checkSize = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerReady(true);
      } else {
        requestAnimationFrame(checkSize);
      }
    };
    checkSize();
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-80">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 dark:text-zinc-600 mb-3 border border-zinc-200 dark:border-zinc-800">
          <BarChart3 size={32} />
        </div>
        <p className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">NO TELEMETRY SIGNALS</p>
        <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
          No transactions detected in the active date scope. Select a broader interval.
        </p>
      </div>
    );
  }

  const isHourlyView = data.some(point => point.currentLabel?.includes('AM') || point.currentLabel?.includes('PM'));

  // Define Neon Theme Elements
  const themeColor = activeMetric === 'revenue' ? "#FF8F32" : "#3b82f6";
  const glowColor = activeMetric === 'revenue' ? "#f97316" : "#2563eb";

  return (
    <div 
      className="space-y-6 w-full min-w-0 flex flex-col justify-between"
      role="img"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest w-fit">
              REAL-TIME VELOCITY TRAJECTORY
            </span>
          </div>
        </div>

        {/* Tab Selector Button Grid */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800" role="group">
          <button
            onClick={() => setActiveMetric('revenue')}
            className={`px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMetric === 'revenue' 
                ? 'bg-white dark:bg-zinc-800 shadow-xs text-brand-primary border border-zinc-200/50 dark:border-zinc-700/50' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Revenue (PKR)
          </button>
          <button
            onClick={() => setActiveMetric('orders')}
            className={`px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMetric === 'orders' 
                ? 'bg-white dark:bg-zinc-800 shadow-xs text-blue-500 border border-zinc-200/50 dark:border-zinc-700/50' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Orders Volume
          </button>
        </div>
      </div>

      {/* Cybernetic Radial Aura Backdrop behind Chart */}
      <div className="relative w-full overflow-hidden">
        {/* Glowing Ambient Backdrop Aura (Pure CSS Glow) */}
        <div 
          className="absolute -top-12 left-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: glowColor }}
        />

        {/* ✅ FIX: Inline explicit height style + min-h prevents hydration -1 measurement warnings */}
        <div 
          ref={containerRef} 
          className="w-full relative pr-2 min-h-85" 
          style={{ height: '340px', width: '100%' }}
        >
          {containerReady && (
            /* ✅ FIX: Added minWidth={0} to bypass Recharts grid container flex issues */
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Neon Glow SVG Filter (The Crown Jewel) */}
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradient Area Fill */}
                  <linearGradient id="cyberAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                
                {/* Clean, low-opacity Gridlines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.25} />
                
                <XAxis 
                  dataKey="dayIndex" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: '700', fontFamily: 'monospace' }} 
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
                
                {/* Axis Capping & Defensive Padding to Avoid Clippings */}
                <YAxis 
                  hide 
                  domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.2) : 10)]} 
                />
                
                <Tooltip 
                  content={<CustomTooltip activeMetric={activeMetric} isCompareActive={isCompareActive} />} 
                  cursor={{ stroke: `${themeColor}30`, strokeWidth: 2, strokeDasharray: '3 3' }}
                />

                {/* Primary Neon-Glow Area Curve */}
                <Area 
                  type="monotone" 
                  dataKey={activeMetric} 
                  stroke={themeColor} 
                  strokeWidth={3} 
                  filter="url(#neonGlow)" /* Applied Neon Glow here */
                  fillOpacity={1} 
                  fill="url(#cyberAreaFill)" 
                  animationDuration={1200}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff', fill: themeColor }}
                />

                {/* Comparative Dotted Timeline (If Active) */}
                {isCompareActive && (
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric === 'revenue' ? 'compareRevenue' : 'compareOrders'} 
                    stroke="#52525b" 
                    strokeWidth={2} 
                    strokeDasharray="6 6" 
                    fillOpacity={0} 
                    animationDuration={1500}
                    activeDot={{ r: 4, strokeWidth: 1, stroke: '#ffffff', fill: "#52525b" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}