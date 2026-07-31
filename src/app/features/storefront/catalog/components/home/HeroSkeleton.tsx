
export default function HeroSkeleton() {
  return (
    <div className="w-full relative bg-gray-200 dark:bg-gray-800 overflow-hidden">
      
      {/* === ASPECT RATIO MATCHING (Critical for CLS) === */}
      {/* Ye exactly HeroCarousel ki tarah jagah lega */}
      <div className="w-full aspect-4/5 md:aspect-3/1 relative">
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        
        {/* Loading Pulse */}
        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse opacity-50" />
        
        {/* Center Spinner (Optional - for visual feedback) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>

      </div>
    </div>
  );
}