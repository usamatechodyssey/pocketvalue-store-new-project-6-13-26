
"use server";

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { ShippingRule } from "@/types";
import { unstable_cache } from "next/cache"; // ✅ Import cache

// ✅ Cached version of the fetch function
const getCachedShippingRules = unstable_cache(
  async () => {
    const payload = await getSafePayload();
    const settings = await payload.findGlobal({ slug: "settings" });

    if (!settings || !settings.shippingRules || settings.shippingRules.length === 0) {
      return [];
    }

    return settings.shippingRules.map((rule: any) => ({
      _id: rule.id || Math.random().toString(),
      name: rule.name,
      minAmount: rule.minAmount,
      cost: rule.cost,
      isOnCall: rule.isOnCall || false,
    })).sort((a: ShippingRule, b: ShippingRule) => b.minAmount - a.minAmount);
  },
  ["shipping-rules"], // Cache key
  { revalidate: 3600, tags: ["shipping"] } // 1 hour cache
);

export async function getShippingRulesAction(): Promise<ShippingRule[]> {
  try {
    return await getCachedShippingRules();
  } catch (error) {
    console.error("Error in getShippingRulesAction:", error);
    return [];
  }
}