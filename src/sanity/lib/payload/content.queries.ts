// 📂 src/sanity/lib/payload/content.queries.ts
// ================================================================
// 🚀 ENTERPRISE CONTENT QUERIES ENGINE (UPGRADED)
// ================================================================
// This file handles fetching FAQ and Info Pages from Payload CMS
// with full caching and error handling.
//
// 🆕 ENHANCEMENTS:
// ✅ Added createdAt & updatedAt for Page data (Point #23)
// ✅ Type-safe returns with proper timestamps
// ================================================================

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { lexicalToPortableText } from "./types/lexicalHelper";
import { unstable_cache } from "next/cache";

// ================================================================
// 🚀 CACHED FAQ PAGE (with Graceful Error Handling)
// ================================================================
const getCachedFaqPage = unstable_cache(
  async () => {
    try {
      const payload = await getSafePayload();

      const faqData = await payload.findGlobal({
        slug: "faq",
        depth: 1,
      });

      if (!faqData) return null;

      // ✅ Safe ogImage extraction
      const ogImage = faqData.seo?.ogImage;
      const ogImageUrl = ogImage && typeof ogImage === "object" && "url" in ogImage 
        ? (ogImage as any).url 
        : undefined;
      const ogImageId = ogImage && typeof ogImage === "object" && "id" in ogImage 
        ? (ogImage as any).id 
        : undefined;

      return {
        _id: "faqPage",
        title: faqData.title,
        subtitle: faqData.subtitle || null,
        faqList:
          faqData.faqList?.map((item: any, index: number) => ({
            _key: item.id || `faq-${index}`,
            question: item.question,
            answer: lexicalToPortableText(item.answer),
          })) || [],
        seo: {
          metaTitle: faqData.seo?.metaTitle || undefined,
          metaDescription: faqData.seo?.metaDescription || undefined,
          ogImage: ogImageUrl
            ? {
                _type: "image" as const,
                asset: {
                  _ref: ogImageId || "og-image",
                  _type: "reference" as const,
                },
                url: ogImageUrl,
              }
            : undefined,
        },
      };
    } catch (error) {
      console.error("❌ Failed to fetch FAQ page from Payload:", error);
      return null; // ✅ Graceful fallback
    }
  },
  ["faq-page"],
  { tags: ["faq-page"], revalidate: false }
);

export const getPayloadFaqPage = async () => {
  return await getCachedFaqPage();
};

// ================================================================
// 🚀 CACHED INFO PAGE (UPGRADED — with Timestamps)
// ================================================================
export const getPayloadPageData = async (slug: string) => {
  const getCachedPage = unstable_cache(
    async () => {
      try {
        const payload = await getSafePayload();

        const result = await payload.find({
          collection: "pages",
          where: { slug: { equals: slug } },
          depth: 1,
        });

        const pageDoc = result.docs[0];
        if (!pageDoc) return null;

        return {
          _id: pageDoc.id,
          title: pageDoc.title,
          slug: pageDoc.slug,
          subtitle: pageDoc.subtitle || null,
          body: lexicalToPortableText(pageDoc.body),
          excerpt: pageDoc.excerpt || "Content fetched from Payload CMS",
          seo: pageDoc.seo,
          // ✅ ADDED: Timestamps for Point #23 (Content Freshness)
          createdAt: pageDoc.createdAt,
          updatedAt: pageDoc.updatedAt,
        };
      } catch (error) {
        console.error(`❌ Failed to fetch page "${slug}" from Payload:`, error);
        return null; // ✅ Graceful fallback
      }
    },
    [`page-${slug}`],
    { tags: [`page-${slug}`], revalidate: false }
  );

  return await getCachedPage();
};