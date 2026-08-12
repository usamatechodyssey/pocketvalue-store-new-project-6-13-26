// 📂 src/email_templates/returnRequestReceivedEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface RequestData {
  customerName: string;
  orderNumber: string;
  requestId: string; // MongoDB _id
}

/**
 * 📥 CUSTOMER CONFIRMATION: RETURN RECEIVED
 * Sent to the user immediately after they submit a return request.
 */
export function createReturnRequestReceivedEmail({
  customerName,
  orderNumber,
  requestId,
}: RequestData): string {
  // ✅ ID Logic: Agar ID lambi hai toh aakhri 6 digits ko uppercase mein dikhana for a clean 'Ticket' look
  const ticketId =
    requestId.length > 10
      ? requestId.slice(-6).toUpperCase()
      : requestId.toUpperCase();

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            We have successfully received your return request for items from order <strong>#${orderNumber}</strong>. 
            Our quality assurance team will review the details and get back to you shortly.
        </p>
    </div>
    
    <!-- ✅ DARK MODE SUPPORTED TICKET ID BOX -->
    <div style="background-color: #F0F9FF; padding: 20px; border-radius: 12px; border: 1px solid #BAE6FD; margin-bottom: 30px; text-align: center;" class="dark-card dark-border">
        <p style="font-size: 11px; color: #0369A1; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;" class="dark-subtext">Your Return Ticket ID</p>
        <p style="font-size: 24px; color: #0C4A6E; font-weight: 900; margin: 5px 0 0; font-family: monospace;" class="dark-text">#${ticketId}</p>
    </div>

    <!-- ✅ ACCENT SYNC: Updated left border accent line to exact brand warm orange (#FF8F32) -->
    <div style="margin-bottom: 30px; border-left: 4px solid #FF8F32; padding-left: 15px;">
        <p style="font-size: 14px; color: #4B5563; line-height: 1.55;" class="dark-text">
            <strong>What's Next?</strong><br>
            1. Our team will verify the reason for return.<br>
            2. You will receive an email once the request is Approved or Rejected.<br>
            3. You can track the status of this request in your account dashboard.
        </p>
    </div>

    <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/returns" style="display: inline-block; background-color: #1F2937; color: #ffffff; padding: 14px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;" class="dark-bg dark-text">
            View Returns History
        </a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px; text-align: center;" class="dark-subtext">
        Thank you for choosing PocketValue. We appreciate your patience.
    </p>
  `;

  return createMasterEmailLayout({
    preheaderText: `Confirmed: Your return request for order #${orderNumber} has been received.`,
    headerText: "Return Request Received",
    bodyHtml,
  });
}