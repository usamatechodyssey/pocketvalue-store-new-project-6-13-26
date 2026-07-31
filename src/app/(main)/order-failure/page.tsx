// 📂 src/app/order-failure/page.tsx

import Link from "next/link";
import { XCircle, ArrowRight, MessageCircle, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type OrderFailurePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrderFailurePage({
  searchParams,
}: OrderFailurePageProps) {
  const resolvedSearchParams = await searchParams;

  const reason = (resolvedSearchParams?.reason as string) || "An unknown error occurred.";
  const orderId = resolvedSearchParams?.orderId as string | undefined;

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* 🎨 Background Ambient Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* 🏷️ Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-red-500" />
          </span>
          Payment Failed
          {orderId && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 rounded text-[8px] font-mono">
              #{orderId.slice(-6).toUpperCase()}
            </span>
          )}
        </div>

        {/* 🎯 Main Error Display */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center border-4 border-red-500/20">
            <XCircle size={56} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* 📝 Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Payment Unsuccessful
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            We couldn't process your payment. Please check your payment details
            and try again, or contact our support team for assistance.
          </p>
        </div>

        {/* 🔍 Error Details */}
        <div className="max-w-md mx-auto mb-10 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 text-left">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Error Details
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">
            {reason}
          </p>
          {orderId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
              Order Reference: {orderId}
            </p>
          )}
        </div>

        {/* 🔗 Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <ArrowRight size={18} />
            Try Again
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>

        {/* 🔍 Quick Help */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-4">
            Need help with your payment?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/contact-us"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <MessageCircle size={16} />
              Contact Support
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="/faq"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <MessageCircle size={16} />
              Payment FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}