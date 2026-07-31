// src/features/admin/order-fulfillment/actions/shipment/types.ts
import { z } from "zod";
import type { CourierKey } from "@/lib/adapters/courier/CourierFactory";

// ================================================================
// 🛡️ ZOD SCHEMAS (Runtime Validation)
// ================================================================

export const CreateShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantKey: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1, "At least one item is required for shipment."),
  courierKey: z.enum(['tcs', 'leopards', 'postex', 'trax', 'manual']).default('manual'),
  trackingId: z.string().optional(),
});

export const UpdateShipmentStatusSchema = z.object({
  shipmentId: z.string().min(1),
  status: z.enum(["Preparing", "PickedUp", "In Transit", "Delivered", "RTO", "Cancelled"]),
  trackingId: z.string().optional(),
});

// ================================================================
// 📦 INPUT/OUTPUT INTERFACES
// ================================================================

export interface CreateShipmentInput {
  orderId: string;
  items: { productId: string; variantKey: string; quantity: number }[];
  courierKey?: CourierKey;
  trackingId?: string;
}

export interface UpdateShipmentStatusInput {
  shipmentId: string;
  status: "Preparing" | "PickedUp" | "In Transit" | "Delivered" | "RTO" | "Cancelled";
  trackingId?: string;
}

export interface BulkShipmentResult {
  success: boolean;
  total: number;
  processed: number;
  failed: number;
  results: Array<{
    orderId: string;
    orderNumber: string;
    success: boolean;
    trackingId?: string;
    shipmentId?: string;
    error?: string;
  }>;
  message?: string;
}

export interface GetShipmentsResult {
  success: boolean;
  shipments: any[];
  message?: string;
}

export interface GetCouriersResult {
  success: boolean;
  couriers: Array<{ key: string; name: string; isDefault: boolean }>;
  message?: string;
}

export interface TrackShipmentResult {
  success: boolean;
  tracking?: any;
  message?: string;
}

// ================================================================
// 🧩 INTERNAL HELPERS TYPES
// ================================================================

export interface ProductVariantPayload {
  id?: string;
  _key?: string;
  stock?: number;
  inStock?: boolean;
  [key: string]: any;
}

export type ShipmentStatus = "Preparing" | "PickedUp" | "In Transit" | "Delivered" | "RTO" | "Cancelled";

// ================================================================
// 📦 COURIER ADAPTER SHIPMENT DATA (Re-export from Base Adapter)
// ================================================================

export type {
  ShipmentData,
  AWBResponse,
  TrackingResponse,
  LabelResponse,
} from "@/lib/adapters/courier/BaseCourierAdapter";