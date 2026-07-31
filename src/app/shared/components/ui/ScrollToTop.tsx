"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Timeout isliye taake page render hone ke foran baad scroll ho
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // "smooth" mat rakhen, warna user ko glitch feel hoga
      });
    }, 10); // 10ms delay kafi hai

    return () => clearTimeout(timer);
  }, [pathname]); // Jab bhi Path change hoga, ye chalega

  return null;
}