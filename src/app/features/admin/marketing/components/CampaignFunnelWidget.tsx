// 📂 src/app/features/admin/marketing/components/CampaignFunnelWidget.tsx (TOP-TIER FULL-FUNNEL CONVERSION SYNCED)

"use client";

import React from "react";
import { TrendingUp, Filter } from "lucide-react";
import { CampaignFunnelResponse } from "../actions/getCampaignFunnel";

// ================================================================
// ✅ HELPERS (With en-PK Formatting)
// ================================================================
const formatPercent = (value: number) => `${(value || 0).toFixed(1)}%`;

const getRateBadge = (value: number) => {
  if (value >= 20) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  if (value >= 10) return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
  return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
interface CampaignFunnelWidgetProps {
  data: CampaignFunnelResponse | null;
  isLoading?: boolean;
}

export default function CampaignFunnelWidget({
  data,
  isLoading = false,
}: CampaignFunnelWidgetProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse w-full">
        <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State (Dashed Dropzone Style)
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Funnel Telemetry Available
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Run marketing campaigns with UTM parameters to capture full conversion stage details (Views ➔ ATCs ➔ Checkouts ➔ Purchases).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Top Action Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Master Conv: {formatPercent(data.overallFunnelConversion || 0)}
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
          {data.totalCampaigns || data.data.length} CAMPAIGNS
        </span>
      </div>

      {/* Table Container (10-Column Scroll Guard) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-105 custom-scrollbar">
          <table className="w-full min-w-212.5 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Campaign</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Views</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Add-to-Cart</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Checkout</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Purchases</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Accounts</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">View→Cart</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Cart→Checkout</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Checkout→Purchase</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Overall Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {data.data.map((campaign) => (
                <tr
                  key={campaign.campaign}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {campaign.campaign}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {campaign.views.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {campaign.addToCarts.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {campaign.checkouts.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {campaign.purchases.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                    {campaign.accountCreated.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getRateBadge(
                        campaign.viewToCartRate
                      )}`}
                    >
                      {formatPercent(campaign.viewToCartRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getRateBadge(
                        campaign.cartToCheckoutRate
                      )}`}
                    >
                      {formatPercent(campaign.cartToCheckoutRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getRateBadge(
                        campaign.checkoutToPurchaseRate
                      )}`}
                    >
                      {formatPercent(campaign.checkoutToPurchaseRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border ${getRateBadge(
                        campaign.overallConversionRate
                      )}`}
                    >
                      {formatPercent(campaign.overallConversionRate)}
                    </span>
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