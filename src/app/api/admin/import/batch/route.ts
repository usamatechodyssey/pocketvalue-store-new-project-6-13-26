
// src/app/api/import/batch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyStaff } from '@/lib/payloadAuth';
import { getSafePayload } from '@/app/shared/lib/payloadInstance';
import { getCachedSettings } from '@/app/shared/lib/cache/settings';
import { getMediaAdaptersForProduct } from '@/lib/adapters/media/factory';

// ====================================================================
// 🛠️ HELPERS (Reused from CLI script)
// ====================================================================
const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

const generateKey = (): string =>
  `var_${Date.now()}_${Math.random().toString(36).substring(7)}`;

const safeFloat = (val: unknown): number => {
  if (typeof val === 'number') return val;
  if (!val || typeof val !== 'string' || val.trim() === '') return 0;
  const num = parseFloat(val.replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
};

const safeInt = (val: unknown): number => {
  if (typeof val === 'number') return Math.floor(val);
  if (!val || typeof val !== 'string' || val.trim() === '') return 0;
  const num = parseInt(val.replace(/,/g, '').trim(), 10);
  return isNaN(num) ? 0 : num;
};

// ====================================================================
// 🚀 MAIN POST HANDLER
// ====================================================================
export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. RBAC Check (Only Admin & Manager)
    await verifyStaff(['admin', 'manager']);

    // ✅ 2. Fetch Settings (CDN Mode)
    const settings = await getCachedSettings();
    const cdnMode = settings?.cdnMode ?? true; // Default: ON

    // 📦 3. Parse FormData
    const formData = await req.formData();
    const productsJson = formData.get('products') as string;
    if (!productsJson) {
      return NextResponse.json(
        { error: 'Missing products metadata.' },
        { status: 400 }
      );
    }

    const productsMetadata = JSON.parse(productsJson);
    if (!Array.isArray(productsMetadata) || productsMetadata.length === 0) {
      return NextResponse.json(
        { error: 'Invalid products metadata. Must be a non-empty array.' },
        { status: 400 }
      );
    }

    // 🖼️ 4. Extract Image Files from FormData (only if CDN Mode is OFF)
    const imageFiles: { [key: string]: File } = {};
    if (!cdnMode) {
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('image_') && value instanceof File) {
          imageFiles[key] = value;
        }
      }
    }

    // 🔌 5. Connect to Payload
    const payload = await getSafePayload();

    // 📦 6. Pre-fetch Categories & Brands (for mapping)
    const [categoriesResult, brandsResult] = await Promise.all([
      payload.find({ collection: 'categories', limit: 1000 }),
      payload.find({ collection: 'brands', limit: 1000 }),
    ]);
    const cachedCategories = categoriesResult.docs;
    const cachedBrands = brandsResult.docs;

    // 🧠 7. Process Each Product
    const processedProducts: any[] = [];
    const errors: string[] = [];

    for (let pIdx = 0; pIdx < productsMetadata.length; pIdx++) {
      const productMeta = productsMetadata[pIdx];
      const parentData = productMeta.parent;
      const variantMetas = productMeta.variants || [];

      try {
        // --- Brand Handling ---
        let brandId: string | undefined = undefined;
        if (parentData.brand?.trim()) {
          const brandName = parentData.brand.trim();
          let brand = cachedBrands.find(
            (b: any) => b.name.toLowerCase() === brandName.toLowerCase()
          );
          if (!brand) {
            console.log(`➕ Creating new brand: ${brandName}`);
            brand = await payload.create({
              collection: 'brands',
              data: { name: brandName, slug: generateSlug(brandName) },
            });
            cachedBrands.push(brand);
          }
          brandId = brand.id;
        }

        // --- Categories Handling (Auto-Create Pattern) ---
        const categoryIds: string[] = [];
        if (parentData.categories) {
          // Supports both comma and semicolon delimitations safely
          const categoryNames = parentData.categories
            .split(/[;,]/)
            .map((catName: string) => catName.trim())
            .filter(Boolean);

          // Sequential loop prevents duplicate category writes under race conditions
          for (const catName of categoryNames) {
            let category = cachedCategories.find(
              (c: any) =>
                c.name.toLowerCase() === catName.toLowerCase() || c.slug === generateSlug(catName)
            );

            if (!category) {
              console.log(`➕ Auto-creating missing category: ${catName}`);
              try {
                category = await payload.create({
                  collection: 'categories',
                  data: {
                    name: catName,
                    slug: generateSlug(catName),
                  },
                });
                cachedCategories.push(category);
              } catch (catErr: any) {
                console.error(`❌ Failed to auto-create category "${catName}":`, catErr.message);
                throw new Error(`Category "${catName}" could not be auto-created: ${catErr.message}`);
              }
            }

            if (category?.id) {
              categoryIds.push(category.id);
            }
          }
        }

        // --- Get Adapters for this product ---
        const { adapters, primary } = await getMediaAdaptersForProduct({
          storageProvider: parentData.storageProvider || 'global',
          primaryProvider: parentData.primaryProvider || 'imgbb',
        });

        // --- Variants Processing ---
        const allVariantRows = [...variantMetas];
        if (parentData.variant_name || parentData.variant_price) {
          allVariantRows.unshift({
            ...parentData,
            variant_name: parentData.variant_name || 'Standard',
          });
        }

        const processedVariants = [];
        let imageIndex = 0;

        for (const v of allVariantRows) {
          if (v.variant_name || v.variant_price) {
            let uploadedImages: any[] = [];

            // ✅ ENTERPRISE FIX: CDN Mode Handling
            if (cdnMode) {
              // 🚀 CDN Mode ON — Align properties with CSV row keys ('variant_images')
              const rawImagesStr = v.variant_images || v.imageUrls || v.cdnImageUrls || '';
              const imageUrls = typeof rawImagesStr === 'string'
                ? rawImagesStr.split(/[;,]/).map((u: string) => u.trim()).filter(Boolean)
                : (Array.isArray(rawImagesStr) ? rawImagesStr : []);

              if (imageUrls.length > 0) {
                uploadedImages = imageUrls.map((url: string, idx: number) => ({
                  _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
                  url: url,
                  cdnUrls: [url],
                  asset: {
                    _ref: `cdn_${Date.now()}_${idx}`,
                    _type: 'reference',
                  },
                }));
                console.log(`☁️ CDN Mode: Using ${uploadedImages.length} image URLs for variant ${v.variant_name}`);
              } else {
                console.warn(`⚠️ CDN Mode ON but no image URLs provided for variant ${v.variant_name}. Skipping images.`);
              }
            } else {
              // 📸 CDN Mode OFF — Use uploaded files
              const variantImageNames = v.compressedImages || [];
              const variantImageBuffers: Buffer[] = [];

              for (let i = 0; i < variantImageNames.length; i++) {
                const fileKey = `image_${imageIndex}`;
                const file = imageFiles[fileKey];
                if (file) {
                  const arrayBuffer = await file.arrayBuffer();
                  variantImageBuffers.push(Buffer.from(arrayBuffer));
                  imageIndex++;
                } else {
                  console.warn(`⚠️ Image file not found for key: ${fileKey}`);
                }
              }

              // Upload images for this variant
              for (const buffer of variantImageBuffers) {
                try {
                  const uploadPromises = adapters.map((adapter: any) =>
                    adapter
                      .upload(buffer, {
                        folder: 'products',
                        metadata: { mimeType: 'image/webp' },
                      })
                      .then((result: any) => ({
                        provider: adapter.constructor.name.replace('Adapter', '').toLowerCase(),
                        url: result.url,
                        id: result.id,
                      }))
                      .catch((err: any) => {
                        console.error(`❌ Upload failed for ${adapter.constructor.name}:`, err.message);
                        return null;
                      })
                  );

                  const results = await Promise.all(uploadPromises);
                  const validResults = results.filter((r) => r !== null);

                  if (validResults.length === 0) {
                    throw new Error('All uploads failed for an image.');
                  }

                  const primaryName = primary.constructor.name.replace('Adapter', '').toLowerCase();
                  const primaryResult = validResults.find((r) => r.provider === primaryName) || validResults[0];

                  let imgbbUrl: string | null = null;
                  let r2Url: string | null = null;

                  for (const result of validResults) {
                    if (result.provider === 'imgbb') imgbbUrl = result.url;
                    if (result.provider === 'r2' || result.provider === 'cloudflare-r2') r2Url = result.url;
                  }

                  uploadedImages.push({
                    _key: generateKey(),
                    url: primaryResult.url,
                    imgbbUrl,
                    r2Url,
                    asset: {
                      _ref: `import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                      _type: 'reference',
                    },
                  });
                } catch (uploadError: any) {
                  console.error('Image upload failed:', uploadError);
                  uploadedImages.push({
                    _key: generateKey(),
                    url: '/placeholder.svg',
                    imgbbUrl: null,
                    r2Url: null,
                    asset: { _ref: `error_${Date.now()}`, _type: 'reference' },
                  });
                  errors.push(`Image upload failed for product ${parentData.title}: ${uploadError.message}`);
                }
              }
            }

            // Build variant object
            const attributes = [];
            if (v.attribute1_name && v.attribute1_value) {
              attributes.push({
                _key: generateKey(),
                name: v.attribute1_name.toString().trim(),
                value: v.attribute1_value.toString().trim(),
              });
            }
            if (v.attribute2_name && v.attribute2_value) {
              attributes.push({
                _key: generateKey(),
                name: v.attribute2_name.toString().trim(),
                value: v.attribute2_value.toString().trim(),
              });
            }

            const variantPayload: any = {
              _key: generateKey(),
              name: v.variant_name || 'Standard',
              sku: v.variant_sku || '',
              price: safeFloat(v.variant_price),
              salePrice: v.variant_salePrice ? safeFloat(v.variant_salePrice) : undefined,
              stock: safeInt(v.variant_stock),
              inStock:
                v.variant_inStock !== undefined
                  ? String(v.variant_inStock).toLowerCase() === 'true'
                  : safeInt(v.variant_stock) > 0,
              images: cdnMode ? [] : uploadedImages,
              weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
              dimensions: v.variant_height || v.variant_width
                ? {
                    height: safeFloat(v.variant_height),
                    width: safeFloat(v.variant_width),
                    depth: safeFloat(v.variant_depth),
                  }
                : undefined,
              attributes,
            };

            // If CDN Mode is ON and we have images, set cdnImages
            if (cdnMode && uploadedImages.length > 0) {
              variantPayload.cdnImages = uploadedImages.map((img) => ({ url: img.url }));
            }

            processedVariants.push(variantPayload);
          }
        }

        if (processedVariants.length === 0) {
          throw new Error('No valid variants. At least one variant required.');
        }

        // Build Product Document
        const productDoc = {
          title: parentData.title,
          slug: parentData.slug || generateSlug(parentData.title),
          videoUrl: parentData.videoUrl || '',
          description: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', text: parentData.description || '', version: 1 }],
                  version: 1,
                  direction: 'ltr' as const,
                  format: '' as const,
                  indent: 0,
                },
              ],
              direction: 'ltr' as const,
              format: '' as const,
              indent: 0,
              version: 1,
            },
          },
          specifications: parentData.specifications
            ? parentData.specifications
                .split('|')
                .map((item: string) => {
                  const parts = item.split(':');
                  return parts.length >= 2
                    ? { label: parts[0].trim(), value: parts.slice(1).join(':').trim() }
                    : { label: 'Feature', value: item.trim() };
                })
            : [],
          brand: brandId,
          categories: categoryIds,
          isBestSeller: String(parentData.isBestSeller || '').toLowerCase() === 'true',
          isNewArrival: String(parentData.isNewArrival || '').toLowerCase() === 'true',
          isFeatured: String(parentData.isFeatured || '').toLowerCase() === 'true',
          isOnDeal: String(parentData.isOnDeal || '').toLowerCase() === 'true',
          rating: safeFloat(parentData.rating),
          storageProvider: parentData.storageProvider || 'global',
          primaryProvider: parentData.primaryProvider || 'imgbb',
          variants: processedVariants,
        };

        processedProducts.push(productDoc);
      } catch (err: any) {
        errors.push(`Product "${parentData.title || 'Unknown'}": ${err.message}`);
        console.error(`❌ Product processing error:`, err);
      }
    }

    // 💾 8. Insert Products into Payload
    let successCount = 0;
    let failCount = 0;

    for (const productData of processedProducts) {
      try {
        await payload.create({
          collection: 'products',
          data: productData,
        });
        successCount++;
      } catch (err: any) {
        failCount++;
        errors.push(`Insert failed for ${productData.title}: ${err.message}`);
        console.error(`❌ Insert error:`, err);
      }
    }

    // ✅ 9. Return Response
    return NextResponse.json({
      success: failCount === 0,
      successful: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined,
      total: successCount + failCount,
      cdnMode,
    });
  } catch (error: any) {
    console.error('❌ Batch import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}