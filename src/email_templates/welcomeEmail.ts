
// /src/email_templates/welcomeEmail.ts

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
        <p style="font-size: 18px; color: #1F2937;">Assalamu Alaikum <strong>${customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Welcome to the <strong>PocketValue</strong> family! We are absolutely thrilled to have you with us. 
            You've just unlocked a world of premium products, exclusive deals, and a seamless shopping experience.
        </p>
    </div>

    <div style="background-color: #F9FAFB; padding: 25px; border-radius: 16px; border: 1px solid #E5E7EB; margin-bottom: 30px;">
        <h3 style="color: #1F2937; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What's in store for you?</h3>
        <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #4B5563; line-height: 1.8;">
            <li>Access to <strong>Flash Sales</strong> & Early Bird discounts.</li>
            <li>Personalized <strong>Wishlist</strong> to save your favorites.</li>
            <li>Faster <strong>Checkout</strong> with saved addresses.</li>
            <li>Real-time <strong>Order Tracking</strong> from your dashboard.</li>
        </ul>
    </div>

    <div style="text-align:center; margin: 40px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="display: inline-block; background-color: #F97316; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);">
            Start Exploring Now
        </a>
    </div>

    <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5; text-align: center;">
        Your journey to quality products at the best value starts here. 
        If you have any questions, our support team is just an email away.
    </p>

    <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        <p style="font-size: 11px; color: #D1D5DB; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            Seamless Shopping. Guaranteed Quality.
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
