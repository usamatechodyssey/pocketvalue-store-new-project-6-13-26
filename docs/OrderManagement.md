
```markdown
# 🏗️ POCKETVALUE OMS — ENTERPRISE ARCHITECTURE (MODULAR & CRASH-PROOF DESIGN)

**Version:** 4.0 (Modular, Complete & Crash-Proof)  
**Date:** July 09, 2026  
**Target:** Pakistan Local Market (COD, Bank Transfer, JazzCash/EasyPaisa)  
**Cost Strategy:** $0/month (Sustainable for up to 1000 orders/month)

---

## 📋 GLOBAL TECHNOLOGY STACK (Shared Across All Modules)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Hosting** | Vercel (Serverless) | Next.js 16 hosting, API routes, Edge/Proxy functions. |
| **Database** | MongoDB Atlas (M0) | Primary storage (512MB). Connection pooling applied. |
| **Cache/Locks** | Upstash Redis (Free) | 500k commands/month. Used for distributed locks, queues, and caching. |
| **Core Framework** | Payload CMS + Next.js 16 | Admin panel, RBAC, Local API, Server Actions. |

---

## 📂 COMPLETE FILE STRUCTURE (Adapter-Based)

```text
order-fulfillment/
├── actions/
│   ├── ordersActions.ts               # Core order logic (Uses Adapters for side-effects)
│   ├── shipmentActions.ts             # Split shipments, AWB generation
│   ├── payloadAdminActions.ts         # RBAC roles
│   └── payloadReturnAdminActions.ts   # RMA vs RTO
├── lib/
│   ├── adapters/                      # 🔥 THE ADAPTER LAYER
│   │   ├── communication/
│   │   │   ├── CommunicationFactory.ts   # Router: Email/WhatsApp toggle logic
│   │   │   ├── MailjetAdapter.ts
│   │   │   ├── ResendAdapter.ts
│   │   │   └── WhatsAppAdapter.ts
│   │   ├── courier/
│   │   │   ├── CourierFactory.ts        # Router: TCS/Trax toggle logic
│   │   │   ├── TcsAdapter.ts
│   │   │   ├── TraxAdapter.ts
│   │   │   └── PostExAdapter.ts
│   │   ├── media/
│   │   │   ├── MediaFactory.ts          # Router: ImgBB/R2 toggle logic
│   │   │   ├── ImgBBAdapter.ts
│   │   │   └── CloudflareR2Adapter.ts
│   │   └── payment/
│   │       ├── PaymentFactory.ts        # Already existing
│   │       ├── JazzCashAdapter.ts
│   │       └── EasyPaisaAdapter.ts
│   ├── mongodb.ts                     # Mongoose connection (maxPoolSize: 10)
│   ├── auditLogger.ts                 # Admin action logging
│   └── mediaHandler.ts                # Sharp WebP conversion
├── proxy.ts                           # 🔥 Next.js 16 Middleware (Handles Rate Limiter + Session/UTM)
├── api/webhooks/                      # Webhook listeners
│   ├── payment/route.ts               # JazzCash/EasyPaisa IPN
│   └── courier/route.ts               # TCS/Trax tracking updates
└── views/                             # Payload CMS Views
```

---

## 🧩 MODULE 1: CORE ORDER MANAGEMENT ENGINE

*This module contains the pure business logic of orders. No infrastructure or third-party vendor logic lives here.*

### 1.1 Order Lifecycle & State Machine

| Current State | Allowed Next States | Trigger / Action |
| :--- | :--- | :--- |
| **Pending** | Payment Verified, Cancelled | Payment success / Admin cancel |
| **Payment Verified** | Ready to Ship, Fraud Hold | OTP verified / Admin hold |
| **Ready to Ship** | Shipped (Partial/Full) | AWB generated (Stock Deducted) |
| **Shipped** | In Transit, RTO | Courier pickup / Webhook |
| **In Transit** | Delivered, RTO | Courier webhook |
| **Delivered** | Completed, Return Requested | Customer receives order |
| **Return Requested** | Return Approved, Rejected | Admin inspects RMA |
| **Return Approved** | Refund Initiated | Finance team processes |
| **RTO** | Auto-Restocked | Automatic inventory adjustment (Loss Logged) |
| **Completed** | (Terminal) | No further actions. |
| **Cancelled** | (Terminal) | No further actions. |

> **Validation:** A strict state machine validator will block invalid jumps (e.g., "Shipped" -> "Pending").

### 1.2 Inventory & Partial Fulfillment

| Feature | Implementation |
| :--- | :--- |
| **Soft Hold** | Stock reserved for 24 hours upon order creation. Released via `waitUntil` if OTP/payment fails. |
| **Stock Deduction** | Deducted when order moves to "Ready to Ship". |
| **Split Shipments** | One `Order` can have multiple `Shipment` records (Multiple AWBs for partial dispatch). |
| **RTO Restock** | Inventory auto-restored when RTO is triggered. Loss logged for finance. |
| **RMA Restock** | Stock only restored after "Return Approved" and quality check. |

---

## ⚙️ MODULE 2: INFRASTRUCTURE & PERFORMANCE (Crash-Proof Strategy)

*This module handles Vercel serverless limits, database connection pooling, and the rate limiter. It ensures the system does NOT crash under production load.*

### 2.1 The 3 Critical Production Risks & Fixes

| Risk | Impact | Enterprise Fix | Status |
| :--- | :--- | :--- | :--- |
| **1. DB Connection Limits** | MongoDB M0 (100 connections). 50 concurrent requests = timeout. | **`maxPoolSize: 10`** in Mongoose & Payload. `minPoolSize: 0` to release idle connections. | ✅ **Already in your code** |
| **2. Rate Limiter Load** | MongoDB TTL (old plan) would kill DB connections. | **Shift to Edge/Proxy + Raw Redis Commands (`INCR`/`EXPIRE`).** <br> **MongoDB par 0 (Zero) Load.** | ⏳ **To Implement** (Update `proxy.ts`) |
| **3. Database Backups** | Data loss. Recovery impossible. | **Admin Manual Backup Dashboard** (Date/Collection select → Download to PC or Upload to Backblaze B2/MEGA). | ⏳ **To Implement** (Admin UI) |

### 2.2 Implementation Details

#### A. Connection Pooling (Already Done ✅)
- **File:** `src/lib/mongodb.ts` & `payload.config.ts`
- **Configuration:** `maxPoolSize: 10`.

#### B. Rate Limiter (Update `proxy.ts` - Next.js Middleware)
- **Location:** `proxy.ts` matcher mein specific API routes add karein (Step 1):

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|admin|_vercel|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|css|js|woff2?|ttf|otf|eot|map|json)).*)',
    // 🔥 SPECIFIC API ROUTES ADD KARO (Rate Limiter ke liye)
    '/api/auth/register',
    '/api/auth/callback/credentials',
    '/api/payment/initiate',
    '/api/checkout/orders/create',
  ],
};
```

- **Logic:** Raw Redis commands (`redis.incr()` + `redis.expire()`). Limit: 5 requests per 10 seconds (Step 2):

```typescript
// proxy.ts - Andar rate limiter logic
const sensitiveRoutes = ['/api/auth/register', '/api/auth/callback/credentials', '/api/payment/initiate', '/api/checkout/orders/create'];
  
if (sensitiveRoutes.some(route => pathname.startsWith(route))) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const key = `rate:${ip}`;
  try {
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, 10);
    if (current > 5) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests.' }), { status: 429 });
    }
  } catch (error) {
    // Fail-close: Agar Redis down ho toh request block karo
    return new NextResponse(JSON.stringify({ error: 'Service unavailable.' }), { status: 503 });
  }
}
```

- **Cleanup (Step 3):** `proxy.ts` se purana dead `ratelimiter.limit()` wala code hata do. `@upstash/ratelimit` package **REMOVE** karein `package.json` se aur `@upstash/redis` ko **KEEP** rakhein.

#### C. Database Backups (Manual Admin Control)
- **Destination 1:** "Download to Browser" (Zero storage cost). Server streams JSON/CSV to user.
- **Destination 2:** Upload to **Backblaze B2** (10GB free) or **MEGA** (20GB free).
- **Why not auto-cron?** To save Cloudflare R2 storage for product images. Admin decides when to backup.

### 2.3 Redis Storage Usage Strategy (What STAYS)

| Key Pattern | Purpose | Expiry |
| :--- | :--- | :--- |
| `lock:product:{id}` | Distributed stock lock | 20 sec |
| `idempotency:{key}` | Prevent duplicate orders | 2 min |
| `order:counter` | Atomic order ID generation | Permanent |
| `coupon:usage:{code}` | Coupon usage count | Permanent |
| `tracking:pulse:queue` | Telemetry queue | N/A |
| `settings:global` | Cached site settings | 24 hours |
| `rate:{ip}` | Rate Limiter Counter (Raw Commands) | 10 sec |

---

## 📦 MODULE 3: MEDIA & ASSET MANAGEMENT

*This module handles all images and videos. It is built on an Adapter Pattern to allow instant swapping between providers.*

### 3.1 Image Strategy (Adapter + Dual Toggle)

| Feature | Primary (ImgBB) | Backup (Cloudflare R2) |
| :--- | :--- | :--- |
| **Storage** | Unlimited | 10GB free |
| **Bandwidth** | Unlimited | Unlimited free egress |
| **Auto WebP/AVIF** | ❌ (Handled by Sharp before upload) | ✅ via Cloudflare Workers |
| **Cost** | Free | Free till 10GB |
| **Admin Toggle** | **Global Switch:** ImgBB \| Cloudflare \| Dual | **Per-Image Upload:** ImgBB \| Cloudflare \| Both |

### 3.2 Video Strategy
- **Public / Marketing / Product Demos:** **YouTube** (PocketValue Channel). Admin pastes URL -> auto-embeds.
- **Private videos (Mux):** **Rejected.** E-commerce content is inherently public.

### 3.3 Core Utilities
- **`mediaHandler.ts`:** Uses `Sharp` to convert PNG/JPG to WebP (Quality 80, Width 1200px) before uploading to any adapter.

---

## 📧 MODULE 4: COMMUNICATION & LOGISTICS HUBS (Adapters)

*This module handles external integrations (Emails, SMS, Couriers). Built strictly on the Adapter Pattern to ensure Zero Vendor Lock-in.*

### 4.1 Communication Hub (Email + WhatsApp) — Unified Roles
**Core Principle:** Har service (Mailjet, Resend, WhatsApp) ke paas roles ka wohi set hai. Admin decides which service handles which role.

**Standard Roles (Same for ALL Channels):** Order Confirmation, Password Reset, Marketing, COD OTP, Tracking Updates, Invoice Delivery, Abandoned Cart.

**Admin Toggles:**

| Channel | Service | Active (On/Off) | Assigned Roles (Multi-Select - Same for ALL) |
| :--- | :--- | :--- | :--- |
| **A** | Mailjet | 🔘 On / Off | ☑ Order Conf ☑ Password Reset ☐ Marketing ☑ COD OTP ☐ Tracking ☐ Invoice |
| **B** | Resend | 🔘 On / Off | ☐ Order Conf ☐ Password Reset ☑ Marketing ☐ COD OTP ☑ Tracking ☑ Invoice |
| **C** | WhatsApp | 🔘 On / Off | ☐ Order Conf ☐ Password Reset ☐ Marketing ☑ COD OTP ☑ Tracking ☐ Invoice |

**System Behavior:** Agar Mailjet OFF ho, system automatically "Order Confirmation" wala role Resend par forward kar dega (agar Resend par tick hai).

### 4.2 Logistics Hub (Courier Adapter)

| Setting | Options | Default |
| :--- | :--- | :--- |
| **Primary Courier** | TCS \| Trax \| PostEx | TCS |
| **Fallback Courier** | None \| TCS \| Trax \| PostEx | None |

- **Behavior:** Agar primary courier API down hai, toh system automatically Fallback par switch ho jayega.
- **Scalability:** Naya courier (e.g., Leopards) add karna hai? Sirf `LeopardsAdapter` likho. Core logic (`shipmentActions.ts`) 0% change hoga.

---

## 🎛️ MODULE 5: ADMIN CONTROLS, COMPLIANCE & BACKUPS

*This module contains the Admin Panel configurations, security features, and compliance toggles.*

### 5.1 Admin Toggles (Payload Global Settings)

| Setting | Options | Default | Impact |
| :--- | :--- | :--- | :--- |
| **Image Provider** | imgbb \| cloudflare \| dual | cloudflare | Real-time CDN switch. |
| **Email/WhatsApp Routing** | (See Module 4) | Mailjet default | Role-based communication routing. |
| **Primary Courier** | TCS \| Trax \| PostEx | TCS | Selects shipping partner. |
| **FBR Integration** | enabled \| disabled | disabled | Toggle for FBR invoicing & QR generation. |
| **COD OTP Required** | true \| false | true | Mandate OTP before "Ready to Ship". |
| **Max RTO Limit** | Number (e.g., 3) | 3 | Block users after 3 RTOs. |
| **Stock Reserve Hours** | Number | 24 | Inventory soft hold duration. |
| **Maintenance Mode** | on \| off | off | Blocks new orders, shows maintenance page. |

### 5.2 Enterprise Security & Compliance

| Feature | Implementation | Status |
| :--- | :--- | :--- |
| **RBAC** | Support (View), Logistics (Shipments), Finance (Refunds/Approvals) via Payload. | ✅ To Implement |
| **Audit Trail** | Every admin action logged in MongoDB `audit_logs`. | ✅ To Implement |
| **FBR POS Ready** | Toggle enabled -> Invoice includes CNIC/STRN and FBR QR code. | ✅ To Implement |
| **Idempotency** | Redis `SET NX` prevents duplicate order submissions on double-click. | ✅ Already Done |
| **Distributed Locks** | Redis `SET NX PX` prevents overselling the last unit. | ✅ Already Done |

### 5.3 Admin Backup Dashboard
- **Feature:** Admin selects Date Range, Collections (Orders/Users/Logs), Format (JSON/CSV).
- **Output:** Download to Browser (Zero cost) OR Upload to Backblaze B2/MEGA.
- **Goal:** Save Cloudflare R2 10GB for images only.

---

## 📥 APPENDIX A: ENVIRONMENT VARIABLES (.env.local)

```env
# Database
MONGODB_URI=mongodb+srv://...

# Redis (Upstash - Keep)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Emails (Adapter Services)
MAILJET_API_KEY=...
MAILJET_SECRET_KEY=...
MAILJET_FROM_EMAIL=orders@yourstore.com

RESEND_API_KEY=...
RESEND_FROM_EMAIL=orders@yourstore.com

# WhatsApp (Meta)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...

# Media
IMGBB_API_KEY=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=...
CLOUDFLARE_R2_ENDPOINT=...
CLOUDFLARE_ACCOUNT_ID=...

# Payment (JazzCash/EasyPaisa)
JAZZCASH_MERCHANT_ID=...
JAZZCASH_PASSWORD=...
JAZZCASH_INTEGRITY_SALT=...
EASYPAISA_MERCHANT_ID=...
EASYPAISA_SECRET=...

# Courier (TCS/Trax/PostEx)
TCS_API_KEY=...
TCS_API_URL=...
TRAX_API_KEY=...
POSTEX_API_KEY=...

# Security
NEXTAUTH_SECRET=...
CLOUDFLARE_TURNSTILE_SITE_KEY=...
CLOUDFLARE_TURNSTILE_SECRET_KEY=...
```

---

## 🗺️ APPENDIX B: IMPLEMENTATION PHASES (Roadmap)

| Phase | Tasks | Duration |
| :--- | :--- | :--- |
| **Phase 0** | Environment setup, MongoDB connection, Redis client init | 1 day |
| **Phase 1** | Order core schema, idempotency & locks | 3 days |
| **Phase 2** | Rate Limiter Migration: Shift to Edge/Proxy + Raw Redis Commands (Cancel MongoDB TTL plan). Update `proxy.ts` matcher and logic. Remove `@upstash/ratelimit`. | 1 day |
| **Phase 3** | Adapters Setup (Communication, Courier, Media factories) | 3 days |
| **Phase 4** | Media (Sharp + ImgBB + R2 toggles) | 2 days |
| **Phase 5** | Payment Webhooks (JazzCash/EasyPaisa) | 2 days |
| **Phase 6** | Courier Webhooks & Split Shipments | 2 days |
| **Phase 7** | Fraud Prevention (WhatsApp OTP, RTO/RMA workflows) | 2 days |
| **Phase 8** | RBAC & Audit Logs | 2 days |
| **Phase 9** | Compliance (FBR toggle, Admin Backup Dashboard) | 2 days |
| **Phase 10** | Testing & Deployment | 2 days |

---

## ✅ APPENDIX C: ENTERPRISE CHECKLIST

### Core Security & Integrity
*   [ ] Rate Limiter shifted to Edge/Proxy + Raw Redis Commands (MongoDB TTL plan CANCELLED).
*   [ ] Distributed Locks (Redis) prevent overselling.
*   [ ] Idempotency keys prevent duplicate orders.
*   [ ] RBAC implemented (Support, Logistics, Finance).
*   [ ] Audit Logger tracks all admin actions.

### Communications (Adapter Ready)
*   [ ] Mailjet + Resend + WhatsApp adapters integrated.
*   [ ] Unified roles assigned via Admin toggles.
*   [ ] Failover logic works (if primary down, fallback kicks in).

### Media & Performance
*   [ ] Sharp WebP conversion integrated.
*   [ ] ImgBB (Primary) + Cloudflare R2 (Backup) with Admin toggle.
*   [ ] YouTube embed auto-extracts video ID from URL.

### Local Market (Pakistan)
*   [ ] JazzCash/EasyPaisa webhooks active.
*   [ ] COD OTP via WhatsApp (Email fallback).
*   [ ] RTO auto-restocks inventory.
*   [ ] Courier webhooks update tracking automatically.
*   [ ] Abandoned cart recovery flow active.

### Production Crash-Proof (NEW)
*   [ ] `mongoose.ts` maxPoolSize: 10 (✅ Already done).
*   [ ] `payload.config.ts` maxPoolSize: 10 (✅ Already done).
*   [ ] `proxy.ts` updated with raw Redis rate limiter (⏳ Pending).
*   [ ] `@upstash/ratelimit` removed from package.json (⏳ Pending).
*   [ ] Admin Backup Dashboard implemented (⏳ Pending).

---

## 🎯 FINAL VERDICT

Aap ka OMS ab 5 clear modules mein divided hai:

1. **Module 1 (Engine):** Pure order logic.
2. **Module 2 (Infra):** Serverless connections, Rate limiting (Edge/Redis), and Backup strategy.
3. **Module 3 (Media):** Images (Sharp + ImgBB/R2) and Videos (YouTube).
4. **Module 4 (Adapters):** Communication (Email/WhatsApp) and Logistics (Courier).
5. **Module 5 (Admin):** Toggles, RBAC, Audit, and Compliance.

**Is it Enterprise Ready? YES.** 
Aap ke paas ab ek complete modular, crash-proof, zero-cost architecture hai. Koi bhi module doosre module ke saath interfere nahi karta. Aap ek module par kaam karein, baqi waisay hi chalte rahein.

Allah aap ko kamiyabi de! Ameen. 🚀
```