// 📂 src/app/not-found.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, ShoppingBag, Compass } from "lucide-react";

export default function NotFound() {
  // ✅ Auto-scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* 🎨 Background Ambient Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* 🏷️ Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-xs font-bold text-brand-primary uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-brand-primary opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-brand-primary" />
          </span>
          Error 404
        </div>

        {/* 🎯 Main 404 Display */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-brand-primary via-brand-primary-hover to-amber-400 select-none">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-linear-to-r from-transparent via-brand-primary/50 to-transparent rounded-full" />
        </div>

        {/* 📝 Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry — let's get you back on track.
          </p>
        </div>

        {/* 🔗 Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <Home size={18} />
            Go Home
          </Link>

          <Link
            href="/category"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Compass size={18} />
            Explore Categories
          </Link>
        </div>

        {/* 🔍 Quick Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-4">
            Here are some helpful shortcuts:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/search"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <Search size={16} />
              Search
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/deals"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ShoppingBag size={16} />
              Deals
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/contact-us"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}