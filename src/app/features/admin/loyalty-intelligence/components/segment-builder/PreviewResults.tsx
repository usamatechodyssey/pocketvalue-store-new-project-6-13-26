// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/PreviewResults.tsx

"use client";

import React from "react";
import { Users, Loader2, X } from "lucide-react";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { SegmentPreviewUser } from "./types";

// ================================================================
// ✅ TYPES (Purged Unused Props)
// ================================================================
interface PreviewResultsProps {
  isVisible: boolean;
  isLoading: boolean;
  users: SegmentPreviewUser[];
  total: number;
  totalPages: number;
  currentPage: number;
  onClose: () => void;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function PreviewResults({
  isVisible,
  isLoading,
  users,
  total,
  totalPages,
  currentPage,
  onClose,
}: PreviewResultsProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col font-mono w-full min-w-0 animate-in fade-in duration-200">
      
      {/* Header Toolbar */}
      <div className="p-3.5 bg-white/50 dark:bg-zinc-950/50 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0">
            <Users size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
              Preview Segment Results
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
              {(total || 0).toLocaleString('en-PK')} Customers Matched Active Filter Criteria
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Close preview panel"
        >
          <X size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 size={24} className="animate-spin text-brand-primary" />
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Executing Query Pipeline...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 font-mono">
          <Users size={36} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200">No Customers Matched</p>
          <p className="text-[10px] text-zinc-500 mt-1">Try adjusting query conditions or logic operators.</p>
        </div>
      ) : (
        <>
          {/* Scrollable Table Container */}
          <div className="overflow-x-auto max-h-100 custom-scrollbar">
            <table className="w-full min-w-162.5 border-collapse text-left text-xs relative" role="table">
              <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
                <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap">Customer Name</th>
                  <th className="py-3 px-4 whitespace-nowrap">Email Address</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Lifetime Spend</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Total Orders</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{user.email}</td>
                    <td className="py-3 px-4 text-right font-bold text-brand-primary whitespace-nowrap">
                      Rs. {(user.totalSpend || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {(user.orderCount || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {user.lastOrderDate
                        ? new Date(user.lastOrderDate).toLocaleDateString('en-PK')
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 p-3 bg-white/50 dark:bg-zinc-950/50 flex justify-center">
              <PaginationControls totalPages={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}