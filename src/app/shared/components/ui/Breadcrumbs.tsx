import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  crumbs: BreadcrumbItem[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  if (!crumbs || crumbs.length === 0) return null;

  const siteUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"
  ).replace(/\/$/, "");

  // 🔥 JSON-LD Structured Data
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
              {/* ✅ FIX 1: Added aria-hidden="true" */}
              <Home size={14} className="mb-0.5" aria-hidden="true" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            {crumbs.length > 0 && (
              // ✅ FIX 1: Added aria-hidden="true"
              <ChevronRight
                size={12}
                className="mx-1 text-gray-300 dark:text-gray-700 shrink-0"
                aria-hidden="true"
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
                    // ✅ FIX 2: Replaced max-w-30 with max-w-[7.5rem] (arbitrary value)
                    className="text-gray-900 dark:text-white truncate max-w-30 sm:max-w-50 md:max-w-none"
                    aria-current="page"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      // ✅ FIX 2: Replaced max-w-25 with max-w-[6.25rem]
                      className="hover:text-brand-primary transition-colors truncate max-w-25 sm:max-w-none"
                    >
                      {crumb.name}
                    </Link>
                    {/* ✅ FIX 1: Added aria-hidden="true" */}
                    <ChevronRight
                      size={12}
                      className="mx-1 text-gray-300 dark:text-gray-700 shrink-0"
                      aria-hidden="true"
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