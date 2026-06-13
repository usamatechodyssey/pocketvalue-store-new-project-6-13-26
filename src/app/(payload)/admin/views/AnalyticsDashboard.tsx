import React from "react";
// import {
//   getAISentinelPayload,
//   getBehavioralIntelligencePayload,
//   getExecutiveAnalyticsPayload,
//   getGeospatialIntelligencePayload,
//   getGranularFinancialsPayload,
//   getInventoryForecasterPayload,
//   getLoyaltyIntelligencePayload,
//   getOperationalIntelligencePayload,
//   getSalesChartDataPayload,
//   getTopProductsPayload,
//   getTrafficAttributionPayload,
// } from "@/app/actions/payloadAnalyticsActions";
// Naya, optimized, aur modular single import:
import {
  getAISentinelPayload,
  getBehavioralIntelligencePayload,
  getExecutiveAnalyticsPayload,
  getGeospatialIntelligencePayload,
  getGranularFinancialsPayload,
  getInventoryForecasterPayload,
  getLoyaltyIntelligencePayload,
  getOperationalIntelligencePayload,
  getSalesChartDataPayload,
  getTopProductsPayload,
  getTrafficAttributionPayload,
} from "@/app/actions/analytics"; // 👈 Ab ye naye folder se clean load hoga!
import AnalyticsDashboardContent from "@/app/components/payload-analytics/AnalyticsDashboardContent";
import AnalyticsDateRangePicker from "@/app/components/payload-analytics/AnalyticsDateRangePicker";
import { startOfDay, parseISO, endOfDay, format } from "date-fns";

export default async function AnalyticsDashboardView(props: any) {
  const { searchParams: searchParamsPromise } = props;
  const searchParams = await searchParamsPromise;

  // ✅ NASA TIMEZONE LOGIC: Get dates from URL or default to TODAY
  const fromStr = searchParams?.from;
  const toStr = searchParams?.to;

  const range = {
    from: fromStr ? startOfDay(parseISO(fromStr)) : startOfDay(new Date()),
    to: toStr ? endOfDay(parseISO(toStr)) : endOfDay(new Date()),
  };

  // 🚀 AI DATA ENGINE: All 11 Functions running in Parallel for Maximum Velocity
  const [
    summaryData,
    chartData,
    topProducts,
    trafficData,
    operationalData,
    behavioralData,
    financialData,
    forecastData,
    geoData,
    loyaltyData,
    sentinelData,
  ] = await Promise.all([
    getExecutiveAnalyticsPayload(range),
    getSalesChartDataPayload(range),
    getTopProductsPayload(range),
    getTrafficAttributionPayload(range),
    getOperationalIntelligencePayload(range),
    getBehavioralIntelligencePayload(range),
    getGranularFinancialsPayload(range),
    getInventoryForecasterPayload(), // Stock doesn't need range
    getGeospatialIntelligencePayload(range),
    getLoyaltyIntelligencePayload(range),
    getAISentinelPayload(), // ✅ FIXED: Removed typo and extra call
  ]);

  return (
    <div className="tw-admin-wrapper p-4 md:p-10 space-y-10 pb-20">
      {/* ✅ UNIFIED COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Intelligence Hub
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-70">
              Audit: {format(range.from, "MMM dd, yyyy")} —{" "}
              {format(range.to, "MMM dd, yyyy")}
            </p>
            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
            <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase tracking-tighter">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Sync
            </div>
          </div>
        </div>

        {/* THE MASTER CONTROLLER */}
        <div className="w-full lg:w-auto flex justify-end">
          <AnalyticsDateRangePicker />
        </div>
      </div>

      {/* DASHBOARD CONTENT ENGINE */}
      {summaryData ? (
        <AnalyticsDashboardContent
          data={summaryData}
          chartData={chartData}
          topProducts={topProducts}
          trafficData={trafficData}
          operationalData={operationalData}
          behavioralData={behavioralData}
          financialData={financialData}
          forecastData={forecastData}
          geoData={geoData}
          loyaltyData={loyaltyData}
          sentinelData={sentinelData}
        />
      ) : (
        <div className="p-32 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] animate-pulse">
          <p className="text-gray-500 font-black uppercase tracking-widest italic">
            Booting Neural Intelligence Suite...
          </p>
        </div>
      )}
    </div>
  );
}
