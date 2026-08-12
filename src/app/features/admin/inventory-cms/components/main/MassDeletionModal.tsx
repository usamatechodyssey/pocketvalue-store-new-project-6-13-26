// 📂 src/app/features/admin/inventory-cms/components/main/MassDeletionModal.tsx (CYBER-HUD HARDENED)

"use client";

import { Fragment, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  Transition,
  DialogPanel,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import {
  Loader2,
  ShieldAlert,
  Zap,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ✅ PAYLOAD Mass Deletion Server Action
import { massDeleteCategoryHierarchyPayload, MassDeletionPayload } from "@/app/features/admin/inventory-cms/actions/payloadMassDeletionActions";

// --- CONSTANTS ---
const CONFIRMATION_PHRASE = "I AM SURE"; 

interface MassDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MassDeletionModal({
  isOpen,
  onClose,
}: MassDeletionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [categoryIdentifier, setCategoryIdentifier] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [report, setReport] = useState<{
    success: boolean;
    message: string;
    logs?: string[];
  } | null>(null);

  const resetState = () => {
    setCategoryIdentifier("");
    setConfirmPhrase("");
    setReport(null);
    onClose();
  };
  
  // ✅ FIX 2: Updated to match centralized high-density Cyber-HUD input styles
  const inputStyles =
    "appearance-none block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-900 placeholder:text-zinc-400 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all duration-200";
  
  const canConfirm =
    categoryIdentifier.trim().length > 0 && confirmPhrase === CONFIRMATION_PHRASE;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canConfirm) {
      toast.error("Please fill out the category and confirmation phrase correctly.");
      return;
    }
    
    setReport(null);
    toast.loading("Starting Hierarchical Deletion...");

    startTransition(async () => {
      const payload: MassDeletionPayload = {
        identifier: categoryIdentifier.trim(),
        confirmPhrase: confirmPhrase,
      };
      
      const result = await massDeleteCategoryHierarchyPayload(payload);

      toast.dismiss();
      setReport(result);

      if (result.success) {
        toast.success(
          `Deletion script ran successfully! ${categoryIdentifier} cleared.`
        );
      } else {
        toast.error(result.message);
      }
      
      if (result.success) {
         setCategoryIdentifier("");
         setConfirmPhrase("");
      }
    });
  };
  
  const isFormDisabled = isPending || (report !== null && report.success);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={resetState}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
        </TransitionChild>
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* ✅ FIX 1: Upgraded container to Cyber-HUD standard dark mode tokens */}
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-2xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-sm font-bold uppercase tracking-wider font-mono text-red-600 dark:text-red-400 flex items-center gap-2 border-b pb-3 border-zinc-150 dark:border-zinc-850"
                >
                  <ShieldAlert size={18} className="stroke-[2.2px]" /> Hierarchical Deletion Tool
                </DialogTitle>
                
                <form onSubmit={handleSubmit}>
                    <div className="mt-4 space-y-4">
                        {/* Warning Box */}
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-xs font-semibold font-mono text-amber-700 dark:text-amber-400 flex items-start gap-2 leading-relaxed">
                                <Zap size={14} className="mt-0.5 shrink-0" /> WARNING: This will permanently delete ALL PRODUCTS inside this category and its sub-categories. (The categories themselves will NOT be deleted). Active orders are safe.
                            </p>
                        </div>
                        
                        {/* Category Input */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                Category Name or Slug (Exact Match)
                            </label>
                            <input
                                type="text"
                                value={categoryIdentifier}
                                onChange={(e) => setCategoryIdentifier(e.target.value)}
                                className={inputStyles}
                                placeholder="e.g., Men's T-Shirts or mens-t-shirts"
                                required
                                disabled={isFormDisabled}
                            />
                        </div>
                        
                        {/* Confirmation Input */}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-red-500 dark:text-red-400">
                                Type "{CONFIRMATION_PHRASE}" to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmPhrase}
                                onChange={(e) => setConfirmPhrase(e.target.value)}
                                className={inputStyles}
                                required
                                disabled={isFormDisabled}
                            />
                        </div>
                    </div>

                    {/* Report & Script Logs Section */}
                    {report && (
                        <div className="mt-6 border-t border-zinc-150 dark:border-zinc-850 pt-4 space-y-3 font-mono">
                            <div className={`p-3 rounded-xl border ${report.success ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                                <p className="text-xs font-bold flex items-center gap-2">
                                    {report.success ? <CheckCircle className="text-emerald-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                                    {report.message}
                                </p>
                            </div>
                            
                            {report.logs && report.logs.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Script Logs:</h4>
                                    <pre className="p-3 text-[10px] font-mono leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto whitespace-pre-wrap custom-scrollbar text-zinc-600 dark:text-zinc-400">
                                        {report.logs.join('\n')}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
                        <button
                            type="button"
                            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            onClick={resetState}
                            disabled={isPending}
                        >
                            {report && report.success ? "Close" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all rounded-xl cursor-pointer shadow-xs shadow-red-500/10"
                            disabled={!canConfirm || isPending || (report !== null && report.success)}
                        >
                            {isPending && <Loader2 className="animate-spin" size={14} />}
                            {isPending ? "Executing..." : "Permanently Delete"}
                        </button>
                    </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}