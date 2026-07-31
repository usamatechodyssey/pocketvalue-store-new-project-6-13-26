"use client";

import { useState, useTransition } from "react";
import { useStateContext } from "@/app/context/StateContext";
import { Loader2, Tag, X } from "lucide-react";

// === FIX #2: USING YOUR THEME STYLES ===
const inputStyles =
  "appearance-none block w-full flex-grow rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

export default function CouponInput() {
  const { applyCoupon, removeCoupon, appliedCoupon, discountAmount } =
    useStateContext();
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    startTransition(async () => {
      await applyCoupon(couponCode);
      setCouponCode("");
    });
  };

  if (appliedCoupon) {
    return (
      <div className="mt-6">
        <p className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Coupon Applied
        </p>
        <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-300">
          <div className="flex items-center gap-2">
            <Tag size={16} />
            <span className="font-bold">{appliedCoupon.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">
              - Rs. {discountAmount.toLocaleString()}
            </span>
            <button
              onClick={removeCoupon}
              className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50"
              aria-label="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <label
        htmlFor="coupon"
        className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
      >
        Have a Coupon?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="coupon"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter Coupon Code"
          disabled={isPending}
          className={inputStyles} // Using your themed styles
        />
        <button
          onClick={handleApplyCoupon}
          disabled={isPending || !couponCode}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
        </button>
      </div>
    </div>
  );
}
