"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { XCircle, Download, Undo2 } from "lucide-react";
import Link from "next/link";
import { cancelCustomerOrderAction } from "@/app/features/storefront/customer-account/actions/customerOrderActions"
import ConfirmationModal from "@/app/shared/components/helpers/ConfirmationModal";
import ReturnRequestModal from "./ReturnRequestModal";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
import { ClientOrderProduct } from "@/models/Order";
// ✅ FIX: IMPORT SHARED UTILITIES
import { 
  isOrderCancellableByCustomer,
  isOrderReturnable,
  isInvoiceDownloadable
} from "@/app/shared/utils/orderDisplayUtils";

export default function OrderActions({
  orderId,
  orderNumber,
  currentStatus,
  products,
}: {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  products: ClientOrderProduct[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancelOrder = () => {
    startTransition(async () => {
      const result = await cancelCustomerOrderAction(orderId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsModalOpen(false);
    });
  };

  const isCancelled = currentStatus === "Cancelled";
  const canCancel = isOrderCancellableByCustomer(currentStatus);
  const canRequestReturn = isOrderReturnable(currentStatus);
  const canDownloadInvoice = isInvoiceDownloadable(currentStatus);

  return (
    <>
      <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
          Order Actions
        </h2>

        {isCancelled ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This order has been cancelled. No further actions are available.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            {canRequestReturn && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover"
              >
                <Undo2 size={16} />
                Request a Return
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
            {canDownloadInvoice && (
              <Link
                href={`/api/orders/invoice/${orderId}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <Download size={16} />
               Download Order Summary 
              </Link>
            )}
          </div>
        )}

        {!isCancelled && !canCancel && !canRequestReturn && (
          <p className="text-sm text-gray-500 mt-4">
            No further actions are available for this order at this time.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelOrder}
        isPending={isPending}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order ${orderNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel Order"
        confirmColor="red"
      />

      <ReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        orderId={orderId}
        orderNumber={orderNumber}
        products={products}
      />
    </>
  );
}