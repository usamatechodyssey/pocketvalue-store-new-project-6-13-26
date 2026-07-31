
// /src/email_templates/returnStatusUpdateEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface StatusUpdateData {
  customerName: string;
  orderNumber: string;
  requestId: string;
  newStatus: "Pending" | "Approved" | "Processing" | "Completed" | "Rejected";
  resolution?: string | null;
  adminComments?: string | null;
}

/**
 * 🔄 RETURN STATUS UPDATE TEMPLATE
 * Sent to the user whenever an Admin changes the status of their return request.
 */
export function createReturnStatusUpdateEmail({
  customerName,
  orderNumber,
  requestId,
  newStatus,
  resolution,
  adminComments,
}: StatusUpdateData): string {
  let headerTitle = "Return Request Update";
  let statusColor = "#F97316"; // Default Orange
  let statusIcon = "🔄";
  let mainContent = "";
  let resolutionBlock = "";

  // 🛠️ DYNAMIC LOGIC BASED ON STATUS
  switch (newStatus) {
    case "Approved":
      headerTitle = "Return Request Approved!";
      statusColor = "#16A34A"; // Green
      statusIcon = "✅";
      mainContent = `<p>Good news! Your return request for order <strong>#${orderNumber}</strong> has been approved by our team.</p>`;

      if (resolution) {
        let resDesc = "";
        if (resolution === "Refund")
          resDesc =
            "A refund will be initiated to your original payment method. It usually takes 5-7 business days to reflect in your account.";
        else if (resolution === "StoreCredit")
          resDesc =
            "The value of your return has been added to your PocketValue Wallet as Store Credit. You can use it on your next purchase!";
        else if (resolution === "Replacement")
          resDesc =
            "A fresh replacement for your item is being prepared and will be shipped to you shortly.";

        resolutionBlock = `
          <div style="margin-top: 20px; padding: 15px; background-color: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #16A34A;"><strong>Resolution:</strong> ${resolution}</p>
            <p style="margin: 5px 0 0; font-size: 13px; color: #15803D;">${resDesc}</p>
          </div>
        `;
      }
      break;

    case "Processing":
      headerTitle = "Return in Progress";
      statusIcon = "📦";
      mainContent = `<p>We have started processing your approved return for order <strong>#${orderNumber}</strong>. We'll update you as soon as the next step is complete.</p>`;
      break;

    case "Completed":
      headerTitle = "Return Process Complete";
      statusColor = "#0369A1"; // Blue
      statusIcon = "🏁";
      mainContent = `<p>The return process for your items from order <strong>#${orderNumber}</strong> is now officially complete. We hope the resolution was satisfactory.</p>`;
      break;

    case "Rejected":
      headerTitle = "Update on Your Return Request";
      statusColor = "#DC2626"; // Red
      statusIcon = "⚠️";
      mainContent = `<p>We are writing to provide an update on your return request for order <strong>#${orderNumber}</strong>. After careful review, we were unable to approve your request at this time.</p>`;
      break;
  }

  // 💬 ADMIN COMMENTS SECTION
  const adminNotesHtml = adminComments
    ? `
    <div style="margin-top: 25px; padding: 20px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; font-style: italic;">
      <p style="margin: 0 0 10px; font-size: 12px; color: #9CA3AF; font-style: normal; font-weight: bold; text-transform: uppercase;">Note from the Audit Team:</p>
      <p style="margin: 0; font-size: 14px; color: #4B5563;">&quot;${adminComments}&quot;</p>
    </div>
  `
    : "";

  const ticketId =
    requestId.length > 10
      ? requestId.slice(-6).toUpperCase()
      : requestId.toUpperCase();

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #4B5563;">Hi <strong>${customerName}</strong>,</p>
        <div style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            ${mainContent}
        </div>
    </div>
    
    <div style="background-color: #ffffff; border: 2px solid ${statusColor}; padding: 20px; border-radius: 16px; margin-bottom: 30px; text-align: center;">
        <p style="font-size: 11px; color: #9CA3AF; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">New Status Update</p>
        <p style="font-size: 20px; color: ${statusColor}; font-weight: 900; margin: 10px 0;">${statusIcon} ${newStatus.toUpperCase()}</p>
        <p style="font-size: 12px; color: #6B7280; margin: 0;">Ticket: #${ticketId}</p>
    </div>

    ${resolutionBlock}
    ${adminNotesHtml}

    <div style="margin-top: 35px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/returns/${requestId}" style="display: inline-block; background-color: #1F2937; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            View Request Details
        </a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; margin-top: 40px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        If you have any questions regarding this decision, please reply directly to this email or contact our support team.
    </p>
  `;

  return createMasterEmailLayout({
    preheaderText: `Update: Your return request #${ticketId} is now ${newStatus}.`,
    headerText: headerTitle,
    bodyHtml,
  });
}
