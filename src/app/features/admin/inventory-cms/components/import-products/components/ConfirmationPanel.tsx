// src/app/features/admin/inventory-cms/components/import-products/components/ConfirmationPanel.tsx

"use client";

import { Loader2, Play } from "lucide-react";

interface ConfirmationPanelProps {
  totalCount: number;
  isPending: boolean;
  onStart: () => void;
  onCancel: () => void;
}

export function ConfirmationPanel({ totalCount, isPending, onStart, onCancel }: ConfirmationPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-l-4 border-brand-primary animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Ready to Launch?</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Found <span className="font-bold text-brand-primary">{totalCount} products</span>.
        Images will be compressed in your browser (WebP, Quality 80).
      </p>
      <div className="flex gap-3">
        <button
          onClick={onStart}
          disabled={isPending}
          className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />} Start Import
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}