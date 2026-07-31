"use client";

import { Check, X, Package, Truck, Home, Undo2, AlertCircle } from "lucide-react";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { 
  getCustomerOrderStatus,
  CUSTOMER_TIMELINE_STEPS 
} from "@/app/shared/utils/orderDisplayUtils";

// Special states ke liye different icons
const getSpecialStatusConfig = (status: string) => {
  if (status === "Cancelled") {
    return { icon: X, color: "text-red-600 dark:text-red-400", label: "Cancelled" };
  }
  if (status === "Returned to Sender" || status === "Return Initiated") {
    return { icon: Undo2, color: "text-orange-600 dark:text-orange-400", label: status };
  }
  return null;
};

export default function StatusTimeline({ status }: { status: string }) {
  // 1. Convert DB status to Customer-friendly status
  const displayStatus = getCustomerOrderStatus(status);
  
  // 2. Check if it's a special terminal state (Cancelled, Returned)
  const specialConfig = getSpecialStatusConfig(displayStatus);
  if (specialConfig) {
    const Icon = specialConfig.icon;
    return (
      <div className={`p-4 rounded-lg text-center font-semibold flex items-center justify-center gap-2 ${
        displayStatus === "Cancelled" 
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      }`}>
        <Icon size={18} /> This order is {displayStatus.toLowerCase()}.
      </div>
    );
  }

  // 3. Find the index of this displayStatus in the timeline
  let currentIndex = CUSTOMER_TIMELINE_STEPS.findIndex(step => step.name === displayStatus);
  
  // 4. Fallback: Agar unknown status hai
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  return (
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="relative">
        <div className="absolute left-0 top-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="absolute left-0 top-0 h-1 bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (CUSTOMER_TIMELINE_STEPS.length - 1)) * 100}%` }}
          />
        </div>
        
        <ol className="relative flex justify-between items-center w-full">
          {CUSTOMER_TIMELINE_STEPS.map((step, index) => {
            const isActive = index <= currentIndex;
            const Icon = step.icon === "Package" ? Package : step.icon === "Truck" ? Truck : Home;
            return (
              <li key={step.name} className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                  isActive 
                    ? "bg-brand-primary border-brand-primary text-white" 
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                }`}>
                  {isActive ? <Check size={18} /> : <Icon size={16} />}
                </div>
                <p className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isActive ? "text-brand-primary" : "text-gray-500"
                }`}>
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
      
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Current Status: <span className="font-semibold text-gray-700 dark:text-gray-300">{displayStatus}</span>
      </p>
    </div>
  );
}