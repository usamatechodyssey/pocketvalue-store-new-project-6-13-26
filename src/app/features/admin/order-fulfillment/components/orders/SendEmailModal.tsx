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
        setSubject(""); setMessage("");
      } else toast.error(result.message);
    });
  };

  const inputStyles = "w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-brand-primary";

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
        <Mail size={18} /> Send Custom Email
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-9999" onClose={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-lg font-bold dark:text-white">Email to {customerName}</DialogTitle>
                <X className="cursor-pointer opacity-50" onClick={() => setIsOpen(false)} />
              </div>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className={inputStyles} />
                <textarea rows={5} placeholder="Your message..." value={message} onChange={e => setMessage(e.target.value)} className={inputStyles}></textarea>
                <button type="submit" disabled={isPending} className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg flex items-center justify-center gap-2">
                  {isPending && <Loader2 className="animate-spin" size={18} />} Send Email
                </button>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}