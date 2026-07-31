import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedOrders } from "@/app/features/admin/order-fulfillment/actions/ordersActions";
import OrdersClientPage from "@/app/features/admin/order-fulfillment/components/orders/OrdersClientPage"; 
import OrdersLoadingSkeleton from "@/app/features/admin/order-fulfillment/components/orders/OrdersLoadingSkeleton"; 

async function OrdersListFetcher({ searchParams }: { searchParams: any }) {
  const page = Number(searchParams?.page) || 1;
  const status = searchParams?.status || "all";
  const searchTerm = searchParams?.search || "";

  const { orders, totalPages } = await getPaginatedOrders({ page, status, searchTerm, limit: 15 });
  return <OrdersClientPage initialOrders={orders} initialTotalPages={totalPages} />;
}

export default async function OrdersListView(props: any) {
  // ✅ Extract resolved data from Payload's initPageResult
  const { initPageResult, params, searchParams } = props;

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Orders</h1>
        <Suspense key={JSON.stringify(searchParams)} fallback={<OrdersLoadingSkeleton />}>
          <OrdersListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}