// // src/app/(main)/deals/page.tsx
// // ================================================================
// // 🏷️ ENTERPRISE DEALS PAGE ENGINE (UPGRADED — FINAL)
// // ================================================================
// // This file handles the Deals listing page with:
// // ✅ ISR + Edge caching with on-demand revalidation
// // ✅ CollectionPage + BreadcrumbList Schema (#67, #77)
// // ✅ Content freshness signals in metadata (#23)
// // ✅ Entity linking for AI overviews (#39)
// // ✅ Active campaigns grid with dynamic deals
// // ✅ Product listing with filters
// // ================================================================

// import Link from "next/link";
// import Image from "next/image";
// import { unstable_cache } from "next/cache";
// import { ArrowRight } from "lucide-react";
// import type { Metadata } from "next";

// // ✅ PAYLOAD IMPORTS
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
// import SanityProduct, { SanityCategory, SanityBrand } from "@/types";

// // ✅ Centralized Settings Cache
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// // ✅ UI Components
// import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
// import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
// import { generateBaseMetadata } from "@/utils/metadata";

// // ✅ Structured Data Utilities (#67, #77)
// import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

// // =====================================================
// // ✅ ISR: Page statically generated on first request,
// //    served from CDN thereafter. Cache cleared via tags.
// // =====================================================
// export const revalidate = false;

// // =====================================================
// // 🔥 METADATA (Enhanced with freshness signals)
// // =====================================================
// export async function generateMetadata(): Promise<Metadata> {
//   const now = new Date().toISOString();

//   return generateBaseMetadata({
//     title: "Best Daily Deals & Exclusive Offers | PocketValue Pakistan",
//     description:
//       "Shop the best daily deals, limited-time promotions, and exclusive discounts on premium products at PocketValue. Save big on your favorite items today!",
//     path: "/deals",
//     // ✅ Point #23: Content Freshness
//     publishedTime: now,
//     modifiedTime: now,
//     // ✅ Point #80: Author/Publisher signals
//     author: "PocketValue Team",
//     section: "Deals",
//     tags: ["deals", "discounts", "promotions", "sale"],
//   });
// }

// // =========================================================================
// // 🔥 CACHED ACTIVE CAMPAIGNS
// // =========================================================================
// const getCachedActiveCampaigns = unstable_cache(
//   async () => {
//     const payload = await getSafePayload();
//     const result = await payload.find({
//       collection: "campaigns",
//       where: { isActive: { equals: true } },
//       sort: "endDate",
//       depth: 1,
//     });

//     return result.docs.map((doc: any) => ({
//       _id: doc.id,
//       title: doc.title,
//       slug: doc.slug,
//       banner: doc.banner?.url || null,
//       description: doc.description || "",
//       // ✅ Added timestamps for freshness (#23)
//       updatedAt: doc.updatedAt,
//       createdAt: doc.createdAt,
//     }));
//   },
//   ["active-campaigns"],
//   { tags: ["active-campaigns"], revalidate: false }
// );

// // =========================================================================
// // 🔥 CACHED DEALS DATA (Products + Filters) - With Type Safety
// // =========================================================================
// const getCachedDealsData = unstable_cache(
//   async () => {
//     const productData = await getPayloadProducts({
//       isDeal: true,
//       page: 1,
//       sortOrder: "newest",
//     });

//     // ✅ Type-safe product iteration
//     const products = productData.products as SanityProduct[];
//     const brandMap = new Map<string, SanityBrand>();
//     const categoryMap = new Map<string, SanityCategory>();
//     let minPrice = Infinity;
//     let maxPrice = 0;

//     // ✅ Flat set for attribute pairs (name|value) to avoid duplicates
//     const attributePairs = new Set<string>();

//     products.forEach((p) => {
//       if (p.brand && p.brand._id) {
//         brandMap.set(p.brand._id, p.brand);
//       }
//       if (p.categories) {
//         p.categories.forEach((cat) => {
//           if (cat._id) {
//             categoryMap.set(cat._id, {
//               _id: cat._id,
//               name: cat.name,
//               slug: cat.slug,
//               parent: null,
//               subCategories: [],
//             } as SanityCategory);
//           }
//         });
//       }
//       p.variants?.forEach((v) => {
//         if (v.price < minPrice) minPrice = v.price;
//         if (v.price > maxPrice) maxPrice = v.price;
//         v.attributes?.forEach((attr) => {
//           if (attr.name && attr.value) {
//             attributePairs.add(`${attr.name}|${attr.value}`);
//           }
//         });
//       });
//     });

//     if (minPrice === Infinity) minPrice = 0;

//     // ✅ Convert Set to array of { name, value }
//     const attributes = Array.from(attributePairs).map((pair) => {
//       const [name, value] = pair.split("|");
//       return { name, value };
//     });

//     return {
//       initialProducts: products,
//       totalCount: productData.totalCount,
//       dealCategories: Array.from(categoryMap.values()) as SanityCategory[],
//       filterData: {
//         brands: Array.from(brandMap.values()) as SanityBrand[],
//         attributes,
//         priceRange: { min: minPrice, max: maxPrice },
//       },
//     };
//   },
//   ["deals-data"],
//   { tags: ["deals-data"], revalidate: false }
// );

// // =========================================================================
// // 📄 MAIN DEALS PAGE
// // =========================================================================
// export default async function DealsPage() {
//   // ✅ Fetch everything in parallel (now cached)
//   const [settings, data, breadcrumbs, campaigns] = await Promise.all([
//     getCachedSettings(),
//     getCachedDealsData(),
//     getPayloadBreadcrumbs("deals"),
//     getCachedActiveCampaigns(),
//   ]);

//   const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
//   const siteUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   // ================================================================
//   // 🔥 STRUCTURED DATA — Using generateCollectionStructuredData (#67, #77)
//   // ================================================================
//   const collectionSchema = generateCollectionStructuredData({
//     name: "Daily Deals and Promotions | PocketValue",
//     description:
//       "Browse our latest collection of discounted items and sales campaigns.",
//     url: `${siteUrl}/deals`,
//     baseUrl: siteUrl,
//     breadcrumbs: breadcrumbs,
//   });

//   // ✅ Add @id for entity linking (#39)
//   const enhancedSchema = {
//     ...collectionSchema,
//     "@graph": collectionSchema["@graph"].map((item: any) => {
//       if (item["@type"] === "CollectionPage") {
//         return {
//           ...item,
//           // ✅ Ensure @id is present (#39)
//           "@id": `${siteUrl}/deals/#webpage`,
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

//   if (!data) {
//     return (
//       <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12 min-h-screen">
//         <div className="max-w-480 mx-auto">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbs} />
//             <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
//               Deals & Promotions
//             </h1>
//           </div>
//           <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
//             <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
//               No Active Deals
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Check back soon for exciting offers!
//             </p>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   const { initialProducts, filterData, totalCount, dealCategories } = data;
//   const uniqueDealCategories = dealCategories
//     .filter((category): category is SanityCategory => !!category)
//     .map((category: SanityCategory) => category);

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedSchema) }}
//       />

//       <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12">
//         <div className="max-w-480 mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbs} />
//             <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 uppercase tracking-tight">
//               Deals & Promotions
//             </h1>
//           </div>

//           {/* Active Campaigns Grid */}
//           {campaigns && campaigns.length > 0 && (
//             <div className="mb-16">
//               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tighter">
//                 Active Sales Events
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//                 {campaigns.map((campaign: any) => (
//                   <Link
//                     key={campaign._id}
//                     href={`/deals/${campaign.slug}`}
//                     className="group relative h-48 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800"
//                   >
//                     {campaign.banner ? (
//                       <Image
//                         src={campaign.banner}
//                         alt={campaign.title}
//                         fill
//                         className="object-cover transition-transform duration-500 group-hover:scale-110"
//                       />
//                     ) : (
//                       <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-purple-600" />
//                     )}

//                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col justify-center p-6">
//                       <h3 className="text-2xl font-bold text-white mb-1 uppercase">
//                         {campaign.title}
//                       </h3>
//                       <p className="text-white/80 text-sm line-clamp-2 mb-4 italic">
//                         {campaign.description}
//                       </p>
//                       <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
//                         Explore Deal <ArrowRight size={16} className="ml-1" />
//                       </span>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* All Products Grid */}
//           <div id="all-deals">
//             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tighter">
//               Browse All Discounted Items
//             </h2>
//             <ProductListingClient
//               initialProducts={initialProducts || []}
//               filterData={filterData}
//               totalCount={totalCount || 0}
//               context={{ type: "deals" }}
//               categoryTree={undefined}
//               dealCategories={uniqueDealCategories}
//               lowStockThreshold={lowStockThreshold}
//             />
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }
// 📂 src/app/(main)/deals/page.tsx

import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

// ✅ PAYLOAD IMPORTS
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import SanityProduct, { SanityCategory, SanityBrand } from "@/types";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ UI Components
import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/utils/metadata";

// ✅ Structured Data Utilities (#67, #77)
import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

export const revalidate = false;

// =====================================================
// 🔥 METADATA (Enhanced with freshness signals)
// =====================================================
export async function generateMetadata(): Promise<Metadata> {
  const now = new Date().toISOString();

  return generateBaseMetadata({
    title: "Best Daily Deals & Exclusive Offers | PocketValue Pakistan",
    // ✅ BRAND ALIGNMENT: Replaced the word "premium" with "high-quality" in meta description
    description:
      "Shop the best daily deals, limited-time promotions, and exclusive discounts on high-quality products at PocketValue. Save big on your favorite items today!",
    path: "/deals",
    publishedTime: now,
    modifiedTime: now,
    author: "PocketValue Team",
    section: "Deals",
    tags: ["deals", "discounts", "promotions", "sale"],
  });
}

// =========================================================================
// 🔥 CACHED ACTIVE CAMPAIGNS
// =========================================================================
const getCachedActiveCampaigns = unstable_cache(
  async () => {
    const payload = await getSafePayload();
    const result = await payload.find({
      collection: "campaigns",
      where: { isActive: { equals: true } },
      sort: "endDate",
      depth: 1,
    });

    return result.docs.map((doc: any) => ({
      _id: doc.id,
      title: doc.title,
      slug: doc.slug,
      banner: doc.banner?.url || null,
      description: doc.description || "",
      updatedAt: doc.updatedAt,
      createdAt: doc.createdAt,
    }));
  },
  ["active-campaigns"],
  { tags: ["active-campaigns"], revalidate: false }
);

// =========================================================================
// 🔥 CACHED DEALS DATA (Products + Filters) - With Type Safety
// =========================================================================
const getCachedDealsData = unstable_cache(
  async () => {
    const productData = await getPayloadProducts({
      isDeal: true,
      page: 1,
      sortOrder: "newest",
    });

    const products = productData.products as SanityProduct[];
    const brandMap = new Map<string, SanityBrand>();
    const categoryMap = new Map<string, SanityCategory>();
    let minPrice = Infinity;
    let maxPrice = 0;

    const attributePairs = new Set<string>();

    products.forEach((p) => {
      if (p.brand && p.brand._id) {
        brandMap.set(p.brand._id, p.brand);
      }
      if (p.categories) {
        p.categories.forEach((cat) => {
          if (cat._id) {
            categoryMap.set(cat._id, {
              _id: cat._id,
              name: cat.name,
              slug: cat.slug,
              parent: null,
              subCategories: [],
            } as SanityCategory);
          }
        });
      }
      p.variants?.forEach((v) => {
        if (v.price < minPrice) minPrice = v.price;
        if (v.price > maxPrice) maxPrice = v.price;
        v.attributes?.forEach((attr) => {
          if (attr.name && attr.value) {
            attributePairs.add(`${attr.name}|${attr.value}`);
          }
        });
      });
    });

    if (minPrice === Infinity) minPrice = 0;

    const attributes = Array.from(attributePairs).map((pair) => {
      const [name, value] = pair.split("|");
      return { name, value };
    });

    return {
      initialProducts: products,
      totalCount: productData.totalCount,
      dealCategories: Array.from(categoryMap.values()) as SanityCategory[],
      filterData: {
        brands: Array.from(brandMap.values()) as SanityBrand[],
        attributes,
        priceRange: { min: minPrice, max: maxPrice },
      },
    };
  },
  ["deals-data"],
  { tags: ["deals-data"], revalidate: false }
);

// =========================================================================
// 📄 MAIN DEALS PAGE
// =========================================================================
export default async function DealsPage() {
  const [settings, data, breadcrumbs, campaigns] = await Promise.all([
    getCachedSettings(),
    getCachedDealsData(),
    getPayloadBreadcrumbs("deals"),
    getCachedActiveCampaigns(),
  ]);

  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  const collectionSchema = generateCollectionStructuredData({
    name: "Daily Deals and Promotions | PocketValue",
    description:
      "Browse our latest collection of discounted items and sales campaigns.",
    url: `${siteUrl}/deals`,
    baseUrl: siteUrl,
    breadcrumbs: breadcrumbs,
  });

  const enhancedSchema = {
    ...collectionSchema,
    "@graph": collectionSchema["@graph"].map((item: any) => {
      if (item["@type"] === "CollectionPage") {
        return {
          ...item,
          "@id": `${siteUrl}/deals/#webpage`,
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

  if (!data) {
    return (
      // ✅ STOREFRONT BACKGROUND SYNC: Changed dark:bg-gray-900 to dark:bg-gray-950
      <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-4 py-8 md:py-12 min-h-screen">
        <div className="max-w-480 mx-auto">
          <div className="mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
              Deals & Promotions
            </h1>
          </div>
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              No Active Deals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Check back soon for exciting offers!
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { initialProducts, filterData, totalCount, dealCategories } = data;
  const uniqueDealCategories = dealCategories
    .filter((category): category is SanityCategory => !!category)
    .map((category: SanityCategory) => category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedSchema) }}
      />

      {/* ✅ STOREFRONT BACKGROUND SYNC: Changed dark:bg-gray-900 to dark:bg-gray-950 */}
      <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-4 py-8 md:py-12">
        <div className="max-w-480 mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 uppercase tracking-tight">
              Deals & Promotions
            </h1>
          </div>

          {/* Active Campaigns Grid */}
          {campaigns && campaigns.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tighter">
                Active Sales Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {campaigns.map((campaign: any) => (
                  <Link
                    key={campaign._id}
                    href={`/deals/${campaign.slug}`}
                    className="group relative h-48 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800"
                  >
                    {campaign.banner ? (
                      <Image
                        src={campaign.banner}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-purple-600" />
                    )}

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col justify-center p-6">
                      <h3 className="text-2xl font-bold text-white mb-1 uppercase">
                        {campaign.title}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-2 mb-4 italic">
                        {campaign.description}
                      </p>
                      <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
                        Explore Deal <ArrowRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Products Grid */}
          <div id="all-deals">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tighter">
              Browse All Discounted Items
            </h2>
            <ProductListingClient
              initialProducts={initialProducts || []}
              filterData={filterData}
              totalCount={totalCount || 0}
              context={{ type: "deals" }}
              categoryTree={undefined}
              dealCategories={uniqueDealCategories}
              lowStockThreshold={lowStockThreshold}
            />
          </div>
        </div>
      </main>
    </>
  );
}