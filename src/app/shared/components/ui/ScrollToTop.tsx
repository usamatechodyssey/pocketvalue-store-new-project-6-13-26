// "use client";

// import { useEffect } from "react";
// import { usePathname } from "next/navigation";

// export default function ScrollToTop() {
//   const pathname = usePathname();

//   useEffect(() => {
//     // Timeout isliye taake page render hone ke foran baad scroll ho
//     const timer = setTimeout(() => {
//       window.scrollTo({
//         top: 0,
//         left: 0,
//         behavior: "instant", // "smooth" mat rakhen, warna user ko glitch feel hoga
//       });
//     }, 10); // 10ms delay kafi hai

//     return () => clearTimeout(timer);
//   }, [pathname]); // Jab bhi Path change hoga, ye chalega

//   return null;
// }
// 📂 src/app/shared/components/ui/ScrollToTop.tsx

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPopStateRef = useRef(false);

  // 1. Listen for browser Back/Forward (popstate) button clicks
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 2. Save current scroll position in sessionStorage before navigating away or scrolling
  useEffect(() => {
    const fullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const saveScrollPosition = () => {
      if (!isPopStateRef.current && typeof window !== "undefined") {
        sessionStorage.setItem(`pv_scroll_pos_${fullUrl}`, window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    return () => {
      saveScrollPosition();
      window.removeEventListener("scroll", saveScrollPosition);
    };
  }, [pathname, searchParams]);

  // 3. Handle Scroll Restoration on Back Button OR Smooth Scroll-to-Top on Pagination/New Nav
  useEffect(() => {
    const fullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const savedPos = sessionStorage.getItem(`pv_scroll_pos_${fullUrl}`);

    const timer = setTimeout(() => {
      if (isPopStateRef.current && savedPos !== null) {
        // ✅ BACK BUTTON CLICKED: Restore saved scroll position instantly!
        window.scrollTo({
          top: Number(savedPos),
          left: 0,
          behavior: "instant",
        });
      } else {
        // ✅ NEW LINK / PAGINATION CLICKED: Scroll smoothly to top!
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
      isPopStateRef.current = false;
    }, 25);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}