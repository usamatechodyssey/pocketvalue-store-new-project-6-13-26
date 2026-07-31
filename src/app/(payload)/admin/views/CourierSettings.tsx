// src/app/(payload)/admin/views/CourierSettings.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import CourierSettingsContent from "@/app/features/admin/inventory-cms/components/main/CourierSettingsContent";

export default function CourierSettingsViewComponent(props: any) {
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
      <div className="tw-admin-wrapper p-4 md:p-8">
        <CourierSettingsContent />
      </div>
    </DefaultTemplate>
  );
}