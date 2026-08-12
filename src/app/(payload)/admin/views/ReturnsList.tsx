// 📂 src/app/(payload)/admin/views/ReturnsList.tsx (NEXT.JS 15 ASYNC PARAMS HARDENED)

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedReturnRequestsPayload } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import ReturnsClientPage from "@/app/features/admin/order-fulfillment/components/returns/ReturnsClientPage"; 
import ReturnsLoadingSkeleton from "@/app/features/admin/order-fulfillment/components/returns/ReturnsLoadingSkeleton"; 

// ================================================================
// 📦 FETCH COMPONENT (Server Component)
// ================================================================
async function ReturnsListFetcher({ searchParams }: { searchParams: any }) {
  const page = Number(searchParams?.page) || 1;
  const status = searchParams?.status || "All";
  const searchTerm = searchParams?.search || "";

  const { requests, totalPages } = await getPaginatedReturnRequestsPayload({
    page,
    status,
    searchTerm,
    limit: 15,
  });

  return <ReturnsClientPage initialRequests={requests} initialTotalPages={totalPages} />;
}

// ================================================================
// 🚀 MAIN VIEW COMPONENT (Server Component)
// ================================================================
export default async function ReturnsListView(props: any) {
  // ✅ FIX 1: Next.js 15 Async Resolution for searchParams & params promises
  const searchParams = await props.searchParams;
  const params = await props.params;

  // Extract Payload template props
  const initPageResult = props.initPageResult || {};
  const req = initPageResult?.req || {};

  return (
    <DefaultTemplate
      i18n={props.i18n || req.i18n}
      locale={props.locale || initPageResult?.locale}
      params={params}
      payload={props.payload || req.payload}
      permissions={props.permissions || initPageResult?.permissions}
      searchParams={searchParams}
      user={props.user || req.user}
      visibleEntities={props.visibleEntities || initPageResult?.visibleEntities}
    >
      {/* ✅ FIX 2: Expanded container width matches system-wide HUD layout (max-w-[1750px]) */}
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-mono">
              Return Requests (RMA)
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Manage customer return requests, store credit vouchers, and stock auto-restocking workflows.
            </p>
          </div>
        </div>

        {/* SUSPENSE BOUNDARY WITH RESOLVED SEARCH PARAMS KEY */}
        <Suspense key={JSON.stringify(searchParams)} fallback={<ReturnsLoadingSkeleton />}>
          <ReturnsListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}