// 📂 src/app/features/admin/reports/components/sidebar/ReportSidebarSection.tsx

"use client";

import { useState } from "react";
import { ReportColumn } from "../../configs/reportConfigs";
import ReportSidebarHeader from "./ReportSidebarHeader";
import ReportColumnToggler from "./ReportColumnToggler";
import ReportExportButtons from "./ReportExportButtons";
import ReportMetadata from "./ReportMetadata";

// ================================================================
// ✅ TYPES (Re-exported from parent)
// ================================================================
interface ReportSidebarSectionProps {
  columns: ReportColumn[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  exportExcel?: () => Promise<void>;
  exportPdf?: () => Promise<void>;
  isLoading?: boolean;
  totalDocs?: number;
  generatedAt?: string;
  reportName?: string;
}

// ================================================================
// 🚀 MAIN ORCHESTRATOR
// ================================================================
export default function ReportSidebarSection({
  columns,
  visibleColumns,
  onToggleColumn,
  exportExcel,
  exportPdf,
  isLoading = false,
  totalDocs,
  generatedAt,
  reportName = "Report",
}: ReportSidebarSectionProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Wrapper handlers to manage loading state
  const handleExportExcel = async () => {
    if (!exportExcel) return;
    setIsExporting(true);
    try {
      await exportExcel();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!exportPdf) return;
    setIsExporting(true);
    try {
      await exportPdf();
    } finally {
      setIsExporting(false);
    }
  };

  const visibleCount = columns.filter((col) => visibleColumns.has(col.key)).length;
  const isDisabled = isLoading || totalDocs === 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-xs h-fit sticky top-24 transition-all duration-200">
      {/* Header */}
      <ReportSidebarHeader
        reportName={reportName}
        visibleCount={visibleCount}
        totalCount={columns.length}
      />

      {/* Column Toggler */}
      <ReportColumnToggler
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={onToggleColumn}
      />

      {/* Export Buttons */}
      <ReportExportButtons
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        isDisabled={isDisabled}
      />

      {/* Metadata */}
      <ReportMetadata totalDocs={totalDocs} generatedAt={generatedAt} />
    </div>
  );
}