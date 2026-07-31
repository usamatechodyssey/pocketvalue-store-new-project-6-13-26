// // // src/app/(main)/page.tsx
// // ================================================================
// // 🏠 ENTERPRISE HOMEPAGE ENGINE (UPGRADED — FINAL)
// // ================================================================
// // This file handles the homepage with:
// // ✅ ISR + Edge caching with on-demand revalidation
// // ✅ WebPage Schema with @id and publisher linking (#39)
// // ✅ Content freshness signals in metadata (#23)
// // ✅ Entity linking for AI overviews (#39)
// // ✅ Dynamic page builder with all sections
// // ✅ Low stock threshold for scarcity signals
// // ================================================================

// import { Suspense } from "react";
// import { unstable_cache } from "next/cache";
// import { getPayloadHomepageData } from "@/sanity/lib/payload/homepage.queries";
// import HeroSection from "../features/storefront/catalog/components/home/HeroSection";
// import HeroSkeleton from "../features/storefront/catalog/components/home/HeroSkeleton";
// import RenderSection from "../features/storefront/catalog/components/home/builder/RenderSection";
// import { generateBaseMetadata } from "@/utils/metadata";
// import type { Metadata } from "next";

// // ✅ Use centralized cache utility
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// // ============================================================
// // ✅ ISR: Page will be statically generated on first request,
// //    then served from CDN for all subsequent requests.
// // ============================================================
// export const revalidate = false;

// // ============================================================
// // 🔥 CACHED HOMEPAGE DATA
// // ============================================================
// const getHomepageData = unstable_cache(
//   async () => {
//     return await getPayloadHomepageData();
//   },
//   ["homepage-data"],
//   { tags: ["homepage"], revalidate: false }
// );

// // ============================================================
// // 🔥 METADATA (Enhanced with freshness signals)
// // ============================================================
// export async function generateMetadata(): Promise<Metadata> {
//   const data = await getHomepageData();
//   const seo = data?.seo || {};
//   const now = new Date().toISOString();

//   return generateBaseMetadata({
//     title: seo.metaTitle || "PocketValue - Smart Shopping",
//     description: seo.metaDescription || "Find the best deals and values.",
//     image: seo.ogImage,
//     path: "/",
//     // ✅ Point #23: Content Freshness
//     publishedTime: now,
//     modifiedTime: now,
//     // ✅ Point #80: Author/Publisher signals
//     author: "PocketValue Team",
//     section: "Homepage",
//   });
// }

// // ============================================================
// // 🏠 HOMEPAGE COMPONENT
// // ============================================================
// export default async function Home() {
//   const [homepageData, settings] = await Promise.all([
//     getHomepageData(),
//     getCachedSettings(),
//   ]);

//   const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
//   const pageSections = homepageData?.pageSections || [];
//   const siteUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   // ============================================================
//   // 🔥 SEO: WebPage Schema (Enhanced with @id and publisher)
//   // ============================================================
//   const webPageSchema = {
//     "@context": "https://schema.org",
//     "@type": "WebPage",
//     "@id": `${siteUrl}/#webpage`, // ✅ Point #39: Entity linking
//     url: siteUrl,
//     name: "PocketValue - Smart Shopping",
//     description:
//       homepageData?.seo?.metaDescription ||
//       "Find the best deals and values at PocketValue.",
//     // ✅ Point #23: Content Freshness
//     dateModified: new Date().toISOString(),
//     // ✅ Point #98: Language signal
//     inLanguage: "en-US",
//     // ✅ Point #39: Publisher linking
//     publisher: {
//       "@type": "Organization",
//       "@id": `${siteUrl}/#organization`,
//     },
//     // ✅ Breadcrumb linking (if needed)
//     breadcrumb: {
//       "@type": "BreadcrumbList",
//       "@id": `${siteUrl}/#breadcrumb`,
//     },
//     // ✅ Primary image (hero or first section)
//     primaryImageOfPage:
//       pageSections.length > 0 &&
//       pageSections[0]?.banners?.[0]?.desktopImage
//         ? {
//             "@type": "ImageObject",
//             url: pageSections[0].banners[0].desktopImage,
//           }
//         : undefined,
//   };

//   return (
//     <>
//       {/* ✅ JSON-LD: WebPage Schema */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
//       />

//       <main className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden">
//         {/* 1. HERO (Static/Heavy LCP Section) */}
//         <Suspense fallback={<HeroSkeleton />}>
//           <HeroSection />
//         </Suspense>

//         {/* 2. DYNAMIC PAGE BUILDER */}
//         <div className="w-full">
//           {pageSections.length > 0 ? (
//             <div className="flex flex-col w-full">
//               {pageSections.map((section: any) => (
//                 <RenderSection
//                   key={section.id || section._key || Math.random().toString()}
//                   section={section}
//                   lowStockThreshold={lowStockThreshold}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-32 text-gray-400">
//               Homepage content is being prepared in the Dashboard.
//             </div>
//           )}
//         </div>
//       </main>
//     </>
//   );
// }
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadHomepageData } from "@/sanity/lib/payload/homepage.queries";
import HeroSection from "../features/storefront/catalog/components/home/HeroSection";
import HeroSkeleton from "../features/storefront/catalog/components/home/HeroSkeleton";
import RenderSection from "../features/storefront/catalog/components/home/builder/RenderSection";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";

// Use centralized cache utility
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

export const revalidate = false;

// CACHED HOMEPAGE DATA
const getHomepageData = unstable_cache(
  async () => {
    return await getPayloadHomepageData();
  },
  ["homepage-data"],
  { tags: ["homepage"], revalidate: false }
);

// METADATA
export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomepageData();
  const seo = data?.seo || {};
  const now = new Date().toISOString();

  return generateBaseMetadata({
    title: seo.metaTitle || "PocketValue - Smart Shopping",
    description: seo.metaDescription || "Find the best deals and values.",
    image: seo.ogImage,
    path: "/",
    publishedTime: now,
    modifiedTime: now,
    author: "PocketValue Team",
    section: "Homepage",
  });
}

// HOMEPAGE COMPONENT
export default async function Home() {
  const [homepageData, settings] = await Promise.all([
    getHomepageData(),
    getCachedSettings(),
  ]);

  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
  const pageSections = homepageData?.pageSections || [];
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // WebPage Schema (JSON-LD)
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: "PocketValue - Smart Shopping",
    description:
      homepageData?.seo?.metaDescription ||
      "Find the best deals and values at PocketValue.",
    dateModified: new Date().toISOString(),
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
    },
    primaryImageOfPage:
      pageSections.length > 0 &&
      pageSections[0]?.banners?.[0]?.desktopImage
        ? {
            "@type": "ImageObject",
            url: pageSections[0].banners[0].desktopImage,
          }
        : undefined,
  };

  return (
    <>
      {/* JSON-LD: WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* ✅ Changed <main> to <div> to avoid nested main tags (Better SEO & Heights) */}
      <div className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden">
        {/* 1. HERO (Static/Heavy LCP Section) */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>

        {/* 2. DYNAMIC PAGE BUILDER */}
        <div className="w-full">
          {pageSections.length > 0 ? (
            <div className="flex flex-col w-full">
              {pageSections.map((section: any) => (
                <RenderSection
                  key={section.id || section._key || Math.random().toString()}
                  section={section}
                  lowStockThreshold={lowStockThreshold}
                />
              ))}
            </div>
          ) : (
            /* ✅ contrast fix: changed text-gray-400 to text-gray-500 */
            <div className="text-center py-32 text-gray-500 dark:text-gray-400">
              Homepage content is being prepared in the Dashboard.
            </div>
          )}
        </div>
      </div>
    </>
  );
}