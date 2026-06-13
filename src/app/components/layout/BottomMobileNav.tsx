// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Home, Grid, Search, User, Tag } from "lucide-react";

// interface BottomNavProps {
//   onCategoriesClick: () => void;
//   onSearchClick: () => void;
// }

// export default function BottomNav({ onCategoriesClick, onSearchClick }: BottomNavProps) {
//   const pathname = usePathname();

//   // Helper to check if link is active
//   const isActive = (path: string) => pathname === path;

//   return (
//     // 🔥 SAFE AREA FIX: pb-[env(safe-area-inset-bottom)] added
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      
//       {/* Container height adjusted specifically for touch targets */}
//       <div className="grid grid-cols-5 h-[60px] items-end pb-1">
        
//         {/* 1. HOME */}
//         <Link
//           href="/"
//           className={`group flex flex-col items-center justify-center h-full w-full pb-1 transition-all duration-200 active:scale-95
//             ${isActive("/") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Home size={24} strokeWidth={isActive("/") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/") ? "font-bold" : ""}`}>Home</span>
//         </Link>

//         {/* 2. CATALOG (Drawer) */}
//         <button
//           onClick={onCategoriesClick}
//           className="group flex flex-col items-center justify-center h-full w-full pb-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 active:scale-95"
//         >
//           <Grid size={24} strokeWidth={2} className="mb-1" />
//           <span className="text-[10px] font-medium">Catalog</span>
//         </button>

//         {/* 3. SEARCH (Floating Center - App Style) */}
//         <div className="relative flex justify-center h-full w-full">
//             <button
//             onClick={onSearchClick}
//             className="absolute -top-6 flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 group z-10"
//             >
//             <div className="p-3.5 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 border-4 border-white dark:border-gray-900 group-hover:scale-105 transition-transform">
//                 <Search size={26} strokeWidth={2.5} />
//             </div>
//             {/* Text hide kar diya clean look ke liye, ya chota rakhein */}
//             <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-14">Search</span>
//             </button>
//         </div>

//         {/* 4. DEALS */}
//         <Link
//           href="/deals"
//           className={`group flex flex-col items-center justify-center h-full w-full pb-1 transition-all duration-200 active:scale-95
//             ${isActive("/deals") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Tag size={24} strokeWidth={isActive("/deals") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/deals") ? "font-bold" : ""}`}>Offers</span>
//         </Link>

//         {/* 5. ACCOUNT */}
//         <Link
//           href="/account"
//           className={`group flex flex-col items-center justify-center h-full w-full pb-1 transition-all duration-200 active:scale-95
//             ${isActive("/account") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <User size={24} strokeWidth={isActive("/account") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/account") ? "font-bold" : ""}`}>Profile</span>
//         </Link>

//       </div>
//     </div>
//   );
// }
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Home, Grid, Search, User, Tag } from "lucide-react";

// interface BottomNavProps {
//   onCategoriesClick: () => void;
//   onSearchClick: () => void;
// }

// export default function BottomNav({ onCategoriesClick, onSearchClick }: BottomNavProps) {
//   const pathname = usePathname();

//   // Helper to check if link is active
//   const isActive = (path: string) => pathname === path;

//   return (
//     // 🔥 SAFE AREA FIX: pb-[env(safe-area-inset-bottom)]
//     // Z-Index 50 rakha hai taake ye content ke upar rahe.
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      
//       {/* 
//          🔥 HEIGHT SYNC FIX: 
//          Humne MobileMenu.tsx mein "65px" minus kiya tha.
//          Isliye yahan bhi height exact "65px" rakhi hai taake Sidebar
//          aur BottomNav ke beech 1 pixel ka bhi gap na rahe.
//       */}
//       <div className="grid grid-cols-5 h-[65px] items-end pb-2">
        
//         {/* 1. HOME */}
//         <Link
//           href="/"
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Home size={24} strokeWidth={isActive("/") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/") ? "font-bold" : ""}`}>Home</span>
//         </Link>

//         {/* 2. CATALOG (Drawer) */}
//         <button
//           onClick={onCategoriesClick}
//           className="group flex flex-col items-center justify-center h-full w-full text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 active:scale-95"
//         >
//           <Grid size={24} strokeWidth={2} className="mb-1" />
//           <span className="text-[10px] font-medium">Catalog</span>
//         </button>

//         {/* 3. SEARCH (Floating Center - App Style) */}
//         <div className="relative flex justify-center h-full w-full">
//             <button
//             onClick={onSearchClick}
//             className="absolute -top-6 flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 group z-10"
//             >
//             <div className="p-3.5 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 border-4 border-white dark:border-gray-900 group-hover:scale-105 transition-transform">
//                 <Search size={26} strokeWidth={2.5} />
//             </div>
//             {/* Text chupa diya clean look ke liye */}
//             </button>
//         </div>

//         {/* 4. DEALS */}
//         <Link
//           href="/deals"
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/deals") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Tag size={24} strokeWidth={isActive("/deals") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/deals") ? "font-bold" : ""}`}>Offers</span>
//         </Link>

//         {/* 5. ACCOUNT */}
//         <Link
//           href="/account"
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/account") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <User size={24} strokeWidth={isActive("/account") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/account") ? "font-bold" : ""}`}>Profile</span>
//         </Link>

//       </div>
//     </div>
//   );
// }
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Home, Grid, Search, User, Tag } from "lucide-react";
// // 🔥 Import Context
// import { useStateContext } from "@/app/context/StateContext";

// interface BottomNavProps {
//   onCategoriesClick: () => void;
//   onSearchClick: () => void;
// }

// export default function BottomNav({ onCategoriesClick, onSearchClick }: BottomNavProps) {
//   const pathname = usePathname();
  
//   // 🔥 Context se toggle function nikala
//   const { toggleProfileSidebar } = useStateContext();

//   // Helper to check if link is active
//   const isActive = (path: string) => pathname === path;

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
      
//       <div className="grid grid-cols-5 h-[65px] items-end pb-2">
        
//         {/* 1. HOME */}
//         <Link
//           href="/"
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Home size={24} strokeWidth={isActive("/") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/") ? "font-bold" : ""}`}>Home</span>
//         </Link>

//         {/* 2. CATALOG (Drawer Trigger) */}
//         <button
//           onClick={onCategoriesClick}
//           className="group flex flex-col items-center justify-center h-full w-full text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 active:scale-95"
//         >
//           <Grid size={24} strokeWidth={2} className="mb-1" />
//           <span className="text-[10px] font-medium">Catalog</span>
//         </button>

//         {/* 3. SEARCH (Floating Center) */}
//         <div className="relative flex justify-center h-full w-full">
//             <button
//             onClick={onSearchClick}
//             className="absolute -top-6 flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 group z-10"
//             >
//             <div className="p-3.5 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 border-4 border-white dark:border-gray-900 group-hover:scale-105 transition-transform">
//                 <Search size={26} strokeWidth={2.5} />
//             </div>
//             </button>
//         </div>

//         {/* 4. DEALS */}
//         <Link
//           href="/deals"
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/deals") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <Tag size={24} strokeWidth={isActive("/deals") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/deals") ? "font-bold" : ""}`}>Offers</span>
//         </Link>

//         {/* 5. ACCOUNT (🔥 UPDATED: Now opens Sidebar instead of Page) */}
//         <button
//           onClick={toggleProfileSidebar}
//           className={`group flex flex-col items-center justify-center h-full w-full transition-all duration-200 active:scale-95
//             ${isActive("/account") ? "text-brand-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"}`}
//         >
//           <User size={24} strokeWidth={isActive("/account") ? 2.5 : 2} className="mb-1" />
//           <span className={`text-[10px] font-medium ${isActive("/account") ? "font-bold" : ""}`}>Profile</span>
//         </button>

//       </div>
//     </div>
//   );
// }
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Home, Grid, Search, User, Tag } from "lucide-react";

// interface BottomNavProps {
//   onCategoriesClick: () => void;
//   onSearchClick: () => void;
//   onProfileClick: () => void; // 🔥 New Prop
// }

// export default function BottomNav({ onCategoriesClick, onSearchClick, onProfileClick }: BottomNavProps) {
//   const pathname = usePathname();
//   const isActive = (path: string) => pathname === path;

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      
//       <div className="grid grid-cols-5 h-[60px] items-end">
        
//         {/* 1. HOME */}
//         <Link href="/" className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400"}`}>
//           <Home size={22} strokeWidth={isActive("/") ? 2.5 : 2} />
//           <span className="text-[9px] font-medium mt-1">Home</span>
//         </Link>

//         {/* 2. CATALOG */}
//         <button onClick={onCategoriesClick} className="flex flex-col items-center justify-center h-full pb-2 text-gray-500 dark:text-gray-400 transition-all duration-200 active:scale-90">
//           <Grid size={22} strokeWidth={2} />
//           <span className="text-[9px] font-medium mt-1">Catalog</span>
//         </button>

//         {/* 3. SEARCH */}
//         <div className="relative flex justify-center h-full">
//             <button onClick={onSearchClick} className="absolute -top-5 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 group">
//             <div className="p-3.5 bg-brand-primary text-white rounded-full shadow-lg border-4 border-gray-50 dark:border-gray-900">
//                 <Search size={24} strokeWidth={3} />
//             </div>
//             <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 mt-1">Search</span>
//             </button>
//         </div>

//         {/* 4. OFFERS */}
//         <Link href="/deals" className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/deals") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400"}`}>
//           <Tag size={22} strokeWidth={isActive("/deals") ? 2.5 : 2} />
//           <span className="text-[9px] font-medium mt-1">Offers</span>
//         </Link>

//         {/* 5. PROFILE (Trigger Sidebar instead of Link) */}
//         <button 
//             onClick={onProfileClick} // 🔥 Call the handler
//             className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/account") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400"}`}
//         >
//           <User size={22} strokeWidth={isActive("/account") ? 2.5 : 2} />
//           <span className="text-[9px] font-medium mt-1">Profile</span>
//         </button>

//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, User, Tag } from "lucide-react";

interface BottomNavProps {
  onCategoriesClick: () => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export default function BottomNav({ onCategoriesClick, onSearchClick, onProfileClick }: BottomNavProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      
      <div className="grid grid-cols-5 h-15 items-end">
        
        {/* 1. HOME */}
        <Link 
          href="/" 
          aria-label="Go to Homepage" // 🔥 Added for Accessibility
          className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          <Home size={22} strokeWidth={isActive("/") ? 2.5 : 2} />
          <span className="text-[9px] font-medium mt-1">Home</span>
        </Link>

        {/* 2. CATALOG */}
        <button 
          onClick={onCategoriesClick} 
          aria-label="Open Categories Menu" // 🔥 Added for Accessibility
          className="flex flex-col items-center justify-center h-full pb-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 active:scale-90"
        >
          <Grid size={22} strokeWidth={2} />
          <span className="text-[9px] font-medium mt-1">Catalog</span>
        </button>

        {/* 3. SEARCH (Floating Center) */}
        <div className="relative flex justify-center h-full">
            <button 
              onClick={onSearchClick} 
              aria-label="Open Search" // 🔥 Added for Accessibility
              className="absolute -top-5 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 group"
            >
              <div className="p-3.5 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/30 border-4 border-gray-50 dark:border-gray-900 group-hover:scale-105 transition-transform">
                  <Search size={24} strokeWidth={3} />
              </div>
              <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 mt-1 group-hover:text-brand-primary transition-colors">Search</span>
            </button>
        </div>

        {/* 4. OFFERS */}
        <Link 
          href="/deals" 
          aria-label="View Deals and Offers" // 🔥 Added for Accessibility
          className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/deals") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          <Tag size={22} strokeWidth={isActive("/deals") ? 2.5 : 2} />
          <span className="text-[9px] font-medium mt-1">Offers</span>
        </Link>

        {/* 5. PROFILE */}
        <button 
            onClick={onProfileClick}
            aria-label="Open Profile Menu" // 🔥 Added for Accessibility
            className={`flex flex-col items-center justify-center h-full pb-2 transition-all duration-200 active:scale-90 ${isActive("/account") ? "text-brand-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          <User size={22} strokeWidth={isActive("/account") ? 2.5 : 2} />
          <span className="text-[9px] font-medium mt-1">Profile</span>
        </button>

      </div>
    </nav>
  );
}