// /src/app/gift-cards/page.tsx

import ComingSoon from '@/app/shared/components/ui/ComingSoon';
import type { Metadata } from 'next'; // <-- IMPORT METADATA TYPE

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  title: 'Gift Cards - Coming Soon | PocketValue',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GiftCardsPage() {
  return (
    <ComingSoon
      featureName="PocketValue Gift Cards"
      description="Soon, you'll be able to send the perfect gift with our digital gift cards. Stay tuned!"
    />
  );
}

// --- SUMMARY OF CHANGES ---
// - Imported the `Metadata` type from Next.js.
// - Added a `robots: { index: false, follow: false }` rule to the existing `metadata` object to prevent this "Coming Soon" page from being indexed.