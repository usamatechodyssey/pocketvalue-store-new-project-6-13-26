// 📂 src/app/features/admin/loyalty-intelligence/components/SegmentBuilderUI.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, FolderOpen, Loader2, Users } from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import { SegmentGroup } from "@/models/SegmentDefinition";

// Import sub-components
import Group from "./segment-builder/Group";
import ExportControls from "./segment-builder/ExportControls";
import PreviewResults from "./segment-builder/PreviewResults";
import SavedSegmentsList from "./segment-builder/SavedSegmentsList";
import { SavedSegment, SegmentPreviewUser } from "./segment-builder/types";

// ================================================================
// ✅ TYPES
// ================================================================
interface SegmentBuilderUIProps {
  initialSegmentId?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function SegmentBuilderUI({ initialSegmentId }: SegmentBuilderUIProps) {
  const router = useRouter();

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rootGroup, setRootGroup] = useState<SegmentGroup>({
    logic: "AND",
    conditions: [{ field: "totalSpend", operator: "greater_than", value: 0 }],
    groups: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [segmentId, setSegmentId] = useState<string | undefined>(initialSegmentId);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewUsers, setPreviewUsers] = useState<SegmentPreviewUser[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewPages, setPreviewPages] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Saved segments list
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [showList, setShowList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  // ================================================================
  // 🔄 LOAD SEGMENT
  // ================================================================
  useEffect(() => {
    if (initialSegmentId) {
      loadSegment(initialSegmentId);
    }
  }, [initialSegmentId]);

  const loadSegment = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/segments/${id}`);
      if (!response.ok) throw new Error("Failed to load segment");
      const data = await response.json();
      setName(data.name);
      setDescription(data.description || "");
      setRootGroup(data.filters);
      setSegmentId(data._id);
    } catch (error) {
      toastError("Failed to load segment.");
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // 💾 SAVE SEGMENT
  // ================================================================
  const handleSave = async () => {
    if (!name.trim()) {
      toastError("Please enter a segment name.");
      return;
    }

    const hasConditions = rootGroup.conditions.length > 0;
    const hasGroups = (rootGroup.groups || []).length > 0;
    if (!hasConditions && !hasGroups) {
      toastError("Please add at least one condition or group.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: segmentId,
        name: name.trim(),
        description: description.trim(),
        filters: rootGroup,
        isActive: true,
      };

      const response = await fetch("/api/admin/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to save segment.");
      }

      const result = await response.json();
      toastSuccess("Segment saved successfully!");
      if (!segmentId) {
        setSegmentId(result.data.id);
        router.replace(`/admin/segment-builder?id=${result.data.id}`);
      }
    } catch (error: any) {
      toastError(error.message || "Failed to save segment.");
    } finally {
      setIsSaving(false);
    }
  };

  // ================================================================
  // 🗑️ DELETE SEGMENT
  // ================================================================
  const handleDelete = async () => {
    if (!segmentId) return;
    if (!confirm("Are you sure you want to delete this segment?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/segments/${segmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete segment.");
      toastSuccess("Segment deleted.");
      setSegmentId(undefined);
      setName("");
      setDescription("");
      setRootGroup({ logic: "AND", conditions: [], groups: [] });
      router.replace("/admin/segment-builder");
    } catch (error) {
      toastError("Failed to delete segment.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ================================================================
  // 📋 LOAD SAVED SEGMENTS LIST
  // ================================================================
  const loadSavedSegments = async () => {
    setIsListLoading(true);
    try {
      const response = await fetch("/api/admin/segments");
      if (!response.ok) throw new Error("Failed to load segments.");
      const data = await response.json();
      setSavedSegments(data.data || []);
      setShowList(true);
    } catch (error) {
      toastError("Failed to load saved segments.");
    } finally {
      setIsListLoading(false);
    }
  };

  const loadSavedSegment = (segment: SavedSegment) => {
    setName(segment.name);
    setDescription(segment.description || "");
    setRootGroup(segment.filters);
    setSegmentId(segment._id);
    setShowList(false);
    toastSuccess(`Loaded "${segment.name}"`);
  };

  // ================================================================
  // 👁️ PREVIEW SEGMENT
  // ================================================================
  const handlePreview = async (page: number = 1) => {
    setIsPreviewLoading(true);
    setShowPreview(true);
    try {
      const response = await fetch("/api/admin/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: rootGroup, page, limit: 10 }),
      });
      if (!response.ok) throw new Error("Failed to preview segment.");
      const result = await response.json();
      setPreviewUsers(result.users || []);
      setPreviewTotal(result.totalDocs || 0);
      setPreviewPages(result.totalPages || 0);
      setPreviewPage(page);
    } catch (error) {
      toastError("Failed to preview segment.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // ================================================================
  // 🖥️ RENDER
  // ================================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 font-mono">
        <Loader2 size={32} className="animate-spin text-brand-primary" />
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading Segment Engine...</span>
      </div>
    );
  }

  const inputStyles =
    "w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary outline-hidden transition-all";

  return (
    <div className="space-y-6 w-full min-w-0 font-mono animate-in fade-in duration-300">
      
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={loadSavedSegments}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-2xs"
          >
            <FolderOpen size={14} />
            Load Saved ({savedSegments.length})
          </button>
          <button
            onClick={() => handlePreview(previewPage)}
            disabled={isPreviewLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-blue-500/20"
          >
            {isPreviewLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Users size={14} />
            )}
            Preview Query
          </button>
        </div>

        <div className="flex items-center gap-2">
          {segmentId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-red-500/20"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-brand-primary/20"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? "Saving..." : "Save Segment"}
          </button>
        </div>
      </div>

      {/* Segment Name & Description Form Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs">
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Segment Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High-Value Inactive VIPs"
            className={inputStyles}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Internal notes about this custom customer filter"
            className={inputStyles}
          />
        </div>
      </div>

      {/* Filter Builder Core Box */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <h3 className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Filter Conditions Builder
          </h3>
          <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-950 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
            {rootGroup.conditions.length} Conditions, {(rootGroup.groups || []).length} Sub-Groups
          </span>
        </div>

        <Group
          group={rootGroup}
          groupIndex={0}
          onUpdate={setRootGroup}
          onRemove={() => {}}
          canRemove={false}
        />
      </div>

      {/* Export Controls */}
      <ExportControls filters={rootGroup} />

      {/* Preview Results */}
      <PreviewResults
        isVisible={showPreview}
        isLoading={isPreviewLoading}
        users={previewUsers}
        total={previewTotal}
        totalPages={previewPages}
        currentPage={previewPage}
        onClose={() => setShowPreview(false)}
      />

      {/* Saved Segments List */}
      <SavedSegmentsList
        isVisible={showList}
        isLoading={isListLoading}
        segments={savedSegments}
        onLoad={loadSavedSegment}
        onClose={() => setShowList(false)}
      />
    </div>
  );
}