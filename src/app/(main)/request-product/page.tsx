import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import RequestProductClient from "./RequestProductClient";

// Page Metadata (SEO) - Server-side only
export const metadata = {
  title: "Request a Product | PocketValue",
  description:
    "Can't find a product? Request it and we'll source it for you.",
  robots: {
    index: false, // noindex – transactional utility page
    follow: true, // allow crawling of links (internal flow)
  },
};

export default function RequestProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
          <Loader2
            className="animate-spin text-brand-primary mb-3"
            size={40}
            aria-hidden="true"
          />
          <p className="text-gray-500 font-medium text-sm">
            Loading request form...
          </p>
        </div>
      }
    >
      <RequestProductClient />
    </Suspense>
  );
}