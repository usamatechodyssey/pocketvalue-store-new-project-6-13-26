// // 📂 src/app/(payload)/admin/views/ReportDetailContent.tsx

// "use client";

// import { useState, useMemo, useCallback } from "react";
// import { ReportColumn } from "@/app/features/admin/reports/configs/reportConfigs";

// // ✅ UI Components
// import ReportTableSection from "@/app/features/admin/reports/components/ReportTableSection";
// import ReportChartSection from "@/app/features/admin/reports/components/ReportChartSection";
// import ReportFilters from "@/app/features/admin/reports/components/ReportFilters";
// import ReportPaginationSection from "@/app/features/admin/reports/components/ReportPaginationSection";
// import ReportSidebarSection from "@/app/features/admin/reports/components/sidebar/ReportSidebarSection";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface ReportDetailContentProps {
//   data: any[];
//   columns: ReportColumn[];
//   totals?: any;
//   isLoading?: boolean;
//   reportName: string;
//   generatedAt: string;
//   totalDocs: number;
//   currentPage: number;
//   limit: number;
//   exportExcel?: () => Promise<void>;
//   exportPdf?: () => Promise<void>;
//   categories?: { value: string; label: string }[];
//   statuses?: { value: string; label: string }[];
//   showCategoryFilter?: boolean;
//   showStatusFilter?: boolean;
// }

// // ================================================================
// // 🚀 MAIN COMPONENT (Client Orchestrator)
// // ================================================================
// export default function ReportDetailContent({
//   data,
//   columns,
//   totals,
//   isLoading = false,
//   reportName,
//   generatedAt,
//   totalDocs,
//   currentPage,
//   limit,
//   exportExcel,
//   exportPdf,
//   categories = [],
//   statuses = [],
//   showCategoryFilter = false,
//   showStatusFilter = false,
// }: ReportDetailContentProps) {
//   // State: Visible columns (for toggling)
//   const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
//     // Default: all visible columns
//     return new Set(columns.filter((col) => col.visible !== false).map((col) => col.key));
//   });

//   // Toggle column visibility
//   const handleToggleColumn = useCallback((columnKey: string) => {
//     setVisibleColumns((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(columnKey)) {
//         newSet.delete(columnKey);
//       } else {
//         newSet.add(columnKey);
//       }
//       return newSet;
//     });
//   }, []);

//   // Filtered columns (only visible ones)
//   const visibleColumnConfigs = useMemo(
//     () => columns.filter((col) => visibleColumns.has(col.key)),
//     [columns, visibleColumns]
//   );

//   // Prepare filtered data (only visible columns) - Works natively now!
//   const filteredData = useMemo(() => {
//     return data.map((row) => {
//       const newRow: any = {};
//       visibleColumnConfigs.forEach((col) => {
//         newRow[col.key] = row[col.key];
//       });
//       return newRow;
//     });
//   }, [data, visibleColumnConfigs]);

//   // Prepare filtered totals - Works natively now!
//   const filteredTotals = useMemo(() => {
//     if (!totals) return undefined;
//     const newTotals: any = {};
//     visibleColumnConfigs.forEach((col) => {
//       if (totals[col.key] !== undefined) {
//         newTotals[col.key] = totals[col.key];
//       }
//     });
//     return Object.keys(newTotals).length > 0 ? newTotals : undefined;
//   }, [totals, visibleColumnConfigs]);

//   return (
//     <div className="space-y-6 animate-in fade-in duration-300">
      
//       {/* FILTERS ROW */}
//       <ReportFilters
//         categories={categories}
//         statuses={statuses}
//         showCategoryFilter={showCategoryFilter}
//         showStatusFilter={showStatusFilter}
//         showSearch={true}
//         exportExcel={exportExcel}
//         exportPdf={exportPdf}
//         isLoading={isLoading}
//       />

//       {/* MAIN LAYOUT: Sidebar (Right) + Content (Left) */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
//         {/* LEFT: Chart + Table + Pagination */}
//         <div className="lg:col-span-3 space-y-6">
//           {/* Chart Section */}
//           <ReportChartSection
//             data={filteredData}
//             columns={visibleColumnConfigs}
//             isLoading={isLoading}
//             height={280}
//           />

//           {/* Table Section */}
//           <ReportTableSection
//             data={filteredData}
//             columns={visibleColumnConfigs}
//             totals={filteredTotals}
//             isLoading={isLoading}
//             emptyMessage={`No data available for "${reportName}" in the selected period.`}
//           />

//           {/* Pagination Section */}
//           <ReportPaginationSection
//             totalDocs={totalDocs}
//             currentPage={currentPage}
//             limit={limit}
//             isLoading={isLoading}
//           />
//         </div>

//         {/* RIGHT: Sidebar (Column Toggler + Export + Metadata) */}
//         <div className="lg:col-span-1">
//           <ReportSidebarSection
//             columns={columns}
//             visibleColumns={visibleColumns}
//             onToggleColumn={handleToggleColumn}
//             exportExcel={exportExcel}
//             exportPdf={exportPdf}
//             isLoading={isLoading}
//             totalDocs={totalDocs}
//             generatedAt={generatedAt}
//             reportName={reportName}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/(payload)/admin/views/ReportDetailContent.tsx (FULLY DYNAMICS AND SYSTEM ALIGNED)

"use client";

import { useState, useMemo, useCallback } from "react";
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

  // Prepare filtered data mapping strictly to visible columns
  const filteredData = useMemo(() => {
    return data.map((row) => {
      const newRow: any = {};
      visibleColumnConfigs.forEach((col) => {
        newRow[col.key] = row[col.key];
      });
      return newRow;
    });
  }, [data, visibleColumnConfigs]);

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

  // ================================================================
  // ⚡ DYNAMIC EXPORTER ACTIONS (No Server Overhead)
  // ================================================================
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
      
      {/* FILTERS ROW (Print Hidden) */}
      <div className="print:hidden">
        <ReportFilters
          categories={categories}
          statuses={statuses}
          showCategoryFilter={showCategoryFilter}
          showStatusFilter={showStatusFilter}
          showSearch={true}
          exportExcel={handleExcelExport} // ✅ Hooked to Excel Download
          exportPdf={handlePdfExport}     // ✅ Hooked to PDF Print
          isLoading={isLoading}
          searchPlaceholder={searchPlaceholder}
        />
      </div>

      {/* MAIN LAYOUT: Sidebar (Right) + Content (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT: Chart + Table + Pagination */}
        <div className="lg:col-span-3 space-y-6 print:w-full print:col-span-4">
          
          {/* Chart Section (Print Hidden) */}
          <div className="print:hidden">
            <ReportChartSection
              data={filteredData}
              columns={visibleColumnConfigs}
              isLoading={isLoading}
              height={280}
            />
          </div>

          {/* Table Section */}
          <ReportTableSection
            data={filteredData}
            columns={visibleColumnConfigs}
            totals={filteredTotals}
            isLoading={isLoading}
            emptyMessage={`No data available for "${reportName}" in the selected period.`}
          />

          {/* Pagination Section (Print Hidden) */}
          <div className="print:hidden">
            <ReportPaginationSection
              totalDocs={totalDocs}
              currentPage={currentPage}
              limit={limit}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* RIGHT: Sidebar Control (Print Hidden) */}
        <div className="lg:col-span-1 print:hidden">
          <ReportSidebarSection
            columns={columns}
            visibleColumns={visibleColumns}
            onToggleColumn={handleToggleColumn}
            exportExcel={handleExcelExport} // ✅ Hooked to Excel Download
            exportPdf={handlePdfExport}     // ✅ Hooked to PDF Print
            isLoading={isLoading}
            totalDocs={totalDocs}
            generatedAt={generatedAt}
            reportName={reportName}
          />
        </div>
      </div>
    </div>
  );
}