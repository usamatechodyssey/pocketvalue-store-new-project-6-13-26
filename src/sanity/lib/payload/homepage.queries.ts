//// src/sanity/lib/payload/.queries.ts
import { getPayload, Where } from "payload"; // ✅ Where import kiya
import configPromise from "@payload-config";
import { mapPayloadProductToSanity } from "./plp/productMapper";
import { getPayloadReviewsForProduct } from "./review.queries"; // Ratings ke liye

export const getPayloadHomepageData = async () => {
  const payload = await getPayload({ config: configPromise });

  const homepage = await payload.findGlobal({
    slug: "homepage",
    depth: 2,
  });
  if (!homepage || !homepage.pageSections)
    return { pageSections: [], seo: null };

  const resolvedSections = await Promise.all(
    homepage.pageSections.map(async (block: any) => {
      const baseBlock = {
        ...block,
        _type: block.blockType,
        _key: block.id || Math.random().toString(),
      };

      // === 1. BANNER SECTION ===
      if (block.blockType === "bannerSection") {
        baseBlock.banners = block.banners?.map((b: any) => ({
          ...b,
          desktopImage: b.desktopImage?.url || "",
          mobileImage: b.mobileImage?.url || b.desktopImage?.url || "",
        }));
        return baseBlock;
      }

      // === 2. DEAL SECTION ===
      if (block.blockType === "dealSection") {
        baseBlock.sideBanner =
          block.showSideBanner && block.sideBanner?.image
            ? {
                image: block.sideBanner.image.url,
                link: block.sideBanner.link,
              }
            : null;
        // 🔥 FIX: Timer logic ko explicitely map karein
        baseBlock.enableTimer = block.enableTimer || false;
        // Agar endTime mojood hai, to usay pass karein, warna undefined
        baseBlock.endTime = block.endTime
          ? new Date(block.endTime).toISOString()
          : undefined;

        let products = [];
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
          // 🔥 FIX YAHAN HAI: Type-safe Where clause
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

        // Reviews fetch karke map karein
        baseBlock.products = await Promise.all(
          products.map(async (p: any) => {
            const reviews = await getPayloadReviewsForProduct(p.id);
            return mapPayloadProductToSanity(p, reviews);
          }),
        );
        return baseBlock;
      }

      // === 3. PRODUCT SHOWCASE ===
      if (block.blockType === "productShowcase") {
        baseBlock.sideBanner =
          block.showSideBanner && block.sideBanner?.image
            ? {
                image: block.sideBanner.image.url,
                link: block.sideBanner.link,
              }
            : null;

        let products = [];
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

        baseBlock.products = await Promise.all(
          products.map(async (p: any) => {
            const reviews = await getPayloadReviewsForProduct(p.id);
            return mapPayloadProductToSanity(p, reviews);
          }),
        );
        return baseBlock;
      }
      // === 4. CATEGORY SHOWCASE ===
      if (block.blockType === "categoryShowcase") {
        baseBlock.categories = block.categories?.map(
          (c: any, index: number) => ({
            // ✅ FIX: Added 'index' for stable fallback
            // Ensure _id is always a string. Use Payload's ID or a stable fallback.
            _id: c.id ? String(c.id) : `category-showcase-id-${index}`,
            name: c.name,
            slug: c.slug,
            image: c.image?.url, // Payload ke media object se direct url len
          }),
        );
        return baseBlock;
      }

      // === 5. CATEGORY GRID ===
      if (block.blockType === "categoryGrid") {
        baseBlock.items = block.items?.map((item: any, itemIndex: number) => ({
          // ✅ FIX: Added 'itemIndex' for stable fallback
          discountText: item.discountText,
          category: item.category // Yeh category relationship hai
            ? {
                // Ensure _id is always a string for nested category objects too
                _id: item.category.id
                  ? String(item.category.id)
                  : `category-grid-id-${itemIndex}`,
                name: item.category.name,
                slug: item.category.slug,
                image: item.category.image?.url, // Payload ke media object se direct url len
              }
            : null,
        }));
        return baseBlock;
      }

      // === 6. COUPON SECTION ===
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
      // src/sanity/lib/payload/homepage.queries.ts

      // ... (existing imports and code)

      // === 7. BRAND SECTION ===
      if (block.blockType === "brandSection") {
        baseBlock.manualBrands = block.manualBrands
          ?.map((b: any, index: number) => {
            // ✅ Added 'index' for stable fallback
            // ✅ FIX 1 (Future-Proof): Ensure _id is always a unique and STABLE string.
            // Use Payload's ID if available, otherwise a stable index-based key.
            const brandId = b.id ? String(b.id) : `brand-fallback-id-${index}`;

            return {
              _id: brandId,
              name: b.name,
              slug: b.slug,
              // 🔥 FIX 2: Logo ko SanityImageObject format mein map karein.
              // Payload media relationship se 'id' aur 'url' milte hain.
              // Ensure `_ref` is always a string.
              logo:
                b.logo?.id && b.logo?.url
                  ? {
                      _type: "image",
                      asset: {
                        _ref: String(b.logo.id), // ✅ Ensure _ref is a string
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

      // === 8. LAYOUT SECTION (Infinite Grid) ===
      if (block.blockType === "layoutSection") {
        if (block.type === "infiniteGrid") {
          const res = await payload.find({
            collection: "products",
            sort: "-createdAt",
            limit: 40,
            depth: 2,
          });
          baseBlock.initialProducts = await Promise.all(
            res.docs.map(async (p: any) => {
              const reviews = await getPayloadReviewsForProduct(p.id);
              return mapPayloadProductToSanity(p, reviews);
            }),
          );
        }
        return baseBlock;
      }

      return baseBlock;
    }),
  );

  return { pageSections: resolvedSections, seo: (homepage as any).seo || null };
};
