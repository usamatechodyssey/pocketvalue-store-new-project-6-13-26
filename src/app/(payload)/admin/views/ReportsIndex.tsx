// 📂 src/app/(payload)/admin/views/ReportsIndex.tsx

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
  Sparkles,
  CheckCircle2,
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

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Financial: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  Products: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  Operations: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  Growth: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
};

// ================================================================
// 🧩 REPORT TABLE ROW COMPONENT
// ================================================================
const ReportTableRow = ({
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
    <tr className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors group">
      {/* Report Name & Description */}
      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
            <FileText size={16} />
          </div>
          <div className="min-w-0">
            <Link 
              href={`/admin/reports-index/${slug}`}
              className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-brand-primary transition-colors no-underline hover:no-underline block"
            >
              {name}
            </Link>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans mt-0.5 truncate max-w-xs sm:max-w-md">
              {description}
            </p>
          </div>
        </div>
      </td>

      {/* Category Pill */}
      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono">
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
          {category}
        </span>
      </td>

      {/* Engine Status */}
      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          RECONCILED
        </span>
      </td>

      {/* Action Button */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
        <Link
          href={`/admin/reports-index/${slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white text-zinc-600 dark:text-zinc-300 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider transition-all no-underline shadow-2xs"
        >
          Open Audit <ArrowRight size={12} className="stroke-[2.5]" />
        </Link>
      </td>
    </tr>
  );
};

// ================================================================
// 🏷️ CATEGORY SECTION TABLE
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
    <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4">
      {/* Category Table Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${colors.bg} ${colors.text}`}>
            <Icon size={16} className="stroke-[2.2px]" />
          </div>
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            {category} Audits
          </h2>
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          {reports.length} REPORTS AVAILABLE
        </span>
      </div>

      {/* High-Density Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-160 border-collapse text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
            <tr className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4">Report Name & Description</th>
              <th className="py-3 px-4 text-center">Category</th>
              <th className="py-3 px-4 text-center">Engine Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {reports.map((report) => (
              <ReportTableRow key={report.slug} {...report} />
            ))}
          </tbody>
        </table>
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
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-10 pb-20 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20 animate-in fade-in duration-300 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1.5 leading-none">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2.5 border border-zinc-200 dark:border-zinc-800 bg-brand-primary/10 text-brand-primary rounded-xl shadow-2xs">
                <FileSpreadsheet size={22} className="stroke-[2.2px]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none font-mono">
                Reports Gallery
              </h1>
              <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-full text-zinc-500 border border-zinc-200 dark:border-zinc-800 uppercase tracking-widest">
                v2.0 RECONCILED
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium font-mono pt-1">
              {totalReports} System-wide Audits · Financial · Products · Operations · Growth
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full font-mono font-bold border border-zinc-200 dark:border-zinc-800">
              {new Date().toLocaleDateString("en-PK", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* REPORT TABLES BY CATEGORY */}
        <div className="space-y-8">
          {groupedReports.map(({ category, reports }) => (
            <CategorySection key={category} category={category} reports={reports} />
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-zinc-100/70 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap font-mono">
            <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-brand-primary" /> 14 Custom Audits Ready</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>📈 Export to Excel / PDF</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🔄 Real-time Server Sync</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🎯 Dynamic Filters & Sort</span>
          </p>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-medium italic font-sans">
            Select any dynamic audit row to view multi-variant metrics with interactive charts, tables, and export options.
          </p>
        </div>
      </div>
    </DefaultTemplate>
  );
}