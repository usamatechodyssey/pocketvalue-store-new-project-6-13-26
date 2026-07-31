// src/app/features/admin/inventory-cms/components/import-products/components/TopBar.tsx

"use client";

import { FileText, Wifi, WifiOff } from "lucide-react";

interface TopBarProps {
  isOnline: boolean;
  onDownloadTemplate: () => void;
}

export function TopBar({ isOnline, onDownloadTemplate }: TopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Bulk Product Import
          {isOnline ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 font-medium">
              <Wifi size={10} /> Online
            </span>
          ) : (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 font-medium animate-pulse">
              <WifiOff size={10} /> Offline
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Chunked import with browser compression (Zero server load)</p>
      </div>
      <button
        onClick={onDownloadTemplate}
        className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <FileText size={16} /> Template
      </button>
    </div>
  );
}