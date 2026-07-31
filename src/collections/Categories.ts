import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { SEO } from '../fields/SEO';

// ====================================================================
// ⚡ ENTERPRISE HOOKS: Cache Invalidation (GAP 2 FIX)
// ====================================================================
const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');

    // Agar slug ya name change hua hai toh puri site ki cache clear karo
    const prevSlug = previousDoc?.slug as string | undefined;
    const newSlug = doc.slug as string;

    revalidatePath('/'); // Homepage
    revalidatePath('/sitemap.xml');

    // ✅ FIX: Next.js 16+ requires 2 arguments (tag, "max")
    revalidateTag('filter-data', 'max');

    // Agar category ka slug change hua hai, toh purane product paths bhi clear karo
    if (prevSlug && prevSlug !== newSlug) {
      revalidatePath(`/category/${prevSlug}`, 'page');
    }
    // Naye category slug ke liye path clear karo
    revalidatePath(`/category/${newSlug}`, 'page');

    console.log(`🔄 Category Cache Cleared: ${doc.name} (${newSlug})`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Category revalidation failed:', errorMsg);
  }
};

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');

    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    // ✅ FIX: Next.js 16+ requires 2 arguments (tag, "max")
    revalidateTag('filter-data', 'max');

    if (doc.slug) {
      revalidatePath(`/category/${doc.slug}`, 'page');
    }

    console.log(`🗑️ Category Deleted: ${doc.name} - Cache Purged`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Category delete revalidation failed:', errorMsg);
  }
};

// ====================================================================
// COLLECTION CONFIGURATION
// ====================================================================
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent'],
  },
  access: {
    read: () => true,
  },
  // ====================================================================
  // 🚀 ENTERPRISE FIX (GAP 1): Indexes for Rocket Speed
  // ====================================================================
  indexes: [
    // ✅ Parent field index for fast tree traversal
    { fields: ['parent'] },
    // ✅ Compound index for parent + slug (if you ever query by both)
    { fields: ['parent', 'slug'] },
  ],
  // ====================================================================
  // ✅ ENTERPRISE FIX (GAP 2): Hooks for Cache Management
  // ====================================================================
  hooks: {
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // --- TAB 1: MAIN DETAILS ---
        {
          label: 'Main Details',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Category Name',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              required: true,
              unique: true,
              admin: {
                description: 'URL identifier (e.g., "mens-clothing").',
              },
            },
            {
              name: 'parent',
              type: 'relationship',
              relationTo: 'categories',
              label: 'Parent Category',
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Category Icon/Image',
            },
          ],
        },
        // --- TAB 2: PAGE CONTENT ---
        {
          label: 'Category Page Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Category Description',
              admin: {
                description: 'SEO aur category page par nazar aane wala text.',
              },
            },
            {
              name: 'desktopBanner',
              type: 'upload',
              relationTo: 'media',
              label: 'Desktop Banner Image',
              admin: {
                description: 'Wide image for large screens (e.g. 1500x400).',
              },
            },
            {
              name: 'mobileBanner',
              type: 'upload',
              relationTo: 'media',
              label: 'Mobile Banner Image',
              admin: {
                description: 'Tall/Square image for mobile screens.',
              },
            },
          ],
        },
        // --- TAB 3: SEO ---
        {
          label: 'SEO Settings',
          fields: [
            SEO,
          ],
        },
      ],
    },
  ],
};