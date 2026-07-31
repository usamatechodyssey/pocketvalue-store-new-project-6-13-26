"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateReferralCode } from "@/app/features/storefront/customer-account/actions/referralActions";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// Child Components (Local Imports)
import ReferralLinkCopier from "./ReferralLinkCopier";
import ReferralMilestoneProgress from "./ReferralMilestoneProgress";
import ReferralStatsRow from "./ReferralStatsRow";
import ReferralCouponList from "./ReferralCouponList";

// ✅ ENTERPRISE TYPES (Explicit & Strict)
interface Milestone {
  requiredConversions: number;
  rewardLabel: string;
  discountType?: string;    // Added for future-proofing (though not used in progress bar)
  discountValue?: number;
}

interface VipMilestone {
  requiredSpend: number;
  rewardLabel: string;
}

interface AssignedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  rewardLabel: string;
}

interface ReferralStats {
  referralCode: string | null;
  clicks: number;
  totalSignups: number;
  conversions: number;
  milestones: Milestone[];
  assignedCoupons: AssignedCoupon[];
  lifetimeSpend: number;
  vipMilestones: VipMilestone[];
}

interface ReferralClipboardCardProps {
  initialStats: ReferralStats;
}

export default function ReferralClipboardCard({ initialStats }: ReferralClipboardCardProps) {
  const [stats, setStats] = useState<ReferralStats>(initialStats);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"referral" | "vip">("referral");

  // 1. 🚀 CODE GENERATION LOGIC (With Enterprise Error Handling)
  const handleGenerateCode = async () => {
    // Prevent duplicate spams
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateReferralCode();
      if (result.success && result.code) {
        setStats((prev) => ({
          ...prev,
          referralCode: result.code!,
        }));
        toastSuccess("Your secure referral link has been generated!");
      } else {
        // Fail gracefully: Show backend error message
        toastError(result.message || "Could not generate referral link. Please try again.");
      }
    } catch (err) {
      console.error("[UI] Referral Code Generation Error:", err);
      toastError("An unexpected error occurred. Please refresh and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasCode = !!stats.referralCode;

  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-4xl p-px shadow-sm group">
      {/* Dynamic Brand Border Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-orange-200 to-pink-250 dark:from-gray-700 dark:to-gray-600 rounded-4xl" />
      
      <div className="relative h-full bg-white dark:bg-gray-800 rounded-[1.9rem] p-6 sm:p-7 overflow-hidden flex flex-col justify-between">
        <div className="space-y-4 relative z-10 h-full flex flex-col justify-between">

          {/* =================================================================
          // 🚀 APP-STYLE SLIDING PILL TAB SELECTOR
          // ================================================================= */}
          <div className="flex bg-gray-100 dark:bg-gray-900/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("referral")}
              className={`grow flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "referral"
                  ? "bg-white dark:bg-gray-800 text-zinc-950 dark:text-white shadow-xs"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
              }`}
            >
              👥 Refer Friends
            </button>
            <button
              onClick={() => setActiveTab("vip")}
              className={`grow flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "vip"
                  ? "bg-white dark:bg-gray-800 text-zinc-950 dark:text-white shadow-xs"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
              }`}
            >
              🛍️ VIP Shopping Club
            </button>
          </div>
          {/* ================================================================= */}

          {/* 👥 TAB A: REFERRAL METRICS FLOW */}
          {activeTab === "referral" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {!hasCode ? (
                /* Onboarding Screen: Code Not Generated */
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-brand-primary animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                        Loyalty Program
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      Invite Friends &amp; Earn Rewards
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 max-w-md font-medium">
                      Share your personal link with friends. They save at checkout, you unlock dynamic milestone rewards, exclusive vouchers, and custom discounts configured by the admin!
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="px-6 py-3.5 bg-linear-to-r from-brand-primary to-brand-primary-hover text-white font-bold rounded-xl shadow-md hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 min-w-[170px] text-center text-xs sm:text-sm"
                  >
                    {isGenerating ? "Generating..." : "Generate Code"}
                  </button>
                </div>
              ) : (
                /* Active Referral Dashboard */
                <>
                  <ReferralLinkCopier referralCode={stats.referralCode!} />
                  
                  {/* Referral Progress Bar */}
                  <ReferralMilestoneProgress 
                    conversions={stats.conversions} 
                    milestones={stats.milestones}
                    type="referral"
                  />
                  
                  <ReferralStatsRow 
                    clicks={stats.clicks} 
                    totalSignups={stats.totalSignups} 
                    conversions={stats.conversions} 
                  />
                </>
              )}
            </div>
          )}

          {/* 🛍️ TAB B: VIP SHOPPING CLUB FLOW */}
          {activeTab === "vip" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      VIP Club Rank
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Lifetime Spend Progression
                  </h3>
                </div>
                
                {/* Dynamic Spend Badge */}
                <div className="px-4 py-2 bg-emerald-500/4 border border-emerald-500/10 rounded-xl text-right shrink-0">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 block tracking-wider leading-none">Your Total Spend</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block font-mono">
                    Rs. {stats.lifetimeSpend.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ✅ ENTERPRISE MAPPING: VIP milestones ko progress bar ke liye transform karna */}
              <ReferralMilestoneProgress 
                conversions={stats.lifetimeSpend} 
                // ✅ Strict mapping: requiredSpend -> requiredConversions (progress bar expects a number)
                milestones={(stats.vipMilestones || []).map((m) => ({
                  requiredConversions: m.requiredSpend,
                  rewardLabel: m.rewardLabel,
                }))}
                type="vip"
              />

              {/* Informative Tip block */}
              <div className="p-3 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                💡 <strong>VIP Club Perks:</strong> Complete milestones based on your personal order totals to unlock exclusive coupon codes. All orders marked as successfully paid contribute to your Lifetime Spend.
              </div>
            </div>
          )}

          {/* 📜 COMMON FOOTER: Active Coupons List (Visible in both tabs) */}
          <ReferralCouponList assignedCoupons={stats.assignedCoupons} />

        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-linear-to-tr from-brand-primary/10 to-rose-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}