// 📂 src/app/(payload)/admin/views/UsersList.tsx (NEXT.JS 15 ASYNC PARAMS HARDENED)

import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedUsersPayload } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";
import UsersClientPage from "@/app/features/admin/inventory-cms/components/payload-users/UsersClientPage"; 
import UsersLoadingSkeleton from "@/app/features/admin/inventory-cms/components/payload-users/UsersLoadingSkeleton"; 

// ================================================================
// 📦 FETCH COMPONENT (Server Component)
// ================================================================
async function UsersFetcher({ resolvedSearchParams }: { resolvedSearchParams: any }) {
  const page = Number(resolvedSearchParams?.page) || 1;
  const searchTerm = resolvedSearchParams?.search || "";

  const { users, totalPages } = await getPaginatedUsersPayload({ page, searchTerm, limit: 15 });
  return <UsersClientPage initialUsers={users} initialTotalPages={totalPages} />;
}

// ================================================================
// 🚀 MAIN VIEW COMPONENT (Server Component)
// ================================================================
export default async function UsersListView(props: any) {
  // ✅ FIX 2: Next.js 15 Async Resolution for searchParams & params promises
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
      {/* ✅ FIX 3: Expanded container width matches system-wide HUD layout (max-w-[1750px]) */}
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase font-mono leading-none">
              Customers Management
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
              Search and manage customer profiles, verified metrics, and lifetime spend histories.
            </p>
          </div>
        </div>

        {/* SUSPENSE BOUNDARY WITH RESOLVED SEARCH PARAMS KEY */}
        <Suspense key={JSON.stringify(searchParams)} fallback={<UsersLoadingSkeleton />}>
          <UsersFetcher resolvedSearchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}