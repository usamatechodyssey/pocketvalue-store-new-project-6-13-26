// 📂 src/app/(payload)/admin/views/OrdersList.tsx (NEXT.JS 15 ASYNC PARAMS HARDENED)

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedOrders } from "@/app/features/admin/order-fulfillment/actions/ordersActions";
import OrdersClientPage from "@/app/features/admin/order-fulfillment/components/orders/OrdersClientPage"; 
import OrdersLoadingSkeleton from "@/app/features/admin/order-fulfillment/components/orders/OrdersLoadingSkeleton"; 

// ================================================================
// 📦 FETCH COMPONENT (Server Component)
// ================================================================
async function OrdersListFetcher({ searchParams }: { searchParams: any }) {
  const page = Number(searchParams?.page) || 1;
  const status = searchParams?.status || "all";
  const searchTerm = searchParams?.search || "";

  const { orders, totalPages } = await getPaginatedOrders({ page, status, searchTerm, limit: 15 });
  return <OrdersClientPage initialOrders={orders} initialTotalPages={totalPages} />;
}

// ================================================================
// 🚀 MAIN VIEW COMPONENT (Server Component)
// ================================================================
export default async function OrdersListView(props: any) {
  // ✅ FIX 1: Next.js 15 Async Resolution for searchParams & params promises
  const searchParams = await props.searchParams;
  const params = await props.params;

  // Extract Payload template props
  const initPageResult = props.initPageResult || {};
  const req = initPageResult?.req || {};

  return (
    <DefaultTemplate
      i18n={req.i18n || props.i18n}
      locale={initPageResult.locale || props.locale}
      params={params}
      payload={req.payload || props.payload}
      permissions={initPageResult.permissions || props.permissions}
      searchParams={searchParams}
      user={req.user || props.user}
      visibleEntities={initPageResult.visibleEntities || props.visibleEntities}
    >
      {/* ✅ FIX 2: Expanded container width matches system-wide HUD layout (max-w-[1750px]) */}
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-mono">
              Manage Orders
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Real-time order fulfillment, status state transitions, and bulk courier dispatching.
            </p>
          </div>
        </div>

        {/* SUSPENSE BOUNDARY WITH RESOLVED SEARCH PARAMS KEY */}
        <Suspense key={JSON.stringify(searchParams)} fallback={<OrdersLoadingSkeleton />}>
          <OrdersListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}