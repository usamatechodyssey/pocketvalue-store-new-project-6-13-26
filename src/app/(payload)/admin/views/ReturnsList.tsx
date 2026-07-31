// src/app/(payload)/admin/views/ReturnsList.tsx
import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedReturnRequestsPayload } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import ReturnsClientPage from "@/app/features/admin/order-fulfillment/components/returns/ReturnsClientPage"; 
import ReturnsLoadingSkeleton from "@/app/features/admin/order-fulfillment/components/returns/ReturnsLoadingSkeleton"; 

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

export default async function ReturnsListView(props: any) {
  const { initPageResult, params, searchParams } = props;

  return (
    <DefaultTemplate
      i18n={props.i18n || initPageResult?.req?.i18n}
      locale={props.locale || initPageResult?.locale}
      params={params}
      payload={props.payload || initPageResult?.req?.payload}
      permissions={props.permissions || initPageResult?.permissions}
      searchParams={searchParams}
      user={props.user || initPageResult?.req?.user}
      visibleEntities={props.visibleEntities || initPageResult?.visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Return Requests</h1>
        <Suspense key={JSON.stringify(searchParams)} fallback={<ReturnsLoadingSkeleton />}>
          <ReturnsListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}