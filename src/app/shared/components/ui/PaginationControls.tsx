
// // // ui/PaginationControls.tsx (UPGRADED WITH PAGINATION TELEMETRY)


// "use client";

// import { useState, useMemo } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import {
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
//   ArrowRight,
//   Hash,
// } from "lucide-react";
// import Link from "next/link"; 
// import { motion } from "framer-motion";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

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

//   const currentPage = Number(searchParams.get(paramName)) || 1;
//   const [jumpPage, setJumpPage] = useState("");
//   const [isFocused, setIsFocused] = useState(false);

//   const createPageURL = (page: number | string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (page === 1) params.delete(paramName);
//     else params.set(paramName, page.toString());
//     return `${pathname}?${params.toString()}`;
//   };

//   const handleJumpSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const pageNum = parseInt(jumpPage);
//     if (pageNum >= 1 && pageNum <= totalPages) {
//       router.replace(createPageURL(pageNum), { scroll: false });
//       window.scrollTo({ top: 400, behavior: "smooth" });
//       logUserEvent('page_view', pathname, {
//         page_depth: pageNum,
//         param_name: paramName,
//         navigation_type: 'jump_input'
//       });
//       setJumpPage("");
//       (document.activeElement as HTMLElement)?.blur();
//     }
//   };

//   if (totalPages <= 1) return null;

//   const pageNumbers = useMemo(() => {
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
//   }, [currentPage, totalPages]);

//   return (
//     <div className="flex flex-col items-center gap-8 mt-14 mb-10 select-none">
//       <div className="flex flex-wrap items-center justify-center p-1.5 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-sm">
//         {/* PREVIOUS */}
//         <Link
//           href={createPageURL(currentPage - 1)}
//           // ✅ FIX: Added aria-label for accessibility
//           aria-label="Go to previous page"
//           className={`group flex items-center gap-1.5 pl-2 pr-4 py-2 rounded-xl text-sm font-semibold transition-all
//             ${currentPage === 1 ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary"}`}
//           scroll={false}
//           onClick={() => {
//             logUserEvent('page_view', pathname, {
//               page_depth: currentPage - 1,
//               param_name: paramName,
//               navigation_type: 'prev_click'
//             });
//           }}
//         >
//           <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10">
//             <ChevronLeft
//               size={14}
//               className="group-hover:-translate-x-0.5 transition-transform"
//             />
//           </div>
//           <span className="hidden sm:inline">Prev</span>
//         </Link>

//         <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

//         <div className="flex items-center gap-1 mx-1">
//           {pageNumbers.map((page, index) => {
//             if (page === "...") {
//               return (
//                 <span
//                   key={`ellipsis-${index}`}
//                   className="w-9 h-9 flex items-center justify-center text-gray-400"
//                 >
//                   <MoreHorizontal size={16} />
//                 </span>
//               );
//             }
//             const isActive = currentPage === page;
//             return (
//               <Link
//                 key={page}
//                 href={createPageURL(page as number)}
//                 scroll={false}
//                 aria-label={`Go to page ${page}`}
//                 className={`relative w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all
//                   ${isActive ? "text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-primary"}`}
//                 onClick={() => {
//                   logUserEvent('page_view', pathname, {
//                     page_depth: page as number,
//                     param_name: paramName,
//                     navigation_type: 'number_click'
//                   });
//                 }}
//               >
//                 {isActive && (
//                   <motion.span
//                     layoutId="activePage"
//                     className="absolute inset-0 bg-brand-primary rounded-xl -z-10"
//                   />
//                 )}
//                 {page}
//               </Link>
//             );
//           })}
//         </div>

//         <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

//         {/* NEXT */}
//         <Link
//           href={createPageURL(currentPage + 1)}
//           // ✅ FIX: Added aria-label for accessibility
//           aria-label="Go to next page"
//           className={`group flex items-center gap-1.5 pl-4 pr-2 py-2 rounded-xl text-sm font-semibold transition-all
//             ${currentPage === totalPages ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary"}`}
//           scroll={false}
//           onClick={() => {
//             logUserEvent('page_view', pathname, {
//               page_depth: currentPage + 1,
//               param_name: paramName,
//               navigation_type: 'next_click'
//             });
//           }}
//         >
//           <span className="hidden sm:inline">Next</span>
//           <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-primary/10">
//             <ChevronRight
//               size={14}
//               className="group-hover:translate-x-0.5 transition-transform"
//             />
//           </div>
//         </Link>
//       </div>

//       {totalPages > 5 && (
//         <form
//           onSubmit={handleJumpSubmit}
//           className={`relative flex items-center gap-2 px-1.5 py-1.5 rounded-full border transition-all
//             ${isFocused ? "bg-white dark:bg-gray-800 border-brand-primary/30 shadow-md" : "bg-gray-50 dark:bg-gray-900/50 border-transparent"}`}
//         >
//           <div
//             className={`flex items-center justify-center w-8 h-8 rounded-full ${isFocused ? "bg-brand-primary/10 text-brand-primary" : "bg-gray-200 dark:bg-gray-800 text-gray-500"}`}
//           >
//             <Hash size={14} />
//           </div>
//           <input
//             type="number"
//             min={1}
//             max={totalPages}
//             value={jumpPage}
//             onChange={(e) => setJumpPage(e.target.value)}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => !jumpPage && setIsFocused(false)}
//             placeholder="Jump to..."
//             className="w-20 bg-transparent text-sm font-medium focus:outline-none"
//             aria-label="Jump to page number"
//           />
//           <button
//             type="submit"
//             disabled={!jumpPage}
//             className={`flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white transition-all
//               ${jumpPage ? "opacity-100 scale-100 ml-1" : "opacity-0 scale-50 w-0 ml-0 overflow-hidden"}`}
//             aria-label="Go to page"
//           >
//             <ArrowRight size={14} />
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }
// 📂 src/app/shared/components/ui/PaginationControls.tsx

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
import Link from "next/link"; 
import { motion } from "framer-motion";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

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

  const createPageURL = (page: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) params.delete(paramName);
    else params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (pageNum: number, navType: string) => {
    logUserEvent('page_view', pathname, {
      page_depth: pageNum,
      param_name: paramName,
      navigation_type: navType
    });

    // ✅ SMOOTH SCROLL TO TOP: Scrolls page smoothly to top on page number click
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      router.replace(createPageURL(pageNum), { scroll: false });
      
      // ✅ SMOOTH SCROLL TO TOP: Scrolls page smoothly to top on jump input submit
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      logUserEvent('page_view', pathname, {
        page_depth: pageNum,
        param_name: paramName,
        navigation_type: 'jump_input'
      });
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
      <div className="flex flex-wrap items-center justify-center p-1.5 gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-2xl shadow-sm">
        {/* PREVIOUS */}
        <Link
          href={createPageURL(currentPage - 1)}
          aria-label="Go to previous page"
          className={`group flex items-center gap-1.5 pl-2 pr-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${currentPage === 1 ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary cursor-pointer"}`}
          scroll={false}
          onClick={() => handlePageClick(currentPage - 1, 'prev_click')}
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
                aria-label={`Go to page ${page}`}
                className={`relative w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer
                  ${isActive ? "text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-primary"}`}
                onClick={() => handlePageClick(page as number, 'number_click')}
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
          aria-label="Go to next page"
          className={`group flex items-center gap-1.5 pl-4 pr-2 py-2 rounded-xl text-sm font-semibold transition-all
            ${currentPage === totalPages ? "pointer-events-none opacity-30" : "hover:bg-white dark:hover:bg-gray-800 text-gray-600 hover:text-brand-primary cursor-pointer"}`}
          scroll={false}
          onClick={() => handlePageClick(currentPage + 1, 'next_click')}
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
            aria-label="Jump to page number"
          />
          <button
            type="submit"
            disabled={!jumpPage}
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white transition-all cursor-pointer
              ${jumpPage ? "opacity-100 scale-100 ml-1" : "opacity-0 scale-50 w-0 ml-0 overflow-hidden"}`}
            aria-label="Go to page"
          >
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
}