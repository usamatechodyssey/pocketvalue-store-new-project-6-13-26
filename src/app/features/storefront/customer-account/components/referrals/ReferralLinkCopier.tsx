// // src/app/features/storefront/customer-account/components/referrals/ReferralLinkCopier.tsx

// "use client";

// import React, { useState } from "react";
// import { TrendingUp, Copy, Check } from "lucide-react";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

// interface ReferralLinkCopierProps {
//   referralCode: string;
// }

// export default function ReferralLinkCopier({ referralCode }: ReferralLinkCopierProps) {
//   const [isCopied, setIsCopied] = useState(false);

//   // Safe browser clipboard API execution
//   const handleCopyLink = () => {
//     const domain = typeof window !== "undefined" ? window.location.origin : "https://www.pocketvalue.pk";
//     const referralLink = `${domain}/?ref=${referralCode}`;

//     navigator.clipboard
//       .writeText(referralLink)
//       .then(() => {
//         setIsCopied(true);
//         toastSuccess("Referral link copied to clipboard!");
//         setTimeout(() => setIsCopied(false), 2000);
//       })
//       .catch((err) => {
//         console.error("Clipboard copy failed:", err);
//         toastError("Copy failed. Please manually select and copy the link.");
//       });
//   };

//   const domain = typeof window !== "undefined" ? window.location.origin : "https://www.pocketvalue.pk";
//   const referralLink = `${domain}/?ref=${referralCode}`;

//   return (
//     <div className="space-y-3.5">
//       {/* 🚀 Header & Glowing Code Badge */}
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center gap-1.5">
//             <TrendingUp size={16} className="text-brand-primary" />
//             <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
//               Share Your Link
//             </span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//             Referral Code & Link
//           </h3>
//         </div>
        
//         {/* Monospaced Code Status-Badge */}
//         <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-widest leading-none">
//           Code: {referralCode}
//         </span>
//       </div>

//       {/* 🎟️ APP-STYLE INTERACTIVE SHARING INPUT BAR */}
//       <div className="relative flex items-center bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-brand-primary transition-all duration-300">
//         <div className="grow px-3 py-1 font-mono text-[11px] text-gray-500 dark:text-gray-400 truncate select-all">
//           {referralLink}
//         </div>
        
//         <button
//           onClick={handleCopyLink}
//           className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
//             isCopied
//               ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15"
//               : "bg-linear-to-r from-brand-primary to-brand-primary-hover text-white shadow-xs hover:scale-[1.02] active:scale-95"
//           }`}
//           aria-label="Copy referral link to clipboard"
//         >
//           {isCopied ? <Check size={12} className="stroke-[2.5]" /> : <Copy size={12} />}
//           {isCopied ? "Copied!" : "Copy Link"}
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import { TrendingUp, Copy, Check } from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface ReferralLinkCopierProps {
  referralCode: string;
}

export default function ReferralLinkCopier({ referralCode }: ReferralLinkCopierProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    const domain = typeof window !== "undefined" ? window.location.origin : "https://www.pocketvalue.pk";
    const referralLink = `${domain}/?ref=${referralCode}`;

    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setIsCopied(true);
        toastSuccess("Referral link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        toastError("Copy failed. Please manually select and copy the link.");
      });
  };

  const domain = typeof window !== "undefined" ? window.location.origin : "https://www.pocketvalue.pk";
  const referralLink = `${domain}/?ref=${referralCode}`;

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-brand-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
              Share Your Link
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Referral Code & Link
          </h3>
        </div>
        
        {/* Code Badge */}
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-widest leading-none">
          Code: {referralCode}
        </span>
      </div>

      {/* Input Bar + Button */}
      <div className="relative flex items-center bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-brand-primary transition-all duration-300">
        <div className="grow px-3 py-1 font-mono text-[11px] text-gray-500 dark:text-gray-400 truncate select-all">
          {referralLink}
        </div>
        
        <button
          onClick={handleCopyLink}
          title="Copy your unique referral link to share with friends" // ✅ TOOLTIP TAGLINE
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            isCopied
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15"
              : "bg-linear-to-r from-brand-primary to-brand-primary-hover text-white shadow-xs hover:scale-[1.02] active:scale-95"
          }`}
          aria-label="Copy referral link to clipboard"
        >
          {isCopied ? <Check size={12} className="stroke-[2.5]" /> : <Copy size={12} />}
          {isCopied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}