// /src/app/reset-password/page.tsx (CORRECTED WITH SUSPENSE)

import type { Metadata } from "next";
import { Suspense } from "react"; // <-- Naya Import
import { Loader2 } from "lucide-react"; // <-- Naya Import
import ResetPasswordClient from "../../features/storefront/auth/components/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password | PocketValue",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    // --- YAHAN BHI WAHI FIX HAI ---
    // Hum ResetPasswordClient ko Suspense boundary se wrap kar rahe hain.
    <Suspense fallback={
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
}