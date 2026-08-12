
// // 📂 src/app/(payload)/admin/views/GeospatialIntelligenceView.tsx


// import { DefaultTemplate } from '@payloadcms/next/templates';
// import { getGeospatialIntelligencePayload } from '@/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence';
// import GeospatialStatsSummary from '@/app/features/admin/geospatial-intelligence/components/GeospatialStatsSummary';
// import GeospatialFilters from '@/app/features/admin/geospatial-intelligence/components/GeospatialFilters';
// import GeospatialCityTable from '@/app/features/admin/geospatial-intelligence/components/GeospatialCityTable';
// import GeospatialProvinceList from '@/app/features/admin/geospatial-intelligence/components/GeospatialProvinceList';
// import GeospatialExportButton from '@/app/features/admin/geospatial-intelligence/components/GeospatialExportButton';
// import GeospatialHeatmap from '@/app/features/admin/geospatial-intelligence/components/GeospatialHeatmap';
// import GeospatialCourierPerformanceTable from '@/app/features/admin/geospatial-intelligence/components/GeospatialCourierPerformanceTable';
// import GeospatialDistanceAnalysis from '@/app/features/admin/geospatial-intelligence/components/GeospatialDistanceAnalysis';
// import AnalyticsDateRangePicker from '@/app/features/admin/executive-kpi/components/DateRangePicker';
// import PaginationControls from '@/app/shared/components/ui/PaginationControls';
// import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
// import { ArrowLeft, MapPin, Truck, TrendingDown, Radio } from 'lucide-react';
// import Link from 'next/link';

// export default async function GeospatialIntelligenceView(props: any) {
//   const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
//   const params = await paramsPromise;
//   const searchParams = await searchParamsPromise;
//   const payload = props.payload || initPageResult?.req?.payload;

//   // ✅ FIX: Support both startDate/endDate & from/to searchParams for Date Range Picker compatibility
//   const fromParam = (searchParams?.startDate || searchParams?.from) as string | undefined;
//   const toParam = (searchParams?.endDate || searchParams?.to) as string | undefined;

//   const fromDate = fromParam ? startOfDay(parseISO(fromParam)) : startOfDay(new Date());
//   const toDate = toParam ? endOfDay(parseISO(toParam)) : endOfDay(new Date());

//   const range = {
//     from: fromDate,
//     to: toDate,
//   };

//   const province = (searchParams?.province as string) || '';
//   const search = (searchParams?.search as string) || '';
//   const page = Number(searchParams?.page) || 1;

//   // Server-side Data Fetch
//   const data = await getGeospatialIntelligencePayload(range, { province, search });

//   const allProvinces = [...new Set(data.provinces.map((p) => p.province))];

//   const itemsPerPage = 10;
//   const totalPages = Math.ceil(data.cities.length / itemsPerPage);
//   const start = (page - 1) * itemsPerPage;
//   const paginatedCities = data.cities.slice(start, start + itemsPerPage);

//   const i18n = props.i18n || initPageResult?.req?.i18n;
//   const locale = props.locale || initPageResult?.locale;
//   const user = props.user || initPageResult?.req?.user;
//   const permissions = props.permissions || initPageResult?.permissions;
//   const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

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
//       <div className="tw-admin-wrapper p-4 sm:p-6 lg:p-10 space-y-10 max-w-[1800px] mx-auto bg-zinc-50/50 dark:bg-zinc-950/40 min-h-screen pb-20">
        
//         {/* ================================================================ */}
//         {/* 👑 HERO HEADER */}
//         {/* ================================================================ */}
//         <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

//           <div className="space-y-2 relative z-10">
//             <Link
//               href="/admin"
//               className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-primary hover:underline mb-1 no-underline"
//             >
//               <ArrowLeft size={14} /> Back to Hub
//             </Link>
//             <div className="flex items-center gap-3 flex-wrap">
//               <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3">
//                 <MapPin size={32} className="text-brand-primary shrink-0" />
//                 Geospatial Intelligence
//               </h1>
//               <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
//                 </span>
//                 Live Territory Telemetry
//               </span>
//             </div>
//             <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
//               TERRITORY AUDIT:{" "}
//               <span className="font-bold text-zinc-800 dark:text-zinc-200">
//                 {format(range.from, 'MMM dd, yyyy')}
//               </span>{" "}
//               —{" "}
//               <span className="font-bold text-zinc-800 dark:text-zinc-200">
//                 {format(range.to, 'MMM dd, yyyy')}
//               </span>{" "}
//               | <span className="font-bold text-brand-primary">{data.summary.totalCities} CITIES ACTIVE</span>
//             </p>
//           </div>

//           <div className="relative z-10 w-full md:w-auto">
//             <AnalyticsDateRangePicker />
//           </div>
//         </div>

//         {/* ================================================================ */}
//         {/* 🗺️ PAKISTAN HEATMAP & SUMMARY CARDS */}
//         {/* ================================================================ */}
//         <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

//           {/* Pakistan Coordinates Heatmap */}
//           <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
//             <GeospatialHeatmap cities={data.cities} />
//           </div>

//           {/* 5-Card KPI Summary */}
//           <GeospatialStatsSummary
//             totalRevenue={data.summary.totalRevenue}
//             totalOrders={data.summary.totalOrders}
//             totalCities={data.summary.totalCities}
//             topCity={data.summary.topCity}
//             topProvince={data.summary.topProvince}
//           />
//         </div>

//         {/* ================================================================ */}
//         {/* 📋 CITY DATA TABLE & FILTERS */}
//         {/* ================================================================ */}
//         <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
//             <div>
//               <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
//                 City Performance Matrix
//               </h2>
//               <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//                 City-level revenue, order volume, AOV, and RTO risk audit
//               </p>
//             </div>
//             <GeospatialExportButton data={data.cities} fileName="geospatial_report" />
//           </div>

//           <GeospatialFilters provinces={allProvinces} />

//           {/* City Table */}
//           <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
//             <GeospatialCityTable cities={paginatedCities} />
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
//               <PaginationControls totalPages={totalPages} />
//             </div>
//           )}
//         </div>

//         {/* ================================================================ */}
//         {/* 🚚 LOGISTICS INTELLIGENCE SECTION */}
//         {/* ================================================================ */}
//         <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

//           <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
//             <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
//               <Truck size={24} className="text-brand-primary shrink-0" />
//               Logistics & Courier Performance
//             </h2>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//               Courier success rates, delivery speeds, and warehouse distance radius analysis
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
//             {/* Courier Performance (8 cols) */}
//             <div className="lg:col-span-8 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
//               <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
//                 <Truck size={14} className="text-brand-primary" /> Courier Delivery Success by City
//               </h3>
//               <GeospatialCourierPerformanceTable data={data.logistics.courierPerformance} />
//             </div>

//             {/* Distance Analysis (4 cols) */}
//             <div className="lg:col-span-4 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
//               <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
//                 <TrendingDown size={14} className="text-brand-primary" /> Distance Radius vs RTO
//               </h3>
//               <GeospatialDistanceAnalysis data={data.logistics.distanceAnalysis} />
//             </div>
//           </div>
//         </div>

//         {/* ================================================================ */}
//         {/* 🏛️ PROVINCE BREAKDOWN SECTION */}
//         {/* ================================================================ */}
//         <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
//           <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
//             <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
//               Provincial Regional Tiers
//             </h2>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//               Provincial sales volume, regional city count, and growth trajectories
//             </p>
//           </div>
//           <GeospatialProvinceList provinces={data.provinces} />
//         </div>

//         {/* ================================================================ */}
//         {/* 📊 TELEMETRY TICKER FOOTER */}
//         {/* ================================================================ */}
//         <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
//           <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-3 flex-wrap">
//             <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500" /> High Potential Thresholds:</span>
//             <span className="text-zinc-800 dark:text-zinc-200">Revenue &gt; Rs. {(data.settings.highPotentialRevenue || 50000).toLocaleString('en-PK')}</span>
//             <span className="text-zinc-300 dark:text-zinc-800">•</span>
//             <span className="text-zinc-800 dark:text-zinc-200">RTO &lt; {data.settings.highPotentialRto}%</span>
//             {data.logistics.distanceAnalysis.length > 0 && (
//               <>
//                 <span className="text-zinc-300 dark:text-zinc-800">•</span>
//                 <span>🏭 Warehouse Proximity Active</span>
//               </>
//             )}
//           </p>
//         </div>

//       </div>
//     </DefaultTemplate>
//   );
// }
// 📂 src/app/(payload)/admin/views/GeospatialIntelligenceView.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import { getGeospatialIntelligencePayload } from '@/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence';
import GeospatialStatsSummary from '@/app/features/admin/geospatial-intelligence/components/GeospatialStatsSummary';
import GeospatialFilters from '@/app/features/admin/geospatial-intelligence/components/GeospatialFilters';
import GeospatialCityTable from '@/app/features/admin/geospatial-intelligence/components/GeospatialCityTable';
import GeospatialProvinceList from '@/app/features/admin/geospatial-intelligence/components/GeospatialProvinceList';
import GeospatialExportButton from '@/app/features/admin/geospatial-intelligence/components/GeospatialExportButton';
import GeospatialHeatmap from '@/app/features/admin/geospatial-intelligence/components/GeospatialHeatmap';
import GeospatialCourierPerformanceTable from '@/app/features/admin/geospatial-intelligence/components/GeospatialCourierPerformanceTable';
import GeospatialDistanceAnalysis from '@/app/features/admin/geospatial-intelligence/components/GeospatialDistanceAnalysis';
import AnalyticsDateRangePicker from '@/app/features/admin/executive-kpi/components/DateRangePicker';
import PaginationControls from '@/app/shared/components/ui/PaginationControls';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { ArrowLeft, MapPin, Truck, TrendingDown, Radio } from 'lucide-react';
import Link from 'next/link';

export default async function GeospatialIntelligenceView(props: any) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const payload = props.payload || initPageResult?.req?.payload;

  // ✅ SUPPORT BOTH DATE PARAM SCHEMAS FOR CONSISTENCY
  const fromParam = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toParam = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const fromDate = fromParam ? startOfDay(parseISO(fromParam)) : startOfDay(new Date());
  const toDate = toParam ? endOfDay(parseISO(toParam)) : endOfDay(new Date());

  const range = {
    from: fromDate,
    to: toDate,
  };

  const province = (searchParams?.province as string) || '';
  const search = (searchParams?.search as string) || '';
  const page = Number(searchParams?.page) || 1;

  // Server-side Data Fetch
  const data = await getGeospatialIntelligencePayload(range, { province, search });

  const allProvinces = [...new Set(data.provinces.map((p) => p.province))];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.cities.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedCities = data.cities.slice(start, start + itemsPerPage);

  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

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
      <div className="tw-admin-wrapper p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1800px] mx-auto bg-zinc-50/50 dark:bg-zinc-950/40 min-h-screen pb-20">
        
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

          <div className="space-y-2 relative z-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-primary hover:underline mb-1 no-underline"
            >
              <ArrowLeft size={14} /> Back to Hub
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3 font-mono">
                <MapPin size={24} className="text-brand-primary shrink-0 stroke-[2.5px]" />
                Geospatial Intelligence
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Territory Telemetry
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight leading-none mt-2">
              Territory Audit Range:{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {format(range.from, 'MMM dd, yyyy')}
              </span>{" "}
              —{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {format(range.to, 'MMM dd, yyyy')}
              </span>{" "}
              | <span className="font-bold text-brand-primary">{data.summary.totalCities} CITIES ACTIVE</span>
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 🗺️ PAKISTAN HEATMAP & SUMMARY CARDS */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Pakistan Coordinates Heatmap */}
          <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
            <GeospatialHeatmap cities={data.cities} />
          </div>

          {/* 5-Card KPI Summary */}
          <GeospatialStatsSummary
            totalRevenue={data.summary.totalRevenue}
            totalOrders={data.summary.totalOrders}
            totalCities={data.summary.totalCities}
            topCity={data.summary.topCity}
            topProvince={data.summary.topProvince}
          />
        </div>

        {/* ================================================================ */}
        {/* 📋 CITY DATA TABLE & FILTERS */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic font-mono">
                City Performance Matrix
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                City-level revenue, order volume, AOV, and RTO risk audit
              </p>
            </div>
            <GeospatialExportButton data={data.cities} fileName="geospatial_report" />
          </div>

          <GeospatialFilters provinces={allProvinces} />

          {/* City Table */}
          <div className="min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6">
            <GeospatialCityTable cities={paginatedCities} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <PaginationControls totalPages={totalPages} />
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* 🚚 LOGISTICS INTELLIGENCE SECTION */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3 font-mono">
              <Truck size={24} className="text-brand-primary shrink-0 stroke-[2.5px]" />
              Logistics & Courier Performance
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Courier success rates, delivery speeds, and warehouse distance radius analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Courier Performance (8 cols) */}
            <div className="lg:col-span-8 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
              <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={14} className="text-brand-primary stroke-[2.5px]" /> Courier Delivery Success by City
              </h3>
              <GeospatialCourierPerformanceTable data={data.logistics.courierPerformance} />
            </div>

            {/* Distance Analysis (4 cols) */}
            <div className="lg:col-span-4 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
              <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingDown size={14} className="text-brand-primary stroke-[2.5px]" /> Distance Radius vs RTO
              </h3>
              <GeospatialDistanceAnalysis data={data.logistics.distanceAnalysis} />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 🏛️ PROVINCE BREAKDOWN SECTION */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic font-mono">
              Provincial Regional Tiers
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Provincial sales volume, regional city count, and growth trajectories
            </p>
          </div>
          <GeospatialProvinceList provinces={data.provinces} />
        </div>

        {/* ================================================================ */}
        {/* 📊 TELEMETRY TICKER FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500" /> High Potential Thresholds:</span>
            <span className="text-zinc-800 dark:text-zinc-200">Revenue &gt; Rs. {(data.settings.highPotentialRevenue || 50000).toLocaleString('en-PK')}</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span className="text-zinc-800 dark:text-zinc-200">RTO &lt; {data.settings.highPotentialRto}%</span>
            {data.logistics.distanceAnalysis.length > 0 && (
              <>
                <span className="text-zinc-300 dark:text-zinc-800">•</span>
                <span>🏭 Warehouse Proximity Active</span>
              </>
            )}
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}