# 📋 REDIS RATE LIMITER → MONGODB TTL : MIGRATION EXECUTION PLAN

**Generated:** July 09, 2026  
**Type:** One-Click Copy Knowledge Base (No Code, Only Action Points)  
**Goal:** Safely shift Rate Limiter logic from Upstash Redis to MongoDB TTL, while keeping Redis for Locks/Cache/Queues.

---

## 📌 1. CORE UNDERSTANDING (What stays vs What shifts)

- **STAYS (DO NOT REMOVE):** 
  - `@upstash/redis` package.
  - Redis usage for: Distributed Locks (Order creation), Telemetry Queue (Pulse tracking), Caching (Settings, Loyalty data), Atomic Counters (Order ID).
- **SHIFTS (REMOVE LOGIC):**
  - The `ratelimiter.limit()` function calls.
  - The `@upstash/ratelimit` logic (will remove import/code).
- **NEW ADDITION:**
  - MongoDB TTL based check function to replace the shifted logic.

---

## 🗂️ 2. FILES TO MODIFY (The Hit List)

### Group A: Replace Ratelimiter Logic (Remove and Swap)
*Action: Find `ratelimiter.limit(...)` and replace with `checkMongoRateLimit(...)`*

1. **File:** `src/proxy.ts`
   - **Current:** Uses `ratelimiter.limit(ip)` for auth endpoints.
   - **Action:** Replace with MongoDB Rate limit check.

2. **File:** `src/app/api/payment/initiate/route.ts`
   - **Current:** Uses `ratelimiter.limit(payment-...-${ip})` to prevent payment spamming.
   - **Action:** Replace with MongoDB Rate limit check.

3. **File:** `src/features/storefront/cart-checkout/actions/demandActions.ts`
   - **Current:** Uses `ratelimiter.limit(demand-...-${ip})` for out-of-stock demand forms.
   - **Action:** Replace with MongoDB Rate limit check.

4. **File:** `src/features/storefront/customer-account/actions/reviewActions.ts`
   - **Current:** Uses `ratelimiter.limit(review-...-${ip})` to prevent review spam.
   - **Action:** Replace with MongoDB Rate limit check.

---

### Group B: Add Missing Security (New Rate Limits)
*Action: Add `checkMongoRateLimit` where no protection existed.*

5. **File:** `src/app/api/auth/register/route.ts`
   - **Current:** No rate limit (vulnerable to signup-bot attacks).
   - **Action:** ADD a MongoDB rate limit check for Signups (e.g., 3 per 10 minutes).

6. **File:** `src/features/storefront/auth/actions/authActions.ts`
   - **Current:** No rate limit on `requestPasswordReset` (vulnerable to email spam).
   - **Action:** ADD a MongoDB rate limit check for Password Reset (e.g., 3 per 10 minutes).

---

### Group C: Clean Up the Rate Limiter Factory
*Action: Remove the old logic export, keep only the Redis client.*

7. **File:** `src/app/shared/lib/telemetry/rate-limiter.ts`
   - **Current:** Exports both `redis` and `ratelimiter`.
   - **Action:** 
     - Remove `import { Ratelimit }` and `new Ratelimit()` logic.
     - Keep `export const redis = new Redis(...)` only.
     - Remove the `@upstash/ratelimit` import from the file.

---

### Group D: Confirm "DO NOT TOUCH" Files (Redis Stays)
*Action: Absolutely NO changes to these files. They use Redis for Locks/Queues/Caches.*

8. `src/app/api/telemetry/pulse/route.ts` (Queue)
9. `src/app/api/checkout/orders/create/route.ts` (Locks & Counters)
10. `src/app/api/cron/flush-pulses/route.ts` (Queue)
11. `src/app/api/cron/loyalty-sync/route.ts` (Cache)
12. `src/app/api/health/route.ts` (Health check - keep as is)
13. `src/features/admin/analytics-telemetry/action/trackingActions.ts` (Queue/Idempotency)
14. `src/features/admin/inventory-cms/actions/globalSettingsActions.ts` (Cache)
15. `src/features/storefront/cart-checkout/actions/couponActions.ts` (Cache - Keep strictly for reads)
16. `src/app/shared/lib/checkout/order-utils.ts` (Atomic Counters)
17. `src/app/shared/lib/cache/settings.ts` (Cache)

---

## 📦 3. DEPENDENCY CHANGE (package.json)

- **Remove:** `@upstash/ratelimit` (Is package ko hatao).
- **Keep:** `@upstash/redis` (Ye waisay hi rahega).

---

## 🔧 4. HOW THE NEW MONGODB TTL SYSTEM WORKS

- **Logic:** A new collection `ratelimits` will be created in MongoDB.
- **Auto-Cleanup:** A TTL index will automatically delete old records after 10 minutes.
- **Counting:** The system counts how many records exist for a specific IP/action. If it exceeds the limit (e.g., 5), it denies the request.

---

## 🗺️ 5. EXECUTION ROADMAP (Step-by-Step)

| Step | Task | Status |
| :--- | :--- | :--- |
| 1 | Create new file `src/lib/mongoRateLimiter.ts` with MongoDB connection and TTL schema. | ⬜ Pending |
| 2 | Update `src/proxy.ts` to import and use `checkMongoRateLimit`. | ⬜ Pending |
| 3 | Update `src/app/api/payment/initiate/route.ts` to use new rate limiter. | ⬜ Pending |
| 4 | Update `src/features/storefront/cart-checkout/actions/demandActions.ts`. | ⬜ Pending |
| 5 | Update `src/features/storefront/customer-account/actions/reviewActions.ts`. | ⬜ Pending |
| 6 | **Add** rate limit to `src/app/api/auth/register/route.ts`. | ⬜ Pending |
| 7 | **Add** rate limit to `src/features/storefront/auth/actions/authActions.ts`. | ⬜ Pending |
| 8 | Modify `src/app/shared/lib/telemetry/rate-limiter.ts`: Remove Ratelimit export. | ⬜ Pending |
| 9 | Uninstall `@upstash/ratelimit` from package.json and run npm install. | ⬜ Pending |
| 10 | Test thoroughly (Login, Checkout, Reviews, Register flows). | ⬜ Pending |

---

## ✅ 6. VERIFICATION CHECKLIST (Post-Migration)

- [ ] **Login/Register:** Try 6 login attempts in 1 minute. The 6th should give a "Too many requests" error.
- [ ] **Password Reset:** Request reset 4 times. The 4th should be blocked.
- [ ] **Payment:** Initiate payment 6 times. The 6th should fail with 429 error.
- [ ] **Checkout:** Place a normal order. Verify stock is deducted correctly (Redis Lock still works).
- [ ] **Admin Settings:** Check if site settings load fast (Redis Cache is still active).
- [ ] **Redis Commands:** Check Upstash dashboard. You should see a significant drop (50-80%) in daily command usage.

---

## ⚠️ 7. CRITICAL REMINDER (DO NOT FORGET)

- **QStash:** Aap isko use nahi kar rahe. Isko ignore karein. Emails ke liye **Vercel `waitUntil`** use karna hai (agar background kaam ho), warna mail sending ko sync hi chhoren.
- **Conflict:** Ensure the new MongoDB function does NOT use Redis. It must only query MongoDB.
- **Fallback:** If MongoDB is down, the rate limiter should fail-open (allow requests) or fail-closed (deny) - decide based on your security policy. (Recommend: If DB fails, allow requests temporarily to avoid blocking legitimate users).

---

## 📝 8. FILE CREATION NOTE (For Step 1)

Jab aap `src/lib/mongoRateLimiter.ts` banaein, toh ensure karein:
- It connects to the same MongoDB.
- It creates a schema with fields: `ip`, `action` (optional, for different limits), `createdAt`.
- It has an index on `createdAt` with `expireAfterSeconds: 600` (10 minutes).
- It exports a function `checkMongoRateLimit(ip, maxRequests, action)` that returns `{ success: boolean, error?: string }`.

Baqi code aap khud likhna jaante hain. Is document ke hisaab se bas files ko target karein aur logic replace karein.

**All the best! 🚀**