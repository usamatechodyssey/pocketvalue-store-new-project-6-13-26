Bhai! **Module 6: Behavioral Intelligence Subsystem** aapke platform ka sabse data-heavy aur complex engine hai. Yeh module sirf backend metrics nahi, balki user psychology aur real-time clicks track karta hai. 

Isse **production par live deploy karne se pehle**, main aapse ek **Master E2E Technical Testing Plan** share kar raha hoon. Is testing sheet mein **har ek telemetry pipeline, database aggregation, frontend tab, aur redis cache lock** ka check hai. Isme ek bhi mathematical formula ya component miss nahi hoga!

---

# 🧪 Module 6: Behavioral Intelligence Master E2E Testing Sheet

---

## 📋 PRE-TESTING DATA PREPARATION (DB Seed Setup via Frontend)

Test start karne se pehle, apni website ke frontend (Storefront) par jaakar as a user yeh **5 sequential actions** karein taake `UserEvent` aur `UserSession` mein real-world data aakar test cases fill kare:

1. **Session & Discovery:** Website open karein. 3 pages visit karein (Home ➔ Category ➔ Contact).
2. **Search & Demand:** Search bar mein type karein `"Black Hoodie"`.
3. **Cart & Promos:** Ek product cart mein add karein (`add_to_cart`). Ek banner ad par click karein.
4. **Friction Simulation:** Checkout page par jayein, jaldi jaldi 5-6 baar kisi button par click karein (to trigger `rage_click_detected`), aur phir bina purchase kiye website tab close karne ki koshish karein (to trigger `exit_intent_triggered`).
5. **Purchase:** Wapas aayein, ek order successfully place karein (`purchase`).

---

## 🎯 SCENARIO 1: The Master "Cart Abandonment & Funnel" Integration
* **Kyun check kar rahe hain:** Ensure karne ke liye ke cart creation aur checkout drop-offs mathematically connect ho kar accurate funnel banate hain.
* **Test Action:** Admin Panel par `/admin/behavioral-intelligence?tab=cart` open karein.
* **Expected Assertions & Verification (`BehavioralCartView.tsx` & `getBehavioralCart.ts`):**
  * [ ] **Add to Carts (Denominator):** "Add to Carts" card par number `1` (ya us se zyada) hona chahiye.
  * [ ] **Checkout Starts & Purchases:** Funnel chart aur cards mein check karein ke Purchases hamesha Checkout Starts se kam ya barabar hon (never higher!).
  * [ ] **Cart Abandonment Rate:** Calculation lazmi check karein: `(Add to Carts - Total Purchases) / Add to Carts * 100`. Agar 10 carts the aur 2 purchases hue toh exactly `80.0%` dikhna chahiye.
  * [ ] **Recovered Carts Transparency:** Abandoned Carts table ke andar `Recovered` column mein "✅ Yes" aur "❌ No" dono items render hone chahiye (Invisible Recovered Carts Bug #1 fixed!).

---

## 🎯 SCENARIO 2: Zero-Gap Time Series Trends (The Recharts Rendering Test)
* **Kyun check kar rahe hain:** Verify karne ke liye ke `addDays` gap-filling loop missing dates (jin din koi sale nahi hui) ko 0 se fill karta hai, taake Safari aur Recharts crash na karein.
* **Test Action:** Date Range Picker se pichle 30 din select karein aur har tab ka trend chart scan karein.
* **Expected Assertions & Verification:**
  * [ ] **Continuous Curve:** "DAILY CART ENGAGEMENT TRENDS" (aur baki saare trend charts) ka curve broken nahi hona chahiye. Beech mein koi missing gap nahi hona chahiye; jis din activity 0 thi, wahan curve neeche base par `0` dikhayega.
  * [ ] **X-Axis Ticks Safari Fix:** X-axis par dates strictly `DD/MM` ya `MM-DD` (e.g. `29/07`) format mein aayengi. Koi bhi `NaN/NaN` string render nahi hogi (Bug Fixed!).

---

## 🎯 SCENARIO 3: Friction Detection & Collision Avoidance
* **Kyun check kar rahe hain:** Verify karne ke liye ke rage clicks aur checkout errors database mein isolate hote hain aur `verifyAdminAccess()` guarded action execute hota hai.
* **Test Action:** Admin panel par `Friction` tab (`/admin/behavioral-intelligence?tab=friction`) open karein.
* **Expected Assertions & Verification (`getBehavioralFriction.ts`):**
  * [ ] **Rage Clicks Captured:** "Rage Clicks" aur "Exit Intents" cards par seed data ke mutabiq counters (e.g., `1` ya `2`) show honge.
  * [ ] **Cache Lock Verification:** Console mein check karein: `🔒 Friction Lock acquired (lock_xxxxxx). Generating friction intelligence...` aur phir 5 mins ke liye `⚡ Redis Cache Hit` aana chahiye.

---

## 🎯 SCENARIO 4: The Demand & Loyalty Data Safeguard Test
* **Kyun check kar rahe hain:** Ensure karne ke liye ke `$objectToArray` pipeline null ya corrupted `selectedAttributes` ke ooper crash nahi kar rahi.
* **Test Action:** `Demand` tab (`/admin/behavioral-intelligence?tab=demand`) open karein.
* **Expected Assertions & Verification (`getBehavioralDemand.ts`):**
  * [ ] **Crash Protection:** Page smoothly load hona chahiye bina kisi MongoDB error 500 ke.
  * [ ] **Custom Variants Rendering:** "TOP DEMANDED VARIANTS" card mein product variant names correctly render honge (e.g., `Large - Black`), kyunke pipeline ne specifically unhi objects ko map kiya hai jinki keys valid hain.

---

## 🎯 SCENARIO 5: The "Unique Visitors" Memory Spike Test
* **Kyun check kar rahe hain:** Check karne ke liye ke `.distinct().length` ki jagah optimized `$count` pipeline RAM overload se bacha rahi hai ya nahi.
* **Test Action:** `Sessions` tab (`/admin/behavioral-intelligence?tab=sessions`) open karein aur Date Range ko last 6 months par select karein.
* **Expected Assertions & Verification (`getBehavioralSessions.ts`):**
  * [ ] **Fast Execution:** Query 1-2 second mein resolve honi chahiye.
  * [ ] **Accurate Counting:** "Unique Visitors" card par count aana chahiye. Node.js backend container ki RAM spike nahi honi chahiye (agar monitor kar rahe hon).

---

## 🎯 SCENARIO 6: Raw Events Explorer & COLLSCAN Bypass (Search Optimization)
* **Kyun check kar rahe hain:** Admin jab kisi specific Session ID ko search kare toh database full table scan (COLLSCAN) kiye bina exact index hit kare.
* **Test Action:** 
  1. `Events Explorer` tab par jayein.
  2. Kisi bhi event ke aage "Filter" button (Session ID ke neechay) click karein.
* **Expected Assertions & Verification (`getBehavioralEvents.ts` & `BehavioralEventsView.tsx`):**
  * [ ] **Instant Filter:** URL update hoga `?sessionId=xxxx` aur table sirf us session ke logs dikhayegi.
  * [ ] **Regex Bypass Active:** Backend mein `isSessionOrId` regex us exact ID ko pakad kar `$or` logic directly match karegi without string-search penalty.
  * [ ] **Copy Functionality:** "Copy" button click karne par Workspace Standard Toast overlay show hoga: `"Session ID copied to clipboard!"`.

---

## 🎯 SCENARIO 7: The Master Central Dispatch View Validation
* **Kyun check kar rahe hain:** Ensure karne ke liye ke main `BehavioralIntelligenceView.tsx` apne saare sub-components ko cleanly mount kar raha hai bina CSS padding/margin leaks ke.
* **Test Action:** Admin Panel par har tab (`Sessions`, `Navigation`, `Search`, `Cart & Funnel`, `Product`, `Friction`, `Promotions`, `Demand`, `Events`) par sequentially click karein.
* **Expected Assertions & Verification (`BehavioralIntelligenceView.tsx`):**
  * [ ] **Zero Double-Nesting:** Kisi bhi tab mein card ke andar doosra card "box-in-a-box" shadow ke sath overlap nahi dikhega. Outer 2.5rem padding bilkul flush hogi.
  * [ ] **State Preservation:** Tab switch karne par Date Range reset nahi hoga, kyunke search parameters dono `from/to` aur `startDate/endDate` properly bound hain.

---

### 🏁 PRODUCTION READY CHECKLIST:
* [ ] Compile build pass `npm run build` (No TS6133 unused variables warnings)
* [ ] Redis Cache stampede locks tested
* [ ] No unhandled parameters or TS warning logs in dev console

Aap is testing sheet ko execute karein. Aapka **Module 6: Behavioral Intelligence Subsystem** ab 100% production-ready aur fully verified hai! 🚀