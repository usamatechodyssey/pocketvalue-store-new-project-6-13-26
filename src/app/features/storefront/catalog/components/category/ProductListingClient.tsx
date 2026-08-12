
// // 📂 src/app/features/storefront/catalog/components/category/ProductListingClient.tsx

// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import debounce from "lodash/debounce";

// import SanityProduct, { SanityBrand, SanityCategory } from "@/types";
// import FilterSidebar from "./FilterSidebar";
// import ProductGrid from "../product/ProductGrid";
// import QuickViewModal from "../product/QuickViewModal";
// import PaginationControls from "@/app/shared/components/ui/PaginationControls";
// import ListingHeader from "./ListingHeader";
// import ProductCardSkeleton from "../product/ProductCardSkeleton";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// const PRODUCTS_PER_PAGE = 40;

// function getUniqueItems<T>(items: T[], key: keyof T): T[] {
//   const seen = new Set();
//   return items.filter((item) => {
//     const val = item[key];
//     if (seen.has(val)) return false;
//     seen.add(val);
//     return true;
//   });
// }

// type FilterValue = string | boolean | number | undefined;

// interface AppliedFilters {
//   brands: string[];
//   categories?: string[];
//   isFeatured?: boolean;
//   isOnSale?: boolean;
//   minRating?: number;
//   availability?: string[];
//   [key: string]: FilterValue | string[] | undefined;
// }

// interface FilterData {
//   brands: (SanityBrand | null)[];
//   attributes: { name: string; value: string }[];
//   priceRange: { min: number; max: number };
// }

// interface PLPProps {
//   initialProducts: SanityProduct[];
//   filterData: FilterData;
//   categoryTree?: SanityCategory;
//   dealCategories?: SanityCategory[];
//   context: {
//     type: "category" | "search" | "deals";
//     value?: string;
//     sort?: string;
//     filter?: string;
//   };
//   totalCount: number;
//   lowStockThreshold: number;
// }

// export default function ProductListingClient({
//   initialProducts,
//   filterData,
//   categoryTree,
//   dealCategories,
//   context,
//   totalCount,
//   lowStockThreshold,
// }: PLPProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const urlPage = Number(searchParams.get("page")) || 1;
//   const [currentPage, setCurrentPage] = useState(urlPage);

//   useEffect(() => {
//     setCurrentPage(urlPage);
//   }, [urlPage]);

//   const [products, setProducts] = useState(initialProducts);
//   const [totalProducts, setTotalProducts] = useState(totalCount);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Mobile Sidebar State
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
//   // Dynamic Desktop Toggle State
//   const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
//   const [sortOrder, setSortOrder] = useState(context.sort || "best-match");

//   const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
//     brands: [],
//     categories: [],
//     isFeatured: context.filter === "isFeatured",
//   });

//   const [appliedPriceRange, setAppliedPriceRange] = useState({
//     min: 0,
//     max: Infinity,
//   });

//   const hasActiveFilters = useMemo(() => {
//     return (
//       currentPage > 1 ||
//       sortOrder !== "best-match" ||
//       appliedFilters.brands.length > 0 ||
//       (appliedFilters.categories?.length ?? 0) > 0 ||
//       appliedFilters.isFeatured ||
//       appliedFilters.isOnSale ||
//       appliedFilters.minRating !== undefined ||
//       (appliedPriceRange.min > 0 || appliedPriceRange.max !== Infinity)
//     );
//   }, [currentPage, sortOrder, appliedFilters, appliedPriceRange]);

//   const canonicalUrl = useMemo(() => {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
//     if (context.type === "category" && context.value) {
//       return `${baseUrl}/category/${context.value}`;
//     }
//     if (context.type === "deals") {
//       return `${baseUrl}/deals`;
//     }
//     if (context.type === "search") {
//       return `${baseUrl}/search`;
//     }
//     return `${baseUrl}`;
//   }, [context]);

//   const initialPayloadRef = useRef<any>(null);
//   const hasMountedRef = useRef(false);

//   useEffect(() => {
//     if (!hasMountedRef.current) {
//       hasMountedRef.current = true;
//       const minPrice = Math.max(0, appliedPriceRange.min);
//       const maxPrice = appliedPriceRange.max === Infinity ? undefined : Math.max(0, appliedPriceRange.max);
//       initialPayloadRef.current = {
//         page: 1,
//         sortOrder: context.sort || "best-match",
//         filters: {
//           brands: [],
//           categories: [],
//           isFeatured: context.filter === "isFeatured",
//         },
//         priceRange: {
//           min: minPrice,
//           max: maxPrice,
//         },
//         context,
//       };
//     }
//   }, [context, appliedPriceRange, appliedFilters, sortOrder]);

//   useEffect(() => {
//     const handleCloseSidebar = () => setIsSidebarOpen(false);
//     window.addEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
//     return () => window.removeEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
//   }, []);

//   const debouncedFetch = useMemo(
//     () =>
//       debounce(async (params: any) => {
//         if (isFetching.current) return;
//         isFetching.current = true;
//         setIsLoading(true);

//         try {
//           const response = await fetch("/api/filter", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(params),
//           });

//           if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || "API request failed");
//           }

//           const data = await response.json();
//           setProducts(data.products || []);
//           setTotalProducts(data.totalCount || 0);
//         } catch (error) {
//           console.error("Failed to fetch products:", error);
//           setProducts([]);
//           setTotalProducts(0);
//         } finally {
//           setIsLoading(false);
//           isFetching.current = false;
//         }
//       }, 500),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedFetch.cancel();
//     };
//   }, [debouncedFetch]);

//   const isFetching = useRef(false);

//   useEffect(() => {
//     if (!initialPayloadRef.current) return;

//     const minPrice = Math.max(0, appliedPriceRange.min);
//     const maxPrice =
//       appliedPriceRange.max === Infinity
//         ? undefined
//         : Math.max(0, appliedPriceRange.max);

//     const payload = {
//       page: currentPage,
//       sortOrder,
//       filters: appliedFilters,
//       priceRange: {
//         min: minPrice,
//         max: maxPrice,
//       },
//       context,
//     };

//     const payloadString = JSON.stringify(payload);
//     const initialString = JSON.stringify(initialPayloadRef.current);

//     if (payloadString === initialString && hasMountedRef.current) {
//       return;
//     }

//     if (prevPayloadRef.current === payloadString) {
//       return;
//     }
//     prevPayloadRef.current = payloadString;

//     debouncedFetch(payload);
//   }, [
//     currentPage,
//     sortOrder,
//     appliedFilters,
//     appliedPriceRange,
//     context,
//     debouncedFetch,
//     initialPayloadRef,
//   ]);

//   const prevPayloadRef = useRef<any>(null);

//   useEffect(() => {
//     const params = new URLSearchParams(searchParams.toString());

//     if (currentPage > 1) {
//       params.set("page", currentPage.toString());
//     } else {
//       params.delete("page");
//     }

//     const newQuery = params.toString();
//     const currentQuery = searchParams.toString();

//     if (newQuery !== currentQuery) {
//       router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
//     }
//   }, [currentPage, appliedFilters, appliedPriceRange, sortOrder, pathname, router, searchParams]);

//   const updatePageToOne = () => {
//     setCurrentPage(1);
//   };

//   const handleFilterChange = (group: string, value: FilterValue) => {
//     updatePageToOne();

//     if (group === "minRating") {
//       if (value !== undefined && value !== null) {
//         setSortOrder("rating-low");
//       } else {
//         setSortOrder("best-match");
//       }
//     }

//     setAppliedFilters((prev) => {
//       if (group === "isOnSale") return { ...prev, isOnSale: value as boolean };
//       if (group === "minRating") return { ...prev, minRating: value as number };

//       const currentList: string[] = Array.isArray(prev[group]) ? (prev[group] as string[]) : [];
//       const stringValue = value as string;
//       const newList = currentList.includes(stringValue)
//         ? currentList.filter((v: string) => v !== stringValue)
//         : [...currentList, stringValue];

//       return { ...prev, [group]: newList };
//     });

//     logUserEvent("filter_applied", pathname, {
//       filter_group: group,
//       filter_value: value,
//       context_type: context.type,
//       context_value: context.value || "none",
//     });
//   };

//   const handlePriceApply = (price: { min: string; max: string }) => {
//     updatePageToOne();

//     let minVal = Math.max(0, Number(price.min) || 0);
//     let maxVal = Math.max(0, Number(price.max) || Infinity);

//     if (minVal > maxVal) {
//       [minVal, maxVal] = [maxVal, minVal];
//     }

//     setAppliedPriceRange({ min: minVal, max: maxVal });

//     logUserEvent("filter_applied", pathname, {
//       filter_group: "price_range",
//       filter_value: { min: minVal, max: maxVal === Infinity ? "unlimited" : maxVal },
//       context_type: context.type,
//       context_value: context.value || "none",
//     });
//   };

//   const handleSortChange = (value: string) => {
//     updatePageToOne();
//     setSortOrder(value);

//     logUserEvent("filter_applied", pathname, {
//       filter_group: "sorting_order",
//       filter_value: value,
//       context_type: context.type,
//       context_value: context.value || "none",
//     });
//   };

//   const handleClearFilters = () => {
//     updatePageToOne();
//     setAppliedFilters({
//       brands: [],
//       categories: [],
//       isFeatured: false,
//       isOnSale: false,
//       minRating: undefined,
//       availability: [],
//     });
//     setAppliedPriceRange({ min: 0, max: Infinity });
//     setSortOrder("best-match");

//     logUserEvent("filter_applied", pathname, {
//       filter_group: "reset_all",
//       filter_value: "cleared",
//       context_type: context.type,
//       context_value: context.value || "none",
//     });
//   };

//   const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

//   const uniqueBrandsForSidebar = useMemo(() => {
//     const rawBrands = (filterData?.brands?.filter(Boolean) as SanityBrand[]) || [];
//     return getUniqueItems(rawBrands, "_id");
//   }, [filterData]);

//   const uniqueAttributes = useMemo(() => {
//     const attrs: Record<string, Set<string>> = {};
//     if (filterData?.attributes) {
//       filterData.attributes.forEach((attr: any) => {
//         const name = attr._id || attr.name;
//         const values = attr.values || (attr.value ? [attr.value] : []);
//         if (!name || !values.length) return;
//         if (!attrs[name]) attrs[name] = new Set();
//         values.forEach((v: string) => attrs[name].add(v));
//       });
//     }
//     return Object.entries(attrs).map(([name, valuesSet]) => ({
//       name,
//       values: Array.from(valuesSet).sort(),
//     }));
//   }, [filterData]);

//   const showSkeletons = isLoading;

//   return (
//     <>
//       {hasActiveFilters && <link rel="canonical" href={canonicalUrl} />}

//       {/* ✅ FLEX CONTAINER: items-start allows desktop sticky sidebar to work */}
//       <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
//         {/* ✅ FILTER SIDEBAR UNWRAPPED: Available for both Desktop & Mobile! */}
//         <FilterSidebar
//           isOpen={isSidebarOpen}
//           onClose={() => setIsSidebarOpen(false)}
//           brands={uniqueBrandsForSidebar}
//           attributes={uniqueAttributes}
//           priceRange={filterData.priceRange}
//           appliedFilters={{
//             ...appliedFilters,
//             minPrice: appliedPriceRange.min,
//             maxPrice:
//               appliedPriceRange.max === Infinity
//                 ? filterData.priceRange.max
//                 : appliedPriceRange.max,
//           }}
//           onFilterChange={handleFilterChange}
//           onPriceApply={handlePriceApply}
//           onClearFilters={handleClearFilters}
//           categoryTree={categoryTree}
//           dealCategories={dealCategories}
//           isDesktopSidebarOpen={isDesktopSidebarOpen}
//         />

//         <main className="flex-1 w-full min-w-0" aria-label="Product listing">
          
//           <ListingHeader
//             productsCount={products.length}
//             totalCount={totalProducts}
//             sortOrder={sortOrder}
//             onSortChange={handleSortChange}
//             onMobileFilterClick={() => setIsSidebarOpen(true)}
//             appliedFilters={appliedFilters}
//             onRemoveFilter={handleFilterChange}
//             onClearAll={handleClearFilters}
//             isDesktopSidebarOpen={isDesktopSidebarOpen}
//             onToggleDesktopSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
//           />

//           <div className="relative min-h-[50vh]">
//             {showSkeletons ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
//                 {[...Array(15)].map((_, i) => (
//                   <div key={i} className="h-87.5">
//                     <ProductCardSkeleton />
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div>
//                 {products.length > 0 ? (
//                   <ProductGrid products={products} onQuickView={setQuickViewProduct} />
//                 ) : (
//                   <div
//                     className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
//                     role="status"
//                     aria-live="polite"
//                   >
//                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                       No Products Found
//                     </h3>
//                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                       Try adjusting your filters or clearing them.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {totalPages > 1 && (
//             <div className="mt-8">
//               <PaginationControls totalPages={totalPages} paramName="page" />
//             </div>
//           )}
//         </main>
//       </div>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={() => setQuickViewProduct(null)}
//         lowStockThreshold={lowStockThreshold}
//       />
//     </>
//   );
// }
// 📂 src/app/features/storefront/catalog/components/category/ProductListingClient.tsx

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";

import SanityProduct, { SanityBrand, SanityCategory } from "@/types";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "../product/ProductGrid";
import QuickViewModal from "../product/QuickViewModal";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import ListingHeader from "./ListingHeader";
import ProductCardSkeleton from "../product/ProductCardSkeleton";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

const PRODUCTS_PER_PAGE = 40;

function getUniqueItems<T>(items: T[], key: keyof T): T[] {
  const seen = new Set();
  return items.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

type FilterValue = string | boolean | number | undefined;

interface AppliedFilters {
  brands: string[];
  categories?: string[];
  isFeatured?: boolean;
  isOnSale?: boolean;
  minRating?: number;
  availability?: string[];
  [key: string]: FilterValue | string[] | undefined;
}

interface FilterData {
  brands: (SanityBrand | null)[];
  attributes: { name: string; value: string }[];
  priceRange: { min: number; max: number };
}

interface PLPProps {
  initialProducts: SanityProduct[];
  filterData: FilterData;
  categoryTree?: SanityCategory;
  dealCategories?: SanityCategory[];
  context: {
    type: "category" | "search" | "deals";
    value?: string;
    sort?: string;
    filter?: string;
  };
  totalCount: number;
  lowStockThreshold: number;
}

export default function ProductListingClient({
  initialProducts,
  filterData,
  categoryTree,
  dealCategories,
  context,
  totalCount,
  lowStockThreshold,
}: PLPProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(urlPage);

  useEffect(() => {
    setCurrentPage(urlPage);
  }, [urlPage]);

  const [products, setProducts] = useState(initialProducts);
  const [totalProducts, setTotalProducts] = useState(totalCount);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dynamic Desktop Toggle State
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
  const [sortOrder, setSortOrder] = useState(context.sort || "best-match");

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    brands: [],
    categories: [],
    isFeatured: context.filter === "isFeatured",
  });

  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: 0,
    max: Infinity,
  });

  const hasActiveFilters = useMemo(() => {
    return (
      currentPage > 1 ||
      sortOrder !== "best-match" ||
      appliedFilters.brands.length > 0 ||
      (appliedFilters.categories?.length ?? 0) > 0 ||
      appliedFilters.isFeatured ||
      appliedFilters.isOnSale ||
      appliedFilters.minRating !== undefined ||
      (appliedPriceRange.min > 0 || appliedPriceRange.max !== Infinity)
    );
  }, [currentPage, sortOrder, appliedFilters, appliedPriceRange]);

  const canonicalUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";
    if (context.type === "category" && context.value) {
      return `${baseUrl}/category/${context.value}`;
    }
    if (context.type === "deals") {
      return `${baseUrl}/deals`;
    }
    if (context.type === "search") {
      return `${baseUrl}/search`;
    }
    return `${baseUrl}`;
  }, [context]);

  const initialPayloadRef = useRef<any>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const minPrice = Math.max(0, appliedPriceRange.min);
      const maxPrice = appliedPriceRange.max === Infinity ? undefined : Math.max(0, appliedPriceRange.max);
      initialPayloadRef.current = {
        page: 1,
        sortOrder: context.sort || "best-match",
        filters: {
          brands: [],
          categories: [],
          isFeatured: context.filter === "isFeatured",
        },
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
        context,
      };
    }
  }, [context, appliedPriceRange, appliedFilters, sortOrder]);

  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    window.addEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
    return () => window.removeEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
  }, []);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (params: any) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setIsLoading(true);

        try {
          const response = await fetch("/api/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "API request failed");
          }

          const data = await response.json();
          setProducts(data.products || []);
          setTotalProducts(data.totalCount || 0);
        } catch (error) {
          console.error("Failed to fetch products:", error);
          setProducts([]);
          setTotalProducts(0);
        } finally {
          setIsLoading(false);
          isFetching.current = false;
        }
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const isFetching = useRef(false);

  useEffect(() => {
    if (!initialPayloadRef.current) return;

    const minPrice = Math.max(0, appliedPriceRange.min);
    const maxPrice =
      appliedPriceRange.max === Infinity
        ? undefined
        : Math.max(0, appliedPriceRange.max);

    const payload = {
      page: currentPage,
      sortOrder,
      filters: appliedFilters,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
      context,
    };

    const payloadString = JSON.stringify(payload);
    const initialString = JSON.stringify(initialPayloadRef.current);

    if (payloadString === initialString && hasMountedRef.current) {
      return;
    }

    if (prevPayloadRef.current === payloadString) {
      return;
    }
    prevPayloadRef.current = payloadString;

    debouncedFetch(payload);
  }, [
    currentPage,
    sortOrder,
    appliedFilters,
    appliedPriceRange,
    context,
    debouncedFetch,
    initialPayloadRef,
  ]);

  const prevPayloadRef = useRef<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      params.delete("page");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    }
  }, [currentPage, appliedFilters, appliedPriceRange, sortOrder, pathname, router, searchParams]);

  const updatePageToOne = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = (group: string, value: FilterValue) => {
    updatePageToOne();

    if (group === "minRating") {
      if (value !== undefined && value !== null) {
        setSortOrder("rating-low");
      } else {
        setSortOrder("best-match");
      }
    }

    setAppliedFilters((prev) => {
      if (group === "isOnSale") return { ...prev, isOnSale: value as boolean };
      if (group === "minRating") return { ...prev, minRating: value as number };

      const currentList: string[] = Array.isArray(prev[group]) ? (prev[group] as string[]) : [];
      const stringValue = value as string;
      const newList = currentList.includes(stringValue)
        ? currentList.filter((v: string) => v !== stringValue)
        : [...currentList, stringValue];

      return { ...prev, [group]: newList };
    });

    logUserEvent("filter_applied", pathname, {
      filter_group: group,
      filter_value: value,
      context_type: context.type,
      context_value: context.value || "none",
    });
  };

  const handlePriceApply = (price: { min: string; max: string }) => {
    updatePageToOne();

    let minVal = Math.max(0, Number(price.min) || 0);
    let maxVal = Math.max(0, Number(price.max) || Infinity);

    if (minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    setAppliedPriceRange({ min: minVal, max: maxVal });

    logUserEvent("filter_applied", pathname, {
      filter_group: "price_range",
      filter_value: { min: minVal, max: maxVal === Infinity ? "unlimited" : maxVal },
      context_type: context.type,
      context_value: context.value || "none",
    });
  };

  const handleSortChange = (value: string) => {
    updatePageToOne();
    setSortOrder(value);

    logUserEvent("filter_applied", pathname, {
      filter_group: "sorting_order",
      filter_value: value,
      context_type: context.type,
      context_value: context.value || "none",
    });
  };

  const handleClearFilters = () => {
    updatePageToOne();
    setAppliedFilters({
      brands: [],
      categories: [],
      isFeatured: false,
      isOnSale: false,
      minRating: undefined,
      availability: [],
    });
    setAppliedPriceRange({ min: 0, max: Infinity });
    setSortOrder("best-match");

    logUserEvent("filter_applied", pathname, {
      filter_group: "reset_all",
      filter_value: "cleared",
      context_type: context.type,
      context_value: context.value || "none",
    });
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const uniqueBrandsForSidebar = useMemo(() => {
    const rawBrands = (filterData?.brands?.filter(Boolean) as SanityBrand[]) || [];
    return getUniqueItems(rawBrands, "_id");
  }, [filterData]);

  const uniqueAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};
    if (filterData?.attributes) {
      filterData.attributes.forEach((attr: any) => {
        const name = attr._id || attr.name;
        const values = attr.values || (attr.value ? [attr.value] : []);
        if (!name || !values.length) return;
        if (!attrs[name]) attrs[name] = new Set();
        values.forEach((v: string) => attrs[name].add(v));
      });
    }
    return Object.entries(attrs).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet).sort(),
    }));
  }, [filterData]);

  const showSkeletons = isLoading;

  return (
    <>
      {hasActiveFilters && <link rel="canonical" href={canonicalUrl} />}

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* WATER-FLOW ANIMATED DESKTOP SIDEBAR WRAPPER */}
        <AnimatePresence initial={false}>
          {isDesktopSidebarOpen && (
            <motion.div
              key="desktop-filter-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "18rem", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden lg:block shrink-0 overflow-hidden z-20 sticky top-33.75 h-[calc(100vh-160px)]"
            >
              <FilterSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                brands={uniqueBrandsForSidebar}
                attributes={uniqueAttributes}
                priceRange={filterData.priceRange}
                appliedFilters={{
                  ...appliedFilters,
                  minPrice: appliedPriceRange.min,
                  maxPrice:
                    appliedPriceRange.max === Infinity
                      ? filterData.priceRange.max
                      : appliedPriceRange.max,
                }}
                onFilterChange={handleFilterChange}
                onPriceApply={handlePriceApply}
                onClearFilters={handleClearFilters}
                categoryTree={categoryTree}
                dealCategories={dealCategories}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full min-w-0" aria-label="Product listing">
          
          <ListingHeader
            productsCount={products.length}
            totalCount={totalProducts}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onMobileFilterClick={() => setIsSidebarOpen(true)}
            appliedFilters={appliedFilters}
            onRemoveFilter={handleFilterChange}
            onClearAll={handleClearFilters}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            onToggleDesktopSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
          />

          <div className="relative min-h-[50vh]">
            {showSkeletons ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="h-87.5">
                    <ProductCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {products.length > 0 ? (
                  <ProductGrid products={products} onQuickView={setQuickViewProduct} />
                ) : (
                  <div
                    className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
                    role="status"
                    aria-live="polite"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      No Products Found
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your filters or clearing them.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationControls totalPages={totalPages} paramName="page" />
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        lowStockThreshold={lowStockThreshold}
      />
    </>
  );
}