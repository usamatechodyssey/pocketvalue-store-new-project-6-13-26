// src/app/(main)/contact-us/page.tsx
// ================================================================
// 📞 ENTERPRISE CONTACT PAGE ENGINE (UPGRADED — FINAL)
// ================================================================
// This file handles the Contact Us page with:
// ✅ ContactPoint Schema with @id (#39)
// ✅ LocalBusiness Schema (#100) — For local SEO
// ✅ Cached breadcrumbs + settings
// ✅ Contact form with honeypot protection
// ✅ Full accessibility support
// ================================================================

import { unstable_cache } from "next/cache";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "../../features/storefront/catalog/components/ContactForm";

import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";

// =========================================================================
// 🔥 CACHED BREADCRUMBS
// =========================================================================
const getCachedBreadcrumbs = unstable_cache(
  async () => {
    return await getPayloadBreadcrumbs("contact-us");
  },
  ["breadcrumbs-contact-us"],
  {
    tags: ["breadcrumbs-contact-us"],
    revalidate: false,
  }
);

// =========================================================================
// 🔥 METADATA (Enhanced with freshness signals)
// =========================================================================
export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    title: "Contact Us | PocketValue Customer Support",
    description:
      "Have questions? Get in touch with PocketValue. We're here to assist with orders, tracking, and product queries.",
    path: "/contact-us",
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    author: "PocketValue Team",
    section: "Contact",
  });
}

// =========================================================================
// 📄 MAIN CONTACT PAGE
// =========================================================================
export default async function ContactPage() {
  const [settings, breadcrumbs] = await Promise.all([
    getCachedSettings(),
    getCachedBreadcrumbs(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // ✅ Try to get lat/lng from warehouse locations if available
  const firstWarehouse = settings.warehouse?.locations?.[0];
  const latitude = firstWarehouse?.lat;
  const longitude = firstWarehouse?.lng;

  // ================================================================
  // 🔥 SEO: Organization + ContactPoint Schema
  // ================================================================
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "PocketValue",
    url: siteUrl,
    contactPoint: [
      {
        "@type": "ContactPoint",
        "@id": `${siteUrl}/contact-us/#contactpoint`,
        telephone: settings.storePhoneNumber || "",
        contactType: "customer service",
        email: settings.storeContactEmail || "",
        availableLanguage: ["English", "Urdu"],
        inLanguage: "en-US",
      },
    ],
  };

  // ================================================================
  // 🆕 TASK #100: LocalBusiness Schema (Karachi, Sindh based)
  // ================================================================
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: "PocketValue",
    url: siteUrl,
    telephone: settings.storePhoneNumber || "",
    email: settings.storeContactEmail || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.storeAddress || "",
      addressLocality: "Karachi",
      addressRegion: "Sindh",
      postalCode: "74000",
      addressCountry: "PK",
    },
    // ✅ Geo coordinates (from warehouse if available)
    ...(latitude && longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: latitude,
            longitude: longitude,
          },
        }
      : {}),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "00:00",
        closes: "00:00",
      },
    ],
    paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "EasyPaisa", "JazzCash"],
    priceRange: "PKR",
    inLanguage: "en-US",
    parentOrganization: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
  };

  return (
    <main className="w-full bg-white dark:bg-gray-950">
      {/* ✅ Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ✅ LocalBusiness Schema (#100) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
            Get in <span className="text-brand-primary">Touch</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 font-medium">
            We&apos;d love to hear from you! Whether you have a question about
            our products, an order, or just want to say hello.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto mb-10">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* INFO SIDEBAR */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Info
              </h2>
              <p className="text-gray-500">
                Reach out to us through any of these channels.
              </p>
            </div>

            <div className="space-y-8">
              {settings.storeContactEmail && (
                <div className="flex items-start gap-5">
                  <div className="shrink-0 bg-brand-primary/10 p-4 rounded-2xl text-brand-primary">
                    <Mail size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Email Us
                    </h3>
                    <a
                      href={`mailto:${settings.storeContactEmail}`}
                      className="text-lg text-brand-primary font-medium hover:underline"
                    >
                      {settings.storeContactEmail}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      24/7 online support
                    </p>
                  </div>
                </div>
              )}

              {settings.storePhoneNumber && (
                <div className="flex items-start gap-5">
                  <div className="shrink-0 bg-brand-primary/10 p-4 rounded-2xl text-brand-primary">
                    <Phone size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Call Us
                    </h3>
                    <a
                      href={`tel:${settings.storePhoneNumber}`}
                      className="text-lg text-brand-primary font-medium hover:underline"
                    >
                      {settings.storePhoneNumber}
                    </a>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Clock size={14} aria-hidden="true" /> <span>9 AM - 6 PM (PST)</span>
                    </div>
                  </div>
                </div>
              )}

              {settings.storeAddress && (
                <div className="flex items-start gap-5">
                  <div className="shrink-0 bg-brand-primary/10 p-4 rounded-2xl text-brand-primary">
                    <MapPin size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Visit Our Office
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                      {settings.storeAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FORM AREA */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-none">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}