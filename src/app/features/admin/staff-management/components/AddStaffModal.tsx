"use client";

import { useState, useTransition, Fragment } from "react";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { createStaffMember } from "@/app/features/admin/order-fulfillment/actions/payloadAdminActions";
import { toast } from "react-hot-toast";

export default function AddStaffModal({ isOpen, onClose, onAdded }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor",
  });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success) {
        toast.success(res.message);
        onAdded();
        onClose();
      } else toast.error(res.message);
    });
  };

  const inputStyles =
    "w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-9999" onClose={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] p-8 shadow-2xl border dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <UserPlus className="text-brand-primary" /> Onboard Staff
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className={inputStyles}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                className={inputStyles}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <select
                className={inputStyles}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
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
              <p className="text-[10px] text-gray-500 italic px-2">
                * New staff will use 'PocketValueStaff123!' as temporary
                password.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-brand-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:opacity-90 flex justify-center items-center gap-2"
              >
                {isPending && <Loader2 className="animate-spin" size={16} />}{" "}
                Complete Registration
              </button>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
}
