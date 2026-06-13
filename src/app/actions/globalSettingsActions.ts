// // src/app/actions/globalSettingsActions.ts
// "use server"; // 🔥 Ye line Client Components ke liye Server ka darwaza kholti hai

// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import { SanityImageObject } from "@/sanity/types/product_types";
// import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// // Helper to map Image (productMapper se uthaya gaya)
// const mapImage = (img: any): SanityImageObject | undefined => {
//   if (!img || typeof img !== 'object' || !img.url) return undefined;
//   return {
//     _type: 'image',
//     asset: { _ref: img.id, _type: 'reference' },
//     // @ts-ignore - Hum url inject kar rahe hain taake frontend helper pakar sake
//     url: img.url
//   };
// }

// // 🔥 Naya Server Action jo Payload Global Settings layega
// export async function fetchGlobalSettingsAction(): Promise<GlobalSettings> {
//   try {
//     const payload = await getPayload({ config: configPromise });
//     const settings = await payload.findGlobal({
//       slug: 'settings',
//       depth: 1, // Media aur relations expand ho jayenge
//     });

//     if (!settings) return {};

//     return {
//       siteName: settings.siteName,
//       siteLogo: mapImage(settings.siteLogo),

//       storeContactEmail: settings.storeContactEmail || undefined,
//       storePhoneNumber: settings.storePhoneNumber || undefined,
//       storeAddress: settings.storeAddress || undefined,

//       socialLinks: settings.socialLinks ? {
//         facebook: settings.socialLinks.facebook || undefined,
//         instagram: settings.socialLinks.instagram || undefined,
//         twitter: settings.socialLinks.twitter || undefined,
//       } : undefined,

//       topBarAnnouncements: settings.topBarAnnouncements?.map((item: any) => item.message) || [],

//       secondaryNavLinks: settings.secondaryNavLinks?.map((link: any) => ({
//         label: link.label,
//         url: link.url,
//         position: link.position,
//         isHighlight: link.isHighlight || false
//       })) || [],

//       // Inventory Settings (Jo aapne GlobalSettings interface mein add kiye thay)
//       inventorySettings: settings.inventorySettings ? {
//         lowStockThreshold: settings.inventorySettings.lowStockThreshold || undefined,
//         alertRecipientEmail: settings.inventorySettings.alertRecipientEmail || undefined
//       } : undefined,

//        // 🔥 FIX YAHAN HAI: popularCategories mein mapImage ki jagah direct string URL pass kiya
//       searchSettings: settings.searchSettings ? {
//         trendingKeywords: settings.searchSettings.trendingKeywords?.map((k: any) => k.keyword) ||[],
//         popularCategories: settings.searchSettings.popularCategories?.map((cat: any) => ({
//           _id: cat.id,
//           name: cat.name,
//           slug: cat.slug,
//           image: cat.image?.url || undefined, // ✅ FIXED: Only string URL is passed now
//           parent: null,
//           subCategories: []
//         })) || []
//       } : undefined,

//       seo: settings.seo ? {
//         metaTitle: settings.seo.metaTitle || undefined,
//         metaDescription: settings.seo.metaDescription || undefined,
//         ogImage: mapImage(settings.seo.ogImage),
//       } : undefined,
//     }
//   } catch (error) {
//     console.error("Failed to fetch global settings via action:", error);
//     return {};
//   }
// }
"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { SanityImageObject } from "@/sanity/types/product_types";
import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// 🔥 Improved Image Mapper
const mapImage = (img: any): SanityImageObject | undefined => {
  if (!img || typeof img !== "object" || !img.url) return undefined;
  return {
    _type: "image",
    asset: { _ref: String(img.id), _type: "reference" },
    // @ts-ignore
    url: img.url,
  };
};

export async function fetchGlobalSettingsAction(): Promise<GlobalSettings> {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 2, // 🔥 Depth 2 zaroori hai media objects aur nested relations ke liye
    });

    if (!settings) return {};

    return {
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

      topBarAnnouncements:
        settings.topBarAnnouncements?.map((item: any) => item.message) || [],

      secondaryNavLinks:
        settings.secondaryNavLinks?.map((link: any) => ({
          label: link.label,
          url: link.url,
          position: link.position,
          isHighlight: link.isHighlight || false,
        })) || [],

      inventorySettings: settings.inventorySettings
        ? {
            lowStockThreshold:
              settings.inventorySettings.lowStockThreshold || undefined,
            alertRecipientEmail:
              settings.inventorySettings.alertRecipientEmail || undefined,
          }
        : undefined,

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
                image: cat.image?.url || undefined, // Direct URL mapping as requested
                parent: null,
                subCategories: [],
              })) || [],
          }
        : undefined,

      seo: settings.seo
        ? {
            metaTitle: settings.seo.metaTitle || undefined,
            metaDescription: settings.seo.metaDescription || undefined,
            ogImage: mapImage(settings.seo.ogImage),
          }
        : undefined,
    };
  } catch (error) {
    console.error("Critical Error in fetchGlobalSettingsAction:", error);
    return {};
  }
}
