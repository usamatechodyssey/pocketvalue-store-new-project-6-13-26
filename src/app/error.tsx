// 📂 src/app/error.tsx

"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Home, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // ✅ Log error to monitoring service (Sentry/DataDog/Console)
    console.error("🚨 Application Error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });

    // ✅ Optional: Send to your analytics/error tracking service
    // if (typeof window !== "undefined" && window.logError) {
    //   window.logError(error);
    // }
  }, [error]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await reset();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* 🎨 Background Ambient Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* 🏷️ Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-red-500" />
          </span>
          {error.digest ? `Error #${error.digest.slice(0, 8)}` : "System Error"}
        </div>

        {/* 🎯 Main Error Display */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={64} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* 📝 Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Something Went Wrong
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            We encountered an unexpected error while loading this page. 
            Our team has been notified and is working on a fix.
          </p>
          {error.message && (
            <div className="max-w-md mx-auto mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                <span className="font-bold text-gray-700 dark:text-gray-300">Error:</span> {error.message}
              </p>
            </div>
          )}
        </div>

        {/* 🔗 Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <RefreshCw size={18} className={isResetting ? "animate-spin" : ""} />
            {isResetting ? "Retrying..." : "Try Again"}
          </button>

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
            Need immediate assistance?
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
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}