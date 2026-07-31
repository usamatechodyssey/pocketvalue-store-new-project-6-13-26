// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/types.ts

import { SegmentGroup, FilterCondition } from "@/models/SegmentDefinition";

// ================================================================
// ✅ TYPES
// ================================================================
export interface SavedSegment {
  _id: string;
  name: string;
  description?: string;
  filters: SegmentGroup;
  isActive: boolean;
  lastRunAt?: string;
  lastRunCount?: number;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface SegmentPreviewUser {
  _id: string;
  name: string;
  email: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate: string | null;
}

// ================================================================
// 🔧 HELPERS
// ================================================================
export const ALLOWED_FIELDS = [
  "totalSpend",
  "orderCount",
  "lastOrderDate",
  "createdAt",
  "email",
  "phone",
  "referralCode",
  "referredBy",
] as const;

export const ALLOWED_OPERATORS = [
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

export const getOperatorLabel = (op: string): string => {
  const labels: Record<string, string> = {
    equals: "=",
    not_equals: "≠",
    greater_than: ">",
    less_than: "<",
    greater_than_equal: "≥",
    less_than_equal: "≤",
    contains: "contains",
    not_contains: "does not contain",
    in: "is in",
    not_in: "is not in",
    exists: "exists",
  };
  return labels[op] || op;
};

export const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    totalSpend: "Total Spend (Rs.)",
    orderCount: "Order Count",
    lastOrderDate: "Last Order Date",
    createdAt: "Joined Date",
    email: "Email",
    phone: "Phone",
    referralCode: "Referral Code",
    referredBy: "Referred By",
  };
  return labels[field] || field;
};