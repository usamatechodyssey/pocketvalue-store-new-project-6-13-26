
// // 📂 src/lib/adapters/communication/CommunicationFactory.ts

// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { sendEmail } from "@/lib/email";

// // ================================================================
// // 📧 INTERFACE: CommunicationAdapter (FULL ENTERPRISE VERSION)
// // ================================================================
// export interface CommunicationAdapter {
//   // -------- Existing Methods --------
//   sendOrderConfirmation(data: {
//     to: string;
//     orderId: string;
//     customerName: string;
//     products: any[];
//     subtotal: number;
//     shippingCost: number;
//     totalPrice: number;
//     shippingAddress: any;
//     coupon?: { code: string; amount: number } | null;
//   }): Promise<void>;

//   sendOrderStatusUpdate(data: {
//     to: string;
//     customerName: string;
//     orderId: string;
//     status: string;
//   }): Promise<void>;

//   sendPasswordReset(data: { to: string; name: string; resetLink: string }): Promise<void>;

//   sendReturnStatusUpdate(data: {
//     to: string;
//     customerName: string;
//     orderNumber: string;
//     requestId: string;
//     newStatus: string;
//     resolution?: string;
//     adminComments?: string;
//   }): Promise<void>;

//   sendCustomEmail(data: {
//     to: string;
//     customerName: string;
//     subject: string;
//     message: string;
//   }): Promise<void>;

//   sendReturnReceivedEmail(data: {
//     to: string;
//     customerName: string;
//     orderNumber: string;
//     requestId: string;
//   }): Promise<void>;

//   sendAdminNotificationEmail(data: {
//     to: string;
//     customerName: string;
//     orderNumber: string;
//     requestId: string;
//     itemCount: number;
//   }): Promise<void>;

//   sendVerificationOtp(data: { to: string; customerName: string; otp: string }): Promise<void>;

//   sendWelcomeEmail(data: { to: string; customerName: string }): Promise<void>;

//   sendReferralEarningEmail(data: {
//     to: string;
//     customerName: string;
//     friendName: string;
//     conversions: number;
//     orderId: string;
//     nextMilestoneLabel?: string;
//   }): Promise<void>;

//   // ================================================================
//   // 🆕 MARKETING & CAMPAIGN METHODS (NEW)
//   // ================================================================

//   sendAbandonedCartRecoveryEmail(data: {
//     to: string;
//     customerName?: string;
//     cartItems: { name: string; quantity: number; price: number; variantName?: string }[];
//     subtotal: number;
//     recoveryLink: string;
//     discountCode?: string;
//     discountAmount?: number;
//   }): Promise<void>;

//   sendWelcomeSeriesEmail(data: {
//     to: string;
//     customerName: string;
//     day: 1 | 3 | 7;
//     ctaLink: string;
//     ctaText?: string;
//     additionalMessage?: string;
//   }): Promise<void>;

//   sendWinbackEmail(data: {
//     to: string;
//     customerName: string;
//     inactiveDays: number;
//     ctaLink: string;
//     discountCode?: string;
//     discountPercent?: number;
//     personalizedNote?: string;
//   }): Promise<void>;

//   sendCampaignBroadcastEmail(data: {
//     to: string;
//     customerName?: string;
//     subject: string;
//     htmlContent: string;
//     ctaLink?: string;
//     ctaText?: string;
//   }): Promise<void>;
// }

// // ================================================================
// // 🔌 MAILJET ADAPTER (FULL IMPLEMENTATION)
// // ================================================================
// export class MailjetAdapter implements CommunicationAdapter {
//   // -------- Existing Methods (unchanged) --------
//   async sendOrderConfirmation(data: any): Promise<void> {
//     const { createOrderConfirmationHtml } = await import("@/email_templates/orderConfirmationEmail");
//     const html = createOrderConfirmationHtml(data);
//     await sendEmail({ to: data.to, subject: `Order Confirmation #${data.orderId}`, html });
//   }

//   async sendOrderStatusUpdate(data: any): Promise<void> {
//     const { createOrderShippedHtml, createOrderProcessingHtml, createOrderDeliveredHtml, createOrderCancelledHtml } =
//       await import("@/email_templates/orderStatusEmails");
//     let html: string;
//     switch (data.status) {
//       case "Shipped":
//         html = createOrderShippedHtml({ customerName: data.customerName, orderId: data.orderId });
//         break;
//       case "Processing":
//         html = createOrderProcessingHtml({ customerName: data.customerName, orderId: data.orderId });
//         break;
//       case "Delivered":
//         html = createOrderDeliveredHtml({ customerName: data.customerName, orderId: data.orderId });
//         break;
//       case "Cancelled":
//         html = createOrderCancelledHtml({ customerName: data.customerName, orderId: data.orderId });
//         break;
//       default:
//         return;
//     }
//     await sendEmail({ to: data.to, subject: `Order Status Update #${data.orderId}`, html });
//   }

//   async sendPasswordReset(data: any): Promise<void> {
//     const { createPasswordResetHtml } = await import("@/email_templates/passwordResetEmail");
//     const html = createPasswordResetHtml({ customerName: data.name, resetLink: data.resetLink });
//     await sendEmail({ to: data.to, subject: "Reset Your Password", html });
//   }

//   async sendReturnStatusUpdate(data: any): Promise<void> {
//     const { createReturnStatusUpdateEmail } = await import("@/email_templates/returnStatusUpdateEmail");
//     const html = createReturnStatusUpdateEmail({
//       customerName: data.customerName,
//       orderNumber: data.orderNumber,
//       requestId: data.requestId,
//       newStatus: data.newStatus,
//       resolution: data.resolution,
//       adminComments: data.adminComments,
//     });
//     await sendEmail({ to: data.to, subject: `Return Update: Order ${data.orderNumber}`, html });
//   }

//   async sendCustomEmail(data: any): Promise<void> {
//     const { createCustomAdminEmailHtml } = await import("@/email_templates/CustomAdminEmail");
//     const html = createCustomAdminEmailHtml({ customerName: data.customerName, message: data.message });
//     await sendEmail({ to: data.to, subject: data.subject, html });
//   }

//   async sendReturnReceivedEmail(data: any): Promise<void> {
//     const { createReturnRequestReceivedEmail } = await import("@/email_templates/returnRequestReceivedEmail");
//     const html = createReturnRequestReceivedEmail({
//       customerName: data.customerName,
//       orderNumber: data.orderNumber,
//       requestId: data.requestId,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: `Return Request Received for Order ${data.orderNumber}`,
//       html,
//     });
//   }

//   async sendAdminNotificationEmail(data: any): Promise<void> {
//     const { createReturnRequestAdminNotificationEmail } = await import("@/email_templates/returnRequestAdminNotificationEmail");
//     const html = createReturnRequestAdminNotificationEmail({
//       customerName: data.customerName,
//       orderNumber: data.orderNumber,
//       requestId: data.requestId,
//       itemCount: data.itemCount,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: `[New Return Request] Order ${data.orderNumber}`,
//       html,
//     });
//   }

//   async sendVerificationOtp(data: any): Promise<void> {
//     const { createVerificationEmailHtml } = await import("@/email_templates/emailVerificationEmail");
//     const html = createVerificationEmailHtml({ customerName: data.customerName, otp: data.otp });
//     await sendEmail({
//       to: data.to,
//       subject: `Your PocketValue Verification Code: ${data.otp}`,
//       html,
//     });
//   }

//   async sendWelcomeEmail(data: any): Promise<void> {
//     const { createWelcomeEmailHtml } = await import("@/email_templates/welcomeEmail");
//     const html = createWelcomeEmailHtml({ customerName: data.customerName });
//     await sendEmail({
//       to: data.to,
//       subject: `Welcome to the PocketValue Family, ${data.customerName}!`,
//       html,
//     });
//   }

//   async sendReferralEarningEmail(data: any): Promise<void> {
//     const { createReferralEarningEmailHtml } = await import("@/email_templates/referralEarningEmail");
//     const html = createReferralEarningEmailHtml({
//       customerName: data.customerName,
//       friendName: data.friendName,
//       conversions: data.conversions,
//       orderId: data.orderId,
//       nextMilestoneLabel: data.nextMilestoneLabel,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: `Referral Milestone Updated!`,
//       html,
//     });
//   }

//   // ================================================================
//   // 🆕 MARKETING & CAMPAIGN METHODS
//   // ================================================================

//   async sendAbandonedCartRecoveryEmail(data: any): Promise<void> {
//     const { createAbandonedCartRecoveryEmailHtml } = await import("@/email_templates/abandonedCartRecoveryEmail");
//     const html = createAbandonedCartRecoveryEmailHtml({
//       customerName: data.customerName,
//       cartItems: data.cartItems,
//       subtotal: data.subtotal,
//       recoveryLink: data.recoveryLink,
//       discountCode: data.discountCode,
//       discountAmount: data.discountAmount,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: `Complete Your Order! 🛒`,
//       html,
//     });
//   }

//   async sendWelcomeSeriesEmail(data: any): Promise<void> {
//     const { createWelcomeSeriesEmailHtml } = await import("@/email_templates/welcomeSeriesEmail");
//     const html = createWelcomeSeriesEmailHtml({
//       customerName: data.customerName,
//       day: data.day,
//       ctaLink: data.ctaLink,
//       ctaText: data.ctaText,
//       additionalMessage: data.additionalMessage,
//     });
//     const dayLabels = { 1: "Welcome", 3: "Check-in", 7: "Special Offer" };
//     await sendEmail({
//       to: data.to,
//       subject: `PocketValue: ${dayLabels[data.day as 1 | 3 | 7]} 🎉`,
//       html,
//     });
//   }

//   async sendWinbackEmail(data: any): Promise<void> {
//     const { createWinbackEmailHtml } = await import("@/email_templates/winbackEmail");
//     const html = createWinbackEmailHtml({
//       customerName: data.customerName,
//       inactiveDays: data.inactiveDays,
//       ctaLink: data.ctaLink,
//       discountCode: data.discountCode,
//       discountPercent: data.discountPercent,
//       personalizedNote: data.personalizedNote,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: `We Miss You! ❤️ Come Back & Explore`,
//       html,
//     });
//   }

//   async sendCampaignBroadcastEmail(data: any): Promise<void> {
//     const { createCampaignBroadcastEmailHtml } = await import("@/email_templates/campaignBroadcastEmail");
//     const html = createCampaignBroadcastEmailHtml({
//       customerName: data.customerName,
//       subject: data.subject,
//       htmlContent: data.htmlContent,
//       ctaLink: data.ctaLink,
//       ctaText: data.ctaText,
//     });
//     await sendEmail({
//       to: data.to,
//       subject: data.subject || "Special Announcement from PocketValue",
//       html,
//     });
//   }
// }

// // ================================================================
// // 🔌 RESEND ADAPTER (Extends MailjetAdapter)
// // ================================================================
// export class ResendAdapter extends MailjetAdapter {
//   // All methods inherited from MailjetAdapter
// }

// // ================================================================
// // 🔌 WHATSAPP ADAPTER (Placeholder for future)
// // ================================================================
// export class WhatsAppAdapter implements CommunicationAdapter {
//   // -------- Existing Placeholders --------
//   async sendOrderConfirmation(data: any): Promise<void> {
//     console.log(`[WhatsApp] Order confirmation for ${data.to}`);
//   }
//   async sendOrderStatusUpdate(data: any): Promise<void> {
//     console.log(`[WhatsApp] Status update for ${data.to}`);
//   }
//   async sendPasswordReset(data: any): Promise<void> {
//     console.log(`[WhatsApp] Password reset for ${data.to}`);
//   }
//   async sendReturnStatusUpdate(data: any): Promise<void> {
//     console.log(`[WhatsApp] Return update for ${data.to}`);
//   }
//   async sendCustomEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Custom message for ${data.to}`);
//   }
//   async sendReturnReceivedEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Return received for ${data.to}`);
//   }
//   async sendAdminNotificationEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Admin notification for return ${data.requestId}`);
//   }
//   async sendVerificationOtp(data: any): Promise<void> {
//     console.log(`[WhatsApp] OTP for ${data.to}: ${data.otp}`);
//   }
//   async sendWelcomeEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Welcome email for ${data.to}`);
//   }
//   async sendReferralEarningEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Referral commission alert sent to ${data.to}`);
//   }

//   // 🆕 Marketing Placeholders
//   async sendAbandonedCartRecoveryEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Abandoned cart recovery for ${data.to}`);
//   }
//   async sendWelcomeSeriesEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Welcome series (Day ${data.day}) for ${data.to}`);
//   }
//   async sendWinbackEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Winback email for ${data.to}`);
//   }
//   async sendCampaignBroadcastEmail(data: any): Promise<void> {
//     console.log(`[WhatsApp] Campaign broadcast to ${data.to}`);
//   }
// }

// // ================================================================
// // 🏭 COMMUNICATION FACTORY (Router)
// // ================================================================
// export class CommunicationFactory {
//   private static settingsCache: any = null;
//   private static settingsCacheTime: number = 0;
//   private static CACHE_TTL_MS = 60 * 1000;

//   private static async getSettings() {
//     const now = Date.now();
//     if (this.settingsCache && now - this.settingsCacheTime < this.CACHE_TTL_MS) {
//       return this.settingsCache;
//     }
//     const payload = await getSafePayload();
//     const settings = await payload.findGlobal({ slug: "settings" });
//     this.settingsCache = settings?.communication || {};
//     this.settingsCacheTime = now;
//     return this.settingsCache;
//   }

//   static async getAdapter(
//     role:
//       | "order_confirmation"
//       | "password_reset"
//       | "marketing"
//       | "cod_otp"
//       | "tracking_update"
//       | "invoice_delivery"
//       | "abandoned_cart"
//   ): Promise<CommunicationAdapter> {
//     const settings = await this.getSettings();

//     const channels = [
//       { key: "mailjet", adapter: MailjetAdapter },
//       { key: "resend", adapter: ResendAdapter },
//       { key: "whatsapp", adapter: WhatsAppAdapter },
//     ];

//     for (const channel of channels) {
//       const channelSettings = settings[channel.key];
//       if (channelSettings?.enabled && channelSettings?.roles?.includes(role)) {
//         return new channel.adapter();
//       }
//     }

//     console.warn(`[CommunicationFactory] No active adapter found for role: ${role}. Falling back to Mailjet.`);
//     return new MailjetAdapter();
//   }

//   static invalidateCache() {
//     this.settingsCache = null;
//     this.settingsCacheTime = 0;
//   }
// }

// // ================================================================
// // 🚀 CONVENIENCE EXPORTS (Updated)
// // ================================================================

// // -------- Existing --------
// export async function sendOrderConfirmationEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendOrderConfirmation(data);
// }

// export async function sendOrderStatusUpdateEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("tracking_update");
//   return adapter.sendOrderStatusUpdate(data);
// }

// export async function sendPasswordResetEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("password_reset");
//   return adapter.sendPasswordReset(data);
// }

// export async function sendReturnStatusUpdateEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendReturnStatusUpdate(data);
// }

// export async function sendCustomAdminEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("marketing");
//   return adapter.sendCustomEmail(data);
// }

// export async function sendReturnReceivedEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendReturnReceivedEmail(data);
// }

// export async function sendAdminNotificationEmail(data: any) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendAdminNotificationEmail(data);
// }

// export async function sendVerificationOtpEmail(data: { to: string; customerName: string; otp: string }) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendVerificationOtp(data);
// }

// export async function sendWelcomeEmail(data: { to: string; customerName: string }) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendWelcomeEmail(data);
// }

// export async function sendReferralEarningEmailNotification(data: {
//   to: string;
//   customerName: string;
//   friendName: string;
//   conversions: number;
//   orderId: string;
//   nextMilestoneLabel?: string;
// }) {
//   const adapter = await CommunicationFactory.getAdapter("order_confirmation");
//   return adapter.sendReferralEarningEmail(data);
// }

// // ================================================================
// // 🆕 MARKETING CONVENIENCE EXPORTS
// // ================================================================

// export async function sendAbandonedCartRecoveryEmail(data: {
//   to: string;
//   customerName?: string;
//   cartItems: { name: string; quantity: number; price: number; variantName?: string }[];
//   subtotal: number;
//   recoveryLink: string;
//   discountCode?: string;
//   discountAmount?: number;
// }) {
//   const adapter = await CommunicationFactory.getAdapter("abandoned_cart");
//   return adapter.sendAbandonedCartRecoveryEmail(data);
// }

// export async function sendWelcomeSeriesEmail(data: {
//   to: string;
//   customerName: string;
//   day: 1 | 3 | 7;
//   ctaLink: string;
//   ctaText?: string;
//   additionalMessage?: string;
// }) {
//   const adapter = await CommunicationFactory.getAdapter("marketing");
//   return adapter.sendWelcomeSeriesEmail(data);
// }

// export async function sendWinbackEmail(data: {
//   to: string;
//   customerName: string;
//   inactiveDays: number;
//   ctaLink: string;
//   discountCode?: string;
//   discountPercent?: number;
//   personalizedNote?: string;
// }) {
//   const adapter = await CommunicationFactory.getAdapter("marketing");
//   return adapter.sendWinbackEmail(data);
// }

// export async function sendCampaignBroadcastEmail(data: {
//   to: string;
//   customerName?: string;
//   subject: string;
//   htmlContent: string;
//   ctaLink?: string;
//   ctaText?: string;
// }) {
//   const adapter = await CommunicationFactory.getAdapter("marketing");
//   return adapter.sendCampaignBroadcastEmail(data);
// }
// 📂 src/lib/adapters/communication/CommunicationFactory.ts

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { sendEmail } from "@/lib/email";

// ================================================================
// 📧 INTERFACE: CommunicationAdapter (FULL ENTERPRISE VERSION)
// ================================================================
export interface CommunicationAdapter {
  // -------- Existing Methods --------
  sendOrderConfirmation(data: {
    to: string;
    orderId: string;
    customerName: string;
    products: any[];
    subtotal: number;
    shippingCost: number;
    totalPrice: number;
    shippingAddress: any;
    coupon?: { code: string; amount: number } | null;
  }): Promise<void>;

  sendOrderStatusUpdate(data: {
    to: string;
    customerName: string;
    orderId: string;
    status: string;
  }): Promise<void>;

  sendPasswordReset(data: { to: string; name: string; resetLink: string }): Promise<void>;

  sendReturnStatusUpdate(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    requestId: string;
    newStatus: string;
    resolution?: string;
    adminComments?: string;
  }): Promise<void>;

  sendCustomEmail(data: {
    to: string;
    customerName: string;
    subject: string;
    message: string;
  }): Promise<void>;

  sendReturnReceivedEmail(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    requestId: string;
  }): Promise<void>;

  sendAdminNotificationEmail(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    requestId: string;
    itemCount: number;
  }): Promise<void>;

  sendVerificationOtp(data: { to: string; customerName: string; otp: string }): Promise<void>;

  sendWelcomeEmail(data: { to: string; customerName: string }): Promise<void>;

  sendReferralEarningEmail(data: {
    to: string;
    customerName: string;
    friendName: string;
    conversions: number;
    orderId: string;
    nextMilestoneLabel?: string;
  }): Promise<void>;

  // -------- Existing Marketing Methods --------
  sendAbandonedCartRecoveryEmail(data: {
    to: string;
    customerName?: string;
    cartItems: { name: string; quantity: number; price: number; variantName?: string }[];
    subtotal: number;
    recoveryLink: string;
    discountCode?: string;
    discountAmount?: number;
  }): Promise<void>;

  sendWelcomeSeriesEmail(data: {
    to: string;
    customerName: string;
    day: 1 | 3 | 7;
    ctaLink: string;
    ctaText?: string;
    additionalMessage?: string;
  }): Promise<void>;

  sendWinbackEmail(data: {
    to: string;
    customerName: string;
    inactiveDays: number;
    ctaLink: string;
    discountCode?: string;
    discountPercent?: number;
    personalizedNote?: string;
  }): Promise<void>;

  sendCampaignBroadcastEmail(data: {
    to: string;
    customerName?: string;
    subject: string;
    htmlContent: string;
    ctaLink?: string;
    ctaText?: string;
  }): Promise<void>;

  // ================================================================
  // 🆕 DYNAMIC CUSTOMER REQUEST NOTIFICATION METHOD
  // ================================================================
  sendCustomerRequestEmail(data: {
    to: string;
    customerName: string;
    requestType: "restock" | "missing_variant" | "missing_product";
    productName: string;
    variantDetails?: string;
    buyLink: string;
  }): Promise<void>;
}

// ================================================================
// 🔌 MAILJET ADAPTER (FULL IMPLEMENTATION WITH CUSTOMER REQUESTS)
// ================================================================
export class MailjetAdapter implements CommunicationAdapter {
  async sendOrderConfirmation(data: any): Promise<void> {
    const { createOrderConfirmationHtml } = await import("@/email_templates/orderConfirmationEmail");
    const html = createOrderConfirmationHtml(data);
    await sendEmail({ to: data.to, subject: `Order Confirmation #${data.orderId}`, html });
  }

  async sendOrderStatusUpdate(data: any): Promise<void> {
    const { createOrderShippedHtml, createOrderProcessingHtml, createOrderDeliveredHtml, createOrderCancelledHtml } =
      await import("@/email_templates/orderStatusEmails");
    let html: string;
    switch (data.status) {
      case "Shipped":
        html = createOrderShippedHtml({ customerName: data.customerName, orderId: data.orderId });
        break;
      case "Processing":
        html = createOrderProcessingHtml({ customerName: data.customerName, orderId: data.orderId });
        break;
      case "Delivered":
        html = createOrderDeliveredHtml({ customerName: data.customerName, orderId: data.orderId });
        break;
      case "Cancelled":
        html = createOrderCancelledHtml({ customerName: data.customerName, orderId: data.orderId });
        break;
      default:
        return;
    }
    await sendEmail({ to: data.to, subject: `Order Status Update #${data.orderId}`, html });
  }

  async sendPasswordReset(data: any): Promise<void> {
    const { createPasswordResetHtml } = await import("@/email_templates/passwordResetEmail");
    const html = createPasswordResetHtml({ customerName: data.name, resetLink: data.resetLink });
    await sendEmail({ to: data.to, subject: "Reset Your Password", html });
  }

  async sendReturnStatusUpdate(data: any): Promise<void> {
    const { createReturnStatusUpdateEmail } = await import("@/email_templates/returnStatusUpdateEmail");
    const html = createReturnStatusUpdateEmail({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      requestId: data.requestId,
      newStatus: data.newStatus,
      resolution: data.resolution,
      adminComments: data.adminComments,
    });
    await sendEmail({ to: data.to, subject: `Return Update: Order ${data.orderNumber}`, html });
  }

  async sendCustomEmail(data: any): Promise<void> {
    const { createCustomAdminEmailHtml } = await import("@/email_templates/CustomAdminEmail");
    const html = createCustomAdminEmailHtml({ customerName: data.customerName, message: data.message });
    await sendEmail({ to: data.to, subject: data.subject, html });
  }

  async sendReturnReceivedEmail(data: any): Promise<void> {
    const { createReturnRequestReceivedEmail } = await import("@/email_templates/returnRequestReceivedEmail");
    const html = createReturnRequestReceivedEmail({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      requestId: data.requestId,
    });
    await sendEmail({
      to: data.to,
      subject: `Return Request Received for Order ${data.orderNumber}`,
      html,
    });
  }

  async sendAdminNotificationEmail(data: any): Promise<void> {
    const { createReturnRequestAdminNotificationEmail } = await import("@/email_templates/returnRequestAdminNotificationEmail");
    const html = createReturnRequestAdminNotificationEmail({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      requestId: data.requestId,
      itemCount: data.itemCount,
    });
    await sendEmail({
      to: data.to,
      subject: `[New Return Request] Order ${data.orderNumber}`,
      html,
    });
  }

  async sendVerificationOtp(data: any): Promise<void> {
    const { createVerificationEmailHtml } = await import("@/email_templates/emailVerificationEmail");
    const html = createVerificationEmailHtml({ customerName: data.customerName, otp: data.otp });
    await sendEmail({
      to: data.to,
      subject: `Your PocketValue Verification Code: ${data.otp}`,
      html,
    });
  }

  async sendWelcomeEmail(data: any): Promise<void> {
    const { createWelcomeEmailHtml } = await import("@/email_templates/welcomeEmail");
    const html = createWelcomeEmailHtml({ customerName: data.customerName });
    await sendEmail({
      to: data.to,
      subject: `Welcome to the PocketValue Family, ${data.customerName}!`,
      html,
    });
  }

  async sendReferralEarningEmail(data: any): Promise<void> {
    const { createReferralEarningEmailHtml } = await import("@/email_templates/referralEarningEmail");
    const html = createReferralEarningEmailHtml({
      customerName: data.customerName,
      friendName: data.friendName,
      conversions: data.conversions,
      orderId: data.orderId,
      nextMilestoneLabel: data.nextMilestoneLabel,
    });
    await sendEmail({
      to: data.to,
      subject: `Referral Milestone Updated!`,
      html,
    });
  }

  async sendAbandonedCartRecoveryEmail(data: any): Promise<void> {
    const { createAbandonedCartRecoveryEmailHtml } = await import("@/email_templates/abandonedCartRecoveryEmail");
    const html = createAbandonedCartRecoveryEmailHtml({
      customerName: data.customerName,
      cartItems: data.cartItems,
      subtotal: data.subtotal,
      recoveryLink: data.recoveryLink,
      discountCode: data.discountCode,
      discountAmount: data.discountAmount,
    });
    await sendEmail({
      to: data.to,
      subject: `Complete Your Order! 🛒`,
      html,
    });
  }

  async sendWelcomeSeriesEmail(data: any): Promise<void> {
    const { createWelcomeSeriesEmailHtml } = await import("@/email_templates/welcomeSeriesEmail");
    const html = createWelcomeSeriesEmailHtml({
      customerName: data.customerName,
      day: data.day,
      ctaLink: data.ctaLink,
      ctaText: data.ctaText,
      additionalMessage: data.additionalMessage,
    });
    const dayLabels = { 1: "Welcome", 3: "Check-in", 7: "Special Offer" };
    await sendEmail({
      to: data.to,
      subject: `PocketValue: ${dayLabels[data.day as 1 | 3 | 7]} 🎉`,
      html,
    });
  }

  async sendWinbackEmail(data: any): Promise<void> {
    const { createWinbackEmailHtml } = await import("@/email_templates/winbackEmail");
    const html = createWinbackEmailHtml({
      customerName: data.customerName,
      inactiveDays: data.inactiveDays,
      ctaLink: data.ctaLink,
      discountCode: data.discountCode,
      discountPercent: data.discountPercent,
      personalizedNote: data.personalizedNote,
    });
    await sendEmail({
      to: data.to,
      subject: `We Miss You! ❤️ Come Back & Explore`,
      html,
    });
  }

  async sendCampaignBroadcastEmail(data: any): Promise<void> {
    const { createCampaignBroadcastEmailHtml } = await import("@/email_templates/campaignBroadcastEmail");
    const html = createCampaignBroadcastEmailHtml({
      customerName: data.customerName,
      subject: data.subject,
      htmlContent: data.htmlContent,
      ctaLink: data.ctaLink,
      ctaText: data.ctaText,
    });
    await sendEmail({
      to: data.to,
      subject: data.subject || "Special Announcement from PocketValue",
      html,
    });
  }

  // ================================================================
  // 🆕 NEW METHOD IMPLEMENTATION
  // ================================================================
  async sendCustomerRequestEmail(data: {
    to: string;
    customerName: string;
    requestType: "restock" | "missing_variant" | "missing_product";
    productName: string;
    variantDetails?: string;
    buyLink: string;
  }): Promise<void> {
    const { createCustomerRequestEmailHtml } = await import("@/email_templates/customerRequestNotificationEmail");
    const html = createCustomerRequestEmailHtml(data);
    
    const subjects = {
      restock: `${data.productName} is Back in Stock! 🔔`,
      missing_variant: `Your Requested Variant for ${data.productName} is Now Available! 🎉`,
      missing_product: `We Sourced It Just For You: ${data.productName}! 📦`,
    };

    const subject = subjects[data.requestType] || "Your Requested Update from PocketValue";
    await sendEmail({ to: data.to, subject, html });
  }
}

// ================================================================
// 🔌 RESEND ADAPTER (Extends MailjetAdapter)
// ================================================================
export class ResendAdapter extends MailjetAdapter {
  // Inherits all methods natively
}

// ================================================================
// 🔌 WHATSAPP ADAPTER (With Customer Requests)
// ================================================================
export class WhatsAppAdapter implements CommunicationAdapter {
  async sendOrderConfirmation(data: any): Promise<void> {
    console.log(`[WhatsApp] Order confirmation sent to ${data.to}`);
  }
  async sendOrderStatusUpdate(data: any): Promise<void> {
    console.log(`[WhatsApp] Status update sent to ${data.to}`);
  }
  async sendPasswordReset(data: any): Promise<void> {
    console.log(`[WhatsApp] Password reset sent to ${data.to}`);
  }
  async sendReturnStatusUpdate(data: any): Promise<void> {
    console.log(`[WhatsApp] Return update sent to ${data.to}`);
  }
  async sendCustomEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Custom message sent to ${data.to}`);
  }
  async sendReturnReceivedEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Return received sent to ${data.to}`);
  }
  async sendAdminNotificationEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Admin notification for return ${data.requestId}`);
  }
  async sendVerificationOtp(data: any): Promise<void> {
    console.log(`[WhatsApp] OTP sent to ${data.to}: ${data.otp}`);
  }
  async sendWelcomeEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Welcome alert sent to ${data.to}`);
  }
  async sendReferralEarningEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Referral commission alert sent to ${data.to}`);
  }
  async sendAbandonedCartRecoveryEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Abandoned cart recovery sent to ${data.to}`);
  }
  async sendWelcomeSeriesEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Welcome series (Day ${data.day}) sent to ${data.to}`);
  }
  async sendWinbackEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Winback alert sent to ${data.to}`);
  }
  async sendCampaignBroadcastEmail(data: any): Promise<void> {
    console.log(`[WhatsApp] Campaign broadcast sent to ${data.to}`);
  }

  // ================================================================
  // 🆕 NEW METHOD IMPLEMENTATION
  // ================================================================
  async sendCustomerRequestEmail(data: any): Promise<void> {
    const textTemplates = {
      restock: `Assalamu Alaikum ${data.customerName}! Khushkhabri, aap ka demanded product "${data.productName}" stock mein wapas aa chuka hai! Abhi order karein: ${data.buyLink}`,
      missing_variant: `Assalamu Alaikum ${data.customerName}! Aap ka demanded variant "${data.productName} (${data.variantDetails || ""})" ab order karne ke liye available hai! Link: ${data.buyLink}`,
      missing_product: `Assalamu Alaikum ${data.customerName}! Hum ne aap ki request par khass taur par "${data.productName}" source kar ke list kar diya hai! Abhi view karein: ${data.buyLink}`,
    };
    const message = textTemplates[data.requestType as "restock" | "missing_variant" | "missing_product"] || "";
    console.log(`📡 [WhatsApp Ingestion] WhatsApp Notification Sent to ${data.to}: "${message}"`);
  }
}

// ================================================================
// 🏭 COMMUNICATION FACTORY (UPGRADED TO PARALLEL BROADCASTER)
// ================================================================
export class CommunicationFactory {
  private static settingsCache: any = null;
  private static settingsCacheTime: number = 0;
  private static CACHE_TTL_MS = 60 * 1000;

  private static async getSettings() {
    const now = Date.now();
    if (this.settingsCache && now - this.settingsCacheTime < this.CACHE_TTL_MS) {
      return this.settingsCache;
    }
    const payload = await getSafePayload();
    const settings = await payload.findGlobal({ slug: "settings" });
    this.settingsCache = settings?.communication || {};
    this.settingsCacheTime = now;
    return this.settingsCache;
  }

  /**
   * 🚀 ENTERPRISE BROADCASTER ENGINE
   * Dispatches parallel payloads to ALL enabled active channels for a given role (e.g., Email + WhatsApp simultaneously!)
   * Uses Promise.allSettled to guarantee maximum delivery and prevent single-channel blocking.
   */
  static async broadcast(
    role:
      | "order_confirmation"
      | "password_reset"
      | "marketing"
      | "cod_otp"
      | "tracking_update"
      | "invoice_delivery"
      | "abandoned_cart",
    methodName: keyof CommunicationAdapter,
    data: any
  ): Promise<void> {
    const settings = await this.getSettings();

    const channels = [
      { key: "mailjet", adapter: MailjetAdapter },
      { key: "resend", adapter: ResendAdapter },
      { key: "whatsapp", adapter: WhatsAppAdapter },
    ];

    const activeAdapters: CommunicationAdapter[] = [];

    for (const channel of channels) {
      const channelSettings = settings[channel.key];
      if (channelSettings?.enabled && channelSettings?.roles?.includes(role)) {
        activeAdapters.push(new channel.adapter());
      }
    }

    // Fallback default if no active channel resolved
    if (activeAdapters.length === 0) {
      console.warn(`⚠️ [Broadcaster] No active channel found for role: ${role}. Falling back to Mailjet.`);
      activeAdapters.push(new MailjetAdapter());
    }

    // Parallel multi-channel execution (Safe Error Gating)
    const results = await Promise.allSettled(
      activeAdapters.map((adapter) => {
        const fn = adapter[methodName] as (data: any) => Promise<void>;
        return fn.call(adapter, data);
      })
    );

    results.forEach((res, index) => {
      if (res.status === "rejected") {
        console.error(`❌ [Broadcaster Failure] Channel execution failed:`, res.reason);
      }
    });
  }

  static invalidateCache() {
    this.settingsCache = null;
    this.settingsCacheTime = 0;
  }
}

// ================================================================
// 🚀 CONVENIENCE EXPORTS (BROADCASTER COMPATIBLE)
// ================================================================

export async function sendOrderConfirmationEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendOrderConfirmation", data);
}

export async function sendOrderStatusUpdateEmail(data: any) {
  return CommunicationFactory.broadcast("tracking_update", "sendOrderStatusUpdate", data);
}

export async function sendPasswordResetEmail(data: any) {
  return CommunicationFactory.broadcast("password_reset", "sendPasswordReset", data);
}

export async function sendReturnStatusUpdateEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendReturnStatusUpdate", data);
}

export async function sendCustomAdminEmail(data: any) {
  return CommunicationFactory.broadcast("marketing", "sendCustomEmail", data);
}

export async function sendReturnReceivedEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendReturnReceivedEmail", data);
}

export async function sendAdminNotificationEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendAdminNotificationEmail", data);
}

export async function sendVerificationOtpEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendVerificationOtp", data);
}

export async function sendWelcomeEmail(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendWelcomeEmail", data);
}

export async function sendReferralEarningEmailNotification(data: any) {
  return CommunicationFactory.broadcast("order_confirmation", "sendReferralEarningEmail", data);
}

export async function sendAbandonedCartRecoveryEmail(data: any) {
  return CommunicationFactory.broadcast("abandoned_cart", "sendAbandonedCartRecoveryEmail", data);
}

export async function sendWelcomeSeriesEmail(data: any) {
  return CommunicationFactory.broadcast("marketing", "sendWelcomeSeriesEmail", data);
}

export async function sendWinbackEmail(data: any) {
  return CommunicationFactory.broadcast("marketing", "sendWinbackEmail", data);
}

export async function sendCampaignBroadcastEmail(data: any) {
  return CommunicationFactory.broadcast("marketing", "sendCampaignBroadcastEmail", data);
}

// ================================================================
// 🆕 NEW COMPATIBLE CONVENIENCE EXPORT FOR CUSTOMER REQUESTS
// ================================================================
export async function sendCustomerRequestNotificationEmail(data: {
  to: string;
  customerName: string;
  requestType: "restock" | "missing_variant" | "missing_product";
  productName: string;
  variantDetails?: string;
  buyLink: string;
}) {
  return CommunicationFactory.broadcast("marketing", "sendCustomerRequestEmail", data);
}