// 📂 src/email_templates/welcomeEmail.ts

import { createMasterEmailLayout } from "./masterLayout";

interface WelcomeEmailProps {
  customerName: string;
}

/**
 * 🎊 WELCOME EMAIL TEMPLATE
 * Sent immediately after a new user registers on the website.
 */
export const createWelcomeEmailHtml = ({
  customerName,
}: WelcomeEmailProps): string => {
  const bodyHtml = `
    <div style="margin-bottom: 25px;">
        <p style="font-size: 18px; color: #1F2937;" class="dark-text">Assalamu Alaikum <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.65;" class="dark-text">
            Welcome to the <strong>PocketValue</strong> family! We are absolutely thrilled to have you with us. 
            You've just unlocked a world of premium products, exclusive deals, and a seamless shopping experience.
        </p>
    </div>

    <!-- ✅ DARK MODE SUPPORTED FEATURES BOX -->
    <div style="background-color: #F9FAFB; padding: 25px; border-radius: 16px; border: 1px solid #E5E7EB; margin-bottom: 30px;" class="dark-card dark-border">
        <h3 style="color: #1F2937; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;" class="dark-text">What's in store for you?</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.8;" class="dark-text">
            <li>Access to <strong>Flash Sales</strong> & Early Bird discounts.</li>
            <li>Personalized <strong>Wishlist</strong> to save your favorites.</li>
            <li>Faster <strong>Checkout</strong> with saved addresses.</li>
            <li>Real-time <strong>Order Tracking</strong> from your dashboard.</li>
        </ul>
    </div>

    <div style="text-align:center; margin: 40px 0;">
        <!-- ✅ ACCENT SYNC: Updated button background to exact brand warm orange (#FF8F32) -->
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);">
            Start Exploring Now
        </a>
    </div>

    <p style="font-size: 14px; color: #9CA3AF; line-height: 1.55; text-align: center;" class="dark-subtext">
        Your journey to quality products at the best value starts here. 
        If you have any questions, our support team is just an email away.
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;" class="dark-border">
        <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;" class="dark-subtext">
            Your Pocket. Our Value.
        </p>
    </div>
  `;

  return createMasterEmailLayout({
    preheaderText:
      "JazakAllah for joining! Your premium shopping experience starts now.",
    headerText: "Welcome to the Family!",
    bodyHtml,
  });
};