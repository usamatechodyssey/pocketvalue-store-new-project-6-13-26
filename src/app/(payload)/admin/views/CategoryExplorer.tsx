// src/app/(payload)/admin/views/CategoryExplorer.tsx
import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedAdminCategoriesPayload } from "@/app/features/admin/inventory-cms/actions/payloadCategoryAdminActions";
import CategoryExplorerClientPage from "@/app/features/admin/inventory-cms/components/categories/CategoryExplorerClientPage";
import CategoryExplorerLoadingSkeleton from "@/app/features/admin/inventory-cms/components/categories/CategoryExplorerLoadingSkeleton";

export default async function CategoryExplorerView(props: any) {
  const { initPageResult, params, searchParams } = props;

  // Safe Props for Dashboard Consistency
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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Category Explorer</h1>
            <p className="text-sm text-gray-500">Hierarchy & product link audit.</p>
        </div>
        
        <Suspense key={JSON.stringify(searchParams)} fallback={<CategoryExplorerLoadingSkeleton />}>
          <CategoryExplorerFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}

// Separate component for data fetching to enable Suspense
async function CategoryExplorerFetcher({ searchParams }: { searchParams: any }) {
    const page = Number(searchParams?.page) || 1;
    const searchTerm = searchParams?.search || "";

    const { categories, totalPages } = await getPaginatedAdminCategoriesPayload({
        page,
        searchTerm,
        limit: 20,
    });

    return <CategoryExplorerClientPage initialCategories={categories} initialTotalPages={totalPages} />;
}