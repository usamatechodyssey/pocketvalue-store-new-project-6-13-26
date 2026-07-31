
// src/proxy.ts
// ================================================================
// 🚀 ENTERPRISE PROXY/MIDDLEWARE ENGINE (UPGRADED)
// ================================================================
// This file handles:
// 1. Identity & Session Management (visitorId, sessionId)
// 2. Referral Tracking (Edge Redis)
// 3. UTM Attribution
// 4. Authentication Guard for protected routes
// 5. Rate Limiting for sensitive APIs
// 6. Security Headers (Enterprise-grade)
// 7. SEO: NoIndex for faceted filters (Point #5)
// 8. Performance: Bypass for sitemap, robots, OG images
// ================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { ipAddress } from "@vercel/functions";
import { v4 as uuidv4 } from "uuid";

// ============================================================
// 🚀 COST-SAVING BOT DETECTION LIST
// ============================================================
const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "applebot",
  "pingdom",
  "baiduspider",
  "yandexbot",
  "duckduckbot",
  "iaskspider",
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => lower.includes(bot));
}

// ============================================================
// 🛡️ SECURITY: Check if URL has faceted filters
// ============================================================
function hasFacetedFilters(searchParams: URLSearchParams): boolean {
  // Faceted filter parameters that should not be indexed
  const filterParams = ["page", "sort", "filter", "search", "q", "price", "brand", "category"];
  for (const param of filterParams) {
    if (searchParams.has(param)) {
      return true;
    }
  }
  return false;
}

// ============================================================
// 🛡️ PRODUCTION-GRADE PROXY HANDLER
// ============================================================
export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";
  const isBotRequest = isBot(userAgent);

  // ============================================================
  // 1. BYPASS FOR BOTS
  // ============================================================
  if (isBotRequest) {
    const res = NextResponse.next();
    // Security headers for bots too
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    return res;
  }

  // ============================================================
  // 2. IDENTITY & SOURCE DETECTION
  // ============================================================
  let visitorId: string = req.cookies.get("pv_visitor_id")?.value || "";
  if (!visitorId) {
    visitorId = uuidv4();
  }

  const urlSource = searchParams.get("utm_source");
  const cookieSource = req.cookies.get("utm_source")?.value;

  let sessionId: string = req.cookies.get("pv_session_id")?.value || "";
  let shouldResetSession = false;

  if (!sessionId) {
    shouldResetSession = true;
  } else if (urlSource && urlSource !== cookieSource) {
    shouldResetSession = true;
  }

  if (shouldResetSession) {
    sessionId = uuidv4();
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pv-visitor-id", visitorId);
  requestHeaders.set("x-pv-session-id", sessionId);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ============================================================
  // 3. SECURE COOKIE CONFIGURATION
  // ============================================================
  const cookieConfig = { httpOnly: true, path: "/", sameSite: "lax" as const };

  res.cookies.set("pv_visitor_id", visitorId, {
    ...cookieConfig,
    maxAge: 60 * 60 * 24 * 30,
  });

  res.cookies.set("pv_session_id", sessionId, {
    ...cookieConfig,
    maxAge: 30 * 60,
  });

  // ============================================================
  // 🚀 EDGE-SPEED REFERRAL LINK TRACKING (ZERO DB LOAD)
  // ============================================================
  const refParam = searchParams.get("ref");
  if (refParam && refParam !== "cart_recovery" && refParam.trim().length >= 3) {
    const cleanRefCode = refParam.trim().toUpperCase();

    res.cookies.set("ref_code", cleanRefCode, {
      ...cookieConfig,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });

    try {
      await redis.pfadd(`clicks:${cleanRefCode}`, visitorId);
      await redis.incr(`raw_clicks:${cleanRefCode}`);
    } catch (redisClickError) {
      console.error("⚠️ REFERRAL TELEMETRY WARNING: Redis click logger offline:", redisClickError);
    }
  }

  if (shouldResetSession && urlSource) {
    res.cookies.set("pv_session_start_pending", "true", {
      ...cookieConfig,
      httpOnly: false,
      maxAge: 60 * 5,
    });
  }

  const utmCampaign = searchParams.get("utm_campaign") || "";
  const isRecoveryLink =
    searchParams.get("ref") === "cart_recovery" ||
    utmCampaign.toLowerCase().includes("recovery");

  if (isRecoveryLink) {
    res.cookies.set("pv_recovered_cart_pending", "true", {
      ...cookieConfig,
      httpOnly: false,
      maxAge: 60 * 30,
    });
  }

  const urlCoupon = searchParams.get("coupon");
  if (urlCoupon) {
    res.cookies.set("pv_auto_coupon", urlCoupon.toUpperCase(), {
      ...cookieConfig,
      httpOnly: false,
      maxAge: 60 * 60 * 24,
    });
  }

  if (urlSource) {
    res.cookies.set("utm_source", urlSource, {
      ...cookieConfig,
      maxAge: 60 * 60 * 24,
    });
    res.cookies.set(
      "utm_medium",
      searchParams.get("utm_medium") || "None",
      { ...cookieConfig, maxAge: 60 * 60 * 24 }
    );
    res.cookies.set(
      "utm_campaign",
      searchParams.get("utm_campaign") || "None",
      { ...cookieConfig, maxAge: 60 * 60 * 24 }
    );
  } else if (!cookieSource) {
    res.cookies.set("utm_source", "Direct", cookieConfig);
    res.cookies.set("utm_medium", "None", cookieConfig);
    res.cookies.set("utm_campaign", "None", cookieConfig);
  }

  // ============================================================
  // 4. 🔥 SEO POINT #5: NOINDEX FOR FACETED FILTERS
  // ============================================================
  // Only apply to non-API, non-admin, non-sitemap routes
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSpecialRoute =
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/og-default.png";

  if (
    !isApiRoute &&
    !isAdminRoute &&
    !isSpecialRoute &&
    hasFacetedFilters(searchParams)
  ) {
    // Set X-Robots-Tag: noindex, nofollow to prevent indexing of filtered pages
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    // Also set a custom header for debugging
    res.headers.set("x-pv-noindex", "faceted-filters");
  }

  // ============================================================
  // 5. SECURITY AUTH GUARD
  // ============================================================
  const protectedRoutes = ["/account", "/wishlist", "/checkout"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const isProductionEnv = process.env.NODE_ENV === "production";
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName: isProductionEnv
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
    });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    res.headers.set("x-pv-is-converted", "true");
  } else {
    res.headers.set("x-pv-is-converted", "false");
  }

  // ============================================================
  // 6. 🔥 RATE LIMITER (Edge/Proxy)
  // ============================================================
  const sensitiveRoutes = [
    "/api/register",
    "/api/payment/initiate",
    "/api/checkout/orders/create",
    "/api/cart/verify-coupon",
    "/api/upload-image",
    "/api/user/update-image",
    "/api/visual-search",
  ];

  const isProduction = process.env.NODE_ENV === "production";

  if (
    isProduction && // ✅ Only apply rate limits in production to prevent localhost developer lockouts
    req.method === "POST" &&
    sensitiveRoutes.some((route) => pathname.startsWith(route))
  ) {
    const ip = ipAddress(req) || "127.0.0.1";
    const key = `rate:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, 10);
      }

      if (current > 5) {
        return NextResponse.json(
          { error: "Too Many Requests. Please wait 10 seconds." },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error("[RateLimiter] Redis error:", error);
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
  }

  // ============================================================
  // 7. 🔥 ENTERPRISE SECURITY HEADERS (Point #45)
  // ============================================================
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // ✅ HSTS (Strict-Transport-Security) — only in production
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  res.headers.set("x-pv-user-agent", userAgent);

  return res;
}

// ============================================================
// 🔥 MATCHER (UPGRADED — Excludes SEO metadata routes for performance)
// ============================================================
export const config = {
  matcher: [
    // Web pages (all except static assets)
    "/",
    "/((?!_next/static|_next/image|favicon.ico|admin|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|css|js|woff2?|ttf|otf|eot|map|json|xml|txt)).*)",

    // ✅ All sensitive API routes (Rate Limiter)
    "/api/register",
    "/api/payment/initiate",
    "/api/checkout/orders/create",
    "/api/cart/verify-coupon",
    "/api/user/update-image",
    "/api/visual-search",

    // ✅ Exclude SEO metadata routes (performance)
    // Note: These are excluded via the negative lookahead above (xml|txt)
    // We explicitly handle sitemap.xml, robots.txt, og images via the negative lookahead.
  ],
};