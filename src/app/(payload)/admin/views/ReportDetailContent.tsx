
// 📂 src/app/(payload)/admin/views/ReportDetailContent.tsx (STATUS DROPDOWN & SEARCH DUAL FILTERED)

"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ReportColumn } from "@/app/features/admin/reports/configs/reportConfigs";

// ✅ Dynamic Exporter Utility Helpers
import { exportToCSV, triggerPDFPrint } from "@/app/features/admin/reports/utils/reportExporter";

// ✅ UI Components
import ReportTableSection from "@/app/features/admin/reports/components/ReportTableSection";
import ReportChartSection from "@/app/features/admin/reports/components/ReportChartSection";
import ReportFilters from "@/app/features/admin/reports/components/ReportFilters";
import ReportPaginationSection from "@/app/features/admin/reports/components/ReportPaginationSection";
import ReportSidebarSection from "@/app/features/admin/reports/components/sidebar/ReportSidebarSection";

// ================================================================
// ✅ TYPES
// ================================================================
interface ReportDetailContentProps {
  data: any[];
  columns: ReportColumn[];
  totals?: any;
  isLoading?: boolean;
  reportName: string;
  generatedAt: string;
  totalDocs: number;
  currentPage: number;
  limit: number;
  categories?: { value: string; label: string }[];
  statuses?: { value: string; label: string }[];
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function ReportDetailContent({
  data,
  columns,
  totals,
  isLoading = false,
  reportName,
  generatedAt,
  totalDocs,
  currentPage,
  limit,
  categories = [],
  statuses = [],
  showCategoryFilter = false,
  showStatusFilter = false,
}: ReportDetailContentProps) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search")?.toLowerCase().trim() || "";
  const currentStatus = searchParams.get("status")?.toLowerCase().trim() || "";

  // State: Set of visible column keys
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    return new Set(columns.filter((col) => col.visible !== false).map((col) => col.key));
  });

  // Toggle column visibility
  const handleToggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  }, []);

  // Filtered column configurations based on toggled visibility
  const visibleColumnConfigs = useMemo(
    () => columns.filter((col) => visibleColumns.has(col.key)),
    [columns, visibleColumns]
  );

  // ✅ FIX: Real-time Search AND Status Dropdown Filter applied directly on data rows!
  const filteredData = useMemo(() => {
    return data
      .filter((row) => {
        // 1. Status Dropdown Filter Check
        if (currentStatus) {
          const rowType = String(row.status || row.frictionType || "").toLowerCase().trim();
          if (rowType !== currentStatus) return false;
        }

        // 2. Search Bar Filter Check
        if (!currentSearch) return true;
        return Object.values(row).some((val) =>
          String(val ?? "").toLowerCase().includes(currentSearch)
        );
      })
      .map((row) => {
        const newRow: any = {};
        visibleColumnConfigs.forEach((col) => {
          newRow[col.key] = row[col.key];
        });
        return newRow;
      });
  }, [data, visibleColumnConfigs, currentSearch, currentStatus]);

  // Prepare filtered totals row matching visible columns
  const filteredTotals = useMemo(() => {
    if (!totals) return undefined;
    const newTotals: any = {};
    visibleColumnConfigs.forEach((col) => {
      if (totals[col.key] !== undefined) {
        newTotals[col.key] = totals[col.key];
      }
    });
    return Object.keys(newTotals).length > 0 ? newTotals : undefined;
  }, [totals, visibleColumnConfigs]);

  // Dynamic Exporter Actions
  const handleExcelExport = useCallback(async () => {
    exportToCSV(filteredData, visibleColumnConfigs, reportName);
  }, [filteredData, visibleColumnConfigs, reportName]);

  const handlePdfExport = useCallback(async () => {
    triggerPDFPrint();
  }, []);

  // Contextual search placeholder selection
  const searchPlaceholder = useMemo(() => {
    const term = reportName.toLowerCase();
    if (term.includes("sku") || term.includes("product")) return "Search SKU or Product name...";
    if (term.includes("campaign") || term.includes("utm")) return "Search UTM Campaign source...";
    if (term.includes("courier")) return "Search Logistics courier partner...";
    return "Search data entries...";
  }, [reportName]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. FILTERS ROW (Print Hidden) */}
      <div className="print:hidden">
        <ReportFilters
          categories={categories}
          statuses={statuses}
          showCategoryFilter={showCategoryFilter}
          showStatusFilter={showStatusFilter}
          showSearch={true}
          exportExcel={handleExcelExport}
          exportPdf={handlePdfExport}
          isLoading={isLoading}
          searchPlaceholder={searchPlaceholder}
        />
      </div>

      {/* 2. TOP GRID: Chart (Left 75%) + Sidebar Control (Right 25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Chart Section (Left 75%) */}
        <div className="lg:col-span-3 print:hidden">
          <ReportChartSection
            data={filteredData}
            columns={visibleColumnConfigs}
            isLoading={isLoading}
            height={280}
          />
        </div>

        {/* Sidebar Control Section (Right 25%) */}
        <div className="lg:col-span-1 print:hidden">
          <ReportSidebarSection
            columns={columns}
            visibleColumns={visibleColumns}
            onToggleColumn={handleToggleColumn}
            exportExcel={handleExcelExport}
            exportPdf={handlePdfExport}
            isLoading={isLoading}
            totalDocs={totalDocs}
            generatedAt={generatedAt}
            reportName={reportName}
          />
        </div>
      </div>

      {/* 3. BOTTOM FULL-WIDTH CONTAINER: Table + Pagination */}
      <div className="space-y-6 w-full min-w-0">
        
        {/* Dynamic Report Table */}
        <ReportTableSection
          data={filteredData}
          columns={visibleColumnConfigs}
          totals={filteredTotals}
          isLoading={isLoading}
          emptyMessage={
            currentSearch || currentStatus
              ? `No records found matching the active filter criteria.`
              : `No data available for "${reportName}" in the selected period.`
          }
        />

        {/* Pagination Controls */}
        <div className="print:hidden">
          <ReportPaginationSection
            totalDocs={filteredData.length}
            currentPage={currentPage}
            limit={limit}
            isLoading={isLoading}
          />
        </div>
      </div>

    </div>
  );
}