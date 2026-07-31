// // /app/account/returns/page.tsx

import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Undo2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getUserReturnRequests } from "@/app/features/storefront/customer-account/actions/returnActions";
import ReturnsListClient from "../../../features/storefront/customer-account/components/returns/ReturnsListClient";

/**
 * 🔄 MY RETURNS PAGE
 * Yeh page customer ko uski mukkamal return history dikhata hai.
 * Data Source: MongoDB via getUserReturnRequests action.
 */
export default async function MyReturnsPage() {
  const session = await auth();

  // 🔐 Security Check: Redirect if not logged in
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/returns");
  }

  // --- SERVER-SIDE DATA FETCHING ---
  // Note: Yeh action humne pehle Payload-safe bana diya hai
  const returnRequests = await getUserReturnRequests();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary/10 dark:bg-brand-primary/5 p-3 rounded-2xl border border-brand-primary/20">
            <Undo2 size={24} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
              My Returns
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              History and status of your return requests.
            </p>
          </div>
        </div>

        {/* Navigation Link for Better UX */}
        <Link
          href="/account"
          className="text-xs font-bold text-gray-400 hover:text-brand-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
        >
          Dashboard <ArrowRight size={12} />
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        {/* 2. CONDITIONAL RENDERING */}
        {returnRequests.length === 0 ? (
          // --- EMPTY STATE VIEW ---
          <div className="text-center py-24 px-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/50 dark:bg-gray-900/20 group">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              <Undo2
                className="h-10 w-10 text-gray-300 dark:text-gray-600"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              No Return Requests Yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
              If an item doesn&apos;t meet your expectations, you can request a
              return directly from your completed orders.
            </p>

            <div className="mt-8">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white text-sm font-black rounded-2xl shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
              >
                <ShoppingBag size={18} /> View My Orders
              </Link>
            </div>
          </div>
        ) : (
          // --- DATA LIST VIEW ---
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <ReturnsListClient initialRequests={returnRequests} />
          </div>
        )}
      </div>

      {/* FOOTER NOTICE */}
      <div className="mt-10 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          PocketValue Returns Management Protocol Active
        </p>
      </div>
    </div>
  );
}
