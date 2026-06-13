// src/app/components/layout/MainLayoutClient.tsx

"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SanityCategory } from "@/sanity/types/product_types";
import NewSidebar from "./NewSidebar";
import NewHeader from "./NewHeader";
import NewRightDock from "./NewRightDock";
import MainFooter from "./Footer";
import MegaMenu from "./MegaMenu";
import TopActionBar from "@/app/components/ui/ActionBar";
import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
import BottomNav from "./BottomMobileNav";
import MobileMenu from "./MobileMenu";
import SearchPanel from "../ui/MobileSearchPanel";
import MobileProfileSidebar from "./MobileProfileSidebar";
import type { GlobalSettings } from "@/sanity/lib/queries";
import BackToTopButton from "../ui/BackToTopButton";
import ScrollToTop from "../ui/ScrollToTop";

interface SearchSuggestions {
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}

interface MainLayoutClientProps {
  categories: SanityCategory[];
  children: ReactNode;
  searchSuggestions: SearchSuggestions;
  globalSettings: GlobalSettings;
}

// CONSTANTS (Reference ke liye)
const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const HEADER_HEIGHT_MOBILE = 70;
// const SECONDARY_NAV_HEIGHT = 40;

const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

export default function MainLayoutClient({
  categories,
  children,
  searchSuggestions,
  globalSettings,
}: MainLayoutClientProps) {
  const pathname = usePathname();
  const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  // 🔥 FIX 1: isMobile state ko wapas layein aur shuru mein 'null' rakhein
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  // Local UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Check if current page is Checkout
  const isCheckoutPage = pathname?.startsWith("/checkout");

  // === SCROLL LISTENER ===
  useEffect(() => {
    setIsScrolled(window.scrollY > 50);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const newScrolled = window.scrollY > 50;
          if (newScrolled !== isScrolled) {
            setIsScrolled(newScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  // 🔥 FIX 2: Check Mobile status on mount
  useEffect(() => {
    // isMobile will be true if window width < 768px
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // [] is important here to run only once

  const closeAllPanels = () => {
    setIsMobileMenuOpen(false);
    setIsSearchPanelOpen(false);
    setIsProfileSidebarOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("CLOSE_FILTER_SIDEBAR"));
    }
  };

  const handleToggleMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    else {
      closeAllPanels();
      setIsMobileMenuOpen(true);
    }
  };

  const handleToggleSearch = () => {
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
    else {
      closeAllPanels();
      setIsSearchPanelOpen(true);
    }
  };

  const handleToggleProfile = () => {
    if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
    else {
      closeAllPanels();
      setIsProfileSidebarOpen(true);
    }
  };

  // ✅ Sidebar top offset calculation (Desktop Only)
  const topOffsetDesktop = isScrolled
    ? HEADER_HEIGHT_SCROLLED_DESKTOP
    : 18 + 87 + 40; // 145px

  if (isCheckoutPage) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
      <ScrollToTop />

      {/* HEADER STACK (Fixed Top) */}
      <div
        className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: isScrolled
            ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
            : "translateY(0)",
        }}
      >
        <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

        <NewHeader
          categories={categories}
          onMenuClick={handleToggleMenu}
          searchSuggestions={searchSuggestions}
        />

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"}`}
        >
          <SecondaryNavBar
            isVisible={!isScrolled}
            links={globalSettings?.secondaryNavLinks}
            onCategoryClick={handleToggleMenu}
          />
        </div>
      </div>

      {/* SIDEBARS (Desktop) */}
      <div
        className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]"
        style={{
          top: `${topOffsetDesktop}px`,
          height: `calc(100vh - ${topOffsetDesktop}px)`,
        }}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <NewSidebar
          categories={categories}
          onCategoryHover={setHoveredCategory}
        />
        <div className="absolute left-16 top-0 h-full">
          <MegaMenu category={hoveredCategory} />
        </div>
      </div>

      <NewRightDock topOffset={topOffsetDesktop} />

      {/* MOBILE DRAWERS */}
      <MobileMenu
        categories={categories}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <MobileProfileSidebar
        isOpen={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
      />
      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        trendingKeywords={searchSuggestions.trendingKeywords}
        popularCategories={searchSuggestions.popularCategories}
      />

      <BottomNav
        onCategoriesClick={handleToggleMenu}
        onSearchClick={handleToggleSearch}
        onProfileClick={handleToggleProfile}
      />

      {/* === MAIN CONTENT AREA === */}
      <div className="relative flex flex-col min-h-screen w-full">
        <main
          className={`
            grow w-full
            transition-[padding-top] duration-300 ease-out will-change-[padding-top]
            lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
            ${isScrolled ? "pt-17.5 lg:pt-21.75" : "pt-22 lg:pt-36.25"}
          `}
        >
          {children}
        </main>

        {/* Global Back To Top */}
        <div>
          <BackToTopButton />
        </div>

        <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
          {/* 🔥 FIX 3: Pass isMobile prop here */}
          <MainFooter settings={globalSettings} isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
}
// // src/app/components/layout/MainLayoutClient.tsx

// "use client";

// import { useState, useEffect, ReactNode } from "react";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/sanity/types/product_types";
// import NewSidebar from "./NewSidebar";
// import NewHeader from "./NewHeader";
// import NewRightDock from "./NewRightDock";
// import MainFooter from "./Footer";
// import MegaMenu from "./MegaMenu";
// import TopActionBar from "@/app/components/ui/ActionBar";
// import SecondaryNavBar from "@/app/components/ui/SecondaryNavBar";
// import BottomNav from "./BottomMobileNav";
// import MobileMenu from "./MobileMenu";
// import SearchPanel from "../ui/MobileSearchPanel";
// import MobileProfileSidebar from "./MobileProfileSidebar";
// import type { GlobalSettings } from "@/sanity/lib/queries";
// import BackToTopButton from "../ui/BackToTopButton";
// import ScrollToTop from "../ui/ScrollToTop";

// interface SearchSuggestions {
//   trendingKeywords: string[];
//   popularCategories: SanityCategory[];
// }

// interface MainLayoutClientProps {
//   categories: SanityCategory[];
//   children: ReactNode;
//   searchSuggestions: SearchSuggestions;
//   globalSettings: GlobalSettings;
// }

// // 📏 Optimized Constants
// const TOP_BAR_HEIGHT = 18;
// const MAIN_HEADER_HEIGHT = 87;
// const SECONDARY_NAV_HEIGHT = 40;
// const TOTAL_HEADER_HEIGHT = TOP_BAR_HEIGHT + MAIN_HEADER_HEIGHT + SECONDARY_NAV_HEIGHT; // 145px

// export default function MainLayoutClient({
//   categories,
//   children,
//   searchSuggestions,
//   globalSettings,
// }: MainLayoutClientProps) {
//   const pathname = usePathname();
//   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobile, setIsMobile] = useState<boolean | null>(null);

//   // UI Panels State
//   const [activePanel, setActivePanel] = useState<"menu" | "search" | "profile" | null>(null);

//   const isCheckoutPage = pathname?.startsWith("/checkout");

//   // === 1. BODY SCROLL LOCK LOGIC ===
//   useEffect(() => {
//     if (activePanel) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//   }, [activePanel]);

//   // === 2. OPTIMIZED SCROLL LISTENER ===
//   useEffect(() => {
//     const handleScroll = () => {
//       const offset = window.scrollY;
//       setIsScrolled(offset > 40);
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // === 3. RESPONSIVE CHECK (Hydration Safe) ===
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 1024);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Panel Handlers
//   const closeAll = () => setActivePanel(null);
//   const togglePanel = (panel: "menu" | "search" | "profile") => {
//     setActivePanel(prev => prev === panel ? null : panel);
//     if (typeof window !== 'undefined') {
//         window.dispatchEvent(new Event('CLOSE_FILTER_SIDEBAR'));
//     }
//   };

//   // ✅ Optimized Offset Calculations
//   const desktopTopOffset = isScrolled ? MAIN_HEADER_HEIGHT : TOTAL_HEADER_HEIGHT;

//   // early return for checkout
//   if (isCheckoutPage) {
//       return <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>;
//   }

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col selection:bg-brand-primary/20">
//       <ScrollToTop />

//       {/* --- HEADER STACK --- */}
//       <header
//         className="fixed top-0 w-full z-60 transition-transform duration-300 ease-out will-change-transform"
//         style={{ transform: isScrolled ? `translateY(-${TOP_BAR_HEIGHT}px)` : "translateY(0)" }}
//       >
//         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

//         <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
//             <NewHeader
//               categories={categories}
//               onMenuClick={() => togglePanel("menu")}
//               searchSuggestions={searchSuggestions}
//             />

//             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
//                <SecondaryNavBar
//                   isVisible={!isScrolled}
//                   links={globalSettings?.secondaryNavLinks}
//                   onCategoryClick={() => togglePanel("menu")}
//                />
//             </div>
//         </div>
//       </header>

//       {/* --- DESKTOP NAVIGATION DOCKS --- */}
//       {!isMobile && (
//         <>
//             <div
//                 className="fixed left-0 z-50 transition-[top,height] duration-300 ease-out"
//                 style={{ top: `${desktopTopOffset}px`, height: `calc(100vh - ${desktopTopOffset}px)` }}
//                 onMouseLeave={() => setHoveredCategory(null)}
//             >
//                 <NewSidebar categories={categories} onCategoryHover={setHoveredCategory} />
//                 <div className="absolute left-16 top-0 h-full">
//                     <MegaMenu category={hoveredCategory} />
//                 </div>
//             </div>
//             <NewRightDock topOffset={desktopTopOffset} />
//         </>
//       )}

//       {/* --- MOBILE OVERLAYS (Z-INDEX 70+) --- */}
//       <MobileMenu categories={categories} isOpen={activePanel === "menu"} onClose={closeAll} />
//       <MobileProfileSidebar isOpen={activePanel === "profile"} onClose={closeAll} />
//       <SearchPanel
//         isOpen={activePanel === "search"}
//         onClose={closeAll}
//         trendingKeywords={searchSuggestions.trendingKeywords}
//         popularCategories={searchSuggestions.popularCategories}
//       />

//       <BottomNav
//         onCategoriesClick={() => togglePanel("menu")}
//         onSearchClick={() => togglePanel("search")}
//         onProfileClick={() => togglePanel("profile")}
//       />

//       {/* --- MAIN CONTENT AREA --- */}
//       <div className="relative flex flex-col flex-1 w-full">
//         <main
//           className={`
//             grow w-full transition-[padding] duration-300 ease-out
//             lg:pl-16 lg:pr-16
//             pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0
//             ${isScrolled ? "pt-21.75" : "pt-36.25"}
//           `}
//         >
//           {children}
//         </main>

//         <BackToTopButton />

//         <footer className="lg:pl-16 lg:pr-16 pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-0">
//           <MainFooter settings={globalSettings} isMobile={isMobile} />
//         </footer>
//       </div>
//     </div>
//   );
// }
