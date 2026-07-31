// 📂 src/app/(payload)/admin/views/ReportsIndex.tsx (FULLY HARDENED & VIEW-SYNCED)

import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Package,
  Truck,
  DollarSign,
  FileSpreadsheet,
  ArrowRight,
  Layers,
} from "lucide-react";
import { REPORT_CONFIGS, getAllCategories } from "@/app/features/admin/reports/configs/reportConfigs";

// ================================================================
// ✅ ICON MAPPING
// ================================================================
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Financial: DollarSign,
  Products: Package,
  Operations: Truck,
  Growth: TrendingUp,
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Financial: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  Products: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  Operations: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  Growth: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
};

// ================================================================
// 🧩 REPORT CARD COMPONENT (Rerouted to correct view path)
// ================================================================
const ReportCard = ({
  slug,
  name,
  description,
  category,
}: {
  slug: string;
  name: string;
  description: string;
  category: string;
}) => {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Financial;

  return (
    <Link
      // ✅ FIX 1: Corrected routing path to match registered custom view slug path (reports-index/:slug)
      href={`/admin/reports-index/${slug}`}
      className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-brand-primary/30 hover:-translate-y-0.5 transition-all duration-300 group no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
              {category}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-150">
            {name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-105 transition-transform duration-200`}>
          <FileText size={16} />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-end">
        <span className="text-[10px] font-semibold text-brand-primary flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
          Open Report <ArrowRight size={12} className="stroke-[2.5px]" />
        </span>
      </div>
    </Link>
  );
};

// ================================================================
// 🏷️ CATEGORY SECTION HEADER
// ================================================================
const CategorySection = ({
  category,
  reports,
}: {
  category: string;
  reports: any[];
}) => {
  const Icon = CATEGORY_ICONS[category] || Layers;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Financial;

  if (reports.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 border ${colors.border} rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon size={14} className="stroke-[2.2px]" />
        </div>
        <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider font-mono">
          {category} Reports
        </h2>
        <span className="text-[9px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded shadow-2xs">
          {reports.length} available
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((report) => (
          <ReportCard key={report.slug} {...report} />
        ))}
      </div>
    </div>
  );
};

// ================================================================
// 🚀 MAIN PAGE VIEW (Server Component)
// ================================================================
interface ReportsIndexViewProps {
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

export default async function ReportsIndexView(props: ReportsIndexViewProps) {
  const searchParams = await props.searchParams;

  // Extract Payload template props
  const i18n = props.i18n || props.initPageResult?.req?.i18n;
  const locale = props.locale || props.initPageResult?.locale;
  const payload = props.payload || props.initPageResult?.req?.payload;
  const user = props.user || props.initPageResult?.req?.user;
  const permissions = props.permissions || props.initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;
  const params = props.params || {};

  // Group reports by category
  const categories = getAllCategories();
  const groupedReports = categories.map((category) => ({
    category,
    reports: Object.values(REPORT_CONFIGS).filter((r) => r.category === category),
  }));

  const totalReports = Object.keys(REPORT_CONFIGS).length;

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
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-10 pb-20 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20 animate-in fade-in duration-300">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1.5 leading-none">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 border border-zinc-200 dark:border-zinc-850 bg-brand-primary/10 text-brand-primary rounded-lg">
                <FileSpreadsheet size={20} className="stroke-[2.2px]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                Reports Gallery
              </h1>
              <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {totalReports} System-wide Audits · Financial · Products · Operations · Growth
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono font-bold border border-zinc-200 dark:border-zinc-800">
              {new Date().toLocaleDateString("en-PK", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* REPORT CARDS BY CATEGORY */}
        <div className="space-y-10">
          {groupedReports.map(({ category, reports }) => (
            <CategorySection key={category} category={category} reports={reports} />
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap font-mono">
            <span>📊 14 Custom Audits Ready</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>📈 Export to Excel / PDF</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🔄 Real-time Server Sync</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🎯 Dynamic Filters & Sort</span>
          </p>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-medium italic">
            Select any dynamic audit card to view multi-variant metrics with interactive charts, tables, and export options.
          </p>
        </div>
      </div>
    </DefaultTemplate>
  );
}