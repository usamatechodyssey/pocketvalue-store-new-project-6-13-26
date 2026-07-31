// 📂 src/app/features/admin/reports/components/ReportPaginationSection.tsx (FULLY HARDENED & BOUNDED)

"use client";

import React from "react";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ================================================================
// ✅ TYPES
// ================================================================
interface ReportPaginationSectionProps {
  totalDocs: number;
  currentPage: number;
  limit: number;
  isLoading?: boolean;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function ReportPaginationSection({
  totalDocs,
  currentPage,
  limit,
  isLoading = false,
}: ReportPaginationSectionProps) {
  // ✅ FIX 1: Strict Non-zero Division Guard prevents Infinity-page rendering loops
  const safeLimit = limit > 0 ? limit : 20;

  // Calculate total pages safely
  const totalPages = Math.ceil(totalDocs / safeLimit);

  // Calculate range (e.g., "1-20 of 150")
  const start = (currentPage - 1) * safeLimit + 1;
  const end = Math.min(currentPage * safeLimit, totalDocs);

  // Loading State (Pulse skeleton)
  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-zinc-50/20 dark:bg-zinc-900/10 border-t border-zinc-150 dark:border-zinc-850 animate-pulse">
        <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
      </div>
    );
  }

  // Empty State (No records)
  if (totalDocs === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-zinc-50/20 dark:bg-zinc-900/10 border-t border-zinc-150 dark:border-zinc-850">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium font-mono">No records available.</p>
      </div>
    );
  }

  // Single page (No pagination controls needed)
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between p-4 bg-zinc-50/20 dark:bg-zinc-900/10 border-t border-zinc-150 dark:border-zinc-850 animate-in fade-in duration-300">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono">
          Showing <strong className="text-zinc-700 dark:text-zinc-300">{totalDocs}</strong> records
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Page 1 of 1</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-50/20 dark:bg-zinc-900/10 border-t border-zinc-150 dark:border-zinc-850 animate-in fade-in duration-300">
      {/* Left: Summary Text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium order-2 sm:order-1 font-mono">
        Showing <strong className="text-zinc-700 dark:text-zinc-300">{start}</strong> —{" "}
        <strong className="text-zinc-700 dark:text-zinc-300">{end}</strong> of{" "}
        <strong className="text-zinc-700 dark:text-zinc-300">{totalDocs.toLocaleString("en-PK")}</strong> records
      </p>

      {/* Right: Pagination Controls */}
      <div className="order-1 sm:order-2">
        <PaginationControls totalPages={totalPages} />
      </div>
    </div>
  );
}