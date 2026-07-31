// src/lib/reports/operationalPdf.tsx
// ✅ IMPORTANT: This file must be .tsx because it contains JSX (React components)

import React from "react";
import { Page, Document, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

// ✅ Import all sub-components
import { OperationalReportHeader } from "./operational/components/OperationalReportHeader";
import { OperationalReportMetrics } from "./operational/components/OperationalReportMetrics";
import { OperationalReportStatusBreakdown } from "./operational/components/OperationalReportStatusBreakdown";
import { OperationalReportComparison } from "./operational/components/OperationalReportComparison";
import { OperationalReportFooter } from "./operational/components/OperationalReportFooter";

// ================================================================
// 🖋️ FONT REGISTRATION (Single Source of Truth)
// ================================================================
const registerFonts = (() => {
  let isRegistered = false;
  return () => {
    if (!isRegistered) {
      const getFontPath = (fontFile: string) => {
        return path.join(process.cwd(), "public", "fonts", fontFile);
      };

      Font.register({
        family: "Inter",
        fonts: [
          { src: getFontPath("Inter-Regular.otf") },
          { src: getFontPath("Inter-Bold.otf"), fontWeight: "bold" },
        ],
      });
      isRegistered = true;
    }
  };
})();

// ================================================================
// 🎨 GLOBAL STYLES (Consistent with Invoice System)
// ================================================================
const BG_GRAY = "#f9fafb";
const BORDER_GRAY = "#e5e7eb";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6b7280";

export const reportStyles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    padding: 40,
    color: TEXT_DARK,
    backgroundColor: "#ffffff",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BG_GRAY,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCol: {
    fontSize: 8,
    fontWeight: "bold",
    color: TEXT_MUTED,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableCol: {
    fontSize: 9,
    color: TEXT_DARK,
  },
  tableColRight: {
    fontSize: 9,
    color: TEXT_DARK,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
  verificationNote: {
    marginTop: 4,
    fontSize: 7,
    color: "#d1d5db",
  },
});

// ================================================================
// 📝 INTERFACE (Props for the template)
// ================================================================
export interface OperationalReportData {
  range: {
    from: Date;
    to: Date;
  };
  metrics: {
    totalOrders: number;
    deliveredCount: number;
    cancelledCount: number;
    limboRevenue: number;
    pendingCount: number;
    fulfillmentRate: number;
    leakageRate: number;
  };
  statusBreakdown: Record<string, number>;
  comparisonData?: {
    range: {
      current: { from: Date; to: Date };
      previous: { from: Date; to: Date };
      days: number;
    };
    metrics: Record<
      string,
      {
        current: number;
        previous: number;
        change: number;
        trend: "UP" | "DOWN" | "STABLE";
      }
    >;
  };
  generatedAt: Date;
}

// ================================================================
// 🚀 MAIN TEMPLATE
// ================================================================
registerFonts();

export const OperationalReportTemplate = ({ data }: { data: OperationalReportData }) => {
  // ✅ Check if comparison data exists
  const hasComparison = data.comparisonData && Object.keys(data.comparisonData.metrics).length > 0;
  const hasStatusBreakdown = data.statusBreakdown && Object.keys(data.statusBreakdown).length > 0;

  return (
    <Document
      author="PocketValue"
      title={`Operational_Report_${new Date().toISOString().split("T")[0]}`}
      creator="PocketValue Operations Engine"
      producer="PocketValue"
      language="en"
    >
      <Page size="A4" style={reportStyles.page}>
        {/* 1. Header */}
        <OperationalReportHeader
          range={data.range}
          generatedAt={data.generatedAt}
          styles={reportStyles}
        />

        {/* 2. Metrics Summary */}
        <OperationalReportMetrics metrics={data.metrics} styles={reportStyles} />

        {/* 3. Status Breakdown (Conditional) */}
        {hasStatusBreakdown && (
          <OperationalReportStatusBreakdown
            statusBreakdown={data.statusBreakdown}
            styles={reportStyles}
          />
        )}

        {/* 4. Comparison (Conditional) */}
        {hasComparison && (
          <OperationalReportComparison
            comparisonData={data.comparisonData}
            styles={reportStyles}
          />
        )}

        {/* 5. Footer */}
        <OperationalReportFooter styles={reportStyles} />
      </Page>
    </Document>
  );
};