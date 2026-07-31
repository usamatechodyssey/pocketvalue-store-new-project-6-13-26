// /src/app/checkout/payment/_components/ShippingSummary.tsx

"use client";

import Link from "next/link";
import { Edit3 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";

export default function ShippingSummary() {
  const { shippingAddress } = useStateContext();

  if (!shippingAddress) {
    return null; // Agar address na ho to kuch bhi render na karein
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Ship to
        </h2>
        <Link
          href="/checkout"
          className="text-sm text-brand-primary hover:underline flex items-center gap-1.5 font-medium"
        >
          <Edit3 size={14} /> Change
        </Link>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
        <p>
          <span className="font-medium text-gray-500">Contact:</span>{" "}
          {shippingAddress.email}, {shippingAddress.phone}
        </p>
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        <address className="text-gray-600 dark:text-gray-300 not-italic">
          <span className="font-medium text-gray-500">Address:</span>{" "}
          {shippingAddress.address}, {shippingAddress.area},{" "}
          {shippingAddress.city}
        </address>
      </div>
    </section>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Componentization (Rule #5):** Hum ne `payment/page.tsx` ke ek hissay ko alag karke ek naya, single-responsibility component (`ShippingSummary`) banaya hai.
// - **Decoupling:** Yeh component apna data direct `useStateContext` se leta hai, jis se yeh `payment/page.tsx` par bojh nahi banta.
