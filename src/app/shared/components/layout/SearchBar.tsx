// "use client";

// import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import {
//   Search,
//   Camera,
//   X,
//   Loader2,
//   TrendingUp,
//   History,
//   Tag,
//   ArrowRight,
// } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
// import SanityProduct, { SanityCategory } from "@/types";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import Link from "next/link";
// // ✅ FIX 1: Use lodash/debounce for better tree-shaking
// import debounce from "lodash/debounce";
// import VisualSearchPanel from "@/app/shared/components/ui/VisualSearchPanell";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

// interface SearchSuggestions {
//   trendingKeywords: string[];
//   popularCategories: SanityCategory[];
// }
// interface SearchBarProps {
//   searchSuggestions: SearchSuggestions;
// }

// // Suggestion Pill Component
// const SearchSuggestionPill = ({
//   text,
//   icon: Icon,
//   onSelect,
// }: {
//   text: string;
//   icon: React.ComponentType<{ size?: number }>;
//   onSelect: (term: string) => void;
// }) => (
//   <button
//     type="button"
//     onClick={() => onSelect(text)}
//     className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-primary hover:text-white rounded-full text-sm text-gray-600 dark:text-gray-300 transition-all duration-200 active:scale-95"
//   >
//     <Icon size={14} />
//     <span className="font-medium">{text}</span>
//   </button>
// );

// export default function SearchBar({ searchSuggestions }: SearchBarProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [results, setResults] = useState<SanityProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);

//   const router = useRouter();
//   const pathname = usePathname();
//   const searchContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const resultsId = "search-results";

//   // 1. Recent Searches from LocalStorage
//   useEffect(() => {
//     const stored = localStorage.getItem("pocketvalue_recent_searches");
//     if (stored) {
//       try {
//         setRecentSearches(JSON.parse(stored));
//       } catch (e) {
//         console.error("Failed to parse recent searches", e);
//       }
//     }
//   }, []);

//   // ✅ FIX 4: Memoize addRecentSearch
//   const addRecentSearch = useCallback((term: string) => {
//     const trimmedTerm = term.trim();
//     if (!trimmedTerm) return;

//     setRecentSearches((prev) => {
//       const updated = [
//         trimmedTerm,
//         ...prev.filter((t) => t.toLowerCase() !== trimmedTerm.toLowerCase()),
//       ].slice(0, 5);
//       localStorage.setItem(
//         "pocketvalue_recent_searches",
//         JSON.stringify(updated),
//       );
//       return updated;
//     });
//   }, []);

//   // ✅ FIX 4: Memoize handleSearchSubmit
//   const handleSearchSubmit = useCallback(
//     (e?: React.FormEvent, term = searchTerm, trigger = "manual") => {
//       if (e) e.preventDefault();
//       const finalTerm = term.trim();
//       if (!finalTerm) return;

//       debouncedSearch.cancel();
//       addRecentSearch(finalTerm);

//       router.push(`/search?q=${encodeURIComponent(finalTerm)}&trigger=${trigger}`);

//       setSearchTerm("");
//       setResults([]);
//       setIsDropdownOpen(false);
//       setIsVisualSearchOpen(false);
//       inputRef.current?.blur();
//     },
//     [searchTerm, addRecentSearch, router]
//   );

//   // 3. Debounced Live Suggestions Fetcher
//   const debouncedSearch = useMemo(
//     () =>
//       debounce(async (query: string) => {
//         const cleanQuery = query.trim();
//         if (cleanQuery.length > 1) {
//           setIsLoading(true);
//           try {
//             const response = await fetch("/api/filter", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 context: { type: "search", value: cleanQuery },
//                 page: 1,
//               }),
//             });

//             if (!response.ok) throw new Error("Search failed");
//             const data = await response.json();
//             setResults(data.products?.slice(0, 4) || []);
//           } catch (error) {
//             console.error("Payload Live Search Error:", error);
//             setResults([]);
//           } finally {
//             setIsLoading(false);
//           }
//         } else {
//           setResults([]);
//         }
//       }, 300),
//     []
//   );

//   useEffect(() => {
//     debouncedSearch(searchTerm);
//     return () => debouncedSearch.cancel();
//   }, [searchTerm, debouncedSearch]);

//   // 4. Click Outside Handler
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchContainerRef.current &&
//         !searchContainerRef.current.contains(event.target as Node)
//       ) {
//         setIsDropdownOpen(false);
//         setIsVisualSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const showSuggestions = !searchTerm.trim();
//   const showResults = !!searchTerm.trim();

//   return (
//     <div
//       ref={searchContainerRef}
//       className="relative w-full z-50 max-w-2xl mx-auto"
//     >
//       {/* Search Input Capsule */}
//       <form
//         onSubmit={(e) => handleSearchSubmit(e, searchTerm, "manual")}
//         className={`
//           relative flex items-center w-full h-12.5 
//           bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm
//           border border-transparent focus-within:border-brand-primary/50 focus-within:bg-white dark:focus-within:bg-gray-900
//           focus-within:ring-4 focus-within:ring-brand-primary/10
//           rounded-full transition-all duration-300 ease-out shadow-sm
//         `}
//         role="search"
//       >
//         <div className="pl-5 pr-3 text-gray-400">
//           <Search size={20} aria-hidden="true" />
//         </div>

//         <input
//           ref={inputRef}
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search for products, brands and more..."
//           className="w-full h-full text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-400"
//           // ✅ FIX 2: Accessibility attributes
//           aria-label="Search for products, brands and more"
//           aria-expanded={isDropdownOpen || isVisualSearchOpen}
//           aria-controls={resultsId}
//           aria-autocomplete="list"
//           autoComplete="off"
//           onFocus={() => {
//             setIsVisualSearchOpen(false);
//             setIsDropdownOpen(true);
//           }}
//         />

//         <div className="flex items-center pr-2 gap-1">
//           <AnimatePresence>
//             {searchTerm && (
//               <motion.button
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.8 }}
//                 type="button"
//                 onClick={() => {
//                   setSearchTerm("");
//                   setResults([]);
//                 }}
//                 className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
//                 aria-label="Clear search"
//               >
//                 <X size={18} aria-hidden="true" />
//               </motion.button>
//             )}
//           </AnimatePresence>

//           <button
//             type="button"
//             onClick={() => {
//               setIsDropdownOpen(false);
//               setIsVisualSearchOpen((prev) => !prev);
//             }}
//             className={`p-2 rounded-full transition-all duration-200 ${
//               isVisualSearchOpen
//                 ? "text-brand-primary bg-brand-primary/10"
//                 : "text-gray-400 hover:text-brand-primary"
//             }`}
//             aria-label={isVisualSearchOpen ? "Close image search" : "Search by image"}
//           >
//             <Camera size={20} aria-hidden="true" />
//           </button>

//           <button
//             type="submit"
//             // ✅ FIX 3: Added aria-label
//             aria-label="Submit search"
//             className="ml-1 h-9 w-9 flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-md transform active:scale-95 transition-all"
//           >
//             <ArrowRight size={18} aria-hidden="true" />
//           </button>
//         </div>
//       </form>

//       {/* Visual Search AI Panel */}
//       <AnimatePresence>
//         {isVisualSearchOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className="absolute top-full mt-3 w-full"
//           >
//             <VisualSearchPanel onClose={() => setIsVisualSearchOpen(false)} />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Search Dropdown */}
//       <AnimatePresence>
//         {isDropdownOpen && !isVisualSearchOpen && (
//           <motion.div
//             id={resultsId}
//             // ✅ FIX 5: Added aria-live for screen reader announcements
//             aria-live="polite"
//             aria-label="Search results"
//             role="listbox"
//             initial={{ opacity: 0, y: 10, scale: 0.99 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.99 }}
//             className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto custom-scrollbar"
//           >
//             {showResults && (
//               <div className="py-2">
//                 {isLoading && (
//                   <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
//                     <Loader2
//                       className="animate-spin text-brand-primary"
//                       size={24}
//                       aria-hidden="true"
//                     />
//                     <span className="text-sm font-medium">
//                       Searching our catalog...
//                     </span>
//                   </div>
//                 )}

//                 {!isLoading && results.length > 0 && (
//                   <div className="py-2">
//                     <h3 className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
//                       Top Matches
//                     </h3>
//                     <ul>
//                       {results.map((product, index) => (
//                         <li key={product._id} role="option">
//                           <Link
//                             href={`/product/${product.slug}`}
//                             onClick={() => {
//                               addRecentSearch(searchTerm);
//                               logUserEvent("search_result_click", pathname, {
//                                 query: searchTerm,
//                                 clicked_product_id: product._id,
//                                 rank_position: index + 1,
//                                 is_quick_suggest: true,
//                               });
//                               setIsDropdownOpen(false);
//                               setSearchTerm("");
//                             }}
//                             className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
//                           >
//                             <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
//                               <Image
//                                 src={
//                                   product.defaultVariant.images?.[0]
//                                     ? urlFor(
//                                         product.defaultVariant.images[0]
//                                       ).url()
//                                     : PLACEHOLDER_IMAGE_URL
//                                 }
//                                 alt={product.title}
//                                 fill
//                                 className="object-contain p-1"
//                               />
//                             </div>
//                             <div className="grow overflow-hidden">
//                               <p className="font-medium text-sm text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-brand-primary">
//                                 {product.title}
//                               </p>
//                               <div className="flex items-center gap-2 mt-0.5">
//                                 <span className="text-sm font-bold text-brand-primary">
//                                   Rs.{" "}
//                                   {(
//                                     product.defaultVariant.salePrice ??
//                                     product.defaultVariant.price
//                                   ).toLocaleString()}
//                                 </span>
//                               </div>
//                             </div>
//                             <ArrowRight
//                               size={16}
//                               className="text-gray-300 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all"
//                               aria-hidden="true"
//                             />
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                     <div className="px-3 pt-2">
//                       <button
//                         onClick={() => handleSearchSubmit(undefined, searchTerm, "manual")}
//                         className="w-full py-3 mt-2 text-sm font-bold text-center text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover shadow-md"
//                       >
//                         View all results for &quot;{searchTerm}&quot;
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {!isLoading &&
//                   results.length === 0 &&
//                   searchTerm.length > 1 && (
//                     <div className="p-8 text-center text-gray-500 dark:text-gray-400">
//                       <Search
//                         size={32}
//                         className="mx-auto mb-2 opacity-20"
//                         aria-hidden="true"
//                       />
//                       <p className="text-base font-bold text-gray-800 dark:text-white">
//                         Product Not Found
//                       </p>
//                       <p className="text-xs">
//                         We don&apos;t have this in our warehouse yet.
//                       </p>

//                       <div className="mt-4 p-4 bg-orange-50/50 dark:bg-gray-850 rounded-2xl border border-brand-primary/10">
//                         <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 leading-tight">
//                           Humein bataein, hum isey aapke liye mangwa denge!
//                         </p>
//                         <Link
//                           href={`/request-product?q=${encodeURIComponent(searchTerm)}`}
//                           onClick={() => setIsDropdownOpen(false)}
//                           className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
//                         >
//                           Request to Source &quot;{searchTerm}&quot; →
//                         </Link>
//                       </div>
//                     </div>
//                   )}
//               </div>
//             )}

//             {showSuggestions && (
//               <div className="p-6 space-y-8">
//                 {/* Recent Searches Section */}
//                 {recentSearches.length > 0 && (
//                   <section>
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
//                         <History size={14} aria-hidden="true" /> Recent Searches
//                       </h3>
//                       <button
//                         onClick={() => {
//                           localStorage.removeItem(
//                             "pocketvalue_recent_searches"
//                           );
//                           setRecentSearches([]);
//                         }}
//                         className="text-[10px] font-semibold text-red-500 hover:underline"
//                       >
//                         Clear All
//                       </button>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {recentSearches.map((term) => (
//                         <SearchSuggestionPill
//                           key={term}
//                           text={term}
//                           icon={History}
//                           onSelect={(t) =>
//                             handleSearchSubmit(undefined, t, "recent_click")
//                           }
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {/* Trending Section */}
//                 {searchSuggestions?.trendingKeywords?.length > 0 && (
//                   <section>
//                     <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
//                       <TrendingUp size={14} aria-hidden="true" /> Trending Now
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {searchSuggestions.trendingKeywords.map((term) => (
//                         <SearchSuggestionPill
//                           key={term}
//                           text={term}
//                           icon={TrendingUp}
//                           onSelect={(t) =>
//                             handleSearchSubmit(undefined, t, "trending_click")
//                           }
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {/* Popular Categories Grid */}
//                 {searchSuggestions?.popularCategories?.length > 0 && (
//                   <section>
//                     <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
//                       <Tag size={14} aria-hidden="true" /> Popular Categories
//                     </h3>
//                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
//                       {searchSuggestions.popularCategories.map((cat) => (
//                         <Link
//                           key={cat._id}
//                           href={`/category/${cat.slug}`}
//                           onClick={() => setIsDropdownOpen(false)}
//                           className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
//                         >
//                           <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white shadow-sm group-hover:scale-110 transition-transform">
//                             {cat.image ? (
//                               <Image
//                                 src={cat.image}
//                                 alt={cat.name}
//                                 fill
//                                 className="object-cover"
//                                 sizes="48px"
//                               />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                                 <Tag
//                                   className="text-gray-300"
//                                   size={18}
//                                   aria-hidden="true"
//                                 />
//                               </div>
//                             )}
//                           </div>
//                           <p className="text-[10px] font-bold text-center text-gray-600 dark:text-gray-400 group-hover:text-brand-primary line-clamp-1">
//                             {cat.name}
//                           </p>
//                         </Link>
//                       ))}
//                     </div>
//                   </section>
//                 )}
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Camera,
  X,
  Loader2,
  TrendingUp,
  History,
  Tag,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SanityProduct, { SanityCategory } from "@/types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import debounce from "lodash/debounce";
import VisualSearchPanel from "@/app/shared/components/ui/VisualSearchPanell";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

interface SearchSuggestions {
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}
interface SearchBarProps {
  searchSuggestions: SearchSuggestions;
}

// Suggestion Pill Component
const SearchSuggestionPill = ({
  text,
  icon: Icon,
  onSelect,
}: {
  text: string;
  icon: React.ComponentType<{ size?: number }>;
  onSelect: (term: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(text)}
    className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-primary hover:text-white rounded-full text-sm text-gray-600 dark:text-gray-300 transition-all duration-200 active:scale-95"
  >
    <Icon size={14} />
    <span className="font-medium">{text}</span>
  </button>
);

export default function SearchBar({ searchSuggestions }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsId = "search-results";

  // 1. Recent Searches from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("pocketvalue_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // ✅ ENTERPRISE FIX: Memoize addRecentSearch
  const addRecentSearch = useCallback((term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    setRecentSearches((prev) => {
      const updated = [
        trimmedTerm,
        ...prev.filter((t) => t.toLowerCase() !== trimmedTerm.toLowerCase()),
      ].slice(0, 5);
      localStorage.setItem(
        "pocketvalue_recent_searches",
        JSON.stringify(updated),
      );
      return updated;
    });
  }, []);

  // ✅ ENTERPRISE FIX: handleSearchSubmit with SEARCH EVENT telemetry
  const handleSearchSubmit = useCallback(
    (e?: React.FormEvent, term = searchTerm, trigger = "manual") => {
      if (e) e.preventDefault();
      const finalTerm = term.trim();
      if (!finalTerm) return;

      // ✅ ENTERPRISE FIX: Log search event
      logUserEvent("search", pathname, {
        query: finalTerm,
        trigger,
        result_count: results.length,
      });

      debouncedSearch.cancel();
      addRecentSearch(finalTerm);

      router.push(`/search?q=${encodeURIComponent(finalTerm)}&trigger=${trigger}`);

      setSearchTerm("");
      setResults([]);
      setIsDropdownOpen(false);
      setIsVisualSearchOpen(false);
      inputRef.current?.blur();
    },
    [searchTerm, results.length, addRecentSearch, router, pathname]
  );

  // 3. Debounced Live Suggestions Fetcher
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const cleanQuery = query.trim();
        if (cleanQuery.length > 1) {
          setIsLoading(true);
          try {
            const response = await fetch("/api/filter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                context: { type: "search", value: cleanQuery },
                page: 1,
              }),
            });

            if (!response.ok) throw new Error("Search failed");
            const data = await response.json();
            setResults(data.products?.slice(0, 4) || []);
          } catch (error) {
            console.error("Payload Live Search Error:", error);
            setResults([]);
          } finally {
            setIsLoading(false);
          }
        } else {
          setResults([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // 4. Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsVisualSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ENTERPRISE FIX: Visual Search Toggle Telemetry
  const handleVisualSearchToggle = useCallback(() => {
    const newState = !isVisualSearchOpen;
    setIsVisualSearchOpen(newState);
    if (newState) {
      setIsDropdownOpen(false);
    }
    logUserEvent("visual_search_toggle", pathname, {
      action: newState ? "open" : "close",
      source: "search_bar",
    });
  }, [isVisualSearchOpen, pathname]);

  const showSuggestions = !searchTerm.trim();
  const showResults = !!searchTerm.trim();

  return (
    <div
      ref={searchContainerRef}
      className="relative w-full z-50 max-w-2xl mx-auto"
    >
      {/* Search Input Capsule */}
      <form
        onSubmit={(e) => handleSearchSubmit(e, searchTerm, "manual")}
        className={`
          relative flex items-center w-full h-12.5 
          bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm
          border border-transparent focus-within:border-brand-primary/50 focus-within:bg-white dark:focus-within:bg-gray-900
          focus-within:ring-4 focus-within:ring-brand-primary/10
          rounded-full transition-all duration-300 ease-out shadow-sm
        `}
        role="search"
      >
        <div className="pl-5 pr-3 text-gray-400">
          <Search size={20} aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products, brands and more..."
          className="w-full h-full text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-400"
          aria-label="Search for products, brands and more"
          aria-expanded={isDropdownOpen || isVisualSearchOpen}
          aria-controls={resultsId}
          aria-autocomplete="list"
          autoComplete="off"
          onFocus={() => {
            setIsVisualSearchOpen(false);
            setIsDropdownOpen(true);
          }}
        />

        <div className="flex items-center pr-2 gap-1">
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setResults([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <X size={18} aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleVisualSearchToggle}
            className={`p-2 rounded-full transition-all duration-200 ${
              isVisualSearchOpen
                ? "text-brand-primary bg-brand-primary/10"
                : "text-gray-400 hover:text-brand-primary"
            }`}
            aria-label={isVisualSearchOpen ? "Close image search" : "Search by image"}
          >
            <Camera size={20} aria-hidden="true" />
          </button>

          <button
            type="submit"
            aria-label="Submit search"
            className="ml-1 h-9 w-9 flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-md transform active:scale-95 transition-all"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Visual Search AI Panel */}
      <AnimatePresence>
        {isVisualSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-3 w-full"
          >
            <VisualSearchPanel onClose={() => setIsVisualSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Search Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && !isVisualSearchOpen && (
          <motion.div
            id={resultsId}
            aria-live="polite"
            aria-label="Search results"
            role="listbox"
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto custom-scrollbar"
          >
            {showResults && (
              <div className="py-2">
                {isLoading && (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
                    <Loader2
                      className="animate-spin text-brand-primary"
                      size={24}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">
                      Searching our catalog...
                    </span>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="py-2">
                    <h3 className="px-5 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Top Matches
                    </h3>
                    <ul>
                      {results.map((product, index) => (
                        <li key={product._id} role="option">
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={() => {
                              addRecentSearch(searchTerm);
                              logUserEvent("search_result_click", pathname, {
                                query: searchTerm,
                                clicked_product_id: product._id,
                                rank_position: index + 1,
                                is_quick_suggest: true,
                              });
                              setIsDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                          >
                            <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
                              <Image
                                src={
                                  product.defaultVariant.images?.[0]
                                    ? urlFor(
                                        product.defaultVariant.images[0]
                                      ).url()
                                    : PLACEHOLDER_IMAGE_URL
                                }
                                alt={product.title}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="grow overflow-hidden">
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-brand-primary">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-bold text-brand-primary">
                                  Rs.{" "}
                                  {(
                                    product.defaultVariant.salePrice ??
                                    product.defaultVariant.price
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <ArrowRight
                              size={16}
                              className="text-gray-300 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="px-3 pt-2">
                      <button
                        onClick={() => {
                          // ✅ ENTERPRISE FIX: Log search before navigation
                          logUserEvent("search", pathname, {
                            query: searchTerm,
                            trigger: "view_all_results",
                            result_count: results.length,
                          });
                          handleSearchSubmit(undefined, searchTerm, "manual");
                        }}
                        className="w-full py-3 mt-2 text-sm font-bold text-center text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover shadow-md"
                      >
                        View all results for &quot;{searchTerm}&quot;
                      </button>
                    </div>
                  </div>
                )}

                {!isLoading &&
                  results.length === 0 &&
                  searchTerm.length > 1 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Search
                        size={32}
                        className="mx-auto mb-2 opacity-20"
                        aria-hidden="true"
                      />
                      <p className="text-base font-bold text-gray-800 dark:text-white">
                        Product Not Found
                      </p>
                      <p className="text-xs">
                        We don&apos;t have this in our warehouse yet.
                      </p>

                      <div className="mt-4 p-4 bg-orange-50/50 dark:bg-gray-850 rounded-2xl border border-brand-primary/10">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 leading-tight">
                          Humein bataein, hum isey aapke liye mangwa denge!
                        </p>
                        <Link
                          href={`/request-product?q=${encodeURIComponent(searchTerm)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                        >
                          Request to Source &quot;{searchTerm}&quot; →
                        </Link>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {showSuggestions && (
              <div className="p-6 space-y-8">
                {/* Recent Searches Section */}
                {recentSearches.length > 0 && (
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                        <History size={14} aria-hidden="true" /> Recent Searches
                      </h3>
                      <button
                        onClick={() => {
                          localStorage.removeItem(
                            "pocketvalue_recent_searches"
                          );
                          setRecentSearches([]);
                        }}
                        className="text-[10px] font-semibold text-red-500 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={History}
                          onSelect={(t) =>
                            handleSearchSubmit(undefined, t, "recent_click")
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Section */}
                {searchSuggestions?.trendingKeywords?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                      <TrendingUp size={14} aria-hidden="true" /> Trending Now
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.trendingKeywords.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={TrendingUp}
                          onSelect={(t) =>
                            handleSearchSubmit(undefined, t, "trending_click")
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular Categories Grid */}
                {searchSuggestions?.popularCategories?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                      <Tag size={14} aria-hidden="true" /> Popular Categories
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {searchSuggestions.popularCategories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                        >
                          <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white shadow-sm group-hover:scale-110 transition-transform">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Tag
                                  className="text-gray-300"
                                  size={18}
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-center text-gray-600 dark:text-gray-400 group-hover:text-brand-primary line-clamp-1">
                            {cat.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}