// /src/app/register/page.tsx (CORRECTED WITH SUSPENSE)

import type { Metadata } from "next";
import { Suspense } from "react"; // <-- Naya Import
import { Loader2 } from "lucide-react"; // <-- Naya Import
import RegisterClient from "../../features/storefront/auth/components/RegisterClient";

export const metadata: Metadata = {
  title: "Create Account | PocketValue",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    // --- YAHAN BHI WAHI FIX HAI ---
    // Hum RegisterClient ko Suspense boundary se wrap kar rahe hain.
    <Suspense fallback={
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    }>
      <RegisterClient />
    </Suspense>
  );
}