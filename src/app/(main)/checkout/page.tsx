
// /src/app/(main))/checkout/page.tsx (VERIFIED - NO CHANGES NEEDED)

import type { Metadata } from "next";
import  CheckoutForm  from '@/app/features/storefront/cart-checkout/components/checkout/CheckoutForm';

// Metadata for the shipping page
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// This is the main Server Component for the '/checkout' route.
export default function ShippingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Shipping Information
      </h1>

      {/* It renders the CheckoutForm client component, which contains all the complex state and logic. */}
      <CheckoutForm />
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This file correctly serves as a simple Server Component wrapper for the complex, interactive `CheckoutForm` client component. This is the ideal structure.
