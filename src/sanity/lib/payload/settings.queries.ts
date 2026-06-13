//// src/sanity/lib/payload/settings.queries.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'



// 🔥 NEW FUNCTION: Search Suggestions
export const getPayloadSearchSuggestions = async () => {
  const payload = await getPayload({ config: configPromise })

  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1, // Popular categories ko expand karne ke liye
  })

  if (!settings || !settings.searchSettings) {
    return { trendingKeywords: [], popularCategories:[] };
  }

  return {
    // Keywords array ko map karna
    trendingKeywords: settings.searchSettings.trendingKeywords?.map((k: any) => k.keyword) ||[],
    
    // Categories ko map karna
    popularCategories: settings.searchSettings.popularCategories?.map((cat: any) => ({
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image?.url || null,
      // ✅ FIX: TypeScript ko satisfy karne ke liye 'parent' field add ki hai
      parent: (cat.parent && typeof cat.parent === 'object') ? { _id: cat.parent.id } : null,
    })) || [],
  }
}