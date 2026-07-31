
// ✅ 1. Payload ka Default Layout (Sidebar + Header) Import karein
import { DefaultTemplate } from '@payloadcms/next/templates';
import ImportProductsContent from "@/app/features/admin/inventory-cms/components/main/ImportProductsContent";

// ✅ 2. Props receive karein jo Payload automatically is view ko bhejta hai
export default function ImportProductsViewComponent(props: any) {
  const { initPageResult, params, searchParams } = props;

  return (
    // ✅ 3. Apne content ko DefaultTemplate ke andar Wrap karein
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
      {/* Aapka styling wala wrapper aur original content */}
      <div className="tw-admin-wrapper p-4 md:p-8">
        <ImportProductsContent />
      </div>
    </DefaultTemplate>
  );
}