// import { notFound } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { PortableText } from "@portabletext/react";

// // import { client } from "@/sanity/lib/client";
// import { urlFor } from "@/sanity/lib/image";
// import { generateBaseMetadata } from "@/utils/metadata";

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayloadPageData } from "@/sanity/lib/payload/content.queries";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// export const dynamic = 'force-dynamic';
// // 🔥 FIX: Interface ab use hogi
// interface PageData {
//   _id: string;
//   title: string;
//   slug: string;
//   body: any;
//   subtitle?: string | null; // ✅ Null bhi allow kiya taake DB se match kare
//   excerpt?: string;
//   seo?: {
//     metaTitle?: string;
//     metaDescription?: string;
//     ogImage?: any;
//   };
// }

// interface PortableTextImage {
//   _type: "image";
//   asset: { _ref: string; _type: "reference" };
//   alt?: string;
// }

// type InfoPageProps = {
//   params: Promise<{ slug: string }>;
// };

// export async function generateMetadata({
//   params: paramsPromise,
// }: InfoPageProps) {
//   const { slug } = await paramsPromise;

//   // 🔥 FIX 1: Yahan 'as PageData | null' lagaya hai
//   const page = await getPayloadPageData(slug) as PageData | null;

//   if (!page) {
//     return {};
//   }

//   return generateBaseMetadata({
//     title: page.seo?.metaTitle || page.title,
//     description: page.seo?.metaDescription || page.excerpt?.substring(0, 160),
//     image: page.seo?.ogImage,
//     path: `/${page.slug}`,
//   });
// }

// // Portable Text components (ptComponents) remain unchanged...
// const ptComponents = {
//   types: {
//     image: ({ value }: { value: PortableTextImage }) => {
//       if (!value?.asset?._ref) return null;
//       const src = urlFor(value).width(1200).quality(80).url();
//       if (!src) return null;
//       return (
//         <figure className="my-8">
//           <Image
//             src={src}
//             alt={value.alt || "Informational image"}
//             loading="lazy"
//             width={1200}
//             height={800}
//             className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
//           />
//           {value.alt && (
//             <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
//               {value.alt}
//             </figcaption>
//           )}
//         </figure>
//       );
//     },
//   },
//   block: {
//     h2: ({ children }: any) => (
//       <h2 className="text-3xl font-bold mt-10 mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
//         {children}
//       </h2>
//     ),
//     h3: ({ children }: any) => (
//       <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-700 dark:text-gray-200">
//         {children}
//       </h3>
//     ),
//     blockquote: ({ children }: any) => (
//       <blockquote className="border-l-4 border-brand-primary bg-gray-50 dark:bg-gray-800/50 p-4 my-6 text-gray-600 dark:text-gray-300 italic">
//         {children}
//       </blockquote>
//     ),
//   },
//   list: {
//     bullet: ({ children }: any) => (
//       <ul className="list-disc list-inside my-4 space-y-2 text-gray-600 dark:text-gray-300">
//         {children}
//       </ul>
//     ),
//     number: ({ children }: any) => (
//       <ol className="list-decimal list-inside my-4 space-y-2 text-gray-600 dark:text-gray-300">
//         {children}
//       </ol>
//     ),
//   },
//   marks: {
//     link: ({ value, children }: any) => {
//       const href: string = value?.href || "";
//       const isInternal = href.startsWith("/") || href.startsWith("#");
//       if (isInternal) {
//         return (
//           <Link
//             href={href}
//             className="text-brand-primary font-semibold hover:underline"
//           >
//             {children}
//           </Link>
//         );
//       }
//       return (
//         <Link
//           href={href}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-brand-primary font-semibold hover:underline"
//         >
//           {children}
//         </Link>
//       );
//     },
//   },
// };

// export default async function InfoPage(props: InfoPageProps) {
//   const { slug } = await props.params;

//   // --- FETCH ALL DATA CONCURRENTLY ---
//   const [pageData, breadcrumbs] = await Promise.all([
//     // 🔥 FIX 2: Yahan bhi 'as Promise<PageData | null>' lagaya
//     getPayloadPageData(slug) as Promise<PageData | null>,
//     getPayloadBreadcrumbs("page", slug),
//   ]);

//   if (!pageData) {
//     notFound();
//   }

//   return (
//     <main className="w-full bg-white dark:bg-gray-900">
//       {/* 1. NEW HEADER SECTION */}
//       <div className="bg-gray-50 dark:bg-gray-800/50">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
//           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
//             {pageData.title}
//           </h1>
//           {/* Subtitle Display */}
//           {pageData.subtitle && (
//             <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 font-medium">
//               {pageData.subtitle}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* 2. MAIN CONTENT SECTION */}
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
//         <article className="max-w-4xl mx-auto">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbs} />
//           </div>

//           <div className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert">
//             <PortableText value={pageData.body} components={ptComponents} />
//           </div>
//         </article>
//       </div>
//     </main>
//   );
// }
// src/app/(main)/[slug]/page.tsx (Info Page)

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react"; // 🔥 Added for Deduplication
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";

// ✅ NEW PAYLOAD IMPORTS
import { getPayloadPageData } from "@/sanity/lib/payload/content.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

export const dynamic = "force-dynamic";

interface PageData {
  _id: string;
  title: string;
  slug: string;
  body: any;
  subtitle?: string | null;
  excerpt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}

type InfoPageProps = {
  params: Promise<{ slug: string }>;
};

// =========================================================================
// 🔥 CACHED DATA FETCHER (Prevents 2x DB Calls)
// =========================================================================
const getCachedPage = cache(async (slug: string) => {
  return (await getPayloadPageData(slug)) as PageData | null;
});

// =========================================================================
// 🔥 METADATA
// =========================================================================
export async function generateMetadata({ params }: InfoPageProps) {
  const { slug } = await params;
  const page = await getCachedPage(slug);

  if (!page) return {};

  return generateBaseMetadata({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.excerpt?.substring(0, 160),
    image: page.seo?.ogImage,
    path: `/${page.slug}`,
  });
}

// =========================================================================
// 🔥 PORTABLE TEXT CUSTOM COMPONENTS
// =========================================================================
const ptComponents = {
  types: {
    image: ({ value }: any) => {
      // 🔥 FIX: Updated to work with both Sanity Refs and Payload Objects
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
// 📄 MAIN INFO PAGE COMPONENT
// =========================================================================
export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;

  // CONCURRENT FETCH
  const [pageData, breadcrumbs] = await Promise.all([
    getCachedPage(slug),
    getPayloadBreadcrumbs("page", slug),
  ]);

  if (!pageData) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // 🔥 SEO JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageData.title,
    description: pageData.excerpt || pageData.seo?.metaDescription,
    url: `${siteUrl}/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "PocketValue",
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
            <PortableText value={pageData.body} components={ptComponents} />
          </div>
        </article>
      </section>
    </main>
  );
}
