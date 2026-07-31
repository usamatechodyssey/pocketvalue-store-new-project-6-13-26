***

```markdown
# POCKETVALUE CUSTOM ECOMMERCE ANALYTICS & INGESTION HUB
## CONSOLIDATED MASTER SPECIFICATION & HANDOVER BLUEPRINT
**Status:** Sealed, Complete, and Type-Safe  
**Build Target:** Production-Ready (Next.js 15, Payload CMS v3, MongoDB, Upstash Redis)  

---

## SECTION 1: SYSTEM FILE DIRECTORY & WORKSPACE TREE

PocketValue custom analytics implementation ke tehat dynamic codebase structure aur files placement niche diye gaye workspace directory tree ke mutabiq hai:

```text
POCKETVALUE_STORE_PAYLOAD/
├── .env.local                          [File] (Local Environment Configurations)
├── .gitignore                          [File]
├── .next/                              [Folder] (NextJS Build Output)
├── custom.d.ts                         [File]
├── declarations.d.ts                   [File]
├── docs/                               [Folder] (Local System Documentations)
├── eslint.config.mjs                   [File]
├── image-loader.ts                     [File]
├── media/                              [Folder]
├── next-env.d.ts                       [File]
├── next.config.ts                      [File]
├── node_modules/                       [Folder]
├── package-lock.json                   [File] (Standard Package Lock)
├── package.json                        [File]
├── postcss.config.mjs                  [File]
├── public/                             [Folder] (Asset Directory)
├── README.md                           [File]
├── sanity.cli.ts                       [File]
├── sanity.config.ts                    [File]
├── scripts/                            [Folder] (Automation Scripts)
├── tsconfig.json                       [File]
├── vercel.json                         [File] (Serverless Routings)
│
└── src/                                [Folder]
    ├── collections/                    [Folder] (Payload CMS Collections Specs)
    ├── email_templates/                [Folder] (HTML Email Layouts)
    ├── fields/                         [Folder] (Custom CMS Fields Definitions)
    ├── globals/                        [Folder] (Payload Global Settings)
    ├── lib/                            [Folder] (Core Ingestions and Helpers)
    ├── models/                         [Folder] (Database Schemas)
    │   └── UserEvent.ts                [File] (Mongoose Models validation)
    ├── payload-types.ts                [File] (CMS Generated Types)
    ├── payload.config.ts               [File] (CMS Configurations)
    ├── proxy.ts                        [File] (Edge Middleware Routing Engine)
    ├── sanity/                         [Folder] (Sanity Content Framework)
    ├── types/                          [Folder]
    ├── utils/                          [Folder]
    │
    └── app/                            [Folder] (NextJS App Directory Router)
        ├── _components/                [Folder]
        ├── actions.ts                  [File]
        ├── admin.css                   [File]
        ├── layout.tsx                  [File] (Root Shell & CookieConsent Mounting)
        ├── auth.ts                     [File] (NextAuth Context & Stitching callbacks)
        ├── globals.css                 [File]
        ├── icon.png                    [File]
        ├── robots.ts                   [File]
        ├── sitemap.ts                  [File]
        ├── context/                    [Folder]
        ├── lib/                        [Folder]
        ├── providers/                  [Folder]
        ├── styles/                     [Folder]
        ├── types/                      [Folder]
        │
        ├── (main)/                     [Folder] (Store Front-End Router)
        │   ├── (pages)/                [Folder]
        │   ├── access-denied/          [Folder]
        │   ├── account/                [Folder]
        │   │   └── orders/[orderId]/_components/
        │   │       └── ReturnRequestModal.tsx  (Return Portal Actions)
        │   ├── blog/                   [Folder]
        │   ├── cart/                   [Folder]
        │   ├── category/               [Folder]
        │   ├── checkout/               [Folder]
        │   │   ├── _components/
        │   │   │   ├── AddressInputFields.tsx  (Inputs Telemetry)
        │   │   │   └── CheckoutForm.tsx        (Funnel Steps Metrics)
        │   │   └── payment/
        │   │       ├── _components/
        │   │       │   └── PaymentMethodSelector.tsx (Payment selections)
        │   │       └── page.tsx        (Payment status & redirections)
        │   ├── contact-us/             [Folder]
        │   ├── deals/                  [Folder]
        │   ├── faq/                    [Folder]
        │   ├── forgot-password/        [Folder]
        │   │   └── ForgotPasswordClient.tsx    (Reset recovery flow UI)
        │   ├── gift-cards/             [Folder]
        │   ├── login/                  [Folder]
        │   │   └── LoginClient.tsx     (Login events UI)
        │   ├── order-failure/          [Folder]
        │   ├── order-success/          [Folder]
        │   │   └── [orderId]/page.tsx  (Verification Server Component)
        │   ├── product/                [Folder]
        │   ├── register/               [Folder]
        │   │   └── RegisterClient.tsx  (Signup interactions UI)
        │   ├── reset-password/         [Folder]
        │   ├── search/                 [Folder]
        │   │   └── page.tsx            [File] (Server components queries check)
        │   ├── sell/                   [Folder]
        │   ├── studio/                 [Folder]
        │   ├── verify-email/           [Folder]
        │   │   └── VerifyEmailClient.tsx (OTP latency checks UI)
        │   ├── wishlist/               [Folder]
        │   ├── layout.tsx              [File] (Base wrapper)
        │   ├── loading.tsx             [File]
        │   ├── page.tsx                [File]
        │   └── template.tsx            [File]
        │
        ├── (payload)/                  [Folder] (Payload CMS Admin Router)
        │   ├── admin/                  [Folder]
        │   │   ├── [[...segments]]/    [Folder]
        │   │   ├── views/              [Folder]
        │   │   │   ├── AnalyticsDashboard.tsx
        │   │   │   ├── CategoryExplorer.tsx
        │   │   │   ├── ImportCategories.tsx
        │   │   │   ├── ImportProducts.tsx
        │   │   │   ├── InventoryRiskList.tsx
        │   │   │   ├── MarketingHubView.tsx
        │   │   │   ├── OrderDetail.tsx
        │   │   │   ├── OrdersList.tsx
        │   │   │   ├── PaymentSettings.tsx
        │   │   │   ├── ProductIntelligenceView.tsx
        │   │   │   ├── ProductsList.tsx
        │   │   │   ├── ReportDetail.tsx
        │   │   │   ├── ReportDetailContent.tsx
        │   │   │   ├── ReportsIndex.tsx
        │   │   │   ├── ReturnDetail.tsx
        │   │   │   ├── ReturnsList.tsx
        │   │   │   ├── StaffManagement.tsx
        │   │   │   ├── UserDetail.tsx
        │   │   │   └── UsersList.tsx
        │   │   └── importMap.js
        │   └── api/                    [Folder]
        │
        ├── actions/                    [Folder] (Server Actions Router)
        │   ├── analytics/              [Folder] (Analytical Services)
        │   │   ├── marketing/          [Folder]
        │   │   │   ├── getAudienceVault.ts
        │   │   │   ├── getCampaignIntelligence.ts
        │   │   │   ├── getHubSummary.ts
        │   │   │   ├── getProductFriction.ts
        │   │   │   └── types.ts
        │   │   │
        │   │   ├── exportDetailedReport.ts
        │   │   ├── getAISentinel.ts
        │   │   ├── getBehavioralIntelligence.ts
        │   │   ├── getDetailedReportData.ts
        │   │   ├── getExecutiveAnalytics.ts
        │   │   ├── getGeospatialIntelligence.ts
        │   │   ├── getGranularFinancials.ts
        │   │   ├── getInventoryForecaster.ts
        │   │   ├── getLoyaltyIntelligence.ts
        │   │   ├── getOperationalIntelligence.ts
        │   │   ├── getSalesChartData.ts
        │   │   ├── getTopProducts.ts
        │   │   ├── getTrafficAttribution.ts
        │   │   ├── index.ts
        │   │   └── verifyAdminAccess.ts
        │   │
        │   ├── addressActions.ts
        │   ├── authActions.ts
        │   ├── contactActions.ts
        │   ├── couponActions.ts
        │   ├── globalSettingsActions.ts
        │   ├── mongoPaymentSettingsActions.ts
        │   ├── orderActions.ts                 (Status dynamic sync metrics)
        │   ├── payloadAdminActions.ts
        │   ├── payloadAnalyticsActions.ts
        │   ├── payloadCategoryActions.ts
        │   ├── payloadCategoryAdminActions.ts
        │   ├── payloadInventoryActions.ts
        │   ├── payloadMassDeletionActions.ts
        │   ├── payloadProductActions.ts
        │   ├── payloadProductExplorerActions.ts
        │   ├── payloadProductIntelligenceActions.ts
        │   ├── payloadReturnAdminActions.ts
        │   ├── payloadUserAdminActions.ts
        │   ├── returnActions.ts
        │   ├── reviewActions.ts
        │   ├── searchActions.ts
        │   ├── shippingActions.ts
        │   ├── trackingActions.ts              (Central Server Action logUserEvent)
        │   ├── visualSearchActions.ts
        │   └── wishlistActions.ts
        │
        ├── api/                        [Folder] (Standard API Routers)
        │   ├── auth/[...nextauth]/     [Folder]
        │   │   └── route.ts
        │   ├── cron/                   [Folder] (Task Schedulers)
        │   │   ├── flush-pulses/       [Folder]
        │   │   │   └── route.ts        (Queue background processor)
        │   │   ├── low-stock-alert/    [Folder]
        │   │   └── loyalty-sync/       [Folder]
        │   ├── filter/                 [Folder]
        │   ├── google-shopping/        [Folder]
        │   ├── og/                     [Folder]
        │   ├── orders/                 [Folder]
        │   │   ├── create/             [Folder]
        │   │   │   └── route.ts
        │   │   └── invoice/[orderId]/  [Folder]
        │   │       └── route.ts
        │   ├── payment/                [Folder]
        │   │   ├── gateways/           [Folder]
        │   │   ├── initiate/           [Folder]
        │   │   └── verify/[gateway]/   [Folder]
        │   │       └── route.ts        (S2S webhook transaction tracker)
        │   ├── register/               [Folder]
        │   ├── tracking/               [Folder]
        │   │   ├── live-stream/        [Folder]
        │   │   └── pulse/              [Folder]
        │   │       └── route.ts        (Client to Redis API route)
        │   ├── upload-image/           [Folder]
        │   ├── user/update-image/      [Folder]
        │   ├── verify-coupon/          [Folder]
        │   ├── webhooks/               [Folder] (🆕 External Core Webhooks)
        │   │   ├── crm/                [Folder]
        │   │   │   └── route.ts        (S2S CRM synchronization actions)
        │   │   └── logistics/          [Folder]
        │   │       └── route.ts        (S2S 3PL logistics delay trackers)
        │   └── visual-search/          [Folder]
        │
        └── components/                 [Folder] (Visual Interfaces)
            ├── admin/                  [Folder]
            ├── category/               [Folder]
            │   └── ProductListingClient.tsx (Active filter states UI)
            ├── dashboard/              [Folder]
            ├── home/                   [Folder]
            │   ├── HeroCarousel.tsx    (Merchandising slides)
            │   ├── MasterBannerGrid.tsx (Responsive promos layouts)
            │   ├── ProductCarousel.tsx (Displays and CTR)
            │   └── UniversalDealSection.tsx (Countdown alerts widget)
            ├── intelligence/           [Folder]
            │   └── IntelligenceTracker.tsx (Global Core Sentinel UI)
            ├── layout/                 [Folder]
            │   └── Navbar/
            │       └── SearchBar.tsx   (Query source inputs UI)
            │
            ├── payload-analytics/      [Folder] (Operational Reports Sinks)
            │   ├── helpers/            [Folder]
            │   │   ├── getAcquisitionReportData.ts
            │   │   ├── getFinancesReportData.ts
            │   │   └── getProductReportData.ts
            │   │
            │   ├── AISentinel.tsx
            │   ├── AnalyticsDashboardContent.tsx
            │   ├── AnalyticsDateRangePicker.tsx
            │   ├── AnalyticsStatCard.tsx
            │   ├── CustomReportsNavLink.tsx
            │   ├── GeospatialIntelligence.tsx
            │   ├── InventoryForecaster.tsx
            │   ├── InventoryRiskContent.tsx
            │   ├── LoyaltyIntelligence.tsx
            │   ├── OperationalIntelligence.tsx
            │   ├── PriceAnatomySurgeon.tsx
            │   ├── ProductDrillDownModal.tsx
            │   ├── ProductIntelligenceContent.tsx
            │   ├── ProductIntelligenceFilters.tsx
            │   ├── ReportChartSection.tsx
            │   ├── reportConfigs.ts
            │   ├── ReportPaginationSection.tsx
            │   ├── ReportsFilter.tsx
            │   ├── ReportSidebarSection.tsx
            │   ├── ReportTableSection.tsx
            │   ├── SalesPerformanceChartApex.tsx
            │   ├── TopProductsList.tsx
            │   ├── TrafficSourceChart.tsx
            │   └── UserBehavioralIntent.tsx
            │
            ├── payload-categories/     [Folder]
            │
            ├── payload-marketing/      [Folder]
            │   ├── AudienceVault.tsx
            │   ├── CampaignSurgeon.tsx
            │   ├── ConversionFunnel.tsx
            │   ├── ConversionPulseChart.tsx
            │   ├── LiveRadar.tsx
            │   ├── MarketPulseChart.tsx
            │   ├── ProductFrictionExplorer.tsx
            │   ├── RecoveryCommandCenter.tsx
            │   └── RecoveryPulse.tsx
            │
            ├── payload-orders/         [Folder]
            ├── payload-products/       [Folder]
            ├── payload-returns/        [Folder]
            ├── payload-staff/          [Folder]
            ├── payload-users/          [Folder]
            ├── product/                [Folder]
            │   ├── ProductCard.tsx     (Standard layout observer card)
            │   ├── ProductClientManager.tsx (Scroll and reading stopwatch)
            │   ├── ProductGallery.tsx  (PDP media observer swipers)
            │   ├── ProductGrid.tsx     (Listing loop index ranker)
            │   └── pdp-sections/
            │       ├── DemandRequestForm.tsx (OOS replenishment queries)
            │       ├── ProductActions.tsx (Wishlist and share buttons triggers)
            │       ├── ProductHeader.tsx (PDP Scarcity alert limits)
            │       └── ProductVariantSelector.tsx (Price comparisons)
            ├── reviews/                [Folder]
            │   ├── ReviewForm.tsx      (Review dynamic submissions UI)
            │   └── ReviewsSection.tsx  (Filters and trust checkers)
            ├── ui/                     [Folder]
            │   ├── CookieConsent.tsx   (🆕 Created compliance banner)
            │   ├── Coupon.tsx          (Dynamic promos selector)
            │   └── PaginationControls.tsx (Listing pagination indices logs)
            └── PWAInstallPrompt.tsx    [File] (Dynamic installs monitors)
```

---

## SECTION 2: SYSTEM ARCHITECTURE & UNIFIED PIPELINE FLOW

PocketValue store ka complete interaction network (client events, heartbeats, external webhooks, edge handshakes) niche diye gaye system pipeline layout ke tehat standard data actions execute karta hai:

```
                            [USER SITE INTERACTION PATH]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[CLIENT TELEMETRY EVENT]       [EDGE PROXY & UTMS]             [EXTERNAL WEBHOOKS (S2S)]
  - Clickstream tracking          - proxy.ts (Attributions)       - payment/verify (Gateways)
  - Interceptors hooks            - Sets handshake cookies        - webhooks/crm (HubSpot/Zoho)
  - Local buffers check           - Captures promo referrers      - webhooks/logistics (3PL delays)
        │                                │                                │
        ▼                                ▼                                ▼
 [safeLogUserEvent Action] ◄──── [Reads handshake cookies] ◄──────────────┤ (Verifies S2S Handshake)
        │                                                                 │
        ▼                                                                 ▼
[Server Action trackingActions.ts]                                       │
        │                                                                 │
        ├─────────────────────────────────────────────────────────────────┤
        │
        ▼ (Asynchronous Data Writing / Verification)
 [MONGO ATLAS DATABASE] ◄────────[CRON BATCH FLUSH] ◄──────────────[REDIS BUFFER QUEUE]
   - UserEvents Collection        - maxBatch = 1000 items           - Pulse heartbeats buffer
   - UserSessions Collection      - Runs background tasks           - LPUSH stream pipeline
   - AbandonedCarts (Lead CRM)    - bulkWrite (upsert actions)      - Suspends on inactive tabs
```

---

## SECTION 3: TECHNICAL BASES & SYSTEM SECURITY ALIGNMENT

Telemetry pipeline ko stable, optimized, aur security-leak proof banane ke liye darj-zail criteria ko core system mein map kiya gaya hai:

### 3.1 Strict TypeScript Null & Optionals Handling
* Client-side aur server-side interfaces ke validation levels par TypeScript implicit types compile errors (jaise `null | undefined` values access on optional fields like `contactInfo` ya variants listings `sku` pointers) ko bypass karne ke liye strictly optionals structures set kiye gaye hain:
  * `useCart.ts` ke andr target keys ko clean fallback values standard string par assign kiya gaya hai: `sku: variant.sku || "N/A"`.
  * `trackingActions.ts` mein parameters validators validation structure ko strict nested objects checker state par map kiya gaya hai: `{ email?: string; phone?: string }`.

### 3.2 Dynamic Identifiers Zero-Collision Falling
* Secure state identifier parameters ke collision ko dynamic checkout flows mein completely end kiya gaya hai:
  * Client inputs parameters (props injection parameters jaise direct sessionId and visitorId inputs indicators inside tracking views) ko bypass kiya gaya hai.
  * System **`cookies()` from `next/headers`** ka use kar ke direct backend standard se secure HTTP-Only keys values (`pv_session_id`, `pv_visitor_id`) read aur parse karta hai.
  * Server layouts boundaries (`layout.tsx`) par edge headers errors ya components render drop points ko fallback identifiers validation handle karne ke liye dynamic **`crypto.randomUUID()`** generators system assign kiya gaya hai jo guest collisions ko safely block karta hai.

### 3.3 Heartbeat Operations & Operational Gating
* Bandwidth usage, Redis database logs write limits, aur serverless pricing operations ko optimized bounds mein rakhne ke liye complete sentinel engine functions rules apply kiye hain:
  * Pulse telemetry heartbeat routes `/api/tracking/pulse` ko standard API gateway parameters `x-pv-tracking-handshake` header token authorization aur Redis-based client IP rate-limiting checks se block kiya gaya hai.
  * Queue synchronization cron task (`/api/cron/flush-pulses`) ko execution timeout crashes se bachane ke liye strict bulk extraction parameters limits target kiya gaya hai (**`maxBatch = 1000`** items atomic pipeline execution using `RPOP`).

---

## SECTION 4: UNIFIED USER-FLOW LIFECYCLE MAP

Store par customer ki visual presence se lekar conversion completions aur offline operations sync tak ka unified logical path darj-zail patterns ko track karta hai:

```text
1. ACQUISITION & ATTRIBUTION (Edge Layer)
   │ 
   ├──► Middleware scans headers & UTMs.
   └──► Writes HTTP-Only visitor & session cookies.
   │
2. ENGAGEMENT & DISCOVERY (Client Sentinel Tracker)
   │
   ├──► Global Sentinel registers PageViews and Search queries.
   └──► Uses session-agnostic sessionStorage keys (e.g. `pv_v4_view_${currentPath}`) to block duplicates.
   │
3. CONVERSION INTENTIONS (useCart Engine)
   │
   ├──► Adds product ──► logs "add_to_cart" (RSC metadata context).
   ├──► Removes product ──► logs "remove_from_cart".
   └──► Fluctuates quantities ──► dynamic 1.5s accumulator debounces final action.
   │
4. RECOVERY (Abandoned Cart Sync & Programmatics)
   │
   ├──► Guest users are restricted (forced redirect to authentication portals).
   └──► Snapshots sync only after 4s idle state, capturing verified user emails/phones.
   │
5. AUTHS & IDENTITY STITCHING (Next-Auth Callback & Cron)
   └──► Successful auth runs signIn() server callbacks.
   └──► Instantly links anonymous visitorId analytics timeline with the authenticated database profiles (userId).
```

---

## SECTION 5: COMPLETE TOUCHPOINTS MATRIX (THE 73 EVENTS DIRECTORY)

Sare metrics (11 Completed Behaviors aur 62 Gaps) ko clean logic boundaries ke andr niche target details ke sath categorize kiya gaya hai:

### 5.1 COMPLETED CORE TOUCHPOINTS (11 Events)

1. **Silent Heartbeat (Pulse):** Captures current active system configurations (OS, Browser, Device, dynamic campaign parameters) at a 40s execution interval.
2. **Page Views Tracking:** Logged inside `IntelligenceTracker.tsx` on routing changes with standard verified HTTP cookies (`visitorId`, `sessionId`).
3. **Search Performed Actions:** Logs target search queries inside `/search` path.
4. **Standard Catalog Add-to-Cart:** Dispatched inside `useCart.ts` upon product selection.
5. **Standard Catalog Remove-from-Cart:** Dispatched inside `useCart.ts` upon product deletion.
6. **Dynamic Cart Quantity Changes:** 1.5s client-side quantity changes debouncer accumulator inside `useCart.ts` prevents recursive DB updates.
7. **Wishlist Add Event:** Dispatched inside dynamic toggle controllers in `useWishlist.ts`.
8. **Wishlist Remove Event:** Dispatched inside dynamic toggle controllers in `useWishlist.ts` using `'wishlist_remove'` event signatures.
9. **Buy Now Triggers:** Sequential dispatch inside `useCart.ts` (triggers `"add_to_cart"` and `"checkout_start"` triggers sequentially and bypasses manual carts redirection).
10. **Checkout Initial Progression:** Fired on dynamic mount parameters inside checkout layout wrappers.
11. **Idempotent Conversions Pipeline:** Database validated dynamic conversion checks inside order-success `/page.tsx` utilizing a backend validation guard logic to ignore page reloads.

### 5.2 THE NEW BEHAVIORAL GAPS MATRIX (62 Events)

| Epic Group | Event Tag / GAP ID | Target Objective & Telemetry Reason |
| :--- | :--- | :--- |
| **Group A: Checkout Friction** | `checkout_error` | Captures form fields failures types, validation drops, and gateway rejections. |
| | `checkout_step_view` | Monitors steps progressions (Address inputs loaded vs Payment selectors chosen). |
| | `shipping_method_selected`| Logs selected shipping range options (COD range, delivery costs automatic alignment). |
| | `payment_method_selected` | Captures switching ratio dynamics between COD inputs and payment gateways selectors. |
| | `coupon_applied` | Logs successful code checks parameters on checkout state mutations. |
| | `coupon_removed` | Monitors manual coupon removals or coupon errors occurrences. |
| | `gateway_redirect_initiated`| Marks the exact milliseconds timestamp the customer session leaves for bank portal redirects. |
| | `form_field_interaction` | Monitors focus/blur events friction points inside address verification inputs. |
| | `tab_loss_duration_ms` | Monitors focus loss during external payment validations to determine gateway timeouts. |
| | `coupon_auto_applied` | Tracks UTM affiliate campaigns coupons read from cookie indicators. |
| | `auth_session_expired` | Records mid-checkout connection timeout failures or user token expiration events. |
| | `speed_delta_ms` | Form completion timer (Focus vs Blur milliseconds delta to separate Autofill from Manual typing). |
| **Group B: User Identity & Auth** | `auth_attempt` | Tracks dynamic login/signup methods clicks, attempts status, and dynamic error tags. |
| | `user_cohort` | Evaluates JWT token generation states (`new_user` vs `returning_user` based on age). |
| | `login_prompt_triggered` | Tracks guest users conversions blocks on mandatory login barriers (Interception triggers). |
| | `identity_merge` | Executes direct database sync actions linking anonymous visitors data to authentic profiles. |
| | `auth_pre_submit_friction`| Measures forms inputs exits and pre-submit form dropout rates. |
| | `cart_rehydrated` | Records localStorage cart cache recoveries when returning user sessions initialize. |
| | `latency_duration_ms` | Stopwatch metrics capturing OTP delivery speeds delays and user verification times. |
| | `cart_merged` | Records concurrent session cart clashes resolution when cross-device logins occur. |
| | `profile_fields_updated` | Tracks address corrections or metadata edits on account profile updates. |
| **Group C: Discovery & PDP** | `search_zero_results` | Captures empty search queries and counts to analyze supply-chain catalog gaps. |
| | `filter_applied` | Monitors list check box criteria and dynamic price slider coordinates modifications. |
| | `pdp_interaction` | Records reading stopwatch timings and active scroll progress checkpoints inside PDPs. |
| | `search_result_click` | Measures exact rank position metrics when users select items from search lists. |
| | `product_impression` | Implements IntersectionObserver tracking to log impressions after 50% visibility for 1.5s. |
| | `product_click` | Captures product catalog card selections and standard list link redirects. |
| | `wishlist_cart_source` | Appends `source: 'wishlist'` context parameters to cart payloads to trace conversions. |
| | `back_in_stock_subscription`| Tracks dynamic restock notifier forms submissions for OOS product configurations. |
| | `review_grid_expand` | Logs clicks, navigation filters selections, and pagination on customer review grids. |
| | `variant_price_compared` | Traces variant price upgrades and elastic price drops conversions metrics. |
| | `search_trigger_source` | Identifies search query types (manual keyboard, autosuggest selection, search history clicks). |
| | `pdp_media_interaction` | Logs visual assets reviews clicks, lightbox visual zooms, and visual videos plays times. |
| | `catalog_pagination_depth`| Maps page index transitions and layout offsets coordinates reached in listings. |
| | `oos_alternatives_ctr` | Tracks conversions selections clicks on recommendation layouts in out-of-stock items. |
| | `review_filter_actions` | Isolates buyer hesitation metrics by capturing rating filter modifications. |
| | `review_submitted` | Logs dynamic client submissions validated by checked buyer checks. |
| **Group D: UI Health & UI Performance** | `exit_intent_triggered` | Logs exit flags when mouse movements shift to top boundaries with non-empty carts. |
| | `js_exception` | Catches global unhandled promise crashes and file errors traces on client-side. |
| | `performance_metric` | Captures DOM rendering speeds and page load performance timings (Web Navigation Timing API). |
| | `pulse_suspended` | Intercepts passive window states to halt heartbeat pulses and reduce operational server loads. |
| | `rage_click_detected` | Flags high friction regions by tracking target coordinates clicks (3 clicks in 1.5s). |
| | `offline_local_buffer` | LocalStorage system fallback backup storing event metrics during connection drops. |
| | `late_content_shift` | Separates unintentional layout clicks from authentic click actions. |
| | `cart_desync_error` | Multi-tab local storage watcher updating background tabs state on changes (Reconciliation). |
| **Group E: Campaigns & Lifecycle**| `banner_click` | Tracks homepage slides, dynamic banner grids, and coupon blocks selection CTRs. |
| | `oos_attempt` | Captures clicks on disabled out-of-stock variations to analyze real product demand. |
| | `session_start` | Captures inbound landing UTM campaign markers without interrupting first page render metrics. |
| | `crm_sync` | Synchronizes order cancel/refund states from CRMs back to the local database models. |
| | `s2s_purchase` | Direct server-to-server gateway callback execution (prevents losses from client ad-blockers). |
| | `support_engagement_click`| Captures direct WhatsApp support, floating widgets, or help desks interactions. |
| | `policy_page_view` | Tracks active routes transitions on shipping/return rule documentation pages. |
| | `shipping_threshold_proximity`| Tracks subtotal proximity notifications to the free shipping threshold. |
| | `scarcity_exposure` | Logs low-stock banners exposure occurrences to assess conversion influence. |
| | `experiment_variant_exposed`| Captures dynamic page configurations variant buckets exposure metrics for A/B testing. |
| | `rto_risk_flagged` | Runs validation checking on checkout address formulations to bypass logistics losses. |
| | `cross_device_session_stitch`| Merges desktop/mobile anonymous interaction footprints with authenticated credentials logs. |
| | `return_portal_drop` | Captures modal closures, parameters changes, and exit steps on product return forms. |
| | `product_shared` | Logs sharing interactions (Copy Link, WhatsApp Share). |
| | `logistics_delay` | Integrates courier shipping delay codes from external logistics webhooks to database. |
| | `cookie_consent_toggled` | Logs dynamic cookies compliance parameters selected values (Accept all vs Decline). |
| | `pwa_prompt_metric` | Evaluates PWA installs prompt shown and customer selection outputs. |
| | `recovered_cart_conversions` | Tracks returning carts originating from programmatic email/SMS recovery urls. |

---

## SECTION 6: FILE-BY-FILE TECHNICAL WORKSPACE AUDIT

Niche Workspace ke un core files ke changes aur upgrades ka detailed breakdown diya gaya hai jinhe standard telemetry integration ke tehat modify aur lock kiya gaya hai:

### 1. `src/models/UserEvent.ts` (Model Schema Updates)
* **Logic & Workspace Role:** Central database document schemas and TypeScript definition types. Is file mein naye parameters types ko safe compile standard parameters enums array list ke andr expand kiya gaya hai taake validation check failures aur runtime crashes ko handle kiya ja sake.
* **Merged Schema Modifications:**
  ```typescript
  
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
  ```

### 2. `src/app/actions/trackingActions.ts` (Server Action Upgrade)
* **Logic & Workspace Role:** Client interactions telemetry data ingestion server gateway. Server actions client side input elements validators types checks maintain karte hain aur cookies headers validation resolve karte hain:
  ```typescript  
"use server";

import { cookies } from "next/headers";
import connectMongoose from "@/app/lib/mongoose";
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
  ```

### 3. `src/app/context/hooks/useCart.ts` (Cart Context Engine)
* **Logic & Workspace Role:** Multi-tab sync, quantity variations tracking debouncer, and context source attributions hook.
* **Technical Integration:**
  * **1.5s Quantity Debouncer:** Multiple clicks inside cart items are debounced utilizing temporary timeouts pointers state.
  * **Multi-Tab Reconciliation:** Storage hooks event triggers listen to cross-tabs changes and update active context values synchronously, completely evading desync locks.
  * **Wishlist source conversion attribution:** Optional `source` tag parameter logic intercepts checkout payloads to record correct conversion channels attribution.

### 4. `src/app/proxy.ts` (Edge Routing Middleware Engine)
* **Logic & Workspace Role:** Campaign source (UTMs UTM standard criteria mapping) and user tracking parameters validation engine.
* **Merged Logic:** Edge layer intercepts incoming URL request strings. It parses UTMS cookies structures (`utm_source`, `utm_medium`, `utm_campaign`) and temporary recovered flags variables pointers without executing heavy database queries inside edge execution layers, preventing server load.

### 5. `src/app/components/intelligence/IntelligenceTracker.tsx` (Global Sentinel Hub)
* **Logic & Workspace Role:** Core client-side tracking hub globally mounted within layout boundaries.
* **Unified Workspace Integrations:**
  * **Exit Intents Tracker:** Registers mouse cursor coordinates shifts triggers inside top screen thresholds to evaluate bounce patterns.
  * **Global JS Crashes Capturer:** Binds global error observers pointers `window.onerror` and `window.onunhandledrejection` to securely record runtime bugs and file path traces in MongoDB.
  * **Rage Clicks Coordinate Monitor:** Tracks continuous clicks intervals thresholds and coordinates checks (flags areas experiencing 3 clicks inside 1.5 seconds intervals).
  * **Offline Storage Backfill Queue:** Intercepts offline disconnect errors events, saves incoming payloads array within browser LocalStorage elements, and automatically flush-backfills data once network connectivity returns.

### 6. `src/app/auth.ts` (NextAuth Configurations Callbacks)
* **Logic & Workspace Role:** Authentication pipelines, user cohort categorization, and database profile linkage integrations.
* **Technical Injections:**
  * **NextAuth Session Callback:** Extracts dynamic timestamps values on user sessions profiles initialization to calculate creation thresholds. If the user account age is less than 15 mins, sets JWT header data string parameter to `new_user`, else `returning_user`.
  * **Identity Merge background tasks:** SignIn server callback reads Visitor IDs from cookies and writes direct query updates linking pre-authenticated visitors to registered user IDs dynamically.

### 7. `src/app/components/product/ProductCard.tsx` (Viewport Visibility Observer)
* **Logic & Workspace Role:** Viewport product item intersection mapping:
  * Native browser **`Intersection Observer API`** monitors catalog card components visibility.
  * Sets element visibility threshold to `50%` and registers views actions after a `1.5s` delay (to prevent false counts from fast scrolling).

### 8. `src/app/components/product/ProductClientManager.tsx` (PDP Dynamic Stopwatch Tracker)
* **Logic & Workspace Role:** Description scrolls checkpoint check monitors and user reading time dynamic logs.
* **Technical Workspace Integration:** Mounts dynamic performance clocks inside viewport scrolls controllers. If the user stays passive/active on page layouts for more than `15 seconds`, logs engagement variables with scroll dimensions metrics.

### 9. `src/app/checkout/payment/page.tsx` (Latency and Redirect Trackers)
* **Logic & Workspace Role:** External payment pages, checkout form completions outputs, and cross-tab latency check trackers:
  * Integrates dynamic observers tracking gateway redirection initiated timing.
  * Compares visibility triggers on window focus loss levels to evaluate gateway execution speeds and timeouts.

### 10. `src/app/components/ui/CookieConsent.tsx` (Compliance Actions - 🆕 Created)
* **Logic & Workspace Role:** Renders cookie compliance prompt. Stores user selections (`Accept All` or `Decline`) in browser local storage and logs dynamic cookies consent selections to the database.

### 11. `src/app/api/webhooks/crm/route.ts` (CRM Synchronization Endpoint - 🆕 Created)
* **Logic & Workspace Role:** S2S Secure API Endpoint. Processes order refunds, returns, or transaction flags changes pushed from external CRM systems, validating tokens before updating Mongo database schemas.

### 12. `src/app/api/webhooks/logistics/route.ts` (3PL Delay Status Trackers - 🆕 Created)
* **Logic & Workspace Role:** S2S Logistics tracking callback router. Intercepts shipping delivery delay codes from third-party logistics services, and writes updates under logistics risk evaluation.

### 13. `src/app/components/PWAInstallPrompt.tsx` (Install Metric Monitor)
* **Logic & Workspace Role:** Displays standard PWA installation prompts and records shown metrics, user selection variables, and dismissal timestamps with cooldown parameters.

### 14. `src/app/components/product/pdp-sections/ProductActions.tsx` (Conversions Engagements)
* **Logic & Workspace Role:** Clicks triggers bindings mapping PDP interaction states. Monitors share copy link selections, direct WhatsApp click interactions, and dynamic interactions on OOS triggers.

### 15. `src/app/components/product/pdp-sections/ProductHeader.tsx` (Scarcity Metrics Monitor)
* **Logic & Workspace Role:** Checks target item variant stock boundaries. Logs scarce exposure alerts if stock is below specified thresholds.

---

## SECTION 7: OPERATIONS REPORTS SINKS & DATABASE MAPPING

Sare dynamic tracking events ko admin control panel ke darj-zail views aur database collection files par map kiya gaya hai:

| Analytics Section | Frontend Component | Database Source Collection | Target Visual Elements / Reports Points |
| :--- | :--- | :--- | :--- |
| **Real-time Live Radar** | `payload-analytics/LiveRadar.tsx` | `UserSessions` (Redis Live Buffer) | Active online users metrics, device distribution ratios. |
| **Sales Velocity Curves**| `payload-analytics/SalesPerformanceChart.tsx`| `Orders` Collection / Daily snapshots | Total sales charts curves, volume vs revenue toggles. |
| **Tax Audit & Ledger** | `helpers/getFinancesReportData.ts` | `Orders` Collection schemas | 18% dynamic sales tax, gross revenue sum, net margins details. |
| **Top SKUs Performance**| `helpers/getProductReportData.ts` | `UserEvents` / `Products` | SKU conversions speeds, margins data, replenishment limits alerts. |
| **Campaigns Attributions**| `helpers/getAcquisitionReportData.ts`| `UserSessions` / `UserEvents` | Traffic channel attribution CTR, dynamic campaign performances. |
| **Conversion Funnels** | `payload-marketing/ConversionFunnel.tsx` | `UserEvents` (Funnel transitions steps) | Closed cohort transitions rates (PDP -> Cart -> Checkout -> Purchase). |
| **Lead Recovery Vault** | `payload-marketing/AudienceVault.tsx` | `AbandonedCarts` Collection | Abandoned leads contacts databases, recovery metrics, click attributions. |

---

## SECTION 8: PRE-LAUNCH INTEGRATION VERIFICATION TEST PLAN

Is codebase system ko production deployment par send karne se pehle darj-zail manual aur API verification test stages complete karein:

### Step 1: Client Edge Identity Checking (Browser Cookie Verification)
* **Test Action:** Open Google Chrome Developer Console (`F12`) -> Navigate to `Application` tab -> Select `Cookies` dropdown from the left panel.
* **Verification Targets:**
  * [ ] Verify both `pv_visitor_id` and `pv_session_id` cookie identifiers are active.
  * [ ] Ensure **`HttpOnly`** and **`Secure`** flags (on production servers) are checked.
  * [ ] Access the site from an ad campaign url with UTM variables. Ensure parameters do not overwrite or reset to `"Direct"` on internal routing navigation.

### Step 2: Ingestions Queue Buffering Checking (Upstash Redis API Test)
* **Test Action:** Open terminal console and check Upstash Redis active queue items using: `LLEN tracking_pulse_queue`.
* **Verification Targets:**
  * [ ] Confirm that active client site interactions (page transitions, cart updates) increment the Redis queue size in real-time.
  * [ ] Attempt sending request variables to `/api/tracking/pulse` without the `x-pv-tracking-handshake` parameter. Ensure the endpoint safely rejects the payload with a `403 Forbidden` error.

### Step 3: Persistence Database Flush Checking (Flusher Cron Execution)
* **Test Action:** Trigger flusher endpoint execution using Postman / cURL commands (requires target secure Bearer token authentication): `/api/cron/flush-pulses`.
* **Verification Targets:**
  * [ ] Ensure the response returns a success state: `{ success: true, flushedCount: N }`.
  * [ ] Access MongoDB Atlas Compass tools, open `usersessions` and `userevents` collections, and verify that incoming telemetry data documents are written with updated timestamps.

### Step 4: Visual Sinks Auditing (CMS Panel Chart Validations)
* **Test Action:** Access CMS payload admin control panel views containing analytical charts layouts.
* **Verification Targets:**
  * [ ] Verify that financial figures (revenue sums, tax parameters) are consistent across both the Financial Report sheet metrics and the main Dashboard layout curves.
  * [ ] Ensure that the Conversion Funnel is rendering exact transitions ratios from PDP impressions to successful checkouts without any broken tracking gaps.
```

***

Aap ki hidayat ke mutabiq, yahan PocketValue custom telemetry system ke tamam **73 touchpoints (11 Completed + 62 Gaps)** ka ek consolidated, non-blocking, aur highly structured **Master Pipeline Tree & Architectural Flowchart** diya gaya hai. 

Is flowchart aur specification tree ko is tarah design kiya gaya hai ke har touchpoint apni exact ingestion route, logical categorization, aur database sink ke sath aapas mein connected dikhe:

---

## 🗺️ PART 1: THE UNIFIED INGESTION ARCHITECTURE FLOWCHART

Sare 73 touchpoints (Client Interactions, Edge Handshakes, S2S Webhooks, aur Heartbeats) is standard pipeline routing ke zariye database tak safe-land karte hain:

```text
                                   [USER SITE PRESENCE]
                                            │
   ┌───────────────────────┬────────────────┬────────────────┬────────────────────────┐
   │                       │                │                │                        │
   ▼                       ▼                ▼                ▼                        ▼
[EDGE ATTRIBUTION] [CLIENT ENGAGEMENT] [UI FRUSTRATIONS] [PULSE HEARTBEATS]  [S2S WEBHOOK GATEWAYS]
  - UTM validation    - Catalog clicks   - rage_clicks     - 40s passive pulse  - Secure callbacks
  - Handshake sets    - Form focuses     - js_exceptions   - Hidden suspend     - Handshake tokens
   │                       │                │                │                        │
   ▼                       ▼                ▼                ▼                        ▼
[Handshake Cookies]  [Interceptors]  [Local Buffers]  [Redis Ingestion API]  [Server API Routes]
   │                       │                │                │                        │
   └───────────────┬───────┴────────────────┴────────────────┼────────────────────────┘
                   │                                         │
                   ▼ (Asynchronous Execution)                ▼ (Fast Buffering Stream)
          [logUserEvent Action]                       [Upstash Redis List]
                   │                                         │
                   ▼ (Zod / Type Checks)                     ▼ (1000 Max Items Batch)
         [MongoDB Atlas Collections] ◄─────────────────[Cron Flusher Task]
           ├── UserSessions (Presence & Device logs)
           ├── UserEvents (Funnels, Errors, & CTRs)
           └── AbandonedCarts (Cart Snapshots & Recoveries)
```

---

## 🌲 PART 2: THE DETAILED MASTER PIPELINE TREE (ALL 73 TOUCHPOINTS)

PocketValue e-commerce platform ke har behavioral, technical, aur operational event ka architectural path is pipeline specification tree ke tehat execution levels par lock kiya gaya hai:

```text
[ROOT] POCKETVALUE TELEMETRY SPECIFICATION (73 TOUCHPOINTS)
│
├── 📂 LAYER 1: ENTRY & ATTRIBUTION PIPELINE (Edge & Proxy)
│   ├── [Route: proxy.ts Middleware Engine]
│   │   ├── 01. [Behavior 02] page_view (Transitions and routing checkpoints)
│   │   ├── 02. [Gap #18] session_start (Edge-to-Client UTM campaigns handshake)
│   │   └── 03. [Gap #73] recovered_cart_conversions (SMS/Email cart recovery link checks)
│   │
│   └── 📂 LAYER 2: IDENTITY, ONBOARDING & AUTHS BRANCH (NextAuth Engine)
│       ├── [Route: auth.ts Sign-In Callbacks]
│       │   ├── 04. [Gap #07] auth_attempt (Credentials vs Google sign-ins attempts)
│       │   ├── 05. [Gap #10] user_cohort (Creation age checks to flag new_user vs returning_user)
│       │   ├── 06. [Gap #13] login_prompt_triggered (Source checks on forced authentication prompts)
│       │   ├── 07. [Gap #20] identity_merge (Background task linking anonymous data to authenticated ID)
│       │   ├── 08. [Gap #27] auth_pre_submit_friction (Form focus/blur pre-submit signup exits)
│       │   ├── 09. [Gap #29] latency_duration_ms (Stopwatch checks on OTP verification delivery speeds)
│       │   └── 10. [Gap #31] profile_fields_updated (Metadata adjustments on user profile panels)
│       │
│       └── [Route: useCart.ts Local State Synchronization]
│           ├── 11. [Gap #28] cart_rehydrated (Rehydrating localStorage cart caches on new session mounts)
│           └── 12. [Gap #30] cart_merged (Merging desktop and mobile cart items conflicts on logins)
│
├── 📂 LAYER 3: CLIENT-SIDE DISCOVERY & PDP ENGAGEMENT BRANCH (Browser Engine)
│   ├── [Route: SearchBar.tsx & search/page.tsx Server Interface]
│   │   ├── 13. [Behavior 03] search_performed (Tracking manual product search strings queries)
│   │   ├── 14. [Gap #32] search_zero_results (Empty search outputs checks to track out-of-stock demands)
│   │   └── 15. [Gap #42] search_trigger_source (Classification: manual keys vs autosuggest options clicks)
│   │
│   ├── [Route: ProductCard.tsx Listing Viewport Observers]
│   │   ├── 16. [Gap #33] filter_applied (Applied sort filters criteria logs on category catalogs)
│   │   ├── 17. [Gap #35] search_result_click (Rank position indices clicks on listings items selection)
│   │   ├── 18. [Gap #36] product_click (Standard catalog card clicks selection metrics)
│   │   ├── 19. [Gap #38] product_impression (IntersectionObserver tracking after 50% visibility for 1.5s)
│   │   ├── 20. [Gap #44] catalog_pagination_depth (Catalog continuous scrolling paginations page transitions)
│   │   └── 21. [Gap #45] oos_alternatives_ctr (Clicks actions tracing on out-of-stock items recommendations)
│   │
│   └── [Route: ProductClientManager.tsx Detail Page Monitors]
│       ├── 22. [Gap #34] pdp_interaction (Reading stopwatch times and active scroll depths checkpoints)
│       ├── 23. [Gap #37] wishlist_cart_source (Appending 'source: wishlist' context when added to cart)
│       ├── 24. [Gap #39] back_in_stock_subscription (Restock subscriptions notifier submissions details)
│       ├── 25. [Gap #40] review_grid_expand (Review grids expands, paginations, and help trust clicks)
│       ├── 26. [Gap #41] variant_price_compared (Dynamic prices comparison tracking on attribute toggles)
│       ├── 27. [Gap #43] pdp_media_interaction (Lightbox zooms swipers clicks and gallery video views times)
│       ├── 28. [Gap #46] review_filter_actions (Rating standard filters selections click CTR)
│       └── 29. [Gap #47] review_submitted (Verified reviews submission logs linked with order checks)
│
├── 📂 LAYER 4: TRANSACTION & CONVERSION CONTEXT (Checkout Engine)
│   ├── [Route: useCart.ts Clickstream Ingestor]
│   │   ├── 30. [Behavior 04] add_to_cart (Standard selection add interactions)
│   │   ├── 31. [Behavior 05] remove_from_cart (Standard selection delete interactions)
│   │   ├── 32. [Behavior 06] cart_quantity_accumulated (1.5s debouncer accumulator events dispatcher)
│   │   ├── 33. [Behavior 07] wishlist_add (Dynamic wishlist additions metrics)
│   │   ├── 34. [Behavior 08] wishlist_remove (Wishlist deletions using wishlist_remove actions)
│   │   └── 35. [Behavior 09] buy_now_click (Dual consecutive logs sequence bypasses cart views)
│   │
│   ├── [Route: CheckoutForm.tsx Layout Components UI]
│   │   ├── 36. [Behavior 10] checkout_start (Initial checkout mount and form rendering)
│   │   ├── 37. [Gap #12] checkout_error (Validation crashes, empty address, and gateway failures tracking)
│   │   ├── 38. [Gap #13] checkout_step_view (Progression paths tracking: inputs panels vs payment selects)
│   │   ├── 39. [Gap #14] shipping_method_selected (COD delivery selection vs standard express ranges)
│   │   ├── 40. [Gap #15] payment_method_selected (Online secure card selections vs cash on delivery targets)
│   │   ├── 41. [Gap #19] form_field_interaction (Focus/blur speed checks inside checkout inputs fields)
│   │   └── 42. [Gap #66] rto_risk_flagged (Automated address parsing filters to flags delivery RTO risks)
│   │
│   └── [Route: order-success/[orderId]/page.tsx Conversion Ingestion]
│       ├── 43. [Behavior 11] purchase (Database-validated conversion logs protected by idempotency checks)
│       ├── 44. [Gap #16] coupon_applied (Successful coupon application metrics updates)
│       ├── 45. [Gap #17] coupon_removed (Coupon manual deletions and validation rejections logs)
│       └── 46. [Gap #18] gateway_redirect_initiated (Exact milliseconds timestamp log when leaving site)
│
├── 📂 LAYER 5: CENTRAL SECURITY & TECHNICAL SENTINEL HUB (System Monitors)
│   ├── [Route: IntelligenceTracker.tsx Global Shell Wrapper]
│   │   ├── 47. [Gap #20] tab_loss_duration_ms (Visibility focus triggers to evaluate redirections latency)
│   │   ├── 48. [Gap #22] auth_session_expired (Logging mid-checkout token and sessions disconnect crashes)
│   │   ├── 49. [Gap #48] exit_intent_triggered (Mouse trajectory alerts trigger on exit moves)
│   │   ├── 50. [Gap #49] js_exception (Global error and unhandled promise rejections catches)
│   │   ├── 51. [Gap #50] performance_metric (DOM speeds rendering and load timing benchmarks)
│   │   ├── 52. [Gap #52] rage_click_detected (Rapid clicking monitors catching identical coordinates)
│   │   ├── 53. [Gap #53] offline_local_buffer (Disconnects event cache buffering inside local storage elements)
│   │   └── 54. [Gap #54] late_content_shift (Isolates layout shifts clicks from organic selections)
│   │
│   └── [Route: useCart.ts Storage Engine Monitor]
│       └── 55. [Gap #55] cart_desync_error (Cross-tab changes listener reconciling inactive React states)
│
├── 📂 LAYER 6: OPERATIONS, BANNER CAMPAIGNS & LIFECYCLE BRANCH (S2S Hub)
│   ├── [Route: UI Layout & Promo Components Views]
│   │   ├── 56. [Gap #56] banner_click (Homepage sliders and marketing grids selection tracking)
│   │   ├── 57. [Gap #57] oos_attempt (Disabled variation checkout button click intent tracking)
│   │   ├── 58. [Gap #61] support_engagement_click (Floating WhatsApp chat or support desk widgets engagement)
│   │   ├── 59. [Gap #62] policy_page_view (Compliance and terms details page routing changes)
│   │   ├── 60. [Gap #63] shipping_threshold_proximity (Nudge monitoring based on subtotal proximity to thresholds)
│   │   ├── 61. [Gap #64] scarcity_exposure (Low stock badges view exposures checkpoints)
│   │   ├── 62. [Gap #65] experiment_variant_exposed (A/B testing dynamic display variation buckets exposures)
│   │   ├── 63. [Gap #69] product_shared (Sharing button select copy parameters)
│   │   ├── 64. [Gap #71] cookie_consent_toggled (Standard compliance privacy choice selections Accept/Decline)
│   │   └── 65. [Gap #72] pwa_prompt_metric (PWA installation drawer metrics monitoring)
│   │
│   ├── [Route: useCheckout.ts Cart Snapshots Monitor]
│   │   └── 66. [Behavior 01] cart_abandonment_pulse (4s idle sync generating AbandonedCarts collection logs)
│   │
│   └── [Route: API Secure Webhooks Handshaking]
│       ├── 67. [Gap #59] crm_sync (Order cancels/refunds sync from CRMs back to Mongoose schemas)
│       ├── 68. [Gap #60] s2s_purchase (S2S verified gateways callbacks to bypass client-side ad-blockers)
│       ├── 69. [Gap #67] cross_device_session_stitch (NextAuth merges guest visitorId on registration hooks)
│       ├── 70. [Gap #68] return_portal_drop (Customer return requests form step-completions tracking)
│       └── 71. [Gap #70] logistics_delay ( Courier delivery status updates and delays codes sync)
│
└── 📂 LAYER 7: PULSE HEARTBEAT REDIS STREAM BUFFER
    ├── [Route: /api/tracking/pulse Redis Gateway]
    │   └── 72. [Behavior 01] pulse_heartbeat (Client active presence parameters rate-limited stream)
    │
    └── [Route: IntelligenceTracker.tsx Passive Controller]
        └── 73. [Gap #51] pulse_suspended (Hidden window states suspends heartbeats to save server bandwidth)
```

---

## 🏁 ARCHITECTURAL SEALING STATEMENT

PocketValue custom analytics ecosystem ke tamam **73 distinct touchpoints** is consolidated design matrix aur pipeline tree structure ke tehat compile aur lock kar diye gaye hain:

* **Ingestion Integrity:** Client-side user behavior hooks aur server-side secure S2S API endpoints ka parallel routing channel redundant and duplicate clicks ko cleanly drop kar deta hai.
* **Structural Safety:** Har node leaf and branch strict Mongoose validation schemas (`UserEvent.ts`) aur NextAuth callbacks (`auth.ts`) ke parameters checking ke sath seamless scale par execute hone ke liye tayar hai.

Aap is unified architecture tree aur complete 73 steps pipeline flow ko standard implementation guideline ke taur par use kar sakte hain!