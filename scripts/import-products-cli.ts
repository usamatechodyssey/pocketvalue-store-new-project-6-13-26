
// // scripts/import-products-cli.ts

// // ✅ 1. Sab se pehle .env.local load karein
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' });

// // ✅ 2. Agar Redis credentials missing hain toh dummy set karein (fallback)
// if (!process.env.UPSTASH_REDIS_REST_URL) {
//   process.env.UPSTASH_REDIS_REST_URL = 'https://dummy.upstash.io';
// }
// if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
//   process.env.UPSTASH_REDIS_REST_TOKEN = 'dummy';
// }

// // ✅ 3. Ab saare dependencies dynamically import karein (runtime par load hoga)
// const main = async () => {
//   const [
//     { default: fs },
//     { default: Papa },
//     { default: sharp },
//     { getSafePayload },
//     { MediaProvider },
//   ] = await Promise.all([
//     import('fs'),
//     import('papaparse'),
//     import('sharp'),
//     import('../src/app/shared/lib/payloadInstance'),
//     import('../src/lib/adapters/media/types'),
//   ]);

//   // ✅ 4. Redis mock override (ensure rate-limiter doesn't throw)
//   const { redis: realRedis } = await import('../src/app/shared/lib/telemetry/rate-limiter');
//   const mockRedis = {
//     get: async () => null,
//     set: async () => {},
//     incr: async () => 1,
//     expire: async () => {},
//     del: async () => {},
//     keys: async () => [],
//     pipeline: () => ({ del: () => {}, exec: async () => {} }),
//     setnx: async () => true,
//     eval: async () => 1,
//     sadd: async () => {},
//     srem: async () => {},
//     smembers: async () => [],
//     hset: async () => {},
//     hget: async () => null,
//     hgetall: async () => ({}),
//   };
//   // @ts-ignore
//   global.redis = mockRedis;

//   // ================================================================
//   // 🛠️ LOCAL SETTINGS FETCH (No Redis)
//   // ================================================================
//   async function getLocalSettings() {
//     try {
//       const payload = await getSafePayload();
//       const settings = await payload.findGlobal({ slug: 'settings' });
//       return settings;
//     } catch (error) {
//       console.warn('⚠️ Failed to fetch settings from Payload. Using defaults.');
//       return { cdnMode: true };
//     }
//   }

//   // ================================================================
//   // 🛠️ HELPER: Get or Create Category with Hierarchy
//   // ================================================================
//   async function getOrCreateCategory(
//     categoryPath: string,
//     payload: any,
//     cachedCategories: any[]
//   ): Promise<string> {
//     // Split by ">" or "|" or "/" to get hierarchy
//     const parts = categoryPath
//       .split(/\s*[>|/]\s*/)
//       .map((p) => p.trim())
//       .filter(Boolean);

//     if (parts.length === 0) {
//       throw new Error(`Invalid category path: ${categoryPath}`);
//     }

//     let parentId: string | null = null;
//     let lastCreatedId: string | null = null;

//     for (let i = 0; i < parts.length; i++) {
//       const name = parts[i];
//       const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

//       // Check if category exists in cache
//       let found = cachedCategories.find(
//         (c: any) =>
//           c.name.toLowerCase() === name.toLowerCase() ||
//           c.slug === slug
//       );

//       // If not found, create it
//       if (!found) {
//         console.log(`  ➕ Creating category: ${name} ${parentId ? `(parent: ${parentId})` : '(root)'}`);
//         const newCategory = await payload.create({
//           collection: 'categories',
//           data: {
//             name: name,
//             slug: slug,
//             parent: parentId,
//           },
//         });
//         found = newCategory;
//         cachedCategories.push(newCategory);
//       }

//       parentId = found.id;
//       lastCreatedId = found.id;
//     }

//     return lastCreatedId!;
//   }

//   // ================================================================
//   // 🛠️ HELPER: Get or Create Brand
//   // ================================================================
//   async function getOrCreateBrand(
//     brandName: string,
//     payload: any,
//     cachedBrands: any[]
//   ): Promise<string> {
//     const cleanName = brandName.trim();
//     const slug = cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

//     let found = cachedBrands.find(
//       (b: any) => b.name.toLowerCase() === cleanName.toLowerCase() || b.slug === slug
//     );

//     if (!found) {
//       console.log(`  ➕ Creating brand: ${cleanName}`);
//       const newBrand = await payload.create({
//         collection: 'brands',
//         data: {
//           name: cleanName,
//           slug: slug,
//         },
//       });
//       found = newBrand;
//       cachedBrands.push(newBrand);
//     }

//     return found.id;
//   }

//   // ================================================================
//   // 🛠️ CONFIGURATION
//   // ================================================================
//   const CONCURRENCY_LIMIT = 20;
//   const DB_BATCH_SIZE = 50;

//   // ================================================================
//   // 🛠️ HELPERS
//   // ================================================================
//   const generateSlug = (text: string): string =>
//     text
//       .toLowerCase()
//       .replace(/ /g, '-')
//       .replace(/[^\w-]+/g, '');

//   const generateKey = (): string =>
//     `var_${Date.now()}_${Math.random().toString(36).substring(7)}`;

//   const safeFloat = (val: unknown): number => {
//     if (typeof val === 'number') return val;
//     if (!val || typeof val !== 'string' || val.trim() === '') return 0;
//     const num = parseFloat(val.replace(/,/g, '').trim());
//     return isNaN(num) ? 0 : num;
//   };

//   const safeInt = (val: unknown): number => {
//     if (typeof val === 'number') return Math.floor(val);
//     if (!val || typeof val !== 'string' || val.trim() === '') return 0;
//     const num = parseInt(val.replace(/,/g, '').trim(), 10);
//     return isNaN(num) ? 0 : num;
//   };

//   const hasVariantData = (row: any): boolean => {
//     const hasName = row.variant_name?.toString().trim() !== '';
//     const hasSku = row.variant_sku?.toString().trim() !== '';
//     const hasPrice = row.variant_price?.toString().trim() !== '';
//     return hasName || hasSku || hasPrice;
//   };

//   // ================================================================
//   // 🖼️ IMAGE PROCESSING
//   // ================================================================
//   async function processImage(
//     url: string,
//     _slug: string,
//     adapters: any[],
//     primaryAdapter: any,
//     skipUpload: boolean = false,
//     cdnMode: boolean = false
//   ): Promise<{ primaryUrl: string; imgbbUrl: string | null; r2Url: string | null; cdnUrls: string[] } | null> {
//     if (cdnMode) {
//       console.log(`☁️ CDN Mode: Skipping upload for ${url}`);
//       return {
//         primaryUrl: url,
//         imgbbUrl: null,
//         r2Url: null,
//         cdnUrls: [url],
//       };
//     }

//     try {
//       const response = await fetch(url, {
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//           Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
//         },
//         signal: AbortSignal.timeout(15000),
//       });

//       if (!response.ok) {
//         console.warn(`⚠️ Failed to fetch ${url}: HTTP ${response.status}`);
//         return null;
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);

//       const compressedBuffer = await sharp(buffer)
//         .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
//         .webp({ quality: 80, effort: 6 })
//         .toBuffer();

//       if (skipUpload) {
//         return {
//           primaryUrl: `[MOCK] ${url}`,
//           imgbbUrl: `[MOCK] ${url}`,
//           r2Url: `[MOCK] ${url}`,
//           cdnUrls: [],
//         };
//       }

//       const mimeType = response.headers.get('content-type') || 'image/webp';

//       const uploadPromises = adapters.map((adapter) =>
//         adapter
//           .upload(compressedBuffer, {
//             folder: 'products',
//             metadata: { mimeType },
//           })
//           .then((result: any) => ({
//             provider: adapter.constructor.name.replace('Adapter', '').toLowerCase(),
//             url: result.url,
//             id: result.id,
//           }))
//           .catch((err: any) => {
//             console.error(`❌ Upload failed for ${adapter.constructor.name}: ${err.message}`);
//             return null;
//           })
//       );

//       const results = await Promise.all(uploadPromises);
//       const validResults = results.filter((r) => r !== null);

//       if (validResults.length === 0) {
//         console.error(`❌ All uploads failed for ${url}`);
//         return null;
//       }

//       const primaryName = primaryAdapter.constructor.name.replace('Adapter', '').toLowerCase();
//       const primaryResult = validResults.find((r) => r.provider === primaryName) || validResults[0];

//       let imgbbUrl: string | null = null;
//       let r2Url: string | null = null;

//       for (const result of validResults) {
//         if (result.provider === 'imgbb') imgbbUrl = result.url;
//         if (result.provider === 'r2' || result.provider === 'cloudflare-r2') r2Url = result.url;
//       }

//       console.log(
//         `✅ Uploaded: ${primaryResult.url} ${validResults.length > 1 ? `(+ ${validResults.length - 1} other providers)` : ''}`
//       );

//       return {
//         primaryUrl: primaryResult.url,
//         imgbbUrl,
//         r2Url,
//         cdnUrls: [],
//       };
//     } catch (error: any) {
//       console.error(`❌ Failed to process ${url}: ${error.message}`);
//       return null;
//     }
//   }

//   // ================================================================
//   // 🚀 MAIN EXECUTION
//   // ================================================================
//   const args = process.argv.slice(2);

//   // --- Parse Arguments ---
//   const fileArg = args.find((arg) => arg.startsWith('--file='));
//   const providerArg = args.find((arg) => arg.startsWith('--provider='));
//   const primaryArg = args.find((arg) => arg.startsWith('--primary='));
//   const dualUpload = args.includes('--dual');
//   const outputArg = args.find((arg) => arg.startsWith('--output='));
//   const noUpload = args.includes('--no-upload');
//   const dryRun = args.includes('--dry-run');

//   // --- Validate File ---
//   if (!fileArg) {
//     console.error('❌ Usage: npm run import-products -- --file=path/to/file.csv');
//     console.error('   Options:');
//     console.error('     --provider=imgbb|r2|both   (Override provider selection)');
//     console.error('     --primary=imgbb|r2         (Which provider to use as primary)');
//     console.error('     --dual                     (Force dual upload)');
//     console.error('     --output=products.json     (JSON dump instead of DB insert)');
//     console.error('     --no-upload               (Skip actual uploads, use mocks)');
//     console.error('     --dry-run                 (Preview only)');
//     process.exit(1);
//   }

//   const filePath = fileArg.split('=')[1];
//   if (!fs.existsSync(filePath)) {
//     console.error(`❌ File not found: ${filePath}`);
//     process.exit(1);
//   }

//   // --- Provider Logic ---
//   let provider = providerArg?.split('=')[1] || process.env.DEFAULT_IMPORT_PROVIDER || 'imgbb';
//   const primaryProvider = primaryArg?.split('=')[1] || provider;
//   const isDual = dualUpload || provider === 'both';

//   console.log(`📸 Providers: ${isDual ? 'ImgBB + R2 (Dual)' : provider.toUpperCase()}`);
//   console.log(`🎯 Primary: ${primaryProvider.toUpperCase()}`);

//   // --- Output File ---
//   const outputFilePath = outputArg?.split('=')[1] || null;

//   console.log(`📂 Reading CSV: ${filePath}`);
//   const fileContent = fs.readFileSync(filePath, 'utf-8');

//   // --- 1. Parse CSV ---
//   const parseResult = Papa.parse(fileContent, {
//     header: true,
//     skipEmptyLines: true,
//     comments: '//',
//   });

//   const rawData: any[] = parseResult.data;
//   if (rawData.length === 0) {
//     console.error('❌ CSV is empty.');
//     process.exit(1);
//   }

//   // Group by product
//   const groups: any[][] = [];
//   let currentGroup: any[] = [];
//   for (const row of rawData) {
//     if (row.title && row.title.trim() !== '') {
//       if (currentGroup.length > 0) groups.push(currentGroup);
//       currentGroup = [row];
//     } else if (currentGroup.length > 0) {
//       currentGroup.push(row);
//     }
//   }
//   if (currentGroup.length > 0) groups.push(currentGroup);

//   console.log(`📊 Found ${groups.length} products.`);

//   if (dryRun) {
//     console.log('🧪 DRY RUN: Previewing first product:');
//     console.log(JSON.stringify(groups[0]?.[0] || {}, null, 2));
//     console.log('✅ Dry run completed. No data was inserted.');
//     process.exit(0);
//   }

//   // --- 2. Initialize Services ---
//   console.log('🔌 Connecting to Payload...');
//   const payload = await getSafePayload();

//   // ✅ LOCAL-ONLY: Settings fetch (No Redis)
//   console.log('📋 Fetching settings...');
//   const settings = await getLocalSettings();
//   const cdnMode = settings?.cdnMode ?? true;
//   console.log(`☁️ CDN Mode: ${cdnMode ? 'ON (Direct URLs only)' : 'OFF (Upload to providers)'}`);

//   // --- Initialize Adapters (Single or Dual) ---
//   console.log('🔌 Initializing Media Adapters...');

//   let adapters: any[] = [];
//   let primaryAdapter: any;

//   if (isDual && !cdnMode) {
//     const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
//     const { CloudflareR2Adapter } = await import('../src/lib/adapters/media/r2.adapter');

//     const imgbbApiKey = process.env.IMGBB_API_KEY;
//     if (!imgbbApiKey) {
//       console.warn('⚠️ IMGBB_API_KEY not set. ImgBB will be skipped.');
//     } else {
//       adapters.push(new ImgBBAdapter(imgbbApiKey));
//     }

//     const hasR2Env = !!(
//       process.env.R2_ACCOUNT_ID &&
//       process.env.R2_ACCESS_KEY_ID &&
//       process.env.R2_SECRET_ACCESS_KEY &&
//       process.env.R2_BUCKET_NAME &&
//       process.env.R2_PUBLIC_DOMAIN
//     );
//     if (!hasR2Env) {
//       console.warn('⚠️ R2 environment variables missing. R2 will be skipped.');
//     } else {
//       adapters.push(new CloudflareR2Adapter());
//     }

//     if (adapters.length === 0) {
//       throw new Error('No valid adapters available. Check your environment variables.');
//     }

//     const primaryName = primaryProvider.toLowerCase();
//     primaryAdapter = adapters.find(
//       (a) => a.constructor.name.replace('Adapter', '').toLowerCase() === primaryName
//     ) || adapters[0];

//     console.log(`🔌 Using ${adapters.length} adapters. Primary: ${primaryAdapter.constructor.name}`);
//   } else if (!cdnMode) {
//     const singleProvider = provider === 'r2' ? MediaProvider.R2 : MediaProvider.IMGBB;
    
//     if (singleProvider === MediaProvider.R2) {
//       const { CloudflareR2Adapter } = await import('../src/lib/adapters/media/r2.adapter');
//       primaryAdapter = new CloudflareR2Adapter();
//       adapters = [primaryAdapter];
//     } else {
//       const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
//       const apiKey = process.env.IMGBB_API_KEY;
//       if (!apiKey) throw new Error('IMGBB_API_KEY not set in .env');
//       primaryAdapter = new ImgBBAdapter(apiKey);
//       adapters = [primaryAdapter];
//     }
//     console.log(`🔌 Using single adapter: ${primaryAdapter.constructor.name}`);
//   } else {
//     console.log('☁️ CDN Mode ON: Skipping adapter initialization (no uploads will be performed).');
//     const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
//     const apiKey = process.env.IMGBB_API_KEY || 'dummy';
//     primaryAdapter = new ImgBBAdapter(apiKey);
//     adapters = [primaryAdapter];
//   }

//   // --- Pre-fetch categories & brands ---
//   console.log('📦 Pre-fetching existing categories and brands...');
//   const [categoriesResult, brandsResult] = await Promise.all([
//     payload.find({ collection: 'categories', limit: 1000 }),
//     payload.find({ collection: 'brands', limit: 1000 }),
//   ]);
//   const cachedCategories = categoriesResult.docs;
//   const cachedBrands = brandsResult.docs;

//   // --- 3. Process Products ---
//   console.log(`🖼️ Processing ${groups.length} products (${CONCURRENCY_LIMIT} concurrent)...`);
//   const productsToInsert: any[] = [];

//   for (let gIdx = 0; gIdx < groups.length; gIdx++) {
//     const group = groups[gIdx];
//     const parentData = group[0];
//     const variantRows = group.slice(1);

//     console.log(`\n📦 Product ${gIdx + 1}/${groups.length}: ${parentData.title}`);

//     // --- Brand Handling (Auto-Create) ---
//     let brandId: string | undefined = undefined;
//     if (parentData.brand?.trim()) {
//       brandId = await getOrCreateBrand(parentData.brand.trim(), payload, cachedBrands);
//     }

//     // --- Categories Handling (Auto-Create with Hierarchy) ---
//     const categoryIds: string[] = [];
//     if (parentData.categories) {
//       const categoryPaths = parentData.categories
//         .split(',')
//         .map((c: string) => c.trim())
//         .filter(Boolean);

//       for (const path of categoryPaths) {
//         try {
//           const catId = await getOrCreateCategory(path, payload, cachedCategories);
//           categoryIds.push(catId);
//         } catch (err: any) {
//           console.warn(`  ⚠️ Failed to create category "${path}": ${err.message}`);
//         }
//       }
//     }

//     // --- Variants + Images (Dual Upload with URL splitting + CDN Mode support) ---
//     const allVariantRows = [...variantRows];
//     if (hasVariantData(parentData)) {
//       if (!parentData.variant_name) parentData.variant_name = 'Standard';
//       allVariantRows.unshift(parentData);
//     }

//     const processedVariants = [];

//     for (const v of allVariantRows) {
//       if (hasVariantData(v)) {
//         const imageUrls = (v.variant_images || '')
//           .toString()
//           .split(',')
//           .map((u: string) => u.trim())
//           .filter(Boolean);

//         const imageUploadPromises = imageUrls.map((url: string) =>
//           processImage(url, parentData.slug || 'product', adapters, primaryAdapter, noUpload, cdnMode)
//         );
//         const resolvedImageResults = await Promise.all(imageUploadPromises);
//         const validResults = resolvedImageResults.filter(Boolean);

//         const imageObjects = validResults.map((result, idx) => {
//           if (cdnMode && result.cdnUrls.length > 0) {
//             return {
//               _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
//               url: result.cdnUrls[0],
//               cdnUrls: result.cdnUrls,
//               asset: {
//                 _ref: `cdn_${Date.now()}_${idx}`,
//                 _type: 'reference',
//               },
//             };
//           }

//           const imgObj: any = {
//             _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
//             url: result.primaryUrl,
//             imgbbUrl: result.imgbbUrl || null,
//             r2Url: result.r2Url || null,
//             asset: {
//               _ref: `local_${Date.now()}_${idx}`,
//               _type: 'reference',
//             },
//           };
//           return imgObj;
//         });

//         // ✅ ✅ ✅ ENTERPRISE FIX: CDN Mode — images vs cdnImages separation
//         let variantImages: any[] = [];
//         let variantCdnImages: any[] = [];

//         if (cdnMode) {
//           // CDN Mode: images empty, cdnImages populated
//           variantCdnImages = imageObjects.map((obj) => ({ url: obj.url }));
//           variantImages = [];
//         } else {
//           // Normal Mode: images populated, cdnImages empty
//           variantImages = imageObjects;
//           variantCdnImages = [];
//         }

//         const attributes = [];
//         if (v.attribute1_name && v.attribute1_value) {
//           attributes.push({
//             _key: generateKey(),
//             name: v.attribute1_name.toString().trim(),
//             value: v.attribute1_value.toString().trim(),
//           });
//         }
//         if (v.attribute2_name && v.attribute2_value) {
//           attributes.push({
//             _key: generateKey(),
//             name: v.attribute2_name.toString().trim(),
//             value: v.attribute2_value.toString().trim(),
//           });
//         }

//         processedVariants.push({
//           _key: generateKey(),
//           name: v.variant_name || 'Standard',
//           sku: v.variant_sku || '',
//           price: safeFloat(v.variant_price),
//           salePrice: v.variant_salePrice ? safeFloat(v.variant_salePrice) : undefined,
//           stock: safeInt(v.variant_stock),
//           inStock:
//             v.variant_inStock !== undefined
//               ? String(v.variant_inStock).toLowerCase() === 'true'
//               : safeInt(v.variant_stock) > 0,
//           images: variantImages,        // ✅ Normal Mode: uploaded images
//           cdnImages: variantCdnImages,   // ✅ CDN Mode: direct URLs
//           weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
//           dimensions: v.variant_height || v.variant_width
//             ? {
//                 height: safeFloat(v.variant_height),
//                 width: safeFloat(v.variant_width),
//                 depth: safeFloat(v.variant_depth),
//               }
//             : undefined,
//           attributes,
//         });
//       }
//     }

//     if (processedVariants.length === 0) {
//       console.warn(`  ⚠️ Skipping ${parentData.title}: No valid variants.`);
//       continue;
//     }

//     // Build Product Document
//     const productDoc = {
//       title: parentData.title,
//       slug: parentData.slug || generateSlug(parentData.title),
//       videoUrl: parentData.videoUrl || '',
//       description: {
//         root: {
//           type: 'root',
//           children: [
//             {
//               type: 'paragraph',
//               children: [{ type: 'text', text: parentData.description || '', version: 1 }],
//               version: 1,
//               direction: 'ltr' as const,
//               format: '' as const,
//               indent: 0,
//             },
//           ],
//           direction: 'ltr' as const,
//           format: '' as const,
//           indent: 0,
//           version: 1,
//         },
//       },
//       specifications: parentData.specifications
//         ? parentData.specifications
//             .split('|')
//             .map((item: string) => {
//               const parts = item.split(':');
//               return parts.length >= 2
//                 ? { label: parts[0].trim(), value: parts.slice(1).join(':').trim() }
//                 : { label: 'Feature', value: item.trim() };
//             })
//         : [],
//       brand: brandId,
//       categories: categoryIds,
//       isBestSeller: String(parentData.isBestSeller || '').toLowerCase() === 'true',
//       isNewArrival: String(parentData.isNewArrival || '').toLowerCase() === 'true',
//       isFeatured: String(parentData.isFeatured || '').toLowerCase() === 'true',
//       isOnDeal: String(parentData.isOnDeal || '').toLowerCase() === 'true',
//       rating: safeFloat(parentData.rating),
//       variants: processedVariants,
//     };

//     productsToInsert.push(productDoc);
//   }

//   // --- 4. Output or Insert ---
//   if (outputFilePath) {
//     console.log(`\n💾 Writing ${productsToInsert.length} products to ${outputFilePath}...`);
//     fs.writeFileSync(outputFilePath, JSON.stringify(productsToInsert, null, 2));
//     console.log('✅ JSON dump complete!');
//     console.log('📌 Next steps:');
//     console.log('   1. Open MongoDB Compass');
//     console.log('   2. Connect to your live Atlas cluster');
//     console.log('   3. Go to "products" collection');
//     console.log('   4. Click "Add Data" -> "Import JSON"');
//     console.log(`   5. Select "${outputFilePath}" and import.`);
//     console.log('   (Alternatively, use mongoimport: mongoimport --uri=<ATLAS_URI> --collection=products --file=products.json)');
//   } else {
//     console.log(`\n💾 Inserting ${productsToInsert.length} products into Payload...`);
//     let successCount = 0;
//     let failCount = 0;

//     for (let i = 0; i < productsToInsert.length; i += DB_BATCH_SIZE) {
//       const batch = productsToInsert.slice(i, i + DB_BATCH_SIZE);
//       console.log(`📦 Inserting batch ${Math.floor(i / DB_BATCH_SIZE) + 1}/${Math.ceil(productsToInsert.length / DB_BATCH_SIZE)}...`);

//       const results = await Promise.allSettled(
//         batch.map((productData) =>
//           payload.create({
//             collection: 'products',
//             data: productData,
//           })
//         )
//       );

//       for (const result of results) {
//         if (result.status === 'fulfilled') {
//           successCount++;
//         } else {
//           failCount++;
//           console.error('❌ Product creation failed:', result.reason?.message);
//         }
//       }
//     }

//     console.log(`\n🎉 Import Complete!`);
//     console.log(`   ✅ Success: ${successCount}`);
//     console.log(`   ❌ Failed: ${failCount}`);
//     console.log(`   📊 Total: ${productsToInsert.length}`);
//     console.log(`   📸 Uploaded to: ${cdnMode ? 'CDN Mode (No Uploads)' : adapters.map((a) => a.constructor.name.replace('Adapter', '').toLowerCase()).join(', ')}`);
//     console.log(`   🎯 Primary: ${cdnMode ? 'CDN Mode' : primaryAdapter.constructor.name.replace('Adapter', '').toLowerCase()}`);
//   }
// };

// // ✅ 5. Execute main function
// main().catch((error) => {
//   console.error('💀 Fatal Error:', error);
//   process.exit(1);
// });
// scripts/import-products-cli.ts

// ✅ 1. Sab se pehle .env.local load karein
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ✅ 2. Agar Redis credentials missing hain toh dummy set karein (fallback)
if (!process.env.UPSTASH_REDIS_REST_URL) {
  process.env.UPSTASH_REDIS_REST_URL = 'https://dummy.upstash.io';
}
if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  process.env.UPSTASH_REDIS_REST_TOKEN = 'dummy';
}

// ✅ 3. Ab saare dependencies dynamically import karein (runtime par load hoga)
const main = async () => {
  const [
    { default: fs },
    { default: Papa },
    { default: sharp },
    { getSafePayload },
    { MediaProvider },
  ] = await Promise.all([
    import('fs'),
    import('papaparse'),
    import('sharp'),
    import('../src/app/shared/lib/payloadInstance'),
    import('../src/lib/adapters/media/types'),
  ]);

  // ✅ 4. Redis mock override (ensure rate-limiter doesn't throw)
  const mockRedis = {
    get: async () => null,
    set: async () => {},
    incr: async () => 1,
    expire: async () => {},
    del: async () => {},
    keys: async () => [],
    pipeline: () => ({ del: () => {}, exec: async () => {} }),
    setnx: async () => true,
    eval: async () => 1,
    sadd: async () => {},
    srem: async () => {},
    smembers: async () => [],
    hset: async () => {},
    hget: async () => null,
    hgetall: async () => ({}),
  };
  // @ts-ignore
  global.redis = mockRedis;

  // ================================================================
  // 🛠️ LOCAL SETTINGS FETCH (No Redis)
  // ================================================================
  async function getLocalSettings() {
    try {
      const payload = await getSafePayload();
      const settings = await payload.findGlobal({ slug: 'settings' });
      return settings;
    } catch (error) {
      console.warn('⚠️ Failed to fetch settings from Payload. Using defaults.');
      return { cdnMode: true };
    }
  }

  // ================================================================
  // 🛠️ HELPER: Get or Create Category with Hierarchy
  // ================================================================
  async function getOrCreateCategory(
    categoryPath: string,
    payload: any,
    cachedCategories: any[]
  ): Promise<string> {
    // Split by ">" or "|" or "/" to get hierarchy
    const parts = categoryPath
      .split(/\s*[>|/]\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      throw new Error(`Invalid category path: ${categoryPath}`);
    }

    let parentId: string | null = null;
    let lastCreatedId: string | null = null;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      // Check if category exists in cache
      let found = cachedCategories.find(
        (c: any) =>
          c.name.toLowerCase() === name.toLowerCase() ||
          c.slug === slug
      );

      // If not found, create it
      if (!found) {
        console.log(`  ➕ Creating category: ${name} ${parentId ? `(parent: ${parentId})` : '(root)'}`);
        const newCategory = await payload.create({
          collection: 'categories',
          data: {
            name: name,
            slug: slug,
            parent: parentId,
          },
        });
        found = newCategory;
        cachedCategories.push(newCategory);
      }

      parentId = found.id;
      lastCreatedId = found.id;
    }

    return lastCreatedId!;
  }

  // ================================================================
  // 🛠️ HELPER: Get or Create Brand
  // ================================================================
  async function getOrCreateBrand(
    brandName: string,
    payload: any,
    cachedBrands: any[]
  ): Promise<string> {
    const cleanName = brandName.trim();
    const slug = cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    let found = cachedBrands.find(
      (b: any) => b.name.toLowerCase() === cleanName.toLowerCase() || b.slug === slug
    );

    if (!found) {
      console.log(`  ➕ Creating brand: ${cleanName}`);
      const newBrand = await payload.create({
        collection: 'brands',
        data: {
          name: cleanName,
          slug: slug,
        },
      });
      found = newBrand;
      cachedBrands.push(newBrand);
    }

    return found.id;
  }

  // ================================================================
  // 🛠️ CONFIGURATION
  // ================================================================
  const CONCURRENCY_LIMIT = 20;
  const DB_BATCH_SIZE = 50;

  // ================================================================
  // 🛠️ HELPERS
  // ================================================================
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

  const hasVariantData = (row: any): boolean => {
    const hasName = row.variant_name?.toString().trim() !== '';
    const hasSku = row.variant_sku?.toString().trim() !== '';
    const hasPrice = row.variant_price?.toString().trim() !== '';
    return hasName || hasSku || hasPrice;
  };

  // ================================================================
  // 🖼️ IMAGE PROCESSING
  // ================================================================
  async function processImage(
    url: string,
    _slug: string,
    adapters: any[],
    primaryAdapter: any,
    skipUpload: boolean = false,
    cdnMode: boolean = false
  ): Promise<{ primaryUrl: string; imgbbUrl: string | null; r2Url: string | null; cdnUrls: string[] } | null> {
    if (cdnMode) {
      console.log(`☁️ CDN Mode: Skipping upload for ${url}`);
      return {
        primaryUrl: url,
        imgbbUrl: null,
        r2Url: null,
        cdnUrls: [url],
      };
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch ${url}: HTTP ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const compressedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();

      if (skipUpload) {
        return {
          primaryUrl: `[MOCK] ${url}`,
          imgbbUrl: `[MOCK] ${url}`,
          r2Url: `[MOCK] ${url}`,
          cdnUrls: [],
        };
      }

      const mimeType = response.headers.get('content-type') || 'image/webp';

      const uploadPromises = adapters.map((adapter) =>
        adapter
          .upload(compressedBuffer, {
            folder: 'products',
            metadata: { mimeType },
          })
          .then((result: any) => ({
            provider: adapter.constructor.name.replace('Adapter', '').toLowerCase(),
            url: result.url,
            id: result.id,
          }))
          .catch((err: any) => {
            console.error(`❌ Upload failed for ${adapter.constructor.name}: ${err.message}`);
            return null;
          })
      );

      const results = await Promise.all(uploadPromises);
      const validResults = results.filter((r) => r !== null);

      if (validResults.length === 0) {
        console.error(`❌ All uploads failed for ${url}`);
        return null;
      }

      const primaryName = primaryAdapter.constructor.name.replace('Adapter', '').toLowerCase();
      const primaryResult = validResults.find((r) => r.provider === primaryName) || validResults[0];

      let imgbbUrl: string | null = null;
      let r2Url: string | null = null;

      for (const result of validResults) {
        if (result.provider === 'imgbb') imgbbUrl = result.url;
        if (result.provider === 'r2' || result.provider === 'cloudflare-r2') r2Url = result.url;
      }

      console.log(
        `✅ Uploaded: ${primaryResult.url} ${validResults.length > 1 ? `(+ ${validResults.length - 1} other providers)` : ''}`
      );

      return {
        primaryUrl: primaryResult.url,
        imgbbUrl,
        r2Url,
        cdnUrls: [],
      };
    } catch (error: any) {
      console.error(`❌ Failed to process ${url}: ${error.message}`);
      return null;
    }
  }

  // ================================================================
  // 🚀 MAIN EXECUTION
  // ================================================================
  const args = process.argv.slice(2);

  // --- Parse Arguments ---
  const fileArg = args.find((arg) => arg.startsWith('--file='));
  const providerArg = args.find((arg) => arg.startsWith('--provider='));
  const primaryArg = args.find((arg) => arg.startsWith('--primary='));
  const dualUpload = args.includes('--dual');
  const outputArg = args.find((arg) => arg.startsWith('--output='));
  const noUpload = args.includes('--no-upload');
  const dryRun = args.includes('--dry-run');

  // --- Validate File ---
  if (!fileArg) {
    console.error('❌ Usage: npm run import-products -- --file=path/to/file.csv');
    console.error('   Options:');
    console.error('     --provider=imgbb|r2|both   (Override provider selection)');
    console.error('     --primary=imgbb|r2         (Which provider to use as primary)');
    console.error('     --dual                     (Force dual upload)');
    console.error('     --output=products.json     (JSON dump instead of DB insert)');
    console.error('     --no-upload               (Skip actual uploads, use mocks)');
    console.error('     --dry-run                 (Preview only)');
    process.exit(1);
  }

  const filePath = fileArg.split('=')[1];
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // --- Provider Logic ---
  let provider = providerArg?.split('=')[1] || process.env.DEFAULT_IMPORT_PROVIDER || 'imgbb';
  const primaryProvider = primaryArg?.split('=')[1] || provider;
  const isDual = dualUpload || provider === 'both';

  console.log(`📸 Providers: ${isDual ? 'ImgBB + R2 (Dual)' : provider.toUpperCase()}`);
  console.log(`🎯 Primary: ${primaryProvider.toUpperCase()}`);

  // --- Output File ---
  const outputFilePath = outputArg?.split('=')[1] || null;

  console.log(`📂 Reading CSV: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // --- 1. Parse CSV ---
  const parseResult = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    comments: '//',
  });

  const rawData: any[] = parseResult.data;
  if (rawData.length === 0) {
    console.error('❌ CSV is empty.');
    process.exit(1);
  }

  // Group by product
  const groups: any[][] = [];
  let currentGroup: any[] = [];
  for (const row of rawData) {
    if (row.title && row.title.trim() !== '') {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [row];
    } else if (currentGroup.length > 0) {
      currentGroup.push(row);
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  console.log(`📊 Found ${groups.length} products.`);

  if (dryRun) {
    console.log('🧪 DRY RUN: Previewing first product:');
    console.log(JSON.stringify(groups[0]?.[0] || {}, null, 2));
    console.log('✅ Dry run completed. No data was inserted.');
    process.exit(0);
  }

  // --- 2. Initialize Services ---
  console.log('🔌 Connecting to Payload...');
  const payload = await getSafePayload();

  // ✅ LOCAL-ONLY: Settings fetch (No Redis)
  console.log('📋 Fetching settings...');
  const settings = await getLocalSettings();
  const cdnMode = settings?.cdnMode ?? true;
  console.log(`☁️ CDN Mode: ${cdnMode ? 'ON (Direct URLs only)' : 'OFF (Upload to providers)'}`);

  // --- Initialize Adapters (Single or Dual) ---
  console.log('🔌 Initializing Media Adapters...');

  let adapters: any[] = [];
  let primaryAdapter: any;

  if (isDual && !cdnMode) {
    const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
    const { CloudflareR2Adapter } = await import('../src/lib/adapters/media/r2.adapter');

    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      console.warn('⚠️ IMGBB_API_KEY not set. ImgBB will be skipped.');
    } else {
      adapters.push(new ImgBBAdapter(imgbbApiKey));
    }

    const hasR2Env = !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_DOMAIN
    );
    if (!hasR2Env) {
      console.warn('⚠️ R2 environment variables missing. R2 will be skipped.');
    } else {
      adapters.push(new CloudflareR2Adapter());
    }

    if (adapters.length === 0) {
      throw new Error('No valid adapters available. Check your environment variables.');
    }

    const primaryName = primaryProvider.toLowerCase();
    primaryAdapter = adapters.find(
      (a) => a.constructor.name.replace('Adapter', '').toLowerCase() === primaryName
    ) || adapters[0];

    console.log(`🔌 Using ${adapters.length} adapters. Primary: ${primaryAdapter.constructor.name}`);
  } else if (!cdnMode) {
    const singleProvider = provider === 'r2' ? MediaProvider.R2 : MediaProvider.IMGBB;
    
    if (singleProvider === MediaProvider.R2) {
      const { CloudflareR2Adapter } = await import('../src/lib/adapters/media/r2.adapter');
      primaryAdapter = new CloudflareR2Adapter();
      adapters = [primaryAdapter];
    } else {
      const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) throw new Error('IMGBB_API_KEY not set in .env');
      primaryAdapter = new ImgBBAdapter(apiKey);
      adapters = [primaryAdapter];
    }
    console.log(`🔌 Using single adapter: ${primaryAdapter.constructor.name}`);
  } else {
    console.log('☁️ CDN Mode ON: Skipping adapter initialization (no uploads will be performed).');
    const { ImgBBAdapter } = await import('../src/lib/adapters/media/imgbb.adapter');
    const apiKey = process.env.IMGBB_API_KEY || 'dummy';
    primaryAdapter = new ImgBBAdapter(apiKey);
    adapters = [primaryAdapter];
  }

  // --- Pre-fetch categories & brands ---
  console.log('📦 Pre-fetching existing categories and brands...');
  const [categoriesResult, brandsResult] = await Promise.all([
    payload.find({ collection: 'categories', limit: 1000 }),
    payload.find({ collection: 'brands', limit: 1000 }),
  ]);
  const cachedCategories = categoriesResult.docs;
  const cachedBrands = brandsResult.docs;

  // --- 3. Process Products ---
  console.log(`🖼️ Processing ${groups.length} products (${CONCURRENCY_LIMIT} concurrent)...`);
  const productsToInsert: any[] = [];

  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    const parentData = group[0];
    const variantRows = group.slice(1);

    console.log(`\n📦 Product ${gIdx + 1}/${groups.length}: ${parentData.title}`);

    // --- Brand Handling (Auto-Create) ---
    let brandId: string | undefined = undefined;
    if (parentData.brand?.trim()) {
      brandId = await getOrCreateBrand(parentData.brand.trim(), payload, cachedBrands);
    }

    // --- Categories Handling (Auto-Create with Hierarchy) ---
    const categoryIds: string[] = [];
    if (parentData.categories) {
      // ✅ ENTERPRISE UPGRADE: Support both comma and semicolon splitters for CLI categories import
      const categoryPaths = parentData.categories
        .split(/[;,]/)
        .map((c: string) => c.trim())
        .filter(Boolean);

      for (const path of categoryPaths) {
        try {
          const catId = await getOrCreateCategory(path, payload, cachedCategories);
          categoryIds.push(catId);
        } catch (err: any) {
          console.warn(`  ⚠️ Failed to create category "${path}": ${err.message}`);
        }
      }
    }

    // --- Variants + Images (Dual Upload with URL splitting + CDN Mode support) ---
    const allVariantRows = [...variantRows];
    if (hasVariantData(parentData)) {
      if (!parentData.variant_name) parentData.variant_name = 'Standard';
      allVariantRows.unshift(parentData);
    }

    const processedVariants = [];

    for (const v of allVariantRows) {
      if (hasVariantData(v)) {
        // ✅ ENTERPRISE UPGRADE: Support both comma and semicolon splitters for CLI variant images import
        const imageUrls = (v.variant_images || '')
          .toString()
          .split(/[;,]/)
          .map((u: string) => u.trim())
          .filter(Boolean);

        const imageUploadPromises = imageUrls.map((url: string) =>
          processImage(url, parentData.slug || 'product', adapters, primaryAdapter, noUpload, cdnMode)
        );
        const resolvedImageResults = await Promise.all(imageUploadPromises);
        const validResults = resolvedImageResults.filter(Boolean);

        const imageObjects = validResults.map((result, idx) => {
          if (cdnMode && result.cdnUrls.length > 0) {
            return {
              _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
              url: result.cdnUrls[0],
              cdnUrls: result.cdnUrls,
              asset: {
                _ref: `cdn_${Date.now()}_${idx}`,
                _type: 'reference',
              },
            };
          }

          const imgObj: any = {
            _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`,
            url: result.primaryUrl,
            imgbbUrl: result.imgbbUrl || null,
            r2Url: result.r2Url || null,
            asset: {
              _ref: `local_${Date.now()}_${idx}`,
              _type: 'reference',
            },
          };
          return imgObj;
        });

        // ✅ ✅ ✅ ENTERPRISE FIX: CDN Mode — images vs cdnImages separation
        let variantImages: any[] = [];
        let variantCdnImages: any[] = [];

        if (cdnMode) {
          // CDN Mode: images empty, cdnImages populated
          variantCdnImages = imageObjects.map((obj) => ({ url: obj.url }));
          variantImages = [];
        } else {
          // Normal Mode: images populated, cdnImages empty
          variantImages = imageObjects;
          variantCdnImages = [];
        }

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

        processedVariants.push({
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
          images: variantImages,        // ✅ Normal Mode: uploaded images
          cdnImages: variantCdnImages,   // ✅ CDN Mode: direct URLs
          weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
          dimensions: v.variant_height || v.variant_width
            ? {
                height: safeFloat(v.variant_height),
                width: safeFloat(v.variant_width),
                depth: safeFloat(v.variant_depth),
              }
            : undefined,
          attributes,
        });
      }
    }

    if (processedVariants.length === 0) {
      console.warn(`  ⚠️ Skipping ${parentData.title}: No valid variants.`);
      continue;
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
      variants: processedVariants,
    };

    productsToInsert.push(productDoc);
  }

  // --- 4. Output or Insert ---
  if (outputFilePath) {
    console.log(`\n💾 Writing ${productsToInsert.length} products to ${outputFilePath}...`);
    fs.writeFileSync(outputFilePath, JSON.stringify(productsToInsert, null, 2));
    console.log('✅ JSON dump complete!');
    console.log('📌 Next steps:');
    console.log('   1. Open MongoDB Compass');
    console.log('   2. Connect to your live Atlas cluster');
    console.log('   3. Go to "products" collection');
    console.log('   4. Click "Add Data" -> "Import JSON"');
    console.log(`   5. Select "${outputFilePath}" and import.`);
    console.log('   (Alternatively, use mongoimport: mongoimport --uri=<ATLAS_URI> --collection=products --file=products.json)');
  } else {
    console.log(`\n💾 Inserting ${productsToInsert.length} products into Payload...`);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < productsToInsert.length; i += DB_BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + DB_BATCH_SIZE);
      console.log(`📦 Inserting batch ${Math.floor(i / DB_BATCH_SIZE) + 1}/${Math.ceil(productsToInsert.length / DB_BATCH_SIZE)}...`);

      const results = await Promise.allSettled(
        batch.map((productData) =>
          payload.create({
            collection: 'products',
            data: productData,
          })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failCount++;
          console.error('❌ Product creation failed:', result.reason?.message);
        }
      }
    }

    console.log(`\n🎉 Import Complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📊 Total: ${productsToInsert.length}`);
    console.log(`   📸 Uploaded to: ${cdnMode ? 'CDN Mode (No Uploads)' : adapters.map((a) => a.constructor.name.replace('Adapter', '').toLowerCase()).join(', ')}`);
    console.log(`   🎯 Primary: ${cdnMode ? 'CDN Mode' : primaryAdapter.constructor.name.replace('Adapter', '').toLowerCase()}`);
  }
};

// ✅ 5. Execute main function
main().catch((error) => {
  console.error('💀 Fatal Error:', error);
  process.exit(1);
});