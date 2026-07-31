// /src/app/login/page.tsx (CORRECTED WITH SUSPENSE)

import type { Metadata } from "next";
import { Suspense } from "react"; // <-- Naya Import
import { Loader2 } from "lucide-react"; // <-- Naya Import
import LoginClient from "../../features/storefront/auth/components/LoginClient";

export const metadata: Metadata = {
  title: "Login | PocketValue",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    // --- YAHAN ASAL FIX HAI ---
    // Hum LoginClient ko Suspense boundary se wrap kar rahe hain.
    <Suspense
      fallback={
        // 'fallback' batata hai ke jab tak component load ho, kya dikhana hai.
        <div className="flex w-full min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
