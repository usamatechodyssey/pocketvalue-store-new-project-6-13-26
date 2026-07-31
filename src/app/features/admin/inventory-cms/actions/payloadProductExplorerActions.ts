// src/app/features/admin/inventory-cms/actions/payloadProductExplorerActions.ts (or wherever the server action is defined)

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { AdminProductListItem } from "@/app/features/admin/inventory-cms/components/payload-products/ProductsTable";
import { verifyStaff } from "@/lib/payloadAuth"; 

export async function getPaginatedAdminProductsPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = "" 
}) {
  try {
    // 🛡️ SECURITY LOCK: Admins, Managers, and Editors can access Product Explorer
    await verifyStaff(["admin", "manager", "editor"]);

    const payload = await getSafePayload();

    // Payload query: Search by ID, Title, SKU, or Variant ID
    const whereClause: any = searchTerm ? {
      or: [
        { id: { equals: searchTerm } }, 
        { title: { contains: searchTerm } },
        { slug: { contains: searchTerm } },
        { "variants.sku": { contains: searchTerm } },
        { "variants.id": { contains: searchTerm } }, 
      ]
    } : {};

    // ✅ ENTERPRISE UPGRADE: Restored query depth from 1 to 2.
    // This allows nested variant media relations to fully populate for standard modes.
    const result = await payload.find({
      collection: "products",
      where: whereClause,
      page,
      limit,
      depth: 2, 
      sort: "-createdAt"
    });

    // Map payload collection output to UI compatible AdminProductListItem structure
    const products: AdminProductListItem[] = result.docs.map((doc: any) => {
      const prices = doc.variants?.map((v: any) => v.price) || [0];
      const minPrice = Math.min(...prices);
      
      // ✅ ENTERPRISE UPGRADE: Dynamic main image resolver supporting both CDN Mode & Upload Mode
      const firstVariant = doc.variants?.[0];
      let mainImagePayload: any = null;

      if (firstVariant) {
        if (Array.isArray(firstVariant.cdnImages) && firstVariant.cdnImages.length > 0) {
          // CDN Mode ON: Use the direct text URL object
          mainImagePayload = firstVariant.cdnImages[0];
        } else if (Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
          // CDN Mode OFF: Use the populated media relationship object
          mainImagePayload = firstVariant.images[0];
        }
      }
      
      return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        price: minPrice,
        stock: doc.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0),
        inStock: doc.variants?.some((v: any) => v.inStock),
        mainImage: mainImagePayload, // Resolves seamlessly with urlFor on the client
        variantsCount: doc.variants?.length || 0,
        variants: doc.variants?.map((v: any) => ({
          _key: v.id, 
          name: v.name,
          sku: v.sku,
          price: v.price,
          inStock: v.inStock,
          stock: v.stock
        }))
      };
    });

    return {
      products,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs
    };

  } catch (error: any) {
    console.error("Payload Product Admin Actions Error:", error.message);
    return { products: [], totalPages: 0, totalDocs: 0 };
  }
}