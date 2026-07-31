
// // 📂 src/app/features/admin/financial-surgery/components/PriceAnatomySurgeon.tsx (FULLY DYNAMIC SLIDER RANGE & TIER SIMULATOR)

// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Target,
//   TrendingUp,
//   Wallet,
//   BadgePercent,
//   Landmark,
//   Truck,
//   Calculator,
//   CheckCircle2,
//   Scale,
//   Receipt,
//   TrendingDown,
//   ArrowRight,
//   Clock,
//   Tag,
//   Package,
//   Sliders,
//   Sparkles,
//   Layers,
//   Activity,
// } from "lucide-react";
// import Link from "next/link";

// export interface FinancialSurgeonData {
//   originalPrice: number;
//   avgUnitCostPrice?: number;
//   totalItemsSold?: number;
//   adSpend: number;
//   platformFees: number;
//   taxes?: number;
//   duties?: number;
//   rtoLoss?: number;
//   shipping: number;
//   pureProfit: number;
//   grossTotal: number;
//   discounts?: number;
//   netRevenue?: number;
//   marginPercent: number;
//   roiPercent?: number;
//   generatedAt?: string;
//   pricingTiers?: Array<{ minCost: number; maxCost: number; profitPercent: number; adSpendPercent: number }>;
//   gstPercent?: number;
//   dutiesPercent?: number;
//   fixedFeePercent?: number;
// }

// interface PriceAnatomySurgeonProps {
//   data: FinancialSurgeonData | null;
//   isLoading?: boolean;
//   viewAllLink?: string;
// }

// const SankeyStream = ({ y2, color, opacity = 0.6 }: { y2: number; color: string; opacity?: number }) => {
//   const pathData = `M 40 160 C 180 160, 180 ${y2}, 320 ${y2}`;
//   return (
//     <path
//       d={pathData}
//       fill="none"
//       stroke={color}
//       strokeWidth="4"
//       strokeLinecap="round"
//       opacity={opacity}
//       className="transition-all duration-700 hover:opacity-100 hover:stroke-[6px]"
//     />
//   );
// };

// export default function PriceAnatomySurgeon({
//   data,
//   isLoading = false,
//   viewAllLink = "/admin/reports-index",
// }: PriceAnatomySurgeonProps) {
//   const [mounted, setMounted] = useState(false);
//   const [activeTab, setActiveView] = useState<"sankey" | "simulator" | "grid">("sankey");
//   const [simulatedPrice, setSimulatedPrice] = useState<number>(2500);

//   useEffect(() => {
//     setMounted(true);
//     if (data?.grossTotal) {
//       setSimulatedPrice(Math.round(data.grossTotal / (data.totalItemsSold || 1)));
//     }
//   }, [data]);

//   // ✅ DYNAMIC MAX SLIDER RANGE (Auto-expands based on highest Tier or 50,000 PKR default)
//   const dynamicMaxPrice = useMemo(() => {
//     if (data?.pricingTiers && data.pricingTiers.length > 0) {
//       const maxTierCost = Math.max(...data.pricingTiers.map((t) => t.maxCost));
//       return Math.max(50000, maxTierCost);
//     }
//     return 50000;
//   }, [data]);

//   // ✅ DYNAMIC SIMULATOR MATH (Matches Settings Tiers Live!)
//   const simulatedMath = useMemo(() => {
//     const sp = simulatedPrice || 1000;
    
//     let profitPercent = 25;
//     let adSpendPercent = 8;

//     if (data?.pricingTiers && data.pricingTiers.length > 0) {
//       const matchedTier = data.pricingTiers.find(
//         (t) => sp >= t.minCost && sp <= t.maxCost
//       );
//       if (matchedTier) {
//         profitPercent = matchedTier.profitPercent || 0;
//         adSpendPercent = matchedTier.adSpendPercent || 0;
//       } else {
//         profitPercent = data.pricingTiers[0]?.profitPercent || 0;
//         adSpendPercent = data.pricingTiers[0]?.adSpendPercent || 0;
//       }
//     }

//     const gstP = data?.gstPercent ?? 15;
//     const feesP = data?.fixedFeePercent ?? 3;
//     const dutiesP = data?.dutiesPercent ?? 5;

//     const gst = sp * (gstP / 100);
//     const fees = sp * (feesP / 100);
//     const ads = sp * (adSpendPercent / 100);
//     const profit = sp * (profitPercent / 100);
    
//     const leftover = sp - (gst + fees + ads + profit);
//     const capital = leftover / (1 + dutiesP / 100);

//     return {
//       sp,
//       gst: Math.round(gst),
//       fees: Math.round(fees),
//       ads: Math.round(ads),
//       profit: Math.round(profit),
//       capital: Math.round(capital),
//       profitPercent,
//       adSpendPercent,
//       margin: ((profit / sp) * 100).toFixed(1),
//     };
//   }, [simulatedPrice, data]);

//   if (!mounted || isLoading || !data) {
//     return (
//       <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl h-112.5 flex flex-col justify-center items-center animate-pulse">
//         <Activity size={40} className="text-brand-primary animate-spin mb-4" />
//         <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
//           Initializing Financial Surgery Engine...
//         </p>
//       </div>
//     );
//   }

//   const total = data.grossTotal || 1;
//   const dutiesValue = data.duties ?? 0;
//   const taxesValue = data.taxes ?? 0;
//   const rtoLossValue = data.rtoLoss ?? 0;
//   const discountsValue = data.discounts ?? 0;
//   const avgUnitCost = data.avgUnitCostPrice ?? 0;
//   const itemsCount = data.totalItemsSold ?? 0;

//   const costP = (data.originalPrice / total) * 100;
//   const dutiesP = (dutiesValue / total) * 100;
//   const taxesP = (taxesValue / total) * 100;
//   const feesP = (data.platformFees / total) * 100;
//   const adsP = (data.adSpend / total) * 100;
//   const shipP = (data.shipping / total) * 100;
//   const rtoP = (rtoLossValue / total) * 100;
//   const profitP = (data.pureProfit / total) * 100;

//   const totalAddedValueAndOperations =
//     data.pureProfit +
//     data.adSpend +
//     data.platformFees +
//     taxesValue +
//     data.shipping +
//     rtoLossValue +
//     dutiesValue +
//     discountsValue;

//   const grandTotalVerification = data.originalPrice + totalAddedValueAndOperations - discountsValue;

//   const barSegments = [
//     { percentage: costP, color: "bg-zinc-400 dark:bg-zinc-700", label: "Capital", value: data.originalPrice },
//     { percentage: dutiesP, color: "bg-indigo-500", label: "Duties", value: dutiesValue },
//     { percentage: taxesP, color: "bg-yellow-500", label: "Taxes", value: taxesValue },
//     { percentage: feesP, color: "bg-purple-500", label: "Fees", value: data.platformFees },
//     { percentage: adsP, color: "bg-blue-500", label: "Ads", value: data.adSpend },
//     { percentage: shipP, color: "bg-orange-500", label: "Shipping", value: data.shipping },
//     { percentage: rtoP, color: "bg-red-500", label: "RTO", value: rtoLossValue },
//     { percentage: profitP, color: "bg-green-500 relative", label: "Profit", value: data.pureProfit },
//   ];

//   return (
//     <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden">
//       <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
//         <div>
//           <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-3 italic text-zinc-900 dark:text-white">
//             <Target className="text-brand-primary animate-pulse" size={28} />
//             FINANCIAL SURGEON <span className="text-xs font-mono text-brand-primary not-italic">v3.0</span>
//           </h3>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
//             Target Costing, Flow Streams & Real-time Margin Anatomy
//           </p>
//         </div>

//         <div className="flex bg-zinc-100 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
//           <button
//             onClick={() => setActiveView("sankey")}
//             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
//               activeTab === "sankey"
//                 ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
//                 : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
//             }`}
//           >
//             <Layers size={14} /> Stream Flow
//           </button>
//           <button
//             onClick={() => setActiveView("simulator")}
//             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
//               activeTab === "simulator"
//                 ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
//                 : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
//             }`}
//           >
//             <Sliders size={14} /> Price Simulator
//           </button>
//           <button
//             onClick={() => setActiveView("grid")}
//             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
//               activeTab === "grid"
//                 ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
//                 : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
//             }`}
//           >
//             <Calculator size={14} /> Reconciliation Grid
//           </button>
//         </div>
//       </div>

//       {/* VIEW 1: SANKEY FLOW */}
//       {activeTab === "sankey" && (
//         <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
//           <div className="flex justify-between items-center mb-4">
//             <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
//               <Sparkles size={14} className="text-brand-primary" /> Visual Stream Branching (PKR)
//             </span>
//             <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">100% REVENUE DISPERSION</span>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
//             <div className="lg:col-span-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-center shadow-xl relative group">
//               <div className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 blur-xl rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
//               <div className="relative z-10">
//                 <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-400 uppercase tracking-widest">Gross Revenue</p>
//                 <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">Rs. {data.grossTotal.toLocaleString('en-PK')}</h4>
//                 <p className="text-[8px] font-bold text-brand-primary mt-1">MASTER STREAM SOURCE</p>
//               </div>
//             </div>

//             <div className="lg:col-span-5 hidden lg:block relative h-80">
//               <svg className="w-full h-full" viewBox="0 0 360 320">
//                 <SankeyStream y2={30} color="#a1a1aa" opacity={0.8} />
//                 <SankeyStream y2={70} color="#6366f1" />
//                 <SankeyStream y2={110} color="#eab308" />
//                 <SankeyStream y2={150} color="#a855f7" />
//                 <SankeyStream y2={190} color="#3b82f6" />
//                 <SankeyStream y2={230} color="#f97316" />
//                 <SankeyStream y2={270} color="#ef4444" />
//                 <SankeyStream y2={310} color="#22c55e" opacity={1} />
//               </svg>
//             </div>

//             <div className="lg:col-span-4 space-y-2">
//               <div className="p-2.5 bg-white dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs shadow-sm">
//                 <span className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px]">Capital Cost</span>
//                 <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">Rs. {data.originalPrice.toLocaleString('en-PK')}</span>
//               </div>
//               <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-500/20 flex justify-between items-center text-xs">
//                 <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">Customs Duties</span>
//                 <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">Rs. {dutiesValue.toLocaleString('en-PK')}</span>
//               </div>
//               <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-500/20 flex justify-between items-center text-xs">
//                 <span className="text-yellow-700 dark:text-yellow-400 font-bold text-[10px]">FBR GST Tax</span>
//                 <span className="font-mono font-bold text-yellow-800 dark:text-yellow-300">Rs. {taxesValue.toLocaleString('en-PK')}</span>
//               </div>
//               <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-500/20 flex justify-between items-center text-xs">
//                 <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px]">Platform Fees</span>
//                 <span className="font-mono font-bold text-purple-700 dark:text-purple-300">Rs. {data.platformFees.toLocaleString('en-PK')}</span>
//               </div>
//               <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-500/20 flex justify-between items-center text-xs">
//                 <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">Ad Spend</span>
//                 <span className="font-mono font-bold text-blue-700 dark:text-blue-300">Rs. {data.adSpend.toLocaleString('en-PK')}</span>
//               </div>
//               <div className="p-2.5 bg-green-50 dark:bg-green-950/50 rounded-xl border border-green-300 dark:border-green-500/40 flex justify-between items-center text-xs shadow-lg shadow-green-500/10">
//                 <span className="text-green-700 dark:text-green-400 font-black text-[10px] uppercase">Pure Net Profit</span>
//                 <span className="font-mono font-black text-green-700 dark:text-green-400 text-sm">Rs. {data.pureProfit.toLocaleString('en-PK')}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* VIEW 2: DYNAMIC SIMULATOR (WITH DYNAMIC MAX SLIDER RANGE) */}
//       {activeTab === "simulator" && (
//         <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl border border-brand-primary/30 dark:border-brand-primary/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
//           <div className="flex justify-between items-center mb-6">
//             <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
//               <Sliders size={14} /> Interactive Retail Price Simulator (Matched to Settings Tiers)
//             </span>
//             <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Drag handle to test dynamic margins</span>
//           </div>

//           <div className="space-y-6">
//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Simulated Retail Selling Price</label>
//                 <span className="text-2xl font-black text-brand-primary font-mono">
//                   Rs. {simulatedPrice.toLocaleString('en-PK')}
//                 </span>
//               </div>
//               {/* ✅ DYNAMIC MAX SLIDER RANGE (Auto-expands based on Settings maxCost!) */}
//               <input
//                 type="range"
//                 min={500}
//                 max={dynamicMaxPrice}
//                 step={50}
//                 value={simulatedPrice}
//                 onChange={(e) => setSimulatedPrice(Number(e.target.value))}
//                 className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
//               />
//               <div className="flex justify-between text-[8px] font-mono text-zinc-400 mt-1">
//                 <span>Min: Rs. 500</span>
//                 <span>Max Range: Rs. {dynamicMaxPrice.toLocaleString('en-PK')}</span>
//               </div>
//             </div>

//             {/* Simulated Live Anatomy Cards */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
//               <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
//                 <p className="text-[8px] font-bold text-zinc-500 uppercase">Est. Base Cost</p>
//                 <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 mt-1">Rs. {simulatedMath.capital.toLocaleString('en-PK')}</p>
//               </div>
//               <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
//                 <p className="text-[8px] font-bold text-yellow-700 dark:text-yellow-500 uppercase">GST Tax ({data?.gstPercent ?? 15}%)</p>
//                 <p className="text-sm font-black text-yellow-800 dark:text-yellow-400 mt-1">Rs. {simulatedMath.gst.toLocaleString('en-PK')}</p>
//               </div>
//               <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
//                 <p className="text-[8px] font-bold text-purple-600 dark:text-purple-400 uppercase">Platform Fees ({data?.fixedFeePercent ?? 3}%)</p>
//                 <p className="text-sm font-black text-purple-700 dark:text-purple-300 mt-1">Rs. {simulatedMath.fees.toLocaleString('en-PK')}</p>
//               </div>
//               <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-500/20">
//                 <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase">Ad Spend ({simulatedMath.adSpendPercent}%)</p>
//                 <p className="text-sm font-black text-blue-700 dark:text-blue-300 mt-1">Rs. {simulatedMath.ads.toLocaleString('en-PK')}</p>
//               </div>
//               <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-300 dark:border-green-500/40 col-span-2">
//                 <p className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase">Simulated Net Profit ({simulatedMath.profitPercent}%)</p>
//                 <p className="text-base font-black text-green-700 dark:text-green-400 mt-1">
//                   Rs. {simulatedMath.profit.toLocaleString('en-PK')} <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">({simulatedMath.margin}%)</span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* VIEW 3: DEFAULT RECONCILIATION GRID */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         <div className="sm:col-span-2 lg:col-span-4 p-6 bg-green-500/10 rounded-[2.5rem] border-2 border-green-500/30 shadow-2xl relative overflow-hidden group-hover:scale-[1.01] transition-transform">
//           <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-2xl" aria-hidden="true" />
//           <p className="text-[10px] sm:text-[11px] font-black text-green-600 dark:text-green-400 text-center uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
//             <TrendingUp size={14} aria-hidden="true" /> PURE NET PROFIT (POCKET MONEY)
//           </p>
//           <div className="flex justify-between items-center flex-wrap gap-4 px-4">
//             <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-700 dark:text-green-400 tracking-tighter">
//               Rs. {data.pureProfit.toLocaleString('en-PK')}
//             </h4>
//             <div className="flex items-center gap-6 text-right">
//               <div>
//                 <p className="text-[9px] font-black text-green-600/60 dark:text-green-500/60 uppercase tracking-widest">Net Margin</p>
//                 <p className="text-lg sm:text-xl font-black text-green-600 dark:text-green-400">{data.marginPercent.toFixed(1)}%</p>
//               </div>
//               {data.roiPercent !== undefined && (
//                 <div>
//                   <p className="text-[9px] font-black text-blue-600/60 dark:text-blue-400/60 uppercase tracking-widest">Capital ROI</p>
//                   <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">{data.roiPercent.toFixed(1)}%</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
//           <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-2 mb-3">
//             <Wallet size={12} aria-hidden="true" /> ORIGINAL COST (TOTAL)
//           </p>
//           <h4 className="text-lg font-black text-zinc-900 dark:text-white leading-none">Rs. {data.originalPrice.toLocaleString('en-PK')}</h4>
//           <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold uppercase tracking-tighter">
//             {costP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-500/20">
//           <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase flex items-center gap-2 mb-3">
//             <Package size={12} aria-hidden="true" /> AVG UNIT BASE PRICE
//           </p>
//           <h4 className="text-lg font-black text-teal-700 dark:text-teal-400 leading-none">
//             Rs. {avgUnitCost.toLocaleString('en-PK')} / pc
//           </h4>
//           <p className="text-[9px] text-teal-600/70 dark:text-teal-500/70 mt-2 font-bold uppercase tracking-tighter">
//             REVERSE COSTING ({itemsCount} UNITS)
//           </p>
//         </div>

//         <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-500/20">
//           <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2 mb-3">
//             <Scale size={12} aria-hidden="true" /> CUSTOMS DUTIES
//           </p>
//           <h4 className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">
//             Rs. {dutiesValue.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-indigo-500/70 dark:text-indigo-400/70 mt-2 font-bold uppercase tracking-tighter">
//             {dutiesP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl border border-yellow-200 dark:border-yellow-500/20">
//           <p className="text-[9px] font-bold text-yellow-600 dark:text-yellow-400 uppercase flex items-center gap-2 mb-3">
//             <Receipt size={12} aria-hidden="true" /> FBR GST TAX
//           </p>
//           <h4 className="text-lg font-black text-yellow-700 dark:text-yellow-400 leading-none">
//             Rs. {taxesValue.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-yellow-600/70 dark:text-yellow-500/70 mt-2 font-bold uppercase tracking-tighter">
//             {taxesP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-500/20">
//           <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2 mb-3">
//             <BadgePercent size={12} aria-hidden="true" /> AD SPEND
//           </p>
//           <h4 className="text-lg font-black text-blue-700 dark:text-blue-400 leading-none">
//             Rs. {data.adSpend.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-blue-500/70 dark:text-blue-400/70 mt-2 font-bold uppercase tracking-tighter">
//             {adsP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20">
//           <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-2 mb-3">
//             <Landmark size={12} aria-hidden="true" /> BANK/PLATFORM
//           </p>
//           <h4 className="text-lg font-black text-purple-700 dark:text-purple-400 leading-none">
//             Rs. {data.platformFees.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-purple-500/70 dark:text-purple-400/70 mt-2 font-bold uppercase tracking-tighter">
//             {feesP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-500/20">
//           <p className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase flex items-center gap-2 mb-3">
//             <Truck size={12} aria-hidden="true" /> SHIPPING IN
//           </p>
//           <h4 className="text-lg font-black text-orange-700 dark:text-orange-400 leading-none">
//             Rs. {data.shipping.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-orange-500/70 dark:text-orange-400/70 mt-2 font-bold uppercase tracking-tighter">
//             {shipP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-500/20">
//           <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-2 mb-3">
//             <TrendingDown size={12} aria-hidden="true" /> EST. RTO LOSS
//           </p>
//           <h4 className="text-lg font-black text-red-700 dark:text-red-400 leading-none">
//             Rs. {rtoLossValue.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-red-500/70 dark:text-red-400/70 mt-2 font-bold uppercase tracking-tighter">
//             {rtoP.toFixed(1)}% OF REVENUE
//           </p>
//         </div>

//         <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-500/20">
//           <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-2 mb-3">
//             <Tag size={12} aria-hidden="true" /> COUPON DISCOUNTS
//           </p>
//           <h4 className="text-lg font-black text-rose-700 dark:text-rose-400 leading-none">
//             Rs. {discountsValue.toLocaleString('en-PK')}
//           </h4>
//           <p className="text-[9px] text-rose-500/70 dark:text-rose-400/70 mt-2 font-bold uppercase tracking-tighter">
//             PROMOTIONAL BURN
//           </p>
//         </div>

//         <div className="sm:col-span-4 p-5 bg-zinc-50 dark:bg-zinc-900/80 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center gap-1 shadow-sm">
//           <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
//             TOTAL ADDED VALUE & OPERATIONS
//           </p>
//           <div className="flex items-end justify-between">
//             <h4 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-none">
//               Rs. {totalAddedValueAndOperations.toLocaleString('en-PK')}
//             </h4>
//             <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase italic">(EXCLUDING BASE CAPITAL)</p>
//           </div>
//         </div>

//         <div className="sm:col-span-4 p-5 bg-zinc-900 dark:bg-black rounded-3xl border border-zinc-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-4 w-full sm:w-auto">
//             <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5 shrink-0">
//               <Calculator size={24} aria-hidden="true" />
//             </div>
//             <div className="min-w-0">
//               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] truncate">
//                 GRAND RECONCILIATION
//               </p>
//               <p className="text-[8px] text-zinc-600 font-bold uppercase truncate mt-0.5">
//                 (COST + GAIN + DRAIN + SHIP)
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-6">
//             <div className="text-right">
//               <h4 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tighter">
//                 Rs. {grandTotalVerification.toLocaleString('en-PK')}
//               </h4>
//               <div className="mt-1 flex items-center justify-end gap-1 text-green-500">
//                 <CheckCircle2 size={10} aria-hidden="true" />
//                 <span className="text-[8px] font-black uppercase whitespace-nowrap">
//                   VERIFIED VS REVENUE
//                 </span>
//               </div>
//             </div>
//             <Link
//               href={viewAllLink}
//               className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-white/30"
//               aria-label="View full financial report"
//             >
//               Full Report <ArrowRight size={14} />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/financial-surgery/components/PriceAnatomySurgeon.tsx (FULLY DYNAMIC SLIDER RANGE & TIER SIMULATOR)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Wallet,
  BadgePercent,
  Landmark,
  Truck,
  Calculator,
  CheckCircle2,
  Scale,
  Receipt,
  TrendingDown,
  ArrowRight,
  Tag,
  Package,
  Sliders,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import Link from "next/link";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface FinancialSurgeonData {
  originalPrice: number;
  avgUnitCostPrice?: number;
  totalItemsSold?: number;
  adSpend: number;
  platformFees: number;
  taxes?: number;
  duties?: number;
  rtoLoss?: number;
  shipping: number;
  pureProfit: number;
  grossTotal: number;
  discounts?: number;
  netRevenue?: number;
  marginPercent: number;
  roiPercent?: number;
  generatedAt?: string;
  pricingTiers?: Array<{ minCost: number; maxCost: number; profitPercent: number; adSpendPercent: number }>;
  gstPercent?: number;
  dutiesPercent?: number;
  fixedFeePercent?: number;
}

interface PriceAnatomySurgeonProps {
  data: FinancialSurgeonData | null;
  isLoading?: boolean;
  viewAllLink?: string;
}

// ================================================================
// 🎨 SANKEY SVG STREAM PATH HELPER
// ================================================================
const SankeyStream = ({ y2, color, opacity = 0.6 }: { y2: number; color: string; opacity?: number }) => {
  const pathData = `M 40 160 C 180 160, 180 ${y2}, 320 ${y2}`;
  return (
    <path
      d={pathData}
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      opacity={opacity}
      className="transition-all duration-700 hover:opacity-100 hover:stroke-[6px]"
    />
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function PriceAnatomySurgeon({
  data,
  isLoading = false,
  viewAllLink = "/admin/reports-index",
}: PriceAnatomySurgeonProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveView] = useState<"sankey" | "simulator" | "grid">("sankey");
  const [simulatedPrice, setSimulatedPrice] = useState<number>(2500);

  useEffect(() => {
    setMounted(true);
    if (data?.grossTotal) {
      setSimulatedPrice(Math.round(data.grossTotal / (data.totalItemsSold || 1)));
    }
  }, [data]);

  // ✅ DYNAMIC MAX SLIDER RANGE (Matches Settings Tiers maxCost or 50,000 PKR default)
  const dynamicMaxPrice = useMemo(() => {
    if (data?.pricingTiers && data.pricingTiers.length > 0) {
      const maxTierCost = Math.max(...data.pricingTiers.map((t) => t.maxCost));
      return Math.max(50000, maxTierCost);
    }
    return 50000;
  }, [data]);

  // ✅ DYNAMIC SIMULATOR MATH (Matches Settings Tiers Live!)
  const simulatedMath = useMemo(() => {
    const sp = simulatedPrice || 1000;
    
    let profitPercent = 25;
    let adSpendPercent = 8;

    if (data?.pricingTiers && data.pricingTiers.length > 0) {
      const matchedTier = data.pricingTiers.find(
        (t) => sp >= t.minCost && sp <= t.maxCost
      );
      if (matchedTier) {
        profitPercent = matchedTier.profitPercent || 0;
        adSpendPercent = matchedTier.adSpendPercent || 0;
      } else {
        profitPercent = data.pricingTiers[0]?.profitPercent || 0;
        adSpendPercent = data.pricingTiers[0]?.adSpendPercent || 0;
      }
    }

    const gstP = data?.gstPercent ?? 15;
    const feesP = data?.fixedFeePercent ?? 3;
    const dutiesP = data?.dutiesPercent ?? 5;

    const gst = sp * (gstP / 100);
    const fees = sp * (feesP / 100);
    const ads = sp * (adSpendPercent / 100);
    const profit = sp * (profitPercent / 100);
    
    const leftover = sp - (gst + fees + ads + profit);
    const capital = leftover / (1 + dutiesP / 100);

    return {
      sp,
      gst: Math.round(gst),
      fees: Math.round(fees),
      ads: Math.round(ads),
      profit: Math.round(profit),
      capital: Math.round(capital),
      profitPercent,
      adSpendPercent,
      margin: ((profit / sp) * 100).toFixed(1),
    };
  }, [simulatedPrice, data]);

  if (!mounted || isLoading || !data) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75">
        <Activity size={36} className="text-brand-primary animate-spin mb-3" />
        <p className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
          Initializing Financial Surgery Engine...
        </p>
      </div>
    );
  }

  const total = data.grossTotal || 1;
  const dutiesValue = data.duties ?? 0;
  const taxesValue = data.taxes ?? 0;
  const rtoLossValue = data.rtoLoss ?? 0;
  const discountsValue = data.discounts ?? 0;
  const avgUnitCost = data.avgUnitCostPrice ?? 0;
  const itemsCount = data.totalItemsSold ?? 0;

  const costP = (data.originalPrice / total) * 100;
  const dutiesP = (dutiesValue / total) * 100;
  const taxesP = (taxesValue / total) * 100;
  const feesP = (data.platformFees / total) * 100;
  const adsP = (data.adSpend / total) * 100;
  const shipP = (data.shipping / total) * 100;
  const rtoP = (rtoLossValue / total) * 100;
  const profitP = (data.pureProfit / total) * 100;

  const totalAddedValueAndOperations =
    data.pureProfit +
    data.adSpend +
    data.platformFees +
    taxesValue +
    data.shipping +
    rtoLossValue +
    dutiesValue +
    discountsValue;

  const grandTotalVerification = data.originalPrice + totalAddedValueAndOperations - discountsValue;

  // ✅ MULTI-SEGMENTED PROPORTIONAL DISPERSION BAR DATA (Uses profitP and all percent variables!)
  const barSegments = [
    { percentage: costP, color: "bg-zinc-400 dark:bg-zinc-600", label: "Capital", value: data.originalPrice },
    { percentage: dutiesP, color: "bg-indigo-500", label: "Duties", value: dutiesValue },
    { percentage: taxesP, color: "bg-yellow-500", label: "Taxes", value: taxesValue },
    { percentage: feesP, color: "bg-purple-500", label: "Fees", value: data.platformFees },
    { percentage: adsP, color: "bg-blue-500", label: "Ads", value: data.adSpend },
    { percentage: shipP, color: "bg-orange-500", label: "Shipping", value: data.shipping },
    { percentage: rtoP, color: "bg-red-500", label: "RTO", value: rtoLossValue },
    { percentage: profitP, color: "bg-emerald-500", label: "Profit", value: data.pureProfit },
  ];

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">

      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
          <Target size={12} className="text-brand-primary" /> FINANCIAL SURGERY v3.0
        </span>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveView("sankey")}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sankey"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Layers size={12} /> Stream Flow
          </button>
          <button
            onClick={() => setActiveView("simulator")}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Sliders size={12} /> Price Simulator
          </button>
          <button
            onClick={() => setActiveView("grid")}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "grid"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Calculator size={12} /> Reconciliation Grid
          </button>
        </div>
      </div>

      {/* ✅ PROPORTIONAL REVENUE DISPERSION PROGRESS BAR (Reads profitP & all segment variables) */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 font-mono">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <span>Proportional Revenue Dispersion</span>
          <span>100% Total Gross Revenue</span>
        </div>
        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
          {barSegments.map((seg, idx) => (
            seg.percentage > 0 && (
              <div
                key={idx}
                style={{ width: `${Math.max(1, seg.percentage)}%` }}
                className={`h-full ${seg.color} transition-all duration-500 relative group/seg cursor-pointer`}
                title={`${seg.label}: Rs. ${seg.value.toLocaleString('en-PK')} (${seg.percentage.toFixed(1)}%)`}
              />
            )
          ))}
        </div>
        <div className="flex justify-between flex-wrap gap-2 text-[8px] text-zinc-400 dark:text-zinc-500 pt-1">
          <span>Capital: {costP.toFixed(1)}%</span>
          <span>Duties: {dutiesP.toFixed(1)}%</span>
          <span>GST: {taxesP.toFixed(1)}%</span>
          <span>Fees: {feesP.toFixed(1)}%</span>
          <span>Ads: {adsP.toFixed(1)}%</span>
          <span>Shipping: {shipP.toFixed(1)}%</span>
          <span>RTO: {rtoP.toFixed(1)}%</span>
          <span className="text-emerald-500 font-bold">Profit: {profitP.toFixed(1)}%</span>
        </div>
      </div>

      {/* VIEW 1: SANKEY FLOW STREAM */}
      {activeTab === "sankey" && (
        <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={13} className="text-brand-primary" /> Visual Stream Branching (PKR)
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">100% REVENUE DISPERSION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center shadow-xs relative group">
              <div className="relative z-10">
                <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Gross Revenue</p>
                <h4 className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-1">Rs. {data.grossTotal.toLocaleString('en-PK')}</h4>
                <p className="text-[8px] font-mono font-bold text-brand-primary mt-1">MASTER STREAM SOURCE</p>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block relative h-72">
              <svg className="w-full h-full" viewBox="0 0 360 320">
                <SankeyStream y2={30} color="#a1a1aa" opacity={0.8} />
                <SankeyStream y2={70} color="#6366f1" />
                <SankeyStream y2={110} color="#eab308" />
                <SankeyStream y2={150} color="#a855f7" />
                <SankeyStream y2={190} color="#3b82f6" />
                <SankeyStream y2={230} color="#f97316" />
                <SankeyStream y2={270} color="#ef4444" />
                <SankeyStream y2={310} color="#22c55e" opacity={1} />
              </svg>
            </div>

            <div className="lg:col-span-4 space-y-2 font-mono">
              <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold text-[10px]">Capital Cost ({costP.toFixed(1)}%)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-200">Rs. {data.originalPrice.toLocaleString('en-PK')}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-500/20 flex justify-between items-center text-xs">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">Customs Duties ({dutiesP.toFixed(1)}%)</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300">Rs. {dutiesValue.toLocaleString('en-PK')}</span>
              </div>
              <div className="p-2.5 bg-yellow-50/50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-500/20 flex justify-between items-center text-xs">
                <span className="text-yellow-700 dark:text-yellow-400 font-bold text-[10px]">FBR GST Tax ({taxesP.toFixed(1)}%)</span>
                <span className="font-bold text-yellow-800 dark:text-yellow-300">Rs. {taxesValue.toLocaleString('en-PK')}</span>
              </div>
              <div className="p-2.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-500/20 flex justify-between items-center text-xs">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px]">Platform Fees ({feesP.toFixed(1)}%)</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">Rs. {data.platformFees.toLocaleString('en-PK')}</span>
              </div>
              <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-500/20 flex justify-between items-center text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">Ad Spend ({adsP.toFixed(1)}%)</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">Rs. {data.adSpend.toLocaleString('en-PK')}</span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/50 rounded-xl border border-emerald-300 dark:border-emerald-500/40 flex justify-between items-center text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase">Pure Net Profit ({profitP.toFixed(1)}%)</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">Rs. {data.pureProfit.toLocaleString('en-PK')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/20 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Sliders size={13} /> Interactive Retail Price Simulator (Matched to Settings Tiers)
            </span>
            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">Drag slider to simulate dynamic margins</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase">Simulated Retail Selling Price</label>
                <span className="text-xl font-black text-brand-primary font-mono">
                  Rs. {simulatedPrice.toLocaleString('en-PK')}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={dynamicMaxPrice}
                step={50}
                value={simulatedPrice}
                onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 mt-1">
                <span>Min: Rs. 500</span>
                <span>Max Range: Rs. {dynamicMaxPrice.toLocaleString('en-PK')}</span>
              </div>
            </div>

            {/* Simulated Live Anatomy Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 font-mono">
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-[8px] font-bold text-zinc-500 uppercase">Est. Base Cost</p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">Rs. {simulatedMath.capital.toLocaleString('en-PK')}</p>
              </div>
              <div className="p-3 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
                <p className="text-[8px] font-bold text-yellow-700 dark:text-yellow-500 uppercase">GST Tax ({data?.gstPercent ?? 15}%)</p>
                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 mt-1">Rs. {simulatedMath.gst.toLocaleString('en-PK')}</p>
              </div>
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-500/20">
                <p className="text-[8px] font-bold text-purple-600 dark:text-purple-400 uppercase">Platform ({data?.fixedFeePercent ?? 3}%)</p>
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mt-1">Rs. {simulatedMath.fees.toLocaleString('en-PK')}</p>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-500/20">
                <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase">Ad Spend ({simulatedMath.adSpendPercent}%)</p>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-1">Rs. {simulatedMath.ads.toLocaleString('en-PK')}</p>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-500/40 col-span-2">
                <p className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Net Profit ({simulatedMath.profitPercent}%)</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  Rs. {simulatedMath.profit.toLocaleString('en-PK')} <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">({simulatedMath.margin}%)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RECONCILIATION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="sm:col-span-2 lg:col-span-4 p-5 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/30 relative overflow-hidden">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <TrendingUp size={14} /> PURE NET PROFIT (POCKET MONEY)
          </p>
          <div className="flex justify-between items-center flex-wrap gap-4 px-2">
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
              Rs. {data.pureProfit.toLocaleString('en-PK')}
            </h4>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase">Net Margin</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{data.marginPercent.toFixed(1)}%</p>
              </div>
              {data.roiPercent !== undefined && (
                <div>
                  <p className="text-[9px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase">Capital ROI</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400">{data.roiPercent.toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5 mb-2">
            <Wallet size={12} /> ORIGINAL COST (TOTAL)
          </p>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Rs. {data.originalPrice.toLocaleString('en-PK')}</h4>
          <p className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold uppercase">
            {costP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-500/20">
          <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase flex items-center gap-1.5 mb-2">
            <Package size={12} /> AVG UNIT BASE PRICE
          </p>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400">
            Rs. {avgUnitCost.toLocaleString('en-PK')} / pc
          </h4>
          <p className="text-[8px] text-teal-600/70 dark:text-teal-500/70 mt-1 font-bold uppercase">
            REVERSE COSTING ({itemsCount} UNITS)
          </p>
        </div>

        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-500/20">
          <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5 mb-2">
            <Scale size={12} /> CUSTOMS DUTIES
          </p>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
            Rs. {dutiesValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-indigo-500/70 dark:text-indigo-400/70 mt-1 font-bold uppercase">
            {dutiesP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-yellow-50/50 dark:bg-yellow-950/30 rounded-2xl border border-yellow-200 dark:border-yellow-500/20">
          <p className="text-[9px] font-bold text-yellow-600 dark:text-yellow-400 uppercase flex items-center gap-1.5 mb-2">
            <Receipt size={12} /> FBR GST TAX
          </p>
          <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
            Rs. {taxesValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-yellow-600/70 dark:text-yellow-500/70 mt-1 font-bold uppercase">
            {taxesP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-500/20">
          <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1.5 mb-2">
            <BadgePercent size={12} /> AD SPEND
          </p>
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400">
            Rs. {data.adSpend.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-blue-500/70 dark:text-blue-400/70 mt-1 font-bold uppercase">
            {adsP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20">
          <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1.5 mb-2">
            <Landmark size={12} /> BANK/PLATFORM
          </p>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400">
            Rs. {data.platformFees.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-purple-500/70 dark:text-purple-400/70 mt-1 font-bold uppercase">
            {feesP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-orange-50/50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-500/20">
          <p className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase flex items-center gap-1.5 mb-2">
            <Truck size={12} /> SHIPPING IN
          </p>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400">
            Rs. {data.shipping.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-orange-500/70 dark:text-orange-400/70 mt-1 font-bold uppercase">
            {shipP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-red-50/50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-500/20">
          <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5 mb-2">
            <TrendingDown size={12} /> EST. RTO LOSS
          </p>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
            Rs. {rtoLossValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-red-500/70 dark:text-red-400/70 mt-1 font-bold uppercase">
            {rtoP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-500/20">
          <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5 mb-2">
            <Tag size={12} /> COUPON DISCOUNTS
          </p>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Rs. {discountsValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-rose-500/70 dark:text-rose-400/70 mt-1 font-bold uppercase">
            PROMOTIONAL BURN
          </p>
        </div>

        <div className="sm:col-span-4 p-4 bg-zinc-50/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center gap-1">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            TOTAL ADDED VALUE & OPERATIONS
          </p>
          <div className="flex items-end justify-between">
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white leading-none">
              Rs. {totalAddedValueAndOperations.toLocaleString('en-PK')}
            </h4>
            <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase italic">(EXCLUDING BASE CAPITAL)</p>
          </div>
        </div>

        <div className="sm:col-span-4 p-4 bg-zinc-900 dark:bg-black rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-white/5 rounded-xl text-brand-primary border border-white/5 shrink-0">
              <Calculator size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                GRAND RECONCILIATION
              </p>
              <p className="text-[8px] text-zinc-500 font-bold uppercase truncate mt-0.5">
                (COST + GAIN + DRAIN + SHIP)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <h4 className="text-xl font-black text-white leading-none tracking-tight">
                Rs. {grandTotalVerification.toLocaleString('en-PK')}
              </h4>
              <div className="mt-1 flex items-center justify-end gap-1 text-emerald-400">
                <CheckCircle2 size={10} />
                <span className="text-[8px] font-bold uppercase whitespace-nowrap">
                  VERIFIED VS REVENUE
                </span>
              </div>
            </div>
            <Link
              href={viewAllLink}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border border-white/10 no-underline hover:no-underline"
            >
              Full Report <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}