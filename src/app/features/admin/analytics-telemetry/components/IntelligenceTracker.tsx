"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { logUserEvent, syncAbandonedCart } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
import { useSession } from "next-auth/react";
import { SecureTelemetryEvent } from "@/types"; 

interface UserInterfaceSession {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}

interface ElementMetadata {
  tagName: string;
  className: string;
  innerText: string;
}

interface OfflineEvent {
  eventType: SecureTelemetryEvent;
  path: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const OFFLINE_QUEUE_KEY = "pocketvalue_offline_queue";

function getOfflineQueue(): OfflineEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const rawData = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!rawData) return [];
    const parsedData = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      return parsedData as OfflineEvent[];
    }
  } catch (err) {
    console.error("TELEMETRY: Offline local storage queue corruption cleared.", err);
  }
  return [];
}

function saveOfflineQueue(queue: OfflineEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("TELEMETRY: Failed to write to offline queue storage.", err);
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export default function IntelligenceTracker() {
  const pathname = usePathname();
  const { cartItems, subtotal } = useStateContext();
  const { data: rawSession } = useSession();
  const session = rawSession as unknown as UserInterfaceSession; 

  const lastTrackedUrl = useRef("");
  const lastSyncedCart = useRef("");

  const clickCount = useRef(0);
  const lastClickTime = useRef(0);
  const lastClickedMeta = useRef<ElementMetadata | null>(null);

  const safeLogUserEvent = async (
    eventType: SecureTelemetryEvent, 
    path: string, 
    metadata?: Record<string, unknown>
  ) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      const queue = getOfflineQueue();
      queue.push({ eventType, path, metadata, timestamp: new Date().toISOString() });
      saveOfflineQueue(queue);
      return { success: false, buffered: true };
    }

    try {
      return await logUserEvent(eventType, path, metadata);
    } catch (e: unknown) {
      const queue = getOfflineQueue();
      queue.push({ eventType, path, metadata, timestamp: new Date().toISOString() });
      saveOfflineQueue(queue);
      return { success: false, buffered: true };
    }
  };

  useEffect(() => {
    const handleOnline = async () => {
      if (typeof window !== "undefined") {
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          localStorage.removeItem(OFFLINE_QUEUE_KEY);
          for (const event of queue) {
            try {
              await logUserEvent(event.eventType, event.path, {
                ...event.metadata,
                is_offline_backfilled: true,
                buffered_timestamp: event.timestamp
              });
            } catch {
              // Fail gracefully
            }
          }
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // ✅ FIX 1: Resolved React 18 Strict Mode mount/unmount interval cancellation
  useEffect(() => {
    const sendSilentPulse = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      const ua = navigator.userAgent;
      const params = new URLSearchParams(window.location.search);
      try {
        await fetch("/api/telemetry/pulse", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            utmSource: params.get("utm_source") || "Direct",
            utmMedium: params.get("utm_medium") || "None",
            utmCampaign: params.get("utm_campaign") || "None",
            os: ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "MacOS" : "Other",
            device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
          }),
        });
      } catch {
        // Suppress pulse network failure logs
      }
    };
    
    sendSilentPulse();
    const interval = setInterval(sendSilentPulse, 40000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentPath = pathname;
    if (currentPath === lastTrackedUrl.current) return;

    const viewKey = `pv_v4_view_${currentPath}`;
    if (sessionStorage.getItem(viewKey)) {
      lastTrackedUrl.current = currentPath;
      return;
    }

    lastTrackedUrl.current = currentPath;

    let eventType: SecureTelemetryEvent = "page_view";
    if (pathname === "/checkout") eventType = "checkout_start";
    if (pathname.startsWith("/search")) eventType = "search";

    let performanceMetadata = {};
    if (typeof window !== "undefined" && window.performance) {
      try {
        const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntry) {
          performanceMetadata = {
            dom_content_loaded_ms: Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime),
            page_load_duration_ms: Math.round(navigationEntry.loadEventEnd - navigationEntry.startTime)
          };
        }
      } catch {
        // Safe bypass
      }
    }

    const params = new URLSearchParams(window.location.search);

    safeLogUserEvent(eventType, currentPath, {
      searchTerm: params.get("q") || undefined,
      ...performanceMetadata 
    })
      .then(() => {
        sessionStorage.setItem(viewKey, "true");
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const handleJSErrors = (e: ErrorEvent) => {
      const errorStack = e.error instanceof Error ? e.error.stack : "N/A";
      safeLogUserEvent('js_exception', pathname, {
        error_message: e.message || 'Unknown Javascript Exception',
        error_stack: errorStack,
        file: e.filename || 'N/A',
        line: e.lineno || 0,
        column: e.colno || 0
      });
    };

    const handlePromiseRejections = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const errorMessage = reason instanceof Error ? reason.message : String(reason);
      const errorStack = reason instanceof Error ? reason.stack : "N/A";
      safeLogUserEvent('js_exception', pathname, {
        error_message: errorMessage || 'Unhandled Promise Rejection',
        error_stack: errorStack,
        exception_source: 'promise_rejection'
      });
    };

    window.addEventListener('error', handleJSErrors);
    window.addEventListener('unhandledrejection', handlePromiseRejections);
    return () => {
      window.removeEventListener('error', handleJSErrors);
      window.removeEventListener('unhandledrejection', handlePromiseRejections);
    };
  }, [pathname]);

  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY < 20 && subtotal > 0) {
        const exitIntentKey = `pv_exit_intent_${pathname}`;
        
        if (!sessionStorage.getItem(exitIntentKey)) {
          safeLogUserEvent('exit_intent_triggered', pathname, {
            cart_subtotal: subtotal,
            total_items: cartItems.length
          });
          sessionStorage.setItem(exitIntentKey, 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleExitIntent);
    return () => document.removeEventListener('mouseleave', handleExitIntent);
  }, [pathname, subtotal, cartItems]);

  useEffect(() => {
    const handleRageClicks = (e: MouseEvent) => {
      const now = Date.now();
      const targetElement = e.target as HTMLElement;
      if (!targetElement) return;

      // ✅ FIX 2: Added deep strict check to safely handle both HTML and SVG classNames
      const rawClassName = targetElement.className;
      const resolvedClassName = typeof rawClassName === "string" 
        ? rawClassName 
        : (rawClassName && typeof rawClassName === "object" && "baseVal" in rawClassName)
          ? (rawClassName as SVGAnimatedString).baseVal
          : "N/A";

      const currentMeta: ElementMetadata = {
        tagName: targetElement.tagName.toLowerCase(),
        className: resolvedClassName || 'N/A',
        innerText: targetElement.innerText?.substring(0, 30) || 'N/A'
      };

      const isSameElement = lastClickedMeta.current &&
        lastClickedMeta.current.tagName === currentMeta.tagName &&
        lastClickedMeta.current.className === currentMeta.className &&
        lastClickedMeta.current.innerText === currentMeta.innerText;

      if (isSameElement && now - lastClickTime.current < 1500) {
        clickCount.current++;
        if (clickCount.current >= 3) {
          safeLogUserEvent('rage_click_detected', pathname, {
            element_tag: currentMeta.tagName,
            element_classes: currentMeta.className,
            element_text: currentMeta.innerText,
            click_coordinates: { x: e.clientX, y: e.clientY }
          });
          clickCount.current = 0; 
        }
      } else {
        clickCount.current = 1;
        lastClickedMeta.current = currentMeta;
      }
      lastClickTime.current = now;
    };

    document.addEventListener('click', handleRageClicks);
    return () => document.removeEventListener('click', handleRageClicks);
  }, [pathname]);

  useEffect(() => {
    const sessionStartPending = getCookie("pv_session_start_pending");
    if (sessionStartPending === "true") {
      safeLogUserEvent('session_start', pathname, {
        utm_source: getCookie("utm_source") || "Direct",
        utm_medium: getCookie("utm_medium") || "None",
        utm_campaign: getCookie("utm_campaign") || "None",
        referrer: typeof document !== "undefined" ? document.referrer : "none"
      });
      eraseCookie("pv_session_start_pending");
    }
  }, [pathname]);

  useEffect(() => {
    const recoveredCartPending = getCookie("pv_recovered_cart_pending");
    if (recoveredCartPending === "true") {
      safeLogUserEvent('recovered_cart_conversions', pathname, {
        utm_source: getCookie("utm_source") || "none",
        utm_campaign: getCookie("utm_campaign") || "none",
        cart_subtotal: subtotal,
        item_count: cartItems.length
      });
      eraseCookie("pv_recovered_cart_pending");
    }
  }, [pathname, subtotal, cartItems]);

  useEffect(() => {
    const handleSupportClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const anchor = target.closest('a');
      if (anchor && (anchor.href.includes("wa.me") || anchor.href.includes("whatsapp.com") || anchor.href.includes("chat") || anchor.href.includes("support"))) {
        safeLogUserEvent('support_engagement_click', pathname, {
          target_url: anchor.href,
          link_text: anchor.innerText?.substring(0, 30) || 'N/A'
        });
      }
    };

    document.addEventListener('click', handleSupportClick);
    return () => document.removeEventListener('click', handleSupportClick);
  }, [pathname]);

  useEffect(() => {
    const handleAppInstalled = () => {
      safeLogUserEvent('pwa_prompt_metric', pathname, {
        action: 'installed',
        platform: /Mobi|Android/i.test(navigator.userAgent) ? 'android' : 'desktop'
      });
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [pathname]);

  useEffect(() => {
    const user = session?.user;
    if (!user?.id) return; 

    const cartSnapshot = JSON.stringify(cartItems) + subtotal;
    if (cartSnapshot === lastSyncedCart.current) return;

    const handler = setTimeout(async () => {
      try {
        const contactInfo = { 
          email: user.email ?? undefined,
          phone: user.phone ?? undefined
        };
          
        await syncAbandonedCart(cartItems, subtotal, contactInfo);
        lastSyncedCart.current = cartSnapshot;
      } catch {
        // Fail silently
      }
    }, 4000);

    return () => clearTimeout(handler);
  }, [cartItems, subtotal, session]);

  return null;
}