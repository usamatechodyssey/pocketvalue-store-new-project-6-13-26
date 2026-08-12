
// "use client";

// import { useState, useEffect, ReactNode, useCallback, useMemo } from "react";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/types";

// // ✅ Import GlobalSettings from correct location
// import type { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// // Layout components
// import NewSidebar from "./NewSidebar";
// import NewHeader from "./NewHeader";
// import NewRightDock from "./NewRightDock";
// import MainFooter from "./Footer";
// import MegaMenu from "./MegaMenu";
// import TopActionBar from "@/app/shared/components/ui/ActionBar";
// import SecondaryNavBar from "@/app/shared/components/ui/SecondaryNavBar";
// import BottomNav from "./BottomMobileNav";
// import MobileMenu from "./MobileMenu";
// import SearchPanel from "../ui/MobileSearchPanel";
// import MobileProfileSidebar from "./MobileProfileSidebar";
// import ScrollToTop from "../ui/ScrollToTop";

// // =========================================================================
// // TYPES
// // =========================================================================
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

// // =========================================================================
// // CONSTANTS
// // =========================================================================
// const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const SECONDARY_NAV_HEIGHT = 40;
// const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

// // =========================================================================
// // MAIN COMPONENT
// // =========================================================================
// export default function MainLayoutClient({
//   categories,
//   children,
//   searchSuggestions,
//   globalSettings,
// }: MainLayoutClientProps) {
//   const pathname = usePathname();

//   // Local UI states
//   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobile, setIsMobile] = useState<boolean | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
//   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   const isCheckoutPage = pathname?.startsWith("/checkout");

//   // ✅ Mount state for hydration
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 1. Scroll listener
//   useEffect(() => {
//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           const scrolled = window.scrollY > 50;
//           setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     setIsScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // 2. Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // 3. Close all overlays when route changes
//   useEffect(() => {
//     closeAllPanels();
//   }, [pathname]);

//   // =========================================================================
//   // HANDLERS
//   // =========================================================================

//   const closeAllPanels = useCallback(() => {
//     setIsMobileMenuOpen(false);
//     setIsSearchPanelOpen(false);
//     setIsProfileSidebarOpen(false);
//     if (typeof window !== "undefined") {
//       window.dispatchEvent(new Event("CLOSE_FILTER_SIDEBAR"));
//     }
//   }, []);

//   const handleToggleMenu = useCallback(() => {
//     if (isMobileMenuOpen) {
//       setIsMobileMenuOpen(false);
//     } else {
//       closeAllPanels();
//       setIsMobileMenuOpen(true);
//     }
//   }, [isMobileMenuOpen, closeAllPanels]);

//   const handleToggleSearch = useCallback(() => {
//     if (isSearchPanelOpen) {
//       setIsSearchPanelOpen(false);
//     } else {
//       closeAllPanels();
//       setIsSearchPanelOpen(true);
//     }
//   }, [isSearchPanelOpen, closeAllPanels]);

//   const handleToggleProfile = useCallback(() => {
//     if (isProfileSidebarOpen) {
//       setIsProfileSidebarOpen(false);
//     } else {
//       closeAllPanels();
//       setIsProfileSidebarOpen(true);
//     }
//   }, [isProfileSidebarOpen, closeAllPanels]);

//   const handleCategoryHover = useCallback((category: SanityCategory | null) => {
//     if (category) {
//       setHoveredCategory(category);
//     } else {
//       setTimeout(() => {
//         setHoveredCategory(null);
//       }, 50);
//     }
//   }, []);

//   // =========================================================================
//   // COMPUTED VALUES
//   // =========================================================================

//   const topOffsetDesktop = useMemo(() => {
//     return isScrolled
//       ? HEADER_HEIGHT_SCROLLED_DESKTOP
//       : TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
//   }, [isScrolled]);

//   const safeIsMobile = mounted ? isMobile : false;

//   // =========================================================================
//   // RENDER – CHECKOUT PAGE
//   // =========================================================================
//   if (isCheckoutPage) {
//     return (
//       <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
//     );
//   }

//   // =========================================================================
//   // RENDER – MAIN LAYOUT
//   // =========================================================================
//   return (
//     /* ✅ FIX 1: Set outer layout background to white/dark:bg-gray-950 */
//     <div className="bg-white dark:bg-gray-950 overflow-x-hidden min-h-screen flex flex-col">
//       <ScrollToTop />

//       <header
//         role="banner"
//         aria-label="Site header"
//         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
//         style={{
//           transform: isScrolled
//             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
//             : "translateY(0)",
//         }}
//       >
//         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

//         <NewHeader
//           categories={categories}
//           onMenuClick={handleToggleMenu}
//           searchSuggestions={searchSuggestions}
//         />

//         <div
//           className={`transition-all duration-300 ease-in-out overflow-hidden ${
//             isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
//           }`}
//         >
//           <SecondaryNavBar
//             isVisible={!isScrolled}
//             links={globalSettings?.secondaryNavLinks}
//             onCategoryClick={handleToggleMenu}
//           />
//         </div>
//       </header>

//       {/* Desktop Sidebars */}
//       <div
//         className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]"
//         style={{
//           top: `${topOffsetDesktop}px`,
//           height: `calc(100vh - ${topOffsetDesktop}px)`,
//         }}
//         onMouseLeave={() => handleCategoryHover(null)}
//       >
//         <NewSidebar
//           categories={categories}
//           onCategoryHover={handleCategoryHover}
//         />
//         <div className="absolute left-16 top-0 h-full">
//           <MegaMenu category={hoveredCategory} />
//         </div>
//       </div>

//       <NewRightDock topOffset={topOffsetDesktop} />

//       {/* Mobile Drawers */}
//       <MobileMenu
//         categories={categories}
//         isOpen={isMobileMenuOpen}
//         onClose={() => setIsMobileMenuOpen(false)}
//       />
//       <MobileProfileSidebar
//         isOpen={isProfileSidebarOpen}
//         onClose={() => setIsProfileSidebarOpen(false)}
//       />
//       <SearchPanel
//         isOpen={isSearchPanelOpen}
//         onClose={() => setIsSearchPanelOpen(false)}
//         trendingKeywords={searchSuggestions.trendingKeywords}
//         popularCategories={searchSuggestions.popularCategories}
//       />

//       <BottomNav
//         onCategoriesClick={handleToggleMenu}
//         onSearchClick={handleToggleSearch}
//         onProfileClick={handleToggleProfile}
//       />

//       {/* Main Content Wrapper */}
//       {/* ✅ FIX 2: Added flex flex-col and bg-white to ensure complete page background consistency */}
//       <div className="relative flex flex-col grow w-full bg-white dark:bg-gray-950">
//         <main
//           role="main"
//           aria-label="Main content"
//           className={`
//             grow w-full bg-white dark:bg-gray-950
//             transition-[padding-top] duration-300 ease-out will-change-[padding-top]
//             lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
//             ${
//               isScrolled
//                 ? "pt-17.5 lg:pt-21.75"
//                 : "pt-22 lg:pt-36.25"
//             }
//           `}
//         >
//           {children}
//         </main>

//         {/* Footer Wrapper with solid white background to eliminate gray shade */}
//         <div className="bg-white dark:bg-gray-950 lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
//           <MainFooter settings={globalSettings} isMobile={safeIsMobile} />
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useState, useEffect, ReactNode, useCallback, useMemo, useRef } from "react";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/types";

// import type { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// // Layout components
// import NewSidebar from "./NewSidebar";
// import NewHeader from "./NewHeader";
// import NewRightDock from "./NewRightDock";
// import MainFooter from "./Footer";
// import MegaMenu from "./MegaMenu";
// import TopActionBar from "@/app/shared/components/ui/ActionBar";
// import SecondaryNavBar from "@/app/shared/components/ui/SecondaryNavBar";
// import BottomNav from "./BottomMobileNav";
// import MobileMenu from "./MobileMenu";
// import SearchPanel from "../ui/MobileSearchPanel";
// import MobileProfileSidebar from "./MobileProfileSidebar";
// import ScrollToTop from "../ui/ScrollToTop";

// // ✅ Import custom hook
// import { useSidebarExpand } from "@/app/shared/hooks/useSidebarExpand";

// // =========================================================================
// // TYPES
// // =========================================================================
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

// // =========================================================================
// // CONSTANTS
// // =========================================================================
// const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const SECONDARY_NAV_HEIGHT = 40;
// const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

// // =========================================================================
// // MAIN COMPONENT
// // =========================================================================
// export default function MainLayoutClient({
//   categories,
//   children,
//   searchSuggestions,
//   globalSettings,
// }: MainLayoutClientProps) {
//   const pathname = usePathname();

//   // Local UI states
//   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobile, setIsMobile] = useState<boolean | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
//   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   // ✅ Use custom hook for sidebar expand
//   const { isExpanded: sidebarExpanded, toggleExpand, sidebarWidthClass } = useSidebarExpand(false);

//   // ✅ Ref to measure sidebar actual width
//   const sidebarRef = useRef<HTMLDivElement>(null);

//   const isCheckoutPage = pathname?.startsWith("/checkout");

//   // =========================================================================
//   // SIDE EFFECTS
//   // =========================================================================

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 1. Scroll listener
//   useEffect(() => {
//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           const scrolled = window.scrollY > 50;
//           setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     setIsScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // 2. Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // 3. Close all overlays when route changes
//   useEffect(() => {
//     closeAllPanels();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   // =========================================================================
//   // HANDLERS
//   // =========================================================================

//   const closeAllPanels = useCallback(() => {
//     setIsMobileMenuOpen(false);
//     setIsSearchPanelOpen(false);
//     setIsProfileSidebarOpen(false);
//     if (typeof window !== "undefined") {
//       window.dispatchEvent(new Event("CLOSE_FILTER_SIDEBAR"));
//     }
//   }, []);

//   const handleToggleMenu = useCallback(() => {
//     if (isMobileMenuOpen) {
//       setIsMobileMenuOpen(false);
//     } else {
//       closeAllPanels();
//       setIsMobileMenuOpen(true);
//     }
//   }, [isMobileMenuOpen, closeAllPanels]);

//   const handleToggleSearch = useCallback(() => {
//     if (isSearchPanelOpen) {
//       setIsSearchPanelOpen(false);
//     } else {
//       closeAllPanels();
//       setIsSearchPanelOpen(true);
//     }
//   }, [isSearchPanelOpen, closeAllPanels]);

//   const handleToggleProfile = useCallback(() => {
//     if (isProfileSidebarOpen) {
//       setIsProfileSidebarOpen(false);
//     } else {
//       closeAllPanels();
//       setIsProfileSidebarOpen(true);
//     }
//   }, [isProfileSidebarOpen, closeAllPanels]);

//   const handleCategoryHover = useCallback((category: SanityCategory | null) => {
//     if (category) {
//       setHoveredCategory(category);
//     } else {
//       setTimeout(() => {
//         setHoveredCategory(null);
//       }, 200);
//     }
//   }, []);

//   // =========================================================================
//   // COMPUTED VALUES
//   // =========================================================================

//   const topOffsetDesktop = useMemo(() => {
//     return isScrolled
//       ? HEADER_HEIGHT_SCROLLED_DESKTOP
//       : TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
//   }, [isScrolled]);

//   const safeIsMobile = mounted ? isMobile : false;

//   // =========================================================================
//   // RENDER – CHECKOUT PAGE
//   // =========================================================================
//   if (isCheckoutPage) {
//     return (
//       <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
//     );
//   }

//   // =========================================================================
//   // RENDER – MAIN LAYOUT
//   // =========================================================================
//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden min-h-screen flex flex-col">
//       <ScrollToTop />

//       {/* Fixed Header Stack */}
//       <header
//         role="banner"
//         aria-label="Site header"
//         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
//         style={{
//           transform: isScrolled
//             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
//             : "translateY(0)",
//         }}
//       >
//         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

//         <NewHeader
//           categories={categories}
//           onMenuClick={handleToggleMenu}
//           searchSuggestions={searchSuggestions}
//         />

//         {/* Secondary nav */}
//         <div
//           className={`transition-all duration-300 ease-in-out overflow-hidden ${
//             isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
//           }`}
//         >
//           <SecondaryNavBar
//             isVisible={!isScrolled}
//             links={globalSettings?.secondaryNavLinks}
//             onCategoryClick={handleToggleMenu}
//           />
//         </div>
//       </header>

//       {/* ✅ Desktop Sidebars — FLEX CONTAINER (NO GAP) */}
//       <div
//         className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]"
//         style={{
//           top: `${topOffsetDesktop}px`,
//           height: `calc(100vh - ${topOffsetDesktop}px)`,
//         }}
//         onMouseLeave={() => handleCategoryHover(null)}
//       >
//         {/* ✅ Flex row with no gap */}
//         <div className="flex flex-row h-full relative">
          
//           {/* Sidebar */}
//           <div ref={sidebarRef}>
//             <NewSidebar
//               categories={categories}
//               onCategoryHover={handleCategoryHover}
//               isExpanded={sidebarExpanded}
//               onToggleExpand={toggleExpand}
//               sidebarWidthClass={sidebarWidthClass}
//             />
//           </div>

//           {/* ✅ Mega Menu — positioned relative to sidebar (no gap) */}
//           {hoveredCategory && (
//             <div className="h-full">
//               <MegaMenu
//                 category={hoveredCategory}
//                 sidebarWidthClass={sidebarWidthClass}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       <NewRightDock topOffset={topOffsetDesktop} />

//       {/* Mobile Drawers */}
//       <MobileMenu
//         categories={categories}
//         isOpen={isMobileMenuOpen}
//         onClose={() => setIsMobileMenuOpen(false)}
//       />
//       <MobileProfileSidebar
//         isOpen={isProfileSidebarOpen}
//         onClose={() => setIsProfileSidebarOpen(false)}
//       />
//       <SearchPanel
//         isOpen={isSearchPanelOpen}
//         onClose={() => setIsSearchPanelOpen(false)}
//         trendingKeywords={searchSuggestions.trendingKeywords}
//         popularCategories={searchSuggestions.popularCategories}
//       />

//       <BottomNav
//         onCategoriesClick={handleToggleMenu}
//         onSearchClick={handleToggleSearch}
//         onProfileClick={handleToggleProfile}
//       />

//       {/* Main Content */}
//       <div className="relative flex flex-col min-h-screen w-full">
//         <main
//           role="main"
//           aria-label="Main content"
//           className={`
//             grow w-full
//             transition-[padding-top] duration-300 ease-out will-change-[padding-top]
//             lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
//             ${
//               isScrolled
//                 ? "pt-[70px] lg:pt-[87px]"
//                 : "pt-[88px] lg:pt-[145px]"
//             }
//           `}
//         >
//           {children}
//         </main>

//         {/* Footer */}
//         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
//           <MainFooter settings={globalSettings} isMobile={safeIsMobile} />
//         </div>
//       </div>
//     </div>
//   );
// }
// // 📂 src/app/shared/components/layout/MainLayoutClient.tsx

// "use client";

// import { useState, useEffect, ReactNode, useCallback, useMemo, useRef } from "react";
// import { usePathname } from "next/navigation";
// import { SanityCategory } from "@/types";

// import type { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// // Layout components
// import NewSidebar from "./NewSidebar";
// import NewHeader from "./NewHeader";
// import NewRightDock from "./NewRightDock";
// import MainFooter from "./Footer";
// import MegaMenu from "./MegaMenu";
// import TopActionBar from "@/app/shared/components/ui/ActionBar";
// import SecondaryNavBar from "@/app/shared/components/ui/SecondaryNavBar";
// import BottomNav from "./BottomMobileNav";
// import MobileMenu from "./MobileMenu";
// import SearchPanel from "../ui/MobileSearchPanel";
// import MobileProfileSidebar from "./MobileProfileSidebar";
// import ScrollToTop from "../ui/ScrollToTop";

// // ✅ Import custom hook
// import { useSidebarExpand } from "@/app/shared/hooks/useSidebarExpand";

// // =========================================================================
// // TYPES
// // =========================================================================
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

// // =========================================================================
// // CONSTANTS
// // =========================================================================
// const TOP_ACTION_BAR_HEIGHT = 18;
// const HEADER_HEIGHT_DESKTOP = 87;
// const SECONDARY_NAV_HEIGHT = 40;
// const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

// // =========================================================================
// // MAIN COMPONENT
// // =========================================================================
// export default function MainLayoutClient({
//   categories,
//   children,
//   searchSuggestions,
//   globalSettings,
// }: MainLayoutClientProps) {
//   const pathname = usePathname();

//   // Local UI states
//   const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobile, setIsMobile] = useState<boolean | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
//   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   // ✅ Use custom hook for sidebar expand
//   const { isExpanded: sidebarExpanded, toggleExpand, sidebarWidthClass } = useSidebarExpand(false);

//   // ✅ Ref to measure sidebar actual width
//   const sidebarRef = useRef<HTMLDivElement>(null);

//   const isCheckoutPage = pathname?.startsWith("/checkout");

//   // =========================================================================
//   // SIDE EFFECTS
//   // =========================================================================

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 1. Scroll listener
//   useEffect(() => {
//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           const scrolled = window.scrollY > 50;
//           setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     setIsScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // 2. Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // 3. Close all overlays when route changes
//   useEffect(() => {
//     closeAllPanels();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   // =========================================================================
//   // HANDLERS
//   // =========================================================================

//   const closeAllPanels = useCallback(() => {
//     setIsMobileMenuOpen(false);
//     setIsSearchPanelOpen(false);
//     setIsProfileSidebarOpen(false);
//     if (typeof window !== "undefined") {
//       window.dispatchEvent(new Event("CLOSE_FILTER_SIDEBAR"));
//     }
//   }, []);

//   const handleToggleMenu = useCallback(() => {
//     if (isMobileMenuOpen) {
//       setIsMobileMenuOpen(false);
//     } else {
//       closeAllPanels();
//       setIsMobileMenuOpen(true);
//     }
//   }, [isMobileMenuOpen, closeAllPanels]);

//   const handleToggleSearch = useCallback(() => {
//     if (isSearchPanelOpen) {
//       setIsSearchPanelOpen(false);
//     } else {
//       closeAllPanels();
//       setIsSearchPanelOpen(true);
//     }
//   }, [isSearchPanelOpen, closeAllPanels]);

//   const handleToggleProfile = useCallback(() => {
//     if (isProfileSidebarOpen) {
//       setIsProfileSidebarOpen(false);
//     } else {
//       closeAllPanels();
//       setIsProfileSidebarOpen(true);
//     }
//   }, [isProfileSidebarOpen, closeAllPanels]);

//   const handleCategoryHover = useCallback((category: SanityCategory | null) => {
//     if (category) {
//       setHoveredCategory(category);
//     } else {
//       setTimeout(() => {
//         setHoveredCategory(null);
//       }, 200);
//     }
//   }, []);

//   // =========================================================================
//   // COMPUTED VALUES
//   // =========================================================================

//   const topOffsetDesktop = useMemo(() => {
//     return isScrolled
//       ? HEADER_HEIGHT_SCROLLED_DESKTOP
//       : TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
//   }, [isScrolled]);

//   const safeIsMobile = mounted ? isMobile : false;

//   // =========================================================================
//   // RENDER – CHECKOUT PAGE
//   // =========================================================================
//   if (isCheckoutPage) {
//     return (
//       <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
//     );
//   }

//   // =========================================================================
//   // RENDER – MAIN LAYOUT
//   // =========================================================================
//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col w-full">
//       <ScrollToTop />

//       {/* Fixed Header Stack */}
//       <header
//         role="banner"
//         aria-label="Site header"
//         className="fixed top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-out will-change-transform"
//         style={{
//           transform: isScrolled
//             ? `translateY(-${TOP_ACTION_BAR_HEIGHT}px)`
//             : "translateY(0)",
//         }}
//       >
//         <TopActionBar announcements={globalSettings?.topBarAnnouncements} />

//         <NewHeader
//           categories={categories}
//           onMenuClick={handleToggleMenu}
//           searchSuggestions={searchSuggestions}
//         />

//         {/* Secondary nav */}
//         <div
//           className={`transition-all duration-300 ease-in-out overflow-hidden ${
//             isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
//           }`}
//         >
//           <SecondaryNavBar
//             isVisible={!isScrolled}
//             links={globalSettings?.secondaryNavLinks}
//             onCategoryClick={handleToggleMenu}
//           />
//         </div>
//       </header>

//       {/* Desktop Sidebars */}
//       <div
//         className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]"
//         style={{
//           top: `${topOffsetDesktop}px`,
//           height: `calc(100vh - ${topOffsetDesktop}px)`,
//         }}
//         onMouseLeave={() => handleCategoryHover(null)}
//       >
//         <div className="flex flex-row h-full relative">
          
//           {/* Sidebar */}
//           <div ref={sidebarRef}>
//             <NewSidebar
//               categories={categories}
//               onCategoryHover={handleCategoryHover}
//               isExpanded={sidebarExpanded}
//               onToggleExpand={toggleExpand}
//               sidebarWidthClass={sidebarWidthClass}
//             />
//           </div>

//           {/* Mega Menu */}
//           {hoveredCategory && (
//             <div className="h-full">
//               <MegaMenu
//                 category={hoveredCategory}
//                 sidebarWidthClass={sidebarWidthClass}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       <NewRightDock topOffset={topOffsetDesktop} />

//       {/* Mobile Drawers */}
//       <MobileMenu
//         categories={categories}
//         isOpen={isMobileMenuOpen}
//         onClose={() => setIsMobileMenuOpen(false)}
//       />
//       <MobileProfileSidebar
//         isOpen={isProfileSidebarOpen}
//         onClose={() => setIsProfileSidebarOpen(false)}
//       />
//       <SearchPanel
//         isOpen={isSearchPanelOpen}
//         onClose={() => setIsSearchPanelOpen(false)}
//         trendingKeywords={searchSuggestions.trendingKeywords}
//         popularCategories={searchSuggestions.popularCategories}
//       />

//       <BottomNav
//         onCategoriesClick={handleToggleMenu}
//         onSearchClick={handleToggleSearch}
//         onProfileClick={handleToggleProfile}
//       />

//       {/* Main Content */}
//       {/* ✅ THE ULTIMATE FIX: Removed 'overflow-hidden' from this div to allow ALL sticky elements to work flawlessly! */}
//       <div className="relative flex flex-col min-h-screen w-full">
//         <main
//           role="main"
//           aria-label="Main content"
//           className={`
//             grow w-full
//             transition-[padding-top] duration-300 ease-out will-change-[padding-top]
//             lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
//             ${
//               isScrolled
//                 ? "pt-17.5 lg:pt-21.75"
//                 : "pt-22 lg:pt-36.25"
//             }
//           `}
//         >
//           {children}
//         </main>

//         {/* Footer */}
//         <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
//           <MainFooter settings={globalSettings} isMobile={safeIsMobile} />
//         </div>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/shared/components/layout/MainLayoutClient.tsx

"use client";

import { useState, useEffect, ReactNode, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { SanityCategory } from "@/types";

import type { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// Layout components
import NewSidebar from "./NewSidebar";
import NewHeader from "./NewHeader";
import NewRightDock from "./NewRightDock";
import MainFooter from "./Footer";
import MegaMenu from "./MegaMenu";
import TopActionBar from "@/app/shared/components/ui/ActionBar";
import SecondaryNavBar from "@/app/shared/components/ui/SecondaryNavBar";
import BottomNav from "./BottomMobileNav";
import MobileMenu from "./MobileMenu";
import SearchPanel from "../ui/MobileSearchPanel";
import MobileProfileSidebar from "./MobileProfileSidebar";
import ScrollToTop from "../ui/ScrollToTop";

// ✅ Import custom hook
import { useSidebarExpand } from "@/app/shared/hooks/useSidebarExpand";

// =========================================================================
// TYPES
// =========================================================================
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

// =========================================================================
// CONSTANTS (100% UNTOUCHED — Exactly as your original frame)
// =========================================================================
const TOP_ACTION_BAR_HEIGHT = 18;
const HEADER_HEIGHT_DESKTOP = 87;
const SECONDARY_NAV_HEIGHT = 40;
const HEADER_HEIGHT_SCROLLED_DESKTOP = 87;

// =========================================================================
// MAIN COMPONENT
// =========================================================================
export default function MainLayoutClient({
  categories,
  children,
  searchSuggestions,
  globalSettings,
}: MainLayoutClientProps) {
  const pathname = usePathname();

  // Local UI states
  const [hoveredCategory, setHoveredCategory] = useState<SanityCategory | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Use custom hook for sidebar expand
  const { isExpanded: sidebarExpanded, toggleExpand, sidebarWidthClass } = useSidebarExpand(false);

  // ✅ Ref to measure sidebar actual width
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isCheckoutPage = pathname?.startsWith("/checkout");

  // =========================================================================
  // SIDE EFFECTS
  // =========================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Scroll listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 50;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 3. Close all overlays when route changes
  useEffect(() => {
    closeAllPanels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const closeAllPanels = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchPanelOpen(false);
    setIsProfileSidebarOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("CLOSE_FILTER_SIDEBAR"));
    }
  }, []);

  const handleToggleMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    } else {
      closeAllPanels();
      setIsMobileMenuOpen(true);
    }
  }, [isMobileMenuOpen, closeAllPanels]);

  const handleToggleSearch = useCallback(() => {
    if (isSearchPanelOpen) {
      setIsSearchPanelOpen(false);
    } else {
      closeAllPanels();
      setIsSearchPanelOpen(true);
    }
  }, [isSearchPanelOpen, closeAllPanels]);

  const handleToggleProfile = useCallback(() => {
    if (isProfileSidebarOpen) {
      setIsProfileSidebarOpen(false);
    } else {
      closeAllPanels();
      setIsProfileSidebarOpen(true);
    }
  }, [isProfileSidebarOpen, closeAllPanels]);

  const handleCategoryHover = useCallback((category: SanityCategory | null) => {
    if (category) {
      setHoveredCategory(category);
    } else {
      setTimeout(() => {
        setHoveredCategory(null);
      }, 200);
    }
  }, []);

  // =========================================================================
  // COMPUTED VALUES (100% UNTOUCHED)
  // =========================================================================

  const topOffsetDesktop = useMemo(() => {
    return isScrolled
      ? HEADER_HEIGHT_SCROLLED_DESKTOP
      : TOP_ACTION_BAR_HEIGHT + HEADER_HEIGHT_DESKTOP + SECONDARY_NAV_HEIGHT;
  }, [isScrolled]);

  const safeIsMobile = mounted ? isMobile : false;

  // =========================================================================
  // RENDER – CHECKOUT PAGE
  // =========================================================================
  if (isCheckoutPage) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
    );
  }

  // =========================================================================
  // RENDER – MAIN LAYOUT
  // =========================================================================
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col w-full">
      <ScrollToTop />

      {/* Fixed Header Stack (100% Untouched) */}
      <header
        role="banner"
        aria-label="Site header"
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

        {/* Secondary nav */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          <SecondaryNavBar
            isVisible={!isScrolled}
            links={globalSettings?.secondaryNavLinks}
            onCategoryClick={handleToggleMenu}
          />
        </div>
      </header>

      {/* Desktop Sidebars (100% Untouched) */}
      <div
        className="hidden lg:flex fixed left-0 z-30 transition-[top,height] duration-300 ease-out will-change-[top,height]"
        style={{
          top: `${topOffsetDesktop}px`,
          height: `calc(100vh - ${topOffsetDesktop}px)`,
        }}
        onMouseLeave={() => handleCategoryHover(null)}
      >
        <div className="flex flex-row h-full relative">
          
          {/* Sidebar */}
          <div ref={sidebarRef}>
            <NewSidebar
              categories={categories}
              onCategoryHover={handleCategoryHover}
              isExpanded={sidebarExpanded}
              onToggleExpand={toggleExpand}
              sidebarWidthClass={sidebarWidthClass}
            />
          </div>

          {/* Mega Menu */}
          {hoveredCategory && (
            <div className="h-full">
              <MegaMenu
                category={hoveredCategory}
                sidebarWidthClass={sidebarWidthClass}
              />
            </div>
          )}
        </div>
      </div>

      <NewRightDock topOffset={topOffsetDesktop} />

      {/* Mobile Drawers */}
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

      {/* Main Content */}
      <div className="relative flex flex-col min-h-screen w-full">
        {/* ✅ SNUG FIT FIX: Locked padding-top to exact header heights (170px unscrolled / 112px scrolled) 
            This completely eliminates the extra gray strip (patti) below the Secondary Navigation Bar! */}
        <main
          role="main"
          aria-label="Main content"
          className={`
            grow w-full
            transition-[padding-top] duration-300 ease-out will-change-[padding-top]
            lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(70px+env(safe-area-inset-bottom))]
            ${
              isScrolled
                ? "pt-20 lg:pt-28"
                : "pt-27.5 lg:pt-42.5"
            }
          `}
        >
          {children}
        </main>

        {/* Footer */}
        <div className="lg:pl-16 lg:pr-16 md:pb-0 pb-[calc(60px+env(safe-area-inset-bottom))]">
          <MainFooter settings={globalSettings} isMobile={safeIsMobile} />
        </div>
      </div>
    </div>
  );
}