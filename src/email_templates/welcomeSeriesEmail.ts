// 📂 src/email_templates/welcomeSeriesEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

// ================================================================
// ✅ TYPES
// ================================================================
interface WelcomeSeriesEmailProps {
  customerName: string;
  day: 1 | 3 | 7; // Which day of the welcome series (Day 1, Day 3, Day 7)
  ctaLink: string;
  ctaText?: string; // Custom CTA text (optional)
  additionalMessage?: string; // Additional day-specific content (optional)
}

// ================================================================
// 📧 WELCOME SERIES EMAIL (Day 1, Day 3, Day 7)
// ================================================================
export const createWelcomeSeriesEmailHtml = ({
  customerName,
  day,
  ctaLink,
  ctaText,
  additionalMessage,
}: WelcomeSeriesEmailProps): string => {
  const name = customerName || "there";

  // 1. Day-Specific Content
  const getDayContent = () => {
    switch (day) {
      case 1:
        return {
          header: "Welcome to the Family! 🎉",
          preheader:
            "We're so glad you're here. Let's get you started with PocketValue.",
          mainMessage: `
            <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
              Your journey to quality products at unbeatable value starts now! 
              We're thrilled to have you on board.
            </p>
            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; margin: 20px 0;" class="dark-card dark-border">
              <h4 style="color: #1F2937; margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;" class="dark-text">Here's what you can do next:</h4>
              <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.8;" class="dark-text">
                <li>🛍️ Browse our <strong>exclusive collections</strong></li>
                <li>❤️ Save favorites to your <strong>Wishlist</strong></li>
                <li>📦 Experience <strong>fast & secure checkout</strong></li>
              </ul>
            </div>
          `,
          cta: "Start Shopping Now",
        };
      case 3:
        return {
          header: "Don't Miss Out! 🌟",
          preheader:
            "Your personalized deals are waiting. Come back and explore!",
          mainMessage: `
            <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
              We hope you're enjoying PocketValue! Here are some <strong>hand-picked selections</strong> 
              just for you based on current trends.
            </p>
            <div style="background-color: #FFF7ED; padding: 20px; border-radius: 12px; border: 1px solid #FED7AA; margin: 20px 0;" class="dark-card dark-border">
              <p style="margin: 0; font-size: 14px; color: #1F2937; font-weight: bold;" class="dark-text">
                🎯 Tip: Check out our <strong>Flash Deals</strong> section for limited-time offers!
              </p>
            </div>
          `,
          cta: "Explore Deals",
        };
      case 7:
        return {
          header: "Special Offer Just for You! 🎁",
          preheader:
            "As a thank you for joining, here's a little something extra.",
          mainMessage: `
            <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
              It's been a week since you joined our community! To celebrate, we've prepared 
              a <strong>special reward</strong> to make your next shopping experience even better.
            </p>
            <div style="background-color: #F0FDF4; padding: 20px; border-radius: 12px; border-left: 4px solid #16A34A; margin: 20px 0; border-top: 1px solid #BBF7D0; border-right: 1px solid #BBF7D0; border-bottom: 1px solid #BBF7D0;" class="dark-card dark-border">
              <p style="margin: 0; font-size: 15px; color: #14532D; font-weight: bold;" class="dark-text">
                🎉 Use code: <span style="font-family: monospace; background: #E5E7EB; padding: 4px 8px; border-radius: 4px;" class="dark-header dark-text">WELCOME10</span> 
                to get 10% OFF your first order!
              </p>
            </div>
          `,
          cta: "Claim Your Offer",
        };
      default:
        return {
          header: "Welcome to PocketValue!",
          preheader: "We're glad to have you.",
          mainMessage: `
            <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
              Thank you for joining PocketValue. Start exploring now!
            </p>
          `,
          cta: "Get Started",
        };
    }
  };

  const content = getDayContent();
  const finalCtaText = ctaText || content.cta;

  // 2. Build Body Content
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1F2937;" class="dark-text">Assalamu Alaikum <strong>${name}</strong>,</p>
      ${content.mainMessage}
      ${additionalMessage ? `<div style="margin-top: 15px;">${additionalMessage}</div>` : ""}
    </div>

    <!-- 🔥 CTA BUTTON -->
    <div style="text-align: center; margin: 35px 0;">
      <!-- ✅ ACCENT SYNC: Updated to exact brand primary warm orange (#FF8F32) -->
      <a
        href="${ctaLink}"
        style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);"
      >
        ${finalCtaText}
      </a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; line-height: 1.55; text-align: center;" class="dark-subtext">
      If you have any questions, reply to this email or contact us at 
      <!-- ✅ ACCENT SYNC: Updated to exact brand primary warm orange (#FF8F32) -->
      <a href="mailto:support@pocketvalue.pk" style="color: #FF8F32; text-decoration: none; font-weight: bold;">support@pocketvalue.pk</a>.
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
      <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
        Your Pocket. Our Value.
      </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText: content.preheader,
    headerText: content.header,
    bodyHtml,
  });
};