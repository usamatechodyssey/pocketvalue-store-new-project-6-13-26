// src/app/features/admin/inventory-cms/components/InventoryRiskContent.tsx

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Edit3, PackageSearch, AlertCircle } from 'lucide-react';

export interface InventoryRiskItem {
  productId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  currentStock: number;
  image?: string | null;
}

interface InventoryRiskContentProps {
  data: InventoryRiskItem[] | null | undefined;
  lowStockThreshold?: number;
}

export default function InventoryRiskContent({
  data,
  lowStockThreshold = 5,
}: InventoryRiskContentProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="py-20 text-center">
          <PackageSearch size={64} className="mx-auto opacity-10 mb-6" />
          <h3 className="text-xl font-black text-gray-800 dark:text-gray-200">
            All inventory levels are safe
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            No products are currently below the {lowStockThreshold} units threshold.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Inventory status: Healthy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
      role="region"
      aria-label="Inventory Risk Table"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" role="table">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-4 text-left" scope="col">Product / Variant</th>
              <th className="p-4 text-left" scope="col">SKU</th>
              <th className="p-4 text-center" scope="col">Current Stock</th>
              <th className="p-4 text-center" scope="col">Status</th>
              <th className="p-4 text-right" scope="col">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((item) => {
              const uniqueKey = `${item.productId}-${item.sku || item.variantName}`;

              return (
                <tr
                  key={uniqueKey}
                  className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={`${item.productTitle} - ${item.variantName}`}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <AlertCircle size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold dark:text-white line-clamp-1">
                          {item.productTitle}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                          {item.variantName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs opacity-60">
                    {item.sku || 'N/A'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-lg font-black text-red-600">
                      {item.currentStock}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1">PCS</span>
                  </td>
                  <td className="p-4 text-center">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[9px] font-black uppercase"
                      role="status"
                      aria-label="Critical Stock Status"
                    >
                      <AlertTriangle size={12} />
                      Stock Critical
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/collections/products/${item.productId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs font-bold text-brand-primary hover:shadow-md transition-all hover:bg-brand-primary hover:text-white hover:border-brand-primary group"
                      aria-label={`Update stock for ${item.productTitle} - ${item.variantName}`}
                    >
                      <Edit3 size={14} className="group-hover:text-white" />
                      Update Stock
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}