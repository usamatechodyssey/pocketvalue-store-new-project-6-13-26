// "use client";

// import  { useState, useEffect, useMemo, useId } from "react"; // ✅ Added useId
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
//   const listId = useId(); // ✅ Unique ID for aria-controls

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
//             id={listId} // ✅ ID for aria-controls
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
//           // ✅ FIX 2 & 3: Added accessibility attributes
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
// export default function MegaMenu({ category }: { category: SanityCategory | null }) {
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const handleViewAllToggle = (id: string) => {
//     setExpandedId((currentId) => (currentId === id ? null : id));
//   };

//   // ✅ FIX 4: Use direct import (already imported via React)
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

//   const megaMenuVariants: Variants = {
//     hidden: { x: "-20px", opacity: 0, transition: { duration: 0.2 } },
//     visible: {
//       x: 0,
//       opacity: 1,
//       transition: { duration: 0.3, ease: "easeOut" },
//     },
//     exit: { x: "-10px", opacity: 0, transition: { duration: 0.2 } },
//   };

//   return (
//     <AnimatePresence mode="wait">
//       {category?.subCategories && category.subCategories.length > 0 && (
//         <motion.div
//           key={category._id}
//           variants={megaMenuVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           // ✅ FIX 1: Added accessibility attributes
//           role="navigation"
//           aria-label={`${category.name} subcategory navigation`}
//           className="h-full w-[85vw] max-w-350 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-20 overflow-hidden"
//         >
//           <div className="h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
//             {/* Header Section */}
//             <div className="flex items-baseline gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
//               <motion.h2
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 className="text-4xl font-clash font-bold text-brand-primary"
//               >
//                 {category.name}
//               </motion.h2>
//               <Link
//                 href={`/category/${category.slug}`}
//                 className="text-sm font-medium text-gray-400 hover:text-brand-primary transition-colors"
//               >
//                 View All Products &rarr;
//               </Link>
//             </div>

//             {/* Grid Section */}
//             <motion.div
//               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               {sortedSubCategories.map((subCategory) => (
//                 <motion.div key={subCategory._id} variants={itemVariants}>
//                   <SubCategoryList
//                     category={category}
//                     subCategory={subCategory}
//                     onViewAllToggle={handleViewAllToggle}
//                     isExpanded={expandedId === subCategory._id}
//                   />
//                 </motion.div>
//               ))}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
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
    <div className="flex flex-col p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200">
      {/* Subcategory Title */}
      <Link
        href={`/category/${category.slug}/${subCategory.slug}`}
        className="group/title self-start mb-3"
      >
        <h3 className="inline-flex items-center gap-2 text-base font-clash font-bold text-gray-800 dark:text-gray-100 group-hover/title:text-brand-primary transition-colors">
          {subCategory.name}
          <ArrowRight
            size={16}
            className="opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all duration-300"
            aria-hidden="true"
          />
        </h3>
      </Link>

      {/* Links List */}
      <ul className="space-y-2" role="list">
        {items.slice(0, initialLimit).map((item) => (
          <li key={item._id} role="listitem">
            <Link
              href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
              className="group flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-brand-primary transition-colors pl-1"
            >
              <CornerDownRight
                className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-brand-primary/50 transition-colors"
                aria-hidden="true"
              />
              <span className="font-medium">{item.name}</span>
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
            className="space-y-2 overflow-hidden"
            role="list"
          >
            <div className="pt-2 space-y-2">
              {items.slice(initialLimit).map((item) => (
                <li key={item._id} role="listitem">
                  <Link
                    href={`/category/${category.slug}/${subCategory.slug}/${item.slug}`}
                    className="group flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-brand-primary pl-1"
                  >
                    <CornerDownRight
                      className="h-3 w-3 text-gray-300 group-hover:text-brand-primary/50 transition-colors"
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
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
          className="flex items-center gap-1.5 text-xs font-bold text-brand-primary/80 hover:text-brand-primary mt-3 pt-1 ml-1 uppercase tracking-wide transition-colors"
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

  // ✅ NEW ANIMATION — "Water flowing from behind sidebar"
  // ScaleX from 0 to 1 with origin at left edge (sidebar edge)
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
      transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }, // Custom ease for smooth water-like flow
    },
    exit: {
      scaleX: 0,
      opacity: 0,
      transformOrigin: "left",
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // ✅ Don't render if no subcategories
  if (!category?.subCategories || category.subCategories.length === 0) {
    return null;
  }

  // ✅ Dynamic width adjustment
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
        // ✅ Removed overflow-hidden to allow scaleX to render smoothly
        className={`h-full w-[85vw] bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-40 ${widthClass}`}
      >
        <div className="h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          {/* Header Section */}
          <div className="flex items-baseline gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-clash font-bold text-brand-primary"
            >
              {category.name}
            </motion.h2>
            <Link
              href={`/category/${category.slug}`}
              className="text-sm font-medium text-gray-400 hover:text-brand-primary transition-colors"
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