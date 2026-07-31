
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
      
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ">
//           {products.map((product, index) => (
//             <ProductCard
//               key={product._id}
//               product={product}
//               onQuickView={onQuickView}
//               className="h-full" // Ensure cards stretch evenly
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
// src/app/components/product/ProductGrid.tsx (UPGRADED WITH COMPONENT RANKINGS)

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
    <>
      {products.length > 0 ? (
        // ✅ ENTERPRISE UPGRADE: Replaced hardcoded grid items h-full with h-auto
        // This ensures the flex column wrapper doesn't collapse to 0 height in CSS Grid rows, letting the aspect ratio of the image stretch the card naturally
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ">
          {products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
              className="h-auto" // ✅ Replaced 'h-full' with 'h-auto' to completely prevent PLP image height collapse
              // 🚀 Gap #8: Pass relative listing rank to the card dynamically
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <SlidersHorizontal size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-text-primary dark:text-gray-200">
            No Products Found
          </h3>
          <p className="text-text-secondary dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Try adjusting your filters or clearing them to see all available
            products.
          </p>
        </div>
      )}
    </>
  );
}