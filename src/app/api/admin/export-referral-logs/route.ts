// src/app/api/admin/export-referral-logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/lib/payloadAuth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Referral from "@/models/Referral";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import Papa from "papaparse";

// ================================================================
// ✅ ENTERPRISE FIX: Type-safe query params
// ================================================================
interface ExportQuery {
  from?: string;
  to?: string;
  status?: "pending" | "converted" | "paid" | "all";
  limit?: number; // Limit records to avoid memory issues
}

// ================================================================
// 🚀 GET Handler
// ================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. Security: Only staff (admin/manager) can export
    await verifyStaff(["admin", "manager"]);

    // 2. Parse Query Params
    const searchParams = req.nextUrl.searchParams;
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const status = searchParams.get("status") as ExportQuery["status"] || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 5000, 10000);

    // 3. Build MongoDB query
    const query: any = {};

    if (fromStr) {
      const from = startOfDay(parseISO(fromStr));
      if (!query.createdAt) query.createdAt = {};
      query.createdAt.$gte = from;
    }
    if (toStr) {
      const to = endOfDay(parseISO(toStr));
      if (!query.createdAt) query.createdAt = {};
      query.createdAt.$lte = to;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // 4. Connect to Database
    await connectMongoose();

    // 5. Fetch Referrals with populated fields
    const referrals = await Referral.find(query)
      .populate("referrerId", "name email")
      .populate("referredUserId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // 6. Transform data for CSV
    const csvData = referrals.map((ref: any) => ({
      "Referrer Name": ref.referrerId?.name || "Deleted User",
      "Referrer Email": ref.referrerId?.email || "N/A",
      "Friend Name": ref.referredUserId?.name || "Pending Onboarding",
      "Friend Email": ref.referredUserId?.email || "N/A",
      "Status": ref.status,
      "Order ID": ref.orderId || "",
      "Conversion Date": ref.convertedAt ? format(new Date(ref.convertedAt), "yyyy-MM-dd HH:mm") : "",
      "Paid Date": ref.paidAt ? format(new Date(ref.paidAt), "yyyy-MM-dd HH:mm") : "",
      "Created At": format(new Date(ref.createdAt), "yyyy-MM-dd HH:mm"),
    }));

    // 7. Generate CSV using Papa Parse
    const csv = Papa.unparse(csvData, {
      quotes: true, // Quote all fields for safety
      delimiter: ",",
    });

    // 8. Prepare filename with date range
    const dateSuffix =
      fromStr && toStr
        ? `${fromStr}_to_${toStr}`
        : format(new Date(), "yyyy-MM-dd");
    const filename = `referral_logs_${dateSuffix}.csv`;

    // 9. Return as downloadable file
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
    console.error("CSV Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export referral logs.", message: error.message },
      { status: 500 }
    );
  }
}