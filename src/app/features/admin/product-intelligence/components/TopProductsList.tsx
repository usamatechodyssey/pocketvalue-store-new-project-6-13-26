// 📂 src/app/features/admin/product-intelligence/components/TopProductsList.tsx

"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { Trophy, ArrowUpRight, PackageX, Flame } from 'lucide-react';
import type { TopProductItem } from '@/app/features/admin/product-intelligence/actions/getTopProducts';

export type { TopProductItem };

interface TopProductsListProps {
  products: TopProductItem[] | null | undefined;
}

export default function TopProductsList({ products }: TopProductsListProps) {
  const hasProducts = products && products.length > 0;

  // Max revenue calculation for progress fill bars
  const maxRevenue = useMemo(() => {
    if (!products || products.length === 0) return 1;
    return Math.max(...products.map((p) => p.revenue || 0), 1);
  }, [products]);

  // Empty State
  if (!hasProducts) {
    return (
      <div
        className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden"
        role="status"
        aria-label="No sales data available"
      >
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Trophy size={20} className="text-amber-500" /> MVP Products
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Top Performing Catalog List
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <PackageX size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">
              No Sales Telemetry
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans">
              No products sold in the selected audit range.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/product-intelligence"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            Open Product Intelligence <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Top 5 Best Selling Products"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Trophy size={20} className="text-amber-500" /> MVP Products
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Top Performing Catalog List
          </p>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
          <Flame size={10} /> TOP 5
        </span>
      </div>

      {/* PRODUCTS LIST WITH PROGRESS BARS & RANK BADGES */}
      <div className="space-y-2.5 my-2 flex-1" role="list">
        {products.slice(0, 5).map((p, i) => {
          const uniqueKey = `${p._id}-${p.variantName || 'default'}`;
          const shareOfTop = maxRevenue > 0 ? Number((((p.revenue || 0) / maxRevenue) * 100).toFixed(0)) : 0;

          // Rank Badge Styling (#01 = Gold, #02 = Silver, #03 = Bronze, etc.)
          const getRankBadge = (rank: number) => {
            if (rank === 0) return "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
            if (rank === 1) return "bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
            if (rank === 2) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
            return "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800";
          };

          return (
            <div
              key={uniqueKey}
              className="relative overflow-hidden p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs group/row hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors min-w-0"
              role="listitem"
            >
              {/* Subtle Progress Fill Background */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-amber-500/10 dark:bg-amber-500/15 opacity-80 pointer-events-none transition-all duration-500 rounded-2xl" 
                style={{ width: `${shareOfTop}%` }} 
              />

              {/* Product Title & Variant */}
              <div className="flex gap-3 items-center min-w-0 relative z-10">
                <span className={`font-mono font-black text-[10px] px-2 py-0.5 rounded-lg border shrink-0 ${getRankBadge(i)}`}>
                  #{String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight truncate">
                    {p.name}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 truncate">
                    {p.variantName || 'Default Variant'}
                  </p>
                </div>
              </div>

              {/* Revenue & Units Sold */}
              <div className="text-right shrink-0 relative z-10 font-mono">
                <p className="text-xs font-mono font-black text-brand-primary">
                  {p.totalSold} Sold
                </p>
                <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                  Rs. {(p.revenue || 0).toLocaleString('en-PK')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <Link
          href="/admin/product-intelligence"
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          aria-label="Open Product Intelligence Hub for detailed analysis"
        >
          Open Product Intelligence <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}