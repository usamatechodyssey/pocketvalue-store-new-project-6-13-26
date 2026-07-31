"use client";

import React from "react";
import Link from "next/link";
import { Edit3, FolderTree, Package } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string } | null;
  subCategoryCount: number;
  productCount: number;
}

export default function CategoryExplorerTable({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr className="text-gray-500 dark:text-gray-400">
            <th className="p-4 text-left font-semibold uppercase tracking-wider">Category Info</th>
            <th className="p-4 text-left font-semibold uppercase tracking-wider">Parent</th>
            <th className="p-4 text-center font-semibold uppercase tracking-wider">Sub-Cats</th>
            <th className="p-4 text-center font-semibold uppercase tracking-wider">Products</th>
            <th className="p-4 text-right font-semibold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td className="p-4">
                <div className="font-bold text-gray-900 dark:text-white">{cat.name}</div>
                <div className="text-[10px] font-mono opacity-50 uppercase mt-0.5">{cat.slug}</div>
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">
                {cat.parent ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                    <FolderTree size={12}/> {cat.parent.name}
                  </span>
                ) : <span className="text-xs opacity-30 italic">No Parent</span>}
              </td>
              <td className="p-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                {cat.subCategoryCount}
              </td>
              <td className="p-4 text-center font-mono font-bold text-green-600 dark:text-green-400">
                {cat.productCount}
              </td>
              <td className="p-4 text-right">
                <Link href={`/admin/collections/categories/${cat._id}`} className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:underline">
                  <Edit3 size={14}/> Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}