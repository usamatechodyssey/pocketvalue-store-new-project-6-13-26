// 📂 src/app/(payload)/admin/views/ReferralIntelligenceView.tsx

import React from "react";
import { DefaultTemplate } from "@payloadcms/next/templates";
import {
  ArrowLeft,
  BrainCircuit,
  Clock,
  ExternalLink,
  CheckCircle,
  Download,
  Radio,
} from "lucide-react";
import { format, parseISO, startOfDay, endOfDay, subDays } from "date-fns";
import Link from "next/link";

// ✅ DB & Actions
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Referral from "@/models/Referral";

// ✅ Loyalty Intelligence Actions
import { getReferralPerformance } from "@/app/features/admin/loyalty-intelligence/actions/getReferralPerformance";
import { getLoyaltyExecutiveSummary } from "@/app/features/admin/loyalty-intelligence/actions/getLoyaltyExecutiveSummary";
import { getLoyaltyFunnel } from "@/app/features/admin/loyalty-intelligence/actions/getLoyaltyFunnel";
import { getLoyaltyGoals } from "@/app/features/admin/loyalty-intelligence/actions/getLoyaltyGoals";

// ✅ Loyalty Intelligence Components
import ReferralPerformanceWidget from "@/app/features/admin/loyalty-intelligence/components/ReferralPerformanceWidget";
import AdminPayoutActionButton from "@/app/features/admin/loyalty-intelligence/components/AdminPayoutActionButton";
import LoyaltyExecutiveSummaryCards from "@/app/features/admin/loyalty-intelligence/components/LoyaltyExecutiveSummaryCards";
import LoyaltyFunnelChart from "@/app/features/admin/loyalty-intelligence/components/LoyaltyFunnelChart";
import LoyaltyGoalProgress from "@/app/features/admin/loyalty-intelligence/components/LoyaltyGoalProgress";

// ✅ Shared Components
import PaginationControls from "@/app/shared/components/ui/PaginationControls";

// ✅ Inactive Customers Widget & Action
import InactiveCustomersWidget from "@/app/features/admin/loyalty-intelligence/components/InactiveCustomersWidget";
import { getInactiveCustomers } from "@/app/features/admin/loyalty-intelligence/actions/getInactiveCustomers";

// ✅ Segment Builder Widget & Action
import SegmentBuilderWidget from "@/app/features/admin/loyalty-intelligence/components/SegmentBuilderWidget";
import { listSegments } from "@/app/features/admin/loyalty-intelligence/actions/saveSegment";
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";

// ================================================================
// ✅ TYPES
// ================================================================
interface ReferralLogNode {
  _id: string;
  referrerName: string;
  referrerEmail: string;
  friendName: string;
  friendEmail: string;
  status: "pending" | "converted" | "paid";
  orderId: string | null;
  convertedAt: string | null;
  createdAt: string;
}

interface PaginatedLogsResult {
  logs: ReferralLogNode[];
  totalDocs: number;
  totalPages: number;
}

interface ReferralIntelligenceViewProps {
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
// ✅ HELPER: Extract data from PromiseSettledResult
// ================================================================
function extractData<T>(
  result: PromiseSettledResult<{ success: boolean; data?: T; error?: string }>
): T | null {
  if (result.status === "fulfilled" && result.value.success && result.value.data) {
    return result.value.data;
  }
  return null;
}

// ================================================================
// ✅ PAGINATED LOGS FETCHER (With en-PK Localizations)
// ================================================================
async function getReferralTransactionLogs(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedLogsResult> {
  try {
    await connectMongoose();
    const skip = (page - 1) * limit;

    const [logs, totalDocs] = await Promise.all([
      Referral.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("referrerId", "name email")
        .populate("referredUserId", "name email")
        .lean(),
      Referral.countDocuments(),
    ]);

    const mappedLogs: ReferralLogNode[] = logs.map((log: any) => ({
      _id: log._id.toString(),
      referrerName: log.referrerId?.name || "Deleted User",
      referrerEmail: log.referrerId?.email || "N/A",
      friendName: log.referredUserId?.name || "Pending Onboarding",
      friendEmail: log.referredUserId?.email || "N/A",
      status: log.status,
      orderId: log.orderId || null,
      convertedAt: log.convertedAt ? new Date(log.convertedAt).toLocaleDateString('en-PK') : null,
      createdAt: new Date(log.createdAt).toLocaleDateString('en-PK'),
    }));

    return {
      logs: mappedLogs,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
    };
  } catch (error) {
    console.error("Failed to fetch paginated referral logs:", error);
    return { logs: [], totalDocs: 0, totalPages: 0 };
  }
}

// ================================================================
// 🚀 PAGE COMPONENT (Server Component)
// ================================================================
export default async function ReferralIntelligenceView(props: ReferralIntelligenceViewProps) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // ✅ FIX 1: Single unified payload declaration (resolves ts6133 warning)
  const payload = props.payload || initPageResult?.req?.payload;

  // Parse Date Range for Export (default: last 30 days)
  const today = new Date();
  const defaultFrom = subDays(today, 30);

  // ✅ FIX 2: Support both startDate/endDate & from/to searchParams for Date Range Picker compatibility
  const fromParam = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toParam = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const from = fromParam ? startOfDay(parseISO(fromParam)) : startOfDay(defaultFrom);
  const to = toParam ? endOfDay(parseISO(toParam)) : endOfDay(today);

  const exportUrl = `/api/admin/export-referral-logs?from=${format(from, "yyyy-MM-dd")}&to=${format(to, "yyyy-MM-dd")}`;

  // Parallel Data Fetching
  const [
    performanceResult,
    executiveResult,
    funnelResult,
    goalsResult,
    logsResult,
    inactiveResult,
    segmentsResult,
  ] = await Promise.allSettled([
    getReferralPerformance(),
    getLoyaltyExecutiveSummary(),
    getLoyaltyFunnel(),
    getLoyaltyGoals(),
    getReferralTransactionLogs(Number(searchParams?.page) || 1),
    getInactiveCustomers({ page: 1, limit: 1 }),
    listSegments(),
  ]);

  // Extract Data with Fallbacks
  const stats = extractData(performanceResult);
  const executiveData = extractData(executiveResult);
  const funnelData = extractData(funnelResult);
  const goalData = extractData(goalsResult);
  const inactiveData = inactiveResult.status === "fulfilled" ? inactiveResult.value : null;
  const segmentsData =
    segmentsResult.status === "fulfilled" && segmentsResult.value.success
      ? segmentsResult.value.data
      : [];

  const { logs, totalDocs, totalPages } =
    logsResult.status === "fulfilled"
      ? logsResult.value
      : { logs: [], totalDocs: 0, totalPages: 0 };

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
      payload={payload} // ✅ Correctly reads unified payload variable
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
                Loyalty &amp; Referrals Hub
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Referral Ledger Active
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
              AUDIT RANGE:{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(from, "MMM dd, yyyy")}
              </span>{" "}
              —{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(to, "MMM dd, yyyy")}
              </span>{" "}
              | <span className="font-bold text-brand-primary">{(totalDocs || 0).toLocaleString('en-PK')} TOTAL TRANSACTIONS</span>
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap">
            {/* Export Logs CSV Button */}
            <a
              href={exportUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 transition-all border border-zinc-200 dark:border-zinc-800 uppercase tracking-wider no-underline hover:no-underline cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              Export Logs CSV
            </a>
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION 1: PROGRAM COHORT IMPACT */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
          <LoyaltyExecutiveSummaryCards data={executiveData} />
        </div>

        {/* ================================================================ */}
        {/* SECTION 2: REFERRAL FUNNEL + MONTHLY GOAL */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
          <div className="xl:col-span-2 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-w-0">
            <LoyaltyFunnelChart data={funnelData} />
          </div>
          <div className="xl:col-span-1 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-w-0">
            <LoyaltyGoalProgress data={goalData} />
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION 3: TOP REFERRERS LEADERBOARD */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
          {stats ? (
            <ReferralPerformanceWidget stats={stats} />
          ) : (
            <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center min-h-50">
              <p className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                No referral performance telemetry recorded yet.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* SECTION 4: TRANSACTION AUDIT LEDGER */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Ledger Toolbar */}
          <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
            <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} className="text-brand-primary" /> TRANSACTION AUDIT LEDGER
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
              SHOWING {logs.length} OF {(totalDocs || 0).toLocaleString('en-PK')} TRANSACTIONS
            </span>
          </div>

          {/* Table Container (With Scroll Guard) */}
          <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
            {/* ✅ FIX 3: Changed min-w-175 to standard min-w-[800px] with whitespace-nowrap for scroll protection */}
            <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
              <table className="w-full min-w-200 border-collapse text-left text-xs relative">
                <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
                  <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Joined Date</th>
                    <th className="py-3 px-4 whitespace-nowrap">Referrer User</th>
                    <th className="py-3 px-4 whitespace-nowrap">Friend Registered</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Converting Order</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Conversion Date</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Voucher Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 font-mono">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono font-medium whitespace-nowrap">
                          {log.createdAt}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {log.referrerName}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                            {log.referrerEmail}
                          </p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {log.friendName}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                            {log.friendEmail}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-wider ${
                              log.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : log.status === "converted"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            {log.status === "paid" ? "settled" : log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.orderId ? (
                            <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              #{log.orderId}
                              <a
                                href={`/admin/orders/${log.orderId}`}
                                target="_blank"
                                className="text-zinc-400 hover:text-brand-primary"
                                title="Open Order Details"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600 italic font-mono">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                          {log.convertedAt || <span className="italic font-sans">—</span>}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.status === "converted" ? (
                            <AdminPayoutActionButton referralId={log._id} />
                          ) : log.status === "paid" ? (
                            <span className="text-emerald-500 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono">
                              <CheckCircle size={12} className="stroke-[2.5]" /> Cleared
                            </span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-600 italic font-sans">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400 italic font-mono text-xs">
                        No referral transaction logs available in Database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50">
                <PaginationControls totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5 & 6: INACTIVE CUSTOMERS + SEGMENT BUILDER */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <InactiveCustomersWidget summary={inactiveData?.summary || null} />
          <SegmentBuilderWidget savedSegmentsCount={segmentsData?.length || 0} />
        </section>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-4 flex-wrap">
            <span>🤝 Referral Attribution Ledger Engine</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>📊 Real-time Payout Leaderboard</span>
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>🛡️ Anti-Fraud Shield Active</span>
          </p>
        </div>
      </div>
    </DefaultTemplate>
  );
}