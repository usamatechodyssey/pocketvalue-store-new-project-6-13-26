"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Phone,
  PackageOpen,
  Zap,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { submitDemandRequest } from "@/app/features/storefront/cart-checkout/actions/demandActions";
import {
  toastSuccess,
  toastError,
} from "@/app/shared/components/helpers/CustomToasts";
import { motion } from "framer-motion";

export default function RequestProductClient() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") || "";

  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto‑fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  // Auto‑fill product name from URL query parameter (?q=...)
  useEffect(() => {
    if (urlQuery) {
      setProductName(decodeURIComponent(urlQuery));
    }
  }, [urlQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!productName.trim()) {
      return toastError("Please provide the product name.");
    }
    if (!email) {
      return toastError("Please provide your email address.");
    }

    setIsLoading(true);

    const payload = {
      requestedProductName: productName,
      requestType: "missing_product" as const,
      email,
      phone: phone || undefined,
      customDetails: details || undefined,
      urgencyLevel: isUrgent ? ("urgent" as const) : ("normal" as const),
    };

    const result = await submitDemandRequest(payload);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      toastSuccess(result.message);
      setProductName("");
      setDetails("");
      setIsUrgent(false);
    } else {
      toastError(result.message);
    }
  };

  return (
    <main className="min-h-[85vh] bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="mx-auto h-14 w-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm animate-pulse">
            <PackageOpen size={30} className="fill-brand-primary/10" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Can&apos;t Find a <span className="text-brand-primary">Product</span>?
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Let us know which product you need, and we will work to make it
            available on PocketValue as soon as possible.
          </p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-10 bg-orange-50/20 dark:bg-gray-800/40 rounded-2xl border border-brand-primary/20"
          >
            <CheckCircle
              className="mx-auto text-green-500 mb-3 animate-bounce"
              size={40}
            />
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Request Logged Successfully!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-6 leading-relaxed">
              We have received your request. As soon as we source and launch
              this product, you will receive a direct email alert.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-xs font-bold text-brand-primary hover:underline"
            >
              Request Another Product
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-name"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Product Name / Title *
              </label>
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Royal Blue Silk Dupatta / Waterproof Backpack"
                className="w-full text-xs p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Specifications / Link */}
            <div className="space-y-1.5">
              <label
                htmlFor="details"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Specifications / Link (Optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="You can paste product links (e.g. Daraz/Amazon) or provide details about sizes, colours, etc."
                rows={4}
                className="w-full text-xs p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Mail size={14} aria-hidden="true" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Phone size={14} aria-hidden="true" />
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full text-xs pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Urgency toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    isUrgent
                      ? "bg-red-500/10 text-red-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Zap
                    size={16}
                    className={isUrgent ? "fill-red-500 animate-pulse" : ""}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">
                    Flag as Urgent?
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Mark this if you want to purchase it immediately upon availability.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="sr-only peer"
                  role="switch"
                  aria-checked={isUrgent}
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/25 hover:bg-brand-primary-hover active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Submitting Request...
                </>
              ) : (
                <>
                  <Sparkles size={16} aria-hidden="true" /> Submit Sourcing Request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}