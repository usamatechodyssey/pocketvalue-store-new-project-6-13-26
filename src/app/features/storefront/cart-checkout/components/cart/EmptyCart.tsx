import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

export default function EmptyCart() {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <ShoppingCart
          size={56}
          className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          strokeWidth={1.5}
        />
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {/* ✅ FIX: Escaped apostrophes */}
          Let&apos;s find something you&apos;ll love!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}