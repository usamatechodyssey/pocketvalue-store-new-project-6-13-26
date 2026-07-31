// 📂 src/app/features/admin/reports/components/ReportTableSection.tsx (FULLY LOCALIZED & HYDRATION SAFE)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ReportColumn, ReportColumnFormat } from "../configs/reportConfigs";

// ================================================================
// ✅ TYPES
// ================================================================
interface ReportTableSectionProps {
  data: any[]; // Array of rows
  columns: ReportColumn[];
  totals?: any; // Grand totals object (optional)
  isLoading?: boolean;
  emptyMessage?: string;
}

// ================================================================
// 🔧 HELPERS: Localized PK Formatting
// ================================================================
const formatValue = (value: any, formatType: ReportColumnFormat, isMounted: boolean): string => {
  if (value === null || value === undefined) return "—";

  switch (formatType) {
    case "currency":
      // Enforces strict Pakistani comma grouping (Lakhs/Crores)
      return `Rs. ${new Intl.NumberFormat("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value))}`;

    case "percentage":
      return `${Number(value).toFixed(1)}%`;

    case "number":
      return Number(value).toLocaleString("en-PK");

    case "date":
      // SSR Hydration Safeguard: Render ISO raw date until client mounts safely
      if (!isMounted) return String(value).split("T")[0];
      return new Date(value).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

    case "text":
    case "string":
    default:
      return String(value);
  }
};

const getAlignClass = (align: "left" | "center" | "right" = "left") => {
  switch (align) {
    case "center": return "text-center";
    case "right": return "text-right";
    default: return "text-left";
  }
};

// ================================================================
// 🚀 MAIN COMPONENT (Cyber-HUD High-Density Spec)
// ================================================================
export default function ReportTableSection({
  data,
  columns,
  totals,
  isLoading = false,
  emptyMessage = "No data available for the selected period.",
}: ReportTableSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // SSR Hydration mount registration
  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleColumns = useMemo(() => columns.filter((col) => col.visible !== false), [columns]);

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sort Data (Clean native sorting)
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [data, sortKey, sortDirection]);

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State (Dashed HUD Style)
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/10 p-12 text-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl shadow-2xs">
            <span className="text-xl">📊</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No Data Available
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {emptyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          
          {/* TABLE HEADER */}
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider select-none ${
                    col.sortable !== false ? "cursor-pointer hover:text-brand-primary transition-colors" : ""
                  } ${getAlignClass(col.align)}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={col.width ? { minWidth: col.width } : undefined}
                >
                  <div className="flex items-center gap-1 justify-between">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span className="text-zinc-300 dark:text-zinc-600">
                        {sortKey === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp size={11} className="stroke-[2.5px]" />
                          ) : (
                            <ArrowDown size={11} className="stroke-[2.5px]" />
                          )
                        ) : (
                          <ArrowUpDown size={11} className="stroke-[2.5px]" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors"
              >
                {visibleColumns.map((col) => {
                  const isNumeric = col.format === "currency" || col.format === "percentage" || col.format === "number";
                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium ${
                        isNumeric ? "font-mono tracking-tight" : ""
                      } ${getAlignClass(col.align)}`}
                    >
                      {formatValue(row[col.key], col.format, mounted)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* GRAND TOTALS FOOTER */}
          {totals && (
            <tfoot>
              <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 border-t-2 border-zinc-200 dark:border-zinc-700">
                {visibleColumns.map((col, index) => {
                  if (index === 0) {
                    return (
                      <td
                        key={col.key}
                        className="py-3 px-4 text-xs font-bold text-zinc-900 dark:text-zinc-100"
                      >
                        Totals
                      </td>
                    );
                  }
                  
                  const totalValue = totals[col.key];
                  const isNumeric = col.format === "currency" || col.format === "percentage" || col.format === "number";
                  
                  if (totalValue !== undefined && totalValue !== null) {
                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-4 text-xs font-bold text-brand-primary dark:text-brand-primary/80 ${
                          isNumeric ? "font-mono tracking-tight" : ""
                        } ${getAlignClass(col.align)}`}
                      >
                        {formatValue(totalValue, col.format, mounted)}
                      </td>
                    );
                  }
                  
                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-4 ${getAlignClass(col.align)}`}
                    >
                      —
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}