// 📂 src/app/api/admin/segments/export/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSegmentQuery } from "@/app/features/admin/loyalty-intelligence/actions/getSegmentQuery";
import { verifyStaff } from "@/lib/payloadAuth";
import Papa from "papaparse";

// ================================================================
// 🚀 POST: Export Segment Results to CSV (50k Max Memory Guard)
// ================================================================
export async function POST(req: NextRequest) {
  try {
    // 1. Security: Only staff can export
    await verifyStaff(["admin", "manager", "editor"]);

    // 2. Parse Request Body
    const body = await req.json();
    const { filters, limit = 1000, skip = 0 } = body;

    // 3. Validate Input
    if (!filters) {
      return NextResponse.json(
        { success: false, error: "Missing filters in request body." },
        { status: 400 }
      );
    }

    // 4. Enforce Safety Limits (Prevent Vercel OOM / Timeout)
    const MAX_LIMIT = 50000; // ✅ Max 50k records per export batch
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
    const safeSkip = Math.max(0, Math.floor(skip));

    // 5. Calculate Page for Aggregation Pipeline
    const page = Math.floor(safeSkip / safeLimit) + 1;
    const queryLimit = safeLimit;

    // 6. Execute Segment Query (Includes user data)
    const result = await getSegmentQuery(filters, page, queryLimit, true);

    // 7. Map to CSV-friendly format (With en-PK Localizations)
    const csvData = result.users.map((user: any) => ({
      "Name": user.name || "N/A",
      "Email": user.email || "N/A",
      "Phone": user.phone || "N/A",
      "Total Spend (Rs.)": user.totalSpend || 0,
      "Order Count": user.orderCount || 0,
      "Last Order Date": user.lastOrderDate
        ? new Date(user.lastOrderDate).toLocaleDateString('en-PK')
        : "Never",
      "Joined Date": user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-PK')
        : "N/A",
      "Referral Code": user.referralCode || "None",
    }));

    // 8. Generate CSV using Papa Parse
    const csv = Papa.unparse(csvData, {
      quotes: true, // Ensure special characters are handled safely
      delimiter: ",",
    });

    // 9. Prepare Filename
    const filename = `segment_export_${new Date().toISOString().split("T")[0]}.csv`;

    // 10. Return CSV as Downloadable File
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("❌ Segment Export Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export segment" },
      { status: 500 }
    );
  }
}