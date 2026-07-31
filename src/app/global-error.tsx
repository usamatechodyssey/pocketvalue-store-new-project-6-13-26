// 📂 src/app/global-error.tsx

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RefreshCw, MessageCircle, Server } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // ✅ Detect dark mode from html class (consistent with next-themes)
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    // ✅ Log critical error to monitoring service
    console.error("🚨 GLOBAL ERROR (Root Boundary):", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await reset();
    } finally {
      setIsResetting(false);
    }
  };

  // ✅ Determine theme classes
  const bgClass = isDark ? "bg-gray-950" : "bg-white";
  const textClass = isDark ? "text-gray-100" : "text-gray-900";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";
  const cardBgClass = isDark ? "bg-gray-900/80" : "bg-white/80";

  return (
    <html lang="en" className={isDark ? "dark" : ""}>
      <body className={`${bgClass} ${textClass} font-sans antialiased`}>
        <div className={`relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden ${bgClass}`}>
          {/* 🎨 Background Ambient Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-2xl w-full text-center">
            {/* 🏷️ Error Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-red-500" />
              </span>
              Critical System Error
              {error.digest && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 rounded text-[8px] font-mono">
                  #{error.digest.slice(0, 6)}
                </span>
              )}
            </div>

            {/* 🎯 Main Error Display */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center border-4 border-red-500/20">
                <Server size={56} className="text-red-500" strokeWidth={1.5} />
              </div>
            </div>

            {/* 📝 Message */}
            <div className="space-y-4 mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                System Unavailable
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                We're experiencing technical difficulties. Our team has been alerted 
                and is working to restore service as quickly as possible.
              </p>
              {error.message && process.env.NODE_ENV === "development" && (
                <div className="max-w-md mx-auto mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 text-left">
                  <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                    <span className="font-bold">Error:</span> {error.message}
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
                If the issue persists, contact our support team.
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
                  <RefreshCw size={16} />
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}