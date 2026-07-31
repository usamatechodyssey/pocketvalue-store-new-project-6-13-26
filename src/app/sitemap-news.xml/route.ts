// src/app/sitemap-news.xml/route.ts
// ================================================================
// 📰 ENTERPRISE NEWS SITEMAP ENGINE
// ================================================================
// Generates sitemap-news.xml for Google News.
// Only includes posts from the last 2 days (Google's requirement).
// ================================================================

import { NextResponse } from "next/server";
import { client as sanityClient } from "@/sanity/lib/client";
import groq from "groq";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function GET() {
  try {
    // 🚀 Fetch ONLY posts from the last 48 hours (Google News requirement)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const posts = await sanityClient.fetch(
      groq`*[_type == "post" && defined(slug.current) && publishedAt >= $twoDaysAgo] {
        "slug": slug.current,
        title,
        publishedAt,
        excerpt,
        "categories": categories[]->{ name },
        "mainImage": mainImage
      }`,
      { twoDaysAgo: twoDaysAgo.toISOString() }
    );

    if (posts.length === 0) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns:news="http://www.google.com/schemas/sitemap-news/1.0">
          <!-- No recent news articles found. Google requires articles from the last 2 days. -->
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
    <urlset xmlns:news="http://www.google.com/schemas/sitemap-news/1.0">`;

    for (const post of posts) {
      const postUrl = `${BASE_URL}/blog/${post.slug}`;
      const title = post.title || "Blog Post";
      const publicationDate = post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : new Date().toISOString();

      // Get first category for news tag (if available)
      const newsTag = post.categories?.[0]?.name || "E-commerce";

      // Generate excerpt for description
      const description =
        post.excerpt ||
        `Read the latest article: ${title} on PocketValue.`;

      xml += `
      <url>
        <loc>${escapeXml(postUrl)}</loc>
        <news:news>
          <news:publication>
            <news:name>PocketValue</news:name>
            <news:language>en</news:language>
          </news:publication>
          <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
          <news:title>${escapeXml(title)}</news:title>
          <news:keywords>${escapeXml(newsTag)}</news:keywords>
          <news:stock_tickers>PK</news:stock_tickers>
          <news:genres>Blog, PressRelease</news:genres>
        </news:news>
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
    console.error("❌ News Sitemap Generation Error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns:news="http://www.google.com/schemas/sitemap-news/1.0">
        <!-- Error generating news sitemap. -->
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