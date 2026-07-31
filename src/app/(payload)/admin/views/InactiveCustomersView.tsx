// 📂 src/app/(payload)/admin/views/InactiveCustomersView.tsx

import { Suspense } from "react";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { getInactiveCustomers } from "@/app/features/admin/loyalty-intelligence/actions/getInactiveCustomers";
import InactiveCustomerList from "@/app/features/admin/loyalty-intelligence/components/InactiveCustomerList";

// ================================================================
// 🚀 DATA FETCHER (Server Component)
// ================================================================
async function InactiveCustomersFetcher({ searchParamsPromise }: { searchParamsPromise: any }) {
  const searchParams = await searchParamsPromise;
  const page = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.search || "";
  const segment = searchParams?.segment || "all";

  const data = await getInactiveCustomers({
    page,
    limit: 20,
    segment: segment as any,
    searchTerm,
  });

  return <InactiveCustomerList initialData={data} />;
}

// ================================================================
// 🚀 MAIN VIEW
// ================================================================
export default async function InactiveCustomersView(props: any) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Inactive Customers
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Identify and re-engage customers who haven't purchased recently.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Client Component with Suspense */}
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <InactiveCustomersFetcher searchParamsPromise={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}