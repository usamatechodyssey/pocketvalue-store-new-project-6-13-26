
"use client";

import { useState } from "react";
import { ProductReview } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { Star, UserCircle, ChevronDown, ChevronUp, Check } from "lucide-react";
import Image from "next/image";

// Star Component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={` ${
          star <= rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200 dark:text-gray-700"
        }`}
      />
    ))}
  </div>
);

export default function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  if (!reviews || reviews.length === 0) return null;

  const toggleReview = (id: string) => {
    setExpandedReviewId(expandedReviewId === id ? null : id);
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      {reviews.map((review) => {
        const isExpanded = expandedReviewId === review._id;
        const showToggleButton = review.comment.length > 100 || !!review.reviewImage;

        return (
          <div
            key={review._id}
            className="flex flex-col w-full bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 dark:border-gray-700 shrink-0">
                        {review.user?.image ? (
                            <Image src={review.user.image} alt={review.user.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <UserCircle size={22} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {review.user?.name || "Customer"}
                        </p>
                        <StarRating rating={review.rating} />
                    </div>
                </div>
                
                {/* Date */}
                <span className="text-xs text-gray-400 shrink-0">
                    {new Date(review._createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            </div>
            
            {/* ================================================================= */}
            {/* 🚀 CONDITIONAL VERIFICATION BADGE: Only rendered if verified in DB (Gap #58) */}
            {/* ================================================================= */}
            {review.isVerifiedPurchase && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-2">
                   <Check size={12} strokeWidth={3} />
                   <span>Verified Purchase</span>
              </div>
            )}
            {/* ================================================================= */}

            {/* Content */}
            <div className="grow">
                <p 
                    className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}
                >
                    {review.comment}
                </p>

                {/* Expandable Image */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && review.reviewImage ? 'max-h-80 mt-4' : 'max-h-0'}`}>
                    {review.reviewImage && (
                        // ✅ FIX 1: Changed 'aspect-4/3' to 'aspect-[4/3]' (Tailwind arbitrary value)
                        <div className="relative max-h-60 w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 aspect-4/3">
                             <Image 
                                src={urlFor(review.reviewImage).url()} 
                                alt="Review" 
                                fill 
                                className="object-contain p-2"
                             />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex justify-end">
                 {showToggleButton && (
                    // ✅ FIX 2: Added aria-expanded for screen readers
                    <button 
                        onClick={() => toggleReview(review._id)} 
                        className="text-xs font-bold text-gray-500 hover:text-brand-primary flex items-center gap-1 transition-colors"
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? "Show Less" : "Show More"}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                 )}
            </div>

          </div>
        );
      })}
    </div>
  );
}