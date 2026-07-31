// import Link from "next/link";
// import { ArrowRight, Sparkles, Award } from "lucide-react";

// interface ReferralTeaserCardProps {
//   referralCode: string | null;
//   conversions: number;
// }

// // ✅ Enterprise Helper: Safe number formatting
// const formatNumber = (value: number | undefined | null): string => {
//   const num = Number(value) || 0;
//   return num.toLocaleString();
// };

// export default function ReferralTeaserCard({ referralCode, conversions = 0 }: ReferralTeaserCardProps) {
//   const hasCode = !!referralCode;

//   // ✅ Dynamic subtitle based on conversions
//   const getSubtitle = () => {
//     if (hasCode && conversions > 0) {
//       return `You have unlocked ${formatNumber(conversions)} verified conversion${conversions > 1 ? 's' : ''}!`;
//     }
//     if (hasCode) {
//       return "Share your exclusive code with friends. They save at checkout, and you unlock dynamic store rewards.";
//     }
//     return "Share your exclusive code with friends. They save at checkout, and you unlock dynamic store rewards.";
//   };

//   // ✅ Dynamic CTA label
//   const getCtaLabel = () => {
//     if (hasCode && conversions > 0) {
//       return "Manage Rewards";
//     }
//     if (hasCode) {
//       return "Manage Referrals";
//     }
//     return "Get Started";
//   };

//   return (
//     <div className="md:col-span-2 relative overflow-hidden rounded-4xl p-px shadow-sm group">
//       {/* 🎨 DYNAMIC FLOWING BRAND GRADIENT BORDER (Using globals.css animation) */}
//       <div className="absolute inset-0 animated-brand-gradient rounded-4xl opacity-80" aria-hidden="true" />
      
//       <div className="relative h-full bg-white dark:bg-gray-800 rounded-[1.9rem] p-7 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
        
//         {/* Teaser Content */}
//         <div className="relative z-10 mb-4 md:mb-0">
//           <div className="flex items-center gap-2 mb-2 flex-wrap">
//             {hasCode ? (
//               <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
//                 <Award size={16} />
//               </div>
//             ) : (
//               <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
//                 <Sparkles size={16} className="animate-pulse" />
//               </div>
//             )}
//             <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
//               {hasCode ? `Loyalty Program` : "Join VIP Loyalty"}
//             </span>
//             {hasCode && (
//               <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-150 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 leading-none">
//                 Code: {referralCode}
//               </span>
//             )}
//           </div>
          
//           <h3 className="text-xl sm:text-2xl font-bold font-clash tracking-tight text-gray-900 dark:text-white mb-1.5">
//             {hasCode ? "Your Loyalty Status" : "Invite Friends & Save Big"}
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-300 max-w-sm font-medium leading-relaxed">
//             {getSubtitle()}
//           </p>
//         </div>

//         {/* Dynamic CTA Link Button */}
//         <Link
//           href="/account/referrals"
//           className="relative z-10 px-6 py-3.5 bg-gray-50 dark:bg-gray-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-250 dark:border-gray-600 shadow-sm hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 shrink-0 text-sm"
//           aria-label="Manage your referral milestones and rewards"
//         >
//           {getCtaLabel()}
//           <ArrowRight size={16} />
//         </Link>

//         {/* Backdrop Ambient Glow */}
//         <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-linear-to-tr from-brand-primary/20 to-rose-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
//       </div>
//     </div>
//   );
// }
import Link from "next/link";
import { ArrowRight, Sparkles, Award } from "lucide-react";

interface ReferralTeaserCardProps {
  referralCode: string | null;
  conversions: number;
}

const formatNumber = (value: number | undefined | null): string => {
  const num = Number(value) || 0;
  return num.toLocaleString();
};

export default function ReferralTeaserCard({ referralCode, conversions = 0 }: ReferralTeaserCardProps) {
  const hasCode = !!referralCode;

  const getSubtitle = () => {
    if (hasCode && conversions > 0) {
      return `You have unlocked ${formatNumber(conversions)} verified conversion${conversions > 1 ? 's' : ''}!`;
    }
    if (hasCode) {
      return "Share your exclusive code with friends. They save at checkout, and you unlock dynamic store rewards.";
    }
    return "Share your exclusive code with friends. They save at checkout, and you unlock dynamic store rewards.";
  };

  const getCtaLabel = () => {
    if (hasCode && conversions > 0) {
      return "Manage Rewards";
    }
    if (hasCode) {
      return "Manage Referrals";
    }
    return "Get Started";
  };

  const getCtaTitle = () => {
    if (hasCode && conversions > 0) {
      return "View and manage your earned rewards and vouchers";
    }
    if (hasCode) {
      return "Manage your referral link, track progress, and view rewards";
    }
    return "Start earning rewards by inviting your friends";
  };

  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-4xl p-px shadow-sm group">
      {/* Brand Gradient Border */}
      <div className="absolute inset-0 animated-brand-gradient rounded-4xl opacity-80" aria-hidden="true" />
      
      <div className="relative h-full bg-white dark:bg-gray-800 rounded-[1.9rem] p-7 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
        
        {/* Content */}
        <div className="relative z-10 mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {hasCode ? (
              <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                <Award size={16} />
              </div>
            ) : (
              <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                <Sparkles size={16} className="animate-pulse" />
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              {hasCode ? `Loyalty Program` : "Join VIP Loyalty"}
            </span>
            {hasCode && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-150 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 leading-none">
                Code: {referralCode}
              </span>
            )}
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold font-clash tracking-tight text-gray-900 dark:text-white mb-1.5">
            {hasCode ? "Your Loyalty Status" : "Invite Friends & Save Big"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 max-w-sm font-medium leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {/* CTA Button with Tagline (Tooltip) */}
        <Link
          href="/account/referrals"
          title={getCtaTitle()} // ✅ TOOLTIP TAGLINE
          className="relative z-10 px-6 py-3.5 bg-gray-50 dark:bg-gray-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-250 dark:border-gray-600 shadow-sm hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 shrink-0 text-sm"
          aria-label="Manage your referral milestones and rewards"
        >
          {getCtaLabel()}
          <ArrowRight size={16} />
        </Link>

        {/* Glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-linear-to-tr from-brand-primary/20 to-rose-400/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}