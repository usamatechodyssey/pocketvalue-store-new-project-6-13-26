// // 📂 src/app/features/admin/marketing/components/WinbackWidget.tsx (FULLY TYPE-SAFE & TS2339 RESOLVED)

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useSearchParams } from "next/navigation";
// import {
//   Users,
//   Mail,
//   Loader2,
//   RefreshCw,
//   Crown,
//   User,
//   UserX,
//   TrendingUp,
//   Banknote,
// } from "lucide-react";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
// import PaginationControls from "@/app/shared/components/ui/PaginationControls";
// import { getWinbackCandidates, WinbackCandidate, PaginatedWinbackCandidatesResult } from "../actions/getWinbackCandidates";
// import { sendCampaign } from "../actions/sendCampaign";

// // ✅ Winback Email Template
// import { createWinbackEmailHtml } from "@/email_templates/winbackEmail";

// // ================================================================
// // ✅ HELPERS (With en-PK Formatting)
// // ================================================================
// const formatCurrency = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;
// const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-PK");

// const getSegmentBadge = (segment: string) => {
//   switch (segment) {
//     case "high-value":
//       return (
//         <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-bold uppercase flex items-center justify-center gap-1">
//           <Crown size={10} /> High
//         </span>
//       );
//     case "medium-value":
//       return (
//         <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-bold uppercase">
//           Medium
//         </span>
//       );
//     default:
//       return (
//         <span className="px-2.5 py-0.5 bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-full text-[9px] font-bold uppercase">
//           Low
//         </span>
//       );
//   }
// };

// // ================================================================
// // 🧩 STATS CARD COMPONENT
// // ================================================================
// const StatsCard = ({
//   title,
//   value,
//   icon: Icon,
//   color = "brand",
//   subtext,
// }: {
//   title: string;
//   value: string | number;
//   icon: React.ElementType;
//   color?: "brand" | "amber" | "red" | "blue" | "purple" | "emerald";
//   subtext?: string;
// }) => {
//   const colors = {
//     brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
//     amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
//     red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
//     blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
//     purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
//     emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
//   };

//   return (
//     <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200">
//       <div className="flex items-center gap-3">
//         <div className={`p-2.5 rounded-xl border ${colors[color]} shrink-0`}>
//           <Icon size={18} />
//         </div>
//         <div className="min-w-0">
//           <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider truncate">
//             {title}
//           </p>
//           <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 font-mono tracking-tight">
//             {typeof value === "number" ? value.toLocaleString('en-PK') : value}
//           </p>
//           {subtext && (
//             <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
//               {subtext}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function WinbackWidget() {
//   const searchParams = useSearchParams();
//   const currentPage = Number(searchParams.get("page")) || 1;

//   const [data, setData] = useState<PaginatedWinbackCandidatesResult | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [isSending, setIsSending] = useState(false);

//   // ✅ TS(2339) FIX: Corrected result mapping for direct PaginatedWinbackCandidatesResult return
//   const fetchData = useCallback(
//     async (showToast: boolean = false) => {
//       try {
//         setIsLoading(true);
//         const result = await getWinbackCandidates({
//           page: currentPage,
//           limit: 20,
//         });

//         if (result && result.candidates) {
//           setData(result);
//           setSelectedUsers(new Set());
//           if (showToast) {
//             toastSuccess("Winback candidates updated!");
//           }
//         } else {
//           toastError("Failed to load winback candidates.");
//         }
//       } catch (error: any) {
//         toastError(error.message || "Failed to load winback candidates.");
//       } finally {
//         setIsLoading(false);
//         setIsRefreshing(false);
//       }
//     },
//     [currentPage]
//   );

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     fetchData(true);
//   };

//   // Selection handlers
//   const toggleSelectAll = () => {
//     if (!data) return;
//     if (selectedUsers.size === data.candidates.length) {
//       setSelectedUsers(new Set());
//     } else {
//       setSelectedUsers(new Set(data.candidates.map((c) => c._id)));
//     }
//   };

//   const toggleSelect = (id: string) => {
//     const newSet = new Set(selectedUsers);
//     if (newSet.has(id)) newSet.delete(id);
//     else newSet.add(id);
//     setSelectedUsers(newSet);
//   };

//   // Send Winback Email (Single)
//   const handleSendWinbackEmail = async (user: WinbackCandidate) => {
//     if (!user.email) {
//       toastError("No email address available for this user.");
//       return;
//     }

//     setIsSending(true);
//     try {
//       const htmlContent = createWinbackEmailHtml({
//         customerName: user.name,
//         inactiveDays: user.daysSinceLastOrder,
//         ctaLink: "https://pocketvalue.pk",
//         discountCode: "WINBACK20",
//         discountPercent: 20,
//         personalizedNote: `We've added some amazing new products since your last visit. We think you'll love them!`,
//       });

//       const result = await sendCampaign({
//         emails: [user.email],
//         subject: "We Miss You! ❤️ Come Back & Explore",
//         htmlContent,
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         toastSuccess(`Winback email sent to ${user.email}`);
//         await fetchData();
//       } else {
//         toastError(result.message || "Failed to send winback email.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to send winback email.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Bulk Send Winback Emails
//   const handleBulkSend = async () => {
//     if (selectedUsers.size === 0) {
//       toastError("Please select at least one user.");
//       return;
//     }

//     const selected = data?.candidates.filter((c) => selectedUsers.has(c._id)) || [];
//     const emails = selected.map((c) => c.email).filter(Boolean) as string[];

//     if (emails.length === 0) {
//       toastError("Selected users have no email addresses.");
//       return;
//     }

//     setIsSending(true);
//     try {
//       const htmlContent = createWinbackEmailHtml({
//         customerName: "{{name}}",
//         inactiveDays: 30,
//         ctaLink: "https://pocketvalue.pk",
//         discountCode: "WINBACK20",
//         discountPercent: 20,
//         personalizedNote: `We miss you! Come back and explore new products just for you.`,
//       });

//       const result = await sendCampaign({
//         emails,
//         subject: "We Miss You! ❤️ Come Back & Explore",
//         htmlContent,
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         toastSuccess(`Winback emails sent to ${result.sentCount} users.`);
//         setSelectedUsers(new Set());
//         await fetchData();
//       } else {
//         toastError(result.message || "Failed to send winback emails.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to send winback emails.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-6 animate-pulse bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
//         <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
//           {[...Array(6)].map((_, i) => (
//             <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
//           ))}
//         </div>
//         <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
//           <div className="p-4 space-y-2">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Empty State
//   if (!data || !data.candidates || data.candidates.length === 0) {
//     return (
//       <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-950 p-12 text-center animate-in fade-in duration-300">
//         <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
//           <div className="p-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
//             <UserX size={24} className="stroke-[2px]" />
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
//               No Winback Candidates
//             </h3>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
//               All customers have been active recently. Great job maintaining customer engagement!
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 sm:p-8 space-y-6 w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl animate-in fade-in duration-300">
      
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
//         <div>
//           <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
//             <Users className="text-brand-primary" size={20} /> Inactive Customer Re-Engagement
//           </h3>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//             Phase 2.2 Winback Pipeline & Automated Re-Activation Candidates
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//             {data.totalDocs} CANDIDATES
//           </span>
//           <button
//             onClick={handleRefresh}
//             disabled={isRefreshing}
//             className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50"
//           >
//             <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
//             {isRefreshing ? "Updating..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       {/* 6-CARD MATRIX (Includes Total Winback Revenue PKR) */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         <StatsCard
//           title="Winback Potential"
//           value={formatCurrency(data.summary.totalWinbackPotentialRevenue || 0)}
//           icon={Banknote}
//           color="brand"
//           subtext="Inactive Customer LTV"
//         />
//         <StatsCard
//           title="Total Inactive"
//           value={data.summary.total}
//           icon={Users}
//           color="blue"
//         />
//         <StatsCard
//           title="High Value VIPs"
//           value={data.summary.highValue}
//           icon={Crown}
//           color="amber"
//         />
//         <StatsCard
//           title="Medium Value"
//           value={data.summary.mediumValue}
//           icon={TrendingUp}
//           color="purple"
//         />
//         <StatsCard
//           title="Low Value"
//           value={data.summary.lowValue}
//           icon={User}
//           color="red"
//         />
//         <StatsCard
//           title="Has Email"
//           value={data.summary.hasEmail}
//           icon={Mail}
//           color="emerald"
//           subtext="Ready for winback"
//         />
//       </div>

//       {/* Bulk Action */}
//       {selectedUsers.size > 0 && (
//         <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
//           <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
//             {selectedUsers.size} users selected for winback campaign
//           </span>
//           <button
//             onClick={handleBulkSend}
//             disabled={isSending}
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-amber-500/20"
//           >
//             {isSending ? (
//               <Loader2 size={14} className="animate-spin" />
//             ) : (
//               <Mail size={14} />
//             )}
//             {isSending ? "Sending..." : "Send Bulk Winback Campaign"}
//           </button>
//         </div>
//       )}

//       {/* Table Container */}
//       <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
//         <div className="overflow-auto max-h-87.5 custom-scrollbar">
//           <table className="w-full border-collapse text-left text-xs relative">
//             <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800">
//               <tr className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">
//                 <th className="py-3.5 px-4 w-10">
//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.size === data.candidates.length && data.candidates.length > 0}
//                     onChange={toggleSelectAll}
//                     className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
//                     disabled={selectedUsers.size > 0 && data.candidates.every((c) => !c.email)}
//                   />
//                 </th>
//                 <th className="py-3.5 px-4">Customer</th>
//                 <th className="py-3.5 px-4 text-center">Orders</th>
//                 <th className="py-3.5 px-4 text-right">Total Spend</th>
//                 <th className="py-3.5 px-4 text-center">Last Order</th>
//                 <th className="py-3.5 px-4 text-center">Days Inactive</th>
//                 <th className="py-3.5 px-4 text-center">Segment</th>
//                 <th className="py-3.5 px-4 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white/50 dark:bg-zinc-950/50">
//               {data.candidates.map((user) => (
//                 <tr
//                   key={user._id}
//                   className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
//                 >
//                   <td className="py-3.5 px-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.has(user._id)}
//                       onChange={() => toggleSelect(user._id)}
//                       className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
//                       disabled={!user.email}
//                     />
//                   </td>
//                   <td className="py-3.5 px-4">
//                     <p className="font-bold text-zinc-900 dark:text-zinc-100">
//                       {user.name}
//                     </p>
//                     <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{user.email}</p>
//                     {user.phone && (
//                       <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono mt-0.5">📱 {user.phone}</p>
//                     )}
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300">
//                     {user.totalOrders}
//                   </td>
//                   <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-primary">
//                     {formatCurrency(user.totalSpend)}
//                   </td>
//                   <td className="py-3.5 px-4 text-center text-zinc-500 font-mono">
//                     {formatDate(user.lastOrderDate)}
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
//                       {user.daysSinceLastOrder}d
//                     </span>
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     {getSegmentBadge(user.segment)}
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     {user.email ? (
//                       <button
//                         onClick={() => handleSendWinbackEmail(user)}
//                         disabled={isSending}
//                         className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all hover:scale-102 shadow-sm"
//                       >
//                         <Mail size={12} />
//                         Send
//                       </button>
//                     ) : (
//                       <span className="text-zinc-400 dark:text-zinc-600 text-[10px]">—</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {data.totalPages > 1 && (
//         <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
//           <PaginationControls totalPages={data.totalPages} />
//         </div>
//       )}
//     </div>
//   );
// }
// 📂 src/app/features/admin/marketing/components/WinbackWidget.tsx (FULLY TYPE-SAFE & TS2339 RESOLVED)

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Mail,
  Loader2,
  RefreshCw,
  Crown,
  User,
  UserX,
  TrendingUp,
  Banknote,
} from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { getWinbackCandidates, WinbackCandidate, PaginatedWinbackCandidatesResult } from "../actions/getWinbackCandidates";
import { sendCampaign } from "../actions/sendCampaign";

// ✅ Winback Email Template
import { createWinbackEmailHtml } from "@/email_templates/winbackEmail";

// ================================================================
// ✅ HELPERS (With en-PK Formatting)
// ================================================================
const formatCurrency = (value: number) => `Rs. ${(value || 0).toLocaleString('en-PK')}`;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-PK");

const getSegmentBadge = (segment: string) => {
  switch (segment) {
    case "high-value":
      return (
        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1">
          <Crown size={10} /> High VIP
        </span>
      );
    case "medium-value":
      return (
        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-mono font-bold uppercase">
          Medium
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20 rounded-full text-[9px] font-mono font-bold uppercase">
          Standard
        </span>
      );
  }
};

// ================================================================
// 🧩 HIGH-DENSITY NO-TRUNCATION STATS CARD
// ================================================================
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "brand",
  subtext,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: "brand" | "amber" | "red" | "blue" | "purple" | "emerald";
  subtext?: string;
}) => {
  const colors = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="p-3.5 sm:p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-tight wrap-break-word">
          {title}
        </p>
        <div className={`p-2 rounded-xl border ${colors[color]} shrink-0 shadow-2xs`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString('en-PK') : value}
        </p>
        {subtext && (
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-tight wrap-break-word">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function WinbackWidget() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState<PaginatedWinbackCandidatesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(
    async (showToast: boolean = false) => {
      try {
        setIsLoading(true);
        const result = await getWinbackCandidates({
          page: currentPage,
          limit: 20,
        });

        if (result && result.candidates) {
          setData(result);
          setSelectedUsers(new Set());
          if (showToast) {
            toastSuccess("Winback candidates updated!");
          }
        } else {
          toastError("Failed to load winback candidates.");
        }
      } catch (error: any) {
        toastError(error.message || "Failed to load winback candidates.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedUsers.size === data.candidates.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(data.candidates.map((c) => c._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  // Send Winback Email (Single)
  const handleSendWinbackEmail = async (user: WinbackCandidate) => {
    if (!user.email) {
      toastError("No email address available for this user.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createWinbackEmailHtml({
        customerName: user.name,
        inactiveDays: user.daysSinceLastOrder,
        ctaLink: "https://pocketvalue.pk",
        discountCode: "WINBACK20",
        discountPercent: 20,
        personalizedNote: `We've added some amazing new products since your last visit. We think you'll love them!`,
      });

      const result = await sendCampaign({
        emails: [user.email],
        subject: "We Miss You! ❤️ Come Back & Explore",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Winback email sent to ${user.email}`);
        await fetchData();
      } else {
        toastError(result.message || "Failed to send winback email.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send winback email.");
    } finally {
      setIsSending(false);
    }
  };

  // Bulk Send Winback Emails
  const handleBulkSend = async () => {
    if (selectedUsers.size === 0) {
      toastError("Please select at least one user.");
      return;
    }

    const selected = data?.candidates.filter((c) => selectedUsers.has(c._id)) || [];
    const emails = selected.map((c) => c.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      toastError("Selected users have no email addresses.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createWinbackEmailHtml({
        customerName: "{{name}}",
        inactiveDays: 30,
        ctaLink: "https://pocketvalue.pk",
        discountCode: "WINBACK20",
        discountPercent: 20,
        personalizedNote: `We miss you! Come back and explore new products just for you.`,
      });

      const result = await sendCampaign({
        emails,
        subject: "We Miss You! ❤️ Come Back & Explore",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Winback emails sent to ${result.sentCount} users.`);
        setSelectedUsers(new Set());
        await fetchData();
      } else {
        toastError(result.message || "Failed to send winback emails.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send winback emails.");
    } finally {
      setIsSending(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
          ))}
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!data || !data.candidates || data.candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <UserX size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Winback Candidates
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            All customers have been active recently. Great job maintaining customer engagement!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Action Bar Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
            {data.totalDocs} CANDIDATES IN PIPELINE
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* 6-CARD MATRIX (No Truncation) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard
          title="Winback Potential"
          value={formatCurrency(data.summary.totalWinbackPotentialRevenue || 0)}
          icon={Banknote}
          color="brand"
          subtext="Inactive Customer LTV"
        />
        <StatsCard
          title="Total Inactive"
          value={data.summary.total}
          icon={Users}
          color="blue"
          subtext="30+ Days Inactive"
        />
        <StatsCard
          title="High Value VIPs"
          value={data.summary.highValue}
          icon={Crown}
          color="amber"
          subtext="High LTV Segment"
        />
        <StatsCard
          title="Medium Value"
          value={data.summary.mediumValue}
          icon={TrendingUp}
          color="purple"
          subtext="Moderate Spend"
        />
        <StatsCard
          title="Low Value"
          value={data.summary.lowValue}
          icon={User}
          color="red"
          subtext="Single Order"
        />
        <StatsCard
          title="Has Email"
          value={data.summary.hasEmail}
          icon={Mail}
          color="emerald"
          subtext="Reachable Leads"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {selectedUsers.size} CANDIDATES SELECTED
          </span>
          <button
            onClick={handleBulkSend}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            {isSending ? "Dispatching..." : "Send Bulk Winback Email"}
          </button>
        </div>
      )}

      {/* Table Container (With Scroll Guard & Zero Squeezing) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-105 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 w-10 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === data.candidates.length && data.candidates.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                    disabled={selectedUsers.size > 0 && data.candidates.every((c) => !c.email)}
                  />
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Customer</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Orders</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Total Spend</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Last Order</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Days Inactive</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Segment</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {data.candidates.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user._id)}
                      onChange={() => toggleSelect(user._id)}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                      disabled={!user.email}
                    />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{user.email || "No email"}</p>
                    {user.phone && (
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono mt-0.5">📱 {user.phone}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {user.totalOrders}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-brand-primary whitespace-nowrap">
                    {formatCurrency(user.totalSpend)}
                  </td>
                  <td className="py-3 px-4 text-center text-zinc-500 font-mono whitespace-nowrap">
                    {formatDate(user.lastOrderDate)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                      {user.daysSinceLastOrder}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {getSegmentBadge(user.segment)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {user.email ? (
                      <button
                        onClick={() => handleSendWinbackEmail(user)}
                        disabled={isSending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all hover:scale-102 shadow-xs cursor-pointer shrink-0"
                      >
                        <Mail size={12} />
                        Send
                      </button>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600 text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4">
          <PaginationControls totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}