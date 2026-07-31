// src/app/blog/[slug]/page.tsx
// ================================================================
// 📰 ENTERPRISE BLOG DETAIL PAGE ENGINE (UPGRADED)
// ================================================================
// This file handles individual blog post pages with:
// ✅ ISR + Edge caching
// ✅ BlogPosting Schema + Person Schema (#87)
// ✅ Content freshness signals in metadata (#23)
// ✅ Publisher Schema with Organization
// ✅ Related products integration
// ✅ E-E-A-T author signals with bio, image, sameAs
// ================================================================

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import { Calendar, UserCircle } from "lucide-react";

import { client } from "@/sanity/lib/client";
import { GET_SINGLE_POST_FOR_PAGE } from "@/sanity/lib/queries";
import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
import ProductSectionWithBanner from "@/app/features/storefront/catalog/components/home/ProductCarousel";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";

// ✅ Centralized Settings and Breadcrumbs
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// ✅ Structured Data Utilities (#87, #77)
import {
  generatePersonStructuredData,
  generateBreadcrumbStructuredData,
} from "@/app/shared/lib/seo/structuredData";

// ✅ ISR Enabled
export const revalidate = false;

// ================================================================
// 🔥 CACHED POST FETCHER
// ================================================================
const getCachedPost = async (slug: string) => {
  const cachedFn = unstable_cache(
    async () => {
      return await client.fetch<any>(GET_SINGLE_POST_FOR_PAGE, { slug });
    },
    [`blog-post-${slug}`],
    {
      tags: [`blog-post-${slug}`],
      revalidate: false,
    }
  );
  return cachedFn();
};

// ================================================================
// 🔥 METADATA (ENHANCED — with article freshness signals)
// ================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCachedPost(slug);
  if (!post) return {};

  const publishedAt = post.publishedAt || new Date().toISOString();
  const updatedAt = post._updatedAt || post.publishedAt || publishedAt;

  return generateBaseMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.seo?.ogImage || post.mainImage,
    path: `/blog/${post.slug}`,
    // ✅ Point #23: Content Freshness
    publishedTime: publishedAt,
    modifiedTime: updatedAt,
    // ✅ Point #80: Author / Publisher Signals
    author: post.author?.name || "PocketValue Team",
    section: post.categories?.[0]?.name || "Blog",
    tags: post.categories?.map((c: any) => c.name) || [],
  });
}

// ================================================================
// 🔥 PORTABLE TEXT COMPONENTS
// ================================================================
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

// ================================================================
// 📄 MAIN BLOG POST COMPONENT
// ================================================================
export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ✅ Fetch: Post + Settings + Breadcrumbs (all cached)
  const [post, settings, breadcrumbs] = await Promise.all([
    getCachedPost(slug),
    getCachedSettings(),
    getPayloadBreadcrumbs("blog", slug),
  ]);

  if (!post) notFound();

  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // ✅ Fetch related products (if any)
  let linkedProducts: string | any[] = [];
  if (post.relatedProductSlugs?.length > 0) {
    linkedProducts = await getPayloadProductsBySlugs(post.relatedProductSlugs);
  }

  // ✅ Generate author social links from global settings (#87)
  const sameAsLinks: string[] = [];
  if (settings.socialLinks) {
    if (settings.socialLinks.facebook) sameAsLinks.push(settings.socialLinks.facebook);
    if (settings.socialLinks.instagram) sameAsLinks.push(settings.socialLinks.instagram);
    if (settings.socialLinks.twitter) sameAsLinks.push(settings.socialLinks.twitter);
  }

  // ================================================================
  // 🔥 STRUCTURED DATA (JSON-LD)
  // ================================================================

  // 1. Person Schema for Author (#87)
  const authorSchema = generatePersonStructuredData({
    name: post.author?.name || "PocketValue Team",
    image: post.author?.image ? urlFor(post.author.image).url() : undefined,
    bio: post.author?.bio || "PocketValue contributor",
    sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
    baseUrl: siteUrl,
    slug: post.slug,
  });

  // 2. Breadcrumb Schema (#77)
  const breadcrumbSchema = generateBreadcrumbStructuredData({
    breadcrumbs: breadcrumbs,
    baseUrl: siteUrl,
  });

  // 3. BlogPosting Schema (main)
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${siteUrl}/blog/${post.slug}/#blogposting`,
    headline: post.title,
    description: post.excerpt || post.seo?.metaDescription || "",
    image: urlFor(post.mainImage).url(),
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post._updatedAt || post.publishedAt || new Date().toISOString(),
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/author/${post.slug}/#person`,
      name: post.author?.name || "PocketValue Team",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: settings.siteName || "PocketValue",
      logo: {
        "@type": "ImageObject",
        url: settings.siteLogo
          ? urlFor(settings.siteLogo).url()
          : `${siteUrl}/icon.svg`,
      },
    },
    // ✅ Entity linking for AI (#39)
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}/#webpage`,
    },
  };

  // Combine all schemas
  const allSchemas = {
    "@context": "https://schema.org",
    "@graph": [
      blogPostingSchema,
      authorSchema,
      breadcrumbSchema,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
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
                    alt={post.title || "Blog post cover image"}
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
                      alt={post.author?.name || "Author avatar"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircle size={48} className="text-gray-300" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {post.author?.name || "PocketValue Team"}
                    </p>
                    {/* ✅ E-E-A-T: Author bio display (#87) */}
                    {post.author?.bio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs line-clamp-2">
                        {post.author.bio}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
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
                lowStockThreshold={lowStockThreshold}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}