
// 📂 src/app/features/admin/marketing/components/CampaignOverviewWidget.tsx (TOP-TIER PKR LOCALIZED & SEARCH-FILTERABLE)

"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  BarChart3,
  ArrowUpDown,
  Search,
  Globe,
  Minus,
} from "lucide-react";
import { CampaignMetricsResponse, CampaignMetric } from "../actions/getCampaignMetrics";

// ================================================================
// ✅ HELPERS
// ================================================================
const formatCurrency = (value: number): string => `Rs. ${(value || 0).toLocaleString('en-PK')}`;
const formatPercent = (value: number): string => `${(value || 0).toFixed(1)}%`;

const getTrend = (value: number): "up" | "down" | "neutral" => {
  if (value > 10) return "up";
  if (value < -10) return "down";
  return "neutral";
};

const TrendIcon = ({ value }: { value: number }) => {
  const trend = getTrend(value);
  if (trend === "up") return <TrendingUp size={14} className="text-emerald-500" />;
  if (trend === "down") return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={12} className="text-zinc-400" />;
};

// ================================================================
// ✅ HIGH-DENSITY KPI CARD
// ================================================================
const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = "brand",
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color?: "brand" | "emerald" | "purple" | "blue";
}) => {
  const colorClasses = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-tight wrap-break-word">
          {title}
        </p>
        <div className={`p-2 rounded-xl border ${colorClasses[color]} shrink-0 shadow-2xs`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">
          {value}
        </p>
        {subtext && (
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-tight wrap-break-word">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
interface CampaignOverviewWidgetProps {
  data: CampaignMetricsResponse | null;
  isLoading?: boolean;
}

export default function CampaignOverviewWidget({
  data,
  isLoading = false,
}: CampaignOverviewWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof CampaignMetric>("revenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof CampaignMetric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // ✅ Search Filtering + Sorting
  const filteredAndSortedData = useMemo(() => {
    if (!data || !data.data) return [];

    let filtered = data.data;

    if (searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.campaign.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [data, searchTerm, sortField, sortDirection]);

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800"
            />
          ))}
        </div>
        <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
      </div>
    );
  }

  // Empty State (Synchronized Height)
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Campaign Data Available
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Start running marketing campaigns with UTM parameters to evaluate traffic acquisition, conversions, and ROI here.
          </p>
        </div>
      </div>
    );
  }

  const totalRevenue = data.totalRevenue || 0;
  const totalVisits = data.totalVisits || 0;
  const totalOrders = data.totalOrders || 0;
  const avgConvRate = data.avgConversionRate || 0;
  const topCampaignName = data.topCampaign || "N/A";

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* KPI ROW (4 Dynamic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Campaign Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`${totalOrders} Converted Orders`}
          icon={Banknote}
          color="brand"
        />
        <KPICard
          title="Top Campaign"
          value={topCampaignName}
          subtext="Revenue Leader"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Campaign Traffic"
          value={totalVisits.toLocaleString('en-PK')}
          subtext={`${totalOrders} Orders Generated`}
          icon={Globe}
          color="purple"
        />
        <KPICard
          title="Overall Conv. Rate"
          value={formatPercent(avgConvRate)}
          subtext="Traffic Conversion Efficiency"
          icon={BarChart3}
          color="blue"
        />
      </div>

      {/* CAMPAIGN PERFORMANCE TABLE CONTAINER */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        
        {/* SEARCH FILTER TOOLBAR */}
        <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 bg-white/50 dark:bg-zinc-950/50">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter campaigns by name..."
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-brand-primary transition-all"
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold hidden sm:inline">
            SHOWING {filteredAndSortedData.length} OF {data.data.length} SOURCES
          </span>
        </div>

        {/* SCROLLABLE TABLE */}
        <div className="overflow-x-auto max-h-95 custom-scrollbar">
          <table className="w-full min-w-162.5 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Campaign</th>
                {[
                  { key: "visits", label: "Visits" },
                  { key: "orders", label: "Orders" },
                  { key: "revenue", label: "Revenue" },
                  { key: "averageOrderValue", label: "AOV" },
                  { key: "conversionRate", label: "Conv. Rate" },
                  { key: "roi", label: "Rev / Visit" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="py-3 px-4 text-right cursor-pointer hover:text-brand-primary transition-colors group select-none whitespace-nowrap"
                    onClick={() => handleSort(key as keyof CampaignMetric)}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{label}</span>
                      <ArrowUpDown size={11} className="text-zinc-400 dark:text-zinc-600 group-hover:text-brand-primary transition-colors" />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center whitespace-nowrap">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {filteredAndSortedData.map((campaign) => (
                <tr
                  key={campaign.campaign}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {campaign.campaign}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono whitespace-nowrap">
                    {campaign.visits.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono whitespace-nowrap">
                    {campaign.orders.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-brand-primary font-mono whitespace-nowrap">
                    {formatCurrency(campaign.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono whitespace-nowrap">
                    {formatCurrency(campaign.averageOrderValue)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold inline-block border ${
                        campaign.conversionRate > 5
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : campaign.conversionRate > 2
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {formatPercent(campaign.conversionRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono whitespace-nowrap">
                    {formatCurrency(campaign.roi)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <TrendIcon value={campaign.roi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}