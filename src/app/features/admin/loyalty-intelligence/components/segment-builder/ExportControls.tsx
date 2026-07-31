// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/ExportControls.tsx

"use client";

import React, { useState } from "react";
import { Download, Settings, ChevronDown, Loader2 } from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import { SegmentGroup } from "@/models/SegmentDefinition";

interface ExportControlsProps {
  filters: SegmentGroup;
}

export default function ExportControls({ filters }: ExportControlsProps) {
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportLimit, setExportLimit] = useState(1000);
  const [exportSkip, setExportSkip] = useState(0);

  const handleExport = async () => {
    const hasConditions = filters.conditions.length > 0;
    const hasGroups = (filters.groups || []).length > 0;

    if (!hasConditions && !hasGroups) {
      toastError("Please add at least one condition before exporting.");
      return;
    }

    const safeLimit = Math.min(Math.max(1, exportLimit), 50000);
    const safeSkip = Math.max(0, exportSkip);

    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/segments/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          limit: safeLimit,
          skip: safeSkip,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Export failed.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segment_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toastSuccess(`Exported ${safeLimit} records (skipped ${safeSkip})`);
    } catch (error: any) {
      toastError(error.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const inputStyles =
    "w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary outline-hidden transition-all";

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs font-mono w-full min-w-0">
      <button
        onClick={() => setShowExportSettings(!showExportSettings)}
        className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer"
      >
        <Settings size={14} />
        Export CSV Controls
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${showExportSettings ? "rotate-180" : ""}`}
        />
      </button>

      {showExportSettings && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 animate-in fade-in duration-200">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Records to Export
            </label>
            <input
              type="number"
              min={1}
              max={50000}
              value={exportLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  setExportLimit(Math.min(val, 50000));
                } else if (e.target.value === "") {
                  setExportLimit(0);
                }
              }}
              className={inputStyles}
              placeholder="e.g., 1500"
            />
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">
              ⚠️ Max 50,000 per CSV batch
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Skip Records (Offset)
            </label>
            <input
              type="number"
              min={0}
              value={exportSkip}
              onChange={(e) => setExportSkip(Math.max(0, Number(e.target.value) || 0))}
              className={inputStyles}
              placeholder="e.g., 1000"
            />
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">
              Skip first N records to batch export
            </p>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isExporting || exportLimit < 1}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-emerald-500/20"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-4 flex-wrap pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <span>
          Limit:{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">
            {exportLimit || "—"}
          </strong>
        </span>
        <span>
          Skip:{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">
            {exportSkip}
          </strong>
        </span>
        <span className="text-emerald-500 font-bold">
          {exportSkip === 0
            ? "📄 Full export mode"
            : `📄 Exporting from record #${exportSkip + 1}`}
        </span>
        {exportLimit === 0 && (
          <span className="text-red-500 font-bold">⚠️ Enter a valid number</span>
        )}
      </div>
    </div>
  );
}