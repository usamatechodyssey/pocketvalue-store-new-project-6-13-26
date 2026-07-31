// src/app/features/admin/inventory-cms/components/import-products/components/ProgressDashboard.tsx

"use client";

import { CheckCircle, XCircle, Loader2, Pause, RefreshCw, WifiOff, Timer, Play } from "lucide-react";
import { ProcessStatus, Stats } from "../hooks/useImportProcessor";

interface ProgressDashboardProps {
  status: ProcessStatus;
  stats: Stats;
  totalCount: number;
  progressPercent: number;
  timeLeft: string;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function ProgressDashboard({
  status,
  stats,
  totalCount,
  progressPercent,
  timeLeft,
  onPause,
  onResume,
  onReset,
}: ProgressDashboardProps) {
  const isProcessing = status === "processing";
  const isPaused = status === "paused";
  const isWaiting = status === "waiting_network";
  const isCompleted = status === "completed";

  const getStatusIcon = () => {
    if (isProcessing) return <Loader2 className="animate-spin text-brand-primary" size={24} />;
    if (isPaused) return <Pause className="text-yellow-500" size={24} />;
    if (isWaiting) return <WifiOff className="text-red-500 animate-pulse" size={24} />;
    if (isCompleted) return <CheckCircle className="text-green-500" size={24} />;
    return null;
  };

  const getStatusLabel = () => {
    if (isProcessing) return "Importing...";
    if (isPaused) return "Paused";
    if (isWaiting) return "Waiting for Internet...";
    if (isCompleted) return "Complete";
    return "";
  };

  const getBarColor = () => {
    if (isPaused) return "bg-yellow-400";
    if (isWaiting) return "bg-red-400";
    if (isCompleted) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-bold text-xl text-gray-800 dark:text-white">{getStatusLabel()}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {stats.processed} / {totalCount} Products
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(isProcessing || isWaiting) && (
              <button onClick={onPause} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 border border-yellow-200">
                <Pause size={20} />
              </button>
            )}
            {isPaused && (
              <button onClick={onResume} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 font-bold flex gap-2">
                <Play size={20} /> Resume
              </button>
            )}
            {isCompleted && (
              <button onClick={onReset} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold flex gap-2">
                <RefreshCw size={20} /> New File
              </button>
            )}
          </div>
        </div>

        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] text-white font-bold ${getBarColor()}`}
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 5 && `${progressPercent}%`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Timer size={18} /> <span className="text-xs font-bold uppercase">Time Left</span>
          </div>
          <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{timeLeft}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-green-500">
            <CheckCircle size={18} /> <span className="text-xs font-bold uppercase">Success</span>
          </div>
          <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{stats.success}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-red-500">
            <XCircle size={18} /> <span className="text-xs font-bold uppercase">Failed</span>
          </div>
          <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{stats.failed}</p>
        </div>
      </div>
    </div>
  );
}