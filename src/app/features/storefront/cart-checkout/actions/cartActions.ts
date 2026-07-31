// /src/features/storefront/cart-checkout/actions/cartActions.ts

"use server";

import { auth } from "@/app/auth";
import { cookies } from "next/headers";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import AbandonedCart, { IAbandonedCart } from "@/models/AbandonedCart";
import { CleanCartItem } from "@/types";

// 🔥 Define a type for the lean cart object (eliminates TypeScript errors)
interface LeanAbandonedCart {
  _id: string;
  userId: string | null;
  sessionId: string;
  items: CleanCartItem[]; 
  subtotal: number;
  visitorId?: string;
  email?: string | null;
  phone?: string | null;
  contactCaptured?: boolean;
  isRecovered?: boolean;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function fetchServerCartAction(): Promise<{
  items: CleanCartItem[];
  subtotal: number;
} | null> {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return null; // Anonymous user, no server cart
  }

  // 2. Get current session ID from cookies (set by proxy.ts)
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("pv_session_id")?.value;
  if (!sessionId) return null;

  // 3. Connect to DB
  await connectMongoose();

  // 4. Search for cart using userId OR sessionId
  //    - userId: For cross-device recovery (user logged in on another device)
  //    - sessionId: For the current device session
  const cart = await AbandonedCart.findOne({
    $or: [{ userId: session.user.id }, { sessionId: sessionId }],
  }).lean<LeanAbandonedCart>();

  if (!cart) return null;

  // 5. Cross-Device Sync: If cart found by userId but current sessionId is different,
  //    update the cart's sessionId to the current device's sessionId.
  //    This ensures that the cart is tied to the new device for future syncs.
  if (cart.userId && cart.sessionId !== sessionId) {
    // Fire-and-forget update to avoid blocking the response
    AbandonedCart.findOneAndUpdate(
      { _id: cart._id },
      { $set: { sessionId: sessionId } }
    ).catch((err) =>
      console.error("Failed to update sessionId for cart:", err)
    );
  }

  // 6. Return the cart data
  return {
    items: cart.items,
    subtotal: cart.subtotal,
  };
}