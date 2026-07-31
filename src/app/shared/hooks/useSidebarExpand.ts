"use client";

import { useState, useCallback } from "react";

interface UseSidebarExpandReturn {
  isExpanded: boolean;
  toggleExpand: () => void;
  sidebarWidthClass: string; // Tailwind class
}

export function useSidebarExpand(initialState: boolean = false): UseSidebarExpandReturn {
  const [isExpanded, setIsExpanded] = useState(initialState);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // w-16 = 4rem, w-56 = 14rem
  const sidebarWidthClass = isExpanded ? "w-56" : "w-16";

  return {
    isExpanded,
    toggleExpand,
    sidebarWidthClass,
  };
}