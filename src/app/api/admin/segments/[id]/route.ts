// 📂 src/app/api/admin/segments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import SegmentDefinition from "@/models/SegmentDefinition";
import { deleteSegment, saveSegment } from "@/app/features/admin/loyalty-intelligence/actions/saveSegment";
import { verifyStaff } from "@/lib/payloadAuth";

// ================================================================
// 🔍 GET: Fetch a single segment by ID
// ================================================================
export async function GET(
  _req: NextRequest, // ✅ FIX: Renamed unused req to _req to eliminate ts(6133) warning
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyStaff(["admin", "manager", "editor"]);
    const { id } = await params;

    await connectMongoose();

    const segment = await SegmentDefinition.findById(id)
      .populate("createdBy", "name email")
      .lean() as any;

    if (!segment) {
      return NextResponse.json({ success: false, error: "Segment not found." }, { status: 404 });
    }

    const segmentPayload = {
      _id: segment._id.toString(),
      name: segment.name,
      description: segment.description,
      filters: segment.filters,
      isActive: segment.isActive,
      lastRunAt: segment.lastRunAt,
      lastRunCount: segment.lastRunCount,
      createdBy: {
        _id: segment.createdBy?._id?.toString() || "unknown",
        name: segment.createdBy?.name || "Unknown",
        email: segment.createdBy?.email || "unknown",
      },
      createdAt: segment.createdAt,
    };

    // ✅ Dual-Key Spreading Response for Client Compatibility
    return NextResponse.json({
      success: true,
      data: segmentPayload,
      ...segmentPayload,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ================================================================
// ✏️ PUT: Update an existing segment
// ================================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await saveSegment({ ...body, id });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ================================================================
// 🗑️ DELETE: Soft delete a segment
// ================================================================
export async function DELETE(
  _req: NextRequest, // ✅ FIX: Renamed unused req to _req to eliminate ts(6133) warning
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteSegment(id);
    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}