// src/app/sitemap-video.xml/route.ts
// ================================================================
// 🎬 ENTERPRISE VIDEO SITEMAP ENGINE
// ================================================================
// Generates sitemap-video.xml for Google Video Search.
// ================================================================

import { NextResponse } from "next/server";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";


export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function GET() {
  try {
    const payload = await getSafePayload();

    // 🚀 Fetch products that have a videoUrl
    const products = await payload.find({
      collection: "products",
      where: {
        videoUrl: { exists: true },
      },
      limit: 5000, // Video sitemaps usually smaller
      select: {
        slug: true,
        title: true,
        videoUrl: true,
        variants: {
          images: true,
        },
      },
      sort: "-createdAt",
    });

    if (products.docs.length === 0) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
          <!-- No videos found -->
        </urlset>`,
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }
      );
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    for (const product of products.docs) {
      const productUrl = `${BASE_URL}/product/${product.slug}`;
      const title = product.title || "Product Video";

      // Get thumbnail image from first variant
      const thumbnail =
        product.variants?.[0]?.images?.[0]?.imgbbUrl ||
        product.variants?.[0]?.images?.[0]?.r2Url ||
        product.variants?.[0]?.images?.[0]?.url ||
        "";

      const description = `Watch product video for ${title} at PocketValue.`;

      xml += `
      <url>
        <loc>${escapeXml(productUrl)}</loc>
        <video:video>
          <video:title>${escapeXml(title)}</video:title>
          <video:description>${escapeXml(description)}</video:description>
          <video:content_loc>${escapeXml(product.videoUrl)}</video:content_loc>
          ${thumbnail ? `<video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>` : ""}
          <video:publication_date>${new Date().toISOString()}</video:publication_date>
          <video:family_friendly>yes</video:family_friendly>
          <video:platform>web</video:platform>
        </video:video>
      </url>`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("❌ Video Sitemap Generation Error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
        <!-- Error generating video sitemap. -->
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

function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}