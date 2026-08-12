// 📂 src/email_templates/orderConfirmationEmail.ts

import { CleanCartItem } from "@/types";
import { createMasterEmailLayout } from './masterLayout';

interface ShippingAddress { 
    fullName: string; 
    address: string; 
    area: string; 
    city: string; 
    province: string; 
    phone: string; 
}

interface OrderData { 
    orderId: string; 
    customerName: string; 
    products: CleanCartItem[]; 
    subtotal: number;       // ✅ Added for dynamic math
    shippingCost: number;   // ✅ Added for dynamic math
    totalPrice: number;     // Grand Total
    shippingAddress: ShippingAddress; 
    coupon?: {              // ✅ Optional Coupon support
        code: string;
        amount: number;
    } | null;
}

/**
 * 📧 ORDER CONFIRMATION TEMPLATE (Enterprise Dynamic Version)
 */
export function createOrderConfirmationHtml(orderData: OrderData): string {
  
  // 1. Generate Product Rows
  const productsHtml = orderData.products.map(p => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;" class="dark-border">
        <p style="margin: 0; font-weight: bold; color: #1F2937; font-size: 14px;" class="dark-text">${p.name}</p>
        ${p.variant?.name ? `<p style="margin: 4px 0 0; font-size: 11px; color: #6B7280;" class="dark-subtext">Variant: ${p.variant.name}</p>` : ''}
        <p style="margin: 4px 0 0; font-size: 12px; color: #9CA3AF;" class="dark-subtext">Qty: ${p.quantity}</p>
      </td>
      <td style="text-align: right; font-weight: bold; color: #1F2937; padding: 12px 0; border-bottom: 1px solid #f3f4f6;" class="dark-border dark-text">
        Rs. ${(p.price * p.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  // 2. Build Body Content
  const bodyHtml = `
    <p style="font-size: 16px; color: #4B5563;" class="dark-text">Assalamu Alaikum <strong>${orderData.customerName}</strong>,</p>
    <p style="font-size: 15px; color: #4B5563; line-height: 1.6;" class="dark-text">JazakAllah! Your order has been confirmed. We are preparing your items for shipment.</p>
    
    <div style="background-color: #F9FAFB; padding: 15px; border-radius: 12px; margin: 25px 0; border: 1px solid #E5E7EB;" class="dark-card dark-border">
        <p style="font-size: 11px; color: #6B7280; margin: 0; text-transform: uppercase; letter-spacing: 1px;" class="dark-subtext">Order Reference</p>
        <p style="font-size: 18px; color: #1F2937; font-weight: 900; margin: 5px 0 0; font-family: monospace;" class="dark-text">#${orderData.orderId.toUpperCase()}</p>
    </div>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      ${productsHtml}
    </table>

    <!-- 📊 DYNAMIC FINANCIAL BREAKDOWN -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #F3F4F6;" class="dark-border">
      <tr>
        <td style="padding: 6px 0; color: #6B7280; font-size: 14px;" class="dark-subtext">Subtotal:</td>
        <td style="text-align: right; color: #1F2937; font-weight: bold;" class="dark-text">Rs. ${orderData.subtotal.toLocaleString()}</td>
      </tr>
      
      <!-- Dynamic Shipping Logic -->
      <tr>
        <td style="padding: 6px 0; color: #6B7280; font-size: 14px;" class="dark-subtext">Shipping:</td>
        <td style="text-align: right; font-weight: bold; color: ${orderData.shippingCost === 0 ? '#16A34A' : '#1F2937'};" class="dark-text">
            ${orderData.shippingCost === 0 ? '<span style="color: #16A34A;">FREE</span>' : `Rs. ${orderData.shippingCost.toLocaleString()}`}
        </td>
      </tr>

      <!-- Dynamic Coupon Logic -->
      ${orderData.coupon ? `
      <tr>
        <td style="padding: 6px 0; color: #16A34A; font-size: 14px;">Discount (${orderData.coupon.code}):</td>
        <td style="text-align: right; font-weight: bold; color: #16A34A;">- Rs. ${orderData.coupon.amount.toLocaleString()}</td>
      </tr>
      ` : ''}

      <tr style="font-size: 18px; color: #1F2937;">
          <td style="padding: 15px 0 0; font-weight: 900;" class="dark-text">Grand Total:</td>
          <!-- ✅ ACCENT SYNC: Updated to your exact brand primary warm orange (#FF8F32) -->
          <td style="text-align: right; padding: 15px 0 0; font-weight: 900; color: #FF8F32;">Rs. ${orderData.totalPrice.toLocaleString()}</td>
      </tr>
    </table>

    <div style="margin-top: 30px; padding: 20px; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 12px;" class="dark-card dark-border">
      <h4 style="color: #1F2937; margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;" class="dark-text">Delivery To:</h4>
      <address style="font-style: normal; font-size: 14px; color: #4B5563; line-height: 1.55;" class="dark-text">
        <strong>${orderData.shippingAddress.fullName}</strong><br>
        ${orderData.shippingAddress.address}, ${orderData.shippingAddress.area}<br>
        ${orderData.shippingAddress.city}, ${orderData.shippingAddress.province}<br>
        <span style="color: #9CA3AF;" class="dark-subtext">Contact: ${orderData.shippingAddress.phone}</span>
      </address>
    </div>
    
    <div style="margin-top: 30px; text-align: center;">
        <!-- ✅ ACCENT SYNC: Updated Track button background to exact brand warm orange (#FF8F32) with a smooth rounded style -->
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders" style="display: inline-block; background-color: #FF8F32; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(255,143,50,0.25);">
            Track Order Status
        </a>
    </div>
  `;
  
  return createMasterEmailLayout({
    preheaderText: `Confirmed: Your order #${orderData.orderId.toUpperCase()} is being processed.`,
    headerText: "Order Confirmation",
    bodyHtml: bodyHtml
  });
}