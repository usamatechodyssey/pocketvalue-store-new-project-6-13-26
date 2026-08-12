
// 📂 src/app/(payload)/admin/views/MarketingHubView.tsx (OUTSIDE HERO DATE PICKER & FULL TELEMETRY DELEGATED)

import { DefaultTemplate } from "@payloadcms/next/templates";
import { format, startOfDay, endOfDay, parseISO, subDays } from "date-fns";

// ✅ Action Fetchers
import { getCampaignMetrics } from "@/app/features/admin/marketing/actions/getCampaignMetrics";
import { getProductFriction } from "@/app/features/admin/marketing/actions/getProductFriction";
import { getCampaignFunnel } from "@/app/features/admin/marketing/actions/getCampaignFunnel";
import { getRFMSegments } from "@/app/features/admin/marketing/actions/getRFMSegments";

// ✅ Component Widgets
import CampaignOverviewWidget from "@/app/features/admin/marketing/components/CampaignOverviewWidget";
import ProductFrictionWidget from "@/app/features/admin/marketing/components/ProductFrictionWidget";
import RFMSegmentWidget from "@/app/features/admin/marketing/components/RFMSegmentWidget";
import RFMSegmentList from "@/app/features/admin/marketing/components/RFMSegmentList";
import AbandonedCartsWidget from "@/app/features/admin/marketing/components/AbandonedCartsWidget";
import WelcomeWidget from "@/app/features/admin/marketing/components/WelcomeWidget";
import WinbackWidget from "@/app/features/admin/marketing/components/WinbackWidget";
import CampaignComposer from "@/app/features/admin/marketing/components/CampaignComposer";
import CampaignFunnelWidget from "@/app/features/admin/marketing/components/CampaignFunnelWidget";
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

import {
  BarChart3,
  RefreshCw,
  Send,
  Users,
  ShoppingCart,
  UserPlus,
  UserX,
  TrendingUp,
  Activity,
  Radio,
  AlertTriangle,
} from "lucide-react";

// ================================================================
// ✅ TYPES
// ================================================================
interface MarketingHubViewProps {
  initPageResult?: any;
  params?: any;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  payload?: any;
  i18n?: any;
  locale?: any;
  user?: any;
  permissions?: any;
  visibleEntities?: any;
}

// ================================================================
// 🔧 HELPER: Safe Date Parsing
// ================================================================
const safeParseDate = (dateStr: string | undefined, fallback: Date): Date => {
  if (!dateStr) return fallback;
  const parsed = parseISO(dateStr);
  return isNaN(parsed.getTime()) ? fallback : parsed;
};

// ================================================================
// 🧩 CYBER-HUD SECTION HEADER COMPONENT
// ================================================================
const SectionHeader = ({
  icon: Icon,
  title,
  description,
  badgeText,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  badgeText?: string;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
    <div className="flex items-center gap-3.5">
      <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0 shadow-xs">
        <Icon size={20} className="stroke-[2.5px]" />
      </div>
      <div>
        <h3 className="text-lg lg:text-xl font-black uppercase tracking-tighter flex items-center gap-2 italic text-zinc-900 dark:text-white font-mono">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 font-sans">
            {description}
          </p>
        )}
      </div>
    </div>
    {badgeText && (
      <span className="self-start sm:self-center text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
        {badgeText}
      </span>
    )}
  </div>
);

// ================================================================
// 🚀 PAGE COMPONENT (Server Component - Top-Right Date Toolbar)
// ================================================================
export default async function MarketingHubView(props: MarketingHubViewProps) {
  const searchParams = await props.searchParams;
  const refresh = searchParams?.refresh === "true";
  const segment = searchParams?.segment as string | undefined;

  // 1. Parse Date Range with fallback (default: last 30 days)
  const today = new Date();
  const defaultFrom = subDays(today, 30);

  const fromStr = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toStr = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const from = startOfDay(safeParseDate(fromStr, defaultFrom));
  const to = endOfDay(safeParseDate(toStr, today));

  // Extract Payload template props
  const i18n = props.i18n || props.initPageResult?.req?.i18n;
  const locale = props.locale || props.initPageResult?.locale;
  const payload = props.payload || props.initPageResult?.req?.payload;
  const user = props.user || props.initPageResult?.req?.user;
  const permissions = props.permissions || props.initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;
  const params = props.params || {};

  // 2. Parallel Data Fetching With Date Range Parameters
  const [campaignResult, frictionResult, funnelResult, rfmResult] = await Promise.allSettled([
    getCampaignMetrics({ startDate: from, endDate: to }),
    getProductFriction({ startDate: from, endDate: to }),
    getCampaignFunnel({ startDate: from, endDate: to }),
    getRFMSegments({ range: { startDate: from, endDate: to } }),
  ]);

  const campaignData =
    campaignResult.status === "fulfilled" && campaignResult.value.success
      ? campaignResult.value.data ?? null
      : null;
  const campaignError =
    campaignResult.status === "rejected"
      ? (campaignResult.reason as Error)?.message
      : campaignResult.status === "fulfilled" && !campaignResult.value.success
      ? campaignResult.value.error
      : null;

  const frictionData =
    frictionResult.status === "fulfilled" && frictionResult.value.success
      ? frictionResult.value.data ?? null
      : null;
  const frictionError =
    frictionResult.status === "rejected"
      ? (frictionResult.reason as Error)?.message
      : frictionResult.status === "fulfilled" && !frictionResult.value.success
      ? frictionResult.value.error
      : null;

  const funnelData =
    funnelResult.status === "fulfilled" && funnelResult.value.success
      ? funnelResult.value.data ?? null
      : null;
  const funnelError =
    funnelResult.status === "rejected"
      ? (funnelResult.reason as Error)?.message
      : funnelResult.status === "fulfilled" && !funnelResult.value.success
      ? funnelResult.value.error
      : null;

  const hasError = campaignError || frictionError || funnelError;
  const hasNoData = !campaignData && !frictionData && !funnelData;

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1800px] mx-auto bg-zinc-50/50 dark:bg-zinc-950/40 min-h-screen font-sans">
        
        {/* ================================================================ */}
        {/* 📅 TOP-RIGHT TOOLBAR: Date Range Picker OUTSIDE Hero Header */}
        {/* ================================================================ */}
        <div className="flex items-center justify-end w-full print:hidden">
          <div className="shadow-2xs">
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* ================================================================ */}
        {/* 👑 HERO HEADER CARD */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Left: Title & Subtitle */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3 font-mono">
                Marketing Intelligence Hub
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Marketing Telemetry
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
              {segment
                ? `FILTERED SEGMENT: ${segment.toUpperCase()}`
                : "Campaign ROI • Product Friction • RFM • Abandoned Carts • Welcome • Winback • Funnel"}
            </p>
          </div>

          {/* Right: Recalculate Button */}
          <div className="relative z-10 self-start md:self-center">
            <a
              href={
                segment
                  ? `/admin/marketing-hub?segment=${encodeURIComponent(segment)}&refresh=true`
                  : "/admin/marketing-hub?refresh=true"
              }
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 no-underline hover:no-underline"
              title="Recalculate and refresh telemetry"
            >
              <RefreshCw size={14} className={refresh ? "animate-spin" : ""} />
              {refresh ? "Recalculating..." : "Recalculate Hub"}
            </a>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ⚡ CONTENT ZONES (100% FULL-WIDTH STACKED) */}
        {/* ================================================================ */}
        {segment ? (
          <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full">
            <RFMSegmentList segment={segment} />
          </div>
        ) : (
          <div className="space-y-10 w-full">
            
            {/* ERROR FALLBACK CARD */}
            {hasError && hasNoData && (
              <div className="bg-white dark:bg-zinc-950 border border-red-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden w-full">
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-mono">
                    Telemetry Stream Disrupted
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {campaignError || frictionError || funnelError || "An unexpected telemetry error occurred."}
                  </p>
                  <a
                    href="/admin/marketing-hub"
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-mono text-xs font-bold uppercase rounded-xl transition-all no-underline"
                  >
                    <RefreshCw size={14} /> Reconnect Hub
                  </a>
                </div>
              </div>
            )}

            {!hasNoData && (
              <>
                {/* 1. SECTION 1: CAMPAIGN ROI & ATTRIBUTION */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full transition-all duration-300">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={BarChart3}
                    title="Campaign ROI & Attribution Matrix"
                    description="UTM Source performance, conversion velocity, and AOV analysis"
                    badgeText="01 • FULL WIDTH"
                  />
                  <div className="mt-6 w-full min-w-0">
                    {campaignError && !campaignData ? (
                      <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                        Failed to load campaign data: {campaignError}
                      </div>
                    ) : (
                      <CampaignOverviewWidget data={campaignData} />
                    )}
                  </div>
                </div>

                {/* 2. SECTION 2: PRODUCT FRICTION MATRIX */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full transition-all duration-300">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={Activity}
                    title="Product Friction Matrix"
                    description="PDP Funnel Analysis: Identifying Price Barriers and UX Drop-offs"
                    badgeText="02 • PRODUCT FRICTION"
                  />
                  <div className="mt-6 w-full min-w-0">
                    {frictionError && !frictionData ? (
                      <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                        Failed to load product friction data: {frictionError}
                      </div>
                    ) : (
                      <ProductFrictionWidget data={frictionData} />
                    )}
                  </div>
                </div>

                {/* 3. SECTION 3: RFM CUSTOMER SEGMENTS */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={Users}
                    title="RFM Customer Segments"
                    description="Recency, Frequency, Monetary — Auto-Segmented Groups"
                    badgeText="03 • RFM SEGMENTS"
                  />
                  <div className="mt-6 w-full min-w-0">
                    <RFMSegmentWidget />
                  </div>
                </div>

                {/* 4. SECTION 4: ABANDONED CARTS PIPELINE */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={ShoppingCart}
                    title="Abandoned Carts Pipeline"
                    description="Recover lost sales from pending checkout carts"
                    badgeText="04 • CARTS RECOVERY"
                  />
                  <div className="mt-6 w-full min-w-0">
                    <AbandonedCartsWidget />
                  </div>
                </div>

                {/* 5. SECTION 5: WELCOME & WINBACK PIPELINES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full">
                  
                  {/* Welcome Series Card */}
                  <div className="flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={UserPlus}
                      title="Welcome Series Pipeline"
                      description="New unconverted users (last 48 hours)"
                      badgeText="05"
                    />
                    <div className="mt-6 flex-1 w-full min-w-0">
                      <WelcomeWidget />
                    </div>
                  </div>

                  {/* Winback Candidates Card */}
                  <div className="flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={UserX}
                      title="Winback Candidates Pipeline"
                      description="Re-activate dormant customers (30+ days zero orders)"
                      badgeText="06"
                    />
                    <div className="mt-6 flex-1 w-full min-w-0">
                      <WinbackWidget />
                    </div>
                  </div>

                </div>

                {/* 6. SECTION 6: CAMPAIGN CONVERSION FUNNEL */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={TrendingUp}
                    title="Campaign Conversion Funnel"
                    description="Conversion telemetry: Views → ATC → Checkout → Purchase"
                    badgeText="07 • CONVERSION FUNNEL"
                  />
                  <div className="mt-6 w-full min-w-0">
                    {funnelError && !funnelData ? (
                      <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                        Failed to load funnel data: {funnelError}
                      </div>
                    ) : (
                      <CampaignFunnelWidget data={funnelData} />
                    )}
                  </div>
                </div>

                {/* 7. SECTION 7: CAMPAIGN COMPOSER */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={Send}
                    title="Campaign Composer Engine"
                    description="Bulk Email Dispatcher — Send to Segments or Manual Lists"
                    badgeText="08 • COMPOSER"
                  />
                  <div className="mt-6 w-full min-w-0">
                    <CampaignComposer />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 📊 TELEMETRY TICKER FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden w-full">
          <div className="flex items-center justify-center gap-x-6 gap-y-3 flex-wrap text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500" /> UTM Attribution Engine</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>⚡ 5-min Redis Cache</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>🔥 Product Friction Matrix</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>🎯 RFM Auto-Segments</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>🛒 Abandoned Cart Recovery</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>👋 Welcome Series</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>📧 Winback Campaigns</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>📈 Campaign Funnel</span>
          </div>
          <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-4">
            Campaigns updated: {campaignData?.generatedAt ?? "N/A"} • 
            Friction updated: {frictionData?.generatedAt ?? "N/A"} • 
            Funnel updated: {funnelData?.generatedAt ?? "N/A"}
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}