// // src/features/admin/inventory-cms/actions/payloadInventoryActions.ts
// "use server";

// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";

// // ================================================================
// // 📦 CONFIGURATION (ENTERPRISE SCALE OPTIMIZED)
// // ================================================================

// const MAX_LIMIT = 100;
// const DEFAULT_LIMIT = 15;

// // ✅ TTL increased to 1 hour (Inventory changes are infrequent)
// const CACHE_TTL_SECONDS = 3600; // 1 Hour

// // ================================================================
// // 📦 INTERFACES
// // ================================================================

// export interface InventoryRiskItem {
//   productId: string;
//   productTitle: string;
//   variantName: string;
//   sku: string;
//   currentStock: number;
//   image: string | null;
//   threshold: number;
// }

// export interface InventoryRiskResponse {
//   items: InventoryRiskItem[];
//   totalPages: number;
//   totalDocs: number;
//   activeThreshold: number;
// }

// // ================================================================
// // 🚀 MAIN FUNCTION
// // ================================================================

// export async function getPaginatedInventoryRisk({
//   page = 1,
//   limit = DEFAULT_LIMIT,
// }: {
//   page?: number;
//   limit?: number;
// }): Promise<InventoryRiskResponse> {
//   // 🛡️ 1. SECURITY LOCK (RBAC)
//   await verifyStaff(["admin", "manager", "editor"]);

//   // 🧮 2. INPUT VALIDATION
//   const safePage = Math.max(1, page);
//   const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

//   const cacheKey = `analytics_inventory_risk:page_${safePage}:limit_${safeLimit}`;

//   try {
//     // ⚡ 3. CACHE CHECK (Redis)
//     const cachedData = (await redis.get(cacheKey)) as string | null;

//     if (cachedData) {
//       console.log(`⚡ Redis Cache Hit: Inventory Risk Audit (Page: ${safePage})`);
//       // ✅ ENTERPRISE FIX: Parse cached string to object
//       return JSON.parse(cachedData) as InventoryRiskResponse;
//     }

//     console.log(`🔄 Redis Cache Miss: Inventory Risk Audit (Page: ${safePage})`);

//     // 🗄️ 4. FETCH FROM PAYLOAD (Database B)
//     const payload = await getSafePayload();

//     // 4A. Fetch Global Settings for threshold
//     const settings = await payload.findGlobal({ slug: "settings" });
//     const threshold = settings?.inventorySettings?.lowStockThreshold ?? 5;

//     // 4B. Query products with low stock variants (projection to reduce data transfer)
//     const result = await payload.find({
//       collection: "products",
//       where: {
//         "variants.stock": { less_than_equal: threshold },
//       },
//       page: safePage,
//       limit: safeLimit,
//       depth: 0, // ✅ Only fetch top-level fields, no relations
//       select: {
//         id: true,
//         title: true,
//         variants: {
//           name: true,
//           stock: true,
//           sku: true,
//           images: true,
//         },
//       },
//     });

//     // 🔄 5. TRANSFORM DATA (Flatten variants into flat list)
//     const riskItems: InventoryRiskItem[] = [];

//     for (const product of result.docs) {
//       if (!Array.isArray(product.variants)) continue;

//       for (const variant of product.variants) {
//         const stock = variant?.stock ?? 0;

//         if (stock <= threshold) {
//           riskItems.push({
//             productId: product.id,
//             productTitle: product.title || "Untitled Product",
//             variantName: variant.name || "Default Variant",
//             sku: variant.sku || "N/A",
//             currentStock: stock,
//             image:
//               variant.images?.[0]?.url ||
//               product.variants?.[0]?.images?.[0]?.url ||
//               null,
//             threshold: threshold,
//           });
//         }
//       }
//     }

//     const response: InventoryRiskResponse = {
//       items: riskItems,
//       totalPages: result.totalPages || 0,
//       totalDocs: result.totalDocs || 0,
//       activeThreshold: threshold,
//     };

//     // 💾 6. STORE IN CACHE
//     await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL_SECONDS });

//     return response;
//   } catch (error: any) {
//     // 🛡️ 7. FALLBACK ERROR HANDLING
//     console.error("❌ Inventory Risk Engine Error:", error.message);

//     return {
//       items: [],
//       totalPages: 0,
//       totalDocs: 0,
//       activeThreshold: 5,
//     };
//   }
// }
// 📂 src/app/features/admin/inventory-cms/actions/payloadInventoryActions.ts (FULLY OPTIMIZED, CACHE-SAFE & TYPESCRIPT COMPILE-SAFE)

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { SystemStats, ISystemStats } from "@/models/SystemStats"; // ✅ FIXED: Imported both model and its TypeScript interface

// ✅ ENTERPRISE FIX: Safe serialization utilities imported
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// 📦 CONFIGURATION (ENTERPRISE SCALE OPTIMIZED)
// ================================================================

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 15;

// ✅ TTL increased to 1 hour (Inventory changes are infrequent)
const CACHE_TTL_SECONDS = 3600; // 1 Hour

// ================================================================
// 📦 INTERFACES
// ================================================================

export interface InventoryRiskItem {
  productId: string;
  productTitle: string;
  variantName: string;
  sku: string;
  currentStock: number;
  image: string | null;
  threshold: number;
}

export interface InventoryRiskResponse {
  items: InventoryRiskItem[];
  totalPages: number;
  totalDocs: number;
  activeThreshold: number;
}

// ================================================================
// 🚀 MAIN FUNCTION
// ================================================================

export async function getPaginatedInventoryRisk({
  page = 1,
  limit = DEFAULT_LIMIT,
}: {
  page?: number;
  limit?: number;
}): Promise<InventoryRiskResponse> {
  // 🛡️ 1. SECURITY LOCK (RBAC)
  await verifyStaff(["admin", "manager", "editor"]);

  // 🧮 2. INPUT VALIDATION
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

  const cacheKey = `analytics_inventory_risk:page_${safePage}:limit_${safeLimit}`;

  try {
    // ⚡ 3. CACHE CHECK (Redis)
    const cachedData = (await redis.get(cacheKey)) as string | null;

    // ✅ ENTERPRISE FIX: Parse cached data safely using custom safeParse
    const parsed = safeParse<InventoryRiskResponse>(cachedData);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Inventory Risk Audit (Page: ${safePage})`);
      return parsed;
    }

    console.log(`🔄 Redis Cache Miss: Inventory Risk Audit (Page: ${safePage})`);

    // 🗄️ 4. FETCH FROM PAYLOAD (Database B)
    const payload = await getSafePayload();

    // 4A. Fetch Global Settings for threshold
    const settings = await payload.findGlobal({ slug: "settings" });
    const threshold = settings?.inventorySettings?.lowStockThreshold ?? 5;

    // 4B. Query products with low stock variants (projection to reduce data transfer)
    const result = await payload.find({
      collection: "products",
      where: {
        "variants.stock": { less_than_equal: threshold },
      },
      page: safePage,
      limit: safeLimit,
      depth: 0, // ✅ Only fetch top-level fields, no relations
      select: {
        id: true,
        title: true,
        variants: {
          name: true,
          stock: true,
          sku: true,
          images: true,
        },
      },
    });

    // 🔄 5. TRANSFORM DATA (Flatten variants into flat list)
    const riskItems: InventoryRiskItem[] = [];

    for (const product of result.docs) {
      if (!Array.isArray(product.variants)) continue;

      for (const variant of product.variants) {
        const stock = variant?.stock ?? 0;

        if (stock <= threshold) {
          riskItems.push({
            productId: product.id,
            productTitle: product.title || "Untitled Product",
            variantName: variant.name || "Default Variant",
            sku: variant.sku || "N/A",
            currentStock: stock,
            image:
              variant.images?.[0]?.url ||
              product.variants?.[0]?.images?.[0]?.url ||
              null,
            threshold: threshold,
          });
        }
      }
    }

    // ✅ Fetch high-speed cached singleton SystemStats and explicitly typecast with ISystemStats to prevent strict compiler errors
    const stats = (await SystemStats.findOne({ _id: "inventory" }).lean()) as ISystemStats | null;

    const response: InventoryRiskResponse = {
      items: riskItems,
      totalPages: result.totalPages || 0,
      // ✅ ENTERPRISE SYNC: Display total critical variants count (28) instead of parent products (25) for 100% metric consistency
      totalDocs: stats ? stats.criticalStockCount : (result.totalDocs || 0), 
      activeThreshold: threshold,
    };

    // 💾 6. STORE IN CACHE
    // ✅ ENTERPRISE FIX: Write to Redis safely using safeStringify
    const stringified = safeStringify(response);
    await redis.set(cacheKey, stringified, { ex: CACHE_TTL_SECONDS });

    return response;
  } catch (error: any) {
    // 🛡️ 7. FALLBACK ERROR HANDLING
    console.error("❌ Inventory Risk Engine Error:", error.message);

    return {
      items: [],
      totalPages: 0,
      totalDocs: 0,
      activeThreshold: 5,
    };
  }
}