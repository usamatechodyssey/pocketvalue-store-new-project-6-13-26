// src/app/(main)/product/[slug]/page.tsx
// ================================================================
// 🛒 ENTERPRISE PRODUCT DETAIL PAGE ENGINE (UPGRADED — FINAL)
// ================================================================
// This file handles individual product pages with:
// ✅ ISR + Edge caching with on-demand revalidation
// ✅ ProductGroup + MerchantListing + VideoKeyMoments Schema (#38, #88, #134)
// ✅ Content freshness signals in metadata (#23)
// ✅ Entity linking for AI overviews (#39)
// ✅ Dynamic OG images with sale price, rating, stock, video badge
// ✅ Related products with low stock threshold
// ================================================================

import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

import ProductSectionWithBanner from "@/app/features/storefront/catalog/components/home/ProductCarousel";
import ProductClientManager from "@/app/features/storefront/catalog/components/product/ProductClientManager";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";


// ✅ PAYLOAD IMPORTS
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

import {
  getPayloadSingleProduct,
  getPayloadRelatedProducts,
} from "@/sanity/lib/payload/product.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// ✅ Structured Data Utilities (#38, #88, #134)
import { generateProductStructuredData } from "@/app/shared/lib/seo/structuredData";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// =====================================================
// ✅ ISR: Page will be statically generated on first request,
//    then served from CDN for all subsequent requests.
// =====================================================
export const revalidate = false;

// =====================================================
// 🔥 LIGHTWEIGHT METADATA FETCH (No variants, no reviews, no attributes)
// =====================================================
const getCachedProductMetadata = async (slug: string) => {
  return unstable_cache(
    async () => {
      const payload = await getSafePayload();

      const result = await payload.find({
        collection: "products",
        where: { slug: { equals: slug } },
        depth: 1,
        limit: 1,
        select: {
          id: true,
          slug: true,
          title: true,
          seo: true,
          brand: {
            name: true,
          },
          variants: {
            price: true,
            salePrice: true,
            images: true,
            stock: true,
            inStock: true,
          },
          // ✅ Added: isOnDeal, rating, reviewCount, videoUrl, updatedAt
          isOnDeal: true,
          rating: true,
          reviewCount: true,
          videoUrl: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      const doc = result.docs[0];
      if (!doc) return null;

      const defaultVariant = doc.variants?.[0] || null;

      return {
        title: doc.title,
        slug: doc.slug,
        seo: doc.seo || {},
        image: defaultVariant?.images?.[0] || null,
        price: defaultVariant?.salePrice || defaultVariant?.price || 0,
        salePrice: defaultVariant?.salePrice || null,
        brandName: doc.brand?.name || "PocketValue",
        isOnDeal: doc.isOnDeal || false,
        rating: doc.rating || 0,
        reviewCount: doc.reviewCount || 0,
        videoUrl: doc.videoUrl || null,
        stock: defaultVariant?.stock || 0,
        inStock: defaultVariant?.inStock || false,
        updatedAt: doc.updatedAt || new Date().toISOString(),
        createdAt: doc.createdAt || new Date().toISOString(),
      };
    },
    [`product-meta-${slug}`],
    {
      tags: [`product-${slug}`],
      revalidate: false,
    }
  )();
};

// =====================================================
// 🔥 METADATA GENERATION (Enhanced with all product data)
// =====================================================
export async function generateMetadata({
  params: paramsPromise,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await paramsPromise;

  const metaData = await getCachedProductMetadata(slug);
  if (!metaData) return {};

  const { title, seo, image, price, salePrice, brandName, rating, reviewCount, videoUrl, isOnDeal, stock, inStock } =
    metaData;
  const metaTitle = seo.metaTitle || title;
  const metaDescription =
    seo.metaDescription || `Shop for ${title} at PocketValue. Best price and quality.`;

  const imageUrlString = image ? urlFor(image).width(1200).height(630).url() : "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // ✅ UPGRADED: OG URL with ALL dynamic parameters (#38, #88, #134)
  const ogUrl = new URL(`${baseUrl}/api/og`);
  ogUrl.searchParams.set("title", metaTitle);
  ogUrl.searchParams.set("price", price.toLocaleString());
  ogUrl.searchParams.set("brand", brandName);
  if (imageUrlString) ogUrl.searchParams.set("image", imageUrlString);

  // ✅ NEW: Sale Price
  if (salePrice) {
    ogUrl.searchParams.set("salePrice", salePrice.toLocaleString());
  }

  // ✅ NEW: Rating & Review Count
  if (rating && rating > 0) {
    ogUrl.searchParams.set("rating", rating.toString());
    ogUrl.searchParams.set("reviewCount", (reviewCount || 0).toString());
  }

  // ✅ NEW: Video Badge
  if (videoUrl) {
    ogUrl.searchParams.set("videoUrl", videoUrl);
  }

  // ✅ NEW: Deal Badge
  if (isOnDeal) {
    ogUrl.searchParams.set("isOnDeal", "true");
  }

  // ✅ NEW: Stock Status
  ogUrl.searchParams.set("stock", (stock || 0).toString());
  ogUrl.searchParams.set("inStock", inStock ? "true" : "false");

  const baseMetadata = await generateBaseMetadata({
    title: metaTitle,
    description: metaDescription,
    image: image,
    path: `/product/${slug}`,
    // ✅ Point #23: Content Freshness
    publishedTime: metaData.createdAt,
    modifiedTime: metaData.updatedAt,
    author: brandName,
    section: "Product",
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      title: metaTitle,
      description: metaDescription,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: metaTitle }],
    },
    twitter: { ...baseMetadata.twitter, images: [ogUrl.toString()] },
  };
}

// =====================================================
// 🛒 PRODUCT DETAIL PAGE COMPONENT
// =====================================================
export default async function ProductDetailPage({
  params: paramsPromise,
}: ProductDetailPageProps) {
  const { slug } = await paramsPromise;

  // ✅ Fetch product data (Edge cached)
  const rawProduct = await getPayloadSingleProduct(slug);
  const product = rawProduct as any | null;

  // ✅ Centralized cached settings
  const settings = await getCachedSettings();
  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

  if (!product) notFound();

  // ✅ Concurrent fetch: Related products and breadcrumbs
  const [relatedProducts, breadcrumbs] = await Promise.all([
    getPayloadRelatedProducts(product._id, product.categoryIds || []),
    getPayloadBreadcrumbs("product", slug),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
  const siteName = settings.siteName || "PocketValue";
  const siteLogo = settings.siteLogo ? urlFor(settings.siteLogo).url() : undefined;

  // ✅ Fetch reviews (already attached to product via getPayloadSingleProduct)
  const reviews = product.reviews || [];

  // ================================================================
  // 🔥 STRUCTURED DATA — Using generateProductStructuredData
  //      Covers: #38, #71, #77, #88, #125, #134
  // ================================================================
  const structuredData = generateProductStructuredData({
    product: product,
    baseUrl: baseUrl,
    seo: product.seo || {},
    reviews: reviews,
    breadcrumbs: breadcrumbs,
    siteName: siteName,
    siteLogo: siteLogo,
    selectedVariant: product.defaultVariant,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="w-full bg-gray-50 dark:bg-gray-950 pb-20">
        <div className="max-w-480 mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
          </div>

          <ProductClientManager
            product={product}
            lowStockThreshold={lowStockThreshold}
          />
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <div
            className="w-full mt-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            aria-label="Related products"
            role="region"
          >
            <ProductSectionWithBanner
              products={relatedProducts}
              title="You Might Also Like"
              lowStockThreshold={lowStockThreshold}
            />
          </div>
        )}
      </main>
    </>
  );
}