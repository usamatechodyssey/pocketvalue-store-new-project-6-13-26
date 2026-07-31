"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

export interface NavLink {
  label: string;
  url: string;
  position: "left" | "right";
  isHighlight: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  {
    label: "Deals & Offers",
    url: "/deals",
    position: "left",
    isHighlight: true,
  },
  {
    label: "Gift Cards",
    url: "/gift-cards",
    position: "left",
    isHighlight: false,
  },
  {
    label: "Sell on PocketValue",
    url: "/sell",
    position: "left",
    isHighlight: false,
  },
  {
    label: "Track Order",
    url: "/account/orders",
    position: "right",
    isHighlight: false,
  },
  {
    label: "Help & Support",
    url: "/faq",
    position: "right",
    isHighlight: false,
  },
  {
    label: "Request a Product",
    url: "/request-product",
    position: "right",
    isHighlight: true,
  },
];

interface SecondaryNavBarProps {
  isVisible: boolean;
  links?: NavLink[];
  onCategoryClick?: () => void;
}

export default function SecondaryNavBar({
  isVisible,
  links,
  onCategoryClick,
}: SecondaryNavBarProps) {
  const activeLinks = links && links.length > 0 ? links : DEFAULT_LINKS;
  
  const leftLinks = activeLinks.filter((link) => link.position === "left");
  const rightLinks = activeLinks.filter((link) => link.position === "right");
  
  // ✅ Ensure "Request a Product" always exists on right if custom links provided
  const hasRequestPageLink = activeLinks.some(link => link.url === "/request-product");
  if (!hasRequestPageLink && links && links.length > 0) {
    rightLinks.push({
      label: "Request a Product",
      url: "/request-product",
      position: "right",
      isHighlight: true,
    });
  }

  return (
    <nav
      // ✅ FIX 1: Added aria-label
      aria-label="Secondary navigation"
      className={`hidden lg:flex bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-[2px] w-full overflow-hidden transition-all duration-300 ease-out border-b border-gray-100 dark:border-gray-800 ${
        isVisible ? "h-10 opacity-100" : "h-0 opacity-0"
      }`}
    >
      <div className="w-full h-full flex items-center justify-between px-4 lg:px-12 max-w-480 mx-auto">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-6">
          {/* ✅ FIX 2 & 3: Added aria-label and aria-hidden on icon */}
          {onCategoryClick && (
            <button
              onClick={onCategoryClick}
              aria-label="Browse categories"
              className="flex lg:hidden items-center gap-2 text-[13px] font-bold text-gray-800 dark:text-gray-200 hover:text-brand-primary transition-colors border-r border-gray-200 dark:border-gray-700 pr-4 mr-2"
            >
              <Menu size={16} aria-hidden="true" />
              <span>Browse Categories</span>
            </button>
          )}

          {leftLinks.map((link, index) => (
            <Link
              key={`${link.label}-${index}`}
              href={link.url}
              className={`text-[13px] font-medium tracking-wide transition-all duration-200 
                ${
                  link.isHighlight
                    ? "text-brand-primary hover:text-brand-primary-hover font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          {rightLinks.map((link, index) => (
            <Link
              key={`${link.label}-${index}`}
              href={link.url}
              className={`text-[13px] font-medium tracking-wide transition-colors duration-200
                ${
                  link.isHighlight
                    ? "text-brand-primary hover:text-brand-primary-hover font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}