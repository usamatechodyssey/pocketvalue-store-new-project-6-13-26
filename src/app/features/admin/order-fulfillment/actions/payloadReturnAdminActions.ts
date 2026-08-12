// 📂 src/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions.ts (HARDENED & BSON-SAFE)

"use server";

import { revalidatePath } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import ReturnRequest, { IReturnRequest } from "@/models/ReturnRequest";
import { IUser } from "@/models/User";
import { IOrder } from "@/models/Order";
import { Types } from "mongoose";

// ✅ COMMUNICATION FACTORY & VALIDATION SCHEMAS
import { sendReturnStatusUpdateEmail } from "@/lib/adapters/communication";
import { UpdateReturnStatusSchema } from "@/app/shared/lib/zodSchemas";

// PAYLOAD Native Imports for Products & Mapping
import { mapPayloadProductToSanity } from "@/sanity/lib/payload/plp/productMapper";
import SanityProduct from "@/types";
import { verifyStaff } from "@/lib/payloadAuth";

// --- TYPES ---
export type AdminReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest["status"];
  createdAt: string;
  customerName: string;
  itemCount: number;
};

export type FullAdminReturnRequest = {
  _id: string;
  orderId: string;
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
  userDetails: { _id: string; name: string; email: string; } | null;
  originalOrder: { shippingAddress: IOrder["shippingAddress"]; } | null;
};

// ================================================================
// 1. GET ALL RETURNS (Aggregated & ReDoS Protected)
// ================================================================
export async function getPaginatedReturnRequestsPayload({ 
  page = 1, limit = 15, status = "All", searchTerm = ""
}) {
  try {
    await verifyStaff(["admin", "manager", "editor"]);
    await connectMongoose();
    
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;
    
    const matchStage: any = {};
    if (status && status !== "All") matchStage.status = status;

    const pipeline: any[] = [
      // ✅ FIX 1: Safe BSON $convert prevents type-collision crashes if userId is already ObjectId or string
      {
        $addFields: {
          convertedUserId: {
            $convert: {
              input: "$userId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $lookup: { from: "users", localField: "convertedUserId", foreignField: "_id", as: "userDetails" } },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      { $match: matchStage }
    ];
        
    if (searchTerm && searchTerm.trim().length > 0) {
      // ✅ FIX 2: ReDoS search string escaping
      const escapedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");

      pipeline.push({ 
        $match: { 
          $or: [
            { orderNumber: searchRegex }, 
            { "userDetails.name": searchRegex }, 
            { "userDetails.email": searchRegex }
          ] 
        } 
      });
    }

    const [requestsData, totalCountResult] = await Promise.all([
      ReturnRequest.aggregate(pipeline).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      ReturnRequest.aggregate([...pipeline, { $count: "total" }])
    ]);

    const formattedRequests: AdminReturnRequest[] = requestsData.map((req: any) => ({
      _id: req._id.toString(),
      orderNumber: req.orderNumber,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      customerName: req.userDetails?.name || "N/A",
      itemCount: req.items?.length || 0
    }));

    return { 
      requests: formattedRequests, 
      totalPages: Math.ceil((totalCountResult[0]?.total || 0) / safeLimit) || 1 
    };
  } catch (error) {
    console.error("Payload Return List Fetch Error:", error);
    return { requests: [], totalPages: 0 };
  }
}

// ================================================================
// 2. GET SINGLE RETURN DETAIL (BSON GUARDED)
// ================================================================
export async function getSingleReturnRequestPayload(returnId: string): Promise<FullAdminReturnRequest | null> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // ✅ FIX 3: BSON ObjectId Guard prevents BSONTypeError crashes on malformed URL parameters
    if (!returnId || !Types.ObjectId.isValid(returnId)) {
      console.warn(`⚠️ Invalid BSON ObjectId passed to return detail: ${returnId}`);
      return null;
    }

    const payload = await getSafePayload();
    await connectMongoose();

    const pipeline: any[] = [
      { $match: { _id: new Types.ObjectId(returnId) } },
      {
        $addFields: {
          convertedUserId: {
            $convert: {
              input: "$userId",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $lookup: { from: "users", localField: "convertedUserId", foreignField: "_id", as: "userDetails" } },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "orders", localField: "orderId", foreignField: "_id", as: "originalOrder" } },
      { $unwind: { path: "$originalOrder", preserveNullAndEmptyArrays: true } }
    ];

    const results = await ReturnRequest.aggregate(pipeline);
    if (!results.length) return null;
    const returnDoc = results[0];

    const rawProductIds = returnDoc.items?.map((item: any) => item.productId) || [];
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    const validProductIds = rawProductIds.filter((id: string) => isValidObjectId(id));

    let productsMap = new Map<string, SanityProduct>();

    if (validProductIds.length > 0) {
      const payloadProducts = await payload.find({
        collection: "products",
        where: { id: { in: validProductIds } },
        depth: 2,
        limit: Math.max(1, validProductIds.length)
      });

      payloadProducts.docs.forEach((doc: any) => {
        productsMap.set(doc.id, mapPayloadProductToSanity(doc));
      });
    }

    return {
      _id: returnDoc._id.toString(),
      orderId: returnDoc.orderId?._id?.toString() || returnDoc.orderId || "",
      orderNumber: returnDoc.orderNumber,
      status: returnDoc.status,
      resolution: returnDoc.resolution,
      adminComments: returnDoc.adminComments,
      customerComments: returnDoc.customerComments,
      createdAt: returnDoc.createdAt.toISOString(),
      items: (returnDoc.items || []).map((item: any) => ({
        productId: item.productId,
        variantKey: item.variantKey,
        quantity: item.quantity,
        reason: item.reason,
        productDetails: productsMap.get(item.productId) || null 
      })),
      userDetails: returnDoc.userDetails ? {
        _id: returnDoc.userDetails._id.toString(),
        name: returnDoc.userDetails.name,
        email: returnDoc.userDetails.email,
      } : null,
      originalOrder: returnDoc.originalOrder?.shippingAddress ? {
        shippingAddress: returnDoc.originalOrder.shippingAddress,
      } : null,
    };
  } catch (error: any) {
    console.error("Payload Single Return Detail Error:", error.message);
    return null;
  }
}

// ================================================================
// 3. UPDATE RETURN STATUS (STATUS EMAIL NOTIFIED)
// ================================================================
export async function updateReturnRequestStatusPayload(returnId: string, formData: FormData) {
  try {
    await verifyStaff(["admin", "manager"]);

    if (!returnId || !Types.ObjectId.isValid(returnId)) {
      return { success: false, message: "Invalid Return Request ID." };
    }

    const formObject = {
      returnId,
      status: formData.get("status"),
      resolution: formData.get("resolution") || undefined,
      adminComments: formData.get("adminComments") || undefined,
    };

    const validation = UpdateReturnStatusSchema.safeParse(formObject);
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };
    
    const { status: newStatus, resolution, adminComments } = validation.data;
    await connectMongoose();
    
    const request = await ReturnRequest.findById(returnId).populate<{ userId: Pick<IUser, "name" | "email"> }>("userId", "name email");
    if (!request) throw new Error("Return request not found.");
    
    const statusChanged = request.status !== newStatus;
    request.status = newStatus;
    request.resolution = resolution; 
    if (adminComments) request.adminComments = adminComments;
    await request.save();

    const user = request.userId as any;
    if (statusChanged && user?.email) {
      try {
        await sendReturnStatusUpdateEmail({
          to: user.email,
          customerName: user.name,
          orderNumber: request.orderNumber,
          requestId: request._id.toString(),
          newStatus: newStatus,
          resolution: resolution,
          adminComments: adminComments,
        });
      } catch (emailError) {
        console.error("Email failed to send during return update:", emailError);
      }
    }

    revalidatePath(`/admin/returns`);
    revalidatePath(`/admin/returns/${returnId}`);
    return { success: true, message: "Return status updated successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}