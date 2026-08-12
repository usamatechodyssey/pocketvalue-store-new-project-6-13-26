// 📂 src/app/features/admin/order-fulfillment/components/orders/AdminOrderFilters.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { ADMIN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

export default function AdminOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown open/close state
  const [isOpen, setIsOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "All";
  const currentSearchTerm = searchParams.get("search") || "";

  // Dropdown click-outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "All") params.set(key, value);
      else params.delete(key);
    });
    if (newParams.page === "1") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateUrl({ page: "1", search: value });
  }, 500);

  const handleStatusSelect = (tab: string) => {
    updateUrl({ page: "1", status: tab });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* 1. Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 stroke-[2.2px]" size={16} />
        <input
          type="text"
          defaultValue={currentSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          placeholder="Search by Order ID, Customer name, phone..."
          className="appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 pl-10 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
        />
      </div>

      {/* 2. Custom Status Dropdown */}
      <div className="relative shrink-0 w-full sm:w-60" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-hidden cursor-pointer"
        >
          <span className="truncate">
            Status: <span className="text-brand-primary uppercase">{currentStatus}</span>
          </span>
          <ChevronDown className={`ml-2 h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1.5 animate-in fade-in duration-150">
            <div className="space-y-0.5 font-mono">
              {ADMIN_STATUSES.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleStatusSelect(tab)}
                  className={`flex items-center w-full text-left px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                    currentStatus === tab
                      ? "bg-brand-primary text-white font-bold shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}