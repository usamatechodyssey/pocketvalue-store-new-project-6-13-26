// 📂 src/app/features/admin/order-fulfillment/components/orders/SendEmailModal.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useTransition, Fragment } from "react";
import { toast } from "react-hot-toast";
import { sendCustomEmail } from "../../actions/ordersActions";
import { Mail, Loader2, X } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

export default function SendEmailModal({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return toast.error("Please fill all fields.");

    startTransition(async () => {
      const result = await sendCustomEmail(customerId, subject, message);
      if (result.success) {
        toast.success("Email sent!");
        setIsOpen(false);
        setSubject(""); 
        setMessage("");
      } else {
        toast.error(result.message);
      }
    });
  };

  const inputStyles = "w-full p-2.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:ring-1 focus:ring-brand-primary/50 outline-hidden transition-all";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer shadow-blue-500/10"
      >
        <Mail size={16} /> Send Custom Email
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
                <DialogPanel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-2xl transition-all">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-150 dark:border-zinc-850">
                    <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" /> Email to {customerName}
                    </DialogTitle>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Email Subject
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Order Update Notification" 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        className={inputStyles} 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Message Body
                      </label>
                      <textarea 
                        rows={5} 
                        placeholder="Write your custom message here..." 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        className={inputStyles}
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-zinc-150 dark:border-zinc-850">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isPending} 
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10"
                      >
                        {isPending && <Loader2 className="animate-spin" size={14} />} Send Email
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}