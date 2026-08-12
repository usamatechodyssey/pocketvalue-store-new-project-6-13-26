// 📂 src/app/features/admin/inventory-cms/components/categories/CategoryExplorerTable.tsx (FULLY HARDENED & COMPILER FIXED)

"use client";

import React from "react";
import Link from "next/link";
import { Edit3, FolderTree } from "lucide-react";

// ================================================================
// ✅ INTERFACES (Added 'export' to prevent ts2614 compile errors)
// ================================================================
export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string } | null;
  subCategoryCount: number;
  productCount: number;
}

// ================================================================
// 🚀 MAIN TABLE COMPONENT
// ================================================================
export default function CategoryExplorerTable({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden lg:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <table className="w-full text-xs border-collapse">
        {/* TABLE HEADER */}
        <thead className="bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
          <tr className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
            <th className="p-4 text-left">Category Info</th>
            <th className="p-4 text-left">Parent</th>
            <th className="p-4 text-center">Sub-Cats</th>
            <th className="p-4 text-center">Products</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
              {/* Category Title & Slug */}
              <td className="p-4 min-w-0">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</div>
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider mt-0.5">{cat.slug}</div>
              </td>
              {/* Parent Category Badge */}
              <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono">
                {cat.parent ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase">
                    <FolderTree size={12} className="text-brand-primary"/> {cat.parent.name}
                  </span>
                ) : (
                  <span className="text-[10px] opacity-35 italic normal-case font-sans">No Parent</span>
                )}
              </td>
              {/* Subcategories count */}
              <td className="p-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                {cat.subCategoryCount}
              </td>
              {/* Products count */}
              <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {cat.productCount}
              </td>
              {/* Action Edit Link */}
              <td className="p-4 text-right">
                <Link 
                  href={`/admin/collections/categories/${cat._id}`} 
                  className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline text-xs"
                >
                  <Edit3 size={13}/> Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}