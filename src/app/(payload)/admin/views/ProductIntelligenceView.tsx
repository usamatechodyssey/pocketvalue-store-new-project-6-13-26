// 📂 src/app/(payload)/admin/views/ProductIntelligenceView.tsx

import { DefaultTemplate } from "@payloadcms/next/templates";
import {
  getProductIntelligencePayload,
  ProductIntelResponse,
} from "@/app/features/admin/product-intelligence/actions/getProductIntelligence";
import ProductIntelligenceContent from "@/app/features/admin/product-intelligence/components/ProductIntelligenceContent";
import ProductIntelligenceFilters from "@/app/features/admin/product-intelligence/components/ProductIntelligenceFilters";
import AnalyticsDateRangePicker from "@/app/features/admin/executive-kpi/components/DateRangePicker";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { ArrowLeft, BrainCircuit, SearchX, Radio } from "lucide-react";
import Link from "next/link";

interface ProductIntelligenceViewProps {
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

export default async function ProductIntelligenceView(props: ProductIntelligenceViewProps) {
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // Single unified payload declaration
  const payload = props.payload || initPageResult?.req?.payload;

  // Support both startDate/endDate & from/to searchParams for Date Range Picker compatibility
  const fromParam = (searchParams?.startDate || searchParams?.from) as string | undefined;
  const toParam = (searchParams?.endDate || searchParams?.to) as string | undefined;

  const fromDate = fromParam ? startOfDay(parseISO(fromParam)) : startOfDay(new Date());
  const toDate = toParam ? endOfDay(parseISO(toParam)) : endOfDay(new Date());

  const range = {
    from: fromDate,
    to: toDate,
  };

  const currentPage = Number(searchParams?.page) || 1;

  // Explicitly typed with ProductIntelResponse
  const intelResult: ProductIntelResponse = await getProductIntelligencePayload(
    range,
    currentPage,
    50,
    {
      categoryId: (searchParams?.category as string) || "",
      trend: (searchParams?.trend as string) || "",
    }
  );

  const categoriesRes = await payload.find({ collection: "categories", limit: 100, depth: 0 });

  const { data, totalDocs, totalPages } = intelResult || { data: [], totalDocs: 0, totalPages: 0 };
  const categories = categoriesRes?.docs
    ? categoriesRes.docs.map((c: any) => ({ id: c.id, name: c.name }))
    : [];

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
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-zinc-900 dark:text-white flex items-center gap-3">
                <BrainCircuit size={32} className="text-brand-primary shrink-0" />
                Product Intelligence
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Surgical SKU Audit Active
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-tight">
              CATALOG AUDIT:{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.from, "MMM dd, yyyy")}
              </span>{" "}
              —{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {format(range.to, "MMM dd, yyyy")}
              </span>{" "}
              | <span className="font-bold text-brand-primary">{totalDocs.toLocaleString('en-PK')} TOTAL MATCHES</span>
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 🎛️ FILTERS BAR & CATALOG GRID CONTAINER */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 lg:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />

          {/* Filters Bar */}
          <ProductIntelligenceFilters categories={categories} />

          {/* Catalog Content Grid */}
          <div className="min-w-0">
            {data && data.length > 0 ? (
              <div className="space-y-8">
                <ProductIntelligenceContent data={data} />
                {totalPages > 1 && (
                  <div className="flex justify-center border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6">
                    <PaginationControls totalPages={totalPages} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-500 text-center">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl mb-3">
                  <SearchX size={36} />
                </div>
                <h3 className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                  No Strategic Data Found
                </h3>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Adjust your category filters or date range to scan deeper into catalog performance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 📊 TELEMETRY TICKER FOOTER */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 text-center shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-3 flex-wrap">
            <Radio size={12} className="text-emerald-500" /> Neural Pattern Recognition Engine Engaged
            <span className="text-zinc-300 dark:text-zinc-800">•</span>
            <span>📦 Product-Level Profitability & Return Risk Active</span>
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}