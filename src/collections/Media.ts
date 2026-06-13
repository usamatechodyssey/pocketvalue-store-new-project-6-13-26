
import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import cloudinary from '../lib/cloudinary'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    disableLocalStorage: true, 
    adminThumbnail: ({ doc }) => (doc.cloudinaryUrl as string) || (doc.url as string), 
    mimeTypes: ['image/*', 'video/*'], 
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange:[
      async ({ data, req }) => {
        if (req.file && req.file.data) {
          try {
            const mimeType = req.file.mimetype;
            const base64Data = req.file.data.toString('base64');
            const fileUri = `data:${mimeType};base64,${base64Data}`;

            let finalFolder = data.assetCategory;
            if (data.assetCategory === 'custom' && data.customFolderName) {
               finalFolder = data.customFolderName.replace(/\s+/g, '-').toLowerCase();
            }

            const cloudPath = `pocketvalue/${finalFolder || 'general'}`;

            const uploadResult = await cloudinary.uploader.upload(fileUri, {
              folder: cloudPath, 
              timeout: 60000, 
            });

            return {
              ...data,
              cloudinaryUrl: uploadResult.secure_url,
              cloudinaryId: uploadResult.public_id,
            };
          } catch (error: any) {
            console.error('Cloudinary Upload Error:', error);
            throw new APIError(`Cloudinary Upload Failed: ${error?.error?.message || 'Timeout'}. Check your internet connection.`);
          }
        }
        return data;
      },
    ],
    // ✅ FIX: 'args' parameter ko `any` type diya hai taake TypeScript type checking bypass ho sake.
    beforeDelete:[
      async (args: any) => { // `any` type for the entire arguments object
        const doc = args.doc; // Ab TypeScript ko pata hoga ke `doc` mojood hai (kyunke args: any hai)
        // const req = args.req; // Agar req ya id ki zaroorat pare to aise access kar sakte hain
        // const id = args.id;   // Aur warnings bhi nahi aayenge agar use na karein

        if (doc && doc.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryId as string);
            console.log(`Cloudinary: Successfully deleted image with ID: ${doc.cloudinaryId}`);
          } catch (error: any) {
            console.error(`Cloudinary: Failed to delete image "${doc.cloudinaryId}":`, error.message);
          }
        }
        return doc; // Hook hamesha doc ko return kare
      },
    ],
    afterRead:[
      ({ doc }) => {
        if (doc.cloudinaryUrl) {
          doc.url = doc.cloudinaryUrl;
        }
        return doc;
      }
    ]
  },
  fields:[
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'assetCategory',
      type: 'select',
      label: 'Image Type / Folder',
      options:[
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
        condition: (data) => data.assetCategory === 'custom',
      },
    },
    {
      name: 'cloudinaryId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'cloudinaryUrl',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}