// src/app/shared/components/WebVitals.tsx
// ================================================================
// 📊 WEB VITALS REPORTING (Client Component)
// ================================================================
// This component uses the web-vitals library to report Core Web Vitals
// including INP (Interaction to Next Paint) to Vercel Analytics.
// ================================================================

"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // INP threshold check: Google recommends < 200ms
    if (metric.name === "INP" && metric.value > 200) {
      console.warn(`[INP] Poor interaction response: ${Math.round(metric.value)}ms`);
    }

    // Vercel Analytics automatically captures web vitals via @vercel/analytics
    // This is just an additional safety net
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", metric.name, {
        value: Math.round(metric.value),
        event_category: "Web Vitals",
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}