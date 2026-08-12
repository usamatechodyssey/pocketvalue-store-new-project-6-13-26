// 📂 src/email_templates/returnRequestAdminNotificationEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface AdminNotificationData {
  orderNumber: string;
  requestId: string; // MongoDB _id
  customerName: string;
  itemCount: number;
}

/**
 * 📢 ADMIN NOTIFICATION: NEW RETURN REQUEST
 * This email alerts the store owner when a customer submits a return.
 * Points to the new Payload Admin Root View.
 */
export function createReturnRequestAdminNotificationEmail({
  orderNumber,
  requestId,
  customerName,
  itemCount,
}: AdminNotificationData): string {
  // ✅ FIX: Link points to the NEW Payload Custom View path we created
  const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/returns/${requestId}`;

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #1F2937;" class="dark-text"><strong>Attention Admin,</strong></p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            A new return request has been logged in the system. Please review the details and take necessary action.
        </p>
    </div>
    
    <!-- ✅ DARK MODE SUPPORTED INTEL BOX -->
    <div style="background-color: #F9FAFB; padding: 25px; border-radius: 16px; border: 1px solid #E5E7EB; margin-bottom: 30px;" class="dark-card dark-border">
        <h3 style="color: #1F2937; margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px;" class="dark-text dark-border">Request Intelligence:</h3>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; width: 40%;" class="dark-subtext">Customer:</td>
            <td style="padding: 8px 0; font-weight: 900; color: #1F2937;" class="dark-text">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;" class="dark-subtext">Order Ref:</td>
            <!-- ✅ ACCENT SYNC: Updated reference highlight to exact brand warm orange (#FF8F32) -->
            <td style="padding: 8px 0; font-weight: 900; color: #FF8F32;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;" class="dark-subtext">Item Volume:</td>
            <td style="padding: 8px 0; font-weight: 900; color: #1F2937;" class="dark-text">${itemCount} Items</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;" class="dark-subtext">Internal ID:</td>
            <td style="padding: 8px 0; font-family: monospace; color: #9CA3AF;" class="dark-subtext">${requestId}</td>
          </tr>
        </table>
    </div>

    <div style="text-align: center; margin-top: 30px;">
        <a href="${reviewLink}" target="_blank" style="display: inline-block; background-color: #1F2937; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);" class="dark-bg dark-text">
            Review in Dashboard
        </a>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #F3F4F6; text-align: center;" class="dark-border">
        <p style="font-size: 11px; color: #D1D5DB; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
            PocketValue Operational Sentinel
        </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: `New Return Alert: ${customerName} (Order #${orderNumber})`,
    headerText: "Return Request Alert",
    bodyHtml,
  });
}