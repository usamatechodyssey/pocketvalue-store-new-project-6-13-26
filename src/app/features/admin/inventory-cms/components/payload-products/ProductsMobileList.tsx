// src/app/features/admin/inventory-cms/components/payload-products/ProductsMobileList.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight, Edit2 } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { AdminProductListItem } from "./ProductsTable";

export default function ProductsMobileList({
  products,
}: {
  products: AdminProductListItem[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="lg:hidden space-y-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
              {product.mainImage && (
                <Image
                  src={urlFor(product.mainImage).url()}
                  alt=""
                  fill
                  // ✅ ENTERPRISE UPGRADE: Added sizes prop to force Next.js to only request small WebP thumbnails instead of heavy 4K (3840px) assets.
                  // This completely silences browser console performance warnings and optimizes admin dashboard load speeds.
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
            </div>
            <div className="grow">
              <p className="text-sm font-bold dark:text-white line-clamp-2">
                {product.title}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-brand-primary">
                  Min: {formatPrice(product.price)}
                </span>
                <Link
                  href={`/admin/collections/products/${product._id}`}
                  className="text-xs font-bold flex items-center gap-1 text-gray-500"
                >
                  <Edit2 size={12} /> Edit
                </Link>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setExpandedId(expandedId === product._id ? null : product._id)
            }
            className="w-full mt-4 pt-3 border-t dark:border-gray-700 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500"
          >
            {expandedId === product._id
              ? "Hide Variants"
              : `Show ${product.variantsCount} Variants`}
            {expandedId === product._id ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {expandedId === product._id && (
            <div className="mt-3 space-y-2">
              {product.variants.map((v) => (
                <div
                  key={v._key}
                  className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold">{v.name}</div>
                    <div className="opacity-50 text-[9px]">
                      ID: {v._key.slice(-8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatPrice(v.price)}</div>
                    <div
                      className={v.inStock ? "text-green-600" : "text-red-500"}
                    >
                      {v.stock} left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ✅ ENTERPRISE UPGRADE: Unified currency formatter to strictly format numbers using toLocaleString, matches desktop table styles perfectly.
const formatPrice = (p?: number) => p != null ? `Rs. ${p.toLocaleString()}` : "N/A";