// 📂 src/email_templates/campaignBroadcastEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

// ================================================================
// ✅ TYPES
// ================================================================
interface CampaignBroadcastEmailProps {
  customerName?: string; // Optional — used for {{name}} placeholder
  subject: string; // Email subject line (shown in email client)
  htmlContent: string; // Full HTML body written by admin
  ctaLink?: string; // Optional CTA link
  ctaText?: string; // Optional CTA button text (default: "Learn More")
}

// ================================================================
// 📧 GENERIC CAMPAIGN BROADCAST EMAIL
// (Used by CampaignComposer for admin-generated bulk emails)
// ================================================================
export const createCampaignBroadcastEmailHtml = ({
  customerName,
  subject,
  htmlContent,
  ctaLink,
  ctaText,
}: CampaignBroadcastEmailProps): string => {
  const name = customerName || "Valued Customer";

  // ✅ Replace placeholders in the admin-provided HTML content
  let finalContent = htmlContent
    .replace(/{{name}}/g, name)
    .replace(/{{email}}/g, customerName || "");

  // ✅ Build CTA section (if link provided)
  const ctaHtml = ctaLink
    ? `
      <div style="text-align: center; margin: 35px 0;">
        <!-- ✅ ACCENT SYNC: Updated to exact brand primary warm orange (#FF8F32) -->
        <a
          href="${ctaLink}"
          style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);"
        >
          ${ctaText || "Learn More"}
        </a>
      </div>
    `
    : "";

  // 🧩 Build Body Content (wraps admin's HTML with standard structure)
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1F2937;" class="dark-text">Assalamu Alaikum <strong>${name}</strong>,</p>
    </div>

    <!-- 📝 ADMIN-PROVIDED CONTENT -->
    <div style="font-size: 15px; color: #4B5563; line-height: 1.8;" class="dark-text">
      ${finalContent}
    </div>

    ${ctaHtml}

    <!-- 💬 Support Message -->
    <p style="font-size: 13px; color: #9CA3AF; line-height: 1.5; text-align: center; margin-top: 30px;" class="dark-subtext">
      Have questions? We're here to help — 
      <!-- ✅ ACCENT SYNC: Updated support link to exact brand primary warm orange (#FF8F32) -->
      <a href="mailto:support@pocketvalue.pk" style="color: #FF8F32; text-decoration: none; font-weight: bold;">support@pocketvalue.pk</a>
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
      <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
        Your Pocket. Our Value.
      </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: subject || "New message from PocketValue",
    headerText: "Special Announcement",
    bodyHtml,
  });
};