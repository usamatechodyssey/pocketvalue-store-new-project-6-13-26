export default function ProductCardSkeleton() {
  return (
    // ✅ FIX: Add aria-hidden="true" to hide from screen readers during loading
    <div 
      className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 animate-pulse overflow-hidden"
      aria-hidden="true"
      role="status"
      aria-label="Loading product..."
    >
      {/* IMAGE AREA */}
      <div className="relative w-full aspect-4/5 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-col grow p-4 gap-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 w-1/3 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 rounded"></div>
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 w-24 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 w-16 rounded opacity-60"></div>
        </div>
      </div>
    </div>
  );
}