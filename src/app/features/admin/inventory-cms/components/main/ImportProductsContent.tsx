
// // src/app/features/admin/inventory-cms/components/main/ImportProductsContent.tsx

// "use client";

// import { useTransition } from "react";
// import { useImportProcessor } from "../import-products/hooks/useImportProcessor";
// import { TopBar } from "../import-products/components/TopBar";
// import { UploadBox } from "../import-products/components/UploadBox";
// import { ConfirmationPanel } from "../import-products/components/ConfirmationPanel";
// import { ProgressDashboard } from "../import-products/components/ProgressDashboard";
// import { ActivityLog } from "../import-products/components/ActivityLog";
// import { CSV_TEMPLATE } from "./CsvTemplate";

// export default function ImportProductsContent() {
//   const {
//     file,
//     setFile,
//     status,
//     isOnline,
//     totalInitialCount,
//     stats,
//     logs,
//     timeLeft,
//     progressPercent,
//     parseFile,
//     startProcessing,
//     resetAll,
//     isProcessing,
//   } = useImportProcessor();

//   const [isPending, startTransition] = useTransition();

//   const handleDownloadTemplate = () => {
//     const cleanCsvData = CSV_TEMPLATE.split("\n")
//       .filter((line) => !line.startsWith("//"))
//       .join("\n");
//     const blob = new Blob([cleanCsvData], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.setAttribute("href", URL.createObjectURL(blob));
//     link.setAttribute("download", "pocketvalue_template_v2.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDrop = (acceptedFiles: File[]) => {
//     if (acceptedFiles.length > 0) {
//       setFile(acceptedFiles[0]);
//       resetAll();
//     }
//   };

//   const handleRemoveFile = () => {
//     setFile(null);
//     resetAll();
//   };

//   const showIdleUpload = status === "idle" && totalInitialCount === 0;
//   const showConfirmation = status === "idle" && totalInitialCount > 0;
//   const showProgress = status !== "idle" && status !== "parsing";

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto font-sans">
//       <TopBar isOnline={isOnline} onDownloadTemplate={handleDownloadTemplate} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {showIdleUpload && (
//             <UploadBox
//               file={file}
//               onDrop={handleDrop}
//               onRemoveFile={handleRemoveFile}
//               onAnalyze={parseFile}
//               isDragActive={false}
//             />
//           )}

//           {showConfirmation && (
//             <ConfirmationPanel
//               totalCount={totalInitialCount}
//               isPending={isPending}
//               onStart={() => startTransition(() => startProcessing())}
//               onCancel={resetAll}
//             />
//           )}

//           {showProgress && (
//             <ProgressDashboard
//               status={status}
//               stats={stats}
//               totalCount={totalInitialCount}
//               progressPercent={progressPercent}
//               timeLeft={timeLeft}
//               onPause={() => {}}
//               onResume={() => startTransition(() => startProcessing())}
//               onReset={resetAll}
//             />
//           )}
//         </div>

//         <ActivityLog logs={logs} isActive={status === "processing"} />
//       </div>
//     </div>
//   );
// }
// src/app/features/admin/inventory-cms/components/main/ImportProductsContent.tsx

"use client";

import { useTransition } from "react";
import { useImportProcessor } from "../import-products/hooks/useImportProcessor";
import { TopBar } from "../import-products/components/TopBar";
import { UploadBox } from "../import-products/components/UploadBox";
import { ConfirmationPanel } from "../import-products/components/ConfirmationPanel";
import { ProgressDashboard } from "../import-products/components/ProgressDashboard";
import { ActivityLog } from "../import-products/components/ActivityLog";
import { CSV_TEMPLATE } from "./CsvTemplate";

interface ImportProductsContentProps {
  cdnMode?: boolean;
}

export default function ImportProductsContent({ cdnMode = true }: ImportProductsContentProps) {
  // ✅ ENTERPRISE UPGRADE: Removed unused 'isProcessing' variable to permanently resolve typescript compilation error ts(6133)
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
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <TopBar isOnline={isOnline} onDownloadTemplate={handleDownloadTemplate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

        <ActivityLog logs={logs} isActive={status === "processing"} />
      </div>
    </div>
  );
}