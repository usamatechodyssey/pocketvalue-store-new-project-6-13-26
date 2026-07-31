// 📂 src/app/features/admin/product-intelligence/components/ProductIntelligenceContent.tsx

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from "@/sanity/lib/image";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Edit3,
  MousePointer2,
  PackageX,
  Loader2,
} from 'lucide-react';

// ✅ WORKSPACE STANDARD TOASTS
import { toastSuccess, toastError } from '@/app/shared/components/helpers/CustomToasts';

// ✅ ENTERPRISE IMPORTS
import {
  ProductIntelItem,
  getProductDrillDownPayload,
} from '@/app/features/admin/product-intelligence/actions/getProductIntelligence';
import ProductDrillDownModal from './ProductDrillDownModal';

// ================================================================
// ✅ PROPS INTERFACE
// ================================================================
interface ProductIntelligenceContentProps {
  data: ProductIntelItem[] | null | undefined;
}

export default function ProductIntelligenceContent({
  data,
}: ProductIntelligenceContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Empty State
  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-75 w-full">
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <PackageX size={32} />
          </div>
          <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Products Found
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            No products were sold in the selected date range, or no products match the applied filters.
          </p>
        </div>
      </div>
    );
  }

  // 🚀 Logic: Fetch product story and open modal
  const handleDrillDown = async (id: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await getProductDrillDownPayload(id);
      if (result) {
        setDrillDownData(result);
        setIsModalOpen(true);
        toastSuccess('Product audit data loaded!');
      } else {
        toastError('Failed to fetch product drill-down data.');
      }
    } catch (error) {
      toastError('Engine error while fetching product data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* TABLE CONTAINER (With Scroll Guard & Zero Squeezing) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="overflow-x-auto max-h-125 custom-scrollbar">
          <table
            className="w-full min-w-187.5 border-collapse text-left text-xs relative"
            role="table"
            aria-label="Product Intelligence Table"
          >
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Product / Intelligence</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Trend Pulse</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Revenue Share</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Return Risk</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Current Stock</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors group"
                >
                  {/* 1. Product Info - Clickable for Drill-down */}
                  <td
                    className="py-3 px-4 cursor-pointer whitespace-nowrap"
                    onClick={() => handleDrillDown(item.id)}
                    aria-label={`Drill down into ${item.name}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDrillDown(item.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            unoptimized
                            src={urlFor(item.image).url()}
                            alt={item.name}
                            fill
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <PackageX size={20} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-56 text-xs uppercase tracking-tight">
                            {item.name}
                          </p>
                          <MousePointer2
                            size={10}
                            className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                        </div>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-0.5">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Trend Pulse */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          item.trend === 'STAR'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : item.trend === 'FALLING'
                            ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {item.trend === 'STAR' ? (
                          <TrendingUp size={10} />
                        ) : item.trend === 'FALLING' ? (
                          <TrendingDown size={10} />
                        ) : (
                          <Minus size={10} />
                        )}
                        {item.growth > 0 ? `+${item.growth}%` : `${item.growth}%`}
                      </span>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">
                        {item.currentUnitsSold.toLocaleString('en-PK')} Units
                      </p>
                    </div>
                  </td>

                  {/* 3. Revenue & Share */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <p className="text-xs font-bold text-brand-primary font-mono">
                      Rs. {(item.revenue || 0).toLocaleString('en-PK')}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <div className="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-brand-primary"
                          style={{ width: `${Math.min(100, item.revenueContribution)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                        {item.revenueContribution}%
                      </span>
                    </div>
                  </td>

                  {/* 4. Return Risk */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                        item.returnRate > 15
                          ? 'text-red-500 bg-red-500/10 border-red-500/20'
                          : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.returnRate > 15 && <AlertCircle size={10} />}
                      {item.returnRate}% Returns
                    </span>
                  </td>

                  {/* 5. Inventory Risk */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-xs font-bold ${
                          item.currentStock <= 0
                            ? 'text-red-500 animate-pulse font-mono'
                            : 'text-zinc-700 dark:text-zinc-300 font-mono'
                        }`}
                      >
                        {item.currentStock.toLocaleString('en-PK')} Pcs
                      </span>
                      {item.trend === 'STAR' && item.currentStock < 10 && (
                        <span className="text-[8px] font-bold text-amber-500 uppercase mt-0.5">
                          High Demand Risk
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 6. Edit Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/collections/products/${item.id}`}
                      className="inline-flex items-center gap-1.5 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 hover:text-brand-primary rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors no-underline hover:no-underline"
                      aria-label={`Edit ${item.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Edit3 size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER DRILL-DOWN MODAL */}
      <ProductDrillDownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={drillDownData}
      />
    </div>
  );
}