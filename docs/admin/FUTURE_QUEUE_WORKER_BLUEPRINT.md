# 🚀 POCKETVALUE — FUTURE PRODUCTION BLUEPRINT
## Queue + Worker System (Hugging Face) — Complete Planning Document

> **Status:** 📝 **Planned (Not Implemented Yet)**  
> **Purpose:** Vercel Hobby limits (10s timeout, 128MB RAM) ko bypass karte hue **On-Demand Bulk Import** (20,000+ products) ko production mein deploy karna.  
> **Current System:** CLI Script (`scripts/import-products-cli.ts`) ko backup ke tor par rakhenge. Admin UI se trigger karne ke liye yeh naya system banayenge.

---

## 🧠 Why This System? (Requirement / Objective)

| Problem | Solution |
| :--- | :--- |
| Vercel Serverless functions 10 sec timeout mein 20,000 products import nahi kar sakte. | Heavy processing ko Vercel se bahar (Hugging Face Worker) le jaana. |
| Admin chahta hai ke wo **Admin Panel (Browser)** se hi CSV upload kare aur background mein import ho jaye. | Admin UI trigger karega, Vercel sirf queue push karega (< 1 sec). |
| Vercel Hobby par Cron Jobs sirf **daily** run hoti hain, real-time trigger nahi ho sakta. | **Queue (Upstash Redis) + Worker (Hugging Face)** use karenge — event-driven, on-demand. |
| Import complete hone par Admin ko notify karna hai. | Worker Vercel ko Webhook bhejega, Admin ko notification milegi. |
| Cost ₹0 rakhna hai. | Sab platforms (Vercel Hobby, Upstash Free, Hugging Face Free, MongoDB M0) free hain. |

---

## 🏗️ System Architecture (High-Level Design)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. ADMIN PANEL (Vercel)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  "ImportProductsContent.tsx" (UI)                                   │   │
│  │  - Admin CSV upload karega                                         │   │
│  │  - Click on "Start Import"                                         │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │ (POST /api/import/trigger)               │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  /api/import/trigger (NEW) — Lightweight API Route                 │   │
│  │  - CSV parse karega                                                │   │
│  │  - CSV URL / data ko Redis Queue mein push karega (LPUSH)          │   │
│  │  - Return { jobId: "import_123" } to admin                         │   │
│  │  - Time: < 500ms (Vercel timeout safe)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           2. UPSTASH REDIS (Queue)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Queue: "import_queue" (FIFO)                                      │   │
│  │  Job Data: { jobId, csvData, provider, primary, dual }             │   │
│  │  Status: SET "import:jobId:status" = "pending"                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (RPOP / BLPOP)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        3. HUGGING FACE (Worker)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Worker Script (Node.js / TypeScript) — Runs Continuously          │   │
│  │  1. Queue se job pick karega (RPOP)                                │   │
│  │  2. CSV parse karega                                               │   │
│  │  3. Images download + Sharp compress karega                        │   │
│  │  4. Images upload karega (ImgBB/R2 via Adapter)                    │   │
│  │  5. Products Payload (MongoDB) mein create karega                  │   │
│  │  6. Vercel ko Webhook bhejega (/api/import/complete)               │   │
│  │  - Time: 10-15 minutes (20k products) ✅ No timeout               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────┬─────────────────────────────┘
                                                │ (POST /api/import/complete)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           4. VERCEL (Webhook Receiver)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  /api/import/complete (NEW) — Lightweight API Route                │   │
│  │  - Worker se status receive karega                                 │   │
│  │  - Redis mein status update karega: "completed" / "failed"         │   │
│  │  - Admin UI ko real-time notification bhejega (SSE / Polling)      │   │
│  │  - Time: < 200ms (Vercel timeout safe)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Inventory — Changes Required (Future Implementation)

### A. EXISTING FILES — MODIFY KARNI HONGI (3 Files)

| # | File Path | Change | Reason |
| :--- | :--- | :--- | :--- |
| 1 | `src/app/features/admin/inventory-cms/components/main/ImportProductsContent.tsx` | `fetch('/api/import/batch')` ko replace karke `fetch('/api/import/trigger')` karein. | Ab directly upload nahi karna, queue push karna hai. |
| 2 | `src/app/features/admin/inventory-cms/components/main/ImportProductsContent.tsx` | Progress tracking UI update karein — `jobId` se status poll karein. | Admin ko pata chalna chahiye ke background mein kaam ho raha hai. |
| 3 | `src/app/features/admin/inventory-cms/actions/payloadProductActions.ts` | (Optional) Webhook security ke liye secret validation add karein. | Security ensure karein ke worker hi webhook bhej raha hai. |

### B. NEW FILES — BANANI HONGI (5 Files)

| # | File Path | Purpose |
| :--- | :--- | :--- |
| 1 | `src/app/api/import/trigger/route.ts` | **Queue Pusher:** CSV data receive karega, Redis queue mein job push karega. <br> `POST /api/import/trigger` |
| 2 | `src/app/api/import/status/route.ts` | **Status Checker:** Admin UI poll karegi status check karne ke liye. <br> `GET /api/import/status?jobId=123` |
| 3 | `src/app/api/import/complete/route.ts` | **Webhook Receiver:** Worker se completion signal receive karega. <br> `POST /api/import/complete` |
| 4 | `worker/Dockerfile` | **Hugging Face Container:** Worker environment setup (Node.js + dependencies). |
| 5 | `worker/index.ts` | **Worker Script:** Queue se job pick karega, processing karega, webhook bhejega. |

---

## 🔑 Environment Variables (New Keys Add Karni Hain)

`.env.local` (ya Vercel Project Env) mein yeh naye keys add karne hain:

```bash
# =============================================
# 🚀 NEW KEYS FOR QUEUE + WORKER SYSTEM
# =============================================

# 1. UPSTASH REDIS (Already exist, but ensure its connected)
# REDIS_URL=... (Already present)

# 2. WEBHOOK SECURITY (HF Worker → Vercel)
WORKER_WEBHOOK_SECRET=your_super_secret_webhook_key_here

# 3. HUGGING FACE (Optional — for HF Jobs API if using Jobs)
HF_TOKEN=hf_your_token_here

# 4. WORKER ENVIRONMENT (To tell worker which environment it's in)
WORKER_ENVIRONMENT=production
```

---

## 🐳 Docker & Hugging Face — Deployment Guide (Future Setup)

### Step 1: Dockerfile (worker/Dockerfile)
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy worker script and shared libs (adapter, types, etc.)
COPY worker/index.ts ./worker/
COPY src/lib/adapters ./src/lib/adapters/
COPY src/lib/cloudinary.ts ./src/lib/ (Skip if deleted)
COPY tsconfig.json ./

# Install tsx for running TypeScript
RUN npm install -g tsx

# Command to run worker
CMD ["tsx", "worker/index.ts"]
```

### Step 2: Build & Push to Hugging Face
```bash
# 1. Build Docker image
docker build -t pocketvalue-worker -f worker/Dockerfile .

# 2. Login to Hugging Face
huggingface-cli login

# 3. Create Space
# Go to https://huggingface.co/new-space
# Select "Docker" template.

# 4. Push image (or use HF Spaces Git LFS)
# Alternatively, Hugging Face Spaces can build directly from your repo.
```

### Step 3: Deploy on Hugging Face
1. Hugging Face Spaces mein **"Docker"** template select karein.
2. Space name: `pocketvalue-import-worker`
3. Repository mein `worker/Dockerfile` and `worker/index.ts` push karein.
4. Space settings mein **Secrets** add karein (All environment variables).
5. Click **"Build"** → HF automatically worker start kar dega.

> **Important:** Hugging Face Spaces free tier mein background processes chal sakti hain. Worker ko continuously run karne ke liye "Sleep" disable karein (ya keep-alive ping bhejein).

---

## 🔄 End-to-End Workflow (How It Will Work)

```text
1. Admin → CSV Upload karega (UI)
   ↓
2. Vercel (/api/import/trigger) → CSV parse karega → Queue push karega (Redis)
   ↓
3. Vercel → Admin ko { jobId: "import_123" } return karega
   ↓
4. Admin UI → Har 2 seconds par status poll karega (GET /api/import/status)
   ↓
5. Hugging Face Worker → Queue se job pick karega (Redis RPOP)
   ↓
6. Worker → CSV parse → Images download + compress → Upload → DB insert
   ↓
7. Worker → Complete signal bhejega Vercel ko (POST /api/import/complete)
   ↓
8. Vercel → Redis mein status update karega → Admin UI ko notification show hogi
   ↓
9. Admin → Dashboard par "Import Complete!" message dekhega ✅
```

---

## 📊 Platforms & Cost Analysis (₹0 Bill)

| Platform | Purpose | Tier | Cost |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend UI, API routes (trigger, status, complete) | Hobby | ✅ Free |
| **Upstash Redis** | Queue (Job storage, status tracking) | Free (10k commands/day) | ✅ Free |
| **Hugging Face** | Background Worker (Sharp, Upload, DB) | Spaces Free (CPU) | ✅ Free |
| **MongoDB Atlas** | Database (Products, Orders) | M0 (512MB) | ✅ Free |
| **ImgBB / R2** | Image Storage | Free | ✅ Free |
| **Total** | | | ✅ **₹0** |

---

## 🛡️ Security Considerations

| Risk | Mitigation |
| :--- | :--- |
| Worker fake webhook bheje | Webhook secret validate karein (`WORKER_WEBHOOK_SECRET`). |
| CSV injection | CSV data validate karein (Zod schemas already exist). |
| Unauthorized access | `verifyStaff(['admin', 'manager'])` use karein (already implemented). |
| Redis queue overflow | Queue length monitor karein (Upstash free tier 10k commands/day). |

---

## 🧪 Testing Checklist (Future Testing)

- [ ] Small CSV (10 products) → Queue push → Worker pick → Complete.
- [ ] Large CSV (1000 products) → Queue push → Worker process → Verify DB.
- [ ] Network failure → Worker retry logic → Queue re-queue.
- [ ] Admin UI status polling → Real-time updates.
- [ ] Webhook security → Invalid secret reject kare.

---

## 🗺️ Migration Path (Current → Future)

| Current System | Future System (Planned) |
| :--- | :--- |
| CLI Script (`npm run import-products`) | Admin UI import (Browser) |
| Manual terminal command | One-click button |
| Admin must be on local machine | Admin can trigger from anywhere |
| No progress tracking (except terminal logs) | Real-time progress bar in Admin UI |
| Suitable for Super Admin | Suitable for all Admin/Managers |

> **Note:** CLI script ko **backup** ke tor par rakhenge. Future system kisi bhi reason se fail ho toh CLI script se kaam chal sakta hai.

---

## 🚀 Next Steps (Jab Implement Karein)

1. `worker/` folder banayein.
2. `Dockerfile` aur `index.ts` likhein.
3. `src/app/api/import/trigger`, `/status`, `/complete` routes banayein.
4. `ImportProductsContent.tsx` update karein.
5. Hugging Face Space create karein aur deploy karein.
6. Test karein.
7. Production release karein.

---

## ✅ Current System Status (As of Now)

| Component | Status |
| :--- | :--- |
| CLI Script (`import-products-cli.ts`) | ✅ **Complete & Working** |
| Local Media Adapters (ImgBB/R2) | ✅ **Complete** |
| Per-Product Toggle (Products.ts) | ✅ **Complete** |
| Global Settings (mediaFetchMode) | ✅ **Complete** |
| Frontend Mapper (productMapper.ts) | ✅ **Complete** |
| **Queue + Worker System** | ⏳ **Planned (Future Implementation)** |

---

**Document Version:** 1.0  
**Created:** July 14, 2026  
**Purpose:** Future implementation blueprint for Vercel-free, on-demand bulk import using Queue + Hugging Face Worker.

> **Yeh document safe rakh lein. Jab is par kaam karein, toh iske mutabiq implement karein. Current system waise ka waisa chalega.**