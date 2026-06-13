// // // /src/app/faq/page.tsx

// import type { Metadata } from "next";

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayloadFaqPage } from "@/sanity/lib/payload/content.queries";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

// import FaqAccordion from "@/app/(main)/faq/FaqAccordion";
// import { HelpCircle } from "lucide-react";
// import { generateBaseMetadata } from "@/utils/metadata";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
// import { FaqItem } from "@/sanity/types/product_types";

// export const dynamic = 'force-dynamic';
// // 🔥 FIX: Interface ab yahan file mein hi define hai
// interface FaqPageData {
//   _id: string;
//   title: string;
//   subtitle?: string | null; // ✅ Subtitle add kar diya
//   faqList: FaqItem[];
//   seo?: {
//     metaTitle?: string;
//     metaDescription?: string;
//     ogImage?: any;
//   };
// }

// export async function generateMetadata(): Promise<Metadata> {
//   // ✅ Switch to Payload & Cast Type
//   const faqData = await getPayloadFaqPage() as FaqPageData | null;

//   const description =
//     faqData?.seo?.metaDescription ||
//     "Find answers to frequently asked questions about orders, shipping, returns, and more.";

//   return generateBaseMetadata({
//     title: faqData?.seo?.metaTitle || "Help Center & FAQ",
//     description: description,
//     image: faqData?.seo?.ogImage,
//     path: "/faq",
//   });
// }

// function portableTextToString(blocks: any[]): string {
//   if (!blocks || !Array.isArray(blocks)) return "";
//   return blocks
//     .map((block) => {
//       if (block._type !== "block" || !block.children) return "";
//       return block.children.map((child: any) => child.text).join("");
//     })
//     .join(" \n\n");
// }

// export default async function Faq() {
//   const [faqData, breadcrumbs] = await Promise.all([
//     // ✅ Switch to Payload & Cast Type
//     getPayloadFaqPage() as Promise<FaqPageData | null>,
//     getPayloadBreadcrumbs("faq"),
//   ]);

//   if (!faqData || !faqData.faqList) {
//     return (
//       <main className="w-full bg-gray-50 dark:bg-gray-900">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
//           <HelpCircle size={48} className="mx-auto text-gray-400" />
//           <h1 className="mt-4 text-4xl font-bold">FAQs Not Found</h1>
//           <p className="mt-2 text-gray-600 dark:text-gray-400">
//             We couldn&apos;t load the questions right now. Please check back later.
//           </p>
//         </div>
//       </main>
//     );
//   }

//   const faqPageSchema = {
//     "@context": "https://schema.org",
//     "@type": "FAQPage",
//     mainEntity: faqData.faqList.map((item) => ({
//       "@type": "Question",
//       name: item.question,
//       acceptedAnswer: {
//         "@type": "Answer",
//         text: portableTextToString(item.answer),
//       },
//     })),
//   };

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
//       />
//       <main className="w-full bg-white dark:bg-gray-900">
//         <div className="bg-gray-50 dark:bg-gray-800/50">
//           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
//             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
//               {faqData.title}
//             </h1>

//             {/* 🔥 NEW: Subtitle Display */}
//             {faqData.subtitle && (
//               <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 font-medium">
//                 {faqData.subtitle}
//               </p>
//             )}
//           </div>
//         </div>
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
//           <div className="max-w-4xl mx-auto">
//             <div className="mb-8">
//               <Breadcrumbs crumbs={breadcrumbs} />
//             </div>
//             <FaqAccordion items={faqData.faqList} />
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }
// src/app/faq/page.tsx

import type { Metadata } from "next";
import { cache } from "react"; // 🔥 Added for Deduplication

// ✅ NEW PAYLOAD IMPORTS
import { getPayloadFaqPage } from "@/sanity/lib/payload/content.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

import FaqAccordion from "@/app/(main)/faq/FaqAccordion";
import { HelpCircle, Search } from "lucide-react";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { FaqItem } from "@/sanity/types/product_types";

export const dynamic = "force-dynamic";

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
// 🔥 CACHED DATA FETCHER (Prevents Double DB Hits)
// =========================================================================
const getCachedFaqData = cache(async () => {
  return (await getPayloadFaqPage()) as FaqPageData | null;
});

// =========================================================================
// 🔥 HELPER: Clean Text Extraction for SEO Schema
// =========================================================================
function portableTextToString(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) return "";
      return block.children.map((child: any) => child.text).join("");
    })
    .join(" ")
    .trim();
}

// =========================================================================
// 🔥 METADATA
// =========================================================================
export async function generateMetadata(): Promise<Metadata> {
  const faqData = await getCachedFaqData();

  const description =
    faqData?.seo?.metaDescription ||
    "Find answers to frequently asked questions about orders, shipping, returns, and more on PocketValue.";

  return generateBaseMetadata({
    title: faqData?.seo?.metaTitle || "Help Center & FAQ | PocketValue",
    description: description,
    image: faqData?.seo?.ogImage,
    path: "/faq",
  });
}

// =========================================================================
// ❓ FAQ PAGE COMPONENT
// =========================================================================
export default async function Faq() {
  // Concurrent Fetch
  const [faqData, breadcrumbs] = await Promise.all([
    getCachedFaqData(),
    getPayloadBreadcrumbs("faq"),
  ]);

  if (!faqData || !faqData.faqList) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900 py-32 text-center">
        <HelpCircle size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          FAQs Not Found
        </h1>
        <p className="mt-2 text-gray-500">
          Please check back later or contact support.
        </p>
      </main>
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // 🔥 SEO: Structured Data for Google Search
  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq/#faq`,
    mainEntity: faqData.faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: portableTextToString(item.answer as any[]),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <main className="w-full bg-white dark:bg-gray-950">
        {/* 1. PREMIUM HEADER SECTION */}
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

        {/* 2. ACCORDION SECTION */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            {/* Optional: Add a small search-like visual or help icon */}
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
