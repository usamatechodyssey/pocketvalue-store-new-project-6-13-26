Yeh waqai boht hi practical aur real-world masla hai! Public-facing forms (jaise reviews, contact forms, aur restock requests) par log ya bots aksar keyboard smash kar ke (jaise `asdfghjkl` ya `aaaaaaa`) fake requirements bhej dete hain, jis se database kachra (garbage) ho jata hai aur real customer requests dhoondna mushkil ho jata hai.

Is kachray (spam/gibberish) ko detect aur block karne ke liye **teen (3) levels par security** lagayi jati hai:

---

### Level 1: Bot Prevention (Cloudflare Turnstile ya reCAPTCHA v3)
* **Yeh kya hai?** Bots aur automated scripts ko block karna.
* **Kaise kaam karta hai?** Agar koi script/bot lagatar har 2 seconds baad form submit kar rahi hai, toh Turnstile/reCAPTCHA use block kar dega. Yeh lagana boht asaan hai aur is se **95% automated spam** khatam ho jata hai.

### Level 2: Zod-Level Keyboard Smashing & Gibberish Filter (Lightweight & Free)
Hum hamare global Zod validators ke andar string checking ke do (2) strict custom rules add kar sakte hain:
1. **Repeating Character Check:** 
   Agar kisi word mein ek hi character lagatar 4-5 baar repeat ho raha ho (jaise `shirrrrt`, `aaaaaaa`, `111111`), toh Zod use foran block kar dega.
2. **Missing Vowel Check (Gibberish Detection):** 
   English ya Roman Urdu ke takreeban har word mein vowels (`a, e, i, o, u`, ya Urdu phonics ke mutabiq) hote hain. Agar koi user `qwrtpsdfgh` jaisa word likhta hai (jis mein koi vowel nahi hai), toh algorithm use keyboard smashing detect kar ke reject kar dega.

### Level 3: AI-Based Content Moderation (Enterprise Standard)
* **Kaise kaam karta hai?** Jab koi user custom details submit karega (e.g., "Mujhe special size chahiye..."), toh backend par ek chota sa free filter check chalega (jaise **OpenAI's Free Moderation API** ya koi lightweight open-source text classifier).
* **Fayda:** Yeh AI detect karega ke likha hua text koi real human message hai ya fuzool kachra (spam). Agar fuzool kachra ho, toh backend use database mein insert hi nahi karega, ya phir uska status automatic `'ignored'` mark kar dega taake aap ke admin panel par woh show hi na ho.

---

### Hum kya kar sakte hain?

Hum **Level 2 (Zod-level custom checks)** ko hamari global `src/app/lib/zodSchemas.ts` file mein integrate kar sakte hain. Is se normal users par koi asar nahi parega, lekin keyboard-smashers directly block ho jayenge.

Agar aap chahein, toh jab hum **checkout api route** ya baki forms ke API handlers likhenge, toh wahan hum **Level 1 (Rate-Limiter checking)** ko integrate kar denge taake ek IP se 5 minutes mein sirf 1 request hi submit ho sake.

Aap is security mechanism ke bare mein kya sochte hain? Kya hum Zod mein anti-gibberish checks add kar dein?
src/
│
├── ⚙️ middleware.ts                         [File #45] (Edge-Layer Identity & UTM Proxy)
├── ⚙️ auth.ts                               [File #59] (NextAuth JWT session stitching engine)
│
├── 📂 actions/                               [SERVER ACTIONS: Decoupled from routing]
│   ├── 📂 telemetry/
│   │   └── 📄 trackingActions.ts             [File #30] (Central telemetry event logger)
│   ├── 📂 cart/
│   │   ├── 📄 couponActions.ts               [File #28] (verifyAndApplyCoupon action)
│   │   └── 📄 submitDemandRequest.ts         [File #43] (OOS Demand capturing server action)
│   └── 📂 checkout/
│       ├── 📄 addressActions.ts              [File #26] (User profile address mutations)
│       └── 📄 shippingActions.ts             [File #29] (Fetches shipping rules settings)
│       └── 📄 authActions.ts                 [File #27] (SMTP emails, OTP verify, and phone syncs)
│
├── 📂 models/                                [DATABASE SCHEMAS: Decoupled from app]
│   ├── 📄 Order.ts                           [File #53] (Order collection schema & indices)
│   ├── 📄 User.ts                            [File #54] (User schema with nested Address definitions)
│   ├── 📄 AbandonedCart.ts                   [File #60] (AbandonedCart collection schema)
│   ├── 📄 UserEvent.ts                       [File #61] (UserEvent telemetry logs schema)
│   ├── 📄 UserSession.ts                     [File #62] (Visitor and Session tracking schema)
│   ├── 📄 Setting.ts                         [File #63] (Payment gateway credentials schema)
│   └── 📄 CustomerRequest.ts                 [File #64] (OOS Restock demand capture schema)
│
├── 📂 lib/                                   [SYSTEM HELPERS: Decoupled from app]
│   ├── 📂 telemetry/
│   │   └── 📄 rate-limiter.ts                [File #58] (Upstash Redis sliding-window ratelimiter)
│   ├── 📂 checkout/
│   │   ├── 📄 shipping-calculator.ts         [File #55] (Shipping rules calculation helpers)
│   │   ├── 📄 order-utils.ts                 [File #56] (Atomic sequential Order ID generator)
│   │   └── 📄 mongoose.ts                    [File #57] (Mongoose cached connection singleton)
│   └── 📂 payment/
│       └── 📄 paymentAdapter.ts              [File #59] (Gateways routing interface adapter)
│
├── 📂 payload/globals/                       [CMS CONFIGS]
│   └── 📄 Settings.ts                        [File #51] (Globals settings config & Redis cache purge)
│
├── 📂 sanity/lib/payload/                    [CMS QUERIES]
│   └── 📄 product.queries.ts                 [File #50] (PDP stock status and live card queries)
│
└── 📂 app/                                   [PURE FRONTEND ROUTER & NEXT.JS API ENDPOINTS]
    │
    ├── 📂 components/                        [SHARED FRONTEND UTILITIES]
    │   └── 📂 telemetry/
    │       └── 📄 IntelligenceTracker.tsx     [File #44] (Client-side browser behavior sentinel)
    │
    ├── 📂 api/                               [API ROUTINGS: Strictly placed in app/]
    │   ├── 📂 telemetry/
    │   │   └── 📂 live-stream/
    │   │       └── 📄 route.ts               [File #41] (Admin Live Radar Active Users counting API)
    │   ├── 📂 cart/
    │   │   └── 📂 verify-coupon/
    │   │       └── 📄 route.ts               [File #35] (API proxy mapping rate limit coupon requests)
    │   ├── 📂 checkout/
    │   │   ├── 📂 filter/
    │   │   │   └── 📄 route.ts               [File #42] (Dynamic PLP catalog attributes filters API)
    │   │   └── 📂 orders/create/
    │   │       └── 📄 route.ts               [File #31] (Live Stock check & order creation API)
    │   ├── 📂 payment/
    │   │   ├── 📂 gateways/
    │   │   │   └── 📄 route.ts               [File #32] (Fetches active gateways configurations)
    │   │   ├── 📂 initiate/
    │   │   │   └── 📄 route.ts               [File #33] (Generates banks/wallets redirects)
    │   │   └── 📂 verify/[gateway]/
    │   │       └── 📄 route.ts               [File #34] (S2S Callback verify prevents checkout losses)
    │   ├── 📂 webhooks/
    │   │   ├── 📂 crm/
    │   │   │   └── 📄 route.ts               [File #36] (CRM refund/cancellation status sync)
    │   │   └── 📂 logistics/
    │   │       └── 📄 route.ts               [File #37] (3PL courier delay logs integration)
    │   └── 📂 cron/
    │       ├── 📂 flush-pulses/
    │       │   └── 📄 route.ts               [File #38] (Flushes Redis pulses batch-wise into Mongo)
    │       ├── 📂 low-stock-alert/
    │       │   └── 📄 route.ts               [File #39] (Staff notification alerts on low stocks)
    │       └── 📂 loyalty-sync/
    │           └── 📄 route.ts               [File #40] (ETL background user cohorts segments compiler)
    │
    └── 📂 (main)/                            [CUSTOMER VIEWS & LAYOUTS]
        ├── 📄 layout.tsx                     [File #47] (Root Shell Layout & Global Providers)
        ├── 📄 page.tsx                       [File #46] (Homepage Landing with dynamic sections builder)
        │
        ├── 📂 cart/                          [CART VIEW]
        │   ├── 📄 page.tsx                   [File #07] (Main Cart Page Server Wrapper)
        │   └── 📂 _components/
        │       ├── 📄 CartClient.tsx         [File #01] (Client Shell & summaries trigger controls)
        │       ├── 📄 CartItem.tsx           [File #02] (Cart item row with Stock Limits check)
        │       ├── 📄 CartSummary.tsx        [File #03] (Totals calculation & Coupon bridge)
        │       ├── 📄 CartSummarySheet.tsx   [File #04] (Mobile summary dynamic bottom-sheet)
        │       ├── 📄 CouponInput.tsx        [File #05] (Coupon code submission UI controller)
        │       └── 📄 EmptyCart.tsx          [File #06] (Empty state fallback template)
        │
        ├── 📂 checkout/                      [CHECKOUT VIEW]
        │   ├── 📄 layout.tsx                 [File #23] (Checkout step-indicator shell layout)
        │   ├── 📄 page.tsx                   [File #24] (Shipping address server wrapper)
        │   ├── 📄 CheckoutContext.tsx        [File #22] (Saved addresses checkout state provider)
        │   │
        │   ├── 📂 _components/
        │   │   ├── 📄 CheckoutForm.tsx       [File #12] (Shipping form coordinator & validations)
        │   │   ├── 📄 AddressInputFields.tsx [File #10] (Manual input panel with Autofill tracker)
        │   │   ├── 📄 AddressLocationSelectors.tsx [File #11] (react-select province & city selector)
        │   │   ├── 📄 NewAddressForm.tsx     [File #15] (New Address template wrapper)
        │   │   ├── 📄 SavedAddresses.tsx     [File #17] (Saved profile address selector grid)
        │   │   ├── 📄 LocationPicker.tsx     [File #14] (Leaflet map-pinning coordinates selector)
        │   │   ├── 📄 CheckoutMobileSummary.tsx [File #13] (Responsive checkout details drawer)
        │   │   ├── 📄 OrderSummary.tsx       [File #16] (Order items list & totals checkout panels)
        │   │   ├── 📄 StepIndicator.tsx      [File #18] (funnel steps indicator bar)
        │   │   └── 📄 ClearCartOnSuccess.tsx [File #50] (Success client cart cache cleaner)
        │   │
        │   └── 📂 payment/                    [PAYMENT SUB-VIEW]
        │       ├── 📄 page.tsx               [File #21] (Order post-request & redirect initiator)
        │       └── 📂 _components/
        │           ├── 📄 PaymentMethodSelector.tsx [File #19] (COD/Stripe active gateway toggles)
        │           └── 📄 ShippingSummary.tsx [File #20] (Review selected shipping details)
        │
        ├── 📂 order-success/[orderId]/       [SUCCESS PAGE]
        │   └── 📄 page.tsx                   [File #51] (SSR purchase conversion telemetry logger)
        │
        └── 📂 order-failure/                 [FAILURE PAGE]
            └── 📄 page.tsx                   [File #52] (Checkout transaction failure recovery portal)
"use client";

import { useStateContext } from "@/app/context/StateContext";
import EmptyCart from "./EmptyCart";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartSummarySheet from "./CartSummarySheet";
import { ChevronsUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function CartClient() {
  // 1. isCartLoaded ko context se nikalain
  const { cartItems, totalQuantities, isCartLoaded } = useStateContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 2. Client par mount hone ka wait karein
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Jab tak mounted na ho ya cart load na ho jaye, kuch bhi render na karein (ya skeleton dikhayein)
  if (!mounted || !isCartLoaded) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // 4. Ab agar items zero hain to EmptyCart dikhayein
  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Title (Desktop/Tablet) */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-clash font-bold text-gray-900 dark:text-white">
            My Shopping Cart
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have{" "}
            <span className="font-bold text-brand-primary">
              {totalQuantities} {totalQuantities > 1 ? "items" : "item"}
            </span>{" "}
            in your cart.
          </p>
        </div>

        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Cart Items List (The Scrollable Area) */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full">
            {/* 🔥 FIXED: HEIGHT CONTROL ON DESKTOP TOO */}
            <div
              // Mobile: max-h-[600px]
              // Desktop (lg+): max-h-[800px] (Thoda bada)
              className="divide-y divide-gray-200 dark:divide-gray-700 max-h-150 lg:max-h-200 overflow-y-auto custom-scrollbar"
            >
              {cartItems.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>

            {/* Scroll indicator for mobile (Simplified to show on all overflow) */}
            {cartItems.length > 5 && (
              <div className="text-center text-xs text-gray-500 py-2 border-t border-gray-100 dark:border-gray-700">
                Scroll down for more items.
              </div>
            )}
          </div>

          {/* Right Column: Summary (Desktop/Tablet) */}
          <div className="hidden md:block lg:col-span-4 w-full">
            <CartSummary />
          </div>
        </div>
      </div>

      {/* 2. MOBILE FLOATING ACTION BAR (The Trigger) */}
      <div className="md:hidden fixed bottom-14.5 left-0 right-0 p-4">
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-full flex items-center justify-between px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-gray-700 active:scale-[0.98] transition-all duration-200"
        >
          <span className="flex items-center gap-2 text-lg font-clash">
            <ChevronsUp size={20} className="animate-bounce" />
            View Summary ({totalQuantities})
          </span>
          <span className="text-xl font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
            Rs. {cartSubtotal.toLocaleString()}
          </span>
        </button>
      </div>

      {/* 3. MOBILE SUMMARY SHEET */}
      <CartSummarySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </main>
  );
}


"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { useStateContext } from "@/app/context/StateContext";
import { CartItemWithStock } from "@/app/context/hooks/useCart"; // ✅ Import custom type

export default function CartItem({ item }: { item: CartItemWithStock }) {
  const { onRemove, toggleCartItemQuantity } = useStateContext();

  const finalPrice = item.price;
  const itemTotal = finalPrice * item.quantity;

  // 🔥 THE INTELLIGENCE: Check if we hit the stock limit from Payload
  const stockLimit = item.variantStock ?? 999;
  const isLimitReached = item.quantity >= stockLimit;

  return (
    <div className="flex items-start gap-4 p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
      {/* 1. Image Section */}
      <Link href={`/product/${item.slug}`} className="shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <Image
            src={urlFor(item.image).url()}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 2. Details & Controls */}
      <div className="grow flex flex-col justify-between self-stretch">
        <div className="flex justify-between items-start">
          <div className="flex flex-col grow pr-2">
            <Link
              href={`/product/${item.slug}`}
              className="font-bold text-gray-900 dark:text-white hover:text-brand-primary line-clamp-2 text-base lg:text-md transition-colors"
            >
              {item.name}
            </Link>
            {item.variant && (
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                {item.variant.name}
              </p>
            )}
          </div>

          {/* Remove Action */}
          <button
            onClick={() => onRemove(item)}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0 active:scale-90"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Quantity & Pricing Row */}
        <div className="flex items-end justify-between mt-auto">
          <div className="space-y-2">
            {/* Visual Alert if stock is low */}
            {isLimitReached && (
              <div className="flex items-center gap-1.5 text-orange-500 animate-pulse">
                <AlertCircle size={10} />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  Stock Limit Reached
                </span>
              </div>
            )}

            {/* Quantity Control Panel */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/80 border dark:border-gray-700 rounded-full p-1 w-fit shadow-inner">
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "dec")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span className="font-black w-7 text-center text-sm text-gray-900 dark:text-white">
                {item.quantity}
              </span>

              {/* 🔥 FIX: Disable button if stock limit reached */}
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "inc")}
                disabled={isLimitReached}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90
                        ${
                          isLimitReached
                            ? "opacity-20 cursor-not-allowed bg-transparent text-gray-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                        }`}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Price Visualization */}
          <div className="text-right">
            <p className="font-black text-xl text-brand-primary tracking-tighter">
              Rs. {itemTotal.toLocaleString()}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase mt-0.5">
              Unit: Rs. {finalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";
import CouponInput from "./CouponInput";

export default function CartSummary() {
  const {
    subtotal,
    totalQuantities,
    shippingDetails,
    grandTotal,
    discountAmount,
    appliedCoupon,
  } = useStateContext();

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal ({totalQuantities} items)</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-500">
              <span>Discount</span>
              <span className="font-medium">
                - Rs. {discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Shipping</span>
            {shippingDetails ? (
              <span
                className={`font-medium ${
                  // ✅ Logic Updated: 
                  // 1. Agar Coupon Free Shipping hai -> GREEN
                  // 2. Agar Shipping Rule "On Call" hai -> ORANGE
                  // 3. Agar Cost 0 hai (aur on call nahi) -> GREEN
                  appliedCoupon?.type === 'freeShipping' || (shippingDetails.isFree && !shippingDetails.isOnCall)
                    ? "text-green-600 dark:text-green-500"
                    : shippingDetails.isOnCall 
                        ? "text-brand-secondary" 
                        : ""
                }`}
              >
                {appliedCoupon?.type === 'freeShipping'
                  ? 'FREE'
                  : shippingDetails.displayText}
              </span>
            ) : (
              <Loader2 size={16} className="animate-spin" />
            )}
          </div>
        </div>

        <CouponInput />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 flex justify-between font-bold text-lg">
          <span>Grand Total</span>
          {shippingDetails ? (
            <span className={shippingDetails.isOnCall ? "text-brand-primary" : ""}>
               {/* Agar On Call hai, to Grand Total mein shipping add nahi hogi, lekin hum wahan bhi indicator de sakte hain */}
               Rs. {grandTotal.toLocaleString()}
            </span>
          ) : (
            <Loader2 size={18} className="animate-spin" />
          )}
        </div>

        <div className="mt-8">
          <Link href="/checkout" className="block w-full">
            <button className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
    </div>
  );
}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import CartSummary from "./CartSummary";
import { useStateContext } from "@/app/context/StateContext";

interface CartSummarySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSummarySheet({ isOpen, onClose }: CartSummarySheetProps) {
    
    // Fetch Total Items for Header
    const { totalQuantities } = useStateContext();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        aria-hidden="true"
                    />

                    {/* 2. Sheet Container (BOTTOM-UP SLIDE) */}
                    <motion.div
                        // 🔥 BOTTOM-UP ANIMATION
                        initial={{ y: "100%" }} 
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                        
                        // 🔥 PLACEMENT (Bottom of screen)
                        className="fixed bottom-0 left-0 right-0 w-full max-h-[90vh] bg-white dark:bg-gray-900 z-50 lg:hidden flex flex-col shadow-2xl rounded-t-3xl"
                        
                    >
                        {/* === HANDLE BAR (The "Product Sheet" Touch) === */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>
                        
                        {/* Header (Handle Bar + Close) */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white">
                                Your Cart ({totalQuantities} Items)
                            </h2>
                            <button 
                                onClick={onClose} 
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Content (CartSummary component) */}
                        <div className="grow overflow-y-auto custom-scrollbar">
                            {/* 🔥 CART SUMMARY IS RENDERED HERE */}
                            <CartSummary /> 
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
"use client";

import { useState, useTransition } from "react";
import { useStateContext } from "@/app/context/StateContext";
import { Loader2, Tag, X } from "lucide-react";

// === FIX #2: USING YOUR THEME STYLES ===
const inputStyles =
  "appearance-none block w-full flex-grow rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

export default function CouponInput() {
  const { applyCoupon, removeCoupon, appliedCoupon, discountAmount } =
    useStateContext();
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    startTransition(async () => {
      await applyCoupon(couponCode);
      setCouponCode("");
    });
  };

  if (appliedCoupon) {
    return (
      <div className="mt-6">
        <p className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Coupon Applied
        </p>
        <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-300">
          <div className="flex items-center gap-2">
            <Tag size={16} />
            <span className="font-bold">{appliedCoupon.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">
              - Rs. {discountAmount.toLocaleString()}
            </span>
            <button
              onClick={removeCoupon}
              className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50"
              aria-label="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <label
        htmlFor="coupon"
        className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
      >
        Have a Coupon?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="coupon"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter Coupon Code"
          disabled={isPending}
          className={inputStyles} // Using your themed styles
        />
        <button
          onClick={handleApplyCoupon}
          disabled={isPending || !couponCode}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function EmptyCart() {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <ShoppingCart
          size={56}
          className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          strokeWidth={1.5}
        />
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {/* ✅ FIX: Escaped apostrophes */}
          Let&apos;s find something you&apos;ll love!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}
// /src/app/cart/page.tsx

import type { Metadata } from "next";
import CartClient from "./_components/CartClient"; // Import the client component

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

axha ek baat yadd rkaho ap buss points note kroge apne mujhe code nhi dena koi bhi bussgaps nikalte rahe or jo gaps he unhe check bhi kree ke wo real me he bhi ya nhi 
"use client";

import { createContext, useContext, ReactNode, useState, useMemo, useCallback } from "react";
import { useCart } from "./hooks/useCart";
import { useWishlist } from "./hooks/useWishlist";
import { useCheckout } from "./hooks/useCheckout";

type StateContextType = ReturnType<typeof useCart> &
  ReturnType<typeof useWishlist> &
  ReturnType<typeof useCheckout> & {
    isProfileSidebarOpen: boolean;
    openProfileSidebar: () => void;
    closeProfileSidebar: () => void;
    toggleProfileSidebar: () => void;
  };

const StateContext = createContext<StateContextType | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  const wishlist = useWishlist();
  
  // Checkout hook uses active cart logic from useCart
  const checkout = useCheckout(cart.subtotal, cart.cartItems);

  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  const openProfileSidebar = useCallback(() => setIsProfileSidebarOpen(true), []);
  const closeProfileSidebar = useCallback(() => setIsProfileSidebarOpen(false), []);
  const toggleProfileSidebar = useCallback(() => setIsProfileSidebarOpen((prev) => !prev), []);

  const clearCartAndCheckout = useCallback(() => {
    // Step 1: Cart clear karo (Smart logic inside useCart handles 'BuyNow' vs 'MainCart')
    cart.clearCart(); 
    // Step 2: Checkout form reset karo
    checkout.clearCheckoutState();
  }, [cart, checkout]); 

  const contextValue = useMemo<StateContextType>(() => ({
    ...cart,
    ...wishlist,
    ...checkout,
    clearCart: clearCartAndCheckout, // Overwritten with combined wrapper
    isProfileSidebarOpen,
    openProfileSidebar,
    closeProfileSidebar,
    toggleProfileSidebar,
  }), [
    cart, 
    wishlist, 
    checkout, 
    clearCartAndCheckout, 
    isProfileSidebarOpen, 
    openProfileSidebar, 
    closeProfileSidebar, 
    toggleProfileSidebar
  ]);

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useStateContext must be used within an AppStateProvider");
  }
  return context;
};

// src/app/context/hooks/useCart.ts (UPGRADED WITH MULTI-TAB RACE CONDITION MONITORING)

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import SanityProduct, {
  CleanCartItem,
  ProductVariant,
  SanityImageObject,
} from "@/sanity/types/product_types";
import {
  toastSuccess,
  toastError,
} from "@/app/_components/shared/CustomToasts";
import { logUserEvent } from "@/app/actions/trackingActions";

export interface CartItemWithStock extends CleanCartItem {
  variantStock?: number; 
}

export function useCart() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mainCartItems, setMainCartItems] = useState<CartItemWithStock[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItemWithStock | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const isNavigatingToCheckout = useRef(false);

  // Gap #56: Ref to track session changes for dynamic cart merge logging
  const prevSessionRef = useRef<any>(session);

  // Debounce refs
  const qtyTrackTimeout = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const qtyChangeAccumulator = useRef<{ [key: string]: number }>({});

  // === 1. LOAD DATA & TRACK REHYDRATION ===
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cartData = localStorage.getItem("PocketValue_cart");
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          const loadedItems = parsedCart.items || [];
          setMainCartItems(loadedItems);

          // TELEMETRY EVENT: Track Cart Rehydration (Gap #47)
          if (loadedItems.length > 0) {
            logUserEvent('cart_rehydrated', pathname, {
              total_items: loadedItems.length,
              subtotal: parsedCart.subtotal || 0
            });
          }
        }

        const buyNowData = localStorage.getItem("PocketValue_buyNow");
        const buyNowFlag =
          localStorage.getItem("PocketValue_isBuyNowMode") === "true";

        if (buyNowData && buyNowFlag) {
          setBuyNowItem(JSON.parse(buyNowData));
          setIsBuyNowMode(true);
        }
      } catch (error) {
        console.error("Failed to parse cart data", error);
      } finally {
        setIsCartLoaded(true);
      }
    }
  }, []); 

  // === 2. PERSISTENCE ===
  useEffect(() => {
    if (isCartLoaded) {
      const mainTotals = mainCartItems.reduce(
        (acc, item) => ({
          sub: acc.sub + item.price * item.quantity,
          qty: acc.qty + item.quantity,
        }),
        { sub: 0, qty: 0 },
      );
      localStorage.setItem(
        "PocketValue_cart",
        JSON.stringify({
          items: mainCartItems,
          subtotal: mainTotals.sub,
          totalQuantities: mainTotals.qty,
        }),
      );
    }
  }, [mainCartItems, isCartLoaded]);

  useEffect(() => {
    if (isCartLoaded) {
      if (buyNowItem) {
        localStorage.setItem("PocketValue_buyNow", JSON.stringify(buyNowItem));
      } else {
        localStorage.removeItem("PocketValue_buyNow");
      }
    }
  }, [buyNowItem, isCartLoaded]);

  // =================================================================
  // 🚀 GAP #62: MULTI-TAB CART STATE DESYNC & AUTOMATED RECONCILIATION
  // =================================================================
  useEffect(() => {
    if (!isCartLoaded) return;

    const handleStorageChange = (e: StorageEvent) => {
      // We listen to the storage changes of our target Cart key on background tabs
      if (e.key === "PocketValue_cart" && e.newValue) {
        try {
          const parsedNewCart = JSON.parse(e.newValue);
          const currentLocalSnapshot = JSON.stringify(mainCartItems);
          const incomingLocalSnapshot = JSON.stringify(parsedNewCart.items || []);

          // If background localStorage updates do not match current react state, reconcile!
          if (currentLocalSnapshot !== incomingLocalSnapshot) {
            
            // 🚀 TELEMETRY EVENT: Track dynamic desync occurrences across browser tabs
            logUserEvent('cart_desync_error', pathname, {
              mismatch_type: 'tab_state_out_of_sync',
              current_item_count: mainCartItems.length,
              incoming_item_count: (parsedNewCart.items || []).length
            });

            // Reconcile and synchronize background tab state instantly!
            setMainCartItems(parsedNewCart.items || []);
            console.log("📡 [Tab Sync] Successfully reconciled out-of-sync multi-tab cart state.");
          }
        } catch (err) {
          console.error("Multi-tab storage sync parsing failed:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mainCartItems, isCartLoaded, pathname]);
  // =================================================================

  // === 3. CONCURRENT CART MERGING (Gap #56) ===
  useEffect(() => {
    if (isCartLoaded) {
      if (!prevSessionRef.current && session && mainCartItems.length > 0) {
        const totalMergeSubtotal = mainCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        logUserEvent('cart_merged', pathname, {
          total_items: mainCartItems.length,
          subtotal: totalMergeSubtotal
        });
        
        console.log(`📡 Cart Merged: Authenticated session merged ${mainCartItems.length} active items.`);
      }
      prevSessionRef.current = session;
    }
  }, [session, mainCartItems, isCartLoaded, pathname]);

  // === 4. CHECKOUT CLEANUP ===
  useEffect(() => {
    if (!isCartLoaded) return;
    const isCheckoutFlow =
      pathname === "/checkout" ||
      pathname.startsWith("/checkout/") ||
      pathname === "/payment" ||
      pathname.startsWith("/order-success");
    const isCartPage = pathname === "/cart";

    if (isCheckoutFlow) {
      isNavigatingToCheckout.current = false;
    }

    if ((!isCheckoutFlow || isCartPage) && !isNavigatingToCheckout.current) {
      if (buyNowItem || isBuyNowMode) {
        setBuyNowItem(null);
        setIsBuyNowMode(false);
        localStorage.removeItem("PocketValue_isBuyNowMode");
      }
      localStorage.removeItem("PocketValue_isMainCartCheckout");
    }
  }, [pathname, isBuyNowMode, buyNowItem, isCartLoaded]);

  const showBuyNow = isBuyNowMode && pathname !== "/cart";
  const activeCartItems = showBuyNow
    ? buyNowItem
      ? [buyNowItem]
      : []
    : mainCartItems;

  const { subtotal, totalQuantities } = useMemo(() => {
    return activeCartItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.price * item.quantity,
        totalQuantities: acc.totalQuantities + item.quantity,
      }),
      { subtotal: 0, totalQuantities: 0 },
    );
  }, [activeCartItems]);

  const onAdd = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
    source?: string,
  ): boolean => {
    if (!session) {
      toastError("Please log in to add items.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return false;
    }

    const stockLimit = variant.stock ?? 999;
    const cartItemId = `${product._id}-${variant._key}`;
    const existingItem = mainCartItems.find(
      (item) => item.cartItemId === cartItemId,
    );
    const newQty = (existingItem?.quantity || 0) + quantity;

    if (newQty > stockLimit) {
      toastError(
        `Cannot add more. Total in cart (${newQty}) exceeds available stock (${stockLimit}).`,
      );
      return false;
    }

    if (existingItem) {
      setMainCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
    } else {
      const effectivePrice = variant.salePrice ?? variant.price;
      const effectiveImage = (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject;

      const newCartItem: CartItemWithStock = {
        _id: product._id,
        cartItemId,
        name: `${product.title} (${variant.name})`,
        price: effectivePrice,
        quantity,
        slug: product.slug,
        image: effectiveImage,
        variant: { _key: variant._key, name: variant.name },
        categoryIds: product.categoryIds,
        variantStock: stockLimit, 
        sku: variant.sku || "N/A", 
      };
      setMainCartItems((prev) => [...prev, newCartItem]);
    }

    logUserEvent("add_to_cart", pathname, {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
      source: source || "direct_pdp"
    });

    toastSuccess(`${quantity} x ${product.title} added.`);
    return true;
  };

  const toggleCartItemQuantity = (cartItemId: string, value: "inc" | "dec") => {
    if (isBuyNowMode && buyNowItem && buyNowItem.cartItemId === cartItemId) {
      if (value === "dec" && buyNowItem.quantity <= 1) return; 

      if (value === "inc") {
        const limit = buyNowItem.variantStock ?? 999;
        if (buyNowItem.quantity >= limit) {
          toastError(`Limit reached. Only ${limit} available.`);
          return;
        }
      }

      setBuyNowItem((prev) => {
        if (!prev) return null;
        const targetQty = value === "inc" ? prev.quantity + 1 : prev.quantity - 1;
        debounceQuantityTrack(prev._id, prev.sku || "N/A", prev.price, value);
        return { ...prev, quantity: targetQty };
      });
      return;
    }

    const item = mainCartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    if (value === "dec" && item.quantity <= 1) return;

    if (value === "inc") {
      const limit = item.variantStock ?? 999;
      if (item.quantity >= limit) {
        toastError(`Maximum available stock (${limit}) reached.`);
        return;
      }
    }

    setMainCartItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId === cartItemId) {
          const targetQty = value === "inc" ? i.quantity + 1 : i.quantity - 1;
          debounceQuantityTrack(i._id, i.sku || "N/A", i.price, value);
          return { ...i, quantity: targetQty };
        }
        return i;
      })
    );
  };

  const debounceQuantityTrack = (
    productId: string,
    sku: string,
    price: number,
    direction: "inc" | "dec"
  ) => {
    const trackingKey = `${productId}-${sku}`;
    const currentAccumulation = qtyChangeAccumulator.current[trackingKey] || 0;
    qtyChangeAccumulator.current[trackingKey] =
      direction === "inc" ? currentAccumulation + 1 : currentAccumulation - 1;

    if (qtyTrackTimeout.current[trackingKey]) {
      clearTimeout(qtyTrackTimeout.current[trackingKey]);
    }

    qtyTrackTimeout.current[trackingKey] = setTimeout(() => {
      const finalDiff = qtyChangeAccumulator.current[trackingKey];
      if (finalDiff !== 0) {
        if (finalDiff > 0) {
          logUserEvent("add_to_cart", pathname, {
            productId,
            sku,
            price,
            quantity: finalDiff,
          });
        } else {
          logUserEvent("remove_from_cart", pathname, {
            productId,
            sku,
            price,
            quantity: Math.abs(finalDiff),
          });
        }
      }
      delete qtyChangeAccumulator.current[trackingKey];
      delete qtyTrackTimeout.current[trackingKey];
    }, 1500);
  };

  const buyNow = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
  ) => {
    if (!session) {
      toastError("Please log in to buy.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return;
    }

    const stockLimit = variant.stock ?? 999;
    if (quantity > stockLimit) {
      toastError(`Only ${stockLimit} units available.`);
      return;
    }

    const tempItem: CartItemWithStock = {
      _id: product._id,
      cartItemId: `${product._id}-${variant._key}`,
      name: `${product.title} (${variant.name})`,
      price: variant.salePrice ?? variant.price,
      quantity,
      slug: product.slug,
      image: (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject,
      variant: { _key: variant._key, name: variant.name },
      categoryIds: product.categoryIds,
      variantStock: stockLimit,
      sku: variant.sku || "N/A", 
    };

    setBuyNowItem(tempItem);
    setIsBuyNowMode(true);
    localStorage.setItem("PocketValue_isBuyNowMode", "true");
    isNavigatingToCheckout.current = true;

    logUserEvent("add_to_cart", pathname, {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
    });
    
    logUserEvent("checkout_start", "/checkout", {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
    });

    router.push("/checkout");
  };

  const onRemove = (item: CleanCartItem) => {
    setMainCartItems((prev) =>
      prev.filter((i) => i.cartItemId !== item.cartItemId),
    );

    logUserEvent("remove_from_cart", pathname, {
      productId: item._id,
      sku: item.sku || "N/A",
      price: item.price,
      quantity: item.quantity,
    });

    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    }
  };

  const clearCart = () => {
    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    } else {
      setMainCartItems([]);
    }
    localStorage.removeItem("PocketValue_isMainCartCheckout");
  };

  return {
    cartItems: activeCartItems,
    subtotal,
    totalQuantities,
    onAdd,
    onRemove,
    toggleCartItemQuantity,
    clearCart,
    buyNow,
    isBuyNowMode: showBuyNow,
    isCartLoaded,
  };
}

// src/app/checkout/_components/AddressInputFields.tsx (COMPILE SAFE & FULLY REGISTERED)

"use client";

import { useRef } from "react";
import { ShippingInfo } from "./NewAddressForm";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { logUserEvent } from "@/app/actions/trackingActions";

interface AddressInputFieldsProps {
  shippingInfo: ShippingInfo;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value?: string) => void;
  inputStyles: string;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
  getErrorStyles: (hasError: boolean) => string;
  disabled?: boolean;
}

const CustomCountrySelect = ({ icon, ...rest }: any) => {
  return (
    <div className="flex items-center pl-3 pr-2 pointer-events-none">
      <img 
        src="https://flagcdn.com/pk.svg" 
        alt="Pakistan Flag"
        className="w-6 h-4 object-cover border border-gray-200 shadow-sm rounded-xs"
      />
      <span className="text-gray-500 font-semibold text-sm ml-2">+92</span>
    </div>
  );
};

export default function AddressInputFields({
  shippingInfo,
  handleInputChange,
  onPhoneChange,
  inputStyles,
  errors,
  getErrorStyles,
  disabled = false, 
}: AddressInputFieldsProps) {
  
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout";
  
  // Gap #61: Tracking autofill intervals
  const keyPressTimestamps = useRef<{ [key: string]: number }>({});

  const handleFocusTracking = (fieldId: string) => {
    keyPressTimestamps.current[fieldId] = Date.now(); 
    logUserEvent('form_field_interaction', pathname, { field_id: fieldId, interaction_type: 'focus' });
  };

  const handleBlurTracking = (fieldId: string, value: string, hasError: boolean) => {
    const focusTime = keyPressTimestamps.current[fieldId] || Date.now();
    const interactionDuration = Date.now() - focusTime;
    
    // Autofill delta calculation logic
    const isAutofill = value.length > 3 && interactionDuration < 50;

    logUserEvent('form_field_interaction', pathname, {
      field_id: fieldId,
      interaction_type: 'blur',
      has_error: hasError,
      is_autofill: isAutofill,
      interaction_duration_ms: interactionDuration
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={shippingInfo.fullName}
            onChange={handleInputChange}
            required
            className={`${inputStyles} ${getErrorStyles(!!errors.fullName)}`}
            onFocus={() => handleFocusTracking('fullName')}
            onBlur={(e) => handleBlurTracking('fullName', e.target.value, !!errors.fullName)}
          />
        </div>

        {/* Phone Number Field */}
        <div className={`phone-input-container`}> 
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <PhoneInput
            defaultCountry="PK"
            countries={['PK']} 
            international={false}
            withCountryCallingCode={false}
            countrySelectComponent={CustomCountrySelect} 
            value={shippingInfo.phone}
            onChange={onPhoneChange}
            disabled={false}      
            className={`${inputStyles} ${getErrorStyles(!!errors.phone)} flex items-center py-0! px-0! overflow-hidden bg-white dark:bg-gray-900`} 
            numberInputProps={{
                className: "bg-transparent border-none focus:ring-0 grow h-full py-2.5 pl-2 pr-3 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 w-full",
                required: true,
                placeholder: "300 1234567",
                maxLength: 12,
                onFocus: () => handleFocusTracking('phone'),
                // 🚀 FIXED: Added explicit ': any' typing to 'e' to resolve linter error ts(7006)
                onBlur: (e: any) => handleBlurTracking('phone', e.target.value, !!errors.phone)
            }}
          />
        </div>
      </div>

      {/* Area / Locality Field */}
      <div>
        <label htmlFor="area" className="block text-sm font-medium mb-1">
          Area / Locality
        </label>
        <input
          id="area"
          name="area"
          type="text"
          value={shippingInfo.area}
          onChange={handleInputChange}
          required
          className={`${inputStyles}`}
          placeholder="e.g. DHA Phase 6, Johar Town"
          onFocus={() => handleFocusTracking('area')}
          onBlur={(e) => handleBlurTracking('area', e.target.value, false)}
        />
      </div>

      {/* Address Field */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Street Address & House No.
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={shippingInfo.address}
          onChange={handleInputChange}
          required
          className={`${inputStyles} ${getErrorStyles(!!errors.address)}`}
          placeholder="e.g. House #123, Street 4"
          onFocus={() => handleFocusTracking('address')}
          onBlur={(e) => handleBlurTracking('address', e.target.value, !!errors.address)}
        />
      </div>

      <style jsx global>{`
        .PhoneInputCountrySelectArrow { display: none !important; }
        .PhoneInputInput { outline: none; border: none; }
      `}</style>
    </div>
  );
}

// /src/app/checkout/_components/AddressLocationSelectors.tsx (VERIFIED - NO CHANGES NEEDED)

"use client";

import { useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { provinces, citiesByProvince } from "@/app/lib/pakistan-location-data";
import { ShippingInfo } from "./NewAddressForm";
import { StylesConfig } from "react-select";

interface AddressLocationSelectorsProps {
  shippingInfo: ShippingInfo;
  handleSelectChange: (name: "province" | "city", option: any) => void;
  customSelectStyles: (hasError: boolean) => StylesConfig;
  isMounted: boolean;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
}

export default function AddressLocationSelectors({
  shippingInfo,
  handleSelectChange,
  customSelectStyles,
  isMounted,
  errors,
}: AddressLocationSelectorsProps) {
  const availableCities = useMemo(() => {
    if (!shippingInfo.province) return [];
    return citiesByProvince[shippingInfo.province.value] || [];
  }, [shippingInfo.province]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Province</label>
        {isMounted ? (
          <CreatableSelect
            styles={customSelectStyles(!!errors.province)}
            name="province"
            instanceId="province-select"
            options={provinces}
            value={shippingInfo.province}
            onChange={(option) => handleSelectChange("province", option)}
            required
          />
        ) : (
          <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City</label>
        {isMounted ? (
          <CreatableSelect
            styles={customSelectStyles(!!errors.city)}
            name="city"
            instanceId="city-select"
            options={availableCities}
            value={shippingInfo.city}
            onChange={(option) => handleSelectChange("city", option)}
            required
            isDisabled={!shippingInfo.province}
            placeholder={
              !shippingInfo.province
                ? "Select province first"
                : "Select or type city..."
            }
          />
        ) : (
          <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This component is a well-structured presentational component for location selection and does not need any modifications for our new authentication flow.


"use client";

import { useState, useEffect } from "react";
import { useStateContext } from "@/app/context/StateContext";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderSummary from "./OrderSummary";

export default function CheckoutMobileSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const { grandTotal } = useStateContext();
  const [mounted, setMounted] = useState(false);

  // ✅ FIX: Force rendering only on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe Total (Server will render 0, Client will render real total)
  const displayTotal = mounted ? grandTotal.toLocaleString() : "0";

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* === TOGGLE HEADER === */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between py-5 text-left focus:outline-none group"
        >
          <div className="flex items-center gap-2 text-brand-primary">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">
              <ShoppingCart size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-brand-primary" />
              {isOpen ? "Hide order summary" : "Show order summary"}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </div>
          
          <div className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
             {/* Use the safe 'displayTotal' variable */}
             Rs. {displayTotal}
          </div>
        </button>

        {/* === EXPANDABLE CONTENT === */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 border-dashed mt-2">
                 <OrderSummary isMobileView={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// /src/app/checkout/_components/LocationPicker.tsx (VERIFIED - NO CHANGES NEEDED)

"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng, Map } from "leaflet";
import { toast } from "react-hot-toast";

// Note: This component assumes that marker-icon.png and marker-shadow.png
// are placed in the /public/leaflet/ folder and are handled by a global CSS import.

// Internal component to handle map events
interface LocationMarkerProps {
  onPositionChange: (pos: LatLng) => void;
  onInitialLocationFound: () => void;
}

function LocationMarker({
  onPositionChange,
  onInitialLocationFound,
}: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const hasLocated = useRef(false);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng);
    },
    locationfound(e) {
      if (!hasLocated.current) {
        setPosition(e.latlng);
        onPositionChange(e.latlng);
        map.flyTo(e.latlng, 15);
        onInitialLocationFound();
        hasLocated.current = true;
      }
    },
    locationerror(e) {
      if (!hasLocated.current) {
        toast.error("Could not auto-detect location.");
        console.error("Location error:", e.message);
        hasLocated.current = true;
      }
    },
  });

  useEffect(() => {
    if (!hasLocated.current) {
      map.locate();
    }
  }, [map]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => onPositionChange(e.target.getLatLng()),
      }}
    />
  ) : null;
}

// Main Exported Component
export default function LocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [initialLocationFound, setInitialLocationFound] = useState(false);

  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }
  }, [mapInstance]);

  return (
    <MapContainer
      ref={setMapInstance}
      center={[30.3753, 69.3451]} // Default center of Pakistan
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        onPositionChange={(pos) => onLocationSelect(pos.lat, pos.lng)}
        onInitialLocationFound={() => {
          if (!initialLocationFound) {
            toast.success("Location auto-detected successfully!");
            setInitialLocationFound(true);
          }
        }}
      />
    </MapContainer>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This component is self-contained and focuses on a single responsibility (map-based location picking). It does not need modification for our authentication or verification flow.


"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { LocateFixed, CheckCircle, Loader2 } from "lucide-react"; // Removed AlertCircle, Edit2
import dynamic from "next/dynamic";
import { StylesConfig } from "react-select";
// import { toast } from "react-hot-toast"; // Temporarily unused

// --- FIREBASE IMPORTS (DISABLED) ---
/*
import { auth } from "@/app/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import {
  updateUserPhone,
  checkPhoneVerificationStatus,
} from "@/app/actions/authActions";
*/
// import { isValidPhoneNumber } from "react-phone-number-input";

import AddressInputFields from "./AddressInputFields";
import AddressLocationSelectors from "./AddressLocationSelectors";

// --- Dynamic Import with Loading Skeleton ---
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-75 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <Loader2 className="animate-spin text-gray-400" />
    </div>
  ),
});

export interface ShippingInfo {
  fullName: string;
  phone: string;
  province: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  area: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface NewAddressFormProps {
  shippingInfo: ShippingInfo;
  onShippingInfoChange: (info: ShippingInfo) => void;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
  isPhoneVerified: boolean;
  onPhoneVerified: () => void;
  sessionVerifiedPhone?: string | null;
  onEditPhone: () => void;
}

// Helper to safely access window property
/*
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
*/

export default function NewAddressForm({
  shippingInfo,
  onShippingInfoChange,
  errors,
  isPhoneVerified, // Ye ab hamesha 'true' aayega parent se
  onPhoneVerified,
  sessionVerifiedPhone,
  onEditPhone,
}: NewAddressFormProps) {
  // const { data: session, update } = useSession();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // --- OTP STATES (DISABLED) ---
  /*
  const [otpUiState, setOtpUiState] = useState<
    "idle" | "sending" | "sent" | "verifying"
  >("idle");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  */

  useEffect(() => {
    setIsMounted(true);
    // Initialize Recaptcha only once (DISABLED)
    /*
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-checkout",
        { size: "invisible" }
      );
    }
    */
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShippingInfoChange({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value?: string) => {
    onShippingInfoChange({ ...shippingInfo, phone: value || "" });
  };

  const handleSelectChange = (name: "province" | "city", option: any) => {
    const newInfo = { ...shippingInfo, [name]: option };
    if (name === "province") newInfo.city = null;
    onShippingInfoChange(newInfo);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    onShippingInfoChange({ ...shippingInfo, lat, lng });
  };

  // --- OTP LOGIC (DISABLED) ---
  /*
  const handleSendOtp = async () => { ... };
  const handleVerifyOtp = async () => { ... };
  */

  const getErrorStyles = (hasError: boolean) => {
    return hasError ? "!border-red-500 !ring-red-500" : "";
  };

  const customSelectStyles = (hasError: boolean): StylesConfig => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      borderColor: hasError
        ? "#ef4444"
        : state.isFocused
          ? "#f97316"
          : theme === "dark"
            ? "#4b5563"
            : "#d1d5db",
      minHeight: "42px",
      boxShadow: hasError
        ? "0 0 0 1px #ef4444"
        : state.isFocused
          ? "0 0 0 1px #f97316"
          : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
      "&:hover": {
        borderColor: hasError
          ? "#ef4444"
          : state.isFocused
            ? "#f97316"
            : theme === "dark"
              ? "#6b7280"
              : "#a5b4fc",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f97316"
        : state.isFocused
          ? theme === "dark"
            ? "#374151"
            : "#f3f4f6"
          : "transparent",
      color: "inherit",
      "&:active": { backgroundColor: "#fb923c" },
    }),
    singleValue: (provided) => ({ ...provided, color: "inherit" }),
    input: (provided) => ({ ...provided, color: "inherit" }),
  });

  const inputStyles = `appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm`;

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Recaptcha Container (Ab Zaroorat Nahi) */}
      <div id="recaptcha-container-checkout"></div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Enter a New Address
      </h2>

      <div className="space-y-4">
        <AddressInputFields
          shippingInfo={shippingInfo}
          handleInputChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          inputStyles={inputStyles}
          errors={errors}
          getErrorStyles={getErrorStyles}
          // Input Locked Nahi Hoga (Always False)
          disabled={false}
        />

        <AddressLocationSelectors
          shippingInfo={shippingInfo}
          handleSelectChange={handleSelectChange}
          customSelectStyles={customSelectStyles}
          isMounted={isMounted}
          errors={errors}
        />

        {/* --- VERIFICATION SECTION (MODIFIED) --- */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-4">
          
          {/* Pehle Logic: Agar Verified hai to "Green Box", nahi to "OTP Box" */}
          {/* Ab Hum Sirf ek simple message dikhayenge ya box hi hata denge */}
          
          {/* 
            === OLD VERIFICATION UI (HIDDEN) ===
            Agar wapis on karna ho to yahan ka code uncomment karein 
            aur 'true' wali condition hata dein.
          */}
          
          {/* Naya UI: Sirf Ek Tasalli Wala Message (Optional) */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
             <CheckCircle size={16} />
             <span>Phone verification is currently optional.</span>
          </div>

        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-2"
          >
            <LocateFixed size={16} />{" "}
            {showMap ? "Hide Map" : "Pin Exact Location (Optional)"}
          </button>
          {shippingInfo.lat && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> Location Pinned!
            </p>
          )}
        </div>
        {showMap && isMounted && (
          <div className="mt-3 rounded-lg overflow-hidden border dark:border-gray-600 relative z-0">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useStateContext } from "@/app/context/StateContext";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Loader2, Tag, X } from "lucide-react";
import { toast } from "react-hot-toast";

const inputStyles =
  "appearance-none block w-full rounded-lg border-0 py-3 px-4 text-gray-900 bg-gray-50 dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

interface OrderSummaryProps {
  isMobileView?: boolean;
  isDesktop?: boolean;
}

export default function OrderSummary({ isMobileView = false, isDesktop = false }: OrderSummaryProps) {
  const {
    cartItems,
    subtotal,
    shippingDetails,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
  } = useStateContext();

  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    startTransition(async () => {
      await applyCoupon(couponCode);
      setCouponCode("");
    });
  };

  if (!mounted || cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${isMobileView ? "px-2" : ""}`}>
      
      {!isMobileView && (
        <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-gray-100">
          Order Summary
        </h2>
      )}

      {/* Cart Items List */}
      <div className="space-y-4 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="flex items-start gap-4 pt-4 first:pt-0">
            <div className="relative w-16 h-16 shrink-0 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
              {item.image && (
                <Image
                  src={urlFor(item.image).width(128).height(128).url()}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
              {item.quantity > 1 && (
                  <div className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                      x{item.quantity}
                  </div>
              )}
            </div>
            <div className="grow">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                {item.name}
              </p>
              {item.variant && (
                 <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>
              )}
            </div>
            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 shrink-0">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="pt-2">
        {appliedCoupon ? (
          <div>
            <p className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">Discount Applied</p>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Tag size={16} />
                <span className="font-bold text-sm">{appliedCoupon.code}</span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-green-600"
                aria-label="Remove coupon"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative grow">
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                disabled={isPending}
                className={inputStyles}
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={isPending || !couponCode}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {subtotal.toLocaleString()}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">
              - Rs. {discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Shipping</span>
          {shippingDetails ? (
            <span
              className={`font-medium ${
                // ✅ Logic Updated for Colors
                appliedCoupon?.type === 'freeShipping' || (shippingDetails.isFree && !shippingDetails.isOnCall)
                  ? "text-green-600 dark:text-green-400"
                  : shippingDetails.isOnCall
                      ? "text-brand-secondary"
                      : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {appliedCoupon?.type === "freeShipping"
                ? "FREE"
                : shippingDetails.displayText}
            </span>
          ) : (
            <span className="text-gray-400 italic text-xs">Calculated at next step</span>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
          <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
          <div className="flex items-baseline gap-1">
             <span className="text-xs text-gray-500">PKR</span>
             {shippingDetails ? (
                <span className="text-2xl font-bold text-brand-primary">
                    {grandTotal.toLocaleString()}
                </span>
             ) : (
                <span className="text-xl font-bold text-gray-400 animate-pulse">---</span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
// /src/app/checkout/_components/SavedAddresses.tsx (FINAL & CORRECTED)

"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientAddress } from "@/app/actions/addressActions"; // <-- Import the new, SAFE DTO type
// import { Address } from "@/app/actions/addressActions"; // <-- REMOVED the old type import

// --- Type Definitions for Props ---
interface SavedAddressesProps {
  savedAddresses: ClientAddress[]; // <-- Use the ClientAddress type
  selectedAddressId: string | null;
  onAddressSelect: (address: ClientAddress) => void; // <-- Use the ClientAddress type
}

const VISIBLE_ADDRESS_LIMIT = 2;

// === Main Component ===
export default function SavedAddresses({
  savedAddresses,
  selectedAddressId,
  onAddressSelect,
}: SavedAddressesProps) {
  const [showAll, setShowAll] = useState(false);

  // Memoize sorted addresses for performance
  const sortedAddresses = useMemo(() => {
    return [...savedAddresses].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }, [savedAddresses]);

  const displayedAddresses = showAll
    ? sortedAddresses
    : sortedAddresses.slice(0, VISIBLE_ADDRESS_LIMIT);

  if (!savedAddresses || savedAddresses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Select a Saved Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedAddresses.map((addr) => {
          const isSelected = selectedAddressId === addr._id; // .toString() is no longer needed
          return (
            <div
              key={addr._id} // .toString() is no longer needed
              onClick={() => onAddressSelect(addr)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 
                ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-brand-primary/50"
                }`}
            >
              {isSelected && (
                <CheckCircle
                  size={20}
                  className="absolute top-3 right-3 text-brand-primary"
                />
              )}

              {addr.isDefault && (
                <span className="absolute top-3 left-3 text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}

              <div className={addr.isDefault ? "mt-8" : ""}>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {addr.fullName}
                </p>
                <address className="text-xs text-gray-500 dark:text-gray-400 mt-1 not-italic line-clamp-2">
                  {addr.address}, {addr.area}, {addr.city}
                </address>
              </div>
            </div>
          );
        })}
      </div>

      {sortedAddresses.length > VISIBLE_ADDRESS_LIMIT && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 mx-auto"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            />
            {showAll
              ? "Show Less"
              : `Show ${sortedAddresses.length - VISIBLE_ADDRESS_LIMIT} More`}
          </button>
        </div>
      )}
    </div>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { name: "Shipping", href: "/checkout" },
  { name: "Payment", href: "/checkout/payment" },
];

export default function StepIndicator() {
  const pathname = usePathname();

  let currentStepIndex = STEPS.findIndex((step) =>
    pathname.startsWith(step.href)
  );
  if (pathname.startsWith("/order-success")) {
    currentStepIndex = STEPS.length;
  }

  return (
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="flex items-center w-full">
        {STEPS.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;

          return (
            <li
              key={step.name}
              className={`relative ${stepIdx !== STEPS.length - 1 ? "flex-1" : ""}`}
            >
              {/* Connecting Line */}
              {stepIdx < STEPS.length - 1 ? (
                <div className="absolute inset-0 top-1/2 -translate-y-1/2 left-0 w-full px-2" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                     {/* Highlighted portion */}
                     <div className={`h-full bg-brand-primary transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>
              ) : null}

              {/* Step Circle and Name */}
              <div className="relative flex flex-col items-center group z-10">
                <ConditionalWrapper
                  condition={isCompleted}
                  wrapper={(children) => <Link href={step.href}>{children}</Link>}
                >
                  <span
                    className={`
                    relative flex items-center justify-center rounded-full 
                    transition-all duration-300 shadow-sm
                    /* Mobile: Small Size | Desktop: Normal Size */
                    w-8 h-8 md:w-10 md:h-10
                    ${
                      isCompleted
                        ? "bg-brand-primary text-white"
                        : isCurrent
                          ? "border-2 border-brand-primary bg-white dark:bg-gray-800"
                          : "border-2 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 md:h-5 md:w-5" strokeWidth={3} />
                    ) : isCurrent ? (
                      <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-brand-primary animate-pulse" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </span>
                </ConditionalWrapper>

                {/* Step Name Text */}
                <p
                  className={`
                  mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wider
                  ${
                    isCurrent || isCompleted
                      ? "text-brand-primary"
                      : "text-gray-400 dark:text-gray-500"
                  }
                `}
                >
                  {step.name}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}) => (condition ? wrapper(children) : children);

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toastError } from "@/app/_components/shared/CustomToasts";
import { CreditCard, Truck, Lock } from "lucide-react"; 
import { logUserEvent } from "@/app/actions/trackingActions";

// --- Type Definitions ---
interface Gateway {
  key: string;
  name: string;
  enabled: boolean;
  credentials: any;
}

interface PaymentMethodSelectorProps {
  selectedGateway: string | null;
  onGatewaySelect: (gatewayKey: string) => void;
}

// --- GatewayIcon Component ---
const GatewayIcon = ({
  gatewayKey,
  gatewayName,
  isEnabled, 
}: {
  gatewayKey: string;
  gatewayName: string;
  isEnabled: boolean;
}) => {
  const iconMap: { [key: string]: string } = {
    easypaisa: `/icons/easypaisa.png`,
    jazzcash: `/icons/jazzcash.png`,
    banktransfer: `/icons/bank.svg`,
  };
  const associatedIcons: { [key: string]: string[] } = {
    easypaisa: [
      "/icons/visa.svg",
      "/icons/mastercard.svg",
      "/icons/unionpay.svg",
    ],
    jazzcash: [
      "/icons/visa.svg",
      "/icons/mastercard.svg",
      "/icons/unionpay.svg",
    ],
  };
  const mainIconUrl = iconMap[gatewayKey];
  const cardIcons = associatedIcons[gatewayKey] || [];
  const showText = !mainIconUrl || ["banktransfer", "cod"].includes(gatewayKey);

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left Side: Main Icon + Name */}
      <div className="flex items-center gap-3 font-semibold">
        {mainIconUrl ? (
          <Image
            src={mainIconUrl}
            alt={gatewayName}
            width={gatewayKey === "banktransfer" ? 24 : 80}
            height={24}
            className={`h-6 w-auto object-contain ${!isEnabled ? "grayscale opacity-70" : ""}`}
            unoptimized
          />
        ) : gatewayKey === "cod" ? (
          <Truck size={20} />
        ) : (
          <CreditCard size={20} />
        )}
        {showText && (
          <span className="text-sm font-semibold">{gatewayName}</span>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1.5 opacity-80">
        {isEnabled ? (
          cardIcons.map((icon, index) => (
            <Image
              key={index}
              src={icon}
              alt="Card Icon"
              width={28}
              height={18}
              unoptimized
            />
          ))
        ) : (
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-300 dark:border-gray-600">
             <Lock size={10} />
             <span>Unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
};

// === Main Component ===
export default function PaymentMethodSelector({
  selectedGateway,
  onGatewaySelect,
}: PaymentMethodSelectorProps) {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout/payment";

  useEffect(() => {
    async function fetchGateways() {
      try {
        const response = await fetch("/api/payment/gateways");
        if (!response.ok) throw new Error("Failed to fetch gateways");
        const allGateways: Gateway[] = await response.json();
        setGateways(allGateways);

        // Auto-select logic
        if (!selectedGateway && allGateways.length > 0) {
          const codGateway = allGateways.find((gw) => gw.key === "cod" && gw.enabled);
          const firstEnabled = allGateways.find((gw) => gw.enabled);
          
          if (codGateway) {
             onGatewaySelect(codGateway.key);
          } else if (firstEnabled) {
             onGatewaySelect(firstEnabled.key);
          }
        }
      } catch (error) {
        toastError("Could not load payment options.");
      }
    }
    fetchGateways();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">
        Payment method
      </h2>
      <div className="space-y-3">
        {gateways.length > 0 ? (
          gateways.map((gw) => {
            const isSelected = selectedGateway === gw.key;
            const isEnabled = gw.enabled; 
            
            const hasDetails =
              gw.key === "banktransfer" ||
              gw.key === "easypaisa" ||
              gw.key === "jazzcash";

            return (
              <div
                key={gw.key}
                onClick={() => {
                  if (isEnabled) {
                    const previousGateway = selectedGateway;
                    onGatewaySelect(gw.key);
                    
                    // 🚀 TELEMETRY EVENT: Track Payment Method Selected/Toggle
                    logUserEvent('payment_method_selected', pathname, {
                      selected_method: gw.key,
                      previous_method: previousGateway || "none",
                    });
                  }
                }}
                className={`border rounded-lg overflow-hidden transition-all duration-300 ease-in-out relative
                  ${
                    !isEnabled 
                    ? "opacity-70 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-gray-200 dark:border-gray-700" 
                    : "cursor-pointer"
                  }
                  ${
                    isEnabled && isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/50 bg-white dark:bg-gray-900"
                      : isEnabled 
                        ? "border-gray-300 dark:border-gray-600 hover:border-brand-primary/60 bg-white dark:bg-gray-900" 
                        : ""
                  }`}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    
                    {/* Radio Button */}
                    <div
                      className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected && isEnabled
                          ? "border-brand-primary bg-brand-primary"
                          : "border-gray-400 bg-white dark:bg-gray-700"
                      }`}
                    >
                      {isSelected && isEnabled && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="ml-4 w-full">
                      <GatewayIcon 
                        gatewayKey={gw.key} 
                        gatewayName={gw.name} 
                        isEnabled={isEnabled} 
                      />
                    </div>

                  </div>
                </div>

                {/* Details Section (Only if Enabled & Selected) */}
                <AnimatePresence>
                  {isSelected && isEnabled && hasDetails && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
                    >
                      <div className="p-4 text-sm">
                        {gw.key === "banktransfer" && gw.credentials && (
                          <>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Bank Account Details
                            </h3>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  ACCOUNT TITLE:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.accountTitle}
                                </span>
                              </div>
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  ACCOUNT NO:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.accountNumber}
                                </span>
                              </div>
                              {gw.credentials.iban && (
                                <div className="flex justify-between items-start text-xs sm:text-sm">
                                  <span className="font-medium text-gray-500">
                                    IBAN NO:
                                  </span>
                                  <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                    {gw.credentials.iban}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  BANK NAME:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.bankName}
                                </span>
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                              Important: Please use your Order ID as the
                              reference/comment in your bank transaction.
                            </p>
                          </>
                        )}

                        {(gw.key === "easypaisa" || gw.key === "jazzcash") && (
                          <>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Redirecting to {gw.name}...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              You will be securely redirected to the {gw.name}{" "}
                              payment page to complete your purchase.
                            </p>
                          </>
                        )}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="p-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500">
            Loading payment methods...
          </div>
        )}
      </div>
    </section>
  );
}
// /src/app/checkout/payment/_components/ShippingSummary.tsx

"use client";

import Link from "next/link";
import { Edit3 } from "lucide-react";
import { useStateContext } from "@/app/context/StateContext";

export default function ShippingSummary() {
  const { shippingAddress } = useStateContext();

  if (!shippingAddress) {
    return null; // Agar address na ho to kuch bhi render na karein
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Ship to
        </h2>
        <Link
          href="/checkout"
          className="text-sm text-brand-primary hover:underline flex items-center gap-1.5 font-medium"
        >
          <Edit3 size={14} /> Change
        </Link>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
        <p>
          <span className="font-medium text-gray-500">Contact:</span>{" "}
          {shippingAddress.email}, {shippingAddress.phone}
        </p>
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        <address className="text-gray-600 dark:text-gray-300 not-italic">
          <span className="font-medium text-gray-500">Address:</span>{" "}
          {shippingAddress.address}, {shippingAddress.area},{" "}
          {shippingAddress.city}
        </address>
      </div>
    </section>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Componentization (Rule #5):** Hum ne `payment/page.tsx` ke ek hissay ko alag karke ek naya, single-responsibility component (`ShippingSummary`) banaya hai.
// - **Decoupling:** Yeh component apna data direct `useStateContext` se leta hai, jis se yeh `payment/page.tsx` par bojh nahi banta.


// src/app/checkout/payment/page.tsx (UPGRADED WITH REDIRECTION VISIBILITY LATENCY TRACKER)

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { toastError } from "@/app/_components/shared/CustomToasts";
import { Loader2, ShieldCheck } from "lucide-react";

import ShippingSummary from "./_components/ShippingSummary";
import PaymentMethodSelector from "./_components/PaymentMethodSelector";
import { logUserEvent } from "@/app/actions/trackingActions";

export default function PaymentPage() {
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout/payment";
  
  const { cartItems, grandTotal, shippingAddress, appliedCoupon } = useStateContext();

  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 🚀 Gap #48: Tracking external redirect latency via browser tab focus states
  const redirectTimestamp = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!shippingAddress) {
        router.replace("/checkout");
      } else if (
        cartItems.length === 0 &&
        !window.location.pathname.startsWith("/order-success")
      ) {
        router.replace("/cart");
      }
    }
  }, [shippingAddress, cartItems, router]);

  // 🚀 Gap #48 listener: Tracks focus behaviors on return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && redirectTimestamp.current) {
        const outOfTabDuration = Date.now() - redirectTimestamp.current;
        // Logs how long user was absent on redirect portal before returning or failing
        logUserEvent('form_field_interaction', pathname, {
          field_id: 'redirection_tab_loss',
          interaction_type: 'tab_regained_focus',
          absent_duration_ms: outOfTabDuration
        });
        redirectTimestamp.current = null; // Clear timer
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !selectedGateway) {
      toastError("Please select a payment method.");
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'payment_method_missing',
        error_message: 'Please select a payment method.'
      });
      return;
    }
    setIsProcessing(true);
    let orderId = "";

    try {
      // Step 1: Create Order
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          cartItems,
          totalPrice: grandTotal,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.message || "Failed to create order.");

      orderId = orderData.orderId;

      // Step 2: Initiate Payment
      const paymentRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, gatewayKey: selectedGateway }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok)
        throw new Error(paymentData.message || "Payment initiation failed.");

      // Step 3: Handle Response & Redirect
      if (paymentData.redirectUrl) {
        // External Gateway (Stripe, Easypaisa, Jazzcash, etc.)
        
        await logUserEvent('gateway_redirect_initiated', pathname, {
          orderId: orderId,
          selected_gateway: selectedGateway,
          redirect_destination: paymentData.redirectUrl
        });

        // 🚀 Set timestamp for visibility latency tracking (Gap #48)
        redirectTimestamp.current = Date.now();
        
        window.location.href = paymentData.redirectUrl;
      } else if (paymentData.success) {
        // Internal Gateways (COD, Bank Transfer)
        const verifyRes = await fetch(
          `/api/payment/verify/${selectedGateway}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, ...paymentData.data }),
          }
        );

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success && verifyData.redirectUrl) {
          window.location.href = verifyData.redirectUrl;
        } else {
          throw new Error(
            verifyData.message || "Failed to finalize your order."
          );
        }
      } else {
        throw new Error("An unknown error occurred during payment initiation.");
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toastError(
        error.message || "An unexpected error occurred.",
        "Order Failed"
      );
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'order_placement_failed',
        error_message: error.message || 'Unknown network or database transaction failure during place order step.'
      });

      setIsProcessing(false);
    }
  };

  if (!shippingAddress || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-75">
        <Loader2 className="animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ShippingSummary />

      <PaymentMethodSelector
        selectedGateway={selectedGateway}
        onGatewaySelect={setSelectedGateway}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck size={16} />
          <span>Secure SSL Encrypted Payment</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedGateway}
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            `Pay Rs. ${grandTotal.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
}


"use client";

import { createContext, useContext, ReactNode } from "react";
import { ClientAddress } from "@/app/actions/addressActions";

// Defines the shape of the data that this context will provide.
interface CheckoutContextType {
  savedAddresses: ClientAddress[];
  // ADDED: User's phone number from the session
  userPhone: string | null;
  // ADDED: Whether the user's phone is verified
  isUserPhoneVerified: boolean;
}

// Create the context with default values.
const CheckoutContext = createContext<CheckoutContextType>({
  savedAddresses: [],
  userPhone: null,
  isUserPhoneVerified: false,
});

// The provider component that will wrap our checkout pages.
// It receives server-fetched data as props and makes it available to its children.
export const CheckoutProvider = ({
  children,
  savedAddresses,
  userPhone,
  isUserPhoneVerified,
}: {
  children: ReactNode;
  savedAddresses: ClientAddress[];
  userPhone: string | null;
  isUserPhoneVerified: boolean;
}) => {
  return (
    <CheckoutContext.Provider value={{ savedAddresses, userPhone, isUserPhoneVerified }}>
      {children}
    </CheckoutContext.Provider>
  );
};

// A custom hook to easily access the context's value in client components.
export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error(
      "useCheckoutContext must be used within a CheckoutProvider"
    );
  }
  return context;
};
//layout.tsx
import React from "react";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { CheckoutProvider } from "./CheckoutContext";
import OrderSummary from "./_components/OrderSummary";
import StepIndicator from "./_components/StepIndicator";
import type { Metadata } from "next";
import connectMongoose from "@/app/lib/mongoose";
import User, { IAddress } from "@/models/User";
import { ClientAddress } from "@/app/actions/addressActions";
import CheckoutMobileSummary from "./_components/CheckoutMobileSummary";
import Link from "next/link"; 
import Image from "next/image"; 
import { ChevronLeft } from "lucide-react"; 

export const metadata: Metadata = {
  title: "Checkout | PocketValue",
  robots: { index: false, follow: false },
};

async function getUserAddresses(userId: string): Promise<ClientAddress[]> {
  try {
    await connectMongoose();
    const user = await User.findById(userId).select("addresses").lean<{ addresses?: IAddress[] }>();
    if (!user || !user.addresses) return [];
    
    return user.addresses.map((addr) => ({
      _id: addr._id.toString(),
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      area: addr.area,
      address: addr.address,
      isDefault: addr.isDefault,
      lat: addr.lat || null,
      lng: addr.lng || null,
    }));
  } catch (error) {
    console.error("Failed to fetch user addresses for checkout:", error);
    return []; 
  }
}

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); 
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const addresses = await getUserAddresses(session.user.id);
  const userPhone = session.user.phone || null;

  // === 🔴 TEMP MODIFICATION: FIREBASE BYPASS ===
  // Humne system ko force kar diya hai ke wo samjhe user verified hai.
  // Jab Firebase wapis on karna ho, to niche wali line uncomment karein aur 'true' hata dein.

  // ORIGINAL CODE (Saved for later):
  // const isUserPhoneVerified = !!session.user.phoneVerified;

  // NEW CODE (Bypass Mode):
  const isUserPhoneVerified = true; 
  // ==============================================


  return (
    <CheckoutProvider
      savedAddresses={addresses}
      userPhone={userPhone}
      isUserPhoneVerified={isUserPhoneVerified}
    >
      <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* === HEADER (NAVIGATION + STEPS) === */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            
            {/* === 📱 MOBILE LAYOUT (Stack) === */}
            <div className="md:hidden flex flex-col gap-8">
                {/* Row 1: Back Button & Logo */}
                <div className="relative flex items-center justify-center w-full">
                    {/* Absolute Back Button */}
                    <Link href="/cart" className="absolute left-0 p-2 -ml-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <ChevronLeft size={22} />
                    </Link>
                    
                    {/* Centered Logo */}
                 <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative h-14 w-14">
                        <Image src="/usamabrand.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-sans font-bold text-gray-900 dark:text-white ">
                            PocketValue
                        </span>
                        <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase leading-none">
                            Secure Checkout
                        </span>
                    </div>
                </Link>

                </div>

                {/* Row 2: Steps (Full Width) */}
                <div className="w-full px-4">
                    <StepIndicator />
                </div>
            </div>

            {/* === 🖥️ DESKTOP LAYOUT (Row) === */}
            <div className="hidden md:flex items-center justify-between gap-8">
                
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative h-20 w-20">
                        <Image src="/usamabrand.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white text-2xl font-sans font-bold leading-none">
                            PocketValue
                        </span>
                        <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">
                            Secure Checkout
                        </span>
                    </div>
                </Link>

                {/* Center: Step Indicator */}
                <div className="flex-1 max-w-md mx-auto">
                    <StepIndicator />
                </div>

                {/* Right: Return to Cart */}
                <Link href="/cart" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-primary transition-colors shrink-0">
                    <ChevronLeft size={16} />
                    Return to Cart
                </Link>

            </div>
          </div>
        </div>
        
        {/* === MOBILE ONLY: ACCORDION SUMMARY === */}
        <div className="lg:hidden">
          <CheckoutMobileSummary />
        </div>

        {/* === MAIN CONTENT === */}
        <div className="max-w-none mx-auto lg:px-8 xl:px-16 2xl:px-24">
          <div className="bg-white dark:bg-gray-800 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200 dark:lg:divide-gray-700 lg:shadow-lg lg:rounded-xl lg:my-12">
            {/* Left Column: Form */}
            <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>

            {/* Right Column: Order Summary (DESKTOP ONLY) */}
            <div className="hidden lg:block px-4 py-8 sm:px-6 lg:px-8 lg:py-12 bg-gray-50/50 dark:bg-gray-800/50 lg:bg-transparent dark:lg:bg-transparent border-t lg:border-t-0 border-gray-200 dark:border-gray-700">
              <div className="lg:sticky lg:top-24">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>
    </CheckoutProvider>
  );
}

// /src/app/checkout/page.tsx (VERIFIED - NO CHANGES NEEDED)

import type { Metadata } from "next";
import CheckoutForm from "./_components/CheckoutForm"; // Imports the interactive client component

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

// src/app/checkout/_components/CheckoutForm.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStateContext } from "@/app/context/StateContext";
import { useCheckoutContext } from "../CheckoutContext";
import { toast } from "react-hot-toast";
import { ArrowRight, Plus, Loader2 } from "lucide-react";
import { ClientAddress, saveAddress } from "@/app/actions/addressActions";
import { logUserEvent } from "@/app/actions/trackingActions"; // 🚀 Telemetry import

import SavedAddresses from "./SavedAddresses";
import NewAddressForm, { ShippingInfo } from "./NewAddressForm";

// === CONSTANTS ===
const emptyAddressState: ShippingInfo = {
  fullName: "",
  phone: "",
  province: null,
  city: null,
  area: "",
  address: "",
  lat: null,
  lng: null,
};

// === MAIN COMPONENT ===
export default function CheckoutForm() {
  const {
    savedAddresses,
    hasSavedAddresses,
    selectedAddressId,
    showNewAddressForm,
    shippingInfo,
    setShippingInfo,
    formErrors,
    isPending,
    saveNewAddress,
    setSaveNewAddress,
    handleAddressSelect,
    handleShowNewForm,
    handleFormSubmit,
    setIsPhoneVerified, 
  } = useCheckoutLogic();

  // Button disabled logic remains unchanged
  const isButtonDisabled =
    isPending ||
    !shippingInfo.fullName ||
    !shippingInfo.phone ||
    !shippingInfo.address ||
    !shippingInfo.city ||
    !shippingInfo.province; 

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      
      {/* 1. SAVED ADDRESSES SECTION */}
      {hasSavedAddresses && (
        <>
          <SavedAddresses
            savedAddresses={savedAddresses || []}
            selectedAddressId={selectedAddressId}
            onAddressSelect={handleAddressSelect}
          />
          <div className="relative flex items-center my-6">
            <div className="grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="shrink mx-4 text-xs text-gray-400 dark:text-gray-500 uppercase">
              Or
            </span>
            <div className="grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          {!showNewAddressForm && (
            <div>
              <button
                type="button"
                onClick={handleShowNewForm}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} /> Add a New Shipping Address
              </button>
            </div>
          )}
        </>
      )}

      {/* 2. NEW ADDRESS FORM SECTION */}
      {(!hasSavedAddresses || showNewAddressForm) && (
        <>
          <NewAddressForm
            shippingInfo={shippingInfo}
            onShippingInfoChange={setShippingInfo}
            errors={formErrors}
            isPhoneVerified={true} 
            onPhoneVerified={() => setIsPhoneVerified(true)}
            sessionVerifiedPhone={shippingInfo.phone} 
            onEditPhone={() => {}} 
          />

          <div className="flex items-center mt-4">
            <input
              id="save-address"
              name="save-address"
              type="checkbox"
              checked={saveNewAddress}
              onChange={(e) => setSaveNewAddress(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <label
              htmlFor="save-address"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer"
            >
              Save this address for future orders
            </label>
          </div>
        </>
      )}

      {/* 3. SUBMIT BUTTON */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          type="submit"
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white text-base font-bold rounded-lg shadow-md transition-all duration-300 hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
          disabled={isButtonDisabled}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <span>Continue to Payment</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// =========================================================
// CUSTOM HOOK: SAARI LOGIC WITH INCORPORATED TELEMETRY
// =========================================================

function useCheckoutLogic() {
  const router = useRouter();
  const { data: session } = useSession();
  const { shippingAddress: persistedAddress, setShippingAddress } = useStateContext();
  const { savedAddresses, userPhone } = useCheckoutContext();

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout";

  // 🚀 TELEMETRY EVENT: Step 1 Progression Logged on Mount
  useEffect(() => {
    logUserEvent('checkout_step_view', pathname, { step_name: 'shipping_address' });
  }, [pathname]);

  // Memoized Initial Address
  const getInitialAddress = useMemo(() => {
    if (persistedAddress) {
      return (
        savedAddresses?.find(
          (addr) =>
            addr.address === persistedAddress.address &&
            addr.city === persistedAddress.city
        ) || null
      );
    }
    return savedAddresses?.find((addr) => addr.isDefault) || savedAddresses?.[0] || null;
  }, [persistedAddress, savedAddresses]);

  const hasSavedAddresses = savedAddresses && savedAddresses.length > 0;

  // States
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(getInitialAddress?._id || null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(!getInitialAddress);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(emptyAddressState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShippingInfo, boolean>>>({});
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load Initial Data
  useEffect(() => {
    const addressToLoad = persistedAddress
      ? {
          ...persistedAddress,
          province: persistedAddress.province ? { value: persistedAddress.province, label: persistedAddress.province } : null,
          city: persistedAddress.city ? { value: persistedAddress.city, label: persistedAddress.city } : null,
        }
      : getInitialAddress
        ? {
            ...getInitialAddress,
            province: { value: getInitialAddress.province, label: getInitialAddress.province },
            city: { value: getInitialAddress.city, label: getInitialAddress.city },
          }
        : emptyAddressState;

    setShippingInfo(addressToLoad as ShippingInfo);
  }, [getInitialAddress?._id, persistedAddress]);

  // Phone change auto-verifier
  useEffect(() => {
    if (shippingInfo.phone && shippingInfo.phone.length > 5) {
        setIsPhoneVerified(true);
    }
  }, [shippingInfo.phone]);

  // Validation Logic
  const validateForm = () => {
    const errors: Partial<Record<keyof ShippingInfo, boolean>> = {};
    if (!shippingInfo.fullName.trim()) errors.fullName = true;
    if (!shippingInfo.phone) errors.phone = true;
    if (!shippingInfo.address.trim()) errors.address = true;
    if (!shippingInfo.city) errors.city = true;
    if (!shippingInfo.province) errors.province = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleAddressSelect = (address: ClientAddress) => {
    setSelectedAddressId(address._id);
    setShowNewAddressForm(false);
    setShippingInfo({
      fullName: address.fullName,
      phone: address.phone,
      province: { value: address.province, label: address.province },
      city: { value: address.city, label: address.city },
      area: address.area,
      address: address.address,
      lat: address.lat || null,
      lng: address.lng || null,
    });
    setFormErrors({});
    setIsPhoneVerified(true);
  };

  const handleShowNewForm = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    setShippingInfo({
      ...emptyAddressState,
      fullName: session?.user?.name || "",
      phone: userPhone || "",
    });
    setIsPhoneVerified(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    // 🚀 TELEMETRY EVENT: Form fields validation failure tracked
    if (!validateForm()) {
      toast.error("Please fill all required address fields.");
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'form_validation',
        error_message: 'Please fill all required address fields.'
      });
      return;
    }

    const userEmail = session?.user?.email;
    // 🚀 TELEMETRY EVENT: Session logouts/failures tracked mid-checkout
    if (!userEmail) {
      toast.error("Authentication error. Please log in again.");
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'auth_error',
        error_message: 'Authentication error. Session email is missing.'
      });
      return;
    }

    const finalAddress = {
      fullName: shippingInfo.fullName,
      email: userEmail,
      phone: shippingInfo.phone,
      province: shippingInfo.province?.value || "",
      city: shippingInfo.city?.value || "",
      area: shippingInfo.area,
      address: shippingInfo.address,
      lat: shippingInfo.lat,
      lng: shippingInfo.lng,
    };

    setShippingAddress(finalAddress);

    startTransition(async () => {
      if ((!hasSavedAddresses || showNewAddressForm) && saveNewAddress) {
        const { email, ...addressToSave } = finalAddress;
        const result = await saveAddress(addressToSave, false); 
        if (result.success) {
          toast.success("Address saved to your profile!");
        }
      }
      router.push("/checkout/payment");
    });
  };

  return {
    savedAddresses,
    hasSavedAddresses,
    selectedAddressId,
    showNewAddressForm,
    shippingInfo,
    setShippingInfo,
    formErrors,
    isPhoneVerified,
    isPending,
    saveNewAddress,
    setSaveNewAddress,
    handleAddressSelect,
    handleShowNewForm,
    handleFormSubmit,
    setIsPhoneVerified,
  };
}

// src/app/context/hooks/useCheckout.ts
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { getShippingRulesAction } from '@/app/actions/checkout/shippingActions';
import { calculateShipping, ShippingCalculation } from '@/app/lib/checkout/shipping-calculator';
import { ShippingRule } from '@/types';
import { CleanCartItem } from '@/sanity/types/product_types';
import { toastSuccess, toastError } from '@/app/_components/shared/CustomToasts';
import { logUserEvent } from '@/app/actions/telemetry/trackingActions';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface AppliedCoupon {
  code: string;
  amount: number;
  type: 'percentage' | 'fixed' | 'freeShipping';
  value?: number;
  maximumDiscount?: number;
}

const calculateOptimisticDiscount = (subtotal: number, coupon: AppliedCoupon): number => {
    if (coupon.type === 'freeShipping') return 0;

    let discountAmount = 0;
    if (coupon.type === 'percentage' && coupon.value) {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
        }
    } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(coupon.value || 0, subtotal);
    }
    return Math.round(discountAmount);
};

// Helper function to read client-side cookies safely
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to delete client-side cookies safely
function deleteCookie(name: string) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}

export function useCheckout(subtotal: number, cartItems: CleanCartItem[]) {
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  
  const isInitialMount = useRef(true);
  const loggedProximityRef = useRef<number | null>(null); // Prevents redundant threshold logs
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout";

  // 1. Load Data with dynamic Auto-Coupon application checks
  useEffect(() => {
    async function loadData() {
        const rules = await getShippingRulesAction();
        setShippingRules(rules);

        if (typeof window !== "undefined") {
            try {
                const addressData = localStorage.getItem("PocketValue_shippingAddress");
                if (addressData) setShippingAddressState(JSON.parse(addressData));
                
                const couponData = localStorage.getItem("PocketValue_coupon");
                let activeCoupon = null;

                if (couponData) {
                  activeCoupon = JSON.parse(couponData);
                  setAppliedCoupon(activeCoupon);
                }

                // AUTO-APPLY LOGIC: If a campaign persistent cookie exists, apply it in background
                const autoAppliedCode = getCookie("pv_auto_coupon");
                if (autoAppliedCode && !activeCoupon && subtotal > 0) {
                    deleteCookie("pv_auto_coupon"); 
                    
                    const applyResult = await applyCoupon(autoAppliedCode);
                    if (applyResult && applyResult.success) {
                      logUserEvent('coupon_auto_applied', pathname, {
                        code: autoAppliedCode,
                        subtotal: subtotal
                      });
                    }
                }
            } catch (error) {
                console.error("Failed to parse checkout data", error);
            }
        }
    }
    loadData();
  }, [subtotal]);

  // 2. Persistence with custom RTO Risk Analysis check on Address update (Gap #32)
  const setShippingAddress = (address: ShippingAddress | null) => {
    setShippingAddressState(address);
    if (address) {
      localStorage.setItem("PocketValue_shippingAddress", JSON.stringify(address));

      // =================================================================
      // 🚀 GAP #32: ADAPTIVE RTO (Return to Origin) RISK ANALYSIS ENGINE
      // =================================================================
      const riskReasons: string[] = [];
      
      // Verification 1: Phone length check (Pakistan formats validation)
      const cleanPhone = address.phone.replace(/\D/g, "");
      if (cleanPhone.length !== 11 && !address.phone.startsWith("+")) {
        riskReasons.push("invalid_phone_number_length");
      }
      
      // Verification 2: Suspicious/Fake name structure check (Short or contains numbers)
      const cleanName = address.fullName.trim();
      if (cleanName.length < 3) {
        riskReasons.push("name_suspiciously_short");
      }
      if (/^[0-9\W]+$/.test(cleanName)) {
        riskReasons.push("name_contains_illegal_characters");
      }

      // Verification 3: Address structural completeness parameters (Too short)
      if (address.address.trim().length < 10) {
        riskReasons.push("incomplete_shipping_street_address");
      }

      // If at least one risk metric is met, log secure RTO Alert
      if (riskReasons.length > 0) {
        logUserEvent('rto_risk_flagged', pathname, {
          rto_reasons: riskReasons,
          shipping_city: address.city,
          shipping_province: address.province,
          is_high_risk: riskReasons.length >= 2 // High risk if 2 or more metrics triggered
        });
        console.log(`⚠️ [RTO Risk Alert] Sourcing address has triggered ${riskReasons.length} risk metrics.`);
      }
      // =================================================================
    } else {
      localStorage.removeItem("PocketValue_shippingAddress");
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("PocketValue_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("PocketValue_coupon");
    }
  }, [appliedCoupon]);

  // =================================================================
  // 🚀 GAP #27: FREE SHIPPING DELIVERY THRESHOLD PROXIMITY ENGINE
  // =================================================================
  useEffect(() => {
    if (shippingRules.length === 0 || subtotal <= 0) return;

    // Dynamically locate the free shipping rule (where cost === 0)
    const freeShippingRule = shippingRules.find(rule => rule.cost === 0 && !rule.isOnCall);
    if (!freeShippingRule) return;

    const proximityAmount = freeShippingRule.minAmount - subtotal;

    // If customer is within Rs. 500 proximity of free shipping, trigger telemetry nudge
    if (proximityAmount > 0 && proximityAmount <= 500) {
      if (loggedProximityRef.current !== proximityAmount) {
        logUserEvent('shipping_threshold_proximity', pathname, {
          remaining_to_free_shipping: proximityAmount,
          current_subtotal: subtotal,
          free_shipping_minimum: freeShippingRule.minAmount
        });
        loggedProximityRef.current = proximityAmount; // Prevents redundant event spamming
      }
    } else {
      loggedProximityRef.current = null;
    }
  }, [subtotal, shippingRules, pathname]);
  // =================================================================

  // 3. Derived State
  const { shippingDetails, discountAmount, grandTotal } = useMemo(() => {
    let details: ShippingCalculation = { cost: 0, displayText: "Calculating...", isFree: false };
    let finalDiscount = 0;
    let finalTotal = 0;

    if (shippingRules.length === 0 && subtotal > 0) {
        return { shippingDetails: { cost: -1, displayText: "...", isFree: false }, discountAmount: 0, grandTotal: subtotal };
    }

    const baseShipping = (subtotal > 0)
        ? calculateShipping(subtotal, shippingRules)
        : { cost: 0, displayText: "FREE", isFree: true, ruleName: 'empty_cart' };

    let monetaryDiscount = 0;
    let shippingDiscount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'freeShipping') {
        shippingDiscount = baseShipping.cost; 
      } else {
        monetaryDiscount = calculateOptimisticDiscount(subtotal, appliedCoupon);
      }
    }
    
    finalDiscount = monetaryDiscount + shippingDiscount;

    const finalShippingCost = baseShipping.cost - shippingDiscount;
    let finalDisplayText = "FREE";
    
    if (baseShipping.isOnCall) {
        finalDisplayText = baseShipping.displayText;
    } else {
        finalDisplayText = finalShippingCost > 0 ? `Rs. ${finalShippingCost.toLocaleString()}` : "FREE";
    }

    details = { 
        ...baseShipping, 
        cost: finalShippingCost, 
        displayText: finalDisplayText, 
        isFree: finalShippingCost === 0,
    };

    const totalCalc = subtotal - monetaryDiscount + finalShippingCost;
    finalTotal = totalCalc > 0 ? Math.round(totalCalc) : 0;

    return { shippingDetails: details, discountAmount: finalDiscount, grandTotal: finalTotal };

  }, [subtotal, appliedCoupon, shippingRules]);


  // 4. Coupon Handlers
  const applyCoupon = async (code: string) => {
    const response = await fetch("/api/verify-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cart: { items: cartItems, subtotal } }),
    });
    const result = await response.json();
    
    if (result.success) {
      setAppliedCoupon(result.finalDiscount);
      toastSuccess(result.message);

      logUserEvent('coupon_applied', pathname, {
        code: code,
        status: 'success',
        amount: result.finalDiscount?.amount || 0,
        discount_type: result.finalDiscount?.type || 'unknown'
      });

    } else {
      setAppliedCoupon(null);
      toastError(result.message);

      logUserEvent('coupon_applied', pathname, {
        code: code,
        status: 'failed',
        error_message: result.message || 'Invalid coupon code.'
      });
    }
    return result;
  };

  const removeCoupon = () => {
    const previousCode = appliedCoupon?.code;
    setAppliedCoupon(null);
    toastError("Your coupon has been removed.", "Coupon Removed");

    if (previousCode) {
      logUserEvent('coupon_removed', pathname, {
        code: previousCode,
      });
    }
  };
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const revalidate = async () => {
      if (!appliedCoupon) return;
      const result = await fetch("/api/verify-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedCoupon.code, cart: { items: cartItems, subtotal } }),
      });
      const data = await result.json();
      
      if(!data.success) {
        setAppliedCoupon(null);
        toastError(data.message, `Coupon "${appliedCoupon.code}" Removed`);

        logUserEvent('coupon_removed', pathname, {
          code: appliedCoupon.code,
          auto_removed: true,
          reason: data.message || 'Cart mutations invalidated requirements.'
        });
      }
    };

    const handler = setTimeout(revalidate, 1000);
    return () => clearTimeout(handler);
  }, [subtotal, cartItems]); 

  const clearCheckoutState = () => {
    setShippingAddressState(null);
    setAppliedCoupon(null);
  };

  return {
    shippingAddress,
    setShippingAddress, // ✅ Maps upgraded RTO wrapper safely
    shippingDetails,
    appliedCoupon,
    discountAmount,
    grandTotal,
    applyCoupon,
    removeCoupon,
    clearCheckoutState,
  };
}

// /src/app/context/hooks/useWishlist.ts (FIXED & TRACKING ENABLED)

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SanityProduct, { CleanWishlistItem } from '@/sanity/types/product_types';
import { toastSuccess, toastError } from '@/app/_components/shared/CustomToasts';
import { logUserEvent } from '@/app/actions/telemetry/trackingActions';

export function useWishlist() {
  const { data: session } = useSession();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState<CleanWishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Flag to prevent data wipe

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const wishlistData = localStorage.getItem("PocketValue_wishlist");
        if (wishlistData) {
          setWishlistItems(JSON.parse(wishlistData));
        }
      } catch (error) {
        console.error("Failed to parse wishlist data from localStorage", error);
      } finally {
        setIsLoaded(true); // Data load hone ke baad hi flag true hoga
      }
    }
  }, []);

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    // FIX: Sirf tab save karo jab initial load complete ho chuka ho
    if (isLoaded) {
      localStorage.setItem("PocketValue_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const handleAddToWishlist = (product: SanityProduct) => {
    if (!session) {
      toastError("Please log in to manage your wishlist.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return;
    }

    const isAlreadyInWishlist = wishlistItems.some(item => item._id === product._id);
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

    if (isAlreadyInWishlist) {
      const updatedWishlist = wishlistItems.filter(item => item._id !== product._id);
      setWishlistItems(updatedWishlist);

      // 🚀 TELEMETRY EVENT: Track Wishlist Removal cleanly
      logUserEvent('wishlist_remove', pathname, {
        productId: product._id,
        name: product.title,
      });

      toastError(`${product.title} removed from wishlist.`, "Wishlist Updated");
    } else {
      const defaultVariant = product.defaultVariant;
      const price = defaultVariant.salePrice ?? defaultVariant.price;
      const image = defaultVariant.images?.[0];

      if (!image) {
        toastError("Could not add item to wishlist. Image is missing.");
        return;
      }

      const newWishlistItem: CleanWishlistItem = {
        _id: product._id,
        name: product.title,
        price: price,
        slug: product.slug,
        image: image,
      };
      
      setWishlistItems(prev => [...prev, newWishlistItem]);

      // 🚀 TELEMETRY EVENT: Track Wishlist Addition with Price context
      logUserEvent('wishlist_add', pathname, {
        productId: product._id,
        name: product.title,
        price: price,
      });

      toastSuccess(`${product.title} added to wishlist!`, "Wishlist Updated");
    }
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return {
    wishlistItems,
    handleAddToWishlist,
    clearWishlist,
  };
}
// /src/app/actions/authActions.ts (FINAL UPGRADE FOR "PROGRESSIVE VERIFICATION")

"use server";

import crypto from 'crypto';
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import connectMongoose from "@/app/lib/checkout/mongoose";
import User from "@/models/User";
import { 
  RequestPasswordResetSchema, 
  ResetPasswordSchema, 
  VerifyEmailSchema,
  UpdatePhoneSchema 
} from "@/app/lib/zodSchemas";

// Email template imports
import { createVerificationEmailHtml } from '@/email_templates/emailVerificationEmail';
import { createPasswordResetHtml } from '@/email_templates/passwordResetEmail';
import { createWelcomeEmailHtml } from '@/email_templates/welcomeEmail';
import { auth } from '../../auth';

const EMAIL_FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`;

// === requestPasswordReset (No changes) ===
export async function requestPasswordReset(email: string) {
    const validatedFields = RequestPasswordResetSchema.safeParse({ email });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail } = validatedFields.data;

    try {
        await connectMongoose();
        const user = await User.findOne({ email: validatedEmail });

        if (!user) {
            return { success: true, message: "If an account with that email exists, a reset link has been sent." };
        }
        
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
        
        try {
            const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!), auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! } });
            const emailHtml = createPasswordResetHtml({ customerName: user.name, resetLink: resetUrl });
            await transporter.sendMail({ from: EMAIL_FROM, to: user.email, subject: 'Reset Your PocketValue Password', html: emailHtml });
        } catch (emailError) {
            console.error("CRITICAL: FAILED to send password reset email:", emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return { success: false, message: "Could not send the reset email." };
        }

        return { success: true, message: "If an account with that email exists, a reset link has been sent." };

    } catch (error) {
        console.error("CRITICAL ERROR in requestPasswordReset function:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === resetPassword (No changes) ===
export async function resetPassword(token: string, newPassword: string) {
    const validatedFields = ResetPasswordSchema.safeParse({ token, newPassword });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { token: validatedToken, newPassword: validatedPassword } = validatedFields.data;

    try {
        const hashedToken = crypto.createHash("sha256").update(validatedToken).digest("hex");
        await connectMongoose();
        
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });
        
        if (!user) { 
            return { success: false, message: "This token is invalid or has expired." }; 
        }
        
        user.password = await bcrypt.hash(validatedPassword, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save();
        
        return { success: true, message: "Your password has been reset successfully!" };
    } catch (error) {
        console.error("Reset Password Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === getEmailFromToken (No changes) ===
export async function getEmailFromToken(token: string): Promise<string | null> {
    if (!token) return null;
    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        await connectMongoose();
        
        const user = await User.findOne({ passwordResetToken: hashedToken })
            .select("email")
            .lean<{ email: string }>();

        return user ? user.email : null;
    } catch {
        return null;
    }
}

// === verifyUserEmail (No changes) ===
export async function verifyUserEmail(email: string, otp: string) {
    const validatedFields = VerifyEmailSchema.safeParse({ email, otp });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail, otp: validatedOtp } = validatedFields.data;

    try {
        await connectMongoose();
        const user = await User.findOne({ 
            email: validatedEmail,
            verificationOtp: validatedOtp,
            verificationOtpExpires: { $gt: new Date() }
        });
        if (!user) {
            return { success: false, message: "The OTP is invalid or has expired." };
        }
        user.emailVerified = new Date();
        user.verificationOtp = undefined;
        user.verificationOtpExpires = undefined;
        await user.save();
        await sendWelcomeEmail(user.name, user.email);
        return { success: true, message: "Email verified successfully! Welcome aboard." };
    } catch (error) {
        console.error("Email Verification Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === sendWelcomeEmail (Helper Function - No changes) ===
async function sendWelcomeEmail(name: string, email: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!),
            auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
        });
        const emailHtml = createWelcomeEmailHtml({ customerName: name });
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `Welcome to the PocketValue Family, ${name}!`,
            html: emailHtml,
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
        console.error(`Failed to send welcome email to ${email}:`, emailError);
    }
}


// === updateUserPhone (CRITICAL UPDATE) ===
// This function will now be called from the Checkout form after a successful OTP.
export async function updateUserPhone(email: string, phone: string): Promise<{ success: boolean; message: string; }> {
    const validatedFields = UpdatePhoneSchema.safeParse({ email, phone });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail, phone: validatedPhone } = validatedFields.data;

    try {
        await connectMongoose();

        // Check if this phone number is already in use by another verified user
        const existingPhoneUser = await User.findOne({ phone: validatedPhone, phoneVerified: { $ne: null } });
        if (existingPhoneUser && existingPhoneUser.email !== validatedEmail) {
            return { success: false, message: "This phone number is already associated with another account." };
        }

        const user = await User.findOne({ email: validatedEmail });
        if (!user) {
            return { success: false, message: "Could not find a user with that email to update." };
        }

        user.phone = validatedPhone;
        user.phoneVerified = new Date(); // Set the verification timestamp
        await user.save();

        return { success: true, message: "Phone number verified successfully!" };
    } catch (error) {
        console.error("Update User Phone Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === NEW HELPER ACTION: CHECK IF PHONE IS VERIFIED DIRECTLY FROM DB ===
export async function checkPhoneVerificationStatus(phoneToCheck: string): Promise<boolean> {
    try {
        const session = await auth();
        if (!session?.user?.email) return false;

        await connectMongoose();
        const user = await User.findOne({ email: session.user.email });
        
        if (!user || !user.phone || !user.phoneVerified) {
            return false;
        }

        // Compare stored phone with checked phone (Last 10 digits logic)
        const dbPhone = user.phone.replace(/\D/g, '');
        const inputPhone = phoneToCheck.replace(/\D/g, '');

        return dbPhone.slice(-10) === inputPhone.slice(-10);

    } catch (error) {
        console.error("Error checking phone status:", error);
        return false;
    }
}
// === resendVerificationEmail (No changes needed, already solid) ===
export async function resendVerificationEmail(email: string) {
    const validatedFields = RequestPasswordResetSchema.safeParse({ email });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail } = validatedFields.data;
    
    try {
        await connectMongoose();
        const user = await User.findOne({ email: validatedEmail });
        if (!user) return { success: false, message: "Could not find a user with that email." };
        if (user.emailVerified) return { success: false, message: "This email is already verified." };

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOtp = newOtp;
        user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!), auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! } });
            const emailHtml = createVerificationEmailHtml({ customerName: user.name, otp: newOtp });
            await transporter.sendMail({ from: EMAIL_FROM, to: validatedEmail, subject: `Your New PocketValue Verification Code: ${newOtp}`, html: emailHtml });
             return { success: true, message: "A new verification code has been sent to your email." };
        } catch (emailError) {
            console.error(`Failed to resend OTP to ${validatedEmail}:`, emailError);
            return { success: false, message: "Could not send a new verification email." };
        }
    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// --- SUMMARY OF CHANGES ---
// - **No Code Changes Required:** Your `authActions.ts` file was already modular and robust. All functions (`requestPasswordReset`, `resetPassword`, `verifyUserEmail`, etc.) are well-written and use Zod for validation.
// - **Strategic Shift:** The key change is not in the code itself, but in *how we will use these functions*. The `updateUserPhone` action, which was previously part of the registration flow, will now be called from the checkout process, making the registration experience much smoother for new users. The code is already prepared for this new flow.

"use server";

import { auth } from "@/app/auth";
import { getSafePayload } from "@/app/lib/payloadInstance";
import { ratelimiter, redis } from "@/app/lib/telemetry/rate-limiter";
import { ipAddress } from "@vercel/functions";
import { NextRequest } from "next/server";
import connectMongoose from "@/app/lib/checkout/mongoose";
import Order from "@/models/Order";
import { z } from "zod";
import { VerifyCouponSchema } from "@/app/lib/zodSchemas";

// Payload Coupon Document Type Definition
interface PayloadCouponDoc {
  id: string; 
  code: string;
  description: string;
  isActive?: boolean | null; 
  discountType: "percentage" | "fixed" | "freeShipping";
  discountValue?: number | null; 
  maximumDiscount?: number | null; 
  minimumPurchaseAmount?: number | null; 
  startDate?: string | null; 
  expiryDate?: string | null; 
  totalUsageLimit?: number | null; 
  usageLimitPerUser?: number | null; 
  isStackable?: boolean | null; 
  applicableTo?: "entireOrder" | "specificProducts" | "specificCategories" | null; 
  applicableProducts?: (string | { id: string })[] | null; 
  applicableCategories?: (string | { id: string })[] | null; 
}

type Cart = z.infer<typeof VerifyCouponSchema>["cart"];

interface CouponValidationResult {
  success: boolean;
  message: string;
  finalDiscount?: {
    code: string;
    amount: number;
    type: "percentage" | "fixed" | "freeShipping";
    value?: number | null; 
    maximumDiscount?: number | null; 
  };
}

// Map Payload coupon structure to a Sanity-aligned representation
const mapPayloadCouponToSanity = (payloadCoupon: PayloadCouponDoc) => {
  return {
    _id: payloadCoupon.id, 
    ...payloadCoupon,
    applicableProductIds: payloadCoupon.applicableProducts?.map((p: any) => typeof p === "object" ? p.id : p) || [],
    applicableCategoryIds: payloadCoupon.applicableCategories?.map((c: any) => typeof c === "object" ? c.id : c) || [],
  };
};

export async function verifyAndApplyCoupon(
  code: string, 
  cart: Cart, 
  req: NextRequest
): Promise<CouponValidationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Please log in to apply a coupon." };
  }

  // --- Step 1: Validate inputs via Zod ---
  const validation = VerifyCouponSchema.safeParse({ code, cart });
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }
  const { code: sanitizedCode, cart: validatedCart } = validation.data;

  // --- Step 2: Rate Limiting ---
  const ip = ipAddress(req) || "127.0.0.1";
  const { success: rateLimitSuccess } = await ratelimiter.limit(ip);
  if (!rateLimitSuccess) {
    return { success: false, message: "Too many requests. Please try again later." };
  }
  
  // --- Step 3: Fetch active Coupon from Payload using Cached Singleton ---
  const payload = await getSafePayload();
  const couponResult = await payload.find({
    collection: "coupons",
    where: { 
      code: { equals: sanitizedCode },
      isActive: { equals: true } 
    },
    depth: 1, 
    limit: 1, 
  });

  const rawCoupon = couponResult.docs[0] as unknown as PayloadCouponDoc;
  if (!rawCoupon) {
    return { success: false, message: "Invalid or expired coupon code." };
  }

  const coupon = mapPayloadCouponToSanity(rawCoupon);

  // Check #1: Total Usage Limit (Redis)
  if (coupon.totalUsageLimit) {
    const usageCount = await redis.get(`coupon:usage:${coupon.code}`);
    if (usageCount !== null && Number(usageCount) >= coupon.totalUsageLimit) {
      return { success: false, message: "This coupon has reached its maximum usage limit." };
    }
  }

  // Check #2: Per-User Usage Limit (MongoDB)
  if (coupon.usageLimitPerUser) {
    await connectMongoose();
    const userUsageCount = await Order.countDocuments({
      userId: session.user.id,
      "coupon.code": sanitizedCode
    });
    if (userUsageCount >= coupon.usageLimitPerUser) {
      return { success: false, message: "You have already used this coupon the maximum number of times." };
    }
  }
  
  // --- Validation Pipeline ---
  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { success: false, message: "This coupon is not active yet." };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { success: false, message: "This coupon has expired." };
  }
  if (coupon.minimumPurchaseAmount && validatedCart.subtotal < coupon.minimumPurchaseAmount) {
    return { success: false, message: `Minimum purchase of Rs. ${coupon.minimumPurchaseAmount} is required.` };
  }

  // --- Applicability & Discount Calculation ---
  let applicableSubtotal = 0;
  if (coupon.applicableTo === "entireOrder") {
    applicableSubtotal = validatedCart.subtotal;
  } else if (coupon.applicableTo === "specificProducts") {
    applicableSubtotal = validatedCart.items
      .filter((item: any) => coupon.applicableProductIds?.includes(item._id))
      .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  } else if (coupon.applicableTo === "specificCategories") {
    applicableSubtotal = validatedCart.items
      .filter((item: any) => item.categoryIds?.some((catId: string) => coupon.applicableCategoryIds?.includes(catId)))
      .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  }

  if (applicableSubtotal === 0 && coupon.applicableTo !== "entireOrder" && coupon.applicableTo !== undefined) {
    return { success: false, message: "This coupon is not valid for the items in your cart." };
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (applicableSubtotal * (coupon.discountValue || 0)) / 100; 
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
  } else if (coupon.discountType === "fixed") {
    discountAmount = (coupon.discountValue || 0); 
    if (discountAmount > applicableSubtotal) {
      discountAmount = applicableSubtotal;
    }
  } else if (coupon.discountType === "freeShipping") {
    discountAmount = 0; 
  }

  if (discountAmount < 0) discountAmount = 0;
  if (discountAmount === 0 && coupon.discountType !== "freeShipping") {
    return { success: false, message: "This coupon resulted in no discount." };
  }

  return {
    success: true,
    message: `Coupon "${sanitizedCode}" applied successfully!`,
    finalDiscount: {
      code: sanitizedCode,
      amount: Math.round(discountAmount),
      type: coupon.discountType,
      value: coupon.discountValue,
      maximumDiscount: coupon.maximumDiscount,
    }
  };
}

"use server";

import connectMongoose from "@/app/lib/checkout/mongoose";
import CustomerRequest from "@/models/CustomerRequest";
import { logUserEvent } from "@/app/actions/telemetry/trackingActions";
import { z } from "zod";

const RequestSchema = z.object({
  productId: z.string().optional(),
  requestedProductName: z.string().optional(), // ✅ Added for Universal Requests
  requestType: z.enum(['restock', 'missing_variant', 'missing_product']), // ✅ Included 'missing_product'
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  selectedAttributes: z.record(z.string(), z.string()).optional(),
  customDetails: z.string().optional(),
  urgencyLevel: z.enum(['normal', 'urgent']),
});

export async function submitDemandRequest(formData: z.infer<typeof RequestSchema>) {
  try {
    const validation = RequestSchema.safeParse(formData);
    if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
    }

    const { productId, requestedProductName, requestType, email, phone, selectedAttributes, customDetails, urgencyLevel } = validation.data;

    await connectMongoose();

    // Spam check
    const existing = await CustomerRequest.findOne({
      email,
      requestType,
      productId: productId || undefined,
      requestedProductName: requestedProductName || undefined,
      status: 'pending'
    });

    if (existing) {
      return { 
        success: true, 
        message: "You have already submitted a sourcing request for this item! Our team is already looking for it." 
      };
    }

    await CustomerRequest.create({
      productId,
      requestedProductName,
      requestType,
      email,
      phone,
      selectedAttributes,
      customDetails,
      urgencyLevel,
    });

    // Logging standard telemetry
    await logUserEvent(
      requestType === 'restock' ? 'back_in_stock_subscription' : 'form_field_interaction', 
      '/product/demand-capture', 
      {
        productId,
        requested_product_name: requestedProductName,
        request_type: requestType,
        is_urgent: urgencyLevel === 'urgent'
      }
    );

    return { 
      success: true, 
      message: urgencyLevel === 'urgent' 
        ? "Priority Request Logged! Sourcing parameters dispatched to procurement managers."
        : "Sourcing request submitted! We will email you once we launch this item."
    };

  } catch (error: any) {
    console.error("Demand Sourcing Error:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

// /src/app/actions/addressActions.ts (VERIFIED & FINALIZED)

"use server";

import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/lib/checkout/mongoose";
import User, { IAddress } from "@/models/User";
import { z } from "zod";
import { AddressSchema } from "@/app/lib/zodSchemas";

export type ClientAddress = z.infer<typeof AddressSchema> & {
  _id: string;
  isDefault: boolean;
};

interface ServerResponse {
  success: boolean;
  message: string;
}

// === ACTION #1: SAVE A NEW ADDRESS ===
// FIX: Removed 'lat' | 'lng' from Omit so they can be passed
export async function saveAddress(
  addressData: Omit<ClientAddress, '_id' | 'isDefault'>, 
  isDefault: boolean
): Promise<ServerResponse & { newAddress?: ClientAddress }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required." };
  }

  const validatedFields = AddressSchema.safeParse(addressData);
  if (!validatedFields.success) {
      return {
          success: false,
          message: validatedFields.error.issues[0].message,
      };
  }
  // FIX: Extract lat/lng here
  const { fullName, phone, province, city, area, address, lat, lng } = validatedFields.data;
  
  try {
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) return { success: false, message: "User not found." };

    if (isDefault) {
      user.addresses.forEach((addr: IAddress) => { addr.isDefault = false; });
    }

    // FIX: Save lat/lng to database
    const newAddress = { fullName, phone, province, city, area, address, isDefault, lat, lng } as IAddress;
    user.addresses.push(newAddress);

    await user.save();

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    
    const savedAddress = user.addresses[user.addresses.length - 1];
    const newClientAddress: ClientAddress = {
        _id: savedAddress._id.toString(),
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        province: savedAddress.province,
        city: savedAddress.city,
        area: savedAddress.area,
        address: savedAddress.address,
        isDefault: savedAddress.isDefault,
        lat: savedAddress.lat, // Return back
        lng: savedAddress.lng, // Return back
    };

    return { success: true, message: "Address saved successfully!", newAddress: newClientAddress };

  } catch (error) {
    console.error("Error in saveAddress:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// === ACTION #2: UPDATE AN EXISTING ADDRESS ===
// FIX: Removed 'lat' | 'lng' from Omit here too
export async function updateAddress(
  addressId: string, 
  addressData: Omit<ClientAddress, '_id' | 'isDefault'>, 
  isDefault: boolean
): Promise<ServerResponse & { updatedAddress?: ClientAddress }> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Authentication required." };

    const validatedFields = AddressSchema.safeParse(addressData);
    if (!validatedFields.success) {
        return {
            success: false,
            message: validatedFields.error.issues[0].message,
        };
    }
    const { fullName, phone, province, city, area, address, lat, lng } = validatedFields.data;

    try {
        await connectMongoose();
        const user = await User.findById(session.user.id);
        if (!user) return { success: false, message: "User not found." };

        const addressToUpdate = user.addresses.id(addressId);
        if (!addressToUpdate) return { success: false, message: "Address not found." };

        if (isDefault) {
            user.addresses.forEach((addr: IAddress) => { addr.isDefault = false; });
        }

        // FIX: Update lat/lng
        Object.assign(addressToUpdate, { fullName, phone, province, city, area, address, isDefault, lat, lng });
        
        await user.save();

        revalidatePath("/account/addresses");
        revalidatePath("/checkout");

        const updatedClientAddress: ClientAddress = {
            _id: addressToUpdate._id.toString(),
            fullName: addressToUpdate.fullName,
            phone: addressToUpdate.phone,
            province: addressToUpdate.province,
            city: addressToUpdate.city,
            area: addressToUpdate.area,
            address: addressToUpdate.address,
            isDefault: addressToUpdate.isDefault,
            lat: addressToUpdate.lat,
            lng: addressToUpdate.lng,
        };

        return { success: true, message: "Address updated successfully.", updatedAddress: updatedClientAddress };

    } catch (error) {
        console.error("Error in updateAddress:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}
// === ACTION #3: DELETE AN ADDRESS ===
export async function deleteAddress(addressId: string): Promise<ServerResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required." };
  }

  try {
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) return { success: false, message: "User not found." };

    const addressToDelete = user.addresses.id(addressId);
    if (!addressToDelete) return { success: false, message: "Address not found." };

    const wasDefault = addressToDelete.isDefault;
    addressToDelete.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, message: "Address deleted successfully." };

  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// === ACTION #4: SET A DEFAULT ADDRESS ===
export async function setDefaultAddress(addressId: string): Promise<ServerResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Authentication required." };
    
    try {
        await connectMongoose();
        const user = await User.findById(session.user.id);
        if (!user) return { success: false, message: "User not found." };

        user.addresses.forEach((addr: IAddress) => { addr.isDefault = false; });

        const newDefault = user.addresses.id(addressId);
        if (newDefault) {
            newDefault.isDefault = true;
        } else {
            return { success: false, message: "Address not found." };
        }

        await user.save();
        
        revalidatePath("/account/addresses");
        revalidatePath("/checkout");
        return { success: true, message: "Default address has been set." };
    } catch (error) {
        console.error("Error setting default address:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}

// --- SUMMARY OF CHANGES ---
// - **Improved Type Safety:** The `ClientAddress` type is now derived directly from the `AddressSchema` using `z.infer`. This creates a single source of truth for the address shape, ensuring that the frontend type and backend validation always match.
// - **No Other Logical Changes:** The core logic of all four server actions (save, update, delete, set default) was already robust, secure, and well-written. No further modifications were necessary.


"use server";

import { getSafePayload } from "@/app/lib/payloadInstance";
import { ShippingRule } from "@/types";

// OLD SANITY IMPORTS (Commented out for reference)
// import { client } from "@/sanity/lib/client";
// import groq from "groq";

/**
 * A Server Action that fetches available shipping rules from Payload CMS Globals.
 * It replaces the old Sanity query logic.
 * @returns An array of ShippingRule objects.
 */
export async function getShippingRulesAction(): Promise<ShippingRule[]> {
  try {
    // Use connection-safe client from the global cache singleton
    const payload = await getSafePayload();
        
    // Fetch Settings Global from Payload
    const settings = await payload.findGlobal({
      slug: "settings",
    });

    // Validation: Return empty array if settings or rules are missing
    if (!settings || !settings.shippingRules || settings.shippingRules.length === 0) {
      console.warn("No shipping rules found in Payload settings.");
      return [];
    }
        
    // Map Payload Array to expected ShippingRule Interface
    // Explicitly typed '(rule: any)' parameter to prevent TS-7006 errors
    const mappedRules: ShippingRule[] = settings.shippingRules.map((rule: any) => ({
      _id: rule.id || Math.random().toString(), 
      name: rule.name,
      minAmount: rule.minAmount,
      cost: rule.cost,
      isOnCall: rule.isOnCall || false, // Default to false if value is absent
    }));

    // Sort descending by minAmount (Highest amount first)
    const sortedRules = mappedRules.sort(
      (a: ShippingRule, b: ShippingRule) => b.minAmount - a.minAmount
    );
        
    return sortedRules;

  } catch (error) {
    console.error("Error in getShippingRulesAction (Payload):", error);
    return [];
  }
}

"use server";

import { cookies } from "next/headers";
import connectMongoose from "@/app/lib/checkout/mongoose";
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import AbandonedCart from "@/models/AbandonedCart";
import { auth } from "@/app/auth";

/**
 * Helper to securely retrieve tracking IDs from Server Cookies.
 * Prevents client-side parameter spoofing.
 */
async function getSecureTrackingIds() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("pv_session_id")?.value;
  const visitorId = cookieStore.get("pv_visitor_id")?.value;
  return { sessionId, visitorId };
}

// 1. Initialize or Update Session (Pulse)
export async function trackSessionPulse(sessionData: any) {
  try {
    const { sessionId, visitorId } = await getSecureTrackingIds();
    if (!sessionId || !visitorId) {
      return { success: false, error: "Missing active session parameters." };
    }

    await connectMongoose();
    const authSession = await auth();

    const updateData: any = {
      visitorId,
      device: sessionData.device || "desktop",
      os: sessionData.os || "Other",
      browser: sessionData.browser || "Other",
      city: sessionData.city || null,
      country: sessionData.country || null,
      lastPulse: new Date(),
      isActive: true, 
    };

    // SECURE IDENTIFIER: Link verified logged-in user ID safely
    if (authSession?.user?.id) {
      updateData.userId = authSession.user.id;
    }

    await UserSession.findOneAndUpdate(
      { sessionId },
      { $set: updateData },
      { upsert: true, new: true }
    );
    return { success: true };
  } catch (e: any) {
    console.error("Pulse Error (Server Action):", e.message);
    return { success: false, error: e.message };
  }
}

// User leaves page or closes tab: Sets active state to false
export async function trackDisconnect() {
  try {
    const { sessionId } = await getSecureTrackingIds();
    if (!sessionId) return { success: false };

    await connectMongoose();
    await UserSession.findOneAndUpdate(
      { sessionId },
      { $set: { isActive: false, lastPulse: new Date() } }
    );
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// 2. Log Granular Event securely inside Server with strict Idempotency checks
export async function logUserEvent(
  eventType: 
    // =================================================================
    // ⚓ 1. CORE SYSTEM EVENTS
    // =================================================================
    | 'page_view' 
    | 'add_to_cart' 
    | 'remove_from_cart' 
    | 'checkout_start' 
    | 'search' 
    | 'lock_session'
    | 'wishlist_add' 
    | 'wishlist_remove' 
    | 'purchase'

    // =================================================================
    // 📦 2. CHECKOUT, PAYMENT & COUPON FRICTION EVENTS
    // =================================================================
    | 'checkout_step_view'
    | 'checkout_error'
    | 'shipping_method_selected'
    | 'payment_method_selected'
    | 'coupon_applied'
    | 'coupon_removed'
    | 'form_field_interaction'
    | 'auth_session_expired'
    | 'gateway_redirect_initiated'
    | 'coupon_auto_applied'

    // =================================================================
    // 📦 3. USER IDENTITY, AUTH & ONBOARDING EVENTS
    // =================================================================
    | 'auth_attempt'
    | 'login_prompt_triggered'
    | 'identity_merge'
    | 'cart_rehydrated'
    | 'cart_merged'
    | 'profile_fields_updated'

    // =================================================================
    // 📦 4. SEARCH, DISCOVERY & PDP TELEMETRY EVENTS
    // =================================================================
    | 'back_in_stock_subscription'
    | 'filter_applied'
    | 'pdp_interaction'
    | 'search_result_click'
    | 'product_impression'
    | 'product_click'
    | 'variant_price_compared'
    | 'pdp_media_interaction'

    // =================================================================
    // 📦 5. UI TECHNICAL HEALTH, PERFORMANCE & FRICTION EVENTS
    // =================================================================
    | 'exit_intent_triggered'
    | 'js_exception'
    | 'performance_metric'
    | 'rage_click_detected'
    | 'cart_desync_error'

    // =================================================================
    // 📦 6. CAMPAIGN ATTRIBUTION, OPERATIONS & LIFECYCLE EVENTS
    // =================================================================
    | 'banner_click'
    | 'oos_attempt'
    | 'session_start'
    | 'crm_sync'
    | 'support_engagement_click'
    | 'policy_page_view'
    | 'shipping_threshold_proximity'
    | 'scarcity_exposure'
    | 'experiment_variant_exposed'
    | 'rto_risk_flagged'
    | 'return_portal_drop'
    | 'product_shared'
    | 'logistics_delay'
    | 'cookie_consent_toggled'
    | 'pwa_prompt_metric'
    | 'recovered_cart_conversions'
    | 's2s_purchase',
  path: string,
  metadata?: any
) {
  try {
    const { sessionId, visitorId } = await getSecureTrackingIds();
    if (!sessionId) {
      return { success: false, error: "Tracking action rejected due to invalid session." };
    }

    await connectMongoose();

    // IDEMPOTENCY TYPE GUARD: Prevents duplicate purchase event logging on page refreshes
    if (eventType === 'purchase' && metadata?.orderId) {
      const existingEvent = await UserEvent.findOne({
        eventType: 'purchase',
        'metadata.orderId': metadata.orderId
      });

      if (existingEvent) {
        console.log(`📡 [Idempotency Guard] Duplicate 'purchase' event bypassed for Order ID: ${metadata.orderId}`);
        return { success: true, message: "Purchase already logged. Skipping duplicate." };
      }
    }
    
    // Inject verified visitor ID to prevent data isolation gaps
    const enrichedMetadata = {
      ...metadata,
      visitorId,
      timestamp: new Date().toISOString()
    };

    await UserEvent.create({
      sessionId,
      eventType,
      path,
      metadata: enrichedMetadata,
    });
    
    return { success: true };
  } catch (e: any) {
    console.error("Event Log Error (Server Action):", e.message);
    return { success: false, error: e.message };
  }
}

// 3. Synchronize Abandoned Cart for Lead Recovery
export async function syncAbandonedCart(
  cartItems: any[],
  subtotal: number,
  contactInfo?: { email?: string; phone?: string }
) {
  try {
    const { sessionId } = await getSecureTrackingIds();
    if (!sessionId) {
      return { success: false, error: "Cart sync rejected due to invalid session." };
    }

    await connectMongoose();

    // Clean-up pattern: If cart is empty, delete recovery record immediately
    if (!cartItems || cartItems.length === 0 || subtotal <= 0) {
      await AbandonedCart.findOneAndDelete({ sessionId });
      return { success: true, message: "Abandoned cart cleared." };
    }

    const authSession = await auth();
    const updateFields: any = {
      items: cartItems,
      subtotal,
      userId: authSession?.user?.id || null,
      lastUpdated: new Date(),
      isRecovered: false,
    };

    if (contactInfo?.email) updateFields.email = contactInfo.email;
    if (contactInfo?.phone) updateFields.phone = contactInfo.phone;
    updateFields.contactCaptured = !!(updateFields.email || updateFields.phone);

    await AbandonedCart.findOneAndUpdate(
      { sessionId },
      { $set: updateFields },
      { upsert: true }
    );

    return { success: true };
  } catch (e: any) {
    console.error("Cart Sync Error (Server Action):", e.message);
    return { success: false, error: e.message };
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { verifyAndApplyCoupon } from '@/app/actions/cart/couponActions';

/**
 * API Route: /api/verify-coupon
 * Method: POST
 * Body: { code: string, cart: object }
 * Description: Acts as a secure bridge to call the verifyAndApplyCoupon server action,
 * passing the necessary request object for rate limiting.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Request body se code aur cart haasil karein
    const body = await req.json();
    const { code, cart } = body;

    // 2. Bunyadi validation
    if (!code || !cart) {
      return NextResponse.json(
        { success: false, message: 'Missing coupon code or cart data.' },
        { status: 400 }
      );
    }

    // 3. Server action ko call karein aur poora 'req' object pass karein
    const result = await verifyAndApplyCoupon(code, cart, req);

    // 4. Server action ka result client ko wapas bhej dein
    return NextResponse.json(result);

  } catch (error) {
    // 5. Agar koi unexpected error aaye to usay handle karein
    console.error("API Error in /api/verify-coupon:", error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
// src/app/api/orders/create/route.ts
"use server";

import { auth } from "@/app/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectMongoose from "@/app/lib/checkout/mongoose";
import Order from "@/models/Order";
import { generateNextOrderId } from "@/app/lib/checkout/order-utils";
import { getPayloadProductsStockStatus } from "@/sanity/lib/payload/product.queries";
import { calculateShippingCostServer } from "@/app/lib/checkout/shipping-calculator";
import { verifyAndApplyCoupon } from "@/app/actions/cart/couponActions";
import { redis } from "@/app/lib/telemetry/rate-limiter";
import { CreateOrderSchema } from "@/app/lib/zodSchemas";
import { CleanCartItem } from "@/sanity/types/product_types";
import { getSafePayload } from "@/app/lib/payloadInstance";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    console.error("DEBUG: Authentication failed. Session or user ID is missing.");
    return NextResponse.json(
      { message: "User not authenticated." },
      { status: 401 },
    );
  }
  console.log("DEBUG: User authenticated. User ID:", session.user.id, "User Email:", session.user.email);

  try {
    const body = await req.json();

    // --- Step 1: Validate the entire request body with Zod ---
    const validation = CreateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 },
      );
    }
    const {
      shippingAddress,
      cartItems,
      totalPrice: clientGrandTotal,
      couponCode,
    } = validation.data;

    await connectMongoose();

    // --- Step 2: Verify Prices & Stock (Payload CMS) ---
    // Explicit typecasting on 'item' to prevent TS-7006 implicit any warnings
    const productIdsInCart = cartItems.map((item: any) => item._id);
    const liveProductsData = await getPayloadProductsStockStatus(productIdsInCart);

    // Explicit typecasting on 'p' mapping parameter
    const productMap = new Map(liveProductsData.map((p: any) => [p._id, p]));
    let serverSubtotal = 0;

    for (const item of cartItems as CleanCartItem[]) {
      if (!item.variant)
        throw new Error(`Product "${item.name}" is missing variant info.`);
      const liveProduct = productMap.get(item._id);
      if (!liveProduct)
        throw new Error(`Product "${item.name}" is no longer available.`);

      const liveVariant = liveProduct.variants?.find(
        (v: any) => v._key === item.variant!._key,
      );
      if (!liveVariant)
        throw new Error(`Selected option for "${item.name}" is no longer available.`);

      if (
        !liveVariant.inStock ||
        (liveVariant.stock !== undefined && liveVariant.stock < item.quantity)
      ) {
        throw new Error(`Sorry, "${item.name}" is out of stock.`);
      }

      const effectivePrice = liveVariant.salePrice ?? liveVariant.price;
      serverSubtotal += effectivePrice * item.quantity;
    }

    // --- Step 3: Calculation checks ---
    const serverShipping = await calculateShippingCostServer(serverSubtotal);
    let monetaryDiscount = 0;
    let shippingDiscount = 0;
    let finalCoupon = null;
    
    if (couponCode) {
      const couponResult = await verifyAndApplyCoupon(
        couponCode,
        { items: cartItems as CleanCartItem[], subtotal: serverSubtotal },
        req,
      );
      if (couponResult.success && couponResult.finalDiscount) {
        if (couponResult.finalDiscount.type === "freeShipping")
          shippingDiscount = serverShipping.cost;
        else monetaryDiscount = couponResult.finalDiscount.amount;
        finalCoupon = {
          code: couponResult.finalDiscount.code,
          amount: couponResult.finalDiscount.amount,
        };
      } else {
        throw new Error(`Coupon "${couponCode}" is no longer valid. Please remove it and try again.`);
      }
    }
    const finalServerShippingCost = serverShipping.cost - shippingDiscount;
    const serverGrandTotal = serverSubtotal - monetaryDiscount + finalServerShippingCost;
    
    if (Math.abs(serverGrandTotal - clientGrandTotal) > 1) {
      throw new Error(`Price mismatch detected. Server total: ${serverGrandTotal}, Client total: ${clientGrandTotal}. Please refresh your cart.`);
    }
    
    const cookieStore = await cookies();
    const trafficSource = {
      source: cookieStore.get("utm_source")?.value,
      medium: cookieStore.get("utm_medium")?.value,
      campaign: cookieStore.get("utm_campaign")?.value,
    };

    const newOrderId = await generateNextOrderId();

    // --- Step 4: Construct and save Order document ---
    const orderDataToSave = {
      _id: newOrderId,
      orderId: newOrderId,
      userId: session.user.id,
      products: cartItems.map((item: any) => ({
        ...item,
        productId: item._id,
      })),
      shippingAddress: {
        ...shippingAddress,
        email: session.user.email, 
      },
      subtotal: serverSubtotal,
      shippingCost: finalServerShippingCost,
      coupon: finalCoupon,
      totalPrice: serverGrandTotal,
      trafficSource,
    };

    // Instantiate and save the order directly to prevent unused local variable warnings
    await new Order(orderDataToSave).save();

    if (finalCoupon) {
      await redis.incr(`coupon:usage:${finalCoupon.code}`);
    }

    // =================================================================
    // Stock deduction in Payload CMS
    // =================================================================
    try {
      const payload = await getSafePayload();
      
      for (const item of cartItems) {
        const product = await payload.findByID({
          collection: "products",
          id: item._id,
        });

        if (product && product.variants) {
          const updatedVariants = product.variants.map((v: any) => {
            if (v.id === item.variant?._key || v.sku === item.variant?._key) {
              const newStock = Math.max(0, (v.stock || 0) - item.quantity);
              return { ...v, stock: newStock };
            }
            return v;
          });

          await payload.update({
            collection: "products",
            id: item._id,
            data: {
              variants: updatedVariants,
            },
          });
          
          console.log(`Stock updated for Product: ${product.title}`);
        }
      }
    } catch (stockError: any) {
      console.error("CRITICAL: Failed to update stock in Payload:", stockError.message);
    }
    // =================================================================

    console.log("--- Order Creation Successful ---");
    return NextResponse.json(
      { message: "Order created successfully!", orderId: newOrderId },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Order Creation API Error: ", error);
    return NextResponse.json(
      { message: error.message || "An internal server error occurred." },
      { status: 500 },
    );
  }
}

// src/app/api/tracking/pulse/route.ts
import { NextRequest, NextResponse } from "next/server";
import { redis, ratelimiter } from "@/app/lib/telemetry/rate-limiter"; // Singleton Redis
import { getToken } from "next-auth/jwt";
import { ipAddress } from "@vercel/functions";

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. SECURITY HANDSHAKE VERIFICATION
    const handshakeToken = req.headers.get("x-pv-tracking-handshake");
    if (handshakeToken !== "pv-telemetry-secure-jwt-2026") {
      return NextResponse.json({ error: "Access Denied: Invalid Handshake Token." }, { status: 403 });
    }

    // 🛡️ 2. IP RATE LIMITER TRIGGER (Telemetry Spam Protection)
    const ip = ipAddress(req) || "127.0.0.1";
    const { success } = await ratelimiter.limit(`pulse-api-${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded on telemetry channel." }, { status: 429 });
    }

    // 🛡️ 3. COOKIE EXTRACATION (Strict Server-Side Trusted Sources)
    const sessionId = req.cookies.get("pv_session_id")?.value;
    const visitorId = req.cookies.get("pv_visitor_id")?.value;

    if (!sessionId || !visitorId) {
      return NextResponse.json(
        { error: "Access Denied: Missing tracking parameters." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    const pulsePayload = {
      sessionId,
      visitorId,
      ...body,
      userId: token?.sub || null, 
      lastPulse: new Date().toISOString(),
    };

    // LPUSH to in-memory Redis List queue
    await redis.lpush("tracking_pulse_queue", JSON.stringify(pulsePayload));

    return NextResponse.json({ success: true, queued: true });
  } catch (error: any) {
    console.error("Critical API Queue Pulse Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
// /src/app/api/payment/gateways/route.ts

import { getEnabledGateways } from "@/app/lib/payment/paymentAdapter";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const gateways = await getEnabledGateways();
        return NextResponse.json(gateways);
    } catch (error: any) {
        console.error("Failed to fetch payment gateways:", error);
        return NextResponse.json({ message: "Could not load payment options." }, { status: 500 });
    }
}
// /src/app/api/payment/initiate/route.ts (FINAL & REFACTORED WITH ZOD)

import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { initiatePayment } from '@/app/lib/payment/paymentAdapter';
import connectMongoose from '@/app/lib/checkout/mongoose';
import Order, { IOrder } from '@/models/Order';
import { InitiatePaymentSchema } from "@/app/lib/zodSchemas";

async function getOrderForPayment(orderId: string, userId: string): Promise<IOrder | null> {
    try {
        await connectMongoose();
        const order = await Order.findOne({ 
            _id: orderId,
            userId: userId 
        }).lean<IOrder>();
        
        return order;

    } catch (error) {
        console.error("Failed to fetch order for payment:", error);
        return null;
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    try {
        const body = await req.json();

        // --- Step 1: Validate with Zod ---
        const validation = InitiatePaymentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
        }
        const { orderId, gatewayKey } = validation.data;

        // The old manual 'if' check is now gone.

        const order = await getOrderForPayment(orderId, session.user.id);
        if (!order) {
            return NextResponse.json({ message: "Order not found or access denied." }, { status: 404 });
        }
        
        // This check is business logic, so it stays.
        if (order.status !== 'Pending' && order.status !== 'On Hold') {
            return NextResponse.json({ message: "This order can no longer be paid for." }, { status: 400 });
        }

        const result = await initiatePayment(order, gatewayKey as any);

        if (result.success) {
            return NextResponse.json({ 
                success: true,
                redirectUrl: result.redirectUrl, 
                data: result.data,
                message: result.message
            });
        } else {
            throw new Error(result.message || "Failed to initiate payment session.");
        }

    } catch (error: any) {
        console.error("Payment Initiation API Error: ", error);
        return NextResponse.json({ message: error.message || "An internal server error occurred." }, { status: 500 });
    }
}



// src/app/api/payment/verify/[gateway]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/app/lib/payment/paymentAdapter";
import nodemailer from "nodemailer";
import { createOrderConfirmationHtml } from "@/email_templates/orderConfirmationEmail";
import connectMongoose from "@/app/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/actions/telemetry/trackingActions"; // 🚀 Telemetry import

async function parseRequestData(req: NextRequest) {
  if (req.method === "POST") {
    try {
      return await req.json();
    } catch {
      const formData = await req.formData();
      const data: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
      return data;
    }
  } else {
    const data: { [key: string]: string } = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }
}

async function handler(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ gateway: string }> },
) {
  const { gateway: gatewayKey } = await paramsPromise;
  let verificationResult;
  let finalOrderId = "";

  try {
    await connectMongoose();
    console.log(`[Verify API] Received callback for gateway: ${gatewayKey}`);
    const requestData = await parseRequestData(req);

    verificationResult = await verifyPayment(gatewayKey as any, requestData);

    if (!verificationResult || !verificationResult.orderId) {
      throw new Error(
        "Verification failed: Invalid response from payment adapter.",
      );
    }

    finalOrderId = verificationResult.orderId;
    console.log(
      `[Verify API] Verification result for Order ${finalOrderId}:`,
      verificationResult,
    );

    if (verificationResult.success) {
      const order = await Order.findOne({
        _id: finalOrderId,
        status: "Pending",
      });

      if (order) {
        order.status = verificationResult.orderStatus;
        order.paymentStatus = verificationResult.paymentStatus;
        order.paymentMethod = gatewayKey;
        order.transactionId = verificationResult.transactionId;
        await order.save();

        // =================================================================
        // 🚀 GAP #24: AD-BLOCKER IMMUNE SERVER-TO-SERVER (S2S) PURCHASE TELEMETRY
        // =================================================================
        try {
          await logUserEvent('s2s_purchase', `/api/payment/verify/${gatewayKey}`, {
            orderId: finalOrderId,
            transactionId: verificationResult.transactionId,
            gateway: gatewayKey,
            amount: order.totalPrice,
            items_count: order.products.length,
            currency: 'PKR'
          });
          console.log(`📡 [S2S Telemetry] Secure Server-to-Server purchase logged for Order ${finalOrderId}`);
        } catch (s2sError: any) {
          console.error(`[S2S Telemetry Error] Failed to log server-side purchase for order ${finalOrderId}:`, s2sError.message);
        }
        // =================================================================

        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!,
            port: Number(process.env.SMTP_PORT!),
            auth: {
              user: process.env.SMTP_USER!,
              pass: process.env.SMTP_PASS!,
            },
          });
          const emailHtml = createOrderConfirmationHtml({
            orderId: order.orderId,
            customerName: order.shippingAddress.fullName,
            products: order.products,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            coupon: order.coupon,
            totalPrice: order.totalPrice,
            shippingAddress: order.shippingAddress,
          });
          await transporter.sendMail({
            from: '"PocketValue" <support@pocketvalue.pk>',
            to: order.shippingAddress.email,
            bcc: process.env.ADMIN_EMAIL,
            subject: `Your PocketValue Order Confirmation [${order.orderId}]`,
            html: emailHtml,
          });
          console.log(
            `[Verify API] Confirmation email sent for order ${finalOrderId}`,
          );
        } catch (emailError) {
          console.error(
            `CRITICAL: Order ${finalOrderId} updated, but FAILED to send email:`,
            emailError,
          );
        }
      } else {
        console.warn(
          `[Verify API] Order ${finalOrderId} not found or already processed.`,
        );
      }
    }
  } catch (error: any) {
    console.error("[Verify API] CRITICAL ERROR:", error);
    verificationResult = {
      success: false,
      message: error.message || "Unknown error.",
    };
  }

  // Redirect ke bajaye JSON response bhejein
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (verificationResult.success) {
    const successUrl = new URL(`/order-success/${finalOrderId}`, baseUrl);
    return NextResponse.json({
      success: true,
      message: "Payment verified",
      redirectUrl: successUrl.toString(),
    });
  } else {
    const failureUrl = new URL(`/order-failure`, baseUrl);
    failureUrl.searchParams.set("orderId", finalOrderId);
    failureUrl.searchParams.set(
      "reason",
      verificationResult.message || "Payment unsuccessful.",
    );
    return NextResponse.json({
      success: false,
      message: verificationResult.message,
      redirectUrl: failureUrl.toString(),
    });
  }
}

export { handler as GET, handler as POST };
// src/app/api/webhooks/crm/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/actions/telemetry/trackingActions";

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. SECURE HANDSHAKE CHECK: Prevents unauthorized CRM spoofing
    const authHeader = req.headers.get("Authorization");
    const secureToken = process.env.CRM_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === "production" && (!authHeader || authHeader !== `Bearer ${secureToken}`)) {
      return NextResponse.json({ error: "Unauthorized: Invalid CRM Webhook Handshake" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, action, previousStatus, newStatus, fraudRiskScore } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing required fields: orderId and action are mandatory." }, { status: 400 });
    }

    await connectMongoose();

    // Find the targeted order
    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId }] });
    if (!order) {
      return NextResponse.json({ error: `Order ${orderId} not found in database.` }, { status: 404 });
    }

    // =================================================================
    // 🚀 GAP #19: CRM COMPLIANCE & OPERATIONAL STATE SYNCHRONIZATION
    // =================================================================
    if (action === "cancellation_sync") {
      order.status = "Cancelled";
      await order.save();

      await logUserEvent('crm_sync', '/api/webhooks/crm', {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: 'crm_external_cancellation',
        previous_status: previousStatus || 'unknown',
        new_status: 'Cancelled',
        amount: order.totalPrice
      });

      console.log(`📡 [CRM Webhook] Order ${order.orderId} cancelled via CRM sync.`);
      return NextResponse.json({ success: true, message: "Order cancellation synced." });
    }

    if (action === "fraud_detection") {
      // Flag order metadata with dynamic fraud indicators
      order.trafficSource = {
        ...order.trafficSource,
        fraud_flag: true,
        fraud_risk_score: fraudRiskScore || 99
      };
      await order.save();

      await logUserEvent('crm_sync', '/api/webhooks/crm', {
        orderId: order._id,
        orderNumber: order.orderId,
        sync_type: 'fraud_detected',
        fraud_risk_score: fraudRiskScore || 99,
        action_taken: 'flagged_in_system'
      });

      console.warn(`⚠️ [CRM Webhook] High Fraud Risk flagged for Order ${order.orderId}.`);
      return NextResponse.json({ success: true, message: "Fraud metrics logged successfully." });
    }

    return NextResponse.json({ success: false, message: "Unhandled CRM action type." }, { status: 400 });

  } catch (error: any) {
    console.error("CRM Webhook Processing Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// src/app/api/webhooks/logistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/lib/checkout/mongoose";
import Order from "@/models/Order";
import { logUserEvent } from "@/app/actions/telemetry/trackingActions";

export async function POST(req: NextRequest) {
  try {
    // 🛡️ 1. SECURE HANDSHAKE CHECK: Validate 3PL courier token
    const token = req.headers.get("x-pv-courier-handshake");
    if (process.env.NODE_ENV === "production" && token !== process.env.COURIER_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized: Invalid Logistics Token." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, trackingId, courierPartner, trackingStatus, delayReason, estimatedDaysDelay } = body;

    if (!orderId || !trackingStatus) {
      return NextResponse.json({ error: "Missing orderId or trackingStatus parameters." }, { status: 400 });
    }

    await connectMongoose();

    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId }] });
    if (!order) {
      return NextResponse.json({ error: `Order ID ${orderId} missing from database.` }, { status: 404 });
    }

    // Check if the incoming status indicates shipping latency (delay)
    const isDelayedStatus = ['delayed', 'held', 'customs_hold', 'attempt_failed', 'delay'].includes(trackingStatus.toLowerCase());

    // =================================================================
    // 🚀 GAP #43: LOGISTICS LATENCY DELAYS REAL-TIME TRACKING
    // =================================================================
    if (isDelayedStatus) {
      // Save delay parameters to UserEvent telemetry collection
      await logUserEvent('logistics_delay', '/api/webhooks/logistics', {
        orderId: order._id,
        orderNumber: order.orderId,
        tracking_id: trackingId || "N/A",
        courier_partner: courierPartner || "Trax/Leopards",
        raw_status: trackingStatus,
        delay_reason: delayReason || "Customs holds or transit bottleneck",
        estimated_delay_days: estimatedDaysDelay || 3,
        shipping_city: order.shippingAddress.city
      });

      console.warn(`🚛 [Logistics Alert] Sourcing delay recorded for order ${order.orderId} via ${courierPartner}.`);
      return NextResponse.json({ success: true, message: "Logistics delay telemetry logged successfully." });
    }
    // =================================================================

    return NextResponse.json({ success: true, message: "Standard logistics pulse synced (no delay)." });

  } catch (error: any) {
    console.error("Logistics Webhook Processing Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// src/app/components/intelligence/IntelligenceTracker.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { logUserEvent, syncAbandonedCart } from "@/app/actions/telemetry/trackingActions";
import { useSession } from "next-auth/react";

// Client-side cookie reader helper
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Client-side cookie eraser helper
function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export default function IntelligenceTracker() {
  const pathname = usePathname();
  const { cartItems, subtotal } = useStateContext();
  const { data: session } = useSession();

  const lastTrackedUrl = useRef("");
  const lastSyncedCart = useRef("");
  const pulseStarted = useRef(false);

  // Rage click tracking refs (Gap #39)
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const lastClickedElement = useRef<HTMLElement | null>(null);

  // =================================================================
  // 🚀 GAP #41: OFFLINE QUEUE BUFFER & BACKFILL FLUSHER
  // =================================================================
  const safeLogUserEvent = async (eventType: any, path: string, metadata?: any) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      try {
        const queueKey = "pocketvalue_offline_queue";
        const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
        queue.push({ eventType, path, metadata, timestamp: new Date().toISOString() });
        localStorage.setItem(queueKey, JSON.stringify(queue));
        console.log(`📦 [Offline Buffer] Buffered event '${eventType}' in localStorage.`);
      } catch (e) {
        console.error("Failed to buffer offline event:", e);
      }
      return { success: false, buffered: true };
    }

    try {
      return await logUserEvent(eventType, path, metadata);
    } catch (e) {
      try {
        const queueKey = "pocketvalue_offline_queue";
        const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
        queue.push({ eventType, path, metadata, timestamp: new Date().toISOString() });
        localStorage.setItem(queueKey, JSON.stringify(queue));
      } catch (localErr) {}
      return { success: false, buffered: true };
    }
  };

  // Sync / Flush offline buffered telemetry events back on network recovery (Gap #41)
  useEffect(() => {
    const handleOnline = async () => {
      if (typeof window !== "undefined") {
        const queueKey = "pocketvalue_offline_queue";
        const queue = JSON.parse(localStorage.getItem(queueKey) || "[]");
        if (queue.length > 0) {
          console.log(`📡 [Offline Flush] Connection regained. Flushing ${queue.length} buffered logs...`);
          for (const event of queue) {
            try {
              await logUserEvent(event.eventType, event.path, {
                ...event.metadata,
                is_offline_backfilled: true,
                buffered_timestamp: event.timestamp
              });
            } catch (e) {}
          }
          localStorage.removeItem(queueKey); 
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // =================================================================
  // 🛰️ 1. SILENT HEARTBEAT (With dynamic Hidden Tab pulse suspension - Gap #36)
  // =================================================================
  useEffect(() => {
    if (pulseStarted.current) return;
    
    const sendSilentPulse = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        console.log("💤 [Heartbeat Suspended] Active pulse paused inside passive background tab.");
        return;
      }

      const ua = navigator.userAgent;
      const params = new URLSearchParams(window.location.search);
      try {
        await fetch("/api/tracking/pulse", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-pv-tracking-handshake": "pv-telemetry-secure-jwt-2026"
          },
          body: JSON.stringify({
            utmSource: params.get("utm_source") || "Direct",
            utmMedium: params.get("utm_medium") || "None",
            utmCampaign: params.get("utm_campaign") || "None",
            os: ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "MacOS" : "Other",
            device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
          }),
        });
      } catch (e) {}
    };
    pulseStarted.current = true;
    sendSilentPulse();
    const interval = setInterval(sendSilentPulse, 40000);
    return () => clearInterval(interval);
  }, []);

  // =================================================================
  // 📝 2. EVENT LOGGING & LATENCY PERFORMANCE TIMINGS (Gap #22)
  // =================================================================
  useEffect(() => {
    const currentPath = pathname;
    if (currentPath === lastTrackedUrl.current) return;

    const viewKey = `pv_v4_view_${currentPath}`;
    if (sessionStorage.getItem(viewKey)) {
      lastTrackedUrl.current = currentPath;
      return;
    }

    lastTrackedUrl.current = currentPath;

    let eventType: "page_view" | "checkout_start" | "search" = "page_view";
    if (pathname === "/checkout") eventType = "checkout_start";
    if (pathname.startsWith("/search")) eventType = "search";

    let performanceMetadata = {};
    if (typeof window !== "undefined" && window.performance) {
      const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntry) {
        performanceMetadata = {
          dom_content_loaded_ms: Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime),
          page_load_duration_ms: Math.round(navigationEntry.loadEventEnd - navigationEntry.startTime)
        };
      }
    }

    const params = new URLSearchParams(window.location.search);

    safeLogUserEvent(eventType, currentPath, {
      searchTerm: params.get("q"),
      ...performanceMetadata 
    })
      .then(() => {
        sessionStorage.setItem(viewKey, "true");
      })
      .catch(() => {});
  }, [pathname]);

  // =================================================================
  // 🛡️ 3. GLOBAL JS EXCEPTIONS / PROMISE REJECTIONS CATCHER (Gap #12)
  // =================================================================
  useEffect(() => {
    const handleJSErrors = (e: ErrorEvent) => {
      safeLogUserEvent('js_exception', pathname, {
        error_message: e.message || 'Unknown Javascript Exception',
        error_stack: e.error?.stack || 'N/A',
        file: e.filename || 'N/A',
        line: e.lineno || 0,
        column: e.colno || 0
      });
    };

    const handlePromiseRejections = (e: PromiseRejectionEvent) => {
      safeLogUserEvent('js_exception', pathname, {
        error_message: e.reason?.message || String(e.reason) || 'Unhandled Promise Rejection',
        error_stack: e.reason?.stack || 'N/A',
        exception_source: 'promise_rejection'
      });
    };

    window.addEventListener('error', handleJSErrors);
    window.addEventListener('unhandledrejection', handlePromiseRejections);
    return () => {
      window.removeEventListener('error', handleJSErrors);
      window.removeEventListener('unhandledrejection', handlePromiseRejections);
    };
  }, [pathname]);

  // =================================================================
  // 🖱️ 4. EXIT INTENT MONITORING (Gap #11)
  // =================================================================
  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY < 20 && subtotal > 0) {
        const exitIntentKey = `pv_exit_intent_${pathname}`;
        
        if (!sessionStorage.getItem(exitIntentKey)) {
          safeLogUserEvent('exit_intent_triggered', pathname, {
            cart_subtotal: subtotal,
            total_items: cartItems.length
          });
          sessionStorage.setItem(exitIntentKey, 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);
    return () => document.removeEventListener('mouseleave', handleExitIntent);
  }, [pathname, subtotal, cartItems]);

  // =================================================================
  // 🖱️ 5. RAGE CLICKS / REPEATED ACCIDENTAL CLICKS DETECTOR (Gap #39 & #44)
  // =================================================================
  useEffect(() => {
    const handleRageClicks = (e: MouseEvent) => {
      const now = Date.now();
      const targetElement = e.target as HTMLElement;

      if (lastClickedElement.current === targetElement && now - lastClickTime.current < 1500) {
        clickCount.current++;
        if (clickCount.current >= 3) {
          safeLogUserEvent('rage_click_detected', pathname, {
            element_tag: targetElement.tagName.toLowerCase(),
            element_classes: targetElement.className || 'N/A',
            element_text: targetElement.innerText?.substring(0, 30) || 'N/A',
            click_coordinates: { x: e.clientX, y: e.clientY }
          });
          clickCount.current = 0; 
        }
      } else {
        clickCount.current = 1;
        lastClickedElement.current = targetElement;
      }
      lastClickTime.current = now;
    };

    document.addEventListener('click', handleRageClicks);
    return () => document.removeEventListener('click', handleRageClicks);
  }, [pathname]);

  // =================================================================
  // 🚀 GAP #18: CLIENT HANDSHAKE FLUSHER (session_start Campaign Attribution)
  // =================================================================
  useEffect(() => {
    const sessionStartPending = getCookie("pv_session_start_pending");
    
    if (sessionStartPending === "true") {
      const utm_source = getCookie("utm_source") || "Direct";
      const utm_medium = getCookie("utm_medium") || "None";
      const utm_campaign = getCookie("utm_campaign") || "None";
      
      safeLogUserEvent('session_start', pathname, {
        utm_source,
        utm_medium,
        utm_campaign,
        referrer: typeof document !== "undefined" ? document.referrer : "none"
      });
      eraseCookie("pv_session_start_pending");
    }
  }, [pathname]);

  // =================================================================
  // 🚀 GAP #52: CLIENT HANDSHAKE FLUSHER (recovered_cart_conversions)
  // =================================================================
  useEffect(() => {
    const recoveredCartPending = getCookie("pv_recovered_cart_pending");
    
    if (recoveredCartPending === "true") {
      const utm_source = getCookie("utm_source") || "none";
      const utm_campaign = getCookie("utm_campaign") || "none";
      
      safeLogUserEvent('recovered_cart_conversions', pathname, {
        utm_source,
        utm_campaign,
        cart_subtotal: subtotal,
        item_count: cartItems.length
      });
      eraseCookie("pv_recovered_cart_pending");
    }
  }, [pathname, subtotal, cartItems]);

  // =================================================================
  // 🚀 GAP #25: WHATSAPP / HELPDESK CLICK ENGAGEMENTS TRACKING
  // =================================================================
  useEffect(() => {
    const handleSupportClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && (anchor.href.includes("wa.me") || anchor.href.includes("whatsapp.com") || anchor.href.includes("chat") || anchor.href.includes("support"))) {
        safeLogUserEvent('support_engagement_click', pathname, {
          target_url: anchor.href,
          link_text: anchor.innerText?.substring(0, 30) || 'N/A'
        });
      }
    };

    document.addEventListener('click', handleSupportClick);
    return () => document.removeEventListener('click', handleSupportClick);
  }, [pathname]);

// =================================================================
  // 🚀 GAP #26: DYNAMIC INFO/POLICY PAGE VIEWS TRACKING (FIXED LOOP)
  // =================================================================
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];

    const reservedRoutes = [
      "search", "category", "product", "deals", "blog", "cart", "checkout", 
      "login", "register", "account", "verify-email", "forgot-password", "reset-password", "wishlist"
    ];

    const isDynamicInfoPage = segments.length === 1 && !reservedRoutes.includes(firstSegment);

    if (isDynamicInfoPage) {
      const policyExposedKey = `pv_policy_viewed_${pathname}`;
      
      // Use sessionStorage to prevent re-logging during NextJS silent router refreshes (Gap #26)
      if (!sessionStorage.getItem(policyExposedKey)) {
        sessionStorage.setItem(policyExposedKey, 'true');
        safeLogUserEvent('policy_page_view', pathname, {
          page_path: pathname,
          page_slug: firstSegment || "home-fallback",
          timestamp: new Date().toISOString()
        });
        console.log(`📡 [Dynamic Telemetry] policy_page_view logged for: ${pathname}`);
      }
    }
  }, [pathname]);
  // =================================================================

  // =================================================================
  // 🚀 GAP #29: A/B TESTING EXPERIMENTAL exposures TRACKING
  // =================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;
    let activeVariant = localStorage.getItem("pv_ab_variant");
    if (!activeVariant) {
      activeVariant = Math.random() < 0.5 ? "variant_a" : "variant_b";
      localStorage.setItem("pv_ab_variant", activeVariant);
    }
    
    const sessionExposedKey = `pv_exp_exposed_${pathname}`;
    if (!sessionStorage.getItem(sessionExposedKey)) {
      safeLogUserEvent('experiment_variant_exposed', pathname, {
        experiment_name: 'pdp_layout_revamp_2026',
        exposed_variant: activeVariant
      });
      sessionStorage.setItem(sessionExposedKey, 'true');
    }
  }, [pathname]);

  // =================================================================
  // 🚀 GAP #51: PWA APPLICATION INSTALLED METRICS
  // =================================================================
  useEffect(() => {
    const handleAppInstalled = () => {
      safeLogUserEvent('pwa_prompt_metric', pathname, {
        action: 'installed',
        platform: /Mobi|Android/i.test(navigator.userAgent) ? 'android' : 'desktop'
      });
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [pathname]);

  // 🔄 ABANDONED CART SYNC (FIXED TYPES)
  useEffect(() => {
    const cartSnapshot = JSON.stringify(cartItems) + subtotal;
    if (cartSnapshot === lastSyncedCart.current) return;

    const handler = setTimeout(async () => {
      try {
        const contactInfo = session?.user
          ? { 
              email: session.user.email ?? undefined, 
              phone: (session.user as any).phone ?? undefined 
            }
          : undefined;
          
        await syncAbandonedCart(cartItems, subtotal, contactInfo);
        lastSyncedCart.current = cartSnapshot;
      } catch (e) {}
    }, 4000);

    return () => clearTimeout(handler);
  }, [cartItems, subtotal, session]);

  return null;
}

//shipping-calculator.ts
import { ShippingRule } from '@/types';
// --- 🛑 OLD SANITY IMPORT (Commented) ---
// import { getShippingRules } from '@/sanity/lib/queries';

// --- ✅ NEW PAYLOAD ACTION IMPORT ---
import { getShippingRulesAction } from '@/app/actions/checkout/shippingActions';

export interface ShippingCalculation {
  cost: number;
  displayText: string;
  isFree: boolean;
  ruleName?: string;
  isOnCall?: boolean; 
}

export function calculateShipping(subtotal: number, rules: ShippingRule[]): ShippingCalculation {
    if (!rules || rules.length === 0) {
        return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'fallback_free' };
    }

    let bestMatch: ShippingRule | null = null;

    for (const rule of rules) {
        if (subtotal >= rule.minAmount) {
            if (!bestMatch || rule.minAmount > bestMatch.minAmount) {
                bestMatch = rule;
            }
        }
    }

    if (bestMatch) {
        const { cost, name, isOnCall } = bestMatch;

        if (isOnCall) {
            return { 
                cost: 0, 
                displayText: "Calculated on Call", 
                isFree: false, 
                ruleName: name,
                isOnCall: true 
            };
        }

        return { 
            cost: cost, 
            displayText: cost > 0 ? `Rs. ${cost.toLocaleString()}` : "FREE", 
            isFree: cost === 0, 
            ruleName: name,
            isOnCall: false
        };
    }

    return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'fallback_no_rule_found' };
}

// 🔥 THE FIX IS HERE: Ab ye hamare naye Payload action se rules fetch karega
export async function calculateShippingCostServer(subtotal: number): Promise<ShippingCalculation> {
    try {
        const rules = await getShippingRulesAction(); // ✅ Switch to Payload Action
        return calculateShipping(subtotal, rules);
    } catch (error) {
        console.error("Error in calculateShippingCostServer:", error);
        return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'server_fallback_error' };
    }
}


import connectMongoose from "@/app/lib/checkout/mongoose";
import SettingModel, { IGateway, ISetting } from "@/models/Setting";
import { IOrder } from "@/models/Order";

// Gateway implementations
import * as cod from './gateways/cod';
import * as easypaisa from './gateways/easypaisa';
import * as jazzcash from './gateways/jazzcash';
import * as banktransfer from './gateways/banktransfer';

const gatewayImplementations = { cod, easypaisa, jazzcash, banktransfer };

// --- Helper Function ---
async function getGatewayConfig(): Promise<IGateway[]> {
  try {
    await connectMongoose();
    const settingsDoc = await SettingModel.findById('payment_gateways').lean<ISetting>();

    if (settingsDoc && settingsDoc.gateways) {
      return settingsDoc.gateways;
    }
    return []; 
  } catch (error) {
    console.error("CRITICAL: Error fetching payment gateway configuration:", error);
    return [];
  }
}

// --- UPDATE THIS FUNCTION ---
export async function getEnabledGateways(): Promise<any[]> {
  const allGateways = await getGatewayConfig();
  
  // Pehle hum yahan .filter() kar rahe thay, ab wo HATA DIYA hai.
  // Hum sab return karenge, lekin 'enabled' status sath bhejenge.
  return allGateways.map((gw) => {
      // Credentials safe karein (password/hashKey hata dein)
      const { hashKey, password, integritySalt, ...safeCredentials } = gw.credentials || {};
      
      return {
        key: gw.key,
        name: gw.name,
        enabled: gw.enabled, // ✅ Ye zaroori hai: Frontend ko batana ke ye ON hai ya OFF
        credentials: safeCredentials,
      };
    });
}

export async function initiatePayment(order: IOrder, gatewayKey: keyof typeof gatewayImplementations) {
  const allGateways = await getGatewayConfig();
  const gatewayConfig = allGateways.find((gw: any) => gw.key === gatewayKey && gw.enabled);
  if (!gatewayConfig) {
    throw new Error(`Payment gateway "${gatewayKey}" is not enabled or could not be found.`);
  }
  const implementation = gatewayImplementations[gatewayKey];
  if (!implementation || typeof implementation.createCheckoutSession !== 'function') {
    throw new Error(`Implementation for gateway "${gatewayKey}" is missing or invalid.`);
  }
  
  // ✅ FIX: Yahan bhi safe check laga diya (just in case)
  return implementation.createCheckoutSession(order as any, gatewayConfig.credentials || {});
}

export async function verifyPayment(gatewayKey: keyof typeof gatewayImplementations, requestData: any) {
  const allGateways = await getGatewayConfig();
  const gatewayConfig = allGateways.find((gw: any) => gw.key === gatewayKey);
  if (!gatewayConfig) {
    throw new Error(`Configuration for payment gateway "${gatewayKey}" could not be found.`);
  }
  const implementation = gatewayImplementations[gatewayKey];
  if (!implementation || typeof implementation.verifyPayment !== 'function') {
    throw new Error(`Verification logic for gateway "${gatewayKey}" is missing or invalid.`);
  }
  
  // ✅ FIX: Yahan bhi safe check laga diya
  return implementation.verifyPayment(requestData, gatewayConfig.credentials || {});
}
// src/app/lib/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Strongly typed global scope declaration to prevent TypeScript errors in development HMR
declare global {
  var globalRedisInstance: Redis | undefined;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "CRITICAL ARCHITECTURAL ERROR: Upstash Redis credentials are not configured in your .env.local file. " +
    "Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set."
  );
}

/**
 * Singleton Redis connection setup inside your rate-limiter to prevent connection leaks
 * during Next.js Hot Module Replacement (HMR) reloads.
 */
export const redis = process.env.NODE_ENV === "production"
  ? new Redis({ url: redisUrl, token: redisToken })
  : (global.globalRedisInstance || (global.globalRedisInstance = new Redis({ url: redisUrl, token: redisToken })));

// Create a new ratelimiter, that allows 5 requests per 10 seconds
export const ratelimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});


// /src/app/lib/zodSchemas.ts (COMPLETE, FINAL & FULLY COMMENTED)

import { z } from "zod";

// ====================================================================
// SECTION 1: USER & AUTHENTICATION SCHEMAS
// These schemas are for user accounts, login, registration, and password management.
// ====================================================================

// Whitelist for email domains to ensure registrations are from reliable providers.
const ALLOWED_EMAIL_DOMAINS = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'live.com',
    'yahoo.com', 'icloud.com', 'protonmail.com',
];

/**
 * @description For user registration. Now only requires name, email, and password.
 * This aligns with our new "Progressive Verification" flow.
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.email({ message: "Please use a valid email address." })
    .refine(email => {
        const domain = email.split('@')[1];
        return ALLOWED_EMAIL_DOMAINS.includes(domain.toLowerCase());
    }, { message: "Please use a valid email provider (e.g., Gmail, Outlook)." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

/**
 * @description For updating a user's name in their account settings.
 */
export const UpdateNameSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
});

/**
 * @description For when a user changes their password.
 */
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long." }),
})
.refine(data => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as the current one.",
  path: ["newPassword"],
});

/**
 * @description For when a user requests a password reset.
 */
export const RequestPasswordResetSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

/**
 * @description For when a user sets a new password using a token from email.
 */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is missing." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

/**
 * @description For verifying a user's email with an OTP.
 */
export const VerifyEmailSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

/**
 * @description For updating/verifying a user's phone number (e.g., during checkout).
 */
export const UpdatePhoneSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number with country code." }),
});

/**
 * @description For updating a user's role from the admin panel.
 */
export const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  newRole: z.enum(['Store Manager', 'Content Editor', 'customer']),
});

/**
 * @description For inviting a new admin from the admin panel.
 */
export const InviteAdminSchema = z.object({
  email: z.email({ message: "A valid email is required." }),
  role: z.enum(['Store Manager', 'Content Editor']),
});


// ====================================================================
// SECTION 2: E-COMMERCE & GENERAL FORM SCHEMAS
// ====================================================================

//  * @description For validating a user's shipping address.
//  * Updated to include Lat/Lng for map pinning.
//  */
export const AddressSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  phone: z.string().regex(/^((\+92)|(0))3\d{2}-?\d{7}$/, {
    message: "Please enter a valid Pakistani mobile number (e.g., 03001234567).",
  }),
  province: z.string().min(1, { message: "Province is required." }),
  city: z.string().min(1, { message: "City is required." }),
  area: z.string().min(3, { message: "Area or locality is required." }),
  address: z.string().min(5, { message: "Street address is required." }),
  // ADDED: Coordinates allow karein
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});
/**
 * @description For validating the request body of the 'create order' API.
 */
export const CreateOrderSchema = z.object({
  shippingAddress: AddressSchema,
  cartItems: z.array(z.any()).min(1, { message: "Cart cannot be empty." }),
  totalPrice: z.number(),
  couponCode: z.string().optional(),
});

/**
 * @description For the 'initiate payment' API.
 */
export const InitiatePaymentSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
  gatewayKey: z.string().min(1, { message: "Payment Gateway is required." }),
});

/**
 * @description For the Contact Us form.
 */
export const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

/**
 * @description For verifying a coupon code on the server.
 */
export const VerifyCouponSchema = z.object({
  code: z.string().min(1, { message: "Please enter a coupon code." }).transform(val => val.trim().toUpperCase()),
  cart: z.object({
    items: z.array(z.object({ _id: z.string(), price: z.number(), quantity: z.number(), categoryIds: z.array(z.string()).optional() })),
    subtotal: z.number().min(0),
  }),
});

/**
 * @description For when a user submits a product review.
 */
export const SubmitReviewSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is missing." }),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }).max(1000, { message: "Comment cannot be more than 1000 characters." }),
  reviewImageUrl: z.url({ message: "Please provide a valid image URL." }).optional(),
});

// ====================================================================
// SECTION 3: ADMIN PANEL & DATA MANAGEMENT SCHEMAS
// Yeh schemas admin panel ke andar data manage karne ke liye hain (orders, returns, bulk uploads).
// ====================================================================

/**
 * @description Admin jab kisi order ka status change karta hai.
 */
export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
  newStatus: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'On Hold']),
});

/**
 * @description Admin jab kisi customer ko custom email bhejta hai.
 */
export const SendCustomEmailSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

/**
 * @description Admin jab order cancel karta hai.
 */
export const CancelOrderSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is required." }),
});

/**
 * @description Return request ke andar ek single item ke liye.
 */
const ReturnItemSchema = z.object({
    productId: z.string(), variantKey: z.string(),
    quantity: z.number().min(1, { message: "Quantity must be at least 1." }),
    reason: z.string().min(3, { message: "A reason for return is required." }),
});

/**
 * @description Jab user ek nayi return request create karta hai.
 */
export const CreateReturnRequestSchema = z.object({
  orderId: z.string().min(1, { message: "Order ID is missing." }),
  orderNumber: z.string().min(1, { message: "Order Number is missing." }),
  items: z.string().transform((str, ctx) => {
    try {
        const parsed = JSON.parse(str);
        const itemsArray = z.array(ReturnItemSchema).min(1, { message: "You must select at least one item to return." });
        return itemsArray.parse(parsed);
    } catch (e) {
        ctx.addIssue({ code: "custom", message: "Invalid items format." });
        return z.NEVER;
    }
  }),
  customerComments: z.string().optional(),
});

/**
 * @description Admin jab return request ka status update karta hai.
 */
export const UpdateReturnStatusSchema = z.object({
  returnId: z.string().min(1, { message: "Return ID is required." }),
  status: z.enum(['Pending', 'Approved', 'Processing', 'Completed', 'Rejected']),
  resolution: z.enum(['Refund', 'StoreCredit', 'Replacement']).optional(),
  adminComments: z.string().optional(),
});

// ====================================================================
// SECTION 4: CMS (SANITY) & BULK UPLOAD SCHEMAS
// Yeh schemas Sanity me data create/update karne aur CSV files ko validate karne ke liye hain.
// ====================================================================

/**
 * @description Admin panel se category create ya update karne ke liye.
 */
export const UpsertCategorySchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  parentId: z.string().optional().nullable(),
});

/**
 * @description Admin panel se category delete karne ke liye.
 */
export const DeleteCategorySchema = z.object({
    categoryId: z.string().min(1, { message: "Category ID is required." }),
});

/**
 * @description Bulk category upload ke liye CSV ki har row ko validate karta hai.
 */
export const CategoryCsvRowSchema = z.object({
    name: z.string().min(1, { message: "CSV row missing 'name'." }),
    slug: z.string().min(1, { message: "CSV row missing 'slug'." }),
    parent_slug: z.string().optional(),
    image_url: z.url({ message: "Invalid 'image_url' in CSV." }).optional().or(z.literal('')),
});

/**
 * @description Product ki ek variant ke liye.
 */

const ProductVariantSchema = z.object({
    _key: z.string(),
    name: z.string().min(1),
    sku: z.string().optional(),
    price: z.number().min(0),
    salePrice: z.number().min(0).optional().nullable(),
    stock: z.number().min(0).optional().nullable(),
    inStock: z.boolean(),
    images: z.array(z.any()).optional(),
    weight: z.number().min(0).optional().nullable(),
    dimensions: z.object({ height: z.number().min(0).optional().nullable(), width: z.number().min(0).optional().nullable(), depth: z.number().min(0).optional().nullable() }).optional(),
    attributes: z.array(z.object({ _key: z.string(), name: z.string(), value: z.string() })),
});

export const ProductPayloadSchema = z.object({
  title: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.any().optional(),
  // 🔥 UPDATED: Added specifications here
  specifications: z.any().optional(), 
  videoUrl: z.url().optional().or(z.literal('')),
  brandId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOnDeal: z.boolean().optional(),
  rating: z.number().optional(),
  variants: z.array(ProductVariantSchema).min(1),
});

export const DeleteProductSchema = z.object({
    productId: z.string().min(1),
});

const CsvParentRowSchema = z.object({
  title: z.string().min(1, { message: "Parent row must have a 'title'." }),
  slug: z.string().min(1, { message: "Parent row must have a 'slug'." }),
  description: z.string().optional(),
  // 🔥 UPDATED: Added specifications here for CSV import
  specifications: z.string().optional(),
  brand: z.string().optional(),
  categories: z.string().optional(),
  videoUrl: z.url().optional().or(z.literal('')),
  isBestSeller: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isNewArrival: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isFeatured: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  isOnDeal: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  rating: z.coerce.number().optional(),
});

const CsvVariantRowSchema = z.object({
  variant_name: z.string().min(1, { message: "Variant row must have a 'variant_name'." }),
  variant_price: z.coerce.number().min(0, { message: "Variant price is invalid." }),
  variant_salePrice: z.coerce.number().optional(),
  variant_sku: z.string().optional(),
  variant_stock: z.coerce.number().optional(),
  variant_inStock: z.string().optional().transform(v => v?.toLowerCase() === 'true'),
  variant_images: z.string().optional(),
  variant_weight: z.coerce.number().optional(),
  variant_height: z.coerce.number().optional(),
  variant_width: z.coerce.number().optional(),
  variant_depth: z.coerce.number().optional(),
  variant_attributes: z.string().optional(),
  attribute1_name: z.string().optional(),
  attribute1_value: z.string().optional(),
  attribute2_name: z.string().optional(),
  attribute2_value: z.string().optional(),
  attribute3_name: z.string().optional(),
  attribute3_value: z.string().optional(),
});

export const ProductCsvRowSchema = z.union([
    CsvParentRowSchema.partial().extend(CsvVariantRowSchema.shape),
    CsvParentRowSchema,
]);

export const ProductGroupSchema = z.array(z.any())
  .min(1, { message: "Invalid group." }) // Allow min 1 for single row products
  .refine((group): group is [any, ...any[]] => group[0].title && group[0].slug, { 
    message: "Invalid group: The first row must be a parent row with a 'title' and 'slug'." 
  });



// ====================================================================
// SECTION 5: DYNAMIC SETTINGS SCHEMAS
// Yeh schemas admin panel ke "Settings" page se anay wale data ko validate karte hain.
// ====================================================================

const ShippingRuleSchema = z.object({
   _id: z.string().optional(),
    _key: z.string().optional(), 
  name: z.string().min(1, { message: "Rule name is required." }),
  minAmount: z.number().min(0),
  cost: z.number().min(0),
  // ✅ NEW: Boolean flag add kiya
  isOnCall: z.boolean().optional(),
});

export const SanitySettingsSchema = z.object({

  shippingRules: z.array(ShippingRuleSchema).optional().or(z.literal('')),
  storeContactEmail: z.email().optional().or(z.literal('')),
  storePhoneNumber: z.string().optional().or(z.literal('')),
  storeAddress: z.string().optional().or(z.literal('')),

  socialLinks: z.object({
    facebook: z.url().optional().or(z.literal('')),
    instagram: z.url().optional().or(z.literal('')),
    twitter: z.url().optional().or(z.literal('')),
  }).optional(),
});

const GatewayCredentialsSchema = z.looseObject({
  bankName: z.string().optional(),
  accountTitle: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  storeId: z.string().optional(),
  hashKey: z.string().optional(),
  merchantId: z.string().optional(),
  password: z.string().optional(),
  integritySalt: z.string().optional(),
});

const GatewaySchema = z.object({
  key: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  credentials: GatewayCredentialsSchema.optional(),
});

export const UpdatePaymentGatewaysSchema = z.array(GatewaySchema);

// --- SUMMARY OF CHANGES ---
// - **Implemented "Progressive Verification":** The `RegisterSchema` has been updated to remove the `phone` field. This is the main change to support our new, smoother user registration flow.
// - **Added Extensive Comments:** The file has been reorganized into logical sections (Auth, E-commerce, Admin, etc.) with detailed comments explaining the purpose of each schema. This significantly improves readability and maintainability for the future.

// src/app/auth.ts (FULLY COMPILED & TYPE-SAFE UPDATED BLUEPRINT)

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { cookies } from "next/headers";

import connectMongoose from "@/app/lib/checkout/mongoose";
import User, { IUser } from "@/models/User";
import UserEvent from "@/models/UserEvent"; // 🚀 Telemetry model

type LeanUser = Omit<IUser, keyof Document | '_v'> & {
  _id: Types.ObjectId;
  createdAt: Date; // Map createdAt for cohort evaluations
};

async function getFullUser(email: string): Promise<LeanUser | null> {
    await connectMongoose();
    return User.findOne({ email }).lean<LeanUser>();
}

const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },

  trustHost: true,
  useSecureCookies: isProduction,

  cookies: {
    sessionToken: {
      name: isProduction ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: isProduction ? '.pocketvalue.pk' : undefined, 
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

   Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
            const userDoc = await getFullUser(email as string);
            
            if (!userDoc) return null;
            if (!userDoc.password) return null;
            if (!userDoc.emailVerified) throw new Error("EmailNotVerified");
            
            const passwordsMatch = await bcrypt.compare(password as string, userDoc.password);
            if (passwordsMatch) {
              
              // 🚀 Gap #10: Calculate User Cohort Status (new vs returning user)
              const isNewUser = userDoc.createdAt && (Date.now() - new Date(userDoc.createdAt).getTime() < 15 * 60 * 1000); // 15 mins check
              const cohort = isNewUser ? 'new_user' : 'returning_user';

              return { 
                id: userDoc._id.toString(), 
                name: userDoc.name, 
                email: userDoc.email, 
                image: userDoc.image, 
                role: userDoc.role,
                phone: userDoc.phone,
                phoneVerified: userDoc.phoneVerified,
                cohort: cohort // Pass cohort dynamically
              } as any;
            }
        } catch (error) { 
            if (error instanceof Error) throw error;
            return null; 
        }
        return null;
      },
    }),
  ],
  
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login", error: '/login' },

  callbacks: {
    async signIn({ user, account }) {
        let cohortStatus: 'new_user' | 'returning_user' = 'returning_user';

        // Social Login Logic
        if (account?.provider === 'google' || account?.provider === 'facebook') {
            const { name, email, image } = user;
            if (!email) return false;
            
            try {
                await connectMongoose();
                const existingUser = await User.findOne({ email });

                if (existingUser) {
                    if (image && existingUser.image !== image) {
                       existingUser.image = image;
                       await existingUser.save();
                    }
                    user.id = existingUser._id.toString();
                    user.role = existingUser.role;
                    user.phone = existingUser.phone;
                    user.phoneVerified = existingUser.phoneVerified;
                    
                    cohortStatus = 'returning_user';
                } else {
                    const newUser = new User({ 
                        name, 
                        email, 
                        image, 
                        emailVerified: new Date(), 
                        role: 'customer',
                        phone: null,
                        phoneVerified: null
                    });
                    const savedUser = await newUser.save();
                    user.id = savedUser._id.toString();
                    user.role = savedUser.role;
                    user.phone = null;
                    user.phoneVerified = null;
                    
                    cohortStatus = 'new_user';
                }
                
                // Safe Type Assertion inline override for linter protection (Solution 2)
                (user as any).cohort = cohortStatus;

            } catch (error) {
                console.error("Social Sign In DB Error:", error);
                return false;
            }
        }

        // =================================================================
        // 🚀 SERVER-SIDE IDENTITY STITCHING: Link guest visitor ID on login (Gap #20)
        // =================================================================
        try {
          const cookieStore = await cookies();
          const visitorId = cookieStore.get("pv_visitor_id")?.value;
          const sessionId = cookieStore.get("pv_session_id")?.value;

          const activeCohort = (user as any).cohort || 'returning_user';

          if (sessionId && visitorId && user.id) {
            await UserEvent.create({
              sessionId,
              eventType: 'identity_merge',
              path: '/login',
              metadata: {
                visitorId,
                userId: user.id,
                cohort: activeCohort,
                timestamp: new Date().toISOString()
              }
            });
            console.log(`📡 Identity Stitched: visitorId ${visitorId} mapped to authenticated userId ${user.id}`);
          }
        } catch (stitchingError: any) {
          console.error("CRITICAL: Server-side Identity Stitching failed:", stitchingError.message);
        }
        // =================================================================

        return true;
    },
    
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        token.phone = user.phone;
        token.phoneVerified = user.phoneVerified;
        
        // 🚀 Pass cohort status to JWT Token (Gap #10)
        token.cohort = (user as any).cohort || 'returning_user';
      }

      if (trigger === "update" && session) {
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.phoneVerified !== undefined) token.phoneVerified = session.phoneVerified;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        session.user.phone = token.phone as string | null;
        session.user.phoneVerified = token.phoneVerified as Date | boolean | null;
        
        // 🚀 Pass cohort status from Token to Session object (Gap #10)
        (session.user as any).cohort = token.cohort as 'new_user' | 'returning_user';
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code', // Admin panel mein coupon code title ke taur par dikhega
    defaultColumns: ['code', 'discountType', 'isActive', 'expiryDate'],
  },
  access: {
    read: () => true, // Frontend ko coupons dekhne ki ijazat
    // Create, Update, Delete ke rules hum baad mein set karenge (e.g. sirf Super Admin)
  },
  fields: [
    {
      type: 'tabs', // ✅ Sanity ke "groups" ka behtareen replacement
      tabs: [
        // ==========================================
        // TAB 1: MAIN DETAILS
        // ==========================================
        {
          label: 'Main Details',
          fields: [
            {
              name: 'code',
              type: 'text',
              label: 'Coupon Code',
              required: true,
              unique: true, // Coupon code hamesha unique hona chahiye
              // Sanity ka uppercase/regex validation yahan bhi apply hoga
              validate: (val: any) => {
                if (val && /^[A-Z0-9_-]+$/.test(val) && val.toUpperCase() === val) return true
                return 'Code must be uppercase, no spaces (e.g., WELCOME10).'
              },
              admin: {
                description: 'Unique code customers enter (e.g., WELCOME10).',
              },
            },
            {
              name: 'description',
              type: 'textarea', // Sanity 'string' with rows ki jagah Payload 'textarea'
              label: 'Description (Internal Use)',
              required: true,
              admin: {
                description: 'A short note for what this coupon is for.',
              },
            },
            {
              name: 'isActive',
              type: 'checkbox', // Sanity 'boolean' ki jagah Payload 'checkbox'
              label: 'Is Active?',
              defaultValue: true,
              admin: {
                description: 'Turn this coupon on or off for all customers.',
              },
            },
          ],
        },

        // ==========================================
        // TAB 2: USAGE RULES & CONDITIONS
        // ==========================================
        {
          label: 'Usage Rules & Conditions',
          fields: [
            {
              name: 'discountType',
              type: 'radio', // Sanity 'string' options layout 'radio' ki jagah Payload 'radio'
              label: 'Discount Type',
              options: [
                { label: 'Percentage (%)', value: 'percentage' },
                { label: 'Fixed Amount (Rs.)', value: 'fixed' },
                { label: 'Free Shipping', value: 'freeShipping' },
              ],
              defaultValue: 'percentage',
              required: true,
            },
            {
              name: 'discountValue',
              type: 'number',
              label: 'Discount Value',
              min: 0,
              // Conditional field based on discountType
              admin: {
                description: 'Enter value (e.g., 15 for 15%, or 500 for Rs. 500).',
                condition: (data) => data.discountType !== 'freeShipping',
              },
            },
            {
              name: 'maximumDiscount',
              type: 'number',
              label: 'Maximum Discount (Rs.)',
              min: 0,
              admin: {
                description: 'Optional: Cap the percentage discount at this amount.',
                condition: (data) => data.discountType === 'percentage', // Sirf percentage ke liye
              },
            },
            {
              name: 'minimumPurchaseAmount',
              type: 'number',
              label: 'Minimum Purchase Amount (Rs.)',
              min: 0,
              admin: {
                description: 'Optional: Coupon applies if cart total is above this amount.',
              },
            },
            {
              name: 'startDate',
              type: 'date', // Sanity 'datetime' ki jagah Payload 'date' (time bhi include karega)
              label: 'Start Date',
              admin: {
                description: 'Coupon becomes active from this date and time.',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'expiryDate',
              type: 'date', // Sanity 'datetime' ki jagah Payload 'date'
              label: 'Expiry Date',
              admin: {
                description: 'Coupon will not be valid after this date and time.',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'totalUsageLimit',
              type: 'number',
              label: 'Total Usage Limit (for all customers)',
              min: 1,
              admin: {
                description: 'Total number of times this coupon can be used across all customers.',
              },
            },
            {
              name: 'usageLimitPerUser',
              type: 'number',
              label: 'Usage Limit Per Customer',
              min: 1,
              defaultValue: 1,
              admin: {
                description: 'How many times a single customer can use this coupon.',
              },
            },
          ],
        },

        // ==========================================
        // TAB 3: APPLICABILITY
        // ==========================================
        {
          label: 'Applicability',
          fields: [
            {
              name: 'isStackable',
              type: 'checkbox',
              label: 'Stackable Discount',
              defaultValue: false,
              admin: {
                description: 'If ON, this coupon can be used even if a product is already on sale.',
              },
            },
            {
              name: 'applicableTo',
              type: 'radio',
              label: 'Applicable To',
              options: [
                { label: 'Entire Order', value: 'entireOrder' },
                { label: 'Specific Products', value: 'specificProducts' },
                { label: 'Specific Categories', value: 'specificCategories' },
              ],
              defaultValue: 'entireOrder',
            },
            {
              name: 'applicableProducts',
              type: 'relationship',
              relationTo: 'products', // Products collection se link karein
              hasMany: true, // Multiple products select ho sakte hain
              admin: {
                description: 'The coupon will ONLY apply to these selected products.',
                condition: (data) => data.applicableTo === 'specificProducts',
              },
            },
            {
              name: 'applicableCategories',
              type: 'relationship',
              relationTo: 'categories', // Categories collection se link karein
              hasMany: true, // Multiple categories select ho sakte hain
              admin: {
                description: 'The coupon will ONLY apply to products within these selected categories.',
                condition: (data) => data.applicableTo === 'specificCategories',
              },
            },
          ],
        },
      ],
    },
  ],
}

// /src/app/lib/mongoose.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering, so we see errors immediately
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectMongoose;

// /src/app/lib/order-utils.ts

import connectMongoose from "./mongoose";
import OrderSequence from "@/models/OrderSequence";

const ORDER_ID_PREFIX = "PV";
const COUNTER_ID = "order_id_counter";

/**
 * Generates the next human-readable and sequential Order ID.
 * This function uses an atomic `findOneAndUpdate` operation on a dedicated
 * counter document in MongoDB, making it safe from race conditions even
 * under high traffic.
 * 
 * @returns {Promise<string>} A promise that resolves to the next formatted Order ID (e.g., "PV-1001").
 */
export async function generateNextOrderId(): Promise<string> {
  await connectMongoose();

  // Atomically find the counter document and increment its sequence_value by 1.
  // - `findOneAndUpdate` ensures this is a single, indivisible operation.
  // - `$inc` is the atomic increment operator.
  // - `upsert: true` creates the document if it doesn't exist on the very first run.
  // - `new: true` ensures the method returns the *new*, incremented document.
  const counter = await OrderSequence.findByIdAndUpdate(
    COUNTER_ID,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  if (!counter) {
    // This case should theoretically never happen with upsert:true, but it's good practice.
    throw new Error("Could not find or create the order sequence counter.");
  }

  // Format the new sequence value with the prefix.
  const nextId = `${ORDER_ID_PREFIX}-${counter.sequence_value}`;
  
  return nextId;
}

// --- SUMMARY OF CHANGES ---
// - Created a new, dedicated utility file `order-utils.ts` to house order-related helper functions.
// - Implemented the `generateNextOrderId` function.
// - The function connects to Mongoose and uses the `OrderSequence` model.
// - It leverages the atomic `findOneAndUpdate` with `$inc` to guarantee a unique, sequential number, making the entire process race-condition-safe and enterprise-grade.
// - The function formats the number with the "PV-" prefix to produce the final, human-readable ID.
import { Schema, model, models, Document } from 'mongoose';

export interface IAbandonedCart extends Document {
  sessionId: string;
  userId?: string;
  items: any[]; // Cart Items
  subtotal: number;
  contactCaptured: boolean; // Kya user ne checkout mein email/phone dala tha?
  email?: string;
  phone?: string;
  isRecovered: boolean;
  lastUpdated: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, ref: 'User', index: true },
  items: [{ type: Schema.Types.Mixed }],
  subtotal: { type: Number, default: 0 },
  contactCaptured: { type: Boolean, default: false },
  email: { type: String },
  phone: { type: String },
  isRecovered: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.AbandonedCart || model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);
import { Schema, model, models, Document } from 'mongoose';

export interface ICustomerRequest extends Document {
  productId?: string;
  requestedProductName?: string; // ✅ Naya Field for Universal Product Request
  requestType: 'restock' | 'missing_variant' | 'missing_product'; // ✅ 'missing_product' Added
  email: string;
  phone?: string;
  selectedAttributes?: Record<string, string>;
  customDetails?: string;
  urgencyLevel: 'normal' | 'urgent';
  status: 'pending' | 'notified' | 'ignored';
  createdAt: Date;
}

const CustomerRequestSchema = new Schema<ICustomerRequest>(
  {
    productId: { 
      type: String, 
      required: false, 
      index: true 
    },
    requestedProductName: { 
      type: String, 
      required: false 
    },
    requestType: { 
      type: String, 
      enum: ['restock', 'missing_variant', 'missing_product'], // ✅ Included 'missing_product'
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true
    },
    phone: { 
      type: String, 
      required: false, 
      trim: true 
    },
    selectedAttributes: { 
      type: Schema.Types.Mixed, 
      required: false 
    },
    customDetails: { 
      type: String, 
      required: false 
    },
    urgencyLevel: { 
      type: String, 
      enum: ['normal', 'urgent'], 
      default: 'normal',
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'notified', 'ignored'], 
      default: 'pending',
      required: true 
    }
  },
  { timestamps: true }
);

const CustomerRequest = models.CustomerRequest || model<ICustomerRequest>('CustomerRequest', CustomerRequestSchema);

export default CustomerRequest;

// /src/models/Order.ts

import { Schema, model, models, Document, Types } from "mongoose";
import { CleanCartItem } from "@/sanity/types/product_types";

// Interface defining the structure of the shipping address sub-document
interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

// Main Order interface for type safety, extending Mongoose's Document
export interface IOrder extends Document {
  _id: string; // Will be our custom human-readable ID
  orderId: string; // The same human-readable ID, indexed for fast lookups
  userId: string;
  products: (CleanCartItem & { productId: string })[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  coupon?: {
    code: string;
    amount: number;
  };
  totalPrice: number;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "On Hold";
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  transactionId?: string;
  trafficSource?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the nested shippingAddress object
const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false },
);

// Main Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    _id: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Indexed for fast lookups in admin panel
    },
    userId: {
      type: String, // Explicitly defined as String
      ref: "User", // Reference to the User model
      required: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.Mixed, // Storing CleanCartItem which is a flexible object
        required: true,
      },
    ],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    coupon: {
      code: String,
      amount: Number,
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "On Hold",
      ],
      default: "Pending",
      required: true,
    },
    paymentMethod: { type: String, default: "Pending", required: true },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
      required: true,
    },
    transactionId: { type: String },
    trafficSource: {
      source: String,
      medium: String,
      campaign: String,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    _id: false, // Disable default _id generation, as we are setting it manually
  },
);

// 🔥 PERFORMANCE FIX FOR ANALYTICS: Index on createdAt for fast date-range queries
OrderSchema.index({ createdAt: -1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;

// --- SUMMARY OF CHANGES ---
// - Created a new, dedicated Mongoose model file for `Order`, establishing a single source of truth for the data structure.
// - Implemented the "Smart Adapter" pattern by defining `_id` as a `String`.
// - Added the new `orderId` field, making it `required`, `unique`, and `indexed` for performance.
// - Added strict `enum` validation for the `status` and `paymentStatus` fields to prevent invalid data.
// - Enabled automatic `timestamps` to handle `createdAt` and `updatedAt`, which is a Mongoose best practice.
// - Disabled Mongoose's default `_id` generation (`_id: false`) because we will be providing our own custom string ID.
// - [ADDED] Added a high-performance descending index on `createdAt` to optimize date-range aggregation inside Analytics Dashboard.
// /src/models/OrderSequence.ts

import { Schema, model, models } from 'mongoose';

// Interface for type safety
export interface IOrderSequence {
  _id: string;
  sequence_value: number;
}

const OrderSequenceSchema = new Schema<IOrderSequence>({
  _id: { 
    type: String, 
    required: true 
  },
  sequence_value: { 
    type: Number, 
    default: 1000 // Start order numbers from 1001
  },
});

// Using models.OrderSequence to prevent recompiling the model on hot reloads
const OrderSequence = models.OrderSequence || model<IOrderSequence>('OrderSequence', OrderSequenceSchema);

export default OrderSequence;

// --- SUMMARY OF CHANGES ---
// - Created a new Mongoose schema and model named `OrderSequence`.
// - The schema is designed to hold a single document that acts as our atomic counter.
// - `_id` is a string to hold a constant identifier (e.g., "order_id_counter").
// - `sequence_value` is the number that will be incremented for each new order, starting from 1000.

// src/models/Setting.ts

import mongoose, { Schema, Document } from 'mongoose';

// ✅ FIXED INTERFACE: Index Signature add kiya aur extra line remove ki
export interface IGatewayCredentials { // Export kiya taake baqi files use kar saken
  [key: string]: string | undefined; // Allows dynamic key access
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  storeId?: string;
  hashKey?: string;
  merchantId?: string;
  password?: string;
  integritySalt?: string;
}

// Interface for a single gateway object in the array
export interface IGateway { // Exported for consistent use across components
  key: string;
  name: string;
  enabled: boolean;
  credentials?: IGatewayCredentials; // credentials optional bhi ho sakte hain
}

// 🔥 TS COMPILER FIX: Omit default _id from Document to allow custom string literal '_id'
export interface ISetting extends Omit<Document, '_id'> {
  _id: 'payment_gateways';
  gateways: IGateway[];
}

// Mongoose Schema for the nested credentials object
const GatewayCredentialsSchema = new Schema({
  bankName: { type: String },
  accountTitle: { type: String },
  accountNumber: { type: String },
  iban: { type: String },
  storeId: { type: String },
  hashKey: { type: String },
  merchantId: { type: String },
  password: { type: String },
  integritySalt: { type: String },
}, { _id: false }); // No _id for subdocuments

// Mongoose Schema for a single gateway
const GatewaySchema = new Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  credentials: { type: GatewayCredentialsSchema, default: {} },
}, { _id: false }); // No _id for subdocuments in the array

// Mongoose Schema for the main settings document
const SettingSchema = new Schema<ISetting>({
  _id: { type: String, default: 'payment_gateways' },
  gateways: { type: [GatewaySchema], required: true },
});

// Export the model, creating it if it doesn't already exist
export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema, 'settings');

// /src/models/User.ts (VERIFIED & CLEANED)

import { Schema, model, models, Document, Types } from "mongoose";

// Interface for the Address sub-document
export interface IAddress extends Document {
  _id: Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  isDefault: boolean;
  lat?: number | null;
  lng?: number | null;
}

// Main User interface, extending Mongoose's Document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "customer" | "Store Manager" | "Super Admin" | "Content Editor";
  emailVerified?: Date | null;
  phone?: string;
  phoneVerified?: Date | null;
  addresses: IAddress[];
  // Fields for verification and password reset
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the Address sub-document
const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
});

// Main User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["customer", "Store Manager", "Super Admin", "Content Editor"],
      default: "customer",
    },
    emailVerified: { type: Date, default: null },
    phone: { type: String },
    phoneVerified: { type: Date, default: null },
    addresses: [AddressSchema],
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
    passwordResetToken: { type: String }, // Field for password reset
    passwordResetExpires: { type: Date }, // Field for password reset
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

// 🔥 PERFORMANCE FIXES FOR ANALYTICS:
// 1. Single Index on createdAt for registration tracking
UserSchema.index({ createdAt: -1 });

// 2. Compound Index on role and createdAt to exclude admins from customer growth reports
UserSchema.index({ role: 1, createdAt: -1 });

const User = models.User || model<IUser>("User", UserSchema);

export default User;

// --- SUMMARY OF CHANGES ---
// - Added `passwordResetToken` and `passwordResetExpires` to the IUser interface and UserSchema. This was missing but is used in your `authActions.ts` file, ensuring complete type safety.
// - No other logical changes were needed. The file is already well-structured for our new architecture.
// - [ADDED] Added single index on `createdAt` and a compound index on `role` and `createdAt` to optimize customer acquisition reporting and exclude admin accounts from business analytics.


import { Schema, model, models, Document } from 'mongoose';

export interface IUserEvent extends Document {
  sessionId: string;
  eventType: 
    // =================================================================
    // ⚓ 1. CORE SYSTEM EVENTS
    // =================================================================
    | 'page_view' 
    | 'add_to_cart' 
    | 'remove_from_cart' 
    | 'checkout_start' 
    | 'search' 
    | 'wishlist_add' 
    | 'wishlist_remove' 
    | 'purchase'

    // =================================================================
    // 📦 2. CHECKOUT, PAYMENT & COUPON FRICTION EVENTS
    // =================================================================
    | 'checkout_step_view'
    | 'checkout_error'
    | 'shipping_method_selected'
    | 'payment_method_selected'
    | 'coupon_applied'
    | 'coupon_removed'
    | 'form_field_interaction'
    | 'auth_session_expired'
    | 'gateway_redirect_initiated'
    | 'coupon_auto_applied'

    // =================================================================
    // 📦 3. USER IDENTITY, AUTH & ONBOARDING EVENTS
    // =================================================================
    | 'auth_attempt'
    | 'login_prompt_triggered'
    | 'identity_merge'
    | 'cart_rehydrated'
    | 'cart_merged'
    | 'profile_fields_updated'

    // =================================================================
    // 📦 4. SEARCH, DISCOVERY & PDP TELEMETRY EVENTS
    // =================================================================
    | 'back_in_stock_subscription'
    | 'filter_applied'
    | 'pdp_interaction'
    | 'search_result_click'
    | 'product_impression'
    | 'product_click'
    | 'variant_price_compared'
    | 'pdp_media_interaction'

    // =================================================================
    // 📦 5. UI TECHNICAL HEALTH, PERFORMANCE & FRICTION EVENTS
    // =================================================================
    | 'exit_intent_triggered'
    | 'js_exception'
    | 'performance_metric'
    | 'rage_click_detected'
    | 'cart_desync_error'

    // =================================================================
    // 📦 6. CAMPAIGN ATTRIBUTION, OPERATIONS & LIFECYCLE EVENTS
    // =================================================================
    | 'banner_click'                 // Gap #6: Sliders/Promo banners click tracking
    | 'oos_attempt'                  // Gap #17: Dynamic clicks on OOS elements
    | 'session_start'                // Gap #18: Campaign UTM parameters session start
    | 'crm_sync'                     // Gap #19: Operational CRM status mappings
    | 'support_engagement_click'     // Gap #25: Helpdesk/WhatsApp floating link click
    | 'policy_page_view'             // Gap #26: Dynamic policy pages engagement
    | 'shipping_threshold_proximity' // Gap #27: Free shipping targets proximity
    | 'scarcity_exposure'            // Gap #28: Low stock urgency alert exposures
    | 'experiment_variant_exposed'   // Gap #29: Layout variant bucket mappings
    | 'rto_risk_flagged'             // Gap #32: Address/Profile dynamic RTO flags
    | 'return_portal_drop'           // Gap #40: Sourcing portals step drop-offs
    | 'product_shared'               // Gap #42: PDP copy link / whatsapp shares
    | 'logistics_delay'              // Gap #43: Shipping courier latency metrics
    | 'cookie_consent_toggled'       // Gap #49: Dynamic consent banner clicks
    | 'pwa_prompt_metric'            // Gap #51: PWA install triggers metrics
    | 'recovered_cart_conversions'   // Gap #52: Dynamic cart recovery attribution
    | 's2s_purchase';                // Gap #24: Server-to-server adblocker bypass purchases

  path: string; // URL path e.g. /product/handbag
  metadata?: any; // Extra info e.g. productID, search term
  createdAt: Date;
}

const UserEventSchema = new Schema<IUserEvent>(
  {
    sessionId: { 
      type: String, 
      required: true, 
      index: true 
    },
    eventType: { 
      type: String, 
      enum: [
        // =================================================================
        // ⚓ 1. CORE SYSTEM EVENTS
        // =================================================================
        'page_view', 
        'add_to_cart', 
        'remove_from_cart', 
        'checkout_start', 
        'search', 
        'wishlist_add', 
        'wishlist_remove', 
        'purchase',

        // =================================================================
        // 📦 2. CHECKOUT, PAYMENT & COUPON FRICTION EVENTS
        // =================================================================
        'checkout_step_view',
        'checkout_error',
        'shipping_method_selected',
        'payment_method_selected',
        'coupon_applied',
        'coupon_removed',
        'form_field_interaction',
        'auth_session_expired',
        'gateway_redirect_initiated',
        'coupon_auto_applied',

        // =================================================================
        // 📦 3. USER IDENTITY, AUTH & ONBOARDING EVENTS
        // =================================================================
        'auth_attempt',
        'login_prompt_triggered',
        'identity_merge',
        'cart_rehydrated',
        'cart_merged',
        'profile_fields_updated',

        // =================================================================
        // 📦 4. SEARCH, DISCOVERY & PDP TELEMETRY EVENTS
        // =================================================================
        'back_in_stock_subscription',
        'filter_applied',
        'pdp_interaction',
        'search_result_click',
        'product_impression',
        'product_click',
        'variant_price_compared',
        'pdp_media_interaction',

        // =================================================================
        // 📦 5. UI TECHNICAL HEALTH, PERFORMANCE & FRICTION EVENTS
        // =================================================================
        'exit_intent_triggered',
        'js_exception',
        'performance_metric',
        'rage_click_detected',
        'cart_desync_error',

        // =================================================================
        // 📦 6. CAMPAIGN ATTRIBUTION, OPERATIONS & LIFECYCLE EVENTS
        // =================================================================
        'banner_click',
        'oos_attempt',
        'session_start',
        'crm_sync',
        'support_engagement_click',
        'policy_page_view',
        'shipping_threshold_proximity',
        'scarcity_exposure',
        'experiment_variant_exposed',
        'rto_risk_flagged',
        'return_portal_drop',
        'product_shared',
        'logistics_delay',
        'cookie_consent_toggled',
        'pwa_prompt_metric',
        'recovered_cart_conversions',
        's2s_purchase'
      ],
      required: true 
    },
    path: { 
      type: String, 
      required: true 
    },
    metadata: { 
      type: Schema.Types.Mixed 
    },
  }, 
  { timestamps: true }
);

const UserEvent = models.UserEvent || model<IUserEvent>('UserEvent', UserEventSchema);

export default UserEvent;
import { Schema, model, models, Document } from "mongoose";

export interface IUserSession extends Document {
  visitorId: string;   // 👈 Long-term ID (Permanent for 30 days)
  sessionId: string;   // 👈 Short-term ID (Changes if Source changes)
  userId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: "mobile" | "desktop" | "tablet";
  os: string;
  browser: string;
  city?: string;
  country?: string;
  lastPulse: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    visitorId: { type: String, required: true, index: true }, 
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: "User", index: true },
    utmSource: { type: String, default: "Direct" },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    device: { type: String, enum: ["mobile", "desktop", "tablet"], default: "desktop" },
    os: { type: String },
    browser: { type: String },
    city: { type: String },
    country: { type: String },
    lastPulse: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.UserSession || model<IUserSession>("UserSession", UserSessionSchema);
// --- Reusable Interfaces ---
export interface SanityImageObject {
  url: any;
  _type: 'image';
  asset: { _ref: string; _type: 'reference'; };
}

// === NEW INTERFACE FOR BREADCRUMBS ===
export interface BreadcrumbItem {
  name: string;
  href: string;
}
export interface VariantAttribute {
  _key: string;
  name: string;
  value: string;
}
// === NAYI INTERFACE: SHIPPING DIMENSIONS KE LIYE ===
export interface Dimension {
  height?: number;
  width?: number;
  depth?: number;
}


// === SUPERCHARGED INTERFACE: YEH MUKAMMAL TOR PAR NAYI HAI ===
// Yeh ab har variant ki mukammal details rakhegi.
export interface ProductVariant {
  _key: string;
  name: string;
  sku?: string;
  
  // Pricing & Stock (ab variant level par)
  price: number;
  salePrice?: number;
  inStock: boolean;
   stock?: number;   // === YEH NAYI LINE MISSING THI ===

  // Media (ab variant level par)
  images?: SanityImageObject[];
  
  // Attributes & Physical Details
  attributes: VariantAttribute[];
  weight?: number;
  dimensions?: Dimension;
}
export interface ProductReview {
  isVerifiedPurchase: Boolean;
  _id: string;
  rating: number;
  comment: string;
  _createdAt: string;

  // NAYA: 'userName' ki jagah poora 'user' object
  user: {
    name: string;
    image?: string; // User ki profile picture ka URL (optional ho sakta hai)
  };
  
  // NAYA: Review ke saath di gayi image (optional)
  reviewImage?: SanityImageObject;
}

export interface Specification {
  _key: string;
  label: string;
  value: string;
}

// --- Main Document Interfaces ---

// === SUPERCHARGED INTERFACE (THE FINAL CORRECTED VERSION) ===
export default interface SanityProduct {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  // === YAHAN NAYA FIELD ADD HUA HAI ===
  videoUrl?: string; // Optional video URL
  // Variants array ab LAZMI hai
  variants: ProductVariant[];

  // === NAYA FIELD #1: YEH FIELD QUERIES.TS SE AA RAHA HAI ===
  // Yeh hamesha product ke pehle variant ko hold karega.
  defaultVariant: ProductVariant; 

  // Common details
  description?: any;
  brand?: SanityBrand;
  categories?: SanityCategory[];

  // === NAYA FIELD #2: YEH BHI QUERIES.TS SE AA RAHA HAI ===
  // Yeh sirf category IDs ka ek aasan array hai filtering ke liye.
  categoryIds?: string[];
  
  specifications?: Specification[];
  shippingAndReturns?: any;
  
  // Marketing & Reviews
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviews?: ProductReview[];
  reviewCount?: number;
}


export interface SanityBrand {
  _id: string;
  name: string;
  slug: string;
  logo: SanityImageObject;
}
export interface SanityCategory {
  parent: any;
  _id: string;
  name: string;
  slug: string;
  image?: string; 
  subCategories?: SanityCategory[];
  products?: SanityProduct[]; // products optional ho sakte hain
 // === FIELDS UPDATE HUAY HAIN ===
  desktopBanner?: SanityImageObject; // `banner` ke bajaye
  mobileBanner?: SanityImageObject;  // Naya field
  description?: string;
}

// Yeh nayi type hai jo hamari query return karegi
export interface CategoryPageData {
  currentCategory: SanityCategory;
  categoryTree: SanityCategory;
}
export interface HeroCarouselSlide {
    _id: string;
    title: string;
    subtitle?: string;
    buttonText: string;
    link: string;
    desktopImage: string;
    mobileImage: string;
}

export interface HomepageData {
  featuredProductsTitle?: string;
  featuredProducts: SanityProduct[];
  featuredCategoriesTitle?: string;
  featuredCategories: SanityCategory[];
  bestSellersTitle?: string;
  bestSellers: SanityProduct[];
  newArrivalsTitle?: string;
  newArrivals: SanityProduct[];
}



// Yeh cart item ab variant ki details bhi save karega
export interface CleanCartItem {
    _id: string; // Product ID
    cartItemId: string; // Unique ID for this cart item (e.g., productID-variantKey)
    name: string; // "T-Shirt (Red / L)"
    price: number;
    image: SanityImageObject;
    slug: string;
    quantity: number;
    sku?: string; // 🔥 FIXED: Strictly defined optional SKU for typescript compiler compatibility!
    // Variant ki details
       // === YEH NAYI LINE ADD HUI HAI ===
    categoryIds?: string[]; // Product ki categories ke IDs
    variant?: {
      _key: string;
      name: string;
    }
}

export interface CleanWishlistItem {
    _id: string;
    name: string;
    price: number;
    image: any;
    slug: string;
}

export interface Author {
  _type: 'author';
  name: string;
  slug: { current: string };
  image: SanityImageObject;
  bio?: any;
}

export interface PortableTextBlock {
  _key: string;
  _type: 'block';
  children: {
    _key: string;
    _type: 'span';
    marks: string[];
    text: string;
  }[];
  markDefs: any[]; // Links waghera ke liye
  style: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote';
}


// Ab `Post` interface mein `any` ke bajaye is nayi type ko use karein
export interface Post {
  _updatedAt: string | number | Date;
  _id: string;
  title: string;
  slug: string; // Isay simple string kar diya hai, kyunke hum query mein ".current" use kar rahe hain
  
  // getSinglePost ke liye
  author?: Author;
  body?: PortableTextBlock[];
  
  // getAllPosts ke liye (yeh optional honge)
  authorName?: string;
  authorImage?: SanityImageObject;
  
  mainImage: SanityImageObject;
  categories?: SanityCategory[]; // Optional banaya
  publishedAt: string;
  excerpt: string;
}

// ... (aapki saari purani interfaces wesi hi rahengi)

// === NAYI INTERFACES START HERE ===

// Interface for the Lifestyle Banner data
export interface LifestyleBanner {
  _id: string;
  title: string;
  subtitle?: string;
  link: string;
  buttonText?: string;
  mediaType: 'image' | 'video';
  
  // Image URLs
  desktopImage?: string;
  mobileImage?: string;  

  // --- HYBRID VIDEO FIELDS ---
  // Option 1: Direct Upload (Sanity se aane wale URLs)
  desktopVideoFile?: string;
  mobileVideoFile?: string;  
  
  // Option 2: External URL (Cloudinary URL)
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;   
}


// Interface for a single informational page
export interface Page {
  _id: string;
  title: string;
  body: any; // PortableText `any` rakha hai, isko @portabletext/react handle karega
}

// Interface for a single FAQ item
export interface FaqItem {
  _key: string;
  question: string;
  answer: any; // PortableText
}

// Interface for the entire FAQ Page data
export interface FaqPage {
  _id: string;
  title: string;
  faqList: FaqItem[];
}// ... (aapki saari purani interfaces wesi hi rahengi)

// === NAYI INTERFACES START HERE ===

// Interface for the Lifestyle Banner data
// ... baaki saari interfaces ...

export interface LifestyleBanner {
  _id: string;
  title: string;
  subtitle?: string;
  link: string;
  buttonText?: string;
  mediaType: 'image' | 'video';
  desktopImage?: string; // Optional (string URL)
  mobileImage?: string;  // Optional (string URL)
  desktopVideo?: string; // Optional (string URL)
  mobileVideo?: string;  // Optional (string URL)
}

// Interface for a single informational page
export interface Page {
  _id: string;
  title: string;
  body: any; // PortableText `any` rakha hai, isko @portabletext/react handle karega
}

// Interface for a single FAQ item
export interface FaqItem {
  _key: string;
  question: string;
  answer: any; // PortableText
}

// Interface for the entire FAQ Page data
export interface FaqPage {
  _id: string;
  title: string;
  faqList: FaqItem[];
}


export interface FlashSaleData {
  title: string;
  endDate: string; // ISO date string
  products: SanityProduct[];
}

export interface Coupon {
  _id: string;
  _type: 'coupon';
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'freeShipping';
  discountValue?: number;
  maximumDiscount?: number;
  isActive: boolean;
  minimumPurchaseAmount?: number;
  startDate?: string;
  expiryDate?: string;
  totalUsageLimit?: number;
  usageLimitPerUser?: number;
  forNewCustomersOnly?: boolean;
  applicableProducts?: {_ref: string, _type: 'reference'}[];
  applicableCategories?: {_ref: string, _type: 'reference'}[];
  isStackable?: boolean;
}


// src/sanity/lib/payload/product.queries.ts
import { getSafePayload } from "@/app/lib/payloadInstance"; // 🚀 getPayload ko getSafePayload se replace kiya
import SanityProduct from "../../types/product_types";
import { getPayloadReviewsForProduct } from "./review.queries";
import { mapPayloadProductToSanity } from "./plp/productMapper";
import { lexicalToPortableText } from "./types/lexicalHelper";
import { cache } from "react";

// GET SINGLE PRODUCT (PDP)
export const getPayloadSingleProduct = cache(
  async (slug: string): Promise<SanityProduct | null> => {
    // 🚀 getSafePayload call to prevent MongoClientClosedError
    const payload = await getSafePayload(); 

    const result = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 2,
    });

    const doc: any = result.docs[0];
    if (!doc) return null;

    const reviews = await getPayloadReviewsForProduct(doc.id);
    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating =
      totalReviews > 0 ? sumRatings / totalReviews : doc.rating || 0;

    return {
      _id: doc.id,
      _createdAt: doc.createdAt,
      title: doc.title,
      slug: doc.slug,
      videoUrl: doc.videoUrl || undefined,

      // Stable key allocation preserved
      variants:
        doc.variants?.map((v: any, index: number) => ({
          _key: v.id || v.sku || `variant-${index}`, 
          name: v.name,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
          inStock: v.inStock,
          attributes:
            v.attributes?.map((attr: any, aIndex: number) => ({
              _key: attr.id || `attr-${index}-${aIndex}`, 
              name: attr.name,
              value: attr.value,
            })) || [],
          images:
            v.images?.map((img: any, iIndex: number) => {
              const imgUrl =
                typeof img === "object" && img !== null ? img.url : "";
              return {
                _type: "image",
                url: imgUrl,
                asset: {
                  _ref: img.id || `img-${index}-${iIndex}`,
                  _type: "reference",
                }, 
              };
            }) || [],
          weight: v.weight || undefined,
          dimensions: v.dimensions || undefined,
        })) || [],

      defaultVariant: doc.variants?.[0]
        ? {
            _key: doc.variants[0].id || doc.variants[0].sku || "variant-0", 
            name: doc.variants[0].name,
            sku: doc.variants[0].sku,
            price: doc.variants[0].price,
            salePrice: doc.variants[0].salePrice,
            stock: doc.variants[0].stock,
            inStock: doc.variants[0].inStock,
            attributes:
              doc.variants[0].attributes?.map((attr: any, aIndex: number) => ({
                _key: attr.id || `attr-0-${aIndex}`,
                name: attr.name,
                value: attr.value,
              })) || [],
            images:
              doc.variants[0].images?.map((img: any, iIndex: number) => ({
                _type: "image",
                url: typeof img === "object" && img !== null ? img.url : "",
                asset: {
                  _ref: img.id || `img-0-${iIndex}`,
                  _type: "reference",
                },
              })) || [],
          }
        : undefined,

      description: lexicalToPortableText(doc.description),
      shippingAndReturns: lexicalToPortableText(doc.shippingAndReturns),

      specifications:
        doc.specifications?.map((spec: any, index: number) => ({
          _key: spec.id || `spec-${index}`, 
          label: spec.label,
          value: spec.value,
        })) || [],

      brand:
        doc.brand && typeof doc.brand === "object"
          ? {
              _id: doc.brand.id,
              name: doc.brand.name,
              slug: doc.brand.slug,
            }
          : undefined,
          
      categoryIds: Array.isArray(doc.categories)
        ? doc.categories.map((c: any) => (typeof c === "object" ? c.id : c))
        : [],

      categories: Array.isArray(doc.categories)
        ? doc.categories.map((c: any) =>
            typeof c === "object"
              ? {
                  _id: c.id,
                  name: c.name,
                  slug: c.slug,
                }
              : { _id: c },
          )
        : [],

      rating: averageRating,
      reviewCount: totalReviews,
      reviews: reviews,

      seo: doc.seo,
    } as unknown as SanityProduct;
  },
);

// =====================================================================
// 🔥 STOCK STATUS FETCHING (WITH SAFE PAYLOAD CONNECTION)
// =====================================================================
export async function getPayloadProductsStockStatus(
  productIds: string[],
): Promise<any[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  try {
    // 🚀 Direct getPayload call replaced with getSafePayload() to prevent MongoClientClosedError
    const payload = await getSafePayload();

    const result = await payload.find({
      collection: "products",
      where: {
        id: { in: productIds }, 
      },
      depth: 0, 
    });

    // ✅ FIX TS-7006: Typecast 'doc' parameter to 'any'
    return result.docs.map((doc: any) => ({
      _id: doc.id,
      variants:
        doc.variants?.map((v: any, index: number) => ({
          _key: v.id || v.sku || `variant-${index}`, 
          inStock: v.inStock,
          stock: v.stock,
          price: v.price,
          salePrice: v.salePrice,
        })) || null,
    }));
  } catch (error) {
    console.error("Failed to fetch product stock status from Payload:", error);
    return [];
  }
}

// === WishlistLiveData Fetcher (WITH SAFE PAYLOAD CONNECTION) ===
export const getPayloadLiveProductDataForCards = async (
  productIds: string[],
): Promise<SanityProduct[]> => {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  
  // 🚀 Direct getPayload call replaced with getSafePayload() to prevent MongoClientClosedError
  const payload = await getSafePayload();

  const result = await payload.find({
    collection: "products",
    where: {
      id: { in: productIds }, 
    },
    depth: 1, 
  });

  // ✅ FIX TS-7006: Typecast 'doc' parameter to 'any'
  return result.docs.map((doc: any) => {
    const reviews: any[] = []; 
    return mapPayloadProductToSanity(doc, reviews);
  });
};

// 🔥 RELATED PRODUCTS LOGIC (WITH SAFE PAYLOAD CONNECTION)
export const getPayloadRelatedProducts = async (
  currentProductId: string,
  categoryIds: string[],
): Promise<SanityProduct[]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  // 🚀 Direct getPayload call replaced with getSafePayload() to prevent MongoClientClosedError
  const payload = await getSafePayload();

  try {
    const result = await payload.find({
      collection: "products",
      where: {
        and: [
          { categories: { in: categoryIds } },
          { id: { not_equals: currentProductId } },
        ],
      },
      limit: 10,
      depth: 2,
      sort: "-createdAt",
    });

    // ✅ FIX TS-7006: Typecast 'doc' parameter to 'any'
    const relatedProducts = await Promise.all(
      result.docs.map(async (doc: any) => {
        const reviews = await getPayloadReviewsForProduct(doc.id);
        return mapPayloadProductToSanity(doc, reviews);
      }),
    );

    return relatedProducts;
  } catch (error) {
    console.error("Failed to fetch related products from Payload:", error);
    return [];
  }
};

export const getPayloadProductsBySlugs = async (
  slugs: string[],
): Promise<SanityProduct[]> => {
  if (!slugs || slugs.length === 0) return [];

  // 🚀 Direct getPayload call replaced with getSafePayload() to prevent MongoClientClosedError
  const payload = await getSafePayload();
  const result = await payload.find({
    collection: "products",
    where: {
      slug: {
        in: slugs, 
      },
    },
    depth: 1, 
  });

  // ✅ FIX TS-7006: Typecast 'doc' parameter to 'any'
  return result.docs.map((doc: any) => mapPayloadProductToSanity(doc, []));
};

// src/app/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimiter } from "./app/lib/telemetry/rate-limiter";
import { ipAddress } from "@vercel/functions";
import { v4 as uuidv4 } from "uuid";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // 1. BYPASS LOGIC
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. IDENTITY & SOURCE DETECTION
  let visitorId: string = req.cookies.get("pv_visitor_id")?.value || "";
  if (!visitorId) {
    visitorId = uuidv4();
  }

  const urlSource = searchParams.get("utm_source");
  const cookieSource = req.cookies.get("utm_source")?.value;

  let sessionId: string = req.cookies.get("pv_session_id")?.value || "";

  let shouldResetSession = false;
  if (!sessionId) {
    shouldResetSession = true;
  } else if (urlSource && urlSource !== cookieSource) {
    shouldResetSession = true; 
  }

  if (shouldResetSession) {
    sessionId = uuidv4(); 
  }

  // Header cloning
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pv-visitor-id", visitorId);
  requestHeaders.set("x-pv-session-id", sessionId);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 3. COOKIE CONFIGURATION
  const cookieConfig = { httpOnly: true, path: "/", sameSite: "lax" as const };

  res.cookies.set("pv_visitor_id", visitorId, {
    ...cookieConfig,
    maxAge: 60 * 60 * 24 * 30,
  });

  res.cookies.set("pv_session_id", sessionId, {
    ...cookieConfig,
    maxAge: 30 * 60, 
  });

  // ================================================================
  // 🚀 GAP #18: CAMPAIGN ATTRIBUTION HANDSHAKE (session_start)
  // ================================================================
  if (shouldResetSession && urlSource) {
    res.cookies.set("pv_session_start_pending", "true", {
      ...cookieConfig,
      httpOnly: false, // Client-side (IntelligenceTracker) reads and triggers
      maxAge: 60 * 5,  // 5 minutes expiry
    });
  }

  // ================================================================
  // 🚀 GAP #52: RECOVERED CART ATTRIBUTION HANDSHAKE
  // ================================================================
  const utmCampaign = searchParams.get("utm_campaign") || "";
  const isRecoveryLink = searchParams.get("ref") === "cart_recovery" || 
                         utmCampaign.toLowerCase().includes("recovery");

  if (isRecoveryLink) {
    res.cookies.set("pv_recovered_cart_pending", "true", {
      ...cookieConfig,
      httpOnly: false, // Client-side reads and triggers
      maxAge: 60 * 30, // 30 minutes expiry
    });
  }

  // ================================================================
  // 🚀 ATTRIBUTION PERSISTENCE: Lock coupon codes from URL parameters
  // ================================================================
  const urlCoupon = searchParams.get("coupon");
  if (urlCoupon) {
    res.cookies.set("pv_auto_coupon", urlCoupon.toUpperCase(), {
      ...cookieConfig,
      httpOnly: false, // Accessible by client hooks
      maxAge: 60 * 60 * 24, 
    });
  }

  // Campaign UTM Attribution Logic
  if (urlSource) {
    res.cookies.set("utm_source", urlSource, {
      ...cookieConfig,
      maxAge: 60 * 60 * 24, 
    });
    res.cookies.set(
      "utm_medium",
      searchParams.get("utm_medium") || "None",
      { ...cookieConfig, maxAge: 60 * 60 * 24 }
    );
    res.cookies.set(
      "utm_campaign",
      searchParams.get("utm_campaign") || "None",
      { ...cookieConfig, maxAge: 60 * 60 * 24 }
    );
  } else if (!cookieSource) {
    res.cookies.set("utm_source", "Direct", cookieConfig);
    res.cookies.set("utm_medium", "None", cookieConfig);
    res.cookies.set("utm_campaign", "None", cookieConfig);
  }

  // Security Auth guard
  const isProduction = process.env.NODE_ENV === "production";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  const protectedRoutes = ["/account", "/wishlist", "/checkout"];
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth rate limiting
  const sensitivePostRoutes = [
    "/api/auth/register",
    "/api/auth/callback/credentials",
  ];
  if (
    req.method === "POST" &&
    sensitivePostRoutes.some((route) => pathname.startsWith(route))
  ) {
    const ip = ipAddress(req) || "127.0.0.1";
    try {
      const { success } = await ratelimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429 }
        );
      }
    } catch (e) {
      console.error("Rate limit check bypassed");
    }
  }

  res.headers.set("x-pv-is-converted", !!token ? "true" : "false");
  res.headers.set("x-pv-user-agent", userAgent);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// src/app/page.tsx
import { Suspense, cache } from "react";
import { getPayloadHomepageData } from "@/sanity/lib/payload/homepage.queries";
import HeroSection from "../components/home/HeroSection";
import HeroSkeleton from "../components/home/HeroSkeleton";
import RenderSection from "../components/home/builder/RenderSection";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// 🔥 DEDUPLICATION: Cache the DB response for the entire request lifecycle
const getHomepageData = cache(async () => {
  return await getPayloadHomepageData();
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomepageData();
  const seo = data?.seo || {};

  return generateBaseMetadata({
    title: seo.metaTitle || "PocketValue - Smart Shopping",
    description: seo.metaDescription || "Find the best deals and values.",
    image: seo.ogImage,
    path: "/",
  });
}

export default async function Home() {
  const homepageData = await getHomepageData();
  const pageSections = homepageData?.pageSections || [];

  return (
    <main className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* 1. HERO (Static/Heavy LCP Section) */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* 2. DYNAMIC PAGE BUILDER */}
      <div className="w-full">
        {pageSections.length > 0 ? (
          <div className="flex flex-col w-full">
            {pageSections.map((section: any) => (
              <RenderSection
                // 🔥 FIX: Using Payload's 'id' as stable React key
                key={section.id || section._key || Math.random().toString()}
                section={section}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-gray-400">
            Homepage content is being prepared in the Dashboard.
          </div>
        )}
      </div>
    </main>
  );
}



// // src/app/(main)/layout.tsx

import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { AppStateProvider } from "../context/StateContext";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../providers/AuthProvider";
import Script from "next/script";
import "../globals.css";

import { ThemeProvider } from "next-themes";
import MainLayoutClient from "../components/layout/MainLayoutClient";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import CookieConsent from "../components/ui/CookieConsent"; // 🚀 Dynamic Cookie Consent Component Import
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";

import { getPayloadNavigationCategories } from "@/sanity/lib/payload/category.queries";
import { getPayloadSearchSuggestions } from "@/sanity/lib/payload/settings.queries";
import { SanityCategory } from "@/sanity/types/product_types";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import NextTopLoader from "nextjs-toploader";
import { fetchGlobalSettingsAction } from "../actions/globalSettingsActions";
import IntelligenceTracker from "../components/telemetry/IntelligenceTracker";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchGlobalSettingsAction();
  const baseSEO = generateBaseMetadata({
    title: settings.seo?.metaTitle || settings.siteName,
    description: settings.seo?.metaDescription,
    image: settings.seo?.ogImage,
    path: `/`,
  });

  return {
    ...baseSEO,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.siteName || "PocketValue",
    },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Safe Header extraction for Server-to-Client Bridge
  const headerList = await headers();
  
  const sessionId = headerList.get("x-pv-session-id") || `pv-srv-sess-${crypto.randomUUID()}`;
  const visitorId = headerList.get("x-pv-visitor-id") || `pv-srv-vis-${crypto.randomUUID()}`;

  // Concurrent Data Fetching on Server Side
  const [categories, searchSuggestions, globalSettings] = await Promise.all([
    getPayloadNavigationCategories() as Promise<SanityCategory[]>,
    getPayloadSearchSuggestions(),
    fetchGlobalSettingsAction(),
  ]);

  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"
  ).replace(/\/$/, "");

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: globalSettings.siteLogo
        ? urlFor(globalSettings.siteLogo).url()
        : `${siteUrl}/icon.svg`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: globalSettings.storePhoneNumber || "",
      contactType: "Customer Service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: globalSettings.siteName || "PocketValue",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-brand-primary/30">
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
          strategy="afterInteractive"
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          strategy="afterInteractive"
        />

        <NextTopLoader
          color="#f97316"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #f97316,0 0 5px #f97316"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <AppStateProvider>
              <Toaster position="bottom-center" containerClassName="z-[9999]" />

              {/* Server-to-Client Bridge passing dynamic verified IDs */}
              <IntelligenceTracker/>

              <PWAInstallPrompt />

              {/* 🚀 Privacy Cookie Consent Compliance Banner (Gap #49) */}
              <CookieConsent />

              <Suspense
                fallback={
                  <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
                    <div className="h-20 w-full bg-white dark:bg-gray-800 animate-pulse border-b" />
                    <div className="flex-1 max-w-7xl mx-auto w-full pt-10 px-4">
                      <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    </div>
                  </div>
                }
              >
                <MainLayoutClient
                  categories={categories || []}
                  searchSuggestions={
                    searchSuggestions || {
                      trendingKeywords: [],
                      popularCategories: [],
                    }
                  }
                  globalSettings={globalSettings || {}}
                >
                  {children}
                </MainLayoutClient>
              </Suspense>
            </AppStateProvider>
          </AuthProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
