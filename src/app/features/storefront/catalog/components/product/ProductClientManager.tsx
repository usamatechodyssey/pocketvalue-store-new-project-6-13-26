
// "use client";

// import { useState, useMemo, useEffect, useRef } from "react";
// import { usePathname } from "next/navigation"; // ✅ Removed unused router
// import SanityProduct, {
//   ProductReview,
//   ProductVariant,
//   SanityImageObject,
// } from "@/types";

// import ProductInfo from "@/app/features/storefront/catalog/components/product/ProductInfo";
// import ReviewsSection from "@/app/features/storefront/catalog/components/product/reviews/ReviewsSection";
// import ProductDetailsTabs from "@/app/features/storefront/catalog/components/product/ProductDetailsTabs";
// import ProductGallery from "@/app/features/storefront/catalog/components/product/ProductGallery";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// import { useRecentlyViewed } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
// import RecentlyViewedSlider from "@/app/features/storefront/catalog/components/product/RecentlyViewedSlider";
// import InterestRecommendations from "@/app/features/storefront/catalog/components/product/InterestRecommendations";

// interface Props {
//   product: SanityProduct;
//   lowStockThreshold: number; // ✅ Received from server (no client fetch)
// }

// export default function ProductClientManager({
//   product: initialProduct,
//   lowStockThreshold,
// }: Props) {
//   const pathname = usePathname();
//   // ❌ Removed: const router = useRouter(); (unused)
  
//   const [product, setProduct] = useState(initialProduct);
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
//     product.defaultVariant || null
//   );
  
//   const [reviews, setReviews] = useState<ProductReview[]>(
//     initialProduct.reviews || []
//   );

//   const { history, addToHistory, isLoaded } = useRecentlyViewed();

//   // 🚀 Refs to prevent redundant telemetry logging
//   const trackedMilestones = useRef<Set<number>>(new Set());

//   // Dynamic user-interest history push
//   useEffect(() => {
//     if (product && product._id) {
//       addToHistory(product); 
//     }
//   }, [product, addToHistory]);

//   // =================================================================
//   // 🚀 PDP Interactive Scroll Depth (25% / 50% / 75%)
//   // =================================================================
//   useEffect(() => {
//     if (!product?._id) return;

//     trackedMilestones.current.clear();

//     const handleScrollDepth = () => {
//       const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
//       if (scrollHeight <= 0) return;

//       const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

//       [25, 50, 75].forEach((milestone) => {
//         if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
//           trackedMilestones.current.add(milestone);
//           logUserEvent('pdp_interaction', pathname, {
//             productId: product._id,
//             interaction_type: 'scroll_milestone',
//             scroll_percentage: milestone
//           });
//         }
//       });
//     };

//     window.addEventListener("scroll", handleScrollDepth, { passive: true });
//     return () => window.removeEventListener("scroll", handleScrollDepth);
//   }, [pathname, product?._id]);

//   // =================================================================
//   // 🚀 PDP User Dwell Reading Time Tracker (15 Seconds)
//   // =================================================================
//   useEffect(() => {
//     if (!product?._id) return;

//     const dwellTimer = setTimeout(() => {
//       logUserEvent('pdp_interaction', pathname, {
//         productId: product._id,
//         interaction_type: 'pdp_dwell_time',
//         duration_seconds: 15
//       });
//     }, 15000);

//     return () => clearTimeout(dwellTimer);
//   }, [pathname, product?._id]);

//   const handleVariantChange = (variant: ProductVariant | null) => {
//     setSelectedVariant(variant);
//   };

//   const imagesToShow: SanityImageObject[] = useMemo(() => {
//     if (!product) return [];
//     if (selectedVariant?.images && selectedVariant.images.length > 0)
//       return selectedVariant.images;
//     const colorAttribute = selectedVariant?.attributes.find(
//       (attr) => attr.name.toLowerCase() === "color"
//     );
//     if (colorAttribute) {
//       const variantWithImages = product.variants.find(
//         (v) =>
//           v.images &&
//           v.images.length > 0 &&
//           v.attributes.some(
//             (a) =>
//               a.name.toLowerCase() === "color" &&
//               a.value === colorAttribute.value
//           )
//       );
//       if (variantWithImages?.images) return variantWithImages.images;
//     }
//     return product.defaultVariant?.images || [];
//   }, [selectedVariant, product]);

//   const handleNewReview = (newReviewFromAction: ProductReview) => {
//     const consistentNewReview: ProductReview = {
//       ...newReviewFromAction,
//       _id: newReviewFromAction._id || `temp-${Date.now()}`,
//       _createdAt: newReviewFromAction._createdAt || new Date().toISOString(),
//       reviewImage: newReviewFromAction.reviewImage || undefined,
//       user: {
//         name: newReviewFromAction.user?.name || "You",
//         image: newReviewFromAction.user?.image || undefined,
//       },
//     };

//     const updatedReviews = [consistentNewReview, ...reviews];
//     setReviews(updatedReviews);

//     const newTotal = updatedReviews.length;
//     const newSum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
//     const newAverage = newSum / newTotal;
//     setProduct((prev) => ({
//       ...prev,
//       rating: newAverage,
//       reviewCount: newTotal,
//     }));
    
//     // ❌ REMOVED: router.refresh() - hydration risk
//     // Server action (reviewActions.ts) already calls revalidatePath
//     // No client-side refresh needed
//   };

//   const averageRating = product.rating || 0;
//   const totalReviews = product.reviewCount || reviews.length;

//   return (
//     <>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//         <ProductGallery
//           images={imagesToShow}
//           videoUrl={product.videoUrl}
//           productTitle={product.title}
//         />
//         <ProductInfo
//           product={product}
//           selectedVariant={selectedVariant}
//           onVariantChange={handleVariantChange}
//           averageRating={averageRating}
//           totalReviews={totalReviews}
//           lowStockThreshold={lowStockThreshold}
//         />
//       </div>

//       <ProductDetailsTabs product={product} selectedVariant={selectedVariant} />
      
//       <ReviewsSection
//         productId={product._id}
//         allReviews={reviews}
//         onNewReview={handleNewReview}
//       />

//       <InterestRecommendations 
//         history={history}
//         currentProductId={product._id}
//         isLoaded={isLoaded}
//       />

//       <RecentlyViewedSlider 
//         history={history}
//         currentProductSlug={product.slug}
//         isLoaded={isLoaded}
//       />
//     </>
//   );
// }
// 📂 src/app/features/storefront/catalog/components/product/ProductClientManager.tsx

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SanityProduct, {
  ProductReview,
  ProductVariant,
  SanityImageObject,
} from "@/types";

import ProductInfo from "@/app/features/storefront/catalog/components/product/ProductInfo";
import ReviewsSection from "@/app/features/storefront/catalog/components/product/reviews/ReviewsSection";
import ProductDetailsTabs from "@/app/features/storefront/catalog/components/product/ProductDetailsTabs";
import ProductGallery from "@/app/features/storefront/catalog/components/product/ProductGallery";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

import { useRecentlyViewed } from "@/app/features/storefront/customer-account/hooks/useRecentlyViewed";
import RecentlyViewedSlider from "@/app/features/storefront/catalog/components/product/RecentlyViewedSlider";
import InterestRecommendations from "@/app/features/storefront/catalog/components/product/InterestRecommendations";

interface Props {
  product: SanityProduct;
  lowStockThreshold: number; // Received from server
}

export default function ProductClientManager({
  product: initialProduct,
  lowStockThreshold,
}: Props) {
  const pathname = usePathname();
  
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.defaultVariant || null
  );
  
  const [reviews, setReviews] = useState<ProductReview[]>(
    initialProduct.reviews || []
  );

  const { history, addToHistory, isLoaded } = useRecentlyViewed();

  // Refs to prevent redundant telemetry logging
  const trackedMilestones = useRef<Set<number>>(new Set());

  // Dynamic user-interest history push
  useEffect(() => {
    if (product && product._id) {
      addToHistory(product); 
    }
  }, [product, addToHistory]);

  // PDP Interactive Scroll Depth (25% / 50% / 75%)
  useEffect(() => {
    if (!product?._id) return;

    trackedMilestones.current.clear();

    const handleScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      [25, 50, 75].forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone);
          logUserEvent('pdp_interaction', pathname, {
            productId: product._id,
            interaction_type: 'scroll_milestone',
            scroll_percentage: milestone
          });
        }
      });
    };

    window.addEventListener("scroll", handleScrollDepth, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollDepth);
  }, [pathname, product?._id]);

  // PDP User Dwell Reading Time Tracker (15 Seconds)
  useEffect(() => {
    if (!product?._id) return;

    const dwellTimer = setTimeout(() => {
      logUserEvent('pdp_interaction', pathname, {
        productId: product._id,
        interaction_type: 'pdp_dwell_time',
        duration_seconds: 15
      });
    }, 15000);

    return () => clearTimeout(dwellTimer);
  }, [pathname, product?._id]);

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  };

  const imagesToShow: SanityImageObject[] = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.images && selectedVariant.images.length > 0)
      return selectedVariant.images;
    const colorAttribute = selectedVariant?.attributes.find(
      (attr) => attr.name.toLowerCase() === "color"
    );
    if (colorAttribute) {
      const variantWithImages = product.variants.find(
        (v) =>
          v.images &&
          v.images.length > 0 &&
          v.attributes.some(
            (a) =>
              a.name.toLowerCase() === "color" &&
              a.value === colorAttribute.value
          )
      );
      if (variantWithImages?.images) return variantWithImages.images;
    }
    return product.defaultVariant?.images || [];
  }, [selectedVariant, product]);

  const handleNewReview = (newReviewFromAction: ProductReview) => {
    const consistentNewReview: ProductReview = {
      ...newReviewFromAction,
      _id: newReviewFromAction._id || `temp-${Date.now()}`,
      _createdAt: newReviewFromAction._createdAt || new Date().toISOString(),
      reviewImage: newReviewFromAction.reviewImage || undefined,
      user: {
        name: newReviewFromAction.user?.name || "You",
        image: newReviewFromAction.user?.image || undefined,
      },
    };

    const updatedReviews = [consistentNewReview, ...reviews];
    setReviews(updatedReviews);

    const newTotal = updatedReviews.length;
    const newSum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAverage = newSum / newTotal;
    setProduct((prev) => ({
      ...prev,
      rating: newAverage,
      reviewCount: newTotal,
    }));
  };

  const averageRating = product.rating || 0;
  const totalReviews = product.reviewCount || reviews.length;

  const fallbackCategorySlugs = useMemo(() => {
    return product.categories?.map((c) => c.slug).filter(Boolean) as string[] || [];
  }, [product.categories]);

  return (
    <div className="w-full flex flex-col space-y-12 md:space-y-16">
      
      {/* ✅ FIX: Added 'items-start' to grid container so sticky gallery functions cleanly! */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ProductGallery
          images={imagesToShow}
          videoUrl={product.videoUrl}
          productTitle={product.title}
        />
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
          averageRating={averageRating}
          totalReviews={totalReviews}
          lowStockThreshold={lowStockThreshold}
        />
      </div>

      {/* 2. SPECIFICATIONS & DETAILS TABS */}
      <ProductDetailsTabs product={product} selectedVariant={selectedVariant} />
      
      {/* 3. REVIEWS SECTION */}
      <ReviewsSection
        productId={product._id}
        allReviews={reviews}
        onNewReview={handleNewReview}
      />

      {/* 4. RECOMMENDED PRODUCTS */}
      <InterestRecommendations 
        history={history}
        currentProductId={product._id}
        isLoaded={isLoaded}
        fallbackCategorySlugs={fallbackCategorySlugs}
        lowStockThreshold={lowStockThreshold}
      />

      {/* 5. RECENTLY VIEWED PRODUCTS */}
      <RecentlyViewedSlider 
        history={history}
        currentProductSlug={product.slug}
        isLoaded={isLoaded}
        lowStockThreshold={lowStockThreshold}
      />

    </div>
  );
}