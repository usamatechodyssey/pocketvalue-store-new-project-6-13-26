```markdown
# PRODUCT REQUIREMENT DOCUMENT & TECHNICAL SPECIFICATION (PRD)
**Project:** PocketValue Custom Ecommerce Analytics & Ingestion Hub (`POCKETVALUE_STORE_PAYLOAD`)  
**Status:** SEALED & PRODUCTION-READY (MILESTONE 1 & 2 SECURED)  
**Target Environment:** Next.js (App Router), Payload CMS v3 (Admin panel framework), MongoDB Atlas (Mongoose), Upstash Redis (Queue & Rate Limiting), Vercel (Serverless Deployment).  
**Current Date:** June 2026

---

## 1. PROJECT OVERVIEW & GOALS
The `POCKETVALUE_STORE_PAYLOAD` is a highly optimized, high-performance telemetry ingestion pipeline and growth marketing analytics hub built custom for the PocketValue Pakistani retail store. 

The system tracks client-side events, manages active anonymous sessions, captures abandoned cart leads, aggregates financial data, generates diagnostic attribution insights, and provides automated bulk email marketing dispatchers directly from the custom Payload CMS Admin view.

### Core Architectural Mandates:
*   **Zero Ingestion Leakage:** Client events must buffer in-memory via Redis to avoid serverless timeouts, followed by scheduled cron flushes to MongoDB.
*   **Data Integrity & Grouping Guards:** Anonymous metrics and guest checkouts must never pollute authenticated cohort data.
*   **High Availability & Vercel-Safe:** Long-lived persistent streaming connections (like standard SSE) must be avoided in Vercel Serverless to prevent execution hour exhaustion and gateway timeouts.
*   **Strict Security Gating:** Public ingestion channels must use secure handshakes and rate limiters; admin visual analytics must be strictly Next-Auth session-role-gated.

---

## 2. SYSTEM ARCHITECTURE & DIRECTORY MAP

This map represents the exact physical locations of all sealed backend modules, database schemas, and custom view components:

```text
POCKETVALUE_STORE_PAYLOAD/
├── .env.local                          [File] (Untracked Config)
├── .gitignore                          [File]
├── .next/                              [Folder] (NextJS Build Dir)
├── custom.d.ts                         [File]
├── declarations.d.ts                   [File]
├── docs/                               [Folder] (Untracked Docs)
├── eslint.config.mjs                   [File]
├── image-loader.ts                     [File]
├── media/                              [Folder]
├── next-env.d.ts                       [File]
├── next.config.ts                      [File]
├── node_modules/                       [Folder]
├── package-lock.json                   [File] (Modified)
├── package.json                        [File]
├── postcss.config.mjs                  [File]
├── public/                             [Folder] (Asset Directory)
├── README.md                           [File]
├── sanity.cli.ts                       [File]
├── sanity.config.ts                    [File]
├── scripts/                            [Folder] (Untracked Automation)
├── tsconfig.json                       [File]
├── vercel.json                         [File] (Serverless Routing Config)
│
└── src/                                [Folder]
    ├── collections/                    [Folder] (Payload CMS Models)
    ├── email_templates/                [Folder] (Transactional HTML Layouts)
    ├── fields/                         [Folder] (Custom CMS Field Schemas)
    ├── globals/                        [Folder] (Payload CMS Global Settings)
    ├── lib/                            [Folder] (Core Helper Frameworks)
    ├── models/                         [Folder] (Mongoose Models - Untracked)
    ├── payload-types.ts                [File] (Modified Code Generation)
    ├── payload.config.ts               [File] (Modified Main Config)
    ├── proxy.ts                        [File] (Modified - Core Edge Middleware)
    ├── sanity/                         [Folder] (Sanity Content Framework)
    ├── types/                          [Folder]
    ├── utils/                          [Folder]
    │
    └── app/                            [Folder] (NextJS App Directory)
        ├── _components/                [Folder]
        ├── actions.ts                  [File]
        ├── admin.css                   [File]
        ├── layout.tsx                  [File]
        ├── auth.ts                     [File] (Modified - NextAuth Setup)
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
        ├── (main)/                     [Folder] (Modified - Store Pages)
        │   ├── (pages)/                [Folder]
        │   ├── access-denied/          [Folder]
        │   ├── account/                [Folder]
        │   ├── blog/                   [Folder]
        │   ├── cart/                   [Folder] (Modified - Store Cart View)
        │   ├── category/               [Folder]
        │   ├── checkout/               [Folder]
        │   ├── contact-us/             [Folder]
        │   ├── deals/                  [Folder]
        │   ├── faq/                    [Folder]
        │   ├── forgot-password/        [Folder]
        │   ├── gift-cards/             [Folder]
        │   ├── login/                  [Folder]
        │   ├── order-failure/          [Folder]
        │   ├── order-success/          [Folder]
        │   ├── product/                [Folder]
        │   ├── register/               [Folder]
        │   ├── reset-password/         [Folder]
        │   ├── search/                 [Folder]
        │   ├── sell/                   [Folder]
        │   ├── studio/                 [Folder]
        │   ├── verify-email/           [Folder]
        │   ├── wishlist/               [Folder]
        │   ├── layout.tsx              [File] (Modified - Store Base Wrapper)
        │   ├── loading.tsx             [File]
        │   ├── page.tsx                [File]
        │   └── template.tsx            [File]
        │
        ├── (payload)/                  [Folder] (Payload Admin Engine)
        │   ├── admin/                  [Folder]
        │   │   ├── [[...segments]]/    [Folder]
        │   │   ├── views/              [Folder] (Core Custom Views)
        │   │   │   ├── AnalyticsDashboard.tsx      (Modified)
        │   │   │   ├── CategoryExplorer.tsx
        │   │   │   ├── ImportCategories.tsx
        │   │   │   ├── ImportProducts.tsx
        │   │   │   ├── InventoryRiskList.tsx
        │   │   │   ├── MarketingHubView.tsx        (Modified)
        │   │   │   ├── OrderDetail.tsx
        │   │   │   ├── OrdersList.tsx
        │   │   │   ├── PaymentSettings.tsx
        │   │   │   ├── ProductIntelligenceView.tsx
        │   │   │   ├── ProductsList.tsx
        │   │   │   ├── ReportDetail.tsx            (Untracked)
        │   │   │   ├── ReportDetailContent.tsx     (Untracked)
        │   │   │   ├── ReportsIndex.tsx            (Untracked)
        │   │   │   ├── ReturnDetail.tsx
        │   │   │   ├── ReturnsList.tsx
        │   │   │   ├── StaffManagement.tsx
        │   │   │   ├── UserDetail.tsx              (Modified)
        │   │   │   └── UsersList.tsx
        │   │   └── importMap.js                    (Modified)
        │   └── api/                    [Folder]
        │
        ├── actions/                    [Folder] (Untracked)
        │   ├── analytics/              [Folder] (Untracked - Core Aggregations)
        │   │   ├── marketing/          [Folder]
        │   │   │   ├── getAudienceVault.ts         (Untracked)
        │   │   │   ├── getCampaignIntelligence.ts  (Untracked)
        │   │   │   ├── getHubSummary.ts            (Untracked)
        │   │   │   ├── getProductFriction.ts       (Untracked)
        │   │   │   └── types.ts                    (Untracked)
        │   │   │
        │   │   ├── exportDetailedReport.ts         (Untracked)
        │   │   ├── getAISentinel.ts
        │   │   ├── getBehavioralIntelligence.ts
        │   │   ├── getDetailedReportData.ts        (Untracked)
        │   │   ├── getExecutiveAnalytics.ts        (Modified)
        │   │   ├── getGeospatialIntelligence.ts    (Modified)
        │   │   ├── getGranularFinancials.ts        (Modified)
        │   │   ├── getInventoryForecaster.ts
        │   │   ├── getLoyaltyIntelligence.ts       (Modified)
        │   │   ├── getOperationalIntelligence.ts   (Modified)
        │   │   ├── getSalesChartData.ts            (Modified)
        │   │   ├── getTopProducts.ts               (Modified)
        │   │   ├── getTrafficAttribution.ts        (Modified)
        │   │   ├── index.ts
        │   │   └── verifyAdminAccess.ts
        │   │
        │   ├── addressActions.ts
        │   ├── authActions.ts
        │   ├── contactActions.ts
        │   ├── couponActions.ts                    (Modified)
        │   ├── globalSettingsActions.ts            (Modified)
        │   ├── mongoPaymentSettingsActions.ts
        │   ├── orderActions.ts                     (Modified)
        │   ├── payloadAdminActions.ts
        │   ├── payloadAnalyticsActions.ts
        │   ├── payloadCategoryActions.ts
        │   ├── payloadCategoryAdminActions.ts
        │   ├── payloadInventoryActions.ts          (Modified)
        │   ├── payloadMassDeletionActions.ts
        │   ├── payloadProductActions.ts
        │   ├── payloadProductExplorerActions.ts
        │   ├── payloadProductIntelligenceActions.ts (Modified)
        │   ├── payloadReturnAdminActions.ts
        │   ├── payloadUserAdminActions.ts          (Modified)
        │   ├── returnActions.ts
        │   ├── reviewActions.ts
        │   ├── searchActions.ts
        │   ├── shippingActions.ts                  (Modified)
        │   ├── trackingActions.ts                  (Modified)
        │   ├── visualSearchActions.ts
        │   └── wishlistActions.ts
        │
        ├── api/                        [Folder] (Untracked)
        │   ├── auth/[...nextauth]/     [Folder]
        │   │   └── route.ts
        │   ├── cron/                   [Folder] (Untracked)
        │   │   ├── flush-pulses/       [Folder]
        │   │   │   └── route.ts                    (Untracked)
        │   │   ├── low-stock-alert/    [Folder]
        │   │   │   └── route.ts                    (Modified)
        │   │   └── loyalty-sync/       [Folder]
        │   │       └── route.ts                    (Untracked)
        │   ├── filter/                 [Folder]
        │   │   └── route.ts
        │   ├── google-shopping/        [Folder]
        │   │   └── route.ts
        │   ├── og/                     [Folder]
        │   │   └── route.tsx
        │   ├── orders/                 [Folder]
        │   │   ├── create/             [Folder]
        │   │   │   └── route.ts                    (Modified)
        │   │   └── invoice/[orderId]/  [Folder]
        │   │       └── route.ts
        │   ├── payment/                [Folder]
        │   │   ├── gateways/           [Folder]
        │   │   │   └── route.ts
        │   │   ├── initiate/           [Folder]
        │   │   │   └── route.ts
        │   │   └── verify/[gateway]/   [Folder]
        │   │       └── route.ts
        │   ├── register/               [Folder]
        │   │   └── route.ts
        │   ├── tracking/               [Folder] (Untracked)
        │   │   ├── live-stream/        [Folder]
        │   │   │   └── route.ts                    (Untracked)
        │   │   └── pulse/              [Folder]
        │   │       └── route.ts                    (Modified)
        │   ├── upload-image/           [Folder]
        │   │   └── route.ts
        │   ├── user/update-image/      [Folder]
        │   │   └── route.ts
        │   ├── verify-coupon/          [Folder]
        │   │   └── route.ts
        │   └── visual-search/          [Folder]
        │       └── route.ts
        │
        └── components/                 [Folder]
            ├── admin/                  [Folder]
            ├── category/               [Folder]
            ├── dashboard/              [Folder]
            ├── home/                   [Folder]
            ├── intelligence/           [Folder] (Untracked - Telemetry Tracker)
            ├── layout/                 [Folder]
            │
            ├── payload-analytics/      [Folder] (Untracked - Core Analytics UI)
            │   ├── helpers/            [Folder] (Untracked)
            │   │   ├── getAcquisitionReportData.ts (Untracked)
            │   │   ├── getFinancesReportData.ts    (Untracked)
            │   │   └── getProductReportData.ts     (Untracked)
            │   │
            │   ├── AISentinel.tsx
            │   ├── AnalyticsDashboardContent.tsx   (Modified)
            │   ├── AnalyticsDateRangePicker.tsx    (Modified)
            │   ├── AnalyticsStatCard.tsx
            │   ├── CustomReportsNavLink.tsx        (Untracked)
            │   ├── GeospatialIntelligence.tsx
            │   ├── InventoryForecaster.tsx
            │   ├── InventoryRiskContent.tsx        (Modified)
            │   ├── LoyaltyIntelligence.tsx
            │   ├── OperationalIntelligence.tsx
            │   ├── PriceAnatomySurgeon.tsx         (Modified)
            │   ├── ProductDrillDownModal.tsx
            │   ├── ProductIntelligenceContent.tsx  (Modified)
            │   ├── ProductIntelligenceFilters.tsx
            │   ├── ReportChartSection.tsx          (Untracked)
            │   ├── reportConfigs.ts                (Untracked)
            │   ├── ReportPaginationSection.tsx     (Untracked)
            │   ├── ReportsFilter.tsx               (Untracked)
            │   ├── ReportSidebarSection.tsx        (Untracked)
            │   ├── ReportTableSection.tsx          (Untracked)
            │   ├── SalesPerformanceChartApex.tsx   (Untracked)
            │   ├── TopProductsList.tsx
            │   ├── TrafficSourceChart.tsx          (Modified)
            │   └── UserBehavioralIntent.tsx
            │
            ├── payload-categories/     [Folder]
            │
            ├── payload-marketing/      [Folder] (Modified - Lead Recovery UI)
            │   ├── AudienceVault.tsx               (Modified)
            │   ├── CampaignSurgeon.tsx             (Modified)
            │   ├── ConversionFunnel.tsx            (Modified)
            │   ├── ConversionPulseChart.tsx        (Modified)
            │   ├── LiveRadar.tsx                   (Modified)
            │   ├── MarketPulseChart.tsx            (Modified)
            │   ├── ProductFrictionExplorer.tsx     (Modified)
            │   ├── RecoveryCommandCenter.tsx       (Modified)
            │   └── RecoveryPulse.tsx
            │
            ├── payload-orders/         [Folder]
            ├── payload-products/       [Folder]
            ├── payload-returns/        [Folder]
            ├── payload-staff/          [Folder]
            ├── payload-users/          [Folder]
            ├── product/                [Folder]
            ├── reviews/                [Folder]
            ├── ui/                     [Folder]
            └── PWAInstallPrompt.tsx    [File]
```

---

## 3. ENGINE MODULE SPECIFICATIONS

### 3.1 Edge Identity Layer (`proxy.ts` Middleware)
*   **visitorId Extraction:** Standard UUIDv4 assigned to client device cookies (`pv_visitor_id`) with a persistent `30 days` maxAge.
*   **sessionId Inactivity Allocation:** Generates unique session cookie (`pv_session_id`) expiring dynamically on a **30-minutes inactivity window** (standard GA4 behavior).
*   **Triple-Guard Campaign Reset:** Protects from session fragmentation. Generates a fresh `sessionId` ONLY if a session does not exist, or the visitor navigates onto the storefront from a *different* UTM attribution source (`utm_source` in url parameters does not match `cookieSource`).
*   **Attribution Cookie Management:** Sets `utm_source`, `utm_medium`, and `utm_campaign` response cookies (24 hours maxAge). Fallbacks cleanly to `"Direct"` only if no previous campaign cookie is active.

### 3.2 Thread-Safe Layout Bridge (`layout.tsx`)
*   Extracts verified tracking variables directly from server headers (`x-pv-session-id`, `x-pv-visitor-id`).
*   **Data Collision Safeguard:** If edge headers are blocked or missing, generates unique fallback identifiers using `crypto.randomUUID()` (`pv-srv-sess-${uuid}` and `pv-srv-vis-${uuid}`) to prevent dynamic data collision between separate anonymous users.

### 3.3 Client-Side Ingestion Tracker (`IntelligenceTracker.tsx`)
*   **Silent Ingestion Heartbeat:** Fires client metadata payload to `/api/tracking/pulse` immediately on render, and repeats on a 40-seconds background interval. Passes standard platform constraints (operating system, desktop vs mobile).
*   **Duplicate Event Prevention:** Maintains session-agnostic `sessionStorage` keys (e.g., `pv_v4_view_${pathname}`) to prevent double-counting page views on fast reload actions.
*   **Abandoned Cart Recovery Snapshots:** Monitored asynchronously with a **4-second idle-state handler**. Syncs complete cart item states, subtotals, and verified Next-Auth customer parameters (`email` and `phone` parsed from verified session data) dynamically.

### 3.4 Client Cart Hook State Transitions (`useCart.ts`)
*   **Encapsulated Event Triggers:** Client telemetry calls are directly embedded inside cart actions (`onAdd`, `onRemove`, `toggleCartItemQuantity`) to avoid reliance on unstable React `useEffect` watches (which historically failed to capture item quantity updates).
*   **Dynamic Quantity Accumulator (Debouncer):** Compresses fast click-spamming by using a **1.5-second accumulator timer** (`debounceQuantityTrack`). Click fluctuations are calculated, and only a single aggregated tracking write query (`add_to_cart` or `remove_from_cart`) is dispatched to the server, protecting database write pools.
*   **Dual Buy-Now Pipelines:** Synchronously fires consecutive `add_to_cart` and `checkout_start` events before routing users to `/checkout`.

### 3.5 API Handshake Ingestion Queue (`api/tracking/pulse`)
*   **Handshake Security Gate:** Enforces header compliance, validating `x-pv-tracking-handshake` strictly against the token value `pv-telemetry-secure-jwt-2026`.
*   **Dynamic Telemetry Spam Limiter:** Runs IP-address rate-limiting checks via Redis singleton to block telemetry injection attacks.
*   **Buffered List Queue:** Telemetry payloads are safely pushed (`LPUSH`) to a centralized Redis list `tracking_pulse_queue`.

### 3.6 Automated Cron Flusher (`api/cron/flush-pulses`)
*   **Vercel Serverless Protection:** Background cron executions retrieve the current Redis queue length.
*   **Atomic Batching Capping:** Pops exact dynamic batch sizes up to **`maxBatch = 1000`** items atomically (`RPOP` inside a Redis pipeline) to guarantee serverless functions never exceed target timeout windows.
*   **UPSERT Mongo Writes:** Runs massive `.bulkWrite` operations on `UserSession` schemas. Overwrites `lastPulse` and device stats, while preserving original UTM campaigns and creation timestamps (`$setOnInsert`).

---

## 4. MARKETING SUMMARY & CAMPAIGN DISPATCHERS

### 4.1 Ingestion Analytics Server Actions
*   **`getMarketingIntelligencePayload`:** Aggregates online visitor traffic (using a standard 2-minute active threshold) and calculates Today's conversions.
*   **`getDeepCampaignIntelligence`:** Integrates traffic events, cart steps, and orders dynamically. Maps **Net Add to Cart** metrics accurately (calculating `add_to_cart` minus `remove_from_cart` events) to show authentic leaks.
*   **`getAudienceVaultData`:** Segments captured leads. Runs VIP aggregation querying repeat purchases (>= 2 successful orders). **Guest Protection Gate:** Filters out empty customer records (`userId: { $ne: null }`) in Mongoose aggregation, preventing data pollution.
*   **`getProductFrictionPayload`:** Calculates product conversion drop-offs. Assigns diagnostic ratings (`LOW_INTEREST`, `PRICE_BARRIER`, `WINNER`, `STABLE`) based on interest-to-conversion performance.
*   **`sendBulkCampaign`:** Handles bulk SMTP recovery dispatches. Queries `AbandonedCart` and `User` collections concurrently (`Promise.all`) using incoming targeting arrays to ensure both guests and VIP repetition leads receive recovery offers.

### 4.2 Secure Polling Live Engine (`api/tracking/live-stream`)
*   **Serverless Safety Conversion:** Long-lived SSE streaming tunnels are deprecated. Instead, a Next-Auth secured GET route serves single JSON snapshots.
*   **Client Polling Controller:** `LiveRadar.tsx` runs a background **10-seconds client fetch poll** using standard intervals, preventing Vercel execution timeouts and MongoDB connection leaks.

---

## 5. DATABASE SCHEMA DEFINITIONS

All analytics and telemetry models are maintained inside MongoDB Atlas via Mongoose:

```typescript
// 1. USER SESSION SCHEMA (UserSession)
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
}

// 2. USER EVENT SCHEMA (UserEvent)
{
  sessionId: { type: String, required: true, index: true },
  eventType: { 
    type: String, 
    enum: ['page_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'search', 'wishlist_add', 'purchase'],
    required: true 
  },
  path: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}

// 3. ABANDONED CART SCHEMA (AbandonedCart)
{
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, ref: 'User', index: true },
  items: [{ type: Schema.Types.Mixed }],
  subtotal: { type: Number, default: 0 },
  contactCaptured: { type: Boolean, default: false },
  email: { type: String },
  phone: { type: String },
  isRecovered: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}

// 4. USER PERFORMANCE INDEXES (User)
UserSchema.index({ createdAt: -1 }); // Registration tracking
UserSchema.index({ role: 1, createdAt: -1 }); // Gating cohort reports
```

---

## 6. INVARIANT CHECKS (CRITICAL DEVELOPER GUIDELINES)

Any developer or AI continuing from this stage **MUST** strictly respect these rules to prevent system regression:

1.  **Never Use Serverless SSE streams:** Do not create persistent keep-alive routes in `api/tracking/live-stream/route.ts` on serverless environments. Maintain the secure Next-Auth validated polling pattern.
2.  **Always Perform Safe Cache Deserializations:** Redis cache getters must check if retrieved data is a string and deserialize safely: `typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;`.
3.  **Strict Aggregate Grouping Checks:** VIP repeat purchase aggregation pipelines must filter out guest accounts (`userId: { $ne: null }`) to avoid null pointer crashes during `.toString()` iterations on anonymous checkouts.
4.  **Enforce Safe Initialization Slices:** Client-side charts and tabular components must perform empty-array safeguards (`const safeData = data || [];`) at the top of the render cycles before checking length parameters or evaluating dynamic stats.
5.  **Maintain Tailwind v3 Compatibilities:** Custom visual progress elements or layouts must use standard Tailwind v3 gradient tags (e.g., `bg-gradient-to-r`) rather than experimental v4 commands (`bg-linear-to-r`) to prevent layout transparency crashes.

---

## 7. NEXT DEVELOPMENT MILESTONES (THE ROADMAP)

Future tasks to continue project scaling:
*   [ ] **Milestone 3.1: Automated Discount Code Engine:** Generate custom, short-expiration discount codes dynamically inside Payload CMS when carts remain abandoned for more than 4 hours, injecting them into the email recovery pipeline.
*   [ ] **Milestone 3.2: Local SMS Ingestion Channels:** Integrate Pakistani local SMS gateways (like SMSConnex or TeleSign) to allow dynamic dispatch of discount codes straight to Hot Leads' phone numbers.
*   [ ] **Milestone 3.3: Advanced LTV Projection Models:** Add machine learning predictive formulas or statistical modeling inside `getExecutiveAnalytics.ts` to predict Customer Lifetime Value based on historical RFM (Recency, Frequency, Monetary) metrics.
```

---