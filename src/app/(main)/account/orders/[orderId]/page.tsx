
// /src/app/account/orders/[orderId]/page.tsx (UPDATED TO USE DTO & NEXT.JS 16 PARAMS)

import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder } from "@/models/Order";
import { ClientOrder } from "@/models/Order";

import StatusTimeline from "../../../../features/storefront/customer-account/components/orders/StatusTimeline";
import OrderItemsList from "../../../../features/storefront/customer-account/components/orders/OrderItemsList";
import {
  ShippingAddressCard,
  PaymentDetailsCard,
} from "../../../../features/storefront/customer-account/components/orders/OrderInfoCards";
import OrderActions from "@/app/features/storefront/customer-account/components/orders/OrderActions";

// This function returns a plain, safe ClientOrder object
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

    if (!order) {
      return null;
    }

    // Manually convert the Mongoose object to a plain ClientOrder object
    const clientOrder: ClientOrder = {
        _id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: new Date(order.createdAt).toISOString(),
        products: order.products.map(p => ({
            _id: p._id,
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
    };

    return clientOrder;

  } catch (error) {
    console.error("Failed to fetch single user order:", error);
    return null;
  }
}

// UPDATE: params is now a Promise (Next.js 15/16 requirement)
type UserOrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function UserOrderDetailPage({ params }: UserOrderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  // UPDATE: Await the params before accessing properties
  const { orderId } = await params;

  // The 'order' variable is a clean ClientOrder object
  const order = await getSingleUserOrder(orderId, session.user.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Order Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Order ID:{" "}
            <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
              {order.orderId}
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <Link
          href="/account/orders"
          className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
