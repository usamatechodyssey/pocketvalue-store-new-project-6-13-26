
// /src/email_templates/verificationEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface VerificationEmailProps {
  customerName: string;
  otp: string;
}

/**
 * 🔐 EMAIL VERIFICATION TEMPLATE (OTP)
 * Sent during the registration or progressive verification flow.
 * High-security design to ensure trust and clarity.
 */
export const createVerificationEmailHtml = ({
  customerName,
  otp,
}: VerificationEmailProps): string => {
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 18px; color: #1F2937;">Assalamu Alaikum <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            JazakAllah for choosing <strong>PocketValue</strong>! To ensure the security of your account, please use the following One-Time Password (OTP) to verify your email address.
        </p>
    </div>

    <!-- 🛡️ THE HIGH-CONTRAST OTP BLOCK -->
    <div style="text-align:center; margin: 40px 0;">
        <div style="display: inline-block; background-color: #F9FAFB; border: 2px dashed #F97316; padding: 25px 45px; border-radius: 20px; shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <p style="margin: 0 0 10px; font-size: 11px; color: #9CA3AF; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
            <span style="color: #111827; font-size: 42px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace;">
                ${otp}
            </span>
        </div>
    </div>

    <!-- ⚠️ SECURITY ADVISORY -->
    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 12px; border-left: 4px solid #EF4444; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 13px; color: #991B1B; line-height: 1.5;">
            <strong>Security Notice:</strong> This code is highly confidential and will expire in <strong>10 minutes</strong>. 
            PocketValue staff will never ask you for this code over the phone or email.
        </p>
    </div>

    <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5; text-align: center;">
        If you did not request this verification, you can safely ignore this email. 
        Your account remains secure.
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            Safe & Secure Shopping • PocketValue Sentinel
        </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `Your secure verification code is ${otp}. Valid for 10 minutes.`,
    headerText: "Verify Your Identity",
    bodyHtml,
  });
};
