
// // 📂 src/app/features/admin/inventory-cms/actions/globalSettingsActions.ts (FULLY OPTIMIZED WITH CACHE STAMPEDE LOCK)

// "use server";

// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { SanityImageObject } from "@/types";
// import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// // ✅ ENTERPRISE FIX: Safe cache serialization utilities
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // Properly typed image mapper
// const mapImage = (img: any): SanityImageObject | undefined => {
//   if (!img || typeof img !== "object") return undefined;
  
//   const url = 'url' in img ? img.url : undefined;
//   if (!url) return undefined;
  
//   const id = 'id' in img ? String(img.id) : 'no-id';
  
//   return {
//     _type: "image" as const,
//     asset: { _ref: id, _type: "reference" as const },
//     url: url,
//   };
// };

// // ================================================================
// // ✅ ENTERPRISE FIX: In-Memory Deduplication (5 second TTL)
// // ================================================================
// let memoryCache: { data: GlobalSettings | null; timestamp: number } = {
//   data: null,
//   timestamp: 0,
// };
// const MEMORY_TTL = 5000; // 5 seconds (for concurrent requests)

// // ================================================================
// // 🛡️ ATOMIC LOCK RELEASE (Lua Script — for Cache Stampede)
// // ================================================================
// const LUA_RELEASE_LOCK = `
//   if redis.call("get", KEYS[1]) == ARGV[1] then
//     return redis.call("del", KEYS[1])
//   else
//     return 0
//   end
// `;

// export async function fetchGlobalSettingsAction(): Promise<GlobalSettings> {
//   const cacheKey = "global_settings_cache";
//   const lockKey = `lock:${cacheKey}`;
//   const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

//   // ================================================================
//   // 🧠 STEP 0: Check In-Memory Cache (5 sec TTL)
//   // ================================================================
//   if (memoryCache.data && Date.now() - memoryCache.timestamp < MEMORY_TTL) {
//     return memoryCache.data;
//   }

//   // ================================================================
//   // 📡 STEP 1: Read from Redis Cache
//   // ================================================================
//   try {
//     const cached = await redis.get(cacheKey);
//     // ✅ Custom safeParse prevents [object Object] crashes completely
//     const parsed = safeParse<GlobalSettings>(cached);
//     if (parsed) {
//       memoryCache.data = parsed;
//       memoryCache.timestamp = Date.now();
//       return parsed;
//     }
//   } catch (e: any) {
//     console.error("Redis Cache Read Error in fetchGlobalSettingsAction:", e.message);
//   }

//   // ================================================================
//   // 🔒 STEP 2: Redis Lock (Thundering Herd / Cache Stampede Protection)
//   // ================================================================
//   const LOCK_TTL = 15; // 15 seconds is more than enough for boot
//   let lockAcquired = false;
//   try {
//     const result = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });
//     lockAcquired = result === "OK";
//   } catch (redisError) {
//     lockAcquired = false;
//   }

//   if (!lockAcquired) {
//     // Wait for the main thread to populate cache
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     try {
//       const retryCache = await redis.get(cacheKey);
//       const retryParsed = safeParse<GlobalSettings>(retryCache);
//       if (retryParsed) {
//         return retryParsed;
//       }
//     } catch (e) {
//       // Ignore
//     }
//   }

//   // ================================================================
//   // 🗄️ STEP 3: Fetch Fresh from Database (with retry)
//   // ================================================================
//   let retries = 3;
//   while (retries > 0) {
//     try {
//       // ✅ Now calls updated getSafePayload (which ensures connection)
//       const payload = await getSafePayload();
//       const settings = await payload.findGlobal({
//         slug: "settings",
//         depth: 2,
//       });

//       if (!settings) return {};

//       // ================================================================
//       // 🗺️ MAPPING LOGIC (Aap ka waisa hi code)
//       // ================================================================
//       const mappedSettings: any = {
//         siteName: settings.siteName,
//         siteLogo: mapImage(settings.siteLogo),
//         storeContactEmail: settings.storeContactEmail || undefined,
//         storePhoneNumber: settings.storePhoneNumber || undefined,
//         storeAddress: settings.storeAddress || undefined,

//         socialLinks: settings.socialLinks
//           ? {
//               facebook: settings.socialLinks.facebook || undefined,
//               instagram: settings.socialLinks.instagram || undefined,
//               twitter: settings.socialLinks.twitter || undefined,
//             }
//           : undefined,

//         topBarAnnouncements:
//           settings.topBarAnnouncements?.map((item: any) => item.message) || [],

//         secondaryNavLinks:
//           settings.secondaryNavLinks?.map((link: any) => ({
//             label: link.label,
//             url: link.url,
//             position: link.position,
//             isHighlight: link.isHighlight || false,
//           })) || [],

//         inventorySettings: settings.inventorySettings
//           ? {
//               lowStockThreshold:
//                 settings.inventorySettings.lowStockThreshold || undefined,
//               alertRecipientEmail:
//                 settings.inventorySettings.alertRecipientEmail || undefined,
//             }
//           : undefined,

//         searchSettings: settings.searchSettings
//           ? {
//               trendingKeywords:
//                 settings.searchSettings.trendingKeywords?.map(
//                   (k: any) => k.keyword,
//                 ) || [],
//               popularCategories:
//                 settings.searchSettings.popularCategories?.map((cat: any) => ({
//                   _id: String(cat.id),
//                   name: cat.name,
//                   slug: cat.slug,
//                   image: cat.image?.url || undefined,
//                   parent: null,
//                   subCategories: [],
//                 })) || [],
//             }
//           : undefined,

//         seo: settings.seo
//           ? {
//               metaTitle: settings.seo.metaTitle || undefined,
//               metaDescription: settings.seo.metaDescription || undefined,
//               ogImage: mapImage(settings.seo.ogImage),
//             }
//           : undefined,

//         taxSettings: {
//           standardGstPercent: settings.taxSettings?.standardGstPercent ?? 0
//         },
//         returnsSettings: {
//           estimatedReturnRatePercent: settings.returnsSettings?.estimatedReturnRatePercent ?? 0
//         },
//         pricingSettings: {
//           estimatedDutiesPercent: settings.pricingSettings?.estimatedDutiesPercent ?? 0
//         }
//       };

//       // ================================================================
//       // 💾 STEP 4: Write to Redis Cache (24h TTL)
//       // ================================================================
//       try {
//         // ✅ Custom safeStringify prevents prototype leaks and serialization corruptions
//         const stringified = safeStringify(mappedSettings);
//         await redis.set(cacheKey, stringified, { ex: 86400 });
//         if (process.env.NODE_ENV === 'development') {
//           console.log("💾 Redis Engine: Cached global site settings (24h TTL).");
//         }
//       } catch (cacheErr: any) {
//         console.error("❌ Failed to write global settings cache to Redis:", cacheErr.message);
//       }

//       // ================================================================
//       // 🧠 Update In-Memory Cache for future requests
//       // ================================================================
//       memoryCache.data = mappedSettings;
//       memoryCache.timestamp = Date.now();

//       // ✅ STEP 5: Release Redis Lock safely
//       if (lockAcquired) {
//         await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
//       }

//       return mappedSettings;
//     } catch (error: any) {
//       retries--;
//       if (retries === 0) {
//         console.error("Critical Connection Failure in fetchGlobalSettingsAction after 3 retries:", error.message);
//         if (lockAcquired) {
//           try {
//             await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
//           } catch (e) {}
//         }
//         return {};
//       }
//       console.warn(`⚠️ DB Connection busy or closed. Retrying fetchGlobalSettingsAction... (${3 - retries}/3)`);
//       await new Promise<void>((resolve) => setTimeout(resolve, 1000));
//     }
//   }
//   return {};
// }
// 📂 src/app/features/admin/inventory-cms/actions/globalSettingsActions.ts (100% FULLY MAPPED & FUTURE-PROOF)

"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { SanityImageObject } from "@/types";
import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

// ✅ ENTERPRISE FIX: Safe cache serialization utilities imported
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// Properly typed image mapper
const mapImage = (img: any): SanityImageObject | undefined => {
  if (!img || typeof img !== "object") return undefined;
  
  const url = 'url' in img ? img.url : undefined;
  if (!url) return undefined;
  
  const id = 'id' in img ? String(img.id) : 'no-id';
  
  return {
    _type: "image" as const,
    asset: { _ref: id, _type: "reference" as const },
    url: url,
  };
};

// ================================================================
// ✅ ENTERPRISE FIX: In-Memory Deduplication (5 second TTL)
// ================================================================
let memoryCache: { data: GlobalSettings | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const MEMORY_TTL = 5000; // 5 seconds (for concurrent requests)

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE (Lua Script — for Cache Stampede)
// ================================================================
const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export async function fetchGlobalSettingsAction(): Promise<GlobalSettings> {
  const cacheKey = "global_settings_cache";
  const lockKey = `lock:${cacheKey}`;
  const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // ================================================================
  // 🧠 STEP 0: Check In-Memory Cache (5 sec TTL)
  // ================================================================
  if (memoryCache.data && Date.now() - memoryCache.timestamp < MEMORY_TTL) {
    return memoryCache.data;
  }

  // ================================================================
  // 📡 STEP 1: Read from Redis Cache
  // ================================================================
  try {
    const cached = await redis.get(cacheKey);
    // ✅ Custom safeParse prevents [object Object] crashes completely
    const parsed = safeParse<GlobalSettings>(cached);
    if (parsed) {
      memoryCache.data = parsed;
      memoryCache.timestamp = Date.now();
      return parsed;
    }
  } catch (e: any) {
    console.error("Redis Cache Read Error in fetchGlobalSettingsAction:", e.message);
  }

  // ================================================================
  // 🔒 STEP 2: Redis Lock (Thundering Herd / Cache Stampede Protection)
  // ================================================================
  const LOCK_TTL = 15; // 15 seconds is more than enough for boot
  let lockAcquired = false;
  try {
    const result = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });
    lockAcquired = result === "OK";
  } catch (redisError) {
    lockAcquired = false;
  }

  if (!lockAcquired) {
    // Wait for the main thread to populate cache
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<GlobalSettings>(retryCache);
      if (retryParsed) {
        return retryParsed;
      }
    } catch (e) {
      // Ignore
    }
  }

  // ================================================================
  // 🗄️ STEP 3: Fetch Fresh from Database (with retry)
  // ================================================================
  let retries = 3;
  while (retries > 0) {
    try {
      // ✅ Now calls updated getSafePayload (which ensures connection)
      const payload = await getSafePayload();
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 2,
      });

      if (!settings) return {};

      // ================================================================
      // 🗺️ MAPPING LOGIC (100% COMPLETE — ALL 15 TABS MAPPED)
      // ================================================================
      const mappedSettings: any = {
        // --- TAB 1: GENERAL INFO ---
        siteName: settings.siteName,
        siteLogo: mapImage(settings.siteLogo),
        storeContactEmail: settings.storeContactEmail || undefined,
        storePhoneNumber: settings.storePhoneNumber || undefined,
        storeAddress: settings.storeAddress || undefined,
        socialLinks: settings.socialLinks
          ? {
              facebook: settings.socialLinks.facebook || undefined,
              instagram: settings.socialLinks.instagram || undefined,
              twitter: settings.socialLinks.twitter || undefined,
            }
          : undefined,

        // --- TAB 2: PROMOTIONS ---
        topBarAnnouncements:
          settings.topBarAnnouncements?.map((item: any) => item.message) || [],

        // --- TAB 3: NAVIGATION ---
        secondaryNavLinks:
          settings.secondaryNavLinks?.map((link: any) => ({
            label: link.label,
            url: link.url,
            position: link.position,
            isHighlight: link.isHighlight || false,
          })) || [],

        // --- TAB 4: SHIPPING ---
        shippingRules:
          settings.shippingRules?.map((rule: any) => ({
            _id: String(rule.id || Math.random()),
            name: rule.name,
            minAmount: rule.minAmount || 0,
            cost: rule.cost || 0,
            isOnCall: rule.isOnCall || false,
          })) || [],
        shippingCost: settings.shippingCost ?? 350,

        // --- TAB 5: INVENTORY ---
        inventorySettings: settings.inventorySettings
          ? {
              lowStockThreshold:
                settings.inventorySettings.lowStockThreshold ?? 5,
              alertRecipientEmail:
                settings.inventorySettings.alertRecipientEmail || undefined,
            }
          : undefined,

        // --- TAB 6: SEARCH SUGGESTIONS ---
        searchSettings: settings.searchSettings
          ? {
              trendingKeywords:
                settings.searchSettings.trendingKeywords?.map(
                  (k: any) => k.keyword,
                ) || [],
              popularCategories:
                settings.searchSettings.popularCategories?.map((cat: any) => ({
                  _id: String(cat.id),
                  name: cat.name,
                  slug: cat.slug,
                  image: cat.image?.url || undefined,
                  parent: null,
                  subCategories: [],
                })) || [],
            }
          : undefined,

        // --- TAB 7: DYNAMIC PRICING LOGIC ---
        globalFixedFees:
          settings.globalFixedFees?.map((fee: any) => ({
            label: fee.label,
            percentage: fee.percentage || 0,
          })) || [],

        pricingLogicTiers:
          settings.pricingLogicTiers?.map((tier: any) => ({
            minCost: tier.minCost || 0,
            maxCost: tier.maxCost || 0,
            profitPercent: tier.profitPercent || 0,
            adSpendPercent: tier.adSpendPercent || 0,
            visualDiscount: tier.visualDiscount || 0,
          })) || [],

        taxSettings: {
          standardGstPercent: settings.taxSettings?.standardGstPercent ?? 0,
        },
        returnsSettings: {
          estimatedReturnRatePercent:
            settings.returnsSettings?.estimatedReturnRatePercent ?? 0,
        },
        pricingSettings: {
          estimatedDutiesPercent:
            settings.pricingSettings?.estimatedDutiesPercent ?? 0,
        },

        // --- TAB 8: LOYALTY & REFERRALS ---
        loyaltyEnabled: settings.loyaltyEnabled ?? true,
        referralLimitPerUser: settings.referralLimitPerUser ?? 50,
        referralGoalTarget: settings.referralGoalTarget ?? 0,
        referralMilestones: settings.referralMilestones || [],
        vipShoppingMilestones: settings.vipShoppingMilestones || [],
        couponDefaultExpiryDays: settings.couponDefaultExpiryDays ?? 30,
        couponDefaultUsageLimit: settings.couponDefaultUsageLimit ?? 1,
        couponIsStackable: settings.couponIsStackable ?? false,
        inactiveDaysThreshold: settings.inactiveDaysThreshold ?? 60,
        highValueInactiveThreshold: settings.highValueInactiveThreshold ?? 5000,
        reactivationEmailTemplate: settings.reactivationEmailTemplate || undefined,
        segmentBuilderEnabled: settings.segmentBuilderEnabled ?? true,

        // --- TAB 9: DEFAULT SEO ---
        seo: settings.seo
          ? {
              metaTitle: settings.seo.metaTitle || undefined,
              metaDescription: settings.seo.metaDescription || undefined,
              ogImage: mapImage(settings.seo.ogImage),
            }
          : undefined,

        // --- TAB 10: OPERATIONAL INTELLIGENCE ---
        operational: {
          limboRevenueThreshold: settings.operational?.limboRevenueThreshold ?? 1000000,
          autoRefreshInterval: settings.operational?.autoRefreshInterval ?? 60,
        },

        // --- TAB 11: MEDIA SETTINGS ---
        mediaProvider: settings.mediaProvider || "imgbb",
        mediaDualUpload: settings.mediaDualUpload ?? false,
        mediaFetchMode: settings.mediaFetchMode || "imgbb",
        cdnMode: settings.cdnMode ?? true,

        // --- TAB 12: WAREHOUSE LOGISTICS ---
        warehouse: {
          locations:
            settings.warehouse?.locations?.map((loc: any) => ({
              name: loc.name,
              address: loc.address,
              lat: loc.lat,
              lng: loc.lng,
            })) || [],
        },

        // --- TAB 13: GEOSPATIAL INTELLIGENCE ---
        geospatial: {
          highPotentialRevenue: settings.geospatial?.highPotentialRevenue ?? 50000,
          highPotentialRto: settings.geospatial?.highPotentialRto ?? 10,
          topCityLimit: settings.geospatial?.topCityLimit ?? 10,
        },

        // --- TAB 14: FORECASTING ---
        forecasting: {
          windowDays: settings.forecasting?.windowDays ?? 15,
          criticalThreshold: settings.forecasting?.criticalThreshold ?? 3,
          highThreshold: settings.forecasting?.highThreshold ?? 7,
          topLimit: settings.forecasting?.topLimit ?? 20,
        },

        // --- TAB 15: COMMUNICATION ---
        communication: {
          mailjet: {
            enabled: settings.communication?.mailjet?.enabled ?? true,
            roles: settings.communication?.mailjet?.roles || [],
          },
          resend: {
            enabled: settings.communication?.resend?.enabled ?? false,
            roles: settings.communication?.resend?.roles || [],
          },
          whatsapp: {
            enabled: settings.communication?.whatsapp?.enabled ?? false,
            roles: settings.communication?.whatsapp?.roles || [],
          },
        },
      };

      // ================================================================
      // 💾 STEP 4: Write to Redis Cache (24h TTL)
      // ================================================================
      try {
        const stringified = safeStringify(mappedSettings);
        await redis.set(cacheKey, stringified, { ex: 86400 });
        if (process.env.NODE_ENV === 'development') {
          console.log("💾 Redis Engine: Cached global site settings (24h TTL).");
        }
      } catch (cacheErr: any) {
        console.error("❌ Failed to write global settings cache to Redis:", cacheErr.message);
      }

      // ================================================================
      // 🧠 Update In-Memory Cache for future requests
      // ================================================================
      memoryCache.data = mappedSettings;
      memoryCache.timestamp = Date.now();

      // ✅ STEP 5: Release Redis Lock safely
      if (lockAcquired) {
        await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
      }

      return mappedSettings;
    } catch (error: any) {
      retries--;
      if (retries === 0) {
        console.error("Critical Connection Failure in fetchGlobalSettingsAction after 3 retries:", error.message);
        if (lockAcquired) {
          try {
            await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
          } catch (e) {}
        }
        return {};
      }
      console.warn(`⚠️ DB Connection busy or closed. Retrying fetchGlobalSettingsAction... (${3 - retries}/3)`);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  }
  return {};
}