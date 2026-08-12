// 📂 src/app/features/storefront/customer-account/actions/customerOrderActions.ts (FULLY HARDENED FOR PRODUCTION)

"use server";

import { auth } from "@/app/auth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder, ClientOrder } from "@/models/Order";
import { revalidatePath } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { getDbStatusesForCustomerFilter } from "@/app/shared/utils/orderDisplayUtils";

// ================================================================
// INTERFACES
// ================================================================
interface GetCustomerOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}

// ================================================================
// ACTION #1: GET CUSTOMER ORDERS (ReDoS & Regex Escaped)
// ================================================================
export async function getCustomerOrders({ 
    page = 1, limit = 10, status = 'all', searchTerm = ''
}: GetCustomerOrdersParams): Promise<{ orders: ClientOrder[], totalPages: number }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: Please login to view your orders.");
    }
    
    const userId = session.user.id;

    await connectMongoose();
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const query: any = { userId: userId };

    if (status && status !== 'all') {
      const dbStatuses = getDbStatusesForCustomerFilter(status);
      if (dbStatuses.length > 0) {
        query.status = { $in: dbStatuses };
      } else {
        query.status = { $in: [] };
      }
    }

    if (searchTerm) {
      const safeSearch = searchTerm.trim().slice(0, 50);
      if (safeSearch.length > 0) {
        // ✅ FIX 1: Escape special regex characters to prevent SyntaxError ReDoS crashes
        const escapedSearch = safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, 'i');
        
        query.$or = [
            { orderId: searchRegex },
            { "shippingAddress.fullName": searchRegex },
            { "shippingAddress.phone": searchRegex },
        ];
      }
    }
    
    const [ordersData, totalOrders] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safeLimit)
          .lean<IOrder[]>(),
        Order.countDocuments(query)
    ]);

    const clientOrders: ClientOrder[] = ordersData.map((order: IOrder) => ({
        _id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: new Date(order.createdAt).toISOString(),
        products: order.products.map((p: IOrder['products'][0]) => ({
            _id: p._id,
            productId: p.productId || p._id,
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
        trafficSource: {
          utmSource: order.trafficSource?.utmSource ?? 'Direct',
          utmMedium: order.trafficSource?.utmMedium ?? 'None',
          utmCampaign: order.trafficSource?.utmCampaign ?? 'None'
        },
    }));

    return { orders: clientOrders, totalPages: Math.ceil(totalOrders / safeLimit) || 1 };
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return { orders: [], totalPages: 0 };
  }
}

// ================================================================
// ACTION #2: CANCEL ORDER (EVENT-DRIVEN EXECUTIVE CACHE PURGED)
// ================================================================
export async function cancelCustomerOrderAction(orderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized: Please login first." };
    }

    const cleanOrderId = orderId?.trim();
    if (!cleanOrderId) {
      return { success: false, message: "Order ID is required." };
    }

    await connectMongoose();
    
    const order = await Order.findById(cleanOrderId);
    if (!order) {
      return { success: false, message: "Order not found." };
    }
    
    if (order.userId.toString() !== session.user.id) {
        return { success: false, message: "Unauthorized: You cannot cancel someone else's order." };
    }

    const cancellableStatuses = ['Pending', 'Processing', 'Payment Verified', 'Ready to Ship', 'On Hold', 'Fraud Hold'];
    if (!cancellableStatuses.includes(order.status)) {
        return { success: false, message: "Order cannot be cancelled at this stage." };
    }

    const previousStatus = order.status;
    
    let stockRestoreSuccess = false;
    try {
      const payload = await getSafePayload();
      
      for (const item of order.products) {
        const productId = item.productId || item._id;
        if (!productId) continue;

        const product = await payload.findByID({
          collection: "products",
          id: productId,
        });

        if (!product || !product.variants) continue;

        const variantKey = item.variant?._key;
        const updatedVariants = product.variants.map((v: any) => {
          const vKey = v._key || v.id;
          if (vKey === variantKey) {
            const currentStock = typeof v.stock === "number" ? v.stock : 0;
            return { ...v, stock: currentStock + item.quantity };
          }
          return v;
        });

        await payload.update({
          collection: "products",
          id: productId,
          data: { variants: updatedVariants },
        });
      }

      stockRestoreSuccess = true;
      console.log(`✅ [Inventory Restore] Stock restored for order ${order.orderId}`);
      
    } catch (stockError: any) {
      console.error(`❌ [Inventory Restore Failed] Order ${order.orderId}:`, stockError);
      await logUserEvent('js_exception', '/account/orders/cancel', {
        error_message: "Inventory Restore Failed on Order Cancel",
        details: `Order ID: ${order.orderId}, Error: ${stockError.message}`
      });
    }

    order.status = "Cancelled";
    await order.save();
    
    // ⚡ FIX 2: Real-time Executive Cache Purge on Storefront Cancellation
    try {
      const { redis } = await import("@/app/shared/lib/telemetry/rate-limiter");
      const execCacheKeys = await redis.keys("analytics_executive:*");
      if (execCacheKeys.length > 0) {
        await redis.del(...execCacheKeys);
        console.log(`⚡ Event-Driven Customer Cancel Sync: Cleared ${execCacheKeys.length} executive cache keys.`);
      }
    } catch (purgeError: any) {
      console.warn("⚠️ Executive cache purge warning:", purgeError.message);
    }

    await logUserEvent('auth_attempt', '/account/orders/cancel', {
      method: 'order_cancellation',
      status: 'success',
      orderId: order.orderId,
      previous_status: previousStatus,
      inventory_restored: stockRestoreSuccess
    });

    revalidatePath(`/account/orders`);
    revalidatePath(`/account/orders/${cleanOrderId}`);
    revalidatePath(`/account/orders?status=all`);
    
    const successMessage = stockRestoreSuccess 
      ? "Order cancelled successfully. Inventory has been restored." 
      : "Order cancelled. Inventory restoration is pending. Our team has been notified.";
    
    return { success: true, message: successMessage };
    
  } catch (error: any) {
    console.error("Cancel Order Error:", error);
    
    await logUserEvent('js_exception', '/account/orders/cancel', {
      error_message: error.message || "Order cancellation failed"
    });
    
    return { success: false, message: error.message || "Failed to cancel order. Please try again." };
  }
}