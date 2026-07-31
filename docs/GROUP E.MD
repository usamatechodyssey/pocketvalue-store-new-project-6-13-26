# 📋 OPERATIONS, CAMPAIGNS & LIFECYCLE TELEMETRY COMPLETION REPORT

**Epic Module:** Operations, Marketing Campaigns & Lifecycle (All 18 Gaps Completed)  
**Status:** LOCKED, SECURED & PRODUCTION-READY  

---

## 🧭 1. CAMPAIGNS, OPERATIONS & LIFECYCLE PIPELINES (TOTAL TREE FLOW)

Dynamic marketing attributions, checkout RTO risk audits, server-to-server payments validation webhooks, CRM sync connectors, and interactive user prompts are securely mapped under this unified, non-blocking operational lifecycle architecture:

```
                                [USER ARRIVAL ON STORE]
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
[AD CAMPAIGNS LANDING]           [STORE COMPLIANCE BANNERS]          [CONVERSION ACTIONS]
- proxy.ts (Attributions)        - CookieConsent.tsx (Consent)       - ProductActions (OOS/Share)
- session_start UTM logs         - PWAInstallPrompt.tsx (Metrics)    - ProductHeader (Scarcity Alert)
         │                                 │                                 │
         ▼                                 ▼                                 ▼
         └───────────────────────► [logUserEvent Server] ◄───────────────────┘
                                           ▲
                                           │ (Server-to-Server Handshakes)
                       ┌───────────────────┴───────────────────┐
                       ▼                                       ▼
           [Payment Gateway Webhooks]               [CRM / Logistics Sync API]
           - verify/[gateway]/route.ts              - webhooks/crm/route.ts
           - S2S secure purchase writes             - webhooks/logistics/route.ts
                       │                                       │
                       ▼                                       ▼
                       └───────────────────┬───────────────────┘
                                           │
                                           ▼
                                    [MONGO ATLAS DB]
                                 - UserEvents Collection
                                 - UserSessions Collection
```

---

## 🎯 2. RESOLVED GAPS & LIFECYCLE LOGIC OUTCOMES (18 GAPS)

The 18 telemetry gaps connecting the user's campaign path to post-checkout operational status have been resolved:

### **Gap #6: Promo Click-Through Rate (`banner_click`)**
*   **Logic & Wajah:** Logs clicks on homepage hero sliders, dynamic marketing grids, or checkout promo coupons with position index ranking and target URLs to calculate banner-specific click-through rates (CTR).

### **Gap #17: OOS Purchasing Attempts (`oos_attempt`)**
*   **Logic & Wajah:** Prevents direct pointer blocks on disabled buttons. Clicks on out-of-stock variations trigger an interceptor that logs the active intent before displaying an out-of-stock toast, letting the store know exactly what variants are in highest demand.

### **Gap #18: Ad Session Re-Attribution (`session_start`)**
*   **Logic & Wajah:** Sits at the edge middleware level. On identifying incoming dynamic UTM variables (`utm_source`), it triggers an edge-to-client cookie handshake, executing and logging the `session_start` event safely without blocking initial page render performance.

### **Gap #19: Operational CRM Sync (`crm_sync`)**
*   **Logic & Wajah:** Standardizes return and cancellation triggers. Any manual, customer, or admin updates on order documents (such as cancellations inside `cancelOrderAction` or status changes inside `updateOrderStatus`) trigger CRM synchronization events.

### **Gap #24: S2S (Server-to-Server) Duplicate Logging (`s2s_purchase`)**
*   **Logic & Wajah:** Sits inside the secure gateway payment webhook route. When the bank/gateway verification succeeds, it triggers the purchase event server-to-server, bypassing client-side ad-blockers or early tab-close scenarios.

### **Gap #25: WhatsApp/Help Desk Clicks (`support_engagement_click`)**
*   **Logic & Wajah:** Listens to global window clicks for floating WhatsApp links, chat boxes, or help desk triggers, and logs engagement details.

### **Gap #26: Policy Page Engagements (`policy_page_view`)**
*   **Logic & Wajah:** Listens to active routing changes. If a user lands on compliance, shipping, terms, or refund policies pages, it logs the view with custom page parameters.

### **Gap #27: Free Shipping Threshold Proximity (`shipping_threshold_proximity`)**
*   **Logic & Wajah:** Compares active subtotal state with the minimum subtotal required for free shipping (fetched from Payload). If the user is close (within Rs. 500), it logs a proximity event so we can analyze shipping threshold influence on average order value (AOV).

### **Gap #28: Social Scarcity Trigger Exposure (`scarcity_exposure`)**
*   **Logic & Wajah:** Uses a non-obtrusive `useEffect` trigger on PDP headers or homepage deal timers. When a low-stock alert or countdown is visible in the viewport, it logs an exposure event to track social proof conversions.

### **Gap #29: A/B Testing Variant Exposures (`experiment_variant_exposed`)**
*   **Logic & Wajah:** Assigns a randomized client variant bucket (`variant_a` vs `variant_b`) once per user session and logs the exposed variant to analyze conversion differences between dynamic layouts.

### **Gap #32: RTO (Return to Origin) Risk Analysis (`rto_risk_flagged`)**
*   **Logic & Wajah:** Runs automated validation on checkout inputs (verifying phone length, name short/suspect, complete address metrics) and logs the risk flags to prevent logistics returns losses.

### **Gap #33: Cross-Device Sessions**
*   **Logic & Wajah:** Merges mobile and desktop timelines. It links the guest session history (`visitorId` from cookies) with the authenticated database profile (`userId` in MongoDB) securely during NextAuth's `signIn` callback callbacks.

### **Gap #40: Return Portal Drops (`return_portal_drop`)**
*   **Logic & Wajah:** Uses state observers to track the step-by-step progress of customer product return forms. It logs when a user starts, changes, or abandons a return modal without submitting.

### **Gap #42: Product Sharing Metrics (`product_shared`)**
*   **Logic & Wajah:** Tracks when a user shares a product. It logs clicks on "Copy link" or "WhatsApp Share" buttons with the sharing method used.

### **Gap #43: Logistics Delay Updates (`logistics_delay`)**
*   **Logic & Wajah:** Connects with third-party logistics APIs. It logs courier shipping delay codes from external logistics webhooks directly to the database.

### **Gap #49: Cookie Consent Toggles (`cookie_consent_toggled`)**
*   **Logic & Wajah:** Logs cookie banner choices. It displays a cookie banner and logs whether the user clicks "Accept All" or "Decline".

### **Gap #51: PWA Prompts Metrics (`pwa_prompt_metric`)**
*   **Logic & Wajah:** Tracks progressive web app installation events. It logs PWA install prompts, user clicks, and manual close actions.

### **Gap #52: Recovered Cart Attribution (`recovered_cart_conversions`)**
*   **Logic & Wajah:** Detects and flags returning checkouts originating from programmatic email/SMS recovery links. It checks for recovery query parameters (`ref=cart_recovery`) at the edge proxy level.

---

## 🗂️ 3. DETAILED FILE-BY-FILE TECHNICAL WORKSPACE AUDIT (20 FILES)

The following is an exhaustive breakdown of the 20 files created or modified to complete this operational and campaign lifecycle tracking phase.

---

### **1. `src/models/UserEvent.ts` (Database Model)**
*   **Purpose & Logic:** Defines the database structures for dynamic user tracking. It registers all naye operational, campaign, and lifecycle events under both the TypeScript interface union and Mongoose enum validator arrays to prevent database validation failures.
*   **Data Pipeline Flow:**
    ```
    [Server logUserEvent Payload] ──► [Mongoose Schema Validator] ──► [Write Event to MongoDB]
    ```
*   **Architectural Integration:** Provides schema types and validation to `trackingActions.ts`.

---

### **2. `src/app/actions/trackingActions.ts` (Server Action)**
*   **Purpose & Logic:** Serves as the central server action for event logging. It validates incoming parameters against the schema types and writes user event records securely to MongoDB.
*   **Data Pipeline Flow:**
    ```
    [Client POST Request] ──► [Zod Fields Check] ──► [Idempotency Guard Checks] ──► [Write UserEvent]
    ```
*   **Architectural Integration:** Accessible across all client components, context hooks, and webhooks to record interaction metrics.

---

### **3. `src/app/proxy.ts` (Edge Routing Middleware)**
*   **Purpose & Logic:** Custom edge middleware that manages cookie values for guest sessions (`pv_visitor_id`, `pv_session_id`) to prevent tracking gaps. It captures incoming UTM parameters and auto-recovery links to set temporary, client-accessible handshake cookies.
*   **Data Pipeline Flow:**
    ```
    [Inbound URL Request] ──► [Check UTMs & ref=cart_recovery] ──► [Set pv_session_start_pending Cookies]
                                                                                │
    [Forward Secure Headers] ◄──────────────────────────────────────────────────┘
    ```
*   **Architectural Integration:** Sits between the edge server and Next.js page routers, passing campaign parameters to `IntelligenceTracker.tsx` via cookie handshakes.

---

### **4. `src/app/components/intelligence/IntelligenceTracker.tsx` (Global Sentinel Hub)**
*   **Purpose & Logic:** Client-side telemetry sentinel. It reads edge handshake cookies, intercepts WhatsApp/help desk clicks, monitors policy page engagements, sets A/B testing variant buckets, and flushes offline log queues upon network recovery.
*   **Data Pipeline Flow:**
    ```
    [Read pv_session_start_pending] ──► [Log session_start Event] ──► [Erase Handshake Cookie]
                                                                                │
    [Flush offline localStorage Queue] ◄── [Window Event triggers (WhatsApp)] ◄┘
    ```
*   **Architectural Integration:** Globally mounted inside `layout.tsx` to handle technical health metrics and marketing attributions.

---

### **5. `src/app/context/hooks/useCheckout.ts` (Checkout Hook)**
*   **Purpose & Logic:** Central state hook for checkout pages. It calculates dynamic shipping costs, validates dynamic address inputs, runs RTO risk analysis, and logs free shipping threshold proximity notifications.
*   **Data Pipeline Flow:**
    ```
    [Subtotal State Change] ──► [Calculate Shipping Thresholds] ──► [Validate Address formats]
                                                                              │
    [Trigger rto_risk_flagged] ◄── [Log shipping_threshold_proximity] ◄───────┘
    ```
*   **Architectural Integration:** Consumed by Checkout Forms to calculate order costs and log billing metrics.

---

### **6. `src/app/components/product/pdp-sections/ProductActions.tsx` (PDP Conversions Actions)**
*   **Purpose & Logic:** PDP conversion buttons section. It manages quantity selectors, triggers wishlist additions, handles sharing events (copy link / WhatsApp share), and logs out-of-stock purchasing attempts.
*   **Data Pipeline Flow:**
    ```
    [Click disabled OOS button] ──► [Log oos_attempt Event] ──► [Display dynamic Error Toast]
                                                                          │
    [Trigger Web Share / Copy Link] ◄── [Log product_shared Event] ◄──────┘
    ```
*   **Architectural Integration:** Mounted in `ProductInfo.tsx` to handle checkout additions and social share engagements.

---

### **7. `src/app/components/product/pdp-sections/ProductHeader.tsx` (PDP Header Segment)**
*   **Purpose & Logic:** PDP Header component. It checks variant stock levels, checks low-stock thresholds, and logs alert exposures once per variant session.
*   **Data Pipeline Flow:**
    ```
    [Variant Stock <= Threshold] ──► [Check loggedScarcityRef lock] ──► [Log scarcity_exposure Event]
    ```
*   **Architectural Integration:** Mounted inside `ProductInfo.tsx` to display low-stock badges and log scarcity exposures.

---

### **8. `src/app/components/PWAInstallPrompt.tsx` (PWA Installer Drawer)**
*   **Purpose & Logic:** Progressive Web App (PWA) installation controller. It checks browser display modes, shows custom instructions on iOS, handles Android prompt choices, and logs prompt metrics with a 24-hour dismissal cooldown.
*   **Data Pipeline Flow:**
    ```
    [Mount: check standalone mode] ──► [If Visible: Log prompt_shown] ──► [Click Install: trigger prompt()]
                                                                                    │
    [Save Dismissal Timestamp] ◄── [Log install_accepted / prompt_dismissed] ◄──────┘
    ```
*   **Architectural Integration:** Globally mounted inside `layout.tsx` to manage installation promts and log PWA metrics.

---

### **9. `src/app/components/ui/Coupon.tsx` (Promotional Banners)**
*   **Purpose & Logic:** Promotional banner/coupon client component. It renders dynamic promo banners from Payload, maps landing URLs, and logs banner click-through rates.
*   **Data Pipeline Flow:**
    ```
    [Render Coupon Image Link] ──► [User click Banner] ──► [Log banner_click Event]
    ```
*   **Architectural Integration:** Mounted inside the global layout or checkout pages via `RenderSection.tsx` to log promo engagements.

---

### **10. `src/app/components/home/HeroCarousel.tsx` (Hero Carousel)**
*   **Purpose & Logic:** Dynamic homepage slideshow. It maps desktop/mobile slider images, handles slide change events, and logs slide engagement metrics.
*   **Data Pipeline Flow:**
    ```
    [Slide Change swipe] ──► [Update currentSlide State] ──► [Log pdp_media_interaction Event]
    ```
*   **Architectural Integration:** Main landing carousel component utilized inside `HeroSection.tsx`.

---

### **11. `src/app/components/home/MasterBannerGrid.tsx` (Merchandising Grid)**
*   **Purpose & Logic:** Grid layout of promotional banners. It handles responsive layouts (mosaic left, mosaic right, grid, hero stack) and logs banner clicks.
*   **Data Pipeline Flow:**
    ```
    [User click Banner card] ──► [Log banner_click Event (position index)] ──► [Redirection Link]
    ```
*   **Architectural Integration:** Rendered dynamically by the page builder (`RenderSection.tsx`) to log merchandising clicks.

---

### **12. `src/app/components/home/ProductCarousel.tsx` (Products Showcase)**
*   **Purpose & Logic:** Dynamic product carousel with side-banner support. It manages swiper slider navigation and logs side promo banner clicks.
*   **Data Pipeline Flow:**
    ```
    [Click Side Promo Image Link] ──► [Log banner_click (product_carousel_side)] ──► [Redirect Link]
    ```
*   **Architectural Integration:** Used by page builders across home, category, and related products segments to track side-banner CTRs.

---

### **13. `src/app/components/home/UniversalDealSection.tsx` (Countdown Deals Widget)**
*   **Purpose & Logic:** High-impact countdown deals widget. It displays countdown timers, maps category and campaign queries, and logs deal side-banner clicks and timer exposures.
*   **Data Pipeline Flow:**
    ```
    [Timer in Viewport] ──► [Log scarcity_exposure Event] ──► [Click side image: log banner_click]
    ```
*   **Architectural Integration:** Renders dynamic countdown banners and scarcity timers within the home page layout.

---

### **14. `src/app/api/payment/verify/[gateway]/route.ts` (S2S Payment Webhook)**
*   **Purpose & Logic:** Webhook API endpoint. It verifies payment gateway signatures, updates orders in MongoDB, and triggers server-to-server purchase event logging to bypass client-side ad-blockers.
*   **Data Pipeline Flow:**
    ```
    [Gateway callback received] ──► [Verify signature] ──► [Save transactionId in Mongoose Order]
                                                                        │
    [Trigger s2s_purchase telemetry event] ◄── [Send Nodemailer confirmation email] ◄┘
    ```
*   **Architectural Integration:** Sits between payment gateway endpoints and the database to securely record successful purchases.

---

### **15. `src/app/account/orders/[orderId]/_components/ReturnRequestModal.tsx` (Return Portal)**
*   **Purpose & Logic:** Return request modal window. It manages returnable items checkboxes, reasons selections, and logs return portal steps and drop-offs.
*   **Data Pipeline Flow:**
    ```
    [Mount: Log return_portal_drop (modal_open)] ──► [If submit: Log step (completed)]
                                                              │
    [Log return_portal_drop (aborted_at_step_X)] ◄── [If Close before submit]
    ```
*   **Architectural Integration:** Mounted in `OrderActions.tsx`, communicating with `returnActions.ts` to log returns form interaction drops.

---

### **16. `src/app/actions/orderActions.ts` (Cancellations Telemetry Actions)**
*   **Purpose & Logic:** Server-side orders actions. It updates order statuses in MongoDB, handles cancellations, and logs cancellations sync updates.
*   **Data Pipeline Flow:**
    ```
    [cancelOrderAction called] ──► [Set status to 'Cancelled' in Order] ──► [Trigger logUserEvent('crm_sync')]
    ```
*   **Architectural Integration:** Core server action managing order cancellations and status synchronizations.

---

### **17. `src/app/layout.tsx` (Global Root Shell)**
*   **Purpose & Logic:** Root layout page. It imports and globally mounts the new `<CookieConsent />` component.
*   **Data Pipeline Flow:**
    ```
    [Page Load] ──► [Mount Global Context Providers] ──► [Mount CookieConsent next to PWAPrompt]
    ```
*   **Architectural Integration:** Mounts global layout structures and dynamic compliance banners.

---

### **18. `src/app/components/ui/CookieConsent.tsx` (🆕 Created - Cookie Consent Banner)**
*   **Purpose & Logic:** Dynamic privacy compliance banner. It checks consent statuses in `localStorage` inside a client `useEffect` (preventing hydration mismatches) and logs consent accept/decline choices.
*   **Data Pipeline Flow:**
    ```
    [Mount: Read localStorage] ──► [If empty: Show Banner] ──► [Accept/Decline click]
                                                                         │
    [Save Choice & Log cookie_consent_toggled] ◄─────────────────────────┘
    ```
*   **Architectural Integration:** Globally mounted inside `layout.tsx` to handle privacy tracking compliance.

---

### **19. `src/app/api/webhooks/crm/route.ts` (🆕 Created - CRM Webhook Endpoint)**
*   **Purpose & Logic:** Webhook API endpoint for external CRMs. It processes order cancellations, returns, and fraud flags pushed from external CRM systems.
*   **Data Pipeline Flow:**
    ```
    [CRM webhook POST received] ──► [Verify secure handshake] ──► [Parse Action (cancel/fraud)]
                                                                              │
    [Log crm_sync telemetry event] ◄── [Update MongoDB Order / Return docs] ◄─┘
    ```
*   **Architectural Integration:** Integrates external systems (like HubSpot or Zoho) directly with the local MongoDB database.

---

### **20. `src/app/api/webhooks/logistics/route.ts` (🆕 Created - Logistics Webhook Endpoint)**
*   **Purpose & Logic:** Webhook API endpoint for logistics providers. It receives real-time delivery status updates from couriers and logs delays under `logistics_delay`.
*   **Data Pipeline Flow:**
    ```
    [3PL webhook POST received] ──► [Verify gateway tokens] ──► [Check delayed status codes]
                                                                           │
    [Log logistics_delay telemetry event] ◄── [Identify target Order doc] ◄┘
    ```
*   **Architectural Integration:** Integrates third-party logistics APIs (like Trax or Leopards) with the local database to track courier delays.

---

## 🛡️ 4. ARCHITECTURAL INTEGRITY & PRODUCTION VERDICT

This operational and campaign lifecycle tracking phase is **stable and 100% production-ready**:

1.  **No Lag Telemetry (Intersection Observers):**
    Impressions standard window scrolling calculations par dynamic scroll logs load nahi karte, balkay browser's dedicated multi-thread `IntersectionObserver API` ke native observer checks use karte hain. Is se browser scrolling frame rates par zero load parta hai.
2.  **Edge-to-Client Handshake Design:**
    Middleware routes directly database write queries execute nahi karte, jisse Edge response times fast rehte hain. Middleware checks client cookies set karte hain aur tracker backgrounds mein asynchronously write parameters execute karta hai.
3.  **No Hydration Mismatches:**
    Client hooks (jaise `useRecentlyViewed`) aur consent banners browser state checks ko safely `useEffect` hooks ke andar render karte hain, jisse hydration mismatch issues completely zero ho jate hain.
4.  **TypeScript & Schema Type-Safety Verified:**
    Sare custom events TypeScript interface checks, arguments validation signatures, aur Mongoose validation enum ranges completely synchronize ho chuke hain, jis se build failures completely block ho chuke hain.

---

This detailed analysis maps out every single file's purpose, operational logic, data pipeline, and technical role inside the system, ensuring the codebase is fully locked and production-ready for deployment!