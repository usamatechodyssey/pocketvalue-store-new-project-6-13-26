
"use client";

import { useState, useTransition, useEffect } from "react";
import { useStateContext } from "@/app/context/StateContext";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Loader2, Tag, X } from "lucide-react";
import { toast } from "react-hot-toast";

const inputStyles =
  "appearance-none block w-full rounded-lg border-0 py-3 px-4 text-gray-900 bg-gray-50 dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

interface OrderSummaryProps {
  isMobileView?: boolean;
  isDesktop?: boolean;
}

export default function OrderSummary({ isMobileView = false, isDesktop = false }: OrderSummaryProps) {
  const {
    cartItems,
    subtotal,
    shippingDetails,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
  } = useStateContext();

  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    startTransition(async () => {
      await applyCoupon(couponCode);
      setCouponCode("");
    });
  };

  if (!mounted || cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${isMobileView ? "px-2" : ""}`}>
      
      {!isMobileView && (
        <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-gray-100">
          Order Summary
        </h2>
      )}

      {/* Cart Items List */}
      <div className="space-y-4 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="flex items-start gap-4 pt-4 first:pt-0">
            <div className="relative w-16 h-16 shrink-0 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
              {item.image && (
                <Image
                  src={urlFor(item.image).width(128).height(128).url()}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
              {item.quantity > 1 && (
                  <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                      x{item.quantity}
                  </div>
              )}
            </div>
            <div className="grow">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                {item.name}
              </p>
              {item.variant && (
                 <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
              )}
            </div>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 shrink-0">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="pt-2">
        {appliedCoupon ? (
          <div>
            <p className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">Discount Applied</p>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Tag size={16} />
                <span className="font-bold text-sm">{appliedCoupon.code}</span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-green-600"
                aria-label="Remove coupon"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative grow">
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                disabled={isPending}
                className={inputStyles}
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={isPending || !couponCode}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {subtotal.toLocaleString()}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">
              - Rs. {discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Shipping</span>
          {shippingDetails ? (
            <span
              className={`font-medium ${
                // ✅ Logic Updated for Colors
                appliedCoupon?.type === 'freeShipping' || (shippingDetails.isFree && !shippingDetails.isOnCall)
                  ? "text-green-600 dark:text-green-400"
                  : shippingDetails.isOnCall
                      ? "text-brand-secondary"
                      : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {appliedCoupon?.type === "freeShipping"
                ? "FREE"
                : shippingDetails.displayText}
            </span>
          ) : (
            <span className="text-gray-400 italic text-xs">Calculated at next step</span>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
          <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
          <div className="flex items-baseline gap-1">
             <span className="text-xs text-gray-500">PKR</span>
             {shippingDetails ? (
                <span className="text-2xl font-bold text-brand-primary">
                    {grandTotal.toLocaleString()}
                </span>
             ) : (
                <span className="text-xl font-bold text-gray-400 animate-pulse">---</span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}