// 📂 src/app/features/admin/reports/components/sidebar/ReportSidebarHeader.tsx

"use client";

import { Settings2 } from "lucide-react";

interface ReportSidebarHeaderProps {
  reportName: string;
  visibleCount: number;
  totalCount: number;
}

export default function ReportSidebarHeader({
  reportName,
  visibleCount,
  totalCount,
}: ReportSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150 dark:border-zinc-850">
      <div className="flex items-center gap-2">
        <Settings2 size={14} className="text-brand-primary stroke-[2.2px]" />
        <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          {reportName} settings
        </span>
      </div>
      <span className="text-[9px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded shadow-2xs">
        {visibleCount}/{totalCount}
      </span>
    </div>
  );
}