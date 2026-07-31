// src/app/api/cron/update-sitemap/route.ts
// ================================================================
// ⏰ ENTERPRISE SITEMAP CRON JOB ENGINE (NEW)
// ================================================================
// This file handles background sitemap regeneration and search engine notification.
// It is designed to be triggered by Vercel Cron Jobs (or any external scheduler).
// 
// 🛡️ FEATURES:
// ✅ Secure endpoint (CRON_SECRET authorization)
// ✅ Flushes sitemap-related Redis cache keys
// ✅ Revalidates Next.js data cache via revalidateTag
// ✅ Pings Google Search Console to notify about sitemap updates
// ✅ Pings Bing to notify about sitemap updates
// ✅ Returns detailed logs for monitoring
// ================================================================

import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// ================================================================
// 🛡️ SECURE CRON HANDLER
// ================================================================

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startTime = Date.now();
  const logs: string[] = [];

  try {
    // --- 1. AUTHENTICATION ---
    const authHeader = request.headers.get("authorization");
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("⚠️ Unauthorized cron attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    logs.push("✅ Authentication passed");

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

    // --- 2. FLUSH REDIS CACHE KEYS (Sitemap-related) ---
    try {
      logs.push("🧹 Flushing Redis sitemap cache keys...");

      // Get all keys that might be related to sitemaps
      const keysToDelete: string[] = [];

      // Pattern 1: Sitemap keys (we use multiple prefixes in our app)
      const sitemapKeys = await redis.keys("sitemap-*");
      keysToDelete.push(...sitemapKeys);

      // Pattern 2: Google feed cache
      const googleFeedKeys = await redis.keys("google-feed-*");
      keysToDelete.push(...googleFeedKeys);

      // Pattern 3: Filter data (since sitemap updates often mean filter data changes)
      const filterKeys = await redis.keys("filter-data-*");
      keysToDelete.push(...filterKeys);

      // Pattern 4: Product cache (generic product related)
      const productKeys = await redis.keys("products-by-slugs-*");
      keysToDelete.push(...productKeys);

      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
        logs.push(`🗑️ Deleted ${keysToDelete.length} Redis cache keys`);
      } else {
        logs.push("ℹ️ No Redis cache keys found to delete");
      }
    } catch (redisError: any) {
      logs.push(`⚠️ Redis flush warning: ${redisError.message}`);
      console.error("Redis flush error:", redisError);
      // Continue execution even if Redis fails
    }

    // --- 3. REVALIDATE NEXT.JS DATA CACHE ---
    try {
      logs.push("🔄 Revalidating Next.js cache tags...");

      // Revalidate all relevant tags
      // Note: The actual tags depend on what's in your sitemap.ts and homepage.queries
      await Promise.allSettled([
        revalidateTag("nav-categories", "max"),
        revalidateTag("homepage-data", "max"),
        revalidateTag("homepage", "max"),
        revalidateTag("active-campaigns", "max"),
        revalidateTag("deals-data", "max"),
        revalidateTag("faq-page", "max"),
        // Sitemap chunks are handled by the dynamic sitemap.ts, but we trigger a cache clear
        // for individual products by revalidating paths (we can't revalidate all at once)
      ]);

      // Revalidate static paths that are heavily used
      revalidatePath("/", "layout");
      revalidatePath("/deals", "page");
      revalidatePath("/blog", "page");
      revalidatePath("/sitemap.xml", "page");

      logs.push("✅ Revalidation completed for tags and paths");
    } catch (revalidateError: any) {
      logs.push(`⚠️ Revalidate warning: ${revalidateError.message}`);
      console.error("Revalidate error:", revalidateError);
    }

    // --- 4. PING GOOGLE SEARCH CONSOLE (Sitemap Submission) ---
    try {
      logs.push("📡 Pinging Google Search Console...");
      const sitemapUrl = `${baseUrl}/sitemap.xml`;
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(
        sitemapUrl
      )}`;

      const googleResponse = await fetch(googlePingUrl, {
        method: "GET",
        headers: { "User-Agent": "PocketValue-Cron/1.0" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (googleResponse.ok) {
        logs.push(`✅ Google ping successful (Status: ${googleResponse.status})`);
      } else {
        logs.push(
          `⚠️ Google ping returned unexpected status: ${googleResponse.status}`
        );
      }
    } catch (googleError: any) {
      logs.push(`⚠️ Google ping failed: ${googleError.message}`);
      console.error("Google ping error:", googleError);
    }

    // --- 5. PING BING (Optional but good practice) ---
    try {
      logs.push("📡 Pinging Bing...");
      const sitemapUrl = `${baseUrl}/sitemap.xml`;
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(
        sitemapUrl
      )}`;

      const bingResponse = await fetch(bingPingUrl, {
        method: "GET",
        headers: { "User-Agent": "PocketValue-Cron/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (bingResponse.ok) {
        logs.push(`✅ Bing ping successful (Status: ${bingResponse.status})`);
      } else {
        logs.push(
          `⚠️ Bing ping returned unexpected status: ${bingResponse.status}`
        );
      }
    } catch (bingError: any) {
      logs.push(`⚠️ Bing ping failed: ${bingError.message}`);
      console.error("Bing ping error:", bingError);
    }

    // --- 6. FINAL LOGGING & RESPONSE ---
    const duration = Date.now() - startTime;
    logs.push(`⏱️ Cron job completed in ${duration}ms`);

    console.log(`✅ Sitemap Cron Job finished in ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      logs: logs,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logs.push(`❌ CRITICAL ERROR: ${error.message}`);
    console.error("❌ Sitemap cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        duration: `${duration}ms`,
        logs: logs,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}