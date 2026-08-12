// 📂 src/app/features/admin/inventory-cms/components/import-products/components/ProgressDashboard.tsx (CYBER-HUD HARDENED)

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

export default function ProgressDashboard({
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
    if (isProcessing) return <Loader2 className="animate-spin text-brand-primary" size={20} />;
    if (isPaused) return <Pause className="text-amber-500" size={20} />;
    if (isWaiting) return <WifiOff className="text-red-500 animate-pulse" size={20} />;
    if (isCompleted) return <CheckCircle className="text-emerald-500" size={20} />;
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
    if (isPaused) return "bg-amber-500";
    if (isWaiting) return "bg-red-500";
    if (isCompleted) return "bg-emerald-500";
    return "bg-brand-primary";
  };

  return (
    <div className="space-y-6">
      {/* ProgressBar Card */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-none">{getStatusLabel()}</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono mt-1.5">
                {stats.processed} / {totalCount} Products Mapped
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(isProcessing || isWaiting) && (
              <button onClick={onPause} className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 cursor-pointer transition-colors">
                <Pause size={18} />
              </button>
            )}
            {isPaused && (
              <button onClick={onResume} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider flex gap-2 cursor-pointer transition-all">
                <Play size={14} className="mt-0.5" /> Resume
              </button>
            )}
            {isCompleted && (
              <button onClick={onReset} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-xl flex gap-2 cursor-pointer transition-all">
                <RefreshCw size={14} className="mt-0.5" /> New File
              </button>
            )}
          </div>
        </div>

        <div className="h-5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2.5 text-[9px] text-white font-mono font-bold ${getBarColor()}`}
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 5 && `${progressPercent}%`}
          </div>
        </div>
      </div>

      {/* KPI Counters Grid (Monospaced HUD) */}
      <div className="grid grid-cols-3 gap-4">
        {/* Time Left */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
          <div className="flex items-center gap-1.5 mb-1.5 text-brand-primary">
            <Timer size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Time Left</span>
          </div>
          <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{timeLeft}</p>
        </div>
        {/* Success */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-500">
            <CheckCircle size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Success</span>
          </div>
          <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{stats.success}</p>
        </div>
        {/* Failed */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
          <div className="flex items-center gap-1.5 mb-1.5 text-red-500">
            <XCircle size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Failed</span>
          </div>
          <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{stats.failed}</p>
        </div>
      </div>
    </div>
  );
}