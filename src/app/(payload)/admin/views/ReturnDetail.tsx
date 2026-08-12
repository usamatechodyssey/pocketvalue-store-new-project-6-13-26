// 📂 src/app/(payload)/admin/views/ReturnDetail.tsx (CYBER-HUD HARDENED & NEXT.JS 15 READY)

import { DefaultTemplate } from '@payloadcms/next/templates';
import Link from "next/link";
import { ArrowLeft, User, MapPin, Package, Hash, Calendar, Mail, FileText, MessageSquare } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { getSingleReturnRequestPayload } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import UpdateReturnStatus from "@/app/features/admin/order-fulfillment/components/returns/UpdateReturnStatus";
import ReturnDetailsProductCard from "@/app/shared/components/helpers/ReturnDetailsProductCard";

// Reusable Cyber-HUD InfoCard
const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
    <h2 className="text-xs font-bold uppercase tracking-wider font-mono mb-4 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
      {icon} {title}
    </h2>
    {children}
  </div>
);

export default async function ReturnDetailView(props: any) {
  // ✅ FIX 1: Next.js 15 Async Resolution for searchParams & params promises
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  
  const segments = params?.segments || [];
  const returnId = params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

  // Safe props mapping for DefaultTemplate
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const payload = props.payload || initPageResult?.req?.payload;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  if (!returnId) {
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
        <div className="p-8 text-red-500 font-bold font-mono text-center text-xs">
          Return ID Missing from URL segments.
        </div>
      </DefaultTemplate>
    );
  }

  const request = await getSingleReturnRequestPayload(returnId);
  if (!request) {
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
        <div className="p-8 text-zinc-500 font-medium font-mono text-center text-xs">
          Return request "{returnId}" not found in database.
        </div>
      </DefaultTemplate>
    );
  }

  const customerName = request.userDetails?.name || "N/A";
  const customerEmail = request.userDetails?.email || "N/A";
  const shippingAddress = request.originalOrder?.shippingAddress;

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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        {/* PAGE HEADER */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-2">
          <Link 
            href="/admin/returns" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-all no-underline hover:no-underline"
          >
            <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Return Requests
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
              Return Request Details
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-2xs">
              <Hash size={13} className="text-zinc-400" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                #{request._id.slice(-6).toUpperCase()}
              </span>
              <CopyButton textToCopy={request._id} />
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-2 pt-1">
            <Calendar size={13} /> 
            {new Date(request.createdAt).toLocaleString("en-PK", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN: Summary, Items & Customer Comments */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Request Summary */}
            <InfoCard icon={<FileText size={18} className="text-brand-primary" />} title="Request Summary">
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{request.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Original Order:</span>
                  <Link 
                    href={`/admin/orders/${request.orderId}`} 
                    className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
                  >
                    {request.orderNumber}
                  </Link>
                </div>
                {request.resolution && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400">Resolution:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{request.resolution}</span>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* RMA Items List */}
            <InfoCard icon={<Package size={18} className="text-brand-primary" />} title={`Items to Return (${request.items.length})`}>
              <div className="space-y-2 divide-y divide-zinc-100 dark:divide-zinc-850 -mt-2">
                {request.items.map((item) => (
                  <ReturnDetailsProductCard key={item.variantKey} item={item} />
                ))}
              </div>
            </InfoCard>

            {/* Customer Comments */}
            {request.customerComments && (
              <InfoCard icon={<MessageSquare size={18} className="text-brand-primary" />} title="Customer Comments">
                <p className="text-xs italic text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  &quot;{request.customerComments}&quot;
                </p>
              </InfoCard>
            )}
          </div>

          {/* RIGHT COLUMN: Customer Details & Update Status Panel */}
          <div className="space-y-6 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-300">
            <InfoCard icon={<User size={18} className="text-brand-primary" />} title="Customer">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{customerName}</div>
              <a 
                href={`mailto:${customerEmail}`} 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-1 no-underline font-mono"
              >
                <Mail size={13} /> {customerEmail}
              </a>
              {shippingAddress && (
                <div className="mt-4 border-t border-zinc-150 dark:border-zinc-850 pt-4">
                  <h3 className="font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider font-mono text-zinc-700 dark:text-zinc-300">
                    <MapPin size={14} className="text-brand-primary" /> Shipping Address
                  </h3>
                  <address className="text-xs not-italic text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {shippingAddress.address}, {shippingAddress.area}<br />
                    {shippingAddress.city}, {shippingAddress.province}<br />
                    <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      Phone: {shippingAddress.phone}
                    </span>
                  </address>
                </div>
              )}
            </InfoCard>

            {/* Update Return Status Form Panel */}
            <UpdateReturnStatus returnId={request._id} currentStatus={request.status} />
          </div>
        </div>
      </div>
    </DefaultTemplate>
  );
}