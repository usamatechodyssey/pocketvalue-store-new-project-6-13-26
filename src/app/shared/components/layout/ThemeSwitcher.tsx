// "use client";

// import { useState, useEffect } from "react";
// import { useTheme } from "next-themes";
// import { Sun, Moon } from "lucide-react";

// export default function ThemeSwitcher() {
//   const [mounted, setMounted] = useState(false);
//   // ✅ Removed unused `theme` variable
//   const { setTheme, resolvedTheme } = useTheme();

//   useEffect(() => {
//     const timer = setTimeout(() => setMounted(true), 0);
//     return () => clearTimeout(timer);
//   }, []);

//   if (!mounted) {
//     return <div className="h-12 w-12 rounded-xl" aria-hidden="true" />;
//   }

//   const toggleTheme = () => {
//     setTheme(resolvedTheme === "dark" ? "light" : "dark");
//   };

//   const isDark = resolvedTheme === "dark";

//   return (
//     <button
//       onClick={toggleTheme}
//       className="group relative p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-brand-primary flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
//       aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
//     >
//       <div className="relative w-6 h-6">
//         <Sun
//           size={24}
//           strokeWidth={1.5}
//           className={`absolute inset-0 transition-all duration-500 ease-in-out transform origin-center
//             ${!isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
//           aria-hidden="true"
//         />
//         <Moon
//           size={24}
//           strokeWidth={1.5}
//           className={`absolute inset-0 transition-all duration-500 ease-in-out transform origin-center
//             ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
//           aria-hidden="true"
//         />
//       </div>

//       <span
//         className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 dark:border-black/5 translate-x-2 group-hover:translate-x-0"
//         role="tooltip"
//       >
//         {isDark ? "Light Mode" : "Dark Mode"}
//       </span>
//     </button>
//   );
// }
// 📂 src/app/shared/components/layout/ThemeSwitcher.tsx

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="h-12 w-12 rounded-xl" aria-hidden="true" />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-3 rounded-xl bg-transparent border border-transparent hover:bg-gray-100/60 hover:border-zinc-200/60 dark:hover:bg-zinc-900/60 dark:hover:border-zinc-800/80 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-brand-primary flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 cursor-pointer shadow-2xs"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative w-6 h-6">
        <Sun
          size={24}
          strokeWidth={1.5}
          className={`absolute inset-0 transition-all duration-500 ease-out transform origin-center
            ${!isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
          aria-hidden="true"
        />
        <Moon
          size={24}
          strokeWidth={1.5}
          className={`absolute inset-0 transition-all duration-500 ease-out transform origin-center
            ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
          aria-hidden="true"
        />
      </div>

      {/* ✅ ADVANCED HUD MICRO-TOOLTIP: Glassmorphic high-contrast design matching central admin view widgets */}
      <span
        className="absolute right-14 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800/80 text-white text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl translate-x-2 group-hover:translate-x-0"
        role="tooltip"
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}