
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // ✅ FIX: usePathname instead of window
import { Star, Upload, X, Loader2 } from "lucide-react";
import { submitReview } from "@/app/features/storefront/customer-account/actions/reviewActions";
import { toastError, toastSuccess } from "@/app/shared/components/helpers/CustomToasts"; 
import Image from "next/image";
import Link from "next/link"; 
import { ProductReview } from "@/types";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: (review: ProductReview) => void;
}

export default function ReviewForm({
  productId,
  onReviewSubmit,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const pathname = usePathname(); // ✅ FIX: No hydration mismatch
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <p className="text-center py-6 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
        Please{" "}
        <Link href="/login" className="font-semibold text-brand-primary hover:underline">
          log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (file) {
      toastError("Image file must be less than 2MB.");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toastError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      toastError("Comment must be at least 10 characters long.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let base64Image = undefined;
      if (imageFile) {
         base64Image = await fileToBase64(imageFile);
      }

      const result = await submitReview({
        productId,
        rating,
        comment,
        reviewImageUrl: base64Image, 
      });

      if (result.success && result.review) {
        toastSuccess(result.message);

        // Telemetry (Server action mein nahi hai, is liye client-side theek hai)
        logUserEvent('form_field_interaction', pathname, {
          field_id: 'review_form',
          interaction_type: 'submit_success',
          rating: rating,
          has_image: !!imageFile,
          is_verified_purchase: result.review.isVerifiedPurchase || false
        });

        onReviewSubmit(result.review);
      } else {
        toastError(result.message);
        logUserEvent('form_field_interaction', pathname, {
          field_id: 'review_form',
          interaction_type: 'submit_failure',
          error_message: result.message || 'Verification review creation failed.'
        });
      }
    } catch (error: any) {
      toastError("An unknown error occurred.");
      logUserEvent('form_field_interaction', pathname, {
        field_id: 'review_form',
        interaction_type: 'submit_failure',
        error_message: error.message || 'Unexpected network error during review submission.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
          Your Rating*
        </p>
        <div
          className="flex items-center space-x-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="p-1"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-7 h-7 cursor-pointer transition-colors duration-150 ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600 hover:text-yellow-400/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="font-medium text-gray-800 dark:text-gray-200 mb-2 block">
          Your Comment*
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          placeholder="Share your thoughts..."
          required
          minLength={10}
        />
      </div>
      <div>
        <label className="font-medium text-gray-800 dark:text-gray-200 mb-2 block">
          Add a photo (optional)
        </label>
        {imagePreview ? (
          <div className="relative w-28 h-28">
            <Image src={imagePreview} alt="Review preview" fill className="rounded-md object-cover border border-gray-300" />
            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 hover:bg-red-600"><X size={16} /></button>
          </div>
        ) : (
          <label className="w-full flex items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100">
            <div className="text-center text-gray-500">
              <Upload className="mx-auto h-8 w-8" />
              <p className="mt-1 text-sm">Click to upload <span className="text-xs">(Max 2MB)</span></p>
            </div>
            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400">
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        {isLoading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}