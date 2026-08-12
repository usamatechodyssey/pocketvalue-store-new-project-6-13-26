
// 📂 src/app/(payload)/admin/views/AnalyticsDashboardView.tsx

import { differenceInDays, subDays, format } from "date-fns";

// 1. EXECUTIVE KPI MODULE (Decoupled & Localized)
import ExecutiveDashboardContent from "@/app/features/admin/executive-kpi/components/ExecutiveDashboardContent";
import StrategicAIInsight from "@/app/features/admin/executive-kpi/components/StrategicAIInsight"; 
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// 2. SALES CHART MODULE
import { getSalesChartDataPayload } from "@/app/features/admin/sales-chart/actions/getSalesChartData";
import SalesPerformanceChart from "@/app/features/admin/sales-chart/components/SalesPerformanceChart";

// 3. INVENTORY FORECASTER MODULE
import { getInventoryForecasterPayload } from "@/app/features/admin/inventory-forecaster/actions/getInventoryForecaster";
import InventoryForecaster from "@/app/features/admin/inventory-forecaster/components/InventoryForecaster";

// 4. PRODUCT INTELLIGENCE MODULE
import { getTopProductsPayload } from "@/app/features/admin/product-intelligence/actions/getTopProducts";
import TopProductsList from "@/app/features/admin/product-intelligence/components/TopProductsList";

// 5. TRAFFIC ATTRIBUTION MODULE
import { getTrafficAttributionPayload } from "@/app/features/admin/traffic-attribution/actions/getTrafficAttribution";
import TrafficSourceChart from "@/app/features/admin/traffic-attribution/components/TrafficSourceChart";

// 6. OPERATIONAL INTELLIGENCE MODULE
import { getOperationalIntelligencePayload } from "@/app/features/admin/operational-intelligence/actions/getOperationalIntelligence";
import OperationalDashboardWidget from "@/app/features/admin/operational-intelligence/components/OperationalDashboardWidget";

// 7. GEOSPATIAL INTELLIGENCE MODULE
import { getGeospatialIntelligencePayload } from "@/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence";
import GeospatialDashboardWidget from "@/app/features/admin/geospatial-intelligence/components/GeospatialDashboardWidget";

// 8. BEHAVIORAL INTELLIGENCE MODULE
import { getBehavioralIntelligencePayload } from "@/app/features/admin/behavioral-intelligence/actions/getBehavioralIntelligence";
import BehavioralDashboardWidget from "@/app/features/admin/behavioral-intelligence/components/BehavioralDashboardWidget";

// 9. FINANCIAL SURGERY MODULE
import { getGranularFinancialsPayload } from "@/app/features/admin/financial-surgery/actions/getGranularFinancials";
import PriceAnatomySurgeon from "@/app/features/admin/financial-surgery/components/PriceAnatomySurgeon";

// 10. LOYALTY INTELLIGENCE MODULE
import { getReferralPerformance } from "@/app/features/admin/loyalty-intelligence/actions/getReferralPerformance";
import ReferralPerformanceWidget from "@/app/features/admin/loyalty-intelligence/components/ReferralPerformanceWidget";
import { getExecutiveAnalyticsPayload } from "@/app/features/admin/executive-kpi/actions/getExecutiveAnalytics";

interface AnalyticsDashboardViewProps {
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

// Helpers: PKT Timezone (UTC +5)
const getPktTodayString = (): string => {
  const pktDate = new Date(Date.now() + 5 * 60 * 60 * 1000);
  return pktDate.toISOString().split("T")[0];
};

// UI Section Header Component
const DashboardSectionHeader = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
  <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
    <span className="text-[10px] font-mono font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900">
      {num}
    </span>
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">{title}</h3>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">{desc}</p>
    </div>
  </div>
);

export default async function AnalyticsDashboardView(props: AnalyticsDashboardViewProps) {
  const { searchParams: searchParamsPromise } = props;
  const searchParams = await searchParamsPromise;

  const todayStr = getPktTodayString();

  const startDateStr = searchParams?.startDate as string | undefined;
  const endDateStr = searchParams?.endDate as string | undefined;
  const compareStr = searchParams?.compare as string | undefined;

  const startDate = startDateStr
    ? new Date(`${startDateStr}T00:00:00+05:00`)
    : new Date(`${todayStr}T00:00:00+05:00`);

  const endDate = endDateStr
    ? new Date(`${endDateStr}T23:59:59.999+05:00`)
    : new Date(`${todayStr}T23:59:59.999+05:00`);

  const daysCount = differenceInDays(endDate, startDate) + 1;
  const compareStartDate = subDays(startDate, daysCount);
  const compareEndDate = subDays(endDate, daysCount);

  const range = {
    from: startDate,
    to: endDate,
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
    compare: compareStr === 'true',
  };

  // Parallel Fetching
  const [
    summaryResult,
    chartResult,
    topProductsResult,
    trafficResult,
    operationalResult,
    behavioralResult,
    financialResult,
    forecastResult,
    geoResult,
    referralResult,
  ] = await Promise.all([
    getExecutiveAnalyticsPayload(range).catch(() => null),
    getSalesChartDataPayload(range).catch(() => []),
    getTopProductsPayload(range).catch(() => []),
    getTrafficAttributionPayload(range).catch(() => []),
    getOperationalIntelligencePayload(range).catch(() => null),
    getBehavioralIntelligencePayload(range).catch(() => null),
    getGranularFinancialsPayload(range).catch(() => null),
    getInventoryForecasterPayload({ page: 1, limit: 5 }).catch(() => null),
    getGeospatialIntelligencePayload(range).catch(() => ({ cities: [] })),
    getReferralPerformance().catch(() => ({ success: false, data: null })),
  ]);

  // Safe Fallbacks
  const summaryData = summaryResult || null;
  const chartData = chartResult || [];
  const topProducts = topProductsResult || [];
  const trafficData = trafficResult || [];
  const operationalData = operationalResult || null;
  const behavioralData = behavioralResult || null;
  const financialData = financialResult || null;
  const forecastResponse = forecastResult || null;
  const geoCities = geoResult?.cities || [];
  const referralData = referralResult?.success ? referralResult.data : null;

  return (
    <div className="tw-admin-wrapper p-4 md:p-8 space-y-10 pb-20 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
      
      {/* GLOBAL HUD HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1.5 leading-none">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
              Intelligence Hub
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-[9px] font-semibold uppercase tracking-wider font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Live Telemetry
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
            Audit Range: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{format(range.startDate, 'MMM dd, yyyy')}</span> — <span className="font-semibold text-zinc-600 dark:text-zinc-300">{format(range.endDate, 'MMM dd, yyyy')}</span>
          </p>
        </div>
        <div className="w-full sm:w-auto shadow-sm">
          <AnalyticsDateRangePicker />
        </div>
      </div>

      {/* ZONE 1: CORE PERFORMANCE & CAPITAL */}
      <div className="space-y-6">
        <DashboardSectionHeader 
          num="01" 
          title="Core Performance & Capital" 
          desc="Executive KPI summaries and high-level revenue trajectory charts." 
        />
        
        {/* KPI Summaries Row Only (Enclosed full-width) */}
        <div className="w-full min-w-0">
          <ExecutiveDashboardContent data={summaryData} />
        </div>

        {/* ✅ CREATIVE FIX: Sales Performance Chart NOW 100% FULL WIDTH */}
        <div className="w-full min-h-105 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 overflow-hidden shadow-xs">
          <SalesPerformanceChart data={chartData} />
        </div>
      </div>

      {/* ZONE 2: LOGISTICS & DISTRIBUTION OPERATIONS */}
      <div className="space-y-6">
        <DashboardSectionHeader 
          num="02" 
          title="Logistics & Traffic Flow" 
          desc="Real-time geo-mapping, system operations status, and visitor traffic origins." 
        />
        
        {/* Three-Column Operational Grid (Identical Aspect Ratios) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Traffic Source Container */}
          <div className="flex flex-col h-full min-h-105 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              <TrafficSourceChart data={trafficData} />
            </div>
          </div>
          
          {/* Geospatial Container */}
          <div className="flex flex-col h-full min-h-105 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              <GeospatialDashboardWidget cities={geoCities} />
            </div>
          </div>
          
          {/* Operational Intelligence Container */}
          <div className="flex flex-col h-full min-h-105 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              <OperationalDashboardWidget data={operationalData} />
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 3: ENGAGEMENT & BEHAVIORAL TELEMETRY */}
      <div className="space-y-6">
        <DashboardSectionHeader 
          num="03" 
          title="Telemetry & Behavioral Signals" 
          desc="Granular conversion loops, technical friction, and user sessions." 
        />
        
        {/* ✅ CREATIVE FIX: Behavioral Analytics NOW 100% FULL WIDTH to allow nested sub-panels to breathe */}
        <div className="w-full min-h-120 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 overflow-hidden shadow-xs">
          <BehavioralDashboardWidget data={behavioralData} />
        </div>
      </div>

      {/* ZONE 4: PRODUCT & INVENTORY INTELLIGENCE */}
      <div className="space-y-6">
        <DashboardSectionHeader 
          num="04" 
          title="Products & Inventory Health" 
          desc="Top-selling MVPs paired with real-time stock depletion risks." 
        />

        {/* ✅ CREATIVE FIX: Side-by-side Product Assets & Stock Risks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Top Products Container */}
          <div className="flex flex-col h-full min-h-110 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              <TopProductsList products={topProducts} />
            </div>
          </div>

          {/* Inventory Forecaster (Top Depletion Risks) Container */}
          <div className="flex flex-col h-full min-h-110 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              <InventoryForecaster response={forecastResponse} />
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 5: LOYALTY & FINANCIAL SURGERY */}
      <div className="space-y-6">
        <DashboardSectionHeader 
          num="05" 
          title="Loyalty & Financial Surgery" 
          desc="Referral conversions and granular profit margins analysis." 
        />

        {/* ✅ CREATIVE FIX: Changed items-stretch to items-start to prevent referral widget from stretching awkwardly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Referral / Loyalty Widget Container */}
          <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              {referralData ? (
                <ReferralPerformanceWidget stats={referralData} />
              ) : (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center min-h-87.5">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xl">🤝</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-mono">No Referral Activity Yet</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Once customers start sharing their referral links and generating signups, you'll see real-time performance metrics here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Financial Surgery Widget Container */}
          <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
            <div className="flex-1 w-full h-full">
              {financialData ? (
                <PriceAnatomySurgeon data={financialData} />
              ) : (
                <div className="p-8 text-center h-full flex flex-col items-center justify-center min-h-87.5">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xl">📊</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-mono">No Financial Metrics</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Granular financials data is currently loading or unavailable.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI INSIGHTS CONTAINER (Strictly bottom-bound) */}
        <div className="pt-6 w-full min-w-0">
          <StrategicAIInsight data={summaryData} />
        </div>
      </div>

    </div>
  );
}
// // 📂 src/app/(payload)/admin/views/AnalyticsDashboardView.tsx

// import { differenceInDays, subDays, format } from "date-fns";

// // 1. EXECUTIVE KPI MODULE
// import ExecutiveDashboardContent from "@/app/features/admin/executive-kpi/components/ExecutiveDashboardContent";
// import StrategicAIInsight from "@/app/features/admin/executive-kpi/components/StrategicAIInsight"; 
// import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// // 2. SALES CHART MODULE
// import { getSalesChartDataPayload } from "@/app/features/admin/sales-chart/actions/getSalesChartData";
// import SalesPerformanceChart from "@/app/features/admin/sales-chart/components/SalesPerformanceChart";

// // 3. INVENTORY FORECASTER MODULE
// import { getInventoryForecasterPayload } from "@/app/features/admin/inventory-forecaster/actions/getInventoryForecaster";
// import InventoryForecaster from "@/app/features/admin/inventory-forecaster/components/InventoryForecaster";

// // 4. PRODUCT INTELLIGENCE MODULE
// import { getTopProductsPayload } from "@/app/features/admin/product-intelligence/actions/getTopProducts";
// import TopProductsList from "@/app/features/admin/product-intelligence/components/TopProductsList";

// // 5. TRAFFIC ATTRIBUTION MODULE
// import { getTrafficAttributionPayload } from "@/app/features/admin/traffic-attribution/actions/getTrafficAttribution";
// import TrafficSourceChart from "@/app/features/admin/traffic-attribution/components/TrafficSourceChart";

// // 6. OPERATIONAL INTELLIGENCE MODULE
// import { getOperationalIntelligencePayload } from "@/app/features/admin/operational-intelligence/actions/getOperationalIntelligence";
// import OperationalDashboardWidget from "@/app/features/admin/operational-intelligence/components/OperationalDashboardWidget";

// // 7. GEOSPATIAL INTELLIGENCE MODULE
// import { getGeospatialIntelligencePayload } from "@/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence";
// import GeospatialDashboardWidget from "@/app/features/admin/geospatial-intelligence/components/GeospatialDashboardWidget";

// // 8. BEHAVIORAL INTELLIGENCE MODULE
// import { getBehavioralIntelligencePayload } from "@/app/features/admin/behavioral-intelligence/actions/getBehavioralIntelligence";
// import BehavioralDashboardWidget from "@/app/features/admin/behavioral-intelligence/components/BehavioralDashboardWidget";

// // 9. FINANCIAL SURGERY MODULE
// import { getGranularFinancialsPayload } from "@/app/features/admin/financial-surgery/actions/getGranularFinancials";
// import PriceAnatomySurgeon from "@/app/features/admin/financial-surgery/components/PriceAnatomySurgeon";

// // 10. LOYALTY INTELLIGENCE MODULE
// import { getReferralPerformance } from "@/app/features/admin/loyalty-intelligence/actions/getReferralPerformance";
// import ReferralPerformanceWidget from "@/app/features/admin/loyalty-intelligence/components/ReferralPerformanceWidget";
// import { getExecutiveAnalyticsPayload } from "@/app/features/admin/executive-kpi/actions/getExecutiveAnalytics";

// interface AnalyticsDashboardViewProps {
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

// // Helpers: PKT Timezone (UTC +5)
// const getPktTodayString = (): string => {
//   const pktDate = new Date(Date.now() + 5 * 60 * 60 * 1000);
//   return pktDate.toISOString().split("T")[0];
// };

// // UI Section Header Component
// const DashboardSectionHeader = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
//   <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
//     <span className="text-[10px] font-mono font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900">
//       {num}
//     </span>
//     <div>
//       <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">{title}</h3>
//       <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">{desc}</p>
//     </div>
//   </div>
// );

// export default async function AnalyticsDashboardView(props: AnalyticsDashboardViewProps) {
//   const { searchParams: searchParamsPromise } = props;
//   const searchParams = await searchParamsPromise;

//   const todayStr = getPktTodayString();

//   const startDateStr = searchParams?.startDate as string | undefined;
//   const endDateStr = searchParams?.endDate as string | undefined;
//   const compareStr = searchParams?.compare as string | undefined;

//   const startDate = startDateStr
//     ? new Date(`${startDateStr}T00:00:00+05:00`)
//     : new Date(`${todayStr}T00:00:00+05:00`);

//   const endDate = endDateStr
//     ? new Date(`${endDateStr}T23:59:59.999+05:00`)
//     : new Date(`${todayStr}T23:59:59.999+05:00`);

//   const daysCount = differenceInDays(endDate, startDate) + 1;
//   const compareStartDate = subDays(startDate, daysCount);
//   const compareEndDate = subDays(endDate, daysCount);

//   const range = {
//     from: startDate,
//     to: endDate,
//     startDate,
//     endDate,
//     compareStartDate,
//     compareEndDate,
//     compare: compareStr === 'true',
//   };

//   // Parallel Fetching
//   const [
//     summaryResult,
//     chartResult,
//     topProductsResult,
//     trafficResult,
//     operationalResult,
//     behavioralResult,
//     financialResult,
//     forecastResult,
//     geoResult,
//     referralResult,
//   ] = await Promise.all([
//     getExecutiveAnalyticsPayload(range).catch(() => null),
//     getSalesChartDataPayload(range).catch(() => []),
//     getTopProductsPayload(range).catch(() => []),
//     getTrafficAttributionPayload(range).catch(() => []),
//     getOperationalIntelligencePayload(range).catch(() => null),
//     getBehavioralIntelligencePayload(range).catch(() => null),
//     getGranularFinancialsPayload(range).catch(() => null),
//     getInventoryForecasterPayload({ page: 1, limit: 5 }).catch(() => null),
//     getGeospatialIntelligencePayload(range).catch(() => ({ cities: [] })),
//     getReferralPerformance().catch(() => ({ success: false, data: null })),
//   ]);

//   // Safe Fallbacks
//   const summaryData = summaryResult || null;
//   const chartData = chartResult || [];
//   const topProducts = topProductsResult || [];
//   const trafficData = trafficResult || [];
//   const operationalData = operationalResult || null;
//   const behavioralData = behavioralResult || null;
//   const financialData = financialResult || null;
//   const forecastResponse = forecastResult || null;
//   const geoCities = geoResult?.cities || [];
//   const referralData = referralResult?.success ? referralResult.data : null;

//   return (
//     <div className="tw-admin-wrapper p-4 md:p-8 space-y-10 pb-20 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20 font-sans">
      
//       {/* GLOBAL HUD HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
//         <div className="space-y-1.5 leading-none">
//           <div className="flex items-center gap-3">
//             <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none font-mono">
//               Intelligence Hub
//             </h1>
//             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-[9px] font-semibold uppercase tracking-wider font-mono">
//               <span className="relative flex h-1.5 w-1.5">
//                 <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
//                 <span className="relative rounded-full h-1.5 w-1.5 bg-green-500" />
//               </span>
//               Live Telemetry
//             </div>
//           </div>
//           <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1 font-mono">
//             Audit Range: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{format(range.startDate, 'MMM dd, yyyy')}</span> — <span className="font-semibold text-zinc-600 dark:text-zinc-300">{format(range.endDate, 'MMM dd, yyyy')}</span>
//           </p>
//         </div>
//         <div className="w-full sm:w-auto shadow-sm">
//           <AnalyticsDateRangePicker />
//         </div>
//       </div>

//       {/* ZONE 1: CORE PERFORMANCE & CAPITAL */}
//       <div className="space-y-6">
//         <DashboardSectionHeader 
//           num="01" 
//           title="Core Performance & Capital" 
//           desc="Executive KPI summaries and high-level revenue trajectory charts." 
//         />
        
//         {/* KPI Summaries Row */}
//         <div className="w-full min-w-0">
//           <ExecutiveDashboardContent data={summaryData} />
//         </div>

//         {/* Full-Width Velocity Trajectory Chart */}
//         <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-6 sm:p-8 overflow-hidden shadow-2xl">
//           <SalesPerformanceChart data={chartData} />
//         </div>
//       </div>

//       {/* ZONE 2: LOGISTICS & DISTRIBUTION OPERATIONS */}
//       <div className="space-y-6">
//         <DashboardSectionHeader 
//           num="02" 
//           title="Logistics & Traffic Flow" 
//           desc="Real-time geo-mapping, system operations status, and visitor traffic origins." 
//         />
        
//         {/* Three-Column Operational Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
//           <div className="w-full min-w-0 h-full">
//             <TrafficSourceChart data={trafficData} />
//           </div>
//           <div className="w-full min-w-0 h-full">
//             <GeospatialDashboardWidget cities={geoCities} />
//           </div>
//           <div className="w-full min-w-0 h-full">
//             <OperationalDashboardWidget data={operationalData} />
//           </div>
//         </div>
//       </div>

//       {/* ZONE 3: ENGAGEMENT & BEHAVIORAL TELEMETRY */}
//       <div className="space-y-6">
//         <DashboardSectionHeader 
//           num="03" 
//           title="Telemetry & Behavioral Signals" 
//           desc="Granular conversion loops, technical friction, and user sessions." 
//         />
        
//         {/* Full-Width Behavioral Analytics Widget */}
//         <div className="w-full min-w-0">
//           <BehavioralDashboardWidget data={behavioralData} />
//         </div>
//       </div>

//       {/* ZONE 4: PRODUCT & INVENTORY INTELLIGENCE */}
//       <div className="space-y-6">
//         <DashboardSectionHeader 
//           num="04" 
//           title="Products & Inventory Health" 
//           desc="Top-selling MVPs paired with real-time stock depletion risks." 
//         />

//         {/* Side-by-side Product Assets & Stock Risks Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
//           <div className="w-full min-w-0 h-full">
//             <TopProductsList products={topProducts} />
//           </div>
//           <div className="w-full min-w-0 h-full">
//             <InventoryForecaster response={forecastResponse} />
//           </div>
//         </div>
//       </div>

//       {/* ZONE 5: LOYALTY & FINANCIAL SURGERY */}
//       <div className="space-y-6">
//         <DashboardSectionHeader 
//           num="05" 
//           title="Loyalty & Financial Surgery" 
//           desc="Referral conversions and granular profit margins analysis." 
//         />

//         {/* ✅ FIX: items-start grid alignment without duplicate outer card wrappers or forced h-full stretching */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
//           <div className="w-full min-w-0">
//             {referralData ? (
//               <ReferralPerformanceWidget stats={referralData} />
//             ) : (
//               <div className="p-8 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center min-h-62.5 shadow-2xl">
//                 <div className="space-y-3">
//                   <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
//                     <span className="text-xl">🤝</span>
//                   </div>
//                   <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-mono">No Referral Activity Yet</p>
//                   <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed font-sans">
//                     Once customers start sharing their referral links and generating signups, you'll see real-time performance metrics here.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="w-full min-w-0">
//             {financialData ? (
//               <PriceAnatomySurgeon data={financialData} />
//             ) : (
//               <div className="p-8 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center min-h-62.5 shadow-2xl">
//                 <div className="space-y-3">
//                   <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-800">
//                     <span className="text-xl">📊</span>
//                   </div>
//                   <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-mono">No Financial Metrics</p>
//                   <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed font-sans">
//                     Granular financials data is currently loading or unavailable.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* AI INSIGHTS CONTAINER */}
//         <div className="pt-6 w-full min-w-0">
//           <StrategicAIInsight data={summaryData} />
//         </div>
//       </div>

//     </div>
//   );
// }