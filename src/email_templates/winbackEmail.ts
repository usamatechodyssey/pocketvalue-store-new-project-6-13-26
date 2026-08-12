// 📂 src/email_templates/winbackEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

// ================================================================
// ✅ TYPES
// ================================================================
interface WinbackEmailProps {
  customerName: string;
  inactiveDays: number; // How many days since their last order
  ctaLink: string;
  discountCode?: string; // Optional: e.g., "COMEBACK20"
  discountPercent?: number; // Optional: e.g., 20
  personalizedNote?: string; // Optional admin custom message
}

// ================================================================
// 📧 WINBACK (REACTIVATION) EMAIL
// ================================================================
export const createWinbackEmailHtml = ({
  customerName,
  inactiveDays,
  ctaLink,
  discountCode,
  discountPercent,
  personalizedNote,
}: WinbackEmailProps): string => {
  const name = customerName || "there";

  // Build discount banner (if discount is provided)
  const discountHtml = discountCode && discountPercent
    ? `
      <!-- ✅ DARK MODE SUPPORTED COUPON BOX (Accent Color Synced #FF8F32) -->
      <div style="background-color: #FFF7ED; padding: 20px; border-radius: 12px; border: 2px dashed #FF8F32; margin: 20px 0; text-align: center;" class="dark-card dark-border">
        <p style="margin: 0; font-size: 14px; color: #1F2937; font-weight: bold;" class="dark-text">
          🎁 Exclusive Offer: Use code 
          <span style="font-family: monospace; background: #FF8F32; color: white; padding: 4px 12px; border-radius: 6px; font-size: 18px; font-weight: 900; box-shadow: 0 2px 6px rgba(255,143,50,0.15);">
            ${discountCode}
          </span>
          <br><br>
          to get <span style="color: #FF8F32; font-size: 20px; font-weight: 900;">${discountPercent}% OFF</span> your next order!
        </p>
        <p style="margin: 8px 0 0; font-size: 11px; color: #6B7280;" class="dark-subtext">
          *Valid for a limited time. Don't miss out!
        </p>
      </div>
    `
    : "";

  // Build personalized note (if admin provided)
  const noteHtml = personalizedNote
    ? `
      <!-- ✅ DARK MODE SUPPORTED ADMIN NOTE BOX -->
      <div style="background-color: #F0FDF4; padding: 15px; border-radius: 12px; border-left: 4px solid #16A34A; margin: 20px 0;" class="dark-card dark-border">
        <p style="margin: 0; font-size: 14px; color: #14532D; font-style: italic;" class="dark-text">
          "${personalizedNote}"
        </p>
      </div>
    `
    : "";

  // Build Body Content
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1F2937;" class="dark-text">Assalamu Alaikum <strong>${name}</strong>,</p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
        It's been <strong>${inactiveDays} days</strong> since your last visit to PocketValue — we really miss you! 👋
      </p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
        We've added some amazing new products and exclusive deals that we think you'll absolutely love.
        Whether you're looking for something special or just browsing, your next great find is just a click away.
      </p>
    </div>

    ${discountHtml}
    ${noteHtml}

    <!-- 🔥 CTA BUTTON -->
    <div style="text-align: center; margin: 35px 0;">
      <!-- ✅ ACCENT SYNC: Updated Track button background to exact brand warm orange (#FF8F32) -->
      <a
        href="${ctaLink}"
        style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);"
      >
        Come Back & Explore
      </a>
    </div>

    <!-- 💬 Support Message -->
    <p style="font-size: 13px; color: #9CA3AF; line-height: 1.55; text-align: center;" class="dark-subtext">
      Have questions? We're here to help — 
      <!-- ✅ ACCENT SYNC: Updated to exact brand warm orange (#FF8F32) -->
      <a href="mailto:support@pocketvalue.pk" style="color: #FF8F32; text-decoration: none; font-weight: bold;">support@pocketvalue.pk</a>
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
      <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
        Your Pocket. Our Value.
      </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `We miss you! It's been ${inactiveDays} days — come back and explore new deals at PocketValue.`,
    headerText: "We Miss You! ❤️",
    bodyHtml,
  });
};