
// /src/email_templates/orderStatusEmails.ts

import { createMasterEmailLayout } from './masterLayout';

interface StatusEmailData {
    customerName: string;
    orderId: string;
}

// 1. 🔄 ORDER PROCESSING
export function createOrderProcessingHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Good news! We have started processing your order <strong>#${data.orderId}</strong>. 
            Our team is carefully preparing your items for shipment to ensure everything is perfect.
        </p>
        <p style="font-size: 14px; color: #9CA3AF; margin-top: 20px; font-style: italic;">
            Note: You will receive another notification once your package is handed over to our courier partner.
        </p>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Update: Your order #${data.orderId} is now being processed.`, 
        headerText: "Order Processing Started", 
        bodyHtml 
    });
}

// 2. 🚚 ORDER SHIPPED (With Track Button)
export function createOrderShippedHtml(data: StatusEmailData) {
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${data.orderId}`;
    
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Great news! Your PocketValue order <strong>#${data.orderId}</strong> has been shipped and is heading your way. 
            It should arrive at your doorstep within 2-4 business days.
        </p>
        <div style="text-align:center; margin: 35px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #F97316; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
                Track My Package
            </a>
        </div>
        <p style="font-size: 13px; color: #9CA3AF; text-align: center;">
            If the button doesn't work, copy this link: <br>
            <span style="color: #3b82f6;">${trackingUrl}</span>
        </p>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `On the Way! Your order #${data.orderId} has been shipped.`, 
        headerText: "Your Order is Dispatched!", 
        bodyHtml 
    });
}

// 3. ✅ ORDER DELIVERED
export function createOrderDeliveredHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            Alhamdulillah! Your order <strong>#${data.orderId}</strong> has been successfully delivered. 
            We hope you enjoy your new purchase!
        </p>
        <p style="font-size: 15px; color: #4B5563; margin-top: 20px;">
            Your feedback means the world to us. If you have a moment, please let us know how we did.
        </p>
        <div style="margin-top: 30px; padding: 20px; background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #16A34A; font-weight: bold; font-size: 14px;">
                Verified Delivery Status: COMPLETED
            </p>
        </div>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Delivered: Enjoy your items from order #${data.orderId}!`, 
        headerText: "Order Successfully Delivered", 
        bodyHtml 
    });
}

// 4. ❌ ORDER CANCELLED
export function createOrderCancelledHtml(data: StatusEmailData) {
    const bodyHtml = `
        <p style="font-size: 16px; color: #4B5563;">Hi <strong>${data.customerName}</strong>,</p>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6;">
            This email is to confirm that your order <strong>#${data.orderId}</strong> has been cancelled. 
        </p>
        <p style="font-size: 15px; color: #4B5563; margin-top: 15px;">
            If this was a mistake or you have questions regarding a refund, please reply to this email or contact our support team immediately.
        </p>
        <div style="margin-top: 30px; padding: 20px; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #DC2626; font-weight: bold; font-size: 14px;">
                Status Notice: ORDER CANCELLED
            </p>
        </div>
    `;
    return createMasterEmailLayout({ 
        preheaderText: `Notice: Order #${data.orderId} has been cancelled.`, 
        headerText: "Order Cancellation Confirmed", 
        bodyHtml 
    });
}