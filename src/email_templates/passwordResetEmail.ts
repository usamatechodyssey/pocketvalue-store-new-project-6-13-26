// 📂 src/email_templates/passwordResetEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface PasswordResetData {
  customerName: string;
  resetLink: string;
}

/**
 * 🔐 PASSWORD RESET TEMPLATE
 * Sent to users who request a password change via the login/account page.
 */
export function createPasswordResetHtml(data: PasswordResetData): string {
  const bodyHtml = `
      <div style="margin-bottom: 25px;">
          <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${data.customerName}</strong>,</p>
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
              We received a request to reset the password for your PocketValue account. 
              Security is our top priority, so please follow the link below to set a new password.
          </p>
      </div>

      <div style="text-align:center; margin: 40px 0;">
        <!-- ✅ ACCENT SYNC: Updated button background to exact brand warm orange (#FF8F32) -->
        <a href="${data.resetLink}" style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);">
            Reset My Password
        </a>
      </div>

      <!-- ✅ DARK MODE SUPPORTED WARNING BOX: Added exact brand border accent (#FF8F32) -->
      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 12px; border-left: 4px solid #FF8F32; margin-bottom: 25px; border-top: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;" class="dark-card dark-border">
          <p style="margin: 0; font-size: 13px; color: #1F2937;" class="dark-text">
              <strong>Important Note:</strong> This link is only valid for <strong>10 minutes</strong>. 
              After that, you will need to request a new one for security reasons.
          </p>
      </div>

      <p style="font-size: 14px; color: #9CA3AF; line-height: 1.55;" class="dark-subtext">
          If you did not make this request, please ignore this email or contact our support team if you suspect any unauthorized activity on your account.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
          <p style="font-size: 11px; color: #D1D5DB; text-align: center; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;" class="dark-subtext">
              Safe & Secure Authentication by PocketValue Security Sentinel
          </p>
      </div>
    `;

  return createMasterEmailLayout({
    preheaderText: "Secure link to reset your PocketValue account password.",
    headerText: "Password Recovery",
    bodyHtml,
  });
}