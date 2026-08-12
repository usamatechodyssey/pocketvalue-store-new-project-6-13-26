// src/app/api/google-shopping/route.ts
// ================================================================
// 🛒 ENTERPRISE GOOGLE SHOPPING FEED ENGINE (UPGRADED)
// ================================================================
// Generates dynamic Google Shopping/Merchant Center XML feed with:
// - ALL product variants with prices, stock, images
// - Brand, color, size attributes (from variants)
// - Ratings & review counts (batch fetched for performance)
// - Sale prices & discount indicators
// - Dynamic shipping cost from settings
// - Pagination support (limit/skip) for MILLIONS of products
// - Edge caching with stale-while-revalidate
// ================================================================

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ================================================================
// 🚀 BATCH REVIEW FETCH (Eliminates N+1)
// ================================================================
async function getBulkReviewsForProducts(productIds: string[]) {
  if (!productIds || productIds.length === 0) return new Map();

  const payload = await getSafePayload();
  const result = await payload.find({
    collection: "reviews",
    where: {
      product: { in: productIds },
      isApproved: { equals: true },
    },
    depth: 1,
    sort: "-createdAt",
  });

  const reviewsMap = new Map<string, any[]>();
  result.docs.forEach((review: any) => {
    const productId = review.product?.id || review.product;
    if (!productId) return;
    if (!reviewsMap.has(productId)) {
      reviewsMap.set(productId, []);
    }
    reviewsMap.get(productId)!.push(review);
  });

  return reviewsMap;
}

// ================================================================
// 🚀 CACHED XML GENERATOR (Edge Caching + Pagination)
// ================================================================
const getCachedGoogleFeed = unstable_cache(
  async (skip: number = 0, limit: number = 1000) => {
    const payload = await getSafePayload();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

    // ✅ Fetch settings for dynamic shipping cost
    const settings = await getCachedSettings();
    const shippingCost = settings.shippingCost ?? 350;

    // ✅ Fetch products with pagination (supports millions of products)
    const { docs: products, totalDocs } = await payload.find({
      collection: "products",
      limit: limit,
      skip: skip,
      depth: 2,
      sort: "-createdAt",
    });

    // ✅ Batch fetch all reviews (N+1 fix)
    const productIds = products.map((p: any) => p.id);
    const reviewsMap = await getBulkReviewsForProducts(productIds);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
      <channel>
        <title>PocketValue Official Feed</title>
        <link>${baseUrl}</link>
        <description>PocketValue — Your Pocket. Our Value. • Official E-commerce Feed with Dynamic Inventory &amp; Ratings</description>`;

    // Products Loop
    for (const p of products as any) {
      const reviews = reviewsMap.get(p.id) || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            reviews.length
          : p.rating || 0;
      const reviewCount = reviews.length || p.reviewCount || 0;

      p.variants?.forEach((variant: any, index: number) => {
        const price = variant.price || 0;
        const salePrice = variant.salePrice;
        const image = variant.images?.[0]?.imgbbUrl || variant.images?.[0]?.r2Url || variant.images?.[0]?.url || "";
        const color = variant.attributes?.find((a: any) =>
          ["color", "colour"].includes(a.name.toLowerCase())
        )?.value;
        const size = variant.attributes?.find((a: any) =>
          ["size"].includes(a.name.toLowerCase())
        )?.value;

        // ✅ Determine availability (Google requires exact strings)
        const stock = variant.stock || 0;
        const inStock = variant.inStock && stock > 0;
        const availability = inStock ? "in stock" : "out of stock";

        xml += `
        <item>
          <g:id>${escapeXml(variant.sku || `${p.id}-${index}`)}</g:id>
          <g:item_group_id>${escapeXml(p.id)}</g:item_group_id>
          <g:title>${escapeXml(p.title)} ${size ? `- ${size}` : ""}</g:title>
          <g:description>${escapeXml(p.description?.root?.children?.[0]?.children?.[0]?.text || p.title)}</g:description>
          <g:link>${baseUrl}/product/${p.slug}</g:link>
          <g:image_link>${escapeXml(image)}</g:image_link>
          <g:condition>new</g:condition>
          <g:availability>${availability}</g:availability>
          <g:price>${price} PKR</g:price>
          ${salePrice ? `<g:sale_price>${salePrice} PKR</g:sale_price>` : ""}
          <g:brand>${escapeXml(p.brand?.name || "PocketValue")}</g:brand>
          <g:google_product_category>${escapeXml(p.categories?.[0]?.name || "Apparel & Accessories")}</g:google_product_category>

          <g:shipping>
            <g:country>PK</g:country>
            <g:service>Standard</g:service>
            <g:price>${shippingCost} PKR</g:price>
          </g:shipping>

          ${color ? `<g:color>${escapeXml(color)}</g:color>` : ""}
          ${size ? `<g:size>${escapeXml(size)}</g:size>` : ""}
          <g:identifier_exists>${variant.sku ? "yes" : "no"}</g:identifier_exists>
          <g:ads_redirect>${baseUrl}/product/${p.slug}</g:ads_redirect>
          ${avgRating > 0 ? `<g:rating>${avgRating.toFixed(1)}</g:rating>` : ""}
          ${reviewCount > 0 ? `<g:review_count>${reviewCount}</g:review_count>` : ""}
        </item>`;
      });
    }

    xml += `</channel></rss>`;

    // ✅ Add pagination metadata as comments for debugging
    xml = xml.replace(
      "</rss>",
      `<!-- Total Products: ${totalDocs}, Current Batch: ${products.length}, Skip: ${skip}, Limit: ${limit} -->\n</rss>`
    );

    return {
      xml,
      totalDocs,
      currentBatch: products.length,
      hasMore: skip + limit < totalDocs,
    };
  },
  ["google-shopping-feed"],
  {
    tags: ["google-feed"],
    revalidate: 3600, // Revalidate every hour
  }
);

// ================================================================
// 🚀 API ROUTE HANDLER (with Pagination Support)
// ================================================================
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "1000"), 5000);
    const skip = (page - 1) * limit;

    const result = await getCachedGoogleFeed(skip, limit);

    if (!result || !result.xml) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
          <channel>
            <title>PocketValue Official Feed</title>
            <link>${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"}</link>
            <description>No products found in this batch.</description>
          </channel>
        </rss>`,
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    };

    // ✅ Add pagination link header for crawlers
    if (result.hasMore) {
      const nextPage = page + 1;
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
      headers["Link"] = `<${baseUrl}/api/google-shopping?page=${nextPage}&limit=${limit}>; rel="next"`;
    }

    return new NextResponse(result.xml, { headers });
  } catch (error) {
    console.error("Google Shopping Feed Generation Error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>Error Generating Feed</title>
          <description>Please try again later.</description>
        </channel>
      </rss>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  }
}

// ================================================================
// 🛡️ XML ESCAPE HELPER
// ================================================================
function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}