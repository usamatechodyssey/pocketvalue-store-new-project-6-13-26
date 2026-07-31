// 📂 src/app/features/admin/reports/actions/getDetailedReportData.ts

"use server";

import { getFinancesReportData } from "./getFinancesReportData";
import { getSalesReportData } from "./getSalesReportData";
import { getOperationalReportData } from "./getOperationalReportData";
import { getAcquisitionReportData } from "./getAcquisitionReportData";
import { getCustomerReportData } from "./getCustomerReportData";
import { getRefundsRtoReportData } from "./getRefundsRtoReportData";
import { getReturnRequestsSummaryData } from "./getReturnRequestsSummaryData";
import { verifyStaff } from "@/lib/payloadAuth";

// ================================================================
// ✅ TYPES
// ================================================================
export type ReportSlug =
  | "profit-loss"
  | "fbr-gst-sales-tax"
  | "payment-breakdown"
  | "refunds-rto"
  | "best-sellers-sku"
  | "product-friction"
  | "coupons-performance"
  | "fulfillment-health"
  | "courier-performance"
  | "geospatial-rto"
  | "utm-attribution"
  | "conversion-funnel"
  | "customer-ltv"
  | "return-requests-summary";

export interface ReportRange {
  startDate: Date;
  endDate: Date;
}

// ================================================================
// 🚀 MASTER DISPATCHER — Routes slug to the correct report action
// ================================================================
export async function getDetailedReportData(
  range: ReportRange,
  slug: ReportSlug
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // ✅ 1. Security: Added Top-Level Guard for Double-Layer Protection
    await verifyStaff(["admin", "manager", "editor"]);

    // ================================================================
    // 1. FINANCIAL REPORTS
    // ================================================================
    if (
      slug === "profit-loss" ||
      slug === "fbr-gst-sales-tax" ||
      slug === "payment-breakdown"
    ) {
      return await getFinancesReportData(range, slug);
    }

    // ================================================================
    // 2. SALES / PRODUCT REPORTS
    // ================================================================
    if (
      slug === "best-sellers-sku" ||
      slug === "product-friction" ||
      slug === "coupons-performance"
    ) {
      return await getSalesReportData(range, slug);
    }

    // ================================================================
    // 3. OPERATIONAL REPORTS
    // ================================================================
    if (
      slug === "fulfillment-health" ||
      slug === "courier-performance" ||
      slug === "geospatial-rto"
    ) {
      return await getOperationalReportData(range, slug);
    }

    // ================================================================
    // 4. ACQUISITION REPORTS (UTM & Funnel)
    // ================================================================
    if (slug === "utm-attribution" || slug === "conversion-funnel") {
      return await getAcquisitionReportData(range, slug);
    }

    // ================================================================
    // 5. CUSTOMER LTV & RETENTION
    // ================================================================
    if (slug === "customer-ltv") {
      return await getCustomerReportData(range, slug);
    }

    // ================================================================
    // 6. REFUNDS & RTO (Financial Impact)
    // ================================================================
    if (slug === "refunds-rto") {
      return await getRefundsRtoReportData(range);
    }

    // ================================================================
    // 7. RETURN REQUESTS SUMMARY (Operational Snapshot)
    // ================================================================
    if (slug === "return-requests-summary") {
      return await getReturnRequestsSummaryData(range);
    }

    // ================================================================
    // 8. DEFAULT: Unhandled slug
    // ================================================================
    return {
      success: false,
      error: `Report "${slug}" is not recognized by the master dispatcher.`,
    };
  } catch (error: any) {
    console.error(`❌ Detailed Report Dispatcher Error (${slug}):`, error.message);
    return {
      success: false,
      error: error.message || "Failed to dispatch report request.",
    };
  }
}