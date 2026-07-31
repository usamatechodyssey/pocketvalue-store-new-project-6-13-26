// /src/app/verify-email/page.tsx (VERIFIED - NO CHANGES NEEDED)

import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import VerifyEmailClient from "../../features/storefront/auth/components/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Your Email | PocketValue",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This file correctly uses a Server Component with Suspense to wrap the `VerifyEmailClient` component, which is the recommended pattern in Next.js.
