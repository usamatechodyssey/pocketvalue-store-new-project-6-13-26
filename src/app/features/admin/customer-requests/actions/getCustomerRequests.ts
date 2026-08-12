// 📂 src/app/features/admin/customer-requests/actions/getCustomerRequests.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import CustomerRequest, { ICustomerRequest } from "@/models/CustomerRequest";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (DTOs for Frontend Compatibility)
// ================================================================
export interface ClientCustomerRequest {
  _id: string;
  requestType: 'restock' | 'missing_variant' | 'missing_product';
  productId?: string;
  requestedProductName?: string;
  email: string;
  phone?: string;
  selectedAttributes?: Record<string, string> | null;
  customDetails?: string;
  urgencyLevel: 'normal' | 'urgent';
  status: 'pending' | 'notified' | 'ignored';
  createdAt: string;
}

export interface PaginatedCustomerRequestsResult {
  requests: ClientCustomerRequest[];
  totalPages: number;
  totalDocs: number;
}

// ================================================================
// 🚀 MAIN SERVER ACTION: GET PAGINATED CUSTOMER REQUESTS (Cluster A)
// ================================================================
export async function getCustomerRequests({
  page = 1,
  limit = 15,
  status = "all",
  searchTerm = "",
}: {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
} = {}): Promise<PaginatedCustomerRequestsResult> {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;

  const cacheKey = `analytics_customer_requests_v1:page_${safePage}:limit_${safeLimit}:status_${status}:search_${searchTerm || "none"}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Check
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<PaginatedCustomerRequestsResult>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Paginated Customer Requests List (Page: ${safePage})`);
      return parsed;
    }

    await connectMongoose();

    // 2. Build Query Filters
    const query: Record<string, any> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (searchTerm && searchTerm.trim().length > 0) {
      // Escape special regex characters to prevent ReDoS crashes/hangs
      const escapedSearch = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");

      query.$or = [
        { email: searchRegex },
        { requestedProductName: searchRegex },
        { phone: searchRegex },
        { productId: searchTerm },
      ];
    }

    // 3. Fetch Data in Parallel (Direct Cluster A Access)
    const [requestsFromDb, totalDocs] = await Promise.all([
      CustomerRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean<ICustomerRequest[]>(),
      CustomerRequest.countDocuments(query),
    ]);

    // 4. Map DB Documents to Safe Client DTOs
    const requests: ClientCustomerRequest[] = requestsFromDb.map((doc: any) => ({
      _id: doc._id.toString(),
      requestType: doc.requestType,
      productId: doc.productId || undefined,
      requestedProductName: doc.requestedProductName || undefined,
      email: doc.email,
      phone: doc.phone || undefined,
      selectedAttributes: doc.selectedAttributes || null,
      customDetails: doc.customDetails || undefined,
      urgencyLevel: doc.urgencyLevel,
      status: doc.status,
      createdAt: new Date(doc.createdAt).toISOString(),
    }));

    const result: PaginatedCustomerRequestsResult = {
      requests,
      totalPages: Math.ceil(totalDocs / safeLimit) || 1,
      totalDocs,
    };

    // 5. Cache write (5 min TTL)
    try {
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`💾 Customer Requests List Cached.`);
    } catch (cacheError) {
      console.warn("⚠️ Redis cache write warning:", cacheError);
    }

    return result;
  } catch (error: any) {
    console.error("❌ Failed to fetch paginated customer requests:", error.message);
    return { requests: [], totalPages: 0, totalDocs: 0 };
  }
}