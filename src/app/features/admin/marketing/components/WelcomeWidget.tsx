// // 📂 src/app/features/admin/marketing/components/WelcomeWidget.tsx (TOP-TIER PKR LOCALIZED & 5-CARD ONBOARDING MATRIX)

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useSearchParams } from "next/navigation";
// import {
//   Users,
//   Mail,
//   Loader2,
//   RefreshCw,
//   CheckCircle,
//   Clock,
//   UserPlus,
//   Phone,
//   Sparkles,
// } from "lucide-react";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
// import PaginationControls from "@/app/shared/components/ui/PaginationControls";
// import { getWelcomeCandidates, WelcomeCandidate } from "../actions/getWelcomeCandidates";
// import { sendCampaign } from "../actions/sendCampaign";

// // ✅ Welcome Series Email Template
// import { createWelcomeSeriesEmailHtml } from "@/email_templates/welcomeSeriesEmail";

// // ================================================================
// // ✅ HELPERS (With en-PK Localization)
// // ================================================================
// const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-PK");
// const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("en-PK", { timeStyle: "short" });

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
//   color?: "brand" | "emerald" | "blue" | "purple" | "amber";
//   subtext?: string;
// }) => {
//   const colors = {
//     brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
//     emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
//     amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
//     blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
//     purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
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
// export default function WelcomeWidget() {
//   const searchParams = useSearchParams();
//   const currentPage = Number(searchParams.get("page")) || 1;

//   const [data, setData] = useState<{
//     candidates: WelcomeCandidate[];
//     totalDocs: number;
//     totalPages: number;
//     summary: {
//       total: number;
//       pendingConversions: number; // ✅ NEW: Unconverted new signups
//       alreadyConverted: number;   // ✅ NEW: Converted day-1 buyers
//       hasEmail: number;
//       hasPhone: number;
//     };
//   } | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [isSending, setIsSending] = useState(false);

//   const fetchData = useCallback(
//     async (showToast: boolean = false) => {
//       try {
//         setIsLoading(true);
//         const result = await getWelcomeCandidates({
//           page: currentPage,
//           limit: 20,
//           maxAgeHours: 48,
//         });
//         setData(result);
//         setSelectedUsers(new Set());
//         if (showToast) {
//           toastSuccess("Welcome candidates updated!");
//         }
//       } catch (error: any) {
//         toastError(error.message || "Failed to load welcome candidates.");
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

//   // Send Welcome Email (Single)
//   const handleSendWelcomeEmail = async (user: WelcomeCandidate) => {
//     if (!user.email) {
//       toastError("No email address available for this user.");
//       return;
//     }

//     setIsSending(true);
//     try {
//       const htmlContent = createWelcomeSeriesEmailHtml({
//         customerName: user.name,
//         day: 1,
//         ctaLink: "https://pocketvalue.pk",
//         ctaText: "Start Exploring",
//         additionalMessage: `
//           <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
//             We're here to help you find the best products at unbeatable prices. Use code WELCOME10 for extra savings!
//           </p>
//         `,
//       });

//       const result = await sendCampaign({
//         emails: [user.email],
//         subject: "Welcome to PocketValue! 🎉",
//         htmlContent,
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         toastSuccess(`Welcome email sent to ${user.email}`);
//         await fetchData();
//       } else {
//         toastError(result.message || "Failed to send welcome email.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to send welcome email.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Bulk Send Welcome Emails
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
//       const htmlContent = createWelcomeSeriesEmailHtml({
//         customerName: "{{name}}",
//         day: 1,
//         ctaLink: "https://pocketvalue.pk",
//         ctaText: "Start Exploring",
//         additionalMessage: `
//           <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
//             Welcome to PocketValue! We're here to help you find the best products at unbeatable prices.
//           </p>
//         `,
//       });

//       const result = await sendCampaign({
//         emails,
//         subject: "Welcome to PocketValue! 🎉",
//         htmlContent,
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         toastSuccess(`Welcome emails sent to ${result.sentCount} users.`);
//         setSelectedUsers(new Set());
//         await fetchData();
//       } else {
//         toastError(result.message || "Failed to send welcome emails.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Failed to send welcome emails.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-6 animate-pulse bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//           {[...Array(5)].map((_, i) => (
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
//             <UserPlus size={24} className="stroke-[2px]" />
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
//               No Welcome Candidates
//             </h3>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
//               No new users have signed up in the last 48 hours. Check back later!
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
//             <Sparkles className="text-brand-primary" size={20} /> Welcome Series Onboarding Pipeline
//           </h3>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//             New Customer Lead Conversions (Registered in Last 48 Hours)
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//             {data.totalDocs} NEW SIGNUPS
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

//       {/* 5-CARD MATRIX (Includes Pending Leads & Day-1 Converted) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//         <StatsCard
//           title="Unconverted Leads"
//           value={data.summary.pendingConversions || 0} // ✅ New Signups with 0 Orders
//           icon={Clock}
//           color="amber"
//           subtext="Ready for Welcome Coupon"
//         />
//         <StatsCard
//           title="Day-1 Converted"
//           value={data.summary.alreadyConverted || 0} // ✅ Day-1 Buyers
//           icon={CheckCircle}
//           color="emerald"
//           subtext="Ordered on Signup Day"
//         />
//         <StatsCard
//           title="Total Signups"
//           value={data.summary.total}
//           icon={Users}
//           color="brand"
//         />
//         <StatsCard
//           title="Has Email"
//           value={data.summary.hasEmail}
//           icon={Mail}
//           color="blue"
//           subtext="Ready for welcome email"
//         />
//         <StatsCard
//           title="Has Phone"
//           value={data.summary.hasPhone}
//           icon={Phone}
//           color="purple"
//           subtext="Ready for SMS (future)"
//         />
//       </div>

//       {/* Bulk Action */}
//       {selectedUsers.size > 0 && (
//         <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
//           <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
//             {selectedUsers.size} new leads selected for welcome series
//           </span>
//           <button
//             onClick={handleBulkSend}
//             disabled={isSending}
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
//           >
//             {isSending ? (
//               <Loader2 size={14} className="animate-spin" />
//             ) : (
//               <Mail size={14} />
//             )}
//             {isSending ? "Sending..." : "Send Welcome Series Emails"}
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
//                 <th className="py-3.5 px-4 text-center">Signed Up</th>
//                 <th className="py-3.5 px-4 text-center">Status</th>
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
//                   <td className="py-3.5 px-4 text-center">
//                     <div className="flex flex-col items-center">
//                       <span className="text-zinc-700 dark:text-zinc-300 font-mono font-medium">
//                         {formatDate(user.createdAt)}
//                       </span>
//                       <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
//                         {formatTime(user.createdAt)}
//                       </span>
//                       <span className="text-[9px] text-brand-primary font-bold mt-1 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
//                         {user.hoursSinceSignup}h ago
//                       </span>
//                     </div>
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     {user.hasOrder ? (
//                       <span className="text-emerald-500 flex items-center justify-center gap-1 text-[10px] font-bold">
//                         <CheckCircle size={12} /> Converted
//                       </span>
//                     ) : (
//                       <span className="text-amber-500 flex items-center justify-center gap-1 text-[10px] font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
//                         <Clock size={12} /> Unconverted Lead
//                       </span>
//                     )}
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     {user.email && !user.hasOrder ? (
//                       <button
//                         onClick={() => handleSendWelcomeEmail(user)}
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
// 📂 src/app/features/admin/marketing/components/WelcomeWidget.tsx (TOP-TIER PKR LOCALIZED & 5-CARD ONBOARDING MATRIX)

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Mail,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  UserPlus,
  Phone,
} from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import { getWelcomeCandidates, WelcomeCandidate } from "../actions/getWelcomeCandidates";
import { sendCampaign } from "../actions/sendCampaign";

// ✅ Welcome Series Email Template
import { createWelcomeSeriesEmailHtml } from "@/email_templates/welcomeSeriesEmail";

// ================================================================
// ✅ HELPERS (With en-PK Localization)
// ================================================================
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-PK");
const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("en-PK", { timeStyle: "short" });

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
  color?: "brand" | "emerald" | "blue" | "purple" | "amber";
  subtext?: string;
}) => {
  const colors = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
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
export default function WelcomeWidget() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState<{
    candidates: WelcomeCandidate[];
    totalDocs: number;
    totalPages: number;
    summary: {
      total: number;
      pendingConversions: number;
      alreadyConverted: number;
      hasEmail: number;
      hasPhone: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(
    async (showToast: boolean = false) => {
      try {
        setIsLoading(true);
        const result = await getWelcomeCandidates({
          page: currentPage,
          limit: 20,
          maxAgeHours: 48,
        });
        setData(result);
        setSelectedUsers(new Set());
        if (showToast) {
          toastSuccess("Welcome candidates updated!");
        }
      } catch (error: any) {
        toastError(error.message || "Failed to load welcome candidates.");
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

  // Send Welcome Email (Single)
  const handleSendWelcomeEmail = async (user: WelcomeCandidate) => {
    if (!user.email) {
      toastError("No email address available for this user.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createWelcomeSeriesEmailHtml({
        customerName: user.name,
        day: 1,
        ctaLink: "https://pocketvalue.pk",
        ctaText: "Start Exploring",
        additionalMessage: `
          <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
            We're here to help you find the best products at unbeatable prices. Use code WELCOME10 for extra savings!
          </p>
        `,
      });

      const result = await sendCampaign({
        emails: [user.email],
        subject: "Welcome to PocketValue! 🎉",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Welcome email sent to ${user.email}`);
        await fetchData();
      } else {
        toastError(result.message || "Failed to send welcome email.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send welcome email.");
    } finally {
      setIsSending(false);
    }
  };

  // Bulk Send Welcome Emails
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
      const htmlContent = createWelcomeSeriesEmailHtml({
        customerName: "{{name}}",
        day: 1,
        ctaLink: "https://pocketvalue.pk",
        ctaText: "Start Exploring",
        additionalMessage: `
          <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
            Welcome to PocketValue! We're here to help you find the best products at unbeatable prices.
          </p>
        `,
      });

      const result = await sendCampaign({
        emails,
        subject: "Welcome to PocketValue! 🎉",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Welcome emails sent to ${result.sentCount} users.`);
        setSelectedUsers(new Set());
        await fetchData();
      } else {
        toastError(result.message || "Failed to send welcome emails.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send welcome emails.");
    } finally {
      setIsSending(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse w-full">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
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
            <UserPlus size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Welcome Candidates
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            No new users have registered in the last 48 hours. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
            {data.totalDocs} NEW SIGNUPS IN PIPELINE
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

      {/* 5-CARD MATRIX (No Truncation) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard
          title="Unconverted Leads"
          value={data.summary.pendingConversions || 0}
          icon={Clock}
          color="amber"
          subtext="Ready for Welcome Coupon"
        />
        <StatsCard
          title="Day-1 Converted"
          value={data.summary.alreadyConverted || 0}
          icon={CheckCircle}
          color="emerald"
          subtext="Ordered on Signup Day"
        />
        <StatsCard
          title="Total Signups"
          value={data.summary.total}
          icon={Users}
          color="brand"
          subtext="48h Registration Total"
        />
        <StatsCard
          title="Has Email"
          value={data.summary.hasEmail}
          icon={Mail}
          color="blue"
          subtext="Reachable Leads"
        />
        <StatsCard
          title="Has Phone"
          value={data.summary.hasPhone}
          icon={Phone}
          color="purple"
          subtext="SMS Dispatch Ready"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {selectedUsers.size} NEW LEADS SELECTED
          </span>
          <button
            onClick={handleBulkSend}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            {isSending ? "Dispatching..." : "Send Welcome Emails"}
          </button>
        </div>
      )}

      {/* Table Container (With Scroll Guard & Zero Squeezing) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-105 custom-scrollbar">
          <table className="w-full min-w-162.5 border-collapse text-left text-xs relative">
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
                <th className="py-3 px-4 text-center whitespace-nowrap">Signed Up</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
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
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                        {formatDate(user.createdAt)}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {formatTime(user.createdAt)}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-brand-primary mt-1 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
                        {user.hoursSinceSignup}h ago
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {user.hasOrder ? (
                      <span className="text-emerald-500 flex items-center justify-center gap-1 text-[10px] font-mono font-bold">
                        <CheckCircle size={12} /> CONVERTED
                      </span>
                    ) : (
                      <span className="text-amber-500 text-[9px] font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                        UNCONVERTED LEAD
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {user.email && !user.hasOrder ? (
                      <button
                        onClick={() => handleSendWelcomeEmail(user)}
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