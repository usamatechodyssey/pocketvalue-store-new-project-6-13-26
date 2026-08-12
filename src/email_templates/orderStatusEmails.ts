// 📂 src/email_templates/orderStatusEmails.ts

import { createMasterEmailLayout } from './masterLayout';

interface StatusEmailData {
    customerName: string;
    orderId: string;
}

// ================================================================
// 1. 🔄 ORDER PROCESSING
// ================================================================
export function createOrderProcessingHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            Good news! We have started processing your order <strong>#${data.orderId.toUpperCase()}</strong>. 
            Our team is carefully preparing your items for shipment to ensure everything is perfect.
        </p>
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 25px; font-style: italic;" class="dark-subtext">
            Note: You will receive another notification once your package is handed over to our courier partner.
        </p>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Update: Your order #${data.orderId.toUpperCase()} is now being processed.`, 
        headerText: "Order Processing Started", 
        bodyHtml 
    });
}

// ================================================================
// 2. 🚚 ORDER SHIPPED (With Track Button)
// ================================================================
export function createOrderShippedHtml(data: StatusEmailData) {
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${data.orderId}`;
    
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            Great news! Your PocketValue order <strong>#${data.orderId.toUpperCase()}</strong> has been shipped and is heading your way. 
            It should arrive at your doorstep within 2-4 business days.
        </p>
        <div style="text-align:center; margin: 35px 0;">
            <!-- ✅ ACCENT SYNC: Updated button background to exact brand warm orange (#FF8F32) -->
            <a href="${trackingUrl}" style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);">
                Track My Package
            </a>
        </div>
        <p style="font-size: 13px; color: #9CA3AF; text-align: center; line-height: 1.5;" class="dark-subtext">
            If the button doesn't work, copy this link: <br>
            <span style="color: #FF8F32; font-weight: bold; font-family: monospace;">${trackingUrl}</span>
        </p>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `On the Way! Your order #${data.orderId.toUpperCase()} has been shipped.`, 
        headerText: "Your Order is Dispatched!", 
        bodyHtml 
    });
}

// ================================================================
// 3. ✅ ORDER DELIVERED
// ================================================================
export function createOrderDeliveredHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            Alhamdulillah! Your order <strong>#${data.orderId.toUpperCase()}</strong> has been successfully delivered. 
            We hope you enjoy your new purchase!
        </p>
        <p style="font-size: 15px; color: #4B5563; margin-top: 20px;" class="dark-text">
            Your feedback means the world to us. If you have a moment, please let us know how we did.
        </p>
        <!-- ✅ DARK MODE SUPPORTED BANNER -->
        <div style="margin-top: 30px; padding: 20px; background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; text-align: center;" class="dark-card dark-border">
            <p style="margin: 0; color: #16A34A; font-weight: bold; font-size: 14px;">
                Verified Delivery Status: COMPLETED
            </p>
        </div>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Delivered: Enjoy your items from order #${data.orderId.toUpperCase()}!`, 
        headerText: "Order Successfully Delivered", 
        bodyHtml 
    });
}

// ================================================================
// 4. ❌ ORDER CANCELLED
// ================================================================
export function createOrderCancelledHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;" class="dark-text">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">
            This email is to confirm that your order <strong>#${data.orderId.toUpperCase()}</strong> has been cancelled. 
        </p>
        <p style="font-size: 15px; color: #4B5563; margin-top: 15px;" class="dark-text">
            If this was a mistake or you have questions regarding a refund, please reply to this email or contact our support team immediately.
        </p>
        <!-- ✅ DARK MODE SUPPORTED BANNER -->
        <div style="margin-top: 30px; padding: 20px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; text-align: center;" class="dark-card dark-border">
            <p style="margin: 0; color: #DC2626; font-weight: bold; font-size: 14px;">
                Status Notice: ORDER CANCELLED
            </p>
        </div>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Notice: Order #${data.orderId.toUpperCase()} has been cancelled.`, 
        headerText: "Order Cancellation Confirmed", 
        bodyHtml 
    });
}