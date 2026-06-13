// /src/app/wishlist/page.tsx
import type { Metadata } from "next";
import WishlistClientPage from "./_components/WishlistClientPage";

// 🔥 SEO: Wishlist pages should NOT be indexed by Google
export const metadata: Metadata = {
  title: "My Wishlist | PocketValue",
  description: "View and manage your saved items.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistClientPage />;
}
