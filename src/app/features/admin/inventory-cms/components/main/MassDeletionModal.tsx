// src/app/components/admin/MassDeletionModal.tsx
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

// ✅ NEW IMPORT: Payload Mass Deletion Server Action
import { massDeleteCategoryHierarchyPayload, MassDeletionPayload } from "@/app/features/admin/inventory-cms/actions/payloadMassDeletionActions";

// --- CONSTANTS ---
// CONFIRMATION_PHRASE PayloadMassDeletionSchema se hi aana chahiye ideally
// Filhal yahan hardcode kiya hai taake UI aur Backend sync rahein.
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
  
  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";
  
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
      // ✅ Payload Server Action ko call karein
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
      
      if(result.success) {
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
          <div className="fixed inset-0 bg-black/70" />
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
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-xl font-bold leading-6 text-red-600 dark:text-red-400 flex items-center gap-2 border-b pb-3 dark:border-gray-700"
                >
                  <ShieldAlert size={24} /> Hierarchical Deletion Tool
                </DialogTitle>
                
                <form onSubmit={handleSubmit}>
                    <div className="mt-4 space-y-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                <Zap size={16} /> WARNING: This will permanently delete ALL PRODUCTS inside this category and its sub-categories. (The categories themselves will NOT be deleted).
                            </p>
                        </div>
                        
                        {/* Category Input */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
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
                        <div>
                            <label className="block text-sm font-medium mb-1 text-red-600 dark:text-red-400">
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

                    {/* Report Section */}
                    {report && (
                        <div className="mt-6 border-t dark:border-gray-700 pt-4 space-y-2">
                            <div className={`p-3 rounded-md border ${report.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
                                <p className="font-semibold flex items-center gap-2">
                                    {report.success ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                                    {report.message}
                                </p>
                            </div>
                            
                            {report.logs && report.logs.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-bold mb-1">Script Logs:</h4>
                                    <pre className="p-3 text-xs bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                        {report.logs.join('\n')}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                            onClick={resetState}
                            disabled={isPending}
                        >
                            {report && report.success ? "Close" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
                            disabled={!canConfirm || isPending || (report !== null && report.success)}
                        >
                            {isPending && <Loader2 className="animate-spin" size={16} />}
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