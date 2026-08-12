
// 📂 src/app/features/admin/marketing/components/AbandonedCartsWidget.tsx (TOP-TIER PKR LOCALIZED & 5-CARD MATRIX)

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Loader2,
  Mail,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Banknote,
} from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import PaginationControls from "@/app/shared/components/ui/PaginationControls";
import {
  getAbandonedCarts,
  PaginatedAbandonedCartsResult,
} from "../actions/getAbandonedCarts";
import { sendCampaign } from "../actions/sendCampaign";

// ✅ ENTERPRISE EMAIL TEMPLATE
import { createCampaignBroadcastEmailHtml } from "@/email_templates/campaignBroadcastEmail";

// ================================================================
// ✅ HELPERS (With en-PK Localization)
// ================================================================
const formatCurrency = (value: number): string => `Rs. ${(value || 0).toLocaleString('en-PK')}`;

const getAgeLabel = (lastUpdated: string) => {
  const hours = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
  if (hours >= 48) return { label: "48h+", className: "text-red-500 bg-red-500/10 border-red-500/20" };
  if (hours >= 24) return { label: "24h+", className: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  if (hours >= 6) return { label: "6h+", className: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
  return { label: "2h+", className: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
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
  color?: "brand" | "emerald" | "amber" | "red" | "blue";
  subtext?: string;
}) => {
  const colors = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
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
export default function AbandonedCartsWidget() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState<PaginatedAbandonedCartsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCarts, setSelectedCarts] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(
    async (showToast: boolean = false) => {
      try {
        setIsLoading(true);
        const result = await getAbandonedCarts({
          page: currentPage,
          limit: 20,
          minAgeHours: 2,
        });
        setData(result);
        setSelectedCarts(new Set());
        if (showToast) {
          toastSuccess("Abandoned carts updated!");
        }
      } catch (error: any) {
        toastError(error.message || "Failed to load abandoned carts.");
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

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedCarts.size === data.carts.length) {
      setSelectedCarts(new Set());
    } else {
      setSelectedCarts(new Set(data.carts.map((c) => c._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedCarts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCarts(newSet);
  };

  // Single Recovery Email
  const handleSendRecoveryEmail = async (cartId: string, email: string, customerName?: string) => {
    if (!email) {
      toastError("No email address available for this cart.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createCampaignBroadcastEmailHtml({
        customerName: customerName || "Valued Customer",
        subject: "Complete Your Order! 🛒",
        htmlContent: `
          <p>We noticed you left some items in your cart. Don't miss out on these great products!</p>
          <p>Your cart is waiting for you. Complete your order now and get your items before they're gone.</p>
          <p>Enjoy a seamless checkout experience with fast delivery.</p>
        `,
        ctaLink: "https://pocketvalue.pk/cart",
        ctaText: "Complete Your Order",
      });

      const result = await sendCampaign({
        emails: [email],
        subject: "Complete Your Order! 🛒",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Recovery email sent to ${email}`);
        await fetchData();
      } else {
        toastError(result.message || "Failed to send recovery email.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send recovery email.");
    } finally {
      setIsSending(false);
    }
  };

  // Bulk Recovery Email
  const handleBulkSend = async () => {
    if (selectedCarts.size === 0) {
      toastError("Please select at least one cart.");
      return;
    }

    const selected = data?.carts.filter((c) => selectedCarts.has(c._id)) || [];
    const emails = selected.map((c) => c.email).filter(Boolean) as string[];

    if (emails.length === 0) {
      toastError("Selected carts have no email addresses.");
      return;
    }

    setIsSending(true);
    try {
      const htmlContent = createCampaignBroadcastEmailHtml({
        customerName: "Valued Customer",
        subject: "Complete Your Order! 🛒",
        htmlContent: `
          <p>You left some items in your cart. Complete your order now!</p>
          <p>Don't wait too long — these items are in high demand.</p>
          <p>Shop now and enjoy premium quality at unbeatable prices.</p>
        `,
        ctaLink: "https://pocketvalue.pk/cart",
        ctaText: "Complete Your Order",
      });

      const result = await sendCampaign({
        emails,
        subject: "Complete Your Order! 🛒",
        htmlContent,
        senderName: "PocketValue Team",
      });

      if (result.success) {
        toastSuccess(`Recovery emails sent to ${result.sentCount} customers.`);
        setSelectedCarts(new Set());
        await fetchData();
      } else {
        toastError(result.message || "Failed to send recovery emails.");
      }
    } catch (error: any) {
      toastError(error.message || "Failed to send recovery emails.");
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
  if (!data || data.carts.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <ShoppingCart size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Abandoned Carts Found
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Great news! All customer carts have been processed or are actively completing checkout.
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
            {data.totalDocs} ACTIVE CARTS IN PIPELINE
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-primary-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* 5-CARD MATRIX (No Truncation) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard
          title="Total Lost Sales"
          value={formatCurrency(data.summary.totalAbandonedRevenue || 0)}
          icon={Banknote}
          color="brand"
          subtext="Unrecovered Cart Revenue"
        />
        <StatsCard
          title="Total Carts"
          value={data.summary.total}
          icon={ShoppingCart}
          color="blue"
          subtext="Abandoned Total"
        />
        <StatsCard
          title="Older than 24h"
          value={data.summary.olderThan24h}
          icon={Clock}
          color="amber"
          subtext="Needs Follow-up"
        />
        <StatsCard
          title="Older than 48h"
          value={data.summary.olderThan48h}
          icon={AlertCircle}
          color="red"
          subtext="High Attrition Risk"
        />
        <StatsCard
          title="Has Email"
          value={data.summary.hasEmail}
          icon={Users}
          color="emerald"
          subtext="Reachable Leads"
        />
      </div>

      {/* Bulk Recovery Bar */}
      {selectedCarts.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {selectedCarts.size} CARTS SELECTED FOR RECOVERY
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
            {isSending ? "Sending..." : "Dispatch Bulk Recovery"}
          </button>
        </div>
      )}

      {/* Table Container (With Scroll Guard & Zero Squeezing) */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-105 custom-scrollbar">
          <table className="w-full min-w-187.5 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr>
                <th className="py-3 px-4 w-10 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCarts.size === data.carts.length && data.carts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Customer
                </th>
                <th className="py-3 px-4 text-right text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Subtotal
                </th>
                <th className="py-3 px-4 text-center text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Items
                </th>
                <th className="py-3 px-4 text-center text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Age
                </th>
                <th className="py-3 px-4 text-center text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 text-center text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {data.carts.map((cart) => {
                const age = getAgeLabel(cart.lastUpdated);
                return (
                  <tr
                    key={cart._id}
                    className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCarts.has(cart._id)}
                        onChange={() => toggleSelect(cart._id)}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-40"
                        disabled={!cart.email}
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {cart.customerName || "Guest Customer"}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {cart.email || "No email available"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-brand-primary whitespace-nowrap">
                      {formatCurrency(cart.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {cart.itemsCount}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${age.className}`}
                      >
                        {age.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {cart.isRecovered ? (
                        <span className="text-emerald-500 flex items-center justify-center gap-1 text-[10px] font-mono font-bold">
                          <CheckCircle size={12} /> RECOVERED
                        </span>
                      ) : cart.email ? (
                        <span className="text-blue-500 text-[9px] font-mono font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase">
                          PENDING
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 text-[10px] font-mono">No Email</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {cart.email && !cart.isRecovered ? (
                        <button
                          onClick={() => handleSendRecoveryEmail(cart._id, cart.email!, cart.customerName)}
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
                );
              })}
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