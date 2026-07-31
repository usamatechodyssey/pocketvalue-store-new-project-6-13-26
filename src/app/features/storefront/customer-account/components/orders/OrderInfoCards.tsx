

import { MapPin, CreditCard } from "lucide-react";

// --- Type Definitions for Props ---
interface ShippingInfo {
  fullName: string;
  address: string;
  area: string;
  city: string;
  province: string;
  phone: string;
}

interface PaymentInfo {
  paymentMethod: string;
  paymentStatus: string;
  subtotal?: number;
  shippingCost?: number;
  totalPrice: number; // This is the Grand Total
}

// === Component #1: Shipping Address Card (No change) ===
export function ShippingAddressCard({
  shippingAddress,
}: {
  shippingAddress: ShippingInfo;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border rounded-xl shadow-sm">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <MapPin size={20} /> Shipping Address
      </h2>
      <address className="not-italic text-sm space-y-1">
        <p className="font-semibold">{shippingAddress.fullName}</p>
        <p>
          {shippingAddress.address}, {shippingAddress.area}
        </p>
        <p>
          {shippingAddress.city}, {shippingAddress.province}
        </p>
        <p>Phone: {shippingAddress.phone}</p>
      </address>
    </div>
  );
}

// === Component #2: Payment Details Card (FIXED) ===
export function PaymentDetailsCard({
  paymentDetails,
}: {
  paymentDetails: PaymentInfo;
}) {
  // --- THE GUARANTEED FIX IS HERE ---
  const shippingCost = paymentDetails.shippingCost ?? 0;
  // If `subtotal` exists on the order object, use it.
  // If not (for older orders), calculate it by subtracting shipping from the grand total.
  const subtotal =
    paymentDetails.subtotal ?? paymentDetails.totalPrice - shippingCost;

  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border rounded-xl shadow-sm">
      <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
        <CreditCard size={20} /> Payment Details
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Method:</span>
          <span className="font-semibold">{paymentDetails.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className="font-semibold">{paymentDetails.paymentStatus}</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal:</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping:</span>
            <span className="font-medium">
              {shippingCost === 0
                ? "FREE"
                : `Rs. ${shippingCost.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300 dark:border-gray-600">
            <span>Grand Total:</span>
            <span>Rs. {paymentDetails.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
