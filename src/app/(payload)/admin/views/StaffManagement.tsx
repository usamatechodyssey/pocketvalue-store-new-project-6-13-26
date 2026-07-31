import { DefaultTemplate } from "@payloadcms/next/templates";
import { getStaffMembers } from "@/app/features/admin/order-fulfillment/actions/payloadAdminActions";
import StaffListClient from "@/app/features/admin/staff-management/components/StaffListClient";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function StaffManagementView(props: any) {
  const { initPageResult, params, searchParams } = props;
  const staff = await getStaffMembers();

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
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-10 pb-20">
        <div className="space-y-2 animate-in fade-in duration-500">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-black text-brand-primary hover:underline uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-4">
            <ShieldCheck size={48} className="text-brand-primary" />
            Staff Security
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-70">
            Governance & Administrative Access Control
          </p>
        </div>

        <div className="min-h-125">
          <StaffListClient initialStaff={staff} />
        </div>
      </div>
    </DefaultTemplate>
  );
}
