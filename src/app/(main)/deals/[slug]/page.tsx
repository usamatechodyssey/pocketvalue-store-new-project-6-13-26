// src/app/(main)/deals/[slug]/page.tsx
// ================================================================
// 🏷️ ENTERPRISE DEALS DETAIL PAGE ENGINE (UPGRADED — FINAL)
// ================================================================
// This file handles individual campaign/deal pages with:
// ✅ ISR + Edge caching with on-demand revalidation
// ✅ SaleEvent + BreadcrumbList Schema (#77, #86)
// ✅ Content freshness signals in metadata (#23)
// ✅ Entity linking for AI overviews (#39)
// ✅ Dynamic product listing with filters
// ✅ Hero banner with campaign details
// ================================================================

import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

import ProductListingClient from "@/app/features/storefront/catalog/components/category/ProductListingClient";
import { BreadcrumbItem } from "@/types";

// PAYLOAD IMPORTS
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { urlFor } from "@/sanity/lib/image";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ Structured Data Utilities
import {
  generateBreadcrumbStructuredData,
} from "@/app/shared/lib/seo/structuredData";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

// =====================================================
// ✅ ISR: Page statically generated on first request,
//    served from CDN thereafter. Cache cleared via tags.
// =====================================================
export const revalidate = false;

// =========================================================================
// 🔥 LIGHTWEIGHT METADATA FETCH (No products, no filterData)
// =========================================================================
const getCachedCampaignMetadata = async (slug: string) => {
  return unstable_cache(
    async () => {
      const payload = await getSafePayload();

      const campaignResult = await payload.find({
        collection: "campaigns",
        where: { slug: { equals: slug } },
        depth: 1,
      });

      const campaignDoc = campaignResult.docs[0];
      if (!campaignDoc || !campaignDoc.isActive) return null;

      const bannerUrl = campaignDoc.banner ? urlFor(campaignDoc.banner).url() : null;

      return {
        title: campaignDoc.title,
        description: campaignDoc.description,
        banner: bannerUrl,
        slug: campaignDoc.slug,
        // ✅ Added timestamps for freshness (#23)
        createdAt: campaignDoc.createdAt,
        updatedAt: campaignDoc.updatedAt,
      };
    },
    [`campaign-meta-${slug}`],
    {
      tags: [`campaign-${slug}`],
      revalidate: false,
    }
  )();
};

// =========================================================================
// 🔥 FULL CAMPAIGN DATA (With products for listing)
// =========================================================================
const getCachedCampaignData = async (slug: string, page: number, sort?: string) => {
  const cacheKey = `campaign-${slug}-${page}-${sort || "newest"}`;

  return unstable_cache(
    async () => {
      const payload = await getSafePayload();

      // 1. Fetch Campaign
      const campaignResult = await payload.find({
        collection: "campaigns",
        where: { slug: { equals: slug } },
        depth: 2,
      });

      const campaignDoc = campaignResult.docs[0];
      if (!campaignDoc || !campaignDoc.isActive) return null;

      // 2. Fetch Products & Global Filters (Using PLP Engine)
      const productData = await getPayloadProducts({
        campaignSlug: slug,
        page: page,
        sortOrder: sort || "newest",
      });

      const bannerUrl = campaignDoc.banner ? urlFor(campaignDoc.banner).url() : null;

      return {
        title: campaignDoc.title,
        description: campaignDoc.description,
        banner: bannerUrl,
        products: productData.products,
        totalCount: productData.totalCount,
        filterData: productData.filterData,
        slug: campaignDoc.slug,
        // ✅ Added timestamps for freshness (#23)
        createdAt: campaignDoc.createdAt,
        updatedAt: campaignDoc.updatedAt,
      };
    },
    [cacheKey],
    {
      tags: [`campaign-${slug}`],
      revalidate: false,
    }
  )();
};

// =========================================================================
// 🔥 METADATA GENERATION (Enhanced with freshness signals)
// =========================================================================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const metaData = await getCachedCampaignMetadata(slug);
  if (!metaData) return { title: "Deal Not Found" };

  const now = new Date().toISOString();

  return {
    title: `${metaData.title} - PocketValue Exclusive Deals`,
    description: metaData.description || `Exclusive offers for ${metaData.title}`,
    openGraph: {
      images: metaData.banner ? [{ url: metaData.banner }] : [],
    },
    // ✅ Point #23: Content Freshness
    other: {
      "article:published_time": metaData.createdAt || now,
      "article:modified_time": metaData.updatedAt || metaData.createdAt || now,
      "article:author": "PocketValue Team",
      "article:section": "Deals",
    },
  };
}

// =========================================================================
// 🛒 CAMPAIGN DETAIL PAGE (Server Component - ISR)
// =========================================================================
export default async function CampaignPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page, sort } = await searchParams;

  const currentPage = Number(page) || 1;

  // ✅ Using centralized cached settings
  const settings = await getCachedSettings();
  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

  // Parallel Fetching: Campaign Data + Breadcrumbs
  const [data, breadcrumbs] = await Promise.all([
    getCachedCampaignData(slug, currentPage, sort),
    getPayloadBreadcrumbs("deals", slug),
  ]);

  if (!data) return notFound();

  const { title, description, banner, products, filterData, totalCount } = data;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  const typedBreadcrumbs = breadcrumbs as BreadcrumbItem[];

  // ================================================================
  // 🔥 STRUCTURED DATA — BreadcrumbList + SaleEvent
  // ================================================================

  // 1. BreadcrumbList Schema (#77)
  const breadcrumbSchema = generateBreadcrumbStructuredData({
    breadcrumbs: typedBreadcrumbs,
    baseUrl: siteUrl,
  });

  // 2. SaleEvent Schema (#86)
  const saleEventSchema = {
    "@type": "SaleEvent",
    "@id": `${siteUrl}/deals/${slug}/#saleevent`,
    name: title,
    description: description || `Exclusive deals on ${title}`,
    image: banner || undefined,
    url: `${siteUrl}/deals/${slug}`,
    // ✅ Point #39: Entity linking
    organizer: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
    // ✅ Point #98: Language signal
    inLanguage: "en-US",
    // ✅ Point #23: Freshness (using current date as fallback)
    startDate: data.createdAt || new Date().toISOString(),
    endDate: data.updatedAt || data.createdAt || new Date().toISOString(),
  };

  // ✅ Combine both schemas
  const allSchemas = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbSchema,
      saleEventSchema,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* HERO BANNER */}
        <div className="relative w-full h-60 md:h-80 bg-gray-800 flex items-center justify-center overflow-hidden">
          {banner ? (
            <Image
              src={banner}
              alt={title}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-orange-600 opacity-90" />
          )}
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-white/90 mt-3 text-lg max-w-2xl mx-auto line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* PRODUCT LISTING */}
        <div className="max-w-480 mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Breadcrumbs crumbs={typedBreadcrumbs} />
          </div>

          <ProductListingClient
            key={`${slug}-${currentPage}`}
            initialProducts={products || []}
            filterData={filterData}
            totalCount={totalCount || 0}
            context={{ type: "deals", value: slug }}
            categoryTree={undefined}
            lowStockThreshold={lowStockThreshold}
          />
        </div>
      </main>
    </>
  );
}