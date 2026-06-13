// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { Heart } from "lucide-react";
// import { useStateContext } from "@/app/context/StateContext";
// // 🛑 OLD SANITY IMPORT (Commented)
// // import { getLiveProductDataForCards } from "@/sanity/lib/queries";
// // ✅ NEW PAYLOAD IMPORT
// // import { getPayloadLiveProductDataForCards } from "@/sanity/lib/payload/product.queries";

// import SanityProduct, {
//   CleanWishlistItem,
//   BreadcrumbItem,
// } from "@/sanity/types/product_types";
// import ProductCard from "@/app/components/product/ProductCard";
// import PaginationControls from "@/app/components/ui/PaginationControls";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
// import QuickViewModal from "@/app/components/product/QuickViewModal";
// import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton";
// import { fetchWishlistProductsAction } from "@/app/actions/wishlistActions";

// const PRODUCTS_PER_PAGE = 40;

// type LiveWishlistItem = CleanWishlistItem & {
//   liveData?: SanityProduct;
// };

// const breadcrumbsList: BreadcrumbItem[] = [
//   { name: "Home", href: "/" },
//   { name: "My Account", href: "/account" },
//   { name: "Wishlist", href: "/wishlist" },
// ];

// export default function WishlistClientPage() {
//   const { wishlistItems, handleAddToWishlist } = useStateContext();
//   const [liveWishlist, setLiveWishlist] = useState<LiveWishlistItem[]>([]);
//   const isInitialLoad = useRef(true);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isMounted, setIsMounted] = useState(false);

//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);

//   const searchParams = useSearchParams();
//   const currentPage = Number(searchParams.get("page")) || 1;

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     const fetchLiveProductData = async () => {
//       if (wishlistItems.length === 0) {
//         setLiveWishlist([]);
//         setIsLoading(false);
//         isInitialLoad.current = false;
//         return;
//       }

//       if (isInitialLoad.current) {
//         setIsLoading(true);
//       }

//       const productIds = wishlistItems.map((item) => item._id);
//       try {
//         // ✅ Switch to Payload Fetcher
//         const liveProducts: SanityProduct[] = await fetchWishlistProductsAction(productIds);

//         const liveDataMap = new Map(liveProducts.map((p) => [p._id, p]));

//         const updatedWishlist = wishlistItems.map((item) => ({
//           ...item,
//           liveData: liveDataMap.get(item._id),
//         }));
//         setLiveWishlist(updatedWishlist);
//       } catch (error) {
//         console.error("Failed to fetch live wishlist data:", error);
//       } finally {
//         setIsLoading(false);
//         isInitialLoad.current = false;
//       }
//     };
//     fetchLiveProductData();
//   }, [wishlistItems]);

//   const handleRemoveFromWishlist = (item: LiveWishlistItem) => {
//     setLiveWishlist((prev) => prev.filter((i) => i._id !== item._id));
//     const productToRemove = {
//       _id: item._id,
//       title: item.name,
//       defaultVariant: item.liveData?.defaultVariant,
//     } as SanityProduct;
//     handleAddToWishlist(productToRemove);
//   };

//   const handleQuickView = (product: SanityProduct) => setQuickViewProduct(product);
//   const handleCloseModal = () => setQuickViewProduct(null);

//   const totalPages = Math.ceil(liveWishlist.length / PRODUCTS_PER_PAGE);

//   const paginatedWishlist = useMemo(() => {
//     const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
//     return liveWishlist.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
//   }, [liveWishlist, currentPage]);

//   if (isLoading && isInitialLoad.current) {
//     const skeletonCount = isMounted && wishlistItems.length > 0 ? wishlistItems.length : 4;

//     return (
//       <main className="w-full bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-screen-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//           <div className="mb-8 w-48 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
//           <div className="flex justify-between items-center mb-8">
//              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
//              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
//             {Array.from({ length: skeletonCount }).map((_, i) => (
//               <ProductCardSkeleton key={i} />
//             ))}
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (!isLoading && liveWishlist.length === 0) {
//     return (
//       <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-0 py-8 md:py-12 min-h-[60vh]">
//         <div className="max-w-480 mx-auto ">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbsList.slice(0, -1)} />
//           </div>
//           <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900/50 py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
//             <Heart size={56} className="text-gray-300 dark:text-gray-600 mb-6" strokeWidth={1.5} />
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
//               Your Wishlist is Empty
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
//               Looks like you haven&apos;t saved any items yet.
//             </p>
//             <Link href="/" className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover transition-colors">
//               Start Shopping
//             </Link>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <>
//       <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
//         <div className="max-w-screen-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbsList} />
//           </div>

//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
//               My Wishlist
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
//               {liveWishlist.length} {liveWishlist.length > 1 ? "items" : "item"}
//             </p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
//             {paginatedWishlist.map((item) => {
//               const product = item.liveData;
//               if (!product || !product.defaultVariant) return null;
//               return (
//                 <div key={item._id} className="relative group overflow-hidden">
//                   <ProductCard
//                       product={product}
//                       onQuickView={handleQuickView}
//                       className="h-full"
//                       isWishlistPage={true}
//                       onRemoveFromWishlist={() => handleRemoveFromWishlist(item)}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           {totalPages > 1 && (
//             <div className="mt-8 md:mt-12">
//               <PaginationControls totalPages={totalPages} />
//             </div>
//           )}
//         </div>
//       </main>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={handleCloseModal}
//       />
//     </>
//   );
// }
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { BreadcrumbItem } from "@/sanity/types/product_types";
import ProductCard from "@/app/components/product/ProductCard";
import PaginationControls from "@/app/components/ui/PaginationControls";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import QuickViewModal from "@/app/components/product/QuickViewModal";
import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton";
import { fetchWishlistProductsAction } from "@/app/actions/wishlistActions";

const PRODUCTS_PER_PAGE = 40;

const breadcrumbsList: BreadcrumbItem[] = [
  { name: "Home", href: "/" },
  { name: "Wishlist", href: "/wishlist" },
];

export default function WishlistClientPage() {
  const { wishlistItems, handleAddToWishlist } = useStateContext();
  const [liveProducts, setLiveProducts] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<SanityProduct | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  // 1. Mount Check: Hydration Errors se bachne ke liye
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Sync Logic: LocalStorage se IDs utha kar Payload se fresh data lana
  useEffect(() => {
    if (!isMounted) return;

    const syncWishlist = async () => {
      if (wishlistItems.length === 0) {
        setLiveProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const productIds = wishlistItems.map((item) => item._id);
        const freshData = await fetchWishlistProductsAction(productIds);
        setLiveProducts(freshData);
      } catch (error) {
        console.error("Wishlist Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    syncWishlist();
  }, [wishlistItems, isMounted]);

  // 3. Remove Item: Optimistic Update
  const onRemove = (product: SanityProduct) => {
    setLiveProducts((prev) => prev.filter((p) => p._id !== product._id));
    handleAddToWishlist(product);
  };

  // 4. Pagination & Slicing
  const totalPages = Math.ceil(liveProducts.length / PRODUCTS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return liveProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [liveProducts, currentPage]);

  // Loading State UI
  if (!isMounted || (isLoading && liveProducts.length === 0)) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Empty State UI
  if (isMounted && liveProducts.length === 0 && !isLoading) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen py-20">
        <div className="max-w-xl mx-auto text-center px-4">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-primary/10">
            <Heart size={40} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Wishlist is empty
          </h1>
          <p className="text-gray-500 mb-8">
            Save your favorite items here to keep an eye on them.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary-hover transition-all transform active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            <ShoppingBag size={20} /> Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen">
      <main className="max-w-screen-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
          <Breadcrumbs crumbs={breadcrumbsList} />
          <div className="flex justify-between items-end mt-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                My <span className="text-brand-primary">Wishlist</span>
              </h1>
              <p className="text-gray-500 font-medium mt-2">
                {liveProducts.length} premium{" "}
                {liveProducts.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
            >
              Add more <ShoppingBag size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedItems.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard
                product={product}
                onQuickView={setQuickViewProduct}
                isWishlistPage={true}
                onRemoveFromWishlist={() => onRemove(product)}
              />
              <button
                onClick={() => onRemove(product)}
                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-16 border-t dark:border-gray-800 pt-10">
            <PaginationControls totalPages={totalPages} />
          </div>
        )}
      </main>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
