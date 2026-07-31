"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

const STORAGE_KEY = "pocketvalue_cookie_consent_v1";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
          setIsVisible(true);
        }
      } catch (e) {
        console.error("Cookie consent check failed:", e);
      }
    }
  }, []);

  const handleConsentChoice = useCallback(
    (choice: "accepted" | "declined") => {
      try {
        localStorage.setItem(STORAGE_KEY, choice);
        setIsVisible(false);

        logUserEvent("cookie_consent_toggled", pathname || "/", {
          consent_status: choice,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `🔒 [Privacy Compliance] User has ${choice} cookie tracking preferences.`
        );
      } catch (e) {
        console.error("Failed to write cookie consent state:", e);
      }
    },
    [pathname]
  );

  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          // ✅ Changed bottom-18 to bottom-20 (standard Tailwind) or keep as is if you have custom
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-sm z-9999 animate-in"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-5 relative">
            {/* Decline button (cross) */}
            <button
              onClick={() => handleConsentChoice("declined")}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              aria-label="Decline all cookies"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0 mt-0.5">
                <Cookie size={20} className="fill-brand-primary/10 animate-bounce" />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck size={16} className="text-green-500" /> Cookie Preferences
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    We use cookies to analyze site traffic, personalize content, and optimize your experience. Choose your tracking preference below.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleConsentChoice("declined")}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold rounded-lg transition-all active:scale-[0.97]"
                    aria-label="Decline all non-essential cookies"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleConsentChoice("accepted")}
                    className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-black rounded-lg transition-all active:scale-[0.97] shadow-md shadow-brand-primary/10"
                    aria-label="Accept all cookies"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}