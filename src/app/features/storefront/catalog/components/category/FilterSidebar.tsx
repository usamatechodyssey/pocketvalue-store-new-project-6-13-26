
// // 📂 src/app/features/storefront/catalog/components/category/FilterSidebar.tsx

// "use client";

// import { memo, useEffect, useMemo } from "react";
// import { usePathname } from "next/navigation";
// import { SanityBrand, SanityCategory } from "@/types";
// import { X, Filter, Zap } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// import FilterSection from "./FilterSection";
// import CategoryNode from "./FilterCategoryTree";
// import FilterCheckboxRow from "./FilterCheckboxRow";
// import SearchableFilterList from "./SearchableFilterList";
// import DualRangeSlider from "./DualRangeSlider";
// import StarRatingFilter from "./StarRatingFilter";

// interface Filters {
//   brands: string[];
//   categories?: string[];
//   availability?: string[];
//   isOnSale?: boolean;
//   minRating?: number;
//   [key: string]: any;
// }

// interface FilterSidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   brands: SanityBrand[];
//   attributes: { name: string; values: string[] }[];
//   priceRange: { min: number | null; max: number | null };
//   appliedFilters: Filters;
//   onFilterChange: (group: string, value: any) => void;
//   onPriceApply: (price: { min: string; max: string }) => void;
//   onClearFilters: () => void;
//   categoryTree?: SanityCategory;
//   dealCategories?: SanityCategory[];
// }

// const FilterSidebar = memo(function FilterSidebar({
//   isOpen,
//   onClose,
//   brands,
//   attributes,
//   priceRange,
//   appliedFilters,
//   onFilterChange,
//   onPriceApply,
//   onClearFilters,
//   categoryTree,
//   dealCategories,
// }: FilterSidebarProps) {
//   const pathname = usePathname();

//   // Close sidebar on route change
//   useEffect(() => {
//     if (isOpen) {
//       onClose();
//     }
//   }, [pathname]);

//   // Current price values
//   const currentMinPrice =
//     appliedFilters.minPrice !== undefined && appliedFilters.minPrice !== null
//       ? Number(appliedFilters.minPrice)
//       : priceRange.min ?? 0;

//   const currentMaxPrice =
//     appliedFilters.maxPrice !== undefined && appliedFilters.maxPrice !== null
//       ? Number(appliedFilters.maxPrice)
//       : priceRange.max ?? 10000;

//   // Memoize brand items
//   const brandItems = useMemo(
//     () => brands.map((b) => ({ id: b._id, name: b.name, value: b.slug })),
//     [brands]
//   );

//   // Memoize attribute items
//   const attributeItemsMap = useMemo(() => {
//     return attributes.map((attr) => ({
//       name: attr.name,
//       items: attr.values.map((v) => ({ id: v, name: v, value: v })),
//     }));
//   }, [attributes]);

//   // Memoize sidebar content
//   const sidebarContentJsx = useMemo(
//     () => (
//       <div className="flex flex-col h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl text-zinc-700 dark:text-zinc-300 overflow-hidden">
//         {/* HEADER */}
//         <div className="shrink-0 p-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-10 select-none">
//           <div className="flex items-center gap-2.5">
//             <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary shadow-[0_0_10px_rgba(255,143,50,0.15)]">
//               <Filter size={16} aria-hidden="true" />
//             </div>
//             <h2 className="text-base font-clash font-extrabold text-zinc-900 dark:text-white">
//               Filters
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             aria-label="Close filters"
//             className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors lg:hidden cursor-pointer"
//           >
//             <X size={18} aria-hidden="true" />
//           </button>
//         </div>

//         {/* SCROLLABLE MIDDLE SECTION */}
//         <div className="px-5 pt-3 pb-6 overflow-y-auto custom-scrollbar grow space-y-4">
//           {categoryTree && (
//             <FilterSection title="Categories">
//               <ul className="space-y-0.5" role="tree">
//                 <CategoryNode category={categoryTree} parentPath={`/category`} />
//               </ul>
//             </FilterSection>
//           )}

//           {dealCategories && dealCategories.length > 0 && (
//             <FilterSection title="Deal Categories">
//               <div className="space-y-1">
//                 {dealCategories.map((cat) => (
//                   <FilterCheckboxRow
//                     key={cat._id}
//                     label={cat.name}
//                     checked={appliedFilters.categories?.includes(cat.slug) || false}
//                     onChange={() => onFilterChange("categories", cat.slug)}
//                   />
//                 ))}
//               </div>
//             </FilterSection>
//           )}

//           <FilterSection title="Promotions" defaultOpen={true}>
//             <div className="space-y-1">
//               <label className="flex items-center gap-3 cursor-pointer group py-2 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors select-none">
//                 <div
//                   className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 
//                     ${
//                       appliedFilters.isOnSale
//                         ? "bg-brand-primary border-brand-primary shadow-[0_0_10px_rgba(255,143,50,0.25)]"
//                         : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-brand-primary"
//                     }`}
//                 >
//                   {appliedFilters.isOnSale && (
//                     <Zap size={11} className="text-white fill-white" aria-hidden="true" />
//                   )}
//                 </div>
//                 <input
//                   type="checkbox"
//                   checked={!!appliedFilters.isOnSale}
//                   onChange={() => onFilterChange("isOnSale", !appliedFilters.isOnSale)}
//                   className="hidden"
//                 />
//                 <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
//                   On Sale / Deals
//                 </span>
//               </label>
//             </div>
//           </FilterSection>

//           {/* PRICE RANGE SLIDER */}
//           <FilterSection title="Price Range" defaultOpen={true}>
//             <DualRangeSlider
//               min={priceRange.min ?? 0}
//               max={priceRange.max ?? 10000}
//               currentMin={currentMinPrice}
//               currentMax={currentMaxPrice}
//               onChange={(min, max) => onPriceApply({ min, max })}
//             />
//           </FilterSection>

//           <FilterSection title="Availability">
//             <FilterCheckboxRow
//               label="In Stock"
//               checked={appliedFilters.availability?.includes("in-stock") || false}
//               onChange={() => onFilterChange("availability", "in-stock")}
//             />
//           </FilterSection>

//           <FilterSection title="Customer Ratings">
//             <StarRatingFilter
//               selectedRating={appliedFilters.minRating || null}
//               onChange={(rating) => onFilterChange("minRating", rating)}
//             />
//           </FilterSection>

//           {brands.length > 0 && (
//             <FilterSection title="Brands">
//               <SearchableFilterList
//                 items={brandItems}
//                 selectedValues={appliedFilters.brands || []}
//                 onChange={(val) => onFilterChange("brands", val)}
//                 placeholder="Find a brand..."
//               />
//             </FilterSection>
//           )}

//           {attributeItemsMap.map((attr) => (
//             <FilterSection title={attr.name} key={attr.name} defaultOpen={false}>
//               <SearchableFilterList
//                 items={attr.items}
//                 selectedValues={appliedFilters[attr.name] || []}
//                 onChange={(val) => onFilterChange(attr.name, val)}
//                 placeholder={`Search ${attr.name}...`}
//               />
//             </FilterSection>
//           ))}
//         </div>

//         {/* FOOTER */}
//         <div className="shrink-0 p-5 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-md z-10 mt-auto select-none">
//           <button
//             onClick={onClearFilters}
//             className="w-full py-3.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-rose-500/10 dark:hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-mono"
//           >
//             <X size={14} aria-hidden="true" />
//             Reset All Filters
//           </button>
//         </div>
//       </div>
//     ),
//     [
//       categoryTree,
//       dealCategories,
//       appliedFilters,
//       onFilterChange,
//       onClose,
//       priceRange,
//       currentMinPrice,
//       currentMaxPrice,
//       onPriceApply,
//       brands,
//       brandItems,
//       attributeItemsMap,
//       onClearFilters,
//     ]
//   );

//   return (
//     <>
//       {/* ✅ FIX: No sticky or height classes here anymore. Outer motion.div handles it! */}
//       <aside className="hidden lg:block w-72 h-full shrink-0" aria-label="Product filters">
//         <div className="flex flex-col h-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-gray-900 overflow-hidden shadow-2xs">
//           {sidebarContentJsx}
//         </div>
//       </aside>

//       {/* MOBILE SIDEBAR */}
//       <AnimatePresence>
//         {isOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               onClick={onClose}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
//               aria-hidden="true"
//             />
//             <motion.div
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               role="dialog"
//               aria-modal="true"
//               aria-label="Filter sidebar"
//               className="fixed top-0 left-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-40 flex flex-col lg:hidden shadow-2xl overflow-hidden h-dvh pb-20 md:pb-0"
//             >
//               <div className="h-full flex flex-col">{sidebarContentJsx}</div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// });

// export default FilterSidebar;
// 📂 src/app/features/storefront/catalog/components/category/FilterSidebar.tsx

"use client";

import { memo, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SanityBrand, SanityCategory } from "@/types";
import { X, Filter, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import FilterSection from "./FilterSection";
import CategoryNode from "./FilterCategoryTree";
import FilterCheckboxRow from "./FilterCheckboxRow";
import SearchableFilterList from "./SearchableFilterList";
import DualRangeSlider from "./DualRangeSlider";
import StarRatingFilter from "./StarRatingFilter";

interface Filters {
  brands: string[];
  categories?: string[];
  availability?: string[];
  isOnSale?: boolean;
  minRating?: number;
  [key: string]: any;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  brands: SanityBrand[];
  attributes: { name: string; values: string[] }[];
  priceRange: { min: number | null; max: number | null };
  appliedFilters: Filters;
  onFilterChange: (group: string, value: any) => void;
  onPriceApply: (price: { min: string; max: string }) => void;
  onClearFilters: () => void;
  categoryTree?: SanityCategory;
  dealCategories?: SanityCategory[];
  // ✅ DESKTOP VISIBILITY PROP
  isDesktopSidebarOpen?: boolean;
}

const FilterSidebar = memo(function FilterSidebar({
  isOpen,
  onClose,
  brands,
  attributes,
  priceRange,
  appliedFilters,
  onFilterChange,
  onPriceApply,
  onClearFilters,
  categoryTree,
  dealCategories,
  isDesktopSidebarOpen = true,
}: FilterSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  const currentMinPrice =
    appliedFilters.minPrice !== undefined && appliedFilters.minPrice !== null
      ? Number(appliedFilters.minPrice)
      : priceRange.min ?? 0;

  const currentMaxPrice =
    appliedFilters.maxPrice !== undefined && appliedFilters.maxPrice !== null
      ? Number(appliedFilters.maxPrice)
      : priceRange.max ?? 10000;

  const brandItems = useMemo(
    () => brands.map((b) => ({ id: b._id, name: b.name, value: b.slug })),
    [brands]
  );

  const attributeItemsMap = useMemo(() => {
    return attributes.map((attr) => ({
      name: attr.name,
      items: attr.values.map((v) => ({ id: v, name: v, value: v })),
    }));
  }, [attributes]);

  const sidebarContentJsx = useMemo(
    () => (
      <div className="flex flex-col h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl text-zinc-700 dark:text-zinc-300 overflow-hidden">
        {/* HEADER */}
        <div className="shrink-0 p-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-10 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary shadow-[0_0_10px_rgba(255,143,50,0.15)]">
              <Filter size={16} aria-hidden="true" />
            </div>
            <h2 className="text-base font-clash font-extrabold text-zinc-900 dark:text-white">
              Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors lg:hidden cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* SCROLLABLE MIDDLE SECTION */}
        <div className="px-5 pt-3 pb-6 overflow-y-auto custom-scrollbar grow space-y-4">
          {categoryTree && (
            <FilterSection title="Categories">
              <ul className="space-y-0.5" role="tree">
                <CategoryNode category={categoryTree} parentPath={`/category`} />
              </ul>
            </FilterSection>
          )}

          {dealCategories && dealCategories.length > 0 && (
            <FilterSection title="Deal Categories">
              <div className="space-y-1">
                {dealCategories.map((cat) => (
                  <FilterCheckboxRow
                    key={cat._id}
                    label={cat.name}
                    checked={appliedFilters.categories?.includes(cat.slug) || false}
                    onChange={() => onFilterChange("categories", cat.slug)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection title="Promotions" defaultOpen={true}>
            <div className="space-y-1">
              <label className="flex items-center gap-3 cursor-pointer group py-2 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors select-none">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 
                    ${
                      appliedFilters.isOnSale
                        ? "bg-brand-primary border-brand-primary shadow-[0_0_10px_rgba(255,143,50,0.25)]"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-brand-primary"
                    }`}
                >
                  {appliedFilters.isOnSale && (
                    <Zap size={11} className="text-white fill-white" aria-hidden="true" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={!!appliedFilters.isOnSale}
                  onChange={() => onFilterChange("isOnSale", !appliedFilters.isOnSale)}
                  className="hidden"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  On Sale / Deals
                </span>
              </label>
            </div>
          </FilterSection>

          {/* PRICE RANGE SLIDER */}
          <FilterSection title="Price Range" defaultOpen={true}>
            <DualRangeSlider
              min={priceRange.min ?? 0}
              max={priceRange.max ?? 10000}
              currentMin={currentMinPrice}
              currentMax={currentMaxPrice}
              onChange={(min, max) => onPriceApply({ min, max })}
            />
          </FilterSection>

          <FilterSection title="Availability">
            <FilterCheckboxRow
              label="In Stock"
              checked={appliedFilters.availability?.includes("in-stock") || false}
              onChange={() => onFilterChange("availability", "in-stock")}
            />
          </FilterSection>

          <FilterSection title="Customer Ratings">
            <StarRatingFilter
              selectedRating={appliedFilters.minRating || null}
              onChange={(rating) => onFilterChange("minRating", rating)}
            />
          </FilterSection>

          {brands.length > 0 && (
            <FilterSection title="Brands">
              <SearchableFilterList
                items={brandItems}
                selectedValues={appliedFilters.brands || []}
                onChange={(val) => onFilterChange("brands", val)}
                placeholder="Find a brand..."
              />
            </FilterSection>
          )}

          {attributeItemsMap.map((attr) => (
            <FilterSection title={attr.name} key={attr.name} defaultOpen={false}>
              <SearchableFilterList
                items={attr.items}
                selectedValues={appliedFilters[attr.name] || []}
                onChange={(val) => onFilterChange(attr.name, val)}
                placeholder={`Search ${attr.name}...`}
              />
            </FilterSection>
          ))}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 p-5 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-gray-950/40 backdrop-blur-md z-10 mt-auto select-none">
          <button
            onClick={onClearFilters}
            className="w-full py-3.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-rose-500/10 dark:hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-mono"
          >
            <X size={14} aria-hidden="true" />
            Reset All Filters
          </button>
        </div>
      </div>
    ),
    [
      categoryTree,
      dealCategories,
      appliedFilters,
      onFilterChange,
      onClose,
      priceRange,
      currentMinPrice,
      currentMaxPrice,
      onPriceApply,
      brands,
      brandItems,
      attributeItemsMap,
      onClearFilters,
    ]
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (DECOUPLED FROM MOBILE DRAWER) */}
      <AnimatePresence initial={false}>
        {isDesktopSidebarOpen && (
          <motion.aside
            key="desktop-filter-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "18rem", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="hidden lg:block shrink-0 overflow-hidden z-20 sticky top-33.75 h-[calc(100vh-160px)] self-start"
            aria-label="Product filters"
          >
            <div className="flex flex-col h-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-gray-900 overflow-hidden shadow-2xs">
              {sidebarContentJsx}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MOBILE SIDEBAR (100% INDEPENDENT OVERLAY ON Z-50) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter sidebar"
              className="fixed top-0 left-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-50 flex flex-col lg:hidden shadow-2xl overflow-hidden h-dvh pb-20 md:pb-0"
            >
              <div className="h-full flex flex-col">{sidebarContentJsx}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

export default FilterSidebar;