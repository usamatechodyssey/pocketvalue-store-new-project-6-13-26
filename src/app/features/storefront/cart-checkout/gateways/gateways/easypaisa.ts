import { IOrder } from "@/models/Order"; 
import crypto from 'crypto';
import { VerificationResult } from '@/app/features/storefront/cart-checkout/gateways/paymentAdapter';

export async function createCheckoutSession(order: IOrder, credentials: Record<string, string>) { 
  console.log(`[Easypaisa] Creating checkout session for order ${order._id}...`);

  if (!credentials.storeId || !credentials.hashKey || !process.env.EASYPAISA_API_URL || !process.env.EASYPAISA_POST_BACK_URL) {
    throw new Error("Easypaisa credentials or URLs are not configured.");
  }

  const postData: { [key: string]: string } = {
    amount: order.totalPrice.toFixed(2), // ✅ Standard decimal configuration
    storeId: credentials.storeId,
    orderId: order._id.toString(), 
    emailAddress: order.shippingAddress.email,
    postBackURL: process.env.EASYPAISA_POST_BACK_URL,
    mobileNum: order.shippingAddress.phone.replace(/[^0-9]/g, ''),
    merchantPaymentMethod: "",
  };

  const sortedKeys = Object.keys(postData).sort();
  let stringToHash = credentials.hashKey; 
  for (const key of sortedKeys) {
      stringToHash += `${key}=${postData[key]}&`;
  }
  stringToHash = stringToHash.slice(0, -1);

  const hash = crypto.createHmac('sha256', credentials.hashKey)
                     .update(stringToHash)
                     .digest('hex');
  
  const paymentFormData = { ...postData, encryptedHash: hash };
  
  return { 
    success: true, 
    redirectUrl: process.env.EASYPAISA_API_URL,
    data: paymentFormData,
    message: "Redirecting to Easypaisa for payment..."
  };
}

export async function verifyPayment(
  requestData: Record<string, string>, 
  credentials: Record<string, string>,
  expectedAmount: number
): Promise<VerificationResult> {
    console.log("[Easypaisa] Verifying payment callback...");
    
    const { auth_token, post_back_url, encryptedHash, ...restOfData } = requestData;
    const orderId = restOfData.orderRefNumber || restOfData.orderId; 
    const responseCode = restOfData.responseCode;
    const responseDesc = restOfData.desc || restOfData.responseMessage;
    const transactionId = restOfData.transRefNumber;
    const paidAmountStr = restOfData.amount;

    if (!credentials.hashKey) {
        throw new Error("Easypaisa verification failed: Missing hashKey configuration.");
    }

    const sortedKeys = Object.keys(restOfData).sort();
    let stringToHash = credentials.hashKey;
    for (const key of sortedKeys) {
        stringToHash += `${key}=${restOfData[key]}&`;
    }
    stringToHash = stringToHash.slice(0, -1);

    const calculatedHash = crypto.createHmac('sha256', credentials.hashKey)
                                 .update(stringToHash)
                                 .digest('hex');

    if (encryptedHash && calculatedHash.toLowerCase() !== encryptedHash.toLowerCase()) {
        console.error(`[Easypaisa] SIGNATURE MISMATCH for Order: ${orderId}`);
        return {
            success: false,
            orderId: orderId,
            paymentStatus: 'Failed',
            orderStatus: 'Pending',
            transactionId: null,
            message: "Signature verification failed. Potential payment tampering."
        };
    }

    // ✅ CRITICAL SECURITY FIX: Verify the paid amount matches the db amount
    const expectedStr = expectedAmount.toFixed(2);
    const parsedPaid = parseFloat(paidAmountStr).toFixed(2);
    if (parsedPaid !== expectedStr) {
      console.error(`[Easypaisa] AMOUNT TAMPERING DETECTED! Expected: ${expectedStr}, Paid: ${parsedPaid}`);
      return {
          success: false,
          orderId: orderId,
          paymentStatus: 'Failed',
          orderStatus: 'Pending',
          transactionId: transactionId,
          message: "Payment amount mismatch. System alert raised."
      };
    }

    if (responseCode === '0000') {
        return { 
            success: true, 
            orderId: orderId,
            paymentStatus: 'Paid',
            orderStatus: 'Processing',
            transactionId: transactionId,
            message: "Payment successful."
        };
    } else {
        return {
            success: false,
            orderId: orderId,
            paymentStatus: 'Failed',
            orderStatus: 'Pending', 
            transactionId: transactionId,
            message: responseDesc || "Payment failed or was cancelled."
        };
    }
}