
"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import SanityProduct from "@/types";

interface ReturnItem {
  quantity: number;
  reason: string;
  variantKey: string;
  productDetails: SanityProduct | null;
}

export default function ReturnDetailsProductCard({ item }: { item: ReturnItem }) {
  const { productDetails, quantity, reason, variantKey } = item;

  if (!productDetails) {
    return (
      <div className="flex items-center gap-4 py-4 text-red-600">
        Product information could not be loaded (it may have been deleted).
      </div>
    );
  }

  const variant = productDetails.variants.find(v => v._key === variantKey);
  const image = variant?.images?.[0] || productDetails.defaultVariant.images?.[0];

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
        {image && (
          <Image
            src={urlFor(image).url()}
            alt={productDetails.title}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        )}
      </div>
      <div className="grow">
        <Link
          href={`/Bismillah786/products/${productDetails.slug}/edit`}
          target="_blank"
          className="font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-primary line-clamp-2"
        >
          {productDetails.title}
        </Link>
        {variant && <p className="text-sm text-gray-500">{variant.name}</p>}
        <p className="text-sm mt-1">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-gray-800 dark:text-gray-200">
          Qty: {quantity}
        </p>
      </div>
    </div>
  );
}