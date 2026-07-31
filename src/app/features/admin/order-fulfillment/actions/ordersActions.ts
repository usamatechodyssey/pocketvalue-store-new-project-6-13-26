// 📂 src/app/features/admin/order-fulfillment/actions/ordersActions.ts (FULLY HARDENED & BSON-SAFE)

"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder, ClientOrder } from "@/models/Order";
import User from "@/models/User";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

import { 
  sendOrderStatusUpdateEmail, 
  sendCustomAdminEmail 
} from "@/lib/adapters/communication";
import { 
  UpdateOrderStatusSchema, 
  SendCustomEmailSchema, 
  CancelOrderSchema 
} from "@/app/shared/lib/zodSchemas";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ SINGLE SOURCE OF TRUTH & STATE MACHINE
import { isValidStatusTransition } from "@/app/shared/constants/orderTransitions";

interface GetPaginatedOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
  userId?: string | null;
}

// ================================================================
// 📦 HELPER: RESTOCK INVENTORY IN PAYLOAD CMS (SINGLE-VARIANT SAFE)
// ================================================================
async function restockOrderInventory(products: IOrder["products"]): Promise<boolean> {
  try {
    const payload = await getSafePayload();

    for (const item of products) {
      if (!item.productId) continue;

      const product = await payload.findByID({
        collection: "products",
        id: item.productId,
      });

      if (product && product.variants && product.variants.length > 0) {
        const updatedVariants = product.variants.map((v: any, idx: number) => {
          // Single-variant fallback matcher prevents restock blackouts on default products
          const isMatch =
            (product.variants.length === 1 && idx === 0) ||
            (v.id && v.id === item.variant?._key) ||
            (v._key && v._key === item.variant?._key);

          if (isMatch) {
            const currentStock = typeof v.stock === "number" ? v.stock : 0;
            return { ...v, stock: currentStock + item.quantity };
          }
          return v;
        });

        await payload.update({
          collection: "products",
          id: item.productId,
          data: { variants: updatedVariants },
        });

        console.log(`📦 [Inventory Restock] Restocked ${item.quantity} units for product ${item.productId}`);
      }
    }

    // Invalidate inventory risk cache
    try {
      const keys = await redis.keys("analytics_inventory_risk:*");
      if (keys.length > 0) await redis.del(...keys);
    } catch (e) {}

    return true;
  } catch (error) {
    console.error("❌ Failed to restock inventory in Payload CMS:", error);
    return false;
  }
}

// ================================================================
// === ACTION #1: GET PAGINATED ORDERS ===
// ================================================================
export async function getPaginatedOrders({ 
    page = 1, limit = 10, status = 'all', searchTerm = '', userId = null
}: GetPaginatedOrdersParams): Promise<{ orders: ClientOrder[], totalPages: number }> {
  try {
    await verifyStaff(['admin', 'manager', 'editor']);
    await connectMongoose();
    
    // Non-zero limit guard prevents division-by-zero layout hangs
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.userId = userId;

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
          { orderId: searchRegex },
          { "shippingAddress.fullName": searchRegex },
          { "shippingAddress.phone": searchRegex },
      ];
    }
    
    const [ordersData, totalOrders] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean<IOrder[]>(),
        Order.countDocuments(query)
    ]);

    const clientOrders: ClientOrder[] = ordersData.map(order => ({
        _id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: new Date(order.createdAt).toISOString(),
        products: order.products.map(p => ({
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
    console.error("Failed to fetch paginated orders:", error);
    return { orders: [], totalPages: 0 };
  }
}

// ================================================================
// === ACTION #2: UPDATE ORDER STATUS (STATE MACHINE & DOUBLE-RESTOCK SAFE) ===
// ================================================================
export async function updateOrderStatus(
  orderId: string, 
  newStatus: string,
  bypassStateMachine: boolean = false
): Promise<{ success: boolean; message: string }> {
    await verifyStaff(['admin', 'manager']);
    const validation = UpdateOrderStatusSchema.safeParse({ orderId, newStatus });
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };

    const { orderId: validatedOrderId, newStatus: validatedNewStatus } = validation.data;

    try {
        await connectMongoose();

        const order = await Order.findById(validatedOrderId);
        if (!order) throw new Error("Order not found.");
        if (order.status === validatedNewStatus) return { success: true, message: "Status is already the same." };

        const oldStatus = order.status;

        // STATE MACHINE VALIDATION GUARD
        if (!bypassStateMachine && !isValidStatusTransition(oldStatus, validatedNewStatus)) {
          return {
            success: false,
            message: `Invalid status transition from "${oldStatus}" to "${validatedNewStatus}". Transition blocked by State Machine.`,
          };
        }

        order.status = validatedNewStatus as any;
        await order.save();

        // DOUBLE-RESTOCK GUARD (Fires restock ONLY if previous status was not already cancelled/restocked)
        const isAlreadyRestocked = ["Cancelled", "Rejected", "Auto-Restocked"].includes(oldStatus);
        if (!isAlreadyRestocked && ["Cancelled", "Rejected", "Auto-Restocked"].includes(validatedNewStatus)) {
          await restockOrderInventory(order.products);
        }

        // Referral Trigger for Deliveries
        const statusToCheck = validatedNewStatus as string;
        if (statusToCheck === "Delivered" || statusToCheck === "Completed") {
          try {
            const { trackOrderReferralConversion } = await import(
              "@/app/features/admin/loyalty-intelligence/actions/conversionTracker"
            );
            await trackOrderReferralConversion(order._id);
            console.log(`📡 [Admin Action] Referral conversion processed for order ${order.orderId}`);
          } catch (referralErr) {
            console.error("⚠️ REFERRAL ERROR (Admin Action): Conversion trigger failed:", referralErr);
          }
        }

        // Telemetry Logging
        try {
          await logUserEvent('crm_sync', '/admin/orders/status-update', {
            orderId: order._id,
            orderNumber: order.orderId,
            sync_type: 'status_transition',
            previous_status: oldStatus,
            new_status: validatedNewStatus,
            amount: order.totalPrice
          });
        } catch (s2sError: any) {
          console.error("Failed to log operational status sync:", s2sError.message);
        }

        // ⚡ Executive Cache Purge
        try {
          const execCacheKeys = await redis.keys("analytics_executive:*");
          if (execCacheKeys.length > 0) {
            await redis.del(...execCacheKeys);
            console.log(`⚡ Event-Driven Status Sync: Cleared ${execCacheKeys.length} executive analytics cache keys.`);
          }
        } catch (purgeError: any) {
          console.warn("⚠️ Executive cache purge warning:", purgeError.message);
        }
        
        // Email Notification
        const user = await User.findById(order.userId);
        if (user?.email) {
            try {
                await sendOrderStatusUpdateEmail({
                    to: user.email,
                    customerName: user.name,
                    orderId: order.orderId,
                    status: validatedNewStatus,
                });
            } catch (emailError) {
                console.error(`Failed to send status update email for order ${order.orderId}:`, emailError);
            }
        }
        
        revalidatePath(`/admin/orders`);
        revalidatePath(`/admin/orders/${validatedOrderId}`);
        revalidatePath(`/account/orders`);
        
        return { success: true, message: "Order status updated successfully!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ================================================================
// === ACTION #3: SEND CUSTOM EMAIL ===
// ================================================================
export async function sendCustomEmail(customerId: string, subject: string, message: string) {
    await verifyStaff(['admin', 'manager']);
    const validation = SendCustomEmailSchema.safeParse({ customerId, subject, message });
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };

    try {
        await connectMongoose();
        const user = await User.findById(validation.data.customerId);
        if (!user?.email) return { success: false, message: "Customer email not found." };

        await sendCustomAdminEmail({
            to: user.email,
            customerName: user.name,
            subject: validation.data.subject,
            message: validation.data.message,
        });
        
        return { success: true, message: "Email sent successfully!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ================================================================
// === ACTION #4: CANCEL AN ORDER (DOUBLE-RESTOCK PROTECTED) ===
// ================================================================
export async function cancelOrderAction(orderId: string) {
  await verifyStaff(['admin']);
  const validation = CancelOrderSchema.safeParse({ orderId });
  if (!validation.success) return { success: false, message: validation.error.issues[0].message };

  try {
    await connectMongoose();
    
    const order = await Order.findById(validation.data.orderId);
    if (!order) return { success: false, message: "Order not found." };
    
    const previousStatus = order.status;
    
    if (previousStatus === "Cancelled") {
      return { success: true, message: "Order is already cancelled." };
    }

    order.status = "Cancelled";
    await order.save();

    // DOUBLE-RESTOCK GUARD (Fires restock ONLY if order was not already cancelled)
    const isAlreadyRestocked = ["Cancelled", "Rejected", "Auto-Restocked"].includes(previousStatus);
    if (!isAlreadyRestocked) {
      await restockOrderInventory(order.products);
    }

    try {
      await logUserEvent('crm_sync', '/account/orders/cancel', {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: 'cancellation_triggered',
        previous_status: previousStatus,
        new_status: 'Cancelled',
        amount: order.totalPrice
      });
    } catch (s2sError: any) {
      console.error("Failed to log operational cancellation sync:", s2sError.message);
    }

    // ⚡ Executive Cache Purge
    try {
      const execCacheKeys = await redis.keys("analytics_executive:*");
      if (execCacheKeys.length > 0) {
        await redis.del(...execCacheKeys);
        console.log(`⚡ Event-Driven Cancellation Sync: Cleared ${execCacheKeys.length} executive analytics cache keys.`);
      }
    } catch (purgeError: any) {
      console.warn("⚠️ Executive cache purge warning:", purgeError.message);
    }
    
    revalidatePath(`/admin/orders`);
    revalidatePath(`/account/orders`);
    return { success: true, message: "Order cancelled and inventory restocked." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ================================================================
// === ACTION #5: GET SINGLE ORDER (BSON-SAFE OBJECTID SHIELD) ===
// ================================================================
export async function getSingleOrder(orderId: string): Promise<IOrder | null> {
    try {
        await verifyStaff(['admin', 'manager', 'editor']);
        await connectMongoose();
        
        let order = await Order.findOne({ $or: [{ _id: orderId }, { orderId: orderId }] }).lean<IOrder>();
        if (!order) return null;

        let userDoc = null;
        // ✅ CRITICAL FIX: ObjectId validation shield prevents CastError exception crashes on custom customer string IDs
        if (order.userId && mongoose.Types.ObjectId.isValid(order.userId)) {
          try {
            userDoc = await User.findById(order.userId).select("name email").lean();
          } catch (uErr) {
            console.warn("⚠️ Customer lookup by string ID failed, attempting plain match.");
          }
        }

        const serialized = JSON.parse(JSON.stringify(order));
        if (userDoc) {
          serialized.userId = { _id: userDoc._id.toString(), name: userDoc.name, email: userDoc.email };
        }

        return serialized;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

// ================================================================
// === ACTION #6: UPDATE PAYMENT STATUS ===
// ================================================================
export async function updatePaymentStatusAction(
  orderId: string,
  newPaymentStatus: "Paid" | "Unpaid"
): Promise<{ success: boolean; message: string }> {
  await verifyStaff(["admin", "manager"]);

  try {
    await connectMongoose();

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
    });

    if (!order) return { success: false, message: "Order not found." };

    if (order.paymentStatus === newPaymentStatus) {
      return {
        success: true,
        message: `Payment status is already marked as ${newPaymentStatus}.`,
      };
    }

    const previousPaymentStatus = order.paymentStatus;
    order.paymentStatus = newPaymentStatus;
    await order.save();

    // DELAYED COD SETTLEMENT REFERRAL TRIGGER
    if (newPaymentStatus === "Paid" && ["Delivered", "Completed"].includes(order.status)) {
      try {
        const { trackOrderReferralConversion } = await import(
          "@/app/features/admin/loyalty-intelligence/actions/conversionTracker"
        );
        await trackOrderReferralConversion(order._id);
        console.log(`📡 [Payment Sync] Referral conversion processed on COD bank settlement for order ${order.orderId}`);
      } catch (referralErr) {
        console.error("⚠️ REFERRAL ERROR (Payment Sync): Settlement trigger failed:", referralErr);
      }
    }

    try {
      await logUserEvent("crm_sync", "/admin/orders/payment-status-update", {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: "payment_status_transition",
        previous_payment_status: previousPaymentStatus,
        new_payment_status: newPaymentStatus,
        amount: order.totalPrice,
      });
    } catch (s2sError: any) {
      console.error("Failed to log payment status sync:", s2sError.message);
    }

    // ⚡ Executive Cache Purge (Real-Time Realized Cash Sync)
    try {
      const execCacheKeys = await redis.keys("analytics_executive:*");
      if (execCacheKeys.length > 0) {
        await redis.del(...execCacheKeys);
        console.log(
          `⚡ Event-Driven Payment Sync: Cleared ${execCacheKeys.length} executive analytics cache keys.`
        );
      }
    } catch (purgeError: any) {
      console.warn("⚠️ Executive cache purge warning:", purgeError.message);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.orderId}`);
    revalidatePath(`/admin/orders/${order._id}`);
    revalidatePath("/account/orders");

    return {
      success: true,
      message: `Payment status marked as ${newPaymentStatus} successfully!`,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}