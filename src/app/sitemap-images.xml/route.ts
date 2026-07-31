// src/app/sitemap-images.xml/route.ts
// ================================================================
// 🖼️ ENTERPRISE IMAGE SITEMAP ENGINE
// ================================================================
// Generates sitemap-images.xml for Google Image Search.
// Supports pagination for MILLIONS of product images.
// ================================================================

import { NextResponse } from "next/server";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

const IMAGES_PER_SITEMAP = 50000; // Google's limit
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * IMAGES_PER_SITEMAP;

    const payload = await getSafePayload();

    // 🚀 Fetch products with images ONLY (select minimal fields)
    const products = await payload.find({
      collection: "products",
      limit: IMAGES_PER_SITEMAP,
      skip: skip,
      select: {
        slug: true,
        title: true,
        variants: {
          images: true,
        },
      },
      sort: "-createdAt",
    });

    if (products.docs.length === 0) {
      // If no images found, return empty XML with proper headers
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
          <!-- No images found for this page -->
        </urlset>`,
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // 🔥 Iterate products and their variants
    for (const product of products.docs) {
      const productUrl = `${BASE_URL}/product/${product.slug}`;
      const productTitle = product.title || "Product";

      // Check if product has variants with images
      const hasImages = product.variants?.some(
        (v: any) => v.images && v.images.length > 0
      );

      if (!hasImages) continue;

      // Collect unique image URLs from all variants
      const imageUrls = new Set<string>();
      for (const variant of product.variants || []) {
        for (const img of variant.images || []) {
          const url =
            img.imgbbUrl || img.r2Url || img.url || img.asset?.url;
          if (url) {
            imageUrls.add(url);
          }
        }
      }

      if (imageUrls.size === 0) continue;

      // Each URL in sitemap needs a <url> entry with <image:image> children
      xml += `
      <url>
        <loc>${escapeXml(productUrl)}</loc>
        ${Array.from(imageUrls)
          .map(
            (imgUrl) => `
        <image:image>
          <image:loc>${escapeXml(imgUrl)}</image:loc>
          <image:title>${escapeXml(productTitle)}</image:title>
          <image:caption>${escapeXml(productTitle)} - Product Image</image:caption>
        </image:image>`
          )
          .join("")}
      </url>`;
    }

    xml += `</urlset>`;

    // ✅ Add pagination header for crawlers (next page)
    const nextPage = page + 1;
    const nextLink =
      products.docs.length === IMAGES_PER_SITEMAP
        ? `\n<!-- Next page available at: ${BASE_URL}/sitemap-images.xml?page=${nextPage} -->`
        : "";

    xml = xml.replace(
      "</urlset>",
      `${nextLink}\n</urlset>`
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        // ✅ Tell crawlers to check the next page
        "Link": products.docs.length === IMAGES_PER_SITEMAP
          ? `<${BASE_URL}/sitemap-images.xml?page=${nextPage}>; rel="next"`
          : "",
      },
    });
  } catch (error) {
    console.error("❌ Image Sitemap Generation Error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        <!-- Error generating image sitemap. Please try again later. -->
      </urlset>`,
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

// 🛡️ XML Escape Helper
function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}