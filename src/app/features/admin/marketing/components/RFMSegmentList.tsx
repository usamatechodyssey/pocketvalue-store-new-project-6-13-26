// // 📂 src/app/features/admin/marketing/components/RFMSegmentList.tsx (TOP-TIER PKR LOCALIZED & ROUTE MATCHED)

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Users,
//   Loader2,
//   Mail,
//   ChevronLeft,
//   Sparkles,
// } from "lucide-react";
// import Link from "next/link";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
// import PaginationControls from "@/app/shared/components/ui/PaginationControls";
// import { getRFMSegments, RFMUser } from "../actions/getRFMSegments";
// import { sendCampaign } from "../actions/sendCampaign";

// // ✅ Welcome Series Email Template
// import { createCampaignBroadcastEmailHtml } from "@/email_templates/campaignBroadcastEmail";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface RFMSegmentListProps {
//   segment: string;
// }

// // ================================================================
// // 🔧 HELPERS (With en-PK Localization)
// // ================================================================
// const formatCurrency = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;

// const getScoreColor = (score: number) => {
//   if (score >= 4) return "text-emerald-600 dark:text-emerald-400";
//   if (score >= 3) return "text-yellow-600 dark:text-yellow-500";
//   if (score >= 2) return "text-orange-600 dark:text-orange-400";
//   return "text-red-600 dark:text-red-400";
// };

// const getScoreBgColor = (score: number) => {
//   if (score >= 4) return "bg-emerald-500/10 border-emerald-500/20";
//   if (score >= 3) return "bg-yellow-500/10 border-yellow-500/20";
//   if (score >= 2) return "bg-orange-500/10 border-orange-500/20";
//   return "bg-red-500/10 border-red-500/20";
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function RFMSegmentList({ segment }: RFMSegmentListProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const currentPage = Number(searchParams.get("page")) || 1;

//   const [users, setUsers] = useState<RFMUser[]>([]);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [isSending, setIsSending] = useState(false);

//   // Fetch data
//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const result = await getRFMSegments({
//         segmentFilter: segment,
//         page: currentPage,
//         limit: 20,
//       });

//       if (result.success && result.data) {
//         setUsers(result.data.users);
//         setTotalUsers(result.data.totalUsers);
//         setTotalPages(Math.ceil(result.data.totalUsers / 20));
//         setSelectedUsers(new Set());
//       } else {
//         toastError(result.error || "Failed to load segment data.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to load segment data.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [segment, currentPage]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Selection handlers
//   const toggleSelectAll = () => {
//     if (selectedUsers.size === users.length) {
//       setSelectedUsers(new Set());
//     } else {
//       setSelectedUsers(new Set(users.map((u) => u.userId)));
//     }
//   };

//   const toggleSelect = (userId: string) => {
//     const newSet = new Set(selectedUsers);
//     if (newSet.has(userId)) newSet.delete(userId);
//     else newSet.add(userId);
//     setSelectedUsers(newSet);
//   };

//   // Send campaign to selected users
//   const handleSendCampaign = async () => {
//     if (selectedUsers.size === 0) {
//       toastError("Please select at least one user.");
//       return;
//     }

//     setIsSending(true);
//     try {
//       const htmlContent = createCampaignBroadcastEmailHtml({
//         customerName: "{{name}}",
//         subject: `Special Offer for ${segment}`,
//         htmlContent: `
//           <p>You are part of our <strong>${segment}</strong> segment.</p>
//           <p>We have a special offer just for you! Don't miss out on exclusive deals tailored to your shopping habits.</p>
//           <p>Shop now and enjoy premium quality at unbeatable prices.</p>
//         `,
//         ctaLink: "https://pocketvalue.pk/deals",
//         ctaText: "Shop Now",
//       });

//       const result = await sendCampaign({
//         userIds: Array.from(selectedUsers),
//         subject: `Special Offer for ${segment}`,
//         htmlContent,
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         toastSuccess(result.message);
//         setSelectedUsers(new Set());
//       } else {
//         toastError(result.message || "Failed to send campaign.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to send campaign.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-6 animate-pulse bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
//         <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
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

//   return (
//     <div className="p-6 sm:p-8 space-y-6 w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl animate-in fade-in duration-300">
      
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
//         <div className="flex items-center gap-4 flex-wrap">
//           <button
//             onClick={() => router.push("/admin/marketing-hub")}
//             className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:scale-102 cursor-pointer"
//           >
//             <ChevronLeft size={14} className="stroke-[2.5px]" />
//             Back to Matrix
//           </button>
          
//           <div className="flex items-center gap-3">
//             <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
//               <Sparkles size={18} className="text-brand-primary" /> {segment} Segment
//             </h2>
//             <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//               {totalUsers.toLocaleString('en-PK')} CUSTOMERS FOUND
//             </span>
//           </div>
//         </div>

//         {selectedUsers.size > 0 && (
//           <button
//             onClick={handleSendCampaign}
//             disabled={isSending}
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
//           >
//             {isSending ? (
//               <Loader2 size={14} className="animate-spin" />
//             ) : (
//               <Mail size={14} />
//             )}
//             {isSending ? "Sending..." : `Send Email (${selectedUsers.size})`}
//           </button>
//         )}
//       </div>

//       {/* Table Container */}
//       <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
//         {users.length === 0 ? (
//           <div className="text-center py-12 text-zinc-400">
//             <Users size={40} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
//             <p className="text-sm font-bold text-zinc-500">No users found in this segment</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto max-h-87.5 custom-scrollbar">
//             <table className="w-full border-collapse text-left text-xs relative">
//               <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800">
//                 <tr className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">
//                   <th className="py-3.5 px-4 w-10">
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.size === users.length && users.length > 0}
//                       onChange={toggleSelectAll}
//                       className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
//                     />
//                   </th>
//                   <th className="py-3.5 px-4">Customer Name & Email</th>
//                   <th className="py-3.5 px-4 text-center">Orders</th>
//                   <th className="py-3.5 px-4 text-right">Total Spend</th>
//                   <th className="py-3.5 px-4 text-center">Last Order</th>
//                   <th className="py-3.5 px-4 text-center">RFM Scores</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white/50 dark:bg-zinc-950/50">
//                 {users.map((user) => (
//                   <tr
//                     key={user.userId}
//                     className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
//                   >
//                     <td className="py-3.5 px-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.has(user.userId)}
//                         onChange={() => toggleSelect(user.userId)}
//                         className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
//                       />
//                     </td>
//                     <td className="py-3.5 px-4">
//                       {/* ✅ Payload Custom View Route Link */}
//                       <Link
//                         href={`/admin/users-explorer/${user.userId}`}
//                         className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-primary transition-colors text-xs"
//                       >
//                         {user.name || "Customer #" + user.userId.slice(-6)}
//                       </Link>
//                       <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{user.email || "No email"}</p>
//                     </td>
//                     <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300">
//                       {user.frequency}
//                     </td>
//                     <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-primary">
//                       {formatCurrency(user.monetary)}
//                     </td>
//                     <td className="py-3.5 px-4 text-center text-zinc-500 dark:text-zinc-400 font-mono">
//                       {user.recency} days ago
//                     </td>
//                     <td className="py-3.5 px-4 text-center">
//                       <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] font-bold">
//                         <span className={`px-2.5 py-0.5 rounded-full border ${getScoreBgColor(user.recencyScore)} ${getScoreColor(user.recencyScore)}`}>
//                           R{user.recencyScore}
//                         </span>
//                         <span className={`px-2.5 py-0.5 rounded-full border ${getScoreBgColor(user.frequencyScore)} ${getScoreColor(user.frequencyScore)}`}>
//                           F{user.frequencyScore}
//                         </span>
//                         <span className={`px-2.5 py-0.5 rounded-full border ${getScoreBgColor(user.monetaryScore)} ${getScoreColor(user.monetaryScore)}`}>
//                           M{user.monetaryScore}
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
//           <PaginationControls totalPages={totalPages} />
//         </div>
//       )}
//     </div>
//   );
// }
// 📂 src/app/features/admin/marketing/components/RFMSegmentList.tsx (TOP-TIER PKR LOCALIZED & ROUTE MATCHED)

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Loader2,
  Mail,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { getRFMSegments, RFMUser } from "../actions/getRFMSegments";
import { sendCampaign } from "../actions/sendCampaign";

// ✅ Welcome Series Email Template
import { createCampaignBroadcastEmailHtml } from "@/email_templates/campaignBroadcastEmail";

// ================================================================
// ✅ TYPES
// ================================================================
interface RFMSegmentListProps {
  segment: string;
}

// ================================================================
// 🔧 HELPERS (With en-PK Localization)
// ================================================================
const formatCurrency = (value: number) => `Rs. ${(value || 0).toLocaleString('en-PK')}`;

const getScoreColor = (score: number) => {
  if (score >= 4) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3) return "text-yellow-600 dark:text-yellow-500";
  if (score >= 2) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getScoreBgColor = (score: number) => {
  if (score >= 4) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 3) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 2) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function RFMSegmentList({ segment }: RFMSegmentListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [users, setUsers] = useState<RFMUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getRFMSegments({
        segmentFilter: segment,
        page: currentPage,
        limit: 20,
      });

      if (result.success && result.data) {
        setUsers(result.data.users);
        setTotalUsers(result.data.totalUsers);
        setTotalPages(Math.ceil(result.data.totalUsers / 20));
        setSelectedUsers(new Set());
      } else {
        toastError(result.error || "Failed to load segment data.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to load segment data.");
    } finally {
      setIsLoading(false);
    }
  }, [segment, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.userId)));
    }
  };

  const toggleSelect = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedUsers(newSet);
  };

  // Send campaign to selected users
  const handleSendCampaign = async () => {
    if (selectedUsers.size === 0) {
      toastError("Please select at least one user.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createCampaignBroadcastEmailHtml({
        customerName: "{{name}}",
        subject: `Special Offer for ${segment}`,
        htmlContent: `
          <p>You are part of our <strong>${segment}</strong> segment.</p>
          <p>We have a special offer just for you! Don't miss out on exclusive deals tailored to your shopping habits.</p>
          <p>Shop now and enjoy premium quality at unbeatable prices.</p>
        `,
        ctaLink: "https://pocketvalue.pk/deals",
        ctaText: "Shop Now",
      });

      const result = await sendCampaign({
        userIds: Array.from(selectedUsers),
        subject: `Special Offer for ${segment}`,
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(result.message);
        setSelectedUsers(new Set());
      } else {
        toastError(result.message || "Failed to send campaign.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send campaign.");
    } finally {
      setIsSending(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="h-10 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/admin/marketing-hub")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer no-underline"
          >
            <ChevronLeft size={14} className="stroke-[2.5px]" />
            Back to Matrix
          </button>
          
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
              <Sparkles size={18} className="text-brand-primary" /> {segment} Segment
            </h2>
            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
              {totalUsers.toLocaleString('en-PK')} CUSTOMERS FOUND
            </span>
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <button
            onClick={handleSendCampaign}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            {isSending ? "Sending..." : `Dispatch Email (${selectedUsers.size})`}
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
        {users.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Users size={40} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-mono font-bold text-zinc-500">No customers found in this segment</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-112.5 custom-scrollbar">
            <table className="w-full min-w-175 border-collapse text-left text-xs relative">
              <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
                <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Customer Name & Email</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Orders</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Total Spend</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Last Order</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">RFM Scores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.userId)}
                        onChange={() => toggleSelect(user.userId)}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                      />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/admin/users-explorer/${user.userId}`}
                        className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-primary transition-colors text-xs no-underline hover:no-underline"
                      >
                        {user.name || "Customer #" + user.userId.slice(-6)}
                      </Link>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{user.email || "No email"}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {user.frequency}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-primary whitespace-nowrap">
                      {formatCurrency(user.monetary)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                      {user.recency} days ago
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] font-bold">
                        <span className={`px-2 py-0.5 rounded-full border ${getScoreBgColor(user.recencyScore)} ${getScoreColor(user.recencyScore)}`}>
                          R{user.recencyScore}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border ${getScoreBgColor(user.frequencyScore)} ${getScoreColor(user.frequencyScore)}`}>
                          F{user.frequencyScore}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border ${getScoreBgColor(user.monetaryScore)} ${getScoreColor(user.monetaryScore)}`}>
                          M{user.monetaryScore}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4">
          <PaginationControls totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}