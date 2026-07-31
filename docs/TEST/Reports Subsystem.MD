Aap ka yeh decision bohot behtareen hai. Ek serious enterprise software ko production par bhejne se pehle **"Zero-State" se manual aur automated browser testing** karna hi data inconsistency ko pakadne ka waheed tareeqa hai.

Niche hum ne Reports Module ka ek **Complete, Step-by-Step E2E Browser Testing Protocol** design kiya hai. Is plan ko follow karke aap system ko bilkul "0" se test kar sakte hain aur har ek field ki data accuracy ko live catch kar sakte hain.

---

# 🛡️ Reports Subsystem: End-to-End Browser Testing Protocol

Yeh test plan 4 distinct phases mein divided hai taake pure flow ki calibration, aggregation math, filters, aur file exports ko cover kiya ja sake.

```
  Phase 1: Seed Calibration  ──>  Phase 2: HUD Reconciliation  ──>  Phase 3: Filters & Charts  ──>  Phase 4: Exporter Audit
  (Manual Test Orders)             (Match Metrics to the Cent)        (Date/Search/Toggles)            (Excel / PDF Print)
```

---

## Phase 1: Database Baseline Calibration (Creating the Test Cases)

Sab se pehle, baseline math verify karne ke liye aap ko system mein **3 distinct test orders** generate karne honge jin ki values aap ko pehle se pata hon.

### 📋 Test Case Order Setup:
Mongoose Database (Cluster A) ya checkout pipeline ke through ye **3 exact orders** banayein:

1. **Order A (Paid & Delivered COD - Revenue Order):**
   * **Order ID:** `PV-1001`
   * **Status:** `Delivered` | **Payment Status:** `Paid` | **Payment Method:** `COD`
   * **Items:** 1 unit of Product X (Price: **Rs. 10,000** | Quantity: 1)
   * **Enriched Snapshots in DB:** 
     * `capital` (COGS): **Rs. 6,000** | `profit`: **Rs. 2,000** | `fees`: **Rs. 300** | `tax`: **Rs. 1,500** | `shippingCost`: **Rs. 350**
     * `appliedGstRate`: **15%** | `appliedFeeRate`: **3%** | `appliedRtoRate`: **10%** | `appliedDutiesRate`: **5%**
2. **Order B (RTO Returned - Loss Order):**
   * **Order ID:** `PV-1002`
   * **Status:** `RTO` | **Payment Status:** `Unpaid` | **Payment Method:** `COD`
   * **Items:** 1 unit of Product Y (Price: **Rs. 5,000** | Quantity: 1)
   * **Shipping Cost:** **Rs. 350**
3. **Order C (Cancelled Order - Terminal State):**
   * **Order ID:** `PV-1003`
   * **Status:** `Cancelled` | **Payment Status:** `Unpaid` | **Payment Method:** `COD`
   * **Items:** 1 unit of Product Z (Price: **Rs. 3,000** | Quantity: 1)

---

## Phase 2: Dynamic HUD & Reports Reconciliation

Database seed karne ke baad, browser open karein aur admin panel par login karke niche di gayi cheezon ko verify karein. **Agar ek bhi value match na ho, toh data inconsistency yahin pakdi jayegi:**

### 1. Executive Dashboard Audit (`/admin`)
* **Gross Revenue Card:** **Rs. 10,000** hona chahiye. (Order B [RTO] aur Order C [Cancelled] ki Rs. 8,000 revenue isme shamil **nahi** honi chahiye).
* **Delivered Cash Card:** **Rs. 10,000** hona chahiye.
* **Courier COD Vault Card:** **Rs. 0** hona chahiye (Kyunki Order B RTO ho chuka hai aur Order A paid hai).
* **Net Profit Estimate Card:** **Rs. 1,000** hona chahiye:
  $$\text{Net Profit} = \text{Order A Profit (2,000)} - \text{Order B RTO Loss (Rs. 350 } \times \text{ 2 Penalty = 700)} - \text{Order A RTO Reserve (10,000 } \times \text{ 10\% = 1000)} - \text{Discounts (0)} = \text{Rs. 300}$$

### 2. P&L Statement Report (`/admin/reports-index/profit-loss`)
Select the exact date range of your test orders and verify:
* **Gross Sales:** `Rs. 10,000`
* **COGS (Capital):** `Rs. 6,000`
* **Gross Profit:** `Rs. 4,000` (`Net Sales - COGS`)
* **Gateway Fees:** `Rs. 300`
* **Duties:** `Rs. 300` (`Capital 6000 * 5%`)
* **Shipping Paid:** `Rs. 350`
* **Pure Profit:** `Rs. 1,000`

### 3. FBR GST Report (`/admin/reports-index/fbr-gst-sales-tax`)
* **GST Rate (%):** `15.0%` (Average rates must show decimal limits).
* **Tax Collected:** `Rs. 1,500`
* **Audit ID:** `FBR-YYYYMM-XXXX` format check karein.

### 4. Loss Analysis Report (`/admin/reports-index/refunds-rto`)
* **RTO Orders:** `1`
* **Risk Budget %:** `10.0%`
* **Shipping Penalty:** `Rs. 700` (`PV-1002 Shipping Cost 350 * 2`)
* **Grand Loss:** `Rs. 700`

### 5. Fulfillment Health Report (`/admin/reports-index/fulfillment-health`)
* **Orders:** `3`
* **Delivered:** `1`
* **Pending:** `0`
* **Cancelled:** `1`
* **Success %:** `33.3%`
* **Leakage %:** `33.3%`

---

## Phase 3: Browser UI, Filters & Charts Verification

Is phase mein hum interactive controls aur browser boundaries ko stress test karenge:

### 1. Date Range Boundaries (Timezone Check)
* **Midnight Boundary Test:** Ek test order raat 11:45 PM (PKT) par banayein. Date range filter ko "Today" par set karke check karein ke kya yeh aaj ki report mein aa raha hai ya kal par shift ho gaya hai. (Agar timezone properly set na ho, toh yeh direct UTC midnight shift ho jayega).
* **Date Range Switching:** Filter bar par last 7 days, last 30 days, aur custom ranges select karke check karein ke data tables aur charts automatic update ho rahe hain ya nahi.

### 2. Table Column Toggler & Sorting Test
* **Column Toggling:** Table Sidebar mein "Manage Columns" par jayen. Kisi column (e.g. *COGS*) ko uncheck karein. Verify karein ke kya table aur table ka grand total footer row instantly adjust ho kar us column ko gayeeb kar rahe hain ya nahi.
* **Interactive Sorting:** Table headers par click karein. Verify karein ke standard string sorting aur monetary number sorting ascending/descending order mein bina delay ke perfectly sort ho rahi hain.

### 3. Funnel & Friction Matrix Checks
* **Friction Matrix (`/admin/reports-index/product-friction`):** Product pages view karein, cart mein add karein, aur bina purchase kiye chhor dein. Verify karein ke dynamic views and drop-off percentages proper calculative percentages show kar rahi hain.

---

## Phase 4: Exporter Fidelity Audits (Excel & PDF)

Aakhri phase physical deliverables ki verification ke liye hai:

### 1. Excel (CSV) Downloader Audit
* **Column Parity Check:** Ek dynamic column (e.g. *Taxes*) ko table toggler se uncheck/hide karein, aur fir **"Excel"** button click karein. Downloaded `.csv` file open karke verify karein ke usme hidden column **gayeeb** hai ya nahi. (It must match the screen columns exactly!).
* **RFC-4180 Escaping Check:** Agar kisi product ke name mein comma `,` ya double-quotes `"` hain, toh CSV file open karke check karein ke Excel ne columns break toh nahi kiye. (Hardened exporter double quotes wrap kar ke safe cells rakhega).

### 2. PDF Print HUD Audit
* **"PDF"** button click karein. Browser ka Print Preview modal open hoga.
* **Print-Preview Inspect Check:** Verify karein ke print layout mein:
  * Filter bars, sidebars, page count controllers, and download buttons **automatic hide** ho chuke hon.
  * Sirf report ka unified title header, table rows, totals row, aur dynamic line charts visible hon.
  * Table widths layout page margin se bahar crash na ho rahi hon.

---

### 🛡️ Loophole Hunting Tip:
Jab aap browser mein test kar rahe hon, toh browser ka developer console (`F12`) hamesha open rakhein. Agar database aggregation mein koi null reference exception ya client-side parsing mismatch hoga, toh **Sentry / Console par instantly red error print ho jayega!** 

Aap is baseline testing protocol ko apply karein, system is pipeline ke tehat **100% stable aur consistent** react karega! 🚀🛡️🔒