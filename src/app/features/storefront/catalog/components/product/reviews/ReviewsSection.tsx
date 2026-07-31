
// // src/app/components/reviews/ReviewsSection.tsx (UPGRADED WITH REVIEWS ENGAGEMENT TELEMETRY)

"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductReview } from "@/types";
import ProductReviews from "./ProductReviews";
import {
  Star,
  MessageSquarePlus,
  Filter,
  Camera,
  Check,
  BarChart3,
  Frown,
} from "lucide-react";
import ProductReviewModal from "./ProductReviewModal";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { motion } from "framer-motion";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface ReviewsSectionProps {
  productId: string;
  allReviews: ProductReview[];
  onNewReview: (review: ProductReview) => void;
}

type FilterType = "all" | "photos" | "5star" | "critical";
const REVIEWS_PER_PAGE = 5;

export default function ReviewsSection({
  productId,
  allReviews,
  onNewReview,
}: ReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("rev_page")) || 1;

  const openModal = () => {
    setIsModalOpen(true);
    logUserEvent('form_field_interaction', pathname, {
      field_id: 'write_review_button',
      interaction_type: 'click'
    });
  };
  
  const closeModal = () => setIsModalOpen(false);

  const summary = useMemo(() => {
    const total = allReviews.length;
    if (total === 0) return null;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => (counts[r.rating] = (counts[r.rating] || 0) + 1));
    return { avg, total, counts };
  }, [allReviews]);

  const filteredReviews = useMemo(() => {
    let data = [...allReviews];
    if (activeFilter === "photos") data = data.filter((r) => r.reviewImage);
    if (activeFilter === "5star") data = data.filter((r) => r.rating === 5);
    if (activeFilter === "critical") data = data.filter((r) => r.rating <= 3);
    return data;
  }, [allReviews, activeFilter]);

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    logUserEvent('form_field_interaction', pathname, {
      field_id: 'review_filter',
      interaction_type: 'click',
      selected_filter: filter
    });

    if (currentPage > 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("rev_page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const filters = [
    { id: "all", label: "All Reviews", icon: null },
    { id: "photos", label: "With Photos", icon: Camera },
    { id: "5star", label: "5 Stars", icon: Star },
    { id: "critical", label: "Critical", icon: Filter },
  ];

  return (
    <>
      <div
        id="reviews"
        className="w-full mt-12 md:mt-20 pt-8 border-t border-gray-100 dark:border-gray-800"
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl md:text-3xl font-clash font-bold text-gray-900 dark:text-white">
                  Customer Reviews
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                  {allReviews.length}
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-md">
                Verified feedback from our community.
              </p>
            </div>

            <button
              onClick={openModal}
              className="w-full md:w-auto group flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary text-white font-bold rounded-xl shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            >
              <MessageSquarePlus
                size={18}
                className="group-hover:-rotate-12 transition-transform duration-300"
              />
              Write a Review
            </button>
          </div>

          {summary ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 pb-6 lg:pb-0 lg:pr-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                    {summary.avg.toFixed(1)}
                  </span>
                  <span className="text-lg text-gray-400 font-bold">/ 5</span>
                </div>
                <div className="flex items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      className={`${s <= Math.round(summary.avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-500">
                  Based on{" "}
                  <span className="text-gray-900 dark:text-white font-bold">
                    {summary.total}
                  </span>{" "}
                  verified reviews
                </p>
              </div>

              <div className="lg:col-span-8 flex flex-col justify-center gap-2.5 w-full">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div
                    key={star}
                    className="grid grid-cols-[2rem_1fr_3rem] items-center gap-3 group w-full"
                  >
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {star}
                      </span>
                      <Star
                        size={12}
                        className="text-gray-300 group-hover:text-yellow-400 transition-colors"
                      />
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${(summary.counts[star] / summary.total) * 100}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-yellow-400"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-400 text-right tabular-nums">
                      {summary.counts[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3">
                <BarChart3 size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No reviews yet
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Be the first to share your experience!
              </p>
            </div>
          )}

          <div className="w-full flex items-center gap-3 overflow-hidden">
            <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
              Filter by:
            </span>
            <div
              className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 
                mask-[linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)]"
            >
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id as FilterType)}
                  // ✅ FIX: Added aria-pressed for screen readers
                  aria-pressed={activeFilter === f.id}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border whitespace-nowrap
                        ${
                          activeFilter === f.id
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                >
                  {f.icon && <f.icon size={14} />}
                  {f.label}
                  {activeFilter === f.id && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-50">
            {paginatedReviews.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProductReviews reviews={paginatedReviews} />

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <PaginationControls
                      totalPages={totalPages}
                      paramName="rev_page"
                    />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Frown size={40} className="text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No reviews match
                </h3>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="mt-3 text-sm font-bold text-brand-primary hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductReviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        productId={productId}
        onReviewSubmit={onNewReview}
      />
    </>
  );
}
