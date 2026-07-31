// "use client";

// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import { Search } from "lucide-react";
// import { useDebouncedCallback } from "use-debounce";
// // ✅ Import from centralized utility
// import { ADMIN_STATUSES } from "@/app/shared/utils/adminOrderDisplayUtils";

// export default function AdminOrderFilters() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const currentStatus = searchParams.get("status") || "All";
//   const currentSearchTerm = searchParams.get("search") || "";

//   const updateUrl = (newParams: Record<string, string>) => {
//     const params = new URLSearchParams(searchParams.toString());
//     Object.entries(newParams).forEach(([key, value]) => {
//       if (value && value !== "All") params.set(key, value);
//       else params.delete(key);
//     });
//     if (newParams.page === "1") params.delete("page");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const debouncedSearch = useDebouncedCallback((value: string) => {
//     updateUrl({ page: "1", search: value });
//   }, 500);

//   return (
//     <div className="flex flex-col md:flex-row gap-4">
//       <div className="grow relative">
//         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//         <input
//           type="text"
//           defaultValue={currentSearchTerm}
//           onChange={(e) => debouncedSearch(e.target.value)}
//           placeholder="Search by Order ID, Customer..."
//           className="appearance-none block w-full rounded-md border-0 py-2 px-3.5 pl-11 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 sm:text-sm"
//         />
//       </div>
//       <div className="flex gap-2 overflow-x-auto pb-2">
//         {ADMIN_STATUSES.map((tab) => (
//           <button key={tab} onClick={() => updateUrl({ page: "1", status: tab })} className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${currentStatus === tab ? "bg-brand-primary text-white" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"}`}>
//             {tab}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
// ✅ Import from centralized utility
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

  // Dropdown ke bahar click karne se menu band ho jaye
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
    setIsOpen(false); // Status select hone par dropdown band ho jaye
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* 1. Search Bar: (flex-1 lagane se yeh har screen size par auto-adjust hoga) */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          defaultValue={currentSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          placeholder="Search by Order ID, Customer..."
          className="appearance-none block w-full rounded-md border-0 py-2 px-3.5 pl-10 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 sm:text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
        />
      </div>

      {/* 2. Custom Status Dropdown */}
      <div className="relative shrink-0 w-full sm:w-56" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full rounded-md border-0 py-2 px-3.5 bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none"
        >
          <span className="truncate">
            Status: <span className="font-semibold text-brand-primary">{currentStatus}</span>
          </span>
          <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="py-1">
              {ADMIN_STATUSES.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleStatusSelect(tab)}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentStatus === tab
                      ? "bg-brand-primary text-white font-semibold"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
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