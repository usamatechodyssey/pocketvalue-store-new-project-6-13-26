
// src/app/(payload)/admin/views/InventoryRiskList.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedInventoryRisk } from "@/app/features/admin/inventory-cms/actions/payloadInventoryActions";
import InventoryRiskContent from "@/app/features/admin/inventory-cms/components/InventoryRiskContent"; 
// ✅ UPDATED IMPORT: Pointing to ui/PaginationControls
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';

export default async function InventoryRiskListView(props: any) {
  const { initPageResult, params, searchParams: searchParamsPromise } = props;
  
  const searchParams = await searchParamsPromise;
  const page = Number(searchParams?.page) || 1;

  const { items, totalPages, activeThreshold, totalDocs } = await getPaginatedInventoryRisk({ 
    page, 
    limit: 15 
  });

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
        
        <div className="flex flex-col gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline transition-all w-fit">
                <ArrowLeft size={16}/> Back to Intelligence Hub
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <Box className="text-red-500" size={32} />
                        Inventory Risk Audit
                    </h1>
                    <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">
                        Precision audit of variants currently under the 
                        <span className="text-red-500 font-bold mx-1">{activeThreshold} unit threshold</span>.
                        Total critical items detected: <span className="dark:text-white font-bold">{totalDocs}</span>.
                    </p>
                </div>

                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl hidden md:block">
                    <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Risk Scan Active
                    </div>
                </div>
            </div>
        </div>

        <div className="min-h-100">
            <InventoryRiskContent data={items} lowStockThreshold={activeThreshold} />
        </div>

        {totalPages > 1 && (
            <div className="flex justify-center pt-6 border-t dark:border-gray-800">
                {/* ✅ RESOLVED: URL-driven pagination controls replace old custom triggers */}
                <PaginationControls totalPages={totalPages} />
            </div>
        )}

        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center gap-4">
            <p className="text-[10px] text-gray-500 font-medium italic">
                * This list updates in real-time as stock is replenished in the Products collection. 
                Threshold is synced with your Global Settings.
            </p>
        </div>

      </div>
    </DefaultTemplate>
  );
}