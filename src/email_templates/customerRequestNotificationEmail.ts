// 📂 src/email_templates/customerRequestNotificationEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface CustomerRequestEmailProps {
  customerName: string;
  requestType: "restock" | "missing_variant" | "missing_product";
  productName: string;
  variantDetails?: string; // e.g. "Size: XXL, Color: Navy Blue"
  buyLink: string;
}

/**
 * 📧 DYNAMIC CUSTOMER REQUEST NOTIFICATION TEMPLATE
 * Compatible with Mailjet and Resend.
 * Generates custom contextual copywriting based on the requestType.
 */
export const createCustomerRequestEmailHtml = ({
  customerName,
  requestType,
  productName,
  variantDetails,
  buyLink,
}: CustomerRequestEmailProps): string => {
  
  // 1. Contextual Copywriting Configuration
  const config = {
    restock: {
      preheader: `Khushkhabri! ${productName} is back in stock! Buy now before it sells out.`,
      header: "Your Requested Item is Back in Stock!",
      intro: `Good news! We wanted to let you know that the product you requested is back in stock and ready to ship.`,
      highlightLabel: "Product Successfully Restocked",
      highlightValue: productName,
      ctaText: "Buy Now",
    },
    missing_variant: {
      preheader: `Good news! The variant you requested for ${productName} is now available!`,
      header: "Your Requested Variant is Now Available!",
      intro: `Great news! The sizing or attribute variant you requested is now successfully added to our catalog.`,
      highlightLabel: "Variant Now Available",
      highlightValue: `${productName} ${variantDetails ? `(${variantDetails})` : ""}`,
      ctaText: "Order Variant Now",
    },
    missing_product: {
      preheader: `We sourced it just for you! ${productName} is now available at PocketValue.`,
      header: "We Have Sourced Your Demanded Product!",
      intro: `Awesome news! We have successfully sourced and listed the missing product you requested just for you.`,
      highlightLabel: "Product Successfully Sourced",
      highlightValue: productName,
      ctaText: "View & Purchase",
    },
  };

  const current = config[requestType] || config.restock;

  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 16px; color: #1F2937;" class="dark-text">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            ${current.intro} We appreciate your patience while our team worked on fulfillment.
        </p>
    </div>

    <!-- 🏷️ CONTEXTUAL HIGHLIGHT CARD -->
    <div style="background-color: #F9FAFB; padding: 20px; border-radius: 16px; border: 1px solid #E5E7EB; margin-bottom: 30px; text-align: center;" class="dark-card dark-border">
        <span style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 5px;" class="dark-subtext">
            ${current.highlightLabel}
        </span>
        <h3 style="color: #1F2937; margin: 0; font-size: 18px; font-weight: bold;" class="dark-text">
            ${current.highlightValue}
        </h3>
    </div>

    <!-- 🚀 CALL TO ACTION (CTA) -->
    <div style="text-align:center; margin: 35px 0;">
        <!-- ✅ ACCENT SYNC: Updated button background to exact brand warm orange (#FF8F32) -->
        <a href="${buyLink}" style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 950; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);">
            ${current.ctaText}
        </a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; text-align: center; line-height: 1.55;" class="dark-subtext">
        If you have any questions, our support team is always ready to assist you.
    </p>
  `;

  return createMasterEmailLayout({
    preheaderText: current.preheader,
    headerText: current.header,
    bodyHtml,
  });
};