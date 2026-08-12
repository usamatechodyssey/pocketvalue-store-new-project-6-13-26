
// "use client";

// import { useState, useEffect, useMemo, useId } from "react";
// import Link from "next/link";
// import { SanityCategory } from "@/types";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { ArrowRight, ChevronDown, CornerDownRight } from "lucide-react";

// // === SUBCATEGORY LIST COMPONENT ===
// const SubCategoryList = ({
//   category,
//   subCategory,
//   onViewAllToggle,
//   isExpanded,
// }: {
//   category: SanityCategory;
//   subCategory: SanityCategory;
//   onViewAllToggle: (id: string) => void;
//   isExpanded: boolean;
// }) => {
//   const items = subCategory.subCategories || [];
//   const initialLimit = 5;
//   const hasMore = items.length > initialLimit;
//   const listId = useId();

//   const listVariants: Variants = {
//     open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
//     collapsed: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } },
//   };

//   return (
//     <div className="flex flex-col p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200">
//       {/* Subcategory Title */}
//       <Link
//         href={`/category/${category.slug}/${subCategory.slug}`}
//         className="group/title self-start mb-3"
//       >
//         <h3 className="inline-flex items-center gap-2 text-base font-clash font-bold text-gray-800 dark:text-gray-100 group-hover/title:text-brand-primary transition-colors">
//           {subCategory.name}
//           <ArrowRight
//             size={16}
//             className="opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all duration-300"
//             aria-hidden="true"
//           />
//         </h3>
//       </Link>

//       {/* Links List */}
//       <ul className="space-y-2" role="list">
//         {items.slice(0, initialLimit).map((item) => (
//           <li key={item._id} role="listitem">
//             <Link
//               href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
//               className="group flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-brand-primary transition-colors pl-1"
//             >
//               <CornerDownRight
//                 className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-brand-primary/50 transition-colors"
//                 aria-hidden="true"
//               />
//               <span className="font-medium">{item.name}</span>
//             </Link>
//           </li>
//         ))}
//       </ul>

//       {/* Expanded Items Animation */}
//       <AnimatePresence initial={false}>
//         {isExpanded && (
//           <motion.ul
//             id={listId}
//             key="more-items"
//             initial="collapsed"
//             animate="open"
//             exit="collapsed"
//             variants={listVariants}
//             className="space-y-2 overflow-hidden"
//             role="list"
//           >
//             <div className="pt-2 space-y-2">
//               {items.slice(initialLimit).map((item) => (
//                 <li key={item._id} role="listitem">
//                   <Link
//                     href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
//                     className="group flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-brand-primary pl-1"
//                   >
//                     <CornerDownRight
//                       className="h-3 w-3 text-gray-300 group-hover:text-brand-primary/50 transition-colors"
//                       aria-hidden="true"
//                     />
//                     <span>{item.name}</span>
//                   </Link>
//                 </li>
//               ))}
//             </div>
//           </motion.ul>
//         )}
//       </AnimatePresence>

//       {/* Show More / Less Button */}
//       {hasMore && (
//         <button
//           onClick={() => onViewAllToggle(subCategory._id)}
//           aria-expanded={isExpanded}
//           aria-controls={listId}
//           className="flex items-center gap-1.5 text-xs font-bold text-brand-primary/80 hover:text-brand-primary mt-3 pt-1 ml-1 uppercase tracking-wide transition-colors"
//         >
//           <span>{isExpanded ? "Show Less" : `View All (${items.length})`}</span>
//           <ChevronDown
//             className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
//             aria-hidden="true"
//           />
//         </button>
//       )}
//     </div>
//   );
// };

// // === MAIN MEGA MENU COMPONENT ===
// interface MegaMenuProps {
//   category: SanityCategory | null;
//   sidebarWidthClass?: string;
// }

// export default function MegaMenu({ category, sidebarWidthClass = "w-16" }: MegaMenuProps) {
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const handleViewAllToggle = (id: string) => {
//     setExpandedId((currentId) => (currentId === id ? null : id));
//   };

//   useEffect(() => {
//     setExpandedId(null);
//   }, [category]);

//   const sortedSubCategories = useMemo(() => {
//     if (!category?.subCategories) return [];
//     return [...category.subCategories].sort((a, b) => {
//       const aHasChildren = (a.subCategories?.length || 0) > 0;
//       const bHasChildren = (b.subCategories?.length || 0) > 0;
//       if (aHasChildren && !bHasChildren) return -1;
//       if (!aHasChildren && bHasChildren) return 1;
//       return 0;
//     });
//   }, [category]);

//   const containerVariants: Variants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { when: "beforeChildren", staggerChildren: 0.03 },
//     },
//   };

//   const itemVariants: Variants = {
//     hidden: { opacity: 0, y: 10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 300, damping: 24 },
//     },
//   };

//   // ✅ NEW ANIMATION — "Water flowing from behind sidebar"
//   // ScaleX from 0 to 1 with origin at left edge (sidebar edge)
//   const megaMenuVariants: Variants = {
//     hidden: {
//       scaleX: 0,
//       opacity: 0,
//       transformOrigin: "left",
//       transition: { duration: 0.2, ease: "easeIn" },
//     },
//     visible: {
//       scaleX: 1,
//       opacity: 1,
//       transformOrigin: "left",
//       transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }, // Custom ease for smooth water-like flow
//     },
//     exit: {
//       scaleX: 0,
//       opacity: 0,
//       transformOrigin: "left",
//       transition: { duration: 0.2, ease: "easeIn" },
//     },
//   };

//   // ✅ Don't render if no subcategories
//   if (!category?.subCategories || category.subCategories.length === 0) {
//     return null;
//   }

//   // ✅ Dynamic width adjustment
//   const widthClass = sidebarWidthClass === "w-56" ? "max-w-[calc(85vw-14rem)]" : "max-w-[calc(85vw-4rem)]";

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={category._id}
//         variants={megaMenuVariants}
//         initial="hidden"
//         animate="visible"
//         exit="exit"
//         role="navigation"
//         aria-label={`${category.name} subcategory navigation`}
//         // ✅ Removed overflow-hidden to allow scaleX to render smoothly
//         className={`h-full w-[85vw] bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-40 ${widthClass}`}
//       >
//         <div className="h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
//           {/* Header Section */}
//           <div className="flex items-baseline gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
//             <motion.h2
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-4xl font-clash font-bold text-brand-primary"
//             >
//               {category.name}
//             </motion.h2>
//             <Link
//               href={`/category/${category.slug}`}
//               className="text-sm font-medium text-gray-400 hover:text-brand-primary transition-colors"
//             >
//               View All Products &rarr;
//             </Link>
//           </div>

//           {/* Grid Section */}
//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             {sortedSubCategories.map((subCategory) => (
//               <motion.div key={subCategory._id} variants={itemVariants}>
//                 <SubCategoryList
//                   category={category}
//                   subCategory={subCategory}
//                   onViewAllToggle={handleViewAllToggle}
//                   isExpanded={expandedId === subCategory._id}
//                 />
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
// 📂 src/app/shared/components/layout/MegaMenu.tsx

"use client";

import { useState, useEffect, useMemo, useId } from "react";
import Link from "next/link";
import { SanityCategory } from "@/types";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, ChevronDown, CornerDownRight } from "lucide-react";

// === SUBCATEGORY LIST COMPONENT ===
const SubCategoryList = ({
  category,
  subCategory,
  onViewAllToggle,
  isExpanded,
}: {
  category: SanityCategory;
  subCategory: SanityCategory;
  onViewAllToggle: (id: string) => void;
  isExpanded: boolean;
}) => {
  const items = subCategory.subCategories || [];
  const initialLimit = 5;
  const hasMore = items.length > initialLimit;
  const listId = useId();

  const listVariants: Variants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="flex flex-col p-4 rounded-2xl border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/50 transition-all duration-300">
      {/* Subcategory Title */}
      <Link
        href={`/category/${category.slug}/${subCategory.slug}`}
        className="group/title self-start mb-3"
      >
        {/* ✅ FIXED: Replaced invalid 'dark:text-zinc-150' with 'dark:text-white' for 100% crisp visibility! */}
        <h3 className="inline-flex items-center gap-2 text-sm font-clash font-extrabold text-zinc-900 dark:text-white group-hover/title:text-brand-primary dark:group-hover/title:text-brand-primary transition-colors">
          {subCategory.name}
          <ArrowRight
            size={14}
            className="opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all duration-300 text-brand-primary"
            aria-hidden="true"
          />
        </h3>
      </Link>

      {/* Links List */}
      <ul className="space-y-2.5" role="list">
        {items.slice(0, initialLimit).map((item) => (
          <li key={item._id} role="listitem">
            {/* ✅ FIXED: Changed 'dark:text-zinc-400' to 'dark:text-zinc-200' for high-contrast bright text */}
            <Link
              href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
              className="group flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors pl-1 font-semibold"
            >
              <CornerDownRight
                className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-brand-primary transition-colors"
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Expanded Items Animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            id={listId}
            key="more-items"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={listVariants}
            className="space-y-2.5 overflow-hidden"
            role="list"
          >
            <div className="pt-2.5 space-y-2.5">
              {items.slice(initialLimit).map((item) => (
                <li key={item._id} role="listitem">
                  <Link
                    href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
                    className="group flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors pl-1 font-semibold"
                  >
                    <CornerDownRight
                      className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-brand-primary transition-colors"
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Show More / Less Button */}
      {hasMore && (
        <button
          onClick={() => onViewAllToggle(subCategory._id)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-primary/90 hover:text-brand-primary mt-3 pt-1 ml-1 uppercase tracking-wider transition-colors select-none"
        >
          <span>{isExpanded ? "Show Less" : `View All (${items.length})`}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
};

// === MAIN MEGA MENU COMPONENT ===
interface MegaMenuProps {
  category: SanityCategory | null;
  sidebarWidthClass?: string;
}

export default function MegaMenu({ category, sidebarWidthClass = "w-16" }: MegaMenuProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleViewAllToggle = (id: string) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  };

  useEffect(() => {
    setExpandedId(null);
  }, [category]);

  const sortedSubCategories = useMemo(() => {
    if (!category?.subCategories) return [];
    return [...category.subCategories].sort((a, b) => {
      const aHasChildren = (a.subCategories?.length || 0) > 0;
      const bHasChildren = (b.subCategories?.length || 0) > 0;
      if (aHasChildren && !bHasChildren) return -1;
      if (!aHasChildren && bHasChildren) return 1;
      return 0;
    });
  }, [category]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.03 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const megaMenuVariants: Variants = {
    hidden: {
      scaleX: 0,
      opacity: 0,
      transformOrigin: "left",
      transition: { duration: 0.2, ease: "easeIn" },
    },
    visible: {
      scaleX: 1,
      opacity: 1,
      transformOrigin: "left",
      transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }, 
    },
    exit: {
      scaleX: 0,
      opacity: 0,
      transformOrigin: "left",
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  if (!category?.subCategories || category.subCategories.length === 0) {
    return null;
  }

  const widthClass = sidebarWidthClass === "w-56" ? "max-w-[calc(85vw-14rem)]" : "max-w-[calc(85vw-4rem)]";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category._id}
        variants={megaMenuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="navigation"
        aria-label={`${category.name} subcategory navigation`}
        className={`h-full w-[85vw] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-r border-zinc-200/50 dark:border-zinc-800/80 shadow-[30px_0_60px_rgba(0,0,0,0.06)] dark:shadow-[30px_0_60px_rgba(0,0,0,0.4)] z-35 ${widthClass}`}
      >
        <div className="h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          {/* Header Section */}
          <div className="flex items-baseline gap-4 border-b border-zinc-200/60 dark:border-zinc-850 pb-6 mb-8 select-none">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-clash font-extrabold text-brand-primary"
            >
              {category.name}
            </motion.h2>
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-brand-primary dark:text-zinc-400 dark:hover:text-brand-primary transition-colors"
            >
              View All Products &rarr;
            </Link>
          </div>

          {/* Grid Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedSubCategories.map((subCategory) => (
              <motion.div key={subCategory._id} variants={itemVariants}>
                <SubCategoryList
                  category={category}
                  subCategory={subCategory}
                  onViewAllToggle={handleViewAllToggle}
                  isExpanded={expandedId === subCategory._id}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}