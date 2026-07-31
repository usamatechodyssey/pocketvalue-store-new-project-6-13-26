"use client";

import Link from "next/link";
import { AdminReturnRequest } from "@/app/features/admin/order-fulfillment/actions/payloadReturnAdminActions";
import CopyButton from "@/app/shared/components/helpers/CopyButton";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { getReturnStatusColor } from "@/app/shared/utils/adminOrderDisplayUtils";

interface ReturnListProps {
  requests: AdminReturnRequest[];
}

export default function ReturnList({ requests }: ReturnListProps) {
  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {requests.map((req) => (
          <div key={req._id} className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold dark:text-white">{req.customerName}</p>
                <p className="text-xs font-mono opacity-50 flex items-center gap-1">
                  Order: {req.orderNumber}
                  <CopyButton textToCopy={req.orderNumber} />
                </p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${getReturnStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <p className="text-xs opacity-50">{new Date(req.createdAt).toLocaleDateString()}</p>
              <Link href={`/admin/returns/${req._id}`} className="text-sm font-bold text-brand-primary hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr className="text-gray-500">
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">Items</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 font-mono font-bold">
                  <div className="flex items-center gap-1">
                    {req.orderNumber}
                    <CopyButton textToCopy={req.orderNumber} />
                  </div>
                </td>
                <td className="px-6 py-4">{req.customerName}</td>
                <td className="px-6 py-4 opacity-70">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center font-bold">{req.itemCount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${getReturnStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/admin/returns/${req._id}`} className="font-bold text-brand-primary hover:underline">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}