// 📂 src/app/features/admin/staff-management/components/UpdateRoleModal.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useTransition, Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Edit3, X, Loader2 } from "lucide-react";
import { updateStaffRole, StaffUser } from "@/app/features/admin/staff-management/actions/payloadAdminActions";
import { toast } from "react-hot-toast";

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser;
  onUpdated: () => void;
}

export default function UpdateRoleModal({
  isOpen,
  onClose,
  staff,
  onUpdated,
}: UpdateRoleModalProps) {
  const [newRole, setNewRole] = useState(staff.role);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateStaffRole(staff.id, newRole);
      if (res.success) {
        toast.success(res.message);
        onUpdated();
        onClose();
      } else {
        toast.error(res.message);
      }
    });
  };

  // ✅ CYBER-HUD Input Styling
  const inputStyles = "w-full p-3 text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl transition-all text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
                <Edit3 className="text-brand-primary" size={28} />
              </div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider font-mono mb-2">
                Update Permission
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                Changing role for{" "}
                <span className="text-brand-primary font-bold">{staff.name}</span>
              </p>

              <select
                className={`${inputStyles} mb-6`}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
              >
                <option value="admin">Super Admin</option>
                <option value="manager">Store Manager</option>
                <option value="editor">Content Editor</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isPending}
                  className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 shadow-xs shadow-brand-primary/10"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Update
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}