
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { BreadcrumbItem } from "../../../types";

// // GET CATEGORY TREE (For Navigation & Mega Menu)
// export const getPayloadNavigationCategories = async () => {
//   const payload = await getSafePayload();
  
//   const result = await payload.find({
//     collection: "categories",
//     depth: 5, 
//     limit: 100,
//   });

//   const allCategories = result.docs.map((cat: any) => ({
//     _id: cat.id,
//     _type: "category",
//     name: cat.name,
//     slug: cat.slug,
//     parent: (cat.parent && typeof cat.parent === "object") ? { _id: cat.parent.id } : null,
//     image: (cat.image && typeof cat.image === "object") ? cat.image.url : null,
//     subCategories: [] 
//   }));

//   const categoryMap: any = {};
//   allCategories.forEach((cat: any) => {
//     categoryMap[cat._id] = { ...cat, subCategories: [] };
//   });

//   const tree: any[] = [];
//   allCategories.forEach((cat: any) => {
//     if (cat.parent && categoryMap[cat.parent._id]) {
//       categoryMap[cat.parent._id].subCategories.push(categoryMap[cat._id]);
//     } else if (!cat.parent) {
//       tree.push(categoryMap[cat._id]);
//     }
//   });

//   return tree;
// };

// // PLACE FOR BREADCRUMBS LOGIC
// export const getPayloadBreadcrumbs = async (
//   type: "product" | "category" | "page" | "deals" | "search" | "blog" | "contact-us" | "faq", 
//   slug?: string
// ): Promise<BreadcrumbItem[]> => {
//   const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }];
  
//   try {
//     // 1. PRODUCTS & CATEGORIES
//     if ((type === "product" || type === "category") && slug) {
//       const payload = await getSafePayload();
//       let categorySlug = slug;

//       // If product, locate primary category
//       if (type === "product") {
//         const products = await payload.find({
//           collection: "products",
//           where: { slug: { equals: slug } },
//           depth: 1
//         });
//         const product = products.docs[0];
//         if (product && product.categories && product.categories.length > 0) {
//           // @ts-ignore
//           categorySlug = product.categories[0].slug;
//           breadcrumbs.push({ name: product.title, href: `/product/${slug}` });
//         }
//       }

//       // Fetch Category Hierarchy
//       const categories = await payload.find({
//         collection: "categories",
//         where: { slug: { equals: categorySlug } },
//         depth: 5
//       });

//       const category = categories.docs[0];
//       if (category) {
//         const path: any[] = [];
//         let current: any = category;
//         while (current) {
//           path.unshift({ name: current.name, href: `/category/${current.slug}` });
//           current = current.parent;
//         }
//         breadcrumbs.splice(1, 0, ...path);
//       }
//     }
    
//     // 2. INFO PAGES (Static structure generated using slug formatting)
//     else if (type === "page" && slug) {
//       const formattedName = slug
//         .split("-")
//         .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");

//       breadcrumbs.push({ name: formattedName, href: `/${slug}` });
//     }

//     // Static Pages
//     else if (type === "contact-us") breadcrumbs.push({ name: "Contact Us", href: "/contact-us" });
//     else if (type === "deals") breadcrumbs.push({ name: "Deals", href: "/deals" });
//     else if (type === "faq") breadcrumbs.push({ name: "FAQ", href: "/faq" });
//     else if (type === "search") breadcrumbs.push({ name: "Search Results", href: "/search" });

//   } catch (error) {
//     console.error("Payload Breadcrumbs Error:", error);
//   }

//   return breadcrumbs;
// };
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { BreadcrumbItem } from "../../../types";
import { unstable_cache } from "next/cache";

// =====================================================================
// 🚀 CACHED NAVIGATION CATEGORIES (Edge Cache)
// =====================================================================
const getCachedNavigationCategories = unstable_cache(
  async () => {
    const payload = await getSafePayload();

    // ✅ Depth reduced from 5 to 2 (parent + immediate children) for performance
    const result = await payload.find({
      collection: "categories",
      depth: 2,
      limit: 500,
    });

    const allCategories = result.docs.map((cat: any) => ({
      _id: cat.id,
      _type: "category",
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent && typeof cat.parent === "object" ? { _id: cat.parent.id } : null,
      image: cat.image && typeof cat.image === "object" ? cat.image.url : null,
      subCategories: [],
    }));

    const categoryMap: any = {};
    allCategories.forEach((cat: any) => {
      categoryMap[cat._id] = { ...cat, subCategories: [] };
    });

    const tree: any[] = [];
    allCategories.forEach((cat: any) => {
      if (cat.parent && categoryMap[cat.parent._id]) {
        categoryMap[cat.parent._id].subCategories.push(categoryMap[cat._id]);
      } else if (!cat.parent) {
        tree.push(categoryMap[cat._id]);
      }
    });

    return tree;
  },
  ["nav-categories"],
  { tags: ["nav-categories"], revalidate: false }
);

export const getPayloadNavigationCategories = async () => {
  return await getCachedNavigationCategories();
};

// =====================================================================
// 🚀 CACHED BREADCRUMBS (Edge Cache)
// =====================================================================
export const getPayloadBreadcrumbs = async (
  type: "product" | "category" | "page" | "deals" | "search" | "blog" | "contact-us" | "faq",
  slug?: string
): Promise<BreadcrumbItem[]> => {
  const cacheKey = `breadcrumbs-${type}-${slug || "static"}`;

  const getCachedBreadcrumbs = unstable_cache(
    async () => {
      const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }];
      const payload = await getSafePayload();

      try {
        // 1. PRODUCTS & CATEGORIES
        if ((type === "product" || type === "category") && slug) {
          let categorySlug = slug;

          // If product, locate primary category
          if (type === "product") {
            const products = await payload.find({
              collection: "products",
              where: { slug: { equals: slug } },
              depth: 1,
            });
            const product = products.docs[0];
            // ✅ FIX: Proper type-safe category extraction
            if (product && Array.isArray(product.categories) && product.categories.length > 0) {
              const firstCategory = product.categories[0];
              // ✅ Safe extraction with type guard
              categorySlug = typeof firstCategory === "object" && firstCategory !== null
                ? (firstCategory as any).slug || firstCategory
                : String(firstCategory);
              
              // ✅ Only push product name to breadcrumbs if we have a valid category
              breadcrumbs.push({ name: product.title, href: `/product/${slug}` });
            }
          }

          // Fetch Category Hierarchy
          const categories = await payload.find({
            collection: "categories",
            where: { slug: { equals: categorySlug } },
            depth: 5,
          });

          const category = categories.docs[0];
          if (category) {
            const path: any[] = [];
            let current: any = category;
            while (current) {
              path.unshift({ name: current.name, href: `/category/${current.slug}` });
              current = current.parent;
            }
            breadcrumbs.splice(1, 0, ...path);
          }
        }

        // 2. INFO PAGES
        else if (type === "page" && slug) {
          const formattedName = slug
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          breadcrumbs.push({ name: formattedName, href: `/${slug}` });
        }

        // Static Pages
        else if (type === "contact-us") breadcrumbs.push({ name: "Contact Us", href: "/contact-us" });
        else if (type === "deals") breadcrumbs.push({ name: "Deals", href: "/deals" });
        else if (type === "faq") breadcrumbs.push({ name: "FAQ", href: "/faq" });
        else if (type === "search") breadcrumbs.push({ name: "Search Results", href: "/search" });
      } catch (error) {
        console.error("Payload Breadcrumbs Error:", error);
      }

      return breadcrumbs;
    },
    [cacheKey],
    { tags: [cacheKey], revalidate: false }
  );

  return await getCachedBreadcrumbs();
};