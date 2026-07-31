import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

// ====================================================================
// ⚡ ENTERPRISE HOOKS: Cache Invalidation (GAP 2 FIX)
// ====================================================================
const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');

    const prevSlug = previousDoc?.slug as string | undefined;
    const newSlug = doc.slug as string;

    // ✅ Homepage aur sitemap clear karo
    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    // ✅ PLP filters clear karo (brand list update ho jayegi)
    // Next.js 16+ requires 2 arguments (tag, "max")
    revalidateTag('filter-data', 'max');

    // ✅ Agar brand ka slug change hua hai, toh purane brand path clear karo
    if (prevSlug && prevSlug !== newSlug) {
      revalidatePath(`/brand/${prevSlug}`, 'page');
    }
    revalidatePath(`/brand/${newSlug}`, 'page');

    console.log(`🔄 Brand Cache Cleared: ${doc.name} (${newSlug})`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Brand revalidation failed:', errorMsg);
  }
};

const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');

    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    // Next.js 16+ requires 2 arguments (tag, "max")
    revalidateTag('filter-data', 'max');

    if (doc.slug) {
      revalidatePath(`/brand/${doc.slug}`, 'page');
    }

    console.log(`🗑️ Brand Deleted: ${doc.name} - Cache Purged`);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Brand delete revalidation failed:', errorMsg);
  }
};

// ====================================================================
// COLLECTION CONFIGURATION
// ====================================================================
export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'logo'],
  },
  access: {
    read: () => true,
  },
  // ====================================================================
  // 🚀 ENTERPRISE FIX (GAP 1): Indexes for Rocket Speed
  // ====================================================================
  indexes: [
    // ✅ Name field par index (Admin search ke liye)
    { fields: ['name'] },
    // ✅ Compound index agar kabhi name + slug se query karein
    { fields: ['name', 'slug'] },
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
      name: 'name',
      type: 'text',
      label: 'Brand Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique URL identifier (e.g., "nike" or "best-design").',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Brand Logo',
      required: false,
      admin: {
        description: 'Brand ka logo upload karein (e.g., JPEG, PNG, SVG).',
      },
    },
  ],
};