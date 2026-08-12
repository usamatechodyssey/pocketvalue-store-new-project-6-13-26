// 📂 src/app/(payload)/admin/views/OrderDetail.tsx (CYBER-HUD HARDENED & EN-PK LOCALIZED)

import { DefaultTemplate } from "@payloadcms/next/templates";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Package,
  Hash,
  Calendar,
  Mail,
  ShoppingCart,
} from "lucide-react";

// ✅ PAYLOAD Native Queries
import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";

// ✅ ORDER FULFILLMENT COMPONENTS
import CopyButton from "@/app/features/admin/order-fulfillment/components/orders/CopyButton";
import UpdateOrderStatus from "@/app/features/admin/order-fulfillment/components/orders/UpdateOrderStatus";
import SendEmailModal from "@/app/features/admin/order-fulfillment/components/orders/SendEmailModal";
import StatusTimeline from "@/app/features/admin/order-fulfillment/components/orders/StatusTimeline";
import OrderDetailsProductCard from "@/app/features/admin/order-fulfillment/components/orders/OrderDetailsProductCard";
import ShipmentManager from "@/app/features/admin/order-fulfillment/components/orders/ShipmentManager";
import { getSingleOrder } from "@/app/features/admin/order-fulfillment/actions/ordersActions";
import UpdatePaymentStatus from "@/app/features/admin/order-fulfillment/components/orders/UpdatePaymentStatus";

// Reusable Cyber-HUD InfoCard
const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
    <h2 className="text-xs font-bold uppercase tracking-wider font-mono mb-4 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5">
      {icon} {title}
    </h2>
    {children}
  </div>
);

export default async function OrderDetailView(props: any) {
  // Extract data from Payload props
  const {
    initPageResult,
    params: paramsPromise,
    searchParams: searchParamsPromise,
  } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // Smart ID Extraction for Root Views
  const segments = params?.segments || [];
  const orderId =
    params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

  // Safe props mapping for DefaultTemplate
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const payload = props.payload || initPageResult?.req?.payload;
  const user = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities =
    props.visibleEntities || initPageResult?.visibleEntities;

  // Error handling for missing ID
  if (!orderId || orderId === "orders") {
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
          Error: Order ID not found in URL segments.
        </div>
      </DefaultTemplate>
    );
  }

  // 1. Fetch Order from MongoDB
  const order = await getSingleOrder(orderId);
  if (!order) {
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
          Order "{orderId}" not found in database.
        </div>
      </DefaultTemplate>
    );
  }

  // 2. Fetch Live Stock Status from Payload
  const productIdsInOrder = order.products.map((p: any) => p._id);
  const stockStatuses = await getPayloadProductsStockStatus(productIdsInOrder);
  const stockMap = new Map(stockStatuses.map((s: any) => [s._id, s]));

  // 3. Mapping data for UI
  const orderUser = order.userId as any;
  const customerId = orderUser?._id?.toString() || order.userId;
  const customerName = orderUser?.name || order.shippingAddress.fullName;
  const customerEmail = orderUser?.email || order.shippingAddress.email;

  const subtotal = order.subtotal;
  const shippingCost = order.shippingCost;

  // 4. Products mapping for ShipmentManager
  const shipmentProducts = order.products.map((p: any) => ({
    productId: p.productId || p._id,
    variantKey: p.variant?._key || "default",
    name: p.name,
    quantity: p.quantity,
  }));

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
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-all no-underline hover:no-underline"
          >
            <ArrowLeft size={13} className="stroke-[2.5px]" /> Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
              Order Details
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-2xs">
              <Hash size={13} className="text-zinc-400" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {order.orderId}
              </span>
              <CopyButton textToCopy={order.orderId} />
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-2 pt-1">
            <Calendar size={13} />
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
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
          {/* LEFT COLUMN: Summary, Products, Shipments & Status */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Order Summary */}
            <InfoCard
              icon={<ShoppingCart size={18} className="text-brand-primary" />}
              title="Order Summary"
            >
              <StatusTimeline status={order.status} />
            </InfoCard>

            {/* Products List */}
            <InfoCard
              icon={<Package size={18} className="text-brand-primary" />}
              title={`Products (${order.products.length})`}
            >
              <div className="space-y-2 divide-y divide-zinc-100 dark:divide-zinc-850 -mt-2">
                {order.products.map((p: any) => (
                  <OrderDetailsProductCard
                    key={p.cartItemId}
                    product={p}
                    stockInfo={stockMap.get(p._id)}
                  />
                ))}
              </div>
            </InfoCard>

            {/* Shipment Manager (Partial Fulfillment) */}
            <ShipmentManager
              orderId={order._id.toString()}
              orderProducts={shipmentProducts}
            />

            {/* Update Order Status */}
            <UpdateOrderStatus
              orderId={order._id.toString()}
              currentStatus={order.status}
            />
          </div>

          {/* RIGHT COLUMN: Customer & Payment */}
          <div className="space-y-6 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Customer Section */}
            <InfoCard
              icon={<User size={18} className="text-brand-primary" />}
              title="Customer"
            >
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {customerName}
              </div>
              <a
                href={`mailto:${customerEmail}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-1 no-underline font-mono"
              >
                <Mail size={13} /> {customerEmail}
              </a>
              <div className="mt-4 border-t border-zinc-150 dark:border-zinc-850 pt-4">
                <h3 className="font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider font-mono text-zinc-700 dark:text-zinc-300">
                  <MapPin size={14} className="text-brand-primary" /> Shipping Address
                </h3>
                <address className="text-xs not-italic text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  {order.shippingAddress.address}, {order.shippingAddress.area}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                  <br />
                  <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    Phone: {order.shippingAddress.phone}
                  </span>
                </address>
              </div>
              <div className="mt-4 border-t border-zinc-150 dark:border-zinc-850 pt-4">
                <SendEmailModal
                  customerId={customerId}
                  customerName={customerName}
                />
              </div>
            </InfoCard>

            {/* Payment Section */}
            <InfoCard
              icon={<CreditCard size={18} className="text-brand-primary" />}
              title="Payment"
            >
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Method:</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
                  <span
                    className={`font-bold font-mono px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* Interactive Payment Status Settlement Button */}
                <UpdatePaymentStatus
                  orderId={order._id.toString()}
                  currentPaymentStatus={order.paymentStatus}
                />

                <div className="border-t border-zinc-150 dark:border-zinc-850 pt-3 mt-3 space-y-2.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Subtotal:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Rs. {subtotal.toLocaleString("en-PK")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Shipping:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {shippingCost === 0
                        ? "FREE"
                        : `Rs. ${shippingCost.toLocaleString("en-PK")}`}
                    </span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount ({order.coupon.code}):</span>
                      <span>- Rs. {order.coupon.amount.toLocaleString("en-PK")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-lg pt-2 border-t border-zinc-150 dark:border-zinc-850 text-zinc-900 dark:text-zinc-50">
                    <span>Grand Total:</span>
                    <span>Rs. {order.totalPrice.toLocaleString("en-PK")}</span>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </DefaultTemplate>
  );
}