// src/app/components/ui/Breadcrumbs.tsx

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react"; // 🔥 Added Home icon
import { BreadcrumbItem } from "@/sanity/types/product_types";

interface BreadcrumbsProps {
  crumbs: BreadcrumbItem[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  if (!crumbs || crumbs.length === 0) return null;

  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"
  ).replace(/\/$/, "");

  // 🔥 FIX 1: Robust JSON-LD (No missing 'item' fields)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.href.startsWith("/") ? crumb.href : "/" + crumb.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" className="w-full py-2">
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
          {/* HOME LINK (Always first) */}
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-brand-primary transition-colors"
              title="Back to Home"
            >
              <Home size={14} className="mb-0.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            {crumbs.length > 0 && (
              <ChevronRight
                size={12}
                className="mx-1 text-gray-300 dark:text-gray-700 shrink-0"
              />
            )}
          </li>

          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            // Don't repeat "Home" if it's already in the crumbs array
            if (crumb.name.toLowerCase() === "home") return null;

            return (
              <li key={index} className="flex items-center min-w-0">
                {isLast ? (
                  <span
                    className="text-gray-900 dark:text-white truncate max-w-30 sm:max-w-50 md:max-w-none"
                    aria-current="page"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="hover:text-brand-primary transition-colors truncate max-w-25 sm:max-w-none"
                    >
                      {crumb.name}
                    </Link>
                    <ChevronRight
                      size={12}
                      className="mx-1 text-gray-300 dark:text-gray-700 shrink-0"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
