
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/types";
// import {
//   FiHome,
//   FiShoppingBag,
//   FiHeart,
//   FiUser,
//   FiGrid,
//   FiDroplet,
//   FiCpu,
//   FiArchive,
//   FiTruck,
//   FiBook,
//   FiGift,
// } from "react-icons/fi";

// const getIconForCategory = (categoryName: string) => {
//   const lowerCaseName = categoryName.toLowerCase();

//   if (lowerCaseName.startsWith("men")) return <FiUser size={24} />;
//   if (lowerCaseName.startsWith("women")) return <FiHeart size={24} />;
//   if (lowerCaseName.startsWith("kid") || lowerCaseName.startsWith("baby"))
//     return <FiShoppingBag size={24} />;
//   if (lowerCaseName.startsWith("home")) return <FiHome size={24} />;
//   if (lowerCaseName.startsWith("beauty") || lowerCaseName.startsWith("health"))
//     return <FiDroplet size={24} />;
//   if (lowerCaseName.startsWith("electronics")) return <FiCpu size={24} />;
//   if (
//     lowerCaseName.startsWith("grocery") ||
//     lowerCaseName.startsWith("food") ||
//     lowerCaseName.startsWith("pet")
//   )
//     return <FiArchive size={24} />;

//   if (lowerCaseName.includes("auto") || lowerCaseName.includes("car"))
//     return <FiTruck size={24} />;
//   if (lowerCaseName.includes("book") || lowerCaseName.includes("stationery"))
//     return <FiBook size={24} />;
//   if (lowerCaseName.includes("gift") || lowerCaseName.includes("event"))
//     return <FiGift size={24} />;

//   return <FiGrid size={24} />;
// };

// interface NewSidebarProps {
//   categories: SanityCategory[];
//   onCategoryHover: (category: SanityCategory | null) => void;
// }

// export default function NewSidebar({
//   categories,
//   onCategoryHover,
// }: NewSidebarProps) {
//   const pathname = usePathname();

//   const mainCategories = categories.filter((cat) => !cat.parent);

//   const desiredOrder = [
//     "HOME",
//     "BEAUTY",
//     "MEN",
//     "WOMEN",
//     "KIDS",
//     "FOOD & GROCERY",
//     "ELECTRONICS",
//   ];

//   const sortedCategories = [...mainCategories].sort((a, b) => {
//     const indexA = desiredOrder.indexOf(a.name.toUpperCase());
//     const indexB = desiredOrder.indexOf(b.name.toUpperCase());

//     if (indexA !== -1 && indexB !== -1) return indexA - indexB;
//     if (indexA !== -1) return -1;
//     if (indexB !== -1) return 1;

//     return a.name.localeCompare(b.name);
//   });

//   const isCategoryActive = (category: SanityCategory) => {
//     return pathname === `/category/${category.slug}`;
//   };

//   return (
//     <>
//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .no-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>

//       <aside className="h-full w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col items-center shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
//         <nav
//           className="flex flex-col items-center gap-2 w-full overflow-y-auto no-scrollbar py-6 pb-24"
//           aria-label="Main navigation"
//           role="navigation"
//         >
//           {sortedCategories.map((category) => {
//             const isActive = isCategoryActive(category);

//             return (
//               <div
//                 key={category._id}
//                 onMouseEnter={() => onCategoryHover(category)}
//                 // ✅ FIX: REMOVED onMouseLeave — container handles it
//                 className="w-full relative group px-2 shrink-0"
//               >
//                 <span
//                   className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-primary rounded-r-full transition-opacity duration-300 ${
//                     isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//                   }`}
//                   aria-hidden="true"
//                 />

//                 <Link
//                   href={`/category/${category.slug}`}
//                   title={category.name}
//                   aria-current={isActive ? "page" : undefined}
//                   className="flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 group-hover:bg-orange-50 dark:group-hover:bg-white/5"
//                 >
//                   <div
//                     className={`transition-all duration-300 group-hover:scale-110 ${
//                       isActive
//                         ? "text-brand-primary"
//                         : "text-gray-400 dark:text-gray-500 group-hover:text-brand-primary"
//                     }`}
//                   >
//                     {getIconForCategory(category.name)}
//                   </div>

//                   <span
//                     className={`text-[9px] font-bold mt-1.5 w-full text-center truncate px-0.5 leading-tight transition-colors duration-300 ${
//                       isActive
//                         ? "text-brand-primary"
//                         : "text-gray-500 dark:text-gray-400 group-hover:text-brand-primary"
//                     }`}
//                   >
//                     {category.name.toUpperCase()}
//                   </span>
//                 </Link>
//               </div>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SanityCategory } from "@/types";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiGrid,
  FiDroplet,
  FiCpu,
  FiArchive,
  FiTruck,
  FiBook,
  FiGift,
} from "react-icons/fi";

// === ICON HELPER ===
const getIconForCategory = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();

  if (lowerCaseName.startsWith("men")) return <FiUser size={24} />;
  if (lowerCaseName.startsWith("women")) return <FiHeart size={24} />;
  if (lowerCaseName.startsWith("kid") || lowerCaseName.startsWith("baby"))
    return <FiShoppingBag size={24} />;
  if (lowerCaseName.startsWith("home")) return <FiHome size={24} />;
  if (lowerCaseName.startsWith("beauty") || lowerCaseName.startsWith("health"))
    return <FiDroplet size={24} />;
  if (lowerCaseName.startsWith("electronics")) return <FiCpu size={24} />;
  if (
    lowerCaseName.startsWith("grocery") ||
    lowerCaseName.startsWith("food") ||
    lowerCaseName.startsWith("pet")
  )
    return <FiArchive size={24} />;

  if (lowerCaseName.includes("auto") || lowerCaseName.includes("car"))
    return <FiTruck size={24} />;
  if (lowerCaseName.includes("book") || lowerCaseName.includes("stationery"))
    return <FiBook size={24} />;
  if (lowerCaseName.includes("gift") || lowerCaseName.includes("event"))
    return <FiGift size={24} />;

  return <FiGrid size={24} />;
};

interface NewSidebarProps {
  categories: SanityCategory[];
  onCategoryHover: (category: SanityCategory | null) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  sidebarWidthClass?: string; // ✅ Tailwind width class
}

export default function NewSidebar({
  categories,
  onCategoryHover,
  isExpanded = false,
  onToggleExpand,
  sidebarWidthClass = "w-16",
}: NewSidebarProps) {
  const pathname = usePathname();

  const mainCategories = categories.filter((cat) => !cat.parent);

  const desiredOrder = [
    "HOME",
    "BEAUTY",
    "MEN",
    "WOMEN",
    "KIDS",
    "FOOD & GROCERY",
    "ELECTRONICS",
  ];

  const sortedCategories = [...mainCategories].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.name.toUpperCase());
    const indexB = desiredOrder.indexOf(b.name.toUpperCase());

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  const isCategoryActive = (category: SanityCategory) => {
    return pathname === `/category/${category.slug}`;
  };

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <aside
        className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 flex flex-col items-center shadow-[2px_0_10px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-out will-change-[width]
          ${sidebarWidthClass}`}
      >
        <nav
          className={`flex flex-col items-center gap-2 w-full overflow-y-auto no-scrollbar py-6 ${
            isExpanded ? "px-3" : "px-1"
          } pb-20`}
          aria-label="Main navigation"
          role="navigation"
        >
          {sortedCategories.map((category) => {
            const isActive = isCategoryActive(category);

            return (
              <div
                key={category._id}
                onMouseEnter={() => onCategoryHover(category)}
                // ✅ onMouseLeave removed — container handles it
                className="w-full relative group shrink-0"
              >
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-brand-primary rounded-r-full transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  aria-hidden="true"
                />

                <Link
                  href={`/category/${category.slug}`}
                  title={category.name}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 w-full py-3 rounded-xl transition-all duration-300 group-hover:bg-orange-50 dark:group-hover:bg-white/5
                    ${isExpanded ? "px-4" : "justify-center"}`}
                >
                  <div
                    className={`transition-all duration-300 group-hover:scale-110 shrink-0 ${
                      isActive
                        ? "text-brand-primary"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-brand-primary"
                    }`}
                  >
                    {getIconForCategory(category.name)}
                  </div>

                  {/* ✅ Text shown only when expanded */}
                  {isExpanded && (
                    <span
                      className={`text-sm font-bold truncate transition-colors duration-300 ${
                        isActive
                          ? "text-brand-primary"
                          : "text-gray-600 dark:text-gray-300 group-hover:text-brand-primary"
                      }`}
                    >
                      {category.name}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* ✅ Expand/Collapse Button — FIXED BOTTOM with divider line */}
        <div className="shrink-0 w-full pb-4 pt-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-center">
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand-primary/20 text-gray-500 hover:text-brand-primary transition-all duration-300"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}