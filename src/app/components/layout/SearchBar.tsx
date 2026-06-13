// "use client";

// import { useState, useEffect, useRef, useMemo } from "react";
// import { useRouter } from "next/navigation";
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
// import SanityProduct, { SanityCategory } from "@/sanity/types/product_types";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import Link from "next/link";
// import { debounce } from "lodash";
// import VisualSearchPanel from "@/app/components/ui/VisualSearchPanell";

// // 🛑 OLD SANITY IMPORT (Commented)
// // import { searchProducts } from "@/sanity/lib/queries";

// const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

// interface SearchSuggestions {
//   trendingKeywords: string[];
//   popularCategories: SanityCategory[];
// }
// interface SearchBarProps {
//   searchSuggestions: SearchSuggestions;
// }

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
//   const router = useRouter();
//   const searchContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedSearches = localStorage.getItem("pocketvalue_recent_searches");
//       if (storedSearches) {
//         try {
//           setRecentSearches(JSON.parse(storedSearches));
//         } catch (e) {
//           console.error("Failed to parse recent searches", e);
//         }
//       }
//     }
//   }, []);

//   const addRecentSearch = (term: string) => {
//     const trimmedTerm = term.trim();
//     if (!trimmedTerm) return;
//     const updatedSearches = [
//       trimmedTerm,
//       ...recentSearches.filter(
//         (t) => t.toLowerCase() !== trimmedTerm.toLowerCase()
//       ),
//     ].slice(0, 5);
//     setRecentSearches(updatedSearches);
//     if (typeof window !== "undefined") {
//       localStorage.setItem(
//         "pocketvalue_recent_searches",
//         JSON.stringify(updatedSearches)
//       );
//     }
//   };

//   const handleSearchSubmit = (e: React.FormEvent, term = searchTerm) => {
//     e.preventDefault();
//     const finalTerm = term.trim();
//     if (!finalTerm) return;
//     addRecentSearch(finalTerm);
//     router.push(`/search?q=${encodeURIComponent(finalTerm)}`);
//     setSearchTerm("");
//     setResults([]);
//     setIsDropdownOpen(false);
//     inputRef.current?.blur();
//   };

//   const debouncedSearch = useMemo(
//     () =>
//       debounce(async (query: string) => {
//         if (query.trim().length > 1) {
//           setIsLoading(true);
//           try {
//             // 🔥 SWITCH: API call to our Payload-powered route
//             const response = await fetch("/api/filter", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 context: { type: "search", value: query.trim() },
//                 page: 1,
//               }),
//             });

//             if (!response.ok) throw new Error("Search failed");
//             const data = await response.json();

//             // Limit to 4 results for dropdown
//             setResults(data.products?.slice(0, 4) || []);

//           } catch (error) {
//             console.error("Search failed", error);
//             setResults([]);
//           } finally {
//              setIsLoading(false);
//           }
//         } else {
//           setResults([]);
//         }
//       }, 300),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedSearch.cancel();
//     };
//   }, [debouncedSearch]);

//   useEffect(() => {
//     debouncedSearch(searchTerm);
//   }, [searchTerm, debouncedSearch]);

//   // ... (Baqi UI Code same rahega, usmein koi change nahi) ...
//   // Niche wala poora UI waisa hi copy paste kar den jo aapke paas hai

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
//     <div ref={searchContainerRef} className="relative w-full z-50">
//       <form
//         onSubmit={handleSearchSubmit}
//         className={`
//           relative flex items-center w-full h-12.5
//           bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm
//           border border-transparent focus-within:border-brand-primary/50 focus-within:bg-white dark:focus-within:bg-gray-900
//           focus-within:ring-4 focus-within:ring-brand-primary/10
//           rounded-full transition-all duration-300 ease-out shadow-sm hover:shadow-md
//         `}
//       >
//         <div className="pl-5 pr-3 text-gray-400 dark:text-gray-500">
//           <Search size={20} />
//         </div>

//         <input
//           ref={inputRef}
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search for products, brands and more..."
//           className="w-full h-full text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
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
//                 onClick={() => setSearchTerm("")}
//                 className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//               >
//                 <X size={18} />
//               </motion.button>
//             )}
//           </AnimatePresence>

//           <button
//             type="button"
//             onClick={() => {
//               setIsDropdownOpen(false);
//               setIsVisualSearchOpen((prev) => !prev);
//             }}
//             className={`p-2 rounded-full transition-all duration-200 ${isVisualSearchOpen ? "text-brand-primary bg-brand-primary/10" : "text-gray-400 hover:text-brand-primary hover:bg-gray-200 dark:hover:bg-gray-700"}`}
//             title="Search by Image"
//           >
//             <Camera size={20} />
//           </button>

//           <button
//             type="submit"
//             className="ml-1 h-9 w-9 flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200"
//           >
//             <ArrowRight size={18} />
//           </button>
//         </div>
//       </form>

//       <AnimatePresence>
//         {isVisualSearchOpen && (
//           <motion.div
//             key="visual-search-panel"
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.98 }}
//             transition={{ duration: 0.2 }}
//             className="absolute top-full mt-3 w-full"
//           >
//             <VisualSearchPanel onClose={() => setIsVisualSearchOpen(false)} />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {isDropdownOpen && !isVisualSearchOpen && (
//           <motion.div
//             key="search-dropdown"
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.98 }}
//             transition={{ duration: 0.2, ease: "easeOut" }}
//             className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto custom-scrollbar"
//           >
//             {showResults && (
//               <div className="py-2">
//                 {isLoading && (
//                   <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
//                     <Loader2
//                       className="animate-spin text-brand-primary"
//                       size={24}
//                     />
//                     <span className="text-sm font-medium">Searching...</span>
//                   </div>
//                 )}

//                 {!isLoading && results.length > 0 && (
//                   <div className="py-2">
//                     <h3 className="px-5 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
//                       Top Results
//                     </h3>
//                     <ul>
//                       {results.map((product) => (
//                         <li key={product._id}>
//                           <Link
//                             href={`/product/${product.slug}`}
//                             onClick={() => {
//                               addRecentSearch(searchTerm);
//                               setSearchTerm("");
//                               setIsDropdownOpen(false);
//                             }}
//                             className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
//                           >
//                             <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
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
//                                 className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
//                               />
//                             </div>
//                             <div className="grow overflow-hidden">
//                               <p className="font-medium text-sm text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-brand-primary transition-colors">
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
//                                 {product.defaultVariant.salePrice && (
//                                   <span className="text-xs text-gray-400 line-through">
//                                     Rs.{" "}
//                                     {product.defaultVariant.price.toLocaleString()}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <ArrowRight
//                               size={16}
//                               className="text-gray-300 group-hover:text-brand-primary -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all"
//                             />
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                     <div className="px-3 pt-2">
//                       <button
//                         onClick={(e) => handleSearchSubmit(e)}
//                         className="w-full py-3 mt-2 text-sm font-bold text-center text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover transition-colors shadow-md hover:shadow-lg"
//                       >
//                         {/* ✅ FIX: Replaced " with &quot; */}
//                         View all results for &quot;{searchTerm}&quot;
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {!isLoading &&
//                   results.length === 0 &&
//                   searchTerm.length > 1 && (
//                     <div className="p-10 text-center text-gray-500">
//                       <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <Search size={32} className="text-gray-400" />
//                       </div>
//                       <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
//                         No results found
//                       </p>
//                       <p className="text-sm mt-1">
//                         Try searching for something else
//                       </p>
//                     </div>
//                   )}
//               </div>
//             )}

//             {showSuggestions && (
//               <div className="p-6 space-y-8">
//                 {recentSearches.length > 0 && (
//                   <section>
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
//                         <History size={14} /> Recent Searches
//                       </h3>
//                       <button
//                         onClick={() => {
//                           localStorage.removeItem(
//                             "pocketvalue_recent_searches"
//                           );
//                           setRecentSearches([]);
//                         }}
//                         className="text-[10px] font-semibold text-red-500 hover:text-red-600 hover:underline"
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
//                             handleSearchSubmit(new Event("submit") as any, t)
//                           }
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {searchSuggestions?.trendingKeywords?.length > 0 && (
//                   <section>
//                     <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
//                       <TrendingUp size={14} /> Trending Now
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {searchSuggestions.trendingKeywords.map((term) => (
//                         <SearchSuggestionPill
//                           key={term}
//                           text={term}
//                           icon={TrendingUp}
//                           onSelect={(t) =>
//                             handleSearchSubmit(new Event("submit") as any, t)
//                           }
//                         />
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {searchSuggestions?.popularCategories?.length > 0 && (
//                   <section>
//                     <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
//                       <Tag size={14} /> Popular Categories
//                     </h3>
//                     <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                       {searchSuggestions.popularCategories.map((cat) => (
//                         <Link
//                           key={cat._id}
//                           href={`/category/${cat.slug}`}
//                           onClick={() => setIsDropdownOpen(false)}
//                           className="flex flex-col items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white hover:shadow-md dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group"
//                         >
//                           <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white dark:bg-gray-700 shadow-sm group-hover:scale-110 transition-transform">
//                             {cat.image ? (
//                               <Image
//                                 src={cat.image}
//                                 alt={cat.name}
//                                 fill
//                                 className="object-cover"
//                                 sizes="48px"
//                               />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center">
//                                 <Tag className="text-gray-300" size={20} />
//                               </div>
//                             )}
//                           </div>
//                           <p className="text-[11px] font-bold text-center text-gray-600 dark:text-gray-400 group-hover:text-brand-primary line-clamp-2 leading-tight">
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
import { useRouter } from "next/navigation";
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
import SanityProduct, { SanityCategory } from "@/sanity/types/product_types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";
import { debounce } from "lodash";
import VisualSearchPanel from "@/app/components/ui/VisualSearchPanell"; // ✅ Ensure path is correct

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
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Recent Searches from LocalStorage
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

  // 2. Search Submission Handler
  const handleSearchSubmit = (e?: React.FormEvent, term = searchTerm) => {
    if (e) e.preventDefault();
    const finalTerm = term.trim();
    if (!finalTerm) return;

    debouncedSearch.cancel(); // 🔥 Logic Fix: Cancel any pending live search API calls
    addRecentSearch(finalTerm);

    router.push(`/search?q=${encodeURIComponent(finalTerm)}`);

    // Reset State
    setSearchTerm("");
    setResults([]);
    setIsDropdownOpen(false);
    setIsVisualSearchOpen(false);
    inputRef.current?.blur();
  };

  // 3. Debounced Live Suggestions Fetcher (Payload API)
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

            // Limit to top 4 results for the quick dropdown
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
    [],
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

  const showSuggestions = !searchTerm.trim();
  const showResults = !!searchTerm.trim();

  return (
    <div
      ref={searchContainerRef}
      className="relative w-full z-50 max-w-2xl mx-auto"
    >
      {/* Search Input Capsule */}
      <form
        onSubmit={(e) => handleSearchSubmit(e)}
        className={`
          relative flex items-center w-full h-12.5 
          bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm
          border border-transparent focus-within:border-brand-primary/50 focus-within:bg-white dark:focus-within:bg-gray-900
          focus-within:ring-4 focus-within:ring-brand-primary/10
          rounded-full transition-all duration-300 ease-out shadow-sm
        `}
      >
        <div className="pl-5 pr-3 text-gray-400">
          <Search size={20} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products, brands and more..."
          className="w-full h-full text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-400"
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
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(false);
              setIsVisualSearchOpen((prev) => !prev);
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              isVisualSearchOpen
                ? "text-brand-primary bg-brand-primary/10"
                : "text-gray-400 hover:text-brand-primary"
            }`}
            title="Search by Image"
          >
            <Camera size={20} />
          </button>

          <button
            type="submit"
            className="ml-1 h-9 w-9 flex items-center justify-center bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-md transform active:scale-95 transition-all"
          >
            <ArrowRight size={18} />
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
                      {results.map((product) => (
                        <li key={product._id}>
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={() => {
                              addRecentSearch(searchTerm);
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
                                        product.defaultVariant.images[0],
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
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="px-3 pt-2">
                      <button
                        onClick={() => handleSearchSubmit()}
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
                    <div className="p-10 text-center text-gray-500">
                      <Search size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-lg font-medium">No matches found</p>
                      <p className="text-sm">Try a different keyword</p>
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
                        <History size={14} /> Recent Searches
                      </h3>
                      <button
                        onClick={() => {
                          localStorage.removeItem(
                            "pocketvalue_recent_searches",
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
                          onSelect={(t) => handleSearchSubmit(undefined, t)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Section */}
                {searchSuggestions?.trendingKeywords?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                      <TrendingUp size={14} /> Trending Now
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.trendingKeywords.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={TrendingUp}
                          onSelect={(t) => handleSearchSubmit(undefined, t)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular Categories Grid */}
                {searchSuggestions?.popularCategories?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                      <Tag size={14} /> Popular Categories
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
                                <Tag className="text-gray-300" size={18} />
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
