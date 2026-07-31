// // 📂 src/app/features/admin/marketing/components/RFMSegmentWidget.tsx (TOP-TIER PKR LOCALIZED & CYBERNETIC RFM MATRIX)

// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Crown,
//   Users,
//   TrendingUp,
//   AlertTriangle,
//   UserX,
//   UserPlus,
//   RefreshCw,
//   Sparkles,
//   Layers,
// } from "lucide-react";
// import { toastError } from "@/app/shared/components/helpers/CustomToasts";
// import { getRFMSegments, RFMSegmentSummary } from "../actions/getRFMSegments";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface RFMSegmentWidgetProps {
//   initialData?: {
//     segments: RFMSegmentSummary[];
//     totalUsers: number;
//     generatedAt: string;
//   };
// }

// // ================================================================
// // 🎨 SEGMENT CONFIG (UI Only)
// // ================================================================
// const SEGMENT_CONFIG: Record<
//   string,
//   {
//     label: string;
//     icon: React.ElementType;
//     color: string;
//     bgColor: string;
//     borderColor: string;
//   }
// > = {
//   Champions: {
//     label: "Champions",
//     icon: Crown,
//     color: "text-amber-500",
//     bgColor: "bg-amber-500/10",
//     borderColor: "border-amber-500/20 dark:border-amber-500/20",
//   },
//   "Loyal Customers": {
//     label: "Loyal",
//     icon: Users,
//     color: "text-emerald-500",
//     bgColor: "bg-emerald-500/10",
//     borderColor: "border-emerald-500/20 dark:border-emerald-500/20",
//   },
//   "Potential Loyalists": {
//     label: "Potential",
//     icon: TrendingUp,
//     color: "text-blue-500",
//     bgColor: "bg-blue-500/10",
//     borderColor: "border-blue-500/20 dark:border-blue-500/20",
//   },
//   "At Risk": {
//     label: "At Risk",
//     icon: AlertTriangle,
//     color: "text-orange-500",
//     bgColor: "bg-orange-500/10",
//     borderColor: "border-orange-500/20 dark:border-orange-500/20",
//   },
//   Hibernating: {
//     label: "Hibernating",
//     icon: TrendingUp,
//     color: "text-yellow-500",
//     bgColor: "bg-yellow-500/10",
//     borderColor: "border-yellow-500/20 dark:border-yellow-500/20",
//   },
//   Lost: {
//     label: "Lost",
//     icon: UserX,
//     color: "text-red-500",
//     bgColor: "bg-red-500/10",
//     borderColor: "border-red-500/20 dark:border-red-500/20",
//   },
//   "New Customers": {
//     label: "New",
//     icon: UserPlus,
//     color: "text-purple-500",
//     bgColor: "bg-purple-500/10",
//     borderColor: "border-purple-500/20 dark:border-purple-500/20",
//   },
//   Others: {
//     label: "Others",
//     icon: Users,
//     color: "text-zinc-500",
//     bgColor: "bg-zinc-500/10",
//     borderColor: "border-zinc-500/20 dark:border-zinc-500/20",
//   },
// };

// // ================================================================
// // 🧩 CARD COMPONENT
// // ================================================================
// const SegmentCard = ({
//   segment,
//   count,
//   percentage,
//   totalUsers,
//   onClick,
// }: {
//   segment: string;
//   count: number;
//   percentage: number;
//   totalUsers: number;
//   onClick: () => void;
// }) => {
//   const config = SEGMENT_CONFIG[segment] || SEGMENT_CONFIG["Others"];

//   return (
//     <button
//       onClick={onClick}
//       className={`p-4 bg-white dark:bg-zinc-950 border ${config.borderColor} rounded-2xl shadow-xs hover:shadow-md hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 text-left w-full group cursor-pointer`}
//     >
//       <div className="flex items-center justify-between">
//         <div className={`p-2.5 rounded-xl border ${config.bgColor} ${config.color} ${config.borderColor}`}>
//           <config.icon size={16} className="stroke-[2.2px]" />
//         </div>
//         <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">
//           {percentage}%
//         </span>
//       </div>
//       <div className="mt-4">
//         <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
//           {config.label}
//         </p>
//         <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 font-mono tracking-tight">
//           {count.toLocaleString('en-PK')} {/* ✅ Localized PK formatting */}
//         </p>
//         <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
//           {totalUsers > 0
//             ? `${((count / totalUsers) * 100).toFixed(1)}% of base`
//             : "0% of base"}
//         </p>
//       </div>
//     </button>
//   );
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function RFMSegmentWidget({ initialData }: RFMSegmentWidgetProps) {
//   const router = useRouter();
//   const [data, setData] = useState(initialData || null);
//   const [isLoading, setIsLoading] = useState(!initialData);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   // Fetch data (if not provided via props)
//   useEffect(() => {
//     if (!initialData) {
//       fetchData();
//     }
//   }, [initialData]);

//   const fetchData = async (showToast: boolean = false) => {
//     try {
//       setIsLoading(true);
//       const result = await getRFMSegments();

//       if (result.success && result.data) {
//         setData({
//           segments: result.data.segments,
//           totalUsers: result.data.totalUsers,
//           generatedAt: result.data.generatedAt,
//         });
//       } else {
//         toastError(result.error || "Failed to fetch RFM segments.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to fetch RFM segments.");
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     fetchData(true);
//   };

//   const handleCardClick = (segment: string) => {
//     router.push(`/admin/marketing-hub?segment=${encodeURIComponent(segment)}`);
//   };

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-pulse">
//         {[...Array(6)].map((_, i) => (
//           <div
//             key={i}
//             className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800"
//           />
//         ))}
//       </div>
//     );
//   }

//   // Empty State
//   if (!data || !data.segments || data.segments.length === 0) {
//     return (
//       <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-950 p-12 text-center animate-in fade-in duration-300">
//         <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
//           <div className="p-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
//             <Users size={24} className="stroke-[2px]" />
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
//               No RFM Segment Data Available
//             </h3>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
//               Calculate RFM metrics (Recency, Frequency, Monetary) dynamically based on customer purchase history.
//             </p>
//           </div>
//           <button
//             onClick={handleRefresh}
//             className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-98 cursor-pointer shadow-sm"
//           >
//             <RefreshCw size={12} />
//             Calculate Segments Now
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const totalUsers = data.totalUsers || 0;

//   return (
//     <div className="p-6 sm:p-8 space-y-6 w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl animate-in fade-in duration-300">
      
//       {/* SECTION HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
//         <div>
//           <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
//             <Layers className="text-brand-primary" size={20} /> RFM Customer Segmentation Matrix
//           </h3>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//             Recency, Frequency & Monetary LTV Customer Tiers
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//             {totalUsers.toLocaleString('en-PK')} CUSTOMERS EVALUATED
//           </span>
//           <button
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50"
//           >
//             <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
//             {isRefreshing ? "Calculating..." : "Recalculate Matrix"}
//           </button>
//         </div>
//       </div>

//       {/* CARDS GRID */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
//         {data.segments.map((segment) => (
//           <SegmentCard
//             key={segment.segment}
//             segment={segment.segment}
//             count={segment.count}
//             percentage={segment.percentage}
//             totalUsers={totalUsers}
//             onClick={() => handleCardClick(segment.segment)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/marketing/components/RFMSegmentWidget.tsx (TOP-TIER PKR LOCALIZED & CYBERNETIC RFM MATRIX)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Users,
  TrendingUp,
  AlertTriangle,
  UserX,
  UserPlus,
  RefreshCw,
  Layers,
} from "lucide-react";
import { toastError } from "@/app/shared/components/helpers/CustomToasts";
import { getRFMSegments, RFMSegmentSummary } from "../actions/getRFMSegments";

// ================================================================
// ✅ TYPES
// ================================================================
interface RFMSegmentWidgetProps {
  initialData?: {
    segments: RFMSegmentSummary[];
    totalUsers: number;
    generatedAt: string;
  };
}

// ================================================================
// 🎨 SEGMENT CONFIG (UI Only)
// ================================================================
const SEGMENT_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  Champions: {
    label: "Champions",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20 dark:border-amber-500/20",
  },
  "Loyal Customers": {
    label: "Loyal",
    icon: Users,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20 dark:border-emerald-500/20",
  },
  "Potential Loyalists": {
    label: "Potential",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20 dark:border-blue-500/20",
  },
  "At Risk": {
    label: "At Risk",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20 dark:border-orange-500/20",
  },
  Hibernating: {
    label: "Hibernating",
    icon: TrendingUp,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20 dark:border-yellow-500/20",
  },
  Lost: {
    label: "Lost",
    icon: UserX,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20 dark:border-red-500/20",
  },
  "New Customers": {
    label: "New",
    icon: UserPlus,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20 dark:border-purple-500/20",
  },
  Others: {
    label: "Others",
    icon: Users,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/20 dark:border-zinc-500/20",
  },
};

// ================================================================
// 🧩 UNIFORM SEGMENT CARD (Kills Rogue Floating Icon Overlap)
// ================================================================
const SegmentCard = ({
  segment,
  count,
  percentage,
  totalUsers,
  onClick,
}: {
  segment: string;
  count: number;
  percentage: number;
  totalUsers: number;
  onClick: () => void;
}) => {
  const config = SEGMENT_CONFIG[segment] || SEGMENT_CONFIG["Others"];

  return (
    <button
      onClick={onClick}
      className={`p-3.5 sm:p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border ${config.borderColor} rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-left w-full h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden min-w-0`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`p-2 rounded-xl border ${config.bgColor} ${config.color} ${config.borderColor} shrink-0`}>
          <config.icon size={16} className="stroke-[2.2px]" />
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0">
          {percentage}%
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">
          {config.label}
        </p>
        <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none mt-1">
          {count.toLocaleString('en-PK')}
        </p>
        <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-medium mt-1 truncate">
          {totalUsers > 0
            ? `${((count / totalUsers) * 100).toFixed(1)}% of base`
            : "0% of base"}
        </p>
      </div>
    </button>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function RFMSegmentWidget({ initialData }: RFMSegmentWidgetProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data (if not provided via props)
  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [initialData]);

  const fetchData = async (showToast: boolean = false) => {
    try {
      setIsLoading(true);
      const result = await getRFMSegments();

      if (result.success && result.data) {
        setData({
          segments: result.data.segments,
          totalUsers: result.data.totalUsers,
          generatedAt: result.data.generatedAt,
        });
      } else {
        toastError(result.error || "Failed to fetch RFM segments.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to fetch RFM segments.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
  };

  const handleCardClick = (segment: string) => {
    router.push(`/admin/marketing-hub?segment=${encodeURIComponent(segment)}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse w-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800"
          />
        ))}
      </div>
    );
  }

  // Empty State
  if (!data || !data.segments || data.segments.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Users size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No RFM Segment Data Available
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Calculate RFM metrics (Recency, Frequency, Monetary) dynamically based on customer purchase history.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} /> Calculate Segments Now
          </button>
        </div>
      </div>
    );
  }

  const totalUsers = data.totalUsers || 0;

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
            {totalUsers.toLocaleString('en-PK')} CUSTOMERS EVALUATED
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Calculating..." : "Recalculate Matrix"}
        </button>
      </div>

      {/* 8-COLUMN UNIFORM CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 items-stretch">
        {data.segments.map((segment) => (
          <SegmentCard
            key={segment.segment}
            segment={segment.segment}
            count={segment.count}
            percentage={segment.percentage}
            totalUsers={totalUsers}
            onClick={() => handleCardClick(segment.segment)}
          />
        ))}
      </div>
    </div>
  );
}