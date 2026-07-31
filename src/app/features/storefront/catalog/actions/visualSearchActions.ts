// src/app/actions/visualSearchActions.ts
"use server"; // 🔥 Ye line build error ko rokti hai

import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
import SanityProduct from "@/types";

/**
 * Server Action: Fetches full product data from Payload DB based on slugs.
 * Runs only on the server, keeping browser bundles clean of DB/Node.js logic.
 */
export async function fetchVisualSearchResults(slugs: string[]): Promise<{
  success: boolean;
  products: SanityProduct[];
  error?: string;
}> {
  try {
    if (!slugs || slugs.length === 0) return { success: true, products: [] };

    // 🔥 Direct Database call (Server-side only)
    const products = await getPayloadProductsBySlugs(slugs);

    // Serializable results return karein
    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)), // Ensure clean serialization
    };
  } catch (error) {
    console.error("Visual Search Action Error:", error);
    return {
      success: false,
      products: [],
      error: "Failed to fetch product details from server.",
    };
  }
}
