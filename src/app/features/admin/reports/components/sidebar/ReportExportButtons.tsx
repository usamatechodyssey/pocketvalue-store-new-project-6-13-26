// 📂 src/app/features/admin/reports/components/sidebar/ReportExportButtons.tsx

"use client";

import React from "react";
import { FileSpreadsheet, FileText, RefreshCw } from "lucide-react";

interface ReportExportButtonsProps {
  onExportExcel?: () => Promise<void>;
  onExportPdf?: () => Promise<void>;
  isExporting: boolean;
  isDisabled?: boolean;
}

export default function ReportExportButtons({
  onExportExcel,
  onExportPdf,
  isExporting,
  isDisabled = false,
}: ReportExportButtonsProps) {
  const handleExport = async (type: "excel" | "pdf") => {
    if (isExporting) return;
    try {
      if (type === "excel" && onExportExcel) {
        await onExportExcel();
      } else if (type === "pdf" && onExportPdf) {
        await onExportPdf();
      }
    } catch (error) {
      console.error(`Export failed (${type}):`, error);
    }
  };

  return (
    <div className="pt-3.5 border-t border-zinc-150 dark:border-zinc-850 space-y-2.5">
      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Export Document</p>
      <div className="grid grid-cols-2 gap-2">
        {/* Excel Button */}
        <button
          onClick={() => handleExport("excel")}
          disabled={isExporting || isDisabled || !onExportExcel}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-[10px] uppercase tracking-wider transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer shadow-xs shadow-emerald-500/10"
        >
          <FileSpreadsheet size={13} />
          Excel
        </button>

        {/* PDF Button */}
        <button
          onClick={() => handleExport("pdf")}
          disabled={isExporting || isDisabled || !onExportPdf}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-[10px] uppercase tracking-wider transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer shadow-xs shadow-red-500/10"
        >
          <FileText size={13} />
          PDF
        </button>
      </div>
      {isExporting && (
        <p className="text-[9px] text-brand-primary font-bold text-center animate-pulse flex items-center justify-center gap-1.5 mt-2">
          <RefreshCw size={11} className="animate-spin" />
          Exporting document...
        </p>
      )}
    </div>
  );
}