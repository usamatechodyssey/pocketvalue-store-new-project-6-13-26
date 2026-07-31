// 📂 src/app/api/admin/segments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { listSegments, saveSegment } from "@/app/features/admin/loyalty-intelligence/actions/saveSegment";

// ================================================================
// 📋 GET: List all segments
// ================================================================
export async function GET() {
  try {
    const result = await listSegments();
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ================================================================
// 💾 POST: Create or update a segment
// ================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await saveSegment(body);
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}