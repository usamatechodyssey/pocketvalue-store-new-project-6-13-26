// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialIntelligence.tsx

"use client";

import React, { useState } from "react";
import {
  MapPin,
  Globe,
  Compass,
  Truck,
  Navigation,
  Radio,
  Sparkles,
  Layers,
} from "lucide-react";
import { GeospatialResponse } from "../actions/getGeospatialIntelligence";
import GeospatialStatsSummary from "./GeospatialStatsSummary";
import GeospatialHeatmap from "./GeospatialHeatmap";
import GeospatialCityTable from "./GeospatialCityTable";
import GeospatialProvinceList from "./GeospatialProvinceList";
import GeospatialCourierPerformanceTable from "./GeospatialCourierPerformanceTable";
import GeospatialDistanceAnalysis from "./GeospatialDistanceAnalysis";
import GeospatialFilters from "./GeospatialFilters";
import GeospatialExportButton from "./GeospatialExportButton";

// ================================================================
// ✅ TYPES
// ================================================================
interface GeospatialIntelligenceProps {
  data: GeospatialResponse | null;
}

type ActiveTab = "map" | "provinces" | "courier" | "distance";

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function GeospatialIntelligence({ data }: GeospatialIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("map");

  // ✅ Empty / Null State Handling
  if (!data || !data.cities || data.cities.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Navigation size={36} />
          </div>
          <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Geospatial Data Found
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 leading-relaxed">
            No orders with verified regional coordinates or city data were recorded for the selected audit timeframe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* ================================================================ */}
      {/* 👑 CYBER-HUD HERO HEADER */}
      {/* ================================================================ */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3">
              Geospatial Intelligence Engine
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Regional Telemetry
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
            Visualizing demand clusters, regional RTO risk zones, and logistics efficiency across Pakistan.
          </p>
        </div>

        {/* CSV Export Button */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <GeospatialExportButton data={data} />
        </div>
      </div>

      {/* ================================================================ */}
      {/* 📊 KPI STATS SUMMARY ROW */}
      {/* ================================================================ */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-w-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
        <GeospatialStatsSummary summary={data.summary} />
      </div>

      {/* ================================================================ */}
      {/* 🎛️ TAB SWITCHER & FILTERS TOOLBAR */}
      {/* ================================================================ */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          
          {/* Active View Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("map")}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "map"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <MapPin size={14} /> Map & City Tiers
            </button>
            <button
              onClick={() => setActiveTab("provinces")}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "provinces"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Globe size={14} /> Province Breakdown
            </button>
            <button
              onClick={() => setActiveTab("courier")}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "courier"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Truck size={14} /> Courier Logistics
            </button>
            <button
              onClick={() => setActiveTab("distance")}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "distance"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Compass size={14} /> Distance Radius
            </button>
          </div>

          {/* Search & Province Filter Bar */}
          <GeospatialFilters />
        </div>

        {/* ================================================================ */}
        {/* 🗺️ TAB 1: HEATMAP & CITY DATA GRID */}
        {/* ================================================================ */}
        {activeTab === "map" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Pakistan Heatmap Visualizer */}
            <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
              <GeospatialHeatmap cities={data.cities} />
            </div>

            {/* City Data Table Grid */}
            <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
              <GeospatialCityTable cities={data.cities} />
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🏛️ TAB 2: PROVINCE REGIONAL TIERS */}
        {/* ================================================================ */}
        {activeTab === "provinces" && (
          <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 animate-in fade-in duration-300">
            <GeospatialProvinceList provinces={data.provinces} />
          </div>
        )}

        {/* ================================================================ */}
        {/* 🚚 TAB 3: COURIER LOGISTICS & RTO RATES */}
        {/* ================================================================ */}
        {activeTab === "courier" && (
          <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 animate-in fade-in duration-300">
            <GeospatialCourierPerformanceTable performance={data.logistics.courierPerformance} />
          </div>
        )}

        {/* ================================================================ */}
        {/* 📍 TAB 4: WAREHOUSE DISTANCE RADIUS BUCKETS */}
        {/* ================================================================ */}
        {activeTab === "distance" && (
          <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 animate-in fade-in duration-300">
            <GeospatialDistanceAnalysis analysis={data.logistics.distanceAnalysis} />
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 📊 TELEMETRY TICKER FOOTER */}
      {/* ================================================================ */}
      <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-center gap-x-6 gap-y-3 flex-wrap text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500" /> Geospatial Regional Intelligence</span>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <span>📍 Pakistan Coordinates Engine</span>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <span>🚚 Courier Logistics & RTO Audit</span>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <span>🏛️ Provincial Regional Tiers</span>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <span>🎯 Warehouse Distance Radius</span>
        </div>
        <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-4">
          PocketValue / Regional Control Center • Generated at: {data.generatedAt}
        </p>
      </div>

    </div>
  );
}