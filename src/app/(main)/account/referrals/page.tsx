import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { Award, AlertCircle } from "lucide-react";

// ✅ Enterprise Imports: Strict Types
import { 
  getCustomerReferralStats 
} from "@/app/features/storefront/customer-account/actions/referralActions";
import ReferralClipboardCard from "@/app/features/storefront/customer-account/components/referrals/ReferralClipboardCard";

// ✅ Enterprise Types: Explicit and Strict
interface Milestone {
  requiredConversions: number;
  rewardLabel: string;
}

interface AssignedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  rewardLabel: string;
}

interface VipMilestone {
  requiredSpend: number;
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

// ✅ Enterprise Default Empty Stats (Type-Safe)
const EMPTY_STATS: ReferralStats = {
  referralCode: null,
  clicks: 0,
  totalSignups: 0,
  conversions: 0,
  milestones: [],
  assignedCoupons: [],
  lifetimeSpend: 0,
  vipMilestones: [],
};

export default async function ReferralsLoyaltyHubPage() {
  // 1. AUTHENTICATION CHECK
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/referrals");
  }

  // 2. FETCH LOYALTY STATS (with structured error handling)
  let referralStats: ReferralStats = EMPTY_STATS;
  let hasError = false;

  try {
    const statsResult = await getCustomerReferralStats();
    
    if (statsResult.success && statsResult.stats) {
      // ✅ Type-Safe assignment with fallback for missing fields
      const rawStats = statsResult.stats as any;
      referralStats = {
        referralCode: rawStats.referralCode || null,
        clicks: rawStats.clicks || 0,
        totalSignups: rawStats.totalSignups || 0,
        conversions: rawStats.conversions || 0,
        milestones: Array.isArray(rawStats.milestones) ? rawStats.milestones : [],
        assignedCoupons: Array.isArray(rawStats.assignedCoupons) ? rawStats.assignedCoupons : [],
        lifetimeSpend: rawStats.lifetimeSpend || 0,
        vipMilestones: Array.isArray(rawStats.vipMilestones) ? rawStats.vipMilestones : [],
      };
    } else {
      // statsResult.success === false
      console.warn("⚠️ LOYALTY PORTAL: Stats fetch returned success:false", statsResult.message);
      hasError = true;
    }
  } catch (error) {
    console.error("⚠️ LOYALTY PORTAL ERROR: Failed to hydrate dynamic referrals sub-page:", error);
    hasError = true;
  }

  return (
    <div className="space-y-6">
      {/* === DYNAMIC COMPACT HEADER === */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg animate-in fade-in duration-300">
          <Award size={24} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 animate-in fade-in duration-300">
            Loyalty &amp; Rewards
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Invite friends, track your milestone targets, and manage your VIP shopping vouchers.
          </p>
        </div>
      </div>

      {/* === ERROR STATE (if fetch failed) === */}
      {hasError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Unable to load referral data</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400/80">
              We couldn't fetch your latest referral stats. Don't worry — your referral link still works!
              Please refresh the page or try again later.
            </p>
          </div>
        </div>
      )}

      {/* === DYNAMIC CORE LEDGER CARD === */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {/* ✅ Pass stats (even if empty) to the client component */}
        <ReferralClipboardCard initialStats={referralStats} />
      </div>
    </div>
  );
}