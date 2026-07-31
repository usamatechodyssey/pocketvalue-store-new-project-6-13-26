

"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientAddress } from "@/app/features/storefront/cart-checkout/actions/addressActions"; // <-- Import the new, SAFE DTO type
// import { Address } from "@/app/actions/addressActions"; // <-- REMOVED the old type import

// --- Type Definitions for Props ---
interface SavedAddressesProps {
  savedAddresses: ClientAddress[]; // <-- Use the ClientAddress type
  selectedAddressId: string | null;
  onAddressSelect: (address: ClientAddress) => void; // <-- Use the ClientAddress type
}

const VISIBLE_ADDRESS_LIMIT = 2;

// === Main Component ===
export default function SavedAddresses({
  savedAddresses,
  selectedAddressId,
  onAddressSelect,
}: SavedAddressesProps) {
  const [showAll, setShowAll] = useState(false);

  // Memoize sorted addresses for performance
  const sortedAddresses = useMemo(() => {
    return [...savedAddresses].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  }, [savedAddresses]);

  const displayedAddresses = showAll
    ? sortedAddresses
    : sortedAddresses.slice(0, VISIBLE_ADDRESS_LIMIT);

  if (!savedAddresses || savedAddresses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Select a Saved Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedAddresses.map((addr) => {
          const isSelected = selectedAddressId === addr._id; // .toString() is no longer needed
          return (
            <div
              key={addr._id} // .toString() is no longer needed
              onClick={() => onAddressSelect(addr)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 
                ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-md"
                    : "border-gray-300 dark:border-gray-600 hover:border-brand-primary/50"
                }`}
            >
              {isSelected && (
                <CheckCircle
                  size={20}
                  className="absolute top-3 right-3 text-brand-primary"
                />
              )}

              {addr.isDefault && (
                <span className="absolute top-3 left-3 text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}

              <div className={addr.isDefault ? "mt-8" : ""}>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {addr.fullName}
                </p>
                <address className="text-xs text-gray-500 dark:text-gray-400 mt-1 not-italic line-clamp-2">
                  {addr.address}, {addr.area}, {addr.city}
                </address>
              </div>
            </div>
          );
        })}
      </div>

      {sortedAddresses.length > VISIBLE_ADDRESS_LIMIT && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 mx-auto"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
            />
            {showAll
              ? "Show Less"
              : `Show ${sortedAddresses.length - VISIBLE_ADDRESS_LIMIT} More`}
          </button>
        </div>
      )}
    </div>
  );
}
