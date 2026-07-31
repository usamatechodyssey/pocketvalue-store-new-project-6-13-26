// src/app/(payload)/admin/views/ReturnDetail.tsx

import { DefaultTemplate } from '@payloadcms/next/templates';
import Link from "next/link";
import { ArrowLeft, User, MapPin, Package, Hash, Calendar, Mail, FileText, MessageSquare } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { getSingleReturnRequestPayload } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import UpdateReturnStatus from "@/app/features/admin/order-fulfillment/components/returns/UpdateReturnStatus";
import ReturnDetailsProductCard from "@/app/shared/components/helpers/ReturnDetailsProductCard";

const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
      {icon} {title}
    </h2>
    {children}
  </div>
);

export default async function ReturnDetailView(props: any) {
  const { initPageResult, params: paramsPromise, searchParams } = props;
  const params = await paramsPromise;
  
  const segments = params?.segments || [];
  const returnId = params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

  if (!returnId) return <div className="p-8 text-red-500">Return ID Missing.</div>;

  const request = await getSingleReturnRequestPayload(returnId);
  if (!request) return <div className="p-8 text-gray-500">Return request not found.</div>;

  const customerId = request.userDetails?._id || "";
  const customerName = request.userDetails?.name || "N/A";
  const customerEmail = request.userDetails?.email || "N/A";
  const shippingAddress = request.originalOrder?.shippingAddress;

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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
        <div>
          <Link href="/admin/returns" className="flex items-center gap-2 text-sm font-semibold mb-4 text-brand-primary">
            <ArrowLeft size={16} /> Back to Return Requests
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl font-bold">Return Request Details</h1>
            <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
              <Hash size={14} /> #{request._id.slice(-6).toUpperCase()}
              <CopyButton textToCopy={request._id} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Calendar size={14} /> {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <InfoCard icon={<FileText size={22} />} title="Request Summary">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-semibold">{request.status}</span></div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Original Order:</span>
                    <Link href={`/admin/orders/${request.orderId}`} className="font-semibold text-brand-primary hover:underline">{request.orderNumber}</Link>
                </div>
                {request.resolution && <div className="flex justify-between"><span className="text-gray-500">Resolution:</span><span className="font-semibold">{request.resolution}</span></div>}
              </div>
            </InfoCard>

            <InfoCard icon={<Package size={22} />} title={`Items to Return (${request.items.length})`}>
              <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700 -mt-4">
                {request.items.map((item) => <ReturnDetailsProductCard key={item.variantKey} item={item} />)}
              </div>
            </InfoCard>

            {request.customerComments && (
              <InfoCard icon={<MessageSquare size={22} />} title="Customer Comments">
                <p className="text-sm italic text-gray-600 dark:text-gray-400">&quot;{request.customerComments}&quot;</p>
              </InfoCard>
            )}
          </div>

          <div className="space-y-8 lg:sticky lg:top-24">
            <InfoCard icon={<User size={22} />} title="Customer">
              <div className="font-bold">{customerName}</div>
              <a href={`mailto:${customerEmail}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 mt-1"><Mail size={14} /> {customerEmail}</a>
              {shippingAddress && (
                <div className="mt-4 border-t pt-4 dark:border-gray-700 text-sm">
                  <h3 className="font-semibold flex items-center gap-2 mb-2"><MapPin size={16} /> Shipping Address</h3>
                  {shippingAddress.address}, {shippingAddress.area}<br />{shippingAddress.city}<br />Phone: {shippingAddress.phone}
                </div>
              )}
            </InfoCard>
            <UpdateReturnStatus returnId={request._id} currentStatus={request.status} />
          </div>
        </div>
      </div>
    </DefaultTemplate>
  );
}