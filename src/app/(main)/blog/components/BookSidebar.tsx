// 📂 src/app/blog/components/BookSidebar.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Bookmark, ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ================================================================
// ✅ TYPES
// ================================================================
export interface BookChapterItem {
  _id: string;
  title: string;
  slug: string;
  categoryName?: string;
  categorySlug?: string;
  publishedAt?: string;
}

interface BookSidebarProps {
  chapters: BookChapterItem[];
  currentSlug?: string;
  title?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT — Left Sidebar Book Index (Docusaurus Tree Style)
// ================================================================
export default function BookSidebar({
  chapters = [],
  currentSlug = "",
  title = "Blog Index",
}: BookSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openVolumes, setOpenVolumes] = useState<Record<string, boolean>>({});

  // Group chapters by Category/Volume
  const groupedChapters = useMemo(() => {
    const map = new Map<string, BookChapterItem[]>();

    for (const chapter of chapters) {
      const cat = chapter.categoryName || "General Guides";
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(chapter);
    }

    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [chapters]);

  // ✅ Auto-expand volume containing active chapter on load
  useEffect(() => {
    if (currentSlug && groupedChapters.length > 0) {
      const activeVol = groupedChapters.find(({ items }) =>
        items.some((item) => item.slug === currentSlug)
      );
      if (activeVol) {
        setOpenVolumes((prev) => ({ ...prev, [activeVol.category]: true }));
      }
    } else if (groupedChapters.length > 0) {
      setOpenVolumes((prev) => ({ ...prev, [groupedChapters[0].category]: true }));
    }
  }, [currentSlug, groupedChapters]);

  const toggleVolume = (volName: string) => {
    setOpenVolumes((prev) => ({ ...prev, [volName]: !prev[volName] }));
  };

  // Filtered chapters for search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedChapters;

    const query = searchQuery.toLowerCase().trim();
    return groupedChapters
      .map(({ category, items }) => ({
        category,
        items: items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query)
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [groupedChapters, searchQuery]);

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden mb-4 p-3.5 bg-white dark:bg-gray-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-2xs font-mono text-xs">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
          <BookOpen size={15} className="text-brand-primary" />
          <span>{title} ({chapters.length} Guides)</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-brand-primary transition-colors cursor-pointer"
          aria-label="Toggle Blog Index Drawer"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Main Sidebar (Connected Canvas Style) */}
      <aside
        className={`bg-transparent space-y-4 font-mono ${
          mobileOpen ? "block" : "hidden lg:block"
        }`}
        aria-label="Blog Index Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/80 select-none">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
            <BookOpen size={14} className="text-brand-primary" />
            <span>{title}</span>
          </div>
          <span className="text-[9px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full font-extrabold font-mono">
            {chapters.length} GUIDES
          </span>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs font-sans font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Chapter Groups Tree List */}
        <div className="space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1">
          {filteredGroups.length > 0 ? (
            filteredGroups.map(({ category, items }, groupIdx) => {
              const isOpen = searchQuery.trim() ? true : !!openVolumes[category];

              return (
                <div key={category} className="space-y-1.5 select-none">
                  
                  {/* ACCORDION HEADER */}
                  <button
                    onClick={() => toggleVolume(category)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Bookmark size={12} className="text-brand-primary shrink-0" />
                      {/* ✅ FIX: Removed 'truncate' so Series/Volume title wraps naturally without cutoffs */}
                      <span className="text-[11px] uppercase font-black tracking-wider text-zinc-900 dark:text-zinc-100 font-mono leading-tight wrap-break-word">
                        Series {String(groupIdx + 1).padStart(2, "0")}: {category}
                      </span>
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-zinc-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-brand-primary" : ""
                      }`}
                    />
                  </button>

                  {/* NESTED TREE LIST */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden border-l-2 border-brand-primary/20 dark:border-brand-primary/30 ml-3 pl-2.5 space-y-1 my-1"
                        role="list"
                      >
                        {items.map((chapter, itemIdx) => {
                          const isActive = currentSlug === chapter.slug;

                          return (
                            <li key={chapter._id} role="listitem">
                              <Link
                                href={`/blog/${chapter.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className={`group/item flex items-start justify-between gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all no-underline hover:no-underline ${
                                  isActive
                                    ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-[0_0_10px_rgba(255,143,50,0.15)] font-bold"
                                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white"
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span
                                    className={`text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                                      isActive ? "text-brand-primary font-black" : "text-zinc-400 dark:text-zinc-500"
                                    }`}
                                  >
                                    Pt {String(itemIdx + 1).padStart(2, "0")}
                                  </span>
                                  {/* ✅ CRITICAL FIX: Removed 'truncate' / 'line-clamp-1'. Text now wraps multi-line naturally and is 100% full-title readable! */}
                                  <span className="text-xs font-bold leading-normal wrap-break-word font-sans">
                                    {chapter.title}
                                  </span>
                                </div>
                                <ChevronRight
                                  size={13}
                                  className={`shrink-0 mt-0.5 transition-transform ${
                                    isActive
                                      ? "text-brand-primary translate-x-0.5"
                                      : "text-zinc-400 opacity-0 group-hover/item:opacity-100"
                                  }`}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <p className="text-center py-6 text-zinc-400 font-sans text-xs italic">
              No matching guides found.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}