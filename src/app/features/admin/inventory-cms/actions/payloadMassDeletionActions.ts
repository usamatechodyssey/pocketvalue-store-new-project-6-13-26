// 📂 src/app/features/admin/inventory-cms/actions/payloadMassDeletionActions.ts (DECOUPLED & OMS-SECURED)

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { verifyStaff } from "@/lib/payloadAuth";
import z from "zod"; 
import { Payload } from "payload"; 
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// ✅ OMS INTEGRITY IMPORTS
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";

// --- CONFIGURATION ---
const CONFIRMATION_PHRASE = "I AM SURE"; 

// --- Zod Schema for Validation ---
const PayloadMassDeletionSchema = z.object({
  identifier: z.string().min(1, "Category Name or Slug is required."),
  confirmPhrase: z.string().refine((val: string) => val === CONFIRMATION_PHRASE, {
    message: `You must type the phrase '${CONFIRMATION_PHRASE}' exactly to confirm deletion.`,
  }),
});

export type MassDeletionPayload = z.infer<typeof PayloadMassDeletionSchema>;

// ============================================================================
// 🔧 HELPER: RECURSIVE CATEGORY/PRODUCT HIERARCHY SCANNER
// ============================================================================
async function findCategoryHierarchy(
  payload: Payload, 
  valueIdentifier: string, 
  allCategories: any[] 
): Promise<{ categoryIds: string[], productIds: string[] }> {
  
  const rootCategory = allCategories.find((c: any) => 
    c.slug === valueIdentifier.toLowerCase() || c.name.toLowerCase() === valueIdentifier.toLowerCase()
  );

  if (!rootCategory) {
    throw new Error(`Category "${valueIdentifier}" not found.`);
  }

  const categoryIdsToScan: string[] = [rootCategory.id]; 
  let productsToDelete: string[] = [];

  const findSubCategories = (parentId: string) => {
    const children = allCategories.filter((c: any) => {
      if (!c.parent) return false;
      const parentIdValue = typeof c.parent === 'object' ? (c.parent.id || c.parent._id) : c.parent;
      return String(parentIdValue) === String(parentId);
    });

    children.forEach((child: any) => {
      categoryIdsToScan.push(child.id); 
      findSubCategories(child.id); 
    });
  };

  findSubCategories(rootCategory.id);

  const productsResult = await payload.find({
    collection: "products",
    where: { categories: { in: categoryIdsToScan } },
    limit: 99999, 
    depth: 0 // Fetch IDs only (Memory Optimized)
  });
  
  productsToDelete = productsResult.docs.map((p: any) => p.id);

  return { categoryIds: categoryIdsToScan, productIds: productsToDelete }; 
}

// ============================================================================
// 🚀 MAIN ACTION: MASS DELETE CATEGORY PRODUCTS HIERARCHY (OMS PROTECTED)
// ============================================================================
export async function massDeleteCategoryHierarchyPayload(
  payloadData: MassDeletionPayload
): Promise<{ success: boolean; message: string; logs?: string[] }> {
  
  // 🛡️ 1. Security check: Only root Super Admins can invoke bulk destructions
  await verifyStaff(["admin"]);
  
  const validation = PayloadMassDeletionSchema.safeParse(payloadData);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }
  const { identifier } = validation.data;
    
  const payload = await getSafePayload();
  const logs: string[] = [];

  try {
    logs.push(`🔍 Starting mass product deletion under category: "${identifier}"`);

    // Memory-safety category projections (Only select needed keys)
    const allCategoriesResult = await payload.find({ 
      collection: "categories", 
      limit: 99999, 
      depth: 1,
      select: { name: true, slug: true, parent: true } 
    });
    const allCategories = allCategoriesResult.docs;

    const { categoryIds: categoriesScanned, productIds: productIdsToDelete } = 
      await findCategoryHierarchy(payload, identifier, allCategories);

    if (productIdsToDelete.length === 0) {
      logs.push(`⚠️ No products found linked to category "${identifier}". Nothing to delete.`);
      return { success: true, message: "No matching products found for deletion in this hierarchy.", logs };
    }

    logs.push(`Categories scanned: ${categoriesScanned.length}`);
    logs.push(`Products targeted: ${productIdsToDelete.length}`);

    // ================================================================
    // 🛡️ OMS PIPELINE INTEGRITY LOCK
    // (Prevents deleting products currently processing inside active orders)
    // ================================================================
    await connectMongoose();
    
    const ACTIVE_OMS_STATUSES = ["Pending", "Payment Verified", "Processing", "Ready to Ship", "Shipped", "In Transit"];
    
    // Find active unfulfilled orders containing any of the targeted product IDs
    const activeOrders = await Order.find({
      "products.productId": { $in: productIdsToDelete },
      status: { $in: ACTIVE_OMS_STATUSES }
    }, { orderId: 1 }).lean<{ orderId: string }[]>();

    if (activeOrders.length > 0) {
      const activeIdsList = activeOrders.map(o => o.orderId).join(", ");
      const errorMsg = `Mass deletion aborted: Targeted products are currently active in unfulfilled orders: [${activeIdsList}]. Please fulfill or cancel these orders before deleting the product catalog.`;
      
      logs.push(`🚨 [OMS BLOCK] Deletion aborted. Products are active in unfulfilled orders: ${activeIdsList}`);
      return { success: false, message: errorMsg, logs };
    }

    // --- Bulk Database Deletion ---
    logs.push(`🗑️ Bulk deleting ${productIdsToDelete.length} products...`);
    
    await payload.delete({
      collection: "products",
      where: {
        id: {
          in: productIdsToDelete
        }
      },
      overrideAccess: true
    });

    logs.push(`✅ Successfully deleted ${productIdsToDelete.length} products.`);
    logs.push(`🎉 Product deletion completed for category "${identifier}".`);

    // Clear Next.js cache paths
    revalidatePath("/");
    revalidatePath("/admin/products");
    
    // Clear dynamic pricing/attribute filters cache
    try {
      revalidateTag("filter-data", "max");
      console.log(`✅ [Filter Cache] Revalidated after mass deletion of ${productIdsToDelete.length} products.`);
    } catch (e) {}

    return { 
      success: true, 
      message: `Successfully deleted ${productIdsToDelete.length} products from category "${identifier}" hierarchy. Active orders are safe.`, 
      logs 
    };

  } catch (error: any) {
    logs.push(`❌ CRITICAL ERROR: ${error.message}`);
    console.error("Mass Product Deletion Action Error:", error);
    return { success: false, message: error.message || "An unexpected error occurred during mass product deletion.", logs };
  }
} 