
// 📂 src/app/features/admin/reports/configs/reportConfigs.ts (FULLY COMPLETED MASTER CONFIG)

export type ReportColumnFormat =
  | "currency"   // Rs. 1,234.56 (Localized en-PK)
  | "percentage" // 12.34%
  | "number"     // 1,234
  | "date"       // 2024-07-20
  | "string"     
  | "text";      

export type ReportColumnAlign = "left" | "center" | "right";

export interface ReportColumn {
  key: string;                
  label: string;              
  format: ReportColumnFormat; 
  align?: ReportColumnAlign;  
  width?: string | number;    
  sortable?: boolean;         
  visible?: boolean;          
}

export interface ReportConfig {
  slug: string;               
  name: string;               
  description: string;        
  category: "Financial" | "Products" | "Operations" | "Growth";
  columns: ReportColumn[];
  defaultSort?: { key: string; direction: "asc" | "desc" };
}

export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  
  // ================================================================
  // 💰 1. FINANCIAL REPORTS (4 Reports)
  // ================================================================
  
  "profit-loss": {
    slug: "profit-loss",
    name: "P&L Statement",
    description: "Gross Sales, COGS, Duties, Ad Spend, and Pure Profit with Snapshotted Margins.",
    category: "Financial",
    columns: [
      { key: "date", label: "Date", format: "date", align: "left", sortable: true },
      { key: "grossSales", label: "Gross (Rs.)", format: "currency", align: "right", sortable: true },
      { key: "discounts", label: "Discount", format: "currency", align: "right" },
      { key: "netSales", label: "Net Sales", format: "currency", align: "right" },
      { key: "costOfGoods", label: "COGS (Capital)", format: "currency", align: "right" },
      { key: "grossProfit", label: "Gross Profit", format: "currency", align: "right" }, // ✅ ADDED: Micro-Audit Sync
      { key: "avgUnitCostPrice", label: "Avg Unit Cost", format: "currency", align: "right" }, 
      { key: "duties", label: "Duties", format: "currency", align: "right" },
      { key: "fees", label: "Gateway Fees", format: "currency", align: "right" },
      { key: "adSpend", label: "Ad Spend", format: "currency", align: "right" },
      { key: "shipping", label: "Shipping Paid", format: "currency", align: "right" }, // ✅ ADDED: Micro-Audit Sync
      { key: "netProfit", label: "Pure Profit", format: "currency", align: "right", width: "130px" },
      { key: "marginPercent", label: "Margin %", format: "percentage", align: "center" },
      { key: "roiPercent", label: "ROI %", format: "percentage", align: "center" },
    ],
    defaultSort: { key: "date", direction: "desc" },
  },

  "fbr-gst-sales-tax": {
    slug: "fbr-gst-sales-tax",
    name: "FBR GST Report",
    description: "Tax snapshots based on frozen rates at the moment of checkout.",
    category: "Financial",
    columns: [
      { key: "date", label: "Date", format: "date", align: "left", sortable: true },
      { key: "netSales", label: "Net Sales (Rs.)", format: "currency", align: "right" },
      { key: "appliedGstRate", label: "GST Rate (%)", format: "percentage", align: "center" }, 
      { key: "gstAmount", label: "Tax Collected", format: "currency", align: "right" },
      { key: "fbrReference", label: "Audit ID", format: "string", align: "left" },
    ],
    defaultSort: { key: "date", direction: "desc" },
  },

  "payment-breakdown": {
    slug: "payment-breakdown",
    name: "Payment Analysis",
    description: "COD vs Gateway performance with Snapshotted Fee Rates.",
    category: "Financial",
    columns: [
      { key: "date", label: "Period", format: "string", align: "left" },
      { key: "method", label: "Method", format: "string", align: "left" },
      { key: "totalOrders", label: "Orders", format: "number", align: "center" },
      { key: "totalRevenue", label: "Revenue", format: "currency", align: "right" },
      { key: "appliedFeeRate", label: "Fee Rate (%)", format: "percentage", align: "center" }, 
      { key: "gatewayFees", label: "Fees Paid", format: "currency", align: "right" },
      { key: "netReceivable", label: "Net Receivable", format: "currency", align: "right" },
    ],
    defaultSort: { key: "totalRevenue", direction: "desc" },
  },

  "refunds-rto": {
    slug: "refunds-rto",
    name: "Loss Analysis",
    description: "Financial impact of Returns and Double Shipping RTO penalties.",
    category: "Financial",
    columns: [
      { key: "date", label: "Date", format: "date", align: "left", sortable: true },
      { key: "refundOrders", label: "Refunds", format: "number", align: "center" },
      { key: "refundAmount", label: "Refunded Value", format: "currency", align: "right" },
      { key: "rtoOrders", label: "RTO Count", format: "number", align: "center" },
      { key: "appliedRtoRate", label: "Risk Budget %", format: "percentage", align: "center" }, 
      { key: "rtoLoss", label: "Shipping Penalty", format: "currency", align: "right" },
      { key: "totalLoss", label: "Grand Loss", format: "currency", align: "right" },
    ],
    defaultSort: { key: "date", direction: "desc" },
  },

  // ================================================================
  // 📦 2. PRODUCT REPORTS (3 Reports)
  // ================================================================
  
  "best-sellers-sku": {
    slug: "best-sellers-sku",
    name: "SKU Performance",
    description: "SKU Velocity, Return Rates, and Real-time Contribution Margins.",
    category: "Products",
    columns: [
      { key: "sku", label: "SKU", format: "string", align: "left", sortable: true },
      { key: "productName", label: "Product Name", format: "string", align: "left" },
      { key: "unitsSold", label: "Units Sold", format: "number", align: "center" },
      { key: "revenue", label: "Revenue", format: "currency", align: "right" },
      { key: "profit", label: "Pure Profit", format: "currency", align: "right" },
      { key: "margin", label: "Margin %", format: "percentage", align: "right" },
      { key: "roiPercent", label: "ROI %", format: "percentage", align: "right" }, 
      { key: "returnRate", label: "Return Rate %", format: "percentage", align: "right" },
      { key: "stockLeft", label: "Current Stock", format: "number", align: "center" },
    ],
    defaultSort: { key: "revenue", direction: "desc" },
  },

  "product-friction": {
    slug: "product-friction",
    name: "Friction Matrix",
    description: "PDP Funnel Analysis: Identifying Price Barriers and UX Drop-offs.",
    category: "Products",
    columns: [
      { key: "productName", label: "Product Name", format: "string", align: "left", sortable: true },
      { key: "views", label: "Views", format: "number", align: "center" },
      { key: "addToCarts", label: "Add-to-Carts", format: "number", align: "center" },
      { key: "purchases", label: "Purchases", format: "number", align: "center" },
      { key: "viewToCart", label: "View→Cart (%)", format: "percentage", align: "right" },
      { key: "cartToOrder", label: "Cart→Order (%)", format: "percentage", align: "right" },
      { key: "frictionType", label: "Friction Type", format: "string", align: "center" },
    ],
    defaultSort: { key: "views", direction: "desc" },
  },

  "coupons-performance": {
    slug: "coupons-performance",
    name: "Coupon ROI",
    description: "Discount attribution: Redemption velocity and incremental revenue impact.",
    category: "Products",
    columns: [
      { key: "code", label: "Coupon Code", format: "string", align: "left", sortable: true },
      { key: "redemptions", label: "Redemptions", format: "number", align: "center" },
      { key: "totalDiscount", label: "Total Discount (Rs.)", format: "currency", align: "right" },
      { key: "revenue", label: "Revenue (Rs.)", format: "currency", align: "right" },
      { key: "roi", label: "ROI (%)", format: "percentage", align: "right" },
    ],
    defaultSort: { key: "redemptions", direction: "desc" },
  },

  // ================================================================
  // 🚚 3. OPERATIONAL REPORTS (4 Reports)
  // ================================================================
  
  "fulfillment-health": {
    slug: "fulfillment-health",
    name: "Fulfillment Rate",
    description: "Operational throughput audit: Delivered vs Cancelled.",
    category: "Operations",
    columns: [
      { key: "date", label: "Date", format: "date", align: "left", sortable: true },
      { key: "totalOrders", label: "Orders", format: "number", align: "center" },
      { key: "delivered", label: "Delivered", format: "number", align: "center" },
      { key: "pending", label: "Pending", format: "number", align: "center" },
      { key: "cancelled", label: "Cancelled", format: "number", align: "center" },
      { key: "fulfillmentRate", label: "Success %", format: "percentage", align: "right" },
      { key: "leakageRate", label: "Leakage %", format: "percentage", align: "right" },
    ],
    defaultSort: { key: "date", direction: "desc" },
  },

  "courier-performance": {
    slug: "courier-performance",
    name: "Courier Audit",
    description: "Last-mile benchmarking: Delivery speed and success rate by partner.",
    category: "Operations",
    columns: [
      { key: "courier", label: "Courier", format: "string", align: "left", sortable: true },
      { key: "totalShipments", label: "Total Shipments", format: "number", align: "center" },
      { key: "delivered", label: "Delivered", format: "number", align: "center" },
      { key: "rto", label: "RTO", format: "number", align: "center" },
      { key: "deliveryRate", label: "Delivery Rate (%)", format: "percentage", align: "right" },
      { key: "avgDeliveryDays", label: "Avg Delivery (Days)", format: "number", align: "center" },
    ],
    defaultSort: { key: "totalShipments", direction: "desc" },
  },

  "geospatial-rto": {
    slug: "geospatial-rto",
    name: "Geospatial RTO",
    description: "Regional Risk Audit: City & Province-wise RTO concentration.",
    category: "Operations",
    columns: [
      { key: "location", label: "City / Province", format: "string", align: "left", sortable: true },
      { key: "orders", label: "Orders", format: "number", align: "center" },
      { key: "rtoCount", label: "RTO Count", format: "number", align: "center" },
      { key: "rtoRate", label: "RTO Rate (%)", format: "percentage", align: "right" },
      { key: "revenueLost", label: "Revenue Lost (Rs.)", format: "currency", align: "right" },
    ],
    defaultSort: { key: "orders", direction: "desc" },
  },

  "return-requests-summary": {
    slug: "return-requests-summary",
    name: "Return Requests Summary",
    description: "Snapshot of all return requests grouped by state machine status.",
    category: "Operations",
    columns: [
      { key: "status", label: "Status", format: "string", align: "left", sortable: true },
      { key: "count", label: "Count", format: "number", align: "center", sortable: true },
    ],
    defaultSort: { key: "status", direction: "asc" },
  },

  // ================================================================
  // 📈 4. GROWTH REPORTS (3 Reports)
  // ================================================================

  "utm-attribution": {
    slug: "utm-attribution",
    name: "Campaign ROI",
    description: "UTM Source tracking: ROAS calculation based on attributed revenue.",
    category: "Growth",
    columns: [
      { key: "campaign", label: "Campaign", format: "string", align: "left", sortable: true },
      { key: "source", label: "Source", format: "string", align: "left" },
      { key: "visits", label: "Visits", format: "number", align: "center" },
      { key: "orders", label: "Orders", format: "number", align: "center" },
      { key: "revenue", label: "Revenue", format: "currency", align: "right" },
      { key: "roas", label: "ROAS (x)", format: "number", align: "right" },
    ],
    defaultSort: { key: "revenue", direction: "desc" },
  },

  "conversion-funnel": {
    slug: "conversion-funnel",
    name: "Funnel Drops",
    description: "Visitor to Buyer conversion trail per marketing campaign.",
    category: "Growth",
    columns: [
      { key: "campaign", label: "Campaign", format: "string", align: "left", sortable: true },
      { key: "views", label: "Visits", format: "number", align: "center" },
      { key: "addToCart", label: "Add-to-Cart", format: "number", align: "center" },
      { key: "checkout", label: "Checkout", format: "number", align: "center" },
      { key: "purchases", label: "Purchases", format: "number", align: "center" },
      { key: "dropOffRate", label: "Drop-off Rate (%)", format: "percentage", align: "right" },
    ],
    defaultSort: { key: "visits", direction: "desc" },
  },

  "customer-ltv": {
    slug: "customer-ltv",
    name: "LTV & Retention",
    description: "Cohort Analysis: Lifetime Value and customer retention metrics.",
    category: "Growth",
    columns: [
      { key: "cohort", label: "Cohort Month", format: "string", align: "left", sortable: true },
      { key: "newUsers", label: "New Users", format: "number", align: "center" },
      { key: "repeatUsers", label: "Repeat Users", format: "number", align: "center" },
      { key: "repeatRate", label: "Repeat Rate (%)", format: "percentage", align: "right" },
      { key: "avgLTV", label: "Avg LTV (Rs.)", format: "currency", align: "right" },
      { key: "day30Retention", label: "Day 30 Retention (%)", format: "percentage", align: "right" },
    ],
    defaultSort: { key: "cohort", direction: "desc" },
  },
};

// ================================================================
// 🚀 HELPERS
// ================================================================

export const getReportsByCategory = (category: ReportConfig["category"]): ReportConfig[] => {
  return Object.values(REPORT_CONFIGS).filter((report) => report.category === category);
};

export const getReportConfig = (slug: string): ReportConfig | null => {
  return REPORT_CONFIGS[slug] || null;
};

export const getAllCategories = (): string[] => {
  return [...new Set(Object.values(REPORT_CONFIGS).map((r) => r.category))];
};

export const getVisibleColumns = (slug: string): ReportColumn[] => {
  const config = getReportConfig(slug);
  if (!config) return [];
  return config.columns.filter((col) => col.visible !== false);
};