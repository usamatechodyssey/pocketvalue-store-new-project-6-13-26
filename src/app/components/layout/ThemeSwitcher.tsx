"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Added for extra polish

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  // 🔥 FIX: 'resolvedTheme' use kiya taake 'system' settings bhi sahi track hon
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Next tick update to avoid hydration mismatch
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Skeleton Placeholder (Height/Width fixed taake layout jump na kare)
  if (!mounted) {
    return <div className="h-12 w-12 rounded-xl" aria-hidden="true" />;
  }

  const toggleTheme = () => {
    // Agar resolved dark hai toh light kar do, warna dark
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-brand-primary flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <Sun
          size={24}
          strokeWidth={1.5}
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform origin-center
                ${!isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
        />

        {/* Moon Icon */}
        <Moon
          size={24}
          strokeWidth={1.5}
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform origin-center
                ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
        />
      </div>

      {/* Tooltip - Adjusted for Right Sidebar position */}
      <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 dark:border-black/5 translate-x-2 group-hover:translate-x-0">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
