// src/app/actions/searchActions.ts
"use server"; // 🔥 Ye line Next.js ko batati hai ke ye sirf server par chalega

import { getPayloadProducts } from "@/sanity/lib/payload/plp";

// Ye function ab SearchBar use karega
export async function getSearchResults(searchTerm: string) {
  try {
    const results = await getPayloadProducts({
      searchTerm: searchTerm,
      page: 1,
      // Baqi options jo aapko chahiye
    });

    return { success: true, products: results.products };
  } catch (error) {
    console.error("Search Action Error:", error);
    return { success: false, products: [] };
  }
}
