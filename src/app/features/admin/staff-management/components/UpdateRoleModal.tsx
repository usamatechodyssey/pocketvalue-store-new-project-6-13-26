"use client";

import { useState, useTransition, Fragment } from "react";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Edit3, X, Loader2 } from "lucide-react";
import { updateStaffRole, StaffUser } from "@/app/features/admin/order-fulfillment/actions/payloadAdminActions";
import { toast } from "react-hot-toast";

export default function UpdateRoleModal({
  isOpen,
  onClose,
  staff,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser;
  onUpdated: () => void;
}) {
  const [newRole, setNewRole] = useState(staff.role);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateStaffRole(staff.id, newRole);
      if (res.success) {
        toast.success(res.message);
        onUpdated();
        onClose();
      } else toast.error(res.message);
    });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-9999" onClose={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] p-8 shadow-2xl border dark:border-white/5 text-center">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
              <Edit3 className="text-brand-primary" size={28} />
            </div>
            <DialogTitle className="text-xl font-black dark:text-white uppercase tracking-tighter mb-2">
              Update Permission
            </DialogTitle>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Changing role for{" "}
              <span className="text-brand-primary font-bold">{staff.name}</span>
            </p>

            <select
              className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white outline-none mb-6"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
            >
              <option
                value="admin"
                className="bg-white dark:bg-gray-900 text-black dark:text-white"
              >
                Super Admin
              </option>
              <option
                value="manager"
                className="bg-white dark:bg-gray-900 text-black dark:text-white"
              >
                Store Manager
              </option>
              <option
                value="editor"
                className="bg-white dark:bg-gray-900 text-black dark:text-white"
              >
                Content Editor
              </option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isPending}
                className="flex-1 py-3 bg-brand-primary text-white font-black rounded-xl text-xs uppercase tracking-widest flex justify-center items-center gap-2"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}{" "}
                Update
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
