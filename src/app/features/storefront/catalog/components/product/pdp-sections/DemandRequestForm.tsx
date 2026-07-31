
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Phone, Zap, BellRing, Sparkles, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { submitDemandRequest } from "@/app/features/storefront/cart-checkout/actions/demandActions";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import { motion, AnimatePresence } from "framer-motion";

interface DemandRequestFormProps {
  productId: string;
  selectedAttributes: Record<string, string> | null;
  isOutOfStock: boolean;
}

export default function DemandRequestForm({
  productId,
  selectedAttributes,
  isOutOfStock,
}: DemandRequestFormProps) {
  const { data: session } = useSession();
  
  // UI Selection Tab States
  const [activeTab, setActiveTab] = useState<'restock' | 'custom'>('restock');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Input fields state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill email dynamically if user is logged in
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  // Sync active tab automatically if variant goes out of stock
  useEffect(() => {
    if (isOutOfStock) {
      setActiveTab('restock');
      setIsFormOpen(true); 
    } else {
      setActiveTab('custom');
      setIsFormOpen(false);
    }
  }, [isOutOfStock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toastError("Please provide an email address.");

    setIsLoading(true);

    const payload = {
      productId,
      requestType: activeTab === 'restock' ? ('restock' as const) : ('missing_variant' as const),
      email,
      phone: phone || undefined,
      selectedAttributes: selectedAttributes || undefined,
      customDetails: activeTab === 'custom' ? customDetails : undefined,
      urgencyLevel: isUrgent ? ('urgent' as const) : ('normal' as const),
    };

    const result = await submitDemandRequest(payload);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      toastSuccess(result.message);

      // 🧹 DUPLICATE TELEMETRY REMOVED:
      // Server action (submitDemandRequest) already logs accurate events
      // (back_in_stock_subscription for restock, form_field_interaction for custom).
      // Client-side duplicate logging has been removed to prevent data pollution.

      // Reset after some time
      setTimeout(() => {
        setIsSubmitted(false);
        setCustomDetails("");
        setIsUrgent(false);
      }, 5000);
    } else {
      toastError(result.message);
    }
  };

  return (
    <div className="w-full mt-6 bg-orange-50/50 dark:bg-gray-800/40 rounded-2xl border border-brand-primary/20 p-5 shadow-sm">
      
      {/* EYE-CATCHING HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0 animate-pulse">
            <Sparkles size={20} className="fill-brand-primary/20" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {isOutOfStock ? "Out of Stock? We can Restock!" : "Don't see your desired size or color?"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tell us what specification you need, we will source it for you!
            </p>
          </div>
        </div>

        {!isOutOfStock && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-transform active:scale-95"
            aria-label="Toggle Request Box"
          >
            <ChevronDown size={18} className={`transition-transform duration-300 ${isFormOpen ? "rotate-180 text-brand-primary" : ""}`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isFormOpen || isOutOfStock) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            
            {/* TABS SELECTION */}
            <div className="flex items-center gap-2 mt-5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl">
              {isOutOfStock && (
                <button
                  type="button"
                  onClick={() => setActiveTab('restock')}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
                    ${activeTab === 'restock' ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  <BellRing size={14} /> Notify Me on Restock
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5
                  ${activeTab === 'custom' ? 'bg-white dark:bg-gray-700 text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Sparkles size={14} /> Request Custom Variant/Size
              </button>
            </div>

            {isSubmitted ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6 text-center py-6 bg-white dark:bg-gray-900 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm"
              >
                <CheckCircle className="mx-auto text-green-500 mb-2 animate-bounce" size={32} />
                <h5 className="font-bold text-gray-900 dark:text-white text-sm">Understood! Sourcing Request Submitted</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-4">
                  We have added this request to our inventory replenishment pipeline. We will email you immediately when it's ready.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                
                {activeTab === 'custom' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Explain what Color, Size, or Custom Option you need:
                    </label>
                    <textarea
                      value={customDetails}
                      onChange={(e) => setCustomDetails(e.target.value)}
                      placeholder="e.g. I need this dress in custom width: 22 inches, or I need an XL size in Royal Blue color."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      required
                    />
                  </div>
                )}

                {activeTab === 'restock' && selectedAttributes && (
                  <div className="bg-white dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Sourcing Alert For Variant: <span className="text-brand-primary font-bold">{Object.entries(selectedAttributes).map(([k,v]) => `${k}: ${v}`).join(' / ')}</span>
                  </div>
                )}

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address*"
                      className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* URGENCY PRIORITY TOGGLE */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                      <Zap size={14} className={isUrgent ? "fill-red-500" : ""} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-white">Flag as Urgent?</p>
                      <p className="text-[10px] text-gray-400">Check this if you want to buy on a priority basis.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white font-bold rounded-xl shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Submitting Sourcing Request...
                    </>
                  ) : (
                    <>
                      Submit Demand Request
                    </>
                  )}
                </button>

              </form>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}