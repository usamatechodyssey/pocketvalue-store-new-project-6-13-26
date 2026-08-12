// 📂 src/app/features/admin/financial-surgery/components/PriceAnatomySurgeon.tsx

"use client";

import  { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  ArrowUpRight,
  Tag,
  Package,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  ShieldAlert,
  AlertOctagon,
} from "lucide-react";

export interface FinancialSurgeonData {
  originalPrice: number;
  avgUnitCostPrice?: number;
  totalItemsSold?: number;
  adSpend: number;
  platformFees: number;
  taxes?: number;
  duties?: number;
  actualRtoLoss?: number;
  rtoLoss?: number;
  shipping: number;
  targetProfit?: number;
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

export default function PriceAnatomySurgeon({
  data,
  isLoading = false,
  viewAllLink = "/admin/reports-index/profit-loss",
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

  const dynamicMaxPrice = useMemo(() => {
    if (data?.pricingTiers && data.pricingTiers.length > 0) {
      const maxTierCost = Math.max(...data.pricingTiers.map((t) => t.maxCost));
      return Math.max(50000, maxTierCost);
    }
    return 50000;
  }, [data]);

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
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col items-center justify-center min-h-80 text-center font-mono">
        <Activity size={32} className="text-brand-primary animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
          Initializing Financial Surgery Engine...
        </p>
      </div>
    );
  }

  const total = data.grossTotal || 1;
  const dutiesValue = data.duties ?? 0;
  const taxesValue = data.taxes ?? 0;
  const actualRtoLossValue = data.actualRtoLoss ?? 0;
  const rtoReserveValue = data.rtoLoss ?? 0;
  const discountsValue = data.discounts ?? 0;
  const avgUnitCost = data.avgUnitCostPrice ?? 0;
  const itemsCount = data.totalItemsSold ?? 0;
  const targetProfitValue = data.targetProfit ?? 0;

  const costP = (data.originalPrice / total) * 100;
  const dutiesP = (dutiesValue / total) * 100;
  const taxesP = (taxesValue / total) * 100;
  const feesP = (data.platformFees / total) * 100;
  const adsP = (data.adSpend / total) * 100;
  const shipP = (data.shipping / total) * 100;
  const rtoP = (rtoReserveValue / total) * 100;
  const profitP = (data.pureProfit / total) * 100;

  const totalAddedValueAndOperations =
    data.pureProfit +
    data.adSpend +
    data.platformFees +
    taxesValue +
    data.shipping +
    rtoReserveValue +
    dutiesValue +
    discountsValue;

  const grossProfitValue = data.grossTotal - data.originalPrice;
  const grandTotalVerification = data.originalPrice + grossProfitValue;

  const barSegments = [
    { percentage: costP, color: "bg-zinc-400 dark:bg-zinc-600", label: "Capital", value: data.originalPrice },
    { percentage: dutiesP, color: "bg-indigo-500", label: "Duties", value: dutiesValue },
    { percentage: taxesP, color: "bg-yellow-500", label: "Taxes", value: taxesValue },
    { percentage: feesP, color: "bg-purple-500", label: "Fees", value: data.platformFees },
    { percentage: adsP, color: "bg-blue-500", label: "Ads", value: data.adSpend },
    { percentage: shipP, color: "bg-orange-500", label: "Shipping", value: data.shipping },
    { percentage: rtoP, color: "bg-red-500", label: "RTO Reserve", value: rtoReserveValue },
    { percentage: profitP, color: "bg-emerald-500", label: "Profit", value: data.pureProfit },
  ];

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Financial Surgery & Price Anatomy"
    >
      {/* HEADER & TABS */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Target size={20} className="text-brand-primary" /> Financial Surgery
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Granular Price Anatomy & Margin Dispersion
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveView("sankey")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sankey"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Layers size={11} /> Stream
          </button>
          <button
            onClick={() => setActiveView("simulator")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Sliders size={11} /> Simulator
          </button>
          <button
            onClick={() => setActiveView("grid")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "grid"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Calculator size={11} /> Grid
          </button>
        </div>
      </div>

      {/* PROPORTIONAL REVENUE DISPERSION PROGRESS BAR */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 font-mono mb-6 shadow-2xs">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <span>Revenue Dispersion</span>
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
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 animate-in fade-in duration-200 mb-6 flex-1">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={13} className="text-brand-primary" /> Visual Stream Branching (PKR)
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">100% REVENUE DISPERSION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center shadow-2xs relative group">
              <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Gross Revenue</p>
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-1">Rs. {data.grossTotal.toLocaleString('en-PK')}</h4>
              <p className="text-[8px] font-mono font-bold text-brand-primary mt-1 uppercase">Master Stream Source</p>
            </div>

            <div className="lg:col-span-8 space-y-2 font-mono">
              <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-850 flex justify-between items-center text-xs">
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
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/20 animate-in fade-in duration-200 mb-6 flex-1 font-mono">
          <div className="flex justify-between items-center mb-5 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Sliders size={13} /> Interactive Retail Price Simulator
            </span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Drag slider to simulate dynamic margins</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">Simulated Retail Selling Price</label>
                <span className="text-xl font-black text-brand-primary">
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
              <div className="flex justify-between text-[8px] text-zinc-400 mt-1">
                <span>Min: Rs. 500</span>
                <span>Max Range: Rs. {dynamicMaxPrice.toLocaleString('en-PK')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
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
                <p className="text-xs font-bold text-blue-700 dark:text-zinc-300 mt-1">Rs. {simulatedMath.ads.toLocaleString('en-PK')}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono mb-6 flex-1">
        
        {/* Card 1: PURE NET PROFIT */}
        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <TrendingUp size={13} /> PURE NET PROFIT
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
            Rs. {data.pureProfit.toLocaleString('en-PK')}
          </h4>
          <div className="flex items-center gap-4 text-right mt-2 text-[9px]">
            <span>Margin: <strong className="text-emerald-500">{data.marginPercent.toFixed(1)}%</strong></span>
            {data.roiPercent !== undefined && (
              <span>ROI: <strong className="text-blue-500">{data.roiPercent.toFixed(1)}%</strong></span>
            )}
          </div>
        </div>

        {/* Card 2: TARGET PROFIT BEFORE COUPON */}
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Target size={13} /> TARGET PROFIT
          </p>
          <h4 className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
            Rs. {targetProfitValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[9px] font-bold text-rose-500 mt-2">
            Promo Burn: -Rs. {discountsValue.toLocaleString('en-PK')}
          </p>
        </div>

        {/* Card 3: ORIGINAL COST */}
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5 mb-2">
            <Wallet size={12} /> ORIGINAL COST
          </p>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Rs. {data.originalPrice.toLocaleString('en-PK')}</h4>
          <p className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold uppercase">
            {costP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        {/* Card 4: AVG UNIT BASE PRICE */}
        <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-500/20 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase flex items-center gap-1.5 mb-2">
            <Package size={12} /> AVG UNIT BASE
          </p>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400">
            Rs. {avgUnitCost.toLocaleString('en-PK')} / pc
          </h4>
          <p className="text-[8px] text-teal-600/70 dark:text-teal-500/70 mt-1 font-bold uppercase">
            ({itemsCount} UNITS)
          </p>
        </div>

        {/* Card 5: CUSTOMS DUTIES */}
        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 flex flex-col justify-between">
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

        {/* Card 6: FBR GST TAX */}
        <div className="p-3.5 bg-yellow-50/50 dark:bg-yellow-950/30 rounded-2xl border border-yellow-200 dark:border-yellow-500/20 flex flex-col justify-between">
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

        {/* Card 7: AD SPEND */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-500/20 flex flex-col justify-between">
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

        {/* Card 8: BANK/PLATFORM */}
        <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1.5 mb-2">
            <Landmark size={12} /> BANK/PLATFORM
          </p>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">
            Rs. {data.platformFees.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-purple-500/70 dark:text-purple-400/70 mt-1 font-bold uppercase">
            {feesP.toFixed(1)}% OF REVENUE
          </p>
        </div>

        {/* Card 9: SHIPPING IN */}
        <div className="p-3.5 bg-orange-50/50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-500/20 flex flex-col justify-between">
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

        {/* Card 10: ACTUAL RTO LOSS */}
        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-500/20 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5 mb-2">
            <AlertOctagon size={12} /> ACTUAL RTO LOSS
          </p>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Rs. {actualRtoLossValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-rose-500/70 dark:text-rose-400/70 mt-1 font-bold uppercase">
            COURIER PENALTY
          </p>
        </div>

        {/* Card 11: RTO RISK RESERVE BUFFER */}
        <div className="p-3.5 bg-red-50/50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-500/20 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5 mb-2">
            <ShieldAlert size={12} /> RTO RISK RESERVE
          </p>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
            Rs. {rtoReserveValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-red-500/70 dark:text-red-400/70 mt-1 font-bold uppercase">
            PRICING BUFFER
          </p>
        </div>

        {/* Card 12: COUPON DISCOUNTS */}
        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-500/20 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5 mb-2">
            <Tag size={12} /> COUPON DISCOUNTS
          </p>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Rs. {discountsValue.toLocaleString('en-PK')}
          </h4>
          <p className="text-[8px] text-rose-500/70 dark:text-rose-400/70 mt-1 font-bold uppercase">
            PROMO BURN
          </p>
        </div>

        {/* Card 13: GRAND RECONCILIATION */}
        <div className="sm:col-span-2 lg:col-span-4 p-4 bg-zinc-900 dark:bg-black rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-white/5 rounded-xl text-brand-primary border border-white/5 shrink-0">
              <Calculator size={20} />
            </div>
            <div className="min-w-0 font-mono">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                GRAND RECONCILIATION
              </p>
              <p className="text-[8px] text-zinc-500 font-bold uppercase truncate mt-0.5 font-mono">
                (COGS + MERCHANDISE GROSS MARGIN)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-mono">
            <div className="text-right">
              <h4 className="text-xl font-black text-white leading-none tracking-tight">
                Rs. {grandTotalVerification.toLocaleString('en-PK')}
              </h4>
              <div className="mt-1 flex items-center justify-end gap-1 text-emerald-400">
                <CheckCircle2 size={10} />
                <span className="text-[8px] font-bold uppercase whitespace-nowrap">
                  VERIFIED VS GROSS SALES
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href={viewAllLink}
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Open P&L Statement <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}