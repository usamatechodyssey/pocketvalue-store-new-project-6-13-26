
// src/app/(payload)/admin/views/UsersList.tsx

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
// ✅ NEW: Mapped to the new decoupled customer actions helper
import { getPaginatedUsersPayload } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";
import UsersClientPage from "@/app/features/admin/inventory-cms/components/payload-users/UsersClientPage"; 
import UsersLoadingSkeleton from "@/app/features/admin/inventory-cms/components/payload-users/UsersLoadingSkeleton"; 

async function UsersFetcher({ searchParamsPromise }: { searchParamsPromise: any }) {
  const searchParams = await searchParamsPromise;
  const page = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.search || "";

  const { users, totalPages } = await getPaginatedUsersPayload({ page, searchTerm });
  return <UsersClientPage initialUsers={users} initialTotalPages={totalPages} />;
}

export default async function UsersListView(props: any) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
        <Suspense key={JSON.stringify(searchParams)} fallback={<UsersLoadingSkeleton />}>
          <UsersFetcher searchParamsPromise={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}