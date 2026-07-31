// /src/app/sell/page.tsx

import ComingSoon from "@/app/shared/components/ui/ComingSoon";
import type { Metadata } from "next"; // <-- IMPORT METADATA TYPE

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  title: "Sell on PocketValue - Coming Soon",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SellOnPocketValuePage() {
  return (
    <ComingSoon
      featureName="Sell on PocketValue"
      description="We're building a platform for sellers like you to reach thousands of customers across Pakistan. Our seller portal is launching soon!"
    />
  );
}

// --- SUMMARY OF CHANGES ---
// - Imported the `Metadata` type from Next.js.
// - Added a `robots: { index: false, follow: false }` rule to the existing `metadata` object to prevent this "Coming Soon" page from being indexed.
