// 📂 src/app/features/admin/behavioral-intelligence/components/BehavioralDashboardWidget.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Clock,
  ArrowUpRight,
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

  // Loading Skeleton
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl space-y-4 w-full h-full flex flex-col justify-between animate-pulse min-h-100">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full" />
        <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full" />
      </div>
    );
  }

  // Empty State
  if (!data || data.totalPageViews === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group overflow-hidden">
        <div className="mb-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Activity size={20} className="text-brand-primary" /> Telemetry Signals
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time User Behavior & Conversion Loops
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest font-mono">
              No Telemetry Signals Today
            </p>
            <p className="text-[10px] text-zinc-400 font-medium mt-1 font-sans">
              Once customers start visiting the store, live behavior telemetry will stream here.
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/behavioral-intelligence"
            className="w-full py-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
          >
            Open Behavioral Intelligence <ArrowUpRight size={14} />
          </Link>
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

  const totalEvents = Object.values(eventBreakdown).reduce((a, b) => a + b, 0);
  const ctr = productImpressions > 0 ? Number(Math.min(100, (productClicks / productImpressions) * 100).toFixed(1)) : 0;
  const conversionRate = checkoutStarts > 0 ? Number(Math.min(100, (totalPurchases / checkoutStarts) * 100).toFixed(1)) : 0;
  const totalFriction = rageClicks + exitIntents + oosAttempts + jsExceptions + checkoutErrors;
  const searchCtr = searchCount > 0 ? Number(Math.min(100, (searchResultClicks / searchCount) * 100).toFixed(1)) : 0;
  const recoveryRate = cartRecoveries + totalPurchases > 0 ? Number(Math.min(100, (cartRecoveries / (cartRecoveries + totalPurchases)) * 100).toFixed(1)) : 0;

  return (
    <div
      className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl h-full flex flex-col group transition-all relative overflow-hidden"
      role="region"
      aria-label="Behavioral Telemetry & Conversion Loops"
    >
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 italic font-mono">
            <Activity size={20} className="text-brand-primary" /> Behavioral Telemetry
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium italic mt-0.5 font-sans">
            Real-Time User Behavior & Conversion Signals
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {activeSessions} ACTIVE SESSIONS
          </span>
          <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-brand-primary">
            {totalEvents.toLocaleString('en-PK')} SIGNALS
          </span>
        </div>
      </div>

      {/* SYSTEM HEALTH STATUS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden shadow-2xs mb-6">
        
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
          <div className={`p-2.5 rounded-xl border shrink-0 ${totalFriction < 50 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
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

      {/* ACCORDION TABS CONTROLLERS */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto gap-1 mb-4">
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
              className={`flex-1 min-w-37.5 text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-800 shadow-xs border-zinc-200 dark:border-zinc-700"
                  : "bg-transparent border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-850/50"
              }`}
            >
              <p className={`text-[11px] font-mono font-bold ${isActive ? "text-brand-primary" : "text-zinc-500 dark:text-zinc-400"}`}>{tab.label}</p>
              <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC MINIMAL TAB PANEL */}
      <div className="p-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex-1 mb-6">
        
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
              <span className="text-base font-black text-rose-500 block mt-1">{cartAbandonmentRate.toFixed(1)}%</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">{abandonedCarts} carts left</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Cart Recoveries</span>
              <span className="text-base font-black text-purple-500 block mt-1">{formatNumber(cartRecoveries)}</span>
              <span className="text-[9px] text-purple-500 font-bold mt-0.5">Rec. Rate: {recoveryRate}%</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl col-span-2 md:col-span-4 flex justify-between items-center text-[10px] text-zinc-500 flex-wrap gap-2">
              <span>🎟️ Coupon Applications: <strong>{couponApplications}</strong></span>
              <span>🔥 Scarcity Exposures: <strong>{scarcityExposures} views</strong></span>
            </div>
          </div>
        )}

        {/* TAB 2: FRICTION & ERRORS */}
        {activeSubTab === "friction" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs animate-in fade-in duration-200 font-mono">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Rage Clicks</span>
              <span className="text-base font-black block mt-1">{rageClicks}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">Frustrated clicks</span>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Exit Intents</span>
              <span className="text-base font-black block mt-1">{exitIntents}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">Sudden bounces</span>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">OOS Attempts</span>
              <span className="text-base font-black block mt-1">{oosAttempts}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">Out-of-stock clicks</span>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">JS Errors</span>
              <span className="text-base font-black block mt-1">{jsExceptions}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">Script failures</span>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block uppercase font-bold">Checkout Errors</span>
              <span className="text-base font-black block mt-1">{checkoutErrors}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-0.5">Payment gate errors</span>
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
            
            {/* Trending Queries */}
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
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
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

            {/* Top Demands */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold block mb-2">📦 Out of stock item inquiries:</span>
              <div className="flex flex-wrap gap-1.5">
                {topDemandProducts && topDemandProducts.length > 0 ? (
                  topDemandProducts.slice(0, 4).map((item, idx) => (
                    <span key={idx} className="bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 font-mono font-bold text-[10px]">
                      {item.productName} — <strong className="text-brand-primary font-bold">{item.requests} reqs</strong>
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

      {/* FOOTER LINK */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-3">
          <span>Active Channels: {Object.keys(eventBreakdown).length}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Synced: {generatedAt ? new Date(generatedAt).toLocaleTimeString() : "Just now"}
          </span>
        </div>
        <Link
          href="/admin/behavioral-intelligence"
          className="py-2.5 px-5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xs no-underline hover:no-underline"
        >
          Open Full Telemetry <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}