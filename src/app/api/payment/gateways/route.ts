// src/app/api/payment/gateways/route.ts

import { getEnabledGateways } from "@/app/features/storefront/cart-checkout/gateways/paymentAdapter";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// ✅ FIX: Sirf on-demand revalidation (admin update par clear)
const getCachedGateways = unstable_cache(
  async () => {
    return await getEnabledGateways();
  },
  ["payment-gateways"],
  {
    tags: ["payment-gateways"],
    revalidate: false, // ✅ Auto-expire nahi, sirf tag clear hone par refresh
  }
);

export async function GET() {
  try {
    const gateways = await getCachedGateways();
    return NextResponse.json(gateways);
  } catch (error: any) {
    console.error("Failed to fetch payment gateways:", error);
    return NextResponse.json(
      { message: "Could not load payment options." },
      { status: 500 }
    );
  }
}