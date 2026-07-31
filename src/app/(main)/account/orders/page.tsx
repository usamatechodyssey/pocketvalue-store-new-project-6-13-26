
// src/app/(main)/account/orders/page.tsx

import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import OrderList from "@/app/features/storefront/customer-account/components/orders/OrderList";

// 🚀 Naya Import (Customer Domain se)
import { getCustomerOrders } from "@/app/features/storefront/customer-account/actions/customerOrderActions";

type OrdersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const resolvedSearchParams = await searchParams;

  const currentPage = Number(resolvedSearchParams?.page || "1");
  const status = (resolvedSearchParams?.status as string) || "all";
  const searchTerm = (resolvedSearchParams?.search as string) || "";

  // 🚀 Ab yahan getCustomerOrders call ho raha hai bina userId bheje 
  // (kyunki userId action ke andar khud securely fetch ho raha hai)
  const { orders, totalPages } = await getCustomerOrders({
    page: currentPage,
    status: status,
    searchTerm: searchTerm,
    limit: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <ShoppingBag size={24} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            My Orders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View your order history and track the status of your purchases.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {orders.length === 0 && !searchTerm && status === "all" ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <ShoppingBag
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              strokeWidth={1.5}
            />
            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              You haven&apos;t placed any orders yet.
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When you place an order, it will appear here.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-brand-primary-hover"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <OrderList initialOrders={orders} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}