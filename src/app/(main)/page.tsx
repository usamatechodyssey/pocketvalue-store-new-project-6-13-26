// // // // src/app/(main)/page.tsx

// import { Suspense } from "react";
// import { unstable_cache } from "next/cache";
// import { getPayloadHomepageData } from "@/sanity/lib/payload/homepage.queries";
// import HeroSection from "../features/storefront/catalog/components/home/HeroSection";
// import HeroSkeleton from "../features/storefront/catalog/components/home/HeroSkeleton";
// import RenderSection from "../features/storefront/catalog/components/home/builder/RenderSection";
// import { generateBaseMetadata } from "@/utils/metadata";
// import type { Metadata } from "next";

// // Use centralized cache utility
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// export const revalidate = false;

// // CACHED HOMEPAGE DATA
// const getHomepageData = unstable_cache(
//   async () => {
//     return await getPayloadHomepageData();
//   },
//   ["homepage-data"],
//   { tags: ["homepage"], revalidate: false }
// );

// // METADATA
// export async function generateMetadata(): Promise<Metadata> {
//   const data = await getHomepageData();
//   const seo = data?.seo || {};
//   const now = new Date().toISOString();

//   return generateBaseMetadata({
//     title: seo.metaTitle || "PocketValue - Smart Shopping",
//     description: seo.metaDescription || "Find the best deals and values.",
//     image: seo.ogImage,
//     path: "/",
//     publishedTime: now,
//     modifiedTime: now,
//     author: "PocketValue Team",
//     section: "Homepage",
//   });
// }

// // HOMEPAGE COMPONENT
// export default async function Home() {
//   const [homepageData, settings] = await Promise.all([
//     getHomepageData(),
//     getCachedSettings(),
//   ]);

//   const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
//   const pageSections = homepageData?.pageSections || [];
//   const siteUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   // WebPage Schema (JSON-LD)
//   const webPageSchema = {
//     "@context": "https://schema.org",
//     "@type": "WebPage",
//     "@id": `${siteUrl}/#webpage`,
//     url: siteUrl,
//     name: "PocketValue - Smart Shopping",
//     description:
//       homepageData?.seo?.metaDescription ||
//       "Find the best deals and values at PocketValue.",
//     dateModified: new Date().toISOString(),
//     inLanguage: "en-US",
//     publisher: {
//       "@type": "Organization",
//       "@id": `${siteUrl}/#organization`,
//     },
//     breadcrumb: {
//       "@type": "BreadcrumbList",
//       "@id": `${siteUrl}/#breadcrumb`,
//     },
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
//       {/* JSON-LD: WebPage Schema */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
//       />

//       {/* ✅ Changed <main> to <div> to avoid nested main tags (Better SEO & Heights) */}
//       <div className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden">
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
//             /* ✅ contrast fix: changed text-gray-400 to text-gray-500 */
//             <div className="text-center py-32 text-gray-500 dark:text-gray-400">
//               Homepage content is being prepared in the Dashboard.
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
// 📂 src/app/(main)/page.tsx

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

      <div className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden animate-in fade-in duration-500">
        
        {/* 1. HERO (Static/Heavy LCP Section) */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>

        {/* 2. DYNAMIC PAGE BUILDER */}
        <div className="w-full max-w-360 px-4 md:px-8 xl:px-12 mx-auto">
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
            /* ✅ SEAMLESS HUD REDESIGN: Wiped out the bounded floating card. It now integrates natively into the background! */
            <div className="text-center py-24 px-4 w-full max-w-2xl mx-auto flex flex-col items-center gap-8 relative overflow-hidden">
              {/* Soft background light auras */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-3xl pointer-events-none animate-pulse" />

              {/* Glowing radar pulse ring */}
              <div className="relative flex h-14 w-14 items-center justify-center select-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary/20 opacity-75" />
                <div className="relative rounded-full h-10 w-10 bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-[0_0_15px_rgba(255,143,50,0.25)]">
                  <span className="text-xl">⚡</span>
                </div>
              </div>

              {/* Content Header (Completely Borderless) */}
              <div className="space-y-3 max-w-sm">
                <h3 className="text-base font-clash font-bold uppercase tracking-wider text-zinc-950 dark:text-white leading-none">
                  PocketValue System Terminal
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 tracking-tight leading-relaxed max-w-sm mx-auto">
                  The storefront is currently synchronizing its catalog schemas and product listings with the Central Database.
                </p>
              </div>

              {/* Solid High-Contrast Embedded Terminal Console (Sleek Glass Outline in Light Mode) */}
              <div className="w-full max-w-lg bg-zinc-950 dark:bg-black/80 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-5 text-left font-mono text-[9px] text-emerald-400/90 space-y-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800/80 pb-2.5 mb-2.5 select-none">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-[8px] uppercase tracking-widest font-black">SYS_LOG: pocketvalue_onboarding_console</span>
                </div>
                <p className="flex items-center gap-1.5 animate-pulse"><span className="text-zinc-600">●</span> <span className="text-zinc-500">[0.00s]</span> INITIALIZING POCKETVALUE CORE TERMINAL v1.2.0...</p>
                <p className="flex items-center gap-1.5"><span className="text-emerald-500">✔</span> <span className="text-zinc-500">[0.14s]</span> REDIS CLUSTER CACHE: WARM &amp; RESPONSIVE</p>
                <p className="flex items-center gap-1.5"><span className="text-emerald-500">✔</span> <span className="text-zinc-500">[0.42s]</span> MONGOOSE HANDSHAKE: CONNECTED TO ATLAS CLUSTER</p>
                <p className="flex items-center gap-1.5"><span className="text-brand-primary">●</span> <span className="text-zinc-500">[0.89s]</span> SYNCHRONIZING PAYLOAD PALETTE SCHEMAS...</p>
                <p className="flex items-center gap-1.5 text-zinc-500 animate-deep-breath"><span className="text-zinc-700">●</span> <span className="text-zinc-600">[AWAIT]</span> READY &amp; STANDING BY FOR CATALOG ACTION...</p>
              </div>

              {/* Micro Status Indicators Ticker */}
              <div className="flex gap-4 flex-wrap justify-center text-[8px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pt-2 select-none">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SECURE_TEL: ACTIVE</span>
                <span className="text-zinc-300 dark:text-zinc-800">•</span>
                <span>PING: 14MS</span>
                <span className="text-zinc-300 dark:text-zinc-800">•</span>
                <span>CACHE: 5-MIN TTL</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}