
// // src/app/components/product/ProductGrid.tsx (UPGRADED WITH COMPONENT RANKINGS)

// "use client";

// import SanityProduct from "@/types";
// import { SlidersHorizontal } from "lucide-react";
// import ProductCard from "./ProductCard";

// interface ProductGridProps {
//   products: SanityProduct[];
//   onQuickView: (product: SanityProduct) => void;
// }

// export default function ProductGrid({
//   products,
//   onQuickView,
// }: ProductGridProps) {
//   return (
//     <>
//       {products.length > 0 ? (
//         // ✅ ENTERPRISE UPGRADE: Replaced hardcoded grid items h-full with h-auto
//         // This ensures the flex column wrapper doesn't collapse to 0 height in CSS Grid rows, letting the aspect ratio of the image stretch the card naturally
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ">
//           {products.map((product, index) => (
//             <ProductCard
//               key={product._id}
//               product={product}
//               onQuickView={onQuickView}
//               className="h-auto" // ✅ Replaced 'h-full' with 'h-auto' to completely prevent PLP image height collapse
//               // 🚀 Gap #8: Pass relative listing rank to the card dynamically
//               rank={index + 1}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
//           <SlidersHorizontal size={48} className="mx-auto text-gray-400" />
//           <h3 className="mt-4 text-xl font-semibold text-text-primary dark:text-gray-200">
//             No Products Found
//           </h3>
//           <p className="text-text-secondary dark:text-gray-400 mt-2 max-w-sm mx-auto">
//             Try adjusting your filters or clearing them to see all available
//             products.
//           </p>
//         </div>
//       )}
//     </>
//   );
// }
// 📂 src/app/features/storefront/catalog/components/product/ProductGrid.tsx

"use client";

import SanityProduct from "@/types";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: SanityProduct[];
  onQuickView: (product: SanityProduct) => void;
}

export default function ProductGrid({
  products,
  onQuickView,
}: ProductGridProps) {
  return (
    <div className="w-full min-w-0">
      {products.length > 0 ? (
        /* ✅ FIXED: Adjusted gap to gap-3 md:gap-4. This snug 16px gutter on desktop prevents wide empty spaces when a sidebar filter is present! */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 w-full">
          {products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
              className="h-auto" 
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        /* ✅ ADVANCED DESIGN EMPTY STATE: Matches the unified glassmorphic system terminals across the platform */
        <div className="text-center py-24 px-6 bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] max-w-xl mx-auto p-8 shadow-[0_4px_30px_rgba(0,0,0,0.01)] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xs">
              <SlidersHorizontal size={24} className="text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="space-y-1.5 leading-none">
              <h3 className="text-sm font-clash font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 leading-none">
                No Products Found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono mt-2 max-w-xs mx-auto">
                Try adjusting your filter criteria or clearing active filters to refresh the product catalog index.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}