// 📂 src/app/(payload)/admin/views/CustomerRequestsView.tsx

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getCustomerRequests } from "@/app/features/admin/customer-requests/actions/getCustomerRequests";
import CustomerRequestsClientPage from "@/app/features/admin/customer-requests/components/CustomerRequestsClientPage"; 
import UsersLoadingSkeleton from "@/app/features/admin/inventory-cms/components/payload-users/UsersLoadingSkeleton"; // Reuses standard loader skeleton!

// ================================================================
// 📦 FETCH COMPONENT (Server Component)
// ================================================================
async function CustomerRequestsFetcher({ resolvedSearchParams }: { resolvedSearchParams: any }) {
  const page = Number(resolvedSearchParams?.page) || 1;
  const status = resolvedSearchParams?.status || "all";
  const searchTerm = resolvedSearchParams?.search || "";

  // Fetches strictly from Transactions DB (Cluster A)
  const { requests, totalPages } = await getCustomerRequests({ 
    page, 
    status, 
    searchTerm, 
    limit: 15 
  });

  return <CustomerRequestsClientPage initialRequests={requests} initialTotalPages={totalPages} />;
}

// ================================================================
// 🚀 MAIN VIEW COMPONENT (Server Component)
// ================================================================
export default async function CustomerRequestsView(props: any) {
  // ✅ Next.js 15 Async Resolution for searchParams & params promises
  const searchParams = await props.searchParams;
  const params = await props.params;

  const initPageResult = props.initPageResult || {};
  const req = initPageResult.req || {};

  // Safe Props for Sidebar & Layout
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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20 font-sans">
        
        {/* HEADER PANEL */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-mono leading-none">
              Customer Requests
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
              Verify and approve client restocks, custom sizing variant notifications, and custom product requests.
            </p>
          </div>
        </div>

        {/* SUSPENSE BOUNDARY WITH RESOLVED SEARCH PARAMS KEY */}
        <Suspense key={JSON.stringify(searchParams)} fallback={<UsersLoadingSkeleton />}>
          <CustomerRequestsFetcher resolvedSearchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}