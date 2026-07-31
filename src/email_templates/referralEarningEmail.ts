// src/email_templates/referralEarningEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface ReferralEarningEmailProps {
  customerName: string;        // Referrer user name
  friendName: string;          // Referred newly converted customer name
  conversions: number;         // Hitting milestone count (verified purchases)
  orderId: string;             // Mapped Order ID (e.g. PV-1001)
  nextMilestoneLabel?: string; // Optional: e.g. "Tier 2: Rs. 2000 Voucher"
}

/**
 * ✉️ REFERRAL MILESTONE UPDATE EMAIL TEMPLATE (DYNMANIC LOYALTY VERSION)
 * Sent to the referrer immediately when their referred friend places their first successful order.
 * Strictly aligned with the Admin-Discretionary Milestones & Loyalty progress system.
 */
export const createReferralEarningEmailHtml = ({
  customerName,
  friendName,
  conversions,
  orderId,
  nextMilestoneLabel = "your next milestone reward",
}: ReferralEarningEmailProps): string => {
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #1F2937;">Assalamu Alaikum <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            JazakAllah! We have some great news for you. Your friend <strong>${friendName}</strong> has successfully placed their first purchase on our store under order reference <strong style="font-family: monospace;">#${orderId.toUpperCase()}</strong>.
        </p>
    </div>

    <!-- 🏆 THE HIGH-CONTRAST CONVERSIONS MATRIX BLOCK -->
    <div style="text-align:center; margin: 40px 0;">
        <div style="display: inline-block; background-color: #F9FAFB; border: 2px dashed #F97316; padding: 25px 45px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <p style="margin: 0 0 10px; font-size: 11px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Your Verified Conversions</p>
            <span style="color: #F97316; font-size: 38px; font-weight: 900; letter-spacing: 2px; font-family: 'Courier New', Courier, monospace;">
                ${conversions} Friends
            </span>
        </div>
    </div>

    <!-- ⏱️ DYNAMIC MILESTONE ADVISORY -->
    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 12px; border-left: 4px solid #16A34A; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 13px; color: #14532D; line-height: 1.5;">
            <strong>Milestone Progress Registered:</strong> This conversion has been successfully audited! You are now closer to unlocking <strong>${nextMilestoneLabel}</strong>. Once our management team verifies the order completion, your milestone reward voucher will be generated and displayed directly on your Loyalty Hub dashboard.
        </p>
    </div>

    <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5; text-align: center;">
        Keep sharing your unique referral link! You can view your real-time clicks, referred signups, unlocked milestones progress, and copied vouchers anytime from your customer account page.
    </p>

    <!-- 🖋️ OFFICIAL SIGNATURE -->
    <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #F3F4F6;">
        <p style="margin: 0; font-size: 14px; color: #1F2937; font-weight: bold;">Warm regards,</p>
        <p style="margin: 5px 0 0; font-size: 16px; color: #F97316; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            The PocketValue Team
        </p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #9CA3AF; font-style: italic;">
            Quality Products. Guaranteed Value.
        </p>
    </div>

    <div style="margin-top: 40px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/referrals" style="text-decoration: none; color: #9CA3AF; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            View Your Loyalty Hub
        </a>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `Congratulations! Your friend ${friendName} completed their purchase. You now have ${conversions} verified conversions.`,
    headerText: "Referral Milestone Updated!",
    bodyHtml,
  });
};