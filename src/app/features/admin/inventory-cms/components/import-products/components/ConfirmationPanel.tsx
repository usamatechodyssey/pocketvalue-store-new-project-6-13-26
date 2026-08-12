// 📂 src/app/features/admin/inventory-cms/components/import-products/components/ConfirmationPanel.tsx (CYBER-HUD HARDENED)

"use client";

import { Loader2, Play } from "lucide-react";

interface ConfirmationPanelProps {
  totalCount: number;
  isPending: boolean;
  onStart: () => void;
  onCancel: () => void;
}

export default function ConfirmationPanel({ totalCount, isPending, onStart, onCancel }: ConfirmationPanelProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-2xl shadow-xs border-l-4 border-brand-primary border-t border-r border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Ready to Launch?</h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
        Found <span className="font-bold text-brand-primary font-mono">{totalCount} products</span> inside CSV.
        Images will be compressed locally in your browser (WebP, Quality 80) to minimize server load.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onStart}
          disabled={isPending}
          className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} Start Import
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider border border-zinc-200 dark:border-zinc-850 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}