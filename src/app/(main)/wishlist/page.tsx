import type { Metadata } from "next";
import WishlistClientPage from "../../features/storefront/customer-account/components/WishlistClientPage";

// ✅ Centralized Settings Cache
import { getCachedSettings } from "@/app/shared/lib/cache/settings";

export const metadata: Metadata = {
  title: "My Wishlist | PocketValue",
  description: "View and manage your saved items.",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  // ✅ Using centralized cached settings (Redis already handles caching)
  const settings = await getCachedSettings();
  const lowStockThreshold = settings.inventorySettings?.lowStockThreshold || 5;

  return <WishlistClientPage lowStockThreshold={lowStockThreshold} />;
}