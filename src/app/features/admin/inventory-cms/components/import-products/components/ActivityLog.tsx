// 📂 src/app/features/admin/inventory-cms/components/import-products/components/ActivityLog.tsx (CYBER-HUD HARDENED)

"use client";

import { Terminal } from "lucide-react";

interface ActivityLogProps {
  logs: string[];
  isActive: boolean;
}

export function ActivityLog({ logs, isActive }: ActivityLogProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 text-zinc-200 p-4 rounded-2xl shadow-xl flex flex-col h-125 font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-2">
        <Terminal size={14} className="text-brand-primary" />
        <span className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Live Activity Log</span>
        {isActive && <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-zinc-700 italic text-center mt-10">Waiting for activity...</p>
        ) : (
          logs.map((log, i) => {
            const isError = log.includes("❌") || log.includes("Error");
            const isSuccess = log.includes("✅");
            const isWarning = log.includes("⚠️");
            const textColor = isError ? "text-red-400" : isSuccess ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-zinc-300";
            
            const parts = log.split("]");
            const timestamp = parts[0] ? `${parts[0]}]` : "";
            const message = parts[1] || log;

            return (
              <div key={i} className={`flex gap-2 wrap-break-word animate-in fade-in slide-in-from-left-2 duration-300 ${textColor}`}>
                <span className="opacity-50 select-none text-[9px] pt-0.5 shrink-0">{timestamp}</span>
                <span>{message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}