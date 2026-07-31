// /src/app/account/orders/[orderId]/_components/ReturnableItem.tsx (UPDATED)

"use client";

import { ClientOrderProduct } from "@/models/Order";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { CUSTOMER_RETURN_REASONS } from "@/app/shared/utils/orderDisplayUtils";

const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

interface ReturnableItemProps {
  product: ClientOrderProduct;
  isSelected: boolean;
  selectedQuantity: number;
  selectedReason: string;
  onToggle: () => void;
  onItemChange: (field: "quantity" | "reason", value: string | number) => void;
}

export default function ReturnableItem({
  product,
  isSelected,
  selectedQuantity,
  selectedReason,
  onToggle,
  onItemChange,
}: ReturnableItemProps) {
  return (
    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
        />
        <label
          className="grow font-semibold text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
          onClick={onToggle}
        >
          {product.name}
        </label>
      </div>

      {isSelected && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8 animate-in fade-in-0 duration-300">
          <div>
            <label
              htmlFor={`quantity-${product.cartItemId}`}
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Quantity
            </label>
            <input
              id={`quantity-${product.cartItemId}`}
              type="number"
              value={selectedQuantity}
              onChange={(e) =>
                onItemChange("quantity", parseInt(e.target.value) || 1)
              }
              min="1"
              max={product.quantity}
              className={inputStyles}
            />
          </div>
          <div>
            <label
              htmlFor={`reason-${product.cartItemId}`}
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              Reason for Return
            </label>
            <select
              id={`reason-${product.cartItemId}`}
              value={selectedReason}
              onChange={(e) => onItemChange("reason", e.target.value)}
              className={inputStyles}
            >
              {CUSTOMER_RETURN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}