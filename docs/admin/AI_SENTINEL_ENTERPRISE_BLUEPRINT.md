# 🤖 AI SENTINEL — ENTERPRISE ANOMALY DETECTION ENGINE
## COMPLETE IMPLEMENTATION BLUEPRINT (V2.0)

**Version:** 2.0 (Enterprise Top-Tier)  
**Status:** 📝 **Planned (Future Implementation)**  
**Purpose:** Proactive anomaly detection system that identifies revenue leaks, operational failures, and user friction before they impact the business.  
**Cost:** ₹0 (Completely free-tier optimized).

---

## 🎯 1. BUSINESS CASE — WHY THIS IS "TOP-TIER"

| Problem | Without AI Sentinel | With AI Sentinel |
| :--- | :--- | :--- |
| **Revenue Drop (20% in 1 hour)** | Admin finds out after 4-5 hours (manual report). Revenue leak = ~₹50,000 lost. | ✅ Real-time CRITICAL alert within 15 minutes. Dev team fixes instantly. |
| **Checkout Errors Spike (300%)** | Customers leave. Admin unaware. Bug fix delayed by 24 hours. | ✅ "CRITICAL" notification → Immediate action. |
| **Fulfillment Rate Drop (30%)** | Ops team notices next day. 100+ orders delayed. | ✅ "HIGH" warning → Warehouse manager intervenes immediately. |
| **RTO Spike in Karachi (50%)** | Logistics cost balloons. Courier switch delayed. | ✅ Geospatial anomaly detected → Courier auto-switch suggested. |

> **Niche line:** AI Sentinel acts as a **"Canary in the Coal Mine"** — detecting silent revenue killers before they become catastrophic.

---

## 🧠 2. CORE MATHEMATICAL ENGINE (No ML Required)

| Method | Formula | Use Case |
| :--- | :--- | :--- |
| **3-Sigma Rule** | `if (current > mean + 3 * std_dev) → CRITICAL` | Sudden spikes (Checkout errors, Rage clicks). |
| **Z-Score (Standardized)** | `Z = (current - mean) / std_dev` | All metrics (revenue, traffic, friction). |
| **Moving Average (7 days)** | `if (current < MA_7 * 0.8) → WARNING` | Gradual decline (Fulfillment rate, Traffic). |
| **YoY Comparison** | `if (current < same_day_last_week * 0.75) → WARNING` | Weekly seasonality adjustment. |

### Severity Matrix

| Severity | Condition | UI Color | Action |
| :--- | :--- | :--- | :--- |
| **HEALTHY** | All metrics within 1-sigma | 🟢 Green | System running normally. |
| **WARNING** | Any metric > 2-sigma OR drop > 15% | 🟡 Yellow | Slack notification + UI banner. |
| **CRITICAL** | Any metric > 3-sigma OR revenue drop > 25% | 🔴 Red | Slack + Email alert + UI banner. |

---

## 📊 3. DATA SOURCES & METRICS MONITORED

| # | Metric | Source Collection | Threshold Logic |
| :--- | :--- | :--- | :--- |
| **1** | **Revenue (Today vs Average)** | `Order` (`status: Delivered/Completed`) | Drop > 20% → CRITICAL |
| **2** | **Active Sessions** | `UserSession` (`isActive: true`) | Drop > 30% vs same time yesterday |
| **3** | **Checkout Errors** | `UserEvent` (`eventType: checkout_error`) | Spike > 3-sigma → CRITICAL |
| **4** | **Rage Clicks** | `UserEvent` (`eventType: rage_click_detected`) | Spike > 3-sigma → WARNING |
| **5** | **Fulfillment Rate** | `OperationalIntelligence` | Drop > 10% in 24 hrs → WARNING |
| **6** | **RTO Rate (City-level)** | `Order` (`status: RTO`) | Rate > 40% in any city → WARNING |
| **7** | **JS Exceptions** | `UserEvent` (`eventType: js_exception`) | Spike > 3-sigma → WARNING |
| **8** | **OOS Attempts** | `UserEvent` (`eventType: oos_attempt`) | Spike > 3-sigma → LOW |

---

## 🏗️ 4. SYSTEM ARCHITECTURE (Zero DB Load)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKGROUND WORKER (Hugging Face)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Worker runs every 15 minutes.                                    │   │
│  │  1. Fetch all metrics (Orders, Events, Sessions).                │   │
│  │  2. Calculate rolling averages & standard deviations.             │   │
│  │  3. Apply Z-Score + 3-Sigma algorithms.                          │   │
│  │  4. Determine severity (HEALTHY / WARNING / CRITICAL).           │   │
│  │  5. Generate actionable insight text + suggested action.         │   │
│  │  6. Save result to "AISentinelSnapshot" (Upsert).                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (Write 1 document)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONGODB (Snapshot Collection)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: "aisentinel_snapshots"                               │   │
│  │  Document: { "_id": "latest", "status": "CRITICAL", "insights": [...] } │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (Read 1 document)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Dashboard API)                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  getAISentinelPayload()                                           │   │
│  │  1. Check Redis Cache (5 min TTL).                               │   │
│  │  2. If miss → read "aisentinel_snapshots.findOne({ _id: 'latest' })"│   │
│  │  3. ❌ No aggregation. ❌ No JOINs. ❌ No heavy queries.          │   │
│  │  4. Return to UI in < 50ms.                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (JSON)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD UI (AISentinel.tsx)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Show Severity Badge (🟢 / 🟡 / 🔴).                          │   │
│  │  2. Display Insight Text (e.g., "Revenue dropped 22%").           │   │
│  │  3. Show "Actionable Button" (e.g., "Open Friction Report").      │   │
│  │  4. (Optional) Show dismissed/acknowledge button.                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 5. DETECTION ENGINE — DETAILED ALGORITHM

### Step 1: Fetch Baseline Data (Last 7 days)
```typescript
const baseline = await Order.aggregate([
  { $match: { createdAt: { $gte: subDays(now, 7) }, status: { $in: REVENUE_STATUSES } } },
  { $group: { _id: null, avgRevenue: { $avg: "$totalPrice" }, stdDev: { $stdDevPop: "$totalPrice" } } }
]);
```

### Step 2: Fetch Current Period (Today)
```typescript
const todayRevenue = await Order.aggregate([
  { $match: { createdAt: { $gte: startOfDay(now) }, status: { $in: REVENUE_STATUSES } } },
  { $group: { _id: null, total: { $sum: "$totalPrice" } } }
]);
```

### Step 3: Calculate Z-Score
```typescript
const zScore = (current - avgRevenue) / stdDev;
const severity = zScore < -3 ? "CRITICAL" : zScore < -2 ? "WARNING" : "HEALTHY";
```

### Step 4: Generate Insight
```typescript
const insight = severity === "CRITICAL" 
  ? `🚨 Revenue dropped ${dropPercent}% below average. Likely causes: Payment gateway failure, checkout bug, or marketing campaign misconfiguration.` 
  : severity === "WARNING" 
  ? `⚠️ Revenue is ${dropPercent}% below average. Monitor for ongoing trend.` 
  : "✅ System is healthy. All metrics within normal range.";
```

### Step 5: Save Snapshot
```typescript
await AISentinelSnapshot.findOneAndUpdate(
  { _id: "latest" },
  {
    $set: {
      status: severity,
      insights: [insight],
      metrics: { revenue: { current, average, zScore, dropPercent } },
      recommendedAction: severity === "CRITICAL" ? "/admin/analytics-telemetry" : null,
      generatedAt: new Date(),
    }
  },
  { upsert: true }
);
```

---

## 📂 6. COMPLETE FILE INVENTORY

### A. NEW FILES TO CREATE (Total: 6)

| # | File Path | Purpose | Lines (Est.) |
| :--- | :--- | :--- | :--- |
| **1** | `src/models/AISentinelSnapshot.ts` | Mongoose model for pre-computed snapshot (singleton). | ~40 |
| **2** | `src/app/features/admin/ai-sentinel/actions/getAISentinel.ts` | **MOVE + REFACTOR** — Reads snapshot + Redis cache. | ~80 |
| **3** | `src/app/features/admin/ai-sentinel/components/AISentinel.tsx` | **MOVE + REFACTOR** — Dynamic UI banner. | ~150 |
| **4** | `worker/ai-sentinel-worker.ts` | Background calculator (15-min interval). | ~200 |
| **5** | `src/app/api/admin/ai-sentinel/refresh/route.ts` | Manual refresh trigger (Admin button). | ~50 |
| **6** | `worker/Dockerfile` | For Hugging Face deployment (optional). | ~15 |
| **Total New Files** | | | **6 Files** |

### B. EXISTING FILES TO MODIFY (Total: 4)

| # | File Path | Change Required |
| :--- | :--- | :--- |
| **1** | `src/payload/globals/Settings.ts` | Add `aiSentinel` group (thresholds: `zScoreThreshold`, `revenueDropThreshold`, etc.) |
| **2** | `src/sanity/lib/payload/types/GlobalSettings.ts` | Add `aiSentinel` TypeScript interface. |
| **3** | `src/app/(payload)/admin/views/AnalyticsDashboardView.tsx` | Update import path for `AISentinel` component. |
| **4** | `src/lib/adapters/communication/CommunicationFactory.ts` | (Optional) Add `sendAlert` method if not already present. |
| **Total Modified Files** | | **4 Files** |

### C. FILES TO DEPLOY (Deferred — Phase 3)

| # | File | Purpose | Reason |
| :--- | :--- | :--- | :--- |
| 1 | `src/app/api/webhooks/order-status/route.ts` | Real-time cache invalidation on critical status change | Optional — Not required for V1 |

---

## 📋 7. IMPLEMENTATION ROADMAP (3 Phases)

| Phase | Feature | Files | Time | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1 (Baseline)** | Redis Cache + Dynamic Thresholds | `getAISentinel.ts` + `Settings.ts` | 1 hour | 🔴 **High** |
| **Phase 2 (Snapshot)** | Worker + Snapshot Model | 5 new files | 2 hours | 🟡 **Medium** |
| **Phase 3 (Proactive Alerts)** | Slack/Email + Root Cause | `CommunicationFactory` integration | 1 hour | 🟢 **Low** |

> **Recommendation:** Implement **Phase 1 NOW** (no worker, just optimize the existing query with cache + dynamic thresholds). Deploy **Phase 2** when the system is stable (1-2 weeks later).

---

## 🚀 8. TOP-TIER FUTURE ENHANCEMENTS (Phase 4 — Vision)

| Feature | Description | Complexity |
| :--- | :--- | :--- |
| **Correlation Engine** | If rage clicks spike, check if it's on Product X page → suggest direct link. | 🟡 Medium |
| **Historical Alert Timeline** | Show last 7 days of alerts (which ones were acknowledged/dismissed). | 🟢 Low |
| **Auto-Resolution** | If anomaly auto-corrects (e.g., revenue recovers), auto-resolve the alert. | 🟡 Medium |
| **Machine Learning (Prophet/ARIMA)** | Replace 3-Sigma with time-series forecasting (seasonal adjustments). | 🔴 High |

---

## 💰 9. COST & PERFORMANCE ANALYSIS

### Infrastructure Costs (₹0 Bill)

| Service | Usage | Cost |
| :--- | :--- | :--- |
| **MongoDB M0** | 1 document snapshot (< 1KB) | ✅ **Free** |
| **Redis (Upstash)** | 1 key (5 min TTL) → 288 operations/day | ✅ **Free** (within 10k/day limit) |
| **Hugging Face Worker** | 96 runs/day (every 15 min) | ✅ **Free** (100k runs/month) |
| **Email/Slack Alerts** | Already integrated | ✅ **Free** (SMTP/Slack webhook) |
| **Total** | | ✅ **₹0** |

### Performance Metrics

| Operation | Time | DB Load |
| :--- | :--- | :--- |
| **Worker Aggregation** | ~2-5 seconds (Background) | ✅ Moderate (Indexed scans) |
| **Dashboard API (Cache Hit)** | < 10ms | ✅ **Zero** |
| **Dashboard API (Cache Miss)** | < 50ms (Snapshot read) | ✅ **Zero** (1 document read) |
| **Vercel Invocations** | ~1,440/day (288 snapshot reads × 5 min TTL) | ✅ **Safe** (100k/month limit) |

---

## ✅ 10. ENTERPRISE-READY CHECKLIST

| # | Check | Status |
| :--- | :--- | :--- |
| 1 | **No Static Values** | ✅ All thresholds dynamic via Settings.ts |
| 2 | **Zero DB Load on Dashboard** | ✅ Snapshot + Redis cache (Phase 2) |
| 3 | **Cache Stampede Protection** | ✅ SETNX lock in `getAISentinel.ts` |
| 4 | **Error Handling** | ✅ Fallback to "HEALTHY" on failure |
| 5 | **RBAC Security** | ✅ `verifyAdminAccess()` |
| 6 | **Pre-computed Aggregations** | ✅ Worker handles heavy queries |
| 7 | **Scalability (1M+ Data)** | ✅ Aggregation pipelines with indexes |
| 8 | **Alerting Integration** | ✅ CommunicationFactory (Phase 3) |
| 9 | **Dark Mode Support** | ✅ Tailwind `dark:` classes |
| 10 | **Pagination (Historical Alerts)** | ✅ Phase 4 (optional) |

---

## 📝 11. DEPLOYMENT NOTES

### Phase 1 (Immediate)
1. Add `aiSentinel` group to `Settings.ts`.
2. Refactor `getAISentinelPayload` to read `Settings` and use Redis cache.
3. No worker needed.

### Phase 2 (Future — 2 weeks)
1. Create `src/models/AISentinelSnapshot.ts`.
2. Create `worker/ai-sentinel-worker.ts`.
3. Update `getAISentinelPayload` to read snapshot.
4. Deploy worker to Hugging Face (or GitHub Actions).

### Phase 3 (Future — 1 month)
1. Integrate `CommunicationFactory` for email/Slack alerts.
2. Add manual refresh button in Admin UI.

---

**Document Version:** 1.0  
**Created:** July 20, 2025  
**Purpose:** Complete blueprint for AI Sentinel — Enterprise Anomaly Detection Engine.  
**Estimated Implementation Time:** Phase 1 (1 hour) | Phase 2 (2 hours) | Phase 3 (1 hour) = **Total 4 hours**.