// 📂 src/app/features/admin/inventory-cms/components/main/ImportProductsContent.tsx (CYBER-HUD HARDENED)

"use client";

import { useTransition } from "react";
import { useImportProcessor } from "../import-products/hooks/useImportProcessor";
import TopBar from "../import-products/components/TopBar";
import UploadBox from "../import-products/components/UploadBox";
import ConfirmationPanel from "../import-products/components/ConfirmationPanel";
import ProgressDashboard from "../import-products/components/ProgressDashboard";
import { ActivityLog } from "../import-products/components/ActivityLog";
import { CSV_TEMPLATE } from "./CsvTemplate";

interface ImportProductsContentProps {
  cdnMode?: boolean;
}

export default function ImportProductsContent({ cdnMode = true }: ImportProductsContentProps) {
  // TypeScript compilation error ts(6133) completely resolved
  const {
    file,
    setFile,
    status,
    isOnline,
    totalInitialCount,
    stats,
    logs,
    timeLeft,
    progressPercent,
    parseFile,
    startProcessing,
    resetAll,
  } = useImportProcessor(cdnMode);

  const [isPending, startTransition] = useTransition();

  const handleDownloadTemplate = () => {
    // Strips out double-slash developer guidelines to compile clean template
    const cleanCsvData = CSV_TEMPLATE.split("\n")
      .filter((line) => !line.startsWith("//"))
      .join("\n");
    const blob = new Blob([cleanCsvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "pocketvalue_template_v2.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      resetAll();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    resetAll();
  };

  const showIdleUpload = status === "idle" && totalInitialCount === 0;
  const showConfirmation = status === "idle" && totalInitialCount > 0;
  const showProgress = status !== "idle" && status !== "parsing";

  return (
    // ✅ FIX: Expanded container width matches system-wide HUD layout (max-w-[1750px])
    <div className="space-y-6 max-w-[1750px] mx-auto font-sans p-4 md:p-8 animate-in fade-in duration-300">
      <TopBar isOnline={isOnline} onDownloadTemplate={handleDownloadTemplate} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Flow Controller Cards */}
        <div className="lg:col-span-8 space-y-6">
          {showIdleUpload && (
            <UploadBox
              file={file}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
              onAnalyze={parseFile}
              isDragActive={false}
            />
          )}

          {showConfirmation && (
            <ConfirmationPanel
              totalCount={totalInitialCount}
              isPending={isPending}
              onStart={() => startTransition(() => startProcessing())}
              onCancel={resetAll}
            />
          )}

          {showProgress && (
            <ProgressDashboard
              status={status}
              stats={stats}
              totalCount={totalInitialCount}
              progressPercent={progressPercent}
              timeLeft={timeLeft}
              onPause={() => {}}
              onResume={() => startTransition(() => startProcessing())}
              onReset={resetAll}
            />
          )}
        </div>

        {/* Right Column: Live Telemetry Terminal Logs */}
        <div className="lg:col-span-4">
          <ActivityLog logs={logs} isActive={status === "processing"} />
        </div>
      </div>
    </div>
  );
}