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
      <div style="background-color: #FFF7ED; padding: 20px; border-radius: 12px; border: 2px dashed #F97316; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #1F2937; font-weight: bold;">
          🎁 Exclusive Offer: Use code 
          <span style="font-family: monospace; background: #F97316; color: white; padding: 4px 12px; border-radius: 6px; font-size: 18px;">
            ${discountCode}
          </span>
          <br>
          to get <span style="color: #F97316; font-size: 20px;">${discountPercent}% OFF</span> your next order!
        </p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #6B7280;">
          *Valid for a limited time. Don't miss out!
        </p>
      </div>
    `
    : "";

  // Build personalized note (if admin provided)
  const noteHtml = personalizedNote
    ? `
      <div style="background-color: #F0FDF4; padding: 15px; border-radius: 12px; border-left: 4px solid #16A34A; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #14532D; font-style: italic;">
          "${personalizedNote}"
        </p>
      </div>
    `
    : "";

  // Build Body Content
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1F2937;">Assalamu Alaikum <strong>${name}</strong>,</p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
        It's been <strong>${inactiveDays} days</strong> since your last visit to PocketValue — we really miss you! 👋
      </p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
        We've added some amazing new products and exclusive deals that we think you'll absolutely love.
        Whether you're looking for something special or just browsing, your next great find is just a click away.
      </p>
    </div>

    ${discountHtml}
    ${noteHtml}

    <!-- 🔥 CTA BUTTON -->
    <div style="text-align: center; margin: 35px 0;">
      <a
        href="${ctaLink}"
        style="display: inline-block; background-color: #F97316; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);"
      >
        Come Back & Explore
      </a>
    </div>

    <!-- 💬 Support Message -->
    <p style="font-size: 13px; color: #9CA3AF; line-height: 1.5; text-align: center;">
      Have questions? We're here to help — 
      <a href="mailto:support@pocketvalue.pk" style="color: #F97316; text-decoration: none;">support@pocketvalue.pk</a>
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
      <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
        Quality Products. Guaranteed Value.
      </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `We miss you! It's been ${inactiveDays} days — come back and explore new deals at PocketValue.`,
    headerText: "We Miss You! ❤️",
    bodyHtml,
  });
};