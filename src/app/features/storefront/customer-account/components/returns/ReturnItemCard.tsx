

"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import SanityProduct from "@/types";

// Is component ke props ki type
interface ReturnItem {
  productId: string;
  variantKey: string;
  quantity: number;
  reason: string;
  productDetails: SanityProduct | null;
}

export default function ReturnItemCard({ item }: { item: ReturnItem }) {
  const { productDetails, quantity, reason, variantKey } = item;

  // Agar kisi wajah se product delete ho gaya ho
  if (!productDetails) {
    return (
      <div className="flex items-center gap-4 py-4">
        <div className="relative w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-700 shrink-0"></div>
        <div className="grow text-sm text-red-600 dark:text-red-400 font-semibold">
          Product information is no longer available.
        </div>
      </div>
    );
  }

  // Sahi variant aur image dhoondein
  const variant = productDetails.variants.find((v) => v._key === variantKey);
  const image =
    variant?.images?.[0] || productDetails.defaultVariant.images?.[0];
  const productName = variant
    ? `${productDetails.title} (${variant.name})`
    : productDetails.title;

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
        {image && (
          <Image
            src={urlFor(image).url()}
            alt={productName}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        )}
      </div>
      <div className="grow">
        <Link
          href={`/product/${productDetails.slug}`}
          target="_blank"
          className="font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-primary line-clamp-2 text-sm"
        >
          {productName}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          Qty: {quantity}
        </p>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Naya Component:** Ek naya, chota, aur focused client component (`ReturnItemCard.tsx`) banaya gaya hai.
// - **Componentization (Rule #5):** Is se hamara detail page (`[returnId]/page.tsx`) saaf suthra rehta hai aur item ko render karne ka logic is alag component mein a gaya hai.
// - **User-Facing Links:** Admin panel ke `edit` link ke bajaye, ab yeh component seedha public product page (`/product/...`) par link karta hai.
