// /src/app/cart/page.tsx

import type { Metadata } from "next";
import CartClient from "../../features/storefront/cart-checkout/components/cart/CartClient"; // Import the client component

// This is a Server Component, so metadata is allowed here.
export const metadata: Metadata = {
  title: "My Shopping Cart | PocketValue",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  // Render the Client Component which contains all the interactive logic.
  return <CartClient />;
}