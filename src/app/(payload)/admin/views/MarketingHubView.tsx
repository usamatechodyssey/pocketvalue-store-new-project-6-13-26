// // 📂 src/app/(payload)/admin/views/MarketingHubView.tsx

// import { DefaultTemplate } from "@payloadcms/next/templates";
// import { getCampaignMetrics } from "@/app/features/admin/marketing/actions/getCampaignMetrics";
// import { getProductFriction } from "@/app/features/admin/marketing/actions/getProductFriction";
// import { getCampaignFunnel } from "@/app/features/admin/marketing/actions/getCampaignFunnel";
// import CampaignOverviewWidget from "@/app/features/admin/marketing/components/CampaignOverviewWidget";
// import ProductFrictionWidget from "@/app/features/admin/marketing/components/ProductFrictionWidget";
// import RFMSegmentWidget from "@/app/features/admin/marketing/components/RFMSegmentWidget";
// import RFMSegmentList from "@/app/features/admin/marketing/components/RFMSegmentList";
// import AbandonedCartsWidget from "@/app/features/admin/marketing/components/AbandonedCartsWidget";
// import WelcomeWidget from "@/app/features/admin/marketing/components/WelcomeWidget";
// import WinbackWidget from "@/app/features/admin/marketing/components/WinbackWidget";
// import CampaignComposer from "@/app/features/admin/marketing/components/CampaignComposer";
// import CampaignFunnelWidget from "@/app/features/admin/marketing/components/CampaignFunnelWidget";
// import {
//   BarChart3,
//   RefreshCw,
//   Send,
//   Users,
//   ShoppingCart,
//   UserPlus,
//   UserX,
//   TrendingUp,
// } from "lucide-react";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface MarketingHubViewProps {
//   initPageResult?: any;
//   params?: any;
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
//   payload?: any;
//   i18n?: any;
//   locale?: any;
//   user?: any;
//   permissions?: any;
//   visibleEntities?: any;
// }

// // ================================================================
// // 🧩 SECTION HEADER COMPONENT (Clean, Premium Outline Style)
// // ================================================================
// const SectionHeader = ({
//   icon: Icon,
//   title,
//   description,
// }: {
//   icon: React.ElementType;
//   title: string;
//   description?: string;
// }) => (
//   <div className="flex items-center gap-3 pb-4 border-b border-zinc-150 dark:border-zinc-850">
//     <div className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
//       <Icon size={14} className="stroke-[2.5px]" />
//     </div>
//     <div>
//       <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
//         {title}
//       </h3>
//       {description && (
//         <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
//           {description}
//         </p>
//       )}
//     </div>
//   </div>
// );

// // ================================================================
// // 🚀 PAGE COMPONENT (Server Component)
// // ================================================================
// export default async function MarketingHubView(props: MarketingHubViewProps) {
//   const searchParams = await props.searchParams;
//   const refresh = searchParams?.refresh === "true";
//   const segment = searchParams?.segment as string | undefined;

//   // Extract Payload template props
//   const i18n = props.i18n || props.initPageResult?.req?.i18n;
//   const locale = props.locale || props.initPageResult?.locale;
//   const payload = props.payload || props.initPageResult?.req?.payload;
//   const user = props.user || props.initPageResult?.req?.user;
//   const permissions = props.permissions || props.initPageResult?.permissions;
//   const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;
//   const params = props.params || {};

//   // ✅ Parallel Data Fetching
//   const [campaignResult, frictionResult, funnelResult] = await Promise.allSettled([
//     getCampaignMetrics(),
//     getProductFriction(),
//     getCampaignFunnel(),
//   ]);

//   const campaignData = campaignResult.status === "fulfilled" && campaignResult.value.success
//     ? campaignResult.value.data ?? null
//     : null;
//   const campaignError = campaignResult.status === "rejected"
//     ? (campaignResult.reason as Error)?.message
//     : campaignResult.status === "fulfilled" && !campaignResult.value.success
//     ? campaignResult.value.error
//     : null;

//   const frictionData = frictionResult.status === "fulfilled" && frictionResult.value.success
//     ? frictionResult.value.data ?? null
//     : null;
//   const frictionError = frictionResult.status === "rejected"
//     ? (frictionResult.reason as Error)?.message
//     : frictionResult.status === "fulfilled" && !frictionResult.value.success
//     ? frictionResult.value.error
//     : null;

//   const funnelData = funnelResult.status === "fulfilled" && funnelResult.value.success
//     ? funnelResult.value.data ?? null
//     : null;
//   const funnelError = funnelResult.status === "rejected"
//     ? (funnelResult.reason as Error)?.message
//     : funnelResult.status === "fulfilled" && !funnelResult.value.success
//     ? funnelResult.value.error
//     : null;

//   const hasError = campaignError || frictionError || funnelError;
//   const hasNoData = !campaignData && !frictionData && !funnelData;

//   return (
//     <DefaultTemplate
//       i18n={i18n}
//       locale={locale}
//       params={params}
//       payload={payload}
//       permissions={permissions}
//       searchParams={searchParams}
//       user={user}
//       visibleEntities={visibleEntities}
//     >
//       <div className="tw-admin-wrapper p-4 md:p-8 space-y-10 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
//         {/* HEADER */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
//           <div className="space-y-1.5">
//             <div className="flex items-center gap-3">
//               <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
//                 Marketing Hub
//               </h1>
//               <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 border border-zinc-200 dark:border-zinc-700">
//                 v3.0
//               </span>
//             </div>
//             <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
//               {segment
//                 ? `Viewing segment: ${segment}`
//                 : "Campaign ROI · Product Friction · RFM · Abandoned Carts · Welcome · Winback · Funnel"}
//             </p>
//           </div>

//           <a
//             href={
//               segment
//                 ? `/admin/marketing-hub?segment=${encodeURIComponent(segment)}&refresh=true`
//                 : "/admin/marketing-hub?refresh=true"
//             }
//             className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-700"
//             title="Refresh data"
//           >
//             <RefreshCw size={14} className={refresh ? "animate-spin" : ""} />
//             {refresh ? "Refreshing..." : "Refresh"}
//           </a>
//         </div>

//         {segment ? (
//           <RFMSegmentList segment={segment} />
//         ) : (
//           <div className="space-y-10">
//             {hasError && hasNoData && (
//               <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-sm">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="p-3 bg-red-500/10 rounded-full">
//                     <BarChart3 size={24} className="text-red-500" />
//                   </div>
//                   <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
//                     Failed to Load Marketing Data
//                   </h3>
//                   <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
//                     {campaignError || frictionError || funnelError || "An unknown error occurred."}
//                   </p>
//                   <a
//                     href="/admin/marketing-hub"
//                     className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-lg text-sm transition-colors"
//                   >
//                     <RefreshCw size={14} />
//                     Retry
//                   </a>
//                 </div>
//               </div>
//             )}

//             {!hasNoData && (
//               <>
//                 {/* ZONE 1: CAMPAIGN ROI + PRODUCT FRICTION */}
//                 <div className="space-y-6">
//                   <SectionHeader
//                     icon={BarChart3}
//                     title="Campaign ROI & Product Friction"
//                     description="UTM Attribution & Friction Matrix Analysis"
//                   />
//                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
//                     <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
//                       <div className="p-1 flex-1">
//                         {campaignError && !campaignData ? (
//                           <div className="p-6 text-center text-sm text-red-500">
//                             Failed to load campaign data: {campaignError}
//                           </div>
//                         ) : (
//                           <CampaignOverviewWidget data={campaignData} />
//                         )}
//                       </div>
//                     </div>

//                     <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
//                       <div className="p-1 flex-1">
//                         {frictionError && !frictionData ? (
//                           <div className="p-6 text-center text-sm text-red-500">
//                             Failed to load product friction data: {frictionError}
//                           </div>
//                         ) : (
//                           <ProductFrictionWidget data={frictionData} />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ZONE 2: RFM SEGMENTS */}
//                 <div className="space-y-6">
//                   <SectionHeader
//                     icon={Users}
//                     title="RFM Customer Segments"
//                     description="Recency, Frequency, Monetary — Auto-Segmented Groups"
//                   />
//                   <div className="min-w-0 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                     <RFMSegmentWidget />
//                   </div>
//                 </div>

//                 {/* ZONE 3: ENGAGEMENT PIPELINES */}
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                    
//                     {/* Abandoned Carts Column */}
//                     <div className="xl:col-span-6 space-y-4 flex flex-col">
//                       <SectionHeader
//                         icon={ShoppingCart}
//                         title="Abandoned Carts"
//                         description="Recover lost sales from pending carts"
//                       />
//                       <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                         <AbandonedCartsWidget />
//                       </div>
//                     </div>

//                     {/* Welcome Series Column */}
//                     <div className="xl:col-span-6 space-y-4 flex flex-col">
//                       <SectionHeader
//                         icon={UserPlus}
//                         title="Welcome Series"
//                         description="New users registered in the last 48 hours"
//                       />
//                       <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                         <WelcomeWidget />
//                       </div>
//                     </div>

//                   </div>
//                 </div>

//                 {/* ZONE 4: WINBACK + CAMPAIGN FUNNEL */}
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                    
//                     {/* Winback Column */}
//                     <div className="xl:col-span-6 space-y-4 flex flex-col">
//                       <SectionHeader
//                         icon={UserX}
//                         title="Winback Candidates"
//                         description="Inactive users (30+ days of zero session activity)"
//                       />
//                       <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                         <WinbackWidget />
//                       </div>
//                     </div>

//                     {/* Funnel Column */}
//                     <div className="xl:col-span-6 space-y-4 flex flex-col">
//                       <SectionHeader
//                         icon={TrendingUp}
//                         title="Campaign Funnel"
//                         description="Conversion telemetry: Views → ATC → Checkout → Purchase"
//                       />
//                       <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                         {funnelError && !funnelData ? (
//                           <div className="p-6 text-center text-sm text-red-500">
//                             Failed to load funnel data: {funnelError}
//                           </div>
//                         ) : (
//                           <CampaignFunnelWidget data={funnelData} />
//                         )}
//                       </div>
//                     </div>

//                   </div>
//                 </div>

//                 {/* ZONE 5: CAMPAIGN COMPOSER */}
//                 <div className="space-y-6">
//                   <SectionHeader
//                     icon={Send}
//                     title="Campaign Composer"
//                     description="Bulk Email Dispatcher — Send to Segments or Manual Lists"
//                   />
//                   <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
//                     <CampaignComposer />
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {/* FOOTER */}
//         <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
//           <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap">
//             <span>📊 UTM Attribution Engine</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🔄 5-min Redis Cache</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🔥 Product Friction Matrix</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🎯 RFM Auto-Segments</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🛒 Abandoned Cart Recovery</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>👋 Welcome Series</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>📧 Winback Campaigns</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>📈 Campaign Funnel</span>
//           </p>
//           <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-mono">
//             {campaignData
//               ? `Campaigns updated: ${campaignData.generatedAt}`
//               : "Campaign data unavailable"}{" "}
//             |{" "}
//             {frictionData
//               ? `Friction updated: ${frictionData.generatedAt}`
//               : "Friction data unavailable"}{" "}
//             |{" "}
//             {funnelData
//               ? `Funnel updated: ${funnelData.generatedAt}`
//               : "Funnel data unavailable"}
//           </p>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
// 📂 src/app/(payload)/admin/views/MarketingHubView.tsx

import { DefaultTemplate } from "@payloadcms/next/templates";
import { getCampaignMetrics } from "@/app/features/admin/marketing/actions/getCampaignMetrics";
import { getProductFriction } from "@/app/features/admin/marketing/actions/getProductFriction";
import { getCampaignFunnel } from "@/app/features/admin/marketing/actions/getCampaignFunnel";
import CampaignOverviewWidget from "@/app/features/admin/marketing/components/CampaignOverviewWidget";
import ProductFrictionWidget from "@/app/features/admin/marketing/components/ProductFrictionWidget";
import RFMSegmentWidget from "@/app/features/admin/marketing/components/RFMSegmentWidget";
import RFMSegmentList from "@/app/features/admin/marketing/components/RFMSegmentList";
import AbandonedCartsWidget from "@/app/features/admin/marketing/components/AbandonedCartsWidget";
import WelcomeWidget from "@/app/features/admin/marketing/components/WelcomeWidget";
import WinbackWidget from "@/app/features/admin/marketing/components/WinbackWidget";
import CampaignComposer from "@/app/features/admin/marketing/components/CampaignComposer";
import CampaignFunnelWidget from "@/app/features/admin/marketing/components/CampaignFunnelWidget";
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
        <h3 className="text-lg lg:text-xl font-black uppercase tracking-tighter flex items-center gap-2 italic text-zinc-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
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
// 🚀 PAGE COMPONENT (Server Component)
// ================================================================
export default async function MarketingHubView(props: MarketingHubViewProps) {
  const searchParams = await props.searchParams;
  const refresh = searchParams?.refresh === "true";
  const segment = searchParams?.segment as string | undefined;

  // Extract Payload template props
  const i18n = props.i18n || props.initPageResult?.req?.i18n;
  const locale = props.locale || props.initPageResult?.locale;
  const payload = props.payload || props.initPageResult?.req?.payload;
  const user = props.user || props.initPageResult?.req?.user;
  const permissions = props.permissions || props.initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;
  const params = props.params || {};

  // ✅ Parallel Data Fetching
  const [campaignResult, frictionResult, funnelResult] = await Promise.allSettled([
    getCampaignMetrics(),
    getProductFriction(),
    getCampaignFunnel(),
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
      <div className="tw-admin-wrapper p-4 sm:p-6 lg:p-10 space-y-10 max-w-[1800px] mx-auto bg-zinc-50/50 dark:bg-zinc-950/40 min-h-screen">
        
        {/* ================================================================ */}
        {/* 👑 CYBER-HUD HERO HEADER */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3">
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

          <a
            href={
              segment
                ? `/admin/marketing-hub?segment=${encodeURIComponent(segment)}&refresh=true`
                : "/admin/marketing-hub?refresh=true"
            }
            className="relative z-10 inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 no-underline hover:no-underline"
            title="Recalculate and refresh telemetry"
          >
            <RefreshCw size={14} className={refresh ? "animate-spin" : ""} />
            {refresh ? "Recalculating..." : "Recalculate Hub"}
          </a>
        </div>

        {/* ================================================================ */}
        {/* ⚡ CONTENT ZONES */}
        {/* ================================================================ */}
        {segment ? (
          <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
            <RFMSegmentList segment={segment} />
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* ERROR FALLBACK CARD */}
            {hasError && hasNoData && (
              <div className="bg-white dark:bg-zinc-950 border border-red-500/30 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
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
                {/* ZONE 1: CAMPAIGN ROI + PRODUCT FRICTION */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Campaign ROI Card */}
                    <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden group transition-all duration-300">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                      <SectionHeader
                        icon={BarChart3}
                        title="Campaign ROI & Product Friction"
                        description="UTM Attribution & Friction Matrix Analysis"
                        badgeText="01"
                      />
                      <div className="mt-6 flex-1 min-w-0">
                        {campaignError && !campaignData ? (
                          <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                            Failed to load campaign data: {campaignError}
                          </div>
                        ) : (
                          <CampaignOverviewWidget data={campaignData} />
                        )}
                      </div>
                    </div>

                    {/* Product Friction Card */}
                    <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden group transition-all duration-300">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                      <SectionHeader
                        icon={Activity}
                        title="Product Friction Matrix"
                        description="Drop-off & friction points across cart items"
                        badgeText="PRODUCT FRICTION"
                      />
                      <div className="mt-6 flex-1 min-w-0">
                        {frictionError && !frictionData ? (
                          <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                            Failed to load product friction data: {frictionError}
                          </div>
                        ) : (
                          <ProductFrictionWidget data={frictionData} />
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ZONE 2: RFM CUSTOMER SEGMENTS */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={Users}
                    title="RFM Customer Segments"
                    description="Recency, Frequency, Monetary — Auto-Segmented Groups"
                    badgeText="02"
                  />
                  <div className="mt-6 min-w-0">
                    <RFMSegmentWidget />
                  </div>
                </div>

                {/* ZONE 3: ENGAGEMENT PIPELINES */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Abandoned Carts Column */}
                  <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={ShoppingCart}
                      title="Abandoned Carts Pipeline"
                      description="Recover lost sales from pending checkout carts"
                      badgeText="03"
                    />
                    <div className="mt-6 flex-1 min-w-0">
                      <AbandonedCartsWidget />
                    </div>
                  </div>

                  {/* Welcome Series Column */}
                  <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={UserPlus}
                      title="Welcome Series Pipeline"
                      description="New unconverted users registered in the last 48 hours"
                      badgeText="04"
                    />
                    <div className="mt-6 flex-1 min-w-0">
                      <WelcomeWidget />
                    </div>
                  </div>

                </div>

                {/* ZONE 4: WINBACK + CAMPAIGN FUNNEL */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Winback Column */}
                  <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={UserX}
                      title="Winback Candidates Pipeline"
                      description="Re-activate value-tier customers with zero orders in 30+ days"
                      badgeText="05"
                    />
                    <div className="mt-6 flex-1 min-w-0">
                      <WinbackWidget />
                    </div>
                  </div>

                  {/* Funnel Column */}
                  <div className="xl:col-span-6 flex flex-col min-w-0 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                    <SectionHeader
                      icon={TrendingUp}
                      title="Campaign Conversion Funnel"
                      description="Conversion telemetry: Views → ATC → Checkout → Purchase"
                      badgeText="06"
                    />
                    <div className="mt-6 flex-1 min-w-0">
                      {funnelError && !funnelData ? (
                        <div className="p-6 text-center text-xs font-mono text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                          Failed to load funnel data: {funnelError}
                        </div>
                      ) : (
                        <CampaignFunnelWidget data={funnelData} />
                      )}
                    </div>
                  </div>

                </div>

                {/* ZONE 5: CAMPAIGN COMPOSER */}
                <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
                  <SectionHeader
                    icon={Send}
                    title="Campaign Composer Engine"
                    description="Bulk Email Dispatcher — Send to Segments or Manual Lists"
                    badgeText="07"
                  />
                  <div className="mt-6 min-w-0">
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
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
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