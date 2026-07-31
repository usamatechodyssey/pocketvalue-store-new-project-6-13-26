// // src/app/shared/constants/analytics.ts

// /**
//  * ✅ SINGLE SOURCE OF TRUTH: Revenue Statuses
//  *

export const REVENUE_STATUSES = [
    "Delivered",
    "Completed",
    "Shipped",
    "In Transit",
    "Payment Verified",
    "Processing",
    "Ready to Ship",
  ] as const;
  
  /**
   * ✅ SINGLE SOURCE OF TRUTH: Limbo Statuses (Awaiting Action)
   * 
   * Ye wo orders hain jin par kisi human/system ko next action karna hai.
   * Enterprise OMS ke mutabiq 10 statuses cover karte hain.
   */
  export const LIMBO_STATUSES = [
    "Pending",
    "Payment Verified",
    "Processing",
    "Ready to Ship",
    "RTO",
    "Return Requested",
    "Return Approved",
    "Refund Initiated",
    "On Hold",
    "Fraud Hold",
  ] as const;
  
  export type LimboStatus = typeof LIMBO_STATUSES[number];
  
  /**
   * ✅ SINGLE SOURCE OF TRUTH: Trend Filters (Product Intelligence)
   */
  export const TREND_FILTERS = [
    { label: "All Trends", value: "" },
    { label: "⭐ Rising Stars", value: "STAR" },
    { label: "📉 Falling Stars", value: "FALLING" },
    { label: "🚫 Out of Stock", value: "OOS" },
  ] as const;
  
  export type TrendFilterValue = (typeof TREND_FILTERS)[number]["value"];