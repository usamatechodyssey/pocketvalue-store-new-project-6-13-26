// 📂 src/app/features/admin/product-intelligence/components/TopProductsList.tsx

"use client";


import Link from 'next/link';
import { Trophy, ArrowUpRight, PackageX } from 'lucide-react';
import type { TopProductItem } from '@/app/features/admin/product-intelligence/actions/getTopProducts';

// ================================================================
// ✅ RE-EXPORT TYPE FROM ACTION (Single source of truth)
// ================================================================
export type { TopProductItem };

interface TopProductsListProps {
  products: TopProductItem[] | null | undefined;
}

export default function TopProductsList({ products }: TopProductsListProps) {
  const hasProducts = products && products.length > 0;

  // ✅ Empty State
  if (!hasProducts) {
    return (
      <div
        className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center h-full min-h-55"
        role="status"
        aria-label="No sales data available"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <PackageX size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Product Sales Telemetry
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No products sold in the selected audit range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 w-full h-full flex flex-col justify-between min-w-0 animate-in fade-in duration-300"
      role="region"
      aria-label="Top 5 Best Selling Products"
    >
      {/* Top Action Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
          <Trophy size={11} /> TOP 5 MVP PRODUCTS
        </span>
      </div>

      {/* PRODUCTS LIST */}
      <div className="space-y-2.5 flex-1 min-w-0" role="list">
        {products.map((p, i) => {
          const uniqueKey = `${p._id}-${p.variantName || 'default'}`;

          return (
            <div
              key={uniqueKey}
              className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group/item min-w-0"
              role="listitem"
            >
              <div className="flex gap-3 items-center min-w-0">
                <span className="font-mono font-black italic text-zinc-400 dark:text-zinc-500 text-xs shrink-0">
                  #{String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 uppercase tracking-tight">
                    {p.name}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 truncate">
                    {p.variantName || 'Default Variant'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono font-bold text-brand-primary">
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
      <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <Link
          href="/admin/product-intelligence"
          className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-brand-primary transition-all cursor-pointer no-underline hover:no-underline"
          aria-label="Open Product Intelligence Hub for detailed analysis"
        >
          Open Intelligence Hub <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}