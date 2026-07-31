// src/app/components/payload-products/ProductsLoadingSkeleton.tsx
import React from 'react';

const SkeletonRow = () => (
    <tr className="animate-pulse">
      {/* Expand button column */}
      <td className="px-4 py-4 text-center"><div className="h-5 w-5 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
      {/* Image column */}
      <td className="px-6 py-4"><div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700"></div></td>
      {/* Title/ID column */}
      <td className="px-6 py-4">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2"></div>
        <div className="h-3 w-1/4 rounded bg-gray-100 dark:bg-gray-800"></div>
      </td>
      {/* Price column */}
      <td className="px-6 py-4"><div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      {/* Stock column */}
      <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
      {/* Action column */}
      <td className="px-6 py-4 text-right"><div className="h-4 w-12 ml-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
    </tr>
);

export default function ProductsLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
      
      {/* Search Bar Skeleton */}
      <div className="relative animate-pulse">
        <div className="h-11 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50"></div>
      </div>

      {/* Mobile View Skeleton (Cards) */}
      <div className="lg:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border dark:border-gray-700 animate-pulse">
            <div className="flex gap-4">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="grow space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-700/50"></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between">
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700"></div>
                <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View Skeleton (Table) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="w-12 px-4 py-3"></th>
              <th className="w-20 px-6 py-3"></th>
              <th className="px-6 py-3"></th>
              <th className="w-40 px-6 py-3"></th>
              <th className="w-40 px-6 py-3"></th>
              <th className="w-28 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}