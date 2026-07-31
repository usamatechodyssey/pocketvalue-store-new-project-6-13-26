import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import SettingModel, { IGateway, ISetting } from "@/models/Setting";
import { IOrder } from "@/models/Order";

// Gateway implementations
import * as cod from '@/app/features/storefront/cart-checkout/gateways/gateways/cod';
import * as easypaisa from '@/app/features/storefront/cart-checkout/gateways/gateways/easypaisa';
import * as jazzcash from '@/app/features/storefront/cart-checkout/gateways/gateways/jazzcash';
import * as banktransfer from '@/app/features/storefront/cart-checkout/gateways/gateways/banktransfer';

export const gatewayImplementations = { cod, easypaisa, jazzcash, banktransfer };

export interface SafeGatewayResponse {
  key: string;
  name: string;
  enabled: boolean;
  credentials?: Record<string, string | undefined>;
}

export interface VerificationResult {
  success: boolean;
  orderId: string;
  paymentStatus: "Paid" | "Unpaid" | "Failed" | "Refunded";
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "On Hold";
  transactionId: string | null;
  message: string;
}

async function getGatewayConfig(): Promise<IGateway[]> {
  try {
    await connectMongoose();
    const settingsDoc = await SettingModel.findById('payment_gateways').lean<ISetting>();
    if (settingsDoc && settingsDoc.gateways) {
      return settingsDoc.gateways;
    }
    return []; 
  } catch (error) {
    console.error("CRITICAL: Error fetching payment gateway configuration:", error);
    return [];
  }
}

// ✅ FIXED: Removed 'any' and applied Safe Type Unions
export async function getEnabledGateways(): Promise<SafeGatewayResponse[]> {
  const allGateways = await getGatewayConfig();
  
  return allGateways.map((gw) => {
    const { hashKey, password, integritySalt, ...safeCredentials } = gw.credentials || {};
    return {
      key: gw.key,
      name: gw.name,
      enabled: gw.enabled,
      credentials: safeCredentials as Record<string, string | undefined>,
    };
  });
}

// ✅ FIXED: Untrusted Order ID Extractor for webhook preprocessing
export function extractUntrustedOrderId(gatewayKey: string, requestData: Record<string, string | undefined>): string {
  if (gatewayKey === 'jazzcash') {
    return requestData.pp_BillReference || "";
  }
  if (gatewayKey === 'easypaisa') {
    return requestData.orderRefNumber || requestData.orderId || "";
  }
  return requestData.orderId || "";
}

export async function initiatePayment(
  order: IOrder, 
  gatewayKey: keyof typeof gatewayImplementations
): Promise<{ success: boolean; redirectUrl: string | null; data: Record<string, string> | null; message: string }> {
  const allGateways = await getGatewayConfig();
  const gatewayConfig = allGateways.find((gw) => gw.key === gatewayKey && gw.enabled);
  if (!gatewayConfig) {
    throw new Error(`Payment gateway "${gatewayKey}" is not enabled or could not be found.`);
  }
  const implementation = gatewayImplementations[gatewayKey];
  if (!implementation || typeof implementation.createCheckoutSession !== 'function') {
    throw new Error(`Implementation for gateway "${gatewayKey}" is missing or invalid.`);
  }
  
// ✅ FIX: Safe Type Assertion to resolve index signature error
  return implementation.createCheckoutSession(
    order, 
    (gatewayConfig.credentials || {}) as Record<string, string>
  );
}

export async function verifyPayment(
  gatewayKey: keyof typeof gatewayImplementations, 
  requestData: Record<string, string | undefined>,
  expectedAmount: number
): Promise<VerificationResult> {
  const allGateways = await getGatewayConfig();
  const gatewayConfig = allGateways.find((gw) => gw.key === gatewayKey);
  if (!gatewayConfig) {
    throw new Error(`Configuration for payment gateway "${gatewayKey}" could not be found.`);
  }
  const implementation = gatewayImplementations[gatewayKey];
  if (!implementation || typeof implementation.verifyPayment !== 'function') {
    throw new Error(`Verification logic for gateway "${gatewayKey}" is missing or invalid.`);
  }
  
  // ✅ FIX: Asserts requestData, credentials and return type safely
  return implementation.verifyPayment(
    requestData as Record<string, string>, 
    (gatewayConfig.credentials || {}) as Record<string, string>, 
    expectedAmount
  ) as Promise<VerificationResult>;
}