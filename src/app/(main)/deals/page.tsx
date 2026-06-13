// // src/app/(main)/deals/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight } from "lucide-react";
// import type { Metadata } from "next";

// // 🛑 OLD SANITY IMPORTS
// /*
// import { client } from "@/sanity/lib/client";
// import { GET_DEALS_PLP_DATA, getBreadcrumbs, GET_ALL_CAMPAIGNS } from "@/sanity/lib/queries";
// */

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries"; // Breadcrumbs ke liye
// import { SanityCategory, SanityBrand } from "@/sanity/types/product_types";

// import ProductListingClient from "@/app/components/category/ProductListingClient";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
// import { generateBaseMetadata } from "@/utils/metadata";

// export const dynamic = "force-dynamic";

// export async function generateMetadata(): Promise<Metadata> {
//   return generateBaseMetadata({
//     title: "Today's Deals",
//     description: "Check out the latest deals and special offers.",
//     path: "/deals",
//   });
// }

// // Interfaces (Same as before)
// interface DealsPageData {
//   initialProducts: any[];
//   filterData: any;
//   totalCount: number;
//   dealCategories: SanityCategory[]; // Ab null nahi hoga
// }

// interface Campaign {
//   _id: string;
//   title: string;
//   slug: string;
//   banner?: string;
//   description?: string;
// }

// // --- HELPER: Fetch Active Campaigns from Payload ---
// async function getPayloadAllCampaigns(): Promise<Campaign[]> {
//   const payload = await getPayload({ config: configPromise });

//   const result = await payload.find({
//     collection: "campaigns",
//     where: { isActive: { equals: true } },
//     sort: "endDate", // Jo jaldi khatam ho rahi ho wo pehle
//     depth: 1, // Banner image URL ke liye
//   });

//   return result.docs.map((doc: any) => ({
//     _id: doc.id,
//     title: doc.title,
//     slug: doc.slug,
//     // @ts-ignore
//     banner: doc.banner?.url || null,
//     description: doc.description || "",
//   }));
// }

// // --- HELPER: Fetch Deal Products & Filters ---
// async function getPayloadDealsData(): Promise<DealsPageData> {
//   // 1. Products fetch karein (isDeal: true)
//   const productData = await getPayloadProducts({
//     isDeal: true,
//     page: 1,
//     sortOrder: "newest",
//   });

//   const products = productData.products;

//   // 2. Filters & Categories Calculate Karein (JS Logic)
//   const brandMap = new Map();
//   const categoryMap = new Map(); // Deal Categories ke liye
//   let minPrice = Infinity;
//   let maxPrice = 0;
//   const attributes: any[] = [];

//   products.forEach((p: any) => {
//     // Brands
//     if (p.brand && p.brand._id) brandMap.set(p.brand._id, p.brand);

//     // Categories (Unique Deal Categories extract karna)
//     if (p.categories) {
//       p.categories.forEach((cat: any) => {
//         if (cat._id)
//           categoryMap.set(cat._id, {
//             _id: cat._id,
//             name: cat.name,
//             slug: cat.slug,
//             parent: null,
//             subCategories: [],
//           } as SanityCategory);
//       });
//     }

//     // Price & Attributes
//     p.variants?.forEach((v: any) => {
//       if (v.price < minPrice) minPrice = v.price;
//       if (v.price > maxPrice) maxPrice = v.price;
//       v.attributes?.forEach((attr: any) => {
//         attributes.push({ name: attr.name, value: attr.value });
//       });
//     });
//   });

//   if (minPrice === Infinity) minPrice = 0;

//   return {
//     initialProducts: products,
//     totalCount: productData.totalCount,
//     dealCategories: Array.from(categoryMap.values()),
//     filterData: {
//       brands: Array.from(brandMap.values()) as SanityBrand[],
//       attributes,
//       priceRange: { min: minPrice, max: maxPrice },
//     },
//   };
// }

// export default async function DealsPage() {
//   const [data, breadcrumbs, campaigns] = await Promise.all([
//     // ✅ Switch to Payload Helpers
//     getPayloadDealsData(),
//     getPayloadBreadcrumbs("deals"),
//     getPayloadAllCampaigns(),
//   ]);

//   if (!data) {
//     // Ye tab hoga agar koi deal products na hon, to empty state dikha dein
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

//   // uniqueDealCategories logic remains the same
//   const uniqueDealCategories = dealCategories
//     .filter((category): category is SanityCategory => !!category)
//     .map((category) => category);

//   return (
//     <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12">
//       <div className="max-w-480 mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Breadcrumbs crumbs={breadcrumbs} />
//           <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
//             Deals & Promotions
//           </h1>
//         </div>

//         {/* === ACTIVE CAMPAIGNS GRID === */}
//         {campaigns && campaigns.length > 0 && (
//           <div className="mb-16">
//             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
//               Active Sales Events
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//               {campaigns.map((campaign) => (
//                 <Link
//                   key={campaign._id}
//                   href={`/deals/${campaign.slug}`}
//                   className="group relative h-48 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800"
//                 >
//                   {campaign.banner ? (
//                     <Image
//                       src={campaign.banner}
//                       alt={campaign.title}
//                       fill
//                       className="object-cover transition-transform duration-500 group-hover:scale-110"
//                     />
//                   ) : (
//                     <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-purple-600" />
//                   )}

//                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col justify-center p-6">
//                     <h3 className="text-2xl font-bold text-white mb-1">
//                       {campaign.title}
//                     </h3>
//                     <p className="text-white/80 text-sm line-clamp-2 mb-4">
//                       {campaign.description}
//                     </p>
//                     <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
//                       Explore Deal <ArrowRight size={16} className="ml-1" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* === ALL PRODUCTS GRID (MIX) === */}
//         <div id="all-deals">
//           <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
//             Browse All Discounted Items
//           </h2>
//           <ProductListingClient
//             initialProducts={initialProducts || []}
//             filterData={filterData}
//             totalCount={totalCount || 0}
//             context={{ type: "deals" }}
//             categoryTree={undefined} // Deals page par categoryTree nahi hota
//             dealCategories={uniqueDealCategories} // ✅ Deals ke liye category filter
//           />
//         </div>
//       </div>
//     </main>
//   );
// }
// src/app/(main)/deals/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

// ✅ PAYLOAD IMPORTS
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import { SanityCategory, SanityBrand } from "@/sanity/types/product_types";

import ProductListingClient from "@/app/components/category/ProductListingClient";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/utils/metadata";

export const dynamic = "force-dynamic";

// =====================================================
// 🔥 OPTIMIZED METADATA
// =====================================================
export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    title: "Best Daily Deals & Exclusive Offers | PocketValue Pakistan",
    description:
      "Shop the best daily deals, limited-time promotions, and exclusive discounts on premium products at PocketValue. Save big on your favorite items today!",
    path: "/deals",
  });
}

interface DealsPageData {
  initialProducts: any[];
  filterData: any;
  totalCount: number;
  dealCategories: SanityCategory[];
}

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  banner?: string;
  description?: string;
}

// --- HELPER: Fetch Active Campaigns from Payload ---
async function getPayloadAllCampaigns(): Promise<Campaign[]> {
  const payload = await getPayload({ config: configPromise });

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
    // @ts-ignore
    banner: doc.banner?.url || null,
    description: doc.description || "",
  }));
}

// --- HELPER: Fetch Deal Products & Filters ---
async function getPayloadDealsData(): Promise<DealsPageData> {
  const productData = await getPayloadProducts({
    isDeal: true,
    page: 1,
    sortOrder: "newest",
  });

  const products = productData.products;
  const brandMap = new Map();
  const categoryMap = new Map();
  let minPrice = Infinity;
  let maxPrice = 0;
  const attributes: any[] = [];

  products.forEach((p: any) => {
    if (p.brand && p.brand._id) brandMap.set(p.brand._id, p.brand);
    if (p.categories) {
      p.categories.forEach((cat: any) => {
        if (cat._id)
          categoryMap.set(cat._id, {
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            parent: null,
            subCategories: [],
          } as SanityCategory);
      });
    }
    p.variants?.forEach((v: any) => {
      if (v.price < minPrice) minPrice = v.price;
      if (v.price > maxPrice) maxPrice = v.price;
      v.attributes?.forEach((attr: any) => {
        attributes.push({ name: attr.name, value: attr.value });
      });
    });
  });

  if (minPrice === Infinity) minPrice = 0;

  return {
    initialProducts: products,
    totalCount: productData.totalCount,
    dealCategories: Array.from(categoryMap.values()),
    filterData: {
      brands: Array.from(brandMap.values()) as SanityBrand[],
      attributes,
      priceRange: { min: minPrice, max: maxPrice },
    },
  };
}

export default async function DealsPage() {
  const [data, breadcrumbs, campaigns] = await Promise.all([
    getPayloadDealsData(),
    getPayloadBreadcrumbs("deals"),
    getPayloadAllCampaigns(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // =====================================================
  // 🔥 SEO: JSON-LD STRUCTURED DATA
  // =====================================================
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/deals/#webpage`,
        url: `${siteUrl}/deals`,
        name: "Daily Deals and Promotions | PocketValue",
        description:
          "Browse our latest collection of discounted items and sales campaigns.",
        breadcrumb: { "@id": `${siteUrl}/deals/#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/deals/#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@id": `${siteUrl}${crumb.href.startsWith("/") ? crumb.href : "/" + crumb.href}`,
            name: crumb.name,
          },
        })),
      },
    ],
  };

  if (!data) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12 min-h-screen">
        <div className="max-w-480 mx-auto">
          <div className="mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
              Deals & Promotions
            </h1>
          </div>
          <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
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
    .map((category) => category);

  return (
    <>
      {/* Injecting SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12">
        <div className="max-w-480 mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 uppercase tracking-tight">
              Deals & Promotions
            </h1>
          </div>

          {/* === ACTIVE CAMPAIGNS GRID === */}
          {campaigns && campaigns.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tighter">
                Active Sales Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {campaigns.map((campaign) => (
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

          {/* === ALL PRODUCTS GRID (MIX) === */}
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
            />
          </div>
        </div>
      </main>
    </>
  );
}
