// // This is the page component for displaying a single blog post. It fetches the post data from Sanity based on the slug, generates metadata for SEO, and renders the post content using Portable Text. It also includes structured data for better search engine understanding and a section to display related products fetched from Payload CMS based on slugs defined in Sanity.
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { PortableText, PortableTextReactComponents } from "@portabletext/react";
// import { Calendar, UserCircle } from "lucide-react";

// import { client } from "@/sanity/lib/client";
// import {
//   getGlobalSettings,
//   GET_SINGLE_POST_FOR_PAGE,
//   getBreadcrumbs,
// } from "@/sanity/lib/queries";
// import SanityProduct from "@/sanity/types/product_types";

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
// import ProductSectionWithBanner from "@/app/components/home/ProductCarousel"; // Existing Carousel

// import { Post } from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";
// import { generateBaseMetadata } from "@/utils/metadata";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// type SinglePostPageProps = {
//   params: Promise<{ slug: string }>;
// };

// export async function generateMetadata({
//   params: paramsPromise,
// }: SinglePostPageProps) {
//   const { slug } = await paramsPromise;
//   const post = await client.fetch<Post & { seo?: any }>(
//     GET_SINGLE_POST_FOR_PAGE,
//     { slug },
//   );
//   if (!post) return {};
//   return generateBaseMetadata({
//     title: post.seo?.metaTitle || post.title,
//     description: post.seo?.metaDescription || post.excerpt,
//     image: post.seo?.ogImage || post.mainImage,
//     path: `/blog/${post.slug}`,
//   });
// }

// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// const portableTextComponents: Partial<PortableTextReactComponents> = {
//   types: {
//     image: ({ value }) => (
//       <figure className="my-8">
//         <Image
//           src={urlFor(value).width(800).url()}
//           alt={value.alt || "Blog post image"}
//           width={800}
//           height={450}
//           className="rounded-lg shadow-lg w-full h-auto"
//         />
//       </figure>
//     ),
//   },
//   block: {
//     h2: ({ children }) => (
//       <h2 className="text-3xl font-bold mt-10 mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">
//         {children}
//       </h2>
//     ),
//     h3: ({ children }) => (
//       <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-700 dark:text-gray-200">
//         {children}
//       </h3>
//     ),
//     blockquote: ({ children }) => (
//       <blockquote className="border-l-4 border-brand-primary bg-gray-50 dark:bg-gray-800/50 p-4 my-6 text-gray-600 dark:text-gray-300 italic">
//         {children}
//       </blockquote>
//     ),
//   },
//   marks: {
//     link: ({ children, value }) => {
//       const rel = !value.href.startsWith("/")
//         ? "noreferrer noopener"
//         : undefined;
//       return (
//         <a href={value.href} rel={rel} className="hover:underline">
//           {children}
//         </a>
//       );
//     },
//   },
// };

// export default async function SinglePostPage({
//   params: paramsPromise,
// }: SinglePostPageProps) {
//   const { slug } = await paramsPromise;

//   // 1. Fetch Blog from Sanity (Including the new relatedProductSlugs field)
//   const [post, globalSettings, breadcrumbs] = await Promise.all([
//     client.fetch<Post & { relatedProductSlugs?: string[] }>(
//       GET_SINGLE_POST_FOR_PAGE,
//       { slug },
//     ),
//     getGlobalSettings(),
//     getBreadcrumbs("blog", slug),
//   ]);

//   if (!post) {
//     notFound();
//   }

//   // 🔥 2. FETCH RELATED PRODUCTS FROM PAYLOAD (New Logic)
//   // 🔥 FIX: Explicitly define the type here
//   let linkedProducts: SanityProduct[] = [];
//   if (post.relatedProductSlugs && post.relatedProductSlugs.length > 0) {
//     // Slugs ka array use karke Payload se data fetch karna
//     linkedProducts = await getPayloadProductsBySlugs(post.relatedProductSlugs);
//   }

//   const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
//   const blogPostingSchema = {
//     "@context": "https://schema.org",
//     "@type": "BlogPosting",
//     headline: post.title,
//     description: post.excerpt,
//     image: urlFor(post.mainImage).url(),
//     url: `${siteUrl}/blog/${post.slug}`,
//     datePublished: post.publishedAt,
//     dateModified: post._updatedAt,
//     author: {
//       "@type": "Person",
//       name: post.author?.name || "PocketValue Team",
//     },
//     publisher: {
//       "@type": "Organization",
//       name: globalSettings.siteName || "PocketValue",
//       logo: {
//         "@type": "ImageObject",
//         url: globalSettings.siteLogo
//           ? urlFor(globalSettings.siteLogo).url()
//           : `${siteUrl}/icon.svg`,
//       },
//     },
//     mainEntityOfPage: {
//       "@type": "WebPage",
//       "@id": `${siteUrl}/blog`,
//     },
//   };

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
//       />
//       <div className="w-full bg-white dark:bg-gray-950">
//         <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbs} />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 xl:gap-16">
//             <aside className="lg:col-span-5">
//               <div className="lg:sticky lg:top-24 space-y-6">
//                 <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
//                   {post.title}
//                 </h1>

//                 <div className="flex flex-wrap gap-2">
//                   {post.categories?.map((cat) => (
//                     <Link
//                       key={cat._id}
//                       href={`/category/${cat.slug}`}
//                       className="text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
//                     >
//                       {cat.name}
//                     </Link>
//                   ))}
//                 </div>

//                 <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
//                   <Image
//                     src={urlFor(post.mainImage).width(800).url()}
//                     alt={post.title}
//                     width={800}
//                     height={800}
//                     priority
//                     className="w-full h-auto"
//                   />
//                 </div>
//               </div>
//             </aside>

//             <article className="lg:col-span-7 mt-8 lg:mt-0">
//               <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
//                 <div className="flex items-center gap-3">
//                   {post.author?.image ? (
//                     <Image
//                       src={urlFor(post.author.image).url()}
//                       alt={post.author.name || ""}
//                       width={40}
//                       height={40}
//                       className="rounded-full"
//                     />
//                   ) : (
//                     <UserCircle size={40} className="text-gray-400" />
//                   )}
//                   <div>
//                     <p className="font-bold text-gray-800 dark:text-gray-200">
//                       {post.author?.name || "PocketValue Team"}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       Author
//                     </p>
//                   </div>
//                 </div>
//                 <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
//                   <p className="font-bold text-gray-800 dark:text-gray-200">
//                     {formatDate(post.publishedAt)}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Publish Date
//                   </p>
//                 </div>
//               </div>

//               <div className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300">
//                 {post.body && (
//                   <PortableText
//                     value={post.body}
//                     components={portableTextComponents}
//                   />
//                 )}
//               </div>
//             </article>
//           </div>

//           {/* 🔥 3. SHOW LINKED PAYLOAD PRODUCTS (New Section at the Bottom) */}
//           {linkedProducts.length > 0 && (
//             <div className="mt-16 md:mt-24 pt-12 border-t border-gray-100 dark:border-gray-800">
//               <ProductSectionWithBanner
//                 title="Products Mentioned in this Story"
//                 products={linkedProducts}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react"; // 🔥 Added for Deduplication
import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import { Calendar, UserCircle } from "lucide-react";

import { client } from "@/sanity/lib/client";
import {
  getGlobalSettings,
  GET_SINGLE_POST_FOR_PAGE,
  getBreadcrumbs,
} from "@/sanity/lib/queries";
import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
import ProductSectionWithBanner from "@/app/components/home/ProductCarousel";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

export const dynamic = "force-dynamic";

// 🔥 CACHED FETCHER
const getCachedPost = cache(async (slug: string) => {
  return await client.fetch<any>(GET_SINGLE_POST_FOR_PAGE, { slug });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return {};

  return generateBaseMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.seo?.ogImage || post.mainImage,
    path: `/blog/${post.slug}`,
  });
}

// 🔥 PORTABLE TEXT COMPONENTS (Optimized for Next.js)
const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }) => (
      <figure className="my-10 overflow-hidden rounded-2xl border dark:border-gray-800 shadow-lg">
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt || "Blog image"}
          width={1200}
          height={675}
          className="w-full h-auto transition-transform hover:scale-[1.01] duration-500"
        />
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "";
      const isInternal = href.startsWith("/") || href.startsWith("#");
      // 🔥 FIX: Internal links use Next.js Link for instant navigation
      if (isInternal) {
        return (
          <Link
            href={href}
            className="text-brand-primary font-bold hover:underline"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-brand-primary font-bold hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-primary bg-brand-primary/5 p-6 my-8 rounded-r-2xl italic font-medium text-lg">
        {children}
      </blockquote>
    ),
  },
};

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Concurrent Fetch: Sanity Data
  const [post, globalSettings, breadcrumbs] = await Promise.all([
    getCachedPost(slug),
    getGlobalSettings(),
    getBreadcrumbs("blog", slug),
  ]);

  if (!post) notFound();

  // 2. Deep Integration: Fetch Products from Payload via Slugs
  let linkedProducts: string | any[] = [];
  if (post.relatedProductSlugs?.length > 0) {
    linkedProducts = await getPayloadProductsBySlugs(post.relatedProductSlugs);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // 3. Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: urlFor(post.mainImage).url(),
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author?.name || "PocketValue Team",
    },
    publisher: {
      "@type": "Organization",
      name: globalSettings.siteName || "PocketValue",
      logo: {
        "@type": "ImageObject",
        url: globalSettings.siteLogo
          ? urlFor(globalSettings.siteLogo).url()
          : `${siteUrl}/icon.svg`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <Breadcrumbs crumbs={breadcrumbs} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
            {/* STICKY SIDEBAR */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 space-y-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  {post.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {post.categories?.map((cat: any) => (
                    <span
                      key={cat._id}
                      className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-primary/10 border border-gray-100 dark:border-gray-800">
                  <Image
                    src={urlFor(post.mainImage).width(800).url()}
                    alt={post.title}
                    width={800}
                    height={800}
                    priority
                    className="w-full"
                  />
                </div>
              </div>
            </aside>

            {/* MAIN ARTICLE */}
            <article className="lg:col-span-7">
              <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {post.author?.image ? (
                    <Image
                      src={urlFor(post.author.image).url()}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircle size={48} className="text-gray-300" />
                  )}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {post.author?.name || "PocketValue Team"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Author
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    Published
                  </p>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black">
                {post.body && (
                  <PortableText
                    value={post.body}
                    components={portableTextComponents}
                  />
                )}
              </div>
            </article>
          </div>

          {/* LINKED PRODUCTS (Payload Integration) */}
          {linkedProducts.length > 0 && (
            <div className="mt-24 pt-16 border-t dark:border-gray-800">
              <ProductSectionWithBanner
                title="Products Mentioned"
                products={linkedProducts}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
