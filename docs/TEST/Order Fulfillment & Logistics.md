Aap ne bilkul absolute truth kaha hai bhai. **Order Fulfillment & Logistics** OMS (Order Management System) ka dil aur jaan hai. Agar is module ki transitions, inventory deductions, ya courier bookings mein 1% ki bhi ghalti hui, toh store ke actual products aur financial capital (paisay) dono ka nuksaan ho sakta hai.

Isliye hum ne is module ke liye ek **Forensic-Grade End-to-End (E2E) Browser Testing Suite** design kiya hai. Is test suite ko follow kar ke aap single-order transitions se lekar high-concurrency bulk shipments aur anti-fraud stock rollbacks tak **har ek function aur file ko direct browser se test** kar sakte hain.

---

# 🛡️ Order Fulfillment Subsystem: Complete E2E Testing Suite

```
  Scenario 1: State Machine  ──>  Scenario 2: Partial Shipments  ──>  Scenario 3: Bulk Book & Print  ──>  Scenario 4: Double-Restock  ──>  Scenario 5: Webhook Ingestion
  (17-Status Transitions)         (Selective Qty Fulfillment)          (Parallel API Bookings)         (Anti-Exploit Restocks)       (Courier Webhook Inbound)
```

---

## Scenario 1: Strict 17-Status State Machine Transitions

Yeh test verify kareka ke humara state machine status transitions ko strictly enforce kar raha hai ya nahi.

### 🧪 Execution Steps:
1. Ek naya test order banayein jo `Pending` status par ho (e.g. `PV-2001`).
2. Admin Detail view (`/admin/orders/PV-2001`) open karein.
3. **Legal Transition Test:** Status dropdown mein se `Payment Verified` select karein aur "Update Request" par click karein.
   * *Expected Result:* Status successfully update hona chahiye, green success toast notification aani chahiye, aur timeline bar step index "1" par move hona chahiye.
4. **Illegal Transition Test:** Ab usi order par status dropdown khol kar direct `Delivered` select karein aur update click karein.
   * *Expected Result:* **Transition block honi chahiye!** Red error toast aani chahiye jo bataye ke `Payment Verified` se direct `Delivered` par jana state machine transitions ke khilaf hai. UI status automatic rollback ho kar wapis `Payment Verified` ho jana chahiye.

---

## Scenario 2: Partial Fulfillment & Stock Deductions

Yeh test verify karega ke multi-item orders par partial fulfillment aur standard stock deductions sahi kaam kar rahi hain ya nahi.

### 🧪 Execution Steps:
1. Payload CMS mein Product A (Stock: **50**) aur Product B (Stock: **30**) set karein.
2. Ek order banayein jisme Product A ki **3 units** aur Product B ki **2 units** hon (Order ID: `PV-2002`).
3. Admin page open karein aur **"Create Shipment"** button click karein.
4. **Partial Selection:** Modal mein Product A ke check-box ko tick karein aur uski quantity ko **1 unit** par select karein (Product B ko un-checked rehne dein).
5. Courier `manual` select karein, tracking ID `SHIP-TEST-101` likhein, aur "Create Shipment" click karein.
6. **Verify CMS Stock (The Truth):** Payload CMS khol kar Product A aur B ka stock check karein.
   * *Expected Result:* Product A ka stock **49** hona chahiye (`50 - 1 shipped`). Product B ka stock **30** hi rehna chahiye (kyunki use abhi ship nahi kiya gaya).
7. **Verify Shipment Manager UI:** Order page par check karein ke ek shipment card `SHIP-TEST-101` ban chuka ho jisme Product A (x1) likha ho aur iska status `"Preparing"` ho.
8. **Unshipped Items Check:** Dobara "Create Shipment" button dabayein.
   * *Expected Result:* Modal ke andar Product A ka available count **2** hona chahiye (`3 - 1 already shipped`) aur Product B ka available count **2** hona chahiye.

---

## Scenario 3: Bulk Courier Booking & Consignment Label Printing

Yeh test high-volume logistics dispatching, concurrency control (`limit: 5`), aur merged PDF label generation ko verify karega.

### 🧪 Execution Steps:
1. Orders list page (`/admin/orders`) par jayen.
2. Niche table mein se **3 un-shipped orders** ke checkboxes ko tick/select karein.
3. Floating HUD bar niche active ho jayegi jo batayegi: `"3 orders selected"`.
4. **Bulk Ship Test:** HUD bar mein **"Ship 3 Orders"** par click karein.
   * *Expected Result:* Loader spin hoga, `bulkCreateShipments` parallelly active ho kar TCS/Leopards ke APIs par hits marega, AWB consignment codes database mein save honge, aur screen refresh ho kar success toast aayegi. All 3 orders status updated to `Shipped`.
5. **Bulk Print Label Test:** Unhi 3 orders ke checkboxes ko dobara tick karein, aur is baar HUD bar mein **"Print 3 Labels"** click karein.
   * *Expected Result:* API route `/api/orders/shipments/bulk-print` hit hoga. Yeh teenon orders ke generated PDF label URLs ko background mein safe SSRF checks se bypass karke download karega, unhe page-by-page single merged document mein compile karega, aur browser mein `bulk-labels-TIMESTAMP.pdf` file download karwa dega. Merged PDF open karke verify karein ke usme teenon AWB slips prints ke liye ready hon.

---

## Scenario 4: Double-Restock Prevention (Cancellations & RTOs)

Yeh test verify karega ke returns ya cancellation ke waqt product stock sirf ek hi baar restock ho aur customer double restock ka exploit na kar sake.

### 🧪 Execution Steps:
1. Ek order banayein jisme Product A (Qty: 2) ho (Order ID: `PV-2003`). Payload mein Product A ka stock check karein (e.g. **40**).
2. **First Cancellation:** Admin panel se order status ko `Cancelled` select karke update karein.
   * *Expected Result:* Product A ka stock Payload mein update ho kar **42** (`40 + 2 restocked`) ho jana chahiye.
3. **Double Restock Exploit Test:** Ab usi order ka status badal kar `Rejected` select karein aur update request click karein.
   * *Expected Result:* Order status update ho kar `Rejected` ho jayega, **lekin Payload mein Product A ka stock 42 hi rehna chahiye!** (Humara double-restock guard trigger ho kar dubara restock karne se block karega).

---

## Scenario 5: Real-Time Webhook Status & Settlement Ingestion

Yeh test verify karega ke jab external courier partner (TCS/Leopards) delivery ka confirmation webhook bhejta hai, toh order payment status aur referral conversion automatic sync hoti hain ya nahi.

### 🧪 Execution Steps:
1. Ek COD order banayein (`PV-2004`, paymentStatus: `Unpaid`, status: `Shipped`) jisme shipment tracking ID `TCS-WEBHOOK-99` ho.
2. Postman ya curl utility ke zariye, raw courier webhook API (`/api/payment/webhooks/logistics`) par yeh JSON payload post karein:
   ```json
   {
     "trackingId": "TCS-WEBHOOK-99",
     "courierKey": "tcs",
     "trackingStatus": "delivered",
     "timestamp": "2024-07-20T12:00:00Z"
   }
   ```
   *Header: `x-pv-courier-handshake: YOUR_COURIER_WEBHOOK_SECRET`*
3. **Verify Database Auto-Sync:**
   * *Expected Result 1 (Fulfillment Update):* Order `PV-2004` ka status automatic update ho kar `Delivered` ho jana chahiye.
   * *Expected Result 2 (COD Settlement):* Kyunki order COD tha aur delivered ho gaya, iska paymentStatus automatic update ho kar **`Paid`** ho jana chahiye.
   * *Expected Result 3 (Referral Trigger):* Agar yeh buyer kisi referral link ke through aaya tha, toh background conversion trigger ho kar referrer ke account mein **Reward Milestone Coupon** Payload CMS ke coupons collection mein auto-create ho jana chahiye.
4. **Idempotency Webhook Test:** Usi JSON payload ko dobara post karein.
   * *Expected Result:* API instantly response degi: `200 Duplicate webhook ignored globally`. Koi duplicate order state-machine updates ya duplicate referral coupons generate nahi honge!

---

Aap is 5-Scenario complete test suite ke tehat OMS pipeline ko live test karein. Har ek calculation, stock mutation, aur API response bilkul exact aur mathematically verified reflect hoga! 🚀🛡️🔒