"use client";

import React from "react";
import { Copy, Ticket, Percent, IndianRupee, Truck } from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface AssignedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  rewardLabel: string;
}

interface ReferralCouponListProps {
  assignedCoupons: AssignedCoupon[];
}

// ✅ Enterprise Helper: Format discount value based on type
const formatDiscount = (coupon: AssignedCoupon): string => {
  const { discountType, discountValue } = coupon;
  
  if (discountType === "percentage") {
    return `${discountValue}% OFF`;
  }
  if (discountType === "freeShipping") {
    return "FREE SHIPPING";
  }
  // Fixed amount
  return `Rs. ${discountValue.toLocaleString()} OFF`;
};

// ✅ Enterprise Helper: Get the appropriate icon
const getDiscountIcon = (type: string) => {
  switch (type) {
    case "percentage":
      return <Percent size={14} className="text-brand-primary" />;
    case "freeShipping":
      return <Truck size={14} className="text-emerald-500" />;
    default:
      return <IndianRupee size={14} className="text-brand-primary" />;
  }
};

export default function ReferralCouponList({ assignedCoupons }: ReferralCouponListProps) {
  const handleCopyCoupon = (couponCode: string) => {
    navigator.clipboard
      .writeText(couponCode)
      .then(() => {
        toastSuccess(`Coupon code "${couponCode}" copied successfully!`);
      })
      .catch((err) => {
        console.error("Failed to copy coupon:", err);
        toastError("Failed to copy coupon code.");
      });
  };

  // If no coupons are issued yet, show a clean onboarding text
  if (assignedCoupons.length === 0) {
    return (
      <p className="text-[10px] text-gray-400 font-medium italic mt-2 text-center">
        Once you complete a milestone, your issued coupons will appear here.
      </p>
    );
  }

  return (
    <div className="pt-4 border-t border-gray-150 dark:border-gray-700/50 space-y-3">
      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none items-center gap-1.5">
        <Ticket size={12} className="text-brand-primary" />
        Your Issued Loyalty Vouchers ({assignedCoupons.length})
      </span>

      {/* 🎟️ APP-STYLE TICKET STUB GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-37.5 overflow-y-auto scrollbar-none">
        {assignedCoupons.map((coupon, idx) => (
          <div
            key={idx}
            className="relative flex items-stretch bg-gray-50/50 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 group"
          >
            {/* Left Body (Voucher Details) */}
            <div className="p-3 grow min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                {getDiscountIcon(coupon.discountType)}
                <span className="text-[10px] font-extrabold text-brand-primary dark:text-brand-primary/80 uppercase tracking-wider">
                  {formatDiscount(coupon)}
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-gray-900 dark:text-white tracking-wider block">
                {coupon.code}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5 truncate">
                {coupon.rewardLabel}
              </span>
            </div>

            {/* Ticket Dashed Separator */}
            <div className="relative flex items-center select-none pointer-events-none">
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-b border-gray-150 dark:border-gray-700" />
              <div className="h-[75%] border-l-2 border-dashed border-gray-200 dark:border-gray-700" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-t border-gray-150 dark:border-gray-700" />
            </div>

            {/* Right Action (Copy) */}
            <div className="p-3 flex items-center justify-center shrink-0">
              <button
                onClick={() => handleCopyCoupon(coupon.code)}
                className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-md transition-colors cursor-pointer hover:scale-105 active:scale-95"
                title={`Copy coupon ${coupon.code}`}
                aria-label={`Copy coupon ${coupon.code}`}
              >
                <Copy size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}