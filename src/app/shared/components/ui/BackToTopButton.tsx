// src/app/shared/components/ui/BackToTopButton.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastUpdateRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    // ✅ Throttle: update at most every 100ms
    if (now - lastUpdateRef.current < 100) return;
    lastUpdateRef.current = now;

    const scrollTop = window.scrollY;
    setIsVisible(scrollTop > 300);

    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setProgress(scrollPercent);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const size = 44;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="group fixed bottom-44 lg:bottom-26 right-4 lg:right-1 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 p-0"
          aria-label="Back to Top"
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-gray-100 dark:text-gray-700"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-gray-800 dark:text-white transition-all duration-100 ease-out"
            />
          </svg>

          <ArrowUp
            size={18}
            strokeWidth={2.5}
            className="text-gray-800 dark:text-white z-10"
            aria-hidden="true"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}