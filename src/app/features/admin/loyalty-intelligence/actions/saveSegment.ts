// 📂 src/app/features/admin/loyalty-intelligence/actions/saveSegment.ts (FULLY BSON-PROTECTED & TYPE-SAFE)

"use server";

import { auth } from "@/app/auth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import SegmentDefinition from "@/models/SegmentDefinition";
import { FilterCondition, SegmentGroup } from "@/models/SegmentDefinition";
import { verifyStaff } from "@/lib/payloadAuth";
import { z } from "zod";
import { Types } from "mongoose";

// ================================================================
// ✅ ENTERPRISE SECURITY: Whitelisted Fields & Operators
// ================================================================

const ALLOWED_FIELDS = [
  "totalSpend",
  "orderCount",
  "lastOrderDate",
  "createdAt",
  "email",
  "phone",
  "referralCode",
  "referredBy",
] as const;

const ALLOWED_OPERATORS = [
  "equals",
  "not_equals",
  "greater_than",
  "less_than",
  "greater_than_equal",
  "less_than_equal",
  "contains",
  "not_contains",
  "in",
  "not_in",
  "exists",
] as const;

// ================================================================
// ✅ ZOD SCHEMAS
// ================================================================

// Condition schema
const FilterConditionSchema: z.ZodType<FilterCondition> = z.object({
  field: z.enum(ALLOWED_FIELDS),
  operator: z.enum(ALLOWED_OPERATORS),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any())]),
});

// Recursive SegmentGroup schema
const SegmentGroupSchema: z.ZodType<SegmentGroup> = z.lazy(() =>
  z.object({
    logic: z.enum(["AND", "OR"]),
    conditions: z.array(FilterConditionSchema).default([]),
    groups: z.array(z.lazy(() => SegmentGroupSchema)).default([]),
  })
);

// Main validation schema
const SaveSegmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  filters: SegmentGroupSchema,
  isActive: z.boolean().default(true),
});

// ================================================================
// 🚀 MAIN ACTION: Save Segment Definition
// ================================================================
export async function saveSegment(data: {
  id?: string;
  name: string;
  description?: string;
  filters: SegmentGroup;
  isActive?: boolean;
}): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    await verifyStaff(["admin", "manager"]);

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated." };
    }

    const validation = SaveSegmentSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((i) => i.message).join(", "),
      };
    }

    const { id, name, description, filters, isActive } = validation.data;

    await connectMongoose();

    if (id) {
      const existing = await SegmentDefinition.findById(id);
      if (!existing) {
        return { success: false, error: "Segment not found." };
      }

      existing.name = name;
      existing.description = description || "";
      existing.filters = filters;
      existing.isActive = isActive !== undefined ? isActive : existing.isActive;
      await existing.save();

      return { success: true, data: { id: existing._id.toString() } };
    }

    // ✅ BSON FIX: Safe ObjectId instantiation check to prevent BSON conversion crashes
    const createdByObjectId = Types.ObjectId.isValid(session.user.id)
      ? new Types.ObjectId(session.user.id)
      : null;

    const newSegment = new SegmentDefinition({
      name,
      description: description || "",
      filters,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: createdByObjectId,
    });

    await newSegment.save();

    return {
      success: true,
      data: { id: newSegment._id.toString() },
    };
  } catch (error: any) {
    console.error("Failed to save segment:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================================================
// 🗑️ ACTION: Delete Segment (Soft Delete)
// ================================================================
export async function deleteSegment(segmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyStaff(["admin", "manager"]);
    await connectMongoose();

    const segment = await SegmentDefinition.findById(segmentId);
    if (!segment) {
      return { success: false, error: "Segment not found." };
    }

    segment.isActive = false;
    await segment.save();

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete segment:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================================================
// 📋 ACTION: List All Segments
// ================================================================
export async function listSegments(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await verifyStaff(["admin", "manager", "editor"]);

    await connectMongoose();

    const segments = await SegmentDefinition.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    const result = segments.map((seg: any) => ({
      _id: seg._id.toString(),
      name: seg.name,
      description: seg.description,
      filters: seg.filters,
      isActive: seg.isActive,
      lastRunAt: seg.lastRunAt,
      lastRunCount: seg.lastRunCount,
      createdBy: {
        _id: seg.createdBy?._id?.toString() || "unknown",
        name: seg.createdBy?.name || "Admin",
        email: seg.createdBy?.email || "unknown",
      },
      createdAt: seg.createdAt,
    }));

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to list segments:", error.message);
    return { success: false, error: error.message };
  }
}