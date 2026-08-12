// // 📂 src/app/(payload)/admin/views/ReportDetailView.tsx (FULLY HARDENED & DATE-SAFE)

// import { DefaultTemplate } from "@payloadcms/next/templates";
// import { notFound } from "next/navigation";
// import { format, startOfDay, endOfDay, parseISO, subDays } from "date-fns";
// import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
// import Link from "next/link";

// // ✅ Actions
// import { getDetailedReportData } from "@/app/features/admin/reports/actions/getDetailedReportData";
// import { getReportConfig } from "@/app/features/admin/reports/configs/reportConfigs";

// // ✅ Components
// import ReportDetailContent from "./ReportDetailContent";
// import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface ReportDetailViewProps {
//   initPageResult?: any;
//   params: Promise<{ slug: string }>;
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
//   payload?: any;
//   i18n?: any;
//   locale?: any;
//   user?: any;
//   permissions?: any;
//   visibleEntities?: any;
// }

// // ================================================================
// // 🔧 HELPER: Safe Date Parsing (Prevents URL-manipulation crashes)
// // ================================================================
// const safeParseDate = (dateStr: string | undefined, fallback: Date): Date => {
//   if (!dateStr) return fallback;
//   const parsed = parseISO(dateStr);
//   // If parsed is "Invalid Date", returns the safe default fallback date
//   return isNaN(parsed.getTime()) ? fallback : parsed;
// };

// // ================================================================
// // 🚀 PAGE COMPONENT (Server Component)
// // ================================================================
// export default async function ReportDetailView(props: ReportDetailViewProps) {
//   // 1. RESOLVE params & searchParams
//   const params = await props.params;
//   const searchParams = await props.searchParams;
//   const slug = params?.slug;

//   if (!slug) {
//     return notFound();
//   }

//   // 2. Get report config
//   const config = getReportConfig(slug);
//   if (!config) {
//     return notFound();
//   }

//   // 3. Parse Date Range with fallback (default: last 30 days)
//   const today = new Date();
//   const defaultFrom = subDays(today, 30);

//   const fromStr = searchParams?.from as string | undefined;
//   const toStr = searchParams?.to as string | undefined;

//   // ✅ FIX 1: Strict date boundary parsing prevents NoSQL exceptions from malformed query parameters
//   const from = startOfDay(safeParseDate(fromStr, defaultFrom));
//   const to = endOfDay(safeParseDate(toStr, today));

//   // 4. Parse additional filters
//   const page = Number(searchParams?.page) || 1;
//   const limit = 20;

//   // 5. Fetch data
//   let data: any = null;
//   let error: string | null = null;

//   try {
//     const result = await getDetailedReportData(
//       { startDate: from, endDate: to },
//       slug as any
//     );

//     if (result.success) {
//       data = result.data;
//     } else {
//       error = result.error || "Failed to load report data.";
//     }
//   } catch (err: any) {
//     error = err.message || "An unexpected error occurred.";
//     console.error("Report Detail Error:", error);
//   }

//   // 6. Extract Payload template props
//   const i18n = props.i18n || props.initPageResult?.req?.i18n;
//   const locale = props.locale || props.initPageResult?.locale;
//   const payload = props.payload || props.initPageResult?.req?.payload;
//   const user = props.user || props.initPageResult?.req?.user;
//   const permissions = props.permissions || props.initPageResult?.permissions;
//   const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;

//   // 7. Prepare data for client
//   const reportData = data?.data || [];
//   const totals = data?.totals || {};
//   const generatedAt = data?.generatedAt || new Date().toISOString();

//   const hasError = !!error;

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
//       <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
//         {/* HEADER */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
//           <div className="space-y-1.5 leading-none">
//             <Link
//               href="/admin/reports-index"
//               className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
//             >
//               <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Reports Gallery
//             </Link>
//             <div className="flex items-center gap-3 flex-wrap">
//               <div className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
//                 <FileText size={16} />
//               </div>
//               <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
//                 {config.name}
//               </h1>
//               <span className="text-[10px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded shadow-2xs">
//                 {config.category}
//               </span>
//             </div>
//             <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
//               {config.description}
//             </p>
//           </div>
//           <div className="flex items-center gap-3 shadow-2xs">
//             <AnalyticsDateRangePicker />
//           </div>
//         </div>

//         {/* ERROR STATE */}
//         {hasError && (
//           <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center animate-in fade-in duration-300">
//             <div className="flex flex-col items-center gap-3">
//               <AlertCircle size={32} className="text-red-500" />
//               <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
//                 Failed to Load Report
//               </h3>
//               <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
//                 {error}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* REPORT DETAIL CONTENT */}
//         {!hasError && (
//           <ReportDetailContent
//             data={reportData}
//             columns={config.columns}
//             totals={totals}
//             isLoading={false}
//             reportName={config.name}
//             generatedAt={generatedAt}
//             totalDocs={reportData.length}
//             currentPage={page}
//             limit={limit}
//           />
//         )}

//         {/* FOOTER */}
//         <div className="p-5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
//           <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap">
//             <span>📊 {config.name}</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🔄 5-min Redis Cache</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>📈 {config.category} Intelligence</span>
//           </p>
//           <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-mono">
//             Generated at: {new Date(generatedAt).toLocaleString("en-PK")}
//             {reportData.length > 0 && ` · ${reportData.length} records loaded`}
//           </p>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
// // 📂 src/app/(payload)/admin/views/ReportDetailView.tsx (DEFAULT TIMEFRAME: TODAY HARDENED)

// import { DefaultTemplate } from "@payloadcms/next/templates";
// import { notFound } from "next/navigation";
// import { format, startOfDay, endOfDay, parseISO, subDays } from "date-fns";
// import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
// import Link from "next/link";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// // ✅ Actions
// import { getDetailedReportData } from "@/app/features/admin/reports/actions/getDetailedReportData";
// import { getReportConfig } from "@/app/features/admin/reports/configs/reportConfigs";

// // ✅ Components
// import ReportDetailContent from "./ReportDetailContent";
// import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface ReportDetailViewProps {
//   initPageResult?: any;
//   params: Promise<{ slug: string }>;
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
//   payload?: any;
//   i18n?: any;
//   locale?: any;
//   user?: any;
//   permissions?: any;
//   visibleEntities?: any;
// }

// // ================================================================
// // 🔧 HELPER: Safe Date Parsing
// // ================================================================
// const safeParseDate = (dateStr: string | undefined, fallback: Date): Date => {
//   if (!dateStr) return fallback;
//   const parsed = parseISO(dateStr);
//   return isNaN(parsed.getTime()) ? fallback : parsed;
// };

// // ================================================================
// // 🚀 PAGE COMPONENT (Server Component)
// // ================================================================
// export default async function ReportDetailView(props: ReportDetailViewProps) {
//   // 1. RESOLVE params & searchParams
//   const params = await props.params;
//   const searchParams = await props.searchParams;
//   const slug = params?.slug;

//   if (!slug) {
//     return notFound();
//   }

//   // 2. Get report config
//   const config = getReportConfig(slug);
//   if (!config) {
//     return notFound();
//   }

//   // 3. ✅ DEFAULT TIMEFRAME: TODAY (startOfDay to endOfDay)
//   const today = new Date();
//   const defaultFrom = startOfDay(today);
//   const defaultTo = endOfDay(today);

//   const fromStr = (searchParams?.startDate || searchParams?.from) as string | undefined;
//   const toStr = (searchParams?.endDate || searchParams?.to) as string | undefined;

//   const from = startOfDay(safeParseDate(fromStr, defaultFrom));
//   const to = endOfDay(safeParseDate(toStr, defaultTo));

//   // 4. Parse additional filters
//   const page = Number(searchParams?.page) || 1;
//   const limit = 20;

//   // 5. Fetch data
//   let data: any = null;
//   let error: string | null = null;

//   try {
//     const result = await getDetailedReportData(
//       { startDate: from, endDate: to },
//       slug as any
//     );

//     if (result.success) {
//       data = result.data;
//     } else {
//       error = result.error || "Failed to load report data.";
//     }
//   } catch (err: any) {
//     error = err.message || "An unexpected error occurred.";
//     console.error("Report Detail Error:", error);
//   }

//   // 6. Safely resolve payload instance
//   let payload = props.payload || props.initPageResult?.req?.payload;
//   if (!payload) {
//     try {
//       payload = await getSafePayload();
//     } catch (e) {
//       console.warn("⚠️ Payload instance fallback failed:", e);
//     }
//   }

//   const i18n = props.i18n || props.initPageResult?.req?.i18n || {
//     t: (key: string) => key || "",
//     language: "en",
//   };

//   const locale = props.locale || props.initPageResult?.locale || { code: "en", label: "English" };
//   const user = props.user || props.initPageResult?.req?.user || { role: "admin" };

//   const permissions = props.permissions || props.initPageResult?.permissions || {
//     collections: {},
//     globals: {},
//   };

//   const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities || {
//     collections: [],
//     globals: [],
//   };

//   // 7. Prepare data for client
//   const reportData = data?.data || [];
//   const totals = data?.totals || {};
//   const generatedAt = data?.generatedAt || new Date().toISOString();

//   const hasError = !!error;

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
//       <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
//         {/* HEADER */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
//           <div className="space-y-1.5 leading-none">
//             <Link
//               href="/admin/reports-index"
//               className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
//             >
//               <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Reports Gallery
//             </Link>
//             <div className="flex items-center gap-3 flex-wrap">
//               <div className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
//                 <FileText size={16} />
//               </div>
//               <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
//                 {config.name}
//               </h1>
//               <span className="text-[10px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded shadow-2xs">
//                 {config.category}
//               </span>
//             </div>
//             <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
//               {config.description}
//             </p>
//           </div>
//           <div className="flex items-center gap-3 shadow-2xs">
//             <AnalyticsDateRangePicker />
//           </div>
//         </div>

//         {/* ERROR STATE */}
//         {hasError && (
//           <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center animate-in fade-in duration-300">
//             <div className="flex flex-col items-center gap-3">
//               <AlertCircle size={32} className="text-red-500" />
//               <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
//                 Failed to Load Report
//               </h3>
//               <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
//                 {error}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* REPORT DETAIL CONTENT */}
//         {!hasError && (
//           <ReportDetailContent
//             data={reportData}
//             columns={config.columns}
//             totals={totals}
//             isLoading={false}
//             reportName={config.name}
//             generatedAt={generatedAt}
//             totalDocs={reportData.length}
//             currentPage={page}
//             limit={limit}
//           />
//         )}

//         {/* FOOTER */}
//         <div className="p-5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
//           <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap">
//             <span>📊 {config.name}</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>🔄 5-min Redis Cache</span>
//             <span className="text-zinc-300 dark:text-zinc-700">·</span>
//             <span>📈 {config.category} Intelligence</span>
//           </p>
//           <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-mono">
//             Generated at: {new Date(generatedAt).toLocaleString("en-PK")}
//             {reportData.length > 0 && ` · ${reportData.length} records loaded`}
//           </p>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
// 📂 src/app/(payload)/admin/views/ReportDetailView.tsx (DYNAMIC STATUS OPTIONS & TODAY DEFAULTS HARDENED)

import { DefaultTemplate } from "@payloadcms/next/templates";
import { notFound } from "next/navigation";
import { format, startOfDay, endOfDay, parseISO, subDays } from "date-fns";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// ✅ Actions
import { getDetailedReportData } from "@/app/features/admin/reports/actions/getDetailedReportData";
import { getReportConfig } from "@/app/features/admin/reports/configs/reportConfigs";

// ✅ Components
import ReportDetailContent from "./ReportDetailContent";
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// ================================================================
// ✅ TYPES
// ================================================================
interface ReportDetailViewProps {
  initPageResult?: any;
  params: Promise<{ slug: string }>;
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
// 🚀 PAGE COMPONENT (Server Component)
// ================================================================
export default async function ReportDetailView(props: ReportDetailViewProps) {
  // 1. RESOLVE params & searchParams
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params?.slug;

  if (!slug) {
    return notFound();
  }

  // 2. Get report config
  const config = getReportConfig(slug);
  if (!config) {
    return notFound();
  }

  // 3. DEFAULT TIMEFRAME: TODAY (startOfDay to endOfDay)
  const today = new Date();
  const defaultFrom = startOfDay(today);
  const defaultTo = endOfDay(today);

  const fromStr = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toStr = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const from = startOfDay(safeParseDate(fromStr, defaultFrom));
  const to = endOfDay(safeParseDate(toStr, today));

  // 4. Parse additional filters
  const page = Number(searchParams?.page) || 1;
  const limit = 20;

  // 5. Fetch data
  let data: any = null;
  let error: string | null = null;

  try {
    const result = await getDetailedReportData(
      { startDate: from, endDate: to },
      slug as any
    );

    if (result.success) {
      data = result.data;
    } else {
      error = result.error || "Failed to load report data.";
    }
  } catch (err: any) {
    error = err.message || "An unexpected error occurred.";
    console.error("Report Detail Error:", error);
  }

  // 6. Safely resolve payload instance
  let payload = props.payload || props.initPageResult?.req?.payload;
  if (!payload) {
    try {
      payload = await getSafePayload();
    } catch (e) {
      console.warn("⚠️ Payload instance fallback failed:", e);
    }
  }

  const i18n = props.i18n || props.initPageResult?.req?.i18n || {
    t: (key: string) => key || "",
    language: "en",
  };

  const locale = props.locale || props.initPageResult?.locale || { code: "en", label: "English" };
  const user = props.user || props.initPageResult?.req?.user || { role: "admin" };

  const permissions = props.permissions || props.initPageResult?.permissions || {
    collections: {},
    globals: {},
  };

  const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities || {
    collections: [],
    globals: [],
  };

  // 7. Prepare dynamic status options for report filters
  let showStatusFilter = false;
  let statuses: { value: string; label: string }[] = [];

  if (slug === "product-friction") {
    showStatusFilter = true;
    statuses = [
      { value: "PRICE_BARRIER", label: "Price Barrier" },
      { value: "LOW_INTEREST", label: "Low Interest" },
      { value: "HEALTHY", label: "Healthy Funnel" },
    ];
  }

  // 8. Prepare data for client
  const reportData = data?.data || [];
  const totals = data?.totals || {};
  const generatedAt = data?.generatedAt || new Date().toISOString();

  const hasError = !!error;

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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1.5 leading-none">
            <Link
              href="/admin/reports-index"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
            >
              <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Reports Gallery
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <FileText size={16} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                {config.name}
              </h1>
              <span className="text-[10px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded shadow-2xs">
                {config.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {config.description}
            </p>
          </div>
          <div className="flex items-center gap-3 shadow-2xs">
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* ERROR STATE */}
        {hasError && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle size={32} className="text-red-500" />
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
                Failed to Load Report
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* REPORT DETAIL CONTENT */}
        {!hasError && (
          <ReportDetailContent
            data={reportData}
            columns={config.columns}
            totals={totals}
            isLoading={false}
            reportName={config.name}
            generatedAt={generatedAt}
            totalDocs={reportData.length}
            currentPage={page}
            limit={limit}
            statuses={statuses}
            showStatusFilter={showStatusFilter}
          />
        )}

        {/* FOOTER */}
        <div className="p-5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap">
            <span>📊 {config.name}</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🔄 5-min Redis Cache</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>📈 {config.category} Intelligence</span>
          </p>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-mono">
            Generated at: {new Date(generatedAt).toLocaleString("en-PK")}
            {reportData.length > 0 && ` · ${reportData.length} records loaded`}
          </p>
        </div>
      </div>
    </DefaultTemplate>
  );
}