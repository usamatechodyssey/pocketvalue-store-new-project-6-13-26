// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/ConditionRow.tsx

"use client";

import React from "react";
import { X } from "lucide-react";
import { FilterCondition } from "@/models/SegmentDefinition";
import { ALLOWED_FIELDS, ALLOWED_OPERATORS, getFieldLabel, getOperatorLabel } from "./types";

interface ConditionRowProps {
  condition: FilterCondition;
  index: number;
  onUpdate: (index: number, condition: FilterCondition) => void;
  onRemove: (index: number) => void;
}

export default function ConditionRow({
  condition,
  index,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  const handleChange = (field: keyof FilterCondition, value: any) => {
    onUpdate(index, { ...condition, [field]: value });
  };

  const inputStyles =
    "px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:border-brand-primary outline-hidden transition-all cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs font-mono min-w-0">
      {/* Field Selector */}
      <select
        value={condition.field}
        onChange={(e) => handleChange("field", e.target.value)}
        className={inputStyles}
        aria-label="Filter Field"
      >
        {ALLOWED_FIELDS.map((field) => (
          <option key={field} value={field}>
            {getFieldLabel(field)}
          </option>
        ))}
      </select>

      {/* Operator Selector */}
      <select
        value={condition.operator}
        onChange={(e) => handleChange("operator", e.target.value)}
        className={inputStyles}
        aria-label="Filter Operator"
      >
        {ALLOWED_OPERATORS.map((op) => (
          <option key={op} value={op}>
            {getOperatorLabel(op)}
          </option>
        ))}
      </select>

      {/* Value Input */}
      <input
        type={typeof condition.value === "number" ? "number" : "text"}
        value={condition.value != null ? String(condition.value) : ""}
        onChange={(e) => {
          const val = e.target.value;
          if (["totalSpend", "orderCount"].includes(condition.field)) {
            handleChange("value", val === "" ? undefined : Number(val));
          } else {
            handleChange("value", val);
          }
        }}
        className={`${inputStyles} flex-1 min-w-30`}
        placeholder="Value"
        aria-label="Filter Value"
      />

      {/* Remove Button */}
      <button
        onClick={() => onRemove(index)}
        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-500/20 shrink-0"
        title="Remove condition"
        aria-label="Remove condition"
      >
        <X size={14} />
      </button>
    </div>
  );
}