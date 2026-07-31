// 📂 src/app/features/admin/reports/utils/reportExporter.ts (FULLY REUSABLE EXPORT ENGINE)

import { ReportColumn, ReportColumnFormat } from "../configs/reportConfigs";

// ================================================================
// 🔧 HELPERS: Cell Value Formatter (Matches UI Table cells)
// ================================================================
const formatCsvValue = (value: any, formatType: ReportColumnFormat): string => {
  if (value === null || value === undefined) return "";

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

// ================================================================
// 🛡️ RFC-4180 EXCEL/CSV COMPLIANT STREAM PARSER
// ================================================================
export const exportToCSV = (
  data: any[],
  columns: ReportColumn[],
  reportName: string
): void => {
  try {
    if (data.length === 0) return;

    // 1. Build Headers Row
    const headers = columns.map((col) => {
      // Escape double quotes inside header labels
      const escaped = String(col.label).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(",");

    // 2. Build Data Rows (RFC-4180 compliant escaping)
    const rows = data.map((row) => {
      return columns.map((col) => {
        const rawVal = row[col.key];
        const formattedVal = formatCsvValue(rawVal, col.format);
        
        // Escape double quotes and wrap in quotes if value contains commas, quotes, or newlines
        const escapedValue = String(formattedVal).replace(/"/g, '""');
        if (escapedValue.includes(",") || escapedValue.includes('"') || escapedValue.includes("\n")) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      }).join(",");
    });

    // 3. Assemble complete CSV Payload with UTF-8 BOM byte-order mark (Ensures Excel reads Urdu/Special chars)
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 4. Trigger Native Browser Download
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().split("T")[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportName.toLowerCase().replace(/[\s/]/g, "-")}_${dateStamp}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`💾 Dynamic Exporter: Successfully downloaded CSV of "${reportName}" (${rows.length} rows)`);
  } catch (error) {
    console.error("❌ CSV Exporter failed:", error);
  }
};

// ================================================================
// 🛡️ SYSTEM-WIDE HUD PRINT TRIGGER
// ================================================================
export const triggerPDFPrint = (): void => {
  if (typeof window !== "undefined") {
    window.print();
  }
};