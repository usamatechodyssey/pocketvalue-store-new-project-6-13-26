// /src/app/forgot-password/page.tsx

import type { Metadata } from "next";
import ForgotPasswordClient from "../../features/storefront/auth/components/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot Password | PocketValue",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
