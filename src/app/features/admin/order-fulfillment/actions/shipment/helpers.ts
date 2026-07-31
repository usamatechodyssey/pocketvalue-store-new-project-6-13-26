// src/features/admin/order-fulfillment/actions/shipment/helpers.ts
// (Only show the changed parts, but I'll provide full file)

import {
    getCourierProvider,
    type CourierKey,
  } from "@/lib/adapters/courier/CourierFactory";
  import TcsAdapter from "@/lib/adapters/courier/TcsAdapter";
  import LeopardsAdapter from "@/lib/adapters/courier/LeopardsAdapter";
  import PostExAdapter from "@/lib/adapters/courier/PostExAdapter";
  import TraxAdapter from "@/lib/adapters/courier/TraxAdapter";
  import ManualAdapter from "@/lib/adapters/courier/ManualAdapter";
  import type { ProductVariantPayload } from "./types";
  
  // ✅ REMOVED: import { getSafePayload } from "@/app/shared/lib/payloadInstance";
  
  // ================================================================
  // 📦 HELPER: Get Courier Adapter Instance
  // ================================================================
  export async function getCourierAdapter(courierKey: CourierKey) {
    const provider = await getCourierProvider(courierKey);
    if (!provider) throw new Error(`Courier "${courierKey}" is not configured.`);
    if (!provider.enabled && courierKey !== 'manual') {
      throw new Error(`Courier "${courierKey}" is currently disabled.`);
    }
    const credentials = provider.credentials || {};
    switch (courierKey) {
      case 'tcs': return new TcsAdapter(credentials);
      case 'leopards': return new LeopardsAdapter(credentials);
      case 'postex': return new PostExAdapter(credentials);
      case 'trax': return new TraxAdapter(credentials);
      case 'manual': return new ManualAdapter(credentials);
      default: throw new Error(`Unknown courier: ${courierKey}`);
    }
  }
  
  // ================================================================
  // 📦 HELPER: Stock Deduction (Payload)
  // ================================================================
  
  export async function deductVariantStock(
    productId: string,
    variantKey: string,
    quantity: number
  ): Promise<ProductVariantPayload | null> {
    // ✅ DYNAMIC IMPORT to avoid bundling Payload config on client
    const { getSafePayload } = await import("@/app/shared/lib/payloadInstance");
    const payload = await getSafePayload();
  
    const product = await payload.findByID({
      collection: "products",
      id: productId,
    });
  
    if (!product || !product.variants) return null;
  
    let updatedVariant: ProductVariantPayload | null = null;
    const updatedVariants = product.variants.map((v: any) => {
      const vKey = v._key || v.id;
      if (vKey === variantKey) {
        const currentStock = typeof v.stock === "number" ? v.stock : 0;
        const newStock = Math.max(0, currentStock - quantity);
        updatedVariant = { ...v, stock: newStock, inStock: newStock > 0 };
        return updatedVariant;
      }
      return v;
    });
  
    await payload.update({
      collection: "products",
      id: productId,
      data: { variants: updatedVariants },
    });
  
    return updatedVariant;
  }
  
  export async function restoreVariantStock(
    productId: string,
    variantKey: string,
    quantity: number
  ): Promise<ProductVariantPayload | null> {
    // ✅ DYNAMIC IMPORT
    const { getSafePayload } = await import("@/app/shared/lib/payloadInstance");
    const payload = await getSafePayload();
  
    const product = await payload.findByID({
      collection: "products",
      id: productId,
    });
  
    if (!product || !product.variants) return null;
  
    let updatedVariant: ProductVariantPayload | null = null;
    const updatedVariants = product.variants.map((v: any) => {
      const vKey = v._key || v.id;
      if (vKey === variantKey) {
        const currentStock = typeof v.stock === "number" ? v.stock : 0;
        const newStock = currentStock + quantity;
        updatedVariant = { ...v, stock: newStock, inStock: true };
        return updatedVariant;
      }
      return v;
    });
  
    await payload.update({
      collection: "products",
      id: productId,
      data: { variants: updatedVariants },
    });
  
    return updatedVariant;
  }
// ================================================================
// 📦 HELPER: Order Validation
// ================================================================

/**
 * Check if an order is in a shippable state.
 * 
 * Enterprise Feature: Centralized status whitelist.
 * 
 * @param order - The order document
 * @returns boolean - True if shippable
 */
export function verifyOrderShippable(order: any): boolean {
  const shippableStatuses = ["Payment Verified", "Ready to Ship", "Processing"];
  return shippableStatuses.includes(order.status);
}

// ================================================================
// 📦 HELPER: Build Shipment Data Payload
// ================================================================

/**
 * Build the ShipmentData object for courier adapter consumption.
 * Separates data transformation from business logic.
 * 
 * @param order - The order document
 * @param items - Items to ship
 * @param courierKey - Selected courier
 * @param trackingId - Optional pre-assigned tracking ID
 * @param adapter - The courier adapter instance
 * @returns ShipmentData object
 */
export function buildShipmentData(
  order: any,
  items: { productId: string; variantKey: string; quantity: number }[],
  courierKey: CourierKey,
  trackingId?: string
) {
  return {
    orderId: order._id.toString(),
    orderNumber: order.orderId,
    courierKey: courierKey,
    destinationAddress: {
      fullName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      address: order.shippingAddress.address,
      area: order.shippingAddress.area,
      city: order.shippingAddress.city,
      province: order.shippingAddress.province,
      email: order.shippingAddress.email,
    },
    items: items.map((item) => ({
      productId: item.productId,
      variantKey: item.variantKey,
      name: order.products.find(
        (p: any) => p.productId === item.productId && p.variant?._key === item.variantKey
      )?.name || 'Product',
      quantity: item.quantity,
    })),
    totalWeight: 1, // TODO: Calculate from product weights
    isCod: order.paymentMethod === 'cod',
    codAmount: order.paymentMethod === 'cod' ? order.totalPrice : 0,
    trackingId: trackingId,
  };
}

/**
 * Create a shipment record object.
 */
export function createShipmentRecord(
  items: { productId: string; variantKey: string; quantity: number }[],
  courierKey: CourierKey,
  courierName: string,
  awbResult: any
) {
  return {
    id: `SHIP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    items: items.map((item) => ({
      productId: item.productId,
      variantKey: item.variantKey,
      quantity: item.quantity,
    })),
    courier: courierKey,
    courierName: courierName,
    trackingId: awbResult.trackingId,
    awbNumber: awbResult.awbNumber,
    courierStatus: awbResult.courierStatus || 'booked',
    labelUrl: awbResult.labelUrl,
    status: awbResult.courierStatus || 'Preparing',
    createdAt: new Date().toISOString(),
    estimatedDelivery: awbResult.estimatedDelivery,
  };
}