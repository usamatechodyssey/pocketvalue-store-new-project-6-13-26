// 📂 src/app/features/admin/loyalty-intelligence/components/SegmentBuilderWidget.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Layers, Plus, ArrowRight, FolderOpen } from "lucide-react";

interface SegmentBuilderWidgetProps {
  savedSegmentsCount?: number;
  href?: string;
}

export default function SegmentBuilderWidget({
  savedSegmentsCount = 0,
  href = "/admin/segment-builder",
}: SegmentBuilderWidgetProps) {
  return (
    <Link
      href={href}
      className="block p-5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 font-mono no-underline hover:no-underline group w-full min-w-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Segment Builder Engine
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {savedSegmentsCount > 0
                ? `${savedSegmentsCount.toLocaleString('en-PK')} Saved Segments`
                : "Create Dynamic Customer Segments"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-brand-primary shrink-0">
          <span>Open</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Quick Actions / Stats */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <Plus size={14} className="text-brand-primary shrink-0" />
          <span className="text-[10px] font-bold uppercase">Build New Segment</span>
        </div>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <FolderOpen size={14} className="text-zinc-400 shrink-0" />
          <span className="text-[10px] font-bold uppercase">{savedSegmentsCount.toLocaleString('en-PK')} Saved</span>
        </div>
      </div>
    </Link>
  );
}