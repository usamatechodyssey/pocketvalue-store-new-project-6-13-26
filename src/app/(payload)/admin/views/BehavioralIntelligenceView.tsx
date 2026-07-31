// 📂 src/app/(payload)/admin/views/BehavioralIntelligenceView.tsx

import React from "react";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { startOfDay, endOfDay, parseISO, format, subDays } from "date-fns";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Radio } from "lucide-react";

// ✅ Shared Components
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// ✅ Behavioral Intelligence — Dedicated Views
import BehavioralCartView from "@/app/features/admin/behavioral-intelligence/components/BehavioralCartView";
import BehavioralDemandView from "@/app/features/admin/behavioral-intelligence/components/BehavioralDemandView";
import BehavioralEventsView from "@/app/features/admin/behavioral-intelligence/components/BehavioralEventsView";
import BehavioralFrictionView from "@/app/features/admin/behavioral-intelligence/components/BehavioralFrictionView";
import BehavioralNavigationView from "@/app/features/admin/behavioral-intelligence/components/BehavioralNavigationView";
import BehavioralProductView from "@/app/features/admin/behavioral-intelligence/components/BehavioralProductView";
import BehavioralPromotionsView from "@/app/features/admin/behavioral-intelligence/components/BehavioralPromotionsView";
import BehavioralSearchView from "@/app/features/admin/behavioral-intelligence/components/BehavioralSearchView";
import BehavioralSessionsView from "@/app/features/admin/behavioral-intelligence/components/BehavioralSessionsView";

interface BehavioralIntelligenceViewProps {
  initPageResult: any;
  params: any;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  payload?: any;
  i18n?: any;
  locale?: any;
  user?: any;
  permissions?: any;
  visibleEntities?: any;
}

// ================================================================
// 🧩 TABS CONFIGURATION
// ================================================================
const TABS = [
  { id: "sessions", label: "Sessions", icon: "👥" },
  { id: "navigation", label: "Navigation", icon: "🧭" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "cart", label: "Cart & Funnel", icon: "🛒" },
  { id: "product", label: "Product", icon: "📦" },
  { id: "friction", label: "Friction", icon: "⚠️" },
  { id: "promotions", label: "Promotions", icon: "📢" },
  { id: "demand", label: "Demand", icon: "📝" },
  { id: "events", label: "Events Explorer", icon: "📜" },
];

// ================================================================
// 🚀 MAIN PAGE
// ================================================================
export default async function BehavioralIntelligenceView(
  props: BehavioralIntelligenceViewProps
) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // ✅ FIX 1: Support both startDate/endDate & from/to searchParams for Date Range Picker compatibility
  const fromParam = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toParam = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const today = new Date();
  const defaultFrom = subDays(today, 7);

  const from = fromParam
    ? startOfDay(parseISO(fromParam))
    : startOfDay(defaultFrom);

  const to = toParam
    ? endOfDay(parseISO(toParam))
    : endOfDay(today);

  const range = { from, to };

  // ✅ 2. Get Active Tab from URL
  const activeTab = (searchParams?.tab as string) || "sessions";

  // ✅ 3. Extract i18n and other props
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const safePayload = props.payload || initPageResult?.req?.payload;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  // ✅ 4. Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "sessions":
        return <BehavioralSessionsView range={range} />;
      case "navigation":
        return <BehavioralNavigationView range={range} />;
      case "search":
        return <BehavioralSearchView range={range} />;
      case "cart":
        return <BehavioralCartView range={range} />;
      case "product":
        return <BehavioralProductView range={range} />;
      case "friction":
        return <BehavioralFrictionView range={range} />;
      case "promotions":
        return <BehavioralPromotionsView range={range} />;
      case "demand":
        return <BehavioralDemandView range={range} />;
      case "events":
        return <BehavioralEventsView range={range} />;
      default:
        return <BehavioralSessionsView range={range} />;
    }
  };

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={safePayload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 sm:p-6 lg:p-10 space-y-10 max-w-[1800px] mx-auto bg-zinc-50/50 dark:bg-zinc-950/40 min-h-screen pb-20">
        
        {/* ================================================================ */}
        {/* 👑 HERO HEADER */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          <div className="space-y-2 relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-primary hover:underline mb-1 no-underline"
            >
              <ArrowLeft size={14} /> Back to Hub
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3">
                <BrainCircuit size={32} className="text-brand-primary shrink-0" />
                Behavioral Intelligence
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Neural Pattern Engine
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
              BEHAVIORAL AUDIT:{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.from, "MMM dd, yyyy")}
              </span>{" "}
              —{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.to, "MMM dd, yyyy")}
              </span>{" "}
              | <span className="font-bold text-brand-primary">{TABS.find((t) => t.id === activeTab)?.label || "Overview"} VIEW</span>
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* ================================================================ */}
        {/* 🎛️ TAB SWITCHER */}
        {/* ================================================================ */}
        <div
          className="flex flex-wrap gap-1 bg-white dark:bg-zinc-950 p-2 sm:p-2.5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden"
          role="tablist"
          aria-label="Behavioral Intelligence tabs"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/behavioral-intelligence?tab=${tab.id}&from=${format(range.from, "yyyy-MM-dd")}&to=${format(range.to, "yyyy-MM-dd")}`}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label} tab`}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all no-underline hover:no-underline ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* ================================================================ */}
        {/* ⚡ TAB CONTENT CONTAINER */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-h-100">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
          
          <div className="relative z-10 animate-in fade-in duration-500 w-full min-w-0">
            {renderTabContent()}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 📊 TELEMETRY TICKER FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-x-4 gap-y-2 flex-wrap">
            <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500" /> Neural Pattern Recognition Active</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>📊 Real-time Behavioral Telemetry</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>⚡ Viewing: {TABS.find((t) => t.id === activeTab)?.label} Metrics</span>
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}