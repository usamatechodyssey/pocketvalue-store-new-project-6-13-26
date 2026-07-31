# 📦 INVENTORY FORECASTER — ENTERPRISE UPGRADE BLUEPRINT

**Version:** 2.0 (Pre-computed Snapshot Architecture)  
**Status:** 📝 Planned (Not Implemented Yet)  
**Purpose:** Shift all heavy processing from Vercel to background worker, enabling **50ms dashboard response**, **zero DB load**, and **accurate predictions**.

---

## 🧠 1. WHY ARE WE DOING THIS? (The Problem)

| Issue | Current State | Target State (After Upgrade) |
| :--- | :--- | :--- |
| **DB CPU Load** | Every dashboard request hits `orders` + `products` collections and does in-memory JOIN. | **Zero.** Dashboard reads 1 pre-computed document. |
| **Vercel Timeout** | Processing 5000+ products + orders takes 1-3 seconds. | **< 50ms.** No heavy processing on Vercel. |
| **Data Incompleteness** | `limit: 5000` — if catalog > 5000 products, predictions incomplete. | **Unlimited.** Worker paginates through ALL products. |
| **Accuracy** | RTO/Returned orders included in velocity (inaccurate predictions). | **High.** Whitelist statuses (`Delivered`, `Completed`) only. |
| **Static Values** | Hardcoded 15 days, 3/7 thresholds. | **Dynamic.** All thresholds from Global Settings. |
| **Automation** | Manual refresh. Admin must wait for computation. | **Automatic.** Worker runs every 6 hours (or on-demand). |

---

## 🏗️ 2. ENTERPRISE ARCHITECTURE (Pre-computed Snapshot)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKGROUND WORKER (Hugging Face / GitHub Actions)      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Worker runs every 6 hours (or on demand).                        │   │
│  │  1. Fetch Dynamic Settings (windowDays, thresholds, topLimit).    │   │
│  │  2. Paginate through ALL products (no 5000 limit).               │   │
│  │  3. Fetch orders from last N days (from settings).               │   │
│  │  4. Apply WHITELIST statuses (Delivered, Completed).             │   │
│  │  5. Calculate velocity, days-left for each variant.              │   │
│  │  6. Sort by priority (CRITICAL > HIGH > LOW > SAFE).             │   │
│  │  7. Save predictions to "inventory_forecast_snapshots" collection. │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (Upsert)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MONGODB (Snapshot Collection)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: "inventory_forecast_snapshots"                       │   │
│  │  Document: { "_id": "forecast", "data": [...predictions], "generatedAt": Date } │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (Read)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Dashboard API)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  getInventoryForecasterPayload() → reads 1 document from snapshot. │   │
│  │  ❌ No DB aggregation. ❌ No in-memory JOIN. ❌ No product fetch.  │   │
│  │  Response time: ~50ms.                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 3. NEW COMPONENTS (Files to Create Later)

### 3.1. New File 1: `src/models/InventoryForecastSnapshot.ts`
**Purpose:** Mongoose model for pre-computed forecast data.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | string | Fixed value: `"forecast"` (singleton) |
| `data` | array | Array of `ForecastItem` objects |
| `generatedAt` | Date | Timestamp when forecast was generated |
| `windowDays` | number | Days used for velocity calculation (from settings) |
| `criticalThreshold` | number | Days-left threshold for CRITICAL flag (from settings) |
| `totalVariantsAnalyzed` | number | Total variants scanned in the catalog |

### 3.2. New File 2: `worker/forecast-worker.ts`
**Purpose:** Background script that:
- Paginates through ALL products (unlimited).
- Fetches orders (last N days, whitelist statuses).
- Calculates velocity, days-left, priority.
- Saves snapshot to MongoDB.

### 3.3. New File 3: `worker/Dockerfile` (For Hugging Face)
**Purpose:** Container definition for worker deployment (Hugging Face Spaces).

### 3.4. Modified File 4: `Global Settings` (Payload)
**Purpose:** Add `forecasting` group with dynamic thresholds:
- `windowDays` (default: 15)
- `criticalThreshold` (default: 3)
- `highThreshold` (default: 7)
- `topLimit` (default: 20)

### 3.5. Modified File 5: `getInventoryForecasterPayload.ts` (Refactored)
**Purpose:** Rewrite to read from snapshot (no heavy processing).

---

## 🔧 4. DYNAMIC SETTINGS (Global Settings Additions)

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `forecasting.windowDays` | number | 15 | Number of days for velocity calculation. |
| `forecasting.criticalThreshold` | number | 3 | If days-left <= this, flag as CRITICAL. |
| `forecasting.highThreshold` | number | 7 | If days-left <= this, flag as HIGH. |
| `forecasting.topLimit` | number | 20 | Max number of predictions to return. |
| `forecasting.autoRefreshHours` | number | 6 | Worker refresh interval (hours). |

---

## 📊 5. FORECAST ITEM STRUCTURE (Snapshot Data)

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Product title |
| `variant` | string | Variant name |
| `stock` | number | Current stock quantity |
| `velocity` | string | Sales per day (2 decimal places) |
| `daysLeft` | number or "Stable" | Days remaining stock. `"Stable"` if velocity = 0. |
| `priority` | enum | `"CRITICAL"` (≤3 days), `"HIGH"` (≤7 days), `"LOW"` (sold > 0), `"SAFE"` (no sales). |

---

## ⚙️ 6. FUTURE ACCURACY UPGRADES (Optional Enhancements)

| # | Upgrade | Description | Priority |
| :--- | :--- | :--- | :--- |
| 1 | **Weighted Moving Average** | Recent days get more weight (e.g., last 3 days = 40%, last 7 days = 30%, last 15 days = 30%). | 🟢 Low |
| 2 | **Outlier Removal** | Ignore sales spikes (e.g., 1 day with 1000 orders). | 🟡 Medium |
| 3 | **Seasonal Adjustment** | Compare with same period last month/year. | 🔴 Complex |
| 4 | **Supplier Lead Time** | Add supplier lead days to alert earlier. | 🔴 Complex |
| 5 | **Machine Learning (ARIMA)** | Use statistical models for trend prediction. | 🔴 Very Complex |

---

## 📋 7. TOTAL FILE INVENTORY (When Implemented)

| Type | Count | Files |
| :--- | :--- | :--- |
| **New Files** | **3** | `src/models/InventoryForecastSnapshot.ts` <br> `worker/forecast-worker.ts` <br> `worker/Dockerfile` |
| **Modified Files** | **2** | `src/payload/globals/Settings.ts` (add forecasting group) <br> `src/app/features/admin/analytics-telemetry/action/getInventoryForecasterPayload.ts` (refactor to snapshot read) |
| **Total** | **5** | |

---

## 🚀 8. DEPLOYMENT CHECKLIST (Future)

| Step | Task | Platform |
| :--- | :--- | :--- |
| 1 | Add `forecasting` group to Global Settings | Payload Admin |
| 2 | Run `npx tsx worker/forecast-worker.ts` (1 time) | Local / Terminal |
| 3 | Refactor `getInventoryForecasterPayload.ts` to read snapshot | Vercel |
| 4 | Deploy code to Vercel | Vercel |
| 5 | Set up worker automation (GitHub Actions / Hugging Face) | External |
| 6 | Test dashboard — should show forecast data in < 50ms | Admin UI |

---

## ✅ 9. WHY THIS IS ENTERPRISE STANDARD

| Feature | Current (Before) | After Upgrade |
| :--- | :--- | :--- |
| **Dashboard Response** | 1-3 seconds (Vercel processing) | **< 50ms** (Snapshot read) |
| **Vercel CPU Load** | High (in-memory JOIN + sort) | **Zero** (JSON parse only) |
| **DB Load** | High (orders + products scan) | **Zero** (1 document read) |
| **Data Completeness** | ❌ Limit 5000 issue | ✅ **Unlimited** (pagination) |
| **Accuracy** | ❌ RTO/Returned orders included | ✅ **High** (whitelist statuses) |
| **Maintainability** | ❌ Hardcoded thresholds | ✅ **Dynamic** (Global Settings) |
| **Automation** | ❌ Manual refresh | ✅ **Automatic** (Worker 6hrs) |

---

## 🏆 10. FINAL VERDICT

> **Yeh upgrade system ko enterprise-standard banayega. Vercel par load zero, DB par load zero, predictions accurate. Admin ko real-time risk visibility milegi bina kisi performance hit ke.**

**Status:** 📝 Planned  
**Priority:** Medium (After Sales Chart, Top Products, etc.)  
**Implementation Time:** ~2-3 hours

---

**Document Version:** 1.0  
**Created:** July 15, 2024  
**Purpose:** Future implementation blueprint for Inventory Forecaster — Enterprise Snapshot System.