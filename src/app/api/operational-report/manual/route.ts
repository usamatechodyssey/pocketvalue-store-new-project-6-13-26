// src/app/api/admin/operational-report/manual/route.ts

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import ReactPDF from "@react-pdf/renderer";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";

// ✅ Auth & DB
import { verifyStaff } from "@/lib/payloadAuth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";

// ✅ Actions
import { getOperationalIntelligencePayload } from "@/app/features/admin/operational-intelligence/actions/getOperationalIntelligence";
import { getOperationalComparisonPayload } from "@/app/features/admin/operational-intelligence/actions/getOperationalComparison";

// ✅ PDF Template
import {
  OperationalReportTemplate,
  OperationalReportData,
} from "@/lib/reports/operationalPdf";

// ================================================================
// 🔨 HELPER: Stream to Buffer (Vercel/NextResponse compatibility)
// ================================================================
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// ================================================================
// 🚀 MAIN HANDLER
// ================================================================
export async function GET(req: NextRequest) {
  try {
    // 🛡️ 1. RBAC Check (Sirf Admin/Manager)
    await verifyStaff(["admin", "manager"]);

    // 🔌 2. Database Connection
    await connectMongoose();

    // 📅 3. Parse Date Range from Query Params
    const searchParams = req.nextUrl.searchParams;
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    if (!fromStr || !toStr) {
      return NextResponse.json(
        { error: "Missing required parameters: from, to" },
        { status: 400 }
      );
    }

    const from = startOfDay(parseISO(fromStr));
    const to = endOfDay(parseISO(toStr));

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const range = { from, to };

    // 📊 4. Fetch Data in Parallel
    const [operationalData, comparisonData] = await Promise.all([
      getOperationalIntelligencePayload(range),
      getOperationalComparisonPayload(range),
    ]);

    // ✅ 5. Prepare Report Data
    const reportData: OperationalReportData = {
      range: {
        from,
        to,
      },
      metrics: {
        totalOrders: operationalData.totalOrders || 0,
        deliveredCount: operationalData.deliveredCount || 0,
        cancelledCount: operationalData.cancelledCount || 0,
        limboRevenue: operationalData.limboRevenue || 0,
        pendingCount: operationalData.pendingCount || 0,
        fulfillmentRate: operationalData.fulfillmentRate || 0,
        leakageRate: operationalData.leakageRate || 0,
      },
      statusBreakdown: operationalData.statusBreakdown || {},
      comparisonData: comparisonData || undefined,
      generatedAt: new Date(),
    };

    // 📄 6. Generate PDF
    const documentElement = React.createElement(OperationalReportTemplate, {
      data: reportData,
    });

    // ✅ ReactPDF.renderToStream expects React element, and we handle it safely
    // Using type assertion to avoid complex type conflicts with server components
    const pdfStream = await ReactPDF.renderToStream(documentElement as any);

    // 🔄 7. Convert Stream to Buffer
    const pdfBuffer = await streamToBuffer(pdfStream);

    // ✅ 8. Convert to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // 📥 9. Return PDF Response
    const fileName = `operational_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;

    return new NextResponse(pdfUint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("❌ PDF Report Generation Failed:", error);

    // 🛡️ Handle specific errors
    if (error.message?.includes("Unauthorized") || error.message?.includes("verifyStaff")) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate operational report.",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}