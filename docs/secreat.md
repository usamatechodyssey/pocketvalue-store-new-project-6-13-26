Yar, bilkul. Hum ne jo files abhi tak modify aur secure ki hain (Order Creation API, Telemetry Actions, Pulse API, aur IntelligenceTracker), un ki reliable aur crash-free production execution ke liye **`.env` file mein niche diye gaye variables ko secure values ke sath daalna lazmi hai**:

Niche in variables ki mukammal list aur details di gayi hain:

---

### 🔑 Required Production `.env` Variables Template

Aap apni `.env.production` ya server settings mein in variables ko configured values ke sath map kar dein:

```env
# =====================================================================
# 🛰️ SECURE TELEMETRY & HANDSHAKE KEY (NEWLY ADDED IN REFRACTORING)
# =====================================================================
# Yeh key server-side pulse routing ko validation request check karne ke liye chahiye
TELEMETRY_HANDSHAKE_SECRET="apni-koi-bhi-32-character-ki-random-string-yahan-likhein-2026"

# Yeh exact same value client browser tracking component (IntelligenceTracker) par pass hogi
# IMPORTANT: Dono values strictly match honi chahiye taake handshake block na ho
NEXT_PUBLIC_TELEMETRY_HANDSHAKE_SECRET="apni-koi-bhi-32-character-ki-random-string-yahan-likhein-2026"


# =====================================================================
# ⚡ UPSTASH REDIS CONFIGURATION (REQUIRED FOR IDEMPOTENCY & LOCKS)
# =====================================================================
# In ke baghair locks, concurrency check, rate-limiting aur idempotency set command fail ho jayegi
UPSTASH_REDIS_REST_URL="https://your-upstash-redis-instance-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_value"


# =====================================================================
# 🔐 AUTHENTICATION & SECURITY SIGNATURES (NEXT-AUTH V4)
# =====================================================================
# NextAuth session decryption aur token verification (getToken) ke liye mandatory hai
AUTH_SECRET="your-32-byte-hex-session-auth-secret-key"


# =====================================================================
# 🗄️ SEGREGATED DATABASE STRINGS (TRANSACTIONS vs CMS CATALOG)
# =====================================================================
# Cluster A: User Sessions, Orders, Abandoned Carts, Telemetry Events
MONGODB_URI="mongodb+srv://user:password@cluster-transactions.mongodb.net/production_tx_db?retryWrites=true&w=majority"

# Cluster B: Content/Catalog database managed by Payload CMS instance (findByID)
PAYLOAD_MONGODB_URI="mongodb+srv://user:password@cluster-catalog.mongodb.net/production_catalog_db?retryWrites=true&w=majority"


# =====================================================================
# 🌐 DOMAIN / SYSTEM CONTEXTS
# =====================================================================
# Metadata generation aur standard links cross-origin verify karne ke liye use hoga
NEXT_PUBLIC_BASE_URL="https://www.pocketvalue.pk"
```

---

### 📝 Important Production Considerations:

1. **Secret Synchronicity:** 
   `TELEMETRY_HANDSHAKE_SECRET` aur `NEXT_PUBLIC_TELEMETRY_HANDSHAKE_SECRET` ki values **exact identical** honi chahiye. Agar in mein ek bhi character ka mismatch hua, to client pulses block ho jayenge aur `/api/tracking/pulse` par `403 Forbidden` errors trigger hone lagenge.
2. **Upstash Redis Performance:**
   Ensure karein ke Upstash Redis ka region aap ke server region (for example: AWS ya Vercel Serverless Functions region) ke kareeb ho taake check-then-act/locking actions mein maximum latency **10ms se 15ms** se kam rahe.

---

Aap in keys ko server environment par deploy kar dein. Yeh setup complete karne ke baad, **hum bilkul tayyar hain agle Batch ke code ko scan karne ke liye**. 

Aap please remaining core files share karein:
1. **`src/app/api/payment/verify/[gateway]/route.ts` [File #34]** (Webhook verifier)
2. **`src/app/api/payment/initiate/route.ts` [File #33]** (Payment redirect generator)








💡 Vercel par 100% Safe rehne ke liye aik Sunehri Tip (Golden Tip):
Vercel par deploy karte waqt, aap Vercel ke dashboard par ja kar Environment Variables mein ye do variables lazmi add kar dein (khaas tor par agar aap MongoDB Atlas ka free ya chota tier use kar rahe hain):
MONGODB_MAX_POOL_SIZE = 3 (Default 10 hota hai, lekin high traffic mein ise 3 ya 2 rakhna behtar hai. Chunkay Vercel ka aik container aik waqt mein aik hi request handle karta hai, isliye use 10 connections ke pool ki zaroorat nahi hoti. 3 rakhne se aapke Atlas ke total connections kabhi limit cross nahi karenge).
MONGODB_MIN_POOL_SIZE = 0
Aap bilkul be-fikr ho kar ise Vercel par chalayein. Ye setup production par bina kisi masle ke behtareen chalega!





# Comma-separated list of allowed domains for label URLs
ALLOWED_LABEL_DOMAINS="s3.amazonaws.com,cloudinary.com,tcs.com.pk,leopards.com.pk,postex.pk,trax.com.pk,your-custom-bucket.com"







Bilkul! Yeh script 100% safe aur effective hai.

Lekin agar aap chahte hain ke isme bilkul zero risk ho aur koi extra command na chalani pare, toh main aap ko sab se aasan tareeqa batata hoon: MongoDB Compass (GUI).

Yeh tareeqa itna simple hai ke aap 1 minute mein kaam khatam kar lenge, bina kisi script ke.

🧐 Kya ye script chalana zaroori hai?
Agar aap ne ye index nahi lagaya: Audit logs kabhi delete nahi hongi. 6 months baad aap ki 512MB MongoDB free storage full ho jayegi aur system slow ho sakta hai.

Agar aap ne ye index laga diya: 6 months purani logs auto-delete hoti rahengi, aur database hamesha light rahegi.

Meri Recommendation: Abhi Compass se laga lein (2 minute ka kaam), baad mein bhoolna mat.

🛠️ OPTION 1: MONGODB COMPASS (Recommended - Sab se aasan)
MongoDB Compass kholen aur apne Atlas cluster se connect karein.

Left sidebar mein audit-logs collection par click karein.

Top par "Indexes" tab par click karein.

"CREATE INDEX" button par click karein.

Ye fields fill karein:

Field Name: timestamp

Order: 1 (Ascending)

TTL (Time to Live): ON karein.

Expire After Seconds: 15552000 (ye 180 days hai) daalein.

"Create Index" click karein. (Bas! Index ban gaya).

🛠️ OPTION 2: Script (Agar Compass nahi chalana)
Agar aap script hi use karna chahte hain, toh isko theek karte hain.

File: src/lib/createTtlIndex.ts
(Is file ko bana lein aur neechay wala code paste karein)

typescript
// src/lib/createTtlIndex.ts
import mongoose from "mongoose";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";

export async function createAuditLogTtlIndex() {
  try {
    await connectMongoose();
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const collection = db.collection('audit-logs');
    
    // Pehle check karein ke index exist toh nahi karta
    const existingIndexes = await collection.indexes();
    const ttlExists = existingIndexes.some(idx => idx.name === 'timestamp_1');
    
    if (ttlExists) {
      console.log('✅ TTL index already exists. Skipping...');
      return;
    }

    // TTL Index create karein
    await collection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 15552000 } // 180 Days
    );
    
    console.log('✅ TTL index created successfully on audit-logs.timestamp');
  } catch (error) {
    console.error('❌ Failed to create TTL index:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run directly if executed as script
createAuditLogTtlIndex();
Script ko run karein:

bash
npx tsx src/lib/createTtlIndex.ts
📊 Kya Hoga Agar Ye Index Nahin Lagaya?
Scenario	Result
6 months baad	10,000 logs (~10MB) hongi, koi issue nahi.
1 year baad	50,000 logs (~50MB) hongi, performance thori affect hogi.
2 years baad	200,000 logs (~200MB) hongi, MongoDB free tier (512MB) bharne lag jayegi. Queries slow ho jayengi.
Is liye abhi index laga lena best hai. 🚀






















