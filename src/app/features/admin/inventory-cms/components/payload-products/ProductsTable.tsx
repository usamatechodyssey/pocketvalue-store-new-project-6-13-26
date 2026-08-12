// 📂 src/app/features/admin/inventory-cms/components/payload-products/ProductsTable.tsx (CYBER-HUD HARDENED)

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight, Edit3 } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";

// ================================================================
// ✅ INTERFACES
// ================================================================
export interface Variant {
  _key: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  stock?: number;
}

export interface AdminProductListItem {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  mainImage?: any;
  variantsCount: number;
  variants: Variant[];
}

// ✅ FIX 1: Explicitly enforces en-PK localized Pakistani rupee groupings
const formatPrice = (price?: number) => price != null ? `Rs. ${price.toLocaleString("en-PK")}` : "N/A";

// ================================================================
// 🚀 MAIN TABLE COMPONENT
// ================================================================
export default function ProductsTable({ products }: { products: AdminProductListItem[] }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return (
    <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <table className="w-full table-auto border-collapse text-xs">
        {/* TABLE HEADER */}
        <thead className="bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
          <tr className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
            <th className="w-12 px-4 py-3"></th>
            <th className="w-20 px-6 py-3 text-left">Image</th>
            <th className="px-6 py-3 text-left">Product Details</th>
            <th className="w-40 px-6 py-3 text-left">Price (Min)</th>
            <th className="w-40 px-6 py-3 text-left">Inventory</th>
            <th className="w-28 px-6 py-3 text-right">Action</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
          {products.map((product) => {
            const isExpanded = expandedRowId === product._id;
            return (
              <React.Fragment key={product._id}>
                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                  {/* Expand Accordion Trigger */}
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => setExpandedRowId(isExpanded ? null : product._id)} className="p-1 hover:text-brand-primary cursor-pointer transition-colors">
                      {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </button>
                  </td>
                  {/* Thumbnail Image */}
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                      {product.mainImage ? (
                        <Image 
                          src={urlFor(product.mainImage).url()} 
                          alt="" 
                          fill 
                          sizes="48px" 
                          className="object-contain p-1" 
                        />
                      ) : null}
                    </div>
                  </td>
                  {/* Product Title & ID */}
                  <td className="px-6 py-4 min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.title}</div>
                    <div className="text-[10px] mt-1 flex items-center font-mono opacity-50 uppercase tracking-wider">
                      ID: ...{product._id.slice(-8)} <CopyButton textToCopy={product._id} />
                    </div>
                  </td>
                  {/* Min Price */}
                  <td className="px-6 py-4 font-mono font-bold text-brand-primary text-sm">{formatPrice(product.price)}</td>
                  {/* Total Combined Variant Stocks */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider ${product.inStock ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
                      {product.stock} Units
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/collections/products/${product._id}`} 
                      className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline text-xs"
                    >
                      <Edit3 size={13}/> Edit
                    </Link>
                  </td>
                </tr>

                {/* EXPANDED ACCORDION ROW: VARIANTS SUB-TABLE */}
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="bg-zinc-50/50 dark:bg-zinc-900/10 px-8 py-3.5 border-t border-b border-zinc-100 dark:border-zinc-850">
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                        <table className="w-full text-[11px] font-mono">
                          <thead className="bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                              <th className="p-2 text-left">Variant Name & ID</th>
                              <th className="p-2 text-left">SKU</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-right">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                            {product.variants.map((v) => (
                              <tr key={v._key} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                                <td className="p-2">
                                  <div className="font-bold text-zinc-800 dark:text-zinc-200">{v.name}</div>
                                  <div className="text-[9px] opacity-40 flex items-center gap-1 mt-0.5">KEY: ...{v._key.slice(-8)} <CopyButton textToCopy={v._key} /></div>
                                </td>
                                <td className="p-2 text-zinc-500 dark:text-zinc-400">{v.sku || "---"}</td>
                                <td className="p-2 font-bold text-zinc-800 dark:text-zinc-200">{formatPrice(v.price)}</td>
                                <td className="p-2 text-right font-bold">
                                   <span className={v.inStock ? "text-emerald-500" : "text-red-500"}>{v.stock} pcs</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}