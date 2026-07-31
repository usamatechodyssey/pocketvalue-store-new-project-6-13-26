
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toastError } from "@/app/shared/components/helpers/CustomToasts";
import { CreditCard, Truck, Lock } from "lucide-react"; 
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// --- Type Definitions ---
interface Gateway {
  key: string;
  name: string;
  enabled: boolean;
  credentials: any;
}

interface PaymentMethodSelectorProps {
  selectedGateway: string | null;
  onGatewaySelect: (gatewayKey: string) => void;
}

// --- GatewayIcon Component ---
const GatewayIcon = ({
  gatewayKey,
  gatewayName,
  isEnabled, 
}: {
  gatewayKey: string;
  gatewayName: string;
  isEnabled: boolean;
}) => {
  const iconMap: { [key: string]: string } = {
    easypaisa: `/icons/easypaisa.png`,
    jazzcash: `/icons/jazzcash.png`,
    banktransfer: `/icons/bank.svg`,
  };
  const associatedIcons: { [key: string]: string[] } = {
    easypaisa: [
      "/icons/visa.svg",
      "/icons/mastercard.svg",
      "/icons/unionpay.svg",
    ],
    jazzcash: [
      "/icons/visa.svg",
      "/icons/mastercard.svg",
      "/icons/unionpay.svg",
    ],
  };
  const mainIconUrl = iconMap[gatewayKey];
  const cardIcons = associatedIcons[gatewayKey] || [];
  const showText = !mainIconUrl || ["banktransfer", "cod"].includes(gatewayKey);

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left Side: Main Icon + Name */}
      <div className="flex items-center gap-3 font-semibold">
        {mainIconUrl ? (
          <Image
            src={mainIconUrl}
            alt={gatewayName}
            width={gatewayKey === "banktransfer" ? 24 : 80}
            height={24}
            className={`h-6 w-auto object-contain ${!isEnabled ? "grayscale opacity-70" : ""}`}
            unoptimized
          />
        ) : gatewayKey === "cod" ? (
          <Truck size={20} />
        ) : (
          <CreditCard size={20} />
        )}
        {showText && (
          <span className="text-sm font-semibold">{gatewayName}</span>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1.5 opacity-80">
        {isEnabled ? (
          cardIcons.map((icon, index) => (
            <Image
              key={index}
              src={icon}
              alt="Card Icon"
              width={28}
              height={18}
              unoptimized
            />
          ))
        ) : (
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-300 dark:border-gray-600">
             <Lock size={10} />
             <span>Unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
};

// === Main Component ===
export default function PaymentMethodSelector({
  selectedGateway,
  onGatewaySelect,
}: PaymentMethodSelectorProps) {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout/payment";

  useEffect(() => {
    async function fetchGateways() {
      try {
        const response = await fetch("/api/payment/gateways");
        if (!response.ok) throw new Error("Failed to fetch gateways");
        const allGateways: Gateway[] = await response.json();
        setGateways(allGateways);

        // Auto-select logic
        if (!selectedGateway && allGateways.length > 0) {
          const codGateway = allGateways.find((gw) => gw.key === "cod" && gw.enabled);
          const firstEnabled = allGateways.find((gw) => gw.enabled);
          
          if (codGateway) {
             onGatewaySelect(codGateway.key);
          } else if (firstEnabled) {
             onGatewaySelect(firstEnabled.key);
          }
        }
      } catch (error) {
        toastError("Could not load payment options.");
      }
    }
    fetchGateways();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">
        Payment method
      </h2>
      <div className="space-y-3">
        {gateways.length > 0 ? (
          gateways.map((gw) => {
            const isSelected = selectedGateway === gw.key;
            const isEnabled = gw.enabled; 
            
            const hasDetails =
              gw.key === "banktransfer" ||
              gw.key === "easypaisa" ||
              gw.key === "jazzcash";

            return (
              <div
                key={gw.key}
                onClick={() => {
                  if (isEnabled) {
                    const previousGateway = selectedGateway;
                    onGatewaySelect(gw.key);
                    
                    // 🚀 TELEMETRY EVENT: Track Payment Method Selected/Toggle
                    logUserEvent('payment_method_selected', pathname, {
                      selected_method: gw.key,
                      previous_method: previousGateway || "none",
                    });
                  }
                }}
                className={`border rounded-lg overflow-hidden transition-all duration-300 ease-in-out relative
                  ${
                    !isEnabled 
                    ? "opacity-70 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-gray-200 dark:border-gray-700" 
                    : "cursor-pointer"
                  }
                  ${
                    isEnabled && isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/50 bg-white dark:bg-gray-900"
                      : isEnabled 
                        ? "border-gray-300 dark:border-gray-600 hover:border-brand-primary/60 bg-white dark:bg-gray-900" 
                        : ""
                  }`}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    
                    {/* Radio Button */}
                    <div
                      className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected && isEnabled
                          ? "border-brand-primary bg-brand-primary"
                          : "border-gray-400 bg-white dark:bg-gray-700"
                      }`}
                    >
                      {isSelected && isEnabled && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="ml-4 w-full">
                      <GatewayIcon 
                        gatewayKey={gw.key} 
                        gatewayName={gw.name} 
                        isEnabled={isEnabled} 
                      />
                    </div>

                  </div>
                </div>

                {/* Details Section (Only if Enabled & Selected) */}
                <AnimatePresence>
                  {isSelected && isEnabled && hasDetails && (
                    <motion.section
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
                    >
                      <div className="p-4 text-sm">
                        {gw.key === "banktransfer" && gw.credentials && (
                          <>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Bank Account Details
                            </h3>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  ACCOUNT TITLE:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.accountTitle}
                                </span>
                              </div>
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  ACCOUNT NO:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.accountNumber}
                                </span>
                              </div>
                              {gw.credentials.iban && (
                                <div className="flex justify-between items-start text-xs sm:text-sm">
                                  <span className="font-medium text-gray-500">
                                    IBAN NO:
                                  </span>
                                  <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                    {gw.credentials.iban}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-start text-xs sm:text-sm">
                                <span className="font-medium text-gray-500">
                                  BANK NAME:
                                </span>
                                <span className="text-right font-mono text-gray-700 dark:text-gray-300">
                                  {gw.credentials.bankName}
                                </span>
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                              Important: Please use your Order ID as the
                              reference/comment in your bank transaction.
                            </p>
                          </>
                        )}

                        {(gw.key === "easypaisa" || gw.key === "jazzcash") && (
                          <>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              Redirecting to {gw.name}...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              You will be securely redirected to the {gw.name}{" "}
                              payment page to complete your purchase.
                            </p>
                          </>
                        )}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="p-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500">
            Loading payment methods...
          </div>
        )}
      </div>
    </section>
  );
}