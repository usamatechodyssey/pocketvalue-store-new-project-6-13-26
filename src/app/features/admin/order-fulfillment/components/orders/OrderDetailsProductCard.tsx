// 📂 src/app/features/admin/order-fulfillment/components/orders/OrderDetailsProductCard.tsx (CYBER-HUD HARDENED)

"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image"; // ✅ XSS Sanitized Mock Builder
import { CheckCircle, AlertTriangle, Hash, Layers } from "lucide-react";
import { CleanCartItem } from "@/types";
import CopyButton from "./CopyButton";

interface ProductCardProps {
  product: CleanCartItem;
  stockInfo: { _id: string; variants: { _key: string; inStock: boolean; }[] | null; } | undefined;
}

export default function OrderDetailsProductCard({ product, stockInfo }: ProductCardProps) {
  // ✅ 1. Safe Product ID Extraction
  const pId = (product as any).productId || product._id || (product as any).id || "";
  const displayId = pId ? (pId.length > 8 ? pId.slice(-8) : pId) : "N/A";

  // ✅ 2. Safe Variant Key Extraction
  const variantKey = product.variant?._key || (product.variant as any)?.id || "";
  const displayVariantKey = variantKey ? (variantKey.length > 8 ? variantKey.slice(-8) : variantKey) : "";

  const isProductInStock = stockInfo?.variants?.find((v) => v._key === variantKey || (v as any).id === variantKey)?.inStock ?? false;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-zinc-150 dark:border-zinc-850 last:border-0">
      {/* Product Image (XSS Sanitized) */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <Image 
          src={urlFor(product.image).url()} 
          alt={product.name || "Product Image"} 
          fill 
          sizes="80px" 
          className="object-contain p-1" 
        />
      </div>

      {/* Product Details */}
      <div className="grow space-y-2 min-w-0">
        <Link 
          href={pId ? `/admin/collections/products/${pId}` : "#"} 
          target="_blank" 
          className="font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-brand-primary line-clamp-2 leading-tight transition-colors no-underline hover:no-underline"
        >
          {product.name}
        </Link>

        {/* Safe Product ID and Variant Key with Copy Buttons */}
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1.5 font-mono uppercase tracking-wider">
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900/60 w-fit px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
            <Hash size={10} className="opacity-50" />
            <span>Product ID: ...{displayId}</span>
            {pId && <CopyButton textToCopy={pId} />}
          </div>
          
          {variantKey && (
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900/60 w-fit px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
              <Layers size={10} className="opacity-50" />
              <span>Variant Key: ...{displayVariantKey}</span>
              <CopyButton textToCopy={variantKey} />
            </div>
          )}

          {/* Variant Name Display */}
          <div className="text-zinc-400 dark:text-zinc-500 italic normal-case text-[11px]">
            Selected: <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{product.variant?.name || "Standard"}</span>
          </div>
        </div>
      </div>

      {/* Price & Stock Status */}
      <div className="text-right shrink-0">
        {/* Localized PKR Formatting */}
        <p className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-base">
          Rs. {(product.price * product.quantity).toLocaleString('en-PK')}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono font-medium mt-0.5">
          Qty: {product.quantity}
        </p>
        
        <div className="mt-3 flex items-center justify-end text-[9px] font-mono font-bold uppercase tracking-wider">
          {stockInfo ? (
            <span className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${isProductInStock ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
              {isProductInStock ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
              {isProductInStock ? "In Stock" : "Out of Stock"}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 italic border border-zinc-200 dark:border-zinc-700">Deleted</span>
          )}
        </div>
      </div>
    </div>
  );
}