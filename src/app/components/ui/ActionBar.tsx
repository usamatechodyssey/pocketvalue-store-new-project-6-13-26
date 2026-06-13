"use client";

import React, { useState, useEffect, memo } from "react";

const DEFAULT_TAGLINES = [
  "🌟 Welcome to PocketValue - Premium Shopping Experience",
  "💎 100% Authentic Products Guaranteed",
  "🇵🇰 Pakistan's Most Trusted Lifestyle Store",
  "✨ Elevate Your Everyday with PocketValue",
  "📦 Fast & Secure Delivery Nationwide",
];

const TopActionBar = memo(({ announcements }: { announcements?: string[] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stable Skeleton to prevent Layout Shift (CLS)
  if (!mounted) {
    return (
      <div className="w-full h-7 bg-brand-secondary border-b border-white/5" />
    );
  }

  const items =
    announcements && announcements.length > 0
      ? announcements
      : DEFAULT_TAGLINES;
  // 4x duplication ensures a seamless loop on wide monitors
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <div
      className="relative w-full h-7 overflow-hidden z-70 bg-brand-secondary text-white border-b border-white/5 flex items-center"
      role="marquee"
      aria-live="off"
    >
      <style jsx>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee-scroll 40s linear infinite;
        }
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-container w-full overflow-hidden select-none">
        <div className="animate-marquee">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="flex items-center px-10">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap opacity-90">
                {item}
              </span>
              <div className="ml-10 w-1 h-1 bg-white/40 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TopActionBar;
