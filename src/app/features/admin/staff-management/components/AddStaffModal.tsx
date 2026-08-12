// 📂 src/app/features/admin/staff-management/components/AddStaffModal.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useTransition, Fragment } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { createStaffMember } from "@/app/features/admin/staff-management/actions/payloadAdminActions";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onAdded }: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor",
  });
  const [isPending, startTransition] = useTransition();

  // ✅ FIX: Reset state on close to prevent data leakage between sessions
  const handleClose = () => {
    setFormData({ name: "", email: "", role: "editor" });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error("Please fill all fields.");

    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success) {
        toast.success(res.message);
        onAdded();
        handleClose();
      } else {
        toast.error(res.message);
      }
    });
  };

  const inputStyles = "w-full p-3 text-xs font-semibold font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
            <DialogPanel className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <div className="flex justify-between items-center mb-6">
                <DialogTitle className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono flex items-center gap-2">
                  <UserPlus className="text-brand-primary" size={18} /> Onboard Staff
                </DialogTitle>
                <button
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className={inputStyles}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className={inputStyles}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <select
                  className={inputStyles}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Super Admin</option>
                  <option value="manager">Store Manager</option>
                  <option value="editor">Content Editor</option>
                </select>
                
                <p className="text-[9px] text-zinc-500 italic px-2 font-mono">
                  * A secure temporary password will be generated upon registration.
                </p>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xs shadow-brand-primary/10 flex justify-center items-center gap-2 cursor-pointer mt-4"
                >
                  {isPending ? <Loader2 className="animate-spin" size={14} /> : "Complete Registration"}
                </button>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}