// 📂 src/app/(payload)/admin/views/ProductsList.tsx (NEXT.JS 15 ASYNC PARAMS HARDENED)

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedAdminProductsPayload } from "@/app/features/admin/inventory-cms/actions/payloadProductExplorerActions";
import ProductsClientPage from "@/app/features/admin/inventory-cms/components/payload-products/ProductsClientPage"; 
import ProductsLoadingSkeleton from "@/app/features/admin/inventory-cms/components/payload-products/ProductsLoadingSkeleton"; 

// ================================================================
// 📦 FETCH COMPONENT (Server Component)
// ================================================================
async function ProductsListFetcher({ searchParams }: { searchParams: any }) {
  const page = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.search || "";

  const { products, totalPages } = await getPaginatedAdminProductsPayload({
    page,
    searchTerm,
    limit: 15,
  });

  return (
    <ProductsClientPage initialProducts={products} initialTotalPages={totalPages} />
  );
}

// ================================================================
// 🚀 MAIN VIEW COMPONENT (Server Component)
// ================================================================
export default async function ProductsListView(props: any) {
  // ✅ FIX 1: Next.js 15 Async Resolution for searchParams & params promises
  const searchParams = await props.searchParams;
  const params = await props.params;

  const initPageResult = props.initPageResult || {};
  const req = initPageResult.req || {};

  // Safe Props for Sidebar
  const i18n = props.i18n || req.i18n;
  const locale = props.locale || initPageResult.locale;
  const payload = props.payload || req.payload;
  const user = props.user || req.user;
  const permissions = props.permissions || initPageResult.permissions;
  const visibleEntities = props.visibleEntities || initPageResult.visibleEntities;

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
      {/* ✅ FIX 2: Expanded container width matches system-wide HUD layout (max-w-[1750px]) */}
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-mono leading-none">
              Product Explorer
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
              Search and manage your entire product catalog, variant properties, and stock levels.
            </p>
          </div>
        </div>
        
        {/* SUSPENSE BOUNDARY WITH RESOLVED SEARCH PARAMS KEY */}
        <Suspense key={JSON.stringify(searchParams)} fallback={<ProductsLoadingSkeleton />}>
          <ProductsListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}