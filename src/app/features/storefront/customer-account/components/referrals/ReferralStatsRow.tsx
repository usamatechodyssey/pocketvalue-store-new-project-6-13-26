// "use client";

// import React from "react";
// import { MousePointerClick, Users, ShoppingCart } from "lucide-react";

// interface ReferralStatsRowProps {
//   clicks: number;
//   totalSignups: number;
//   conversions: number;
// }

// // ✅ Enterprise Helper: Safe number formatting
// const formatNumber = (value: number | undefined | null): string => {
//   const num = Number(value) || 0;
//   return num.toLocaleString(); // e.g., 1234 -> "1,234"
// };

// export default function ReferralStatsRow({
//   clicks = 0,
//   totalSignups = 0,
//   conversions = 0,
// }: ReferralStatsRowProps) {
//   return (
//     <div className="grid grid-cols-3 gap-3">
      
//       {/* 🔵 KPI 1: Clicks (Blue Glow) */}
//       <div className="p-2.5 bg-blue-500/3 dark:bg-blue-500/1 border border-blue-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/20 hover:-translate-y-0.5 transition-all duration-300">
//         <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
//           <MousePointerClick size={14} />
//         </div>
//         <div className="min-w-0">
//           <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">Clicks</span>
//           <span className="text-xs font-bold text-gray-900 dark:text-white block mt-1 font-mono">{formatNumber(clicks)}</span>
//         </div>
//       </div>

//       {/* 🟣 KPI 2: Joined Friends (Purple Glow) */}
//       <div className="p-2.5 bg-purple-500/3 dark:bg-purple-500/1 border border-purple-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-500/20 hover:-translate-y-0.5 transition-all duration-300">
//         <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg shrink-0">
//           <Users size={14} />
//         </div>
//         <div className="min-w-0">
//           <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">Joined</span>
//           <span className="text-xs font-bold text-gray-900 dark:text-white block mt-1 font-mono">{formatNumber(totalSignups)}</span>
//         </div>
//       </div>

//       {/* 🟢 KPI 3: Verified Purchases (Emerald Glow) */}
//       <div className="p-2.5 bg-emerald-500/3 dark:bg-emerald-500/1 border border-emerald-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300">
//         <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
//           <ShoppingCart size={14} />
//         </div>
//         <div className="min-w-0">
//           <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">Purchases</span>
//           <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">{formatNumber(conversions)}</span>
//         </div>
//       </div>
      
//     </div>
//   );
// }
"use client";

import React from "react";
import { MousePointerClick, Users, ShoppingCart } from "lucide-react";

interface ReferralStatsRowProps {
  clicks: number;
  totalSignups: number;
  conversions: number;
}

const formatNumber = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return num.toLocaleString();
};

export default function ReferralStatsRow({
  clicks = 0,
  totalSignups = 0,
  conversions = 0,
}: ReferralStatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      
      {/* 🔵 KPI 1: Views */}
      <div className="p-2.5 bg-blue-500/3 dark:bg-blue-500/1 border border-blue-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/20 hover:-translate-y-0.5 transition-all duration-300">
        <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
          <MousePointerClick size={14} />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">
            Views
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block mt-1 font-mono">
            {formatNumber(clicks)}
          </span>
          {/* ✅ NEW TAGLINE */}
          <span className="text-[8px] text-gray-400 block mt-0.5 leading-none">
            Unique opens
          </span>
        </div>
      </div>

      {/* 🟣 KPI 2: Joined */}
      <div className="p-2.5 bg-purple-500/3 dark:bg-purple-500/1 border border-purple-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-500/20 hover:-translate-y-0.5 transition-all duration-300">
        <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg shrink-0">
          <Users size={14} />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">
            Joined
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block mt-1 font-mono">
            {formatNumber(totalSignups)}
          </span>
          {/* ✅ NEW TAGLINE */}
          <span className="text-[8px] text-gray-400 block mt-0.5 leading-none">
            New signups
          </span>
        </div>
      </div>

      {/* 🟢 KPI 3: Purchases */}
      <div className="p-2.5 bg-emerald-500/3 dark:bg-emerald-500/1 border border-emerald-500/10 rounded-xl flex items-center gap-2.5 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300">
        <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
          <ShoppingCart size={14} />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider leading-none">
            Purchases
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
            {formatNumber(conversions)}
          </span>
          {/* ✅ NEW TAGLINE */}
          <span className="text-[8px] text-gray-400 block mt-0.5 leading-none">
            Completed orders
          </span>
        </div>
      </div>
      
    </div>
  );
}