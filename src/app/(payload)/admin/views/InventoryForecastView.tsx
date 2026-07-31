// src/app/(payload)/admin/views/InventoryForecastView.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import { getInventoryForecasterPayload } from '@/app/features/admin/inventory-forecaster/actions/getInventoryForecaster';
import InventoryForecaster from '@/app/features/admin/inventory-forecaster/components/InventoryForecaster';
import PaginationControls from '@/app/shared/components/ui/PaginationControls';
import Link from 'next/link';
import { ArrowLeft, CalendarClock } from 'lucide-react';

export default async function InventoryForecastView(props: any) {
  const { initPageResult, params, searchParams: searchParamsPromise } = props;
  const searchParams = await searchParamsPromise;

  // ✅ 1. Read page from URL
  const page = Number(searchParams?.page) || 1;
  const limit = 15; // Items per page

  // ✅ 2. Fetch paginated forecast data
  const forecastResponse = await getInventoryForecasterPayload({ page, limit });

  // ✅ 3. Extract i18n and other props safely
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const payload = props.payload || initPageResult?.req?.payload;
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
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-8 animate-in fade-in duration-500">
        
        {/* === HEADER / NAVIGATION === */}
        <div className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline transition-all w-fit"
          >
            <ArrowLeft size={16} /> Back to Intelligence Hub
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <CalendarClock className="text-orange-500" size={32} />
                Full Inventory Forecast
              </h1>
              <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">
                Comprehensive list of all inventory predictions based on the current{' '}
                <span className="font-bold text-orange-500">sales velocity</span>.
                Total risky items: <span className="dark:text-white font-bold">{forecastResponse.totalDocs}</span>.
              </p>
            </div>

            <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl hidden md:block">
              <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Full Analysis
              </div>
            </div>
          </div>
        </div>

        {/* === MAIN CONTENT — Full List (Widget Mode Disabled) === */}
        <div className="min-h-100">
          <InventoryForecaster
            response={forecastResponse}
            isWidget={false}
            viewAllLink="/admin/inventory-forecast"
          />
        </div>

        {/* === PAGINATION CONTROLS === */}
        {forecastResponse.totalPages > 1 && (
          <div className="flex justify-center pt-6 border-t dark:border-gray-800">
            <PaginationControls totalPages={forecastResponse.totalPages} />
          </div>
        )}

        {/* === FOOTER INFO === */}
        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-4">
          <p className="text-[10px] text-gray-500 font-medium italic">
            * Predictions based on avg daily sales velocity of last {forecastResponse.windowDays} days.
            {forecastResponse.totalDocs > 0
              ? ` Analyzing ${forecastResponse.totalDocs} risky variants.`
              : ' No risky variants detected.'}
            {forecastResponse.currentPage && forecastResponse.totalPages > 1
              ? ` Showing page ${forecastResponse.currentPage} of ${forecastResponse.totalPages}.`
              : ''}
          </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}