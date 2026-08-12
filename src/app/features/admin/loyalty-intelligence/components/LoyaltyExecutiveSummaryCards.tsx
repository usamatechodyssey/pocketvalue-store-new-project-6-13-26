// // 📂 src/app/features/admin/loyalty-intelligence/components/LoyaltyExecutiveSummaryCards.tsx

// "use client";

// import React from "react";
// import {
//   Users,
//   Banknote,
//   ShoppingBag,
//   Repeat,
//   TrendingUp,
//   TrendingDown,
//   Minus,
//   Award,
// } from "lucide-react";
// import { LoyaltyExecutiveSummaryResponse } from "../actions/getLoyaltyExecutiveSummary";

// // ================================================================
// // ✅ HELPERS (With en-PK Localization)
// // ================================================================
// const formatCurrency = (value: number): string => `Rs. ${(value || 0).toLocaleString('en-PK')}`;
// const formatNumber = (value: number): string => (value || 0).toLocaleString('en-PK');
// const formatPercent = (value: number): string => `${(value || 0).toFixed(1)}%`;

// // ================================================================
// // ✅ HELPER: Trend Icon
// // ================================================================
// const TrendIcon = ({ value }: { value: number }) => {
//   if (value > 0) return <TrendingUp size={12} className="text-emerald-500" />;
//   if (value < 0) return <TrendingDown size={12} className="text-red-500" />;
//   return <Minus size={12} className="text-zinc-400" />;
// };

// // ================================================================
// // ✅ SUB-COMPONENT: High-Density Metric Card
// // ================================================================
// interface MetricCardProps {
//   title: string;
//   icon: React.ReactNode;
//   referredValue: number;
//   organicValue: number;
//   premium: number;
//   format: (val: number) => string;
//   isPercentage?: boolean;
// }

// const MetricCard = ({
//   title,
//   icon,
//   referredValue,
//   organicValue,
//   premium,
//   format,
//   isPercentage = false,
// }: MetricCardProps) => {
//   const isPositive = premium > 0;
//   const isNegative = premium < 0;

//   return (
//     <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0 font-mono">
//       <div className="flex items-center gap-2 mb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
//         <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0 shadow-2xs">
//           {icon}
//         </div>
//         <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
//           {title}
//         </h3>
//       </div>

//       <div className="grid grid-cols-2 gap-3 my-1">
//         {/* Referred */}
//         <div className="min-w-0">
//           <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Referred</p>
//           <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none mt-1 truncate">
//             {format(referredValue)}
//             {isPercentage && <span className="text-xs font-normal text-zinc-400 ml-0.5">%</span>}
//           </p>
//         </div>

//         {/* Organic */}
//         <div className="min-w-0">
//           <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Organic</p>
//           <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none mt-1 truncate">
//             {format(organicValue)}
//             {isPercentage && <span className="text-xs font-normal text-zinc-400 ml-0.5">%</span>}
//           </p>
//         </div>
//       </div>

//       {/* Premium Badge */}
//       <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
//         <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Uplift Premium</span>
//         <div
//           className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
//             isPositive
//               ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
//               : isNegative
//               ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
//               : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
//           }`}
//         >
//           <TrendIcon value={premium} />
//           <span>{isPositive ? "+" : ""}{premium.toFixed(1)}%</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// interface LoyaltyExecutiveSummaryCardsProps {
//   data: LoyaltyExecutiveSummaryResponse | null;
// }

// export default function LoyaltyExecutiveSummaryCards({
//   data,
// }: LoyaltyExecutiveSummaryCardsProps) {
//   // ✅ Empty State
//   if (!data) {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse w-full">
//         {[...Array(4)].map((_, i) => (
//           <div
//             key={i}
//             className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-36 border border-zinc-200 dark:border-zinc-800"
//           />
//         ))}
//       </div>
//     );
//   }

//   const { referred, organic, comparison } = data;

//   // Check if any data exists
//   const hasData = referred.totalUsers > 0 || organic.totalUsers > 0;
//   if (!hasData) {
//     return (
//       <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full">
//         <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
//           <Award size={32} />
//         </div>
//         <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">No Loyalty Data Available</h3>
//         <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
//           Start referring customers to see how referral program impacts LTV, AOV, and retention.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
//       {/* Header Bar */}
//       <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
//         <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
//           <Award size={12} /> REFERRAL PROGRAM IMPACT
//         </span>
//         <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//           {formatNumber(referred.totalUsers)} REFERRED • {formatNumber(organic.totalUsers)} ORGANIC
//         </span>
//       </div>

//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//         {/* 1. LTV (Lifetime Value) */}
//         <MetricCard
//           title="Lifetime Value (LTV)"
//           icon={<Users size={16} />}
//           referredValue={referred.lifetimeValue}
//           organicValue={organic.lifetimeValue}
//           premium={comparison.revenuePremium}
//           format={(v) => formatCurrency(v)}
//         />

//         {/* 2. AOV (Average Order Value) */}
//         <MetricCard
//           title="Average Order Value (AOV)"
//           icon={<ShoppingBag size={16} />}
//           referredValue={referred.averageOrderValue}
//           organicValue={organic.averageOrderValue}
//           premium={comparison.aovPremium}
//           format={(v) => formatCurrency(v)}
//         />

//         {/* 3. Repeat Purchase Rate */}
//         <MetricCard
//           title="Repeat Purchase Rate"
//           icon={<Repeat size={16} />}
//           referredValue={referred.repeatPurchaseRate}
//           organicValue={organic.repeatPurchaseRate}
//           premium={comparison.repeatPremium}
//           format={(v) => v.toFixed(1)}
//           isPercentage={true}
//         />

//         {/* 4. Revenue Impact Card */}
//         <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0 font-mono">
//           <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
//             <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0 shadow-2xs">
//               <Banknote size={16} /> {/* ✅ Replaced DollarSign */}
//             </div>
//             <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
//               Revenue Impact
//             </h3>
//           </div>

//           <div className="my-2 min-w-0">
//             <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Extra Program Revenue</p>
//             <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none mt-1 truncate">
//               {formatCurrency(comparison.revenueImpact)}
//             </p>
//           </div>

//           <div className="mt-2 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px]">
//             <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase">LTV Premium</span>
//             <span className={`font-bold ${comparison.revenuePremium > 0 ? "text-emerald-500" : "text-red-500"}`}>
//               {comparison.revenuePremium > 0 ? "+" : ""}{comparison.revenuePremium}%
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Footer Stats Ticker */}
//       <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2.5">
//         <span>
//           <strong className="text-zinc-800 dark:text-zinc-200">{formatNumber(referred.totalUsers)}</strong> Referred Customers
//         </span>
//         <span className="text-zinc-300 dark:text-zinc-800">•</span>
//         <span>
//           <strong className="text-zinc-800 dark:text-zinc-200">{formatNumber(referred.totalOrders)}</strong> Referred Orders
//         </span>
//         <span className="text-zinc-300 dark:text-zinc-800">•</span>
//         <span>
//           <strong className="text-brand-primary">{formatCurrency(referred.totalRevenue)}</strong> Referred Revenue
//         </span>
//         <span className="text-zinc-300 dark:text-zinc-800">•</span>
//         <span>
//           Repeat Rate: <strong className="text-emerald-500">{formatPercent(referred.repeatPurchaseRate)}</strong> vs{" "}
//           <strong className="text-zinc-500">{formatPercent(organic.repeatPurchaseRate)}</strong> Organic
//         </span>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/loyalty-intelligence/components/LoyaltyExecutiveSummaryCards.tsx

"use client";

import React from "react";
import {
  Users,
  Banknote,
  ShoppingBag,
  Repeat,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
} from "lucide-react";
import { LoyaltyExecutiveSummaryResponse } from "../actions/getLoyaltyExecutiveSummary";

// ================================================================
// ✅ HELPERS (With PKR Whole Rupee Rounding)
// ================================================================
// ✅ FIX: Math.round() eliminates raw floating decimals (.286) permanently!
const formatCurrency = (value: number): string => `Rs. ${Math.round(value || 0).toLocaleString('en-PK')}`;
const formatNumber = (value: number): string => Math.round(value || 0).toLocaleString('en-PK');
const formatPercent = (value: number): string => `${(value || 0).toFixed(1)}%`;

// ================================================================
// ✅ HELPER: Trend Icon
// ================================================================
const TrendIcon = ({ value }: { value: number }) => {
  if (value > 0) return <TrendingUp size={12} className="text-emerald-500" />;
  if (value < 0) return <TrendingDown size={12} className="text-red-500" />;
  return <Minus size={12} className="text-zinc-400" />;
};

// ================================================================
// ✅ SUB-COMPONENT: High-Density Metric Card
// ================================================================
interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  referredValue: number;
  organicValue: number;
  premium: number;
  format: (val: number) => string;
  isPercentage?: boolean;
}

const MetricCard = ({
  title,
  icon,
  referredValue,
  organicValue,
  premium,
  format,
  isPercentage = false,
}: MetricCardProps) => {
  const isPositive = premium > 0;
  const isNegative = premium < 0;

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0 font-mono">
      <div className="flex items-center gap-2 mb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0 shadow-2xs">
          {icon}
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 my-1">
        {/* Referred */}
        <div className="min-w-0">
          <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Referred</p>
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none mt-1 truncate">
            {format(referredValue)}
            {isPercentage && <span className="text-xs font-normal text-zinc-400 ml-0.5">%</span>}
          </p>
        </div>

        {/* Organic */}
        <div className="min-w-0">
          <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Organic</p>
          <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none mt-1 truncate">
            {format(organicValue)}
            {isPercentage && <span className="text-xs font-normal text-zinc-400 ml-0.5">%</span>}
          </p>
        </div>
      </div>

      {/* Premium Badge */}
      <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Uplift Premium</span>
        <div
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : isNegative
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
          }`}
        >
          <TrendIcon value={premium} />
          <span>{isPositive ? "+" : ""}{premium.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
interface LoyaltyExecutiveSummaryCardsProps {
  data: LoyaltyExecutiveSummaryResponse | null;
}

export default function LoyaltyExecutiveSummaryCards({
  data,
}: LoyaltyExecutiveSummaryCardsProps) {
  // Empty State
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse w-full">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-36 border border-zinc-200 dark:border-zinc-800"
          />
        ))}
      </div>
    );
  }

  const { referred, organic, comparison } = data;

  // Check if any data exists
  const hasData = referred.totalUsers > 0 || organic.totalUsers > 0;
  if (!hasData) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
          <Award size={32} />
        </div>
        <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">No Loyalty Data Available</h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
          Start referring customers to see how referral program impacts LTV, AOV, and retention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
          <Award size={12} /> REFERRAL PROGRAM IMPACT
        </span>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          {formatNumber(referred.totalUsers)} REFERRED • {formatNumber(organic.totalUsers)} ORGANIC
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. LTV (Lifetime Value) */}
        <MetricCard
          title="Lifetime Value (LTV)"
          icon={<Users size={16} />}
          referredValue={referred.lifetimeValue}
          organicValue={organic.lifetimeValue}
          premium={comparison.revenuePremium}
          format={(v) => formatCurrency(v)}
        />

        {/* 2. AOV (Average Order Value) */}
        <MetricCard
          title="Average Order Value (AOV)"
          icon={<ShoppingBag size={16} />}
          referredValue={referred.averageOrderValue}
          organicValue={organic.averageOrderValue}
          premium={comparison.aovPremium}
          format={(v) => formatCurrency(v)}
        />

        {/* 3. Repeat Purchase Rate */}
        <MetricCard
          title="Repeat Purchase Rate"
          icon={<Repeat size={16} />}
          referredValue={referred.repeatPurchaseRate}
          organicValue={organic.repeatPurchaseRate}
          premium={comparison.repeatPremium}
          format={(v) => v.toFixed(1)}
          isPercentage={true}
        />

        {/* 4. Revenue Impact Card */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0 font-mono">
          <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shrink-0 shadow-2xs">
              <Banknote size={16} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
              Revenue Impact
            </h3>
          </div>

          <div className="my-2 min-w-0">
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Extra Program Revenue</p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none mt-1 truncate">
              {formatCurrency(comparison.revenueImpact)}
            </p>
          </div>

          <div className="mt-2 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[9px]">
            <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase">LTV Premium</span>
            <span className={`font-bold ${comparison.revenuePremium > 0 ? "text-emerald-500" : "text-red-500"}`}>
              {comparison.revenuePremium > 0 ? "+" : ""}{comparison.revenuePremium}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Stats Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2.5">
        <span>
          <strong className="text-zinc-800 dark:text-zinc-200">{formatNumber(referred.totalUsers)}</strong> Referred Customers
        </span>
        <span className="text-zinc-300 dark:text-zinc-800">•</span>
        <span>
          <strong className="text-zinc-800 dark:text-zinc-200">{formatNumber(referred.totalOrders)}</strong> Referred Orders
        </span>
        <span className="text-zinc-300 dark:text-zinc-800">•</span>
        <span>
          <strong className="text-brand-primary">{formatCurrency(referred.totalRevenue)}</strong> Referred Revenue
        </span>
        <span className="text-zinc-300 dark:text-zinc-800">•</span>
        <span>
          Repeat Rate: <strong className="text-emerald-500">{formatPercent(referred.repeatPurchaseRate)}</strong> vs{" "}
          <strong className="text-zinc-500">{formatPercent(organic.repeatPurchaseRate)}</strong> Organic
        </span>
      </div>
    </div>
  );
}