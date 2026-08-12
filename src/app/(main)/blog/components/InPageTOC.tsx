// 📂 src/app/blog/components/InPageTOC.tsx

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AlignLeft, ChevronRight } from "lucide-react";

// ================================================================
// ✅ TYPES
// ================================================================
export interface TOCHeading {
  id: string;      // Slugified element ID for anchor linking
  text: string;    // Plain heading text
  level: "h2" | "h3";
}

interface InPageTOCProps {
  body: any[];
}

export const slugifyHeading = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// ================================================================
// 🚀 MAIN COMPONENT — Right Sidebar In-Page Table of Contents
// ================================================================
export default function InPageTOC({ body }: InPageTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  
  // ✅ FLICKER FIX: Lock flag prevents scroll spy from flickering active state during smooth scroll animation
  const isManualClickingRef = useRef<boolean>(false);
  const clickLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Extract H2 and H3 Headings from Sanity PortableText Body
  const headings: TOCHeading[] = useMemo(() => {
    if (!body || !Array.isArray(body)) return [];

    const extracted: TOCHeading[] = [];

    body.forEach((block: any) => {
      if (block._type === "block" && (block.style === "h2" || block.style === "h3")) {
        const text = block.children
          ? block.children.map((c: any) => c.text || "").join("")
          : "";

        if (text.trim().length > 0) {
          const id = slugifyHeading(text);
          extracted.push({
            id,
            text,
            level: block.style as "h2" | "h3",
          });
        }
      }
    });

    return extracted;
  }, [body]);

  // 2. Active Scroll Spy Listener (Locked during manual link click)
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      // ✅ FLICKER FIX: If user manually clicked a TOC heading, skip scroll spy calculation during scroll
      if (isManualClickingRef.current) return;

      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) return;

      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className="bg-transparent space-y-3 font-mono select-none"
      aria-label="Table of contents"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/60 dark:border-zinc-800/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <AlignLeft size={13} className="text-brand-primary" />
        <span>On This Page</span>
      </div>

      {/* Headings List */}
      <ul className="space-y-1 text-xs font-sans">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;

          return (
            <li
              key={heading.id}
              className={`${heading.level === "h3" ? "pl-3 border-l border-zinc-200/50 dark:border-zinc-800/50 ml-1.5" : "pl-0"}`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  
                  // ✅ FLICKER FIX: Instantly lock activeId and suspend scroll spy during smooth scroll duration
                  setActiveId(heading.id);
                  isManualClickingRef.current = true;

                  const target = document.getElementById(heading.id);
                  if (target) {
                    const offsetPosition = target.offsetTop - 110;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }

                  if (clickLockTimerRef.current) clearTimeout(clickLockTimerRef.current);
                  clickLockTimerRef.current = setTimeout(() => {
                    isManualClickingRef.current = false;
                  }, 800); // 800ms lock matches smooth scroll animation
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-all no-underline hover:no-underline py-1.5 rounded-xl px-2.5 ${
                  isActive
                    ? "text-brand-primary font-bold bg-brand-primary/10 dark:bg-brand-primary/20 border-l-2 border-brand-primary shadow-[0_0_10px_rgba(255,143,50,0.15)]"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                {isActive && <ChevronRight size={11} className="shrink-0 text-brand-primary" />}
                <span className="line-clamp-2">{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}