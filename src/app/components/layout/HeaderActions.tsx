"use client";

import Link from "next/link";
import { User, Heart, ShoppingCart } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Badge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-in zoom-in duration-300">
      {count > 9 ? "9+" : count}
    </span>
  );
};

export default function HeaderActions({ isMobile = false }) {
  const { totalQuantities, wishlistItems } = useStateContext();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // FIX: Force render only after mount to sync server/client HTML
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe Values (Server doesn't know about them, so we keep them empty initially)
  const cartCount = mounted ? totalQuantities : 0;
  const wishCount = mounted ? wishlistItems.length : 0;
  const userName =
    mounted && session?.user?.name
      ? session.user.name.split(" ")[0]
      : "Account";
  const isAuthenticated = mounted && status === "authenticated";

  // === MOBILE VIEW ===
  if (isMobile) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/wishlist"
          aria-label="View Wishlist"
          className="relative p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-95"
        >
          <Heart size={22} strokeWidth={2} />
          {mounted && <Badge count={wishCount} />}
        </Link>
        <Link
          href="/cart"
          aria-label="View Shopping Cart"
          className="relative p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-95"
        >
          <ShoppingCart size={22} strokeWidth={2} />
          {mounted && <Badge count={cartCount} />}
        </Link>
      </div>
    );
  }

  // === DESKTOP VIEW ===
  return (
    <div className="flex items-center gap-4 lg:gap-6">
      {/* 🔴 HYDRATION FIX: Use 'mounted' check for conditional Link */}
      {mounted ? (
        <Link
          href={isAuthenticated ? "/account" : "/login"}
          className="group flex items-center gap-2 lg:gap-3 hover:opacity-90 transition-opacity"
          aria-label={isAuthenticated ? "My Account" : "Login"}
        >
          <div className="p-2 lg:p-2.5 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors border border-gray-100 dark:border-gray-700">
            <User size={20} strokeWidth={2.5} />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide leading-tight">
              {isAuthenticated ? "Welcome" : "Sign In"}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate max-w-25 min-h-5">
              {isAuthenticated ? userName : "Account"}
            </span>
          </div>
        </Link>
      ) : (
        // SERVER SKELETON (Prevents Mismatch)
        <div className="flex items-center gap-3 opacity-50">
          <div className="p-2.5 bg-gray-100 rounded-full">
            <User size={20} />
          </div>
          <div className="hidden md:flex flex-col gap-1">
            <div className="h-3 w-10 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden lg:block" />

      <Link
        href="/wishlist"
        aria-label="View Wishlist"
        className="group relative p-2 lg:p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        <Heart
          size={24}
          className="text-gray-600 dark:text-gray-300 group-hover:text-brand-primary transition-colors"
          strokeWidth={2}
        />
        {mounted && <Badge count={wishCount} />}
      </Link>

      <Link
        href="/cart"
        aria-label="View Shopping Cart"
        className="group relative p-2 lg:p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        <ShoppingCart
          size={24}
          className="text-gray-600 dark:text-gray-300 group-hover:text-brand-primary transition-colors"
          strokeWidth={2}
        />
        {mounted && <Badge count={cartCount} />}
      </Link>
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { User, Heart, ShoppingCart } from "lucide-react";
// import { useStateContext } from "@/app/context/StateContext";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const Badge = ({ count }: { count: number }) => (
//   <AnimatePresence>
//     {count > 0 && (
//       <motion.span
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0, opacity: 0 }}
//         className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-primary text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900 shadow-sm"
//       >
//         {count > 9 ? "9+" : count}
//       </motion.span>
//     )}
//   </AnimatePresence>
// );

// export default function HeaderActions({ isMobile = false }) {
//   const { totalQuantities, wishlistItems } = useStateContext();
//   const { data: session, status } = useSession();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   const cartCount = mounted ? totalQuantities : 0;
//   const wishCount = mounted ? wishlistItems.length : 0;
//   const isAuthenticated = status === "authenticated";
//   const userName = session?.user?.name
//     ? session.user.name.split(" ")[0]
//     : "Account";

//   const iconBaseClass =
//     "relative p-2.5 rounded-2xl transition-all duration-300 active:scale-90 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200";

//   if (isMobile) {
//     return (
//       <div className="flex items-center gap-1">
//         <Link href="/wishlist" className={iconBaseClass} aria-label="Wishlist">
//           <Heart size={22} strokeWidth={2} />
//           <Badge count={wishCount} />
//         </Link>
//         <Link href="/cart" className={iconBaseClass} aria-label="Cart">
//           <ShoppingCart size={22} strokeWidth={2} />
//           <Badge count={cartCount} />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center gap-3 xl:gap-5">
//       {/* 👤 ACCOUNT ACTION */}
//       <Link
//         href={isAuthenticated ? "/account" : "/login"}
//         className="group flex items-center gap-3 pl-2 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-[1.25rem] border border-transparent hover:border-brand-primary/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
//       >
//         <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-gray-500 group-hover:text-brand-primary group-hover:scale-110 transition-all">
//           <User size={18} strokeWidth={2.5} />
//         </div>
//         <div className="flex flex-col text-left">
//           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
//             {isAuthenticated ? "Authorized" : "Guest"}
//           </span>
//           <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
//             {mounted ? userName : "..."}
//           </span>
//         </div>
//       </Link>

//       <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden lg:block" />

//       {/* ❤️ WISHLIST */}
//       <Link href="/wishlist" className={iconBaseClass} aria-label="Wishlist">
//         <Heart
//           size={24}
//           strokeWidth={2}
//           className="group-hover:text-brand-primary"
//         />
//         <Badge count={wishCount} />
//       </Link>

//       {/* 🛒 CART */}
//       <Link href="/cart" className={iconBaseClass} aria-label="Cart">
//         <ShoppingCart
//           size={24}
//           strokeWidth={2}
//           className="group-hover:text-brand-primary"
//         />
//         <Badge count={cartCount} />
//       </Link>
//     </div>
//   );
// }
