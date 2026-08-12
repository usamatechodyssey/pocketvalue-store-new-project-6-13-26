// 📂 src/app/blog/components/ChapterNavigation.tsx

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { BookChapterItem } from "./BookSidebar";

interface ChapterNavigationProps {
  prevChapter?: BookChapterItem | null;
  nextChapter?: BookChapterItem | null;
  bookIndexUrl?: string;
}

export default function ChapterNavigation({
  prevChapter,
  nextChapter,
  bookIndexUrl = "/blog",
}: ChapterNavigationProps) {
  if (!prevChapter && !nextChapter) return null;

  return (
    <nav
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 mt-12 border-t border-zinc-200/80 dark:border-zinc-800/80 font-mono"
      aria-label="Chapter navigation"
    >
      {/* Previous Chapter Link */}
      {prevChapter ? (
        <Link
          href={`/blog/${prevChapter.slug}`}
          className="group p-4 sm:p-5 bg-white dark:bg-gray-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-brand-primary/50 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all duration-300 no-underline hover:no-underline"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-1.5 group-hover:text-brand-primary transition-colors select-none">
            <ArrowLeft size={12} className="stroke-[2.5] text-brand-primary transition-transform group-hover:-translate-x-1" /> Previous Chapter
          </span>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans line-clamp-1 group-hover:text-brand-primary transition-colors">
            {prevChapter.title}
          </span>
        </Link>
      ) : (
        <Link
          href={bookIndexUrl}
          className="group p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between hover:border-brand-primary/40 transition-all duration-300 no-underline hover:no-underline"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-1.5 select-none">
            <BookOpen size={12} className="text-brand-primary" /> Start of Book
          </span>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 font-sans line-clamp-1 group-hover:text-brand-primary transition-colors">
            Return to Book Library
          </span>
        </Link>
      )}

      {/* Next Chapter Link */}
      {nextChapter ? (
        <Link
          href={`/blog/${nextChapter.slug}`}
          className="group p-4 sm:p-5 bg-white dark:bg-gray-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-brand-primary/50 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 hover:-translate-y-0.5 transition-all duration-300 text-right no-underline hover:no-underline sm:col-start-2"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 justify-end mb-1.5 group-hover:text-brand-primary transition-colors select-none">
            Next Chapter <ArrowRight size={12} className="stroke-[2.5] text-brand-primary transition-transform group-hover:translate-x-1" />
          </span>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans line-clamp-1 group-hover:text-brand-primary transition-colors">
            {nextChapter.title}
          </span>
        </Link>
      ) : (
        <div className="p-4 sm:p-5 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-between text-right sm:col-start-2 shadow-2xs select-none">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-end mb-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" /> End of Book
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans line-clamp-1">
            You completed all chapters!
          </span>
        </div>
      )}
    </nav>
  );
}