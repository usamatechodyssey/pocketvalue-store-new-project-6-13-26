// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialCourierPerformanceTable.tsx

"use client";

import React, { useState, useMemo } from 'react';
import { CourierPerformanceItem } from "../actions/getGeospatialIntelligence";
import { Truck, CheckCircle, XCircle, Search } from "lucide-react";

// ================================================================
// ✅ FLEXIBLE PROPS INTERFACE (Supports both performance & data props)
// ================================================================
interface GeospatialCourierPerformanceTableProps {
  performance?: CourierPerformanceItem[];
  data?: CourierPerformanceItem[];
}

export default function GeospatialCourierPerformanceTable(props: GeospatialCourierPerformanceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Safe extraction with fallback defaults
  const courierList = props.performance ?? props.data ?? [];

  // Helper to get courier display name
  const getCourierDisplay = (courier: string) => {
    const map: Record<string, string> = {
      tcs: "TCS",
      leopards: "Leopards",
      postex: "PostEx",
      trax: "Trax",
      manual: "Manual",
    };
    return map[courier?.toLowerCase()] || (courier ? courier.toUpperCase() : "UNKNOWN");
  };

  // Helper to get success rate color
  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return "text-emerald-500 font-mono font-bold";
    if (rate >= 70) return "text-amber-500 font-mono font-bold";
    return "text-red-500 font-mono font-bold";
  };

  // Helper to get RTO color
  const getRtoColor = (rate: number) => {
    if (rate <= 5) return "text-emerald-500 font-mono font-bold";
    if (rate <= 15) return "text-amber-500 font-mono font-bold";
    return "text-red-500 font-mono font-bold";
  };

  // ✅ Real-time Filtered List
  const filteredList = useMemo(() => {
    if (!courierList || courierList.length === 0) return [];
    if (!searchTerm.trim()) return courierList;
    const term = searchTerm.toLowerCase();
    return courierList.filter(
      (item) =>
        item.city.toLowerCase().includes(term) ||
        item.courier.toLowerCase().includes(term)
    );
  }, [courierList, searchTerm]);

  // ✅ Empty State
  if (!courierList || courierList.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50 w-full">
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Truck size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Courier Telemetry Available
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No dispatched shipments found in the selected audit period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* SEARCH FILTER TOOLBAR */}
      <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by city or courier name (e.g. TCS, Leopards)..."
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-brand-primary transition-all"
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 hidden sm:inline">
          SHOWING {filteredList.length} OF {courierList.length} SHIPMENT NODES
        </span>
      </div>

      {/* TABLE CONTAINER (With Scroll Guard & Zero Squeezing) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">City</th>
                <th className="py-3 px-4 whitespace-nowrap">Courier Partner</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Total Dispatched</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Delivered</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">RTO Parcels</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Success %</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">RTO %</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Avg Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {filteredList.map((item, idx) => {
                const successColor = getSuccessColor(item.successRate);
                const rtoColor = getRtoColor(item.rtoRate);

                return (
                  <tr
                    key={`${item.city}-${item.courier}-${idx}`}
                    className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase whitespace-nowrap">
                      {item.city}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono font-bold text-brand-primary whitespace-nowrap">
                      {getCourierDisplay(item.courier)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {(item.total || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-500 font-mono font-bold whitespace-nowrap">
                      <CheckCircle size={12} className="inline mr-1" />
                      {(item.delivered || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-center text-red-500 font-mono font-bold whitespace-nowrap">
                      <XCircle size={12} className="inline mr-1" />
                      {(item.rto || 0).toLocaleString('en-PK')}
                    </td>
                    <td className={`py-3 px-4 text-center whitespace-nowrap ${successColor}`}>
                      {(item.successRate || 0).toFixed(1)}%
                    </td>
                    <td className={`py-3 px-4 text-center whitespace-nowrap ${rtoColor}`}>
                      {(item.rtoRate || 0).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 font-mono text-xs whitespace-nowrap">
                      {item.avgDeliveryTimeDays !== null && item.avgDeliveryTimeDays !== undefined
                        ? `${item.avgDeliveryTimeDays.toFixed(1)}d`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 flex justify-between items-center text-[9px] font-mono text-zinc-400 dark:text-zinc-500 flex-wrap gap-2">
          <span>🚚 * Avg Days = Average delivery time from shipment creation to final delivery</span>
          <span>🟢 Success ≥90% • 🟡 70-89% • 🔴 &lt;70%</span>
        </div>
      </div>
    </div>
  );
}