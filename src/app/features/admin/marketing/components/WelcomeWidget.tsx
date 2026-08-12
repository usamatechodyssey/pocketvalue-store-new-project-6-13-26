// 📂 src/app/features/admin/marketing/components/WelcomeWidget.tsx

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
    <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-tight wrap-break-word">
          {title}
        </p>
        <div className={`p-1.5 rounded-xl border ${colors[color]} shrink-0 shadow-2xs`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="mt-2 min-w-0">
        <p className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">
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
    <div className="space-y-4 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200/85 dark:border-zinc-800/85 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-0.5 rounded-full uppercase tracking-widest">
            {data.totalDocs} NEW SIGNUPS IN PIPELINE
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* 5-CARD MATRIX (Optimized & Compact) */}
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
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {selectedUsers.size} NEW LEADS SELECTED
          </span>
          <button
            onClick={handleBulkSend}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Mail size={13} />
            )}
            {isSending ? "Dispatching..." : "Send Welcome Emails"}
          </button>
        </div>
      )}

      {/* Table Container (COMPACT FIT, ZERO SQUEEZING, NO HORIZONTAL SCROLL) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-105 custom-scrollbar">
          <table className="w-full border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-2.5 px-3.5 w-10 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === data.candidates.length && data.candidates.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                    disabled={selectedUsers.size > 0 && data.candidates.every((c) => !c.email)}
                  />
                </th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Customer</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Signed Up</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {data.candidates.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user._id)}
                      onChange={() => toggleSelect(user._id)}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                      disabled={!user.email}
                    />
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 leading-none">{user.email || "No email"}</p>
                    {user.phone && (
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono mt-1 leading-none">📱 {user.phone}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-zinc-700 dark:text-zinc-300 font-mono font-medium leading-none">
                        {formatDate(user.createdAt)}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 leading-none">
                        {formatTime(user.createdAt)}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-brand-primary mt-1.5 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20 leading-none">
                        {user.hoursSinceSignup}h ago
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                    {user.hasOrder ? (
                      <span className="text-emerald-500 flex items-center justify-center gap-1 text-[10px] font-mono font-bold leading-none">
                        <CheckCircle size={11} /> CONVERTED
                      </span>
                    ) : (
                      <span className="text-amber-500 text-[9px] font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase leading-none">
                        UNCONVERTED LEAD
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                    {user.email && !user.hasOrder ? (
                      <button
                        onClick={() => handleSendWelcomeEmail(user)}
                        disabled={isSending}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all hover:scale-102 shadow-xs cursor-pointer shrink-0"
                      >
                        <Mail size={11} />
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
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
          <PaginationControls totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}