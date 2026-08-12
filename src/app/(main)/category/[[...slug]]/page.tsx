
// // src/app/(main)/category/[...slug]/page.tsx
// // ================================================================
// // 🏷️ ENTERPRISE CATEGORY PAGE ENGINE (UPGRADED — FINAL)
// // ================================================================
// // This file handles category pages with full SEO optimization:
// // ✅ ISR + Edge caching with on-demand revalidation
// // ✅ CollectionPage + BreadcrumbList Schema (#67, #77)
// // ✅ Content freshness signals in metadata (#23)
// // ✅ Entity linking for AI overviews (#39)
// // ✅ Dynamic product listing with filters
// // ✅ Responsive banners (desktop + mobile)
// // ✅ Sub-category navigation
// // ================================================================

// import { notFound } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { unstable_cache } from "next/cache";
// import { FiArrowLeft } from "react-icons/fi";

// // ✅ Type Imports
// import SanityProduct, { SanityCategory } from "@/types";

// // ✅ Payload + Caching Imports
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// // ✅ Centralized Settings Cache
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// // ✅ UI Components
// import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
// import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
// import { generateBaseMetadata } from "@/utils/metadata";
// import { urlFor } from "@/sanity/lib/image";

// // ✅ Structured Data Utilities (#67, #77)
// import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

// // ✅ Types
// type CategoryPageProps = {
//   params: Promise<{ slug: string[] }>;
//   searchParams: Promise<{ page?: string; sort?: string }>;
// };

// // =====================================================
// // ✅ ISR: Statically generated, served from CDN
// // =====================================================
// export const revalidate = false;

// // =========================================================================
// // 🔥 LIGHTWEIGHT METADATA FETCH (No products, no sub-categories)
// // =========================================================================
// const getCachedCategoryMetadata = async (slug: string) => {
//   return unstable_cache(
//     async () => {
//       const payload = await getSafePayload();

//       const categoryResult = await payload.find({
//         collection: "categories",
//         where: { slug: { equals: slug } },
//         depth: 1,
//       });

//       const categoryDoc = categoryResult.docs[0];
//       if (!categoryDoc) return null;

//       return {
//         name: categoryDoc.name,
//         slug: categoryDoc.slug,
//         description: (categoryDoc as any).description || null,
//         image: (categoryDoc.image as any)?.url || null,
//         seo: (categoryDoc.seo as any) || {},
//         desktopBanner: (categoryDoc as any).desktopBanner || null,
//         mobileBanner: (categoryDoc as any).mobileBanner || null,
//         // ✅ Added timestamps for freshness (#23)
//         createdAt: categoryDoc.createdAt,
//         updatedAt: categoryDoc.updatedAt,
//       };
//     },
//     [`category-meta-${slug}`],
//     {
//       tags: [`category-${slug}`],
//       revalidate: false,
//     }
//   )();
// };

// // =========================================================================
// // 🔥 FULL CATEGORY DATA (For product listing)
// // =========================================================================
// const getCachedCategoryData = async (slug: string, page: number, sort?: string) => {
//   const cacheKey = `category-${slug}-${page}-${sort || "newest"}`;

//   return unstable_cache(
//     async () => {
//       const payload = await getSafePayload();

//       // 1️⃣ Fetch Current Category
//       const categoryResult = await payload.find({
//         collection: "categories",
//         where: { slug: { equals: slug } },
//         depth: 2,
//       });

//       const categoryDoc = categoryResult.docs[0];
//       if (!categoryDoc) return null;

//       // 2️⃣ Fetch Sub-Categories (Children)
//       const subCategoriesResult = await payload.find({
//         collection: "categories",
//         where: { parent: { equals: categoryDoc.id } },
//         sort: "name",
//         limit: 50,
//       });

//       const mappedSubCategories: SanityCategory[] = subCategoriesResult.docs.map(
//         (sub: any) => ({
//           _id: sub.id,
//           name: sub.name,
//           slug: sub.slug,
//           parent: { _id: categoryDoc.id } as any,
//           image: (sub.image as any)?.url || null,
//           subCategories: [],
//           seo: {},
//         })
//       );

//       // 3️⃣ Fetch Products & Global Filters
//       const productData = await getPayloadProducts({
//         categorySlug: slug,
//         page: page,
//         sortOrder: sort || "newest",
//       });

//       const currentCategory: SanityCategory = {
//         _id: categoryDoc.id,
//         name: categoryDoc.name,
//         slug: categoryDoc.slug,
//         parent: null,
//         desktopBanner: (categoryDoc as any).desktopBanner,
//         mobileBanner: (categoryDoc as any).mobileBanner,
//         description: (categoryDoc as any).description,
//         image: (categoryDoc.image as any)?.url || null,
//         seo: (categoryDoc.seo as any) || {},
//         subCategories: mappedSubCategories,
//       };

//       const selfTree: SanityCategory = {
//         ...currentCategory,
//         subCategories: mappedSubCategories,
//       };

//       return {
//         initialProducts: productData.products as SanityProduct[],
//         totalCount: productData.totalCount,
//         filterData: productData.filterData,
//         currentCategory,
//         selfTree,
//       };
//     },
//     [cacheKey],
//     {
//       tags: [`category-${slug}`],
//       revalidate: false,
//     }
//   )();
// };

// // =========================================================================
// // 🔥 METADATA GENERATION (Enhanced with freshness signals)
// // =========================================================================
// export async function generateMetadata({ params }: CategoryPageProps) {
//   const { slug } = await params;
//   const currentSlug = slug[slug.length - 1];

//   const metaData = await getCachedCategoryMetadata(currentSlug);
//   if (!metaData) return {};

//   const { name, description, image, seo, createdAt, updatedAt } = metaData;
//   const now = new Date().toISOString();

//   return generateBaseMetadata({
//     title: seo.metaTitle || name,
//     description:
//       seo.metaDescription ||
//       description ||
//       `Shop for ${name} online at PocketValue.`,
//     image: seo.ogImage || image,
//     path: `/category/${currentSlug}`,
//     // ✅ Point #23: Content Freshness
//     publishedTime: createdAt || now,
//     modifiedTime: updatedAt || createdAt || now,
//     // ✅ Point #80: Publisher/Author signals
//     author: "PocketValue Team",
//     section: "Category",
//     // ✅ Point #39: Entity linking
//   });
// }

// // =========================================================================
// // 🛒 MAIN CATEGORY PAGE (Server Component)
// // =========================================================================
// export default async function CategoryPage({
//   params,
//   searchParams,
// }: CategoryPageProps) {
//   const { slug } = await params;
//   const resolvedSearchParams = await searchParams;

//   const currentSlug = slug[slug.length - 1];
//   const currentPage = Number(resolvedSearchParams?.page) || 1;
//   const sort = resolvedSearchParams?.sort as string | undefined;

//   // ✅ Centralized cached settings
//   const settings = await getCachedSettings();
//   const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

//   // ✅ Parallel Fetch: Category Data + Breadcrumbs
//   const [plpData, breadcrumbs] = await Promise.all([
//     getCachedCategoryData(currentSlug, currentPage, sort),
//     getPayloadBreadcrumbs("category", currentSlug),
//   ]);

//   if (!plpData) {
//     notFound();
//   }

//   const { initialProducts, filterData, totalCount, currentCategory, selfTree } =
//     plpData;

//   const siteUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
//   const categoryUrl = `${siteUrl}/category/${currentSlug}`;

//   // ================================================================
//   // 🔥 STRUCTURED DATA — Using generateCollectionStructuredData (#67, #77)
//   // ================================================================
//   const collectionSchema = generateCollectionStructuredData({
//     name: currentCategory.name,
//     description: (currentCategory.description as string) ||
//       `Shop for ${currentCategory.name} online at PocketValue.`,
//     url: categoryUrl,
//     baseUrl: siteUrl,
//     breadcrumbs: breadcrumbs,
//   });

//   // ✅ Add @id for entity linking (#39)
//   // Already present in the utility, but we ensure it's there
//   const enhancedSchema = {
//     ...collectionSchema,
//     "@graph": collectionSchema["@graph"].map((item: any) => {
//       if (item["@type"] === "CollectionPage") {
//         return {
//           ...item,
//           // ✅ Ensure @id is present (#39)
//           "@id": `${categoryUrl}/#webpage`,
//           // ✅ Add inLanguage (#98)
//           inLanguage: "en-US",
//           // ✅ Add publisher (#80)
//           publisher: {
//             "@type": "Organization",
//             "@id": `${siteUrl}/#organization`,
//           },
//         };
//       }
//       return item;
//     }),
//   };

//   const hasBanner = !!(currentCategory.desktopBanner || currentCategory.mobileBanner);

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify(enhancedSchema),
//         }}
//       />

//       <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-4 py-8 md:py-12">
//         <div className="max-w-480 mx-auto">
//           {/* HEADER: Breadcrumbs + Title + Back Button */}
//           <div className="flex justify-between items-start mb-6 md:mb-8">
//             <div>
//               <Breadcrumbs crumbs={breadcrumbs} />
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
//                 {currentCategory.name}
//               </h1>
//             </div>
//             {slug.length > 1 && (
//               <Link
//                 href={`/category/${slug.slice(0, -1).join("/")}`}
//                 aria-label="Go back to parent category"
//                 className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline mt-2"
//               >
//                 <FiArrowLeft size={16} aria-hidden="true" /> Back
//               </Link>
//             )}
//           </div>

//           {/* BANNER */}
//           {hasBanner && (
//             <div className="relative w-full h-62.5 sm:h-87.5 md:h-112.5 rounded-2xl overflow-hidden mb-8 shadow-sm">
//               <picture>
//                 {currentCategory.mobileBanner && (
//                   <source
//                     media="(max-width: 767px)"
//                     srcSet={urlFor(currentCategory.mobileBanner as any).url()}
//                   />
//                 )}
//                 <Image
//                   src={urlFor(
//                     (currentCategory.desktopBanner ||
//                       currentCategory.mobileBanner) as any
//                   ).url()}
//                   alt={`${currentCategory.name} Category Banner`}
//                   fill
//                   className="object-cover"
//                   priority
//                 />
//               </picture>
//             </div>
//           )}

//           {/* DESCRIPTION */}
//           {currentCategory.description && (
//             <div className="prose prose-sm max-w-none mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
//               <p>{currentCategory.description as string}</p>
//             </div>
//           )}

//           {/* PRODUCT LISTING */}
//           {initialProducts && initialProducts.length > 0 ? (
//             <ProductListingClient
//               key={`${currentSlug}-${currentPage}`}
//               initialProducts={initialProducts}
//               filterData={filterData}
//               categoryTree={selfTree}
//               totalCount={totalCount || 0}
//               context={{ type: "category", value: currentSlug }}
//               lowStockThreshold={lowStockThreshold}
//             />
//           ) : (
//             <div
//               className="text-center py-32 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"
//               role="status"
//               aria-live="polite"
//             >
//               <h3 className="text-xl font-bold">No Products Found</h3>
//               <p className="text-gray-500 mt-2">
//                 We couldn&apos;t find any products in this category right now.
//               </p>
//             </div>
//           )}
//         </div>
//       </main>
//     </>
//   );
// }
// 📂 src/app/(main)/category/[[...slug]]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { FiArrowLeft } from "react-icons/fi";

// ✅ Type Imports
import SanityProduct, { SanityCategory } from "@/types";

// ✅ Payload + Caching Imports
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ UI Components
import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";

// ✅ Structured Data Utilities (#67, #77)
import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

// ✅ Types
type CategoryPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

// =====================================================
// ✅ ISR: Statically generated, served from CDN
// =====================================================
export const revalidate = false;

// =========================================================================
// 🔥 LIGHTWEIGHT METADATA FETCH (No products, no sub-categories)
// =========================================================================
const getCachedCategoryMetadata = async (slug: string) => {
  if (!slug) return null;

  return unstable_cache(
    async () => {
      const payload = await getSafePayload();

      const categoryResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: slug } },
        depth: 1,
      });

      const categoryDoc = categoryResult.docs[0];
      if (!categoryDoc) return null;

      return {
        name: categoryDoc.name,
        slug: categoryDoc.slug,
        description: (categoryDoc as any).description || null,
        image: (categoryDoc.image as any)?.url || undefined,
        seo: (categoryDoc.seo as any) || {},
        desktopBanner: (categoryDoc as any).desktopBanner || null,
        mobileBanner: (categoryDoc as any).mobileBanner || null,
        createdAt: categoryDoc.createdAt,
        updatedAt: categoryDoc.updatedAt,
      };
    },
    [`category-meta-${slug}`],
    {
      tags: [`category-${slug}`],
      revalidate: false,
    }
  )();
};

// =========================================================================
// 🔥 FULL CATEGORY DATA (For product listing)
// =========================================================================
const getCachedCategoryData = async (slug: string, page: number, sort?: string) => {
  const cacheKey = `category-${slug || "all"}-${page}-${sort || "newest"}`;

  return unstable_cache(
    async () => {
      const payload = await getSafePayload();

      // ✅ Root /category URL handler (When slug is empty "")
      if (!slug) {
        const productData = await getPayloadProducts({
          page: page,
          sortOrder: sort || "newest",
        });

        const currentCategory: SanityCategory = {
          _id: "all-categories",
          name: "All Categories",
          slug: "",
          parent: null,
          description: "Explore all products across all categories.",
          image: undefined, // ✅ TYPE FIX: Changed null to undefined for SanityCategory compatibility
          seo: {},
          subCategories: [],
        };

        return {
          initialProducts: productData.products as SanityProduct[],
          totalCount: productData.totalCount,
          filterData: productData.filterData,
          currentCategory,
          selfTree: currentCategory,
        };
      }

      // 1️⃣ Fetch Current Category
      const categoryResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: slug } },
        depth: 2,
      });

      const categoryDoc = categoryResult.docs[0];
      if (!categoryDoc) return null;

      // 2️⃣ Fetch Sub-Categories (Children)
      const subCategoriesResult = await payload.find({
        collection: "categories",
        where: { parent: { equals: categoryDoc.id } },
        sort: "name",
        limit: 50,
      });

      const mappedSubCategories: SanityCategory[] = subCategoriesResult.docs.map(
        (sub: any) => ({
          _id: sub.id,
          name: sub.name,
          slug: sub.slug,
          parent: { _id: categoryDoc.id } as any,
          image: (sub.image as any)?.url || undefined, // ✅ TYPE FIX: Changed null to undefined
          subCategories: [],
          seo: {},
        })
      );

      // 3️⃣ Fetch Products & Global Filters
      const productData = await getPayloadProducts({
        categorySlug: slug,
        page: page,
        sortOrder: sort || "newest",
      });

      const currentCategory: SanityCategory = {
        _id: categoryDoc.id,
        name: categoryDoc.name,
        slug: categoryDoc.slug,
        parent: null,
        desktopBanner: (categoryDoc as any).desktopBanner,
        mobileBanner: (categoryDoc as any).mobileBanner,
        description: (categoryDoc as any).description,
        image: (categoryDoc.image as any)?.url || undefined, // ✅ TYPE FIX: Changed null to undefined
        seo: (categoryDoc.seo as any) || {},
        subCategories: mappedSubCategories,
      };

      const selfTree: SanityCategory = {
        ...currentCategory,
        subCategories: mappedSubCategories,
      };

      return {
        initialProducts: productData.products as SanityProduct[],
        totalCount: productData.totalCount,
        filterData: productData.filterData,
        currentCategory,
        selfTree,
      };
    },
    [cacheKey],
    {
      tags: [`category-${slug || "all"}`],
      revalidate: false,
    }
  )();
};

// =========================================================================
// 🔥 METADATA GENERATION (Enhanced with freshness signals)
// =========================================================================
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  const currentSlug = slug && slug.length > 0 ? slug[slug.length - 1] : "";

  if (!currentSlug) {
    return generateBaseMetadata({
      title: "All Categories - PocketValue",
      description: "Explore all product categories online at PocketValue.",
      path: "/category",
      author: "PocketValue Team",
      section: "Category",
    });
  }

  const metaData = await getCachedCategoryMetadata(currentSlug);
  if (!metaData) return {};

  const { name, description, image, seo, createdAt, updatedAt } = metaData;
  const now = new Date().toISOString();

  return generateBaseMetadata({
    title: seo.metaTitle || name,
    description:
      seo.metaDescription ||
      description ||
      `Shop for ${name} online at PocketValue.`,
    image: seo.ogImage || image,
    path: `/category/${currentSlug}`,
    publishedTime: createdAt || now,
    modifiedTime: updatedAt || createdAt || now,
    author: "PocketValue Team",
    section: "Category",
  });
}

// =========================================================================
// 🛒 MAIN CATEGORY PAGE (Server Component)
// =========================================================================
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const currentSlug = slug && slug.length > 0 ? slug[slug.length - 1] : "";
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const sort = resolvedSearchParams?.sort as string | undefined;

  // Centralized cached settings
  const settings = await getCachedSettings();
  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

  // Parallel Fetch: Category Data + Breadcrumbs
  const [plpData, breadcrumbs] = await Promise.all([
    getCachedCategoryData(currentSlug, currentPage, sort),
    currentSlug ? getPayloadBreadcrumbs("category", currentSlug) : Promise.resolve([]),
  ]);

  if (!plpData) {
    notFound();
  }

  const { initialProducts, filterData, totalCount, currentCategory, selfTree } =
    plpData;

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
  const categoryUrl = `${siteUrl}/category/${currentSlug}`;

  const collectionSchema = generateCollectionStructuredData({
    name: currentCategory.name,
    description: (currentCategory.description as string) ||
      `Shop for ${currentCategory.name} online at PocketValue.`,
    url: categoryUrl,
    baseUrl: siteUrl,
    breadcrumbs: breadcrumbs,
  });

  const enhancedSchema = {
    ...collectionSchema,
    "@graph": collectionSchema["@graph"].map((item: any) => {
      if (item["@type"] === "CollectionPage") {
        return {
          ...item,
          "@id": `${categoryUrl}/#webpage`,
          inLanguage: "en-US",
          publisher: {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
          },
        };
      }
      return item;
    }),
  };

  const hasBanner = !!(currentCategory.desktopBanner || currentCategory.mobileBanner);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(enhancedSchema),
        }}
      />

      <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-4 py-8 md:py-12">
        <div className="max-w-480 mx-auto">
          {/* HEADER: Breadcrumbs + Title + Back Button */}
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div>
              <Breadcrumbs crumbs={breadcrumbs} />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                {currentCategory.name}
              </h1>
            </div>
            {slug && slug.length > 1 && (
              <Link
                href={`/category/${slug.slice(0, -1).join("/")}`}
                aria-label="Go back to parent category"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline mt-2"
              >
                <FiArrowLeft size={16} aria-hidden="true" /> Back
              </Link>
            )}
          </div>

          {/* BANNER */}
          {hasBanner && (
            <div className="relative w-full h-62.5 sm:h-87.5 md:h-112.5 rounded-2xl overflow-hidden mb-8 shadow-sm">
              <picture>
                {currentCategory.mobileBanner && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={urlFor(currentCategory.mobileBanner as any).url()}
                  />
                )}
                <Image
                  src={urlFor(
                    (currentCategory.desktopBanner ||
                      currentCategory.mobileBanner) as any
                  ).url()}
                  alt={`${currentCategory.name} Category Banner`}
                  fill
                  className="object-cover"
                  priority
                />
              </picture>
            </div>
          )}

          {/* DESCRIPTION */}
          {currentCategory.description && (
            <div className="prose prose-sm max-w-none mb-8 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
              <p>{currentCategory.description as string}</p>
            </div>
          )}

          {/* PRODUCT LISTING */}
          {initialProducts && initialProducts.length > 0 ? (
            <ProductListingClient
              key={`${currentSlug || "all"}-${currentPage}`}
              initialProducts={initialProducts}
              filterData={filterData}
              categoryTree={selfTree}
              totalCount={totalCount || 0}
              context={{ type: "category", value: currentSlug }}
              lowStockThreshold={lowStockThreshold}
            />
          ) : (
            <div
              className="text-center py-32 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"
              role="status"
              aria-live="polite"
            >
              <h3 className="text-xl font-bold">No Products Found</h3>
              <p className="text-gray-500 mt-2">
                We couldn&apos;t find any products in this category right now.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}