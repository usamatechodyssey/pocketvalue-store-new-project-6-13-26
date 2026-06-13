// // // // app/components/ui/PaginationControls.tsx (MUKAMMAL FINAL CODE)

// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { ChevronLeft, ChevronRight, MoreHorizontal, ArrowRight, Hash } from "lucide-react";

// interface PaginationControlsProps {
//   totalPages: number;
//   paramName?: string;
// }

// export default function PaginationControls({
//   totalPages,
//   paramName = "page",
// }: PaginationControlsProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Current Page Logic
//   const currentPage = Number(searchParams.get(paramName)) || 1;

//   const [jumpPage, setJumpPage] = useState("");
//   const [isFocused, setIsFocused] = useState(false);

//   // 🔥 CORE LOGIC FIX: Handle URL Update
//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams.toString());

//     if (page === 1) {
//       params.delete(paramName); // Clean URL for page 1
//     } else {
//       params.set(paramName, page.toString());
//     }

//     router.push(`${pathname}?${params.toString()}`, { scroll: true });
//   };

//   const handlePrev = () => {
//     if (currentPage > 1) handlePageChange(currentPage - 1);
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) handlePageChange(currentPage + 1);
//   };

//   const handleJumpSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const pageNum = parseInt(jumpPage);
//     if (pageNum >= 1 && pageNum <= totalPages) {
//       handlePageChange(pageNum);
//       setJumpPage("");
//       (document.activeElement as HTMLElement)?.blur();
//     }
//   };

//   if (totalPages <= 1) return null;

//   // Logic: 1 ... 4 5 6 ... 20
//   const getPageNumbers = () => {
//     const pages = [];
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       pages.push(1);
//       if (currentPage > 3) pages.push("...");
//       const startRange = Math.max(2, currentPage - 1);
//       const endRange = Math.min(totalPages - 1, currentPage + 1);
//       for (let i = startRange; i <= endRange; i++) {
//         if (i > 1 && i < totalPages) pages.push(i);
//       }
//       if (currentPage < totalPages - 2) pages.push("...");
//       pages.push(totalPages);
//     }
//     return pages;
//   };

//   const pageNumbers = getPageNumbers();

//   return (
//     <div className="flex flex-col items-center gap-8 mt-14 mb-10 select-none">

//       {/* 1. Main Pagination Bar */}
//       <div className="flex flex-wrap items-center justify-center p-1.5 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">

//         {/* PREVIOUS */}
//         <button
//           onClick={handlePrev}
//           disabled={currentPage === 1}
//           className="group flex items-center gap-1.5 pl-2 pr-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
//             hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary
//             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:text-gray-600"
//         >
//           <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10 transition-colors">
//             <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
//           </div>
//           <span className="hidden sm:inline">Prev</span>
//         </button>

//         <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

//         {/* Page Numbers */}
//         <div className="flex items-center gap-1 mx-1">
//           {pageNumbers.map((page, index) => {
//             if (page === "...") {
//               return (
//                 <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-gray-400">
//                   <MoreHorizontal size={16} />
//                 </span>
//               );
//             }
//             const isActive = currentPage === page;
//             return (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page as number)}
//                 className={`
//                   relative w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-300
//                   ${
//                     isActive
//                       ? "text-white shadow-lg shadow-brand-primary/30 scale-100"
//                       : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-primary hover:scale-105"
//                   }
//                 `}
//               >
//                 {isActive && (
//                    <span className="absolute inset-0 bg-brand-primary rounded-xl -z-10 animate-in zoom-in-50 duration-300" />
//                 )}
//                 {page}
//               </button>
//             );
//           })}
//         </div>

//         <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

//         {/* NEXT */}
//         <button
//           onClick={handleNext}
//           disabled={currentPage === totalPages}
//           className="group flex items-center gap-1.5 pl-4 pr-2 py-2 rounded-xl text-sm font-semibold transition-all duration-300
//             hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary
//             disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:text-gray-600"
//         >
//           <span className="hidden sm:inline">Next</span>
//           <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10 transition-colors">
//              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
//           </div>
//         </button>
//       </div>

//       {/* 2. Jump to Page Capsule */}
//       {totalPages > 5 && (
//         <form
//           onSubmit={handleJumpSubmit}
//           className={`
//             relative flex items-center gap-2 px-1.5 py-1.5 rounded-full transition-all duration-500 ease-out border
//             ${isFocused
//               ? "bg-white dark:bg-gray-800 shadow-[0_4px_20px_rgba(255,143,50,0.15)] border-brand-primary/30 translate-y-0"
//               : "bg-gray-50 dark:bg-gray-900/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
//             }
//           `}
//         >
//           <div className={`
//             flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300
//             ${isFocused ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-200 dark:bg-gray-800 text-gray-500"}
//           `}>
//             <Hash size={14} />
//           </div>
//           <div className="relative">
//             <input
//               type="number"
//               min={1}
//               max={totalPages}
//               value={jumpPage}
//               onChange={(e) => setJumpPage(e.target.value)}
//               onFocus={() => setIsFocused(true)}
//               onBlur={() => !jumpPage && setIsFocused(false)}
//               placeholder="Jump to..."
//               className="w-20 bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none
//               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
//             />
//             <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none transition-opacity duration-300 ${jumpPage ? 'opacity-0' : 'opacity-100'}`}>
//               / {totalPages}
//             </span>
//           </div>
//           <button
//             type="submit"
//             disabled={!jumpPage}
//             className={`
//               flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white shadow-md transition-all duration-300
//               ${jumpPage ? "opacity-100 scale-100 rotate-0 ml-1" : "opacity-0 scale-50 -rotate-90 w-0 ml-0 overflow-hidden"}
//             `}
//           >
//             <ArrowRight size={14} />
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }
// app/components/ui/PaginationControls.tsx (FINAL CORRECTED)

"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowRight,
  Hash,
} from "lucide-react";
import Link from "next/link"; // 🔥 Added for SEO
import { motion } from "framer-motion";

interface PaginationControlsProps {
  totalPages: number;
  paramName?: string;
}

export default function PaginationControls({
  totalPages,
  paramName = "page",
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get(paramName)) || 1;
  const [jumpPage, setJumpPage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // 🔥 FIX: SEO Friendly URL Generator
  const createPageURL = (page: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete(paramName);
    else params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      // 🔥 FIX: Use 'replace' instead of 'push' to keep history clean
      router.replace(createPageURL(pageNum), { scroll: false });

      // Manually scroll to product grid start (Professional UX)
      window.scrollTo({ top: 400, behavior: "smooth" });

      setJumpPage("");
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  if (totalPages <= 1) return null;

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startRange = Math.max(2, currentPage - 1);
      const endRange = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startRange; i <= endRange; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col items-center gap-8 mt-14 mb-10 select-none">
      {/* 1. Main Pagination Bar */}
      <div className="flex flex-wrap items-center justify-center p-1.5 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-sm">
        {/* PREVIOUS */}
        <Link
          href={createPageURL(currentPage - 1)}
          className={`group flex items-center gap-1.5 pl-2 pr-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${currentPage === 1 ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary"}`}
          scroll={false}
        >
          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10">
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          <span className="hidden sm:inline">Prev</span>
        </Link>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-9 h-9 flex items-center justify-center text-gray-400"
                >
                  <MoreHorizontal size={16} />
                </span>
              );
            }
            const isActive = currentPage === page;
            return (
              <Link
                key={page}
                href={createPageURL(page as number)}
                scroll={false}
                className={`relative w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all
                  ${isActive ? "text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-primary"}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activePage"
                    className="absolute inset-0 bg-brand-primary rounded-xl -z-10"
                  />
                )}
                {page}
              </Link>
            );
          })}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

        {/* NEXT */}
        <Link
          href={createPageURL(currentPage + 1)}
          className={`group flex items-center gap-1.5 pl-4 pr-2 py-2 rounded-xl text-sm font-semibold transition-all
            ${currentPage === totalPages ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary"}`}
          scroll={false}
        >
          <span className="hidden sm:inline">Next</span>
          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10">
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </Link>
      </div>

      {/* 2. Jump to Page */}
      {totalPages > 5 && (
        <form
          onSubmit={handleJumpSubmit}
          className={`relative flex items-center gap-2 px-1.5 py-1.5 rounded-full border transition-all
            ${isFocused ? "bg-white dark:bg-gray-800 border-brand-primary/30 shadow-md" : "bg-gray-50 dark:bg-gray-900/50 border-transparent"}`}
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${isFocused ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-200 dark:bg-gray-800 text-gray-500"}`}
          >
            <Hash size={14} />
          </div>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !jumpPage && setIsFocused(false)}
            placeholder="Jump to..."
            className="w-20 bg-transparent text-sm font-medium focus:outline-none"
          />
          <button
            type="submit"
            disabled={!jumpPage}
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white transition-all
              ${jumpPage ? "opacity-100 scale-100 ml-1" : "opacity-0 scale-50 w-0 ml-0 overflow-hidden"}`}
          >
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
