// 📂 src/app/(payload)/admin/views/SegmentBuilderView.tsx

import { DefaultTemplate } from "@payloadcms/next/templates";
import SegmentBuilderUI from "@/app/features/admin/loyalty-intelligence/components/SegmentBuilderUI";

interface SegmentBuilderViewProps {
  initPageResult?: any;
  params?: any;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  payload?: any;
  i18n?: any;
  locale?: any;
  user?: any;
  permissions?: any;
  visibleEntities?: any;
}

export default async function SegmentBuilderView(props: SegmentBuilderViewProps) {
  const searchParams = await props.searchParams;
  const segmentId = searchParams?.id as string | undefined;

  // Extract Payload template props
  const i18n = props.i18n || props.initPageResult?.req?.i18n;
  const locale = props.locale || props.initPageResult?.locale;
  const payload = props.payload || props.initPageResult?.req?.payload;
  const user = props.user || props.initPageResult?.req?.user;
  const permissions = props.permissions || props.initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || props.initPageResult?.visibleEntities;
  const params = props.params || {};

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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Segment Builder
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create and manage dynamic customer segments for targeted marketing campaigns.
            </p>
          </div>
          {segmentId && (
            <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 border border-zinc-200 dark:border-zinc-700">
              Editing: {segmentId}
            </span>
          )}
        </div>

        {/* Main UI */}
        <SegmentBuilderUI initialSegmentId={segmentId} />
      </div>
    </DefaultTemplate>
  );
}