"use client";

import { useStateContext } from "@/app/context/StateContext";
import EmptyCart from "./EmptyCart";
import CartItem from "./CartItem";
import CartSummary from '@/app/features/storefront/cart-checkout/components/cart/CartSummary';
import CartSummarySheet from "./CartSummarySheet";
import { ChevronsUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function CartClient() {
  // 1. isCartLoaded ko context se nikalain
  const { cartItems, totalQuantities, isCartLoaded } = useStateContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 2. Client par mount hone ka wait karein
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Jab tak mounted na ho ya cart load na ho jaye, kuch bhi render na karein (ya skeleton dikhayein)
  if (!mounted || !isCartLoaded) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // 4. Ab agar items zero hain to EmptyCart dikhayein
  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Title (Desktop/Tablet) */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-clash font-bold text-gray-900 dark:text-white">
            My Shopping Cart
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have{" "}
            <span className="font-bold text-brand-primary">
              {totalQuantities} {totalQuantities > 1 ? "items" : "item"}
            </span>{" "}
            in your cart.
          </p>
        </div>

        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cart Items List (The Scrollable Area) */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full">
            {/* 🔥 FIXED: HEIGHT CONTROL ON DESKTOP TOO */}
            <div
              // Mobile: max-h-[600px]
              // Desktop (lg+): max-h-[800px] (Thoda bada)
              className="divide-y divide-gray-200 dark:divide-gray-700 max-h-150 lg:max-h-200 overflow-y-auto custom-scrollbar"
            >
              {cartItems.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>

            {/* Scroll indicator for mobile (Simplified to show on all overflow) */}
            {cartItems.length > 5 && (
              <div className="text-center text-xs text-gray-500 py-2 border-t border-gray-100 dark:border-gray-700">
                Scroll down for more items.
              </div>
            )}
          </div>

          {/* Right Column: Summary (Desktop/Tablet) */}
          <div className="hidden md:block lg:col-span-4 w-full">
            <CartSummary />
          </div>
        </div>
      </div>

      {/* 2. MOBILE FLOATING ACTION BAR (The Trigger) */}
      <div className="md:hidden fixed bottom-14.5 left-0 right-0 p-4">
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-full flex items-center justify-between px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-gray-700 active:scale-[0.98] transition-all duration-200"
        >
          <span className="flex items-center gap-2 text-lg font-clash">
            <ChevronsUp size={20} className="animate-bounce" />
            View Summary ({totalQuantities})
          </span>
          <span className="text-xl font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
            Rs. {cartSubtotal.toLocaleString()}
          </span>
        </button>
      </div>

      {/* 3. MOBILE SUMMARY SHEET */}
      <CartSummarySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </main>
  );
}
