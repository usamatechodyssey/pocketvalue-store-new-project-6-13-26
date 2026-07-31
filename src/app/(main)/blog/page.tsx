// src/app/blog/page.tsx
// ================================================================
// 📰 ENTERPRISE BLOG LISTING ENGINE (UPGRADED)
// ================================================================
// This file handles the blog listing page with:
// ✅ ISR + Edge caching
// ✅ Featured post + grid layout
// ✅ Pagination with rel="prev/next" (#2)
// ✅ CollectionPage Schema + BreadcrumbList (#77)
// ✅ Content freshness signals in metadata (#23)
// ================================================================

import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { getPaginatedPosts, GET_TOTAL_POST_COUNT } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { client } from "@/sanity/lib/client";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// ✅ Import structured data utilities
import { generateCollectionStructuredData } from "@/app/shared/lib/seo/structuredData";

export const revalidate = false;

// =========================================================================
// 🔥 METADATA (ENHANCED — with freshness signals)
// =========================================================================
export async function generateMetadata() {
  // ✅ Fetch latest post date for freshness signal (#23)
  const latestPost = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc)[0]{ publishedAt, _updatedAt }`
  );

  const now = new Date().toISOString();
  const latestDate = latestPost?.publishedAt || latestPost?._updatedAt || now;

  return generateBaseMetadata({
    title: "The PocketValue Blog - Tips & Values",
    description: "Insights, tips, and stories from our team to help you get the best value.",
    path: "/blog",
    // ✅ Content freshness signal (#23)
    publishedTime: latestDate,
    modifiedTime: latestDate,
    author: "PocketValue Team",
    section: "Blog",
    tags: ["ecommerce", "lifestyle", "shopping", "value"],
  });
}

// =========================================================================
// 📄 MAIN BLOG PAGE COMPONENT
// =========================================================================
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam || "1");
  const POSTS_PER_PAGE = 16;

  const getCachedTotalPosts = unstable_cache(
    async () => {
      return await client.fetch(GET_TOTAL_POST_COUNT);
    },
    ["blog-total"],
    { tags: ["blog-total"], revalidate: false }
  );

  const getCachedPaginatedPosts = async (currentPage: number) => {
    const cachedFn = unstable_cache(
      async () => {
        return await getPaginatedPosts(currentPage);
      },
      [`blog-posts-${currentPage}`],
      { tags: ["blog-posts"], revalidate: false }
    );
    return cachedFn();
  };

  const [posts, totalPosts, breadcrumbs] = await Promise.all([
    getCachedPaginatedPosts(page),
    getCachedTotalPosts(),
    getPayloadBreadcrumbs("blog"),
  ]);

  const featuredPost = page === 1 ? posts?.[0] : undefined;
  const otherPosts = page === 1 ? posts?.slice(1) : posts;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // ✅ Build structured data for blog listing (#77, #67)
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
  const collectionName = page === 1 ? "PocketValue Blog" : `PocketValue Blog - Page ${page}`;
  const collectionDescription =
    page === 1
      ? "Insights, tips, and stories from our team to help you get the best value."
      : `PocketValue Blog - Page ${page} of ${totalPages}`;

  const collectionSchema = generateCollectionStructuredData({
    name: collectionName,
    description: collectionDescription,
    url: `${siteUrl}/blog${page > 1 ? `?page=${page}` : ""}`,
    baseUrl: siteUrl,
    breadcrumbs: breadcrumbs,
  });

  // ✅ Determine prev/next URLs for pagination (#2)
  const prevUrl = page > 1 ? `/blog?page=${page - 1}` : null;
  const nextUrl = page < totalPages ? `/blog?page=${page + 1}` : null;

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950">
      {/* ✅ JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* ✅ Pagination rel="prev/next" for SEO (#2) */}
      {prevUrl && (
        <link rel="prev" href={`${siteUrl}${prevUrl}`} />
      )}
      {nextUrl && (
        <link rel="next" href={`${siteUrl}${nextUrl}`} />
      )}

      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
            POCKET<span className="text-brand-primary">BLOG</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 font-medium">
            Stories, value guides, and expert tips for smart shoppers.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        {posts?.length > 0 ? (
          <div className="space-y-16">
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-16/10 lg:aspect-auto h-full">
                  <Image
                    src={urlFor(featuredPost.mainImage).width(1200).url()}
                    alt={featuredPost.title || "Featured blog post"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-700"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
                    Featured Story
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white line-clamp-3 mb-6 group-hover:text-brand-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 font-bold uppercase tracking-tighter flex items-center gap-2">
                    Read Full Story{" "}
                    <span className="text-brand-primary">→</span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts?.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border dark:border-gray-800 hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={urlFor(post.mainImage).width(600).url()}
                      alt={post.title || "Blog post image"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-primary transition-colors mb-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between items-center">
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span className="text-brand-primary">Read More +</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-12 border-t dark:border-gray-800">
                <PaginationControls totalPages={totalPages} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-20 text-gray-500">
            Writing something amazing... Check back soon!
          </p>
        )}
      </div>
    </main>
  );
}