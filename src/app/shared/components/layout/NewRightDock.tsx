// 📂 src/app/shared/components/layout/NewRightDock.tsx

"use client";

import ThemeSwitcher from "./ThemeSwitcher";
import BackToTopButton from "../ui/BackToTopButton";
import { HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

interface NewRightDockProps {
  topOffset: number;
}

// ✅ HIGH-CONTRAST GLASSMORPHIC HUD TOOLTIP
const TooltipWrapper = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="group relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center">
    {children}
    {/* ✅ FIX 1 & 2: Shifted offset to 'right-16' so the tooltip floats cleanly outside the dock border line without overlapping */}
    <span
      className="absolute right-16 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800/80 text-white text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl translate-x-2 group-hover:translate-x-0"
      role="tooltip"
    >
      {label}
    </span>
  </div>
);

export default function NewRightDock({ topOffset }: NewRightDockProps) {
  const safeTopOffset = typeof topOffset === 'number' && !isNaN(topOffset) ? topOffset : 80;
  const safeHeight = `calc(100vh - ${safeTopOffset}px)`;

  return (
    <aside
      // ✅ GLASSMORPHIC BACKDROP: Translucent white/gray-900 with clean thin borders
      className="hidden lg:flex flex-col fixed right-0 w-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 ease-out z-35 shadow-[-2px_0_15px_rgba(0,0,0,0.01)]"
      style={{
        top: `${safeTopOffset}px`,
        height: safeHeight,
        minHeight: '200px',
      }}
      aria-label="Utility navigation"
      role="complementary"
    >
      {/* Top Icons Section */}
      <div className="grow pt-8 flex flex-col items-center gap-3 select-none">
        {/* Help / Support */}
        <TooltipWrapper label="Help Center">
          <Link
            href="/faq"
            aria-label="Help Center"
            /* ✅ FIX 3: Removed 'focus:ring-2 focus:ring-offset-2' which created the ugly orange bracket artifacts! */
            className="text-zinc-400 dark:text-zinc-500 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 active:scale-90 outline-none focus:outline-none focus-visible:outline-none rounded-full p-1"
          >
            <HelpCircle size={22} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </TooltipWrapper>

        {/* WhatsApp / Contact */}
        <TooltipWrapper label="Contact Us">
          <Link
            href="/contact-us"
            aria-label="Contact Us"
            /* ✅ FIX 3: Removed 'focus:ring-2 focus:ring-offset-2' which created the ugly orange bracket artifacts! */
            className="text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-300 active:scale-90 outline-none focus:outline-none focus-visible:outline-none rounded-full p-1"
          >
            <MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </TooltipWrapper>
      </div>

      {/* Bottom Utility Section */}
      <div className="shrink-0 p-3 pb-8 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center gap-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
        <ThemeSwitcher />
        <BackToTopButton />
      </div>
    </aside>
  );
}