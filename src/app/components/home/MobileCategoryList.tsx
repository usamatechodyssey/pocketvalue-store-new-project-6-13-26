// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { SanityCategory } from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";

// export default function MobileCategoryList({
//   categories,
// }: {
//   categories: SanityCategory[];
// }) {
//   if (!categories || categories.length === 0) return null;

//   return (
//     // === CONTAINER (Edge-to-Edge Scroll) ===
//     <div className="w-full md:hidden py-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      
//       <div className="flex flex-col gap-4">
//         {/* Title Section (Optional, agar dikhana ho) */}
//         <div className="px-4 flex justify-between items-center">
//             <h3 className="text-lg font-bold text-gray-800 dark:text-white">Explore</h3>
//             <span className="text-xs text-gray-400">Swipe →</span>
//         </div>

//         {/* === SCROLLABLE AREA === */}
//         <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar snap-x snap-mandatory">
//           {categories.map((category) => (
//             <Link
//               key={category._id}
//               href={`/category/${category.slug}`}
//               className="flex flex-col items-center gap-2 snap-start shrink-0"
//             >
//               {/* === STORY CIRCLE === */}
//               <div className="relative w-[72px] h-[72px] rounded-full p-0.5 bg-linear-to-tr from-brand-primary to-brand-secondary">
//                 <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 overflow-hidden relative bg-gray-100">
//                   {category.image ? (
//                     <Image
//                       src={urlFor(category.image).width(150).height(150).url()}
//                       alt={category.name}
//                       fill
//                       className="object-cover"
//                       sizes="72px"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">
//                       N/A
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* === CATEGORY NAME === */}
//               <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center w-20 truncate">
//                 {category.name}
//               </span>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Hide Scrollbar CSS */}
//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .no-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { SanityCategory } from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";

// export default function MobileCategoryList({ categories }: { categories: SanityCategory[] }) {
  
//   if (!categories || categories.length === 0) return null;
  
//   return (
//     // pb-4 for scroll indicator, overflow-x-auto for native scroll
//     <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      
//       {/* === FLEX CONTAINER === */}
//       {/* w-max allows the container to be as wide as all items combined */}
//       <div className="flex items-start gap-4 w-max px-4">
        
//         {categories.map((category) => (
//           <Link
//             key={category._id}
//             href={`/category/${category.slug}`}
//             className="flex flex-col items-center gap-2 group snap-center"
//           >
//             {/* === IMAGE CIRCLE === */}
//             <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm group-active:scale-95 transition-transform duration-200">
//               {category.image ? (
//                 <Image
//                   // Server-side resize
//                   src={urlFor(category.image).width(150).height(150).url()}
//                   alt={category.name}
//                   fill
//                   className="object-cover"
//                   sizes="72px" // Fixed size for mobile
//                   loading="lazy" // Lazy load because this is mobile list
//                 />
//               ) : (
//                 <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
//                   No Img
//                 </div>
//               )}
//             </div>

//             {/* === TEXT === */}
//             <span className="text-[11px] font-medium text-center text-gray-700 dark:text-gray-300 w-[72px] leading-tight truncate">
//               {category.name}
//             </span>
//           </Link>
//         ))}

//       </div>

//       {/* Scrollbar Hide CSS (Global styles are better defined in global.css, but kept here for self-containment) */}
//       <style jsx global>{`
//         /* Webkit Browsers (Chrome, Safari, Edge) */
//         .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//         }
//         /* IE, Edge, Firefox */
//         .scrollbar-hide {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import Image from "next/image";
import { SanityCategory } from "@/sanity/types/product_types";
import { urlFor } from "@/sanity/lib/image";

export default function MobileCategoryList({ categories }: { categories: SanityCategory[] }) {
  
  if (!categories || categories.length === 0) return null;
  
  return (
    // ✅ FIX: 'scrollbar-hide' class ab globals.css se aa rahi hai (No local CSS flash)
    <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      
      {/* w-max allows the container to be as wide as all items combined */}
      <div className="flex items-start gap-4 w-max px-4">
        
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug}`}
            className="flex flex-col items-center gap-2 group snap-center"
          >
            {/* === IMAGE CIRCLE === */}
            <div className="relative w-18 h-18 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm group-active:scale-95 transition-transform duration-200">
              {category.image ? (
                <Image
                  src={urlFor(category.image).width(150).height(150).url()}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="72px"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
                  No Img
                </div>
              )}
            </div>

            {/* === TEXT === */}
            <span className="text-[11px] font-medium text-center text-gray-700 dark:text-gray-300 w-18 leading-tight truncate">
              {category.name}
            </span>
          </Link>
        ))}

      </div>
    </div>
  );
}
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { SanityCategory } from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";

// export default function MobileCategoryList({ categories }: { categories: SanityCategory[] }) {
//   return (
//     <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      
//       {/* === FLEX CONTAINER === */}
//       {/* Yahan 'px-4' lagaya hai, lekin agar ye kaam na kare to 'Spacers' kaam karenge */}
//       <div className="flex items-start gap-4 w-max px-4">
        
//         {categories.map((category) => (
//           <Link
//             key={category._id}
//             href={`/category/${category.slug}`}
//             className="flex flex-col items-center gap-2 group snap-center"
//           >
//             {/* === IMAGE CIRCLE === */}
//             <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm group-active:scale-95 transition-transform duration-200">
//               {category.image ? (
//                 <Image
//                   src={urlFor(category.image).width(150).height(150).url()}
//                   alt={category.name}
//                   fill
//                   className="object-cover"
//                   sizes="80px"
//                 />
//               ) : (
//                 <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
//                   No Img
//                 </div>
//               )}
//             </div>

//             {/* === TEXT === */}
//             <span className="text-[11px] font-medium text-center text-gray-700 dark:text-gray-300 w-[72px] leading-tight truncate">
//               {category.name}
//             </span>
//           </Link>
//         ))}

//       </div>

//       {/* Scrollbar Hide CSS */}
//       <style jsx global>{`
//         .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//         }
//         .scrollbar-hide {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//         }
//       `}</style>
//     </div>
//   );
// }