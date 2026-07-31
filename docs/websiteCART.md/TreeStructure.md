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