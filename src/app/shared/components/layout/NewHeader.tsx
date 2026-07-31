"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SanityCategory } from "@/types";
import SearchBar from "./SearchBar";
import HeaderActions from "./HeaderActions";
import { LayoutGrid, Search, ArrowLeft } from "lucide-react";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";

interface SearchSuggestions {
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}
interface NewHeaderProps {
  categories: SanityCategory[];
  onMenuClick: () => void;
  searchSuggestions: SearchSuggestions;
}

export default function NewHeader({
  onMenuClick,
  searchSuggestions,
}: NewHeaderProps) {
  const logoIconRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTabletSearchOpen, setIsTabletSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔥 FIX: Function Defined BEFORE useEffect
  const playLogoAnimation = () => {
    if (isAnimating || !logoIconRef.current) return;
    setIsAnimating(true);
    const isLargeScreen = window.innerWidth >= 1024;
    const tl = gsap.timeline({ onComplete: () => setIsAnimating(false) });
    if (isLargeScreen) {
      tl.to(logoIconRef.current, {
        x: -120,
        rotation: -360,
        scale: 1.1,
        duration: 1.5,
        ease: "power2.inOut",
      }).to(logoIconRef.current, {
        x: 0,
        rotation: 0,
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
        delay: 0.1,
      });
    } else {
      tl.to(logoIconRef.current, {
        rotation: -360,
        scale: 1.2,
        duration: 1.5,
        ease: "power2.inOut",
      }).to(logoIconRef.current, {
        rotation: 0,
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => playLogoAnimation(), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === STATIC SKELETON ===
  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 w-full z-50 relative">
        <div className="max-w-480 mx-auto w-full">
          <div className="hidden md:flex items-center justify-between h-20 lg:h-28 px-6 lg:px-12 gap-8">
            <div className="flex items-center gap-4">
              <div className="hidden md:block lg:hidden w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="w-14 h-14 lg:w-20 lg:h-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="w-24 lg:w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="w-16 lg:w-20 h-2 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="hidden lg:block grow max-w-4xl px-4">
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block lg:hidden w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <HeaderActions isMobile={false} />
            </div>
          </div>
          <div className="md:hidden flex items-center justify-between h-20 px-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div>
              <HeaderActions isMobile={true} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // === REAL HEADER ===
  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 w-full z-50 relative">
      <div className="max-w-480 mx-auto w-full">
        {/* DESKTOP */}
        <div className="hidden lg:flex items-center justify-between h-28 w-full px-8 xl:px-12 gap-8">
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-4 group"
              onMouseEnter={playLogoAnimation}
            >
              <div
                ref={logoIconRef}
                className="relative h-20 w-20 filter drop-shadow-sm"
              >
                <Image
                  src="/usamabrand.svg"
                  alt="PocketValue Logo"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-gray-900 dark:text-white text-3xl font-clash font-bold tracking-tight leading-none">
                  PocketValue
                </span>
                <span className="text-sm text-brand-primary font-medium tracking-widest uppercase mt-1">
                  Premium Store
                </span>
              </div>
            </Link>
          </div>
          <div className="grow max-w-4xl px-4 relative z-50">
            <SearchBar searchSuggestions={searchSuggestions} />
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <HeaderActions isMobile={false} />
          </div>
        </div>

        {/* TABLET */}
        <div
          className={`hidden md:flex lg:hidden items-center justify-between h-24 w-full px-6 gap-4 relative ${
            isTabletSearchOpen ? "overflow-visible" : "overflow-hidden"
          }`}
        >
          <AnimatePresence mode="wait">
            {!isTabletSearchOpen ? (
              <motion.div
                key="normal-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* ✅ FIX 1: Added aria-label for menu toggle */}
                  <button
                    onClick={onMenuClick}
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-primary hover:text-white transition-colors shrink-0"
                    aria-label="Toggle navigation menu"
                  >
                    <LayoutGrid size={24} aria-hidden="true" />
                  </button>
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                    onMouseEnter={playLogoAnimation}
                  >
                    <div className="relative h-16 w-16 shrink-0">
                      <Image
                        src="/usamabrand.svg"
                        alt="PocketValue Logo"
                        fill
                        className="object-contain"
                        priority
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-2xl font-clash font-bold text-gray-900 dark:text-white leading-none">
                        PocketValue
                      </span>
                      <span className="text-xs text-brand-primary font-medium tracking-widest uppercase mt-0.5">
                        Premium Store
                      </span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  {/* ✅ FIX 2: Added aria-label for search toggle */}
                  <button
                    onClick={() => setIsTabletSearchOpen(true)}
                    className="p-2.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-brand-primary/10 text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-all"
                    aria-label="Open search"
                  >
                    <Search size={22} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <HeaderActions isMobile={false} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="search-nav"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center gap-3 z-50"
              >
                {/* ✅ FIX 2: Added aria-label for close search */}
                <button
                  onClick={() => setIsTabletSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0"
                  aria-label="Close search"
                >
                  <ArrowLeft
                    size={24}
                    className="text-gray-600 dark:text-gray-300"
                    aria-hidden="true"
                  />
                </button>
                <div className="grow relative z-50">
                  <SearchBar searchSuggestions={searchSuggestions} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex items-center justify-between w-full h-20 px-4 relative overflow-hidden">
          <Link
            href="/"
            className="flex items-center gap-3 z-10"
            onMouseEnter={playLogoAnimation}
          >
            <div className="relative h-14 w-14 filter drop-shadow-sm shrink-0">
              <Image
                src="/usamabrand.svg"
                alt="PocketValue Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-clash font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                PocketValue
              </span>
              <span className="text-[10px] text-brand-primary font-medium tracking-wider uppercase mt-0.5">
                Premium Store
              </span>
            </div>
          </Link>
          <div className="z-10">
            <HeaderActions isMobile={true} />
          </div>
        </div>
      </div>
    </header>
  );
}