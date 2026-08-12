// 📂 src/app/(payload)/admin/views/StaffManagementView.tsx (CYBER-HUD HARDENED)

import { DefaultTemplate } from "@payloadcms/next/templates";
import { getStaffMembers } from "@/app/features/admin/staff-management/actions/payloadAdminActions";
import StaffListClient from "@/app/features/admin/staff-management/components/StaffListClient";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function StaffManagementView(props: any) {
  // ✅ FIX: Next.js 15 Async Params Await
  const { initPageResult } = props;
  const params = await props.params;
  const searchParams = await props.searchParams;
  
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
      {/* ✅ FIX: Expanded container width matches system-wide HUD layout (max-w-[1750px]) */}
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-10 pb-20 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
        {/* HEADER */}
        <div className="space-y-2 animate-in fade-in duration-500">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-widest mb-4 no-underline hover:no-underline font-mono"
          >
            <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Hub
          </Link>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter uppercase leading-none flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
                <ShieldCheck size={32} className="text-brand-primary" />
            </div>
            Staff Security
          </h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
            Governance & Administrative Access Control
          </p>
        </div>

        {/* STAFF LIST CONTENT */}
        <div className="min-h-125">
          <StaffListClient initialStaff={staff} />
        </div>
      </div>
    </DefaultTemplate>
  );
}