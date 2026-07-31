// src/email_templates/CustomAdminEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface CustomEmailProps {
  customerName: string;
  message: string;
}

/**
 * ✉️ CUSTOM ADMIN EMAIL TEMPLATE
 * Used for direct communication from the Admin to a specific customer.
 * Structured like a professional official letter.
 */
export const createCustomAdminEmailHtml = (data: CustomEmailProps): string => {
  // Line breaks handle karne ke liye logic (for multi-line admin notes)
  const formattedMessage = data.message.replace(/\n/g, "<br />");

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #1F2937;">Assalamu Alaikum <strong>${data.customerName}</strong>,</p>
    </div>

    <!-- 📝 THE PERSONALIZED MESSAGE BODY -->
    <div style="background-color: #ffffff; padding: 25px; border: 1px solid #E5E7EB; border-radius: 16px; min-height: 150px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
        <div style="font-size: 15px; color: #4B5563; line-height: 1.8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            ${formattedMessage}
        </div>
    </div>

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
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="text-decoration: none; color: #9CA3AF; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
            Visit Official Store
        </a>
    </div>
  `;

  // ✅ SYNC: No await needed (masterLayout is now sync)
  return createMasterEmailLayout({
    preheaderText:
      "You have a new message from the PocketValue Management Team.",
    headerText: "Official Correspondence",
    bodyHtml,
  });
};