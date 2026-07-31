// src/app/faq/page.tsx
// ================================================================
// ❓ ENTERPRISE FAQ PAGE ENGINE (UPGRADED — FINAL)
// ================================================================
// This file handles the FAQ page with:
// ✅ ISR + Edge caching with on-demand revalidation
// ✅ FAQPage Schema with @id and mainEntity (#72)
// ✅ Content freshness signals in metadata (#23)
// ✅ Entity linking for AI overviews (#39)
// ✅ Fully accessible accordion with rich text answers
// ================================================================

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

import { getPayloadFaqPage } from "@/sanity/lib/payload/content.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

import FaqAccordion from "@/app/features/storefront/catalog/components/FaqAccordion";
import { HelpCircle } from "lucide-react";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import { FaqItem } from "@/types";

interface FaqPageData {
  _id: string;
  title: string;
  subtitle?: string | null;
  faqList: FaqItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}

// =========================================================================
// 🔥 CACHED DATA FETCHER
// =========================================================================
const getCachedFaqData = unstable_cache(
  async () => {
    return (await getPayloadFaqPage()) as FaqPageData | null;
  },
  ["faq-data"],
  {
    tags: ["faq-page"],
    revalidate: false,
  }
);

// =========================================================================
// 🔥 HELPER: Clean Text Extraction for SEO Schema
// =========================================================================
function portableTextToString(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type === "block" || block.type === "paragraph") {
        const children = block.children || [];
        return children.map((child: any) => child.text || "").join("");
      }
      return "";
    })
    .join(" ")
    .trim();
}

// =========================================================================
// 🔥 METADATA (Enhanced with freshness signals)
// =========================================================================
export async function generateMetadata(): Promise<Metadata> {
  const faqData = await getCachedFaqData();
  const now = new Date().toISOString();

  const description =
    faqData?.seo?.metaDescription ||
    "Find answers to frequently asked questions about orders, shipping, returns, and more on PocketValue.";

  return generateBaseMetadata({
    title: faqData?.seo?.metaTitle || "Help Center & FAQ | PocketValue",
    description: description,
    image: faqData?.seo?.ogImage,
    path: "/faq",
    // ✅ Point #23: Content Freshness
    publishedTime: now,
    modifiedTime: now,
    // ✅ Point #80: Author/Publisher signals
    author: "PocketValue Team",
    section: "FAQ",
  });
}

// =========================================================================
// ❓ FAQ PAGE COMPONENT
// =========================================================================
export default async function Faq() {
  const [faqData, breadcrumbs] = await Promise.all([
    getCachedFaqData(),
    getPayloadBreadcrumbs("faq"),
  ]);

  if (!faqData || !faqData.faqList || faqData.faqList.length === 0) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // ================================================================
  // 🔥 SEO: FAQPage Schema (Enhanced with @id and inLanguage)
  // ================================================================
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq/#faqpage`,
    // ✅ Point #39: Entity linking via @id
    mainEntity: faqData.faqList.map((item, index) => ({
      "@type": "Question",
      "@id": `${siteUrl}/faq/#question-${index + 1}`,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        "@id": `${siteUrl}/faq/#answer-${index + 1}`,
        text: portableTextToString(item.answer as any[]),
      },
    })),
    // ✅ Point #98: Language signal
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <main className="w-full bg-white dark:bg-gray-950">
        {/* HEADER SECTION */}
        <section className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <div className="mb-6 flex justify-center">
              <Breadcrumbs crumbs={breadcrumbs} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              How can we <span className="text-brand-primary">help?</span>
            </h1>

            {faqData.subtitle && (
              <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {faqData.subtitle}
              </p>
            )}
          </div>
        </section>

        {/* ACCORDION SECTION */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                <HelpCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Frequent Questions
                </h2>
                <p className="text-sm text-gray-500">
                  Quick answers to common inquiries.
                </p>
              </div>
            </div>

            <FaqAccordion items={faqData.faqList} />

            {/* CTA SECTION */}
            <div className="mt-20 p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Still have questions?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Can&apos;t find what you&apos;re looking for? Our team is here
                to help.
              </p>
              <div className="mt-6">
                <a
                  href="/contact-us"
                  className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-primary-hover transition-all transform active:scale-95 shadow-lg shadow-brand-primary/20"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}