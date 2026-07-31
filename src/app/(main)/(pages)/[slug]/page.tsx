// import { notFound } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { PortableText } from "@portabletext/react";
// import { urlFor } from "@/sanity/lib/image";
// import { generateBaseMetadata } from "@/utils/metadata";

// // ✅ Payload Imports (Already cached internally)
// import { getPayloadPageData } from "@/sanity/lib/payload/content.queries";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
// import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";

// // ✅ ISR: Page statically generated, served from CDN
// export const revalidate = false;

// type InfoPageProps = {
//   params: Promise<{ slug: string }>;
// };

// // =========================================================================
// // 🔥 METADATA
// // =========================================================================
// export async function generateMetadata({ params }: InfoPageProps) {
//   const { slug } = await params;
//   const page = await getPayloadPageData(slug);

//   if (!page) return {};

//   return generateBaseMetadata({
//     title: page.seo?.metaTitle || page.title,
//     description: page.seo?.metaDescription || page.excerpt?.substring(0, 160),
//     image: page.seo?.ogImage,
//     path: `/${page.slug}`,
//   });
// }

// // =========================================================================
// // 🔥 PORTABLE TEXT CUSTOM COMPONENTS
// // =========================================================================
// const ptComponents = {
//   types: {
//     image: ({ value }: any) => {
//       const src = urlFor(value).width(1200).quality(80).url();
//       if (!src || src.includes("placeholder")) return null;

//       return (
//         <figure className="my-10 group">
//           <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
//             <Image
//               src={src}
//               alt={value.alt || "PocketValue content image"}
//               loading="lazy"
//               width={1200}
//               height={675}
//               className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
//             />
//           </div>
//           {value.alt && (
//             <figcaption className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 uppercase tracking-widest">
//               {value.alt}
//             </figcaption>
//           )}
//         </figure>
//       );
//     },
//   },
//   block: {
//     h2: ({ children }: any) => (
//       <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white flex items-center gap-3">
//         <span className="w-1.5 h-8 bg-brand-primary rounded-full hidden md:block" />
//         {children}
//       </h2>
//     ),
//     h3: ({ children }: any) => (
//       <h3 className="text-xl md:text-2xl font-bold mt-10 mb-4 text-gray-800 dark:text-gray-100">
//         {children}
//       </h3>
//     ),
//     normal: ({ children }: any) => (
//       <p className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
//         {children}
//       </p>
//     ),
//     blockquote: ({ children }: any) => (
//       <blockquote className="border-l-4 border-brand-primary bg-gray-50 dark:bg-gray-800/50 p-6 my-8 rounded-r-xl text-gray-700 dark:text-gray-200 italic font-medium">
//         {children}
//       </blockquote>
//     ),
//   },
//   list: {
//     bullet: ({ children }: any) => (
//       <ul className="list-none my-6 space-y-3">{children}</ul>
//     ),
//     number: ({ children }: any) => (
//       <ol className="list-decimal list-inside my-6 space-y-3 text-gray-600 dark:text-gray-300">
//         {children}
//       </ol>
//     ),
//   },
//   listItem: {
//     bullet: ({ children }: any) => (
//       <li className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
//         <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
//         <span>{children}</span>
//       </li>
//     ),
//   },
//   marks: {
//     link: ({ value, children }: any) => {
//       const href = value?.href || "#";
//       const isInternal = href.startsWith("/") || href.startsWith("#");
//       return (
//         <Link
//           href={href}
//           target={isInternal ? undefined : "_blank"}
//           rel={isInternal ? undefined : "noopener noreferrer"}
//           className="text-brand-primary font-bold decoration-brand-primary/30 underline-offset-4 hover:underline transition-all"
//         >
//           {children}
//         </Link>
//       );
//     },
//   },
// };

// // =========================================================================
// // 📄 MAIN INFO PAGE COMPONENT
// // =========================================================================
// export default async function InfoPage({ params }: InfoPageProps) {
//   const { slug } = await params;

//   // ✅ Direct calls (both cached internally)
//   const [pageData, breadcrumbs] = await Promise.all([
//     getPayloadPageData(slug),
//     getPayloadBreadcrumbs("page", slug),
//   ]);

//   if (!pageData) notFound();

//   const siteUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   // 🔥 SEO JSON-LD
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "WebPage",
//     name: pageData.title,
//     description: pageData.excerpt || pageData.seo?.metaDescription,
//     url: `${siteUrl}/${slug}`,
//     publisher: {
//       "@type": "Organization",
//       name: "PocketValue",
//     },
//   };

//   return (
//     <main className="w-full bg-white dark:bg-gray-950">
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       {/* 1. HEADER SECTION */}
//       <section className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
//         <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
//           <div className="mb-6 flex justify-center">
//             <Breadcrumbs crumbs={breadcrumbs} />
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
//             {pageData.title}
//           </h1>
//           {pageData.subtitle && (
//             <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
//               {pageData.subtitle}
//             </p>
//           )}
//         </div>
//       </section>

//       {/* 2. CONTENT SECTION */}
//       <section className="px-4 py-16 md:py-24">
//         <article className="max-w-3xl mx-auto">
//           <div className="prose prose-brand dark:prose-invert max-w-none prose-img:rounded-2xl">
//             {/* ✅ FIX: fallback to empty array if body is null */}
//             <PortableText value={pageData.body || []} components={ptComponents} />
//           </div>
//         </article>
//       </section>
//     </main>
//   );
// }
// src/app/(main)/(pages)/[slug]/page.tsx
// ================================================================
// 📄 ENTERPRISE INFO PAGE ENGINE (UPGRADED)
// ================================================================
// Handles static pages: About Us, Privacy Policy, Terms, etc.
// All content is fetched from Payload CMS with full SEO support.
//
// 🆕 ENHANCEMENTS:
// ✅ WebPage Schema with @id, dateModified, inLanguage (#23)
// ✅ Metadata with article support for content-heavy pages (#80)
// ✅ Entity linking for AI overviews (#39)
// ================================================================

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";

// ✅ Payload Imports (Already cached internally)
import { getPayloadPageData } from "@/sanity/lib/payload/content.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";

// ✅ ISR: Page statically generated, served from CDN
export const revalidate = false;

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

// =========================================================================
// 🔥 METADATA (UPGRADED — with article support)
// =========================================================================
export async function generateMetadata({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = await getPayloadPageData(slug);

  if (!page) return {};

  // ✅ Use enhanced metadata with article support for content pages
  return generateBaseMetadata({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.excerpt?.substring(0, 160),
    image: page.seo?.ogImage,
    path: `/${page.slug}`,
    // ✅ Add published/updated dates for freshness signal (#23)
    publishedTime: page.createdAt || new Date().toISOString(),
    modifiedTime: page.updatedAt || page.updatedAt || new Date().toISOString(),
    // ✅ Add author/section for E-E-A-T (#80)
    author: "PocketValue Team",
    section: "Information",
  });
}

// =========================================================================
// 🔥 PORTABLE TEXT CUSTOM COMPONENTS (Unchanged)
// =========================================================================
const ptComponents = {
  types: {
    image: ({ value }: any) => {
      const src = urlFor(value).width(1200).quality(80).url();
      if (!src || src.includes("placeholder")) return null;

      return (
        <figure className="my-10 group">
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Image
              src={src}
              alt={value.alt || "PocketValue content image"}
              loading="lazy"
              width={1200}
              height={675}
              className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          {value.alt && (
            <figcaption className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 uppercase tracking-widest">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white flex items-center gap-3">
        <span className="w-1.5 h-8 bg-brand-primary rounded-full hidden md:block" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl md:text-2xl font-bold mt-10 mb-4 text-gray-800 dark:text-gray-100">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-brand-primary bg-gray-50 dark:bg-gray-800/50 p-6 my-8 rounded-r-xl text-gray-700 dark:text-gray-200 italic font-medium">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-none my-6 space-y-3">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside my-6 space-y-3 text-gray-600 dark:text-gray-300">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    link: ({ value, children }: any) => {
      const href = value?.href || "#";
      const isInternal = href.startsWith("/") || href.startsWith("#");
      return (
        <Link
          href={href}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="text-brand-primary font-bold decoration-brand-primary/30 underline-offset-4 hover:underline transition-all"
        >
          {children}
        </Link>
      );
    },
  },
};

// =========================================================================
// 📄 MAIN INFO PAGE COMPONENT (UPGRADED)
// =========================================================================
export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;

  // ✅ Parallel fetch (both cached)
  const [pageData, breadcrumbs] = await Promise.all([
    getPayloadPageData(slug),
    getPayloadBreadcrumbs("page", slug),
  ]);

  if (!pageData) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // 🔥 SEO JSON-LD — ENHANCED (#23, #39, #98)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/${slug}/#webpage`, // ✅ Entity linking (#39)
    name: pageData.title,
    description: pageData.excerpt || pageData.seo?.metaDescription || "",
    url: `${siteUrl}/${slug}`,
    // ✅ Content freshness (#23)
    dateModified: pageData.updatedAt || pageData.updatedAt || new Date().toISOString(),
    // ✅ Language signal (#98)
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "PocketValue",
      "@id": `${siteUrl}/#organization`,
    },
    // ✅ Breadcrumb linking
    breadcrumb: {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/${slug}/#breadcrumb`,
    },
  };

  return (
    <main className="w-full bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HEADER SECTION */}
      <section className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="mb-6 flex justify-center">
            <Breadcrumbs crumbs={breadcrumbs} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            {pageData.title}
          </h1>
          {pageData.subtitle && (
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {pageData.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* 2. CONTENT SECTION */}
      <section className="px-4 py-16 md:py-24">
        <article className="max-w-3xl mx-auto">
          <div className="prose prose-brand dark:prose-invert max-w-none prose-img:rounded-2xl">
            <PortableText value={pageData.body || []} components={ptComponents} />
          </div>
        </article>
      </section>
    </main>
  );
}