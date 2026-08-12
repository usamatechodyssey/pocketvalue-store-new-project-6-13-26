// 📂 src/app/api/orders/invoice/[orderId]/route.ts (ROLE-AWARE & HARDENED)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import React from "react";
import ReactPDF from "@react-pdf/renderer";

// --- REFACTORED IMPORTS ---
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder, ClientOrder } from "@/models/Order";
import { InvoiceTemplate } from "@/app/features/storefront/customer-account/components/orders/Invoice/InvoiceTemplate";

/**
 * Helper function to convert a NodeJS ReadableStream into a Buffer.
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Transform Mongoose document to ClientOrder DTO
 * Converts Date objects to ISO strings for @react-pdf/renderer compatibility.
 */
function transformOrderToClientOrder(order: IOrder): ClientOrder {
  return {
    _id: order._id,
    orderId: order.orderId,
    userId: order.userId,
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt instanceof Date 
      ? order.createdAt.toISOString() 
      : order.createdAt,
    products: order.products.map((p: any) => ({
      _id: p._id,
      productId: p.productId || p._id,
      cartItemId: p.cartItemId,
      name: p.name,
      price: p.price,
      quantity: p.quantity,
      slug: p.slug,
      image: p.image,
      variant: p.variant,
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    trafficSource: order.trafficSource
      ? {
          utmSource: order.trafficSource.utmSource ?? 'Direct',
          utmMedium: order.trafficSource.utmMedium ?? 'None',
          utmCampaign: order.trafficSource.utmCampaign ?? 'None',
        }
      : undefined,
  };
}

/**
 * GET handler to generate and stream a PDF invoice for a specific order.
 */
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectMongoose();

    const params = await paramsPromise;
    const { orderId } = params;

    // ✅ FIX: Role-Aware Access Control (Allows Admin/Staff to generate invoices for any order)
    const userRole = (session.user as any).role || "customer";
    const isStaff = ["admin", "Store Manager", "Super Admin", "Content Editor", "manager"].includes(userRole);

    const query: any = {
      $or: [{ _id: orderId }, { orderId: orderId }],
    };

    // If regular customer, strictly enforce ownership check
    if (!isStaff) {
      query.userId = session.user.id;
    }

    const order = (await Order.findOne(query).lean()) as IOrder | null;

    if (!order) {
      return new NextResponse("Order not found or access denied.", { status: 404 });
    }

    const clientOrder = transformOrderToClientOrder(order);
    const documentElement = React.createElement(InvoiceTemplate, { order: clientOrder });

    const pdfStream = await ReactPDF.renderToStream(documentElement as any);
    const pdfBuffer = await streamToBuffer(pdfStream);
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    const response = new NextResponse(pdfUint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Failed to generate PDF invoice:", error);
    return new NextResponse("Failed to generate invoice.", { status: 500 });
  }
}