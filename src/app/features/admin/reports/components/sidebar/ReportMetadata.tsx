// 📂 src/app/features/admin/reports/components/sidebar/ReportMetadata.tsx (FULLY HARDENED & HYDRATION SAFE)

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Database } from "lucide-react";

interface ReportMetadataProps {
  totalDocs?: number;
  generatedAt?: string;
}

const formatGeneratedAt = (dateStr?: string, isMounted?: boolean): string => {
  if (!dateStr) return "N/A";
  
  // SSR Hydration Safeguard: Return raw ISO date until client has mounted safely
  if (!isMounted) return dateStr.split("T")[0];

  return new Date(dateStr).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReportMetadata({
  totalDocs,
  generatedAt,
}: ReportMetadataProps) {
  const [mounted, setMounted] = useState(false);

  // Register client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pt-3.5 border-t border-zinc-150 dark:border-zinc-850 space-y-2">
      <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
        <Database size={12} className="text-zinc-400 dark:text-zinc-500 stroke-[2px]" />
        <span className="font-mono">
          {totalDocs !== undefined ? totalDocs.toLocaleString("en-PK") : "—"} records cached
        </span>
      </div>
      {generatedAt && (
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
          <Calendar size={12} className="text-zinc-400 dark:text-zinc-500 stroke-[2px]" />
          <span className="font-mono">Sync: {formatGeneratedAt(generatedAt, mounted)}</span>
        </div>
      )}
    </div>
  );
}