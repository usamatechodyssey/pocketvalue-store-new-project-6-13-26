
// // 📂 src/app/features/storefront/catalog/components/category/ListingHeader.tsx

// "use client";

// import { useMemo } from "react";
// import { ChevronDown, X, Trash2, SlidersHorizontal } from "lucide-react";
// import MobileFilterButton from "@/app/shared/components/ui/MobileFilterButton";
// import { motion, AnimatePresence } from "framer-motion";

// interface AppliedFilters {
//   brands: string[];
//   categories?: string[];
//   availability?: string[];
//   isOnSale?: boolean;
//   minRating?: number;
//   [key: string]: any;
// }

// interface ListingHeaderProps {
//   productsCount: number;
//   totalCount: number;
//   sortOrder: string;
//   onSortChange: (value: string) => void;
//   onMobileFilterClick: () => void;
//   appliedFilters: AppliedFilters;
//   onRemoveFilter: (group: string, value: any) => void;
//   onClearAll: () => void;
//   // ✅ DESKTOP TOGGLE PROPS
//   isDesktopSidebarOpen?: boolean;
//   onToggleDesktopSidebar?: () => void;
// }

// export default function ListingHeader({
//   productsCount,
//   totalCount,
//   sortOrder,
//   onSortChange,
//   onMobileFilterClick,
//   appliedFilters,
//   onRemoveFilter,
//   onClearAll,
//   isDesktopSidebarOpen = true,
//   onToggleDesktopSidebar,
// }: ListingHeaderProps) {

//   const activeTags = useMemo(() => {
//     const tags: { id: string; group: string; value: any; label: string }[] = [];

//     if (appliedFilters.brands?.length) {
//       appliedFilters.brands.forEach((brand) => {
//         tags.push({ id: `brand-${brand}`, group: "brands", value: brand, label: `Brand: ${brand}` });
//       });
//     }
    
//     if (appliedFilters.availability?.includes("in-stock")) {
//       tags.push({ id: "stock-in", group: "availability", value: "in-stock", label: "In Stock" });
//     }

//     if (appliedFilters.isOnSale) {
//       tags.push({ id: "sale-true", group: "isOnSale", value: true, label: "On Sale" });
//     }

//     if (appliedFilters.minRating) {
//       tags.push({ id: `rating-${appliedFilters.minRating}`, group: "minRating", value: appliedFilters.minRating, label: `${appliedFilters.minRating}+ Stars` });
//     }

//     Object.keys(appliedFilters).forEach((key) => {
//       if (["brands", "categories", "availability", "isOnSale", "minRating", "isFeatured", "priceRange"].includes(key)) return;
//       const values = appliedFilters[key];
//       if (Array.isArray(values) && values.length > 0) {
//         const labelKey = key.replace("Values", "").charAt(0).toUpperCase() + key.replace("Values", "").slice(1);
//         values.forEach((val) => {
//           tags.push({ id: `${key}-${val}`, group: key, value: val, label: `${labelKey}: ${val}` });
//         });
//       }
//     });

//     return tags;
//   }, [appliedFilters]);

//   const handleTagRemove = (group: string, value: any) => {
//     if (group === "isOnSale") {
//         onRemoveFilter(group, false);
//     } else if (group === "minRating") {
//         onRemoveFilter(group, undefined);
//     } else {
//         onRemoveFilter(group, value);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 mb-6">
      
//       {/* --- TOP ROW (Controls) --- */}
//       <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
//         <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
//           Showing <span className="font-bold text-gray-800 dark:text-gray-200">{productsCount}</span> of <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> results
//         </p>
        
//         <div className="flex items-center gap-2 sm:gap-4">
//           <div className="lg:hidden">
//             <MobileFilterButton onClick={onMobileFilterClick} />
//           </div>

//           {/* ✅ DESKTOP SHOW/HIDE FILTERS TOGGLE BUTTON (Placed right next to Sort Dropdown) */}
//           {onToggleDesktopSidebar && (
//             <button
//               onClick={onToggleDesktopSidebar}
//               className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 text-xs font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:text-brand-primary transition-all rounded-lg cursor-pointer shadow-2xs select-none"
//               aria-label={isDesktopSidebarOpen ? "Hide filters sidebar" : "Show filters sidebar"}
//             >
//               <SlidersHorizontal size={14} className="text-brand-primary shrink-0" />
//               <span className="whitespace-nowrap">{isDesktopSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
//             </button>
//           )}

//           {/* SORT BY DROPDOWN */}
//           <div className="relative">
//             <select
//               id="sort-by"
//               aria-label="Sort products by"
//               value={sortOrder}
//               onChange={(e) => onSortChange(e.target.value)}
//               className="appearance-none bg-gray-50 dark:bg-gray-800 pl-3 sm:pl-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary pr-8 sm:pr-9 cursor-pointer"
//             >
//               <option value="best-match">Best Match</option>
//               <option value="best-selling">Best Selling</option>
//               <option value="newest">Newest</option>
//               <option value="price-low-to-high">Price: Low-High</option>
//               <option value="price-high-to-low">Price: High-Low</option>
//               <option value="rating-high">Highest Rated</option>
//             </select>
//             <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" aria-hidden="true" />
//           </div>
//         </div>
//       </div>

//       {/* --- ACTIVE TAGS SECTION (RESPONSIVE) --- */}
//       <AnimatePresence>
//         {activeTags.length > 0 && (
//           <motion.div 
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="w-full flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 overflow-hidden" 
//           >
            
//             {/* MOBILE HEADER ROW */}
//             <div className="flex lg:hidden justify-between items-center w-full px-1">
//                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                     Active Filters:
//                 </span>
//                 <button
//                     onClick={onClearAll}
//                     aria-label="Clear all filters"
//                     className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-danger transition-colors"
//                 >
//                     <Trash2 size={14} aria-hidden="true" />
//                     Clear All
//                 </button>
//             </div>

//             {/* DESKTOP LABEL */}
//             <span className="hidden lg:block shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                 Active Filters:
//             </span>

//             {/* SCROLLABLE TAGS AREA */}
//             <div className="w-full lg:flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 
//                mask-[linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]"
//             >
//                 {activeTags.map((tag) => (
//                 <motion.button
//                     key={tag.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.8 }}
//                     onClick={() => handleTagRemove(tag.group, tag.value)}
//                     aria-label={`Remove ${tag.label} filter`}
//                     className="shrink-0 group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary hover:bg-brand-danger/10 hover:border-brand-danger/20 hover:text-brand-danger transition-colors whitespace-nowrap"
//                 >
//                     <span>{tag.label}</span>
//                     <X size={14} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
//                 </motion.button>
//                 ))}
//             </div>

//             {/* DESKTOP CLEAR BUTTON & DIVIDER */}
//             <div className="hidden lg:flex items-center gap-3 shrink-0">
//                 <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
//                 <button
//                     onClick={onClearAll}
//                     aria-label="Clear all filters"
//                     className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-danger transition-colors whitespace-nowrap px-1"
//                 >
//                     <Trash2 size={14} aria-hidden="true" />
//                     Clear All
//                 </button>
//             </div>

//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
// 📂 src/app/features/storefront/catalog/components/category/ListingHeader.tsx

"use client";

import { useMemo } from "react";
import { ChevronDown, X, Trash2, SlidersHorizontal } from "lucide-react";
import MobileFilterButton from "@/app/shared/components/ui/MobileFilterButton";
import { motion, AnimatePresence } from "framer-motion";

interface AppliedFilters {
  brands: string[];
  categories?: string[];
  availability?: string[];
  isOnSale?: boolean;
  minRating?: number;
  [key: string]: any;
}

interface ListingHeaderProps {
  productsCount: number;
  totalCount: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
  onMobileFilterClick: () => void;
  appliedFilters: AppliedFilters;
  onRemoveFilter: (group: string, value: any) => void;
  onClearAll: () => void;
  // ✅ DESKTOP TOGGLE PROPS
  isDesktopSidebarOpen?: boolean;
  onToggleDesktopSidebar?: () => void;
}

export default function ListingHeader({
  productsCount,
  totalCount,
  sortOrder,
  onSortChange,
  onMobileFilterClick,
  appliedFilters,
  onRemoveFilter,
  onClearAll,
  isDesktopSidebarOpen = true,
  onToggleDesktopSidebar,
}: ListingHeaderProps) {

  const activeTags = useMemo(() => {
    const tags: { id: string; group: string; value: any; label: string }[] = [];

    if (appliedFilters.brands?.length) {
      appliedFilters.brands.forEach((brand) => {
        tags.push({ id: `brand-${brand}`, group: "brands", value: brand, label: `Brand: ${brand}` });
      });
    }
    
    if (appliedFilters.availability?.includes("in-stock")) {
      tags.push({ id: "stock-in", group: "availability", value: "in-stock", label: "In Stock" });
    }

    if (appliedFilters.isOnSale) {
      tags.push({ id: "sale-true", group: "isOnSale", value: true, label: "On Sale" });
    }

    if (appliedFilters.minRating) {
      tags.push({ id: `rating-${appliedFilters.minRating}`, group: "minRating", value: appliedFilters.minRating, label: `${appliedFilters.minRating}+ Stars` });
    }

    Object.keys(appliedFilters).forEach((key) => {
      if (["brands", "categories", "availability", "isOnSale", "minRating", "isFeatured", "priceRange"].includes(key)) return;
      const values = appliedFilters[key];
      if (Array.isArray(values) && values.length > 0) {
        const labelKey = key.replace("Values", "").charAt(0).toUpperCase() + key.replace("Values", "").slice(1);
        values.forEach((val) => {
          tags.push({ id: `${key}-${val}`, group: key, value: val, label: `${labelKey}: ${val}` });
        });
      }
    });

    return tags;
  }, [appliedFilters]);

  const handleTagRemove = (group: string, value: any) => {
    if (group === "isOnSale") {
        onRemoveFilter(group, false);
    } else if (group === "minRating") {
        onRemoveFilter(group, undefined);
    } else {
        onRemoveFilter(group, value);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* --- TOP ROW (Controls) --- */}
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-bold text-gray-800 dark:text-gray-200">{productsCount}</span> of <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> results
        </p>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="lg:hidden">
            <MobileFilterButton onClick={onMobileFilterClick} />
          </div>

          {/* ✅ DESKTOP SHOW/HIDE FILTERS TOGGLE BUTTON */}
          {onToggleDesktopSidebar && (
            <button
              onClick={onToggleDesktopSidebar}
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 text-xs font-mono font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:text-brand-primary transition-all rounded-lg cursor-pointer shadow-2xs select-none"
              aria-label={isDesktopSidebarOpen ? "Hide filters sidebar" : "Show filters sidebar"}
            >
              <SlidersHorizontal size={14} className="text-brand-primary shrink-0" />
              <span className="whitespace-nowrap">{isDesktopSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>
          )}

          {/* SORT BY DROPDOWN */}
          <div className="relative">
            <select
              id="sort-by"
              aria-label="Sort products by"
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-800 pl-3 sm:pl-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary pr-8 sm:pr-9 cursor-pointer"
            >
              <option value="best-match">Best Match</option>
              <option value="best-selling">Best Selling</option>
              <option value="newest">Newest</option>
              <option value="price-low-to-high">Price: Low-High</option>
              <option value="price-high-to-low">Price: High-Low</option>
              {/* ✅ RATING SORTING OPTIONS: Low-to-High & High-to-Low */}
              <option value="rating-high">Rating: High-Low</option>
              <option value="rating-low">Rating: Low-High</option>
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* --- ACTIVE TAGS SECTION (RESPONSIVE) --- */}
      <AnimatePresence>
        {activeTags.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 overflow-hidden" 
          >
            
            {/* MOBILE HEADER ROW */}
            <div className="flex lg:hidden justify-between items-center w-full px-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Active Filters:
                </span>
                <button
                    onClick={onClearAll}
                    aria-label="Clear all filters"
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-danger transition-colors"
                >
                    <Trash2 size={14} aria-hidden="true" />
                    Clear All
                </button>
            </div>

            {/* DESKTOP LABEL */}
            <span className="hidden lg:block shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Active Filters:
            </span>

            {/* SCROLLABLE TAGS AREA */}
            <div className="w-full lg:flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 
               mask-[linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]"
            >
                {activeTags.map((tag) => (
                <motion.button
                    key={tag.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleTagRemove(tag.group, tag.value)}
                    aria-label={`Remove ${tag.label} filter`}
                    className="shrink-0 group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary hover:bg-brand-danger/10 hover:border-brand-danger/20 hover:text-brand-danger transition-colors whitespace-nowrap"
                >
                    <span>{tag.label}</span>
                    <X size={14} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                </motion.button>
                ))}
            </div>

            {/* DESKTOP CLEAR BUTTON & DIVIDER */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
                <button
                    onClick={onClearAll}
                    aria-label="Clear all filters"
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-danger transition-colors whitespace-nowrap px-1"
                >
                    <Trash2 size={14} aria-hidden="true" />
                    Clear All
                </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}