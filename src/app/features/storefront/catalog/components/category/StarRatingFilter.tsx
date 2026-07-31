// src/app/components/category/StarRatingFilter.tsx

"use client";

import { Star } from "lucide-react";

interface Props {
  selectedRating: number | null;
  onChange: (rating: number | null) => void;
}

export default function StarRatingFilter({ selectedRating, onChange }: Props) {
  const ratings = [4, 3, 2, 1]; // We usually show 4+ first

  return (
    // ✅ FIX 1: Added role="radiogroup" for semantic grouping
    <div 
      className="space-y-1"
      role="radiogroup"
      aria-label="Filter by minimum rating"
    >
      {ratings.map((rating) => {
        const isSelected = selectedRating === rating;

        return (
          <button
            key={rating}
            // ✅ FIX 2: Added role="radio" and aria-checked
            role="radio"
            aria-checked={isSelected}
            // ✅ FIX 3: Added descriptive aria-label
            aria-label={`Show ${rating} stars and up`}
            onClick={() => onChange(isSelected ? null : rating)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group
              ${isSelected
                ? "bg-brand-primary/10 border border-brand-primary/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"}`}
          >
            {/* Radio-like Circle */}
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0
               ${isSelected ? "border-brand-primary bg-brand-primary" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
               {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  // ✅ FIX 4: Added aria-hidden="true" for decorative icons
                  aria-hidden="true"
                  className={`${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700"
                  }`}
                />
              ))}
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              & Up
            </span>
          </button>
        );
      })}
    </div>
  );
}