# 📦 PocketValue Local Bulk Import Script — Complete Usage Guide

> **Version:** 6.0 (CLI Edition)  
> **Purpose:** Local machine par Vercel ki **10 sec timeout** aur **128 MB RAM** limit ko bypass karein.  
> **Speed:** 20,000 products ~10-15 minutes mein complete.

---

## 🧠 Overview

Yeh script aapki **local machine** par chalti hai.  
- `Sharp` (Node.js) use karti hai — jo browser compression se **10x fast** hai.  
- Saari images **parallel** download, compress, aur upload hoti hain (20 concurrent).  
- **Dual Upload** support karti hai (ImgBB + R2 dono par ek saath).  
- Direct Payload DB insert, ya JSON dump (Compass / `mongoimport` ke liye).

---

## ⚙️ Requirements (Pehle Set Karein)

### 1. Environment Variables (`.env` file)
```bash
# 📸 IMGBB (Free, Unlimited)
IMGBB_API_KEY=your_key_here

# ☁️ CLOUDFLARE R2 (10GB Free)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=pocketvalue-media
R2_PUBLIC_DOMAIN=https://pub-xxxx.r2.dev

# 🎯 Default Provider (Optional) — imgbb | r2
DEFAULT_IMPORT_PROVIDER=imgbb
```

### 2. Install Dependencies
```bash
npm install -D tsx
npm install sharp
```

### 3. Script Location
`scripts/import-products-cli.ts`

---

## 📋 CSV Format (Bahut Zaroori)

### Grouping Logic (Kyunki yeh script Smart CSV hai)
- **Parent Row:** Jis row mein `title` column **bhari (non-empty)** ho, wo ek **naya product** start karti hai.
- **Variant Row:** Jis row mein `title` **khali (empty)** ho, wo product ki **variant (size/color)** hoti hai.
- **Single Row Product:** Agar `title` wali row mein `variant_name` bhi bhari hai, toh wo row **Parent + Variant** dono ka kaam karegi.

### Columns List (Case-Sensitive)

| Column Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| `title` | ✅ **Yes** | Text | Product ka naam. Isi se grouping hoti hai. |
| `slug` | ❌ No | Text | URL slug. Agar khali hai toh auto-generate. |
| `brand` | ❌ No | Text | Brand name. **Auto-create** ho jayega agar DB mein nahi hai. |
| `categories` | ❌ No | Text | Comma-separated (e.g., `Shirts,Men`). Pehle se exist karni chahiye. |
| `description` | ❌ No | Text | Product description. |
| `videoUrl` | ❌ No | Text | YouTube/Vimeo link. |
| `specifications` | ❌ No | Text | Pipe-separated (e.g., `Material:Cotton | Type:Shirt`). |
| `isBestSeller` | ❌ No | Boolean | `true` / `false` |
| `isNewArrival` | ❌ No | Boolean | `true` / `false` |
| `isFeatured` | ❌ No | Boolean | `true` / `false` |
| `isOnDeal` | ❌ No | Boolean | `true` / `false` |
| `rating` | ❌ No | Number | 0 to 5. |
| `variant_name` | ⚠️ Conditional | Text | Variant naam. Agar variant data hai toh required. |
| `variant_sku` | ❌ No | Text | Variant SKU. |
| `variant_price` | ⚠️ Conditional | Number | Variant price. Agar variant data hai toh required. |
| `variant_salePrice` | ❌ No | Number | Sale price. |
| `variant_stock` | ❌ No | Number | Stock quantity. |
| `variant_inStock` | ❌ No | Boolean | `true` / `false`. Default: `stock > 0`. |
| `variant_images` | ❌ No | Text | Comma-separated image URLs. |
| `variant_weight` | ❌ No | Number | Weight (kg). |
| `variant_height` | ❌ No | Number | Height (cm). |
| `variant_width` | ❌ No | Number | Width (cm). |
| `variant_depth` | ❌ No | Number | Depth (cm). |
| `attribute1_name` | ❌ No | Text | Custom attribute name (e.g., `Size`). |
| `attribute1_value` | ❌ No | Text | Custom attribute value (e.g., `XL`). |
| `attribute2_name` | ❌ No | Text | Custom attribute name (e.g., `Color`). |
| `attribute2_value` | ❌ No | Text | Custom attribute value (e.g., `Blue`). |

---

## 🛠️ CLI Options Reference

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `--file=<path>` | `string` | ✅ **Yes** | CSV file ka path (e.g., `./data/products.csv`) |
| `--provider=<value>` | `string` | ❌ No | Provider select: `imgbb`, `r2`, ya `both`. <br> *Default: `imgbb` ya `.env` ka `DEFAULT_IMPORT_PROVIDER`* |
| `--primary=<value>` | `string` | ❌ No | **Dual mode** mein primary provider set karein (image ka URL product mein store hoga). <br> *Default: `imgbb`* |
| `--dual` | `flag` | ❌ No | **Dual upload** enable (ImgBB + R2 dono par upload). <br> *Alias: `--provider=both`* |
| `--output=<path>` | `string` | ❌ No | Live DB mein insert nahi karna, sirf **JSON dump** karna hai. <br> (e.g., `--output=products.json`) |
| `--no-upload` | `flag` | ❌ No | Actual image upload **skip** karein (Mock URLs use honge). <br> *Sirf JSON dump structure check karne ke liye.* |
| `--dry-run` | `flag` | ❌ No | **Preview** mode. Kuch bhi insert/upload nahi hoga. <br> Sirf CSV parse hoga aur pehla product dikhega. |

---

## 🚀 Usage Examples (Commands)

### 1. Simple Import (Sirf ImgBB — Default)
```bash
npm run import-products -- --file=./products.csv
```

### 2. Sirf Cloudflare R2 Use Karein
```bash
npm run import-products -- --file=./products.csv --provider=r2
```

### 3. Dual Upload (ImgBB + R2 — Primary ImgBB)
```bash
npm run import-products -- --file=./products.csv --dual
```

### 4. Dual Upload — Primary R2
```bash
npm run import-products -- --file=./products.csv --dual --primary=r2
```

### 5. JSON Dump (Compass / Mongoimport Ke Liye)
```bash
npm run import-products -- --file=./products.csv --dual --output=products.json
```
> **Next Step:** Compass mein "Add Data" → "Import JSON" karein.

### 6. Dry Run (Sirf Preview)
```bash
npm run import-products -- --file=./products.csv --dry-run
```

### 7. Mock Mode (Sirf JSON Structure Check)
```bash
npm run import-products -- --file=./products.csv --no-upload --output=products.json
```

---

## ⚙️ Script Ka Workflow (Andar Kya Hota Hai)

```text
1. CSV Parse (Papa Parse)
   ↓
2. Product Groups Create (Parent + Variant Rows)
   ↓
3. Categories & Brands Pre-fetch (Mapping ke liye)
   ↓
4. For Each Product (Parallel, 20 concurrent):
   ├── Brand Check (Exist → Use | New → Create)
   ├── Categories Check (Must exist, else error)
   ├── Variants Process:
   │   ├── Images Download (Parallel, 20 concurrent)
   │   ├── Sharp Compression (WebP, Q80, 1200px)
   │   └── Upload to Provider(s) (ImgBB/R2)
   └── Product Document Build (with imgbbUrl + r2Url)
   ↓
5. Output Phase:
   ├── If --output given → JSON dump
   └── Else → Direct insert into Payload (Batches of 50)
   ↓
6. Done ✅
```

---

## 📊 Time Estimates (20,000 Products)

| Scenario | Time |
| :--- | :--- |
| **Local Script (8-core CPU, 100 Mbps Upload)** | ~15-20 minutes |
| **Local Script (8-core CPU, 1 Gbps Upload)** | ~10-15 minutes |
| **Vercel API (Browser chunks)** | ~20-30 minutes |

---

## 🔥 Features (Enterprise Ready)

| # | Feature | Status |
| :--- | :--- | :--- |
| 1 | **CSV Smart Grouping** | ✅ (Parent + Variant rows) |
| 2 | **Sharp Compression** | ✅ (WebP, Quality 80, 1200px) |
| 3 | **Parallel Processing** | ✅ (20 concurrent images) |
| 4 | **Dual Upload (ImgBB + R2)** | ✅ (--dual flag) |
| 5 | **Primary Provider Selection** | ✅ (--primary flag) |
| 6 | **JSON Dump Mode** | ✅ (--output) |
| 7 | **Dry Run Preview** | ✅ (--dry-run) |
| 8 | **Mock Uploads** | ✅ (--no-upload) |
| 9 | **Auto Brand Creation** | ✅ (If brand doesn't exist) |
| 10 | **Fallback Logic** | ✅ (If one provider fails, other continues) |
| 11 | **Vercel Bypass** | ✅ (Runs locally, no timeout) |
| 12 | **Dual URL Storage** | ✅ (imgbbUrl + r2Url stored in DB) |

---

## ❓ Troubleshooting (Aam Issues)

### 1. `Error: Category "XYZ" not found.`
- **Reason:** CSV mein category likhi hai jo DB mein nahi hai.
- **Fix:** Pehle categories import karein, phir products import karein.

### 2. `Error: IMGBB_API_KEY not set in .env`
- **Reason:** API key missing hai.
- **Fix:** `.env` mein `IMGBB_API_KEY=...` add karein.

### 3. `Error: R2 environment variables missing`
- **Reason:** R2 use kar rahe ho lekin env vars nahi daale.
- **Fix:** R2 env vars daalein, ya `--provider=imgbb` use karein.

### 4. Image upload fail ho rahi hai?
- Script **3 retries** nahi karti (local hai, manual retry kar sakte hain).  
- Check karein ke image URL accessible hai ya nahi.

---

## 🧹 Dead Code Cleanup

Is script mein **koi unused import nahi** hai:
- ✅ `getMediaAdapter` removed (direct instantiation)
- ✅ `path` removed
- ✅ `uuidv4` removed (custom key generator use hota hai)

---

## 🎯 Final Recommendation

| Aap Kya Chahte Hain? | Use Ye Command |
| :--- | :--- |
| **Fastest + Direct Import** (Sirf ImgBB) | `--file=data.csv` |
| **Redundancy (Dual Upload)** | `--file=data.csv --dual` |
| **Safe Import (Pehle JSON dump)** | `--file=data.csv --output=products.json` |
| **Production Validation (Dry Run)** | `--file=data.csv --dry-run` |

---

**Script Location:** `scripts/import-products-cli.ts`  
**Run Command:** `npm run import-products -- [options]`  
**Package.json Entry:**
```json
"scripts": {
  "import-products": "tsx scripts/import-products-cli.ts"
}
```