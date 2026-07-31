// src/app/(main)/search/page.tsx
// ================================================================
// 🔍 ENTERPRISE SEARCH PAGE ENGINE (UPGRADED — FINAL)
// ================================================================
// This file handles search pages with:
// ✅ ISR + Edge caching with on-demand revalidation
// ✅ SearchResultsPage Schema with @id and ItemList (#39)
// ✅ Content freshness signals in metadata (#23)
// ✅ Entity linking for AI overviews (#39)
// ✅ Visual Search + Text Search support
// ✅ NoIndex for search results (#5)
// ================================================================

import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// =========================================================================
// 🔥 CACHED SEARCH RESULTS (Edge Caching + On-Demand Revalidation)
// =========================================================================
const getCachedSearchResults = async (
  query: string,
  slugs: string[],
  sort: string,
  page: number
) => {
  const cacheKey = `search-${query}-${slugs.join("-")}-${sort}-${page}`;

  return unstable_cache(
    async () => {
      // Case A: Visual Search Results (By Slugs)
      if (slugs.length > 0) {
        const products = await getPayloadProductsBySlugs(slugs);
        return {
          products,
          totalCount: products.length,
          filterData: null,
          title: "Visual Search Results",
        };
      }

      // Case B: Regular Text Search
      const productData = await getPayloadProducts({
        searchTerm: query,
        sortOrder: sort,
        page: page,
      });

      return {
        products: productData.products,
        totalCount: productData.totalCount,
        filterData: productData.filterData,
        title: query ? `Results for "${query}"` : "Explore Products",
      };
    },
    [cacheKey],
    {
      tags: [`search-${query || "empty"}`],
      revalidate: false,
    }
  )();
};

// =========================================================================
// 🔥 METADATA (Enhanced with freshness signals)
// =========================================================================
export async function generateMetadata({
  searchParams: sp,
}: SearchPageProps): Promise<Metadata> {
  const searchParams = await sp;
  const q = (searchParams?.q as string) || "";
  const slugs =
    typeof searchParams?.slugs === "string"
      ? searchParams.slugs.split(",")
      : [];

  const now = new Date().toISOString();

  const baseMetadata = await generateBaseMetadata({
    title: q
      ? `Search: ${q}`
      : slugs.length > 0
        ? "Visual Search Results"
        : "Search Results",
    description: "Find the best deals on PocketValue.",
    path: "/search",
    // ✅ Point #23: Content Freshness
    publishedTime: now,
    modifiedTime: now,
    // ✅ Point #80: Author/Publisher signals
    author: "PocketValue Team",
    section: "Search",
  });

  // ✅ Point #5: NoIndex for search pages
  baseMetadata.robots = { index: false, follow: true };
  return baseMetadata;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsContainer searchParamsPromise={searchParams} />
    </Suspense>
  );
}

async function SearchResultsContainer({
  searchParamsPromise,
}: {
  searchParamsPromise: SearchPageProps["searchParams"];
}) {
  const searchParams = await searchParamsPromise;
  const q = (searchParams?.q as string) || "";
  const sort = (searchParams?.sort as string) || "best-match";
  const page = Number(searchParams?.page) || 1;
  const slugs =
    typeof searchParams?.slugs === "string"
      ? searchParams.slugs.split(",")
      : [];

  const trigger = (searchParams?.trigger as string) || "manual";

  const settings = await getCachedSettings();
  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

  const [data, breadcrumbs] = await Promise.all([
    getCachedSearchResults(q, slugs, sort, page),
    getPayloadBreadcrumbs("search"),
  ]);

  const { products, totalCount, filterData, title } = data;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // =================================================================
  // 🚀 SERVER-SIDE SEARCH TELEMETRY
  // =================================================================
  if (q) {
    await logUserEvent("search", "/search", {
      search_term: q,
      result_count: totalCount,
      trigger_source: trigger,
    });
  }

  // ================================================================
  // 🔥 SEO: SearchResultsPage Schema (Enhanced with @id)
  // ================================================================
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "@id": `${siteUrl}/search/#searchresults`, // ✅ Point #39: Entity linking
    // ✅ Point #98: Language signal
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      "@id": `${siteUrl}/search/#itemlist`,
      numberOfItems: totalCount,
      itemListElement: products.slice(0, 10).map((p: { slug: string }, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/product/${p.slug}`,
      })),
    },
  };

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950 px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-480 mx-auto">
        <div className="mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-3xl md:text-4xl font-bold mt-4">{title}</h1>
        </div>
        {products.length > 0 ? (
          <ProductListingClient
            key={`${q}-${slugs.join("")}-${page}`}
            initialProducts={products}
            filterData={
              filterData || {
                brands: [],
                attributes: [],
                priceRange: { min: 0, max: 0 },
              }
            }
            totalCount={totalCount}
            context={{ type: "search", value: q }}
            lowStockThreshold={lowStockThreshold}
          />
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Search size={48} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold">No Products Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm mt-1">
              Try checking your spelling, or request this product directly from
              our procurement team.
            </p>
            <Link
              href={`/request-product?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-lg hover:bg-brand-primary-hover active:scale-95 transition-all"
            >
              Request This Product
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" aria-hidden="true" />
      <p className="text-gray-500 font-medium">Searching our warehouse...</p>
    </div>
  );
}