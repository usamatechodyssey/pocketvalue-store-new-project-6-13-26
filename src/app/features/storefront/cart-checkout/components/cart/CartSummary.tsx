
"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import CouponInput from "./CouponInput";

export default function CartSummary() {
  const {
    subtotal,
    totalQuantities,
    shippingDetails,
    grandTotal,
    discountAmount,
    appliedCoupon,
  } = useStateContext();

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal ({totalQuantities} items)</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-500">
              <span>Discount</span>
              <span className="font-medium">
                - Rs. {discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Shipping</span>
            {shippingDetails ? (
              <span
                className={`font-medium ${
                  // ✅ Logic Updated: 
                  // 1. Agar Coupon Free Shipping hai -> GREEN
                  // 2. Agar Shipping Rule "On Call" hai -> ORANGE
                  // 3. Agar Cost 0 hai (aur on call nahi) -> GREEN
                  appliedCoupon?.type === 'freeShipping' || (shippingDetails.isFree && !shippingDetails.isOnCall)
                    ? "text-green-600 dark:text-green-500"
                    : shippingDetails.isOnCall 
                        ? "text-brand-secondary" 
                        : ""
                }`}
              >
                {appliedCoupon?.type === 'freeShipping'
                  ? 'FREE'
                  : shippingDetails.displayText}
              </span>
            ) : (
              <Loader2 size={16} className="animate-spin" />
            )}
          </div>
        </div>

        <CouponInput />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 flex justify-between font-bold text-lg">
          <span>Grand Total</span>
          {shippingDetails ? (
            <span className={shippingDetails.isOnCall ? "text-brand-primary" : ""}>
               {/* Agar On Call hai, to Grand Total mein shipping add nahi hogi, lekin hum wahan bhi indicator de sakte hain */}
               Rs. {grandTotal.toLocaleString()}
            </span>
          ) : (
            <Loader2 size={18} className="animate-spin" />
          )}
        </div>

        <div className="mt-8">
          <Link href="/checkout" className="block w-full">
            <button className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
    </div>
  );
}