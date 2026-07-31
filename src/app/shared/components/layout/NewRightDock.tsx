"use client";

import ThemeSwitcher from "./ThemeSwitcher";
import BackToTopButton from "../ui/BackToTopButton";
import { HelpCircle, MessageCircle } from "lucide-react"; // ✅ Removed Bell
import Link from "next/link";

interface NewRightDockProps {
  topOffset: number;
}

// ✅ Tooltip wrapper with accessibility improvements
const TooltipWrapper = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="group relative p-3 rounded-xl transition-all duration-300">
    {children}
    <span
      className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1 rounded 
        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 
        transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg"
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
      className="hidden lg:flex flex-col fixed right-0 w-16 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-out z-30 shadow-[-2px_0_10px_rgba(0,0,0,0.02)]"
      style={{
        top: `${safeTopOffset}px`,
        height: safeHeight,
        minHeight: '200px',
      }}
      aria-label="Utility navigation"
      role="complementary"
    >
      {/* Top Icons Section */}
      <div className="grow pt-8 flex flex-col items-center gap-2">
        {/* Help / Support */}
        <TooltipWrapper label="Help Center">
          <Link
            href="/faq"
            aria-label="Help Center"
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors 
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 
              dark:focus:ring-offset-gray-900 rounded-full"
          >
            <HelpCircle size={24} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </TooltipWrapper>

        {/* WhatsApp / Contact */}
        <TooltipWrapper label="Contact Us">
          <Link
            href="/contact-us"
            aria-label="Contact Us"
            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors 
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 
              dark:focus:ring-offset-gray-900 rounded-full"
          >
            <MessageCircle size={24} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </TooltipWrapper>
      </div>

      {/* Bottom Utility Section */}
      <div className="shrink-0 p-4 pb-8 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <ThemeSwitcher />
        <BackToTopButton />
      </div>
    </aside>
  );
}