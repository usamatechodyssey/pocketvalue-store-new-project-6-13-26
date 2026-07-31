
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { AppStateProvider } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../shared/providers/AuthProvider";
import "../globals.css";

import { ThemeProvider } from "next-themes";
import MainLayoutClient from "../shared/components/layout/MainLayoutClient";
import PWAInstallPrompt from "../shared/components/layout/PWAInstallPrompt";
import CookieConsent from "../shared/components/ui/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import { getPayloadNavigationCategories } from "@/sanity/lib/payload/category.queries";
import { getPayloadSearchSuggestions } from "@/sanity/lib/payload/settings.queries";
import { SanityCategory } from "@/types";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import NextTopLoader from "nextjs-toploader";

import IntelligenceTracker from "../features/admin/analytics-telemetry/components/IntelligenceTracker";

// ✅ Centralized settings cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

// ✅ Web Vitals client component for INP monitoring (local tracking)
import WebVitals from "@/app/shared/components/WebVitals";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  const baseSEO = generateBaseMetadata({
    title: settings.seo?.metaTitle || settings.siteName,
    description: settings.seo?.metaDescription,
    image: settings.seo?.ogImage,
    path: `/`,
  });

  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"
  ).replace(/\/$/, "");

  return {
    ...baseSEO,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.siteName || "PocketValue",
    },
    formatDetection: { telephone: false },
    // 🔥 SEO POINT #98: HREFLANG TAGS
    alternates: {
      canonical: `${siteUrl}/`,
      languages: {
        "en": `${siteUrl}/en`,
        "ur": `${siteUrl}/ur`,
        "x-default": `${siteUrl}/`,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, searchSuggestions, globalSettings] = await Promise.all([
    getPayloadNavigationCategories() as Promise<SanityCategory[]>,
    getPayloadSearchSuggestions(),
    getCachedSettings(),
  ]);

  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"
  ).replace(/\/$/, "");

  // ============================================================
  // Structured Data Schema (JSON-LD)
  // ============================================================
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: globalSettings.siteLogo
        ? urlFor(globalSettings.siteLogo).url()
        : `${siteUrl}/icon.svg`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: globalSettings.storePhoneNumber || "",
      contactType: "Customer Service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: globalSettings.socialLinks
      ? [
          globalSettings.socialLinks.facebook,
          globalSettings.socialLinks.instagram,
          globalSettings.socialLinks.twitter,
        ].filter(Boolean)
      : [],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={montserrat.variable}
    >
      <head>
        {/* Hreflang tags — primary method via <link> tags */}
        <link rel="alternate" hrefLang="en" href={`${siteUrl}/en`} />
        <link rel="alternate" hrefLang="ur" href={`${siteUrl}/ur`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/`} />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-brand-primary/30">
        
        {/* ✅ Standard HTML scripts for immediate bot parsing (Better SEO) */}
        <script
          type="application/ld+json"
          id="schema-org"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          id="schema-website"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Web Vitals Reporting Component */}
        <WebVitals />

        <NextTopLoader
          color="#f97316"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #f97316,0 0 5px #f97316"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <AppStateProvider>
              <Toaster position="bottom-center" containerClassName="z-[9999]" />

              <IntelligenceTracker />
              <PWAInstallPrompt />
              <CookieConsent />

              <Suspense
                fallback={
                  <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
                    <div className="h-20 w-full bg-white dark:bg-gray-800 animate-pulse border-b" />
                    <div className="flex-1 max-w-7xl mx-auto w-full pt-10 px-4">
                      <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    </div>
                  </div>
                }
              >
                <MainLayoutClient
                  categories={categories || []}
                  searchSuggestions={
                    searchSuggestions || {
                      trendingKeywords: [],
                      popularCategories: [],
                    }
                  }
                  globalSettings={globalSettings || {}}
                >
                  {children}
                </MainLayoutClient>
              </Suspense>
            </AppStateProvider>
          </AuthProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}