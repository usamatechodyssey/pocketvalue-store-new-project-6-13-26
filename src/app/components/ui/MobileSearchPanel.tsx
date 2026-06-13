// src/app/components/ui/MobileSearchPanel.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, TrendingUp, History, Tag, Search, Trash2 } from "lucide-react";
import SearchBar from "../layout/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { SanityCategory } from "@/sanity/types/product_types";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}

const SearchSuggestionPill = ({
  text,
  icon: Icon,
  onSelect,
}: {
  text: string;
  icon: React.ElementType;
  onSelect: (term: string) => void;
}) => (
  <button
    onClick={() => onSelect(text)}
    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl text-[13px] font-bold text-gray-700 dark:text-gray-300 active:scale-95 transition-all border border-transparent"
  >
    <Icon size={14} className="text-gray-400" />
    <span>{text}</span>
  </button>
);

export default function SearchPanel({
  isOpen,
  onClose,
  trendingKeywords,
  popularCategories,
}: SearchPanelProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // 🔥 FIX 1: Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Auto-Close on Route Change
  useEffect(() => {
    if (isOpen) onClose();
  }, [pathname]);

  // Load Recent Searches on Open
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("pocketvalue_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, [isOpen]);

  const clearRecentSearches = () => {
    localStorage.removeItem("pocketvalue_recent_searches");
    setRecentSearches([]);
  };

  const handleSuggestionClick = useCallback(
    (term: string) => {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      // Update LocalStorage
      const updated = [
        trimmedTerm,
        ...recentSearches.filter(
          (t) => t.toLowerCase() !== trimmedTerm.toLowerCase(),
        ),
      ].slice(0, 5);
      localStorage.setItem(
        "pocketvalue_recent_searches",
        JSON.stringify(updated),
      );

      router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
      onClose();
    },
    [recentSearches, router, onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70 md:hidden"
          />

          {/* 2. SEARCH DRAWER */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 h-[92dvh] bg-white dark:bg-gray-900 z-80 flex flex-col rounded-t-[2.5rem] shadow-2xl md:hidden overflow-hidden"
          >
            {/* DRAG HANDLE */}
            <div
              className="w-full flex justify-center pt-4 pb-2"
              onClick={onClose}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                  <Search size={20} strokeWidth={3} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                  Search
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* SEARCH INPUT AREA */}
            <div className="px-6 py-6 shrink-0">
              <SearchBar
                searchSuggestions={{
                  trendingKeywords: [],
                  popularCategories: [],
                }}
              />
            </div>

            {/* SCROLLABLE SUGGESTIONS */}
            <div className="grow overflow-y-auto px-6 pb-20 custom-scrollbar">
              <div className="space-y-10">
                {/* 1. RECENT SEARCHES */}
                {recentSearches.length > 0 && (
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={12} /> Your Recent History
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] font-bold text-red-500 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={History}
                          onSelect={handleSuggestionClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. TRENDING NOW */}
                {trendingKeywords?.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TrendingUp size={12} /> Popular Right Now
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingKeywords.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={TrendingUp}
                          onSelect={handleSuggestionClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. EXPLORE CATEGORIES */}
                {popularCategories?.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Tag size={12} /> Shop by Category
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {popularCategories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-transparent active:border-brand-primary/30 transition-all"
                        >
                          <div className="w-14 h-14 relative rounded-full overflow-hidden bg-white shadow-sm border-2 border-white">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover"
                                sizes="60px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Tag className="text-gray-300" size={20} />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-center text-gray-600 dark:text-gray-300 line-clamp-1 uppercase tracking-tighter">
                            {cat.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
