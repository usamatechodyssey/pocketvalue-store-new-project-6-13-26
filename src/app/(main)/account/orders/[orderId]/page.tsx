// 📂 src/app/account/orders/[orderId]/page.tsx (CYBER-HUD HARDENED)

import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Hash, Calendar } from "lucide-react";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder, ClientOrder } from "@/models/Order";

import StatusTimeline from "../../../../features/storefront/customer-account/components/orders/StatusTimeline";
import OrderItemsList from "../../../../features/storefront/customer-account/components/orders/OrderItemsList";
import {
  ShippingAddressCard,
  PaymentDetailsCard,
} from "../../../../features/storefront/customer-account/components/orders/OrderInfoCards";
import OrderActions from "@/app/features/storefront/customer-account/components/orders/OrderActions";

// ================================================================
// 🔧 DTO TRANSFORMATION ENGINE (Snapshot Integrity)
// ================================================================
function transformOrderToClientOrder(order: IOrder): ClientOrder {
  return {
    _id: order._id.toString(),
    orderId: order.orderId,
    userId: order.userId,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt instanceof Date 
      ? order.createdAt.toISOString() 
      : order.createdAt,
    products: order.products.map((p: any) => ({
      _id: p._id,
      productId: p.productId, // ✅ FIX: productId explicit map karein
      cartItemId: p.cartItemId,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      slug: p.slug,
      image: p.image,
      variant: p.variant
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    coupon: order.coupon,
    trafficSource: order.trafficSource,
    warehouseDistance: order.warehouseDistance
  };
}

async function getSingleUserOrder(
  orderId: string,
  userId: string
): Promise<ClientOrder | null> {
  try {
    await connectMongoose();
    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      userId: userId
    }).lean<IOrder>();

    return order ? transformOrderToClientOrder(order) : null;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

// ================================================================
// 🚀 MAIN PAGE COMPONENT
// ================================================================
type UserOrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function UserOrderDetailPage({ params }: UserOrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const { orderId } = await params;
  const order = await getSingleUserOrder(orderId, session.user.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-[1750px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-all no-underline hover:no-underline uppercase tracking-widest font-mono"
          >
            <ArrowLeft size={13} /> Back to My Orders
          </Link>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
            Order Details
          </h1>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <Hash size={13} /> {order.orderId}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> 
              {new Date(order.createdAt).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xs font-bold uppercase tracking-widest font-mono mb-4 text-zinc-800 dark:text-zinc-200">
          Order Status
        </h2>
        <StatusTimeline status={order.status} />
      </div>

      <OrderItemsList products={order.products} />

      <OrderActions
        orderId={order._id}
        orderNumber={order.orderId}
        currentStatus={order.status}
        products={order.products}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ShippingAddressCard shippingAddress={order.shippingAddress} />
        <PaymentDetailsCard
          paymentDetails={{
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            totalPrice: order.totalPrice,
          }}
        />
      </div>
    </div>
  );
}