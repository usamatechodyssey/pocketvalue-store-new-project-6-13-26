// src/app/features/admin/inventory-cms/actions/payloadCategoryActions.ts

"use server";

import { revalidatePath } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { CategoryCsvRowSchema } from "@/app/shared/lib/zodSchemas"; // Category CSV schema
import { ZodError } from "zod"; 
import { verifyStaff } from "@/lib/payloadAuth";

// ============================================================================
// SELF-CONTAINED HELPER: DOWNLOADS AND UPLOADS BUFFER TO PAYLOAD
// ============================================================================
export async function uploadImageToPayload(
  url: string,
  filename: string,
  payload: any,
): Promise<string | null> {
  if (!url || !url.startsWith("http")) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout limit

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const mediaDoc = await payload.create({
      collection: "media",
      data: { alt: filename },
      file: {
        data: buffer,
        name: `${filename}-${Date.now()}.jpg`,
        mimetype: response.headers.get("content-type") || "image/jpeg",
        size: buffer.byteLength,
      },
    });

    return mediaDoc.id;
  } catch (error: any) {
    console.error(
      `[Payload Media Upload Error] Failed for ${url}: ${error.message}`,
    );
    return null;
  }
}

// ============================================================================
// MAIN BATCH CATEGORY IMPORT SERVER ACTION
// ============================================================================
export async function batchCreateCategoriesPayload(categoriesData: any[]) {
   
  // 🛡️ SECURITY LOCK: Only Admin and Manager can perform bulk category imports
  await verifyStaff(["admin", "manager"]);
    
  // ✅ 1. Fetch settings to determine CDN Mode
  const settings = await getCachedSettings();
  const cdnMode = settings?.cdnMode ?? true; // Default: ON

  const payload = await getSafePayload();
  let successfulCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // Fetch all existing categories once to optimize relationship linking
  const existingCategoriesResult = await payload.find({ collection: "categories", limit: 1000, depth: 0 });
  const cachedCategories = existingCategoriesResult.docs; // Array of Payload category documents

  // Step 1: Validate and process category data from CSV
  const processedCategoryData: {
    name: string;
    slug: string;
    parent_slug?: string;
    image_url?: string;
    tempId: string; // Temporary ID for internal linking before Payload IDs are assigned
  }[] = [];

  // Typecasted 'row' and 'index' parameters explicitly to prevent TS-7006 errors
  categoriesData.forEach((row: any, index: number) => {
    try {
      const validated = CategoryCsvRowSchema.parse(row);
      // Generate a temporary unique ID for internal mapping during the process
      processedCategoryData.push({ ...validated, tempId: `temp-${index}-${validated.slug}` });
    } catch (error: any) {
      failedCount++;
      if (error instanceof ZodError) {
        errors.push(`Row ${index + 2} (Slug: ${row.slug || "N/A"}): Validation failed - ${error.issues[0].message}`);
      } else {
        errors.push(`Row ${index + 2} (Slug: ${row.slug || "N/A"}): Processing error - ${error.message}`);
      }
    }
  });

  if (processedCategoryData.length === 0) {
    return { success: false, successful: 0, failed: failedCount, errors: errors.length > 0 ? errors : ["No valid categories to import."] };
  }

  // --- Phase 1: Create Categories (without parents initially) and handle images ---
  const categoriesProcessedInThisBatch: {
    id: string; // Payload's actual ID
    name: string;
    slug: string;
    parent_slug?: string;
    tempId: string; // Original temporary ID from processedCategoryData
  }[] = [];

  for (const catData of processedCategoryData) {
    // Check if category already exists by slug to prevent duplicates (Typecasted iterator 'c')
    const existingCategory = cachedCategories.find((c: any) => c.slug === catData.slug);
        
    if (existingCategory) {
      categoriesProcessedInThisBatch.push({ ...existingCategory, tempId: catData.tempId, parent_slug: catData.parent_slug });
      successfulCount++; 
      continue; 
    }

    try {
      let mediaId: string | undefined = undefined;

      if (catData.image_url) {
        // ✅ ENTERPRISE UPGRADE: CDN Mode aware image saving for categories import
        if (cdnMode) {
          // 🚀 CDN Mode ON — Create Media document directly with raw URL, bypassing heavy binary fetch calls
          const mediaDoc = await payload.create({
            collection: "media",
            data: {
              alt: catData.slug,
              imageUrl: catData.image_url,
            },
          });
          mediaId = mediaDoc.id;
        } else {
          // 📸 CDN Mode OFF — Fetch and upload file physically to Media collection
          const uploadedMediaId = await uploadImageToPayload(catData.image_url, catData.slug, payload);
          if (uploadedMediaId) {
            mediaId = uploadedMediaId;
          } else {
            errors.push(`Category "${catData.name}": Failed to upload image from URL "${catData.image_url}".`);
          }
        }
      }

      // Create new category in Payload
      const newCategory = await (payload.create as any)({
        collection: "categories",
        data: {
          name: catData.name,
          slug: catData.slug,
          image: mediaId 
        }
      });
            
      // Add to temporary list and cache for subsequent relationships
      categoriesProcessedInThisBatch.push({ ...newCategory, tempId: catData.tempId, parent_slug: catData.parent_slug });
      cachedCategories.push(newCategory); 
      successfulCount++;

    } catch (error: any) {
      failedCount++;
      errors.push(`Failed to create category "${catData.name}": ${error.message}`);
      console.error(`[Category Batch Error] Creating "${catData.name}":`, error);
    }
  }

  // --- Phase 2: Update Categories with Parent Relationships ---
  let parentsLinkedCount = 0;
  for (const cat of categoriesProcessedInThisBatch) {
    if (cat.parent_slug) {
      // Find parent from combined list (Typecasted iterator 'c')
      const parentCat = cachedCategories.find((c: any) => c.slug === cat.parent_slug);
      if (parentCat) {
        try {
          await (payload.update as any)({
            collection: "categories",
            id: cat.id,
            data: {
              parent: parentCat.id
            }
          });
          parentsLinkedCount++;
        } catch (error: any) {
          errors.push(`Category "${cat.name}": Failed to link parent "${cat.parent_slug}" - ${error.message}`);
          console.error(`[Category Batch Error] Linking parent for "${cat.name}":`, error);
        }
      } else {
        errors.push(`Category "${cat.name}": Parent category "${cat.parent_slug}" not found in Payload or CSV.`);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/categories"); 

  return {
    success: failedCount === 0,
    successful: successfulCount,
    failed: failedCount,
    errors,
    message: `Import Processed. Created/Updated: ${successfulCount}, Failed: ${failedCount}, Parents Linked: ${parentsLinkedCount}`
  };
}