import { IOrder } from "@/models/Order"; 
import crypto from 'crypto';
import { VerificationResult } from '@/app/features/storefront/cart-checkout/gateways/paymentAdapter';

function createSecureHash(data: { [key: string]: string }, integritySalt: string): string {
    const sortedKeys = Object.keys(data).sort();
    let stringToHash = "";
    for (let i = 0; i < sortedKeys.length; i++) {
        stringToHash += `${sortedKeys[i]}=${data[sortedKeys[i]]}`;
        if (i < sortedKeys.length - 1) {
            stringToHash += "&";
        }
    }
    return crypto.createHmac('sha256', integritySalt)
                 .update(stringToHash)
                 .digest('hex');
}

export async function createCheckoutSession(order: IOrder, credentials: Record<string, string>) {
  console.log(`[JazzCash] Creating checkout session for order ${order._id}...`);

  if (!credentials.merchantId || !credentials.password || !credentials.integritySalt || !process.env.JAZZCASH_API_URL || !process.env.JAZZCASH_RETURN_URL) {
    throw new Error("JazzCash credentials or URLs are not fully configured.");
  }
  
  const now = new Date();
  const transactionDate = now.toISOString().slice(0, 19).replace(/[-T:]/g, '');
  now.setHours(now.getHours() + 1);
  const expiryDate = now.toISOString().slice(0, 19).replace(/[-T:]/g, '');

  const postData: { [key: string]: string } = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: credentials.merchantId,
    pp_Password: credentials.password,
    pp_TxnRefNo: `PV${Date.now()}`,
    // ✅ FIXED: Multiplier rounding issue resolved
    pp_Amount: Math.round(order.totalPrice * 100).toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: transactionDate,
    pp_BillReference: order._id.toString(), 
    pp_Description: `Payment for Order #${order.orderId}`, 
    pp_TxnExpiryDateTime: expiryDate,
    pp_ReturnURL: process.env.JAZZCASH_RETURN_URL,
  };

  const secureHash = createSecureHash(postData, credentials.integritySalt);
  const paymentFormData = { ...postData, pp_SecureHash: secureHash };

  return { 
    success: true, 
    redirectUrl: process.env.JAZZCASH_API_URL,
    data: paymentFormData,
    message: "Redirecting to JazzCash for payment..."
  };
}

export async function verifyPayment(
  requestData: Record<string, string>, 
  credentials: Record<string, string>,
  expectedAmount: number
): Promise<VerificationResult> {
  console.log("[JazzCash] Verifying payment callback...");
  
  const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo, pp_BillReference, pp_SecureHash, pp_Amount } = requestData;
  const receivedHash = pp_SecureHash;
  
  const dataToVerify: { [key: string]: string } = { ...requestData };
  delete dataToVerify.pp_SecureHash;

  const calculatedHash = createSecureHash(dataToVerify, credentials.integritySalt);

  if (calculatedHash.toLowerCase() !== receivedHash.toLowerCase()) {
    console.error(`[JazzCash] HASH MISMATCH for Order ID: ${pp_BillReference}`);
    return { 
        success: false, 
        orderId: pp_BillReference, 
        paymentStatus: 'Failed',
        orderStatus: 'Pending',
        transactionId: null,
        message: "Invalid payment signature from JazzCash. Potential fraud attempt." 
    };
  }

  // ✅ CRITICAL SECURITY FIX: Verify that the paid amount matches the database order amount
  const expectedCents = Math.round(expectedAmount * 100).toString();
  if (pp_Amount !== expectedCents) {
    console.error(`[JazzCash] AMOUNT TAMPERING DETECTED! Expected: ${expectedCents} cents, Paid: ${pp_Amount} cents.`);
    return {
        success: false,
        orderId: pp_BillReference,
        paymentStatus: 'Failed',
        orderStatus: 'Pending',
        transactionId: pp_TxnRefNo,
        message: "Amount verification failed. Transaction terminated."
    };
  }

  if (pp_ResponseCode === '000') {
    return { 
        success: true, 
        orderId: pp_BillReference,
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        transactionId: pp_TxnRefNo,
        message: "Payment successful."
    };
  } else {
    return {
        success: false,
        orderId: pp_BillReference,
        paymentStatus: 'Failed',
        orderStatus: 'Pending',
        transactionId: pp_TxnRefNo,
        message: pp_ResponseMessage || "JazzCash payment failed."
    };
  }
}