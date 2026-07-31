// "use client";

// import React, { useState, useEffect, memo, useCallback, useRef, useMemo } from "react";
// import { Pause, Play } from "lucide-react";

// const DEFAULT_TAGLINES = [
//   "🌟 Welcome to PocketValue - Premium Shopping Experience",
//   "💎 100% Authentic Products Guaranteed",
//   "🇵🇰 Pakistan's Most Trusted Lifestyle Store",
//   "✨ Elevate Your Everyday with PocketValue",
//   "📦 Fast & Secure Delivery Nationwide",
// ];

// interface TopActionBarProps {
//   announcements?: string[];
// }

// const TopActionBar = memo(({ announcements }: TopActionBarProps) => {
//   const [mounted, setMounted] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isManuallyPaused, setIsManuallyPaused] = useState(false);
//   const marqueeRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ✅ FIX 1: Memoize items to prevent recalculation on every render
//   const items = useMemo(
//     () => (announcements && announcements.length > 0 ? announcements : DEFAULT_TAGLINES),
//     [announcements]
//   );

//   // ✅ FIX 1: Memoize duplicated items
//   const duplicatedItems = useMemo(() => [...items, ...items], [items]);

//   // ✅ FIX 1: Memoize animation duration
//   const animationDuration = useMemo(() => {
//     const totalLength = items.reduce((acc, item) => acc + item.length, 0);
//     const baseSpeed = 20;
//     const baseLength = 100;
//     return Math.max(15, Math.min(60, (totalLength / baseLength) * baseSpeed));
//   }, [items]);

//   const isPaused = isHovered || isManuallyPaused;

//   const handleToggle = useCallback(() => {
//     setIsManuallyPaused((prev) => !prev);
//   }, []);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === " " || e.key === "Enter") {
//         e.preventDefault();
//         handleToggle();
//       }
//     },
//     [handleToggle]
//   );

//   if (!mounted) {
//     return (
//       <div
//         className="w-full h-7 bg-brand-secondary border-b border-white/5"
//         aria-hidden="true"
//       />
//     );
//   }

//   return (
//     <div
//       className="relative w-full h-7 overflow-hidden z-70 bg-brand-secondary text-white border-b border-white/5 flex items-center"
//       role="region"
//       aria-label="Announcements"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <style jsx>{`
//         @keyframes marquee-scroll {
//           0% {
//             transform: translateX(0);
//           }
//           100% {
//             transform: translateX(-50%);
//           }
//         }
//         .animate-marquee {
//           display: flex;
//           width: max-content;
//           animation: marquee-scroll ${animationDuration}s linear infinite;
//           will-change: transform;
//         }
//         .animate-marquee.paused {
//           animation-play-state: paused;
//         }
//         @media (prefers-reduced-motion: reduce) {
//           .animate-marquee {
//             animation: none !important;
//           }
//         }
//       `}</style>

//       <div className="marquee-container w-full overflow-hidden select-none relative">
//         {/* ✅ Main marquee content (hidden from screen readers) */}
//         <div aria-hidden="true" className="w-full overflow-hidden">
//           <div
//             ref={marqueeRef}
//             className={`animate-marquee ${isPaused ? "paused" : ""}`}
//           >
//             {duplicatedItems.map((item, index) => (
//               <div key={index} className="flex items-center px-10">
//                 <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap opacity-90">
//                   {item}
//                 </span>
//                 {/* ✅ FIX 2: Added aria-hidden on decorative dot */}
//                 <div
//                   className="ml-10 w-1 h-1 bg-white/40 rounded-full shrink-0"
//                   aria-hidden="true"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Pause/Play Button */}
//         <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
//           <button
//             onClick={handleToggle}
//             onKeyDown={handleKeyDown}
//             aria-label={isManuallyPaused ? "Play announcements" : "Pause announcements"}
//             aria-pressed={isManuallyPaused}
//             className={`
//               p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors
//               focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1
//               focus:ring-offset-brand-secondary
//             `}
//           >
//             {isManuallyPaused ? (
//               <Play size={14} aria-hidden="true" />
//             ) : (
//               <Pause size={14} aria-hidden="true" />
//             )}
//           </button>
//         </div>

//         {/* ✅ Screen reader accessible content */}
//         <div className="sr-only" aria-live="polite" aria-atomic="true">
//           {items.map((item, index) => (
//             <span key={index}>{item}</span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// });

// TopActionBar.displayName = "TopActionBar";

// export default TopActionBar;
"use client";

import React, { useState, memo, useCallback, useMemo } from "react";
import { Pause, Play } from "lucide-react";

const DEFAULT_TAGLINES = [
  "🌟 Welcome to PocketValue - Premium Shopping Experience",
  "💎 100% Authentic Products Guaranteed",
  "🇵🇰 Pakistan's Most Trusted Lifestyle Store",
  "✨ Elevate Your Everyday with PocketValue",
  "📦 Fast & Secure Delivery Nationwide",
];

interface TopActionBarProps {
  announcements?: string[];
}

const TopActionBar = memo(({ announcements }: TopActionBarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  // Memoize items to prevent recalculation on every render
  const items = useMemo(
    () => (announcements && announcements.length > 0 ? announcements : DEFAULT_TAGLINES),
    [announcements]
  );

  // Memoize duplicated items
  const duplicatedItems = useMemo(() => [...items, ...items], [items]);

  // Memoize animation duration
  const animationDuration = useMemo(() => {
    const totalLength = items.reduce((acc, item) => acc + item.length, 0);
    const baseSpeed = 20;
    const baseLength = 100;
    return Math.max(15, Math.min(60, (totalLength / baseLength) * baseSpeed));
  }, [items]);

  const isPaused = isHovered || isManuallyPaused;

  const handleToggle = useCallback(() => {
    setIsManuallyPaused((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  return (
    <div
      className="relative w-full h-7 overflow-hidden z-70 bg-brand-secondary text-white border-b border-white/5 flex items-center"
      role="region"
      aria-label="Announcements"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CSS Styles optimized to avoid runtime interpolation */}
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
          animation: marquee-scroll var(--marquee-duration, 30s) linear infinite;
          will-change: transform;
        }
        .animate-marquee.paused {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
          }
        }
      `}</style>

      <div className="marquee-container w-full overflow-hidden select-none relative">
        {/* Main marquee content (hidden from screen readers) */}
        <div aria-hidden="true" className="w-full overflow-hidden">
          <div
            className={`animate-marquee ${isPaused ? "paused" : ""}`}
            style={{
              animationDuration: `${animationDuration}s`,
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div key={index} className="flex items-center px-10">
                {/* ✅ Contrast Fix: Removed opacity-90 so the white text is 100% solid on blue */}
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                  {item}
                </span>
                <div
                  className="ml-10 w-1 h-1 bg-white/40 rounded-full shrink-0"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pause/Play Button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            aria-label={isManuallyPaused ? "Play announcements" : "Pause announcements"}
            aria-pressed={isManuallyPaused}
            className={`
              p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors
              focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1
              focus:ring-offset-brand-secondary
            `}
          >
            {isManuallyPaused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Screen reader accessible content */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {items.map((item, index) => (
            <span key={index}>{item} </span>
          ))}
        </div>
      </div>
    </div>
  );
});

TopActionBar.displayName = "TopActionBar";

export default TopActionBar;