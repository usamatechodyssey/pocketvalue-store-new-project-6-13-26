// src/app/shared/components/ui/QuantitySelector.tsx

"use client";
import React from 'react';
import { FiMinus, FiPlus } from "react-icons/fi";
import { toast } from 'react-hot-toast';

interface Props {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  className?: string;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  className = "",
  max = Infinity,
}: Props) {

  const handleDecrease = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    } else {
      toast.error(`Only ${max} in stock.`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      onQuantityChange(1);
    } else if (value > max) {
      onQuantityChange(max);
      toast.error(`Only ${max} in stock.`);
    } else {
      onQuantityChange(value);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-r border-gray-300 dark:border-gray-600 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <FiMinus size={16} />
        </button>

        {/* ✅ FIX: Added spinbutton role and ARIA attributes for accessibility */}
        <input
          type="number"
          min="1"
          max={max === Infinity ? undefined : max}
          value={quantity}
          onChange={handleChange}
          role="spinbutton"
          aria-label="Quantity"
          aria-valuenow={quantity}
          aria-valuemin={1}
          aria-valuemax={max === Infinity ? 9999 : max}
          className="w-12 h-10 text-center font-bold text-gray-900 dark:text-white text-base bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-l border-gray-300 dark:border-gray-600 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <FiPlus size={16} />
        </button>
        
      </div>
    </div>
  );
}