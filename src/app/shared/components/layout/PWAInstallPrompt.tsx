"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// ✅ Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_DISMISS_KEY = "pwa_popup_dismissed_time";
const PWA_SESSION_LOGGED_KEY = "pv_pwa_prompt_shown_logged";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();

  // =================================================================
  // Dismissal check – returns true if the popup should be hidden
  // =================================================================
  const shouldHidePopup = useCallback(() => {
    // 1. Already in standalone mode
    if (isStandalone) return true;

    // 2. Dismissed within the last 24 hours
    const dismissedTime = localStorage.getItem(PWA_DISMISS_KEY);
    if (dismissedTime) {
      const timePassed = Date.now() - parseInt(dismissedTime, 10);
      if (timePassed < 24 * 60 * 60 * 1000) {
        return true;
      }
    }

    return false;
  }, [isStandalone]);

  // =================================================================
  // Show prompt and log once per session
  // =================================================================
  const showPrompt = useCallback(() => {
    if (shouldHidePopup()) return;
    setIsVisible(true);

    // Log only once per session
    if (typeof window !== "undefined" && !sessionStorage.getItem(PWA_SESSION_LOGGED_KEY)) {
      sessionStorage.setItem(PWA_SESSION_LOGGED_KEY, "true");
      const platform = isIOS ? "ios" : "android";
      logUserEvent("pwa_prompt_metric", pathname || "/", {
        action: "prompt_shown",
        platform,
      });
    }
  }, [shouldHidePopup, isIOS, pathname]);

  // =================================================================
  // Effects
  // =================================================================
  useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Handle beforeinstallprompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      showPrompt();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show prompt immediately (no event)
    if (isIosDevice) {
      showPrompt();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [showPrompt]);

  // =================================================================
  // Handlers
  // =================================================================
  const handleAndroidInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    logUserEvent("pwa_prompt_metric", pathname || "/", {
      action: "install_button_clicked",
      platform: "android",
    });

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
      logUserEvent("pwa_prompt_metric", pathname || "/", {
        action: "install_accepted",
        platform: "android",
      });
    } else {
      logUserEvent("pwa_prompt_metric", pathname || "/", {
        action: "install_declined",
        platform: "android",
      });
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, pathname]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));

    logUserEvent("pwa_prompt_metric", pathname || "/", {
      action: "prompt_dismissed_manually",
      platform: isIOS ? "ios" : "android",
    });
  }, [isIOS, pathname]);

  // =================================================================
  // Render
  // =================================================================
  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-9999 md:hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-300 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 items-center">
          <div className="shrink-0 w-14 h-14 relative rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <Image src="/Logo1.png" alt="App Icon" fill className="object-cover" unoptimized />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              Install PocketValue App
            </h3>

            {isIOS ? (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">
                <p className="mb-2">For best experience:</p>
                <div className="flex items-center flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span>Tap</span>
                  <Share size={14} className="text-blue-500" />
                  <span>then</span>
                  <span className="font-bold flex items-center gap-1">
                    Add to Home Screen <PlusSquare size={14} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Add to Home Screen for quick access.
                </p>
                <button
                  onClick={handleAndroidInstall}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Install Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}