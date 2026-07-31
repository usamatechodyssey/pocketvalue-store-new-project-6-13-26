// // src/app/(payload)/admin/views/OperationalIntelligenceView.tsx

// import { DefaultTemplate } from '@payloadcms/next/templates';
// import { getOperationalIntelligencePayload } from '@/app/features/admin/operational-intelligence/actions/getOperationalIntelligence';
// import { getOperationalComparisonPayload } from '@/app/features/admin/operational-intelligence/actions/getOperationalComparison';
// import { getOperationalTrends } from '@/app/features/admin/operational-intelligence/actions/getOperationalTrends';
// import OperationalStatusBreakdown from '@/app/features/admin/operational-intelligence/components/OperationalStatusBreakdown';
// import OperationalTrendChart from '@/app/features/admin/operational-intelligence/components/OperationalTrendChart';
// import OperationalComparisonChart from '@/app/features/admin/operational-intelligence/components/OperationalComparisonChart';
// import ReportButton from '@/app/features/admin/operational-intelligence/components/ReportButton';
// import AnalyticsDateRangePicker from '@/app/features/admin/executive-kpi/components/DateRangePicker';
// import PaginationControls from '@/app/shared/components/ui/PaginationControls';
// import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
// import {
//   ArrowLeft,
//   Activity,
//   TrendingUp,
//   TrendingDown,
//   AlertCircle,
//   PackageX,
//   CheckCircle2,
//   Clock,
//   DollarSign,
// } from 'lucide-react';
// import Link from 'next/link';

// // ================================================================
// // ✅ TYPE DEFINITIONS
// // ================================================================
// interface OperationalSummaryCard {
//   title: string;
//   value: string | number;
//   icon: React.ReactElement;
//   trend?: number;
//   color: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
//   subtext?: string;
// }

// export default async function OperationalIntelligenceView(props: any) {
//   const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
//   const params = await paramsPromise;
//   const searchParams = await searchParamsPromise;
//   const payload = props.payload || initPageResult?.req?.payload;

//   // Parse date range
//   const range = {
//     from: searchParams?.from ? startOfDay(parseISO(searchParams.from)) : startOfDay(new Date()),
//     to: searchParams?.to ? endOfDay(parseISO(searchParams.to)) : endOfDay(new Date()),
//   };

//   const page = Number(searchParams?.page) || 1;
//   const limit = 15;

//   // ✅ ENTERPRISE FIX: Fetch data in parallel (Operational + Trends + Comparison)
//   const [operationalData, trendsData, comparisonData] = await Promise.all([
//     getOperationalIntelligencePayload(range, page, limit),
//     getOperationalTrends({ days: 30 }),
//     getOperationalComparisonPayload(range),
//   ]);

//   // Extract i18n and other props
//   const i18n = props.i18n || initPageResult?.req?.i18n;
//   const locale = props.locale || initPageResult?.locale;
//   const safePayload = props.payload || initPageResult?.req?.payload;
//   const user = props.user || initPageResult?.req?.user;
//   const permissions = props.permissions || initPageResult?.permissions;
//   const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

//   // ✅ ENTERPRISE FIX: Safe fallback for operationalData
//   const safeData = operationalData || {
//     totalOrders: 0,
//     deliveredCount: 0,
//     cancelledCount: 0,
//     limboRevenue: 0,
//     pendingCount: 0,
//     fulfillmentRate: 0,
//     leakageRate: 0,
//     statusBreakdown: {},
//     limboOrders: [],
//     totalLimboCount: 0,
//     totalLimboPages: 0,
//     currentLimboPage: 1,
//     generatedAt: new Date().toISOString(),
//     thresholdAlert: null,
//   };

//   // Summary Cards Data
//   const summaryCards: OperationalSummaryCard[] = [
//     {
//       title: 'Total Orders',
//       value: safeData.totalOrders ?? 0,
//       icon: <PackageX size={20} />,
//       color: 'blue',
//     },
//     {
//       title: 'Delivered',
//       value: safeData.deliveredCount ?? 0,
//       icon: <CheckCircle2 size={20} />,
//       trend: safeData.fulfillmentRate ?? 0,
//       color: 'green',
//       subtext: `${safeData.fulfillmentRate ?? 0}% fulfillment rate`,
//     },
//     {
//       title: 'Cancelled / Leakage',
//       value: safeData.cancelledCount ?? 0,
//       icon: <TrendingDown size={20} />,
//       trend: safeData.leakageRate ?? 0,
//       color: 'red',
//       subtext: `${safeData.leakageRate ?? 0}% leakage rate`,
//     },
//     {
//       title: 'Limbo Revenue (Stuck)',
//       value: `Rs. ${safeData.limboRevenue?.toLocaleString() ?? 0}`,
//       icon: <DollarSign size={20} />,
//       color: 'yellow',
//       subtext: `${safeData.pendingCount ?? 0} stuck orders`,
//     },
//   ];

//   // Color mapping for cards
//   const colorMap = {
//     green: 'text-green-500 bg-green-500/10 border-green-500/20',
//     red: 'text-red-500 bg-red-500/10 border-red-500/20',
//     yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
//     blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
//     purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
//   };

//   // ✅ ENTERPRISE FIX: Check if any data exists
//   const hasData = safeData.totalOrders > 0 || safeData.limboOrders.length > 0;

//   // ✅ ENTERPRISE FIX: Safe comparison data
//   const safeComparison = comparisonData || undefined;

//   return (
//     <DefaultTemplate
//       i18n={i18n}
//       locale={locale}
//       params={params}
//       payload={safePayload}
//       permissions={permissions}
//       searchParams={searchParams}
//       user={user}
//       visibleEntities={visibleEntities}
//     >
//       <div
//         className="tw-admin-wrapper p-4 md:p-10 space-y-8 pb-20"
//         role="main"
//         aria-label="Operational Intelligence Dashboard"
//       >
//         {/* ================================================================ */}
//         {/* HEADER */}
//         {/* ================================================================ */}
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
//           <div className="space-y-2">
//             <Link
//               href="/admin"
//               className="flex items-center gap-2 text-xs font-black text-brand-primary hover:underline uppercase tracking-widest mb-4"
//             >
//               <ArrowLeft size={14} /> Back to Intelligence Hub
//             </Link>
//             <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-4">
//               <Activity size={48} className="text-brand-primary" aria-hidden="true" />
//               Operational Intelligence
//             </h1>
//             <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-70">
//               Operations Audit: {format(range.from, 'MMM dd, yyyy')} — {format(range.to, 'MMM dd, yyyy')}
//               {safeData.pendingCount !== undefined && ` | ${safeData.pendingCount} orders awaiting action`}
//             </p>
//           </div>
//           <div className="flex items-center gap-4 flex-wrap">
//             {/* ✅ NEW: Report Button */}
//             <ReportButton from={range.from} to={range.to} />
//             <AnalyticsDateRangePicker />
//           </div>
//         </div>

//         {/* ================================================================ */}
//         {/* SUMMARY CARDS (4 Columns) */}
//         {/* ================================================================ */}
//         <div
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
//           role="region"
//           aria-label="Operational summary statistics"
//         >
//           {summaryCards.map((card, idx) => (
//             <div
//               key={idx}
//               className={`bg-white dark:bg-gray-900 rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ${colorMap[card.color]}`}
//               role="article"
//               aria-label={`${card.title}: ${card.value}`}
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
//                     {card.title}
//                   </p>
//                   <h3 className="text-2xl font-black dark:text-white tracking-tight mt-1">
//                     {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
//                   </h3>
//                 </div>
//                 <div className={`p-3 rounded-xl border ${colorMap[card.color]}`}>
//                   {card.icon}
//                 </div>
//               </div>
//               {card.subtext && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
//                   {card.subtext}
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* ================================================================ */}
//         {/* STATUS BREAKDOWN (All Limbo Statuses) */}
//         {/* ================================================================ */}
//         <div
//           className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
//           role="region"
//           aria-label="Limbo status breakdown"
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <Clock size={20} className="text-brand-primary" aria-hidden="true" />
//             <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">
//               Limbo Status Breakdown
//             </h2>
//             <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
//               {safeData.pendingCount ?? 0} stuck orders
//             </span>
//           </div>
//           <OperationalStatusBreakdown
//             statusBreakdown={safeData.statusBreakdown}
//             totalPending={safeData.pendingCount ?? 0}
//           />
//         </div>

//         {/* ================================================================ */}
//         {/* ✅ NEW: PERIOD-OVER-PERIOD COMPARISON CHART */}
//         {/* ================================================================ */}
//         <div
//           className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
//           role="region"
//           aria-label="Period-over-period comparison chart"
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <TrendingUp size={20} className="text-brand-primary" aria-hidden="true" />
//             <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">
//               Period-over-Period Comparison
//             </h2>
//             {safeComparison && safeComparison.metrics && (
//               <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
//                 {safeComparison.range.days} days | Current vs Previous
//               </span>
//             )}
//           </div>
//           <OperationalComparisonChart data={safeComparison} />
//         </div>

//         {/* ================================================================ */}
//         {/* TREND CHART (Time-Series Data) */}
//         {/* ================================================================ */}
//         <div
//           className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm"
//           role="region"
//           aria-label="30-day operational trends chart"
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <TrendingUp size={20} className="text-brand-primary" aria-hidden="true" />
//             <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">
//               30-Day Operational Trends
//             </h2>
//           </div>
//           <OperationalTrendChart data={trendsData} />
//         </div>

//         {/* ================================================================ */}
//         {/* RECENT LIMBO ORDERS (Table with Pagination) */}
//         {/* ================================================================ */}
//         <div
//           className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
//           role="region"
//           aria-label="Recent limbo orders"
//         >
//           <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
//             <div className="flex items-center gap-3">
//               <AlertCircle size={20} className="text-yellow-500" aria-hidden="true" />
//               <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">
//                 Recent Limbo Orders
//               </h2>
//             </div>
//             <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
//               {safeData.limboOrders?.length ?? 0} of {safeData.totalLimboCount ?? 0}
//             </span>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto" role="table" aria-label="Limbo orders list">
//             <table className="w-full text-sm border-collapse">
//               <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 uppercase text-[10px] font-black tracking-[0.2em]">
//                 <tr>
//                   <th className="p-4 text-left" scope="col">Order ID</th>
//                   <th className="p-4 text-left" scope="col">Customer</th>
//                   <th className="p-4 text-center" scope="col">Status</th>
//                   <th className="p-4 text-right" scope="col">Amount</th>
//                   <th className="p-4 text-center" scope="col">Date</th>
//                   <th className="p-4 text-center" scope="col">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
//                 {(safeData.limboOrders?.length ?? 0) > 0 ? (
//                   safeData.limboOrders.map((order: any) => (
//                     <tr
//                       key={order._id}
//                       className="hover:bg-gray-50 dark:hover:bg-brand-primary/5 transition-all"
//                     >
//                       <td className="p-4 font-mono text-xs font-bold dark:text-white">
//                         #{order.orderId || order._id.slice(-6)}
//                       </td>
//                       <td className="p-4 font-medium dark:text-gray-300">
//                         {order.shippingAddress?.fullName || 'N/A'}
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
//                           <span className="relative flex h-1.5 w-1.5">
//                             <span className="animate-ping absolute h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
//                             <span className="relative rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
//                           </span>
//                           {order.status}
//                         </span>
//                       </td>
//                       <td className="p-4 text-right font-black text-brand-primary">
//                         Rs. {order.totalPrice?.toLocaleString() || 0}
//                       </td>
//                       <td className="p-4 text-center text-[10px] text-gray-400 font-medium">
//                         {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yy') : 'N/A'}
//                       </td>
//                       <td className="p-4 text-center">
//                         <Link
//                           href={`/admin/orders/${order._id}`}
//                           className="inline-flex items-center gap-1 text-[10px] font-black text-brand-primary hover:underline uppercase tracking-widest"
//                           aria-label={`View order ${order.orderId || order._id}`}
//                         >
//                           View <ArrowLeft size={12} className="rotate-180" aria-hidden="true" />
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="py-12 text-center text-gray-500">
//                       <PackageX size={40} className="mx-auto opacity-20 mb-4" aria-hidden="true" />
//                       <p className="font-bold uppercase tracking-widest text-xs">No limbo orders found</p>
//                       <p className="text-[10px] text-gray-400 mt-1">
//                         All orders are either completed, delivered, or cancelled.
//                       </p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {(safeData.totalLimboPages ?? 0) > 1 && (
//             <div className="flex justify-center p-6 border-t border-gray-100 dark:border-gray-800">
//               <PaginationControls totalPages={safeData.totalLimboPages} />
//             </div>
//           )}
//         </div>

//         {/* ================================================================ */}
//         {/* FOOTER */}
//         {/* ================================================================ */}
//         <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 text-center">
//           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
//             🚀 Operational Intelligence Engine Active
//             {safeData.generatedAt && ` | Last Synced: ${format(new Date(safeData.generatedAt), 'MMM dd, hh:mm a')}`}
//           </p>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
// 📂 src/app/(payload)/admin/views/OperationalIntelligenceView.tsx

import React from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getOperationalIntelligencePayload } from '@/app/features/admin/operational-intelligence/actions/getOperationalIntelligence';
import { getOperationalComparisonPayload } from '@/app/features/admin/operational-intelligence/actions/getOperationalComparison';
import { getOperationalTrends } from '@/app/features/admin/operational-intelligence/actions/getOperationalTrends';
import OperationalStatusBreakdown from '@/app/features/admin/operational-intelligence/components/OperationalStatusBreakdown';
import OperationalTrendChart from '@/app/features/admin/operational-intelligence/components/OperationalTrendChart';
import OperationalComparisonChart from '@/app/features/admin/operational-intelligence/components/OperationalComparisonChart';
import ReportButton from '@/app/features/admin/operational-intelligence/components/ReportButton';
import AnalyticsDateRangePicker from '@/app/features/admin/executive-kpi/components/DateRangePicker';
import PaginationControls from '@/app/shared/components/ui/PaginationControls';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PackageX,
  CheckCircle2,
  Clock,
  Banknote,
  Radio,
} from 'lucide-react';
import Link from 'next/link';

// ================================================================
// ✅ TYPE DEFINITIONS
// ================================================================
interface OperationalSummaryCard {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend?: number;
  color: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  subtext?: string;
}

export default async function OperationalIntelligenceView(props: any) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  
  // ✅ FIX: Single unified payload declaration (resolves ts6133)
  const payload = props.payload || initPageResult?.req?.payload;

  // Parse date range
  const range = {
    from: searchParams?.from ? startOfDay(parseISO(searchParams.from)) : startOfDay(new Date()),
    to: searchParams?.to ? endOfDay(parseISO(searchParams.to)) : endOfDay(new Date()),
  };

  const page = Number(searchParams?.page) || 1;
  const limit = 15;

  // ✅ Parallel Pre-fetching
  const [operationalData, trendsData, comparisonData] = await Promise.all([
    getOperationalIntelligencePayload(range, page, limit),
    getOperationalTrends({ days: 30 }),
    getOperationalComparisonPayload(range),
  ]);

  // Extract i18n and other props safely
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  // Safe fallback data
  const safeData = operationalData || {
    totalOrders: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    limboRevenue: 0,
    pendingCount: 0,
    fulfillmentRate: 0,
    leakageRate: 0,
    statusBreakdown: {},
    limboOrders: [],
    totalLimboCount: 0,
    totalLimboPages: 0,
    currentLimboPage: 1,
    generatedAt: new Date().toISOString(),
    thresholdAlert: null,
  };

  // Summary Cards Data
  const summaryCards: OperationalSummaryCard[] = [
    {
      title: 'Total Orders',
      value: safeData.totalOrders ?? 0,
      icon: <PackageX size={20} />,
      color: 'blue',
    },
    {
      title: 'Delivered',
      value: safeData.deliveredCount ?? 0,
      icon: <CheckCircle2 size={20} />,
      trend: safeData.fulfillmentRate ?? 0,
      color: 'green',
      subtext: `${safeData.fulfillmentRate ?? 0}% fulfillment rate`,
    },
    {
      title: 'Cancelled / Leakage',
      value: safeData.cancelledCount ?? 0,
      icon: <TrendingDown size={20} />,
      trend: safeData.leakageRate ?? 0,
      color: 'red',
      subtext: `${safeData.leakageRate ?? 0}% leakage rate`,
    },
    {
      title: 'Limbo Revenue (Stuck)',
      value: `Rs. ${(safeData.limboRevenue || 0).toLocaleString('en-PK')}`,
      icon: <Banknote size={20} />,
      color: 'yellow',
      subtext: `${(safeData.pendingCount || 0).toLocaleString('en-PK')} stuck orders`,
    },
  ];

  // Color mapping for cards
  const colorMap = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  const safeComparison = comparisonData || undefined;

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload} // ✅ Correctly reads the unified payload variable
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
                <Activity size={32} className="text-brand-primary shrink-0" />
                Operational Intelligence
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Operational Telemetry
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
              OPERATIONS AUDIT:{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.from, 'MMM dd, yyyy')}
              </span>{" "}
              —{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.to, 'MMM dd, yyyy')}
              </span>{" "}
              {safeData.pendingCount !== undefined && ` | ${safeData.pendingCount} orders awaiting action`}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            <ReportButton from={range.from} to={range.to} />
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* ================================================================ */}
        {/* 📊 SUMMARY CARDS ROW */}
        {/* ================================================================ */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0"
          role="region"
          aria-label="Operational summary statistics"
        >
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between h-full min-w-0 ${colorMap[card.color]}`}
              role="article"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                  {card.title}
                </p>
                <div className={`p-2 rounded-xl border ${colorMap[card.color]} shrink-0 shadow-2xs`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-3 min-w-0">
                <h3 className="text-base sm:text-lg font-black dark:text-white font-mono tracking-tight leading-none truncate">
                  {typeof card.value === 'number' ? card.value.toLocaleString('en-PK') : card.value}
                </h3>
                {card.subtext && (
                  <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold mt-1 truncate">
                    {card.subtext}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================ */}
        {/* 🎛️ STATUS BREAKDOWN MATRIX */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          <div className="flex items-center gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} className="text-amber-500" /> STUCK LIMBO STATUS MATRIX
            </span>
          </div>

          <OperationalStatusBreakdown
            statusBreakdown={safeData.statusBreakdown}
            totalPending={safeData.pendingCount ?? 0}
          />
        </div>

        {/* ================================================================ */}
        {/* 📈 COMPARISON & TIME-SERIES TRENDS CHARTS */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Period-over-Period Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
              <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
                PERIOD-OVER-PERIOD COMPARISON
              </span>
              {safeComparison && safeComparison.metrics && (
                <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                  {safeComparison.range.days} DAYS COMPARE PERIOD
                </span>
              )}
            </div>
            <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
              <OperationalComparisonChart data={safeComparison} />
            </div>
          </div>

          {/* 30-Day Area Trends Line Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
              <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
                30-DAY OPERATIONAL HISTORICAL TRENDS
              </span>
            </div>
            <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
              <OperationalTrendChart data={trendsData} />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 📄 RECENT LIMBO ORDERS TABLE */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Table Toolbar */}
          <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
              RECENT LIMBO STUCK ORDERS
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
              {safeData.limboOrders?.length ?? 0} OF {(safeData.totalLimboCount ?? 0).toLocaleString('en-PK')} ORDERS
            </span>
          </div>

          {/* Table Container (With Scroll Guard) */}
          <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
            <div className="overflow-x-auto max-h-112.5 custom-scrollbar" role="table">
              <table className="w-full min-w-175 border-collapse text-left text-xs relative">
                <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
                  <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Order ID</th>
                    <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Amount</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Date</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
                  {(safeData.limboOrders?.length ?? 0) > 0 ? (
                    safeData.limboOrders.map((order: any) => (
                      <tr
                        key={order._id}
                        className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs font-bold dark:text-white whitespace-nowrap">
                          #{order.orderId || order._id.slice(-6)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                          {order.shippingAddress?.fullName || 'Guest Customer'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                            </span>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-brand-primary whitespace-nowrap">
                          Rs. {(order.totalPrice || 0).toLocaleString('en-PK')}
                        </td>
                        <td className="py-3 px-4 text-center text-[10px] text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wider no-underline hover:no-underline"
                            aria-label={`View order ${order.orderId || order._id}`}
                          >
                            Fulfill <ArrowLeft size={12} className="rotate-180" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400 italic font-mono text-xs">
                        <PackageX size={40} className="mx-auto opacity-20 mb-4" aria-hidden="true" />
                        <p className="font-bold uppercase tracking-wider text-xs">No Limbo Stuck Orders Found</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                          All orders are currently completed, delivered, or cancelled.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            {(safeData.totalLimboPages ?? 0) > 1 && (
              <div className="flex justify-center p-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <PaginationControls totalPages={safeData.totalLimboPages} />
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 📊 TELEMETRY TICKER FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-3 flex-wrap">
            <Radio size={12} className="text-emerald-500" /> Operational Intelligence Engine Active
            {safeData.generatedAt && ` | LAST SYNCED: ${format(new Date(safeData.generatedAt), 'MMM dd, yyyy - hh:mm a')}`}
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}