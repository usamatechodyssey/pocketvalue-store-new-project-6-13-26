// 📂 src/app/features/admin/inventory-cms/actions/payloadCategoryAdminActions.ts (FULLY HARDENED & BSON-SAFE)

"use server";

import mongoose from "mongoose";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { verifyStaff } from "@/lib/payloadAuth"; 

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// ================================================================
export interface AdminCategoryListItem {
  _id: string;
  name: string;
  slug: string;
  parent: { _id: string; name: string } | null;
  subCategoryCount: number;
  productCount: number;
}

export interface AdminCategoryResponse {
  categories: AdminCategoryListItem[];
  totalPages: number;
  totalDocs: number;
}

// ================================================================
// 🚀 MAIN ACTION: GET PAGINATED CATEGORIES (With BSON Protection)
// ================================================================
export async function getPaginatedAdminCategoriesPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = "" 
}): Promise<AdminCategoryResponse> {
  try {
    // 🛡️ 1. RBAC Security Lock
    await verifyStaff(["admin", "manager", "editor"]);

    await connectMongoose();
    const payload = await getSafePayload();

    const cleanSearch = searchTerm.trim();
    const whereClause: any = cleanSearch ? {
      or: [
        { name: { contains: cleanSearch } },
        { slug: { contains: cleanSearch } },
      ]
    } : {};

    // 🛡️ 2. Fetch Categories (Page Slice)
    const result = await payload.find({
      collection: "categories",
      where: whereClause,
      page,
      limit,
      depth: 1, // Depth 1 to capture parent details natively
      sort: "name"
    });

    const catIds = result.docs.map((c: any) => c.id).filter(Boolean);

    if (catIds.length === 0) {
      return { categories: [], totalPages: 0, totalDocs: 0 };
    }

    // ================================================================
    // ⚡ NATIVE MONGO GROUP AGGREGATIONS (BSON Protected)
    // ================================================================
    
    // Explicitly resolve Mongoose Models securely
    const CategoryModel = mongoose.models.categories || mongoose.model("categories", new mongoose.Schema({}, { strict: false }));
    const ProductModel = mongoose.models.products || mongoose.model("products", new mongoose.Schema({}, { strict: false }));

    // ✅ FIX: Filter out any non-hex category IDs before casting to prevent fatal BSONTypeErrors
    const safeObjectIds = catIds
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const [batchSubCats, batchProducts] = await Promise.all([
      // 🛡️ Aggregation 1: Group and sum subcategories mapped to these parent category IDs
      CategoryModel.aggregate([
        { $match: { parent: { $in: safeObjectIds } } },
        { $group: { _id: "$parent", count: { $sum: 1 } } }
      ]),
      // 🛡️ Aggregation 2: Group and sum products mapped to these category IDs
      ProductModel.aggregate([
        { $match: { categories: { $in: safeObjectIds } } },
        { $unwind: "$categories" },
        { $group: { _id: "$categories", count: { $sum: 1 } } }
      ])
    ]);

    // Map subcategories count in-memory (O(1) lookups)
    const subCatCountMap = new Map<string, number>(
      batchSubCats.map((item: any) => [String(item._id), item.count])
    );

    // Map products count in-memory (O(1) lookups)
    const productCountMap = new Map<string, number>(
      batchProducts.map((item: any) => [String(item._id), item.count])
    );

    // 🛡️ 3. Format Response DTO
    const categoriesWithCounts: AdminCategoryListItem[] = result.docs.map((cat: any) => {
      return {
        _id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent ? { _id: cat.parent.id, name: cat.parent.name } : null,
        subCategoryCount: subCatCountMap.get(String(cat.id)) || 0,
        productCount: productCountMap.get(String(cat.id)) || 0
      };
    });

    return {
      categories: categoriesWithCounts,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs
    };

  } catch (error: any) {
    console.error("Payload Category Admin Actions Error:", error.message);
    return { categories: [], totalPages: 0, totalDocs: 0 };
  }
}