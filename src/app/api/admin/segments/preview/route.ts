// 📂 src/app/api/admin/segments/preview/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSegmentQuery } from "@/app/features/admin/loyalty-intelligence/actions/getSegmentQuery";
import { verifyStaff } from "@/lib/payloadAuth";

// ================================================================
// 👁️ POST: Preview segment results
// ================================================================
export async function POST(req: NextRequest) {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    const body = await req.json();
    const { filters, page = 1, limit = 10 } = body;

    if (!filters) {
      return NextResponse.json(
        { success: false, error: "Missing filters in request body." },
        { status: 400 }
      );
    }

    const result = await getSegmentQuery(filters, page, limit, true);

    return NextResponse.json({
      success: true,
      users: result.users,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}