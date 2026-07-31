// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import { CheckCircle, AlertTriangle, Hash, Layers } from "lucide-react";
// import { CleanCartItem } from "@/types";
// import CopyButton from "./CopyButton"; // ✅ Naya copy button import kiya

// interface ProductCardProps {
//   product: CleanCartItem;
//   stockInfo: { _id: string; variants: { _key: string; inStock: boolean; }[] | null; } | undefined;
// }

// export default function OrderDetailsProductCard({ product, stockInfo }: ProductCardProps) {
//   const isProductInStock = stockInfo?.variants?.find((v) => v._key === product.variant?._key)?.inStock ?? false;

//   return (
//     <div className="flex items-start gap-4 py-5">
//       {/* Product Image */}
//       <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0 border dark:border-gray-700 shadow-sm">
//         {product.image && (
//           <Image src={urlFor(product.image).url()} alt={product.name} fill sizes="80px" className="object-contain p-1" />
//         )}
//       </div>

//       {/* Product Details */}
//       <div className="grow space-y-2">
//         <Link href={`/admin/collections/products/${product._id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-brand-primary line-clamp-2 leading-tight transition-colors">
//           {product.name}
//         </Link>

//         {/* ✅ FIX: Product ID and Variant Key with Copy Buttons */}
//         <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1.5 font-mono uppercase tracking-wider">
//           <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 w-fit px-2 py-0.5 rounded border dark:border-gray-800">
//             <Hash size={10} className="opacity-50" />
//             <span>Product ID: ...{product._id.slice(-8)}</span>
//             <CopyButton textToCopy={product._id} />
//           </div>
          
//           {product.variant?._key && (
//             <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 w-fit px-2 py-0.5 rounded border dark:border-gray-800">
//               <Layers size={10} className="opacity-50" />
//               <span>Variant Key: ...{product.variant._key.slice(-8)}</span>
//               <CopyButton textToCopy={product.variant._key} />
//             </div>
//           )}

//           {/* Variant Name Display */}
//           <div className="text-gray-400 italic normal-case">
//             Selected: <span className="font-semibold text-gray-600 dark:text-gray-300">{product.variant?.name || "Standard"}</span>
//           </div>
//         </div>
//       </div>

//       {/* Price & Stock Status */}
//       <div className="text-right shrink-0">
//         <p className="font-black text-gray-900 dark:text-white text-lg">Rs. {(product.price * product.quantity).toLocaleString()}</p>
//         <p className="text-sm text-gray-500 font-medium">Qty: {product.quantity}</p>
        
//         <div className="mt-3 flex items-center justify-end text-[10px] font-bold uppercase tracking-tighter">
//           {stockInfo ? (
//             <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${isProductInStock ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
//               {isProductInStock ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
//               {isProductInStock ? "Live: In Stock" : "Live: Out of Stock"}
//             </span>
//           ) : (
//             <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 italic border border-gray-200">Deleted</span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/order-fulfillment/components/orders/OrderDetailsProductCard.tsx (FULLY TYPE-SAFE & CRASH-FREE)

"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image"; // ✅ Uses your universal type-safe mock builder
import { CheckCircle, AlertTriangle, Hash, Layers } from "lucide-react";
import { CleanCartItem } from "@/types";
import CopyButton from "./CopyButton";

interface ProductCardProps {
  product: CleanCartItem;
  stockInfo: { _id: string; variants: { _key: string; inStock: boolean; }[] | null; } | undefined;
}

export default function OrderDetailsProductCard({ product, stockInfo }: ProductCardProps) {
  // ✅ 1. Safe Product ID Extraction (Handles productId from Mongo, _id, or id)
  const pId = (product as any).productId || product._id || (product as any).id || "";
  const displayId = pId ? (pId.length > 8 ? pId.slice(-8) : pId) : "N/A";

  // ✅ 2. Safe Variant Key Extraction
  const variantKey = product.variant?._key || (product.variant as any)?.id || "";
  const displayVariantKey = variantKey ? (variantKey.length > 8 ? variantKey.slice(-8) : variantKey) : "";

  const isProductInStock = stockInfo?.variants?.find((v) => v._key === variantKey || (v as any).id === variantKey)?.inStock ?? false;

  return (
    <div className="flex items-start gap-4 py-5 border-b dark:border-gray-800 last:border-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0 border dark:border-gray-700 shadow-sm">
        {/* ✅ Safe Image Rendering using your universal urlFor helper */}
        <Image 
          src={urlFor(product.image).url()} 
          alt={product.name || "Product Image"} 
          fill 
          sizes="80px" 
          className="object-contain p-1" 
        />
      </div>

      {/* Product Details */}
      <div className="grow space-y-2">
        <Link 
          href={pId ? `/admin/collections/products/${pId}` : "#"} 
          target="_blank" 
          className="font-bold text-gray-900 dark:text-white hover:text-brand-primary line-clamp-2 leading-tight transition-colors"
        >
          {product.name}
        </Link>

        {/* ✅ FIXED: Safe Product ID and Variant Key with Copy Buttons */}
        <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1.5 font-mono uppercase tracking-wider">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 w-fit px-2 py-0.5 rounded border dark:border-gray-800">
            <Hash size={10} className="opacity-50" />
            <span>Product ID: ...{displayId}</span>
            {pId && <CopyButton textToCopy={pId} />}
          </div>
          
          {variantKey && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 w-fit px-2 py-0.5 rounded border dark:border-gray-800">
              <Layers size={10} className="opacity-50" />
              <span>Variant Key: ...{displayVariantKey}</span>
              <CopyButton textToCopy={variantKey} />
            </div>
          )}

          {/* Variant Name Display */}
          <div className="text-gray-400 italic normal-case">
            Selected: <span className="font-semibold text-gray-600 dark:text-gray-300">{product.variant?.name || "Standard"}</span>
          </div>
        </div>
      </div>

      {/* Price & Stock Status */}
      <div className="text-right shrink-0">
        {/* ✅ Localized PKR Formatting */}
        <p className="font-black text-gray-900 dark:text-white text-lg">
          Rs. {(product.price * product.quantity).toLocaleString('en-PK')}
        </p>
        <p className="text-sm text-gray-500 font-medium">Qty: {product.quantity}</p>
        
        <div className="mt-3 flex items-center justify-end text-[10px] font-bold uppercase tracking-tighter">
          {stockInfo ? (
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${isProductInStock ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
              {isProductInStock ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
              {isProductInStock ? "Live: In Stock" : "Live: Out of Stock"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 italic border border-gray-200">Deleted</span>
          )}
        </div>
      </div>
    </div>
  );
}