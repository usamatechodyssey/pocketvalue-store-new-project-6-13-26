//user account return action
"use server";

import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
// ✅ FIX: Import factory functions instead of nodemailer
import { 
  sendReturnReceivedEmail,
  sendAdminNotificationEmail
} from "@/lib/adapters/communication";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import ReturnRequest, { IReturnRequest } from "@/models/ReturnRequest";

// PAYLOAD Native Mapping Imports
import { mapPayloadProductToSanity } from "@/sanity/lib/payload/plp/productMapper";
import SanityProduct from "@/types";

import { CreateReturnRequestSchema } from "@/app/shared/lib/zodSchemas";

// --- TYPES (DTOs for Frontend) ---
export type UserReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest["status"];
  createdAt: string;
};

export type FullUserReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest["status"];
  resolution?: IReturnRequest["resolution"];
  adminComments?: string;
  customerComments?: string;
  createdAt: string;
  items: Array<{
    productId: string;
    variantKey: string;
    quantity: number;
    reason: string;
    productDetails: SanityProduct | null;
  }>;
};

interface CreateReturnRequestResult {
  success: boolean;
  message: string;
}

// === ACTION #1: CREATE RETURN REQUEST ===
export async function createReturnRequestAction(formData: FormData): Promise<CreateReturnRequestResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.name || !session.user.email) {
    return { success: false, message: "You must be logged in to request a return." };
  }

  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = CreateReturnRequestSchema.safeParse(formObject);

  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }
  
  const { orderId, orderNumber, items, customerComments } = validatedFields.data;

  try {
    await connectMongoose();
    
    const order = await Order.findOne({ 
      _id: orderId,
      userId: session.user.id 
    });

    if (!order) {
      return { success: false, message: "Order not found or you do not have permission." };
    }
    
    const newReturnRequest = new ReturnRequest({
      orderId: order._id,
      orderNumber,
      userId: session.user.id,
      items, 
      customerComments,
    });

    await newReturnRequest.save();

    // ✅ FIX: Send emails using factory
    try {
      // Email #1: To Customer (Return Received)
      await sendReturnReceivedEmail({
        to: session.user.email,
        customerName: session.user.name,
        orderNumber: orderNumber,
        requestId: newReturnRequest._id.toString(),
      });

      // Email #2: To Admin (New Return Notification)
      if (process.env.ADMIN_EMAIL) {
        await sendAdminNotificationEmail({
          to: process.env.ADMIN_EMAIL,
          customerName: session.user.name,
          orderNumber: orderNumber,
          requestId: newReturnRequest._id.toString(),
          itemCount: items.length,
        });
      }
    } catch (emailError) {
      console.error(`Email Error for return ${newReturnRequest._id}:`, emailError);
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account/returns");

    return { success: true, message: "Your return request has been submitted successfully." };

  } catch (error: any) {
    console.error("Error creating return request:", error);
    return { success: false, message: error.message || "Server Error" };
  }
}

// === ACTION #2: GET USER'S RETURN REQUESTS ===
export async function getUserReturnRequests(): Promise<UserReturnRequest[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    await connectMongoose();
    
    const requests = await ReturnRequest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean<any[]>();

    return requests.map((req: any) => ({
      _id: req._id.toString(),
      orderNumber: req.orderNumber,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    }));

  } catch (error) {
    console.error("Error fetching returns:", error);
    return [];
  }
}

export async function getSingleUserReturnRequest(returnId: string): Promise<FullUserReturnRequest | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const payload = await getSafePayload();
    await connectMongoose();

    const request = await ReturnRequest.findOne({
      _id: returnId,
      userId: session.user.id
    }).lean<any>();

    if (!request) return null;

    const productIds = request.items.map((item: any) => item.productId);
    
    const validProductIds = productIds.filter((id: string) => id && id.length > 0);

    let productsMap = new Map<string, SanityProduct>();

    if (validProductIds.length > 0) {
      const payloadProducts = await payload.find({
        collection: "products",
        where: { id: { in: validProductIds } },
        depth: 2,
        limit: 100
      });

      payloadProducts.docs.forEach((doc: any) => {
        productsMap.set(doc.id, mapPayloadProductToSanity(doc));
      });
    }

    return {
      _id: request._id.toString(),
      orderNumber: request.orderNumber,
      status: request.status,
      resolution: request.resolution,
      adminComments: request.adminComments,
      customerComments: request.customerComments,
      createdAt: request.createdAt.toISOString(),
      items: request.items.map((item: any) => ({
        ...item,
        productDetails: productsMap.get(item.productId) || null,
      })),
    };
  } catch (error) {
    console.error("Error fetching return details:", error);
    return null;
  }
}