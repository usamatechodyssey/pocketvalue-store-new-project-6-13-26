
// ✅ Payload ka Default Layout (Sidebar + Header) Import karein
import { DefaultTemplate } from '@payloadcms/next/templates';
// ✅ Aapka naya Category Import Content Component
import ImportCategoriesContent from "@/app/features/admin/inventory-cms/components/main/ImportCategoriesContent";


// ✅ Payload ki Custom View ke liye component
export default function ImportCategoriesViewComponent(props: any) {
  const { initPageResult, params, searchParams } = props;

  return (
    // ✅ Apne content ko DefaultTemplate ke andar Wrap karein taake Payload ka UI nazar aaye
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
      {/* 'tw-admin-wrapper' class Tailwind v4 ke borders fix ke liye hai */}
      <div className="tw-admin-wrapper p-4 md:p-8">
        <ImportCategoriesContent />
      </div>
    </DefaultTemplate>
  );
}