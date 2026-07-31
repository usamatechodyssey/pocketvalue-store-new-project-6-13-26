Bhai! `Module 5: Operational Intelligence Subsystem` ko production par deploy karne se pehle, ye hai aapka **Complete E2E Testing Plan & QA Verification Sheet**.

Yeh testing sheet ensure karegi ke aapke system ka **stuck cash (Limbo Revenue), cancellations (Leakage Rate), automated email/Slack alerts, aur POP comparison scales** 100% mathematically accurate hain.

---

# 🧪 Module 5: Operational Intelligence Subsystem E2E Testing Sheet

---

## 📋 PRE-TESTING DATA PREPARATION (DB Seed Setup)
Database mein test run karne ke liye yeh **10 distinct orders** configure karein:
1. **Delivered / Completed Orders (Fulfillment):**
   * 3 Orders with `status: "Delivered"` (Value: Rs. 5,000, Rs. 10,000, Rs. 15,000).
   * 1 Order with `status: "Completed"` (Value: Rs. 5,000).
   * *Total Valid Revenue:* Rs. 30,000.
2. **Cancelled / Rejected Orders (Leakage):**
   * 1 Order with `status: "Cancelled"` (Value: Rs. 3,000).
   * 1 Order with `status: "Rejected"` (Value: Rs. 2,000).
3. **Limbo Stuck Orders (Awaiting Action):**
   * 1 Order with `status: "Payment Verified"` (Value: Rs. 150,000).
   * 1 Order with `status: "Fraud Hold"` (Value: Rs. 250,000).
   * 1 Order with `status: "On Hold"` (Value: Rs. 100,000).
   * 1 Order with `status: "Ready to Ship"` (Value: Rs. 100,000).
   * *Total Limbo Stuck Revenue:* Rs. 600,000 across **4 Pending Orders**.

---

## 🎯 SCENARIO 1: Cancellation Leakage & Fulfillment Calibration Test
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke humara extended `$match` query aur whitelists bina kisi order status drop ke `leakageRate` aur `fulfillmentRate` bilkul accurate calculate karte hain.
* **Test Action:**
  1. Browser par `/admin/operational-intelligence` page open karein.
  2. Total Orders = `10` (`4 Delivered/Completed` + `2 Cancelled/Rejected` + `4 Limbo`).
* **Expected Assertions & Verification:**
  * [ ] **Fulfillment Rate %:** strictly **`40.0%`** (`4 Delivered / 10 Total Orders * 100`) green color badge ke saath show hoga.
  * [ ] **Leakage Rate %:** strictly **`20.0%`** (`2 Cancelled / 10 Total Orders * 100`) red color badge ke saath show hoga (Bug #1 completely fixed!).
  * [ ] **Status Breakdown Grid:** `OperationalStatusBreakdown` widget ke andar:
    * `Fraud Hold` Card = **1** (`25% of limbo`)
    * `On Hold` Card = **1** (`25% of limbo`)
    * `Payment Verified` Card = **1** (`25% of limbo`)
    * `Ready to Ship` Card = **1** (`25% of limbo`)
    * Baqi zero counts wale limbo cards automatically collapsed (clean render) honge.

---

## 🎯 SCENARIO 2: Limbo Revenue Threshold Alerting & Anti-Spam Lock Test
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke jab limbo revenue configuration limit ko cross kare, toh alert Slack aur email par chala jaye, aur Redis lock backup trigger ho taake redundant emails/notifications se spamming na ho.
* **Test Action:**
  1. Payload Settings (Tab 10) par limbo threshold ko **Rs. 500,000** set karein.
  2. Humara seed stuck revenue Rs. 600,000 hai, jo threshold se zyaada hai.
  3. Page ko dynamic parameters ke saath reload karein.
* **Expected Assertions & Verification:**
  * [ ] **Dashboard Warning Banner:** Red pulsing banner render hoga:  
    `"🚨 Limbo Revenue has exceeded the threshold of Rs. 500,000! Current: Rs. 600,000. Immediate action required!"`
  * [ ] **Automated Alert Log (Terminal):** Terminal logs mein verify karein:  
    `"✅ Operational Alert sent to admin@localhost (Severity: MEDIUM)"`
  * [ ] **Anti-Spam Redis Lock:** Same page ko dubara 5-10 baar refresh karein. Slack/Email par duplicate alerts block hone chahiye. Terminal par message aayega:  
    `"⏳ Operational alert recently sent. Rate limit active (15-min lock)."`

---

## 🎯 SCENARIO 3: POP Comparison Bar Scaling Test (Revenue vs. Counts)
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke Rs. 600,000 revenue aur 10 order counts same bar chart par scale collapse na karein.
* **Test Action:**
  1. Dashboard par **"Period-over-Period Comparison"** bar chart par focus karein.
* **Expected Assertions & Verification:**
  * [ ] **Y-Axis Scale Alignment:** Y-Axis scale collapse nahi hoga (Y-Axis maximum coordinate limit ~1000 tak rahegi).
  * [ ] **Scaled Revenue Bar:** Limbo Revenue (Rs. 600,000) bar chart ke andar **`600`** ki scale par render hoga (`600 kPKR` unit scale standard).
  * [ ] **Orders Bars Visibility:** Total Orders (`10`) aur Delivered (`4`) bars visual scale par visible rahengi (microscopic flat lines nahi banengi!).
  * [ ] **Custom Tooltip Hover:** Bar par hover karne se solid dark tooltip backdrop (`bg-zinc-950`) ke saath render hoga, jisme:
    * Limbo Revenue bar par exact values show hongi: `Rs. 600,000` (Current) vs `Rs. X` (Previous).
    * Orders bars par count suffix hoga: `10 Orders`.
    * Rate bars par percent suffix hoga: `40%`.

---

## 🎯 SCENARIO 4: Browser-Safe X-Axis Date Gap-Filling Test
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke Recharts timeline par koi date gap baki na rahe (unbroken continuous charts) aur Safari/mobile browsers par ticks `NaN/NaN` crash na karein.
* **Test Action:**
  1. **"30-Day Operational Trends"** area chart ko check karein.
  2. Kisi private window se Safari ya Edge browser par page open karein.
* **Expected Assertions & Verification:**
  * [ ] **Smooth Gap-Filled Tiers:** Agar 30 days mein se sirf 12 days orders ka data database mein tha, tab bhi X-Axis par poore 30 days continuous plot honge (un-upserted days auto-fill with 0 parameters).
  * [ ] **No NaN/NaN Ticks:** Dates standard `DD/MM` format mein visual axis par text-anchor end coordinates ke saath clean render hongi (e.g. `29/07`). No raw ISO string overflows.

---

## 🎯 SCENARIO 5: Manual PDF Report Generator Parameters Check
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke date strings Client se Server Action par serialize hone ke baad API routes ko crash na karein.
* **Test Action:**
  1. Hero Header ke top right par **"Download PDF Report"** button par click karein.
* **Expected Assertions & Verification:**
  * [ ] **Action Loader State:** Button text instantly change ho jayega: `"Generating..."` with `Loader2` animate-spin icon.
  * [ ] **PDF File Download:** Dynamic download trigger hoga and file save hogi as `operational-report_YYYY-MM-DD.pdf`.
  * [ ] **Success Toast Feedback:** Custom Toast overlay pop-up success message show karega: `"PDF Report downloaded successfully!"`

---

## 🎯 SCENARIO 6: COD Vault Settlement & Real-time Transition (The Fulfillment Loop)
* **Kyun check kar rahe hain:** Yeh verify karne ke liye ke order detail view se `paymentStatus` update hone par instant cash transition (COD Vault ➔ Bank realized cash) trace hoti hai.
* **Test Action:**
  1. Recent Limbo Table mein se kisi un-fulfilled COD order (e.g. Rs. 15,000) ke **"Fulfill"** link click karke order detail page par jayein.
  2. Order Status update panel se `paymentStatus` ko **"Paid"** toggle karein aur save karein.
* **Expected Assertions & Verification:**
  * [ ] **DB Order State:** Order model mein `paymentStatus` field `"Paid"` update ho jayega.
  * [ ] **CRM Telemetry & Redis Cache Purge:** System automatics telemetry log generate karega aur Redis cache `analytics_executive:*` aur `analytics_operational:*` ko instantaneous purge kar dega.
  * [ ] **Cash-Flow Shift (Executive Dashboard):** Dubara main `/admin` dashboard par aayein. Rs. 15,000 cash **Courier COD Vault** card se minus hokar **Realized Cash (Bank)** card mein directly add ho jayega!

---

### 🏁 PRODUCTION READY CHECKLIST:
* [ ] Compile build pass `npm run build` (Type safety verified)
* [ ] Redis Cache stampede locks tested with LUA releases
* [ ] No unhandled parameters or TS warning logs in dev console

Aap is testing sheet ko execute karein. Jab aap ready hon, mujhe agla signal dein to start **Module 6: Behavioral Intelligence Subsystem**! 🚀