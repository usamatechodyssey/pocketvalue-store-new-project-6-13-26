import { Suspense } from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { getPaginatedAdminProductsPayload } from "@/app/features/admin/inventory-cms/actions/payloadProductExplorerActions";
import ProductsClientPage from "@/app/features/admin/inventory-cms/components/payload-products/ProductsClientPage"; 
import ProductsLoadingSkeleton from "@/app/features/admin/inventory-cms/components/payload-products/ProductsLoadingSkeleton"; 

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

export default async function ProductsListView(props: any) {
  const { initPageResult, params, searchParams } = props;

  // Safe Props for Sidebar
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Explorer</h1>
            <p className="text-sm text-gray-500">Quick lookup for variants and stock.</p>
        </div>
        
        <Suspense key={JSON.stringify(searchParams)} fallback={<ProductsLoadingSkeleton />}>
          <ProductsListFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </DefaultTemplate>
  );
}