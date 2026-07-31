// src/app/account/orders/_components/OrderFilters.tsx (UPDATED)

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from 'use-debounce';

const inputStyles = "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

export default function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('search') || '';
  
  const handleUpdateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/account/orders?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value) => {
    handleUpdateParams('search', value);
  }, 500);

  return (
    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
      <div className="relative grow w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by Order ID (e.g., PV-1001)"
          defaultValue={currentSearch}
          onChange={(e) => debouncedSearch(e.target.value)}
          className={`${inputStyles} pl-10`}
          aria-label="Search Orders"
        />
      </div>
      <select
        value={currentStatus}
        onChange={(e) => handleUpdateParams('status', e.target.value)}
        className={`${inputStyles} w-full sm:w-auto`}
        aria-label="Filter by status"
      >
        <option value="all">All Statuses</option>
        {/* ✅ FIX: Customer-Friendly Statuses */ }
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Returned to Sender">Returned to Sender</option>
        <option value="Return Initiated">Return Initiated</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}