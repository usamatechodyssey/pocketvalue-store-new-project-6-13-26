// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralDashboardWidget.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  Navigation,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { BehavioralMetrics } from "../actions/getBehavioralIntelligence";

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString('en-PK');
};

interface BehavioralDashboardWidgetProps {
  data: BehavioralMetrics | null;
}

export default function BehavioralDashboardWidget({ data }: BehavioralDashboardWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"funnel" | "friction" | "discovery" | "demand">("funnel");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading Skeleton (Aligned with Cyber-HUD zinc colors)
  if (!mounted) {
    return (
      <div className="space-y-4 w-full h-full flex flex-col justify-between animate-pulse">
        <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full" />
      </div>
    );
  }

  // Empty State (Dashed Dropzone)
  if (!data || data.totalPageViews === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-55">
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Activity size={28} />
          </div>
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Telemetry Signals Today
          </h3>
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            Once customers start visiting the store, live behavior telemetry will stream here.
          </p>
        </div>
      </div>
    );
  }

  const {
    activeSessions,
    uniqueVisitors,
    avgPageViewsPerSession,
    bounceRate,
    addToCartCount,
    totalPurchases,
    cartAbandonmentRate,
    searchCount,
    searchResultClicks,
    productClicks,
    productImpressions,
    rageClicks,
    oosAttempts,
    jsExceptions,
    checkoutErrors,
    bannerClicks,
    couponApplications,
    scarcityExposures,
    restockRequests,
    customVariantRequests,
    checkoutStarts,
    wishlistAddCount,
    productShares,
    exitIntents,
    trendingSearches,
    topDemandProducts,
    cartRecoveries,
    abandonedCarts,
    filterApplications,
    variantPriceCompares,
    authAttempts,
    loginPrompts,
    supportClicks,
    pdpMediaInteractions,
    generatedAt,
    eventBreakdown,
  } = data;

  // Global calculations
  const totalEvents = Object.values(eventBreakdown).reduce((a, b) => a + b, 0);
  const ctr = productImpressions > 0 ? Number(((productClicks / productImpressions) * 100).toFixed(1)) : 0;
  const conversionRate = checkoutStarts > 0 ? Number(((totalPurchases / checkoutStarts) * 100).toFixed(1)) : 0;
  const totalFriction = rageClicks + exitIntents + oosAttempts + jsExceptions + checkoutErrors;
  const searchCtr = searchCount > 0 ? Number(((searchResultClicks / searchCount) * 100).toFixed(1)) : 0;
  const recoveryRate = cartRecoveries + totalPurchases > 0 ? Number(((cartRecoveries / (cartRecoveries + totalPurchases)) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-4 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* 1. COMPACT TELEMETRY TOOLBAR */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <Activity size={12} className="text-brand-primary" /> {totalEvents.toLocaleString('en-PK')} BEHAVIOR SIGNALS
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            {activeSessions} ACTIVE
          </span>
          <span>•</span>
          <span>{formatNumber(uniqueVisitors)} VISITORS</span>
          <span>•</span>
          <Link href="/admin/behavioral-intelligence" className="text-brand-primary hover:underline flex items-center gap-0.5 no-underline">
            Full Report <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* 2. SYSTEM HEALTH STATUS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 overflow-hidden shadow-2xs">
        
        {/* Status Box 1: Sales Flow */}
        <div className="p-3.5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${conversionRate > 5 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
            {conversionRate > 5 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </div>
          <div className="min-w-0 font-mono">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-none">Sales Conversion</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-none truncate">
              {conversionRate}% Rate <span className="text-[10px] text-zinc-400 font-normal">({conversionRate > 5 ? "HEALTHY" : "LOW"})</span>
            </p>
          </div>
        </div>

        {/* Status Box 2: Error & Friction level */}
        <div className="p-3.5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${totalFriction < 50 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
            {totalFriction < 50 ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          </div>
          <div className="min-w-0 font-mono">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-none">Technical Friction</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-none truncate">
              {totalFriction} Issues <span className="text-[10px] text-zinc-400 font-normal">({totalFriction < 50 ? "STABLE" : "HIGH ALERT"})</span>
            </p>
          </div>
        </div>

        {/* Status Box 3: Traffic Quality */}
        <div className="p-3.5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${bounceRate < 50 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-200 dark:border-zinc-800"}`}>
            <Navigation size={16} />
          </div>
          <div className="min-w-0 font-mono">
            <p className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-none">Engagement & Bounce</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-none truncate">
              {bounceRate}% Bounce <span className="text-[10px] text-zinc-400 font-normal">({avgPageViewsPerSession.toFixed(1)} pages/session)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. NEAT ACCORDION TABS CONTROLLERS */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto gap-1">
        {[
          { id: "funnel", label: "🛒 Funnel & Checkout", desc: "Purchases, cart details, abandonment rate" },
          { id: "friction", label: "⚠️ Friction & Errors", desc: "Rage clicks, JS exceptions, checkout bugs" },
          { id: "discovery", label: "🔍 Search & Promos", desc: "Product CTR, media clicks, banners" },
          { id: "demand", label: "📦 Demand & Loyalty", desc: "Out of stock clicks, restock requests" },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 min-w-37.5 text-left p-2 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-800 shadow-xs border-zinc-200 dark:border-zinc-700"
                  : "bg-transparent border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-850/50"
              }`}
            >
              <p className={`text-[11px] font-mono font-bold ${isActive ? "text-brand-primary" : "text-zinc-500"}`}>{tab.label}</p>
              <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 4. DYNAMIC MINIMAL TAB PANEL */}
      <div className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl min-h-36">
        
        {/* TAB 1: FUNNEL & CHECKOUT */}
        {activeSubTab === "funnel" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200 font-mono">
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Add to Carts</span>
              <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{formatNumber(addToCartCount)}</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{checkoutStarts} checkouts started</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Total Purchases</span>
              <span className="text-base font-black text-emerald-500 block mt-1">{formatNumber(totalPurchases)}</span>
              <span className="text-[9px] text-emerald-500 font-bold mt-0.5">Conv: {conversionRate}%</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Cart Abandonment</span>
              <span className="text-base font-black text-red-500 block mt-1">{cartAbandonmentRate.toFixed(1)}%</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">{abandonedCarts} carts left</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Cart Recoveries</span>
              <span className="text-base font-black text-purple-500 block mt-1">{formatNumber(cartRecoveries)}</span>
              <span className="text-[9px] text-purple-500 font-bold mt-0.5">Rec. Rate: {recoveryRate}%</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl col-span-2 md:col-span-4 flex justify-between items-center text-[10px] text-zinc-500">
              <span>🎟️ Coupon Applications: <strong>{couponApplications}</strong></span>
              <span>🔥 Scarcity Exposures: <strong>{scarcityExposures} views</strong></span>
            </div>
          </div>
        )}

        {/* TAB 2: FRICTION & ERRORS */}
        {activeSubTab === "friction" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs animate-in fade-in duration-200 font-mono">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Rage Clicks</span>
              <span className="text-base font-black block mt-1">{rageClicks}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Frustrated clicks</span>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Exit Intents</span>
              <span className="text-base font-black block mt-1">{exitIntents}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Sudden bounces</span>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">OOS Attempts</span>
              <span className="text-base font-black block mt-1">{oosAttempts}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Out-of-stock clicks</span>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">JS Errors</span>
              <span className="text-base font-black block mt-1">{jsExceptions}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Script failures</span>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Checkout Errors</span>
              <span className="text-base font-black block mt-1">{checkoutErrors}</span>
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Payment gate errors</span>
            </div>
          </div>
        )}

        {/* TAB 3: SEARCH & PROMOS */}
        {activeSubTab === "discovery" && (
          <div className="space-y-4 text-xs animate-in fade-in duration-200 font-mono">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Queries Run</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{formatNumber(searchCount)}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{searchResultClicks} clicks · {searchCtr}% CTR</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Product Clicks</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{formatNumber(productClicks)}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{formatNumber(productImpressions)} impressions · {ctr}% CTR</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Promo Clicks</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{formatNumber(bannerClicks)}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Campaign engagement</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Media Plays</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{pdpMediaInteractions}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Image & Video views</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Interactions</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{variantPriceCompares + filterApplications}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{filterApplications} filter apps · {variantPriceCompares} compares</span>
              </div>
            </div>
            
            {/* Trending Queries inside this Tab */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold block mb-2">🔥 Hot Search Queries:</span>
              <div className="flex flex-wrap gap-1.5">
                {trendingSearches && trendingSearches.length > 0 ? (
                  trendingSearches.slice(0, 5).map((q, idx) => (
                    <span key={idx} className="bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-[10px]">
                      {q.term} <strong className="text-zinc-900 dark:text-white ml-1 font-mono font-bold">({q.count})</strong>
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 italic">No search metrics recorded</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEMAND & LOYALTY */}
        {activeSubTab === "demand" && (
          <div className="space-y-4 text-xs animate-in fade-in duration-200 font-mono">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Restock Requests</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{restockRequests}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Out-of-stock demand</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Variant Inquiries</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{customVariantRequests}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">Custom size/color reqs</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Wishlist Additions</span>
                <span className="text-base font-black text-pink-500 block mt-1">{formatNumber(wishlistAddCount)}</span>
                <span className="text-[9px] text-pink-500 font-bold mt-0.5">Future demand signals</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Shares & Prompts</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{productShares + loginPrompts + supportClicks}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{productShares} shares · {supportClicks} support</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Security Hits</span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block mt-1">{authAttempts}</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">System gate hits</span>
              </div>
            </div>

            {/* Top Demands inside this Tab */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold block mb-2">📦 Out of stock item inquiries:</span>
              <div className="flex flex-wrap gap-1.5">
                {topDemandProducts && topDemandProducts.length > 0 ? (
                  topDemandProducts.slice(0, 4).map((item, idx) => (
                    <span key={idx} className="bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 font-mono font-bold text-[10px]">
                      {item.productName} — <strong className="text-orange-500 font-bold">{item.requests} reqs</strong>
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 italic">No restock notifications filed today</span>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5. FOOTER TIMESTAMP BAR */}
      <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
        <span>Active Event Channels: {Object.keys(eventBreakdown).length}</span>
        <span className="flex items-center gap-1">
          <Clock size={10} />
          Synced: {generatedAt ? new Date(generatedAt).toLocaleTimeString() : "Just now"}
        </span>
      </div>

    </div>
  );
}