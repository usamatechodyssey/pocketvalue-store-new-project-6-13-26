
// // src/collections/Media.ts

// import type { CollectionConfig } from 'payload';
// import { APIError } from 'payload';
// import { getMediaAdapters, getMediaAdapter } from '../lib/adapters/media/factory';
// import { getCachedSettings } from '@/app/shared/lib/cache/settings';

// // ====================================================================
// // 🛡️ UTILITY: Sanitize Alt Text (Prevents XSS)
// // ====================================================================
// const sanitizeAlt = (text: string): string => {
//   if (!text) return 'image';
//   return text.replace(/<[^>]*>/g, '').trim().slice(0, 200);
// };

// // Helper utility to safely validate and retrieve non-empty trimmed URLs
// const getSafeStringUrl = (val: unknown): string | null => {
//   if (typeof val === 'string' && val.trim() !== '') {
//     return val.trim();
//   }
//   return null;
// };

// // ====================================================================
// // COLLECTION CONFIG
// // ====================================================================
// export const Media: CollectionConfig = {
//   slug: 'media',
//   upload: {
//     disableLocalStorage: true,
//     adminThumbnail: ({ doc }) =>
//       getSafeStringUrl(doc.imageUrl) ||
//       getSafeStringUrl(doc.imgbbUrl) ||
//       getSafeStringUrl(doc.r2Url) ||
//       getSafeStringUrl(doc.url) ||
//       '/placeholder.png',
//     mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
//   },
//   access: {
//     read: () => true,
//   },
//   indexes: [
//     { fields: ['assetCategory'] },
//     { fields: ['alt'] },
//     { fields: ['imgbbUrl'] },
//     { fields: ['r2Url'] },
//     { fields: ['imageUrl'] },
//   ],
//   hooks: {
//     // ====================================================================
//     // ✅ Size Limit & MIME Validation (Max 5MB)
//     // ====================================================================
//     beforeValidate: [
//       async ({ data, req }) => {
//         console.log("🔍 [Media] beforeValidate - START");
//         if (!data) {
//           console.log("🔍 [Media] beforeValidate - No data");
//           return data;
//         }

//         if (req.file && req.file.data) {
//           const fileSize = req.file.data.length;
//           const mimeType = req.file.mimetype || '';
//           console.log(`🔍 [Media] beforeValidate - File size: ${fileSize} bytes, MIME: ${mimeType}`);

//           const maxSize = 5 * 1024 * 1024;

//           if (fileSize > maxSize) {
//             const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
//             throw new APIError(
//               `File size (${sizeInMB}MB) exceeds maximum allowed (5MB). Please compress your file.`,
//               400
//             );
//           }

//           const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
//           if (!allowedMimes.includes(mimeType)) {
//             throw new APIError(
//               `File type (${mimeType}) is not allowed. Please upload JPEG, PNG, WEBP, GIF, MP4, or WEBM.`,
//               400
//             );
//           }

//           if (data.alt) {
//             data.alt = sanitizeAlt(data.alt);
//             console.log(`🔍 [Media] beforeValidate - Alt sanitized: ${data.alt}`);
//           }
//         }
//         console.log("🔍 [Media] beforeValidate - END");
//         return data;
//       },
//     ],

//     // ====================================================================
//     // ✅ ENTERPRISE FIX: Dual-URL Storage (ImgBB + R2)
//     // ====================================================================
//     beforeChange: [
//       async ({ data, req, operation }) => {
//         console.log("🔍 [Media] beforeChange - START");
//         console.log(`🔍 [Media] beforeChange - Operation: ${operation}`);
//         console.log(`🔍 [Media] beforeChange - Has file: ${!!req.file}`);
//         console.log(`🔍 [Media] beforeChange - Data:`, JSON.stringify(data, null, 2));

//         if (!data) {
//           console.log("🔍 [Media] beforeChange - No data, returning");
//           return data;
//         }

//         // ✅ If this is an update operation and no new file, preserve existing URLs
//         if (operation === 'update' && !req.file) {
//           console.log("🔍 [Media] beforeChange - Update without file, preserving existing URLs");
//           return data;
//         }

//         if (req.file && req.file.data) {
//           console.log("🔍 [Media] beforeChange - Starting upload process...");
//           try {
//             const buffer = req.file.data;
//             const mimeType = req.file.mimetype || 'image/jpeg';
//             console.log(`🔍 [Media] beforeChange - Buffer size: ${buffer.length}, MIME: ${mimeType}`);

//             // Determine folder
//             let finalFolder = data.assetCategory || 'general';
//             if (data.assetCategory === 'custom' && data.customFolderName) {
//               finalFolder = data.customFolderName.replace(/\s+/g, '-').toLowerCase();
//             }
//             console.log(`🔍 [Media] beforeChange - Folder: ${finalFolder}`);

//             // ✅ Get all configured adapters (respects global dualUpload setting)
//             console.log("🔍 [Media] beforeChange - Getting adapters...");
//             const adapters = await getMediaAdapters();
//             console.log(`🔍 [Media] beforeChange - Found ${adapters.length} adapters:`, adapters.map(a => a.constructor.name));

//             // ✅ Upload to ALL adapters in parallel
//             console.log("🔍 [Media] beforeChange - Starting parallel uploads...");
//             const uploadPromises = adapters.map((adapter) =>
//               adapter
//                 .upload(buffer, {
//                   folder: finalFolder,
//                   metadata: { mimeType },
//                 })
//                 .then((result) => {
//                   console.log(`✅ [Media] beforeChange - ${adapter.constructor.name} upload success:`, result);
//                   return {
//                     provider: adapter.constructor.name.replace('Adapter', '').toLowerCase(),
//                     url: result.url,
//                     id: result.id,
//                   };
//                 })
//                 .catch((err) => {
//                   console.error(`❌ [Media] beforeChange - ${adapter.constructor.name} upload failed:`, err.message);
//                   return null;
//                 })
//             );

//             const results = await Promise.all(uploadPromises);
//             const validResults = results.filter((r) => r !== null);
//             console.log(`🔍 [Media] beforeChange - ${validResults.length} uploads succeeded out of ${results.length}`);

//             if (validResults.length === 0) {
//               console.error("❌ [Media] beforeChange - All uploads failed!");
//               throw new APIError('All uploads failed. Please check your media providers.', 500);
//             }

//             // ✅ Build response with ALL URLs
//             const returnData: any = {
//               ...data,
//               imgbbUrl: null,
//               r2Url: null,
//               imageId: null,
//             };

//             for (const result of validResults) {
//               if (result.provider === 'imgbb') {
//                 returnData.imgbbUrl = result.url;
//                 returnData.imageId = result.id;
//                 console.log(`🔍 [Media] beforeChange - Set imgbbUrl: ${result.url}`);
//               } else if (result.provider === 'r2' || result.provider === 'cloudflare-r2') {
//                 returnData.r2Url = result.url;
//                 console.log(`🔍 [Media] beforeChange - Set r2Url: ${result.url}`);
//               }
//             }

//             // ✅ Set primary imageId to whichever provider is primary in settings
//             const settings = await getCachedSettings();
//             const primaryProvider = settings?.mediaProvider || 'imgbb';
//             console.log(`🔍 [Media] beforeChange - Primary provider from settings: ${primaryProvider}`);

//             const primaryResult = validResults.find((r) => r.provider === primaryProvider) || validResults[0];
//             returnData.imageId = primaryResult.id;
//             console.log(`🔍 [Media] beforeChange - Primary imageId: ${returnData.imageId}`);

//             console.log(
//               `✅ [Media] beforeChange - Uploaded to ${validResults.length} providers: ${validResults.map((r) => r.provider).join(', ')}`
//             );
//             console.log(`🔍 [Media] beforeChange - Return data:`, JSON.stringify(returnData, null, 2));

//             return returnData;
//           } catch (error: any) {
//             console.error('❌ [Media] beforeChange - Media upload error:', error);
//             throw new APIError(
//               `Media upload failed: ${error?.message || 'Unknown error'}. Please try again.`
//             );
//           }
//         }

//         console.log("🔍 [Media] beforeChange - No file to upload, returning data");
//         return data;
//       },
//     ],

//     // ====================================================================
//     // ✅ Adapter-based delete (Generic ID)
//     // ====================================================================
//     beforeDelete: [
//       async (args: any) => {
//         console.log("🔍 [Media] beforeDelete - START");
//         const doc = args.doc;
//         console.log(`🔍 [Media] beforeDelete - Doc ID: ${doc?.id}, imageId: ${doc?.imageId}`);
//         if (doc && doc.imageId) {
//           try {
//             const adapter = await getMediaAdapter();
//             console.log(`🔍 [Media] beforeDelete - Deleting from: ${adapter.constructor.name}`);
//             await adapter.delete(doc.imageId as string);
//             console.log(`🗑️ Media: Deleted file ID: ${doc.imageId}`);
//           } catch (error: any) {
//             console.error(`Media delete failed for ${doc.imageId}:`, error.message);
//           }
//         }
//         return doc;
//       },
//     ],

//     // ====================================================================
//     // ✅ SMART afterRead: Sets 'url' based on CDN Mode + Global Fetch Setting
//     // ====================================================================
//     afterRead: [
//       async ({ doc }) => {
//         console.log(`🔍 [Media] afterRead - START for doc: ${doc?.id}`);
        
//         // ✅ 1. Fetch Global Settings (cached)
//         const settings = await getCachedSettings();
//         const cdnMode = settings?.cdnMode ?? true;
//         const fetchMode = settings?.mediaFetchMode || 'imgbb';
        
//         console.log(`🔍 [Media] afterRead - cdnMode: ${cdnMode}, fetchMode: ${fetchMode}`);
//         console.log(`🔍 [Media] afterRead - doc.imageUrl: ${doc.imageUrl}, doc.imgbbUrl: ${doc.imgbbUrl}, doc.r2Url: ${doc.r2Url}`);

//         // ================================================================
//         // 🔥 ENTERPRISE FIX: If CDN Mode is enabled, use raw URL directly
//         // ================================================================
//         if (cdnMode) {
//           console.log("🔍 [Media] afterRead - CDN Mode ENABLED, using raw URL");
//           const safeImageUrl = getSafeStringUrl(doc.imageUrl);
//           const safeImgbbUrl = getSafeStringUrl(doc.imgbbUrl);
//           const safeR2Url = getSafeStringUrl(doc.r2Url);

//           if (safeImageUrl) {
//             doc.url = safeImageUrl;
//             console.log(`🔍 [Media] afterRead - Using imageUrl: ${safeImageUrl}`);
//             return doc;
//           }
//           if (safeImgbbUrl) {
//             doc.url = safeImgbbUrl;
//             console.log(`🔍 [Media] afterRead - Using imgbbUrl (fallback): ${safeImgbbUrl}`);
//             return doc;
//           }
//           if (safeR2Url) {
//             doc.url = safeR2Url;
//             console.log(`🔍 [Media] afterRead - Using r2Url (fallback): ${safeR2Url}`);
//             return doc;
//           }
//           console.warn("🔍 [Media] afterRead - No URL found, returning doc without url");
//           return doc;
//         }

//         // ================================================================
//         // 📸 ORIGINAL LOGIC (CDN Mode Disabled — Use ImgBB/R2)
//         // ================================================================
//         console.log("🔍 [Media] afterRead - CDN Mode DISABLED, using fetchMode");
//         const safeImgbbUrl = getSafeStringUrl(doc.imgbbUrl);
//         const safeR2Url = getSafeStringUrl(doc.r2Url);

//         if (fetchMode === 'imgbb' && safeImgbbUrl) {
//           doc.url = safeImgbbUrl;
//           console.log(`🔍 [Media] afterRead - Using imgbbUrl: ${safeImgbbUrl}`);
//         } else if (fetchMode === 'r2' && safeR2Url) {
//           doc.url = safeR2Url;
//           console.log(`🔍 [Media] afterRead - Using r2Url: ${safeR2Url}`);
//         } else if (fetchMode === 'both') {
//           doc.url = safeImgbbUrl || safeR2Url;
//           doc._imgbbUrl = safeImgbbUrl;
//           doc._r2Url = safeR2Url;
//           console.log(`🔍 [Media] afterRead - Using both mode, primary: ${doc.url}`);
//         } else {
//           doc.url = safeImgbbUrl || safeR2Url;
//           console.log(`🔍 [Media] afterRead - Using fallback URL: ${doc.url}`);
//         }

//         return doc;
//       },
//     ],
//   },
//   fields: [
//     {
//       name: 'alt',
//       type: 'text',
//       required: true,
//       admin: {
//         description: 'Descriptive text for accessibility (max 200 chars).',
//       },
//     },
//     {
//       name: 'assetCategory',
//       type: 'select',
//       label: 'Image Type / Folder',
//       options: [
//         { label: 'Products', value: 'products' },
//         { label: 'Categories', value: 'categories' },
//         { label: 'Banners & Deals', value: 'banners' },
//         { label: 'General / Logos', value: 'general' },
//         { label: '➕ Create Custom Folder...', value: 'custom' },
//       ],
//       defaultValue: 'general',
//       required: true,
//     },
//     {
//       name: 'customFolderName',
//       type: 'text',
//       label: 'Type New Folder Name',
//       admin: {
//         condition: (data) => data?.assetCategory === 'custom',
//       },
//     },
//     {
//       name: 'imageUrl',
//       type: 'text',
//       admin: { readOnly: true },
//     },
//     {
//       name: 'imgbbUrl',
//       type: 'text',
//       admin: { readOnly: true },
//     },
//     {
//       name: 'r2Url',
//       type: 'text',
//       admin: { readOnly: true },
//     },
//     {
//       name: 'imageId',
//       type: 'text',
//       admin: { readOnly: true },
//     },
//   ],
// };
// src/collections/Media.ts

import type { CollectionConfig } from 'payload';
import { APIError } from 'payload';
import { getMediaAdapters, getMediaAdapter } from '../lib/adapters/media/factory';
import { getCachedSettings } from '@/app/shared/lib/cache/settings';

// ====================================================================
// 🛡️ UTILITY: Sanitize Alt Text (Prevents XSS)
// ====================================================================
const sanitizeAlt = (text: string): string => {
  if (!text) return 'image';
  return text.replace(/<[^>]*>/g, '').trim().slice(0, 200);
};

// Helper utility to safely validate and retrieve non-empty trimmed URLs
const getSafeStringUrl = (val: unknown): string | null => {
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim();
  }
  return null;
};

// ====================================================================
// COLLECTION CONFIG
// ====================================================================
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    disableLocalStorage: true,
    adminThumbnail: ({ doc }) =>
      getSafeStringUrl(doc.imageUrl) ||
      getSafeStringUrl(doc.imgbbUrl) ||
      getSafeStringUrl(doc.r2Url) ||
      getSafeStringUrl(doc.url) ||
      '/placeholder.png',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
  },
  access: {
    read: () => true,
  },
  indexes: [
    { fields: ['assetCategory'] },
    { fields: ['alt'] },
    { fields: ['imgbbUrl'] },
    { fields: ['r2Url'] },
    { fields: ['imageUrl'] },
  ],
  hooks: {
    // ====================================================================
    // ✅ Size Limit & MIME Validation (Max 5MB)
    // ====================================================================
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data;

        if (req.file && req.file.data) {
          const fileSize = req.file.data.length;
          const mimeType = req.file.mimetype || '';

          const maxSize = 5 * 1024 * 1024;

          if (fileSize > maxSize) {
            const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
            throw new APIError(
              `File size (${sizeInMB}MB) exceeds maximum allowed (5MB). Please compress your file.`,
              400
            );
          }

          const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
          if (!allowedMimes.includes(mimeType)) {
            throw new APIError(
              `File type (${mimeType}) is not allowed. Please upload JPEG, PNG, WEBP, GIF, MP4, or WEBM.`,
              400
            );
          }

          if (data.alt) {
            data.alt = sanitizeAlt(data.alt);
          }
        }
        return data;
      },
    ],

    // ====================================================================
    // ✅ ENTERPRISE FIX: Dual-URL Storage (ImgBB + R2)
    // ====================================================================
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data) return data;

        // ✅ If this is an update operation and no new file, preserve existing URLs
        if (operation === 'update' && !req.file) {
          return data;
        }

        if (req.file && req.file.data) {
          try {
            const buffer = req.file.data;
            const mimeType = req.file.mimetype || 'image/jpeg';

            // Determine folder
            let finalFolder = data.assetCategory || 'general';
            if (data.assetCategory === 'custom' && data.customFolderName) {
              finalFolder = data.customFolderName.replace(/\s+/g, '-').toLowerCase();
            }

            // ✅ Get all configured adapters
            const adapters = await getMediaAdapters();

            // ✅ Upload to ALL adapters in parallel
            const uploadPromises = adapters.map((adapter) =>
              adapter
                .upload(buffer, {
                  folder: finalFolder,
                  metadata: { mimeType },
                })
                .then((result) => ({
                  provider: adapter.constructor.name.replace('Adapter', '').toLowerCase(),
                  url: result.url,
                  id: result.id,
                }))
                .catch((err) => {
                  console.error(`❌ [Media] ${adapter.constructor.name} upload failed:`, err.message);
                  return null;
                })
            );

            const results = await Promise.all(uploadPromises);
            const validResults = results.filter((r) => r !== null);

            if (validResults.length === 0) {
              console.error("❌ [Media] beforeChange - All uploads failed!");
              throw new APIError('All uploads failed. Please check your media providers.', 500);
            }

            // ✅ Build response with ALL URLs
            const returnData: any = {
              ...data,
              imgbbUrl: null,
              r2Url: null,
              imageId: null,
            };

            for (const result of validResults) {
              if (result.provider === 'imgbb') {
                returnData.imgbbUrl = result.url;
                returnData.imageId = result.id;
              } else if (result.provider === 'r2' || result.provider === 'cloudflare-r2') {
                returnData.r2Url = result.url;
              }
            }

            // ✅ Set primary imageId
            const settings = await getCachedSettings();
            const primaryProvider = settings?.mediaProvider || 'imgbb';
            const primaryResult = validResults.find((r) => r.provider === primaryProvider) || validResults[0];
            returnData.imageId = primaryResult.id;

            return returnData;
          } catch (error: any) {
            console.error('❌ [Media] beforeChange - Media upload error:', error);
            throw new APIError(
              `Media upload failed: ${error?.message || 'Unknown error'}. Please try again.`
            );
          }
        }

        return data;
      },
    ],

    // ====================================================================
    // ✅ Adapter-based delete (Generic ID)
    // ====================================================================
    beforeDelete: [
      async (args: any) => {
        const doc = args.doc;
        if (doc && doc.imageId) {
          try {
            const adapter = await getMediaAdapter();
            await adapter.delete(doc.imageId as string);
          } catch (error: any) {
            console.error(`Media delete failed for ${doc.imageId}:`, error.message);
          }
        }
        return doc;
      },
    ],

    // ====================================================================
    // ✅ SMART afterRead: Sets 'url' based on CDN Mode + Global Fetch Setting
    // ====================================================================
    afterRead: [
      async ({ doc }) => {
        // ✅ 1. Fetch Global Settings (cached)
        const settings = await getCachedSettings();
        const cdnMode = settings?.cdnMode ?? true;
        const fetchMode = settings?.mediaFetchMode || 'imgbb';

        // ================================================================
        // 🔥 ENTERPRISE FIX: If CDN Mode is enabled, use raw URL directly
        // ================================================================
        if (cdnMode) {
          const safeImageUrl = getSafeStringUrl(doc.imageUrl);
          const safeImgbbUrl = getSafeStringUrl(doc.imgbbUrl);
          const safeR2Url = getSafeStringUrl(doc.r2Url);

          if (safeImageUrl) {
            doc.url = safeImageUrl;
            return doc;
          }
          if (safeImgbbUrl) {
            doc.url = safeImgbbUrl;
            return doc;
          }
          if (safeR2Url) {
            doc.url = safeR2Url;
            return doc;
          }
          return doc;
        }

        // ================================================================
        // 📸 ORIGINAL LOGIC (CDN Mode Disabled — Use ImgBB/R2)
        // ================================================================
        const safeImgbbUrl = getSafeStringUrl(doc.imgbbUrl);
        const safeR2Url = getSafeStringUrl(doc.r2Url);

        if (fetchMode === 'imgbb' && safeImgbbUrl) {
          doc.url = safeImgbbUrl;
        } else if (fetchMode === 'r2' && safeR2Url) {
          doc.url = safeR2Url;
        } else if (fetchMode === 'both') {
          doc.url = safeImgbbUrl || safeR2Url;
          doc._imgbbUrl = safeImgbbUrl;
          doc._r2Url = safeR2Url;
        } else {
          doc.url = safeImgbbUrl || safeR2Url;
        }

        return doc;
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Descriptive text for accessibility (max 200 chars).',
      },
    },
    {
      name: 'assetCategory',
      type: 'select',
      label: 'Image Type / Folder',
      options: [
        { label: 'Products', value: 'products' },
        { label: 'Categories', value: 'categories' },
        { label: 'Banners & Deals', value: 'banners' },
        { label: 'General / Logos', value: 'general' },
        { label: '➕ Create Custom Folder...', value: 'custom' },
      ],
      defaultValue: 'general',
      required: true,
    },
    {
      name: 'customFolderName',
      type: 'text',
      label: 'Type New Folder Name',
      admin: {
        condition: (data) => data?.assetCategory === 'custom',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'imgbbUrl',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'r2Url',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'imageId',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
};