// src/app/api/payment/initiate/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { initiatePayment, gatewayImplementations } from '@/app/features/storefront/cart-checkout/gateways/paymentAdapter';
import connectMongoose from '@/app/shared/lib/checkout/mongoose';
import Order, { IOrder } from '@/models/Order';
import { InitiatePaymentSchema } from "@/app/shared/lib/zodSchemas";
// ✅ REMOVED: ratelimiter and ipAddress (proxy handles rate limiting)

// ✅ Type for valid gateways
type GatewayKey = keyof typeof gatewayImplementations;

async function getOrderForPayment(orderId: string, userId: string): Promise<IOrder | null> {
    try {
        await connectMongoose();
        const order = await Order.findOne({ 
            _id: orderId,
            userId: userId 
        }).lean<IOrder>();
        return order;
    } catch (error) {
        console.error("Failed to fetch order for payment:", error);
        return null;
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    // ✅ REMOVED: Rate Limiting (already handled by proxy.ts)

    try {
        const body = await req.json();

        const validation = InitiatePaymentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
        }
        const { orderId, gatewayKey } = validation.data;

        const order = await getOrderForPayment(orderId, session.user.id);
        if (!order) {
            return NextResponse.json({ message: "Order not found or access denied." }, { status: 404 });
        }
        
        if (order.status !== 'Pending' && order.status !== 'On Hold') {
            return NextResponse.json({ message: "This order can no longer be paid for." }, { status: 400 });
        }

        // ✅ FIX 2: Type-safe gatewayKey
        const result = await initiatePayment(order, gatewayKey as GatewayKey);

        if (result.success) {
            return NextResponse.json({ 
                success: true,
                redirectUrl: result.redirectUrl, 
                data: result.data,
                message: result.message
            });
        } else {
            throw new Error(result.message || "Failed to initiate payment session.");
        }

    } catch (error: any) {
        console.error("Payment Initiation API Error: ", error);
        return NextResponse.json({ message: error.message || "An internal server error occurred." }, { status: 500 });
    }
}