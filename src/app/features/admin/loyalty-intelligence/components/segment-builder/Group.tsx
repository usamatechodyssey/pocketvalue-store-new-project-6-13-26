// 📂 src/app/features/admin/loyalty-intelligence/components/segment-builder/Group.tsx

"use client";

import React, { useState } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { SegmentGroup, FilterCondition } from "@/models/SegmentDefinition";
import ConditionRow from "./ConditionRow";

interface GroupProps {
  group: SegmentGroup;
  groupIndex: number;
  parentIndex?: number;
  onUpdate: (group: SegmentGroup) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function Group({
  group,
  groupIndex,
  parentIndex,
  onUpdate,
  onRemove,
  canRemove,
}: GroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: "totalSpend",
      operator: "greater_than",
      value: 0,
    };
    onUpdate({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const addGroup = () => {
    const newGroup: SegmentGroup = {
      logic: "AND",
      conditions: [],
      groups: [],
    };
    onUpdate({
      ...group,
      groups: [...(group.groups || []), newGroup],
    });
  };

  const updateCondition = (index: number, condition: FilterCondition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = condition;
    onUpdate({ ...group, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index);
    onUpdate({ ...group, conditions: newConditions });
  };

  const updateNestedGroup = (index: number, updatedGroup: SegmentGroup) => {
    const newGroups = [...(group.groups || [])];
    newGroups[index] = updatedGroup;
    onUpdate({ ...group, groups: newGroups });
  };

  const removeNestedGroup = (index: number) => {
    const newGroups = (group.groups || []).filter((_, i) => i !== index);
    onUpdate({ ...group, groups: newGroups });
  };

  return (
    <div className="relative border-l-2 border-brand-primary/30 pl-4 ml-4">
      {/* Group Header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Group {groupIndex + 1}
        </span>

        <select
          value={group.logic}
          onChange={(e) =>
            onUpdate({ ...group, logic: e.target.value as "AND" | "OR" })
          }
          className="px-2 py-0.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-800 font-bold"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>

        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors ml-auto"
            title="Remove group"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Group Body */}
      {isExpanded && (
        <div className="space-y-2">
          {group.conditions.map((condition, idx) => (
            <ConditionRow
              key={idx}
              condition={condition}
              index={idx}
              onUpdate={updateCondition}
              onRemove={removeCondition}
            />
          ))}

          {(group.groups || []).map((nestedGroup, idx) => (
            <Group
              key={idx}
              group={nestedGroup}
              groupIndex={idx}
              parentIndex={groupIndex}
              onUpdate={(updated) => updateNestedGroup(idx, updated)}
              onRemove={() => removeNestedGroup(idx)}
              canRemove={true}
            />
          ))}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button
              onClick={addCondition}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
            >
              <Plus size={12} /> Add Condition
            </button>
            <button
              onClick={addGroup}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-purple-500 border border-purple-500/30 rounded-lg hover:bg-purple-500/5 transition-colors"
            >
              <Plus size={12} /> Add Sub-Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}