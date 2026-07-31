// 📂 src/app/features/admin/loyalty-intelligence/components/InactiveCustomerList.tsx

"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Loader2,
  Mail,
  Download,
  ChevronDown,
  UserX,
  Crown,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import {
  InactiveCustomer,
  getInactiveCustomers,
  sendReactivationEmail,
} from "../actions/getInactiveCustomers";

// ================================================================
// ✅ TYPES
// ================================================================
interface InactiveCustomerListProps {
  initialData: {
    customers: InactiveCustomer[];
    totalDocs: number;
    totalPages: number;
    summary: {
      totalInactive: number;
      highValue: number;
      mediumValue: number;
      lowValue: number;
    };
  };
}

// ================================================================
// ✅ HELPERS (With en-PK Localizations)
// ================================================================
const formatCurrency = (value: number) => `Rs. ${(value || 0).toLocaleString('en-PK')}`;
const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-PK') : "N/A";

const getSegmentBadge = (segment: string) => {
  switch (segment) {
    case "high-value":
      return (
        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1">
          <Crown size={10} /> High VIP
        </span>
      );
    case "medium-value":
      return (
        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-mono font-bold uppercase">
          Medium
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20 rounded-full text-[9px] font-mono font-bold uppercase">
          Standard
        </span>
      );
  }
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function InactiveCustomerList({ initialData }: InactiveCustomerListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState(initialData.customers);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [summary, setSummary] = useState(initialData.summary);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [isEmailSending, setIsEmailSending] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentSegment = searchParams.get("segment") || "all";

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value) params.set("search", value);
    else params.delete("search");
    router.replace(`?${params.toString()}`);
  }, 400);

  // Fetch data on filter change
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getInactiveCustomers({
        page: currentPage,
        limit: 20,
        segment: currentSegment as any,
        searchTerm: currentSearch,
      });
      setCustomers(result.customers);
      setTotalPages(result.totalPages);
      setSummary(result.summary);
      setSelectedCustomers(new Set());
    } catch (error) {
      toastError("Failed to load inactive customers.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentSearch, currentSegment]);

  // Segment filter handler
  const handleSegmentChange = (segment: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (segment !== "all") params.set("segment", segment);
    else params.delete("segment");
    router.replace(`?${params.toString()}`);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c._id)));
    }
  };

  // Toggle single selection
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedCustomers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCustomers(newSet);
  };

  // Send reactivation emails
  const handleSendEmails = async () => {
    if (selectedCustomers.size === 0) {
      toastError("Please select at least one customer.");
      return;
    }

    setIsEmailSending(true);
    try {
      const result = await sendReactivationEmail(Array.from(selectedCustomers));
      if (result.success) {
        toastSuccess(result.message);
        setSelectedCustomers(new Set());
        await fetchData();
      } else {
        toastError(result.message);
      }
    } catch (error) {
      toastError("Failed to send emails.");
    } finally {
      setIsEmailSending(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    const params = new URLSearchParams({
      segment: currentSegment,
      search: currentSearch,
    });
    window.open(`/api/admin/export-inactive-customers?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0">
            <UserX size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Total Inactive</p>
            <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{summary.totalInactive.toLocaleString('en-PK')}</p>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shrink-0">
            <Crown size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">High Value VIP</p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{summary.highValue.toLocaleString('en-PK')}</p>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Medium Value</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{summary.mediumValue.toLocaleString('en-PK')}</p>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Standard Tier</p>
            <p className="text-lg font-black text-zinc-700 dark:text-zinc-300 mt-0.5">{summary.lowValue.toLocaleString('en-PK')}</p>
          </div>
        </div>
      </div>

      {/* 🔍 FILTERS & ACTIONS BAR */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              defaultValue={currentSearch}
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-brand-primary"
              aria-label="Search inactive customers"
            />
          </div>

          {/* Segment Filter */}
          <div className="relative">
            <select
              value={currentSegment}
              onChange={(e) => handleSegmentChange(e.target.value)}
              className="pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 appearance-none focus:outline-hidden focus:border-brand-primary cursor-pointer"
              aria-label="Filter by customer segment"
            >
              <option value="all">All Segments</option>
              <option value="high-value">High Value VIP</option>
              <option value="medium-value">Medium Value</option>
              <option value="low-value">Standard Tier</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedCustomers.size > 0 && (
            <button
              onClick={handleSendEmails}
              disabled={isEmailSending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-500/20"
              aria-label={`Send reactivation emails to ${selectedCustomers.size} selected customers`}
            >
              {isEmailSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {isEmailSending ? "Sending..." : `Reactivate (${selectedCustomers.size})`}
            </button>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-zinc-200 dark:border-zinc-800 cursor-pointer"
            aria-label="Export inactive customers to CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* 📋 TABLE CONTAINER (With Scroll Guard) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 font-mono">
            <UserX size={40} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xs font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200">No Inactive Customers Found</p>
            <p className="text-[10px] text-zinc-500 mt-1">All customers match recent active purchase filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
            <table className="w-full min-w-187.5 border-collapse text-left text-xs relative" role="table">
              <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
                <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  <th className="py-3 px-4 w-10 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.size === customers.length && customers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
                      aria-label="Select all customers"
                    />
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Segment</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Orders</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Total Spend</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Last Order</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Days Inactive</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Emails Sent</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer._id)}
                        onChange={() => toggleSelect(customer._id)}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
                        aria-label={`Select ${customer.name}`}
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                          <Image
                            src={customer.image || "/default-avatar.png"}
                            alt={customer.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{customer.name}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">{getSegmentBadge(customer.segment)}</td>
                    <td className="py-3 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {customer.orderCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand-primary whitespace-nowrap">
                      {formatCurrency(customer.totalSpend)}
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {formatDate(customer.lastOrderDate)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          customer.daysSinceLastOrder > 180
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : customer.daysSinceLastOrder > 60
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {customer.daysSinceLastOrder}d
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {customer.reactivationEmailsSent}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/users-explorer/${customer._id}`}
                        className="text-brand-primary hover:underline text-[10px] font-bold no-underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📄 PAGINATION */}
        {totalPages > 1 && (
          <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 p-4 bg-white/50 dark:bg-zinc-950/50 flex justify-center">
            <PaginationControls totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}