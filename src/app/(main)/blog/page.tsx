// // src/app/blog/page.tsx
// // ================================================================
// // 📰 ENTERPRISE BLOG LISTING ENGINE (UPGRADED)
// // ================================================================
// // This file handles the blog listing page with:
// // ✅ ISR + Edge caching
// // ✅ Featured post + grid layout
// // ✅ Pagination with rel="prev/next" (#2)
// // ✅ CollectionPage Schema + BreadcrumbList (#77)
// // ✅ Content freshness signals in metadata (#23)
// // ================================================================

// import Link from "next/link";
// import Image from "next/image";
// import { unstable_cache } from "next/cache";
// import { getPaginatedPosts, GET_TOTAL_POST_COUNT } from "@/sanity/lib/queries";
// import { urlFor } from "@/sanity/lib/image";
// import { generateBaseMetadata } from "@/utils/metadata";
// import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
// import PaginationControls from "@/app/shared/components/ui/PaginationControls";
// import { client } from "@/sanity/lib/client";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// // ✅ Import structured data utilities
// import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

// export const revalidate = false;

// // =========================================================================
// // 🔥 METADATA (ENHANCED — with freshness signals)
// // =========================================================================
// export async function generateMetadata() {
//   // ✅ Fetch latest post date for freshness signal (#23)
//   const latestPost = await client.fetch(
//     `*[_type == "post"] | order(publishedAt desc)[0]{ publishedAt, _updatedAt }`
//   );

//   const now = new Date().toISOString();
//   const latestDate = latestPost?.publishedAt || latestPost?._updatedAt || now;

//   return generateBaseMetadata({
//     title: "The PocketValue Blog - Tips & Values",
//     description: "Insights, tips, and stories from our team to help you get the best value.",
//     path: "/blog",
//     // ✅ Content freshness signal (#23)
//     publishedTime: latestDate,
//     modifiedTime: latestDate,
//     author: "PocketValue Team",
//     section: "Blog",
//     tags: ["ecommerce", "lifestyle", "shopping", "value"],
//   });
// }

// // =========================================================================
// // 📄 MAIN BLOG PAGE COMPONENT
// // =========================================================================
// export default async function BlogPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ page?: string }>;
// }) {
//   const { page: pageParam } = await searchParams;
//   const page = Number(pageParam || "1");
//   const POSTS_PER_PAGE = 16;

//   const getCachedTotalPosts = unstable_cache(
//     async () => {
//       return await client.fetch(GET_TOTAL_POST_COUNT);
//     },
//     ["blog-total"],
//     { tags: ["blog-total"], revalidate: false }
//   );

//   const getCachedPaginatedPosts = async (currentPage: number) => {
//     const cachedFn = unstable_cache(
//       async () => {
//         return await getPaginatedPosts(currentPage);
//       },
//       [`blog-posts-${currentPage}`],
//       { tags: ["blog-posts"], revalidate: false }
//     );
//     return cachedFn();
//   };

//   const [posts, totalPosts, breadcrumbs] = await Promise.all([
//     getCachedPaginatedPosts(page),
//     getCachedTotalPosts(),
//     getPayloadBreadcrumbs("blog"),
//   ]);

//   const featuredPost = page === 1 ? posts?.[0] : undefined;
//   const otherPosts = page === 1 ? posts?.slice(1) : posts;
//   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

//   // ✅ Build structured data for blog listing (#77, #67)
//   const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
//   const collectionName = page === 1 ? "PocketValue Blog" : `PocketValue Blog - Page ${page}`;
//   const collectionDescription =
//     page === 1
//       ? "Insights, tips, and stories from our team to help you get the best value."
//       : `PocketValue Blog - Page ${page} of ${totalPages}`;

//   const collectionSchema = generateCollectionStructuredData({
//     name: collectionName,
//     description: collectionDescription,
//     url: `${siteUrl}/blog${page > 1 ? `?page=${page}` : ""}`,
//     baseUrl: siteUrl,
//     breadcrumbs: breadcrumbs,
//   });

//   // ✅ Determine prev/next URLs for pagination (#2)
//   const prevUrl = page > 1 ? `/blog?page=${page - 1}` : null;
//   const nextUrl = page < totalPages ? `/blog?page=${page + 1}` : null;

//   return (
//     <main className="w-full bg-gray-50 dark:bg-gray-950">
//       {/* ✅ JSON-LD Structured Data */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
//       />

//       {/* ✅ Pagination rel="prev/next" for SEO (#2) */}
//       {prevUrl && (
//         <link rel="prev" href={`${siteUrl}${prevUrl}`} />
//       )}
//       {nextUrl && (
//         <link rel="next" href={`${siteUrl}${nextUrl}`} />
//       )}

//       <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-16 md:py-24 text-center">
//         <div className="container mx-auto px-4">
//           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
//             POCKET<span className="text-brand-primary">BLOG</span>
//           </h1>
//           <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 font-medium">
//             Stories, value guides, and expert tips for smart shoppers.
//           </p>
//         </div>
//       </section>

//       <div className="container mx-auto px-4 py-12 md:py-16">
//         <div className="mb-10">
//           <Breadcrumbs crumbs={breadcrumbs} />
//         </div>

//         {posts?.length > 0 ? (
//           <div className="space-y-16">
//             {featuredPost && (
//               <Link
//                 href={`/blog/${featuredPost.slug}`}
//                 className="group grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
//               >
//                 <div className="relative aspect-16/10 lg:aspect-auto h-full">
//                   <Image
//                     src={urlFor(featuredPost.mainImage).width(1200).url()}
//                     alt={featuredPost.title || "Featured blog post"}
//                     fill
//                     className="object-cover transition-transform group-hover:scale-105 duration-700"
//                   />
//                 </div>
//                 <div className="p-8 md:p-12 flex flex-col justify-center">
//                   <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
//                     Featured Story
//                   </span>
//                   <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white line-clamp-3 mb-6 group-hover:text-brand-primary transition-colors">
//                     {featuredPost.title}
//                   </h2>
//                   <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 line-clamp-3">
//                     {featuredPost.excerpt}
//                   </p>
//                   <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 font-bold uppercase tracking-tighter flex items-center gap-2">
//                     Read Full Story{" "}
//                     <span className="text-brand-primary">→</span>
//                   </div>
//                 </div>
//               </Link>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {otherPosts?.map((post: any) => (
//                 <Link
//                   key={post._id}
//                   href={`/blog/${post.slug}`}
//                   className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border dark:border-gray-800 hover:shadow-xl transition-all"
//                 >
//                   <div className="relative aspect-video">
//                     <Image
//                       src={urlFor(post.mainImage).width(600).url()}
//                       alt={post.title || "Blog post image"}
//                       fill
//                       className="object-cover transition-transform group-hover:scale-105 duration-700"
//                     />
//                   </div>
//                   <div className="p-6 flex flex-col grow">
//                     <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-primary transition-colors mb-3">
//                       {post.title}
//                     </h3>
//                     <p className="text-sm text-gray-500 line-clamp-3 mb-6">
//                       {post.excerpt}
//                     </p>
//                     <div className="mt-auto pt-4 border-t text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between items-center">
//                       <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
//                       <span className="text-brand-primary">Read More +</span>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>

//             {totalPages > 1 && (
//               <div className="pt-12 border-t dark:border-gray-800">
//                 <PaginationControls totalPages={totalPages} />
//               </div>
//             )}
//           </div>
//         ) : (
//           <p className="text-center py-20 text-gray-500">
//             Writing something amazing... Check back soon!
//           </p>
//         )}
//       </div>
//     </main>
//   );
// }
// 📂 src/app/blog/page.tsx

import Link from "next/link";
import { unstable_cache } from "next/cache";
import { GET_TOTAL_POST_COUNT, GET_ALL_BOOK_CHAPTERS } from "@/sanity/lib/queries";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { client } from "@/sanity/lib/client";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import { Bookmark, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

// ✅ Import structured data utilities
import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";
import { BookChapterItem } from "./components/BookSidebar";

export const revalidate = false;

// =========================================================================
// 🔥 METADATA
// =========================================================================
export async function generateMetadata() {
  const latestPost = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc)[0]{ publishedAt, _updatedAt }`
  );

  const now = new Date().toISOString();
  const latestDate = latestPost?.publishedAt || latestPost?._updatedAt || now;

  return generateBaseMetadata({
    title: "Shopping Guides & Smart Tips — PocketValue Blog",
    description: "Expert shopping guides, product buying tips, and smart advice to help you shop with confidence.",
    path: "/blog",
    publishedTime: latestDate,
    modifiedTime: latestDate,
    author: "PocketValue Team",
    section: "Shopping Guides",
    tags: ["shopping", "guides", "tips", "deals", "reviews"],
  });
}

// =========================================================================
// 📄 MAIN BLOG PAGE COMPONENT (Customer-Friendly Shopping Guides)
// =========================================================================
export default async function BlogPage() {
  // Cache Fetchers
  const getCachedTotalPosts = unstable_cache(
    async () => {
      return await client.fetch(GET_TOTAL_POST_COUNT);
    },
    ["blog-total"],
    { tags: ["blog-total"], revalidate: false }
  );

  const getCachedAllChapters = unstable_cache(
    async () => {
      return await client.fetch<BookChapterItem[]>(GET_ALL_BOOK_CHAPTERS);
    },
    ["blog-all-chapters"],
    { tags: ["blog-all-chapters"], revalidate: false }
  );

  const [allChapters, totalPosts, breadcrumbs] = await Promise.all([
    getCachedAllChapters(),
    getCachedTotalPosts(),
    getPayloadBreadcrumbs("blog"),
  ]);

  // Group articles dynamically by Category / Shopping Topic
  const groupedVolumes = Array.from(
    allChapters.reduce((map, chapter) => {
      const vol = chapter.categoryName || "General Shopping Guides";
      if (!map.has(vol)) {
        map.set(vol, []);
      }
      map.get(vol)!.push(chapter);
      return map;
    }, new Map<string, BookChapterItem[]>()).entries()
  ).map(([volumeName, chaptersList]) => ({
    volumeName,
    chaptersList,
  }));

  // SEO Structured Data Schema
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
  const collectionName = "PocketValue Shopping Guides & Blog";
  const collectionDescription = "Expert shopping guides, product buying tips, and smart advice to help you shop with confidence.";

  const collectionSchema = generateCollectionStructuredData({
    name: collectionName,
    description: collectionDescription,
    url: `${siteUrl}/blog`,
    baseUrl: siteUrl,
    breadcrumbs: breadcrumbs,
  });

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950 font-sans min-h-screen transition-colors duration-300">
      {/* ✅ JSON-LD Structured Data (Kept for Google SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* HERO SECTION (Customer-Friendly Copywriting) */}
      <section className="bg-white dark:bg-gray-900 border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 md:py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
        <div className="container mx-auto px-4 relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3.5 py-1.5 rounded-full uppercase tracking-widest select-none">
            <Sparkles size={12} /> Shopping Guides &amp; Smart Tips · {totalPosts || 0} Articles Available
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white font-mono leading-none uppercase">
            SHOPPING<span className="text-brand-primary">GUIDES</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed font-sans">
            Expert buying advice, product reviews, and smart shopping tips to help you get the best value on every order.
          </p>
        </div>
      </section>

      {/* BREADCRUMBS & CONTENT SECTION */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1550px]">
        <div className="mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        {groupedVolumes.length > 0 ? (
          <div className="space-y-12">
            
            {/* CATEGORY / GUIDE SERIES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {groupedVolumes.map(({ volumeName, chaptersList }, volIdx) => (
                <div
                  key={volumeName}
                  className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="space-y-6 flex-1">
                    {/* Category Title Header */}
                    <div className="flex justify-between items-start pb-4 border-b border-zinc-200/50 dark:border-zinc-800/80 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shadow-2xs shrink-0 select-none">
                          <Bookmark size={18} />
                        </div>
                        <div className="min-w-0 font-mono">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block leading-none">
                            Category {String(volIdx + 1).padStart(2, "0")}
                          </span>
                          <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1 uppercase truncate max-w-xs sm:max-w-md leading-none">
                            {volumeName}
                          </h2>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 select-none">
                        {chaptersList.length} Guides
                      </span>
                    </div>

                    {/* Articles List Table */}
                    <div className="space-y-2 flex-1" role="list">
                      {chaptersList.slice(0, 5).map((chapter, chapIdx) => (
                        <Link
                          key={chapter._id}
                          href={`/blog/${chapter.slug}`}
                          className="p-3 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs group/item transition-all no-underline hover:no-underline"
                          role="listitem"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono font-bold text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-300/40 dark:border-zinc-700/50 shrink-0 select-none">
                              Guide {String(chapIdx + 1).padStart(2, "0")}
                            </span>
                            <span className="font-sans font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover/item:text-brand-primary transition-colors text-xs">
                              {chapter.title}
                            </span>
                          </div>
                          <ChevronRight size={13} className="shrink-0 text-zinc-400 group-hover/item:text-brand-primary transition-transform duration-200 group-hover/item:translate-x-1" />
                        </Link>
                      ))}

                      {chaptersList.length > 5 && (
                        <p className="text-[10px] font-mono text-zinc-400 text-center italic mt-2">
                          + {chaptersList.length - 5} more guides in this category
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Master CTA */}
                  <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/80">
                    <Link
                      href={`/blog/${chaptersList[0].slug}`}
                      className="w-full py-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 flex justify-center items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300 hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-2xs no-underline hover:no-underline cursor-pointer"
                    >
                      Explore Category Guides <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <p className="text-center py-24 text-zinc-500 font-mono text-xs italic">
            Publishing new shopping guides... Check back soon!
          </p>
        )}
      </div>

      {/* FOOTER BANNER (100% Customer-Friendly) */}
      <div className="container mx-auto px-4 max-w-[1550px] pb-16 pt-8">
        <div className="p-6 bg-white dark:bg-gray-900 border border-zinc-200 dark:border-zinc-800 text-center rounded-[2.5rem] shadow-2xs">
          <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-4 flex-wrap font-mono">
            <span>🛒 PocketValue Shopping Hub</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>⏱️ Quick Reading Guides</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>💡 Product Buying Advice</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>🎯 Value Shopping Tips</span>
          </p>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-3 font-medium italic">
            Browse our latest articles and shopping guides to make smart buying decisions on every order.
          </p>
        </div>
      </div>
    </main>
  );
}