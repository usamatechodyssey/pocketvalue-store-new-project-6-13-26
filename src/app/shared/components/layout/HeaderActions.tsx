"use client";

import Link from "next/link";
import { User, Heart, ShoppingCart } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// ✅ FIX: Improved Badge component with accessibility attributes
const Badge = ({ count, type }: { count: number; type: "cart" | "wishlist" }) => {
  if (count <= 0) return null;

  const label = type === "cart" ? `${count} items in cart` : `${count} items in wishlist`;

  return (
    <span
      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-in zoom-in duration-300"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
};

export default function HeaderActions({ isMobile = false }) {
  const { totalQuantities, wishlistItems } = useStateContext();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {mounted && <Badge count={wishCount} type="wishlist" />}
        </Link>
        <Link
          href="/cart"
          aria-label="View Shopping Cart"
          className="relative p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-95"
        >
          <ShoppingCart size={22} strokeWidth={2} />
          {mounted && <Badge count={cartCount} type="cart" />}
        </Link>
      </div>
    );
  }

  // === DESKTOP VIEW ===
  return (
    <div className="flex items-center gap-4 lg:gap-6">
      {/* Account Link */}
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
        // ✅ FIX: Added aria-hidden to skeleton
        <div className="flex items-center gap-3 opacity-50" aria-hidden="true">
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
        {mounted && <Badge count={wishCount} type="wishlist" />}
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
        {mounted && <Badge count={cartCount} type="cart" />}
      </Link>
    </div>
  );
}