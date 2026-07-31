// // 📂 src/sanity/lib/payload/homepage.queries.ts

// import { Where } from "payload";
// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { mapPayloadProductToSanity } from "./plp/productMapper";
// import { unstable_cache } from "next/cache";

// // ================================================================
// // 🔧 HELPER: Batch fetch reviews for multiple product IDs
// // ================================================================
// const getReviewsForProducts = async (productIds: string[]) => {
//   if (!productIds || productIds.length === 0) return new Map();
  
//   try {
//     const payload = await getSafePayload();
//     const result = await payload.find({
//       collection: "reviews",
//       where: {
//         product: { in: productIds },
//         isApproved: { equals: true }
//       },
//       depth: 1,
//       sort: "-createdAt",
//     });

//     // Group reviews by productId
//     const reviewsMap = new Map<string, any[]>();
//     result.docs.forEach((review: any) => {
//       const productId = review.product?.id || review.product;
//       if (!productId) return;
//       if (!reviewsMap.has(productId)) {
//         reviewsMap.set(productId, []);
//       }
//       reviewsMap.get(productId)!.push(review);
//     });
    
//     return reviewsMap;
//   } catch (error) {
//     console.error("❌ Failed to fetch batch reviews:", error);
//     return new Map();
//   }
// };

// // ================================================================
// // 🚀 CACHED HOMEPAGE DATA (with Graceful Error Handling)
// // ================================================================
// const getCachedHomepageData = unstable_cache(
//   async () => {
//     try {
//       const payload = await getSafePayload();

//       const homepage = await payload.findGlobal({
//         slug: "homepage",
//         depth: 2,
//       });
      
//       if (!homepage || !homepage.pageSections) {
//         return { pageSections: [], seo: null };
//       }

//       // ================================================================
//       // 1. COLLECT ALL PRODUCT IDs FROM ALL SECTIONS
//       // ================================================================
//       const allProductIds: string[] = [];

//       // ================================================================
//       // 2. RESOLVE SECTIONS (First Pass - Collect IDs)
//       // ================================================================
//       const resolvedSections = await Promise.all(
//         homepage.pageSections.map(async (block: any) => {
//           const baseBlock = {
//             ...block,
//             _type: block.blockType,
//             _key: block.id || Math.random().toString(),
//           };

//           // === 1. BANNER SECTION ===
//           if (block.blockType === "bannerSection") {
//             baseBlock.banners = block.banners?.map((b: any) => ({
//               ...b,
//               desktopImage: b.desktopImage?.url || "",
//               mobileImage: b.mobileImage?.url || b.desktopImage?.url || "",
//             }));
//             return baseBlock;
//           }

//           // === 2. DEAL SECTION ===
//           if (block.blockType === "dealSection") {
//             baseBlock.sideBanner =
//               block.showSideBanner && block.sideBanner?.image
//                 ? {
//                     image: block.sideBanner.image.url,
//                     link: block.sideBanner.link,
//                   }
//                 : null;
            
//             baseBlock.enableTimer = block.enableTimer || false;
//             baseBlock.endTime = block.endTime
//               ? new Date(block.endTime).toISOString()
//               : undefined;

//             let products: any[] = [];
//             if (block.fetchStrategy === "manual" && block.manualProducts) {
//               products = block.manualProducts;
//             } else if (
//               block.fetchStrategy === "campaign" &&
//               block.selectedCampaign
//             ) {
//               const res = await payload.find({
//                 collection: "products",
//                 where: { activeCampaigns: { in: [block.selectedCampaign.id] } },
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             } else if (
//               block.fetchStrategy === "category" &&
//               block.selectedCategory
//             ) {
//               const res = await payload.find({
//                 collection: "products",
//                 where: { categories: { in: [block.selectedCategory.id] } },
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             } else if (block.fetchStrategy === "tag" && block.tagType) {
//               let tagCondition: Where = {};
//               if (block.tagType === "newArrivals")
//                 tagCondition = { isNewArrival: { equals: true } };
//               else if (block.tagType === "bestSellers")
//                 tagCondition = { isBestSeller: { equals: true } };
//               else tagCondition = { isFeatured: { equals: true } };

//               const res = await payload.find({
//                 collection: "products",
//                 where: tagCondition,
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             }

//             // Collect product IDs for batch review fetching
//             products.forEach((p: any) => {
//               if (p.id) allProductIds.push(p.id);
//             });

//             baseBlock.products = products;
//             return baseBlock;
//           }

//           // === 3. PRODUCT SHOWCASE ===
//           if (block.blockType === "productShowcase") {
//             baseBlock.sideBanner =
//               block.showSideBanner && block.sideBanner?.image
//                 ? {
//                     image: block.sideBanner.image.url,
//                     link: block.sideBanner.link,
//                   }
//                 : null;

//             let products: any[] = [];
//             if (block.type === "manual" && block.manualProducts) {
//               products = block.manualProducts;
//             } else if (block.type === "newest") {
//               const res = await payload.find({
//                 collection: "products",
//                 sort: "-createdAt",
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             } else if (block.type === "best-selling") {
//               const res = await payload.find({
//                 collection: "products",
//                 where: { isBestSeller: { equals: true } },
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             } else if (block.type === "featured") {
//               const res = await payload.find({
//                 collection: "products",
//                 where: { isFeatured: { equals: true } },
//                 limit: 12,
//                 depth: 2,
//               });
//               products = res.docs;
//             }

//             // Collect product IDs for batch review fetching
//             products.forEach((p: any) => {
//               if (p.id) allProductIds.push(p.id);
//             });

//             baseBlock.products = products;
//             return baseBlock;
//           }
          
//           // === 4. CATEGORY SHOWCASE ===
//           if (block.blockType === "categoryShowcase") {
//             baseBlock.categories = block.categories?.map(
//               (c: any, index: number) => ({
//                 _id: c.id ? String(c.id) : `category-showcase-id-${index}`,
//                 name: c.name,
//                 slug: c.slug,
//                 image: c.image?.url, 
//               }),
//             );
//             return baseBlock;
//           }

//           // === 5. CATEGORY GRID ===
//           if (block.blockType === "categoryGrid") {
//             baseBlock.items = block.items?.map((item: any, itemIndex: number) => ({
//               discountText: item.discountText,
//               category: item.category 
//                 ? {
//                     _id: item.category.id
//                       ? String(item.category.id)
//                       : `category-grid-id-${itemIndex}`,
//                     name: item.category.name,
//                     slug: item.category.slug,
//                     image: item.category.image?.url, 
//                   }
//                 : null,
//             }));
//             return baseBlock;
//           }

//           // === 6. COUPON SECTION ===
//           if (block.blockType === "couponSection" && block.couponReference) {
//             const ref = block.couponReference;
//             baseBlock.couponReference = {
//               mediaType: ref.mediaType,
//               mediaUrls: {
//                 mobile: { asset: { url: ref.mediaUrls?.mobile?.url } },
//                 tablet: { asset: { url: ref.mediaUrls?.tablet?.url } },
//                 desktop: { asset: { url: ref.mediaUrls?.desktop?.url } },
//               },
//               width: ref.width,
//               height: ref.height,
//               objectFit: ref.objectFit,
//               altText: ref.altText,
//               link: ref.link ? { _type: "reference", slug: ref.link.slug } : null,
//             };
//             return baseBlock;
//           }

//           // === 7. BRAND SECTION ===
//           if (block.blockType === "brandSection") {
//             baseBlock.manualBrands = block.manualBrands
//               ?.map((b: any, index: number) => {
//                 const brandId = b.id ? String(b.id) : `brand-fallback-id-${index}`;

//                 return {
//                   _id: brandId,
//                   name: b.name,
//                   slug: b.slug,
//                   logo:
//                     b.logo?.id && b.logo?.url
//                       ? {
//                           _type: "image",
//                           asset: {
//                             _ref: String(b.logo.id), 
//                             _type: "reference",
//                           },
//                           url: b.logo.url,
//                         }
//                       : undefined,
//                 };
//               })
//               .filter(Boolean);
//             return baseBlock;
//           }

//           // === 8. LAYOUT SECTION (Infinite Grid) ===
//           if (block.blockType === "layoutSection") {
//             if (block.type === "infiniteGrid") {
//               const res = await payload.find({
//                 collection: "products",
//                 sort: "-createdAt",
//                 limit: 40,
//                 depth: 2,
//               });
              
//               // Collect product IDs for batch review fetching
//               res.docs.forEach((p: any) => {
//                 if (p.id) allProductIds.push(p.id);
//               });
              
//               baseBlock.initialProducts = res.docs;
//             }
//             return baseBlock;
//           }

//           return baseBlock;
//         }),
//       );

//       // ================================================================
//       // 3. BATCH FETCH ALL REVIEWS (SINGLE QUERY) 🚀 N+1 FIX
//       // ================================================================
//       let reviewsMap = new Map<string, any[]>();
//       if (allProductIds.length > 0) {
//         const uniqueProductIds = [...new Set(allProductIds)];
//         reviewsMap = await getReviewsForProducts(uniqueProductIds);
//         console.log(`✅ [Homepage] Fetched reviews for ${uniqueProductIds.length} products in 1 query.`);
//       }

//       // ================================================================
//       // 4. MAP PRODUCTS TO SANITY FORMAT (SECOND PASS)
//       // ================================================================
//       const finalSections = resolvedSections.map((section: any) => {
//         // If section has products array, map them with reviews
//         if (section.products && Array.isArray(section.products)) {
//           section.products = section.products.map((p: any) => {
//             const reviews = reviewsMap.get(p.id) || [];
//             return mapPayloadProductToSanity(p, reviews);
//           });
//         }
//         // If section has initialProducts (infinite grid), map them
//         if (section.initialProducts && Array.isArray(section.initialProducts)) {
//           section.initialProducts = section.initialProducts.map((p: any) => {
//             const reviews = reviewsMap.get(p.id) || [];
//             return mapPayloadProductToSanity(p, reviews);
//           });
//         }
//         return section;
//       });

//       return { 
//         pageSections: finalSections, 
//         seo: homepage.seo || null 
//       };
      
//     } catch (error) {
//       // ✅ ENTERPRISE FIX: Graceful failure — return empty sections if homepage fails
//       console.error("❌ Failed to fetch homepage data from Payload:", error);
//       return { pageSections: [], seo: null };
//     }
//   },
//   ["homepage-data"],
//   { 
//     tags: ["homepage", "homepage-data"],
//     revalidate: false
//   }
// );

// // ================================================================
// // 🚀 MAIN EXPORT
// // ================================================================
// export const getPayloadHomepageData = async () => {
//   return await getCachedHomepageData();
// };
// 📂 src/sanity/lib/payload/homepage.queries.ts

import { Where } from "payload";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { mapPayloadProductToSanity } from "./plp/productMapper";
import { unstable_cache } from "next/cache";

// ================================================================
// 🔧 HELPER: Batch fetch reviews for multiple product IDs
// ================================================================
const getReviewsForProducts = async (productIds: string[]) => {
  if (!productIds || productIds.length === 0) return new Map();

  try {
    const payload = await getSafePayload();
    const result = await payload.find({
      collection: "reviews",
      where: {
        product: { in: productIds },
        isApproved: { equals: true },
      },
      depth: 1,
      sort: "-createdAt",
    });

    const reviewsMap = new Map<string, any[]>();
    result.docs.forEach((review: any) => {
      const productId = review.product?.id || review.product;
      if (!productId) return;
      if (!reviewsMap.has(productId)) {
        reviewsMap.set(productId, []);
      }
      reviewsMap.get(productId)!.push(review);
    });

    return reviewsMap;
  } catch (error) {
    console.error("❌ Failed to fetch batch reviews:", error);
    return new Map();
  }
};

// ================================================================
// 🚀 CACHED HOMEPAGE DATA (with Graceful Error Handling)
// ================================================================
const getCachedHomepageData = unstable_cache(
  async () => {
    try {
      const payload = await getSafePayload();

      const homepage = await payload.findGlobal({
        slug: "homepage",
        depth: 2,
      });

      if (!homepage || !homepage.pageSections) {
        return { pageSections: [], seo: null };
      }

      const allProductIds: string[] = [];

      const resolvedSections = await Promise.all(
        homepage.pageSections.map(async (block: any) => {
          const baseBlock = {
            ...block,
            _type: block.blockType,
            _key: block.id || Math.random().toString(),
          };

          // ================================================================
          // 1. BANNER SECTION
          // ================================================================
          if (block.blockType === "bannerSection") {
            baseBlock.banners = block.banners?.map((b: any) => ({
              ...b,
              desktopImage: b.desktopImage?.url || "",
              mobileImage: b.mobileImage?.url || b.desktopImage?.url || "",
            }));
            return baseBlock;
          }

          // ================================================================
          // 2. DEAL SECTION
          // ================================================================
          if (block.blockType === "dealSection") {
            baseBlock.sideBanner =
              block.showSideBanner && block.sideBanner?.image
                ? {
                    image: block.sideBanner.image.url,
                    link: block.sideBanner.link,
                  }
                : null;

            baseBlock.enableTimer = block.enableTimer || false;
            baseBlock.endTime = block.endTime
              ? new Date(block.endTime).toISOString()
              : undefined;

            let products: any[] = [];
            if (block.fetchStrategy === "manual" && block.manualProducts) {
              products = block.manualProducts;
            } else if (
              block.fetchStrategy === "campaign" &&
              block.selectedCampaign
            ) {
              const res = await payload.find({
                collection: "products",
                where: { activeCampaigns: { in: [block.selectedCampaign.id] } },
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            } else if (
              block.fetchStrategy === "category" &&
              block.selectedCategory
            ) {
              const res = await payload.find({
                collection: "products",
                where: { categories: { in: [block.selectedCategory.id] } },
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            } else if (block.fetchStrategy === "tag" && block.tagType) {
              let tagCondition: Where = {};
              if (block.tagType === "newArrivals")
                tagCondition = { isNewArrival: { equals: true } };
              else if (block.tagType === "bestSellers")
                tagCondition = { isBestSeller: { equals: true } };
              else tagCondition = { isFeatured: { equals: true } };

              const res = await payload.find({
                collection: "products",
                where: tagCondition,
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            }

            products.forEach((p: any) => {
              if (p.id) allProductIds.push(p.id);
            });

            baseBlock.products = products;
            return baseBlock;
          }

          // ================================================================
          // 3. PRODUCT SHOWCASE
          // ================================================================
          if (block.blockType === "productShowcase") {
            baseBlock.sideBanner =
              block.showSideBanner && block.sideBanner?.image
                ? {
                    image: block.sideBanner.image.url,
                    link: block.sideBanner.link,
                  }
                : null;

            let products: any[] = [];
            if (block.type === "manual" && block.manualProducts) {
              products = block.manualProducts;
            } else if (block.type === "newest") {
              const res = await payload.find({
                collection: "products",
                sort: "-createdAt",
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            } else if (block.type === "best-selling") {
              const res = await payload.find({
                collection: "products",
                where: { isBestSeller: { equals: true } },
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            } else if (block.type === "featured") {
              const res = await payload.find({
                collection: "products",
                where: { isFeatured: { equals: true } },
                limit: 12,
                depth: 2,
              });
              products = res.docs;
            }

            products.forEach((p: any) => {
              if (p.id) allProductIds.push(p.id);
            });

            baseBlock.products = products;
            return baseBlock;
          }

          // ================================================================
          // 4. CATEGORY SHOWCASE
          // ================================================================
          if (block.blockType === "categoryShowcase") {
            baseBlock.categories = block.categories?.map(
              (c: any, index: number) => ({
                _id: c.id ? String(c.id) : `category-showcase-id-${index}`,
                name: c.name,
                slug: c.slug,
                image: c.image?.url,
              })
            );
            return baseBlock;
          }

          // ================================================================
          // 5. CATEGORY GRID
          // ================================================================
          if (block.blockType === "categoryGrid") {
            baseBlock.items = block.items?.map((item: any, itemIndex: number) => ({
              discountText: item.discountText,
              category: item.category
                ? {
                    _id: item.category.id
                      ? String(item.category.id)
                      : `category-grid-id-${itemIndex}`,
                    name: item.category.name,
                    slug: item.category.slug,
                    image: item.category.image?.url,
                  }
                : null,
            }));
            return baseBlock;
          }

          // ================================================================
          // 6. COUPON SECTION
          // ================================================================
          if (block.blockType === "couponSection" && block.couponReference) {
            const ref = block.couponReference;
            baseBlock.couponReference = {
              mediaType: ref.mediaType,
              mediaUrls: {
                mobile: { asset: { url: ref.mediaUrls?.mobile?.url } },
                tablet: { asset: { url: ref.mediaUrls?.tablet?.url } },
                desktop: { asset: { url: ref.mediaUrls?.desktop?.url } },
              },
              width: ref.width,
              height: ref.height,
              objectFit: ref.objectFit,
              altText: ref.altText,
              link: ref.link ? { _type: "reference", slug: ref.link.slug } : null,
            };
            return baseBlock;
          }

          // ================================================================
          // 7. BRAND SECTION
          // ================================================================
          if (block.blockType === "brandSection") {
            baseBlock.manualBrands = block.manualBrands
              ?.map((b: any, index: number) => {
                const brandId = b.id ? String(b.id) : `brand-fallback-id-${index}`;

                return {
                  _id: brandId,
                  name: b.name,
                  slug: b.slug,
                  logo:
                    b.logo?.id && b.logo?.url
                      ? {
                          _type: "image",
                          asset: {
                            _ref: String(b.logo.id),
                            _type: "reference",
                          },
                          url: b.logo.url,
                        }
                      : undefined,
                };
              })
              .filter(Boolean);
            return baseBlock;
          }

          // ================================================================
          // ✅ ENTERPRISE FIX: LAYOUT SECTION (Dynamic Infinite Grid)
          // ================================================================
          if (block.blockType === "layoutSection") {
            if (block.type === "infiniteGrid") {
              const {
                sourceType = "deals",
                categorySlug,
                searchTerm,
                manualProducts,
                sortOrder = "best-selling",
                limit = 40,
              } = block;

              console.log(`🔍 [Homepage] InfiniteGrid Config:`, {
                sourceType,
                categorySlug,
                searchTerm,
                manualProductsCount: manualProducts?.length || 0,
                sortOrder,
                limit,
              });

              let where: Where = {};
              let productIds: string[] = [];

              // Build WHERE clause
              if (sourceType === "deals") {
                where = { isOnDeal: { equals: true } };
              } else if (sourceType === "category" && categorySlug) {
                const categoryResult = await payload.find({
                  collection: "categories",
                  where: { slug: { equals: categorySlug } },
                  limit: 1,
                });
                if (categoryResult.docs.length > 0) {
                  where = { categories: { in: [categoryResult.docs[0].id] } };
                } else {
                  console.warn(`⚠️ [Homepage] Category not found: ${categorySlug}`);
                  where = {};
                }
              } else if (sourceType === "search" && searchTerm) {
                where = { title: { contains: searchTerm } };
              } else if (sourceType === "manual" && manualProducts?.length) {
                productIds = manualProducts.map((p: any) => p.id).filter(Boolean);
                if (productIds.length) {
                  where = { id: { in: productIds } };
                } else {
                  console.warn(`⚠️ [Homepage] No valid manual product IDs`);
                  where = {};
                }
              }

              // Build SORT
              let sort = "-createdAt";
              if (sortOrder === "best-selling") sort = "-rating";
              else if (sortOrder === "newest") sort = "-createdAt";
              else if (sortOrder === "price-low-to-high") sort = "variants.price";
              else if (sortOrder === "price-high-to-low") sort = "-variants.price";
              else if (sortOrder === "rating-high") sort = "-rating";

              // Fetch products & total count
              let products: any[] = [];
              let totalCount = 0;

              if (sourceType === "manual" && productIds.length > 0) {
                const res = await payload.find({
                  collection: "products",
                  where: { id: { in: productIds } },
                  limit: productIds.length,
                  depth: 2,
                });
                products = res.docs;
                totalCount = res.totalDocs;

                // Preserve manual order
                const orderedProducts = productIds
                  .map(id => products.find((p: any) => p.id === id))
                  .filter(Boolean);
                products = orderedProducts;
              } else {
                const res = await payload.find({
                  collection: "products",
                  where,
                  sort,
                  limit: Math.min(limit, 100),
                  depth: 2,
                });
                products = res.docs;
                totalCount = res.totalDocs;
              }

              // ✅ FALLBACK: If totalCount is 0 but products exist, set totalCount = products.length
              if (totalCount === 0 && products.length > 0) {
                console.warn(`⚠️ [Homepage] totalCount was 0 but products exist. Setting totalCount = ${products.length}`);
                totalCount = products.length;
              }

              console.log(
                `✅ [Homepage] InfiniteGrid fetched ${products.length} products. Total count: ${totalCount}`
              );

              // Collect product IDs for batch review fetching
              products.forEach((p: any) => {
                if (p.id) allProductIds.push(p.id);
              });

              // ✅ Set all fields on baseBlock
              baseBlock.initialProducts = products;
              baseBlock.totalCount = totalCount;
              baseBlock.limit = limit;
              baseBlock.sortOrder = sortOrder;
              baseBlock.sourceType = sourceType;
              baseBlock.viewAllLink = block.viewAllLink || "/search";
              baseBlock.showViewAll = block.showViewAll ?? true;

              console.log(`✅ [Homepage] Assigned baseBlock.totalCount = ${totalCount}`);
            }
            return baseBlock;
          }

          return baseBlock;
        })
      );

      // ================================================================
      // 3. BATCH FETCH ALL REVIEWS
      // ================================================================
      let reviewsMap = new Map<string, any[]>();
      if (allProductIds.length > 0) {
        const uniqueProductIds = [...new Set(allProductIds)];
        reviewsMap = await getReviewsForProducts(uniqueProductIds);
        console.log(
          `✅ [Homepage] Fetched reviews for ${uniqueProductIds.length} products in 1 query.`
        );
      }

      // ================================================================
      // 4. MAP PRODUCTS TO SANITY FORMAT
      // ================================================================
      const finalSections = resolvedSections.map((section: any) => {
        if (section.products && Array.isArray(section.products)) {
          section.products = section.products.map((p: any) => {
            const reviews = reviewsMap.get(p.id) || [];
            return mapPayloadProductToSanity(p, reviews);
          });
        }
        if (section.initialProducts && Array.isArray(section.initialProducts)) {
          section.initialProducts = section.initialProducts.map((p: any) => {
            const reviews = reviewsMap.get(p.id) || [];
            return mapPayloadProductToSanity(p, reviews);
          });
        }
        return section;
      });

      return {
        pageSections: finalSections,
        seo: homepage.seo || null,
      };
    } catch (error) {
      console.error("❌ Failed to fetch homepage data from Payload:", error);
      return { pageSections: [], seo: null };
    }
  },
  ["homepage-data"],
  {
    tags: ["homepage", "homepage-data"],
    revalidate: 60, // ✅ Temporary: auto-refresh every 60 seconds for testing
  }
);

// ================================================================
// 🚀 MAIN EXPORT
// ================================================================
export const getPayloadHomepageData = async () => {
  return await getCachedHomepageData();
};