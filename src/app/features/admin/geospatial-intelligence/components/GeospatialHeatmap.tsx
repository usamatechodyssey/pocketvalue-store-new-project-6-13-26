// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialHeatmap.tsx

"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GeospatialCityData } from "../actions/getGeospatialIntelligence";
import { Navigation } from "lucide-react";

interface Props {
  cities: GeospatialCityData[];
}

// ✅ Component to handle map resize (Fixes blank map rendering)
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function GeospatialHeatmap({ cities }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect Dark Mode from html tag
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  // ✅ Filter cities with valid lat/lng coordinates
  const validCities = (cities || []).filter((c) => c.lat !== null && c.lng !== null);

  // Skeleton Loading State
  if (!mounted) {
    return (
      <div
        className="w-full h-100 bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800"
        role="status"
        aria-label="Loading geospatial heatmap"
      />
    );
  }

  // Fallback Empty State
  if (validCities.length === 0) {
    return (
      <div
        className="w-full h-100 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-label="No geospatial data available"
      >
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Navigation size={32} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Coordinates Available
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            No orders with verified regional coordinates were found in this audit period.
          </p>
        </div>
      </div>
    );
  }

  // Max Revenue scaling
  const maxRevenue = Math.max(...validCities.map((c) => c.revenue)) || 1;

  // Center of Pakistan (or average coordinates of available cities)
  const avgLat = validCities.reduce((sum, c) => sum + (c.lat as number), 0) / validCities.length;
  const avgLng = validCities.reduce((sum, c) => sum + (c.lng as number), 0) / validCities.length;

  // ✅ DARK MODE MAP TILE URL (CartoDB Dark Matter vs OpenStreetMap Light)
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div
      className="w-full h-100 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs relative z-0"
      role="img"
      aria-label="Interactive geospatial heatmap showing city sales distribution and RTO rates"
    >
      <MapContainer
        center={[avgLat || 30.3753, avgLng || 69.3451]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> / <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url={tileUrl}
        />
        <MapResizer />

        {validCities.map((city) => {
          const revenueRatio = city.revenue / maxRevenue;
          const radius = 8 + revenueRatio * 32;

          // RTO Risk Color Coding
          const rto = city.rtoRate;
          let fillColor = "#22c55e"; // Low RTO (Emerald)
          if (rto > 15) fillColor = "#ef4444"; // High RTO (Red)
          else if (rto > 8) fillColor = "#eab308"; // Medium RTO (Amber)

          return (
            <CircleMarker
              key={city.city}
              center={[city.lat as number, city.lng as number]}
              radius={radius}
              fillColor={fillColor}
              color="#ffffff"
              weight={1.5}
              opacity={0.9}
              fillOpacity={0.7}
            >
              <Popup className="font-mono text-xs">
                <div className="p-1 space-y-1">
                  <div className="text-xs font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100 border-b pb-1">
                    {city.city} ({city.province})
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Revenue: Rs. {(city.revenue || 0).toLocaleString("en-PK")}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                    Orders: {city.orders.toLocaleString("en-PK")}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                    RTO Rate: {city.rtoRate}%
                  </div>
                  {city.trend === "STAR" && (
                    <div className="text-[10px] font-mono text-emerald-500 font-bold">🚀 STAR PERFORMANCE</div>
                  )}
                  {city.trend === "FALLING" && (
                    <div className="text-[10px] font-mono text-red-500 font-bold">📉 DROPPING TREND</div>
                  )}
                  {city.isHighPotential && (
                    <div className="text-[10px] font-mono text-amber-500 font-bold">⚡ HIGH POTENTIAL ZONE</div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}