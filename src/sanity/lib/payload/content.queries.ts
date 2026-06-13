/// src/sanity/lib/payload/content.queries.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { lexicalToPortableText } from './types/lexicalHelper';


export const getPayloadFaqPage = async () => {
  const payload = await getPayload({ config: configPromise })

  const faqData = await payload.findGlobal({
    slug: 'faq',
    depth: 1
  });

  if (!faqData) return null;

  return {
    _id: 'faqPage',
    title: faqData.title,
    subtitle: faqData.subtitle || null, // ✅ NEW: Subtitle fetch kiya
    // 🔥 FIX YAHAN HAI: Har answer ko Lexical se PortableText mein convert karein
    faqList: faqData.faqList?.map((item: any, index: number) => ({
      _key: item.id || `faq-${index}`,
      question: item.question,
      answer: lexicalToPortableText(item.answer), // ✅ Converter lag gaya
    })) || [],
    seo: {
        metaTitle: faqData.seo?.metaTitle || undefined,
        metaDescription: faqData.seo?.metaDescription || undefined,
        ogImage: (faqData.seo?.ogImage as any)?.url ? {
            _type: 'image',
            asset: { _ref: (faqData.seo?.ogImage as any)?.id, _type: 'reference' },
            // @ts-ignore
            url: (faqData.seo?.ogImage as any)?.url
        } : undefined
    }
  };
}
// 🔥 NEW: GET SINGLE PAGE DATA
export const getPayloadPageData = async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 1
  });

  const pageDoc = result.docs[0];
  if (!pageDoc) return null;

  return {
    _id: pageDoc.id,
    title: pageDoc.title,
    slug: pageDoc.slug,
    subtitle: pageDoc.subtitle || null, // ✅ NEW: Subtitle fetch kiya
    // Rich Text ko Portable Text mein convert karna (Helper reuse karein)
    body: lexicalToPortableText(pageDoc.body),
    // Excerpt banaana (Optional: body ka pehla text utha len)
    excerpt: "Content fetched from Payload CMS", 
    seo: pageDoc.seo,
  };
}