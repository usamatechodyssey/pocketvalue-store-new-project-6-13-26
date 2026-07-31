// src/app/features/admin/inventory-cms/actions/payloadCategoryActions.ts (or wherever mass deletion is defined)

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { z } from "zod"; // For validation and ZodError
import { Payload } from "payload"; // Payload type for typing
import { verifyStaff } from "@/lib/payloadAuth";

// --- CONFIGURATION ---
const CONFIRMATION_PHRASE = "I AM SURE"; // Required phrase for mass deletion

// --- Zod Schema for Validation ---
const PayloadMassDeletionSchema = z.object({
  identifier: z.string().min(1, "Category Name or Slug is required."),
  confirmPhrase: z.string().refine((val: string) => val === CONFIRMATION_PHRASE, {
    message: `You must type the phrase '${CONFIRMATION_PHRASE}' exactly to confirm deletion.`,
  }),
});

export type MassDeletionPayload = z.infer<typeof PayloadMassDeletionSchema>;

// --- Helper for Recursive Category/Product Finding ---
async function findCategoryHierarchy(
  payload: Payload, 
  identifier: string, 
  allCategories: any[] // Cached all categories for efficiency
): Promise<{ categoryIds: string[], productIds: string[] }> {
  // Explicitly typed 'c' parameter to prevent implicit any warnings
  const rootCategory = allCategories.find((c: any) => 
    c.slug === identifier.toLowerCase() || c.name.toLowerCase() === identifier.toLowerCase()
  );

  if (!rootCategory) {
    throw new Error(`Category "${identifier}" not found.`);
  }

  const categoryIdsToScan: string[] = [rootCategory.id]; // These categories are scanned only, not deleted
  let productsToDelete: string[] = [];

  // Find all sub-categories recursively to get all product links
  const findSubCategories = (parentId: string) => {
    // ✅ ENTERPRISE UPGRADE: Highly resilient scanner that supports both populated objects and unpopulated string ID parent fields
    const children = allCategories.filter((c: any) => {
      if (!c.parent) return false;
      const parentIdValue = typeof c.parent === 'object' ? (c.parent.id || c.parent._id) : c.parent;
      return String(parentIdValue) === String(parentId);
    });

    children.forEach((child: any) => {
      categoryIdsToScan.push(child.id); // Add to the scanning list
      findSubCategories(child.id); // Recurse
    });
  };

  findSubCategories(rootCategory.id);

  // Find all products linked to these categories
  const productsResult = await payload.find({
    collection: "products",
    where: { categories: { in: categoryIdsToScan } },
    limit: 99999, // Max limit to capture all docs
    depth: 0 // IDs only
  });
  
  productsToDelete = productsResult.docs.map((p: any) => p.id);

  return { categoryIds: categoryIdsToScan, productIds: productsToDelete }; 
}

export async function massDeleteCategoryHierarchyPayload(
  payloadData: MassDeletionPayload
): Promise<{ success: boolean; message: string; logs?: string[] }> {
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

    const allCategoriesResult = await payload.find({ collection: "categories", limit: 99999, depth: 1 });
    const allCategories = allCategoriesResult.docs;

    const { categoryIds: categoriesScanned, productIds: productIdsToDelete } = 
      await findCategoryHierarchy(payload, identifier, allCategories);

    if (productIdsToDelete.length === 0) {
      logs.push(`⚠️ No products found linked to category "${identifier}" or its sub-categories. Nothing to delete.`);
      return { success: true, message: "No matching products found for deletion in this hierarchy.", logs };
    }

    logs.push(`Categories scanned for products: ${categoriesScanned.length}`);
    logs.push(`Products targeted for deletion: ${productIdsToDelete.length}`);

    // --- Delete Products (Bulk Database Transaction Upgrade) ---
    logs.push(`🗑️ Bulk deleting ${productIdsToDelete.length} products...`);
    
    // ✅ ENTERPRISE UPGRADE: Migrated from slow, loop-based individual delete Promises to a highly optimized single bulk-delete transaction
    // This reduces DB request operations from hundreds to just one single safe database transaction
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

    // ✅ Clear homepage and product-related caches
    revalidatePath("/");
    revalidatePath("/admin/products");
    
    // ✅ Clear filter-data cache because product deletion affects brands, price ranges, and attributes
    revalidateTag("filter-data","max");
    console.log(`✅ [Filter Cache] Revalidated after mass deletion of ${productIdsToDelete.length} products.`);

    return { 
      success: true, 
      message: `Successfully deleted ${productIdsToDelete.length} products from category "${identifier}" hierarchy. Categories are safe.`, 
      logs 
    };

  } catch (error: any) {
    logs.push(`❌ CRITICAL ERROR: ${error.message}`);
    console.error("Mass Product Deletion Action Error:", error);
    return { success: false, message: error.message || "An unexpected error occurred during mass product deletion.", logs };
  }
}