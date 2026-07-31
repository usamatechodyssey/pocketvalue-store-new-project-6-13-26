// // src/app/components/home/InfiniteProductGrid.tsx

// "use client";

// import { useState, useCallback } from "react";
// import SanityProduct from "@/types";
// import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
// import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
// import { FiPlus } from "react-icons/fi";
// import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";

// const BATCH_SIZE = 40;

// interface InfiniteProductGridProps {
//   initialProducts: SanityProduct[];
//   lowStockThreshold: number; // ✅ NEW PROP
// }

// export default function InfiniteProductGrid({
//   initialProducts,
//   lowStockThreshold, // ✅ RECEIVE
// }: InfiniteProductGridProps) {
//   const [products, setProducts] = useState<SanityProduct[]>(
//     initialProducts || [],
//   );
//   const [page, setPage] = useState(2);
//   const [hasMore, setHasMore] = useState(
//     (initialProducts?.length || 0) >= BATCH_SIZE,
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [quickViewProduct, setQuickViewProduct] =
//     useState<SanityProduct | null>(null);

//   const loadMoreProducts = useCallback(async () => {
//     if (isLoading || !hasMore) return;
//     setIsLoading(true);

//     try {
//       const response = await fetch("/api/filter", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           page: page,
//           context: { type: "deals" }, // Or 'category' based on your home logic
//         }),
//       });

//       if (!response.ok) throw new Error("Failed to fetch");

//       const data = await response.json();
//       const newProducts = data.products;

//       if (newProducts && newProducts.length > 0) {
//         setProducts((prev) => [...prev, ...newProducts]);
//         setPage((prev) => prev + 1);
//         if (newProducts.length < BATCH_SIZE) setHasMore(false);
//       } else {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Payload Infinite Scroll Error:", error);
//       setHasMore(false);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [page, isLoading, hasMore]);

//   const handleQuickView = (product: SanityProduct) =>
//     setQuickViewProduct(product);

//   if (!initialProducts || initialProducts.length === 0) return null;

//   return (
//     <>
//       <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
//         <div className="max-w-480 mx-auto px-4 md:px-8">
//           <div className="flex flex-col items-center text-center mb-10 md:mb-12">
//             <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
//               Just For You
//             </h2>
//             <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
//             {products.map((product) => (
//               <ProductCard
//                 key={product._id}
//                 product={product}
//                 onQuickView={handleQuickView}
//               />
//             ))}

//             {/* Skeletons while loading */}
//             {isLoading &&
//               Array.from({ length: 10 }).map((_, i) => (
//                 <ProductCardSkeleton key={i} />
//               ))}
//           </div>

//           <div className="mt-14 flex justify-center">
//             {!isLoading && hasMore && (
//               <button
//                 onClick={loadMoreProducts}
//                 className="group flex items-center gap-2 px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl active:scale-95"
//               >
//                 <FiPlus
//                   size={18}
//                   className="group-hover:rotate-90 transition-transform"
//                 />
//                 <span>Load More Products</span>
//               </button>
//             )}

//             {!hasMore && (
//               <div className="flex flex-col items-center gap-2 text-gray-400">
//                 <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">
//                   End of Collection
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={() => setQuickViewProduct(null)}
//         lowStockThreshold={lowStockThreshold} // ✅ PASS
//       />
//     </>
//   );
// }
// src/app/components/home/InfiniteProductGrid.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SanityProduct from "@/types";
import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";
import { FiArrowRight, FiPackage } from "react-icons/fi";

interface InfiniteProductGridProps {
  initialProducts: SanityProduct[];
  totalCount: number;
  lowStockThreshold: number;
  context: {
    type: "category" | "search" | "deals";
    value?: string;
    sort?: string;
    filter?: string;
  };
  filters?: any;
  priceRange?: { min: number; max: number };
  limit?: number;
  viewAllLink?: string;
  showViewAll?: boolean;
}

export default function InfiniteProductGrid({
  initialProducts,
  totalCount,
  lowStockThreshold,
  context,
  filters = {},
  priceRange,
  limit = 40,
  viewAllLink = "/search",
  showViewAll = true,
}: InfiniteProductGridProps) {
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / limit);

  console.log("🔍 [InfiniteProductGrid] Debug:", {
    initialProductsCount: initialProducts.length,
    totalCount,
    limit,
    totalPages,
    currentPage,
    context,
  });

  const [products, setProducts] = useState<SanityProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);

  const fetchProducts = useCallback(
    async (page: number) => {
      if (page === 1 && initialProducts.length > 0) {
        setProducts(initialProducts);
        return;
      }

      setIsLoading(true);
      try {
        const payload = {
          page,
          sortOrder: context.sort || "best-match",
          filters,
          priceRange,
          context,
        };

        console.log(`🔍 [InfiniteProductGrid] Fetching page ${page} with:`, payload);

        const response = await fetch("/api/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("❌ [InfiniteProductGrid] fetch error:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [context, filters, priceRange, initialProducts]
  );

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const handleQuickView = (product: SanityProduct) => setQuickViewProduct(product);

  // ✅ Always render the section, even if no products
  const showViewAllButton = showViewAll && viewAllLink && viewAllLink !== "#";
  const hasProducts = products.length > 0;

  return (
    <>
      <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-480 mx-auto px-4 md:px-8">
          {/* Header with optional "View All" button */}
          <div className="flex items-center justify-between mb-10 md:mb-12">
            <div className="flex flex-col items-start">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Just For You
              </h2>
              <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
            </div>

            {showViewAllButton && (
              <Link
                href={viewAllLink}
                className="group flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline transition"
              >
                View All
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: Math.min(limit, 20) }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : hasProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          ) : (
            // ✅ Enterprise Empty State
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <FiPackage size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                No Products Found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                We couldn&apos;t find any products matching your current selection.
                Try adjusting your filters or explore other categories.
              </p>
              {showViewAllButton && (
                <Link
                  href={viewAllLink}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold text-sm rounded-full hover:bg-brand-primary-hover transition"
                >
                  Browse All Products
                  <FiArrowRight size={16} />
                </Link>
              )}
            </div>
          )}

          {/* Pagination (only if more than 1 page) */}
          {totalPages > 1 && (
            <PaginationControls totalPages={totalPages} paramName="page" />
          )}
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        lowStockThreshold={lowStockThreshold}
      />
    </>
  );
}