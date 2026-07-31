// src/app/features/admin/inventory-cms/components/import-products/components/ActivityLog.tsx

"use client";

import { Terminal } from "lucide-react";

interface ActivityLogProps {
  logs: string[];
  isActive: boolean;
}

export function ActivityLog({ logs, isActive }: ActivityLogProps) {
  return (
    <div className="bg-gray-900 text-gray-200 p-4 rounded-xl shadow-xl border border-gray-700 flex flex-col h-125 font-mono text-sm">
      <div className="flex items-center gap-2 border-b border-gray-700 pb-3 mb-2">
        <Terminal size={16} className="text-brand-primary" />
        <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Live Activity Log</span>
        {isActive && <span className="ml-auto flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        {logs.length === 0 ? (
          <p className="text-gray-600 italic text-center mt-10">Waiting for activity...</p>
        ) : (
          logs.map((log, i) => {
            const isError = log.includes("❌") || log.includes("Error");
            const isSuccess = log.includes("✅");
            const isWarning = log.includes("⚠️");
            const textColor = isError ? "text-red-400" : isSuccess ? "text-green-400" : isWarning ? "text-yellow-400" : "text-gray-300";
            const parts = log.split("]");
            const timestamp = parts[0] ? `${parts[0]}]` : "";
            const message = parts[1] || log;

            return (
              <div key={i} className={`flex gap-2 wrap-break-word animate-in fade-in slide-in-from-left-2 duration-300 ${textColor}`}>
                <span className="opacity-50 select-none text-[10px] pt-1 shrink-0">{timestamp}</span>
                <span>{message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}