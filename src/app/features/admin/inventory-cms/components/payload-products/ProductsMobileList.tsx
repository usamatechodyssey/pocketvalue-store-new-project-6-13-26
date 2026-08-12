// 📂 src/app/features/admin/inventory-cms/components/payload-products/ProductsMobileList.tsx (CYBER-HUD HARDENED)

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight, Edit2 } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
import { AdminProductListItem } from "./ProductsTable";

// ================================================================
// ✅ MAIN MOBILE LIST COMPONENT
// ================================================================
export default function ProductsMobileList({
  products,
}: {
  products: AdminProductListItem[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="lg:hidden space-y-3">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs"
        >
          <div className="flex gap-4">
            {/* Thumbnail Image */}
            <div className="relative h-16 w-16 shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              {product.mainImage && (
                <Image
                  src={urlFor(product.mainImage).url()}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              )}
            </div>
            {/* Title & Details */}
            <div className="grow min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {product.title}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-brand-primary">
                  Min: {formatPrice(product.price)}
                </span>
                <Link
                  href={`/admin/collections/products/${product._id}`}
                  className="text-xs font-bold flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-brand-primary transition-colors no-underline hover:no-underline"
                >
                  <Edit2 size={12} /> Edit
                </Link>
              </div>
            </div>
          </div>

          {/* Expand Accordion Trigger */}
          <button
            onClick={() =>
              setExpandedId(expandedId === product._id ? null : product._id)
            }
            className="w-full mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono cursor-pointer"
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

          {/* EXPANDED ACCORDION: VARIANTS LIST */}
          {expandedId === product._id && (
            <div className="mt-3 space-y-2 font-mono">
              {product.variants.map((v) => (
                <div
                  key={v._key}
                  className="bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-200">{v.name}</div>
                    <div className="opacity-40 text-[9px] mt-0.5">
                      ID: ...{v._key.slice(-8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(v.price)}</div>
                    <div
                      className={`text-[10px] font-bold ${v.inStock ? "text-emerald-500" : "text-red-500"}`}
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

// ✅ FIX: Explicitly enforces en-PK localized Pakistani rupee groupings
const formatPrice = (p?: number) => p != null ? `Rs. ${p.toLocaleString("en-PK")}` : "N/A";