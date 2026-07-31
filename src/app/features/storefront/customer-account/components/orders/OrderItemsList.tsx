// /src/app/account/orders/[orderId]/_components/OrderItemsList.tsx

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
// ✅ FIX: SINGLE SOURCE OF TRUTH
import { ClientOrderProduct } from "@/models/Order";

interface OrderItemsListProps {
  products: ClientOrderProduct[]; // ✅ FIXED TYPE
}

export default function OrderItemsList({ products }: OrderItemsListProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <Package size={20} /> Items Ordered ({products.length})
      </h2>
      <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
        {products.map((product) => (
          <div
            key={product.cartItemId}
            className="flex items-center gap-4 pt-4 first:pt-0"
          >
            {/* Product Image */}
            <div className="relative w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
              {product.image && (
                <Image src={urlFor(product.image).url()} alt={product.name} fill className="object-contain p-1" sizes="80px"/>
              )}
            </div>
            {/* Product Details */}
            <div className="grow">
              <Link href={`/product/${product.slug}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-primary hover:underline line-clamp-2">
                {product.name}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Qty: {product.quantity}
              </p>
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap shrink-0 ">
              Rs. {(product.price * product.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}