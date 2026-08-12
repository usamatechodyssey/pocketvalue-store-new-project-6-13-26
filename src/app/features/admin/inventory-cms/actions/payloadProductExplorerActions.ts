// 📂 src/app/features/admin/inventory-cms/actions/payloadProductExplorerActions.ts (FULLY HARDENED & SEARCH SAFE)

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { AdminProductListItem } from "@/app/features/admin/inventory-cms/components/payload-products/ProductsTable";
import { verifyStaff } from "@/lib/payloadAuth"; 

// ================================================================
// 🚀 MAIN ACTION: GET PAGINATED ADMIN PRODUCTS
// ================================================================
export async function getPaginatedAdminProductsPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = "" 
}) {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "editor"]);

    // 🛡️ 2. Build Safe Query (CastError Protection Guard)
    const cleanSearch = searchTerm.trim();
    
    // Regex matches 24-character hexadecimal MongoDB ObjectIds
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const orClauses: any[] = [
      { title: { contains: cleanSearch } },
      { slug: { contains: cleanSearch } },
      { "variants.sku": { contains: cleanSearch } },
      { "variants.id": { contains: cleanSearch } }, 
    ];

    // ✅ FIX: Only query `id` equals if the search term is a valid ObjectId
    // This completely prevents fatal CastError exceptions when searching standard text queries
    if (isValidObjectId(cleanSearch)) {
      orClauses.push({ id: { equals: cleanSearch } });
    }

    const whereClause: any = cleanSearch ? { or: orClauses } : {};

    const payload = await getSafePayload();

    // 🛡️ 3. Query Payload CMS (Depth 2 for variant media resolution)
    const result = await payload.find({
      collection: "products",
      where: whereClause,
      page,
      limit,
      depth: 2, 
      sort: "-createdAt"
    });

    // 🛡️ 4. Map output to UI compatible DTO structure
    const products: AdminProductListItem[] = result.docs.map((doc: any) => {
      const prices = doc.variants?.map((v: any) => v.price) || [0];
      const minPrice = Math.min(...prices);
      
      const firstVariant = doc.variants?.[0];
      let mainImagePayload: any = null;

      if (firstVariant) {
        if (Array.isArray(firstVariant.cdnImages) && firstVariant.cdnImages.length > 0) {
          // CDN Mode: Direct Text URL
          mainImagePayload = firstVariant.cdnImages[0];
        } else if (Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
          // Upload Mode: Populated media relationship
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
        mainImage: mainImagePayload, 
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