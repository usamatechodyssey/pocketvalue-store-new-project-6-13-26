// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralEventsView.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBehavioralEvents } from "../actions/getBehavioralEvents";
import {
  Search,
  Filter,
  Calendar,
  Hash,
  Loader2,
  PackageX,
  ChevronDown,
  X,
  Copy,
  Check,
  Maximize2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { SECURE_TELEMETRY_EVENTS } from "@/types";

// ✅ WORKSPACE STANDARD TOASTS
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
interface BehavioralEventsViewProps {
  range: { from: Date; to: Date };
}

// ================================================================
// 🎨 EVENT TYPE COLORS
// ================================================================
const EVENT_COLORS: Record<string, string> = {
  page_view: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  add_to_cart: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  remove_from_cart: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
  purchase: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  checkout_start: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  checkout_error: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  rage_click_detected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  js_exception: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  search: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  wishlist_add: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400",
  wishlist_remove: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
  banner_click: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  coupon_applied: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  payment_success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  payment_failed: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
};

const getEventColor = (eventType: string) => {
  return EVENT_COLORS[eventType] || "bg-zinc-50 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-300";
};

const formatEventType = (type: string) => {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// ✅ Copy Helper (Using custom success/error toasts - resolves ts6133)
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      toastSuccess(`${label} copied to clipboard!`);
    })
    .catch(() => {
      toastError(`Failed to copy ${label}.`);
    });
};

// ✅ Metadata Preview with Expand
const MetadataPreview = ({ metadata }: { metadata: Record<string, unknown> | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata) return <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic font-mono">—</span>;

  const entries = Object.entries(metadata).filter(([key]) => !["visitorId", "timestamp"].includes(key));
  const totalEntries = entries.length;
  const shownEntries = isExpanded ? entries : entries.slice(0, 3);

  if (totalEntries === 0) return <span className="text-[8px] text-zinc-400 dark:text-zinc-500 italic font-mono">—</span>;

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono">
      {shownEntries.map(([key, value]) => {
        let displayValue = String(value);
        if (typeof value === "object") {
          displayValue = JSON.stringify(value).slice(0, 30);
        }
        return (
          <span
            key={key}
            className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-850 rounded text-[8px] font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-28 border border-zinc-200/50 dark:border-zinc-800/50"
            title={`${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`}
          >
            {key}: {displayValue}
          </span>
        );
      })}
      {totalEntries > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[8px] font-mono font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <Maximize2 size={10} />
          {isExpanded ? "Show less" : `+${totalEntries - 3} more`}
        </button>
      )}
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function BehavioralEventsView({ range }: BehavioralEventsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    from: range.from.toISOString().split("T")[0],
    to: range.to.toISOString().split("T")[0],
    eventType: "",
    sessionId: "",
    search: "",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch data
  const fetchData = useCallback(async (page: number, filterOverrides?: any) => {
    setLoading(true);
    const combinedFilters = { ...filters, ...filterOverrides };
    const result = await getBehavioralEvents(combinedFilters, page);
    setData(result);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.from) params.set("from", filters.from);
    else params.delete("from");
    if (filters.to) params.set("to", filters.to);
    else params.delete("to");
    if (filters.eventType) params.set("eventType", filters.eventType);
    else params.delete("eventType");
    if (filters.sessionId) params.set("sessionId", filters.sessionId);
    else params.delete("sessionId");
    if (filters.search) params.set("q", filters.search);
    else params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setIsFilterOpen(false);
  }, [filters, router, pathname, searchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      from: range.from.toISOString().split("T")[0],
      to: range.to.toISOString().split("T")[0],
      eventType: "",
      sessionId: "",
      search: "",
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.delete("eventType");
    params.delete("sessionId");
    params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams, range]);

  // Quick filter by session ID
  const filterBySession = useCallback((sessionId: string) => {
    setFilters((prev) => ({ ...prev, sessionId }));
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionId", sessionId);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const hasActiveFilters = Boolean(
    filters.eventType || filters.sessionId || filters.search
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={36} className="animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] flex flex-col items-center justify-center min-h-75 w-full">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-850 text-zinc-400 rounded-2xl mb-3">
          <PackageX size={28} />
        </div>
        <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
          No Events Found
        </h3>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
          No behavioral events match the active filter criteria. Try adjusting your query.
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Clear Active Filters
          </button>
        )}
      </div>
    );
  }

  const inputStyles =
    "w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-brand-primary transition-all text-zinc-900 dark:text-white";

  const labelStyles = "text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 block";

  return (
    <div className="space-y-6 w-full min-w-0">
      
      {/* FILTER ACCORDION (Cyber-HUD Container) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Filter size={16} className="text-brand-primary" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Operational Event Explorer
            </h3>
            {hasActiveFilters && (
              <span className="text-[9px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                ACTIVE FILTER DETECTED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* ✅ FIXED: Changed invalid 'text-zinc-505' class to standard 'text-zinc-500' */}
            <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-500">
              {data.totalDocs.toLocaleString('en-PK')} EVENTS AUDITED
            </span>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Filter size={12} />
              Filters
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* From Date */}
                  <div>
                    <label className={labelStyles}>
                      <Calendar size={12} className="inline mr-1" /> From Date
                    </label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, from: e.target.value }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className={labelStyles}>
                      <Calendar size={12} className="inline mr-1" /> To Date
                    </label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, to: e.target.value }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className={labelStyles}>
                      <Hash size={12} className="inline mr-1" /> Event Type
                    </label>
                    <select
                      value={filters.eventType}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, eventType: e.target.value }))
                      }
                      className={inputStyles}
                    >
                      <option value="">All Events</option>
                      {(data?.eventTypes || SECURE_TELEMETRY_EVENTS).map((event: string) => (
                        <option key={event} value={event}>
                          {formatEventType(event)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Session ID */}
                  <div>
                    <label className={labelStyles}>
                      <Hash size={12} className="inline mr-1" /> Session ID
                    </label>
                    <input
                      type="text"
                      value={filters.sessionId}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, sessionId: e.target.value }))
                      }
                      placeholder="Search session..."
                      className={inputStyles}
                    />
                  </div>

                  {/* Search */}
                  <div>
                    <label className={labelStyles}>
                      <Search size={12} className="inline mr-1" /> Search Query
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, search: e.target.value }))
                      }
                      placeholder="Product, order, user..."
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setFilters({
                        from: range.from.toISOString().split("T")[0],
                        to: range.to.toISOString().split("T")[0],
                        eventType: "",
                        sessionId: "",
                        search: "",
                      });
                    }}
                    className="px-4 py-2 text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-700 uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-5 py-2 bg-brand-primary text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary-hover transition-all cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EVENTS LOGS TABLE (With Scroll Guard) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        <div className="overflow-x-auto max-h-125 custom-scrollbar">
          <table className="w-full min-w-187.5 border-collapse text-left text-xs relative" role="table">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Event Type</th>
                <th className="py-3 px-4 whitespace-nowrap">Path</th>
                <th className="py-3 px-4 whitespace-nowrap">Session ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
              {data.events.map((event: any) => {
                const colors = getEventColor(event.eventType);
                return (
                  <tr key={event._id} className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3.5 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {format(parseISO(event.createdAt), "MMM dd, hh:mm:ss a")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${colors} border-current/10`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                        {formatEventType(event.eventType)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap max-w-xs truncate">
                      {event.path || "/"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                          {event.sessionId.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(event.sessionId, "Session ID")}
                          className="p-1 text-zinc-400 hover:text-brand-primary transition-colors cursor-pointer shrink-0"
                          title="Copy session ID"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => filterBySession(event.sessionId)}
                          className="text-[8px] font-bold text-brand-primary hover:underline cursor-pointer shrink-0"
                          title="Filter by this session"
                        >
                          Filter
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <MetadataPreview metadata={event.metadata} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50">
            <PaginationControls totalPages={data.totalPages} paramName="page" />
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 dark:text-zinc-500 px-1">
        <span>
          SHOWING {data.events.length} OF {data.totalDocs.toLocaleString('en-PK')} TELEMETRY EVENTS
        </span>
        {/* ✅ FIXED: Changed invalid 'text-zinc-505' class to standard 'text-zinc-500' */}
        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-500">
          LAST SYNCED: {format(parseISO(data.generatedAt), "MMM dd, yyyy - hh:mm a")}
        </span>
      </div>
    </div>
  );
}