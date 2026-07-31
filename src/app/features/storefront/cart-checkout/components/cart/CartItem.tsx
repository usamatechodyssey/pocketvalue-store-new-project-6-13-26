
"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { useStateContext } from "@/app/context/StateContext";
import { CartItemWithStock } from "@/app/features/storefront/cart-checkout/hooks/useCart"; // ✅ Import custom type

export default function CartItem({ item }: { item: CartItemWithStock }) {
  const { onRemove, toggleCartItemQuantity } = useStateContext();

  const finalPrice = item.price;
  const itemTotal = finalPrice * item.quantity;

  // 🔥 THE INTELLIGENCE: Check if we hit the stock limit from Payload
  const stockLimit = item.variantStock ?? 999;
  const isLimitReached = item.quantity >= stockLimit;

  return (
    <div className="flex items-start gap-4 p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
      {/* 1. Image Section */}
      <Link href={`/product/${item.slug}`} className="shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <Image
            src={urlFor(item.image).url()}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 2. Details & Controls */}
      <div className="grow flex flex-col justify-between self-stretch">
        <div className="flex justify-between items-start">
          <div className="flex flex-col grow pr-2">
            <Link
              href={`/product/${item.slug}`}
              className="font-bold text-gray-900 dark:text-white hover:text-brand-primary line-clamp-2 text-base lg:text-md transition-colors"
            >
              {item.name}
            </Link>
            {item.variant && (
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                {item.variant.name}
              </p>
            )}
          </div>

          {/* Remove Action */}
          <button
            onClick={() => onRemove(item)}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0 active:scale-90"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Quantity & Pricing Row */}
        <div className="flex items-end justify-between mt-auto">
          <div className="space-y-2">
            {/* Visual Alert if stock is low */}
            {isLimitReached && (
              <div className="flex items-center gap-1.5 text-orange-500 animate-pulse">
                <AlertCircle size={10} />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  Stock Limit Reached
                </span>
              </div>
            )}

            {/* Quantity Control Panel */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/80 border dark:border-gray-700 rounded-full p-1 w-fit shadow-inner">
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "dec")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span className="font-black w-7 text-center text-sm text-gray-900 dark:text-white">
                {item.quantity}
              </span>

              {/* 🔥 FIX: Disable button if stock limit reached */}
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "inc")}
                disabled={isLimitReached}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90
                        ${
                          isLimitReached
                            ? "opacity-20 cursor-not-allowed bg-transparent text-gray-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                        }`}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Price Visualization */}
          <div className="text-right">
            <p className="font-black text-xl text-brand-primary tracking-tighter">
              Rs. {itemTotal.toLocaleString()}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase mt-0.5">
              Unit: Rs. {finalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
