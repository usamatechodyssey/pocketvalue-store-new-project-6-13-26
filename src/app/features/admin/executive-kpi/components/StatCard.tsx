// // src/app/features/admin/executive-kpi/components/StatCard.tsx

// "use client";

// import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   icon: LucideIcon;
//   trend?: number; // Percentage growth
//   subtext?: string;
//   colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
// }

// // ✅ ENTERPRISE FIX: Full class strings (Tailwind Purge Safe)
// const colorMap = {
//   primary: {
//     text: 'text-brand-primary',
//     bg: 'bg-brand-primary/10',
//     border: 'border-brand-primary/20',
//     glow: 'text-brand-primary',
//     indicator: 'bg-brand-primary',
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

//   return (
//     <article
//       className="relative group overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//       role="article"
//       aria-label={`Stat Card: ${title}`}
//     >
//       {/* Background Decorative Glow (Dark Mode Only) */}
//       <div
//         className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colors.text}`}
//         aria-hidden="true"
//       />

//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
//             {title}
//           </p>
//           <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
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
//             className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${trendInfo.className}`}
//             aria-label={`Trend: ${trendInfo.label}`}
//             role="status"
//             aria-live="polite"
//           >
//             <trendInfo.icon size={12} />
//             {trendInfo.label}
//           </div>
//         )}

//         {subtext && (
//           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate italic">
//             {subtext}
//           </p>
//         )}
//       </div>

//       {/* Subtle Bottom Line Indicator */}
//       <div
//         className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colors.indicator}`}
//         aria-hidden="true"
//       />
//     </article>
//   );
// }
// 📂 src/app/features/admin/executive-kpi/components/StatCard.tsx (FULLY LOCALIZED, CLICKABLE & NO-UNDERLINE FIXED)

"use client";

import Link from 'next/link'; // ✅ Next.js Link imported for client-side instant routing
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // Percentage growth
  subtext?: string;
  colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  href?: string; // ✅ Optional routing path added
}

// ✅ ENTERPRISE FIX: Full class strings (Tailwind Purge Safe)
const colorMap = {
  primary: {
    text: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    border: 'border-brand-primary/20',
    glow: 'text-brand-primary',
    indicator:'bg-indigo-500',
  },
  success: {
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'text-green-500',
    indicator: 'bg-green-500',
  },
  warning: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'text-yellow-500',
    indicator: 'bg-yellow-500',
  },
  error: {
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'text-red-500',
    indicator: 'bg-red-500',
  },
  info: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'text-blue-500',
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
  href, // ✅ Extracted href prop
}: StatCardProps) {
  const colors = colorMap[colorVariant];

  // ✅ ENTERPRISE FIX: Trend icon & label (pure logic, no static values)
  const getTrendInfo = () => {
    if (trend === undefined) return null;
    if (trend > 0) {
      return {
        icon: TrendingUp,
        label: `${trend}%`,
        className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      };
    }
    if (trend < 0) {
      return {
        icon: TrendingDown,
        label: `${Math.abs(trend)}%`,
        className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      };
    }
    return {
      icon: Minus,
      label: '0%',
      className: 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400',
    };
  };

  const trendInfo = getTrendInfo();

  // Custom component wrapper
  const Container = href ? Link : 'article';

  return (
    <Container
      href={href || "#"}
      // ✅ Added no-underline and hover:no-underline to bypass browser anchor styles
      className="relative group block overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer no-underline hover:no-underline"
      role={href ? "link" : "article"}
      aria-label={`Stat Card: ${title}`}
    >
      {/* Background Decorative Glow (Dark Mode Only) */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colors.text}`}
        aria-hidden="true"
      />

      <div className="flex justify-between items-start mb-4">
        <div>
          {/* ✅ Added no-underline on title text */}
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 no-underline">
            {title}
          </p>
          {/* ✅ Added no-underline on value text */}
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter no-underline">
            {value}
          </h3>
        </div>

        {/* Icon Wrapper */}
        <div className={`p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
          <Icon size={24} strokeWidth={2.5} className={colors.text} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Trend Indicator (Dynamic) */}
        {trendInfo && (
          <div
            className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full no-underline ${trendInfo.className}`}
            aria-label={`Trend: ${trendInfo.label}`}
            role="status"
            aria-live="polite"
          >
            <trendInfo.icon size={12} />
            {trendInfo.label}
          </div>
        )}

        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate italic no-underline">
            {subtext}
          </p>
        )}
      </div>

      {/* Subtle Bottom Line Indicator */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colors.indicator}`}
        aria-hidden="true"
      />
    </Container>
  );
}