
// 📂 src/app/shared/components/layout/NewHeader.tsx

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

  // === STATIC SKELETON (Aligned with Translucent Header) ===
  if (!mounted) {
    return (
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 w-full z-50 sticky top-0 transition-all duration-300">
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

  // === REAL STICKY HEADER (Glassmorphic Redesign) ===
  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 w-full z-50 sticky top-0 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="max-w-480 mx-auto w-full">
        {/* DESKTOP */}
        <div className="hidden lg:flex items-center justify-between h-28 w-full px-8 xl:px-12 gap-8">
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-4 group"
              onMouseEnter={playLogoAnimation}
            >
              {/* Logo Area */}
              <div
                ref={logoIconRef}
                className="relative h-20 w-20 shrink-0 select-none pointer-events-none"
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
              <div className="flex flex-col justify-center leading-none">
                <span className="text-gray-900 dark:text-white text-3xl font-clash font-bold tracking-tight leading-none transition-colors duration-200">
                  PocketValue
                </span>
                {/* ✅ BRAND ALIGNMENT: Integrated "Your Pocket. Our Value." on Desktop */}
                <span className="text-xs xl:text-sm text-brand-primary font-bold tracking-widest uppercase mt-1">
                  Your Pocket. Our Value.
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
                  <button
                    onClick={onMenuClick}
                    className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all shrink-0 border border-zinc-200/50 dark:border-zinc-800/50"
                    aria-label="Toggle navigation menu"
                  >
                    <LayoutGrid size={24} aria-hidden="true" />
                  </button>
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                    onMouseEnter={playLogoAnimation}
                  >
                    <div className="relative h-16 w-16 shrink-0 select-none pointer-events-none">
                      <Image
                        src="/usamabrand.svg"
                        alt="PocketValue Logo"
                        fill
                        className="object-contain"
                        priority
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col justify-center leading-none">
                      <span className="text-2xl font-clash font-bold text-gray-900 dark:text-white leading-none">
                        PocketValue
                      </span>
                      {/* ✅ BRAND ALIGNMENT: Integrated "Your Pocket. Our Value." on Tablet */}
                      <span className="text-[9px] lg:text-xs text-brand-primary font-bold tracking-wider uppercase mt-1">
                        Your Pocket. Our Value.
                      </span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsTabletSearchOpen(true)}
                    className="p-2.5 rounded-full bg-gray-50 dark:bg-zinc-900 hover:bg-brand-primary/10 text-gray-600 dark:text-gray-300 hover:text-brand-primary transition-all border border-zinc-200/50 dark:border-zinc-800/50"
                    aria-label="Open search"
                  >
                    <Search size={22} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                  <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
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
                <button
                  onClick={() => setIsTabletSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-full transition-colors shrink-0"
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
            <div className="relative h-14 w-14 shrink-0 select-none pointer-events-none">
              <Image
                src="/usamabrand.svg"
                alt="PocketValue Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-xl font-clash font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                PocketValue
              </span>
              {/* ✅ BRAND ALIGNMENT: Integrated "Your Pocket. Our Value." on Mobile (Font size micro-optimized) */}
              <span className="text-[8px] sm:text-[9px] text-brand-primary font-bold tracking-wider uppercase mt-1">
                Your Pocket. Our Value.
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