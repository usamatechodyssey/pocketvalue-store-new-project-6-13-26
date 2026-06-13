"use server";

import { getPayloadLiveProductDataForCards } from "@/sanity/lib/payload/product.queries";
import SanityProduct from "@/sanity/types/product_types";

export async function fetchWishlistProductsAction(
  productIds: string[],
): Promise<SanityProduct[]> {
  try {
    // 🛡️ Safety Check
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0)
      return [];

    // Payload se fresh data fetch karein
    const products = await getPayloadLiveProductDataForCards(productIds);

    // 🔥 logic fix: Sirf wo products bhejein jo active hain aur exist karte hain
    return products.filter((p) => p && p._id && p.defaultVariant);
  } catch (error) {
    console.error("Wishlist Action Error:", error);
    return [];
  }
}
