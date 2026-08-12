// 📂 src/email_templates/abandonedCartRecoveryEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

// ================================================================
// ✅ TYPES
// ================================================================
interface AbandonedCartItem {
  name: string;
  quantity: number;
  price: number;
  variantName?: string;
  imageUrl?: string;
}

interface AbandonedCartRecoveryEmailProps {
  customerName?: string; // Optional — Guest users might not have a name
  cartItems: AbandonedCartItem[];
  subtotal: number;
  recoveryLink: string;
  discountCode?: string; // Optional discount to sweeten the deal
  discountAmount?: number; // e.g., 10 for 10%
}

// ================================================================
// 📧 ABANDONED CART RECOVERY EMAIL (Accent Color Synced #FF8F32)
// ================================================================
export const createAbandonedCartRecoveryEmailHtml = ({
  customerName,
  cartItems,
  subtotal,
  recoveryLink,
  discountCode,
  discountAmount,
}: AbandonedCartRecoveryEmailProps): string => {
  const name = customerName || "there";

  // 1. Generate Cart Items Table
  const itemsHtml = cartItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;" class="dark-border">
            <p style="margin: 0; font-weight: bold; color: #1F2937; font-size: 14px;" class="dark-text">${item.name}</p>
            ${
              item.variantName
                ? `<p style="margin: 4px 0 0; font-size: 11px; color: #6B7280;" class="dark-subtext">Variant: ${item.variantName}</p>`
                : ""
            }
            <p style="margin: 4px 0 0; font-size: 12px; color: #9CA3AF;" class="dark-subtext">Qty: ${item.quantity}</p>
          </td>
          <td style="text-align: right; font-weight: bold; color: #1F2937; padding: 12px 0; border-bottom: 1px solid #f3f4f6;" class="dark-border dark-text">
            Rs. ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
    )
    .join("");

  // 2. Build Discount HTML (if applicable)
  const discountHtml = discountCode
    ? `
      <tr>
        <td style="padding: 6px 0; color: #16A34A; font-size: 14px; font-weight: bold;">
          Special Discount (${discountCode}):
        </td>
        <td style="text-align: right; font-weight: bold; color: #16A34A;">
          ${discountAmount}% OFF
        </td>
      </tr>
    `
    : "";

  // 3. Build Body Content
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1F2937;" class="dark-text">Assalamu Alaikum <strong>${name}</strong>,</p>
      <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
        You left some amazing items behind! They're still waiting in your cart, but they won't be there forever.
        Complete your order now before they sell out.
      </p>
    </div>

    ${discountCode ? `
      <!-- ✅ DARK MODE SUPPORTED PROMO BOX -->
      <div style="background-color: #F0FDF4; padding: 15px; border-radius: 12px; border-left: 4px solid #16A34A; margin-bottom: 25px; border-top: 1px solid #BBF7D0; border-right: 1px solid #BBF7D0; border-bottom: 1px solid #BBF7D0;" class="dark-card dark-border">
        <p style="margin: 0; font-size: 14px; color: #14532D; font-weight: bold;" class="dark-text">
          🎉 Special Offer: Use code <strong style="font-family: monospace;">${discountCode}</strong> to get ${discountAmount}% OFF your entire order!
        </p>
      </div>
    ` : ''}

    <!-- 🛒 CART ITEMS TABLE -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
      ${itemsHtml}
    </table>

    <!-- 📊 SUBTOTAL -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #F3F4F6;" class="dark-border">
      ${discountHtml}
      <tr>
        <td style="padding: 10px 0 0; font-size: 16px; font-weight: 900; color: #1F2937;" class="dark-text">Subtotal:</td>
        <!-- ✅ ACCENT SYNC: Updated price highlight to exact brand warm orange (#FF8F32) -->
        <td style="text-align: right; padding: 10px 0 0; font-size: 16px; font-weight: 900; color: #FF8F32;">
          Rs. ${subtotal.toLocaleString()}
        </td>
      </tr>
    </table>

    <!-- 🔥 CTA BUTTON -->
    <div style="text-align: center; margin: 40px 0 25px;">
      <!-- ✅ ACCENT SYNC: Updated button background to exact brand warm orange (#FF8F32) -->
      <a
        href="${recoveryLink}"
        style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);"
      >
        Complete Your Order
      </a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; line-height: 1.55; text-align: center;" class="dark-subtext">
      If you have any questions, reply to this email or contact us at 
      <!-- ✅ ACCENT SYNC: Updated support link to exact brand warm orange (#FF8F32) -->
      <a href="mailto:support@pocketvalue.pk" style="color: #FF8F32; text-decoration: none; font-weight: bold;">support@pocketvalue.pk</a>.
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
      <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
        Your Pocket. Our Value.
      </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText:
      "You left some items behind! Complete your order before they sell out.",
    headerText: "Forgot Something?",
    bodyHtml,
  });
};