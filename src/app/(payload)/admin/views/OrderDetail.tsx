// // src/app/(payload)/admin/views/OrderDetail.tsx

// import { DefaultTemplate } from "@payloadcms/next/templates";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   User,
//   MapPin,
//   CreditCard,
//   Package,
//   Hash,
//   Calendar,
//   Mail,
//   ShoppingCart,
// } from "lucide-react";

// // ✅ PAYLOAD Native Queries
// import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";

// // ✅ NAYE PAYLOAD-ORDERS COMPONENTS
// import CopyButton from "@/app/features/admin/order-fulfillment/components/orders/CopyButton";
// import UpdateOrderStatus from "@/app/features/admin/order-fulfillment/components/orders/UpdateOrderStatus";
// import SendEmailModal from "@/app/features/admin/order-fulfillment/components/orders/SendEmailModal";
// import StatusTimeline from "@/app/features/admin/order-fulfillment/components/orders/StatusTimeline";
// import OrderDetailsProductCard from "@/app/features/admin/order-fulfillment/components/orders/OrderDetailsProductCard";
// // ✅ NEW: Shipment Manager Component
// import ShipmentManager from "@/app/features/admin/order-fulfillment/components/orders/ShipmentManager";
// import { getSingleOrder } from "@/app/features/admin/order-fulfillment/actions/ordersActions";

// // Reusable InfoCard for the Detail View
// const InfoCard = ({ icon, title, children }: any) => (
//   <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
//     <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
//       {icon} {title}
//     </h2>
//     {children}
//   </div>
// );

// export default async function OrderDetailView(props: any) {
//   // Extract data from Payload props
//   const {
//     initPageResult,
//     params: paramsPromise,
//     searchParams: searchParamsPromise,
//   } = props;
//   const params = await paramsPromise;
//   const searchParams = await searchParamsPromise;

//   // Smart ID Extraction for Root Views
//   const segments = params?.segments || [];
//   const orderId =
//     params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

//   // Safe props mapping for DefaultTemplate (Sidebar/Header)
//   const i18n = props.i18n || initPageResult?.req?.i18n;
//   const locale = props.locale || initPageResult?.locale;
//   const payload = props.payload || initPageResult?.req?.payload;
//   const user = props.user || initPageResult?.req?.user;
//   const permissions = props.permissions || initPageResult?.permissions;
//   const visibleEntities =
//     props.visibleEntities || initPageResult?.visibleEntities;

//   // Error handling for missing ID
//   if (!orderId || orderId === "orders") {
//     return (
//       <DefaultTemplate
//         i18n={i18n}
//         locale={locale}
//         params={params}
//         payload={payload}
//         permissions={permissions}
//         searchParams={searchParams}
//         user={user}
//         visibleEntities={visibleEntities}
//       >
//         <div className="p-8 text-red-500 font-bold text-center">
//           Error: Order ID not found in URL segments.
//         </div>
//       </DefaultTemplate>
//     );
//   }

//   // 1. Fetch Order from MongoDB
//   const order = await getSingleOrder(orderId);
//   if (!order) {
//     return (
//       <DefaultTemplate
//         i18n={i18n}
//         locale={locale}
//         params={params}
//         payload={payload}
//         permissions={permissions}
//         searchParams={searchParams}
//         user={user}
//         visibleEntities={visibleEntities}
//       >
//         <div className="p-8 text-gray-500 font-medium text-center">
//           Order "{orderId}" not found in database.
//         </div>
//       </DefaultTemplate>
//     );
//   }

//   // 2. Fetch Live Stock Status from Payload
//   const productIdsInOrder = order.products.map((p: any) => p._id);
//   const stockStatuses = await getPayloadProductsStockStatus(productIdsInOrder);
//   const stockMap = new Map(stockStatuses.map((s: any) => [s._id, s]));

//   // 3. Mapping data for UI
//   const orderUser = order.userId as any;
//   const customerId = orderUser?._id?.toString() || order.userId;
//   const customerName = orderUser?.name || order.shippingAddress.fullName;
//   const customerEmail = orderUser?.email || order.shippingAddress.email;

//   const subtotal = order.subtotal;
//   const shippingCost = order.shippingCost;

//   // 4. Products mapping for ShipmentManager
//   const shipmentProducts = order.products.map((p: any) => ({
//     productId: p.productId || p._id,
//     variantKey: p.variant?._key || "default",
//     name: p.name,
//     quantity: p.quantity,
//   }));

//   return (
//     <DefaultTemplate
//       i18n={i18n}
//       locale={locale}
//       params={params}
//       payload={payload}
//       permissions={permissions}
//       searchParams={searchParams}
//       user={user}
//       visibleEntities={visibleEntities}
//     >
//       <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
//         {/* PAGE HEADER */}
//         <div className="animate-in fade-in slide-in-from-top-4 duration-500">
//           <Link
//             href="/admin/orders"
//             className="flex items-center gap-2 text-sm font-semibold mb-4 text-brand-primary hover:underline transition-all"
//           >
//             <ArrowLeft size={16} /> Back to Orders
//           </Link>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
//               Order Details
//             </h1>
//             <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
//               <Hash size={14} className="text-gray-400" />
//               <span className="font-bold text-gray-800 dark:text-gray-200">
//                 {order.orderId}
//               </span>
//               <CopyButton textToCopy={order.orderId} />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
//             <Calendar size={14} />
//             {new Date(order.createdAt).toLocaleString("en-US", {
//               dateStyle: "long",
//               timeStyle: "short",
//             })}
//           </p>
//         </div>

//         {/* MAIN LAYOUT GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
//           {/* LEFT COLUMN: Summary, Products, Shipments & Status */}
//           <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
//             {/* Order Summary */}
//             <InfoCard
//               icon={<ShoppingCart size={22} className="text-brand-primary" />}
//               title="Order Summary"
//             >
//               <StatusTimeline status={order.status} />
//             </InfoCard>

//             {/* Products List */}
//             <InfoCard
//               icon={<Package size={22} className="text-brand-primary" />}
//               title={`Products (${order.products.length})`}
//             >
//               <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700 -mt-4">
//                 {order.products.map((p: any) => (
//                   <OrderDetailsProductCard
//                     key={p.cartItemId}
//                     product={p}
//                     stockInfo={stockMap.get(p._id)}
//                   />
//                 ))}
//               </div>
//             </InfoCard>

//             {/* ✅ NEW: Shipment Manager (Partial Fulfillment) */}
//             <ShipmentManager
//               orderId={order._id.toString()}
//               orderProducts={shipmentProducts}
//             />

//             {/* Update Order Status */}
//             <UpdateOrderStatus
//               orderId={order._id.toString()}
//               currentStatus={order.status}
//             />
//           </div>

//           {/* RIGHT COLUMN: Customer & Payment */}
//           <div className="space-y-8 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700">
//             {/* Customer Section */}
//             <InfoCard
//               icon={<User size={22} className="text-brand-primary" />}
//               title="Customer"
//             >
//               <div className="font-bold text-lg text-gray-900 dark:text-white">
//                 {customerName}
//               </div>
//               <a
//                 href={`mailto:${customerEmail}`}
//                 className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 mt-1"
//               >
//                 <Mail size={14} /> {customerEmail}
//               </a>
//               <div className="mt-4 border-t pt-4 dark:border-gray-700">
//                 <h3 className="font-semibold flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
//                   <MapPin size={16} /> Shipping Address
//                 </h3>
//                 <address className="text-sm not-italic text-gray-600 dark:text-gray-300 leading-relaxed">
//                   {order.shippingAddress.address}, {order.shippingAddress.area}
//                   <br />
//                   {order.shippingAddress.city}, {order.shippingAddress.province}
//                   <br />
//                   <span className="font-bold">
//                     Phone: {order.shippingAddress.phone}
//                   </span>
//                 </address>
//               </div>
//               <div className="mt-6 border-t pt-4 dark:border-gray-700">
//                 <SendEmailModal
//                   customerId={customerId}
//                   customerName={customerName}
//                 />
//               </div>
//             </InfoCard>

//             {/* Payment Section */}
//             <InfoCard
//               icon={<CreditCard size={22} className="text-brand-primary" />}
//               title="Payment"
//             >
//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Method:</span>
//                   <span className="font-semibold dark:text-gray-200 uppercase">
//                     {order.paymentMethod}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Status:</span>
//                   <span
//                     className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
//                       order.paymentStatus === "Paid"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-orange-100 text-orange-700"
//                     }`}
//                   >
//                     {order.paymentStatus}
//                   </span>
//                 </div>
//                 <div className="border-t pt-3 mt-3 space-y-3 dark:border-gray-700">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Subtotal:</span>
//                     <span className="font-medium dark:text-gray-200">
//                       Rs. {subtotal.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Shipping:</span>
//                     <span className="font-medium dark:text-gray-200">
//                       {shippingCost === 0
//                         ? "FREE"
//                         : `Rs. ${shippingCost.toLocaleString()}`}
//                     </span>
//                   </div>
//                   {order.coupon && (
//                     <div className="flex justify-between text-green-600 font-medium">
//                       <span>Discount ({order.coupon.code}):</span>
//                       <span>- Rs. {order.coupon.amount.toLocaleString()}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between font-bold text-xl pt-2 border-t dark:border-gray-700 text-gray-900 dark:text-white">
//                     <span>Grand Total:</span>
//                     <span>Rs. {order.totalPrice.toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </InfoCard>
//           </div>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
// 📂 src/app/(payload)/admin/views/OrderDetail.tsx (UPDATED WITH INTERACTIVE PAYMENT SETTLEMENT BUTTON)

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

// ✅ NAYE PAYLOAD-ORDERS COMPONENTS
import CopyButton from "@/app/features/admin/order-fulfillment/components/orders/CopyButton";
import UpdateOrderStatus from "@/app/features/admin/order-fulfillment/components/orders/UpdateOrderStatus";
import SendEmailModal from "@/app/features/admin/order-fulfillment/components/orders/SendEmailModal";
import StatusTimeline from "@/app/features/admin/order-fulfillment/components/orders/StatusTimeline";
import OrderDetailsProductCard from "@/app/features/admin/order-fulfillment/components/orders/OrderDetailsProductCard";
import ShipmentManager from "@/app/features/admin/order-fulfillment/components/orders/ShipmentManager";
import { getSingleOrder } from "@/app/features/admin/order-fulfillment/actions/ordersActions";

// ✅ NEW: Payment Status Settlement Button Component
import UpdatePaymentStatus from "@/app/features/admin/order-fulfillment/components/orders/UpdatePaymentStatus";

// Reusable InfoCard for the Detail View
const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
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

  // Safe props mapping for DefaultTemplate (Sidebar/Header)
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
        <div className="p-8 text-red-500 font-bold text-center">
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
        <div className="p-8 text-gray-500 font-medium text-center">
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
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6">
        {/* PAGE HEADER */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-sm font-semibold mb-4 text-brand-primary hover:underline transition-all"
          >
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Order Details
            </h1>
            <div className="flex items-center gap-2 text-sm font-mono bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
              <Hash size={14} className="text-gray-400" />
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {order.orderId}
              </span>
              <CopyButton textToCopy={order.orderId} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <Calendar size={14} />
            {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN: Summary, Products, Shipments & Status */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Order Summary */}
            <InfoCard
              icon={<ShoppingCart size={22} className="text-brand-primary" />}
              title="Order Summary"
            >
              <StatusTimeline status={order.status} />
            </InfoCard>

            {/* Products List */}
            <InfoCard
              icon={<Package size={22} className="text-brand-primary" />}
              title={`Products (${order.products.length})`}
            >
              <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700 -mt-4">
                {order.products.map((p: any) => (
                  <OrderDetailsProductCard
                    key={p.cartItemId}
                    product={p}
                    stockInfo={stockMap.get(p._id)}
                  />
                ))}
              </div>
            </InfoCard>

            {/* ✅ Shipment Manager (Partial Fulfillment) */}
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
          <div className="space-y-8 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Customer Section */}
            <InfoCard
              icon={<User size={22} className="text-brand-primary" />}
              title="Customer"
            >
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                {customerName}
              </div>
              <a
                href={`mailto:${customerEmail}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 mt-1"
              >
                <Mail size={14} /> {customerEmail}
              </a>
              <div className="mt-4 border-t pt-4 dark:border-gray-700">
                <h3 className="font-semibold flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
                  <MapPin size={16} /> Shipping Address
                </h3>
                <address className="text-sm not-italic text-gray-600 dark:text-gray-300 leading-relaxed">
                  {order.shippingAddress.address}, {order.shippingAddress.area}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                  <br />
                  <span className="font-bold">
                    Phone: {order.shippingAddress.phone}
                  </span>
                </address>
              </div>
              <div className="mt-6 border-t pt-4 dark:border-gray-700">
                <SendEmailModal
                  customerId={customerId}
                  customerName={customerName}
                />
              </div>
            </InfoCard>

            {/* Payment Section */}
            <InfoCard
              icon={<CreditCard size={22} className="text-brand-primary" />}
              title="Payment"
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-semibold dark:text-gray-200 uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* ✅ NEW: Interactive Payment Status Settlement Button */}
                <UpdatePaymentStatus
                  orderId={order._id.toString()}
                  currentPaymentStatus={order.paymentStatus}
                />

                <div className="border-t pt-3 mt-3 space-y-3 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-medium dark:text-gray-200">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span className="font-medium dark:text-gray-200">
                      {shippingCost === 0
                        ? "FREE"
                        : `Rs. ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({order.coupon.code}):</span>
                      <span>- Rs. {order.coupon.amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl pt-2 border-t dark:border-gray-700 text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span>Rs. {order.totalPrice.toLocaleString()}</span>
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