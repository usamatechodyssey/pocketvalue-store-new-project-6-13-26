// import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// // ================================================================
// // 🚀 SEARCH SUGGESTIONS FETCHER (With Graceful Failure)
// // ================================================================

// export const getPayloadSearchSuggestions = async () => {
//   try {
//     // ✅ getSafePayload ensures MongoDB connection is active
//     const payload = await getSafePayload();

//     const settings = await payload.findGlobal({
//       slug: 'settings',
//       depth: 1,
//     });

//     if (!settings || !settings.searchSettings) {
//       return { trendingKeywords: [], popularCategories: [] };
//     }

//     // ✅ Safe mapping with null checks
//     return {
//       trendingKeywords: settings.searchSettings.trendingKeywords?.map((k: any) => k.keyword) || [],
//       popularCategories: settings.searchSettings.popularCategories?.map((cat: any) => ({
//         _id: cat.id,
//         name: cat.name,
//         slug: cat.slug,
//         image: cat.image?.url || null,
//         // ✅ Ensure parent is properly structured (or null if not available)
//         parent: cat.parent && typeof cat.parent === 'object' ? { _id: cat.parent.id } : null,
//       })) || [],
//     };
//   } catch (error) {
//     // ✅ ENTERPRISE FIX: Graceful failure — return empty data if settings fail
//     console.error("⚠️ Failed to fetch search suggestions from Payload:", error);
//     return { trendingKeywords: [], popularCategories: [] };
//   }
// };
// 📂 src/sanity/lib/payload/settings.queries.ts (UPDATED WITH SELF-HEALING CONNECTION RETRY LOOP)

import { getSafePayload } from "@/app/shared/lib/payloadInstance";

// ================================================================
// 🚀 SEARCH SUGGESTIONS FETCHER (With Graceful Failure & Self-Healing Retry)
// ================================================================

export const getPayloadSearchSuggestions = async () => {
  let retries = 2;

  while (retries >= 0) {
    try {
      // ✅ getSafePayload ensures MongoDB connection is active
      const payload = await getSafePayload();

      const settings = await payload.findGlobal({
        slug: 'settings',
        depth: 1,
      });

      if (!settings || !settings.searchSettings) {
        return { trendingKeywords: [], popularCategories: [] };
      }

      // ✅ Safe mapping with null checks
      return {
        trendingKeywords: settings.searchSettings.trendingKeywords?.map((k: any) => k.keyword) || [],
        popularCategories: settings.searchSettings.popularCategories?.map((cat: any) => ({
          _id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image?.url || null,
          // ✅ Ensure parent is properly structured (or null if not available)
          parent: cat.parent && typeof cat.parent === 'object' ? { _id: cat.parent.id } : null,
        })) || [],
      };
    } catch (error: any) {
      // ✅ Self-healing retry: If connection handshake is still finishing on initial boot, wait 300ms and retry
      if (retries > 0 && error?.message?.includes("must be connected")) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      // ✅ Graceful failure — return empty data if settings fail completely
      console.error("⚠️ Failed to fetch search suggestions from Payload:", error?.message || error);
      return { trendingKeywords: [], popularCategories: [] };
    }
  }

  return { trendingKeywords: [], popularCategories: [] };
};