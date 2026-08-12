
// // 📂 src/app/features/admin/executive-kpi/components/StatCard.tsx (FULLY LOCALIZED, CLICKABLE & NO-UNDERLINE FIXED)

// "use client";

// import Link from 'next/link'; // ✅ Next.js Link imported for client-side instant routing
// import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   icon: LucideIcon;
//   trend?: number; // Percentage growth
//   subtext?: string;
//   colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
//   href?: string; // ✅ Optional routing path added
// }

// // ✅ ENTERPRISE FIX: Full class strings (Tailwind Purge Safe)
// const colorMap = {
//   primary: {
//     text: 'text-brand-primary',
//     bg: 'bg-brand-primary/10',
//     border: 'border-brand-primary/20',
//     glow: 'text-brand-primary',
//     indicator:'bg-indigo-500',
//   },
//   success: {
//     text: 'text-green-500',
//     bg: 'bg-green-500/10',
//     border: 'border-green-500/20',
//     glow: 'text-green-500',
//     indicator: 'bg-green-500',
//   },
//   warning: {
//     text: 'text-yellow-500',
//     bg: 'bg-yellow-500/10',
//     border: 'border-yellow-500/20',
//     glow: 'text-yellow-500',
//     indicator: 'bg-yellow-500',
//   },
//   error: {
//     text: 'text-red-500',
//     bg: 'bg-red-500/10',
//     border: 'border-red-500/20',
//     glow: 'text-red-500',
//     indicator: 'bg-red-500',
//   },
//   info: {
//     text: 'text-blue-500',
//     bg: 'bg-blue-500/10',
//     border: 'border-blue-500/20',
//     glow: 'text-blue-500',
//     indicator: 'bg-blue-500',
//   },
// };

// export default function AnalyticsStatCard({
//   title,
//   value,
//   icon: Icon,
//   trend,
//   subtext,
//   colorVariant = 'primary',
//   href, // ✅ Extracted href prop
// }: StatCardProps) {
//   const colors = colorMap[colorVariant];

//   // ✅ ENTERPRISE FIX: Trend icon & label (pure logic, no static values)
//   const getTrendInfo = () => {
//     if (trend === undefined) return null;
//     if (trend > 0) {
//       return {
//         icon: TrendingUp,
//         label: `${trend}%`,
//         className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
//       };
//     }
//     if (trend < 0) {
//       return {
//         icon: TrendingDown,
//         label: `${Math.abs(trend)}%`,
//         className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
//       };
//     }
//     return {
//       icon: Minus,
//       label: '0%',
//       className: 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400',
//     };
//   };

//   const trendInfo = getTrendInfo();

//   // Custom component wrapper
//   const Container = href ? Link : 'article';

//   return (
//     <Container
//       href={href || "#"}
//       // ✅ Added no-underline and hover:no-underline to bypass browser anchor styles
//       className="relative group block overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer no-underline hover:no-underline"
//       role={href ? "link" : "article"}
//       aria-label={`Stat Card: ${title}`}
//     >
//       {/* Background Decorative Glow (Dark Mode Only) */}
//       <div
//         className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colors.text}`}
//         aria-hidden="true"
//       />

//       <div className="flex justify-between items-start mb-4">
//         <div>
//           {/* ✅ Added no-underline on title text */}
//           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 no-underline">
//             {title}
//           </p>
//           {/* ✅ Added no-underline on value text */}
//           <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter no-underline">
//             {value}
//           </h3>
//         </div>

//         {/* Icon Wrapper */}
//         <div className={`p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
//           <Icon size={24} strokeWidth={2.5} className={colors.text} />
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {/* Trend Indicator (Dynamic) */}
//         {trendInfo && (
//           <div
//             className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full no-underline ${trendInfo.className}`}
//             aria-label={`Trend: ${trendInfo.label}`}
//             role="status"
//             aria-live="polite"
//           >
//             <trendInfo.icon size={12} />
//             {trendInfo.label}
//           </div>
//         )}

//         {subtext && (
//           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate italic no-underline">
//             {subtext}
//           </p>
//         )}
//       </div>

//       {/* Subtle Bottom Line Indicator */}
//       <div
//         className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colors.indicator}`}
//         aria-hidden="true"
//       />
//     </Container>
//   );
// }
// 📂 src/app/features/admin/executive-kpi/components/StatCard.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // Percentage growth
  subtext?: string;
  colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  href?: string;
}

const colorMap = {
  primary: {
    text: 'text-brand-primary dark:text-brand-primary',
    bg: 'bg-brand-primary/10',
    border: 'border-brand-primary/20',
    glow: 'bg-brand-primary/20',
    indicator: 'bg-brand-primary',
  },
  success: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'bg-emerald-500/20',
    indicator: 'bg-emerald-500',
  },
  warning: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'bg-amber-500/20',
    indicator: 'bg-amber-500',
  },
  error: {
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'bg-rose-500/20',
    indicator: 'bg-rose-500',
  },
  info: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'bg-blue-500/20',
    indicator: 'bg-blue-500',
  },
};

export default function AnalyticsStatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtext,
  colorVariant = 'primary',
  href,
}: StatCardProps) {
  const colors = colorMap[colorVariant] || colorMap.primary;

  const getTrendInfo = () => {
    if (trend === undefined) return null;
    if (trend > 0) {
      return {
        icon: TrendingUp,
        label: `${trend}%`,
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      };
    }
    if (trend < 0) {
      return {
        icon: TrendingDown,
        label: `${Math.abs(trend)}%`,
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      };
    }
    return {
      icon: Minus,
      label: '0%',
      className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700',
    };
  };

  const trendInfo = getTrendInfo();
  const Container = href ? Link : 'article';

  return (
    <Container
      href={href || "#"}
      className="relative group block overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer no-underline hover:no-underline flex-col justify-between min-w-0"
      role={href ? "link" : "article"}
      aria-label={`Stat Card: ${title}`}
    >
      {/* Ambient Glow Backdrop on Hover */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${colors.glow}`}
        aria-hidden="true"
      />

      <div>
        {/* Header: Title & Icon */}
        <div className="flex justify-between items-center gap-2 mb-3">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 no-underline leading-tight">
            {title}
          </p>
          <div className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs`}>
            <Icon size={18} className={colors.text} />
          </div>
        </div>

        {/* Value: High-Contrast Monospaced Typography */}
        <div className="min-w-0">
          <h3 className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50 tracking-tight no-underline leading-tight wrap-break-word">
            {value}
          </h3>
        </div>
      </div>

      {/* Subtext & Trend Row */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/80 flex items-center justify-between gap-2 flex-wrap">
        {trendInfo && (
          <div
            className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full no-underline shrink-0 ${trendInfo.className}`}
            aria-label={`Trend: ${trendInfo.label}`}
          >
            <trendInfo.icon size={11} />
            {trendInfo.label}
          </div>
        )}

        {subtext && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium font-sans leading-relaxed wrap-break-word flex-1 min-w-0">
            {subtext}
          </p>
        )}
      </div>

      {/* Bottom Accent Bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colors.indicator}`}
        aria-hidden="true"
      />
    </Container>
  );
}