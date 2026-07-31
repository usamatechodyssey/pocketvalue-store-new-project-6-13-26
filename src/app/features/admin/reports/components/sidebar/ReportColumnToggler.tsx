// 📂 src/app/features/admin/reports/components/sidebar/ReportColumnToggler.tsx

"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { ReportColumn } from "../../configs/reportConfigs";

interface ReportColumnTogglerProps {
  columns: ReportColumn[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
}

export default function ReportColumnToggler({
  columns,
  visibleColumns,
  onToggleColumn,
}: ReportColumnTogglerProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-brand-primary transition-colors cursor-pointer select-none"
      >
        <span className="flex items-center gap-1.5">
          {isOpen ? <Eye size={13} /> : <EyeOff size={13} />}
          Manage Columns
        </span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {columns.map((col) => {
            const isVisible = visibleColumns.has(col.key);
            return (
              <label
                key={col.key}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleColumn(col.key)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
                <span
                  className={`text-xs font-semibold transition-all ${
                    isVisible
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-600 line-through font-normal"
                  }`}
                >
                  {col.label}
                </span>
                <span className="ml-auto text-[8px] text-zinc-400 dark:text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 px-1 py-0.5 rounded">
                  {col.format}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}