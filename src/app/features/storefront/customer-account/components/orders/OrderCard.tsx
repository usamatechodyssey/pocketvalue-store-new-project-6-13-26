"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
import { ClientOrder, ClientOrderProduct } from "@/models/Order";
// ✅ FIX: IMPORT SHARED UTILITIES
import { 
  getCustomerOrderStatus, 
  getCustomerOrderStatusColor 
} from "@/app/shared/utils/orderDisplayUtils";

interface OrderCardProps {
  order: ClientOrder;
  isOpen: boolean;
  onToggle: () => void;
}

export default function OrderCard({ order, isOpen, onToggle }: OrderCardProps) {
  // Customer-friendly status label
  const displayStatus = getCustomerOrderStatus(order.status);
  const statusColor = getCustomerOrderStatusColor(order.status);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div
        className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Order ID:{" "}
            <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
              {order.orderId}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Date:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Rs. {order.totalPrice.toLocaleString()}
          </p>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
          >
            {displayStatus}
          </span>
          <div className="text-gray-400 dark:text-gray-500">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="space-y-4">
            {order.products.map((product: ClientOrderProduct) => (
              <div key={product.cartItemId} className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                  <Image
                    src={urlFor(product.image).url()}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="grow">
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-semibold text-sm text-gray-800 dark:text-gray-200 hover:text-brand-primary line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <Link
              href={`/account/orders/${order._id}`}
              className="text-sm text-brand-primary hover:underline font-bold"
            >
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}