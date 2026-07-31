# 📊 POCKETVALUE MARKETING ENGINE 360° — COMPLETE MASTER PLAN

**Document Version:** 2.0 (Final)
**Status:** ✅ **Phase 1 & 2 Complete | ⏳ Phase 3 Planned (Future)**
**Purpose:** Complete blueprint for the Marketing Engine, covering implemented features, pending upgrades, and a full inventory of all files (with paths) that constitute the module.

---

## 1. EXECUTIVE SUMMARY

The **Marketing Engine 360°** is a complete enterprise-grade marketing automation suite built on top of the existing PocketValue infrastructure. It allows the admin team to track campaign ROI, analyze product friction, segment customers (RFM), recover abandoned carts, run bulk email campaigns, and manage user onboarding/winback — all without any external dependencies.

- **Total Phase 1 & 2 Files Created/Modified:** ~35 Files
- **Total Phase 3 (Future) Files:** 6 New Files + 1 Modification
- **Architecture:** Serverless (Vercel) + MongoDB Atlas + Upstash Redis
- **Cost:** ₹0 (Fully free-tier optimized)

---

## 2. COMPLETED FEATURES (PHASE 1 & 2) — ✅ IMPLEMENTED

| # | Feature | Description | Status |
| :--- | :--- | :--- | :--- |
| 1 | **Campaign ROI (UTM Attribution)** | Tracks revenue, orders, and AOV per UTM campaign (Facebook, Google, etc.). | ✅ Done |
| 2 | **Product Friction Matrix** | Detects `LOW_INTEREST` (high views, low add-to-cart) and `PRICE_BARRIER` (high adds, low purchases). | ✅ Done |
| 3 | **RFM Auto-Segments** | Automatically segments customers into Champions, Loyal, At-Risk, Lost, etc., based on Recency, Frequency, and Monetary scores. | ✅ Done |
| 4 | **Abandoned Cart Recovery** | Admin can view abandoned carts and send recovery emails (manual). | ✅ Done |
| 5 | **Welcome Series** | Admin can send Day 1 welcome emails to new users (manual). | ✅ Done |
| 6 | **Winback (Reactivation)** | Admin can send winback emails to users inactive for 30+ days (manual). | ✅ Done |
| 7 | **Campaign Funnel (Deep UTM)** | Per-campaign funnel: Views → Add-to-Cart → Checkout → Purchase + Account Created. | ✅ Done |
| 8 | **Campaign Composer** | Admin can send bulk emails to custom segments or manual email lists. | ✅ Done |
| 9 | **Email Templates** | 4 professional marketing templates (Abandoned Cart, Welcome Series, Winback, Campaign Broadcast). | ✅ Done |
| 10 | **Segment Builder** | Visual AND/OR filter builder for creating custom customer segments. | ✅ Done |

---

## 3. PENDING FEATURES (PHASE 3 — FUTURE) — ⏳ PLANNED

These features are **automated versions** of the manual actions. They will be implemented as background workers (Cron jobs) to send emails automatically without admin intervention.

| # | Feature | Description | Priority |
| :--- | :--- | :--- | :--- |
| 1 | **Abandoned Cart Auto-Flow** | Automatically send recovery email 2 hours after cart abandonment. | 🔴 High |
| 2 | **Welcome Series Auto-Flow** | Automatically send Day 1, Day 3, and Day 7 emails after signup. | 🔴 High |
| 3 | **Winback Auto-Flow** | Automatically send winback email to users inactive for 30+ days. | 🟡 Medium |
| 4 | **Order Follow-up Auto-Flow** | Automatically send review request email 7 days after delivery. | 🟡 Medium |
| 5 | **Cron Infrastructure** | GitHub Actions or Vercel Cron to trigger the above workers. | 🔴 High |

---

## 4. COMPLETE FILE INVENTORY (WITH PATHS)

This is the complete list of all files (implemented + pending) that make up the Marketing Engine.

### A. Server Actions (Business Logic) — 11 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 1 | `src/app/features/admin/marketing/actions/getCampaignMetrics.ts` | ✅ Done |
| 2 | `src/app/features/admin/marketing/actions/getProductFriction.ts` | ✅ Done |
| 3 | `src/app/features/admin/marketing/actions/getRFMSegments.ts` | ✅ Done |
| 4 | `src/app/features/admin/marketing/actions/getAbandonedCarts.ts` | ✅ Done |
| 5 | `src/app/features/admin/marketing/actions/sendCampaign.ts` | ✅ Done |
| 6 | `src/app/features/admin/marketing/actions/getWelcomeCandidates.ts` | ✅ Done |
| 7 | `src/app/features/admin/marketing/actions/getWinbackCandidates.ts` | ✅ Done |
| 8 | `src/app/features/admin/marketing/actions/getCampaignFunnel.ts` | ✅ Done |
| 9 | `src/app/features/admin/loyalty-intelligence/actions/saveSegment.ts` | ✅ Done |
| 10 | `src/app/features/admin/loyalty-intelligence/actions/getSegmentQuery.ts` | ✅ Done |
| 11 | `src/app/features/admin/loyalty-intelligence/actions/getSegmentByIdAndExecute.ts` | ✅ Done |

### B. UI Components (Widgets & Pages) — 12 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 12 | `src/app/features/admin/marketing/components/CampaignOverviewWidget.tsx` | ✅ Done |
| 13 | `src/app/features/admin/marketing/components/ProductFrictionWidget.tsx` | ✅ Done |
| 14 | `src/app/features/admin/marketing/components/RFMSegmentWidget.tsx` | ✅ Done |
| 15 | `src/app/features/admin/marketing/components/RFMSegmentList.tsx` | ✅ Done |
| 16 | `src/app/features/admin/marketing/components/AbandonedCartsWidget.tsx` | ✅ Done |
| 17 | `src/app/features/admin/marketing/components/WelcomeWidget.tsx` | ✅ Done |
| 18 | `src/app/features/admin/marketing/components/WinbackWidget.tsx` | ✅ Done |
| 19 | `src/app/features/admin/marketing/components/CampaignComposer.tsx` | ✅ Done |
| 20 | `src/app/features/admin/marketing/components/CampaignFunnelWidget.tsx` | ✅ Done |
| 21 | `src/app/features/admin/loyalty-intelligence/components/segment-builder/types.ts` | ✅ Done |
| 22 | `src/app/features/admin/loyalty-intelligence/components/segment-builder/ConditionRow.tsx` | ✅ Done |
| 23 | `src/app/features/admin/loyalty-intelligence/components/segment-builder/Group.tsx` | ✅ Done |

### C. Admin Views (Payload Pages) — 2 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 24 | `src/app/(payload)/admin/views/MarketingHubView.tsx` | ⏳ **Pending Integration** |
| 25 | `src/app/(payload)/admin/views/SegmentBuilderView.tsx` | ✅ Done |

### D. Email Templates — 5 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 26 | `src/email_templates/abandonedCartRecoveryEmail.ts` | ✅ Done |
| 27 | `src/email_templates/welcomeSeriesEmail.ts` | ✅ Done |
| 28 | `src/email_templates/winbackEmail.ts` | ✅ Done |
| 29 | `src/email_templates/campaignBroadcastEmail.ts` | ✅ Done |
| 30 | `src/email_templates/masterLayout.ts` | ✅ Done (Existing, reused) |

### E. Models (Database Schemas) — 3 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 31 | `src/models/SegmentDefinition.ts` | ✅ Done |
| 32 | `src/models/User.ts` | ✅ Modified (Added RFM fields) |
| 33 | `src/models/AbandonedCart.ts` | ✅ Done (Existing) |

### F. Infrastructure — 2 Files

| # | File Path | Status |
| :--- | :--- | :--- |
| 34 | `src/lib/adapters/communication/CommunicationFactory.ts` | ✅ Modified (Added Marketing methods) |
| 35 | `src/payload/globals/Settings.ts` | ✅ Modified (Added RFM, Inactive, Auto-flow toggles) |

---

## 5. PENDING FUTURE UPGRADE FILES (PHASE 3 — CRON WORKERS)

These 7 files (6 new + 1 modified) will automate the manual flows.

### A. New Worker Files (6 Files)

| # | File Path | Purpose |
| :--- | :--- | :--- |
| 36 | `src/worker/abandoned-cart-worker.ts` | Cron job: Check carts 2h+ old → send recovery email. |
| 37 | `src/worker/welcome-series-worker.ts` | Cron job: Check new users → send Day 1/3/7 emails. |
| 38 | `src/worker/winback-worker.ts` | Cron job: Check inactive users 30d+ → send winback email. |
| 39 | `src/worker/order-followup-worker.ts` | Cron job: Check delivered orders 7d+ → send review request. |
| 40 | `.github/workflows/marketing-cron.yml` | GitHub Actions scheduler for all workers. |
| 41 | `src/app/api/cron/marketing-trigger/route.ts` | Vercel Cron fallback endpoint. |

### B. Modified File (1 File)

| # | File Path | Change |
| :--- | :--- | :--- |
| 42 | `src/payload/globals/Settings.ts` | Add toggle settings for each auto-flow (enable/disable). |

---

## 6. FINAL INTEGRATION VIEW: `MarketingHubView.tsx`

The **only remaining step** for Phase 1+2 completion is integrating all widgets into a single dashboard view.

**File:** `src/app/(payload)/admin/views/MarketingHubView.tsx`

**This file will contain:**
- Conditional routing: If `?segment=Champions` → show `RFMSegmentList`.
- Else, show the full dashboard grid:
    - Row 1 (2-Column): Campaign ROI + Product Friction.
    - Row 2 (Full Width): RFM Segments.
    - Row 3 (2-Column): Abandoned Carts + Welcome Series.
    - Row 4 (2-Column): Winback + Campaign Funnel.
    - Row 5 (Full Width): Campaign Composer (Bulk Email).
- Parallel data fetching for Campaign ROI and Product Friction.

**This file is 100% ready to be created** — all the widgets and actions already exist.

---

## 7. SUCCESS CRITERIA & CHECKLIST

### ✅ Phase 1 & 2 (Complete)

- [x] All server actions functional.
- [x] All UI widgets rendering data.
- [x] All email templates ready.
- [x] CommunicationFactory upgraded.
- [x] Segment Builder integrated.
- [x] RFM On-Demand engine implemented.
- [ ] **Final Integration View (`MarketingHubView.tsx`) — **Pending (Next Step).****

### ⏳ Phase 3 (Future)

- [ ] All 6 worker files created.
- [ ] `Settings.ts` updated with auto-flow toggles.
- [ ] GitHub Actions workflow configured.
- [ ] Cron endpoints secured with `CRON_SECRET`.
- [ ] Workers tested in staging environment.
- [ ] Auto-flows enabled in production after testing.

---

## 8. RECOMMENDED NEXT STEPS

1.  **Immediate (Today):**
    - Create the final integration file: `MarketingHubView.tsx`.
    - Deploy the Marketing Hub to production.
    - Admin team starts using the manual tools (Campaign Composer, RFM, etc.).

2.  **Future (After 1-2 Months):**
    - Collect data on which campaigns are most effective.
    - Enable Phase 3 (Automated Flows) one by one starting with Abandoned Cart Auto-Flow.
    - Monitor conversion rates and adjust email content accordingly.

---

**Document Version:** 2.0
**Created:** July 20, 2024
**Purpose:** Complete blueprint for the PocketValue Marketing Engine 360°.
**Total Files in Module (Phase 1+2):** 35 Files
**Total Future Files (Phase 3):** 7 Files
**Next Action:** Create `MarketingHubView.tsx` to complete the integration.