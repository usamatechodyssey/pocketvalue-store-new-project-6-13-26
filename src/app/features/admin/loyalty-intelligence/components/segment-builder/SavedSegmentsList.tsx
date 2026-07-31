// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/SavedSegmentsList.tsx

"use client";

import React from "react";
import { FolderOpen, Loader2, X } from "lucide-react";
import { SavedSegment } from "./types";

// ================================================================
// ✅ TYPES
// ================================================================
interface SavedSegmentsListProps {
  isVisible: boolean;
  isLoading: boolean;
  segments: SavedSegment[];
  onLoad: (segment: SavedSegment) => void;
  onClose: () => void;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function SavedSegmentsList({
  isVisible,
  isLoading,
  segments,
  onLoad,
  onClose,
}: SavedSegmentsListProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col font-mono w-full min-w-0 animate-in fade-in duration-200">
      
      {/* Header Toolbar */}
      <div className="p-3.5 bg-white/50 dark:bg-zinc-950/50 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0">
            <FolderOpen size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
              Saved Segment Definitions
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
              {segments.length} Saved Customer Filters Available
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close saved segments panel"
        >
          <X size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 size={24} className="animate-spin text-brand-primary" />
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Loading Saved Filters...</span>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 font-mono">
          <FolderOpen size={36} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200">No Saved Segments</p>
          <p className="text-[10px] text-zinc-500 mt-1">Create and save a new segment filter above.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
          {segments.map((seg) => (
            <button
              key={seg._id}
              onClick={() => onLoad(seg)}
              className="w-full text-left p-4 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                  {seg.name}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {seg.description || "No description"} · Created by {seg.createdBy.name}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{(seg.lastRunCount || 0).toLocaleString('en-PK')} Customers</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                    seg.isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {seg.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}