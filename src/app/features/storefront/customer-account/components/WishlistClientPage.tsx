
// src/app/features/storefront/customer-account/components/WishlistClientPage.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { BreadcrumbItem } from "@/types";
import ProductCard from "@/app/features/storefront/catalog/components/product/ProductCard";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";
import QuickViewModal from "@/app/features/storefront/catalog/components/product/QuickViewModal";
import ProductCardSkeleton from "@/app/features/storefront/catalog/components/product/ProductCardSkeleton";
import { fetchWishlistProductsAction } from "@/app/features/storefront/customer-account/actions/wishlistActions";

const PRODUCTS_PER_PAGE = 40;

const breadcrumbsList: BreadcrumbItem[] = [
  { name: "Home", href: "/" },
  { name: "Wishlist", href: "/wishlist" },
];

// ✅ NEW: Props interface with lowStockThreshold
interface WishlistClientPageProps {
  lowStockThreshold: number; // ✅ NEW PROP (passed from server page)
}

export default function WishlistClientPage({
  lowStockThreshold, // ✅ RECEIVE
}: WishlistClientPageProps) {
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

      {/* ✅ PASS lowStockThreshold to QuickViewModal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        lowStockThreshold={lowStockThreshold} // ✅ PASSED
      />
    </div>
  );
}