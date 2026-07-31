

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";

export async function getPaginatedAdminCategoriesPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = "" 
}) {
  // Use connection-safe client from the global cache singleton
  const payload = await getSafePayload();

  const whereClause: any = searchTerm ? {
    or: [
      { name: { contains: searchTerm } },
      { slug: { contains: searchTerm } },
    ]
  } : {};

  // 1. Fetch Categories
  const result = await payload.find({
    collection: "categories",
    where: whereClause,
    page,
    limit,
    depth: 1, // To capture parent details
    sort: "name"
  });

  // 2. Calculate Counts in parallel for performance optimization
  const categoriesWithCounts = await Promise.all(result.docs.map(async (cat: any) => {
    // Determine sub-categories count
    const subCats = await payload.count({
      collection: "categories",
      where: { parent: { equals: cat.id } }
    });

    // Determine linked products count
    const prods = await payload.count({
      collection: "products",
      where: { categories: { in: [cat.id] } }
    });

    return {
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent ? { _id: cat.parent.id, name: cat.parent.name } : null,
      subCategoryCount: subCats.totalDocs,
      productCount: prods.totalDocs
    };
  }));

  return {
    categories: categoriesWithCounts,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs
  };
}