// 📂 src/app/order-success/[orderId]/page.tsx

import { CheckCircle2, ShoppingBag, ArrowRight, Home, MessageCircle, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder } from "@/models/Order";
import ClearCartOnSuccess from "../../../features/storefront/cart-checkout/components/checkout/ClearCartOnSuccess";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// ================================================================
// 📦 FETCH ORDER (with Mongoose)
// ================================================================
async function getOrder(id: string): Promise<IOrder | null> {
  try {
    await connectMongoose();
    const order = await Order.findById(id).lean();
    if (!order) return null;
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Failed to fetch order for success page:", error);
    return null;
  }
}

// ================================================================
// 🚀 PAGE COMPONENT
// ================================================================
type OrderSuccessPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderSuccessPage({
  params: paramsPromise,
}: OrderSuccessPageProps) {
  const { orderId } = await paramsPromise;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  // ✅ Idempotent Purchase Telemetry
  await logUserEvent("purchase", `/order-success/${orderId}`, {
    orderId: order.orderId,
    totalPrice: order.totalPrice,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    couponCode: order.coupon?.code || null,
    couponAmount: order.coupon?.amount || 0,
    paymentMethod: order.paymentMethod,
    products: order.products.map((p: any) => ({
      productId: p.productId || p._id,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      sku: p.sku || "N/A"
    }))
  });

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* 🎨 Background Ambient Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* 🏷️ Success Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Order Confirmed
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 rounded text-[8px] font-mono">
            #{order.orderId}
          </span>
        </div>

        {/* 🎯 Success Display */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20">
            <CheckCircle2 size={56} className="text-emerald-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* 📝 Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Order Placed Successfully!
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Thank you for your purchase. A confirmation email has been sent to your registered email address.
          </p>
        </div>

        {/* 📦 Order & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto mb-10 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
          {/* Left: Shipping Address */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Shipping Address
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {order.shippingAddress.address}, {order.shippingAddress.area}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
            </p>
          </div>

          {/* Right: Payment Summary */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Payment Summary
            </p>
            <p className="text-lg font-black text-brand-primary mt-1">
              Rs. {order.totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paid via {order.paymentMethod}
            </p>
            {order.coupon && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Coupon applied: {order.coupon.code} (Rs. {order.coupon.amount.toLocaleString()} off)
              </p>
            )}
          </div>
        </div>

        {/* 🔗 Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Package size={18} />
            My Orders
          </Link>
        </div>

        {/* 🔍 Quick Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-4">
            Need help with your order?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/contact-us"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <MessageCircle size={16} />
              Contact Support
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/account/orders"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <Package size={16} />
              Track Order
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/faq"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <MessageCircle size={16} />
              FAQs
            </Link>
          </div>
        </div>

        {/* ✅ Clear Cart (Client Component) */}
        <ClearCartOnSuccess />
      </div>
    </div>
  );
}