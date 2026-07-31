// 📂 src/app/features/admin/operational-intelligence/components/ReportButton.tsx

"use client";

import React, { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// ================================================================
// ✅ PROPS (Supports both Date objects and string dates)
// ================================================================
interface ReportButtonProps {
  /** Date range to include in the report */
  from: Date | string;
  to: Date | string;
  /** Optional: File name prefix (default: operational-report) */
  fileName?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function ReportButton({
  from,
  to,
  fileName = "operational-report",
}: ReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      // ✅ FIX 1: Safe Date Coercion (Prevents toISOString string-type runtime crash)
      const fromDate = typeof from === 'string' ? new Date(from) : from;
      const toDate = typeof to === 'string' ? new Date(to) : to;

      // ✅ Build URL with date range params
      const params = new URLSearchParams({
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0],
      });

      const response = await fetch(
        `/api/admin/operational-report/manual?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate report");
      }

      // ✅ Check if response is PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        throw new Error("Invalid response format. Expected PDF.");
      }

      // ✅ Convert to Blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ✅ FIX 2: Workspace-standard success toast
      toastSuccess("PDF Report downloaded successfully!");
    } catch (error: any) {
      console.error("Download error:", error);
      // ✅ Workspace-standard error toast
      toastError(error.message || "Failed to download PDF report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer shadow-md shadow-brand-primary/20"
      aria-label="Download operational report as PDF"
    >
      {isLoading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText size={14} />
          Download PDF Report
        </>
      )}
    </button>
  );
}