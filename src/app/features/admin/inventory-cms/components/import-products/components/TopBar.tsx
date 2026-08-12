// 📂 src/app/features/admin/inventory-cms/components/import-products/components/TopBar.tsx (CYBER-HUD HARDENED)

"use client";

import { FileText, Wifi, WifiOff } from "lucide-react";

interface TopBarProps {
  isOnline: boolean;
  onDownloadTemplate: () => void;
}

export default function TopBar({ isOnline, onDownloadTemplate }: TopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
      <div className="space-y-1.5 leading-none">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3 leading-none">
          Bulk Product Import
          {isOnline ? (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-mono font-bold uppercase">
              <Wifi size={10} /> Online
            </span>
          ) : (
            <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1 font-mono font-bold uppercase animate-pulse">
              <WifiOff size={10} /> Offline
            </span>
          )}
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Chunked import with browser compression (Zero server load)</p>
      </div>
      <button
        onClick={onDownloadTemplate}
        className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-850 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
      >
        <FileText size={14} /> Download Template
      </button>
    </div>
  );
}